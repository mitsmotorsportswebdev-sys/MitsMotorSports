import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Award, ExternalLink, GraduationCap, Target, Wrench } from 'lucide-react'
import { aboutContent, type AboutIcon } from '../data/about'

const iconMap: Record<AboutIcon, typeof Award> = {
  award: Award,
  expertise: Wrench,
  competition: Target,
  learning: GraduationCap,
}

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

function ImagePlaceholder({ imageUrl, label, className = '' }: { imageUrl: string; label: string; className?: string }) {
  return (
    <div
      className={`about-image-placeholder ${className}`}
      role={imageUrl ? 'img' : undefined}
      aria-label={imageUrl ? label : undefined}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {!imageUrl && <span>{label}</span>}
      <span className="about-image-corner" aria-hidden="true" />
    </div>
  )
}

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    document.title = 'About | MITS Motorsports'
    const description = 'Learn more about MITS Motorsports, our mission, our team, and the engineering passion that drives us.'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
      className="about-page relative isolate overflow-hidden bg-[#070707] text-white"
    >
      <div className="racing-grid" aria-hidden="true" />
      <div className="section-lines" aria-hidden="true" />
      <div className="about-rail about-rail-one" aria-hidden="true" />
      <div className="about-rail about-rail-two" aria-hidden="true" />

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 lg:px-12 lg:pt-36">
        <section className="grid min-h-[calc(100vh-9rem)] items-center gap-12 pb-24 lg:grid-cols-[1fr_.9fr] lg:gap-20 lg:pb-32">
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: prefersReducedMotion ? 0 : .7 }}>
            <p className="about-kicker"><span className="about-kicker-mark" /> MITS MOTORSPORTS / 01</p>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.5rem,11vw,9rem)] font-extrabold uppercase leading-[.82] tracking-[-.06em] text-white">{aboutContent.hero.title}</h1>
            <div className="mt-8 flex max-w-xl items-start gap-4 border-l-2 border-red-600 pl-5 sm:pl-6">
              <p className="text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">{aboutContent.hero.subtitle}</p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-zinc-500"><span className="h-px w-12 bg-red-600" /> Engineering in motion</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: prefersReducedMotion ? 0 : .8, delay: prefersReducedMotion ? 0 : .15 }}>
            <ImagePlaceholder imageUrl={aboutContent.hero.imageUrl} label="Hero image to be supplied" className="about-hero-visual" />
          </motion.div>
        </section>

        <section className="border-t border-white/10 py-24 sm:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal} transition={{ duration: prefersReducedMotion ? 0 : .65 }} className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
            <div><p className="about-kicker">The team / 02</p><h2 className="mt-5 max-w-sm font-display text-4xl font-extrabold uppercase leading-[.95] tracking-[-.04em] sm:text-6xl">Built to move ideas forward.</h2></div>
            <div><p className="max-w-3xl text-2xl font-medium leading-tight text-zinc-100 sm:text-4xl sm:leading-tight">{aboutContent.introduction.description}</p><div className="mt-10"><ImagePlaceholder imageUrl={aboutContent.introduction.imageUrl} label="Team image to be supplied" className="about-intro-visual" /></div></div>
          </motion.div>
        </section>

        <section className="relative border-y border-red-900/40 bg-[#101010] px-6 py-16 sm:px-12 sm:py-24">
          <div className="absolute left-0 top-0 h-full w-1 bg-red-700" aria-hidden="true" />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={reveal} transition={{ duration: prefersReducedMotion ? 0 : .65 }} className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div><p className="about-kicker">Direction / 03</p><h2 className="mt-5 font-display text-4xl font-extrabold uppercase tracking-[-.04em] sm:text-6xl">{aboutContent.mission.title}</h2></div>
            <p className="max-w-3xl text-xl leading-8 text-zinc-300 sm:text-3xl sm:leading-10">{aboutContent.mission.description}</p>
          </motion.div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-7"><div><p className="about-kicker">What drives us / 04</p><h2 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-[-.04em] sm:text-6xl">Our strengths</h2></div><span className="font-display text-4xl font-bold text-red-600">04</span></div>
          <div className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {aboutContent.features.map((feature, index) => { const Icon = iconMap[feature.icon]; return <motion.article key={feature.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} variants={reveal} transition={{ duration: prefersReducedMotion ? 0 : .5, delay: prefersReducedMotion ? 0 : index * .08 }} whileHover={prefersReducedMotion ? undefined : { y: -6 }} className="group relative min-h-72 bg-[#0d0d0d] p-6 transition-colors hover:bg-[#151515] sm:p-7"><span className="absolute right-5 top-5 font-mono text-xs text-zinc-600">0{index + 1}</span><Icon className="h-7 w-7 text-red-500 transition-transform group-hover:scale-110" strokeWidth={1.5} /><h3 className="mt-14 max-w-[11rem] font-display text-2xl font-bold uppercase leading-none">{feature.title}</h3><p className="mt-5 text-sm leading-6 text-zinc-400">{feature.description}</p><span className="absolute bottom-0 left-0 h-1 w-0 bg-red-600 transition-all duration-300 group-hover:w-full" /></motion.article> })}
          </div>
        </section>

        <section className="border-t border-white/10 pt-10 sm:pt-14">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={reveal} transition={{ duration: prefersReducedMotion ? 0 : .65 }}><p className="about-kicker">Built with care / 05</p><div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><h2 className="font-display text-4xl font-extrabold uppercase tracking-[-.04em] sm:text-6xl">Website developers</h2><p className="max-w-xs text-sm leading-6 text-zinc-500">The people behind this digital pit wall.</p></div><div className="mt-10 grid gap-3 md:grid-cols-3">{aboutContent.developers.map((developer, index) => <a key={developer.id} href={developer.linkedin} target="_blank" rel="noreferrer" className="group flex min-h-36 flex-col justify-between border border-white/10 bg-[#0d0d0d] p-5 transition-colors hover:border-red-700/70 hover:bg-[#151515]"><span className="font-mono text-xs text-red-500">0{index + 1} / DEVELOPER</span><span className="flex items-end justify-between gap-3"><span className="font-display text-lg font-bold uppercase leading-tight text-zinc-100 group-hover:text-red-400">{developer.name}</span><span className="shrink-0 text-zinc-500 transition group-hover:text-red-400"><ExternalLink className="h-4 w-4" /></span></span></a>)}</div></motion.div>
        </section>
        <div className="mt-20 flex items-center justify-between border-t border-white/10 pt-5 text-[.65rem] font-bold uppercase tracking-[.2em] text-zinc-600"><span>MITS Motorsports</span><span className="flex items-center gap-2">About us <ArrowUpRight className="h-3 w-3 text-red-600" /></span></div>
      </main>
    </motion.div>
  )
}
