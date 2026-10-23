import fs from 'node:fs'
import path from 'node:path'
import {spawn} from 'node:child_process'
import {createRequire} from 'node:module'
import assert from 'node:assert/strict'
const root=process.cwd(),target=path.resolve(process.argv[2] || '.cache/site-web-20261023/checkout'),proof=path.resolve('docs/implementation/site-web-unifie-2026-10-23')
if(!target.toLowerCase().startsWith(path.join(root,'.cache').toLowerCase()+path.sep))throw Error('Preview target must be an isolated .cache checkout inside coc-cible')
const require=createRequire(path.join(target,'package.json')), {chromium}=require('@playwright/test')
const fixture=path.join(target,'app/site-web-fixtures');if(fs.existsSync(fixture))throw Error('Refuse to overwrite an existing preview route');fs.mkdirSync(fixture,{recursive:true})
fs.writeFileSync(path.join(fixture,'page.tsx'),`import ContentManager from '@/components/site-web/content-manager'
import {CONTENT_SCHEMAS,isResource} from '@/lib/site-web/schema'
export default async function Page({searchParams}:{searchParams:Promise<{resource?:string;mode?:string}>}){const q=await searchParams,resource=isResource(q.resource||'')?q.resource as keyof typeof CONTENT_SCHEMAS:'actualites',schema=CONTENT_SCHEMAS[resource];const row=Object.fromEntries(schema.fields.map(f=>[f.key,f.type==='status'?'PUB001':f.type==='boolean'?'FALSE':f.type==='number'?'1':f.type==='date'?'2026-10-23':f.type==='image'?'http://127.0.0.1:3157/images/logo-coc.png':f.key==='contenu'?'<script>synthetic-text-only</script>':f.key==='id_categorie_actualite'?'CAT':f.key==='id_document_public'?'DOC':f.key==='id_galerie'?'GAL':f.type==='pdf'?'https://example.invalid/fixture.pdf':f.key==='lien_bouton'?'/actualites':f.key==='libelle_bouton'?'Lire':f.required?'Contenu synthétique':'']));row[schema.id]='FIXTURE-1';row[schema.label]='Contenu synthétique';return <ContentManager key={resource+q.mode} resource={resource} initialRows={q.mode==='empty'?[]:[row,{...row,[schema.id]:'FIXTURE-2',[schema.label]:'Autre contenu',id_statut_publication:'PUB002'}]} initialStatuses={[{id:'PUB001',label:'Brouillon'},{id:'PUB002',label:'Publié'},{id:'PUB003',label:'Archivé'}]} canEdit={q.mode!=='viewer'} initialError={q.mode==='error'}/>}
`)
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'}
for(const key of Object.keys(env))if(/^(AUTH_|GOOGLE_|NEXT_FONT_GOOGLE_MOCKED_RESPONSES$|NEXT_DIST_DIR$|NODE_OPTIONS$)/.test(key))delete env[key]
const log=path.join(proof,'preview-server.log');fs.writeFileSync(log,'')
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3157'],{cwd:target,env,windowsHide:true,stdio:['ignore','pipe','pipe']})
for(const s of [server.stdout,server.stderr])s.on('data',x=>fs.appendFileSync(log,x))
console.log(JSON.stringify({previewPid:server.pid,port:3157,scope:'Owned disposable synthetic preview only'}))
let browser, page
const screens=[],commands=[],errors=[];let failNext=false,photoAttempt=0
try{
  for(let n=0;n<90;n++){if(server.exitCode!==null)throw Error('Owned preview server exited; no existing server will be reused');try{const r=await fetch('http://127.0.0.1:3157/site-web-fixtures?resource=categories');if(r.status===200)break}catch{};await new Promise(r=>setTimeout(r,1000));if(n===89)throw Error('Preview unavailable')}
  browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}})
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort())
  await context.route('**/api/**',async route=>{
    const req=route.request(),url=new URL(req.url());commands.push({method:req.method(),path:url.pathname})
    if(req.method()==='GET')return route.fulfill({json:url.searchParams.get('options')==='1'?{options:{categories:[{id:'CAT',label:'Catégorie synthétique'}],galeries:[{id:'GAL',label:'Galerie synthétique',status:'PUB002'}],documents:[{id:'DOC',label:'Document synthétique',status:'PUB002'}]}}:{rows:[],statuses:[]}})
    if(url.pathname.endsWith('/uploads'))return route.fulfill({json:req.method()==='POST'?{token:'fixture-only-token',chunkBytes:3145728}:{next:req.postDataBuffer().length,asset:'fixture-only-asset'}})
    const body=req.postDataJSON();assert(req.headers()['x-request-id']);if(failNext){failNext=false;return route.fulfill({status:503,json:{error:'Erreur synthétique de source'}})}
    if(url.pathname.endsWith('/photos')&&++photoAttempt===2)return route.fulfill({status:503,json:{error:'Échec synthétique de la deuxième photo'}})
    const resource=url.pathname.split('/')[3],ids={actualites:'id_actualite',categories:'id_categorie_actualite',photos:'id_media_galerie',communiques:'id_communique',galeries:'id_galerie',documents:'id_document_public'};return route.fulfill({status:req.method()==='POST'?201:200,json:{row:{...body.row,[ids[resource]||'id_slide']:req.method()==='PUT'?'FIXTURE-1':req.headers()['x-request-id']}}})
  })
  page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message))
  const visit=async(resource,mode='')=>{await page.goto(`http://127.0.0.1:3157/site-web-fixtures?resource=${resource}&mode=${mode}`,{waitUntil:'networkidle',timeout:180000});await page.evaluate(()=>document.fonts.ready)}
  const shot=async(name)=>{if(await page.getByRole('dialog').count())await page.waitForTimeout(550);await page.screenshot({path:path.join(proof,name+'.png'),fullPage:true,animations:'disabled'});if(await page.getByRole('dialog').count()){const box=await page.getByRole('dialog').last().boundingBox();assert(box.x>=-1&&box.x+box.width<=(await page.evaluate(()=>innerWidth))+1,`${name} panel overflow`);}const dim=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));assert(dim.width<=dim.viewport,`${name} page overflow`);screens.push({name,...dim})}
  for(const [device,width,height]of[['desktop',1440,1000],['mobile',390,844]]){
    await page.setViewportSize({width,height})
    for(const resource of ['sliders','evenements','communiques','actualites','athletes','galeries','documents','categories']){await visit(resource);assert.equal(await page.getByRole('table').count(),1);await shot(`${resource}-${device}`);await page.getByRole('button',{name:'Modifier Contenu synthétique',exact:true}).click();await page.getByRole('dialog').waitFor();await shot(`${resource}-panel-${device}`);await page.getByRole('button',{name:'Annuler',exact:true}).click()}
  }
  await page.setViewportSize({width:1440,height:1000});await visit('actualites')
  await page.getByRole('button',{name:'Modifier Contenu synthétique',exact:true}).click();await page.getByLabel('Titre *',{exact:true}).fill('Titre corrigé');await page.getByRole('button',{name:'Annuler',exact:true}).click();await page.getByRole('alertdialog').waitFor();await page.getByRole('button',{name:'Continuer la saisie'}).click();assert.equal(await page.getByLabel('Titre *',{exact:true}).inputValue(),'Titre corrigé')
  failNext=true;await page.getByRole('button',{name:'Enregistrer',exact:true}).click();await page.getByRole('alert').filter({hasText:'Erreur synthétique'}).waitFor();assert.equal(await page.getByLabel('Titre *',{exact:true}).inputValue(),'Titre corrigé');await page.getByRole('button',{name:'Enregistrer',exact:true}).click();await page.getByRole('status').filter({hasText:'enregistré'}).waitFor()
  await visit('actualites','viewer');assert.equal(await page.getByRole('button',{name:'Ajouter',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:/Modifier /}).count(),0)
  await page.getByRole('button',{name:'Consulter Contenu synthétique',exact:true}).click();await page.getByText('<script>synthetic-text-only</script>',{exact:true}).waitFor();assert.equal(await page.locator('script').filter({hasText:'synthetic-text-only'}).count(),0)
  await visit('categories','empty');await shot('empty-desktop');await visit('categories','error');await shot('error-desktop')
  await visit('galeries');const photoReadsBefore=commands.filter(x=>x.path.endsWith('/photos')).length;await page.getByRole('button',{name:'Consulter Contenu synthétique',exact:true}).click();await page.getByRole('button',{name:'Ajouter plusieurs photos'}).waitFor();await page.getByText('Aucun contenu enregistré.',{exact:true}).waitFor();assert(commands.filter(x=>x.path.endsWith('/photos')).length>photoReadsBefore)
  await page.getByRole('button',{name:'Ajouter plusieurs photos'}).click();const files=[{name:'photo-a.png',mimeType:'image/png',buffer:fs.readFileSync(path.join(root,'public/images/logo-coc.png'))},{name:'photo-b.png',mimeType:'image/png',buffer:fs.readFileSync(path.join(root,'public/images/logo-coc.png'))}];await page.locator('#gallery-multiple').setInputFiles(files)
  await page.getByRole('button',{name:'Enregistrer les photos restantes'}).click();await page.getByRole('status').filter({hasText:'1 photo(s) enregistrée(s), 1 échec(s)'}).waitFor();await shot('photos-partial-success');await page.getByRole('button',{name:'Enregistrer les photos restantes'}).click();await page.getByRole('status').filter({hasText:'1 photo(s) enregistrée(s), 0 échec(s)'}).waitFor()
  await page.getByRole('dialog').last().getByRole('button',{name:'Fermer',exact:true}).click();assert.equal(await page.getByRole('dialog').getByRole('table').getByRole('row').count(),3);assert(!commands.some(x=>x.path.includes('dashboard/refresh')));assert.deepEqual(errors,[]);fs.writeFileSync(path.join(proof,'browser.json'),JSON.stringify({at:new Date().toISOString(),syntheticOnly:true,authenticated:false,productionWrites:false,screens,commands,errors,checks:['8 modules desktop/mobile','right panels','dirty close confirmation','input preserved on 503','successful local update','viewer UI read-only','escaped content','lazy photos','partial batch success and retry']},null,2));console.log(JSON.stringify({screens:screens.length,commands:commands.length,errors}))
}catch(error){ if(page){await page.screenshot({path:path.join(proof,"browser-failure.png"),fullPage:true});fs.writeFileSync(path.join(proof,"browser-failure.json"),JSON.stringify({error:error.message,body:await page.locator("body").innerText(),errors,commands},null,2))};throw error
}finally{
  if(browser)await browser.close()
  server.kill()
  await new Promise(resolve=>{if(server.exitCode!==null)resolve();else server.once('close',resolve)})
  // Remove only the owned synthetic route; preserve every application source.
  fs.unlinkSync(path.join(fixture,'page.tsx'));fs.rmdirSync(fixture)
  console.log('Owned preview closed; synthetic route removed. No other server touched.')
}
