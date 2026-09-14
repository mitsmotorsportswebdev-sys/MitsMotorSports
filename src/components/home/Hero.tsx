import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeContent } from '../../data/home'

export default function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], ['0%', '10%'])
  const { hero } = homeContent

  return <section className="page-snap-section relative flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-black pt-24">
    <motion.div className="absolute inset-0 hero-visual" style={hero.imageUrl ? { y, backgroundImage: `url(${hero.imageUrl})` } : { y }} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1 }} role={hero.imageUrl ? 'img' : undefined} aria-label={hero.imageUrl ? hero.imageAlt : undefined} />
    <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,.98)_8%,rgba(0,0,0,.72)_48%,rgba(127,29,29,.18)_100%)]" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
    <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28 sm:px-10 lg:px-12 lg:pb-32">
      <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .15 }}>
        <p className="home-kicker">{hero.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.2rem,8vw,7.5rem)] font-extrabold uppercase leading-[.88] tracking-[-.04em] text-white">{hero.title}</h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">{hero.subtitle}</p>
      </motion.div>
      <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .45 }}>
        <Link className="button-primary" to="/projects">Explore projects</Link>
        <Link className="button-outline" to="/team">Meet the team</Link>
      </motion.div>
    </div>
    <motion.a className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[.65rem] font-semibold uppercase tracking-[.2em] text-white/65 hover:text-red-400" href="#college" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} aria-label="Scroll to introduction">
      <span>Scroll</span><ChevronDown className="h-5 w-5 animate-bounce" />
    </motion.a>
  </section>
}
