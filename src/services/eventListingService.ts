export type EventRegistrationState = 'open' | 'full-waiting-list' | 'closed' | 'ended'

export type PublicEvent = {
  slug: string
  category: string
  title: string
  tagline: string
  description: string
  image: string
  date: string
  time: string
  venue: string
  location: string
  address: string
  entryFee: string
  eventType: string
  eligibility: string
  highlights: string[]
  rules: string[]
  eligibilityDetails: string[]
  schedule: { time: string; title: string; description: string }[]
  venueDescription: string
  seatLimit: number
  seatsLeft: number
  closingAt: string
  registrationState: EventRegistrationState
  ended: boolean
}

type EventsResponse = {
  success: boolean
  data: PublicEvent[]
  message?: string
}

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export class EventListingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EventListingError'
  }
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  let response: Response
  try {
    response = await fetch(`${apiUrl}/events`)
  } catch {
    throw new EventListingError('The events could not be loaded. Please check your connection and try again.')
  }

  let payload: EventsResponse | null = null
  try {
    payload = await response.json() as EventsResponse
  } catch {
    throw new EventListingError('The events response was not valid. Please try again.')
  }

  if (!response.ok || !payload.success) {
    throw new EventListingError(payload.message || 'The events could not be loaded. Please try again.')
  }

  return payload.data
}

export async function getPublicEvent(slug: string): Promise<PublicEvent> {
  let response: Response
  try {
    response = await fetch(`${apiUrl}/events/${encodeURIComponent(slug)}`)
  } catch {
    throw new EventListingError('The event could not be loaded. Please check your connection and try again.')
  }

  let payload: { success: boolean; data?: PublicEvent; message?: string } | null = null
  try {
    payload = await response.json() as { success: boolean; data?: PublicEvent; message?: string }
  } catch {
    throw new EventListingError('The event response was not valid. Please try again.')
  }

  if (!response.ok || !payload.success || !payload.data) {
    throw new EventListingError(payload.message || (response.status === 404 ? 'Event not found.' : 'The event could not be loaded. Please try again.'))
  }

  return payload.data
}
