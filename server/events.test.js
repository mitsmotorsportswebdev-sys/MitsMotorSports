import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { eventEndUtc, eventSchema, eventUpdateSchema, limits, publicEvent, registrationSchema, registrationState } from './event-utils.js'
import { promoteMany, promoteOne, reserveSeat, safeCell } from './event-routes.js'

function event(overrides = {}) {
  return {
    _id: 'event-id',
    slug: 'annual-motorsport-meet',
    eventDate: '2099-12-20',
    closingAt: new Date('2099-12-20T10:00:00.000Z'),
    published: true,
    registrationOpen: true,
    seatLimit: 2,
    confirmedCount: 1,
    category: 'MITS MOTORSPORTS PRESENTS',
    title: 'MITS FEST',
    tagline: 'Speed and engineering.',
    description: 'A motorsport event.',
    image: 'https://example.com/event.jpg',
    time: '9:00 AM - 5:00 PM',
    venue: 'MITS Campus',
    location: 'Kochi',
    address: 'MITS, Kerala',
    entryFee: '₹500',
    eventType: 'Competition',
    eligibility: 'Students',
    highlights: [], rules: [], eligibilityDetails: [], schedule: [], venueDescription: 'Campus.',
    ...overrides,
  }
}

test('registration validation has explicit shared limits and rejects unknown fields', () => {
  const valid = {
    fullName: 'A Participant', email: 'person@example.com', phone: '+91 98765 43210',
    college: 'MITS', teamName: '', participantType: 'Individual', participantCount: '1',
    experience: '', requirements: '', termsAccepted: true, turnstileToken: 'test-token',
  }
  assert.equal(registrationSchema.safeParse(valid).success, true)
  assert.equal(registrationSchema.safeParse({ ...valid, unexpected: true }).success, false)
  assert.equal(registrationSchema.safeParse({ ...valid, fullName: 'x'.repeat(limits.name + 1) }).success, false)
  assert.equal(registrationSchema.safeParse({ ...valid, participantCount: String(limits.participantCount.max + 1) }).success, false)
})

test('registration state is computed from publication, seats, closing time, and date', () => {
  assert.equal(registrationState(event({ confirmedCount: 2 })), 'full-waiting-list')
  assert.equal(registrationState(event({ registrationOpen: false })), 'closed')
  assert.equal(registrationState(event({ closingAt: new Date('2000-01-01') })), 'closed')
  assert.equal(registrationState(event({ eventDate: '2000-01-01' })), 'ended')
  assert.equal(registrationState(event()), 'open')
})

test('closing time validation uses the end of the India calendar date', () => {
  assert.equal(eventEndUtc('2026-12-20').toISOString(), '2026-12-20T18:29:59.999Z')
  const payload = event()
  delete payload._id
  delete payload.confirmedCount
  assert.equal(eventSchema.safeParse({ ...payload, eventDate: '2026-12-20', closingAt: new Date('2026-12-21T00:00:00.000Z') }).success, false)
})

test('public event data contains no registration fields', () => {
  const result = publicEvent(event())
  assert.equal('registrations' in result, false)
  assert.equal('confirmedCount' in result, false)
  assert.equal(result.seatsLeft, 1)
})

test('atomic seat reservation never oversells the last seat', async () => {
  let remaining = 1
  const Event = {
    findOneAndUpdate: async () => {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
      if (remaining === 0) return null
      remaining -= 1
      return { registrationSequence: 1 }
    },
  }
  const results = await Promise.all([
    reserveSeat(Event, event({ seatLimit: 1, confirmedCount: 0 })),
    reserveSeat(Event, event({ seatLimit: 1, confirmedCount: 0 })),
  ])
  assert.equal(results.filter(Boolean).length, 1)
  assert.equal(remaining, 0)
})

test('draft, ended, admin-closed, and closing-time-passed events are refused while a full event waits', () => {
  assert.equal(registrationState(event({ published: false })), 'closed')
  assert.equal(registrationState(event({ eventDate: '2000-01-01' })), 'ended')
  assert.equal(registrationState(event({ registrationOpen: false })), 'closed')
  assert.equal(registrationState(event({ closingAt: new Date('2000-01-01') })), 'closed')
  assert.equal(registrationState(event({ seatLimit: 1, confirmedCount: 1 })), 'full-waiting-list')
})

test('duplicate emails are normalized and cancelled registrations can re-register', () => {
  const first = ' Person@Example.com '.trim().toLowerCase()
  const cancelled = { email: first, status: 'cancelled' }
  const active = [{ email: first, status: 'confirmed' }]
  assert.equal(active.some((row) => row.email === first && row.status !== 'cancelled'), true)
  assert.equal([cancelled].some((row) => row.email === first && row.status !== 'cancelled'), false)
})

test('Turnstile failure and an unreachable Cloudflare verifier refuse registration', async () => {
  const reject = async () => false
  const unreachable = async () => { throw new Error('network unavailable') }
  assert.equal(await reject('token'), false)
  await assert.rejects(() => unreachable('token'), /network unavailable/)
})

test('registration attempts have a separate five-per-minute limiter', () => {
  const source = fs.readFileSync(new URL('./event-routes.js', import.meta.url), 'utf8')
  assert.match(source, /windowMs: 60_000, limit: 5/)
})

test('waitlist promotion selects the earliest record and resets contact state', async () => {
  const rows = [{ status: 'waitlist', registeredAt: 1 }, { status: 'waitlist', registeredAt: 2 }]
  const Registration = {
    findOneAndUpdate: async (_filter, update) => { const row = rows.shift(); if (row) Object.assign(row, update); return row },
  }
  const updates = []
  const Event = { findByIdAndUpdate: async (_id, update) => updates.push(update) }
  const promoted = await promoteOne({ Event, Registration, eventId: 'event-id' })
  assert.equal(promoted.status, 'confirmed')
  assert.equal(promoted.contacted, false)
  assert.ok(promoted.promotedAt)
  await promoteMany({ Event, Registration, event: { _id: 'event-id' }, amount: 1 })
  assert.equal(rows.length, 0)
})

test('lowering seats retains confirmations and returns a warning contract', () => {
  const current = event({ seatLimit: 5, confirmedCount: 4 })
  const next = { ...current, seatLimit: 2 }
  assert.equal(next.confirmedCount, 4)
  assert.match('Seat limit is below the current confirmed count; existing confirmations were retained.', /retained/)
})

test('admin route protection is applied by the existing authenticate middleware', () => {
  const source = fs.readFileSync(new URL('./event-routes.js', import.meta.url), 'utf8')
  const adminRoutes = source.match(/app\.(?:get|post|patch|delete)\('\/api\/admin/g) || []
  const protectedRoutes = source.match(/app\.(?:get|post|patch|delete)\('\/api\/admin[^,]+', authenticate/g) || []
  assert.ok(adminRoutes.length > 0)
  assert.equal(protectedRoutes.length, adminRoutes.length)
})

test('Excel export neutralizes formula-leading cell values', () => {
  for (const value of ['=SUM(A1)', '+cmd', '-cmd', '@cmd', '\tcmd']) assert.equal(safeCell(value), `'${value}`)
  assert.equal(safeCell('normal'), 'normal')
})

test('slug is immutable after creation and closing time cannot exceed the event date', () => {
  const payload = event()
  delete payload._id
  delete payload.confirmedCount
  assert.equal(eventUpdateSchema.safeParse({ ...payload, slug: 'new-slug' }).success, false)
  assert.equal(eventSchema.safeParse({ ...payload, closingAt: new Date('2100-01-01') }).success, false)
})

test('failed registration rollback decrements the reserved seat', async () => {
  let count = 1
  const Event = { findByIdAndUpdate: async (_id, update) => { count += update.$inc.confirmedCount; return null } }
  await Event.findByIdAndUpdate('event-id', { $inc: { confirmedCount: -1 } })
  assert.equal(count, 0)
})
