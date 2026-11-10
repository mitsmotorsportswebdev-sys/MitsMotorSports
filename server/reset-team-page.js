import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { resetTeamPage } from './seed-team-page.js'

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  if (process.argv[2] !== '--yes') throw new Error('This deletes only team page data. Re-run with --yes to continue.')
  try {
    await mongoose.connect(config.mongoUri)
    console.log(`Reset complete: ${JSON.stringify(await resetTeamPage())}`)
  } catch (error) {
    console.error(error?.stack || error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
