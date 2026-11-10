import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ImagePlus, LoaderCircle, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ApiError, adminApi, resolveImageUrl } from '../services/api'
import type { LegacyAchievement, LegacyItem, LegacyPhoto } from '../types'

type Draft = Omit<LegacyItem, 'id' | 'createdAt' | 'updatedAt' | 'photos'> & { photos: LegacyPhoto[] }

const emptyPhoto = (): LegacyPhoto => ({ imageUrl: null, alt: '', caption: '' })
const emptyDraft = (): Draft => ({ year: new Date().getFullYear(), season: '', competition: '', location: '', result: '', achievements: [], visible: true, photos: [emptyPhoto(), emptyPhoto(), emptyPhoto()] })
const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'Unable to complete the request.'

function FieldErrors({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  return <>{errors[field]?.map((message) => <small className="admin-field-error" key={message}>{message}</small>)}</>
}

function toDraft(entry: LegacyItem): Draft {
  return { year: entry.year, season: entry.season || '', competition: entry.competition, location: entry.location || '', result: entry.result || '', achievements: entry.achievements.map((item) => ({ ...item })), visible: entry.visible, photos: entry.photos.map((photo) => ({ ...photo, imageUrl: photo.imageUrl ? resolveImageUrl(photo.imageUrl) : null })) }
}

export default function LegacyAdminPage() {
  const [entries, setEntries] = useState<LegacyItem[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyPhoto, setBusyPhoto] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function load() {
    setLoading(true)
    try { setEntries(await adminApi.getLegacy()) } catch (requestError) { setError(errorMessage(requestError)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  function openCreate() { setError(''); setErrors({}); setEditingId(null); setDraft(emptyDraft()) }
  function openEdit(entry: LegacyItem) { setError(''); setErrors({}); setEditingId(entry.id); setDraft(toDraft(entry)) }
  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => current ? { ...current, [key]: value } : current); setErrors((current) => ({ ...current, [key]: [] })) }
  function updateAchievement(index: number, value: Partial<LegacyAchievement>) { if (!draft) return; updateDraft('achievements', draft.achievements.map((item, itemIndex) => itemIndex === index ? { ...item, ...value } : item)) }
  function updatePhoto(index: number, value: Partial<LegacyPhoto>) { if (!draft) return; updateDraft('photos', draft.photos.map((item, itemIndex) => itemIndex === index ? { ...item, ...value } : item)) }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    setSaving(true); setError(''); setErrors({})
    try {
      const payload = { year: Number(draft.year), season: draft.season, competition: draft.competition, location: draft.location, result: draft.result, achievements: draft.achievements, visible: draft.visible }
      const saved = editingId
        ? await adminApi.updateLegacy(editingId, { ...payload, photos: draft.photos.map(({ alt, caption }) => ({ alt, caption })) })
        : await adminApi.createLegacy(payload)
      setEditingId(saved.id); setDraft(toDraft(saved)); setEntries((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); setError('')
    } catch (requestError) { setError(errorMessage(requestError)); if (requestError instanceof ApiError) setErrors(requestError.fields || {}) } finally { setSaving(false) }
  }

  async function toggleVisibility(entry: LegacyItem) {
    try { const updated = await adminApi.updateLegacy(entry.id, { visible: !entry.visible }); setEntries((current) => current.map((item) => item.id === updated.id ? updated : item)) } catch (requestError) { setError(errorMessage(requestError)) }
  }
  async function removeEntry(entry: LegacyItem) {
    if (!window.confirm(`Delete ${entry.competition}? This also removes its photos.`)) return
    try { await adminApi.deleteLegacy(entry.id); setEntries((current) => current.filter((item) => item.id !== entry.id)); if (editingId === entry.id) { setEditingId(null); setDraft(null) } } catch (requestError) { setError(errorMessage(requestError)) }
  }
  async function choosePhoto(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !editingId) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Use a JPEG, PNG, or WebP image.'); return }
    if (file.size > 400 * 1024) { setError('Images must be 400 KB or smaller.'); return }
    setBusyPhoto(index); setError('')
    try { const updated = await adminApi.uploadLegacyPhoto(editingId, index, file); setDraft(toDraft(updated)); setEntries((current) => current.map((item) => item.id === updated.id ? updated : item)) } catch (requestError) { setError(errorMessage(requestError)) } finally { setBusyPhoto(null); event.target.value = '' }
  }
  async function removePhoto(index: number) {
    if (!editingId || !window.confirm('Remove this photo?')) return
    setBusyPhoto(index); setError('')
    try { const updated = await adminApi.deleteLegacyPhoto(editingId, index); setDraft(toDraft(updated)); setEntries((current) => current.map((item) => item.id === updated.id ? updated : item)) } catch (requestError) { setError(errorMessage(requestError)) } finally { setBusyPhoto(null) }
  }

  if (draft) return <LegacyForm draft={draft} editingId={editingId} saving={saving} busyPhoto={busyPhoto} error={error} errors={errors} updateDraft={updateDraft} updateAchievement={updateAchievement} updatePhoto={updatePhoto} save={save} choosePhoto={choosePhoto} removePhoto={removePhoto} onCancel={() => { setDraft(null); setEditingId(null); setError('') }} />
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="admin-eyebrow">HISTORY / LEGACY</span><h2>Legacy archive</h2></div><button className="admin-button" onClick={openCreate}><Plus size={16} /> Add entry</button></div>
    {error && <div className="admin-alert admin-alert-error">{error}</div>}
    {loading ? <div className="admin-state"><LoaderCircle className="admin-spin" size={22} /> Loading legacy entries...</div> : entries.length === 0 ? <div className="admin-empty"><h3>No legacy entries found.</h3><p>Create the first competition record to publish it on the Legacy page.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Year</th><th>Competition</th><th>Season</th><th>Result</th><th>Photos</th><th>Status</th><th>Actions</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td><strong>{entry.year}</strong></td><td>{entry.competition}</td><td>{entry.season || '—'}</td><td>{entry.result || '—'}</td><td>{entry.photos.filter((photo) => photo.imageUrl).length}/3</td><td><span className={`admin-status ${entry.visible ? 'admin-status-approved' : 'admin-status-unpublished'}`}>{entry.visible ? 'Visible' : 'Hidden'}</span></td><td><div className="admin-actions"><button className="admin-button admin-button-small" onClick={() => openEdit(entry)}>Edit</button><button className="admin-button admin-button-secondary admin-button-small" onClick={() => void toggleVisibility(entry)}>{entry.visible ? 'Hide' : 'Show'}</button><button className="admin-button admin-button-danger admin-button-small" onClick={() => void removeEntry(entry)}><Trash2 size={13} /> Delete</button></div></td></tr>)}</tbody></table></div>}
  </section>
}

function LegacyForm({ draft, editingId, saving, busyPhoto, error, errors, updateDraft, updateAchievement, updatePhoto, save, choosePhoto, removePhoto, onCancel }: { draft: Draft; editingId: string | null; saving: boolean; busyPhoto: number | null; error: string; errors: Record<string, string[]>; updateDraft: <K extends keyof Draft>(key: K, value: Draft[K]) => void; updateAchievement: (index: number, value: Partial<LegacyAchievement>) => void; updatePhoto: (index: number, value: Partial<LegacyPhoto>) => void; save: (event: FormEvent) => void; choosePhoto: (index: number, event: ChangeEvent<HTMLInputElement>) => void; removePhoto: (index: number) => void; onCancel: () => void }) {
  return <section className="admin-page">
    <div className="admin-page-heading"><div><Link to="/admin/legacy" className="admin-back-link"><ArrowLeft size={14} /> Legacy archive</Link><h2>{editingId ? 'Edit legacy entry' : 'Add legacy entry'}</h2></div></div>
    {error && <div className="admin-alert admin-alert-error">{error}</div>}
    {!editingId && <div className="admin-notice">Save the entry before uploading photos. Photo upload buttons are enabled after the entry is created.</div>}
    <form className="admin-form" onSubmit={(event) => void save(event)}>
      <label>Year<input type="number" min="2000" max="2100" required value={draft.year} onChange={(event) => updateDraft('year', Number(event.target.value))} /><FieldErrors errors={errors} field="year" /></label>
      <label>Competition<input maxLength={120} required value={draft.competition} onChange={(event) => updateDraft('competition', event.target.value)} /><FieldErrors errors={errors} field="competition" /></label>
      <label>Season<input maxLength={40} value={draft.season} onChange={(event) => updateDraft('season', event.target.value)} /><FieldErrors errors={errors} field="season" /></label>
      <label>Location<input maxLength={120} value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} /><FieldErrors errors={errors} field="location" /></label>
      <label>Result<input maxLength={200} value={draft.result} onChange={(event) => updateDraft('result', event.target.value)} /><FieldErrors errors={errors} field="result" /></label>
      <label className="admin-check"><input type="checkbox" checked={draft.visible} onChange={(event) => updateDraft('visible', event.target.checked)} /> Visible</label>
      <fieldset className="legacy-fieldset"><legend>Achievements ({draft.achievements.length}/10)</legend>{draft.achievements.map((achievement, index) => <div className="legacy-achievement-row" key={index}><input maxLength={120} placeholder="Title" value={achievement.title} onChange={(event) => updateAchievement(index, { title: event.target.value })} /><input maxLength={500} placeholder="Description" value={achievement.description} onChange={(event) => updateAchievement(index, { description: event.target.value })} /><button type="button" className="admin-icon-button" onClick={() => updateDraft('achievements', draft.achievements.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove achievement"><X size={15} /></button></div>)}<button type="button" className="admin-button admin-button-secondary admin-button-small" disabled={draft.achievements.length >= 10} onClick={() => updateDraft('achievements', [...draft.achievements, { title: '', description: '' }])}><Plus size={14} /> Add achievement</button><FieldErrors errors={errors} field="achievements" /></fieldset>
      <fieldset className="legacy-fieldset"><legend>Photos (3 slots)</legend><div className="legacy-photo-grid">{draft.photos.map((photo, index) => <div className="legacy-photo-slot" key={index}><strong>Slot {index + 1}</strong>{photo.imageUrl ? <div className="admin-image-preview"><img src={photo.imageUrl} alt={photo.alt || `Legacy photo ${index + 1}`} /></div> : <div className="legacy-photo-empty"><ImagePlus size={22} /><span>No photo</span></div>}<label>Alt text<input maxLength={160} value={photo.alt} onChange={(event) => updatePhoto(index, { alt: event.target.value })} /></label><label>Caption<input maxLength={200} value={photo.caption} onChange={(event) => updatePhoto(index, { caption: event.target.value })} /></label><div className="admin-actions"><label className={`admin-button admin-button-secondary admin-button-small ${!editingId ? 'is-disabled' : ''}`}><Upload size={13} /> {photo.imageUrl ? 'Replace' : 'Upload'}<input hidden disabled={!editingId || busyPhoto !== null} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void choosePhoto(index, event)} /></label>{photo.imageUrl && <button type="button" className="admin-button admin-button-danger admin-button-small" disabled={busyPhoto !== null} onClick={() => void removePhoto(index)}>{busyPhoto === index ? <LoaderCircle className="admin-spin" size={13} /> : <Trash2 size={13} />} Remove</button>}{busyPhoto === index && <LoaderCircle className="admin-spin" size={15} />}</div></div>)}</div></fieldset>
      <div className="admin-form-actions"><button type="button" className="admin-button admin-button-secondary" onClick={onCancel}><ArrowLeft size={15} /> Cancel</button><button className="admin-button" disabled={saving}><Save size={15} /> {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create entry'}</button></div>
    </form>
  </section>
}
