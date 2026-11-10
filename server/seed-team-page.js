import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { Group, Image, Member, Project } from './team-model.js'
import { groupSeedSchema, memberSeedSchema, projectSeedSchema } from './team-utils.js'

const categories = [
  'Faculty In Charge',
  'Executive Committee',
  'Program Council — Leads',
  'Program Council — Subcom',
  'Program Council — Other/Leadership',
  'Media Team',
]

function literal(source, marker) {
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`Could not find ${marker}`)
  const begin = source.indexOf('[', source.indexOf('=', start))
  let depth = 0
  let quote = null
  for (let index = begin; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (character === quote && source[index - 1] !== '\\') quote = null
      continue
    }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue }
    if (character === '[') depth += 1
    if (character === ']' && --depth === 0) return Function(`return ${source.slice(begin, index + 1)}`)()
  }
  throw new Error(`Could not parse ${marker}`)
}

function validate(kind, name, schema, document, Model) {
  const parsed = schema.safeParse(document)
  if (!parsed.success) throw new Error(`${kind} "${name}" failed validation: ${parsed.error.message}`)
  const modelError = new Model(document).validateSync()
  if (modelError) throw new Error(`${kind} "${name}" failed validation: ${modelError.message}`)
  return parsed.data
}

export async function buildTeamPagePlan(sourcePath = new URL('../src/data/team.ts', import.meta.url)) {
  const source = await fs.readFile(sourcePath, 'utf8')
  const members = literal(source, 'export const teamMembers')
  const project = validate('Project', 'team', projectSeedSchema, { slug: 'team' }, Project)
  const projectId = new mongoose.Types.ObjectId()
  const groups = categories.map((name, order) => {
    const group = validate('Group', `team/${name}`, groupSeedSchema, { _id: new mongoose.Types.ObjectId(), project: projectId, name, order }, Group)
    const groupMembers = members.filter((member) => member.category === name).map((item) => validate('Member', `team/${name}/${item.name}`, memberSeedSchema, {
      _id: new mongoose.Types.ObjectId(),
      group: group._id,
      name: item.name,
      role: name === 'Faculty In Charge' ? 'Faculty Advisor' : (item.role || 'Team Member'),
      extras: item.department || '',
      image: null,
      visible: item.active !== false,
      order: item.displayOrder,
    }, Member))
    return { group, members: groupMembers }
  })
  return { project: { ...project, _id: projectId }, groups }
}

export async function resetTeamPage({ ProjectModel = Project, GroupModel = Group, MemberModel = Member, ImageModel = Image } = {}) {
  const project = await ProjectModel.findOne({ slug: 'team' })
  if (!project) return { projects: 0, groups: 0, members: 0, images: 0 }
  const groups = await GroupModel.find({ project: project._id }, { _id: 1 })
  const groupIds = groups.map((group) => group._id)
  const members = await MemberModel.find({ group: { $in: groupIds } }, { image: 1 })
  const imageIds = members.map((member) => member.image).filter(Boolean)
  if (project.heroImage) imageIds.push(project.heroImage)
  const [memberResult, groupResult] = await Promise.all([
    MemberModel.deleteMany({ group: { $in: groupIds } }),
    GroupModel.deleteMany({ project: project._id }),
  ])
  await ImageModel.deleteMany({ _id: { $in: imageIds } })
  await ProjectModel.deleteOne({ _id: project._id })
  return { projects: 1, groups: groupResult.deletedCount, members: memberResult.deletedCount, images: imageIds.length }
}

export async function seedTeamPage(models = {}) {
  const { ProjectModel = Project, GroupModel = Group, MemberModel = Member, ImageModel = Image } = models
  await resetTeamPage({ ProjectModel, GroupModel, MemberModel, ImageModel })
  const plan = await buildTeamPagePlan()
  await ProjectModel.create(plan.project)
  for (const section of plan.groups) {
    await GroupModel.create(section.group)
    if (section.members.length) await MemberModel.insertMany(section.members)
  }
  return plan
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  try {
    await mongoose.connect(config.mongoUri)
    const plan = await seedTeamPage()
    console.log(`Seed complete: team (${plan.groups.length} sections, ${plan.groups.reduce((count, section) => count + section.members.length, 0)} members)`)
    for (const section of plan.groups) console.log(`${section.group.name}: ${section.members.length}`)
  } catch (error) {
    console.error(error?.stack || error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
