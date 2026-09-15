import { FormEvent, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../services/api'
import { setAuth } from '../services/auth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password) { setError('Email and password are required.'); return }
    setLoading(true); setError('')
    try {
      const result = await adminApi.login(email, password)
      if (result.user.role !== 'admin') { setError('This account does not have admin access.'); return }
      setAuth(result.token, result.user)
      const destination = (location.state as { from?: string } | null)?.from || '/admin'
      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(loginError instanceof ApiError ? loginError.message : 'Unable to sign in.')
    } finally { setLoading(false) }
  }

  return <main className="admin-login-page"><div className="admin-login-grid" /><section className="admin-login-panel"><div className="admin-login-brand"><span className="admin-brand-mark">M</span><span><strong>MITS</strong><small>Motorsports</small></span></div><div className="admin-login-copy"><span className="admin-eyebrow">TEAM OPERATIONS / 01</span><h1>Build what moves<br /><em>forward.</em></h1><p>Content control for the MITS Motorsports team.</p></div><form className="admin-login-form" onSubmit={submit}><label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@mitsmotorsports.local" /></label><label>Password<span className="admin-password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p className="admin-form-error"><LockKeyhole size={15} />{error}</p>}<button className="admin-submit" disabled={loading}>{loading ? <LoaderCircle className="admin-spin" size={18} /> : 'Enter workspace'}</button></form><small className="admin-login-foot">Authorized team members only</small></section><aside className="admin-login-aside"><div className="admin-aside-line" /><span>EST. 2012</span><strong>ENGINEERED<br />TO COMPETE</strong><p>Montgomery Institute of Technology and Science</p></aside></main>
}
