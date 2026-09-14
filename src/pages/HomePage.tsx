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
      className="home-scroll relative isolate overflow-hidden bg-black"
    >
      <div className="racing-grid" aria-hidden="true" />
      <div className="home-geometry" aria-hidden="true">
        <span className="home-geometry-shape home-geometry-shape-one" />
        <span className="home-geometry-shape home-geometry-shape-two" />
        <span className="home-geometry-shape home-geometry-shape-three" />
        <span className="home-geometry-shape home-geometry-shape-four" />
        <span className="home-geometry-line home-geometry-line-one" />
        <span className="home-geometry-line home-geometry-line-two" />
        <span className="home-geometry-line home-geometry-line-three" />
        <span className="home-geometry-dot home-geometry-dot-one" />
        <span className="home-geometry-dot home-geometry-dot-two" />
        <span className="home-geometry-dot home-geometry-dot-three" />
      </div>
      <div className="relative">
        <Hero />
        <CollegeAbout />
        <Projects />
      </div>
    </motion.main>
  )
}
