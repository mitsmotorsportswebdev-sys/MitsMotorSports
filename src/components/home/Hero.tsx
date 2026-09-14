import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import desktopTrack from '../../assets/images/track3.jpg'
import mobileTrack from '../../assets/images/track4.jpg'

export default function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], ['0%', '12%'])
  return <section className="page-snap-section relative flex min-h-svh items-center overflow-hidden bg-black">
    <motion.div className="absolute -inset-y-12 inset-x-0 hidden bg-cover bg-center md:block" style={{ y, backgroundImage: `url(${desktopTrack})` }} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} />
    <motion.div className="absolute -inset-y-12 inset-x-0 bg-cover bg-center md:hidden" style={{ y, backgroundImage: `url(${mobileTrack})` }} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(7rem,22vh,13rem)] bg-gradient-to-b from-transparent via-black/75 to-black" aria-hidden="true" />
    <motion.div className="absolute bottom-20 right-4 z-10 flex flex-wrap justify-end gap-3 sm:right-8" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { delayChildren: 1.2, staggerChildren: 0.16 } } }}>
      <motion.div variants={{ hidden: { opacity: 0, scale: .85 }, visible: { opacity: 1, scale: 1 } }}><Link className="button-primary" to="/projects">Explore projects</Link></motion.div>
      <motion.div variants={{ hidden: { opacity: 0, scale: .85 }, visible: { opacity: 1, scale: 1 } }}><Link className="button-outline" to="/about">Meet the club</Link></motion.div>
    </motion.div>
    <motion.a className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-white/85 hover:text-red-400" href="#college" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}><span>Scroll Down</span><ChevronDown className="h-6 w-6 animate-bounce" /></motion.a>
  </section>
}
