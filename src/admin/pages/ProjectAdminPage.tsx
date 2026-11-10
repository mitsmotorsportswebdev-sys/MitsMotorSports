import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, adminApi, type AdminGroup, type AdminMember, type AdminProject } from '../services/api'

const icons = ['power', 'battery', 'speed', 'chassis', 'suspension', 'brake', 'electronics', 'engineering', 'team', 'drive', 'voltage', 'time']
type Tab = 'details' | 'crew'
type Draft = Pick<AdminProject, 'title' | 'tagline' | 'overview' | 'stats' | 'specs' | 'sections'>
type MemberDraft = { id?: string; name: string; role: string; extras: string; visible: boolean; groupId: string; imageUrl: string | null; file?: File }

function errorMessage(err: unknown) { return err instanceof ApiError ? err.message : 'Unable to complete the request.' }
function cloneDraft(project: AdminProject): Draft { return { title: project.title, tagline: project.tagline, overview: project.overview, stats: project.stats || [], specs: project.specs || [], sections: project.sections || [] } }

async function preparePhoto(file: File, maxSide: number) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  const source = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(source.width * scale)); canvas.height = Math.max(1, Math.round(source.height * scale))
  const context = canvas.getContext('2d'); if (!context) throw new Error('Unable to prepare the image.')
  context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(source, 0, 0, canvas.width, canvas.height); source.close()
  for (let quality = 0.85; quality >= 0.5; quality -= 0.05) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size < 380 * 1024) return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
  }
  throw new Error('This image could not be compressed below 380 KB.')
}

function FieldErrors({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  return <>{errors[field]?.map((message) => <small className="admin-field-error" key={message}>{message}</small>)}</>
}

export default function ProjectAdminPage({ fixedSlug }: { fixedSlug?: string }) {
  const { slug: routeSlug = '' } = useParams()
  const slug = fixedSlug || routeSlug
  const isTeam = slug === 'team'
  const [project, setProject] = useState<AdminProject | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [tab, setTab] = useState<Tab>(isTeam ? 'crew' : 'details')
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [memberModal, setMemberModal] = useState<MemberDraft | null>(null); const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    try { const value = await adminApi.getAdminProject(slug); setProject(value); setDraft(cloneDraft(value)); setGroups(value.groups || []) } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [slug])
  const groupOptions = useMemo(() => groups.map((group) => ({ id: group.id, name: group.name })), [groups])
  function setDraftValue<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => current ? { ...current, [key]: value } : current); setErrors((current) => ({ ...current, [key]: [] })) }
  function updateRow<T>(key: 'stats' | 'specs' | 'sections', index: number, value: Partial<T>) {
    if (!draft) return
    const rows = [...draft[key]] as T[]; rows[index] = { ...rows[index], ...value } as T
    setDraftValue(key, rows as Draft[typeof key])
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!draft) return
    setSaving(true); setError(''); setErrors({})
    try { const updated = await adminApi.updateAdminProject(slug, draft); setProject((current) => current ? { ...current, ...updated } : updated); setDraft(cloneDraft(updated)) } catch (err) { setError(errorMessage(err)); if (err instanceof ApiError) setErrors(err.fields || {}) } finally { setSaving(false) }
  }
  async function action(work: () => Promise<unknown>) { setError(''); try { await work(); await load() } catch (err) { setError(errorMessage(err)) } }
  async function hero(file: File) { setPhotoBusy(true); setError(''); try { const prepared = await preparePhoto(file, 1600); await adminApi.uploadProjectHero(slug, prepared); await load() } catch (err) { setError(errorMessage(err)) } finally { setPhotoBusy(false) } }
  async function removeHero() { if (!window.confirm('Remove the hero photo?')) return; await action(() => adminApi.deleteProjectHero(slug)) }
  function openMember(member?: AdminMember, groupId = groups[0]?.id) { setMemberModal(member ? { id: member.id, name: member.name, role: member.role, extras: member.extras || '', visible: member.visible, groupId: member.groupId || groupId, imageUrl: member.imageUrl } : { name: '', role: 'Team Member', extras: '', visible: true, groupId, imageUrl: null }) }
  async function saveMember(event: FormEvent) {
    event.preventDefault(); if (!memberModal) return
    setPhotoBusy(true); setError('')
    try {
      const payload = { name: memberModal.name, role: memberModal.role, ...(memberModal.extras.trim() ? { extras: memberModal.extras } : {}), visible: memberModal.visible, ...(memberModal.id ? { groupId: memberModal.groupId } : {}) }
      const saved = memberModal.id ? await adminApi.updateMember(memberModal.id, payload) : await adminApi.createMember(memberModal.groupId, payload)
      if (memberModal.file) { try { await adminApi.uploadMemberPhoto(saved.id, await preparePhoto(memberModal.file, 800)) } catch { setError('Member saved but the photo failed, try again.') } }
      setMemberModal(null); await load()
    } catch (err) { setError(errorMessage(err)) } finally { setPhotoBusy(false) }
  }
  function choosePhoto(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (file) setMemberModal((current) => current ? { ...current, file, imageUrl: URL.createObjectURL(file) } : current) }
  if (loading) return <div className="admin-state">Loading project...</div>
  if (!project || (!isTeam && !draft)) return <div className="admin-alert admin-alert-error">{error || 'Project not found.'}</div>
  const detailsDraft = draft || { title: '', tagline: '', overview: '', stats: [], specs: [], sections: [] }

  return <section className="admin-page">
    <div className="admin-page-heading"><div>{isTeam ? <><span className="admin-eyebrow">CONTENT / TEAM</span><Link to="/admin/team" className="admin-back-link">Team</Link></> : <Link to="/admin/projects" className="admin-back-link">Projects</Link>}<h2>{isTeam ? 'Team' : project.title}</h2></div></div>
    {error && <div className="admin-alert admin-alert-error">{error}</div>}
    {!isTeam && <div className="admin-tabs" role="tablist"><button className={tab === 'details' ? 'is-active' : ''} onClick={() => setTab('details')}>Details</button><button className={tab === 'crew' ? 'is-active' : ''} onClick={() => setTab('crew')}>Crew</button></div>}
    {!isTeam && tab === 'details' ? <form className="admin-form" onSubmit={(event) => void save(event)}>
      <label>Title<input value={detailsDraft.title} onChange={(event) => setDraftValue('title', event.target.value)} /><FieldErrors errors={errors} field="title" /></label>
      <label>Tagline<input value={detailsDraft.tagline} onChange={(event) => setDraftValue('tagline', event.target.value)} /><FieldErrors errors={errors} field="tagline" /></label>
      <label>Overview<textarea value={detailsDraft.overview} onChange={(event) => setDraftValue('overview', event.target.value)} /><FieldErrors errors={errors} field="overview" /></label>
      <PhotoEditor label="Hero photo" imageUrl={project.heroImageUrl} busy={photoBusy} onFile={hero} onRemove={removeHero} fileRef={fileRef} />
      <EditableRows title="Stats" rows={detailsDraft.stats} fields={['label', 'value']} onChange={(index, value) => updateRow('stats', index, value)} onAdd={() => setDraftValue('stats', [...detailsDraft.stats, { label: '', value: '' }])} onRemove={(index) => setDraftValue('stats', detailsDraft.stats.filter((_, item) => item !== index))} />
      <EditableRows title="Specs" rows={detailsDraft.specs} fields={['label', 'value', 'description', 'icon']} iconNames={icons} onChange={(index, value) => updateRow('specs', index, value)} onMove={(index, direction) => setDraftValue('specs', swap(detailsDraft.specs, index, direction))} onAdd={() => setDraftValue('specs', [...detailsDraft.specs, { label: '', value: '', description: '', icon: icons[0] }])} onRemove={(index) => setDraftValue('specs', detailsDraft.specs.filter((_, item) => item !== index))} />
      <SectionEditor sections={detailsDraft.sections} onChange={(sections) => setDraftValue('sections', sections)} />
      <button className="admin-button admin-button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save details'}</button>
    </form> : <div className="team-crew-editor">
      {groups.map((group, index) => <section className="team-group" key={group.id}><div className="team-group-header"><input value={group.name} aria-label={`Section ${group.name} name`} onChange={(event) => setGroups((current) => current.map((item) => item.id === group.id ? { ...item, name: event.target.value } : item))} onBlur={() => void action(() => adminApi.renameGroup(group.id, group.name))} /><button disabled={index === 0} onClick={() => void action(() => adminApi.moveGroup(group.id, 'up'))}>Up</button><button disabled={index === groups.length - 1} onClick={() => void action(() => adminApi.moveGroup(group.id, 'down'))}>Down</button><button onClick={() => openMember(undefined, group.id)}>Add member</button><button onClick={() => { if (window.confirm('Delete this section?')) void action(() => adminApi.deleteGroup(group.id)) }}>Delete section</button></div>
        {group.members.map((member, memberIndex) => <div className="team-member-row" key={member.id}>{member.imageUrl ? <img src={member.imageUrl} alt="" /> : <div className="team-member-placeholder">No photo</div>}<div><strong>{member.name}</strong><span>{member.role}</span><small>{member.extras}</small></div>{!member.visible && <b>Hidden</b>}<button onClick={() => openMember(member, group.id)}>Edit</button><button disabled={memberIndex === 0} onClick={() => void action(() => adminApi.moveMember(member.id, 'up'))}>Up</button><button disabled={memberIndex === group.members.length - 1} onClick={() => void action(() => adminApi.moveMember(member.id, 'down'))}>Down</button><button onClick={() => void action(() => adminApi.updateMember(member.id, { name: member.name, role: member.role, extras: member.extras, visible: !member.visible }))}>{member.visible ? 'Hide' : 'Show'}</button><button onClick={() => { if (window.confirm('Delete this member?')) void action(() => adminApi.deleteMember(member.id)) }}>Delete</button></div>)}
      </section>)}
      <button className="admin-button admin-button-secondary" onClick={() => void action(() => adminApi.createGroup(slug, 'New section'))}>Add section</button>
    </div>}
    {memberModal && <div className="admin-modal-backdrop"><form className="admin-modal admin-form" role="dialog" aria-modal="true" onSubmit={(event) => void saveMember(event)}><h3>{memberModal.id ? 'Edit member' : 'Add member'}</h3><label>Name<input autoFocus value={memberModal.name} onChange={(event) => setMemberModal({ ...memberModal, name: event.target.value })} /></label><label>Role<input value={memberModal.role} onChange={(event) => setMemberModal({ ...memberModal, role: event.target.value })} /></label><label>Department<input value={memberModal.extras} onChange={(event) => setMemberModal({ ...memberModal, extras: event.target.value })} /></label><label>Section<select value={memberModal.groupId} onChange={(event) => setMemberModal({ ...memberModal, groupId: event.target.value })}>{groupOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label><label className="admin-check"><input type="checkbox" checked={memberModal.visible} onChange={(event) => setMemberModal({ ...memberModal, visible: event.target.checked })} /> Visible</label><input ref={fileRef} type="file" accept="image/*" onChange={choosePhoto} />{memberModal.imageUrl && <img className="admin-image-preview" src={memberModal.imageUrl} alt="Member preview" />}{memberModal.id && memberModal.imageUrl && <button type="button" onClick={() => void action(async () => { await adminApi.deleteMemberPhoto(memberModal.id as string); setMemberModal({ ...memberModal, imageUrl: null }) })}>Remove photo</button>}<div><button className="admin-button admin-button-primary" disabled={photoBusy}>Save member</button><button type="button" className="admin-button admin-button-secondary" onClick={() => setMemberModal(null)}>Cancel</button></div></form></div>}
  </section>
}

function swap<T>(rows: T[], index: number, direction: 'up' | 'down') { const target = index + (direction === 'up' ? -1 : 1); if (target < 0 || target >= rows.length) return rows; const copy = [...rows]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy }
function PhotoEditor({ label, imageUrl, busy, onFile, onRemove, fileRef }: { label: string; imageUrl: string | null; busy: boolean; onFile: (file: File) => void; onRemove: () => void; fileRef: React.RefObject<HTMLInputElement | null> }) { return <div className="team-photo-editor"><strong>{label}</strong>{imageUrl && <img src={imageUrl} alt={`${label} preview`} />}{!imageUrl && <span>No photo</span>}<input ref={fileRef} type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file) }} disabled={busy} />{imageUrl && <button type="button" onClick={onRemove} disabled={busy}>Remove photo</button>}{busy && <small>Uploading...</small>}</div> }
function EditableRows({ title, rows, fields, iconNames, onChange, onMove, onAdd, onRemove }: { title: string; rows: Array<Record<string, string>>; fields: string[]; iconNames?: string[]; onChange: (index: number, value: Record<string, string>) => void; onMove?: (index: number, direction: 'up' | 'down') => void; onAdd: () => void; onRemove: (index: number) => void }) { return <fieldset><legend>{title}</legend>{rows.map((row, index) => <div className="team-edit-row" key={index}>{fields.map((field) => field === 'icon' && iconNames ? <select key={field} value={iconNames.includes(row[field]) ? row[field] : ''} onChange={(event) => onChange(index, { [field]: event.target.value })}><option value="">Choose icon</option>{!iconNames.includes(row[field]) && row[field] && <option value={row[field]}>{row[field]} (existing)</option>}{iconNames.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select> : <input key={field} placeholder={field} value={row[field] || ''} onChange={(event) => onChange(index, { [field]: event.target.value })} />)}{onMove && <><button type="button" disabled={index === 0} onClick={() => onMove(index, 'up')}>Up</button><button type="button" disabled={index === rows.length - 1} onClick={() => onMove(index, 'down')}>Down</button></>}<button type="button" onClick={() => onRemove(index)}>Remove</button></div>)}<button type="button" className="admin-button admin-button-secondary" onClick={onAdd}>Add {title.slice(0, -1).toLowerCase()}</button></fieldset> }
function SectionEditor({ sections, onChange }: { sections: Array<{ title: string; description: string; bullets: string[] }>; onChange: (sections: Array<{ title: string; description: string; bullets: string[] }>) => void }) { return <fieldset><legend>Engineering sections</legend>{sections.map((section, index) => <div className="team-section-editor" key={index}><input placeholder="Title" value={section.title} onChange={(event) => onChange(sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /><textarea placeholder="Description" value={section.description} onChange={(event) => onChange(sections.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} />{section.bullets.map((bullet, bulletIndex) => <div key={bulletIndex}><input value={bullet} onChange={(event) => onChange(sections.map((item, itemIndex) => itemIndex === index ? { ...item, bullets: item.bullets.map((value, valueIndex) => valueIndex === bulletIndex ? event.target.value : value) } : item))} /><button type="button" onClick={() => onChange(sections.map((item, itemIndex) => itemIndex === index ? { ...item, bullets: item.bullets.filter((_, valueIndex) => valueIndex !== bulletIndex) } : item))}>Remove bullet</button></div>)}<button type="button" onClick={() => onChange(sections.map((item, itemIndex) => itemIndex === index ? { ...item, bullets: [...item.bullets, ''] } : item))}>Add bullet</button><button type="button" onClick={() => onChange(sections.filter((_, itemIndex) => itemIndex !== index))}>Remove section</button></div>)}<button type="button" className="admin-button admin-button-secondary" onClick={() => onChange([...sections, { title: '', description: '', bullets: [] }])}>Add section</button></fieldset> }
