import { useEffect, useState } from 'react'
import { ArrowUpRight, CheckCircle2, CircleAlert, FileText, Images, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi, ApiError } from '../services/api'

interface Stat { label: string; value: number | string; path: string; icon: typeof Users }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [connected, setConnected] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([adminApi.getProjects(), adminApi.getTeam(), adminApi.getAlumni(), adminApi.getSponsors(), adminApi.getGallery(), adminApi.getLegacy()]).then((results) => {
      const values = results.map((result) => result.status === 'fulfilled' && Array.isArray(result.value) ? result.value.length : 0)
      setStats([
        { label: 'Projects', value: values[0], path: '/admin/projects', icon: FileText }, { label: 'Team members', value: values[1], path: '/admin/team', icon: Users }, { label: 'Alumni', value: values[2], path: '/admin/alumni', icon: Users }, { label: 'Sponsors', value: values[3], path: '/admin/sponsors', icon: FileText }, { label: 'Gallery items', value: values[4], path: '/admin/gallery', icon: Images }, { label: 'Legacy entries', value: values[5], path: '/admin/legacy', icon: FileText },
      ])
    }).catch(() => setError('Some dashboard data could not be loaded.'))
    adminApi.checkConnection().then(() => setConnected(true)).catch((requestError) => { setConnected(false); if (!(requestError instanceof ApiError)) setError('The backend status could not be checked.') })
  }, [])

  return <div className="admin-page"><div className="admin-page-intro"><div><span className="admin-eyebrow">CONTROL ROOM / LIVE</span><h2>Good to see you.</h2><p>Keep the public team story current from one place.</p></div><div className={`admin-connection ${connected === true ? 'is-connected' : connected === false ? 'is-disconnected' : ''}`}>{connected === true ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}<span>Backend {connected === null ? 'checking' : connected ? 'connected' : 'disconnected'}</span></div></div>{error && <div className="admin-notice error">{error}</div>}<div className="admin-stat-grid">{stats.map(({ label, value, path, icon: Icon }) => <Link to={path} className="admin-stat-card" key={label}><span className="admin-stat-icon"><Icon size={18} /></span><span className="admin-stat-label">{label}</span><strong>{value}</strong><ArrowUpRight className="admin-stat-arrow" size={18} /></Link>)}</div><div className="admin-dashboard-columns"><section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">QUICK ACTIONS</span><h3>Make a change</h3></div></div><div className="admin-action-list"><Link to="/admin/home">Edit homepage <ArrowUpRight size={16} /></Link><Link to="/admin/about">Update team story <ArrowUpRight size={16} /></Link><Link to="/admin/projects">Add a project <ArrowUpRight size={16} /></Link></div></section><section className="admin-panel admin-panel-dark"><span className="admin-eyebrow">SYSTEM NOTE</span><h3>Read-only collections</h3><p>Team, sponsors, gallery, legacy, and alumni currently expose public GET routes only. Their management views are ready for backend CRUD endpoints.</p></section></div></div>
}
