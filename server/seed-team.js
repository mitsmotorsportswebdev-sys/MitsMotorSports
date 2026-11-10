import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import { loadConfig } from './config.js'
import { Group, Image, Member, Project } from './team-model.js'
import { groupSeedSchema, memberSeedSchema, projectSeedSchema } from './team-utils.js'

function literal(source, marker, open, close, bindings = {}) {
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`Could not find ${marker}`)
  const equals = source.indexOf('=', start)
  const begin = source.indexOf(open, equals >= 0 ? equals : start)
  let depth = 0
  let quote = null
  for (let index = begin; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (character === quote && source[index - 1] !== '\\') quote = null
      continue
    }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue }
    if (character === open) depth += 1
    if (character === close && --depth === 0) {
      return Function(...Object.keys(bindings), `return ${source.slice(begin, index + 1)}`)(...Object.values(bindings))
    }
  }
  throw new Error(`Could not parse ${marker}`)
}

function validationError(kind, name, error) {
  const details = error?.issues?.map((issue) => `${issue.path.join('.') || '(document)'}: ${issue.message}`).join('; ') || error?.message || 'invalid document'
  return new Error(`${kind} "${name}" failed validation: ${details}`)
}

function validate(kind, name, schema, document, Model) {
  const parsed = schema.safeParse(document)
  if (!parsed.success) throw validationError(kind, name, parsed.error)
  const modelError = new Model(document).validateSync()
  if (modelError) throw validationError(kind, name, modelError)
  return parsed.data
}

function projectDocument(projectData) {
  const document = {
    slug: projectData.id,
    title: projectData.name,
    tagline: projectData.description,
    overview: projectData.overview.description,
    stats: projectData.overview.stats,
    specs: projectData.specifications.map(({ label, value, description, icon }) => ({ label, value, description, icon })),
    sections: projectData.sections.map(({ title, description, bullets }) => ({ title, description, bullets })),
    heroEyebrow: projectData.id === 'ebaja' ? 'Electric off-road racing' : 'Performance racing',
    primaryCtaLabel: projectData.id === 'ebaja' ? 'View specifications' : 'Explore specs',
    primaryCtaHref: '#technical-specs',
    secondaryCtaLabel: 'Meet the team',
    secondaryCtaHref: '#team',
    teamSectionLabel: 'Project team',
    teamSectionTitle: 'MEET THE CREW',
    specsSectionLabel: 'Technical package',
    specsSectionTitle: 'Technical specifications',
    engineeringSectionLabel: 'Engineering focus',
  }
  return document
}

async function buildPlan(source, sourceFile = 'src/data/projects.ts') {
  const aethonTeam = literal(source, 'export const aethonTeam', '[', ']')
  const ebajaTeam = literal(source, 'export const ebajaTeam', '[', ']')
  const projectData = [
    literal(source, 'export const aethonProject', '{', '}', { aethonTeam }),
    literal(source, 'export const ebajaProject', '{', '}', { ebajaTeam }),
  ]
  const plan = []
  for (const data of projectData) {
    const project = { ...projectDocument(data), _id: new mongoose.Types.ObjectId() }
    validate('Project', project.slug, projectSeedSchema, project, Project)
    const team = data.id === 'ebaja' ? ebajaTeam : aethonTeam
    const groups = [...new Set(team.map((item) => item.department).filter(Boolean))].map((name, order) => {
      const group = { _id: new mongoose.Types.ObjectId(), project: project._id, name, order }
      validate('Group', `${project.slug}/${name}`, groupSeedSchema, group, Group)
      const members = team.filter((item) => item.department === name).map((item, memberOrder) => {
        const member = {
          _id: new mongoose.Types.ObjectId(),
          group: group._id,
          name: item.name,
          role: item.role || item.category,
          extras: item.department || '',
          image: null,
          visible: item.active !== false,
          order: memberOrder,
        }
        validate('Member', `${project.slug}/${name}/${item.name}`, memberSeedSchema, member, Member)
        return member
      })
      return { group, members }
    })
    plan.push({ project, groups, sourceFile })
  }
  return plan
}

async function main() {
  const inserted = { projects: [], groups: [], members: [], images: [] }
  try {
    const sourcePath = 'src/data/projects.ts'
    const sourceUrl = new URL(`../${sourcePath}`, import.meta.url)
    const source = await fs.readFile(sourceUrl, 'utf8')
    const existingProjects = await Project.find({ slug: { $in: ['aethon', 'ebaja'] } }, { _id: 1, slug: 1 }).lean()
    if (existingProjects.length) {
      const projectIds = existingProjects.map((project) => project._id)
      const groups = await Group.countDocuments({ project: { $in: projectIds } })
      const groupIds = await Group.find({ project: { $in: projectIds } }, { _id: 1 }).lean()
      const members = await Member.countDocuments({ group: { $in: groupIds.map((group) => group._id) } })
      throw new Error(`Team seed refused: ${existingProjects.length} project(s) already exist with ${groups} group(s) and ${members} member(s). Drop the team collections to start over`)
    }
    const plan = await buildPlan(source, sourcePath)
    for (const item of plan) {
      const projectGroups = item.groups.length
      const projectMembers = item.groups.reduce((count, group) => count + group.members.length, 0)
      console.log(`Project "${item.project.slug}": ${projectGroups} groups, ${projectMembers} members (source: ${item.sourceFile})`)
      if (projectGroups === 0 || projectMembers === 0) {
        throw new Error(`Team seed aborted: project "${item.project.slug}" found ${projectGroups} groups and ${projectMembers} members in ${item.sourceFile}`)
      }
    }
    for (const item of plan) {
      await Project.create(item.project)
      inserted.projects.push(item.project._id)
      for (const groupItem of item.groups) {
        await Group.create(groupItem.group)
        inserted.groups.push(groupItem.group._id)
        for (const member of groupItem.members) {
          await Member.create(member)
          inserted.members.push(member._id)
        }
      }
    }
    for (const item of plan) {
      const projectGroups = item.groups.reduce((count, group) => count + 1, 0)
      const projectMembers = item.groups.reduce((count, group) => count + group.members.length, 0)
      console.log(`Seed complete: ${item.project.slug} (${projectGroups} groups, ${projectMembers} members)`)
    }
  } catch (error) {
    console.error(error?.stack || error)
    await Member.deleteMany({ _id: { $in: inserted.members } })
    await Group.deleteMany({ _id: { $in: inserted.groups } })
    await Project.deleteMany({ _id: { $in: inserted.projects } })
    await Image.deleteMany({ _id: { $in: inserted.images } })
    console.error('Seed rolled back')
    throw error
  }
}

const config = loadConfig()
try {
  await mongoose.connect(config.mongoUri)
  await main()
} catch (error) {
  console.error(error?.stack || error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
