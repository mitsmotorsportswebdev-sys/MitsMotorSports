import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { Legacy } from './legacy-model.js'
import { Image } from './team-model.js'

export async function resetLegacyPage({ LegacyModel = Legacy, ImageModel = Image } = {}) {
  const entries = await LegacyModel.find({}, { photos: 1 })
  const imageIds = entries.flatMap((entry) => entry.photos.map((photo) => photo.image).filter(Boolean))
  const [entryResult] = await Promise.all([
    LegacyModel.deleteMany({}),
    imageIds.length ? ImageModel.deleteMany({ _id: { $in: imageIds } }) : Promise.resolve(),
  ])
  return { entries: entryResult.deletedCount, images: imageIds.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  const databaseName = new URL(config.mongoUri).pathname.replace(/^\/+/, '')
  console.log(`Database: ${databaseName}`)
  try {
    await mongoose.connect(config.mongoUri)
    console.log(`Reset complete: ${JSON.stringify(await resetLegacyPage())}`)
  } catch (error) {
    console.error(error?.stack || error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
