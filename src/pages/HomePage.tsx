import { motion } from 'framer-motion'
import CollegeAbout from '../components/home/CollegeAbout'
import Hero from '../components/home/Hero'
import Projects from '../components/home/Projects'

export default function HomePage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .45 }}
      className="home-scroll relative isolate overflow-hidden bg-transparent"
    >
      <div className="relative">
        <Hero />
        <CollegeAbout />
        <Projects />
      </div>
    </motion.main>
  )
}
