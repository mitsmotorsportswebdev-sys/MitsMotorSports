import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import type { Sponsor } from '../../data/sponsors'

interface FeaturedSponsorProps {
  sponsor: Sponsor
}

export default function FeaturedSponsor({ sponsor }: FeaturedSponsorProps) {
  const logoContent = sponsor.logoUrl ? (
    <img
      src={sponsor.logoUrl}
      alt={sponsor.name}
      className="max-h-24 w-2/3 scale-150 object-contain drop-shadow-[0_16px_28px_rgba(127,29,29,0.18)] sm:max-h-28 lg:max-h-32"
    />
  ) : (
    <div className="flex h-40 w-full max-w-xl items-center justify-center border border-dashed border-red-700/60 bg-red-950/20 text-center sm:h-52">
      <div className="text-center">
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-red-400/80">
          Sponsor logo
        </div>
        <div className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-zinc-400">
          Placeholder
        </div>
      </div>
    </div>
  )

  const innerContent = (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
      <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-red-900/50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 text-center shadow-[inset_0_0_0_1px_rgba(127,29,29,0.1)] sm:p-8">
        {logoContent}
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-red-400">
          Featured sponsor
          {sponsor.website ? <ExternalLink className="h-3.5 w-3.5" /> : null}
        </div>

        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{sponsor.name}</h2>

        {sponsor.tier ? (
          <div className="inline-flex items-center border border-red-700/50 bg-red-950/30 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-red-200">
            {sponsor.tier}
          </div>
        ) : null}

        {sponsor.description ? (
          <p className="max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">
            {sponsor.description}
          </p>
        ) : null}

        {sponsor.website ? (
          <a
            href={sponsor.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-400 transition hover:text-red-300"
          >
            Visit website
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  )

  if (sponsor.website) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mt-10"
      >
        <a
          href={sponsor.website}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-[1.75rem] border border-red-900/50 bg-gradient-to-br from-zinc-950 via-zinc-950 to-red-950/30 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.32)] transition-all duration-300 ease-out hover:border-red-700/60 hover:shadow-[0_25px_60px_rgba(127,29,29,0.18)] sm:p-6"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          {innerContent}
        </a>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mt-10"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-red-900/50 bg-gradient-to-br from-zinc-950 via-zinc-950 to-red-950/30 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.32)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        {innerContent}
      </div>
    </motion.section>
  )
}
