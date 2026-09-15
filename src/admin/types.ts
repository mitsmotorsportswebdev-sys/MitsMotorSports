export type AdminRole = 'admin' | string

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
}

export interface ImageAsset {
  url: string
  filename: string
  type?: string
  size?: number
}

export interface HomeContent {
  _id?: string
  title: string
  subtitle: string
  heroImage?: ImageAsset
  sections: unknown[]
  isPublished: boolean
}

export interface AboutContent {
  _id?: string
  title: string
  content: string
  image?: ImageAsset
  isPublished: boolean
}

export interface Project {
  _id: string
  slug: string
  name: string
  description: string
  category: string
  image?: ImageAsset
  isPublished: boolean
  order: number
}

export interface TeamMember {
  _id: string
  name: string
  role: string
  department: string
  bio: string
  image?: ImageAsset
  isPublished: boolean
  order: number
}

export interface Sponsor {
  _id: string
  name: string
  website: string
  tier: 'gold' | 'silver' | 'partner' | 'featured' | string
  image?: ImageAsset
  isPublished: boolean
  order: number
}

export interface GalleryItem {
  _id: string
  title: string
  description: string
  image?: ImageAsset
  isPublished: boolean
  order: number
}

export interface LegacyItem {
  _id: string
  title: string
  description: string
  image?: ImageAsset
  isPublished: boolean
  order: number
}

export interface AuthResponse {
  token: string
  user: AdminUser
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}
