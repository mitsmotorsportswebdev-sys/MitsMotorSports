import assert from 'node:assert/strict'
import express from 'express'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'node:test'
import { Legacy } from './legacy-model.js'
import { mountLegacyRoutes } from './legacy-routes.js'

const valid = {
  year: 2023,
  competition: 'FKDC 2023',
  achievements: [{ title: 'First Prize', description: 'Endurance' }],
}

function entry(overrides = {}) {
  return new Legacy({ ...valid, photos: [{}, {}, {}], ...overrides })
}

test('Legacy model validates fields and limits', () => {
  assert.equal(entry().validateSync(), undefined)
  assert.ok(entry({ year: 1999 }).validateSync().errors.year)
  assert.ok(entry({ year: 2101 }).validateSync().errors.year)
  assert.ok(entry({ competition: 'x'.repeat(121) }).validateSync().errors.competition)
  assert.ok(entry({ season: 'x'.repeat(41) }).validateSync().errors.season)
  assert.ok(entry({ location: 'x'.repeat(121) }).validateSync().errors.location)
  assert.ok(entry({ result: 'x'.repeat(201) }).validateSync().errors.result)
  assert.ok(entry({ achievements: Array.from({ length: 11 }, (_, i) => ({ title: `A${i}` })) }).validateSync().errors.achievements)
  assert.ok(entry({ achievements: [{ title: 'x'.repeat(121) }] }).validateSync().errors['achievements.0.title'])
  assert.ok(entry({ photos: [{}, {}] }).validateSync().errors.photos)
})

test('Legacy model validates achievement and photo text limits', () => {
  assert.ok(entry({ achievements: [{ title: 'Valid', description: 'x'.repeat(501) }] }).validateSync().errors['achievements.0.description'])
  assert.ok(entry({ photos: [{ alt: 'x'.repeat(161) }, {}, {}] }).validateSync().errors['photos.0.alt'])
  assert.ok(entry({ photos: [{ caption: 'x'.repeat(201) }, {}, {}] }).validateSync().errors['photos.0.caption'])
})

test('Legacy model defaults visibility and three empty photos', () => {
  const value = new Legacy(valid)
  assert.equal(value.visible, true)
  assert.equal(value.photos.length, 3)
  assert.deepEqual(value.photos.map((photo) => photo.image), [null, null, null])
})

test('Legacy route sorts by year descending then createdAt descending', async () => {
  const rows = [
    { _id: new mongoose.Types.ObjectId(), year: 2024, createdAt: new Date('2024-01-01'), photos: [{}, {}, {}], achievements: [], visible: true },
    { _id: new mongoose.Types.ObjectId(), year: 2025, createdAt: new Date('2025-01-01'), photos: [{}, {}, {}], achievements: [], visible: true },
  ]
  const sorted = []
  const Model = { find: () => ({ sort: (value) => { sorted.push(value); return Promise.resolve(rows) } }) }
  const app = express()
  mountLegacyRoutes(app, { LegacyModel: Model, ImageModel: {}, authenticate: (_request, _response, next) => next() })
  const response = await request(app).get('/api/legacy')
  assert.equal(response.status, 200)
  assert.deepEqual(sorted, [{ year: -1, createdAt: -1 }])
})

test('Legacy route rejects invalid ids and slots with 400', async () => {
  const app = express()
  mountLegacyRoutes(app, { LegacyModel: {}, ImageModel: {}, authenticate: (_request, _response, next) => next() })
  assert.equal((await request(app).get('/api/admin/legacy/not-an-object-id')).status, 400)
  assert.equal((await request(app).post('/api/admin/legacy/000000000000000000000001/photos/3')).status, 400)
  assert.equal((await request(app).post('/api/admin/legacy/000000000000000000000001/photos/x')).status, 400)
})

test('Legacy admin routes require authentication', async () => {
  const app = express()
  const authenticate = (_request, response) => response.status(401).json({ success: false })
  mountLegacyRoutes(app, { LegacyModel: {}, ImageModel: {}, authenticate })
  assert.equal((await request(app).get('/api/admin/legacy')).status, 401)
  assert.equal((await request(app).post('/api/admin/legacy')).status, 401)
})
