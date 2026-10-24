import assert from 'node:assert/strict'
import test from 'node:test'
import mongoose from 'mongoose'
import { Event, Registration } from './events-model.js'

const uri = process.env.EVENTS_TEST_MONGODB_URI
if (!uri) throw new Error('EVENTS_TEST_MONGODB_URI is required; refusing to run integration tests')
const databaseName = new URL(uri).pathname.replace(/^\/+/, '')
if (!databaseName.endsWith('_test')) throw new Error('EVENTS_TEST_MONGODB_URI database name must end in _test')

test.before(async () => mongoose.connect(uri))
test.after(async () => mongoose.disconnect())

test('registration unique index is scoped to event and headcount is a student count', async () => {
  await Event.deleteMany({ title: /^stage-one-/ }); await Registration.deleteMany({})
  const event = await Event.create({ title: `stage-one-${Date.now()}`, description: 'Test', image: '/event.jpg', eventDate: '2099-12-20', time: '10:00', venue: 'MITS', allowedYears: [1], seatLimit: 50, closingAt: new Date('2099-12-20T10:00:00Z'), participation: 'group', minTeamSize: 4, maxTeamSize: 6, collegeOnly: false, published: true })
  await Registration.create({ event: event._id, fullName: 'Leader', email: 'leader@example.com', mobile: '9876543210', department: 'CSA', year: 1, collegeId: 'L1', collegeName: 'College', teamName: 'Team', members: [{ fullName: 'M1', department: 'CSA', year: 1, collegeId: 'M1' }, { fullName: 'M2', department: 'CSA', year: 1, collegeId: 'M2' }, { fullName: 'M3', department: 'CSA', year: 1, collegeId: 'M3' }], headcount: 4 })
  assert.equal(await Registration.aggregate([{ $match: { event: event._id } }, { $group: { _id: null, seats: { $sum: '$headcount' } } }]).then((rows) => rows[0].seats), 4)
  await Registration.deleteMany({ event: event._id }); await Event.deleteOne({ _id: event._id })
})
