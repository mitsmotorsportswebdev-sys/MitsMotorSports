import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, CircleAlert, LoaderCircle, Pencil, Plus, RotateCcw, X } from 'lucide-react'
import { adminApi, ApiError } from '../services/api'
import type { AdminEvent, EventPayload } from '../types'

type WizardForm = {
  title: string
  eventDate: string
  time: string
  description: string
  image: string
  venue: string
  location: string
  entryFee: string
  eligibility: string
  seatLimit: string
  closingAt: string
  registrationOpen: boolean
  published: boolean
}

type StoredDetails = Pick<EventPayload, 'category' | 'tagline' | 'address' | 'eventType' | 'highlights' | 'rules' | 'eligibilityDetails' | 'schedule' | 'venueDescription'>

const neutralDetails: StoredDetails = {
  category: 'general',
  tagline: 'MITS Motorsports event',
  address: '',
  eventType: 'Event',
  highlights: [],
  rules: [],
  eligibilityDetails: [],
  schedule: [],
  venueDescription: '',
}

const emptyForm: WizardForm = {
  title: '', eventDate: '', time: '', description: '', image: '', venue: '',
  location: '', entryFee: '', eligibility: '', seatLimit: '1', closingAt: '',
  registrationOpen: true, published: false,
}

function slugify(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-')
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

function formatClosing(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function eventEnd(value: string) {
  return new Date(`${value}T18:29:59.999Z`)
}

function indiaInputToUtc(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute) - 330))
}

function utcToIndiaInput(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value
    return result
  }, {})
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

function validUrl(value: string) {
  try { return Boolean(new URL(value)) } catch { return false }
}

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [form, setForm] = useState<WizardForm>(emptyForm)
  const [storedDetails, setStoredDetails] = useState<StoredDetails>(neutralDetails)
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [step, setStep] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [imageState, setImageState] = useState<'idle' | 'loaded' | 'error'>('idle')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>()
  const [success, setSuccess] = useState('')

  async function loadEvents() {
    setLoading(true)
    setError('')
    try { setEvents(await adminApi.getEvents()) } catch (loadError) { setError(loadError instanceof ApiError ? loadError.message : 'Unable to load events.') } finally { setLoading(false) }
  }

  useEffect(() => { void loadEvents() }, [])

  const imagePreview = useMemo(() => form.image.trim(), [form.image])

  function update<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'image') setImageState('idle')
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setStoredDetails(neutralDetails)
    setStep(1)
    setFieldErrors(undefined)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEdit(event: AdminEvent) {
    setEditing(event)
    setForm({
      title: event.title,
      eventDate: event.eventDate || event.date || '',
      time: event.time,
      description: event.description,
      image: event.image,
      venue: event.venue,
      location: event.location,
      entryFee: event.entryFee,
      eligibility: event.eligibility,
      seatLimit: String(event.seatLimit),
      closingAt: event.closingAt ? utcToIndiaInput(event.closingAt) : '',
      registrationOpen: event.registrationOpen,
      published: event.published,
    })
    setStoredDetails({
      category: event.category,
      tagline: event.tagline,
      address: event.address,
      eventType: event.eventType,
      highlights: event.highlights,
      rules: event.rules,
      eligibilityDetails: event.eligibilityDetails,
      schedule: event.schedule,
      venueDescription: event.venueDescription,
    })
    setStep(1)
    setFieldErrors(undefined)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function validateStep(targetStep: number) {
    if (targetStep === 1) {
      if (!form.title.trim()) return 'Event title is required.'
      if (!validDate(form.eventDate)) return 'Enter a real event date in YYYY-MM-DD format.'
      if (!form.time.trim()) return 'Event time is required.'
      if (!form.description.trim()) return 'Event description is required.'
      if (!validUrl(form.image.trim())) return 'Enter a valid image URL.'
      if (imageState !== 'loaded') return 'Wait for the image preview to load successfully before continuing.'
    }
    if (targetStep === 2) {
      const seats = Number(form.seatLimit)
      if (!form.venue.trim() || !form.location.trim() || !form.entryFee.trim() || !form.eligibility.trim()) return 'Venue, location, entry fee, and eligibility are required.'
      if (!Number.isInteger(seats) || seats < 1 || seats > 100000) return 'Seat limit must be a whole number from 1 through 100,000.'
      const closing = indiaInputToUtc(form.closingAt)
      if (!closing) return 'Registration closing time is required.'
      if (closing.getTime() > eventEnd(form.eventDate).getTime()) return 'Registration closing time cannot be later than the end of the event date in India time.'
    }
    return ''
  }

  function nextStep() {
    const validationError = validateStep(step)
    if (validationError) { setError(validationError); return }
    setError('')
    setStep((current) => Math.min(3, current + 1))
  }

  function payload(): EventPayload {
    const details = editing ? storedDetails : {
      ...neutralDetails,
      tagline: `${form.title.trim()} by MITS Motorsports`,
      address: form.location.trim(),
      venueDescription: `This event takes place at ${form.venue.trim()} in ${form.location.trim()}.`,
    }
    return {
      slug: editing?.slug || slugify(form.title),
      ...details,
      title: form.title.trim(),
      eventDate: form.eventDate,
      time: form.time.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      venue: form.venue.trim(),
      location: form.location.trim(),
      entryFee: form.entryFee.trim(),
      eligibility: form.eligibility.trim(),
      seatLimit: Number(form.seatLimit),
      closingAt: indiaInputToUtc(form.closingAt)!.toISOString(),
      registrationOpen: form.registrationOpen,
      published: form.published,
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateStep(1) || validateStep(2)
    if (validationError) { setError(validationError); setStep(validationError.includes('title') || validationError.includes('date') || validationError.includes('description') || validationError.includes('image') || validationError.includes('time') ? 1 : 2); return }
    if (form.published && !window.confirm('Publish this event now? It will become visible on the public events page.')) return
    setSaving(true)
    setError('')
    setFieldErrors(undefined)
    try {
      const data = payload()
      if (editing) {
        if (!editing._id && !editing.id) throw new Error('This event cannot be edited because the admin list response did not include its database ID.')
        const { slug: _slug, ...updatePayload } = data
        const result = await adminApi.updateEvent(editing._id || editing.id!, updatePayload)
        setSuccess(result.warning || 'Event updated successfully.')
      } else {
        await adminApi.createEvent(data)
        setSuccess(form.published ? 'Event published successfully.' : 'Event saved as a draft.')
      }
      setShowForm(false)
      await loadEvents()
    } catch (saveError) {
      if (saveError instanceof ApiError) { setError(saveError.message); setFieldErrors(saveError.fields) } else setError(saveError instanceof Error ? saveError.message : 'Unable to save event.')
    } finally { setSaving(false) }
  }

  return <div className="admin-page events-admin-page">
    <div className="admin-page-intro"><div><span className="admin-eyebrow">CONTENT / EVENTS</span><h2>Event management</h2><p>Review drafts and published events, then create or update an event.</p></div><button className="admin-button" onClick={openCreate}><Plus size={17} /> Create event</button></div>
    {success && <div className="admin-notice admin-success" role="status"><Check size={15} />{success}</div>}
    {error && !showForm && <div className="admin-notice error" role="alert">{error}<button className="admin-inline-button" onClick={() => void loadEvents()}><RotateCcw size={14} /> Retry</button></div>}
    {showForm && <form className="admin-panel event-wizard" onSubmit={submit}>
      <button type="button" className="admin-icon-button" aria-label="Close form" onClick={() => setShowForm(false)}><X size={18} /></button>
      <div className="event-wizard-header"><div><span className="admin-eyebrow">{editing ? 'EDIT EVENT' : 'NEW EVENT'}</span><h3>{editing ? `Edit ${editing.title}` : 'Create an event'}</h3></div><span>Step {step} of 3</span></div>
      {error && <div className="admin-notice error" role="alert"><CircleAlert size={15} />{error}</div>}
      {fieldErrors && <div className="admin-field-errors"><strong>Backend validation:</strong>{Object.entries(fieldErrors).map(([key, messages]) => <div key={key}><b>{key}:</b> {messages.join(' ')}</div>)}</div>}
      {step === 1 && <section><h4>Event essentials</h4><div className="admin-field-grid"><label>Event title<input required maxLength={180} value={form.title} onChange={(event) => update('title', event.target.value)} /></label><label>Event date<input required type="date" value={form.eventDate} onChange={(event) => update('eventDate', event.target.value)} /></label><label>Event time<input required maxLength={80} value={form.time} onChange={(event) => update('time', event.target.value)} placeholder="e.g. 10:00 AM - 4:00 PM" /></label><label>Image URL<input required type="url" value={form.image} onChange={(event) => update('image', event.target.value)} /></label></div><label>Description<textarea required maxLength={3000} rows={7} value={form.description} onChange={(event) => update('description', event.target.value)} /></label><div className="event-image-preview">{imagePreview && imageState !== 'error' ? <img src={imagePreview} alt="Event preview" onLoad={() => setImageState('loaded')} onError={() => setImageState('error')} /> : <span>{imageState === 'error' ? 'Image could not be loaded.' : 'Enter an image URL to preview it.'}</span>}</div></section>}
      {step === 2 && <section><h4>Location and registration</h4><div className="admin-field-grid"><label>Venue<input required maxLength={180} value={form.venue} onChange={(event) => update('venue', event.target.value)} /></label><label>Location<input required maxLength={180} value={form.location} onChange={(event) => update('location', event.target.value)} /></label><label>Entry fee<input required maxLength={80} value={form.entryFee} onChange={(event) => update('entryFee', event.target.value)} /></label><label>Eligibility<input required maxLength={300} value={form.eligibility} onChange={(event) => update('eligibility', event.target.value)} /></label><label>Seat limit<input required type="number" min="1" max="100000" step="1" value={form.seatLimit} onChange={(event) => update('seatLimit', event.target.value)} /></label><label>Registration closes<input required type="datetime-local" value={form.closingAt} onChange={(event) => update('closingAt', event.target.value)} /><small>India time; must be on or before the event date.</small></label></div><div className="event-toggle-grid"><label>Registration<select value={form.registrationOpen ? 'open' : 'closed'} onChange={(event) => update('registrationOpen', event.target.value === 'open')}><option value="open">Open</option><option value="closed">Closed</option></select></label><label>Publication<select value={form.published ? 'published' : 'draft'} onChange={(event) => update('published', event.target.value === 'published')}><option value="draft">Draft</option><option value="published">Published</option></select></label></div></section>}
      {step === 3 && <section><h4>Final review</h4><dl className="event-review"><div><dt>Title</dt><dd>{form.title}</dd></div><div><dt>Date and time</dt><dd>{formatDate(form.eventDate)} · {form.time}</dd></div><div><dt>Description</dt><dd>{form.description}</dd></div><div><dt>Image URL</dt><dd>{form.image}</dd></div><div><dt>Venue</dt><dd>{form.venue}, {form.location}</dd></div><div><dt>Entry and eligibility</dt><dd>{form.entryFee} · {form.eligibility}</dd></div><div><dt>Registration</dt><dd>{form.registrationOpen ? 'Open' : 'Closed'} · closes {formatClosing(form.closingAt)} · {form.seatLimit} seats</dd></div><div><dt>Publication</dt><dd>{form.published ? 'Publish now' : 'Save as draft'}</dd></div></dl></section>}
      <div className="event-wizard-actions">{step > 1 && <button type="button" className="admin-button admin-button-secondary" onClick={() => setStep((current) => current - 1)}>Back</button>}{step < 3 ? <button type="button" className="admin-submit admin-submit-small" onClick={nextStep}>Continue</button> : <button className="admin-submit admin-submit-small" disabled={saving}>{saving ? <LoaderCircle className="admin-spin" size={17} /> : form.published ? 'Confirm and publish' : editing ? 'Save draft changes' : 'Save draft'}</button>}</div>
    </form>}
    {loading ? <div className="admin-loading"><LoaderCircle className="admin-spin" size={22} /> Loading events...</div> : events.length ? <div className="event-list">{events.map((event) => <article className="event-list-item" key={event._id || event.id || event.slug}><div className="event-list-main"><span className="admin-card-kicker">{event.category}</span><h3>{event.title}</h3><p>{formatDate(event.date || event.eventDate)} · {event.venue}, {event.location}</p></div><span className={`admin-status ${event.published ? 'event-published' : ''}`}>{event.published ? 'Published' : 'Draft'}</span><button type="button" className="admin-inline-button event-edit-button" onClick={() => openEdit(event)}><Pencil size={14} /> Edit</button><div className="event-metrics"><span><b>Registration</b>{event.registrationOpen ? 'Open' : 'Closed'}</span><span><b>Confirmed</b>{event.confirmedCount}</span><span><b>Waitlist</b>{event.waitlistCount}</span><span><b>Needs contacting</b>{event.needsContactingCount}</span><span><b>Closes</b>{formatClosing(event.closingAt)}</span></div></article>)}</div> : <div className="admin-empty"><CalendarDays size={25} /><h3>No events found.</h3><p>Create a draft or publish the first event from the button above.</p></div>}
  </div>
}
