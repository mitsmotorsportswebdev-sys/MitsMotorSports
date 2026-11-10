import assert from 'node:assert/strict'
import test from 'node:test'
import { eventEndUtc, eventSchema, formatIndiaDateTime, publicEvent, registrationExpiry, registrationSchemaFor, registrationState } from './event-utils.js'
import { loadConfig } from './config.js'

const event = (overrides = {}) => ({
  title: 'Test event', description: 'Description',
  image: '/images/event.jpg', eventDate: '2099-12-20', time: '10:00',
  venue: 'MITS', allowedYears: [1, 2, 3, 4], seatLimit: 50,
  closingAt: new Date('2099-12-20T10:00:00.000Z'), published: true,
  participation: 'individual', collegeOnly: true, ...overrides,
})

const leader = (overrides = {}) => ({
  fullName: 'A Student', email: 'student@mgits.ac.in', mobile: '+919876543210',
  department: 'CSA', year: 1, collegeId: '22CSA1', ...overrides,
})

test('event validation accepts secure image URLs and site paths', () => {
  assert.equal(eventSchema.safeParse(event()).success, true)
  assert.equal(eventSchema.safeParse(event({ image: '//cdn.example.com/a.jpg' })).success, false)
  assert.equal(eventSchema.safeParse(event({ image: 'http://cdn.example.com/a.jpg' })).success, false)
  assert.equal(eventSchema.safeParse(event({ image: 'https://cdn.example.com/a.jpg' })).success, true)
  assert.equal(eventSchema.safeParse(event({ image: '/images/event.jpg' })).success, true)
  assert.equal(eventSchema.safeParse(event({ image: '//cdn.example.com/a.jpg' })).success, false)
  assert.equal(eventSchema.safeParse(event({ image: `/${'a'.repeat(500)}` })).success, true)
  assert.equal(eventSchema.safeParse(event({ image: `/${'a'.repeat(501)}` })).success, false)
  assert.equal(eventSchema.safeParse(event({ eventDate: '2099-02-29' })).success, false)
  assert.equal(eventEndUtc('2026-12-20').toISOString(), '2026-12-20T18:29:59.999Z')
})

test('registration expiry is the India event end plus retention days', () => {
  assert.equal(registrationExpiry('2026-12-20', 90).toISOString(), '2027-03-20T18:29:59.999Z')
})

test('registration retention config validates its range', () => {
  const base = { MONGODB_URI: 'mongodb://localhost/test', JWT_SECRET: 'a'.repeat(32), CLIENT_URL: 'http://localhost', ADMIN_EMAIL: 'admin@example.com' }
  assert.equal(loadConfig(base).retentionDays, 90)
  assert.equal(loadConfig({ ...base, REGISTRATION_RETENTION_DAYS: '3650' }).retentionDays, 3650)
  assert.throws(() => loadConfig({ ...base, REGISTRATION_RETENTION_DAYS: '0' }), /REGISTRATION_RETENTION_DAYS/)
  assert.throws(() => loadConfig({ ...base, REGISTRATION_RETENTION_DAYS: '90.5' }), /REGISTRATION_RETENTION_DAYS/)
})

test('college email, department, and college ID rules are enforced', () => {
  const schema = registrationSchemaFor(event())
  assert.equal(schema.safeParse(leader()).success, true)
  assert.equal(schema.safeParse(leader({ email: 'student@example.com' })).success, false)
  assert.equal(schema.safeParse(leader({ department: 'BIO' })).success, false)
  assert.equal(schema.safeParse(leader({ collegeId: 'bad' })).success, false)
})

test('non-college events accept other emails and require college name', () => {
  const schema = registrationSchemaFor(event({ collegeOnly: false }))
  assert.equal(schema.safeParse(leader({ email: 'student@example.com', collegeName: 'Other College', department: 'Biology', collegeId: 'ABC' })).success, true)
  assert.equal(schema.safeParse(leader({ email: 'student@example.com', department: 'Biology', collegeId: 'ABC' })).success, false)
})

test('years, individual members, and group team constraints are enforced', () => {
  assert.equal(registrationSchemaFor(event({ allowedYears: [2] })).safeParse(leader()).success, false)
  assert.equal(registrationSchemaFor(event()).safeParse(leader({ members: [] })).success, false)
  const group = event({ participation: 'group', minTeamSize: 2, maxTeamSize: 3 })
  const member = { fullName: 'Member', department: 'CSB', year: 1, collegeId: '22CSB1' }
  assert.equal(registrationSchemaFor(group).safeParse({ ...leader(), teamName: 'Team', members: [member] }).success, true)
  assert.equal(registrationSchemaFor(group).safeParse({ ...leader(), teamName: 'Team', members: [] }).success, false)
  assert.equal(registrationSchemaFor(group).safeParse({ ...leader(), teamName: 'Team', members: [member, { ...member, fullName: 'Member 2' }] }).success, false)
  assert.equal(registrationSchemaFor(group).safeParse({ ...leader(), teamName: 'Team', members: [{ ...member, collegeId: '22CSA1' }] }).success, false)
})

test('registration state uses student seats and the India event end', () => {
  assert.equal(registrationState(event(), 46), 'open')
  assert.equal(registrationState(event({ participation: 'group', minTeamSize: 4, maxTeamSize: 6 }), 47), 'closed')
  assert.equal(registrationState(event({ eventDate: '2000-01-01' }), 0), 'ended')
  assert.equal(publicEvent(event(), 46).seatsLeft, 4)
  assert.match(formatIndiaDateTime(new Date('2026-10-22T10:00:00Z')), /IST$/)
})

test('manual registration closure takes precedence except for ended events', () => {
  assert.equal(registrationState(event({ registrationOpen: false }), 0), 'closed')
  assert.equal(registrationState(event({ registrationOpen: false, eventDate: '2000-01-01' }), 0), 'ended')
})
