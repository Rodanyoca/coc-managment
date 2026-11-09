import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { appendFileSync, cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'
import os from 'node:os'

const root = process.cwd(), base = path.resolve('.cache/cpu-next'), evidence = path.resolve('docs/implementation/audit-cpu-suite-2026-10-23')
const before = JSON.parse(readFileSync(path.join(base, 'before.json'), 'utf8'))
const reference = path.join(base, 'reference'), variant = path.join(base, 'variant')
const resume = process.argv.includes('--resume')
const variantOnly = process.argv.includes('--variant-only')
assert.equal(realpathSync(reference), reference)
assert(resume || !existsSync(variant), 'Use a new isolated variant; never overwrite an earlier validation')
mkdirSync(variant, { recursive: true }); mkdirSync(evidence, { recursive: true })
const files = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\0').filter(Boolean))]
for (const file of files) {
  if (!existsSync(file) || path.basename(file).startsWith('.env') || file === 'scripts/cpu-audit/mock-fonts.cjs') continue
  const target = path.join(variant, file); mkdirSync(path.dirname(target), { recursive: true }); copyFileSync(file, target)
}
// Resume only a source-only preparation whose builds have not yet started.
// Physical dependencies may have been moved from a completed, stopped validation.
copyFileSync('scripts/cpu-audit/validate-next.mjs', path.join(variant, 'scripts/cpu-audit/validate-next.mjs'))
for (const target of [reference, variant]) {
  if (!variantOnly || target === variant) assert(!existsSync(path.join(target, '.next')))
  assert(!readdirSync(target).some(file => file.startsWith('.env')))
  if (!resume) {
    console.log(`Copying physical dependencies: ${target}`)
    cpSync(path.join(root, 'node_modules'), path.join(target, 'node_modules'), { recursive: true, dereference: true, filter: source => !source.startsWith(path.join(root, 'node_modules', '.cache')) })
  }
  assert(realpathSync(path.join(target, 'node_modules/next/dist/bin/next')).startsWith(target + path.sep))
  execFileSync('git', ['init', '--quiet'], { cwd: target })
  const { findRootDirAndLockFiles } = createRequire(path.join(target, 'package.json'))('next/dist/lib/find-root.js')
  assert.equal(findRootDirAndLockFiles(target).rootDir, target, 'Next must stay inside its isolated checkout')
}
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
for (const key of Object.keys(env)) if (/^(AUTH_|GOOGLE_|NEXT_FONT_GOOGLE_MOCKED_RESPONSES$|NEXT_DIST_DIR$|NODE_OPTIONS$)/.test(key)) delete env[key]
writeFileSync(path.join(evidence, 'validation-environment.json'), JSON.stringify({ at: new Date().toISOString(), node: process.version, availableCpus: os.availableParallelism(), totalGiB: os.totalmem() / 2 ** 30, freeGiB: os.freemem() / 2 ** 30, normalBuildArgs: ['node_modules/next/dist/bin/next', 'build'], configurationChanged: false, mockedFonts: false }, null, 2) + '\n')
const records = variantOnly ? JSON.parse(readFileSync(path.join(evidence, 'checks.json'), 'utf8')).filter(record => record.label.startsWith('reference-')) : []
if (variantOnly) {
  for (const label of ['reference-build', 'reference-typescript']) assert.equal(records.find(record => record.label === label)?.exitCode, 0)
  const previous = JSON.parse(readFileSync('docs/interfaces/preuves-utilisateurs-2026-10-23/checks.json', 'utf8')).find(record => record.name === 'suite')
  const suite = records.find(record => record.label === 'reference-suite')
  assert.equal(suite?.tests, previous.tests); assert.equal(suite?.pass, previous.pass); assert.deepEqual(suite?.failures, previous.failures)
  for (const file of ['lib/google/sheets.ts', 'lib/users/google-adapter.ts', 'lib/users/repository.ts', 'lib/users/types.ts']) assert.equal(createHash('sha256').update(readFileSync(path.join(reference, file))).digest('hex'), before.files[file])
}
async function run(label, cwd, args) {
  const started = Date.now(), chunks = []
  const logPath = path.join(evidence, `${label}.log`)
  writeFileSync(logPath, '')
  const child = spawn(process.execPath, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  const capture = chunk => { chunks.push(chunk); appendFileSync(logPath, chunk) }
  child.stdout.on('data', capture); child.stderr.on('data', capture)
  const tick = setInterval(() => console.log(JSON.stringify({ label, seconds: Math.round((Date.now() - started) / 1000), pid: child.pid })), 20000)
  const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve) }); clearInterval(tick)
  const log = Buffer.concat(chunks).toString('utf8')
  writeFileSync(path.join(evidence, `${label}.log`), log)
  const record = { label, args, exitCode, elapsedMs: Date.now() - started }
  if (label.includes('suite') || label.includes('cpu') || label.includes('users') || label.includes('permissions')) Object.assign(record, { tests: Number(log.match(/# tests (\d+)/)?.[1]), pass: Number(log.match(/# pass (\d+)/)?.[1]), fail: Number(log.match(/# fail (\d+)/)?.[1]), failures: [...log.matchAll(/^not ok \d+ - (.+)$/gm)].map(match => match[1]).sort() })
  records.push(record); writeFileSync(path.join(evidence, 'checks.json'), JSON.stringify(records, null, 2) + '\n'); console.log(JSON.stringify(record))
  if (label.includes('suite')) {
    const previous = JSON.parse(readFileSync('docs/interfaces/preuves-utilisateurs-2026-10-23/checks.json', 'utf8')).find(record => record.name === 'suite')
    assert.equal(record.tests, previous.tests); assert.equal(record.pass, previous.pass); assert.deepEqual(record.failures, previous.failures)
  } else assert.equal(exitCode, 0, label)
}
await run('variant-lint', variant, ['node_modules/eslint/bin/eslint.js', 'lib/google/sheets.ts', 'lib/users/google-adapter.ts', 'lib/users/repository.ts', 'lib/users/types.ts', 'scripts/cpu-audit/fixtures.mjs', 'scripts/cpu-audit/benchmark-next.mjs', 'scripts/cpu-audit/validate-next.mjs', 'tests/cpu/freshness-invalidation.test.mjs', 'tests/unit/auth-source-unavailable-navigation.test.ts'])
await run('variant-cpu', variant, ['--experimental-vm-modules', '--test', '--test-reporter=tap', 'tests/cpu/*.test.mjs'])
await run('variant-users', variant, ['--experimental-vm-modules', '--test', '--test-reporter=tap', 'tests/users-ui/*.test.mjs'])
await run('variant-permissions', variant, ['--test', '--test-reporter=tap', 'tests/unit/authorization.test.ts', 'tests/unit/post-login-route.test.ts', 'tests/unit/authorization-matrix.test.ts'])
for (const [label, cwd] of (variantOnly ? [['variant', variant]] : [['reference', reference], ['variant', variant]])) {
  await run(`${label}-build`, cwd, ['node_modules/next/dist/bin/next', 'build'])
  assert.equal(JSON.parse(readFileSync(path.join(cwd, '.next/required-server-files.json'), 'utf8')).config.typescript.ignoreBuildErrors, false)
  const fonts = readdirSync(path.join(cwd, '.next/static/media')).filter(file => file.endsWith('.woff2')).map(file => {
    const bytes = readFileSync(path.join(cwd, '.next/static/media', file)); assert.equal(bytes.subarray(0, 4).toString(), 'wOF2')
    return { file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
  })
  assert.equal(fonts.length, 11); writeFileSync(path.join(evidence, `${label}-fonts.json`), JSON.stringify({ mocked: false, fonts }, null, 2) + '\n')
  await run(`${label}-typescript`, cwd, ['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false'])
  await run(`${label}-suite`, cwd, ['--test', '--test-reporter=tap', '--test-concurrency=1', 'tests/unit/*.test.ts', 'tests/integration/*.test.ts'])
}
const allowed = new Set(['lib/google/sheets.ts', 'lib/users/google-adapter.ts', 'lib/users/repository.ts', 'lib/users/types.ts', 'scripts/cpu-audit/fixtures.mjs', 'tests/unit/auth-source-unavailable-navigation.test.ts', 'docs/implementation/audit-cpu-suivi-2026-10-22.md', 'docs/implementation/audit-cpu-ecarts-2026-10-22.md'])
const changed = [], protectedFiles = []
for (const [file, hash] of Object.entries(before.files)) {
  const now = existsSync(file) ? createHash('sha256').update(readFileSync(file)).digest('hex') : null
  if (now !== hash) { assert(allowed.has(file), `Unexpected parallel change: ${file}`); changed.push(file) } else protectedFiles.push(file)
}
const sources = Object.fromEntries([...allowed].filter(file => file.startsWith('lib/')).map(file => {
  const source = createHash('sha256').update(readFileSync(file)).digest('hex')
  assert.equal(source, createHash('sha256').update(readFileSync(path.join(variant, file))).digest('hex'))
  return [file, source]
}))
writeFileSync(path.join(evidence, 'preservation.json'), JSON.stringify({ at: new Date().toISOString(), beforeHead: before.head, changed, protectedFiles: protectedFiles.length, originalUserInterfacesPreserved: protectedFiles.filter(file => file.startsWith('app/dashboard/utilisateurs/') || file === 'app/api/users/[id]/route.ts' || file === 'components/dashboard/user-account-ui.tsx'), sourceHashes: sources }, null, 2) + '\n')
console.log('Validation complete; no push, deployment, production writes or mocked fonts.')
