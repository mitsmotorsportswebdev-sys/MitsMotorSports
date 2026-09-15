import { FormEvent, useEffect, useState } from 'react'
import { Check, LoaderCircle, Save } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import { adminApi, ApiError } from '../services/api'
import type { AboutContent, HomeContent, ImageAsset } from '../types'

type ContentKind = 'home' | 'about'
type Content = HomeContent | AboutContent

const defaults: Record<ContentKind, Content> = {
  home: { title: '', subtitle: '', heroImage: undefined, sections: [], isPublished: true },
  about: { title: '', content: '', image: undefined, isPublished: true },
}

export default function ContentEditorPage({ kind }: { kind: ContentKind }) {
  const [content, setContent] = useState<Content>(defaults[kind])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { setLoading(true); setError(''); (kind === 'home' ? adminApi.getHome() : adminApi.getAbout()).then((data) => { if (data) setContent(data) }).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load content.')).finally(() => setLoading(false)) }, [kind])
  const isHome = kind === 'home'
  const update = (patch: Partial<Content>) => setContent((current) => ({ ...current, ...patch }))

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('')
    try { if (isHome) await adminApi.updateHome(content as Partial<HomeContent>); else await adminApi.updateAbout(content as Partial<AboutContent>); setMessage('Saved just now.') } catch (saveError) { setError(saveError instanceof ApiError ? saveError.message : 'Unable to save changes.') } finally { setSaving(false) }
  }

  if (loading) return <div className="admin-loading"><LoaderCircle className="admin-spin" size={24} /> Loading content...</div>
  const image = isHome ? (content as HomeContent).heroImage : (content as AboutContent).image
  return <div className="admin-page"><div className="admin-page-intro"><div><span className="admin-eyebrow">CONTENT / {kind.toUpperCase()}</span><h2>{isHome ? 'Homepage' : 'About page'}</h2><p>Edit only the fields supported by the current API.</p></div>{message && <span className="admin-saved"><Check size={16} />{message}</span>}</div>{error && <div className="admin-notice error">{error}</div>}<form className="admin-editor" onSubmit={save}><div className="admin-panel"><div className="admin-field-grid"><label>Title<input required maxLength={160} value={content.title} onChange={(event) => update({ title: event.target.value })} /></label><label>Visibility<select value={content.isPublished ? 'published' : 'draft'} onChange={(event) => update({ isPublished: event.target.value === 'published' })}><option value="published">Published</option><option value="draft">Draft</option></select></label></div><label>{isHome ? 'Subtitle' : 'Content'}{isHome ? <textarea rows={4} value={(content as HomeContent).subtitle} onChange={(event) => update({ subtitle: event.target.value })} /> : <textarea required rows={12} value={(content as AboutContent).content} onChange={(event) => update({ content: event.target.value })} />}</label>{isHome && <label>Sections JSON<textarea rows={7} value={JSON.stringify((content as HomeContent).sections, null, 2)} onChange={(event) => { try { update({ sections: JSON.parse(event.target.value) }) } catch { update({ sections: (content as HomeContent).sections }) } }} /></label>}</div><div className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">MEDIA</span><h3>{isHome ? 'Hero image' : 'About image'}</h3></div></div><ImageUploader page={kind} value={image as ImageAsset | undefined} onChange={(uploaded) => update(isHome ? { heroImage: uploaded } : { image: uploaded })} /></div><div className="admin-form-actions"><button className="admin-submit admin-submit-small" disabled={saving}>{saving ? <LoaderCircle className="admin-spin" size={17} /> : <Save size={17} />} Save changes</button></div></form></div>
}
