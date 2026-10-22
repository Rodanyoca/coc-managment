import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const label=process.argv[2]
if(!['reference','variant'].includes(label))throw new Error('Choose reference or variant')
const context=JSON.parse(readFileSync('.cache/cpu-audit/validation-context.json','utf8'))
const cwd=context[label]
if(!cwd.startsWith(context.destination+path.sep))throw new Error('Unexpected build target')
if(lstatSync(path.join(cwd,'node_modules')).isSymbolicLink())throw new Error('External dependencies are forbidden')
if(readFileSync(path.join(cwd,'next.config.mjs'),'utf8')!==readFileSync('next.config.mjs','utf8'))throw new Error('Normal config mismatch')
if(readdirSync(cwd).some(file=>/^\.env(?:\.|$)/.test(file)))throw new Error('Environment files are forbidden in the isolated build')
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'}
for(const name of Object.keys(env))if(/^(AUTH_|GOOGLE_|NEXT_FONT_GOOGLE_MOCKED_RESPONSES$|NEXT_DIST_DIR$|NODE_OPTIONS$)/.test(name))delete env[name]
const startedAt=new Date().toISOString(),started=Date.now(),chunks=[]
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','build'],{cwd,env,windowsHide:true,stdio:['ignore','pipe','pipe']})
let phase='starting',timedOut=false
const collect=buffer=>{const text=buffer.toString();chunks.push(text);process.stdout.write(text);for(const line of text.split(/\r?\n/))if(/Creating an optimized|Compiled|TypeScript|Collecting page|Generating static|Finalizing|Collecting build/.test(line))phase=line.trim()}
child.stdout.on('data',collect);child.stderr.on('data',collect)
const heartbeat=setInterval(()=>console.log(JSON.stringify({label,pid:child.pid,elapsedSeconds:Math.round((Date.now()-started)/1000),phase})),20000)
const timer=setTimeout(()=>{timedOut=true;if(process.platform==='win32')spawn('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true});else child.kill('SIGTERM')},900000)
const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',code=>resolve(code))})
clearInterval(heartbeat);clearTimeout(timer)
const log=chunks.join('')
writeFileSync(path.join(cwd,'build-normal.log'),log)
const media=path.join(cwd,'.next/static/media')
const fontAssets=existsSync(media)?readdirSync(media).filter(file=>/\.(woff2?|ttf|otf)$/.test(file)).map(file=>{const buffer=readFileSync(path.join(media,file));return{file,bytes:buffer.length,signature:buffer.subarray(0,4).toString('ascii'),sha256:createHash('sha256').update(buffer).digest('hex')}}):[]
const required=path.join(cwd,'.next/required-server-files.json')
const config=existsSync(required)?JSON.parse(readFileSync(required,'utf8')).config:null
const result={label,cwd,startedAt,finishedAt:new Date().toISOString(),elapsedMs:Date.now()-started,exitCode:timedOut?124:exitCode,timedOut,phase,node:process.version,next:JSON.parse(readFileSync(path.join(cwd,'node_modules/next/package.json'),'utf8')).version,normalConfig:true,physicalDependencies:true,environmentFiles:false,mockedFonts:false,productionCredentials:false,typescriptIgnoreBuildErrors:config?.typescript?.ignoreBuildErrors??null,fontAssets,buildId:existsSync(path.join(cwd,'.next/BUILD_ID'))?readFileSync(path.join(cwd,'.next/BUILD_ID'),'utf8').trim():null,log:path.join(cwd,'build-normal.log')}
writeFileSync(`.cache/cpu-audit/build-${label}-normal.json`,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2))
process.exitCode=result.exitCode??1
