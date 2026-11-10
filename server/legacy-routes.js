import express from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { Legacy } from './legacy-model.js'
import { Image } from './team-model.js'
import { imageType, idSchema } from './team-utils.js'

const achievementSchema = z.strictObject({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
})
const photoTextSchema = z.strictObject({
  alt: z.string().trim().max(160).optional(),
  caption: z.string().trim().max(200).optional(),
})
const legacyTextSchema = z.strictObject({
  year: z.number().int().min(2000).max(2100),
  season: z.string().trim().max(40).optional(),
  competition: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional(),
  result: z.string().trim().max(200).optional(),
  achievements: z.array(achievementSchema).max(10),
  visible: z.boolean().optional(),
})
const legacyPatchSchema = legacyTextSchema.extend({
  photos: z.array(photoTextSchema).length(3).optional(),
}).partial()

function error(response, status, message, fields) {
  return response.status(status).json({ success: false, message, ...(fields ? { fields } : {}) })
}

function parsed(schema, body, response) {
  const result = schema.safeParse(body)
  if (!result.success) {
    error(response, 400, 'Please correct the highlighted fields.', result.error.flatten().fieldErrors)
    return null
  }
  return result.data
}

function absoluteImageUrl(request, id) {
  return id ? `${request.protocol}://${request.get('host')}/api/images/${id}` : null
}

function output(request, entry, includeTimestamps = false) {
  return {
    id: String(entry._id),
    year: entry.year,
    season: entry.season,
    competition: entry.competition,
    location: entry.location,
    result: entry.result,
    achievements: entry.achievements.map(({ title, description }) => ({ title, description })),
    photos: entry.photos.map((photo) => ({
      imageUrl: absoluteImageUrl(request, photo.image),
      alt: photo.alt,
      caption: photo.caption,
    })),
    visible: entry.visible,
    ...(includeTimestamps && entry.createdAt ? { createdAt: entry.createdAt } : {}),
    ...(includeTimestamps && entry.updatedAt ? { updatedAt: entry.updatedAt } : {}),
  }
}

function validSlot(value) {
  return /^[0-2]$/.test(value)
}

async function replacePhoto(entry, slot, request, response, ImageModel) {
  if (!Buffer.isBuffer(request.body)) return error(response, 415, 'A JPEG, PNG, or WebP image is required.')
  if (request.body.length > 400 * 1024) return error(response, 413, 'Image is too large.')
  const detected = imageType(request.body)
  if (!detected || detected !== request.get('content-type')) return error(response, 415, 'Image bytes do not match the declared image type.')

  const index = Number(slot)
  const old = entry.photos[index].image
  const image = await ImageModel.create({ data: request.body, contentType: detected, size: request.body.length })
  try {
    entry.photos[index].image = image._id
    await entry.save()
  } catch (saveError) {
    await ImageModel.deleteOne({ _id: image._id })
    throw saveError
  }
  if (old) await ImageModel.deleteOne({ _id: old })
  return response.json({ success: true, data: output(request, entry) })
}

export function mountLegacyRoutes(app, { LegacyModel = Legacy, ImageModel = Image, authenticate, config = {} }) {
  const rawImage = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '400kb' })
  const limiter = rateLimit({
    windowMs: config.teamRateLimitWindowMs ?? 900_000,
    limit: config.teamRateLimitMax ?? 300,
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.get('/api/legacy', limiter, async (request, response) => {
    const entries = await LegacyModel.find({ visible: true }).sort({ year: -1, createdAt: -1 })
    return response.set('Cache-Control', 'no-cache').json({ success: true, data: entries.map((entry) => output(request, entry)) })
  })

  app.use('/api/admin/legacy', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/legacy/:id', (request, response, next) => {
    if (!idSchema(request.params.id)) return error(response, 400, 'Invalid legacy entry id.')
    next()
  })
  app.use('/api/admin/legacy/:id/photos/:slot', (request, response, next) => {
    if (!validSlot(request.params.slot)) return error(response, 400, 'Photo slot must be 0, 1, or 2.')
    next()
  })

  app.get('/api/admin/legacy', authenticate, async (request, response) => {
    const entries = await LegacyModel.find().sort({ year: -1, createdAt: -1 })
    return response.json({ success: true, data: entries.map((entry) => output(request, entry, true)) })
  })
  app.post('/api/admin/legacy', authenticate, async (request, response) => {
    const data = parsed(legacyTextSchema, request.body, response)
    if (!data) return
    const entry = await LegacyModel.create(data)
    return response.status(201).json({ success: true, data: output(request, entry, true) })
  })
  app.put('/api/admin/legacy/:id', authenticate, async (request, response) => {
    const data = parsed(legacyPatchSchema, request.body, response)
    if (!data) return
    const entry = await LegacyModel.findById(request.params.id)
    if (!entry) return error(response, 404, 'Legacy entry not found.')
    if (data.photos) {
      data.photos.forEach((photo, index) => {
        Object.assign(entry.photos[index], photo)
      })
      delete data.photos
    }
    Object.assign(entry, data)
    await entry.save()
    return response.json({ success: true, data: output(request, entry, true) })
  })
  app.delete('/api/admin/legacy/:id', authenticate, async (request, response) => {
    const entry = await LegacyModel.findById(request.params.id)
    if (!entry) return error(response, 404, 'Legacy entry not found.')
    const imageIds = entry.photos.map((photo) => photo.image).filter(Boolean)
    await entry.deleteOne()
    if (imageIds.length) await ImageModel.deleteMany({ _id: { $in: imageIds } })
    return response.json({ success: true })
  })
  app.post('/api/admin/legacy/:id/photos/:slot', authenticate, rawImage, async (request, response) => {
    const entry = await LegacyModel.findById(request.params.id)
    if (!entry) return error(response, 404, 'Legacy entry not found.')
    return replacePhoto(entry, request.params.slot, request, response, ImageModel)
  })
  app.delete('/api/admin/legacy/:id/photos/:slot', authenticate, async (request, response) => {
    const entry = await LegacyModel.findById(request.params.id)
    if (!entry) return error(response, 404, 'Legacy entry not found.')
    const index = Number(request.params.slot)
    const old = entry.photos[index].image
    entry.photos[index].image = null
    await entry.save()
    if (old) await ImageModel.deleteOne({ _id: old })
    return response.json({ success: true, data: output(request, entry, true) })
  })
}
