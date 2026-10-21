import { FormEvent, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../services/api'
import { clearAuth } from '../services/auth'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (newPassword.length < 10) {
      setError('Your new password must be at least 10 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await adminApi.changePassword(currentPassword, newPassword)
      clearAuth()
      navigate('/admin/login', { replace: true, state: { message: 'Password changed. Please log in again.' } })
    } catch (changeError) {
      setError(changeError instanceof ApiError ? changeError.message : 'Unable to change your password.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="admin-page"><div className="admin-page-intro"><div><span className="admin-eyebrow">ACCOUNT / SECURITY</span><h2>Change password</h2><p>Use a new password to protect your admin workspace.</p></div></div><form className="admin-panel admin-security-form" onSubmit={submit}><label>Current password<span className="admin-password-wrap"><input required type={showPasswords ? 'text' : 'password'} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /><button type="button" aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'} onClick={() => setShowPasswords(!showPasswords)}>{showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label>New password<input required minLength={10} type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label><label>Confirm new password<input required minLength={10} type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>{error && <p className="admin-form-error" role="alert"><LockKeyhole size={15} />{error}</p>}<p className="admin-security-note"><CheckCircle2 size={15} />At least 10 characters. You will be signed out after changing it.</p><button className="admin-submit admin-submit-small" disabled={saving}>{saving ? <LoaderCircle className="admin-spin" size={17} /> : 'Change password'}</button></form></div>
}
