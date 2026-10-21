import { z } from 'zod'

export const limits = {
  name: 120,
  email: 254,
  phone: 20,
  college: 160,
  teamName: 160,
  experience: 120,
  requirements: 1000,
  participantCount: { min: 1, max: 100 },
}

const text = (max) => z.string().trim().max(max)
export const registrationSchema = z.object({
  fullName: text(limits.name).min(1),
  email: z.string().trim().email().max(limits.email),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{8,18}$/).max(limits.phone),
  college: text(limits.college).min(1),
  teamName: text(limits.teamName),
  participantType: z.enum(['Individual', 'Team', 'Club/Organization']),
  participantCount: z.coerce.number().int().min(limits.participantCount.min).max(limits.participantCount.max),
  experience: text(limits.experience),
  requirements: text(limits.requirements),
  termsAccepted: z.literal(true),
  turnstileToken: z.string().trim().min(1).max(2048),
}).strict()

const list = z.array(text(500)).max(100)
const schedule = z.array(z.object({
  time: text(40).min(1),
  title: text(160).min(1),
  description: text(500).min(1),
}).strict()).max(100)

const eventBaseSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: text(120).min(1), title: text(180).min(1), tagline: text(240).min(1),
  description: text(3000).min(1), image: z.string().trim().url(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: text(80).min(1),
  venue: text(180).min(1), location: text(180).min(1), address: text(300).min(1),
  entryFee: text(80).min(1), eventType: text(120).min(1), eligibility: text(300).min(1),
  highlights: list, rules: list, eligibilityDetails: list, schedule, venueDescription: text(1000).min(1),
  seatLimit: z.number().int().min(1).max(100000),
  closingAt: z.coerce.date(), registrationOpen: z.boolean(), published: z.boolean(),
}).strict()

function withEventDateValidation(schema) {
  return schema.superRefine((value, context) => {
  const parsedDate = new Date(`${value.eventDate}T00:00:00.000Z`)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value.eventDate) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['eventDate'], message: 'Event date must be a real calendar date.' })
  }
  if (!validateEventDates(value.eventDate, value.closingAt)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['closingAt'], message: 'Closing time cannot be later than the end of the event date.' })
  }
  })
}

export const eventSchema = withEventDateValidation(eventBaseSchema)
export const eventUpdateSchema = withEventDateValidation(eventBaseSchema.omit({ slug: true }))

export function eventEndUtc(eventDate) {
  return new Date(`${eventDate}T18:29:59.999Z`)
}

export function isEnded(event) {
  return eventEndUtc(event.eventDate).getTime() < Date.now()
}

export function registrationState(event) {
  if (isEnded(event)) return 'ended'
  if (!event.published || !event.registrationOpen || event.closingAt.getTime() <= Date.now()) return 'closed'
  if (event.confirmedCount >= event.seatLimit) return 'full-waiting-list'
  return 'open'
}

export function validateEventDates(eventDate, closingAt) {
  return closingAt.getTime() <= eventEndUtc(eventDate).getTime()
}

export function publicEvent(event) {
  const state = registrationState(event)
  return {
    slug: event.slug, category: event.category, title: event.title, tagline: event.tagline,
    description: event.description, image: event.image, date: event.eventDate, time: event.time,
    venue: event.venue, location: event.location, address: event.address, entryFee: event.entryFee,
    eventType: event.eventType, eligibility: event.eligibility, highlights: event.highlights,
    rules: event.rules, eligibilityDetails: event.eligibilityDetails, schedule: event.schedule,
    venueDescription: event.venueDescription, seatLimit: event.seatLimit,
    seatsLeft: Math.max(0, event.seatLimit - event.confirmedCount),
    closingAt: event.closingAt, registrationState: state, ended: state === 'ended',
  }
}
