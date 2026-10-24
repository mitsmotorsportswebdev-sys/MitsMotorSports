import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, LockKeyhole, LogOut, Menu, PanelLeftClose, X } from 'lucide-react'
import { clearAuth, getUser } from '../services/auth'
import '../styles/admin.css'

const navigation = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Events', path: '/admin/events', icon: CalendarDays },
  { label: 'Security', path: '/admin/security', icon: LockKeyhole },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const current = navigation.find((item) => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))

  function logout() {
    clearAuth()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <button className="admin-mobile-toggle" aria-label="Open admin navigation" onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>
      {open && <button className="admin-backdrop" aria-label="Close admin navigation" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <img className="admin-brand-logo" src="/images/about/faviconLogo.png" alt="MITS Motorsports" />
          <button className="admin-close-button" aria-label="Close admin navigation" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <div className="admin-sidebar-label">Workspace</div>
        <nav className="admin-nav">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''}>
              <Icon size={17} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-chip"><span className="admin-avatar">{user?.email?.slice(0, 1).toUpperCase() || 'A'}</span><span>{user?.email || 'Admin'}</span></div>
          <button className="admin-logout" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-header">
          <div><span className="admin-eyebrow">MITS MOTORSPORTS / ADMIN</span><h1>{current?.label || 'Overview'}</h1></div>
          <div className="admin-header-meta"><span className="admin-live-dot" /> <span>{user?.email}</span><button className="admin-collapse" aria-label="Open navigation" onClick={() => setOpen(true)}><PanelLeftClose size={18} /></button></div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </section>
    </div>
  )
}
