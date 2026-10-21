import 'dotenv/config'

export function loadConfig(env = process.env) {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL', 'ADMIN_EMAIL']
  for (const name of required) {
    if (!env[name]?.trim()) throw new Error(`${name} is required`)
  }
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
  const trustProxy = Number(env.TRUST_PROXY ?? 0)
  if (!Number.isInteger(trustProxy) || trustProxy < 0) throw new Error('TRUST_PROXY must be a non-negative integer')
  if (!env.TURNSTILE_SECRET_KEY?.trim()) throw new Error('TURNSTILE_SECRET_KEY is required')
  return {
    port: Number(env.PORT || 5000),
    mongoUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '8h',
    clientUrl: env.CLIENT_URL,
    adminEmail: env.ADMIN_EMAIL.trim().toLowerCase(),
    turnstileSecretKey: env.TURNSTILE_SECRET_KEY?.trim() || '',
    trustProxy,
    nodeEnv: env.NODE_ENV || 'development',
  }
}
