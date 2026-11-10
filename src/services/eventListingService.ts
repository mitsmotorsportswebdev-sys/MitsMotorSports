export type RegistrationState = 'open' | 'closed' | 'ended'

export type PublicEvent = {
  id: string
  title: string
  description: string
  image: string
  eventDate: string
  time: string
  venue: string
  allowedYears: number[]
  participation: 'individual' | 'group'
  minTeamSize?: number
  maxTeamSize?: number
  collegeOnly: boolean
  seatLimit: number
  seatsLeft: number
  closingAt: string
  registrationState: RegistrationState
}

export type FieldErrors = Record<string, string[]>

export class EventListingError extends Error {
  status: number
  fields?: FieldErrors
  constructor(message: string, status = 0, fields?: FieldErrors) {
    super(message)
    this.name = 'EventListingError'
    this.status = status
    this.fields = fields
  }
}

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit) {
  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  } catch {
    throw new EventListingError('The events service could not be reached. Please try again.')
  }
  let payload: { success?: boolean; data?: T; message?: string; fields?: FieldErrors } | null = null
  try { payload = await response.json() } catch { payload = null }
  if (!response.ok || !payload?.success) {
    throw new EventListingError(payload?.message || 'The request could not be completed. Please try again.', response.status, payload?.fields)
  }
  return payload.data as T
}

export function getPublicEvents() {
  return request<PublicEvent[]>('/events')
}

export function getPublicEvent(id: string) {
  return request<PublicEvent>(`/events/${encodeURIComponent(id)}`)
}

export type RegistrationMember = { fullName: string; department?: string; year: number; collegeId?: string }
export type RegistrationPayload = {
  fullName: string
  email: string
  mobile: string
  department?: string
  year: number
  collegeId?: string
  collegeName?: string
  teamName?: string
  members?: RegistrationMember[]
  website: string
}

export function registerForEvent(id: string, payload: RegistrationPayload) {
  return request<{ id: string; status: string }>(`/events/${encodeURIComponent(id)}/registrations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
