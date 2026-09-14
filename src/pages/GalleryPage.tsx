import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Flag,
  Maximize2,
} from 'lucide-react'
import {
  galleryCategories,
  galleryItems,
  type GalleryCategoryId,
  type GalleryItem,
} from '../data/gallery'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
} as const

function ImagePlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#17191d]">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,transparent_48%,#383b42_49%,transparent_50%),linear-gradient(45deg,transparent_48%,#383b42_49%,transparent_50%)] [background-size:36px_36px]" />
      <div className="relative flex flex-col items-center gap-3 text-center text-[#858994]">
        <Camera className={compact ? 'h-7 w-7' : 'h-10 w-10'} strokeWidth={1.3} />
        <span className="max-w-[12rem] text-[10px] font-semibold uppercase tracking-[0.2em]">Image URL pending</span>
      </div>
    </div>
  )
}

function GalleryCard({ item, categoryLabel, onOpen }: { item: GalleryItem; categoryLabel: string; onOpen: (item: GalleryItem) => void }) {
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen(item)}
      className="group relative block w-full overflow-hidden rounded-[0.65rem] border border-white/10 bg-[#111316] text-left shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition-shadow duration-300 hover:border-red-500/50 hover:shadow-[0_24px_70px_rgba(127,29,29,0.2)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#17191d]">
        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <ImagePlaceholder />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />{categoryLabel}</div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{String(item.displayOrder).padStart(2, '0')}</span><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white opacity-100 backdrop-blur-sm transition group-hover:border-red-400 group-hover:bg-red-600"><Maximize2 className="h-4 w-4" /></span></div>
      </div>
      <div className="border-t border-white/10 px-5 py-5">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-bold tracking-tight text-white">{item.title}</h2>{item.year && <span className="text-xs font-medium text-white/40">{item.year}</span>}</div>
        <p className="text-sm leading-6 text-white/55">{item.description}</p>
        {item.caption && <p className="mt-3 border-l border-red-500 pl-3 text-xs leading-5 text-white/40">{item.caption}</p>}
      </div>
    </motion.button>
  )
}

function GalleryLightbox({ item, items, onClose, onChange }: { item: GalleryItem; items: GalleryItem[]; onClose: () => void; onChange: (item: GalleryItem) => void }) {
  const index = items.findIndex((candidate) => candidate.id === item.id)
  const categoryLabel = galleryCategories.find((category) => category.id === item.category)?.label
  const previous = items[(index - 1 + items.length) % items.length]
  const next = items[(index + 1) % items.length]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && previous) onChange(previous)
      if (event.key === 'ArrowRight' && next) onChange(next)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, onClose, onChange, previous])

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={`${item.title} preview`}>
      <motion.div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[0.65rem] border border-white/15 bg-[#111316] shadow-2xl sm:flex-row" initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 18 }} onClick={(event) => event.stopPropagation()}>
        <div className="relative min-h-[18rem] flex-1 bg-[#17191d] sm:min-h-[32rem]">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain" /> : <ImagePlaceholder />}
          <button type="button" onClick={() => onChange(previous)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-red-700" aria-label="Previous gallery item"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => onChange(next)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-red-700" aria-label="Next gallery item"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="w-full border-t border-white/10 p-6 sm:max-w-xs sm:border-l sm:border-t-0 sm:p-8">
          <div className="mb-10 flex items-start justify-between gap-4"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">{categoryLabel}</p><button type="button" onClick={onClose} className="text-white/60 transition hover:text-white" aria-label="Close gallery preview"><CircleX className="h-6 w-6" /></button></div>
          <h2 className="text-2xl font-bold leading-tight text-white">{item.title}</h2>
          <p className="mt-4 text-sm leading-6 text-white/60">{item.description}</p>
          {item.caption && <p className="mt-6 border-l-2 border-red-500 pl-4 text-sm leading-6 text-white/75">{item.caption}</p>}
          {item.year && <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40"><CalendarDays className="h-4 w-4" /> {item.year}</p>}
          <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{index + 1} / {items.length}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategoryId>('gkdc')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const activeCategoryDetails = galleryCategories.find((category) => category.id === activeCategory) ?? galleryCategories[0]
  const visibleItems = galleryItems.filter((item) => item.active && item.category === activeCategory).sort((first, second) => first.displayOrder - second.displayOrder)

  useEffect(() => {
    document.title = 'Project Gallery | MITS Motorsports'
    document.body.style.overflow = selectedItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedItem])

  return (
    <main className="min-h-screen overflow-hidden bg-[#090a0c] font-['Poppins',sans-serif] text-white">
      <section className="relative isolate border-b border-white/10 px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-36 lg:px-12">
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute right-[-8rem] top-24 -z-10 h-80 w-80 rounded-full bg-red-950/30 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-red-400"><span className="h-px w-10 bg-red-500" /> MITS MOTORSPORTS / ARCHIVE</motion.div>
            <motion.h1 variants={fadeUp} className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-[7.5rem]">PROJECT <span className="text-red-500">GALLERY</span></motion.h1>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><p className="max-w-xl text-base leading-7 text-white/55 sm:text-lg">Stories in motion from the workshop to the grid. Explore the engineering, competitions, builds, testing and people that move MITS Motorsports forward.</p><div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35"><Flag className="h-4 w-4 text-red-500" /> Built to compete</div></motion.div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Select a program</p><h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Every build has a story.</h2></div><nav className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Gallery categories">{galleryCategories.map((category) => <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition sm:px-5 ${activeCategory === category.id ? 'border-red-500 bg-red-600 text-white' : 'border-white/15 bg-white/[0.03] text-white/55 hover:border-white/35 hover:text-white'}`} aria-pressed={activeCategory === category.id}><span className="sm:hidden">{category.shortLabel}</span><span className="hidden sm:inline">{category.label}</span></button>)}</nav></div>
        <AnimatePresence mode="wait"><motion.div key={activeCategory} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3 }}><div className="mb-8 flex items-center justify-between gap-5"><div><p className="text-sm leading-6 text-white/50">{activeCategoryDetails.description}</p><p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/25">{visibleItems.length} documented moments</p></div><ArrowUpRight className="hidden h-6 w-6 text-red-500 sm:block" /></div><motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleItems.map((item) => <GalleryCard key={item.id} item={item} categoryLabel={activeCategoryDetails.label} onOpen={setSelectedItem} />)}</motion.div></motion.div></AnimatePresence>
      </section>

      <section className="border-t border-white/10 bg-[#0d0f12] px-5 py-14 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-red-400">More to come</p><h2 className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl">The next chapter is already in the workshop.</h2></div><p className="max-w-xs text-sm leading-6 text-white/45">New photography and team moments will appear here as the season unfolds.</p></div></section>
      <AnimatePresence>{selectedItem && <GalleryLightbox item={selectedItem} items={visibleItems} onClose={() => setSelectedItem(null)} onChange={setSelectedItem} />}</AnimatePresence>
    </main>
  )
}
