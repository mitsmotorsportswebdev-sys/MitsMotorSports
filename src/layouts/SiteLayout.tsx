import { Outlet } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import TopographyBackground from '../components/layout/TopographyBackground'

export default function SiteLayout() {
  return (
    <div className="site-layout relative min-h-screen overflow-x-clip bg-black text-white">
      <TopographyBackground />
      <Navbar />
      <main className="relative z-10"><Outlet /></main>
      <Footer />
    </div>
  )
}
