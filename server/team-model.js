import mongoose from 'mongoose'

const statSchema = new mongoose.Schema({ label: String, value: String }, { _id: false })
const specSchema = new mongoose.Schema({ label: String, value: String, description: String, icon: String }, { _id: false })
const sectionSchema = new mongoose.Schema({ title: String, description: String, bullets: [String] }, { _id: false })

const projectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, immutable: true, index: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  overview: { type: String, required: true },
  heroImage: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamImage', default: null },
  stats: { type: [statSchema], default: [] },
  specs: { type: [specSchema], default: [] },
  heroEyebrow: { type: String, default: 'Performance racing' },
  primaryCtaLabel: { type: String, default: 'Explore specs' },
  primaryCtaHref: { type: String, default: '#technical-specs' },
  secondaryCtaLabel: { type: String, default: 'Meet the team' },
  secondaryCtaHref: { type: String, default: '#team' },
  teamSectionLabel: { type: String, default: 'Project team' },
  teamSectionTitle: { type: String, default: 'MEET THE CREW' },
  specsSectionLabel: { type: String, default: 'Technical package' },
  specsSectionTitle: { type: String, default: 'Technical specifications' },
  engineeringSectionLabel: { type: String, default: 'Engineering focus' },
  sections: { type: [sectionSchema], default: [] },
}, { timestamps: true })

const groupSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamProject', required: true, index: true },
  name: { type: String, required: true },
  order: { type: Number, required: true },
})

const memberSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamGroup', required: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  extras: { type: String, default: '' },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamImage', default: null },
  visible: { type: Boolean, default: true },
  order: { type: Number, required: true },
})

const imageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Project = mongoose.models.TeamProject || mongoose.model('TeamProject', projectSchema)
export const Group = mongoose.models.TeamGroup || mongoose.model('TeamGroup', groupSchema)
export const Member = mongoose.models.TeamMember || mongoose.model('TeamMember', memberSchema)
export const Image = mongoose.models.TeamImage || mongoose.model('TeamImage', imageSchema)
