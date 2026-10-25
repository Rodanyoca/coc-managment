import test from 'node:test'
import assert from 'node:assert/strict'
import {sheetsModule} from '../../scripts/cpu-audit/fixtures.mjs'
import {CONTENT_SCHEMAS,headersFor} from '../../lib/site-web/schema.ts'
const root=process.env.CPU_TEST_ROOT||process.cwd()
async function fixture(resource='actualites',rows=[]){
 const f=await sheetsModule(root),schema=CONTENT_SCHEMAS[resource],headers=headersFor(resource),grid=[headers,...rows.map(row=>headers.map(h=>row[h]??''))];
 const value=v=>String(v??'').trim(); const offset=c=>[...c].reduce((n,x)=>n*26+x.charCodeAt(0)-64,0)-1;
 f.state.metadata=[{properties:{title:schema.sheet,sheetId:1}}];
 f.state.get=async input=>{if(/!A2:Z$/.test(input.range))return{data:{values:grid.slice(1).map(r=>[...r])}};const line=input.range.match(/!(\d+):(\d+)$/);if(line)return{data:{values:grid.slice(Number(line[1])-1,Number(line[2])).map(r=>[...r])}};const m=input.range.match(/!([A-Z]+)(\d+):([A-Z]+)(\d+)$/);return{data:{values:m?grid.slice(Number(m[2])-1,Number(m[4])).map(r=>r.slice(offset(m[1]),offset(m[3])+1)):grid.map(r=>[...r])}}};
 f.state.batchGet=async input=>({data:{valueRanges:await Promise.all(input.ranges.map(async range=>({values:(await f.state.get({range})).data.values})))}});
 f.state.values.set(`SITE:'${schema.sheet}'!1:1`,[headers]);
 f.state.write=async input=>{if(input.requestBody?.requests){for(const r of input.requestBody.requests){if(r.insertDimension)grid.splice(r.insertDimension.range.startIndex??r.insertDimension.range.startRowIndex,0,[]);if(r.updateCells){const c=r.updateCells;grid[c.range.startRowIndex][c.range.startColumnIndex]=c.rows[0].values[0].userEnteredValue.stringValue}}}else if(input.requestBody?.data){for(const d of input.requestBody.data){const m=d.range.match(/!([A-Z]+)(\d+)/),r=Number(m[2])-1;grid[r]??=[];grid[r][offset(m[1])]=d.values[0][0]}}else if(input.requestBody?.values){const last=grid.findLastIndex(r=>r.some(v=>value(v)!==''));grid[last+1]=input.requestBody.values[0]}return{}};
 const create=(id,extra={})=>f.namespace.appendSheetRow({spreadsheetId:'SITE',sheetName:schema.sheet,row:{[schema.id]:id,[schema.label]:'Synthetic',...extra},placement:{idColumn:schema.id,falseColumns:schema.fields.filter(f=>f.type==='boolean').map(f=>f.key)}});
 return{...f,grid,headers,schema,create,rowOf:id=>grid.findIndex(r=>value(r[headers.indexOf(schema.id)])===id)+1};
}
test('Site Web creation ignores 999 checkbox FALSE template rows and writes physical row 2',async()=>{const f=await fixture('actualites',Array.from({length:999},()=>({est_mis_en_avant:false})));await f.create('NEWS');assert.equal(f.rowOf('NEWS'),2)})

test('all nine Site Web resources reuse row 2 in blank or FALSE-only templates',async()=>{
 for(const resource of Object.keys(CONTENT_SCHEMAS)){
  const defaults=Object.fromEntries(CONTENT_SCHEMAS[resource].fields.filter(f=>f.type==='boolean').map(f=>[f.key,'FALSE']));
  const f=await fixture(resource,[defaults,defaults]);await f.create('NEW');assert.equal(f.rowOf('NEW'),2,resource);
 }
})
test('empty grid with headers and a completely full grid append at the first new row',async()=>{
 const f=await fixture('categories');await f.create('ONE');assert.equal(f.rowOf('ONE'),2);await f.create('TWO');assert.equal(f.rowOf('TWO'),3);
})
test('incomplete rows, TRUE, zero, status, and formulas reserve their physical row',async()=>{
 const rows=[{titre:'incomplete'}, {est_mis_en_avant:true}, {ordre_affichage:'0'}, {id_statut_publication:'PUB001'}, {est_mis_en_avant:'=FALSE()'}, {titre:'=IF(TRUE,"","")'}, {est_mis_en_avant:false}];
 const f=await fixture('actualites',rows);const before=JSON.stringify(f.grid.slice(1,7));await f.create('NEWS');assert.equal(f.rowOf('NEWS'),8);assert.equal(JSON.stringify(f.grid.slice(1,7)),before);
})
test('unknown and unlabelled columns with values are never overwritten, including FALSE',async()=>{
 const f=await fixture('categories',[{}, {}, {}]);f.grid[0].push('extra','');f.grid[1].push(false);f.grid[2].push('','unlabelled data');await f.create('NEWS');assert.equal(f.rowOf('NEWS'),4);assert.equal(f.grid[1][3],false);assert.equal(f.grid[2][4],'unlabelled data');
})
test('first hole between records is reused, and existing physical rows remain readable and editable',async()=>{
 const f=await fixture('actualites',[{id_actualite:'FIRST',titre:'first'},{est_mis_en_avant:false},{id_actualite:'THIRD',titre:'third'}]);await f.create('MIDDLE');assert.equal(f.rowOf('MIDDLE'),3);
 const rows=await f.namespace.getSheetRows({spreadsheetId:'SITE',sheetName:f.schema.sheet});assert.equal(rows[3].id_actualite,'THIRD');
 await f.namespace.updateSheetCells({spreadsheetId:'SITE',sheetName:f.schema.sheet,idColumn:'id_actualite',idValue:'THIRD',updates:[{column:'titre',value:'edited'}]});assert.equal(f.rowOf('THIRD'),5);assert.equal(f.grid[4][f.headers.indexOf('titre')],'edited');
})
test('same-ID retry does not duplicate or overwrite and duplicate IDs or missing headers fail closed',async()=>{
 const f=await fixture('actualites',[{est_mis_en_avant:false}]);await f.create('SAME');const writes=f.state.writes.length;await f.create('SAME',{titre:'must not replace'});assert.equal(f.state.writes.length,writes);assert.equal(f.grid[1][f.headers.indexOf('titre')],'Synthetic');
 f.grid.push([...f.grid[1]]);await assert.rejects(f.create('SAME'),/dupliqu/);
 const bad=await fixture('categories');bad.grid[0][0]='wrong_id';await assert.rejects(bad.create('X'),/identifiant/);assert.equal(bad.state.writes.length,0);
})
test('simultaneous local creations select different rows, including retries of the same ID',async()=>{
 const f=await fixture('actualites',Array.from({length:20},()=>({est_mis_en_avant:false})));await Promise.all(Array.from({length:12},(_,i)=>f.create('ROW-'+i)));assert.deepEqual(Array.from({length:12},(_,i)=>f.rowOf('ROW-'+i)),Array.from({length:12},(_,i)=>i+2));
 await Promise.all([f.create('RETRY'),f.create('RETRY')]);assert.equal(f.grid.filter(r=>r[0]==='RETRY').length,1);
})
test('lost acknowledgement after committed write recovers with same ID and frees local queue',async()=>{
 const f=await fixture('actualites',[{est_mis_en_avant:false}]);const write=f.state.write;let once=true;f.state.write=async input=>{await write(input);if(once){once=false;throw Error('lost acknowledgement')}};
 await assert.rejects(f.create('LOST'),/lost/);await f.create('LOST');await f.create('NEXT');assert.equal(f.rowOf('LOST'),2);assert.equal(f.rowOf('NEXT'),3);assert.equal(f.grid.filter(r=>r[0]==='LOST').length,1);
})
test('row recheck detects an outside writer before overwrite and selects the next free slot',async()=>{
 const f=await fixture('actualites',[{est_mis_en_avant:false},{est_mis_en_avant:false}]);const get=f.state.get;let once=true;f.state.get=async input=>{if(once&&/!2:2$/.test(input.range)){once=false;f.grid[1][f.headers.indexOf('titre')]='outside writer'}return get(input)};await f.create('NEWS');assert.equal(f.rowOf('NEWS'),3);assert.equal(f.grid[1][f.headers.indexOf('titre')],'outside writer');
})
test('non-opt-in append preserves existing SaaS append behavior',async()=>{
 const f=await fixture('actualites',[{est_mis_en_avant:false},{est_mis_en_avant:false}]);await f.namespace.appendSheetRow({spreadsheetId:'SITE',sheetName:f.schema.sheet,row:{id_actualite:'LEGACY'}});assert.equal(f.rowOf('LEGACY'),4);
})

test('different instances selecting the same hole insert atomically without overwriting either record',async()=>{const first=await fixture('actualites',[{est_mis_en_avant:false}]),second=await fixture('actualites');second.state.get=first.state.get;second.state.write=first.state.write;await Promise.all([first.create('INSTANCE-A'),second.create('INSTANCE-B')]);assert(first.rowOf('INSTANCE-A')>=2);assert(first.rowOf('INSTANCE-B')>=2);assert.notEqual(first.rowOf('INSTANCE-A'),first.rowOf('INSTANCE-B'));})

test('a write arriving after the slot recheck is shifted intact by the atomic creation',async()=>{const f=await fixture('actualites',[{est_mis_en_avant:false}]),write=f.state.write;f.state.write=async input=>{if(input.requestBody?.requests)f.grid[1][f.headers.indexOf('titre')]='late external data';return write(input)};await f.create('NEW');assert.equal(f.rowOf('NEW'),2);assert.equal(f.grid[2][f.headers.indexOf('titre')],'late external data');assert.deepEqual(Array.from(f.state.writes[0].requestBody.requests.slice(0,3),r=>Object.keys(r)[0]),['insertDimension','copyPaste','copyPaste']);})
test('Site Web fresh update locates its ID after insertion from another instance, ignoring stale row cache',async()=>{const first=await fixture('actualites',[{est_mis_en_avant:false},{id_actualite:'EXISTING',titre:'old'}]),second=await fixture('actualites');second.state.get=first.state.get;second.state.write=first.state.write;await second.namespace.getSheetRows({spreadsheetId:'SITE',sheetName:first.schema.sheet});await first.create('NEW');await second.namespace.updateSheetCells({spreadsheetId:'SITE',sheetName:first.schema.sheet,idColumn:'id_actualite',idValue:'EXISTING',fresh:true,updates:[{column:'titre',value:'updated'}]});assert.equal(first.rowOf('EXISTING'),4);assert.equal(first.grid[3][first.headers.indexOf('titre')],'updated');assert.equal(first.grid[1][first.headers.indexOf('titre')],'Synthetic');})
