import crypto from 'node:crypto'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { Group, Image, Member, Project } from './team-model.js'
import { alumniMemberSchema, confirmSchema, directionSchema, groupSchema, idSchema, imageType, imageUrl, memberSchema, projectPatchSchema, projectTextSchema } from './team-utils.js'

export const HIDDEN_SLUGS = ['team', 'alumni']

function error(response, status, message, fields) {
  return response.status(status).json({ success: false, message, ...(fields ? { fields } : {}) })
}
function parsed(schema, body, response, message = 'Please correct the highlighted fields.') {
  const result = schema.safeParse(body)
  if (!result.success) { error(response, 400, message, result.error.flatten().fieldErrors); return null }
  return result.data
}
function publicMember(member) {
  return { id: String(member._id), name: member.name, role: member.role, extras: member.extras || '', imageUrl: imageUrl(member.image) }
}
function adminMember(member) {
  return { ...publicMember(member), groupId: String(member.group), imageId: member.image ? String(member.image) : null, order: member.order, visible: member.visible }
}
function projectFields(project) {
  const value = project.toObject()
  delete value._id; delete value.__v; delete value.createdAt; delete value.updatedAt
  return { ...value, id: String(project._id), heroImageUrl: imageUrl(project.heroImage) }
}
async function replaceImage(owner, field, request, response) {
  if (!Buffer.isBuffer(request.body)) return error(response, 415, 'A JPEG, PNG, or WebP image is required.')
  if (request.body.length > 400 * 1024) return error(response, 413, 'Image is too large.')
  const detected = imageType(request.body)
  if (!detected || detected !== request.get('content-type')) return error(response, 415, 'Image bytes do not match the declared image type.')
  const old = owner[field]
  const image = await Image.create({ data: request.body, contentType: detected, size: request.body.length })
  try {
    owner[field] = image._id
    await owner.save()
  } catch (saveError) {
    await Image.deleteOne({ _id: image._id })
    throw saveError
  }
  if (old) await Image.deleteOne({ _id: old })
  return response.json({ success: true, data: { imageUrl: imageUrl(image._id) } })
}
async function moveItem(Model, parentField, id, direction) {
  const item = await Model.findById(id)
  if (!item) return null
  const sibling = await Model.findOne({ [parentField]: item[parentField], order: direction === 'up' ? { $lt: item.order } : { $gt: item.order } }).sort({ order: direction === 'up' ? -1 : 1 })
  if (sibling) { const order = item.order; item.order = sibling.order; sibling.order = order; await item.save(); await sibling.save() }
  return item
}

export function mountTeamRoutes(app, { ProjectModel = Project, GroupModel = Group, MemberModel = Member, ImageModel = Image, authenticate, config = {} }) {
  const rawImage = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '400kb' })
  const limiter = rateLimit({
    windowMs: config.teamRateLimitWindowMs ?? 900_000,
    limit: config.teamRateLimitMax ?? 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api/admin/projects', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/groups', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/members', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  app.use('/api/admin/projects/:slug', (request, response, next) => { if (!/^[a-z0-9-]+$/.test(request.params.slug)) return error(response, 400, 'Invalid project.'); next() })
  for (const path of ['/api/admin/groups/:id', '/api/admin/members/:id']) app.use(path, (request, response, next) => { if (!idSchema(request.params.id)) return error(response, 400, 'Invalid id.'); next() })

  app.get('/api/projects', limiter, async (_request, response) => {
    const projects = await ProjectModel.find({ slug: { $nin: HIDDEN_SLUGS } }).sort({ slug: 1 })
    return response.set('Cache-Control', 'public, max-age=60').json({ success: true, data: projects.map((project) => ({ slug: project.slug, title: project.title, tagline: project.tagline, heroImageUrl: imageUrl(project.heroImage) })) })
  })
  app.get('/api/projects/:slug', limiter, async (request, response) => {
    const project = await ProjectModel.findOne({ slug: request.params.slug })
    if (!project) return error(response, 404, 'Project not found.')
    const groups = await GroupModel.find({ project: project._id }).sort({ order: 1 })
    const members = await MemberModel.find({ group: { $in: groups.map((group) => group._id) }, visible: true }).sort({ order: 1 })
    const data = projectFields(project)
    data.groups = groups.map((group) => ({ id: String(group._id), name: group.name, members: members.filter((member) => String(member.group) === String(group._id)).map(publicMember) }))
    data.memberCount = members.length
    return response.set('Cache-Control', 'no-cache').json({ success: true, data })
  })
  app.get('/api/images/:id', async (request, response) => {
    if (!idSchema(request.params.id)) return error(response, 404, 'Image not found.')
    const image = await ImageModel.findById(request.params.id)
    if (!image) return error(response, 404, 'Image not found.')
    const etag = `"${crypto.createHash('sha256').update(image.data).digest('hex')}"`
    response.set('Cross-Origin-Resource-Policy', 'cross-origin')
    if (request.get('if-none-match') === etag) return response.status(304).end()
    return response.set({ 'Content-Type': image.contentType, 'Content-Length': image.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin', ETag: etag }).send(image.data)
  })

  app.get('/api/admin/projects', authenticate, async (_request, response) => {
    const projects = await ProjectModel.find({ slug: { $nin: HIDDEN_SLUGS } }).sort({ slug: 1 })
    return response.json({ success: true, data: projects.map(projectFields) })
  })
  app.get('/api/admin/projects/:slug', authenticate, async (request, response) => {
    const project = await ProjectModel.findOne({ slug: request.params.slug })
    if (!project) return error(response, 404, 'Project not found.')
    const groups = await GroupModel.find({ project: project._id }).sort({ order: 1 })
    const members = await MemberModel.find({ group: { $in: groups.map((group) => group._id) } }).sort({ order: 1 })
    return response.json({ success: true, data: { ...projectFields(project), groups: groups.map((group) => ({ id: String(group._id), name: group.name, order: group.order, members: members.filter((member) => String(member.group) === String(group._id)).map(adminMember) })) } })
  })
  app.patch('/api/admin/projects/:slug', authenticate, async (request, response) => {
    const changes = parsed(projectPatchSchema, request.body, response)
    if (!changes) return
    const project = await ProjectModel.findOneAndUpdate({ slug: request.params.slug }, changes, { new: true, runValidators: true })
    if (!project) return error(response, 404, 'Project not found.')
    return response.json({ success: true, data: projectFields(project) })
  })
  app.put('/api/admin/projects/:slug/hero', authenticate, rawImage, async (request, response) => {
    const project = await ProjectModel.findOne({ slug: request.params.slug })
    if (!project) return error(response, 404, 'Project not found.')
    return replaceImage(project, 'heroImage', request, response)
  })
  app.delete('/api/admin/projects/:slug/hero', authenticate, async (request, response) => {
    const project = await ProjectModel.findOne({ slug: request.params.slug })
    if (!project) return error(response, 404, 'Project not found.')
    if (project.heroImage) await ImageModel.deleteOne({ _id: project.heroImage })
    project.heroImage = null; await project.save()
    return response.json({ success: true, data: { imageUrl: null } })
  })
  app.post('/api/admin/projects/:slug/groups', authenticate, async (request, response) => {
    const data = parsed(groupSchema, request.body, response); if (!data) return
    const project = await ProjectModel.findOne({ slug: request.params.slug }); if (!project) return error(response, 404, 'Project not found.')
    const last = await GroupModel.findOne({ project: project._id }).sort({ order: -1 })
    const group = await GroupModel.create({ ...data, project: project._id, order: (last?.order ?? -1) + 1 })
    return response.status(201).json({ success: true, data: { id: String(group._id), name: group.name, order: group.order } })
  })
  app.patch('/api/admin/groups/:id', authenticate, async (request, response) => {
    const data = parsed(groupSchema, request.body, response); if (!data) return
    const group = await GroupModel.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true }); if (!group) return error(response, 404, 'Group not found.')
    return response.json({ success: true, data: { id: String(group._id), name: group.name, order: group.order } })
  })
  app.post('/api/admin/groups/:id/move', authenticate, async (request, response) => {
    const data = parsed(directionSchema, request.body, response); if (!data) return
    const group = await moveItem(GroupModel, 'project', request.params.id, data.direction); if (!group) return error(response, 404, 'Group not found.')
    return response.json({ success: true, data: { id: String(group._id), order: group.order } })
  })
  app.delete('/api/admin/groups/:id', authenticate, async (request, response) => {
    if (!parsed(confirmSchema, request.body, response, 'Confirmation is required.')) return
    const group = await GroupModel.findById(request.params.id); if (!group) return error(response, 404, 'Group not found.')
    if (await MemberModel.exists({ group: group._id })) return error(response, 409, 'Section is not empty.')
    await group.deleteOne(); return response.json({ success: true })
  })
  app.post('/api/admin/groups/:id/members', authenticate, async (request, response) => {
    const group = await GroupModel.findById(request.params.id); if (!group) return error(response, 404, 'Group not found.')
    const project = await ProjectModel.findById(group.project)
    if (!project) return error(response, 404, 'Project not found.')
    const schema = project.slug === 'alumni' ? alumniMemberSchema.omit({ groupId: true }) : memberSchema.omit({ groupId: true })
    const data = parsed(schema, request.body, response); if (!data) return
    const last = await MemberModel.findOne({ group: group._id }).sort({ order: -1 })
    const member = await MemberModel.create({ ...data, group: group._id, order: (last?.order ?? -1) + 1 })
    return response.status(201).json({ success: true, data: adminMember(member) })
  })
  app.patch('/api/admin/members/:id', authenticate, async (request, response) => {
    const member = await MemberModel.findById(request.params.id); if (!member) return error(response, 404, 'Member not found.')
    const group = await GroupModel.findById(member.group); if (!group) return error(response, 404, 'Group not found.')
    const project = await ProjectModel.findById(group.project); if (!project) return error(response, 404, 'Project not found.')
    const data = parsed(project.slug === 'alumni' ? alumniMemberSchema : memberSchema, request.body, response); if (!data) return
    if (data.groupId && data.groupId !== String(member.group)) {
      if (!idSchema(data.groupId)) return error(response, 400, 'Invalid group id.')
      const target = await GroupModel.findById(data.groupId); const source = await GroupModel.findById(member.group)
      if (!target || !source || String(target.project) !== String(source.project)) return error(response, 409, 'Member must stay in the same project.')
      const last = await MemberModel.findOne({ group: target._id }).sort({ order: -1 }); member.group = target._id; member.order = (last?.order ?? -1) + 1
    }
    delete data.groupId; Object.assign(member, data); await member.save()
    return response.json({ success: true, data: adminMember(member) })
  })
  app.post('/api/admin/members/:id/move', authenticate, async (request, response) => {
    const data = parsed(directionSchema, request.body, response); if (!data) return
    const member = await moveItem(MemberModel, 'group', request.params.id, data.direction); if (!member) return error(response, 404, 'Member not found.')
    return response.json({ success: true, data: { id: String(member._id), order: member.order } })
  })
  app.delete('/api/admin/members/:id', authenticate, async (request, response) => {
    if (!parsed(confirmSchema, request.body, response, 'Confirmation is required.')) return
    const member = await MemberModel.findById(request.params.id); if (!member) return error(response, 404, 'Member not found.')
    if (member.image) await ImageModel.deleteOne({ _id: member.image }); await member.deleteOne()
    return response.json({ success: true })
  })
  app.put('/api/admin/members/:id/photo', authenticate, rawImage, async (request, response) => {
    const member = await MemberModel.findById(request.params.id); if (!member) return error(response, 404, 'Member not found.')
    return replaceImage(member, 'image', request, response)
  })
  app.delete('/api/admin/members/:id/photo', authenticate, async (request, response) => {
    const member = await MemberModel.findById(request.params.id); if (!member) return error(response, 404, 'Member not found.')
    if (member.image) await ImageModel.deleteOne({ _id: member.image }); member.image = null; await member.save()
    return response.json({ success: true, data: { imageUrl: null } })
  })
}
