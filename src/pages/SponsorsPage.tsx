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
      className="sponsors-page relative isolate min-h-screen overflow-x-clip bg-transparent text-white pb-20 pt-24"
    >
      <Helmet>
        <title>Sponsors | MITS Motorsports</title>
        <meta
          name="description"
          content="Official sponsors and partners of MITS Motorsports. Explore the team’s supporters and the legacy behind our motorsport programme."
        />
      </Helmet>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SponsorsHero />

        {featuredSponsor ? <FeaturedSponsor sponsor={featuredSponsor} /> : null}

        {supportingSponsors.length > 0 ? <SponsorGrid sponsors={supportingSponsors} /> : null}
      </div>
    </motion.div>
  )
}
