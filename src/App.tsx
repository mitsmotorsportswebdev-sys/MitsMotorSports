import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/components/AdminLayout'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLoginPage from './admin/pages/AdminLoginPage'
import ChangePasswordPage from './admin/pages/ChangePasswordPage'
import DashboardPage from './admin/pages/DashboardPage'
import EventsPage from './admin/pages/EventsPage'
import EventFormPage from './admin/pages/EventFormPage'
import EventRegistrationsPage from './admin/pages/EventRegistrationsPage'
import ProjectsAdminPage from './admin/pages/ProjectsAdminPage'
import ProjectAdminPage from './admin/pages/ProjectAdminPage'
import LegacyAdminPage from './admin/pages/LegacyAdminPage'
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
import PublicEventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import ScrollManager from './components/layout/ScrollManager'

const futureRoutes = ['/contact', '/join-us']

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
      <Route path="/admin/login" element={getUser()?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/admin/events/new" element={<EventFormPage />} />
          <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
          <Route path="/admin/events/:id/registrations" element={<EventRegistrationsPage />} />
          <Route path="/admin/security" element={<ChangePasswordPage />} />
          <Route path="/admin/home" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/about" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/projects" element={<ProjectsAdminPage />} />
          <Route path="/admin/projects/:slug" element={<ProjectAdminPage />} />
          <Route path="/admin/team" element={<ProjectAdminPage fixedSlug="team" />} />
          <Route path="/admin/alumni" element={<ProjectAdminPage fixedSlug="alumni" />} />
          <Route path="/admin/sponsors" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/gallery" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/legacy" element={<LegacyAdminPage />} />
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
        <Route path="/events" element={<PublicEventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        {futureRoutes.map((path) => <Route key={path} path={path} element={<PagePlaceholder />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
  )
}
