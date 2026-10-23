import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
const out='docs/interfaces/preuves-utilisateurs-2026-10-23'
mkdirSync(out,{recursive:true})
const startedAt=new Date().toISOString(),screens=[],commands=[],errors=[]
let failNext=false
const browser=await chromium.launch({headless:true})
let page
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort())
 await context.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url()),body=request.postDataJSON()
  commands.push({method:request.method(),path:url.pathname,body})
  assert(body.requestId)
  if(failNext){failNext=false;return route.fulfill({status:500,json:{error:'Erreur synthétique de modification.'}})}
  const authorization={idUserAutorisation:body.id||'UA-NEW',idUser:'USR-DEMO',idBlocAutorisation:body.block||'AUT-SPT',dateDebut:body.dateDebut||'2026-01-01',dateFin:body.dateFin||null,statut:request.method()==='DELETE'?'INACTIF':'ACTIF'}
  await route.fulfill({json:{ok:true,...(url.pathname.endsWith('/authorizations')?{authorization}:{}),...(url.pathname.endsWith('/reset-access')?{temporaryAccess:'DEMO-ACCESS-NOT-A-REAL-SECRET'}:{})}})
 })
 page=await context.newPage();page.setDefaultTimeout(20000)
 page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept())
 async function visit(view){await page.goto(`http://127.0.0.1:3147/users-ui-preview?view=${view}`,{waitUntil:'networkidle',timeout:180000});await page.evaluate(()=>document.fonts.ready)}
 for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await page.setViewportSize({width,height})
  for(const view of ['before-list','list','before-detail','detail','empty','loading','detail-loading','error']){
   await visit(view)
   const file=`${view}-${device}.png`;await page.screenshot({path:`${out}/${file}`,fullPage:true})
   const layout=await page.evaluate(()=>{const title=document.querySelector('h1')||document.body;return {viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,font:getComputedStyle(title).fontFamily,titleSize:getComputedStyle(title).fontSize}})
   if(!view.startsWith('before'))assert(layout.pageWidth<=width,`${view} overflows at ${width}`)
   screens.push({file,view,device,...layout})
  }
 }
 await visit('error');await page.getByRole('button',{name:'Réessayer',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Reprise simulée effectuée.'}).waitFor()
 await page.setViewportSize({width:1440,height:1000});await visit('list')
 const table=page.getByRole('table',{name:'Comptes utilisateurs'})
 assert.equal(await table.getByRole('row').count(),4)
 await page.getByRole('textbox',{name:'Rechercher un utilisateur'}).fill('Victor')
 assert.equal(await table.getByRole('row').count(),2)
 await page.getByRole('textbox',{name:'Rechercher un utilisateur'}).fill('')
 await page.getByRole('combobox',{name:'Filtrer par profil'}).click();await page.getByRole('option',{name:'Lecture seule',exact:true}).click()
 assert.equal(await table.getByRole('row').count(),2)
 await page.getByRole('checkbox',{name:'Super-administrateurs'}).check()
 assert(await table.getByText('Aucun utilisateur ne correspond aux filtres.').isVisible())
 await visit('detail')
 assert.equal(await page.getByText('Historique minimal',{exact:true}).count(),0)
 for(const label of ['Active','À venir','Expirée'])await page.getByText(label,{exact:true}).waitFor()
 await page.getByRole('button',{name:'Modifier le compte',exact:true}).click()
 await page.getByRole('textbox',{name:'Nom complet',exact:true}).fill('Aline Démo modifiée')
 assert.equal(await page.locator('h1').textContent(),'Aline Démo')
 failNext=true;await page.getByRole('button',{name:'Enregistrer',exact:true}).click()
 await page.getByRole('alert').filter({hasText:'Erreur synthétique'}).waitFor()
 assert.equal(await page.getByRole('textbox',{name:'Nom complet',exact:true}).inputValue(),'Aline Démo modifiée')
 await page.getByRole('button',{name:'Enregistrer',exact:true}).click()
 await page.getByRole('heading',{level:1,name:'Aline Démo modifiée'}).waitFor()
 await page.getByLabel('Date de début',{exact:true}).fill('2026-10-01')
 await page.getByRole('button',{name:'Attribuer',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Autorisation attribuée.'}).waitFor()
 await page.getByRole('button',{name:/Retirer l’autorisation Gestion sportive/}).first().click()
 await page.getByRole('status').filter({hasText:'Autorisation retirée.'}).waitFor()
 await page.getByRole('button',{name:'Révoquer toutes les sessions',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Toutes les sessions sont révoquées.'}).waitFor()
 await page.getByRole('button',{name:'Réinitialiser l’accès',exact:true}).click()
 await page.getByRole('dialog',{name:'Accès temporaire',exact:true}).waitFor()
 assert(await page.getByText('DEMO-ACCESS-NOT-A-REAL-SECRET',{exact:true}).isVisible())
 await page.getByRole('button',{name:'Fermer',exact:true}).click()
 assert.equal(await page.getByText('DEMO-ACCESS-NOT-A-REAL-SECRET',{exact:true}).count(),0)
 assert.equal(errors.length,0,errors.join('\n'))
 writeFileSync(`${out}/browser.json`,JSON.stringify({startedAt,finishedAt:new Date().toISOString(),scope:'Real UI components, synthetic local preview, mocked commands; no authentication/session and no Google data. Not a production authorization journey.',screens,commands,errors},null,2)+'\n')
 console.log(JSON.stringify({screens:screens.length,commands:commands.length,errors,passed:true}))
}catch(error){
 if(page){await page.screenshot({path:`${out}/failure.png`,fullPage:true});writeFileSync(`${out}/failure.json`,JSON.stringify({message:error.message,errors,commands,body:await page.locator('body').innerText()},null,2))}
 throw error
}finally{await browser.close()}

