import assert from 'node:assert/strict'
import test from 'node:test'
import { eventEndUtc, eventSchema, formatIndiaDateTime, publicEvent, registrationSchemaFor, registrationState } from './event-utils.js'

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

test('event validation accepts site image paths and rejects invalid dates', () => {
  assert.equal(eventSchema.safeParse(event()).success, true)
  assert.equal(eventSchema.safeParse(event({ image: '//cdn.example.com/a.jpg' })).success, false)
  assert.equal(eventSchema.safeParse(event({ eventDate: '2099-02-29' })).success, false)
  assert.equal(eventEndUtc('2026-12-20').toISOString(), '2026-12-20T18:29:59.999Z')
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
