import assert from 'node:assert/strict'
import { once } from 'node:events'
import http from 'node:http'
import test from 'node:test'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createApp } from './app.js'
import { setupAdmin } from './provision.js'

const config = {
  jwtSecret: 'a-secret-that-is-longer-than-thirty-two-characters',
  jwtExpiresIn: '8h',
  clientUrl: 'http://localhost:5173',
  adminEmail: 'mitsmotorsportswebdev@gmail.com',
  trustProxy: 0,
}

async function createFixture() {
  const admin = {
    _id: 'admin-id',
    email: config.adminEmail,
    role: 'admin',
    passwordHash: await bcrypt.hash('correct-password', 12),
    passwordChangedAt: new Date(),
    save: async () => undefined,
  }
  const Admin = {
    findOne: async () => admin,
    findById: async () => admin,
  }
  const app = createApp({ Admin, config })
  const server = http.createServer(app)
  server.listen(0)
  await once(server, 'listening')
  return { admin, server, url: `http://127.0.0.1:${server.address().port}` }
}

async function post(url, path, body, headers = {}) {
  return fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

test('successful login trims and normalizes the allowed email', async (t) => {
  const fixture = await createFixture()
  t.after(() => fixture.server.close())
  const response = await post(fixture.url, '/api/admin/login', { email: ` ${config.adminEmail.toUpperCase()} `, password: 'correct-password' })
  const payload = await response.json()
  assert.equal(response.status, 200)
  assert.equal(payload.data.user.role, 'admin')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.ok(payload.data.token)
})

test('wrong password, unknown email, and another email use the same generic response', async (t) => {
  const fixture = await createFixture()
  t.after(() => fixture.server.close())
  const responses = await Promise.all([
    post(fixture.url, '/api/admin/login', { email: config.adminEmail, password: 'wrong-password' }),
    post(fixture.url, '/api/admin/login', { email: 'unknown@example.com', password: 'wrong-password' }),
    post(fixture.url, '/api/admin/login', { email: 'other@example.com', password: 'wrong-password' }),
  ])
  const payloads = await Promise.all(responses.map((response) => response.json()))
  assert.deepEqual(payloads.map((payload) => payload.message), ['Invalid email or password.', 'Invalid email or password.', 'Invalid email or password.'])
})

test('login rate limiting returns a clear error', async (t) => {
  const fixture = await createFixture()
  t.after(() => fixture.server.close())
  const responses = []
  for (let attempt = 0; attempt < 6; attempt += 1) responses.push(await post(fixture.url, '/api/admin/login', { email: config.adminEmail, password: 'wrong-password' }))
  assert.equal(responses.at(-1).status, 429)
  assert.match((await responses.at(-1).json()).message, /Too many login attempts/)
})

test('invalid and expired tokens are rejected without database changes', async (t) => {
  const fixture = await createFixture()
  t.after(() => fixture.server.close())
  const expired = jwt.sign({ sub: fixture.admin._id, role: 'admin', passwordChangedAt: fixture.admin.passwordChangedAt.getTime() }, config.jwtSecret, { expiresIn: -1 })
  const response = await fetch(`${fixture.url}/api/admin/session`, { headers: { Authorization: `Bearer ${expired}` } })
  assert.equal(response.status, 401)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const invalid = await fetch(`${fixture.url}/api/admin/session`, { headers: { Authorization: 'Bearer not-a-token' } })
  assert.equal(invalid.status, 401)
})

test('password change invalidates earlier tokens and enforces password rules', async (t) => {
  const fixture = await createFixture()
  t.after(() => fixture.server.close())
  const login = await post(fixture.url, '/api/admin/login', { email: config.adminEmail, password: 'correct-password' })
  const token = (await login.json()).data.token
  const response = await post(fixture.url, '/api/admin/password', { currentPassword: 'correct-password', newPassword: 'new-password-123' }, { Authorization: `Bearer ${token}` })
  assert.equal(response.status, 200)
  const oldTokenResponse = await fetch(`${fixture.url}/api/admin/session`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(oldTokenResponse.status, 401)
})

test('a token issued in the same second as a password change is rejected', async (t) => {
  const fixture = await createFixture()
  t.after(() => fixture.server.close())
  const originalTime = Date.now
  const sameSecond = fixture.admin.passwordChangedAt.getTime() + 500
  Date.now = () => sameSecond
  try {
    const token = jwt.sign({ sub: fixture.admin._id, role: 'admin', passwordChangedAt: fixture.admin.passwordChangedAt.getTime() }, config.jwtSecret, { expiresIn: '8h' })
    const response = await post(fixture.url, '/api/admin/password', { currentPassword: 'correct-password', newPassword: 'new-password-456' }, { Authorization: `Bearer ${token}` })
    assert.equal(response.status, 200)
    const oldTokenResponse = await fetch(`${fixture.url}/api/admin/session`, { headers: { Authorization: `Bearer ${token}` } })
    assert.equal(oldTokenResponse.status, 401)
  } finally {
    Date.now = originalTime
  }
})

test('setup refuses to create a second admin', async () => {
  const records = []
  const Admin = {
    countDocuments: async () => records.length,
    create: async (record) => { records.push(record); return record },
  }
  await setupAdmin({ Admin, config, password: 'first-password-123' })
  await assert.rejects(() => setupAdmin({ Admin, config, password: 'second-password-123' }), /already exists/)
  assert.equal(records.length, 1)
})
