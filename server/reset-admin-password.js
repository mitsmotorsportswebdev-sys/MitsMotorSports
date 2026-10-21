import mongoose from 'mongoose'
import { loadConfig } from './config.js'
import { Admin } from './model.js'
import { promptPassword } from './password.js'
import { resetAdminPassword } from './provision.js'

const config = loadConfig()
await mongoose.connect(config.mongoUri)
try {
  await resetAdminPassword({ Admin, config, password: await promptPassword('New admin password: ') })
  console.log('Admin password reset.')
} finally {
  await mongoose.disconnect()
}
