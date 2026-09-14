import { motion } from 'framer-motion'
import CollegeAbout from '../components/home/CollegeAbout'
import Hero from '../components/home/Hero'
import Projects from '../components/home/Projects'
import homeBackground from '../assets/images/homebg.jpg'

export default function HomePage() {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .45 }} className="home-scroll relative isolate min-h-screen bg-black"><div className="home-photo-background" style={{ backgroundImage: `url(${homeBackground})` }} aria-hidden="true" /><div className="racing-grid" aria-hidden="true" /><div className="relative"><Hero /><CollegeAbout /><Projects /></div></motion.div>
}
