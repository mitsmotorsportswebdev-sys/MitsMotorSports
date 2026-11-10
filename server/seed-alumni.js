import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { Group, Image, Member, Project } from './team-model.js'
import { alumniGroupSeedSchema, alumniMemberSeedSchema, projectSeedSchema } from './team-utils.js'

const expected = { '2025': 12, '2024': 15, '2023': 6 }

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

export async function buildAlumniPagePlan(sourcePath = new URL('../src/data/alumni.ts', import.meta.url)) {
  const source = await fs.readFile(sourcePath, 'utf8')
  const alumni = literal(source, 'export const alumni').filter((member) => member.active)
  const counts = Object.fromEntries(Object.entries(expected).map(([year]) => [year, 0]))
  const byYear = new Map()
  for (const member of alumni) {
    if (!byYear.has(member.year)) byYear.set(member.year, [])
    byYear.get(member.year).push(member)
  }
  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a))
  const actual = Object.fromEntries(years.map((year) => [year, byYear.get(year).length]))
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Alumni data counts differ: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`)
  }
  const project = validate('Project', 'alumni', projectSeedSchema, { slug: 'alumni' }, Project)
  const projectId = new mongoose.Types.ObjectId()
  const groups = years.map((year, order) => {
    const groupId = new mongoose.Types.ObjectId()
    const group = validate('Group', `alumni/${year}`, alumniGroupSeedSchema, { _id: groupId, project: projectId, name: year, order }, Group)
    const members = byYear.get(year).map((item, memberOrder) => validate('Member', `alumni/${year}/${item.name}`, alumniMemberSeedSchema, {
      _id: new mongoose.Types.ObjectId(),
      group: groupId,
      name: item.name,
      ...(item.role ? { role: item.role } : {}),
      image: null,
      visible: item.active !== false,
      order: memberOrder,
    }, Member))
    counts[year] = members.length
    return { group, members }
  })
  return { project: { ...project, _id: projectId }, groups, counts }
}

export async function seedAlumniPage({ ProjectModel = Project, GroupModel = Group, MemberModel = Member, ImageModel = Image } = {}) {
  if (await ProjectModel.exists({ slug: 'alumni' })) {
    throw new Error('Alumni project already exists. Run reset-alumni.js --yes first.')
  }
  const plan = await buildAlumniPagePlan()
  await ProjectModel.create(plan.project)
  for (const section of plan.groups) {
    await GroupModel.create(section.group)
    await MemberModel.insertMany(section.members)
  }
  return plan
}

export async function resetAlumniPage({ ProjectModel = Project, GroupModel = Group, MemberModel = Member, ImageModel = Image } = {}) {
  const project = await ProjectModel.findOne({ slug: 'alumni' })
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  const databaseName = new URL(config.mongoUri).pathname.replace(/^\/+/, '')
  try {
    await mongoose.connect(config.mongoUri)
    const plan = await seedAlumniPage()
    const total = plan.groups.reduce((count, group) => count + group.members.length, 0)
    console.log(`Database: ${databaseName}`)
    console.log(`Seed complete: alumni (${plan.groups.length} groups, ${total} members)`)
    for (const group of plan.groups) console.log(`${group.group.name}: ${group.members.length} members`)
  } catch (error) {
    console.error(error?.stack || error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
