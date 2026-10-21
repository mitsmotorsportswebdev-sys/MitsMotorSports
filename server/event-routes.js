import crypto from 'node:crypto'
import ExcelJS from 'exceljs'
import rateLimit from 'express-rate-limit'
import { eventSchema, eventUpdateSchema, isEnded, publicEvent, registrationSchema, registrationState, validateEventDates } from './event-utils.js'

const adminEventSchema = eventSchema
const idSchema = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)

function error(response, status, message, fields) {
  return response.status(status).json({ success: false, message, ...(fields ? { fields } : {}) })
}

export function safeCell(value) {
  const text = String(value ?? '')
  return /^[=+\-@\t]/.test(text) ? `'${text}` : text
}

function registrationView(item, flags = {}) {
  return { ...item.toObject(), ...flags, event: String(item.event) }
}

export function mountEventRoutes(app, { Event, Registration, config, authenticate, verifyTurnstile = async () => false }) {
  app.use('/api/admin/events', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/registrations', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/needs-contacting', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  const registerLimiter = rateLimit({
    windowMs: 60_000, limit: 5, standardHeaders: true, legacyHeaders: false,
    message: { success: false, message: 'Too many registration attempts. Try again shortly.' },
  })

  app.get('/api/events', async (_request, response) => {
    const events = await Event.find({ published: true }).sort({ eventDate: 1 })
    return response.json({ success: true, data: events.filter((event) => !isEnded(event)).map(publicEvent) })
  })

  app.get('/api/events/:slug', async (request, response) => {
    const event = await Event.findOne({ slug: request.params.slug, published: true })
    if (!event) return error(response, 404, 'Event not found.')
    return response.json({ success: true, data: publicEvent(event) })
  })

  app.post('/api/events/:slug/registrations', registerLimiter, async (request, response) => {
    const event = await Event.findOne({ slug: request.params.slug, published: true })
    if (!event) return error(response, 404, 'Event not found.')
    if (registrationState(event) === 'ended' || registrationState(event) === 'closed') return error(response, 409, 'Registration is closed.')
    const parsed = registrationSchema.safeParse(request.body)
    if (!parsed.success) return error(response, 400, 'Please correct the highlighted fields.', parsed.error.flatten().fieldErrors)
    if (!(await verifyTurnstile(parsed.data.turnstileToken, request.ip))) return error(response, 400, 'Bot verification failed. Please try again.')
    const { turnstileToken: _turnstileToken, ...registrationData } = parsed.data
    const data = { ...registrationData, email: parsed.data.email.toLowerCase() }
    const duplicate = await Registration.findOne({ event: event._id, email: data.email, status: { $ne: 'cancelled' } })
    if (duplicate) return error(response, 409, 'This email is already registered for the event.')
    const confirmed = await reserveSeat(Event, event)
    const status = confirmed ? 'confirmed' : 'waitlist'
    const sequence = confirmed ? confirmed.registrationSequence : (await Event.findOneAndUpdate({ _id: event._id }, { $inc: { registrationSequence: 1 } }, { new: true })).registrationSequence
    try {
      const item = await Registration.create({ ...data, activeEmail: `${event._id}:${data.email}`, event: event._id, status, registrationId: `MMS-${String(sequence).padStart(4, '0')}` })
      return response.status(201).json({ success: true, data: { registrationId: item.registrationId, status: item.status } })
    } catch (createError) {
      if (confirmed) await Event.findByIdAndUpdate(event._id, { $inc: { confirmedCount: -1 } })
      if (createError.code === 11000) return error(response, 409, 'This email is already registered for the event.')
      throw createError
    }
  })

  app.get('/api/admin/events', authenticate, async (_request, response) => {
    const events = await Event.find({}).sort({ eventDate: -1 })
    const data = await Promise.all(events.map(async (event) => ({
      ...publicEvent(event), published: event.published, confirmedCount: event.confirmedCount,
      waitlistCount: await Registration.countDocuments({ event: event._id, status: 'waitlist' }),
      needsContactingCount: await Registration.countDocuments({ event: event._id, status: 'confirmed', contacted: false }),
    })))
    return response.json({ success: true, data })
  })

  app.post('/api/admin/events', authenticate, async (request, response) => {
    const parsed = adminEventSchema.safeParse(request.body)
    if (!parsed.success) return error(response, 400, 'Please correct the event fields.', parsed.error.flatten().fieldErrors)
    if (!validateEventDates(parsed.data.eventDate, parsed.data.closingAt)) return error(response, 400, 'Registration closing time cannot be later than the event date.')
    try { return response.status(201).json({ success: true, data: await Event.create(parsed.data) }) } catch (createError) {
      if (createError.code === 11000) return error(response, 409, 'That event slug already exists.')
      throw createError
    }
  })

  app.patch('/api/admin/events/:id', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid event.')
    const parsed = eventUpdateSchema.safeParse(request.body)
    if (!parsed.success) return error(response, 400, 'Please correct the event fields.', parsed.error.flatten().fieldErrors)
    if (!validateEventDates(parsed.data.eventDate, parsed.data.closingAt)) return error(response, 400, 'Registration closing time cannot be later than the event date.')
    const before = await Event.findById(request.params.id)
    const event = await Event.findByIdAndUpdate(request.params.id, parsed.data, { new: true, runValidators: true })
    if (!event) return error(response, 404, 'Event not found.')
    if (event.seatLimit > before.seatLimit) await promoteMany({ Event, Registration, event, amount: event.seatLimit - before.seatLimit })
    const warning = event.seatLimit < event.confirmedCount ? 'Seat limit is below the current confirmed count; existing confirmations were retained.' : undefined
    return response.json({ success: true, data: event, ...(warning ? { warning } : {}) })
  })

  app.delete('/api/admin/events/:id', authenticate, async (request, response) => {
    if (!idSchema(request.params.id) || request.body?.confirm !== true) return error(response, 400, 'Explicit confirmation is required.')
    const event = await Event.findById(request.params.id)
    if (!event) return error(response, 404, 'Event not found.')
    await Registration.deleteMany({ event: event._id }); await event.deleteOne()
    return response.json({ success: true })
  })

  app.get('/api/admin/events/:id/registrations', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid event.')
    const filter = { event: request.params.id }
    if (['confirmed', 'waitlist', 'cancelled'].includes(request.query.status)) filter.status = request.query.status
    if (request.query.status === 'needs-contacting') { filter.status = 'confirmed'; filter.contacted = false }
    const search = String(request.query.search || '').trim()
    if (search) filter.$or = ['fullName', 'email', 'phone', 'college'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }))
    const rows = await Registration.find(filter).sort({ registeredAt: 1 })
    const data = rows.map((row, index) => registrationView(row, {
      samePhone: rows.some((other, otherIndex) => otherIndex !== index && other.phone === row.phone),
      sameNameCollege: rows.some((other, otherIndex) => otherIndex !== index && other.fullName.toLowerCase() === row.fullName.toLowerCase() && other.college.toLowerCase() === row.college.toLowerCase()),
    }))
    return response.json({ success: true, data })
  })

  app.patch('/api/admin/registrations/:id', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid registration.')
    const allowed = registrationSchema.omit({ termsAccepted: true, turnstileToken: true }).partial().safeParse(request.body)
    if (!allowed.success) return error(response, 400, 'Please correct the registration fields.', allowed.error.flatten().fieldErrors)
    const update = { ...allowed.data }
    if (update.email) update.email = update.email.toLowerCase()
    const current = await Registration.findById(request.params.id)
    if (!current) return error(response, 404, 'Registration not found.')
    if (update.email) update.activeEmail = `${current.event}:${update.email}`
    const row = await Registration.findByIdAndUpdate(request.params.id, update, { new: true, runValidators: true })
    if (!row) return error(response, 404, 'Registration not found.')
    return response.json({ success: true, data: registrationView(row) })
  })

  app.post('/api/admin/registrations/:id/cancel', authenticate, async (request, response) => {
    const row = await Registration.findById(request.params.id)
    if (!row) return error(response, 404, 'Registration not found.')
    if (row.status === 'confirmed') await promoteOne({ Event, Registration, eventId: row.event })
    row.status = 'cancelled'; row.activeEmail = undefined; await row.save()
    return response.json({ success: true })
  })

  app.delete('/api/admin/registrations/:id', authenticate, async (request, response) => {
    if (request.body?.confirm !== true) return error(response, 400, 'Explicit confirmation is required.')
    const row = await Registration.findById(request.params.id)
    if (!row) return error(response, 404, 'Registration not found.')
    if (row.status === 'confirmed') await promoteOne({ Event, Registration, eventId: row.event })
    await row.deleteOne(); return response.json({ success: true })
  })

  app.post('/api/admin/registrations/:id/contacted', authenticate, async (request, response) => {
    const row = await Registration.findByIdAndUpdate(request.params.id, { contacted: true, contactedAt: new Date() }, { new: true })
    if (!row) return error(response, 404, 'Registration not found.')
    return response.json({ success: true, data: registrationView(row) })
  })

  app.post('/api/admin/registrations/:id/paid', authenticate, async (request, response) => {
    const paid = request.body?.paid === true ? 'paid' : 'not paid'
    const row = await Registration.findByIdAndUpdate(request.params.id, { paid }, { new: true })
    if (!row) return error(response, 404, 'Registration not found.')
    return response.json({ success: true, data: registrationView(row) })
  })

  app.delete('/api/admin/events/:id/registrations', authenticate, async (request, response) => {
    if (request.body?.confirm !== true) return error(response, 400, 'Explicit confirmation is required.')
    await Registration.deleteMany({ event: request.params.id }); await Event.findByIdAndUpdate(request.params.id, { confirmedCount: 0 })
    return response.json({ success: true })
  })

  app.post('/api/admin/events/:id/reconcile', authenticate, async (request, response) => {
    const event = await Event.findById(request.params.id)
    if (!event) return error(response, 404, 'Event not found.')
    const confirmedCount = await Registration.countDocuments({ event: event._id, status: 'confirmed' })
    await Event.findByIdAndUpdate(event._id, { confirmedCount })
    return response.json({ success: true, data: { confirmedCount } })
  })

  app.get('/api/admin/events/:id/export', authenticate, async (request, response) => {
    const event = await Event.findById(request.params.id); if (!event) return error(response, 404, 'Event not found.')
    const rows = await Registration.find({ event: event._id }).sort({ registeredAt: 1 })
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet('Registrations')
    const columns = ['registrationId', 'fullName', 'email', 'phone', 'college', 'teamName', 'participantType', 'participantCount', 'experience', 'requirements', 'status', 'registeredAt', 'promotedAt', 'contacted', 'paid']
    sheet.columns = columns.map((key) => ({ header: key, key }))
    rows.forEach((row) => sheet.addRow(Object.fromEntries(columns.map((key) => [key, safeCell(row[key])]))))
    response.attachment(`${event.slug}-${event.eventDate}.xlsx`)
    await workbook.xlsx.write(response); response.end()
  })

  app.get('/api/admin/needs-contacting/count', authenticate, async (_request, response) => {
    return response.json({ success: true, data: { count: await Registration.countDocuments({ status: 'confirmed', contacted: false }) } })
  })
}

export async function promoteOne({ Event, Registration, eventId }) {
  const promoted = await Registration.findOneAndUpdate({ event: eventId, status: 'waitlist' }, { status: 'confirmed', promotedAt: new Date(), contacted: false, contactedAt: null }, { sort: { registeredAt: 1 }, new: true })
  if (!promoted) await Event.findByIdAndUpdate(eventId, { $inc: { confirmedCount: -1 } })
  return promoted
}

export async function promoteMany({ Event, Registration, event, amount }) {
  for (let index = 0; index < amount; index += 1) {
    const promoted = await Registration.findOneAndUpdate({ event: event._id, status: 'waitlist' }, { status: 'confirmed', promotedAt: new Date(), contacted: false, contactedAt: null }, { sort: { registeredAt: 1 }, new: true })
    if (!promoted) break
    await Event.findByIdAndUpdate(event._id, { $inc: { confirmedCount: 1 } })
  }
}

export async function reserveSeat(Event, event) {
  return Event.findOneAndUpdate(
    { _id: event._id, published: true, registrationOpen: true, confirmedCount: { $lt: event.seatLimit }, closingAt: { $gt: new Date() } },
    { $inc: { confirmedCount: 1, registrationSequence: 1 } }, { new: true },
  )
}
