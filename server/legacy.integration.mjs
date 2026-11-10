import assert from 'node:assert/strict'
import express from 'express'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'node:test'
import { Image } from './team-model.js'
import { Legacy } from './legacy-model.js'
import { mountLegacyRoutes } from './legacy-routes.js'

const uri = process.env.EVENTS_TEST_MONGODB_URI
if (!uri) throw new Error('EVENTS_TEST_MONGODB_URI is required; refusing to run Legacy integration tests')
const databaseName = new URL(uri).pathname.replace(/^\/+/, '')
if (!databaseName.endsWith('_test')) throw new Error('EVENTS_TEST_MONGODB_URI database name must end in _test')

const app = express()
app.use(express.json())
const authenticate = (request, response, next) => {
  if (request.get('authorization') !== 'Bearer legacy-test-token') return response.status(401).json({ success: false })
  next()
}
mountLegacyRoutes(app, { Legacy, ImageModel: Image, authenticate, config: { teamRateLimitWindowMs: 60_000, teamRateLimitMax: 1000 } })
const api = request(app)
const auth = { Authorization: 'Bearer legacy-test-token' }
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

test.before(async () => mongoose.connect(uri))
test.beforeEach(async () => {
  const entries = await Legacy.find({}, { photos: 1 })
  const ids = entries.flatMap((entry) => entry.photos.map((photo) => photo.image).filter(Boolean))
  await Legacy.deleteMany({})
  if (ids.length) await Image.deleteMany({ _id: { $in: ids } })
})
test.after(async () => mongoose.disconnect())

function data(overrides = {}) {
  return { year: 2023, competition: `integration-${Date.now()}-${Math.random()}`, achievements: [], ...overrides }
}

test('public Legacy route hides invisible entries and sorts newest year first', async () => {
  await Legacy.create([{ ...data({ year: 2023 }), visible: true }, { ...data({ year: 2025 }), visible: true }, { ...data({ year: 2026 }), visible: false }])
  const response = await api.get('/api/legacy')
  assert.equal(response.status, 200)
  assert.deepEqual(response.body.data.map((item) => item.year), [2025, 2023])
})

test('admin create, update, and delete work', async () => {
  const created = await api.post('/api/admin/legacy').set(auth).send(data({ achievements: [{ title: 'Award' }] }))
  assert.equal(created.status, 201)
  const id = created.body.data.id
  const updated = await api.put(`/api/admin/legacy/${id}`).set(auth).send({ year: 2024, visible: false, photos: [{ alt: 'A', caption: 'C' }, {}, {}] })
  assert.equal(updated.status, 200)
  assert.equal(updated.body.data.photos[0].alt, 'A')
  assert.equal((await api.get('/api/legacy')).body.data.length, 0)
  assert.equal((await api.delete(`/api/admin/legacy/${id}`).set(auth)).status, 200)
  assert.equal(await Legacy.countDocuments({ _id: id }), 0)
})

test('photo upload, replace, remove, and file cleanup work', async () => {
  const created = await Legacy.create(data())
  const path = `/api/admin/legacy/${created._id}/photos/0`
  const first = await api.post(path).set(auth).set('Content-Type', 'image/png').send(png)
  assert.equal(first.status, 200)
  const firstId = (await Legacy.findById(created._id)).photos[0].image
  assert.ok(await Image.exists({ _id: firstId }))
  const second = await api.post(path).set(auth).set('Content-Type', 'image/png').send(Buffer.concat([png, Buffer.from([1])]))
  assert.equal(second.status, 200)
  const secondId = (await Legacy.findById(created._id)).photos[0].image
  assert.ok(await Image.exists({ _id: secondId }))
  assert.equal(await Image.exists({ _id: firstId }), null)
  assert.equal((await api.delete(path).set(auth)).status, 200)
  assert.equal(await Image.exists({ _id: secondId }), null)
})

test('bad photo type and size are rejected', async () => {
  const created = await Legacy.create(data())
  const path = `/api/admin/legacy/${created._id}/photos/0`
  assert.equal((await api.post(path).set(auth).set('Content-Type', 'image/png').send(Buffer.from('not-png'))).status, 415)
  assert.equal((await api.post(path).set(auth).set('Content-Type', 'image/png').send(Buffer.concat([png, Buffer.alloc(400 * 1024)]))).status, 413)
  assert.equal(await Image.countDocuments({}), 0)
})

test('bad ids, slots, and missing entries never return 500', async () => {
  assert.equal((await api.get('/api/admin/legacy/bad-id').set(auth)).status, 400)
  assert.equal((await api.get('/api/admin/legacy/000000000000000000000001/photos/0').set(auth)).status, 404)
  assert.equal((await api.post('/api/admin/legacy/000000000000000000000001/photos/3').set(auth)).status, 400)
  assert.equal((await api.delete('/api/admin/legacy/000000000000000000000001/photos/x').set(auth)).status, 400)
})

test('all admin Legacy routes require authentication', async () => {
  assert.equal((await api.get('/api/admin/legacy')).status, 401)
  assert.equal((await api.post('/api/admin/legacy')).status, 401)
})
