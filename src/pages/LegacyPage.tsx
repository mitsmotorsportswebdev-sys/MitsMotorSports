import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, ArrowDown, CalendarDays, Image as ImageIcon, MapPin, Trophy } from 'lucide-react'
import { legacyEntries, type LegacyEntry, type LegacyImage } from '../data/legacy'

function LegacyImageSlot({ image, competition }: { image: LegacyImage; competition: string }) {
  const hasImage = image.imageUrl.trim().length > 0

  return (
    <figure className="group overflow-hidden border border-white/10 bg-neutral-950 transition-colors duration-300 hover:border-red-700/70">
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImage ? (
          <img src={image.imageUrl} alt={image.alt || competition} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#171717_25%,#0a0a0a_25%,#0a0a0a_50%,#171717_50%,#171717_75%,#0a0a0a_75%)] bg-[length:18px_18px] text-center">
            <ImageIcon className="h-6 w-6 text-red-700" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Awaiting archive image</span>
          </div>
        )}
        <span className="absolute bottom-3 left-3 border border-white/15 bg-black/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300">{String(image.displayOrder).padStart(2, '0')}</span>
      </div>
      {image.caption && <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-neutral-400">{image.caption}</figcaption>}
    </figure>
  )
}

function LegacyEntryCard({ entry, index }: { entry: LegacyEntry; index: number }) {
  const images = entry.images.filter((image) => image.active).sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <motion.article
      id={entry.id}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, delay: index * 0.08 }}
      className="relative grid gap-8 border-t border-white/15 py-10 lg:grid-cols-[180px_1fr] lg:gap-12 lg:py-16"
    >
      <div className="relative">
        <span className="font-display text-5xl font-black leading-none text-white sm:text-6xl">{entry.year}</span>
        <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.2em] text-red-600">{entry.season || 'Competition season'}</span>
        <div className="absolute -left-[21px] top-[-1px] hidden h-3 w-3 -translate-x-1/2 border-2 border-red-500 bg-black lg:block" />
      </div>

      <div>
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-red-600">{entry.competition}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">The measure of the machine</h2>
            {entry.location && <p className="mt-4 flex items-center gap-2 text-sm text-neutral-400"><MapPin className="h-4 w-4 text-red-600" />{entry.location}</p>}
          </div>
          {entry.result && <div className="shrink-0 border-l-2 border-red-600 pl-4"><span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">Overall result</span><strong className="font-display text-4xl font-black text-white">{entry.result}</strong></div>}
        </div>

        {entry.achievements.length > 0 && <div className="mt-7"><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500"><Award className="h-4 w-4 text-red-600" /> Awards recorded</div><div className="grid gap-3 sm:grid-cols-2">{entry.achievements.map((achievement) => <div key={achievement.title} className="border border-white/10 bg-neutral-900/70 p-5 transition-colors hover:border-red-700/60"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-bold text-white">{achievement.title}</h3><Trophy className="h-4 w-4 shrink-0 text-red-600" /></div><p className="mt-2 text-sm leading-relaxed text-neutral-400">{achievement.description}</p></div>)}</div></div>}

        {images.length > 0 && <div className="mt-8"><div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-neutral-500"><span>Archive imagery</span><span>{images.length} {images.length === 1 ? 'frame' : 'frames'}</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{images.map((image) => <LegacyImageSlot key={image.id} image={image} competition={entry.competition} />)}</div></div>}
      </div>
    </motion.article>
  )
}

export default function LegacyPage() {
  const [activeEntry, setActiveEntry] = useState('')
  const entries = useMemo(() => legacyEntries.filter((entry) => entry.active).sort((a, b) => a.displayOrder - b.displayOrder), [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Legacy | MITS Motorsports'
    let description = document.querySelector('meta[name="description"]')
    if (!description) { description = document.createElement('meta'); description.setAttribute('name', 'description'); document.head.appendChild(description) }
    const previousDescription = description.getAttribute('content')
    description.setAttribute('content', 'Explore the competition history, achievements, and engineering evolution of MITS Motorsports.')
    return () => { document.title = previousTitle; if (previousDescription === null) description?.remove(); else description?.setAttribute('content', previousDescription) }
  }, [])

  const scrollToEntry = (id: string) => { setActiveEntry(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative isolate overflow-hidden bg-black text-white">
    <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,transparent_58%,rgba(153,27,27,.16)_58%,transparent_59%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:auto,44px_44px,44px_44px]" />
    <section className="relative flex min-h-[calc(100svh-5rem)] items-end border-b border-white/10 px-5 pb-14 pt-32 sm:px-10 lg:px-16 lg:pb-20">
      <div className="absolute right-0 top-0 h-full w-1/3 border-l border-white/5 bg-red-950/[.08] [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)]" />
      <div className="relative mx-auto w-full max-w-7xl">
        <motion.p initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15 }} className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-red-600"><span className="h-px w-10 bg-red-600" /> MITS Motorsports / Archive</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }} className="max-w-4xl font-display text-6xl font-black uppercase leading-[.9] tracking-[-.04em] text-white sm:text-8xl lg:text-[10rem]">Our<br /><span className="text-red-600">Legacy</span></motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45 }} className="mt-10 flex max-w-2xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><p className="max-w-md text-sm leading-7 text-neutral-400 sm:text-base">A record of the seasons, circuits, and engineering milestones that continue to move MITS Motorsports forward.</p><ArrowDown className="hidden h-8 w-8 text-red-600 sm:block" /></motion.div>
        {entries.length > 0 && <nav className="mt-12 flex flex-wrap gap-2" aria-label="Legacy timeline navigation">{entries.map((entry) => <button key={entry.id} type="button" onClick={() => scrollToEntry(entry.id)} className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${activeEntry === entry.id ? 'border-red-600 bg-red-700 text-white' : 'border-white/15 text-neutral-400 hover:border-red-600 hover:text-white'}`}><CalendarDays className="mr-2 inline h-3.5 w-3.5" />{entry.year}</button>)}</nav>}
      </div>
    </section>
    <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-10 lg:px-16 lg:pt-24" aria-labelledby="timeline-heading">
      <div className="mb-12 flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.28em] text-red-600">Competition history</p><h2 id="timeline-heading" className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">Built under pressure.</h2></div><span className="hidden text-right text-xs uppercase tracking-[0.2em] text-neutral-600 sm:block">{String(entries.length).padStart(2, '0')} seasons<br />on record</span></div>
      <div className="lg:border-l lg:border-red-900/70 lg:pl-10">{entries.map((entry, index) => <LegacyEntryCard key={entry.id} entry={entry} index={index} />)}</div>
    </section>
  </motion.div>
}
