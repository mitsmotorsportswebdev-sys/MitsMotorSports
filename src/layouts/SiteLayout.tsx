import { Outlet } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'

export default function SiteLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-black text-white">
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </div>
  )
}
