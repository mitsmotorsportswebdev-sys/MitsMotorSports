import mongoose from 'mongoose'

const scheduleSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false })

const eventSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, immutable: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  eventDate: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  entryFee: { type: String, required: true },
  eventType: { type: String, required: true },
  eligibility: { type: String, required: true },
  highlights: { type: [String], default: [] },
  rules: { type: [String], default: [] },
  eligibilityDetails: { type: [String], default: [] },
  schedule: { type: [scheduleSchema], default: [] },
  venueDescription: { type: String, required: true },
  seatLimit: { type: Number, required: true, min: 1, max: 100000 },
  closingAt: { type: Date, required: true },
  registrationOpen: { type: Boolean, default: true },
  published: { type: Boolean, default: false },
  confirmedCount: { type: Number, default: 0, min: 0 },
  registrationSequence: { type: Number, default: 0, min: 0 },
}, { timestamps: true, versionKey: false })

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  activeEmail: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  teamName: { type: String, default: '' },
  participantType: { type: String, enum: ['Individual', 'Team', 'Club/Organization'], required: true },
  participantCount: { type: Number, required: true },
  experience: { type: String, default: '' },
  requirements: { type: String, default: '' },
  termsAccepted: { type: Boolean, required: true },
  status: { type: String, enum: ['confirmed', 'waitlist', 'cancelled'], required: true },
  registrationId: { type: String, required: true, unique: true },
  registeredAt: { type: Date, required: true, default: Date.now },
  promotedAt: { type: Date, default: null },
  contacted: { type: Boolean, default: false },
  contactedAt: { type: Date, default: null },
  paid: { type: String, enum: ['paid', 'not paid'], default: 'not paid' },
}, { versionKey: false })

registrationSchema.index({ event: 1, email: 1, status: 1 })

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema)
export const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema)
