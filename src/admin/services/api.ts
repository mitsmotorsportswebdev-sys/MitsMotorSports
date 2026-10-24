import { clearAuth, getToken } from './auth'
import type {
  AboutContent,
  AdminEvent,
  AdminUser,
  ApiEnvelope,
  AuthResponse,
  EventPayload,
  GalleryItem,
  HomeContent,
  ImageAsset,
  LegacyItem,
  Project,
  Sponsor,
  TeamMember,
} from '../types'

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  fields?: Record<string, string[]>

  constructor(message: string, status: number, fields?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (authenticated) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('The backend could not be reached.', 0)
  }

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = await response.json() as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (response.status === 401 && authenticated) {
    clearAuth()
    window.location.assign('/admin/login')
  }
  if (!response.ok) {
    throw new ApiError(payload?.message || getStatusMessage(response.status), response.status, payload?.fields)
  }
  return (payload?.data ?? payload) as T
}

function getStatusMessage(status: number) {
  if (status === 400) return 'Please check the submitted fields.'
  if (status === 403) return 'You do not have permission to perform that action.'
  if (status === 404) return 'The requested content was not found.'
  if (status === 409) return 'That content already exists.'
  if (status === 413) return 'The selected file is too large.'
  if (status === 429) return 'Too many requests. Try again shortly.'
  if (status >= 500) return 'The server encountered an error.'
  return 'Something went wrong.'
}

export const adminApi = {
  async login(email: string, password: string) {
    return request<AuthResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  getSession: () => request<{ user: AdminUser }>('/admin/session', {}, true),
  changePassword: (currentPassword: string, newPassword: string) => request<void>('/admin/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }, true),
  getHome: () => request<HomeContent | null>('/home'),
  updateHome: (content: Partial<HomeContent>) => request<HomeContent>('/admin/home', { method: 'PUT', body: JSON.stringify(content) }, true),
  getAbout: () => request<AboutContent | null>('/about'),
  updateAbout: (content: Partial<AboutContent>) => request<AboutContent>('/admin/about', { method: 'PUT', body: JSON.stringify(content) }, true),
  getProjects: () => request<Project[]>('/projects'),
  createProject: (project: Omit<Project, '_id'>) => request<Project>('/admin/projects', { method: 'POST', body: JSON.stringify(project) }, true),
  getTeam: () => request<TeamMember[]>('/team'),
  getAlumni: () => request<unknown[]>('/alumni'),
  getSponsors: () => request<Sponsor[]>('/sponsors'),
  getGallery: () => request<GalleryItem[]>('/gallery'),
  getLegacy: () => request<LegacyItem[]>('/legacy'),
  getEvents: () => request<AdminEvent[]>('/admin/events', {}, true),
  createEvent: (event: EventPayload) => request<AdminEvent>('/admin/events', {
    method: 'POST',
    body: JSON.stringify(event),
  }, true),
  updateEvent: (id: string, event: Omit<EventPayload, 'slug'>) => request<AdminEvent & { warning?: string }>(`/admin/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(event),
  }, true),
  uploadImage: async (page: string, file: File) => {
    const body = new FormData()
    body.append('image', file)
    return request<ImageAsset>(`/admin/upload/${page}`, { method: 'POST', body }, true)
  },
  checkConnection: () => request('/home'),
}

export type ContentCollection = Project | TeamMember | Sponsor | GalleryItem | LegacyItem | unknown
export type ContentLoader = () => Promise<ContentCollection[]>
export type User = AdminUser
