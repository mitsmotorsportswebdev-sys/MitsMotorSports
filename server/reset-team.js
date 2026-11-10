import mongoose from 'mongoose'
import { loadConfig } from './config.js'

const config = loadConfig()
const databaseName = new URL(config.mongoUri).pathname.replace(/^\/+/, '')
if (!databaseName) throw new Error('MONGODB_URI must include a database name.')
console.log(`Database: ${databaseName}`)
if (/prod(uction)?|live/i.test(databaseName) || /prod(uction)?|live/i.test(config.mongoUri)) {
  throw new Error('Refusing to reset a URI that looks like production.')
}
if (process.argv[2] !== '--yes') throw new Error('This deletes all team data. Re-run with --yes to continue.')

await mongoose.connect(config.mongoUri)
try {
  for (const name of ['teamprojects', 'teamgroups', 'teammembers', 'teamimages']) {
    const exists = await mongoose.connection.db.listCollections({ name }).hasNext()
    if (exists) await mongoose.connection.db.dropCollection(name)
  }
  console.log('Team collections dropped.')
} finally {
  await mongoose.disconnect()
}
