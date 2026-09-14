import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../../assets/images/faviconLogo (1).jpg'

const navigation = [
  { label: 'Home', to: '/' }, { label: 'About', to: '/about' }, { label: 'Sponsors', to: '/sponsors' },
  { label: 'Gallery', to: '/gallery' }, { label: 'Legacy', to: '/legacy' }, { label: 'Alumni', to: '/alumni' },
]
const projectLinks = [{ label: 'Aethon V4', to: '/projects/aethon' }, { label: 'E-Baja', to: '/projects/ebaja' }]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll(); window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setOpen(false); setProjectsOpen(false) }, [location.pathname])
  const itemClass = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? 'text-red-500' : ''}`

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-black/70 py-2 shadow-xl shadow-black/30 backdrop-blur-md' : 'py-4'}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 lg:px-8">
        <Link className="flex items-center gap-2" to="/" aria-label="MITS Motorsports home">
          <img className="h-10 w-10 rounded-full object-cover" src={logo} alt="MITS Motorsports emblem" />
          <span className="font-display text-lg font-bold tracking-tight text-white sm:text-2xl">MITS <span className="text-red-800">Motorsports</span></span>
        </Link>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {navigation.slice(0, 3).map((item) => <NavLink key={item.to} className={itemClass} to={item.to}>{item.label}</NavLink>)}
          <div className="relative">
            <button className={`nav-link flex items-center gap-1 ${location.pathname.startsWith('/projects') ? 'text-red-500' : ''}`} onClick={() => setProjectsOpen((value) => !value)} aria-expanded={projectsOpen}>
              Projects <ChevronDown className={`h-4 w-4 transition ${projectsOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>{projectsOpen && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute left-0 top-full mt-2 w-44 overflow-hidden rounded-md border border-white/10 bg-black/90 py-1 shadow-2xl backdrop-blur">
              {projectLinks.map((item) => <NavLink key={item.to} className="block px-4 py-2 text-sm text-white transition hover:bg-red-950 hover:text-red-400" to={item.to}>{item.label}</NavLink>)}
            </motion.div>}</AnimatePresence>
          </div>
          {navigation.slice(3).map((item) => <NavLink key={item.to} className={itemClass} to={item.to}>{item.label}</NavLink>)}
        </nav>
        <button className="rounded p-2 text-white transition hover:text-red-500 xl:hidden" aria-label="Toggle navigation menu" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
      <AnimatePresence>{open && <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/10 bg-black/95 xl:hidden">
        <div className="space-y-1 px-4 py-4">
          {navigation.slice(0, 3).map((item) => <NavLink key={item.to} className={itemClass} to={item.to}>{item.label}</NavLink>)}
          <button className="nav-link flex w-full items-center justify-between" onClick={() => setProjectsOpen((value) => !value)}>Projects <ChevronDown className={`h-4 w-4 transition ${projectsOpen ? 'rotate-180' : ''}`} /></button>
          {projectsOpen && projectLinks.map((item) => <NavLink key={item.to} className="block px-8 py-2 text-sm text-zinc-300 hover:text-red-400" to={item.to}>{item.label}</NavLink>)}
          {navigation.slice(3).map((item) => <NavLink key={item.to} className={itemClass} to={item.to}>{item.label}</NavLink>)}
        </div>
      </motion.nav>}</AnimatePresence>
    </header>
  )
}
