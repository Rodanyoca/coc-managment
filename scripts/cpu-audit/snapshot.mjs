import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = process.cwd()
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const destination = mkdtempSync(path.join(tmpdir(), 'coc-cpu-'))
const files = [...new Set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard').split('\0'))]
const manifest = { label: process.argv[2] || 'baseline', createdAt: new Date().toISOString(), root, destination, head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'), status: git('status', '--short'), files: {} }
for (const file of files) {
  // Never copy credentials, Git internals, generated files or external workspaces.
  if (!file || file.split('/').some(part => ['.git', '.cache', '.next', '.next-dev', 'node_modules'].includes(part)) || path.basename(file).startsWith('.env')) continue
  const source = path.join(root, file)
  if (!existsSync(source) || !statSync(source).isFile()) continue
  const target = path.join(destination, file)
  mkdirSync(path.dirname(target), { recursive: true })
  copyFileSync(source, target)
  manifest.files[file] = createHash('sha256').update(readFileSync(source)).digest('hex')
}
symlinkSync(path.join(root, 'node_modules'), path.join(destination, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
writeFileSync(path.join(destination, 'cpu-reference.json'), JSON.stringify(manifest, null, 2))
mkdirSync(path.join(root, '.cache/cpu-audit'), { recursive: true })
writeFileSync(path.join(root, '.cache/cpu-audit', `${manifest.label}.json`), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify({ destination, head: manifest.head, files: Object.keys(manifest.files).length, label: manifest.label }))
