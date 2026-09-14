import { Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Alumni } from '../../data/alumni'

const clipPath = 'polygon(0 4%, 4% 0, 96% 0, 100% 4%, 100% 96%, 96% 100%, 4% 100%, 0 96%)'

export default function AlumniCard({ alumni }: { alumni: Alumni }) {
  const hasImage = alumni.imageUrl.trim().length > 0

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group relative mx-auto w-full max-w-[320px] overflow-hidden bg-[#120b0b] text-white shadow-2xl shadow-black/50"
      style={{ clipPath }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(190,24,24,.95)_0%,rgba(95,10,10,.94)_43%,#0c0c0d_43%,#0c0c0d_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.2)_0,rgba(255,255,255,.2)_1px,transparent_1px,transparent_15px)]" />

      <div className="relative aspect-[3/4]">
        <div className="absolute left-5 top-5 z-10">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/75">Alumni file</p>
          {alumni.rating !== undefined && <p className="mt-1 font-display text-6xl font-black leading-none">{alumni.rating}</p>}
          <div className="mt-3 h-px w-12 bg-white/50" />
        </div>
        <p className="absolute right-4 top-6 z-10 text-[10px] font-bold uppercase tracking-[.28em] text-white/65 [writing-mode:vertical-rl]">MITS / {alumni.year}</p>

        <div className="absolute inset-x-0 top-0 h-[50%] overflow-hidden">
          {hasImage ? (
            <motion.img src={alumni.imageUrl} alt={alumni.name} className="h-full w-full object-cover object-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .45 }} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,#221515_25%,#120e0e_25%,#120e0e_50%,#221515_50%,#221515_75%,#120e0e_75%)] bg-[length:22px_22px] text-center">
              <div className="grid h-20 w-20 place-items-center border border-red-500/50 bg-black/25 text-red-400/80"><ImageIcon className="h-9 w-9" strokeWidth={1.2} /></div>
              <span className="px-5 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Portrait pending</span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 top-[50%] bottom-[18%] z-10 bg-[#0b0b0d] px-5 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[.26em] text-red-500">MITS Motorsports / {alumni.year}</p>
          <h2 className="mt-2 max-w-[90%] font-display text-[22px] font-black uppercase leading-[.94] tracking-tight sm:text-2xl">{alumni.name}</h2>
          {alumni.subtitle && <p className="mt-2 text-xs text-neutral-500">{alumni.subtitle}</p>}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 min-h-[18%] bg-red-700/90 px-5 py-3">
          {alumni.stats && alumni.stats.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">{alumni.stats.slice(0, 4).map((stat) => <div key={stat.label} className="text-center"><p className="text-[9px] font-bold uppercase tracking-widest text-white/70">{stat.label}</p><p className="font-display text-xl font-black">{stat.value}</p></div>)}</div>
          ) : (
            <div className="flex h-full min-h-12 items-center justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/60">Batch</p><p className="font-display text-2xl font-black leading-none">{alumni.year}</p></div>{alumni.role && <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/60">Role</p><p className="text-xs font-bold uppercase tracking-widest">{alumni.role}</p></div>}</div>
          )}
          <p className="mt-2 text-[9px] font-bold uppercase tracking-[.22em] text-white/55">Alumni archive</p>
        </div>
      </div>
    </motion.article>
  )
}