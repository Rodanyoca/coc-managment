import assert from 'node:assert/strict'
import test from 'node:test'
import { sheetsModule } from '../../scripts/cpu-audit/fixtures.mjs'
const root=process.env.CPU_TEST_ROOT || process.cwd()
const params=(sheetName='A',extra={})=>({spreadsheetId:'S',sheetName,...extra})
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done});return{promise,resolve}}

test('batch reads only missing unique ranges, preserves the complete result',async()=>{
  const {namespace:data,state}=await sheetsModule(root)
  await data.getSheetRows(params('A'))
  const result=await data.getSheetsRows({spreadsheetId:'S',sheetNames:['A','B','B']})
  assert.equal(JSON.stringify(Object.keys(result)),JSON.stringify(['A','B']))
  assert.equal(JSON.stringify(state.batchCalls[0].ranges),JSON.stringify(["'B'!A:Z"]))
  assert.equal(result.A[0].value,'before');assert.equal(result.B[0].value,'before')
})
test('overlapping batches and individual readers share in-flight missing ranges',async()=>{
  const {namespace:data,state}=await sheetsModule(root),gate=deferred()
  state.batchGet=async input=>{await gate.promise;return{data:{valueRanges:input.ranges.map(()=>({values:[['id','value'],['1','before']]}))}}}
  const first=data.getSheetsRows({spreadsheetId:'S',sheetNames:['A','B']})
  const second=data.getSheetsRows({spreadsheetId:'S',sheetNames:['B']})
  const third=data.getSheetRows(params('A'))
  gate.resolve();await Promise.all([first,second,third])
  assert.equal(state.batchCalls.length,1);assert.equal(state.calls.length,0)
})
test('invalidating an in-flight single read prevents stale cache resurrection',async()=>{
  const {namespace:data,state}=await sheetsModule(root),gate=deferred()
  state.get=async()=>{await gate.promise;return{data:{values:[['id','value'],['1','old']]}}}
  const before=data.getSheetRows(params())
  data.clearSheetCache();gate.resolve();await before
  state.get=async()=>({data:{values:[['id','value'],['1','new']]}})
  assert.equal((await data.getSheetRows(params()))[0].value,'new')
  assert.equal(state.calls.length,2)
})
test('successful write invalidates a batch already in flight, without cancelling its caller',async()=>{
  const {namespace:data,state}=await sheetsModule(root),gate=deferred()
  await data.getSheetHeaders(params())
  state.batchGet=async input=>{await gate.promise;return{data:{valueRanges:input.ranges.map(()=>({values:[['id','value'],['1','old']]}))}}}
  const before=data.getSheetsRows({spreadsheetId:'S',sheetNames:['A','B']})
  await data.appendSheetRow({...params(),row:{id:'2',value:'new'}})
  gate.resolve();await before
  state.get=async()=>({data:{values:[['id','value'],['1','new']]}})
  assert.equal((await data.getSheetRows(params()))[0].value,'new')
  assert.equal(state.writes.length,1)
})
test('headers finishing after invalidation do not poison subsequent reads',async()=>{
  const {namespace:data,state}=await sheetsModule(root),gate=deferred()
  state.get=async()=>{await gate.promise;return{data:{values:[['old']]}}}
  const before=data.getSheetHeaders(params())
  data.clearSheetCache();gate.resolve();await before
  state.get=async()=>({data:{values:[['new']]}})
  assert.equal((await data.getSheetHeaders(params()))[0],'new')
})
test('ordinary error fallback is kept, explicit fresh reads fail closed and never cache',async()=>{
  const {namespace:data,state}=await sheetsModule(root)
  await data.getSheetRows(params())
  state.batchGet=async()=>{throw new Error('offline')}
  assert.equal((await data.getSheetsRows({spreadsheetId:'S',sheetNames:['A'],cacheTtlMs:-1})).A[0].value,'before')
  await assert.rejects(data.getSheetsRows({spreadsheetId:'S',sheetNames:['A'],bypassCache:true}),/offline/)
  const fresh=await data.getSheetRows(params('B',{bypassCache:true}))
  assert.equal(fresh[0].value,'before')
  await data.getSheetRows(params('B'))
  assert.equal(state.calls.filter(call=>call.range==="'B'!A:Z").length,2)
})
test('different workbooks remain isolated; expiry triggers another read; empty batch does no I/O',async()=>{
  const {namespace:data,state}=await sheetsModule(root)
  await data.getSheetRows(params())
  await data.getSheetRows({...params(),spreadsheetId:'OTHER'})
  await data.getSheetRows(params('A',{cacheTtlMs:-1}))
  assert.equal(state.calls.length,3)
  assert.equal(JSON.stringify(await data.getSheetsRows({spreadsheetId:'S',sheetNames:[]})),'{}')
  assert.equal(state.batchCalls.length,0)
})

test('old completion cannot replace a new cache entry or remove its in-flight read',async()=>{
  const {namespace:data,state}=await sheetsModule(root),oldGate=deferred(),newGate=deferred()
  let reads=0
  state.get=async()=>{const first=++reads===1;await(first?oldGate.promise:newGate.promise);return{data:{values:[['id','value'],['1',first?'old':'new']]}}}
  const old=data.getSheetRows(params())
  data.clearSheetCache()
  const fresh=data.getSheetRows(params())
  oldGate.resolve();await old
  const join=data.getSheetRows(params())
  newGate.resolve()
  const results=await Promise.all([fresh,join])
  assert.equal(results[0][0].value,'new');assert.equal(results[1][0].value,'new')
  assert.equal(reads,2)
  assert.equal((await data.getSheetRows(params()))[0].value,'new')
})

test('failed shared batch cleans its promises so a later request can retry',async()=>{
  const {namespace:data,state}=await sheetsModule(root),gate=deferred()
  state.batchGet=async()=>{await gate.promise;throw new Error('offline')}
  const first=data.getSheetsRows({spreadsheetId:'S',sheetNames:['A','B']})
  const second=data.getSheetRows(params('B'))
  gate.resolve()
  const results=await Promise.allSettled([first,second])
  assert.equal(results.every(result=>result.status==='rejected'),true)
  state.batchGet=null
  assert.equal((await data.getSheetsRows({spreadsheetId:'S',sheetNames:['A','B']})).B[0].value,'before')
  assert.equal(state.batchCalls.length,2)
})

test('hot batches do no I/O, fresh batches do not share promises or populate caches',async()=>{
  const {namespace:data,state}=await sheetsModule(root)
  const input={spreadsheetId:'S',sheetNames:['A','B']}
  await data.getSheetsRows(input);await data.getSheetsRows(input)
  assert.equal(state.batchCalls.length,1)
  await Promise.all([data.getSheetsRows({...input,bypassCache:true}),data.getSheetsRows({...input,bypassCache:true})])
  assert.equal(state.batchCalls.length,3)
  data.clearSheetCache()
  await data.getSheetsRows({...input,bypassCache:true})
  await data.getSheetsRows(input)
  assert.equal(state.batchCalls.length,5)
})

test('separate process contexts do not share cache entries or invalidations',async()=>{
  const first=await sheetsModule(root),second=await sheetsModule(root)
  await first.namespace.getSheetRows(params());await second.namespace.getSheetRows(params())
  first.namespace.clearSheetCache()
  await second.namespace.getSheetRows(params())
  await first.namespace.getSheetRows(params())
  assert.equal(first.state.calls.length,2);assert.equal(second.state.calls.length,1)
})
