import { clearAuth, getToken } from './auth'
import type {
  AboutContent,
  AdminEvent,
  AdminUser,
  ApiEnvelope,
  AuthResponse,
  GalleryItem,
  HomeContent,
  ImageAsset,
  LegacyItem,
  Project,
  Sponsor,
  TeamMember,
} from '../types'

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export function resolveImageUrl(url?: string | null): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url
  if (!apiUrl) return url
  if (/^https?:\/\//i.test(apiUrl)) {
    try {
      const parsed = new URL(apiUrl)
      const origin = parsed.origin
      if (url.startsWith('/')) {
        const apiPath = parsed.pathname.replace(/\/$/, '')
        if (apiPath && (url === apiPath || url.startsWith(`${apiPath}/`))) {
          return `${origin}${url}`
        }
        return `${origin}${apiPath}${url}`
      }
      return `${origin}/${url}`
    } catch {
      return url
    }
  }
  return url
}

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

export type AdminMember = { id: string; name: string; role?: string; extras: string; imageUrl: string | null; imageId?: string | null; groupId: string; order: number; visible: boolean }
export type AdminGroup = { id: string; name: string; order: number; members: AdminMember[] }
export type AdminProjectSummary = { id: string; slug: string; title: string; tagline: string; heroImageUrl: string | null; memberCount?: number }
export type AdminProject = AdminProjectSummary & { overview: string; stats: Array<{ label: string; value: string }>; specs: Array<{ label: string; value: string; description?: string; icon?: string }>; sections: Array<{ title: string; description: string; bullets: string[] }>; groups: AdminGroup[] }

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
  getAdminProjects: () => request<AdminProjectSummary[]>('/admin/projects', {}, true),
  getAdminProject: (slug: string) => request<AdminProject>(`/admin/projects/${slug}`, {}, true),
  updateAdminProject: (slug: string, project: Partial<AdminProject>) => request<AdminProject>(`/admin/projects/${slug}`, { method: 'PATCH', body: JSON.stringify(project) }, true),
  createGroup: (slug: string, name: string) => request(`/admin/projects/${slug}/groups`, { method: 'POST', body: JSON.stringify({ name }) }, true),
  renameGroup: (id: string, name: string) => request(`/admin/groups/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }, true),
  moveGroup: (id: string, direction: 'up' | 'down') => request(`/admin/groups/${id}/move`, { method: 'POST', body: JSON.stringify({ direction }) }, true),
  deleteGroup: (id: string) => request(`/admin/groups/${id}`, { method: 'DELETE', body: JSON.stringify({ confirm: true }) }, true),
  createMember: (groupId: string, member: Omit<AdminMember, 'id' | 'groupId' | 'order' | 'imageUrl' | 'imageId' | 'extras'> & { extras?: string }) => request<AdminMember>(`/admin/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify(member) }, true),
  updateMember: (id: string, member: Partial<AdminMember>) => request<AdminMember>(`/admin/members/${id}`, { method: 'PATCH', body: JSON.stringify(member) }, true),
  moveMember: (id: string, direction: 'up' | 'down') => request(`/admin/members/${id}/move`, { method: 'POST', body: JSON.stringify({ direction }) }, true),
  deleteMember: (id: string) => request(`/admin/members/${id}`, { method: 'DELETE', body: JSON.stringify({ confirm: true }) }, true),
  uploadProjectHero: (slug: string, file: File) => request<{ imageUrl: string }>(`/admin/projects/${slug}/hero`, { method: 'PUT', body: file, headers: { 'Content-Type': 'image/jpeg' } }, true),
  deleteProjectHero: (slug: string) => request(`/admin/projects/${slug}/hero`, { method: 'DELETE' }, true),
  uploadMemberPhoto: (id: string, file: File) => request<{ imageUrl: string }>(`/admin/members/${id}/photo`, { method: 'PUT', body: file, headers: { 'Content-Type': 'image/jpeg' } }, true),
  deleteMemberPhoto: (id: string) => request<{ imageUrl: null }>(`/admin/members/${id}/photo`, { method: 'DELETE' }, true),
  createProject: (project: Omit<Project, '_id'>) => request<Project>('/admin/projects', { method: 'POST', body: JSON.stringify(project) }, true),
  getTeam: () => request<TeamMember[]>('/team'),
  getAlumni: () => request<unknown[]>('/alumni'),
  getSponsors: () => request<Sponsor[]>('/sponsors'),
  getGallery: () => request<GalleryItem[]>('/gallery'),
  getLegacy: () => request<LegacyItem[]>('/legacy'),
  getEvents: () => request<AdminEvent[]>('/admin/events', {}, true),
  setRegistrationOpen: (id: string, open: boolean) => request<AdminEvent>(`/admin/events/${id}/registration`, {
    method: 'PATCH',
    body: JSON.stringify({ open }),
  }, true),
  getEvent: (id: string) => request<AdminEvent & EventFormPayload>(`/admin/events/${id}`, {}, true),
  createEvent: (event: EventFormPayload) => request<AdminEvent>('/admin/events', {
    method: 'POST',
    body: JSON.stringify(event),
  }, true),
  deleteEvent: (id: string) => request<void>(`/admin/events/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ confirm: true }),
  }, true),
  getRegistrations: (id: string, search = '', status = '') => request<Registration[]>(`/admin/events/${id}/registrations?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}) })}`, {}, true),
  updateRegistration: (id: string, registration: RegistrationPayload) => request<Registration>(`/admin/registrations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(registration),
  }, true),
  approveRegistration: (id: string) => request<Registration>(`/admin/registrations/${id}/approve`, { method: 'POST' }, true),
  approveAll: (id: string) => request<{ approved: number }>(`/admin/events/${id}/approve-all`, { method: 'POST' }, true),
  deleteRegistration: (id: string) => request<void>(`/admin/registrations/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ confirm: true }),
  }, true),
  downloadExport: async (id: string, includePending: boolean) => {
    const token = getToken()
    const response = await fetch(`${apiUrl}/admin/events/${id}/export${includePending ? '?includePending=true' : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new ApiError('Unable to download the export.', response.status)
    return response
  },
  updateEvent: (id: string, event: EventFormPayload) => request<AdminEvent & { warning?: string }>(`/admin/events/${id}`, {
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

export type Registration = {
  _id: string
  event: string
  fullName: string
  email: string
  mobile: string
  department?: string
  year: number
  collegeId?: string
  collegeName?: string
  teamName?: string
  members?: Array<{ fullName: string; department?: string; year: number; collegeId?: string }>
  headcount: number
  status: 'pending' | 'approved'
  registeredAt: string
}

export type RegistrationPayload = Omit<Registration, '_id' | 'event' | 'headcount' | 'status' | 'registeredAt'>

export type EventFormPayload = {
  title: string
  description: string
  image: string
  eventDate: string
  time: string
  venue: string
  allowedYears: number[]
  seatLimit: number
  closingAt: string
  published: boolean
  participation: 'individual' | 'group'
  minTeamSize?: number
  maxTeamSize?: number
  collegeOnly: boolean
}

export type ContentCollection = Project | TeamMember | Sponsor | GalleryItem | LegacyItem | unknown
export type ContentLoader = () => Promise<ContentCollection[]>
export type User = AdminUser
