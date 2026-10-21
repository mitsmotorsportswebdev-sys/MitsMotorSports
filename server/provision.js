import bcrypt from 'bcryptjs'

export async function setupAdmin({ Admin, config, password }) {
  if (!password || password.length < 10) throw new Error('Password must be at least 10 characters')
  if (await Admin.countDocuments({}) > 0) throw new Error('An admin already exists')
  const now = new Date()
  return Admin.create({ email: config.adminEmail, passwordHash: await bcrypt.hash(password, 12), role: 'admin', createdAt: now, passwordChangedAt: now })
}

export async function resetAdminPassword({ Admin, config, password }) {
  if (!password || password.length < 10) throw new Error('Password must be at least 10 characters')
  const admin = await Admin.findOne({ email: config.adminEmail })
  if (!admin) throw new Error('No admin exists; run setup-admin first')
  if (await bcrypt.compare(password, admin.passwordHash)) throw new Error('New password must differ from the current password')
  admin.passwordHash = await bcrypt.hash(password, 12)
  admin.passwordChangedAt = new Date(Math.max(Date.now(), admin.passwordChangedAt.getTime() + 1))
  await admin.save()
}
