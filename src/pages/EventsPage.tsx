import { CalendarDays, Clock3, MapPin, RefreshCw, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventListingError, getPublicEvents, type PublicEvent } from '../services/eventListingService'
import './events.css'

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function eligibility(years: number[]) {
  if (years.length === 4) return 'Open to all years'
  if (years.length === 1) return `${years[0]}${years[0] === 1 ? 'st' : years[0] === 2 ? 'nd' : years[0] === 3 ? 'rd' : 'th'} year only`
  const sorted = [...years].sort((a, b) => a - b)
  return `${sorted.slice(0, -1).map((year) => `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'}`).join(', ')} and ${sorted.at(-1)}${sorted.at(-1) === 1 ? 'st' : sorted.at(-1) === 2 ? 'nd' : sorted.at(-1) === 3 ? 'rd' : 'th'} years`
}

function EventImage({ event }: { event: PublicEvent }) {
  const [failed, setFailed] = useState(false)
  return failed ? <div className="events-image-fallback">Image unavailable</div> : <img src={event.image} alt="" onError={() => setFailed(true)} />
}

function EventCard({ event }: { event: PublicEvent }) {
  const participation = event.participation === 'group' ? `Teams of ${event.minTeamSize}-${event.maxTeamSize}` : 'Individual'
  return <article className="events-card">
    <Link className="events-card-image" to={`/events/${event.id}`} aria-label={`View details for ${event.title}`}><EventImage event={event} /><span className={`events-card-status events-card-status-${event.registrationState}`}>{event.registrationState === 'open' ? 'Registration open' : 'Registration closed'}</span></Link>
    <div className="events-card-content"><p className="events-kicker">MITS MOTORSPORTS / EVENT</p><h2><Link to={`/events/${event.id}`}>{event.title}</Link></h2><dl className="events-card-meta"><div><dt><CalendarDays aria-hidden="true" /> Date</dt><dd>{formatDate(event.eventDate)}</dd></div><div><dt><Clock3 aria-hidden="true" /> Time</dt><dd>{event.time}</dd></div><div><dt><MapPin aria-hidden="true" /> Venue</dt><dd>{event.venue}</dd></div></dl><p className="events-card-detail"><Users aria-hidden="true" /> {event.seatsLeft} seats left</p><p className="events-card-detail">{eligibility(event.allowedYears)} · {participation}</p><Link className="button-outline events-card-link" to={`/events/${event.id}`}>View event <span aria-hidden="true">↗</span></Link></div>
  </article>
}

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  function load() { setLoading(true); setError(''); getPublicEvents().then(setEvents).catch((err) => setError(err instanceof EventListingError ? err.message : 'The events could not be loaded.')).finally(() => setLoading(false)) }
  useEffect(() => { document.title = 'Events | MITS Motorsports'; load() }, [])
  return <section className="events-page"><div className="events-hero"><div className="events-page-header"><p className="events-kicker">MITS Motorsports / Calendar</p><h1>Events in motion.</h1><p className="events-page-intro">Explore upcoming competitions, engineering challenges and experiences built for people who live for motorsport.</p></div><div className="events-page-content">{loading && <div className="events-state" role="status"><span className="events-spinner" /> Loading events...</div>}{!loading && error && <div className="events-state events-state-error" role="alert"><p>{error}</p><button className="button-outline" type="button" onClick={load}><RefreshCw aria-hidden="true" /> Try again</button></div>}{!loading && !error && events.length === 0 && <div className="events-state"><p className="events-kicker">No upcoming events</p></div>}{!loading && !error && events.length > 0 && <div className={`events-grid${events.length > 1 ? ' events-grid-many' : ''}`}>{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}</div></div></section>
}
