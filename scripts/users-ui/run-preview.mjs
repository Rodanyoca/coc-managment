import { spawn } from 'node:child_process'
import path from 'node:path'
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'}
for(const key of Object.keys(env))if(/^(AUTH_|GOOGLE_|NEXT_FONT_GOOGLE_MOCKED_RESPONSES$|NEXT_DIST_DIR$|NODE_OPTIONS$)/.test(key))delete env[key]
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3147'],{cwd:path.resolve('.cache/users-ui/validation'),env,windowsHide:true,stdio:'inherit'})
console.log(`Owned preview PID ${child.pid}`)
process.on('SIGINT',()=>child.kill())
await new Promise(resolve=>child.once('close',resolve))
