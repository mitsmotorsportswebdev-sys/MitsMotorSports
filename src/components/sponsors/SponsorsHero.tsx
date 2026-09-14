import { motion } from 'framer-motion'

export default function SponsorsHero() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative mx-auto max-w-5xl pb-8 pt-4 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-red-500 sm:text-xs"
      >
        Official partners & supporters
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.55, ease: 'easeOut' }}
        className="font-display text-4xl font-black uppercase tracking-[-0.06em] text-white sm:text-6xl md:text-7xl lg:text-[6rem]"
      >
        SPONSORS
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg"
      >
        With a legacy spanning over years, The Muthoot Group stands as a symbol of trust, service, and commitment.
      </motion.p>
    </motion.header>
  )
}
