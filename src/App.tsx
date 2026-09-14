import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import HomePage from './pages/HomePage'
import PagePlaceholder from './pages/PagePlaceholder'

const futureRoutes = ['/projects', '/projects/aethon', '/projects/ebaja', '/team', '/alumni', '/gallery', '/legacy', '/about', '/sponsors', '/contact', '/join-us']

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        {futureRoutes.map((path) => <Route key={path} path={path} element={<PagePlaceholder />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
