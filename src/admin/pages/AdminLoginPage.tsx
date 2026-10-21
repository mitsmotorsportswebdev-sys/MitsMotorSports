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
  const message = (location.state as { message?: string } | null)?.message

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

  return <main className="admin-login-page"><section className="admin-login-panel"><div className="admin-login-copy"><h1>Admin login</h1></div><form className="admin-login-form" onSubmit={submit} noValidate><label htmlFor="admin-email">Email<input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your team email" /></label><label htmlFor="admin-password">Password<span className="admin-password-wrap"><input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{message && !error && <p className="admin-form-success" role="status">{message}</p>}{error && <p className="admin-form-error" role="alert"><LockKeyhole size={15} />{error}</p>}<button className="admin-submit" disabled={loading}>{loading ? <LoaderCircle className="admin-spin" size={18} /> : 'Sign in'}</button></form></section><aside className="admin-login-aside"><div className="admin-login-logo-frame"><img src="/images/about/faviconLogo.png" alt="MITS Motorsports" /></div></aside></main>
}
