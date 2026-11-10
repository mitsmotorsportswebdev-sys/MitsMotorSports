export type ApiProjectMember = {
  id: string
  name: string
  role?: string
  extras?: string
  imageUrl?: string | null
}

export type ApiProjectGroup = {
  id: string
  name: string
  members: ApiProjectMember[]
}

export type ApiProjectSpec = {
  id?: string
  label: string
  value: string
  description?: string
  icon?: string
}

export type ApiProjectSection = {
  id?: string
  title: string
  description: string
  bullets: string[]
}

export type ApiProjectStat = {
  label: string
  value: string
}

export type ApiProject = {
  slug: string
  title: string
  tagline: string
  overview: string
  heroImageUrl?: string | null
  heroEyebrow?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  teamSectionLabel?: string
  teamSectionTitle?: string
  specsSectionLabel?: string
  specsSectionTitle?: string
  engineeringSectionLabel?: string
  stats: ApiProjectStat[]
  specs: ApiProjectSpec[]
  sections: ApiProjectSection[]
  groups: ApiProjectGroup[]
  memberCount: number
}

export type MappedProject = {
  id: string
  slug: string
  name: string
  description: string
  heroImageUrl: string
  heroEyebrow: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  teamSectionLabel: string
  teamSectionTitle: string
  specsSectionLabel: string
  specsSectionTitle: string
  engineeringSectionLabel: string
  overview: {
    title: string
    description: string
    stats: Array<{ label: string; value: string }>
  }
  team: Array<{
    id: string
    name: string
    role: string
    imageUrl: string
    department: string
    displayOrder: number
    active: boolean
    email?: string
    linkedin?: string
  }>
  groups: Array<{
    id: string
    name: string
    members: ApiProjectMember[]
  }>
  specifications: Array<{
    id: string
    label: string
    value: string
    description?: string
    icon: string
  }>
  sections: Array<{
    id: string
    title: string
    description: string
    bullets: string[]
  }>
}

export class ProjectServiceError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ProjectServiceError'
    this.status = status
  }
}

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

function toAbsoluteImageUrl(url?: string | null): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  if (!apiUrl) {
    return url
  }

  if (/^https?:\/\//i.test(apiUrl)) {
    try {
      const parsedApi = new URL(apiUrl)
      const origin = parsedApi.origin
      if (url.startsWith('/')) {
        const apiPath = parsedApi.pathname.replace(/\/$/, '')
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

export const resolveProjectImageUrl = toAbsoluteImageUrl

export async function getPublicProject(slug: string): Promise<ApiProject> {
  let response: Response
  try {
    response = await fetch(`${apiUrl}/projects/${encodeURIComponent(slug)}`, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    throw new ProjectServiceError('The project service could not be reached. Please try again.')
  }
  let payload: { success?: boolean; data?: ApiProject; message?: string } | null = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok || !payload?.success || !payload.data) {
    throw new ProjectServiceError(payload?.message || 'Project not found.', response.status)
  }
  return payload.data
}

export function mapProjectResponse(api: ApiProject): MappedProject {
  const team = (api.groups || []).flatMap((group) =>
    (group.members || []).map((member, index) => ({
      id: member.id,
      name: member.name,
      role: member.role || '',
      imageUrl: toAbsoluteImageUrl(member.imageUrl),
      department: group.name,
      displayOrder: index + 1,
      active: true,
    }))
  )

  const specifications = (api.specs || []).map((spec, index) => ({
    id: spec.id || `${api.slug}-spec-${index}`,
    label: spec.label,
    value: spec.value,
    description: spec.description,
    icon: spec.icon || 'engineering',
  }))

  const sections = (api.sections || []).map((section, index) => ({
    id: section.id || `${api.slug}-section-${index}`,
    title: section.title,
    description: section.description,
    bullets: section.bullets || [],
  }))

  return {
    id: api.slug,
    slug: api.slug,
    name: api.title,
    description: api.tagline,
    heroImageUrl: toAbsoluteImageUrl(api.heroImageUrl),
    heroEyebrow: api.heroEyebrow || (api.slug === 'ebaja' ? 'Electric off-road racing' : 'Performance racing'),
    primaryCtaLabel: api.primaryCtaLabel || (api.slug === 'ebaja' ? 'View specifications' : 'Explore specs'),
    primaryCtaHref: api.primaryCtaHref || '#technical-specs',
    secondaryCtaLabel: api.secondaryCtaLabel || 'Meet the team',
    secondaryCtaHref: api.secondaryCtaHref || '#team',
    teamSectionLabel: api.teamSectionLabel || 'Project team',
    teamSectionTitle: api.teamSectionTitle === 'Team structure' || !api.teamSectionTitle
      ? 'MEET THE CREW'
      : api.teamSectionTitle,
    specsSectionLabel: api.specsSectionLabel || 'Technical package',
    specsSectionTitle: api.specsSectionTitle || 'Technical Specifications',
    engineeringSectionLabel: api.engineeringSectionLabel || 'Engineering focus',
    overview: {
      title: 'Project Overview',
      description: api.overview,
      stats: api.stats || [],
    },
    team,
    groups: (api.groups || []).map((group) => ({
      ...group,
      members: (group.members || []).map((member) => ({
        ...member,
        imageUrl: toAbsoluteImageUrl(member.imageUrl),
      })),
    })),
    specifications,
    sections,
  }
}
