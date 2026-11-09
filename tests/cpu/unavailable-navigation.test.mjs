import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'

test('a failed source retains a display menu but never bypasses fresh authentication or authorization', async () => {
  let offline = false, revoked = false, userReads = 0, authorizationReads = 0
  let navigationCookie
  const user = { idUser: 'SYNTHETIC', typeUser: 'VIEWER', estSuperAdmin: false, statut: 'ACTIF', sessionVersion: 1, doitChangerMotDePasse: false }
  const assignments = [{ idUser: user.idUser, idBlocAutorisation: 'AUT-SPT', statut: 'ACTIF', dateDebut: '2000-01-01', dateFin: '' }]
  const next = () => { const cookies = new Map(); return { kind: 'next', values: cookies, cookies: { set: (name, value) => cookies.set(name, value) } } }
  const { proxy } = await loadServerModule(process.env.CPU_TEST_ROOT || process.cwd(), 'proxy.ts', {
    'next/server': { NextResponse: { next, redirect: url => ({ kind: 'redirect', url: String(url) }), json: (body, options) => Response.json(body, options) } },
    'node:crypto': { createHash, createHmac, timingSafeEqual },
    './session-token.ts': { SESSION_TTL_SECONDS: 28800, verifySessionToken: async () => ({ id_user: user.idUser, session_version: 1, iat: 1, exp: 2000000000 }) },
    '@/lib/users/data': { getUserById: async () => { userReads++; if (offline) throw Error('Synthetic unavailable'); return revoked ? { ...user, sessionVersion: 2 } : user }, getAuthorizationsForUser: async () => { authorizationReads++; return assignments } },
  })
  const request = (route, method = 'GET') => { const url = new URL(route, 'https://example.invalid'); return { url: url.href, nextUrl: url, method, cookies: { get: name => name === 'coc_session' ? { value: 'synthetic-session' } : name === 'coc_navigation' && navigationCookie ? { value: navigationCookie } : undefined } } }
  const allowed = await proxy(request('/dashboard/competitions'))
  assert.equal(allowed.kind, 'next')
  assert(allowed.values.has('coc_navigation'))
  navigationCookie = allowed.values.get('coc_navigation')
  assert.equal(userReads, 1)
  assert.equal(authorizationReads, 1, 'snapshot must reuse the freshly read authorizations')
  offline = true
  const error = await proxy(request('/dashboard/acteurs/athletes?statut=ACTIF'))
  const destination = new URL(error.url)
  assert.equal(destination.pathname, '/service-indisponible')
  assert.equal(destination.searchParams.get('retour'), '/dashboard/acteurs/athletes?statut=ACTIF')
  assert.equal(userReads, 2)
  const api = await proxy(request('/api/athletes'))
  assert.equal(api.status, 503)
  assert.equal(userReads, 3)
  offline = false; revoked = true
  assert.equal(new URL((await proxy(request('/dashboard/competitions'))).url).pathname, '/login')
  revoked = false
  const deniedWrite = await proxy(request('/api/competitions', 'POST'))
  assert.equal(deniedWrite.status, 403)
})
