import assert from 'node:assert/strict'
import test from 'node:test'
import { sheetsModule, fixtureSheetValues } from '../../scripts/cpu-audit/fixtures.mjs'
const root=process.env.CPU_TEST_ROOT||process.cwd()
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done});return{promise,resolve}}

test('conservative delivery refreshes a computed copy in another workbook after a source write',async()=>{
 const {namespace:data,state}=await sheetsModule(root)
 const source={spreadsheetId:'SOURCE',sheetName:'A'},copy={spreadsheetId:'COPY',sheetName:'A'}
 await data.getSheetRows(source);await data.getSheetRows(copy)
 state.values.set("COPY:'A'!A:Z",[['id','value'],['1','copy updated by an external calculation']])
 await data.appendSheetRow({...source,row:{id:'2',value:'new source'}})
 assert.equal((await data.getSheetRows(copy))[0].value,'copy updated by an external calculation')
})

test('old cross-workbook batch and header reads cannot refill caches after an unrelated mutation',async()=>{
 const {namespace:data,state}=await sheetsModule(root),gate=deferred()
 await data.getSheetRows({spreadsheetId:'SOURCE',sheetName:'A'})
 state.get=async input=>{if(input.spreadsheetId==='COPY'){await gate.promise;return{data:{values:[['old']]}}}return{data:{values:fixtureSheetValues(state,input.spreadsheetId,input.range)}}}
 state.batchGet=async({ranges})=>{await gate.promise;return{data:{valueRanges:ranges.map(()=>({values:[['id','value'],['1','old']]}))}}}
 const header=data.getSheetHeaders({spreadsheetId:'COPY',sheetName:'B'}),batch=data.getSheetsRows({spreadsheetId:'COPY',sheetNames:['A']})
 await data.appendSheetRow({spreadsheetId:'SOURCE',sheetName:'A',row:{id:'2',value:'write'}})
 gate.resolve();await Promise.all([header,batch]);state.get=null;state.batchGet=null
 assert.equal((await data.getSheetsRows({spreadsheetId:'COPY',sheetNames:['A']})).A[0].value,'before')
 assert.equal((await data.getSheetHeaders({spreadsheetId:'COPY',sheetName:'B'}))[0],'id')
})

test('out-of-process source updates do not invoke local invalidation, while fresh reads see the source',async()=>{
 const {namespace:data,state}=await sheetsModule(root),input={spreadsheetId:'SOURCE',sheetName:'A'}
 await data.getSheetRows(input)
 state.values.set("SOURCE:'A'!A:Z",[['id','value'],['1','externally changed']])
 assert.equal((await data.getSheetRows(input))[0].value,'before')
 assert.equal((await data.getSheetRows({...input,bypassCache:true}))[0].value,'externally changed')
})
