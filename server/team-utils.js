import { z } from 'zod'

const text = (max) => z.string().trim().min(1).max(max)
const stat = z.strictObject({ label: text(30), value: text(30) })
const href = z.string().max(300).refine((value) => {
  if (/[\s\0-\x1f\x7f]/.test(value)) return false
  if (/^#[A-Za-z0-9_-]{1,60}$/.test(value)) return true
  if (/^\/(?!\/)/.test(value)) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}, 'Must be a fragment, site path, or HTTPS URL')
const icon = z.string().regex(/^[A-Za-z0-9_-]{1,30}$/)
const spec = z.strictObject({ label: text(60), value: text(200), description: text(200).optional(), icon: icon.optional() })
const section = z.strictObject({ title: text(80), description: text(2000), bullets: z.array(text(200)).max(30) })

export const projectTextSchema = z.strictObject({
  title: text(80), tagline: text(200), overview: text(2000),
  stats: z.array(stat).max(4), specs: z.array(spec).max(30),
  heroEyebrow: text(80), primaryCtaLabel: text(80), primaryCtaHref: href,
  secondaryCtaLabel: text(80), secondaryCtaHref: href,
  teamSectionLabel: text(80), teamSectionTitle: text(80),
  specsSectionLabel: text(80), specsSectionTitle: text(80),
  engineeringSectionLabel: text(80), sections: z.array(section).max(30),
})
export const projectPatchSchema = projectTextSchema.partial()
export const groupSchema = z.strictObject({ name: text(60) })
export const memberSchema = z.strictObject({ name: text(80), role: text(80), extras: text(80).optional(), visible: z.boolean().optional(), groupId: z.string().optional() })
const alumniRole = z.string().trim().max(80).optional().transform((value) => value || undefined)
const alumniSeedRole = z.string().trim().min(1).max(80).optional()
export const alumniMemberSchema = z.strictObject({ name: text(80), role: alumniRole, visible: z.boolean().optional(), groupId: z.string().optional() })
export const directionSchema = z.strictObject({ direction: z.enum(['up', 'down']) })
export const confirmSchema = z.strictObject({ confirm: z.literal(true) })

const slug = text(60).regex(/^[a-z0-9_-]+$/)
const teamProjectSeedSchema = z.object({
  slug: z.literal('team'),
  heroImage: z.any().nullable().optional(),
  _id: z.any().optional(),
}).strict()
const alumniProjectSeedSchema = z.object({
  slug: z.literal('alumni'),
  heroImage: z.any().nullable().optional(),
  _id: z.any().optional(),
}).strict()
export const projectSeedSchema = z.union([
  projectTextSchema.extend({ slug, heroImage: z.any().nullable().optional(), _id: z.any().optional() }).strict(),
  teamProjectSeedSchema,
  alumniProjectSeedSchema,
])
export const groupSeedSchema = groupSchema.extend({
  order: z.number().int().min(0),
  project: z.any().optional(),
  _id: z.any().optional(),
}).strict()
export const alumniGroupSeedSchema = z.strictObject({
  name: text(60),
  order: z.number().int().min(0),
  project: z.any().optional(),
  _id: z.any().optional(),
})
export const memberSeedSchema = memberSchema.extend({
  extras: z.string().trim().max(80).optional(),
  order: z.number().int().min(0),
  image: z.any().nullable().optional(),
  group: z.any().optional(),
  _id: z.any().optional(),
}).strict()
export const alumniMemberSeedSchema = z.strictObject({
  name: text(80),
  role: alumniSeedRole,
  visible: z.boolean().optional(),
  order: z.number().int().min(0),
  image: z.any().nullable().optional(),
  group: z.any().optional(),
  _id: z.any().optional(),
}).strict()

export function idSchema(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

export function imageType(buffer) {
  if (!Buffer.isBuffer(buffer)) return null
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'image/webp'
  return null
}

export function imageUrl(id) {
  return id ? `/api/images/${id}` : null
}
