import assert from 'node:assert/strict'
import test from 'node:test'
import mongoose from 'mongoose'
import { Event, Registration } from './events-model.js'
import { reserveSeat } from './event-routes.js'

const uri = process.env.EVENTS_TEST_MONGODB_URI
if (!uri) throw new Error('EVENTS_TEST_MONGODB_URI is required; refusing to run integration tests')
const databaseName = new URL(uri).pathname.replace(/^\/+/, '')
if (!databaseName.endsWith('_test')) throw new Error('EVENTS_TEST_MONGODB_URI database name must end with _test')

test('MongoDB atomic seat reservation never oversells and counter matches confirmed registrations', async (t) => {
  await mongoose.connect(uri)
  const marker = `integration-${Date.now()}`
  let event
  try {
    event = await Event.create({
      slug: marker, category: 'test', title: 'Test', tagline: 'Test', description: 'Test',
      image: 'https://example.com/test.jpg', eventDate: '2099-12-20', time: 'all day',
      venue: 'Test', location: 'Test', address: 'Test', entryFee: '0', eventType: 'Test',
      eligibility: 'Test', venueDescription: 'Test', seatLimit: 1,
      closingAt: new Date('2099-12-20T18:29:59.999Z'), registrationOpen: true, published: true,
    })
    const results = await Promise.all(Array.from({ length: 20 }, () => reserveSeat(Event, event)))
    assert.equal(results.filter(Boolean).length, 1)
    await Registration.create({
      event: event._id, activeEmail: `${event._id}:integration@example.com`,
      fullName: 'Integration Test', email: 'integration@example.com', phone: '1234567890',
      college: 'Test College', participantType: 'Individual', participantCount: 1,
      termsAccepted: true, status: 'confirmed', registrationId: `${marker}-1`,
    })
    const registrations = await Registration.countDocuments({ event: event._id, status: 'confirmed' })
    assert.equal(registrations, 1)
    const stored = await Event.findById(event._id)
    assert.equal(stored.confirmedCount, registrations)
  } finally {
    if (event) {
      await Registration.deleteMany({ event: event._id })
      await Event.deleteOne({ _id: event._id })
    }
    await mongoose.disconnect()
  }
})
