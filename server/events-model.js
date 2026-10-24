import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  department: { type: String },
  year: { type: Number, required: true },
  collegeId: { type: String },
}, { _id: false })

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 180 },
  description: { type: String, required: true, maxlength: 3000 },
  image: { type: String, required: true },
  eventDate: { type: String, required: true },
  time: { type: String, required: true, maxlength: 80 },
  venue: { type: String, required: true, maxlength: 180 },
  allowedYears: { type: [Number], required: true, default: [1, 2, 3, 4] },
  seatLimit: { type: Number, required: true, min: 1, max: 100000 },
  closingAt: { type: Date, required: true },
  published: { type: Boolean, default: false },
  participation: { type: String, enum: ['individual', 'group'], required: true },
  minTeamSize: { type: Number },
  maxTeamSize: { type: Number },
  collegeOnly: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  mobile: { type: String, required: true },
  department: { type: String },
  year: { type: Number, required: true },
  collegeId: { type: String },
  collegeName: { type: String },
  teamName: { type: String },
  members: { type: [memberSchema] },
  headcount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  registeredAt: { type: Date, default: Date.now },
}, { versionKey: false })

registrationSchema.index({ event: 1, email: 1 }, { unique: true })

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema)
export const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema)
