import { clearAuth, getToken } from './auth'
import type {
  AboutContent,
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

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
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
    throw new ApiError(payload?.message || getStatusMessage(response.status), response.status)
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
