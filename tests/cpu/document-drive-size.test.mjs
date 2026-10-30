import assert from 'node:assert/strict'
import test from 'node:test'
import { Readable } from 'node:stream'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'
const root = process.env.CPU_TEST_ROOT || process.cwd()
test('Drive size shares in-flight metadata, clears rejected requests, and retains TTL hits', async () => {
  let calls = 0, fail = false, release
  let gate = new Promise(done => { release = done })
  const data = await loadServerModule(root, 'lib/google/drive.ts', {
    stream: {Readable},
    googleapis: {google: {auth: {OAuth2: class {setCredentials() {}}}, drive: () => ({files: {get: async () => {
      calls++; await gate; if (fail) throw Error('synthetic Drive outage'); return {data: {size: '1234'}}
    }}})}},
    './request': {runGoogleRequest: task => task()},
  }, {GOOGLE_OAUTH_CLIENT_ID: 'synthetic', GOOGLE_OAUTH_CLIENT_SECRET: 'synthetic', GOOGLE_DRIVE_REFRESH_TOKEN: 'synthetic'})
  const pending = [data.getDriveFileSize('FILE1'), data.getDriveFileSize('FILE1')]
  assert.equal(calls, 1); release()
  assert.deepEqual(await Promise.all(pending), ['1234', '1234'])
  assert.equal(await data.getDriveFileSize('FILE1'), '1234'); assert.equal(calls, 1)
  fail = true; gate = Promise.resolve()
  await assert.rejects(data.getDriveFileSize('FILE2'), /synthetic Drive outage/)
  fail = false
  assert.equal(await data.getDriveFileSize('FILE2'), '1234'); assert.equal(calls, 3)
})
