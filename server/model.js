import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin'], required: true, default: 'admin' },
  createdAt: { type: Date, required: true, default: Date.now },
  passwordChangedAt: { type: Date, required: true, default: Date.now },
}, { versionKey: false })

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema)
