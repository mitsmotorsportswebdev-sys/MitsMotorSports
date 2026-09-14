import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Image as ImageIcon } from 'lucide-react'

export type ProjectHeroProps = {
  title: string
  description: string
  eyebrow?: string
  imageUrl?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

export default function ProjectHero({
  title,
  description,
  eyebrow = 'Performance racing',
  imageUrl = '',
  primaryCtaLabel = 'Explore specs',
  primaryCtaHref = '#technical-specs',
  secondaryCtaLabel = 'Meet the team',
  secondaryCtaHref = '#team',
}: ProjectHeroProps) {
  const hasImage = imageUrl.trim().length > 0

  return (
    <section className="relative isolate overflow-hidden bg-black px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-8 top-12 h-48 w-48 rotate-45 border border-red-700/60" />
        <div className="absolute right-8 top-24 h-64 w-64 rotate-12 border border-red-700/50" />
        <div className="absolute bottom-12 left-1/3 h-52 w-52 -rotate-12 border border-red-700/45" />
        <div className="absolute bottom-4 right-1/4 h-36 w-36 rotate-45 border border-red-700/50" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-red-700/45 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <p className="text-[10px] font-bold uppercase tracking-[.38em] text-red-500">{eyebrow}</p>
          <h1 className="mt-5 font-display text-5xl font-black uppercase tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">{description}</p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={primaryCtaHref}
              className="inline-flex items-center justify-center gap-2 bg-red-700 px-6 py-3 text-sm font-bold uppercase tracking-[.18em] text-white transition hover:bg-red-600"
            >
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={secondaryCtaHref}
              className="inline-flex items-center justify-center gap-2 border border-white/25 bg-white/0 px-6 py-3 text-sm font-bold uppercase tracking-[.18em] text-white transition hover:border-white/50 hover:bg-white/5"
            >
              {secondaryCtaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 border border-red-700/60 bg-red-900/10" />
          <div className="overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-[0_25px_64px_rgba(0,0,0,0.5)]">
            {hasImage ? (
              <img src={imageUrl} alt={title} className="h-[420px] w-full object-cover object-center sm:h-[500px]" />
            ) : (
              <div className="flex h-[420px] w-full flex-col items-center justify-center gap-5 border border-dashed border-red-700/50 bg-[linear-gradient(135deg,#201414_25%,#140d0d_25%,#140d0d_50%,#201414_50%,#201414_75%,#140d0d_75%)] bg-[length:22px_22px] text-center sm:h-[500px]">
                <div className="grid h-20 w-20 place-items-center border border-red-500/50 bg-black/25 text-red-400/80">
                  <ImageIcon className="h-10 w-10" strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/45">Vehicle image pending</p>
                  <p className="mt-2 text-sm text-zinc-400">Image URL will be supplied later</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
