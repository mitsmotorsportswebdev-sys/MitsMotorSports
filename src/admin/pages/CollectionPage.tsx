import { useEffect, useState } from 'react'
import { ImageOff, LoaderCircle } from 'lucide-react'
import { adminApi, ApiError } from '../services/api'
import type { GalleryItem, LegacyItem, Sponsor, TeamMember } from '../types'

const config = {
  team: { title: 'Team roster', eyebrow: 'PEOPLE / TEAM', description: 'The public team roster currently available to the site.', load: adminApi.getTeam },
  alumni: { title: 'Alumni archive', eyebrow: 'PEOPLE / ALUMNI', description: 'The API currently returns an empty alumni collection.', load: adminApi.getAlumni },
  sponsors: { title: 'Sponsor book', eyebrow: 'PARTNERS / SPONSORS', description: 'Published partner records currently available to the site.', load: adminApi.getSponsors },
  gallery: { title: 'Gallery', eyebrow: 'MEDIA / GALLERY', description: 'Published visual records currently available to the site.', load: adminApi.getGallery },
  legacy: { title: 'Legacy archive', eyebrow: 'HISTORY / LEGACY', description: 'Published legacy records currently available to the site.', load: adminApi.getLegacy },
} as const

type CollectionKey = keyof typeof config
type Item = TeamMember | Sponsor | GalleryItem | LegacyItem | unknown

export default function CollectionPage({ kind }: { kind: CollectionKey }) {
  const page = config[kind]
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { setLoading(true); page.load().then((data) => setItems(data as Item[])).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load collection.')).finally(() => setLoading(false)) }, [page])
  return <div className="admin-page"><div className="admin-page-intro"><div><span className="admin-eyebrow">{page.eyebrow}</span><h2>{page.title}</h2><p>{page.description}</p></div><span className="admin-readonly">Read-only API</span></div>{error && <div className="admin-notice error">{error}</div>}{loading ? <div className="admin-loading"><LoaderCircle className="admin-spin" size={22} /> Loading records...</div> : items.length ? <div className="admin-card-grid">{items.map((item, index) => { const record = item as Record<string, unknown>; const image = record.image as { url?: string } | undefined; return <article className="admin-content-card" key={String(record._id || index)}><div className="admin-card-image">{image?.url ? <img src={image.url} alt="" /> : <ImageOff size={24} />}</div><div><span className="admin-card-kicker">{String(record.department || record.tier || record.category || kind)}</span><h3>{String(record.name || record.title || 'Untitled')}</h3><p>{String(record.bio || record.description || record.website || 'No description yet.')}</p></div><span className="admin-status">{record.isPublished ? 'Published' : 'Draft'}</span></article> })}</div> : <div className="admin-empty"><h3>No {kind} found.</h3><p>{kind === 'alumni' ? 'Alumni management is waiting on a backend model and API.' : 'This collection is empty or not yet published.'}</p></div>}<p className="admin-muted">Create, edit, and delete actions are intentionally disabled until matching admin endpoints exist in the backend.</p></div>
}
