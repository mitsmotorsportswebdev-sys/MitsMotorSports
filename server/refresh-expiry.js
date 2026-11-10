import 'dotenv/config'
import mongoose from 'mongoose'
import { Event, Registration } from './events-model.js'
import { loadConfig } from './config.js'
import { registrationExpiry } from './event-utils.js'

export async function refreshExpiry({ EventModel = Event, RegistrationModel = Registration, retentionDays }) {
  const events = await EventModel.find({}, { _id: 1, eventDate: 1 })
  let refreshed = 0
  for (const event of events) {
    const result = await RegistrationModel.updateMany(
      { event: event._id },
      { expireAt: registrationExpiry(event.eventDate, retentionDays) },
    )
    refreshed += result.matchedCount ?? result.n
  }
  console.log(`Refreshed expiry for ${refreshed} registrations.`)
  return refreshed
}

if (process.argv[1] && process.argv[1].endsWith('server\\refresh-expiry.js')) {
  const config = loadConfig()
  await mongoose.connect(config.mongoUri)
  try {
    await refreshExpiry({ retentionDays: config.retentionDays })
  } finally {
    await mongoose.disconnect()
  }
}
