import mongoose from 'mongoose'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { Admin } from './model.js'

const config = loadConfig()
await mongoose.connect(config.mongoUri)
const app = createApp({ Admin, config })
app.listen(config.port, () => console.log(`Admin API listening on port ${config.port}`))
