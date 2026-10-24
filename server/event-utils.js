import { z } from 'zod'

export const DEPARTMENTS = ['CSA', 'CSB', 'AI', 'AIDS', 'MECH', 'CIVIL', 'EC', 'EEE', 'CYBER', 'VLSI']
export const COLLEGE_ID_PATTERN = /^\d{2}[A-Z]{1,6}\d{1,4}$/
export const limits = {
  title: 180, description: 3000, time: 80, venue: 180, name: 120, email: 254,
  mobile: 10, department: 60, collegeId: 30, collegeName: 160, teamName: 80,
}

const text = (max) => z.string().trim().min(1).max(max)
const image = z.string().trim().refine((value) => /^https?:\/\/[^\s]+$/i.test(value) || /^\/[^/][^\s]*$/.test(value), 'Image must be an http(s) URL or a site path beginning with /.')
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const eventSchema = z.object({
  title: text(limits.title), description: text(limits.description), image,
  eventDate: z.string().regex(datePattern), time: text(limits.time), venue: text(limits.venue),
  allowedYears: z.array(z.number().int().min(1).max(4)).min(1).max(4).refine((years) => new Set(years).size === years.length, 'Allowed years must be unique.'),
  seatLimit: z.number().int().min(1).max(100000), closingAt: z.coerce.date(),
  published: z.boolean().default(false), participation: z.enum(['individual', 'group']),
  minTeamSize: z.number().int().min(2).max(20).optional(),
  maxTeamSize: z.number().int().min(2).max(20).optional(),
  collegeOnly: z.boolean().default(true),
}).strict().superRefine(validateEvent)

export const eventUpdateSchema = eventSchema

function validateEvent(value, context) {
  const parsedDate = new Date(`${value.eventDate}T00:00:00.000Z`)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value.eventDate) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['eventDate'], message: 'Event date must be a real calendar date.' })
  }
  if (value.closingAt.getTime() > eventEndUtc(value.eventDate).getTime()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['closingAt'], message: 'Closing time cannot be later than the end of the event date.' })
  }
  if (value.participation === 'individual' && (value.minTeamSize !== undefined || value.maxTeamSize !== undefined)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['minTeamSize'], message: 'Team sizes are only allowed for group events.' })
  }
  if (value.participation === 'group') {
    if (value.minTeamSize === undefined) context.addIssue({ code: z.ZodIssueCode.custom, path: ['minTeamSize'], message: 'Minimum team size is required for group events.' })
    if (value.maxTeamSize === undefined) context.addIssue({ code: z.ZodIssueCode.custom, path: ['maxTeamSize'], message: 'Maximum team size is required for group events.' })
    if (value.minTeamSize !== undefined && value.maxTeamSize !== undefined && value.maxTeamSize < value.minTeamSize) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['maxTeamSize'], message: 'Maximum team size must be at least the minimum.' })
    }
  }
}

export function eventEndUtc(eventDate) { return new Date(`${eventDate}T18:29:59.999Z`) }
export function isEnded(event) { return eventEndUtc(event.eventDate).getTime() < Date.now() }
export function validateEventDates(eventDate, closingAt) { return closingAt.getTime() <= eventEndUtc(eventDate).getTime() }

export function registrationState(event, seatsUsed = 0) {
  if (isEnded(event)) return 'ended'
  const minimum = event.participation === 'group' ? event.minTeamSize : 1
  if (!event.published || event.closingAt.getTime() <= Date.now() || event.seatLimit - seatsUsed < minimum) return 'closed'
  return 'open'
}

export function formatIndiaDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    hour12: true, timeZone: 'Asia/Kolkata',
  }).format(new Date(value)).replace(',', '') + ' IST'
}

export function publicEvent(event, seatsUsed = 0) {
  return {
    id: String(event._id), title: event.title, description: event.description, image: event.image,
    eventDate: event.eventDate, time: event.time, venue: event.venue, allowedYears: event.allowedYears,
    participation: event.participation, minTeamSize: event.minTeamSize, maxTeamSize: event.maxTeamSize,
    collegeOnly: event.collegeOnly, seatLimit: event.seatLimit, seatsLeft: Math.max(0, event.seatLimit - seatsUsed),
    closingAt: event.closingAt, registrationState: registrationState(event, seatsUsed),
  }
}

const mobileSchema = z.string().trim().regex(/^(?:\+91)?[6-9]\d{9}$/).transform((value) => value.slice(-10))
const baseRegistration = z.object({
  fullName: text(limits.name), email: z.string().trim().email().max(limits.email).transform((value) => value.toLowerCase()),
  mobile: mobileSchema, department: text(limits.department).optional(), year: z.number().int().min(1).max(4),
  collegeId: text(limits.collegeId).transform((value) => value.toUpperCase()).optional(),
  collegeName: text(limits.collegeName).optional(), teamName: text(limits.teamName).optional(),
  members: z.array(z.object({
    fullName: text(limits.name), department: text(limits.department).optional(), year: z.number().int().min(1).max(4),
    collegeId: text(limits.collegeId).transform((value) => value.toUpperCase()).optional(),
  }).strict()).optional(), website: z.string().optional(),
}).strict()

export function registrationSchemaFor(event, { partial = false } = {}) {
  const schema = partial ? baseRegistration.partial() : baseRegistration
  return schema.superRefine((value, context) => {
    const add = (path, message) => context.addIssue({ code: z.ZodIssueCode.custom, path, message })
    if (event.collegeOnly) {
      if (!value.email?.toLowerCase().endsWith('@mgits.ac.in')) add(['email'], 'College events require an @mgits.ac.in email.')
      if (!value.department) add(['department'], 'Department is required.')
      if (value.department && !DEPARTMENTS.includes(value.department)) add(['department'], 'Select a valid department.')
      if (!value.collegeId) add(['collegeId'], 'College ID is required.')
      if (value.collegeId && !COLLEGE_ID_PATTERN.test(value.collegeId)) add(['collegeId'], 'College ID is invalid.')
      if (value.collegeName !== undefined) add(['collegeName'], 'College name is not allowed for college-only events.')
    }
    if (!event.collegeOnly && value.collegeName === undefined && !partial) add(['collegeName'], 'College name is required.')
    if (event.participation === 'individual') {
      if (value.teamName !== undefined) add(['teamName'], 'Team name is not allowed for individual events.')
      if (value.members !== undefined) add(['members'], 'Members are not allowed for individual events.')
    }
    if (event.participation === 'group' && !partial) {
      if (!value.teamName) add(['teamName'], 'Team name is required for group events.')
      const members = value.members || []
      const count = 1 + members.length
      if (count < event.minTeamSize || count > event.maxTeamSize) add(['members'], `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}.`)
      const ids = [value.collegeId, ...members.map((member) => member.collegeId)].filter(Boolean)
      if (new Set(ids).size !== ids.length) add(['members'], 'College IDs must be unique within a team.')
    }
    if (value.year && !event.allowedYears.includes(value.year)) add(['year'], `${value.fullName || 'Leader'} has selected an unavailable year.`)
    for (const member of value.members || []) if (!event.allowedYears.includes(member.year)) add(['members'], `${member.fullName} has selected an unavailable year.`)
  })
}

export const registrationSchema = baseRegistration
