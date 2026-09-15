import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeContent } from '../../data/home'

export default function CollegeAbout() {
  const { intro, highlights, achievements } = homeContent

  return <section id="college" className="page-snap-section relative overflow-hidden bg-[#080808] py-24 sm:py-32">
    <div className="section-lines" aria-hidden="true" />
    <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
      <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
        <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .7 }}>
          <p className="home-kicker">{intro.eyebrow}</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[.95] tracking-[-.03em] sm:text-6xl">{intro.title}</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">{intro.description}</p>
          <Link className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-red-400 transition hover:text-white" to="/about">More about MITS Motorsports <ArrowUpRight className="h-4 w-4" /></Link>
        </motion.div>
        <motion.div className="home-image-frame" initial={{ opacity: 0, scale: .96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .8, delay: .1 }} role={intro.imageUrl ? 'img' : undefined} aria-label={intro.imageUrl ? intro.imageAlt : undefined} style={intro.imageUrl ? { backgroundImage: `url(${intro.imageUrl})` } : undefined}>
          <span className="home-image-mark" aria-hidden="true">MITS / 01</span>
        </motion.div>
      </div>
      <div className="mt-24 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
        {highlights.map(({ title, description, icon: Icon }, index) => <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .5, delay: index * .1 }} className="border-l border-red-700/70 pl-5"><Icon className="h-5 w-5 text-red-500" /><h3 className="mt-4 font-display text-xl font-bold uppercase">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></motion.div>)}
      </div>
      <div className="mt-24 border-t border-white/10 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="home-kicker">Proven under pressure</p><h2 className="mt-3 font-display text-3xl font-extrabold uppercase sm:text-5xl">Competition record</h2></div><Link className="text-sm font-bold uppercase tracking-[.14em] text-zinc-400 hover:text-red-400" to="/legacy">View legacy <ArrowUpRight className="inline h-4 w-4" /></Link></div>
        <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">{achievements.map((achievement) => <article key={achievement.id} className="bg-[#0d0d0d] p-6 sm:p-8"><div className="flex items-baseline justify-between gap-4"><span className="font-display text-4xl font-extrabold text-red-500">{achievement.result}</span><span className="text-sm text-zinc-500">{achievement.year}</span></div><h3 className="mt-6 font-display text-2xl font-bold uppercase">{achievement.competition}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{achievement.description}</p></article>)}</div>
      </div>
    </div>
  </section>
}
