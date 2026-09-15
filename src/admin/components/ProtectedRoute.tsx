import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getUser } from '../services/auth'

export default function ProtectedRoute() {
  const location = useLocation()
  const user = getUser()
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
