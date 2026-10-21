import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { adminApi } from '../services/api'
import { getUser } from '../services/auth'

export default function ProtectedRoute() {
  const location = useLocation()
  const user = getUser()
  const [checking, setChecking] = useState(Boolean(user))
  const [valid, setValid] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setChecking(false)
      return
    }
    adminApi.getSession().then(() => setValid(true)).catch(() => setValid(false)).finally(() => setChecking(false))
  }, [user?.id])

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  if (checking) return <div className="admin-auth-loading">Checking session...</div>
  if (!valid) return null
  return <Outlet />
}
