import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 500 },
}, { _id: false })

const photoSchema = new mongoose.Schema({
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamImage', default: null },
  alt: { type: String, default: '', maxlength: 160 },
  caption: { type: String, default: '', maxlength: 200 },
}, { _id: false })

const legacySchema = new mongoose.Schema({
  year: { type: Number, required: true, min: 2000, max: 2100 },
  season: { type: String, default: '', maxlength: 40 },
  competition: { type: String, required: true, maxlength: 120 },
  location: { type: String, default: '', maxlength: 120 },
  result: { type: String, default: '', maxlength: 200 },
  achievements: {
    type: [achievementSchema],
    default: [],
    validate: { validator: (value) => value.length <= 10, message: 'A maximum of 10 achievements is allowed.' },
  },
  photos: {
    type: [photoSchema],
    default: () => Array.from({ length: 3 }, () => ({})),
    validate: { validator: (value) => value.length === 3, message: 'Exactly 3 photo slots are required.' },
  },
  visible: { type: Boolean, default: true },
}, { timestamps: true })

export const Legacy = mongoose.models.Legacy || mongoose.model('Legacy', legacySchema)
