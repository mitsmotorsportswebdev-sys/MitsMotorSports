import mongoose from 'mongoose'
import { loadConfig } from './config.js'

const config = loadConfig()
const databaseName = new URL(config.mongoUri).pathname.replace(/^\/+/, '')
console.log(`Database: ${databaseName}`)
if (/prod(uction)?|live/i.test(databaseName) || /prod(uction)?|live/i.test(config.mongoUri)) {
  throw new Error('Refusing to reset a URI that looks like production.')
}
if (process.argv[2] !== '--yes') throw new Error('This deletes all event data. Re-run with --yes to continue.')

await mongoose.connect(config.mongoUri)
try {
  for (const name of ['events', 'registrations']) {
    const exists = await mongoose.connection.db.listCollections({ name }).hasNext()
    if (exists) await mongoose.connection.db.dropCollection(name)
  }
  console.log('Events and registrations collections dropped.')
} finally {
  await mongoose.disconnect()
}
