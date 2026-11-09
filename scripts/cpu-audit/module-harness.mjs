import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'

// Execute the actual server modules, with explicit offline dependency boundaries.
// Unknown packages fail closed: this harness cannot silently call Google.
export async function loadServerModule(root, entry, mocks, syntheticEnv = {}) {
  const context = vm.createContext({ console, Buffer, URL, Date, Map, Set, Promise, Request, Response, Headers, setTimeout, clearTimeout, process: { env: { AUTH_SECRET: 'offline-synthetic-secret-only', GOOGLE_SERVICE_ACCOUNT_EMAIL: 'synthetic@example.invalid', GOOGLE_PRIVATE_KEY: 'synthetic-key', ...syntheticEnv } } })
  const modules = new Map()
  const mock = (key, exports) => {
    if (!modules.has(key)) modules.set(key, new vm.SyntheticModule(Object.keys(exports), function () { for (const [name, value] of Object.entries(exports)) this.setExport(name, value) }, { context, identifier: key }))
    return modules.get(key)
  }
  const load = (file) => {
    if (modules.has(file)) return modules.get(file)
    const source = readFileSync(file, 'utf8')
    const code = file.endsWith('.ts') ? stripTypeScriptTypes(source, { mode: 'strip', sourceUrl: file }) : source
    const module = new vm.SourceTextModule(code, { context, identifier: file })
    modules.set(file, module)
    return module
  }
  const main = load(path.resolve(root, entry))
  await main.link((specifier, parent) => {
    if (specifier === 'server-only') return mock(specifier, {})
    if (Object.hasOwn(mocks, specifier)) return mock(specifier, mocks[specifier])
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) throw new Error(`Offline harness: dependency not mocked: ${specifier}`)
    let file = specifier.startsWith('@/') ? path.resolve(root, specifier.slice(2)) : path.resolve(path.dirname(parent.identifier), specifier)
    if (!existsSync(file)) file += '.ts'
    if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error('Dependency escapes the selected snapshot')
    return load(file)
  })
  await main.evaluate()
  return main.namespace
}
