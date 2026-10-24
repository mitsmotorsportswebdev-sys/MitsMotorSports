import { CalendarDays, Clock3, MapPin, RefreshCw, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventListingError, getPublicEvents, type PublicEvent } from '../services/eventListingService'
import './events.css'

const registrationStateCopy: Record<PublicEvent['registrationState'], string> = {
  open: 'Registration open',
  'full-waiting-list': 'Join the waitlist',
  closed: 'Registration closed',
  ended: 'Event ended',
}

function formatEventDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return date
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function EventCard({ event }: { event: PublicEvent }) {
  const isAvailable = event.registrationState === 'open' || event.registrationState === 'full-waiting-list'

  return (
    <article className="events-card">
      <Link className="events-card-image" to={`/events/${event.slug}`} aria-label={`View details for ${event.title}`}>
        <EventImage src={event.image} alt="" />
        <span className={`events-card-status events-card-status-${event.registrationState}`}>
          {registrationStateCopy[event.registrationState]}
        </span>
      </Link>
      <div className="events-card-content">
        <p className="events-kicker">{event.category}</p>
        <h2><Link to={`/events/${event.slug}`}>{event.title}</Link></h2>
        <p className="events-card-tagline">{event.tagline}</p>
        <dl className="events-card-meta">
          <div><dt><CalendarDays aria-hidden="true" /> Date</dt><dd>{formatEventDate(event.date)}</dd></div>
          <div><dt><Clock3 aria-hidden="true" /> Time</dt><dd>{event.time}</dd></div>
          <div><dt><MapPin aria-hidden="true" /> Venue</dt><dd>{event.venue}, {event.location}</dd></div>
        </dl>
        {isAvailable && <p className="events-card-seats"><Users aria-hidden="true" /> {event.registrationState === 'full-waiting-list' ? 'Currently accepting waitlist registrations' : `${event.seatsLeft} seat${event.seatsLeft === 1 ? '' : 's'} remaining`}</p>}
        <Link className="button-outline events-card-link" to={`/events/${event.slug}`}>View event <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  )
}

function EventImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return failed
    ? <div className="events-image-fallback" role="img" aria-label={`${alt || 'Event'} image unavailable`}>Image unavailable</div>
    : <img src={src} alt={alt} onError={() => setFailed(true)} />
}

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function loadEvents() {
    setLoading(true)
    setError('')
    getPublicEvents()
      .then(setEvents)
      .catch((requestError) => setError(requestError instanceof EventListingError ? requestError.message : 'The events could not be loaded. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    document.title = 'Events | MITS Motorsports'
    loadEvents()
  }, [])

  return (
    <section className="events-page">
      <div className="events-page-header">
        <p className="events-kicker">MITS Motorsports / Calendar</p>
        <h1>Events in motion.</h1>
        <p className="events-page-intro">Explore upcoming competitions, engineering challenges and experiences built for people who live for motorsport.</p>
      </div>
      {loading && <div className="events-state" role="status"><span className="events-spinner" /> Loading events...</div>}
      {!loading && error && <div className="events-state events-state-error" role="alert"><p>{error}</p><button className="button-outline" type="button" onClick={loadEvents}><RefreshCw aria-hidden="true" /> Try again</button></div>}
      {!loading && !error && events.length === 0 && <div className="events-state"><p className="events-kicker">No upcoming events</p><h2>Nothing on the calendar just yet.</h2><p>Check back soon for the next MITS Motorsports experience.</p></div>}
      {!loading && !error && events.length > 0 && <div className="events-grid">{events.map((event) => <EventCard key={event.slug} event={event} />)}</div>}
    </section>
  )
}
