import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getUser } from '../services/auth'

export default function DashboardPage() {
  const user = getUser()

  return <div className="admin-page admin-welcome-page"><span className="admin-eyebrow">MITS MOTORSPORTS / ADMIN</span><h2>Welcome back.</h2><p className="admin-welcome-email">{user?.email}</p><Link className="admin-button" to="/admin/security">Manage security <ArrowUpRight size={16} /></Link></div>
}
