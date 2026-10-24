import 'dotenv/config'

export function loadConfig(env = process.env) {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL', 'ADMIN_EMAIL']
  for (const name of required) if (!env[name]?.trim()) throw new Error(`${name} is required`)
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
  const trustProxy = Number(env.TRUST_PROXY ?? 0)
  if (!Number.isInteger(trustProxy) || trustProxy < 0) throw new Error('TRUST_PROXY must be a non-negative integer')
  const registrationRateWindowMs = Number(env.EVENTS_RATE_LIMIT_WINDOW_MS || 600_000)
  const registrationRateLimit = Number(env.EVENTS_RATE_LIMIT_MAX || 10)
  if (!Number.isInteger(registrationRateWindowMs) || registrationRateWindowMs <= 0) throw new Error('EVENTS_RATE_LIMIT_WINDOW_MS must be a positive integer')
  if (!Number.isInteger(registrationRateLimit) || registrationRateLimit <= 0) throw new Error('EVENTS_RATE_LIMIT_MAX must be a positive integer')
  return {
    port: Number(env.PORT || 5000), mongoUri: env.MONGODB_URI, jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '8h', clientUrl: env.CLIENT_URL,
    adminEmail: env.ADMIN_EMAIL.trim().toLowerCase(), trustProxy, registrationRateWindowMs,
    registrationRateLimit, nodeEnv: env.NODE_ENV || 'development',
  }
}
