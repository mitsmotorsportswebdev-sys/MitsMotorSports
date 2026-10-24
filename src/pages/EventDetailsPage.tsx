import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Clock3, ExternalLink, MapPin, Users, X } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { EventListingError, getPublicEvent, type PublicEvent } from '../services/eventListingService'
import { registerForEvent, type MockRegistration, type ParticipantType, type RegistrationData } from '../services/eventService'
import './event-details.css'

const emptyForm: RegistrationData = {
  fullName: '',
  email: '',
  phone: '',
  college: '',
  teamName: '',
  participantType: '',
  participantCount: '1',
  experience: '',
  requirements: '',
  termsAccepted: false,
}

type FormErrors = Partial<Record<keyof RegistrationData, string>>

const statusCopy: Record<PublicEvent['registrationState'], string> = {
  open: 'Registration Open',
  'full-waiting-list': 'Join the Waitlist',
  closed: 'Registration Closed',
  ended: 'Event Ended',
} as const

function validateForm(form: RegistrationData): FormErrors {
  const errors: FormErrors = {}
  if (!form.fullName.trim()) errors.fullName = 'Name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address.'
  if (!/^[+]?[0-9\s-]{10,15}$/.test(form.phone)) errors.phone = 'Please enter a valid phone number.'
  if (!form.college.trim()) errors.college = 'College or institution is required.'
  if (!form.participantType) errors.participantType = 'Please select a participant type.'
  if (!form.termsAccepted) errors.termsAccepted = 'You must agree to the event rules.'
  return errors
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="event-section-heading"><p className="event-kicker">{eyebrow}</p><h2>{title}</h2>{description && <p className="event-section-description">{description}</p>}</div>
}

function formatEventDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsedDate.getTime())) return date
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(parsedDate)
}

function EventHero({ event, onRegister }: { event: PublicEvent; onRegister: () => void }) {
  const prefersReducedMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = useState(false)
  const status = event.registrationState === 'open' || event.registrationState === 'full-waiting-list'
  return <section className="event-hero">
    {imageFailed ? <div className="event-hero-image event-image-fallback" role="img" aria-label="Event image unavailable">Image unavailable</div> : <img className="event-hero-image" src={event.image} alt="" onError={() => setImageFailed(true)} />}
    <div className="event-hero-overlay" />
    <motion.div className="event-hero-content" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: prefersReducedMotion ? 0 : .7 }}>
      <p className="event-kicker">{event.category}</p>
      <h1>{event.title}</h1>
      <p className="event-hero-tagline">{event.tagline}</p>
      <div className="event-hero-meta"><span><Clock3 /> {formatEventDate(event.date)}</span><span><MapPin /> {event.venue}, {event.location}</span></div>
      <div className="event-hero-actions"><span className={`event-status event-status-${event.registrationState}`}><span />{statusCopy[event.registrationState]}</span>{status && <button className="button-primary" onClick={onRegister}>Register now</button>}</div>
    </motion.div>
  </section>
}

function EventOverview({ event, onRegister }: { event: PublicEvent; onRegister: () => void }) {
  const cards = [['DATE', event.date], ['TIME', event.time], ['VENUE', event.venue], ['EVENT TYPE', event.eventType], ['ELIGIBILITY', event.eligibility], ['ENTRY FEE', event.entryFee]]
  return <section className="event-section event-overview">
    <SectionHeading eyebrow="At a glance / 01" title="The details that mat ter." />
    <div className="event-info-grid">{cards.map(([label, value]) => <div className="event-info-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <button className="button-outline event-secondary-cta" onClick={onRegister}>Secure your spot <span aria-hidden="true">↗</span></button>
  </section>
}

function EventContent({ event }: { event: PublicEvent }) {
  return <section className="event-section event-content-grid">
    <div><SectionHeading eyebrow="The why / 02" title="About the event" /><p className="event-copy">{event.description}</p></div>
    <div className="event-highlights"><p className="event-kicker">Event highlights</p>{event.highlights.map((highlight, index) => <motion.div key={highlight} className="event-highlight" whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 18 }} viewport={{ once: true }} transition={{ delay: index * .08 }}><span>0{index + 1}</span><strong>{highlight}</strong></motion.div>)}</div>
  </section>
}

function Schedule({ schedule }: { schedule: PublicEvent['schedule'] }) {
  return <section className="event-section"><SectionHeading eyebrow="Pit wall / 03" title="Event schedule" description="A full day of machines, people and engineering in motion." /><div className="event-timeline">{schedule.map((item, index) => <motion.article key={item.time} className="event-timeline-item" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ delay: index * .06 }}><div className="event-timeline-time">{item.time}</div><div className="event-timeline-marker" /><div><h3>{item.title}</h3><p>{item.description}</p></div></motion.article>)}</div></section>
}

function Rules({ event }: { event: PublicEvent }) {
  const [open, setOpen] = useState('eligibility')
  const items = [{ id: 'eligibility', title: 'Eligibility', content: event.eligibilityDetails }, { id: 'rules', title: 'Rules & safety', content: event.rules }]
  return <section className="event-section event-rules-section"><SectionHeading eyebrow="Know the course / 04" title="Rules & eligibility" /><div className="event-accordions">{items.map((item) => <div className="event-accordion" key={item.id}><button onClick={() => setOpen(open === item.id ? '' : item.id)} aria-expanded={open === item.id}><span>{item.title}</span><ChevronDown className={open === item.id ? 'rotate-180' : ''} /></button>{open === item.id && <div className="event-accordion-content"><ul>{item.content.map((line) => <li key={line}>{line}</li>)}</ul></div>}</div>)}</div></section>
}

function Venue({ event }: { event: PublicEvent }) {
  const [imageFailed, setImageFailed] = useState(false)
  return <section className="event-section venue-section">{imageFailed ? <div className="venue-image event-image-fallback" role="img" aria-label="Venue image unavailable">Image unavailable</div> : <img className="venue-image" src={event.image} alt="" onError={() => setImageFailed(true)} />}<div className="venue-copy"><SectionHeading eyebrow="The paddock / 05" title={event.venue} /><p>{event.venueDescription}</p><p className="venue-address"><MapPin /> {event.address}</p><a className="button-outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`} target="_blank" rel="noreferrer">View location <ExternalLink /></a></div></section>
}

function Field({ label, name, value, error, onChange, type = 'text', placeholder }: { label: string; name: keyof RegistrationData; value: string; error?: string; onChange: (name: keyof RegistrationData, value: string) => void; type?: string; placeholder?: string }) {
  return <div className="event-field"><label htmlFor={name}>{label} *</label><input id={name} name={name} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} />{error && <span className="event-error" id={`${name}-error`}>{error}</span>}</div>
}

function RegistrationForm({ onComplete }: { onComplete: (registration: MockRegistration) => void }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const update = (name: keyof RegistrationData, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }))
  const submit = async (eventObject: React.FormEvent<HTMLFormElement>) => {
    eventObject.preventDefault()
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      const registration = await registerForEvent(form)
      onComplete(registration)
    } finally {
      setSubmitting(false)
    }
  }
  return <form className="event-registration-form" onSubmit={submit} noValidate>
    <div className="event-form-grid"><Field label="Full name" name="fullName" value={form.fullName} error={errors.fullName} onChange={update} /><Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={update} /><Field label="Phone number" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={update} /><Field label="College / institution" name="college" value={form.college} error={errors.college} onChange={update} /></div>
    <div className="event-form-grid"><Field label="Team name" name="teamName" value={form.teamName} onChange={update} placeholder="Optional" /><div className="event-field"><label htmlFor="participantType">Participant type *</label><select id="participantType" value={form.participantType} onChange={(event) => update('participantType', event.target.value as ParticipantType)} aria-invalid={Boolean(errors.participantType)}><option value="">Select type</option><option>Individual</option><option>Team</option><option>Club/Organization</option></select>{errors.participantType && <span className="event-error">{errors.participantType}</span>}</div><Field label="Number of participants" name="participantCount" type="number" value={form.participantCount} onChange={update} /><Field label="Experience level" name="experience" value={form.experience} onChange={update} placeholder="Optional" /></div>
    <div className="event-field"><label htmlFor="requirements">Special requirements</label><textarea id="requirements" name="requirements" value={form.requirements} onChange={(event) => update('requirements', event.target.value)} rows={3} placeholder="Accessibility, dietary or other requirements (optional)" /></div>
    <label className="event-checkbox"><input type="checkbox" checked={form.termsAccepted} onChange={(event) => update('termsAccepted', event.target.checked)} aria-invalid={Boolean(errors.termsAccepted)} /><span>I agree to the event rules and terms.</span></label>{errors.termsAccepted && <span className="event-error">{errors.termsAccepted}</span>}
    <button className="button-primary event-submit" type="submit" disabled={submitting}>{submitting ? 'Registering...' : 'Register for event'}</button>
  </form>
}

function RegistrationSuccess({ event, registration, onBack }: { event: PublicEvent; registration: MockRegistration; onBack: () => void }) {
  return <motion.div className="event-success" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}><div className="event-success-icon"><Check /></div><p className="event-kicker">Registration confirmed</p><h3>You are on the grid.</h3><p>Thank you for registering for {event.title}.</p><dl><div><dt>Registration ID</dt><dd>{registration.registrationId}</dd></div><div><dt>Participant</dt><dd>{registration.fullName}</dd></div><div><dt>Date</dt><dd>{event.date}</dd></div></dl><button className="button-outline" onClick={onBack}>View event</button></motion.div>
}

export default function EventDetailsPage() {
  const { eventId: slug } = useParams()
  const [event, setEvent] = useState<PublicEvent>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registration, setRegistration] = useState<MockRegistration>()
  const registrationRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = 'Event Details | MITS Motorsports'
    setLoading(true)
    setError('')
    if (!slug) {
      setError('Event not found.')
      setLoading(false)
      return
    }
    getPublicEvent(slug).then(setEvent).catch((requestError) => setError(requestError instanceof EventListingError ? requestError.message : 'The event could not be loaded. Please try again.')).finally(() => setLoading(false))
  }, [slug])

  const scrollToRegistration = () => registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (loading) return <div className="event-state">Loading event...</div>
  if (error || !event) return <div className="event-state"><X /><p className="event-kicker">{error === 'Event not found.' ? 'Event not found' : 'Unable to load event'}</p><h1>{error || 'The event you’re looking for does not exist.'}</h1><a className="button-outline" href="/events">Back to events</a></div>

  return <motion.div className="event-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .45 }}>
    <EventHero event={event} onRegister={scrollToRegistration} />
    <main>
      <EventOverview event={event} onRegister={scrollToRegistration} />
      <EventContent event={event} />
      <Schedule schedule={event.schedule} />
      <Rules event={event} />
      <Venue event={event} />
      <section className="event-registration-section" ref={registrationRef}>
        <div className="registration-intro"><p className="event-kicker">Ready to join? / 06</p><h2>Secure your place.</h2><p>Bring your curiosity, your team and your appetite for speed.</p><div className="registration-note"><Users /> Frontend registration only. No payment is collected.</div></div>
        {event.registrationState !== 'open' && event.registrationState !== 'full-waiting-list' ? <div className="event-closed"><X /><h3>{statusCopy[event.registrationState]}</h3><p>Registration for this event is no longer available.</p></div> : registration ? <RegistrationSuccess event={event} registration={registration} onBack={() => { setRegistration(undefined); scrollToRegistration() }} /> : <RegistrationForm onComplete={setRegistration} />}
      </section>
    </main>
  </motion.div>
}
