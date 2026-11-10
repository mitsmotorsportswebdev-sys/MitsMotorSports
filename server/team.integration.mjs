import assert from 'node:assert/strict'
import test from 'node:test'
import express from 'express'
import mongoose from 'mongoose'
import request from 'supertest'
import { Group, Image, Member, Project } from './team-model.js'
import { mountTeamRoutes } from './team-routes.js'

const uri = process.env.EVENTS_TEST_MONGODB_URI
if (!uri) throw new Error('EVENTS_TEST_MONGODB_URI is required; refusing to run integration tests')
if (!new URL(uri).pathname.replace(/^\/+/, '').endsWith('_test')) throw new Error('EVENTS_TEST_MONGODB_URI database name must end in _test')

const app = express()
app.use(express.json())
mountTeamRoutes(app, {
  ProjectModel: Project, GroupModel: Group, MemberModel: Member, ImageModel: Image,
  authenticate: (request_, response, next) => (request_.headers.authorization ? next() : response.status(401).json({ success: false })),
})
const api = request(app)
const auth = { Authorization: 'Bearer integration-test' }
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x01, 0x02])
const bodyOf = (response) => JSON.stringify(response.body)
const status = (response, expected) => assert.equal(response.status, expected, bodyOf(response))
const value = (actual, expected, response) => assert.deepEqual(actual, expected, bodyOf(response))

test.before(async () => mongoose.connect(uri))
test.beforeEach(async () => Promise.all([Project.deleteMany({}), Group.deleteMany({}), Member.deleteMany({}), Image.deleteMany({})]))
test.after(async () => mongoose.disconnect())

async function project(slug = `project-${Math.random().toString(16).slice(2)}`) {
  return Project.create({ slug, title: slug, tagline: 'Tag', overview: 'Overview', stats: [], specs: [] })
}
async function group(project_, name, order = 0) {
  return Group.create({ project: project_._id, name, order })
}
async function member(group_, name, order, visible = true) {
  return Member.create({ group: group_._id, name, role: 'Role', order, visible })
}
function admin(path, method = 'get') {
  return api[method](`/api/admin${path}`).set(auth)
}
async function upload(path, data = jpeg, contentType = 'image/jpeg') {
  return api.put(path).set({ ...auth, 'Content-Type': contentType }).send(data)
}

test('public project hides members and unknown slugs are 404', async () => {
  const project_ = await project('aethon')
  const group_ = await group(project_, 'Crew')
  await member(group_, 'Visible', 0)
  await member(group_, 'Hidden', 1, false)
  const response = await api.get('/api/projects/aethon')
  status(response, 200)
  value(response.body.data.memberCount, 1, response)
  value(response.body.data.groups[0].members.length, 1, response)
  const unknown = await api.get('/api/projects/nope')
  status(unknown, 404)
})

test('admin routes require login', async () => {
  const response = await api.get('/api/admin/projects')
  status(response, 401)
})

test('members and groups move in order and stop at the ends', async () => {
  const project_ = await project()
  const first = await group(project_, 'First', 0)
  const second = await group(project_, 'Second', 1)
  const third = await group(project_, 'Third', 2)
  const one = await member(first, 'One', 0)
  const two = await member(first, 'Two', 1)
  const three = await member(first, 'Three', 2)
  let response = await admin(`/members/${two._id}/move`, 'post').send({ direction: 'down' })
  status(response, 200)
  value((await Member.find({ group: first._id }).sort({ order: 1 })).map((item) => item.name), ['One', 'Three', 'Two'], response)
  response = await admin(`/members/${two._id}/move`, 'post').send({ direction: 'up' })
  status(response, 200)
  value((await Member.find({ group: first._id }).sort({ order: 1 })).map((item) => item.name), ['One', 'Two', 'Three'], response)
  response = await admin(`/members/${one._id}/move`, 'post').send({ direction: 'up' })
  status(response, 200)
  value((await Member.find({ group: first._id }).sort({ order: 1 })).map((item) => item.name), ['One', 'Two', 'Three'], response)
  response = await admin(`/members/${three._id}/move`, 'post').send({ direction: 'down' })
  status(response, 200)
  value((await Member.find({ group: first._id }).sort({ order: 1 })).map((item) => item.name), ['One', 'Two', 'Three'], response)
  response = await admin(`/groups/${first._id}/move`, 'post').send({ direction: 'down' })
  status(response, 200)
  value((await Group.find({ project: project_._id }).sort({ order: 1 })).map((item) => item.name), ['Second', 'First', 'Third'], response)
  response = await admin(`/groups/${first._id}/move`, 'post').send({ direction: 'up' })
  status(response, 200)
  value((await Group.find({ project: project_._id }).sort({ order: 1 })).map((item) => item.name), ['First', 'Second', 'Third'], response)
  response = await admin(`/groups/${first._id}/move`, 'post').send({ direction: 'up' })
  status(response, 200)
  value((await Group.find({ project: project_._id }).sort({ order: 1 })).map((item) => item.name), ['First', 'Second', 'Third'], response)
  response = await admin(`/groups/${third._id}/move`, 'post').send({ direction: 'down' })
  status(response, 200)
  value((await Group.find({ project: project_._id }).sort({ order: 1 })).map((item) => item.name), ['First', 'Second', 'Third'], response)
})

test('groups require confirmation and cannot delete non-empty sections', async () => {
  const project_ = await project()
  const occupied = await group(project_, 'Occupied')
  const empty = await group(project_, 'Empty', 1)
  await member(occupied, 'Member', 0)
  let response = await admin(`/groups/${occupied._id}`, 'delete').send({ confirm: true })
  status(response, 409)
  response = await admin(`/groups/${empty._id}`, 'delete').send({})
  status(response, 400)
  response = await admin(`/groups/${empty._id}`, 'delete').send({ confirm: true })
  status(response, 200)
  value(await Group.exists({ _id: empty._id }), null, response)
})

test('member moves only within its project and appends to the target group', async () => {
  const firstProject = await project()
  const secondProject = await project()
  const source = await group(firstProject, 'Source')
  const target = await group(firstProject, 'Target', 1)
  const other = await group(secondProject, 'Other')
  await member(target, 'Existing', 0)
  const moving = await member(source, 'Moving', 0)
  let response = await admin(`/members/${moving._id}`, 'patch').send({ name: 'Moving', role: 'Role', groupId: String(target._id) })
  status(response, 200)
  value((await Member.findById(moving._id)).order, 1, response)
  value(String((await Member.findById(moving._id)).group), String(target._id), response)
  response = await admin(`/members/${moving._id}`, 'patch').send({ name: 'Moving', role: 'Role', groupId: String(other._id) })
  status(response, 409)
})

test('public project preserves order, visibility, and image URLs', async () => {
  const project_ = await project('aethon')
  const first = await group(project_, 'First', 0)
  const second = await group(project_, 'Second', 1)
  const visible = await member(first, 'Visible', 0)
  await member(first, 'Hidden', 1, false)
  await member(second, 'Second member', 0)
  let response = await api.get('/api/projects/aethon')
  status(response, 200)
  value(response.body.data.groups.map((item) => item.name), ['First', 'Second'], response)
  value(response.body.data.groups[0].members.map((item) => item.name), ['Visible'], response)
  value(response.body.data.memberCount, 2, response)
  value(response.body.data.groups[0].members[0].imageUrl, null, response)
  const photo = await upload(`/api/admin/members/${visible._id}/photo`)
  status(photo, 200)
  const imageId = String((await Member.findById(visible._id)).image)
  response = await api.get('/api/projects/aethon')
  status(response, 200)
  value(response.body.data.groups[0].members[0].imageUrl, `/api/images/${imageId}`, response)
})

test('photos validate bytes, expose headers, replace, and delete images', async () => {
  const project_ = await project()
  const group_ = await group(project_, 'Crew')
  const member_ = await member(group_, 'Member', 0)
  let response = await upload(`/api/admin/members/${member_._id}/photo`)
  status(response, 200)
  const first = await Member.findById(member_._id)
  const firstId = String(first.image)
  response = await api.get(`/api/images/${firstId}`)
  status(response, 200)
  value(response.headers['content-type'], 'image/jpeg', response)
  value(response.headers['x-content-type-options'], 'nosniff', response)
  value(response.headers['cache-control'], 'public, max-age=31536000, immutable', response)
  value(Buffer.from(response.body), jpeg, response)
  response = await upload(`/api/admin/members/${member_._id}/photo`, Buffer.from([0xff, 0xd8, 0xff, 0x03]))
  status(response, 200)
  value(await Image.countDocuments({}), 1, response)
  value(await Image.exists({ _id: firstId }), null, response)
  response = await admin(`/members/${member_._id}/photo`, 'delete')
  status(response, 200)
  value(await Image.countDocuments({}), 0, response)
  response = await upload(`/api/admin/members/${member_._id}/photo`, Buffer.from('<svg></svg>'), 'image/svg+xml')
  status(response, 415)
  response = await upload(`/api/admin/members/${member_._id}/photo`, Buffer.from('<svg></svg>'), 'image/jpeg')
  status(response, 415)
  response = await upload(`/api/admin/members/${member_._id}/photo`, Buffer.alloc(400 * 1024 + 1), 'image/jpeg')
  status(response, 413)
  response = await api.get('/api/images/not-an-id')
  status(response, 404)
  response = await api.get(`/api/images/${new mongoose.Types.ObjectId()}`)
  status(response, 404)
})

test('deleting a member requires confirmation and deletes its photo', async () => {
  const project_ = await project()
  const group_ = await group(project_, 'Crew')
  const member_ = await member(group_, 'Member', 0)
  let response = await upload(`/api/admin/members/${member_._id}/photo`)
  status(response, 200)
  response = await admin(`/members/${member_._id}`, 'delete').send({})
  status(response, 400)
  response = await admin(`/members/${member_._id}`, 'delete').send({ confirm: true })
  status(response, 200)
  value(await Member.exists({ _id: member_._id }), null, response)
  value(await Image.countDocuments({}), 0, response)
})

test('hero photo uploads, replaces, and deletes', async () => {
  const project_ = await project('aethon')
  let response = await upload('/api/admin/projects/aethon/hero')
  status(response, 200)
  const first = await Project.findById(project_._id)
  const firstId = String(first.heroImage)
  response = await upload('/api/admin/projects/aethon/hero', Buffer.from([0xff, 0xd8, 0xff, 0x04]))
  status(response, 200)
  value(await Image.countDocuments({}), 1, response)
  value(await Image.exists({ _id: firstId }), null, response)
  response = await admin('/projects/aethon/hero', 'delete')
  status(response, 200)
  value((await Project.findById(project_._id)).heroImage, null, response)
  value(await Image.countDocuments({}), 0, response)
})

test('project patch validates editable text, stats, unknown fields, and links', async () => {
  await project('aethon')
  let response = await admin('/projects/aethon', 'patch').send({ title: ' Aethon Updated ' })
  status(response, 200)
  value(response.body.data.title, 'Aethon Updated', response)
  response = await admin('/projects/aethon', 'patch').send({ stats: Array.from({ length: 5 }, (_, index) => ({ label: `S${index}`, value: 'V' })) })
  status(response, 400)
  response = await admin('/projects/aethon', 'patch').send({ unknown: 'field' })
  status(response, 400)
  response = await admin('/projects/aethon', 'patch').send({ primaryCtaHref: 'javascript:alert(1)' })
  if (response.status === 200) assert.fail(`BUG: javascript button link accepted: ${bodyOf(response)}`)
  status(response, 400)
})
