import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Sponsor } from '../../data/sponsors'

interface SponsorCardProps {
  sponsor: Sponsor
  index: number
}

export default function SponsorCard({ sponsor, index }: SponsorCardProps) {
  const cardContent = (
    <>
      <div className="mb-4 flex h-[64%] w-full items-center justify-center overflow-hidden rounded-xl border border-red-900/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 shadow-[inset_0_0_0_1px_rgba(127,29,29,0.1)]">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            className="max-h-300 w-full object-contain opacity-90 transition duration-300 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-dashed border-red-700/60 bg-red-950/20 text-center">
            <div>
              <div className="text-[0.58rem] font-semibold uppercase tracking-[0.25em] text-red-400/80">
                Logo
              </div>
              <div className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-zinc-400">
                Pending
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-white">{sponsor.name}</h3>
          {sponsor.website ? <ExternalLink className="h-4 w-4 text-red-500" /> : null}
        </div>

        {sponsor.tier ? (
          <div className="inline-flex items-center border border-red-700/40 bg-red-950/30 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-red-300">
            {sponsor.tier}
          </div>
        ) : null}

        {sponsor.description ? (
          <p className="text-sm leading-relaxed text-zinc-300">{sponsor.description}</p>
        ) : null}
      </div>
    </>
  )

  const sharedClasses =
    'group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-red-700/50 hover:bg-zinc-950'

  if (sponsor.website) {
    return (
      <motion.a
        href={sponsor.website}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: index * 0.08 }}
        whileHover={{ y: -5 }}
        className={sharedClasses}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        {cardContent}
      </motion.a>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className={sharedClasses}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      {cardContent}
    </motion.div>
  )
}
