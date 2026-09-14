import { motion } from 'framer-motion'
import type { Sponsor } from '../../data/sponsors'
import SponsorCard from './SponsorCard'

interface SponsorGridProps {
  sponsors: Sponsor[]
}

export default function SponsorGrid({ sponsors }: SponsorGridProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative z-10 mt-12"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sponsors.map((sponsor, index) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} index={index} />
        ))}
      </div>
    </motion.section>
  )
}
