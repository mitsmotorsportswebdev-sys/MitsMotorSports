import assert from 'node:assert/strict'
import test from 'node:test'
import express from 'express'
import ExcelJS from 'exceljs'
import mongoose from 'mongoose'
import request from 'supertest'
import { Event, Registration } from './events-model.js'
import { mountEventRoutes } from './event-routes.js'

const uri = process.env.EVENTS_TEST_MONGODB_URI
if (!uri) throw new Error('EVENTS_TEST_MONGODB_URI is required; refusing to run integration tests')
const databaseName = new URL(uri).pathname.replace(/^\/+/, '')
if (!databaseName.endsWith('_test')) throw new Error('EVENTS_TEST_MONGODB_URI database name must end in _test')

const config = { registrationRateWindowMs: 600_000, registrationRateLimit: 1000, retentionDays: 90 }
const app = express()
app.use(express.json())
mountEventRoutes(app, { Event, Registration, config, authenticate: (_request, _response, next) => next() })
const api = request(app)

test.before(async () => mongoose.connect(uri))
test.beforeEach(async () => {
  await Registration.deleteMany({})
  await Event.deleteMany({ title: /^integration-/ })
})
test.after(async () => mongoose.disconnect())

function eventData(overrides = {}) {
  return {
    title: `integration-${Date.now()}-${Math.random()}`,
    description: 'Test',
    image: '/event.jpg',
    eventDate: '2099-12-20',
    time: '10:00',
    venue: 'MITS',
    allowedYears: [1],
    seatLimit: 50,
    closingAt: new Date('2099-12-20T10:00:00Z'),
    participation: 'individual',
    collegeOnly: false,
    published: true,
    ...overrides,
  }
}

function registration(email, overrides = {}) {
  return {
    fullName: 'Student',
    email,
    mobile: '9876543210',
    department: 'CSA',
    year: 1,
    collegeId: `21CS${Math.floor(Math.random() * 9000 + 1000)}`,
    collegeName: 'College',
    ...overrides,
  }
}

async function createEvent(overrides) {
  return Event.create(eventData(overrides))
}

async function register(event, data) {
  return api.post(`/api/events/${event._id}/registrations`).send(data)
}

async function registerOk(event, data) {
  const response = await register(event, data)
  assert.equal(response.status, 201, `registration failed: ${JSON.stringify(response.body)}`)
  return response
}

function admin(path, method = 'get') {
  return api[method](`/api/admin${path}`)
}

test('registration unique index is scoped to event and headcount is a student count', async () => {
  const event = await createEvent({ participation: 'group', minTeamSize: 4, maxTeamSize: 6 })
  await Registration.create({ event: event._id, fullName: 'Leader', email: 'leader@example.com', mobile: '9876543210', department: 'CSA', year: 1, collegeId: 'L1', collegeName: 'College', teamName: 'Team', members: [{ fullName: 'M1', department: 'CSA', year: 1, collegeId: 'M1' }, { fullName: 'M2', department: 'CSA', year: 1, collegeId: 'M2' }, { fullName: 'M3', department: 'CSA', year: 1, collegeId: 'M3' }], headcount: 4 })
  assert.equal((await Registration.aggregate([{ $match: { event: event._id } }, { $group: { _id: null, seats: { $sum: '$headcount' } } }]))[0].seats, 4)
})

test('new registrations expire after the configured retention period', async () => {
  const event = await createEvent()
  const response = await registerOk(event, registration('expiry@example.com'))
  assert.equal((await Registration.findById(response.body.data.id)).expireAt.toISOString(), '2100-03-20T18:29:59.999Z')
})

test('editing the event date moves registration expiry', async () => {
  const event = await createEvent()
  const response = await registerOk(event, registration('move-expiry@example.com'))
  await api.patch(`/api/admin/events/${event._id}`).send(eventData({ title: event.title, eventDate: '2099-12-25' }))
  assert.equal((await Registration.findById(response.body.data.id)).expireAt.toISOString(), '2100-03-25T18:29:59.999Z')
})

test('refresh expiry backfills registrations without an expiry', async () => {
  const event = await createEvent()
  const row = await Registration.create({ event: event._id, ...registration('backfill@example.com'), headcount: 1 })
  await Registration.updateOne({ _id: row._id }, { $unset: { expireAt: 1 } })
  const { refreshExpiry } = await import('./refresh-expiry.js')
  await refreshExpiry({ EventModel: Event, RegistrationModel: Registration, retentionDays: config.retentionDays })
  assert.equal((await Registration.findById(row._id)).expireAt.toISOString(), '2100-03-20T18:29:59.999Z')
})

test('registrations have a zero-second TTL index', async () => {
  const indexes = await Registration.collection.indexes()
  assert.ok(indexes.some((index) => index.key.expireAt === 1 && index.expireAfterSeconds === 0))
})

test('concurrent duplicate registrations are scoped to an event', async () => {
  const first = await createEvent()
  const second = await createEvent()
  const results = await Promise.all([register(first, registration('same@example.com')), register(first, registration('same@example.com'))])
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409])
  assert.equal((await register(second, registration('same@example.com'))).status, 201)
})

test('concurrent individual registrations never exceed the seat limit', async () => {
  const event = await createEvent({ seatLimit: 5 })
  const results = await Promise.all(Array.from({ length: 12 }, (_, index) => register(event, registration(`student${index}@example.com`))))
  assert.equal(results.filter((result) => result.status === 201).length, 5)
  assert.equal(results.filter((result) => result.status === 409 && result.body.message === 'Registration is closed.').length, 7)
  assert.equal((await Registration.aggregate([{ $group: { _id: null, count: { $sum: '$headcount' } } }]))[0].count, 5)
})

test('group registration capacity accounts for team sizes', async () => {
  const event = await createEvent({ participation: 'group', seatLimit: 10, minTeamSize: 2, maxTeamSize: 4 })
  const team = (email, size, n) => registration(email, { teamName: `Team ${n}`, members: Array.from({ length: size - 1 }, (_, i) => ({ fullName: `Member ${i}`, department: 'CSA', year: 1, collegeId: `22CS${n}${i}` })) })
  assert.equal((await register(event, team('a@example.com', 4, 1))).status, 201)
  assert.equal((await register(event, team('b@example.com', 4, 2))).status, 201)
  assert.equal((await register(event, team('c@example.com', 4, 3))).body.message, 'Only 2 seats left.')
  assert.equal((await register(event, team('d@example.com', 2, 4))).status, 201)
  assert.equal((await api.get(`/api/events/${event._id}`)).body.data.registrationState, 'closed')
})

test('removing a registration frees seats and reopens the event', async () => {
  const event = await createEvent({ seatLimit: 1 })
  const result = await register(event, registration('remove@example.com'))
  assert.equal((await api.get(`/api/events/${event._id}`)).body.data.registrationState, 'closed')
  assert.equal((await admin(`/registrations/${result.body.data.id}`, 'delete').send({ confirm: true })).status, 200)
  assert.equal((await api.get(`/api/events/${event._id}`)).body.data.registrationState, 'open')
})

test('manual registration closure blocks and reopening restores registrations', async () => {
  const event = await createEvent()
  assert.equal((await admin(`/events/${event._id}/registration`, 'patch').send({ open: false })).status, 200)
  assert.equal((await register(event, registration('closed@example.com'))).body.message, 'Registration is closed.')
  assert.equal((await api.get(`/api/events/${event._id}`)).body.data.registrationState, 'closed')
  assert.equal((await admin(`/events/${event._id}/registration`, 'patch').send({ open: true })).status, 200)
  assert.equal((await register(event, registration('reopened@example.com'))).status, 201)
})

test('approve and approve-all affect only pending registrations of the selected event', async () => {
  const event = await createEvent()
  const other = await createEvent()
  const a = await register(event, registration('a@example.com'))
  const b = await register(event, registration('b@example.com'))
  const c = await register(other, registration('c@example.com'))
  await admin(`/registrations/${a.body.data.id}/approve`, 'post')
  await admin(`/events/${event._id}/approve-all`, 'post')
  assert.deepEqual((await Registration.find({ _id: { $in: [a.body.data.id, b.body.data.id, c.body.data.id] } }).sort({ email: 1 })).map((row) => row.status), ['approved', 'approved', 'pending'])
})

test('deleting an event removes only its registrations', async () => {
  const event = await createEvent()
  const other = await createEvent()
  await register(event, registration('delete@example.com'))
  await register(other, registration('keep@example.com'))
  await admin(`/events/${event._id}`, 'delete').send({ confirm: true })
  assert.equal(await Registration.countDocuments({ event: event._id }), 0)
  assert.equal(await Registration.countDocuments({ event: other._id }), 1)
})

test('export includes approved people and optionally pending rows', async () => {
  const event = await createEvent({ title: 'integration-=formula', participation: 'group', minTeamSize: 2, maxTeamSize: 4 })
  const approved = await registerOk(event, registration('leader@example.com', { fullName: '=Leader', teamName: 'Team', members: [{ fullName: 'Member', year: 1, collegeId: '22CS1234' }] }))
  await registerOk(event, registration('pending@example.com', { fullName: 'Pending', teamName: 'Pending Team', members: [{ fullName: 'Pending Member', year: 1, collegeId: '22CS5678' }] }))
  assert.ok(approved.body.data?.id, 'registration-create response missing body.data.id')
  await admin(`/registrations/${approved.body.data.id}/approve`, 'post')
  const parse = async (includePending) => {
    const response = await api.get(`/api/admin/events/${event._id}/export${includePending ? '?includePending=true' : ''}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => callback(null, Buffer.concat(chunks)))
      })
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(response.body)
    return workbook.worksheets[0]
  }
  const approvedSheet = await parse(false)
  assert.equal(approvedSheet.rowCount, 3)
  assert.equal(approvedSheet.getRow(2).getCell(3).value, "'=Leader")
  assert.equal(approvedSheet.getRow(3).getCell(4).value, '')
  assert.equal((await parse(true)).getRow(1).values.includes('Status'), true)
  assert.equal((await parse(true)).rowCount, 5)
})

test('participation and college-only settings cannot change after registration', async () => {
  const event = await createEvent()
  await register(event, registration('change@example.com'))
  const update = eventData({ title: event.title, participation: 'group', minTeamSize: 2, maxTeamSize: 4 })
  assert.equal((await api.patch(`/api/admin/events/${event._id}`).send(update)).status, 409)
  assert.equal((await api.patch(`/api/admin/events/${event._id}`).send(eventData({ title: event.title, collegeOnly: true }))).status, 409)
})

test('ended events are hidden from listing but available by id', async () => {
  const event = await createEvent({ eventDate: '2000-01-01', closingAt: new Date('2000-01-01T10:00:00Z') })
  assert.equal((await api.get('/api/events')).body.data.some((item) => item.id === String(event._id)), false)
  const response = await api.get(`/api/events/${event._id}`)
  assert.equal(response.body.data.registrationState, 'ended')
})
