import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/components/AdminLayout'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLoginPage from './admin/pages/AdminLoginPage'
import CollectionPage from './admin/pages/CollectionPage'
import ContentEditorPage from './admin/pages/ContentEditorPage'
import DashboardPage from './admin/pages/DashboardPage'
import ProjectsPage from './admin/pages/ProjectsPage'
import { getUser } from './admin/services/auth'
import SiteLayout from './layouts/SiteLayout'
import AboutPage from './pages/AboutPage'
import AethonPage from './pages/AethonPage'
import AlumniPage from './pages/AlumniPage'
import EBajaPage from './pages/EBajaPage'
import GalleryPage from './pages/GalleryPage'
import HomePage from './pages/HomePage'
import LegacyPage from './pages/LegacyPage'
import PagePlaceholder from './pages/PagePlaceholder'
import PublicProjectsPage from './pages/ProjectsPage'
import SponsorsPage from './pages/SponsorsPage'
import TeamPage from './pages/TeamPage'

const futureRoutes = ['/contact', '/join-us']

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={getUser()?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/home" element={<ContentEditorPage kind="home" />} />
          <Route path="/admin/about" element={<ContentEditorPage kind="about" />} />
          <Route path="/admin/projects" element={<ProjectsPage />} />
          <Route path="/admin/team" element={<CollectionPage kind="team" />} />
          <Route path="/admin/alumni" element={<CollectionPage kind="alumni" />} />
          <Route path="/admin/sponsors" element={<CollectionPage kind="sponsors" />} />
          <Route path="/admin/gallery" element={<CollectionPage kind="gallery" />} />
          <Route path="/admin/legacy" element={<CollectionPage kind="legacy" />} />
        </Route>
      </Route>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/legacy" element={<LegacyPage />} />
        <Route path="/alumni" element={<AlumniPage />} />
        <Route path="/projects" element={<PublicProjectsPage />} />
        <Route path="/projects/aethon" element={<AethonPage />} />
        <Route path="/projects/ebaja" element={<EBajaPage />} />
        <Route path="/team" element={<TeamPage />} />
        {futureRoutes.map((path) => <Route key={path} path={path} element={<PagePlaceholder />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

