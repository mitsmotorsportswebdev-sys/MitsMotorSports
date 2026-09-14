import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import FeaturedSponsor from '../components/sponsors/FeaturedSponsor'
import SponsorGrid from '../components/sponsors/SponsorGrid'
import SponsorsHero from '../components/sponsors/SponsorsHero'
import { activeSponsors } from '../data/sponsors'

export default function SponsorsPage() {
  const featuredSponsor = activeSponsors.find((sponsor) => sponsor.id === 'muthoot-group') ?? activeSponsors[0]
  const supportingSponsors = activeSponsors.filter((sponsor) => sponsor.id !== featuredSponsor?.id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sponsors-page relative isolate min-h-screen overflow-x-clip bg-black text-white pb-20 pt-24"
    >
      <Helmet>
        <title>Sponsors | MITS Motorsports</title>
        <meta
          name="description"
          content="Official sponsors and partners of MITS Motorsports. Explore the team’s supporters and the legacy behind our motorsport programme."
        />
      </Helmet>

      <div className="racing-grid" aria-hidden="true" />
      <div className="section-lines z-0" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-red-950/20 blur-[120px]" />
        <div className="absolute left-[8%] top-24 h-32 w-32 rotate-45 border border-red-800/25 bg-red-950/10" />
        <div className="absolute right-[10%] top-48 h-44 w-44 rotate-12 border border-red-800/20 bg-red-900/5" />
        <div className="absolute bottom-28 left-[12%] h-40 w-40 -rotate-45 border border-red-800/25 bg-red-950/10" />
        <div className="absolute left-6 top-32 h-12 w-12 border-l-2 border-t-2 border-red-600/40 sm:left-12" />
        <div className="absolute right-6 top-32 h-12 w-12 border-r-2 border-t-2 border-red-600/40 sm:right-12" />
        <div className="absolute bottom-20 left-6 h-12 w-12 border-b-2 border-l-2 border-red-600/40 sm:left-12" />
        <div className="absolute bottom-20 right-6 h-12 w-12 border-b-2 border-r-2 border-red-600/40 sm:right-12" />
        <div className="absolute inset-x-0 top-[35rem] h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent sm:top-[38rem]" />
        <div className="absolute left-[20%] top-40 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
        <div className="absolute right-[22%] top-[32rem] h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
        <div className="absolute bottom-32 left-[30%] h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SponsorsHero />

        {featuredSponsor ? <FeaturedSponsor sponsor={featuredSponsor} /> : null}

        {supportingSponsors.length > 0 ? <SponsorGrid sponsors={supportingSponsors} /> : null}
      </div>
    </motion.div>
  )
}
