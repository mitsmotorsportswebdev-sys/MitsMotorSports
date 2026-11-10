import { FormEvent, useEffect, useRef, useState } from 'react'
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EventListingError, getPublicEvent, registerForEvent, type FieldErrors, type PublicEvent, type RegistrationMember, type RegistrationPayload } from '../services/eventListingService'
import './event-details.css'

const departments = ['CSA', 'CSB', 'AI', 'AIDS', 'MECH', 'CIVIL', 'EC', 'EEE', 'CYBER', 'VLSI']
const newMember = (): RegistrationMember => ({ fullName: '', department: '', year: 1, collegeId: '' })
const newForm = (): RegistrationPayload => ({ fullName: '', email: '', mobile: '', department: '', year: 1, collegeId: '', collegeName: '', teamName: '', members: [], website: '' })
const ordinal = (year: number) => `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'}`
const dateText = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const indiaText = (value: string) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(value))
const errorId = (field: string) => `${field}-error`

function FieldError({ field, errors }: { field: string; errors: FieldErrors }) {
  return <>{errors[field]?.map((message) => <span className="event-field-error" id={errorId(field)} key={message}>{message}</span>)}</>
}

function RegistrationDrawer({ event, onClose, onSuccess, onConflict }: { event: PublicEvent; onClose: () => void; onSuccess: () => void; onConflict: (message: string) => void }) {
  const [form, setForm] = useState(newForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const firstField = useRef<HTMLInputElement>(null)
  const drawerBody = useRef<HTMLDivElement>(null)
  const triggerMember = useRef<HTMLInputElement>(null)
  const isGroup = event.participation === 'group'
  const members = form.members || []
  const setValue = (field: keyof RegistrationPayload, value: string | number | RegistrationMember[]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: [] }))
  }
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstField.current?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = previous }
  }, [])
  useEffect(() => {
    const onKeyDown = (eventObject: KeyboardEvent) => { if (eventObject.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  function memberUpdate(index: number, field: keyof RegistrationMember, value: string | number) {
    const next = [...members]; next[index] = { ...next[index], [field]: value }; setValue('members', next)
  }
  function addMember() {
    if (members.length >= (event.maxTeamSize || 0) - 1) return
    setValue('members', [...members, newMember()])
    requestAnimationFrame(() => {
      triggerMember.current?.focus({ preventScroll: true })
      triggerMember.current?.scrollIntoView({ block: 'nearest' })
      drawerBody.current?.scrollTo({ top: drawerBody.current.scrollHeight, behavior: 'smooth' })
    })
  }
  function validate() {
    const next: FieldErrors = {}
    if (!form.fullName.trim()) next.fullName = ['Full name is required.']
    if (!form.email.trim()) next.email = ['College email is required.']
    else if (event.collegeOnly && !form.email.toLowerCase().endsWith('@mgits.ac.in')) next.email = ['Use your @mgits.ac.in email.']
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(form.mobile)) next.mobile = ['Enter a valid 10-digit Indian mobile number.']
    if (event.collegeOnly && !form.department) next.department = ['Department is required.']
    if (!form.collegeId) next.collegeId = ['College ID is required.']
    if (!event.collegeOnly && !form.collegeName?.trim()) next.collegeName = ['College name is required.']
    if (isGroup) {
      if (!form.teamName?.trim()) next.teamName = ['Team name is required.']
      if (1 + members.length < (event.minTeamSize || 0) || 1 + members.length > (event.maxTeamSize || Infinity)) next.members = [`Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}.`]
    }
    return next
  }
  async function submit(eventObject: FormEvent) {
    eventObject.preventDefault()
    const clientErrors = validate()
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); setMessage('Please correct the highlighted fields.'); return }
    setSending(true); setMessage(''); setErrors({})
    try {
      await registerForEvent(event.id, { ...form, ...(isGroup ? {} : { teamName: undefined, members: undefined }), ...(event.collegeOnly ? { collegeName: undefined } : {}) })
      setSuccess(true); onSuccess()
    } catch (error) {
      if (error instanceof EventListingError && error.status === 409) { setMessage(error.message); onConflict(error.message) }
      else if (error instanceof EventListingError) { setMessage(error.message); setErrors(error.fields || {}) }
      else setMessage('Registration could not be submitted.')
    } finally { setSending(false) }
  }
  return <div className="event-drawer-layer" onMouseDown={(eventObject) => { if (eventObject.target === eventObject.currentTarget) onClose() }}>
    <aside className="event-drawer" role="dialog" aria-modal="true" aria-labelledby="registration-title">
      <header className="event-drawer-header"><div><p className="events-kicker">Registration</p><h2 id="registration-title">{event.title}</h2></div><button className="event-drawer-close" type="button" onClick={onClose} aria-label="Close registration">×</button></header>
      {success ? <div className="event-drawer-success"><p>Registration received. The organisers will review it and contact you if needed.</p><button className="button-primary" type="button" onClick={onClose}>Close</button></div> : <form onSubmit={(eventObject) => void submit(eventObject)} className="event-registration-form">
        <div className="event-drawer-body" ref={drawerBody}>{message && <div className="event-form-message" role="alert">{message}</div>}<input name="website" value={form.website} onChange={(eventObject) => setValue('website', eventObject.target.value)} aria-hidden="true" tabIndex={-1} autoComplete="off" className="event-honeypot" />
          <label>Full name<input ref={firstField} value={form.fullName} onChange={(eventObject) => setValue('fullName', eventObject.target.value)} aria-describedby={errorId('fullName')} /><FieldError field="fullName" errors={errors} /></label>
          <label>College email{event.collegeOnly && <small>Use your @mgits.ac.in email</small>}<input type="email" value={form.email} onChange={(eventObject) => setValue('email', eventObject.target.value)} aria-describedby={errorId('email')} /><FieldError field="email" errors={errors} /></label>
          <label>Mobile<input inputMode="tel" value={form.mobile} onChange={(eventObject) => setValue('mobile', eventObject.target.value)} aria-describedby={errorId('mobile')} /><FieldError field="mobile" errors={errors} /></label>
          <label>Department{event.collegeOnly ? <select value={form.department} onChange={(eventObject) => setValue('department', eventObject.target.value)}><option value="">Select department</option>{departments.map((department) => <option key={department}>{department}</option>)}</select> : <input value={form.department} onChange={(eventObject) => setValue('department', eventObject.target.value)} />}<FieldError field="department" errors={errors} /></label>
          <label>Year<select value={form.year} onChange={(eventObject) => setValue('year', Number(eventObject.target.value))}>{event.allowedYears.map((year) => <option value={year} key={year}>{ordinal(year)} year</option>)}</select></label>
          <label>College ID<input placeholder="College ID" value={form.collegeId} onChange={(eventObject) => setValue('collegeId', eventObject.target.value)} aria-describedby={errorId('collegeId')} /><FieldError field="collegeId" errors={errors} /></label>
          {!event.collegeOnly && <label>College name<input required value={form.collegeName} onChange={(eventObject) => setValue('collegeName', eventObject.target.value)} aria-describedby={errorId('collegeName')} /><FieldError field="collegeName" errors={errors} /></label>}
          {isGroup && <fieldset><legend>Team of {1 + members.length}</legend><label>Team name<input value={form.teamName} onChange={(eventObject) => setValue('teamName', eventObject.target.value)} aria-describedby={errorId('teamName')} /><FieldError field="teamName" errors={errors} /></label><div className="event-member-list">{members.map((member, index) => <div className="event-member" key={index}><input ref={index === members.length - 1 ? triggerMember : undefined} aria-label={`Member ${index + 1} name`} placeholder="Member name" value={member.fullName} onChange={(eventObject) => memberUpdate(index, 'fullName', eventObject.target.value)} /><select aria-label={`Member ${index + 1} department`} value={member.department} onChange={(eventObject) => memberUpdate(index, 'department', eventObject.target.value)}><option value="">Department</option>{departments.map((department) => <option key={department}>{department}</option>)}</select><select aria-label={`Member ${index + 1} year`} value={member.year} onChange={(eventObject) => memberUpdate(index, 'year', Number(eventObject.target.value))}>{event.allowedYears.map((year) => <option value={year} key={year}>{ordinal(year)}</option>)}</select><input aria-label={`Member ${index + 1} college ID`} placeholder="College ID" value={member.collegeId} onChange={(eventObject) => memberUpdate(index, 'collegeId', eventObject.target.value)} /><button type="button" className="button-outline" onClick={() => setValue('members', members.filter((_, memberIndex) => memberIndex !== index))}>Remove</button></div>)}</div><button type="button" className="button-outline event-add-member" disabled={members.length >= (event.maxTeamSize || 0) - 1} onClick={addMember}>Add member</button>{members.length >= (event.maxTeamSize || 0) - 1 && <small>Maximum team size reached.</small>}<FieldError field="members" errors={errors} /></fieldset>}
        </div>
        <footer className="event-drawer-footer"><span>Team of {1 + members.length}{isGroup && `, needs ${event.minTeamSize}-${event.maxTeamSize}`}</span><button className="button-primary event-submit" disabled={sending}>{sending ? 'Submitting...' : 'Submit registration'}</button></footer>
      </form>}
    </aside>
  </div>
}

export default function EventDetailsPage() {
  const { eventId = '' } = useParams()
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const registerButton = useRef<HTMLButtonElement>(null)
  const load = () => { setLoading(true); setError(''); getPublicEvent(eventId).then(setEvent).catch((errorObject) => setError(errorObject instanceof EventListingError ? errorObject.message : 'Event not found.')).finally(() => setLoading(false)) }
  useEffect(() => { document.title = 'Event | MITS Motorsports'; load() }, [eventId])
  useEffect(() => { if (!drawerOpen) registerButton.current?.focus({ preventScroll: true }) }, [drawerOpen])
  if (loading) return <section className="event-detail-page"><div className="events-state">Loading event...</div></section>
  if (error || !event) return <section className="event-detail-page"><div className="events-state events-state-error"><h1>Event not found</h1><p>{error || 'This event is not available.'}</p><Link className="button-outline" to="/events">Back to events</Link></div></section>
  const ended = event.registrationState === 'ended'
  const closed = event.registrationState === 'closed'
  const participation = event.participation === 'group' ? `Teams of ${event.minTeamSize}-${event.maxTeamSize}` : 'Individual'
  const closeDrawer = () => { setDrawerOpen(false); load() }
  return <section className="event-detail-page"><Link className="event-back" to="/events"><span aria-hidden="true">←</span> All events</Link><div className="event-top-grid"><div className="event-detail-image"><img src={event.image} alt="" /></div><div className="event-detail-copy"><p className="events-kicker">MITS MOTORSPORTS / EVENT</p><h1>{event.title}</h1><div className="event-detail-meta"><div><CalendarDays aria-hidden="true" /><span><small>DATE</small>{dateText(event.eventDate)}</span></div><div><Clock3 aria-hidden="true" /><span><small>TIME</small>{event.time}</span></div><div><MapPin aria-hidden="true" /><span><small>VENUE</small>{event.venue}</span></div></div><div className="event-registration-card"><span className={`event-detail-state event-detail-state-${event.registrationState}`}>{ended ? 'This event has ended' : closed ? 'Registration is closed' : 'Registration open'}</span>{ended ? <p>This event has ended.</p> : closed ? <p>Registration is closed.</p> : <><strong>{event.seatsLeft} seats left</strong><p>Closes {indiaText(event.closingAt)} India time</p><div className="event-eligibility-chips"><span>{event.collegeOnly ? 'MITS students' : 'Open to all students'}</span><span>{event.allowedYears.length === 4 ? 'Open to all years' : event.allowedYears.map(ordinal).join(' and ') + ' years'}</span><span>{participation}</span></div><button ref={registerButton} className="button-primary event-register-button" type="button" onClick={() => setDrawerOpen(true)}>Register</button></>}</div></div></div><section className="event-details-full"><p className="events-kicker">MITS MOTORSPORTS / DETAILS</p><h2>Event details</h2><div className="event-details-columns"><div className="event-description-card"><p>{event.description}</p></div><div className="event-glance-card"><p className="events-kicker">At a glance</p><div><CalendarDays aria-hidden="true" /><span><small>ELIGIBILITY</small>{event.collegeOnly ? 'MITS students - ' : 'Open to all students - '}{event.allowedYears.length === 4 ? 'Open to all years' : event.allowedYears.map(ordinal).join(' and ') + ' years'}</span></div><div><Users aria-hidden="true" /><span><small>PARTICIPATION</small>{participation}</span></div><div><Users aria-hidden="true" /><span><small>SEATS</small>{event.seatLimit} total seats</span></div><div><Clock3 aria-hidden="true" /><span><small>REGISTRATION CLOSES</small>{indiaText(event.closingAt)} India time</span></div></div></div></section>{drawerOpen && <RegistrationDrawer event={event} onClose={closeDrawer} onSuccess={() => undefined} onConflict={() => { void getPublicEvent(event.id).then(setEvent) }} />}</section>
}
