import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { Legacy } from './legacy-model.js'

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

export async function buildLegacySeedPlan(sourcePath = new URL('../src/data/legacy.ts', import.meta.url)) {
  const source = await fs.readFile(sourcePath, 'utf8')
  const entries = literal(source, 'export const legacyEntries').filter((entry) => entry.active)
  if (entries.length !== 2) throw new Error(`Legacy seed expected 2 active entries, found ${entries.length}`)
  return entries.map((entry) => ({
    year: Number(entry.year),
    season: entry.season || '',
    competition: entry.competition,
    location: entry.location || '',
    result: entry.result || '',
    achievements: entry.achievements.map(({ title, description }) => ({ title, description })),
    photos: entry.images.slice(0, 3).map(({ alt, caption }) => ({ image: null, alt: alt || '', caption: caption || '' })),
    visible: true,
  }))
}

export async function seedLegacyPage({ LegacyModel = Legacy } = {}) {
  if (await LegacyModel.exists()) throw new Error('Legacy entries already exist. Clear the legacy collection before seeding again.')
  const plan = await buildLegacySeedPlan()
  await LegacyModel.insertMany(plan)
  return plan
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  const databaseName = new URL(config.mongoUri).pathname.replace(/^\/+/, '')
  try {
    await mongoose.connect(config.mongoUri)
    const plan = await seedLegacyPage()
    console.log(`Database: ${databaseName}`)
    console.log(`Seed complete: legacy (${plan.length} entries)`)
  } catch (error) {
    console.error(error?.stack || error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
