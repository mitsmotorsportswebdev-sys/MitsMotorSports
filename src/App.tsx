import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import AboutPage from './pages/AboutPage'
import AethonPage from './pages/AethonPage'
import AlumniPage from './pages/AlumniPage'
import EBajaPage from './pages/EBajaPage'
import GalleryPage from './pages/GalleryPage'
import HomePage from './pages/HomePage'
import LegacyPage from './pages/LegacyPage'
import PagePlaceholder from './pages/PagePlaceholder'
import SponsorsPage from './pages/SponsorsPage'
import TeamPage from './pages/TeamPage'

const futureRoutes = ['/projects', '/contact', '/join-us']

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/legacy" element={<LegacyPage />} />
        <Route path="/alumni" element={<AlumniPage />} />
        <Route path="/projects/aethon" element={<AethonPage />} />
        <Route path="/projects/ebaja" element={<EBajaPage />} />
        <Route path="/team" element={<TeamPage />} />
        {futureRoutes.map((path) => <Route key={path} path={path} element={<PagePlaceholder />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

