import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { mountEventRoutes } from './event-routes.js'
import { Event, Registration } from './events-model.js'

const dummyHash = bcrypt.hashSync('dummy-password-that-is-never-valid', 12)
const credentialsSchema = z.object({ email: z.string().trim().email(), password: z.string() })
const passwordSchema = z.object({ currentPassword: z.string(), newPassword: z.string().min(10) })

function publicUser(admin) {
  return { id: String(admin._id), email: admin.email, role: admin.role }
}

function setNoStore(response) {
  response.set('Cache-Control', 'no-store')
}

function noStoreMiddleware(_request, response, next) {
  setNoStore(response)
  next()
}

export function createApp({ Admin, config, EventModel = Event, RegistrationModel = Registration }) {
  const app = express()
  app.set('trust proxy', config.trustProxy)
  app.use(helmet())
  app.use(cors({ origin: config.clientUrl, credentials: false }))
  app.use(express.json({ limit: '20kb' }))

  const loginLimiter = rateLimit({
    windowMs: 60_000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Try again shortly.' },
  })

  app.post('/api/admin/login', noStoreMiddleware, loginLimiter, async (request, response) => {
    const parsed = credentialsSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json({ success: false, message: 'Please provide a valid email and password.' })
    const email = parsed.data.email.toLowerCase()
    const admin = await Admin.findOne({ email: config.adminEmail })
    const hash = admin && email === config.adminEmail ? admin.passwordHash : dummyHash
    const passwordMatches = await bcrypt.compare(parsed.data.password, hash)
    if (!admin || email !== config.adminEmail || !passwordMatches || admin.role !== 'admin') {
      return response.status(401).json({ success: false, message: 'Invalid email or password.' })
    }
    const token = jwt.sign({
      sub: String(admin._id),
      role: 'admin',
      passwordChangedAt: admin.passwordChangedAt.getTime(),
    }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
    return response.json({ success: true, data: { token, user: publicUser(admin) } })
  })

  async function authenticate(request, response, next) {
    const header = request.get('authorization')
    if (!header?.startsWith('Bearer ')) return response.status(401).json({ success: false, message: 'Authentication required.' })
    try {
      const payload = jwt.verify(header.slice(7), config.jwtSecret)
      if (typeof payload !== 'object' || payload.role !== 'admin' || !payload.sub) throw new Error('Invalid token')
      const admin = await Admin.findById(payload.sub)
      if (!admin || admin.role !== 'admin' || admin.passwordChangedAt.getTime() !== payload.passwordChangedAt) throw new Error('Invalid token')
      request.admin = admin
      next()
    } catch {
      return response.status(401).json({ success: false, message: 'Session is invalid or expired.' })
    }
  }

  app.get('/api/admin/session', noStoreMiddleware, authenticate, (request, response) => {
    return response.json({ success: true, data: { user: publicUser(request.admin) } })
  })

  app.post('/api/admin/password', authenticate, async (request, response) => {
    const parsed = passwordSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json({ success: false, message: 'New password must be at least 10 characters.' })
    const { currentPassword, newPassword } = parsed.data
    const currentMatches = await bcrypt.compare(currentPassword, request.admin.passwordHash)
    if (!currentMatches) return response.status(400).json({ success: false, message: 'Current password is incorrect.' })
    if (await bcrypt.compare(newPassword, request.admin.passwordHash)) {
      return response.status(400).json({ success: false, message: 'New password must differ from the current password.' })
    }
    request.admin.passwordHash = await bcrypt.hash(newPassword, 12)
    const minimumChangedAt = request.admin.passwordChangedAt.getTime() + 1
    request.admin.passwordChangedAt = new Date(Math.max(Date.now(), minimumChangedAt))
    await request.admin.save()
    return response.json({ success: true, message: 'Password changed successfully.' })
  })

  mountEventRoutes(app, {
    Event: EventModel,
    Registration: RegistrationModel,
    config, authenticate,
  })

  return app
}
