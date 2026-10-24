import ExcelJS from 'exceljs'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { eventSchema, formatIndiaDateTime, publicEvent, registrationSchema, registrationSchemaFor, registrationState } from './event-utils.js'

const idSchema = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)

function error(response, status, message, fields) {
  return response.status(status).json({ success: false, message, ...(fields ? { fields } : {}) })
}

export function safeCell(value) {
  const text = String(value ?? '')
  return /^[=+\-@\t]/.test(text) ? `'${text}` : text
}

function viewRegistration(row) {
  return { ...row.toObject(), event: String(row.event), _id: String(row._id) }
}

function parseValidation(parsed, response, message) {
  if (parsed.success) return parsed.data
  error(response, 400, message, parsed.error.flatten().fieldErrors)
  return null
}

async function seatTotals(Registration, eventIds) {
  const rows = await Registration.aggregate([
    { $match: { event: { $in: eventIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: '$event', seatsUsed: { $sum: '$headcount' }, entries: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } } },
  ])
  return new Map(rows.map((row) => [String(row._id), row]))
}

async function loadEventWithSeats(Event, Registration, id, publishedOnly = false) {
  if (!idSchema(id)) return null
  const event = await Event.findOne({ _id: id, ...(publishedOnly ? { published: true } : {}) })
  if (!event) return null
  const totals = await seatTotals(Registration, [id])
  return { event, seatsUsed: totals.get(id)?.seatsUsed || 0 }
}

export async function registerEvent({ Event, Registration, eventId, data }) {
  const loaded = await loadEventWithSeats(Event, Registration, eventId, true)
  if (!loaded) throw Object.assign(new Error('Event not found.'), { status: 404 })
  const { event, seatsUsed } = loaded
  const state = registrationState(event, seatsUsed)
  if (state === 'ended') throw Object.assign(new Error('This event has ended.'), { status: 409 })
  if (state !== 'open') throw Object.assign(new Error('Registration is closed.'), { status: 409 })
  const headcount = 1 + (data.members?.length || 0)
  if (headcount > event.seatLimit - seatsUsed) throw Object.assign(new Error(`Only ${Math.max(0, event.seatLimit - seatsUsed)} seats left.`), { status: 409 })
  const item = await Registration.create({ ...data, event: event._id, headcount, website: undefined })
  const later = await Registration.aggregate([
    { $match: { event: event._id, _id: { $lte: item._id } } },
    { $group: { _id: null, seatsUsed: { $sum: '$headcount' } } },
  ])
  if ((later[0]?.seatsUsed || 0) > event.seatLimit) {
    await Registration.deleteOne({ _id: item._id })
    throw Object.assign(new Error('Registration is closed.'), { status: 409 })
  }
  return { id: String(item._id), status: item.status }
}

export function mountEventRoutes(app, { Event, Registration, config, authenticate }) {
  app.use('/api/admin/events', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/registrations', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  const registerLimiter = rateLimit({
    windowMs: config.registrationRateWindowMs ?? 600_000, limit: config.registrationRateLimit ?? 10,
    standardHeaders: true, legacyHeaders: false,
    message: { success: false, message: 'Too many registration attempts. Try again shortly.' },
  })

  app.get('/api/events', async (_request, response) => {
    const events = await Event.find({ published: true, eventDate: { $gte: new Date().toISOString().slice(0, 10) } }).sort({ eventDate: 1 })
    const totals = await seatTotals(Registration, events.map((event) => String(event._id)))
    return response.json({ success: true, data: events.filter((event) => registrationState(event, totals.get(String(event._id))?.seatsUsed || 0) !== 'ended').map((event) => publicEvent(event, totals.get(String(event._id))?.seatsUsed || 0)) })
  })

  app.get('/api/events/:id', async (request, response) => {
    const loaded = await loadEventWithSeats(Event, Registration, request.params.id, true)
    if (!loaded) return error(response, 404, 'Event not found.')
    return response.json({ success: true, data: publicEvent(loaded.event, loaded.seatsUsed) })
  })

  app.post('/api/events/:id/registrations', registerLimiter, async (request, response) => {
    if (typeof request.body?.website === 'string' && request.body.website.trim()) {
      return response.status(201).json({ success: true, data: { id: new mongoose.Types.ObjectId().toString(), status: 'pending' } })
    }
    const basic = parseValidation(registrationSchema.safeParse(request.body), response, 'Please correct the highlighted fields.')
    if (!basic) return undefined
    const loaded = await loadEventWithSeats(Event, Registration, request.params.id, true)
    if (!loaded) return error(response, 404, 'Event not found.')
    const parsed = parseValidation(registrationSchemaFor(loaded.event).safeParse(request.body), response, 'Please correct the highlighted fields.')
    if (!parsed) return undefined
    try {
      return response.status(201).json({ success: true, data: await registerEvent({ Event, Registration, eventId: request.params.id, data: parsed }) })
    } catch (registrationError) {
      if (registrationError.code === 11000) return error(response, 409, 'This email is already registered for this event.')
      if (registrationError.status) return error(response, registrationError.status, registrationError.message)
      throw registrationError
    }
  })

  app.get('/api/admin/events', authenticate, async (_request, response) => {
    const events = await Event.find({}).sort({ createdAt: -1 })
    const totals = await seatTotals(Registration, events.map((event) => String(event._id)))
    const data = events.map((event) => {
      const total = totals.get(String(event._id)) || {}
      return { ...publicEvent(event, total.seatsUsed || 0), _id: String(event._id), published: event.published, seatsUsed: total.seatsUsed || 0, entries: total.entries || 0, pending: total.pending || 0 }
    })
    return response.json({ success: true, data })
  })

  app.post('/api/admin/events', authenticate, async (request, response) => {
    const parsed = parseValidation(eventSchema.safeParse(request.body), response, 'Please correct the event fields.')
    if (!parsed) return undefined
    return response.status(201).json({ success: true, data: await Event.create(parsed) })
  })

  app.patch('/api/admin/events/:id', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid event.')
    const current = await Event.findById(request.params.id)
    if (!current) return error(response, 404, 'Event not found.')
    const parsed = parseValidation(eventSchema.safeParse(request.body), response, 'Please correct the event fields.')
    if (!parsed) return undefined
    if (await Registration.exists({ event: current._id }) && (parsed.participation !== current.participation || parsed.collegeOnly !== current.collegeOnly)) {
      return error(response, 409, 'Participation and college-only settings cannot change after registrations exist.')
    }
    const event = await Event.findByIdAndUpdate(current._id, parsed, { new: true, runValidators: true })
    return response.json({ success: true, data: event })
  })

  app.delete('/api/admin/events/:id', authenticate, async (request, response) => {
    if (!idSchema(request.params.id) || request.body?.confirm !== true) return error(response, 400, 'Explicit confirmation is required.')
    const event = await Event.findById(request.params.id)
    if (!event) return error(response, 404, 'Event not found.')
    await Registration.deleteMany({ event: event._id })
    await event.deleteOne()
    return response.json({ success: true })
  })

  app.get('/api/admin/events/:id/registrations', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid event.')
    const filter = { event: request.params.id }
    if (request.query.status === 'pending' || request.query.status === 'approved') filter.status = request.query.status
    const search = String(request.query.search || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (search) filter.$or = ['fullName', 'email', 'mobile', 'collegeId'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }))
    const rows = await Registration.find(filter).sort({ registeredAt: 1 })
    return response.json({ success: true, data: rows.map(viewRegistration) })
  })

  app.patch('/api/admin/registrations/:id', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid registration.')
    const current = await Registration.findById(request.params.id)
    if (!current) return error(response, 404, 'Registration not found.')
    const event = await Event.findById(current.event)
    const merged = { ...current.toObject(), ...request.body }
    delete merged._id; delete merged.event; delete merged.headcount; delete merged.status; delete merged.registeredAt
    const parsed = parseValidation(registrationSchemaFor(event).safeParse(merged), response, 'Please correct the registration fields.')
    if (!parsed) return undefined
    try {
      const row = await Registration.findByIdAndUpdate(current._id, { ...parsed, headcount: 1 + (parsed.members?.length || 0) }, { new: true, runValidators: true })
      return response.json({ success: true, data: viewRegistration(row) })
    } catch (updateError) {
      if (updateError.code === 11000) return error(response, 409, 'This email is already registered for this event.')
      throw updateError
    }
  })

  app.post('/api/admin/registrations/:id/approve', authenticate, async (request, response) => {
    const row = await Registration.findByIdAndUpdate(request.params.id, { status: 'approved' }, { new: true })
    if (!row) return error(response, 404, 'Registration not found.')
    return response.json({ success: true, data: viewRegistration(row) })
  })

  app.post('/api/admin/events/:id/approve-all', authenticate, async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid event.')
    const result = await Registration.updateMany({ event: request.params.id, status: 'pending' }, { status: 'approved' })
    return response.json({ success: true, data: { approved: result.modifiedCount } })
  })

  app.delete('/api/admin/registrations/:id', authenticate, async (request, response) => {
    if (request.body?.confirm !== true) return error(response, 400, 'Explicit confirmation is required.')
    const row = await Registration.findByIdAndDelete(request.params.id)
    if (!row) return error(response, 404, 'Registration not found.')
    return response.json({ success: true })
  })

  app.get('/api/admin/events/:id/export', authenticate, async (request, response) => {
    const event = await Event.findById(request.params.id)
    if (!event) return error(response, 404, 'Event not found.')
    const filter = { event: event._id, ...(request.query.includePending === 'true' ? {} : { status: 'approved' }) }
    const rows = await Registration.find(filter).sort({ registeredAt: 1 })
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet('Registrations')
    const headers = ['Team name', 'Role', 'Name', 'College email', 'Mobile', 'Department', 'Year', 'College ID', ...(event.collegeOnly ? [] : ['College name']), ...(request.query.includePending === 'true' ? ['Status'] : []), 'Registered at']
    sheet.addRow(headers.map(safeCell))
    for (const row of rows) {
      const people = [{ ...row.toObject(), role: 'Leader' }, ...(row.members || []).map((member) => ({ ...member, role: 'Member', email: '', mobile: '' }))]
      for (const person of people) sheet.addRow([row.teamName || '', person.role, person.fullName, person.email || '', person.mobile || '', person.department, person.year, person.collegeId, ...(event.collegeOnly ? [] : [row.collegeName || '']), ...(request.query.includePending === 'true' ? [row.status] : []), formatIndiaDateTime(row.registeredAt)].map(safeCell))
    }
    response.attachment(`${event.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${event.eventDate}.xlsx`)
    await workbook.xlsx.write(response); response.end()
  })
}
