import 'dotenv/config'

export function loadConfig(env = process.env) {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL', 'ADMIN_EMAIL']
  for (const name of required) if (!env[name]?.trim()) throw new Error(`${name} is required`)
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
  const port = Number(env.PORT || 5000)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535')
  const trustProxy = Number(env.TRUST_PROXY ?? 0)
  if (!Number.isInteger(trustProxy) || trustProxy < 0) throw new Error('TRUST_PROXY must be a non-negative integer')
  const registrationRateWindowMs = Number(env.EVENTS_RATE_LIMIT_WINDOW_MS || 600_000)
  const registrationRateLimit = Number(env.EVENTS_RATE_LIMIT_MAX || 10)
  if (!Number.isInteger(registrationRateWindowMs) || registrationRateWindowMs <= 0) throw new Error('EVENTS_RATE_LIMIT_WINDOW_MS must be a positive integer')
  if (!Number.isInteger(registrationRateLimit) || registrationRateLimit <= 0) throw new Error('EVENTS_RATE_LIMIT_MAX must be a positive integer')
  const teamRateLimitWindowMs = Number(env.TEAM_RATE_LIMIT_WINDOW_MS || 900_000)
  const teamRateLimitMax = Number(env.TEAM_RATE_LIMIT_MAX || 300)
  if (!Number.isInteger(teamRateLimitWindowMs) || teamRateLimitWindowMs <= 0) throw new Error('TEAM_RATE_LIMIT_WINDOW_MS must be a positive integer')
  if (!Number.isInteger(teamRateLimitMax) || teamRateLimitMax <= 0) throw new Error('TEAM_RATE_LIMIT_MAX must be a positive integer')
  const retentionDays = env.REGISTRATION_RETENTION_DAYS === undefined ? 90 : Number(env.REGISTRATION_RETENTION_DAYS)
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) throw new Error('REGISTRATION_RETENTION_DAYS must be an integer from 1 to 3650')
  return {
    port, mongoUri: env.MONGODB_URI, jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '8h', clientUrl: env.CLIENT_URL,
    adminEmail: env.ADMIN_EMAIL.trim().toLowerCase(), trustProxy, registrationRateWindowMs,
    registrationRateLimit, teamRateLimitWindowMs, teamRateLimitMax, retentionDays, nodeEnv: env.NODE_ENV || 'development',
  }
}
