import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, adminApi } from '../services/api'

type EventRow = {
  _id?: string
  id?: string
  title: string
  eventDate: string
  venue: string
  registrationState?: string
  published?: boolean
  seatsUsed?: number
  seatLimit: number
  entries?: number
  pending?: number
  registrationOpen?: boolean
}

function eventId(event: EventRow) { return event._id || event.id || '' }

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try { setEvents(await adminApi.getEvents() as EventRow[]) } catch (err) { setError(err instanceof ApiError ? err.message : 'Unable to load events.') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  async function remove(event: EventRow) {
    if (!window.confirm(`Delete "${event.title}"? This also removes its registrations.`)) return
    try { await adminApi.deleteEvent(eventId(event)); await load() } catch (err) { setError(err instanceof ApiError ? err.message : 'Unable to delete the event.') }
  }
  async function toggleRegistration(event: EventRow) {
    const open = event.registrationOpen !== false
    if (!window.confirm(`${open ? 'Close' : 'Reopen'} registrations for "${event.title}"?`)) return
    try { await adminApi.setRegistrationOpen(eventId(event), !open); await load() } catch (err) { setError(err instanceof ApiError ? err.message : 'Unable to update registration access.') }
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">EVENTS</p><h2>Event management</h2></div><Link className="admin-button admin-button-primary" to="/admin/events/new">New event</Link></div>
    {error && <div className="admin-alert admin-alert-error">{error}</div>}
    {loading ? <div className="admin-state">Loading events...</div> : events.length === 0 ? <div className="admin-state">No events yet.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>State</th><th>Seats</th><th>Entries</th><th>Pending</th><th>Actions</th></tr></thead><tbody>{events.map((event) => {
      const id = eventId(event); const state = event.published === false ? 'unpublished' : (event.registrationState || 'closed')
      return <tr key={id}><td><strong>{event.title}</strong></td><td>{event.eventDate}</td><td>{event.venue}</td><td><span className={`admin-status admin-status-${state}`}>{state}</span><small className="admin-state-reason">{event.registrationOpen === false ? 'Closed manually' : state === 'closed' ? 'Full or past closing time' : ''}</small></td><td>{event.seatsUsed || 0} / {event.seatLimit}</td><td>{event.entries || 0}</td><td>{event.pending || 0}</td><td><div className="admin-actions"><Link className="admin-button admin-button-small" to={`/admin/events/${id}/edit`}>Edit</Link><Link className="admin-button admin-button-small" to={`/admin/events/${id}/registrations`}>Registrations</Link><button className="admin-button admin-button-small" onClick={() => void toggleRegistration(event)}>{event.registrationOpen === false ? 'Reopen registration' : 'Close registration'}</button><button className="admin-button admin-button-small admin-button-danger" onClick={() => void remove(event)}>Delete</button></div></td></tr>
    })}</tbody></table></div>}
  </section>
}
