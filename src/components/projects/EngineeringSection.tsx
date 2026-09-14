import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

export type EngineeringSectionProps = {
  title: string
  description: string
  bullets: string[]
}

export default function EngineeringSection({ title, description, bullets }: EngineeringSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="relative px-4 py-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.32em] text-red-500">Engineering focus</p>
            <h3 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">{title}</h3>
          </div>
          <div className="h-px w-full max-w-xs bg-gradient-to-r from-red-700 to-transparent" />
        </div>

        <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-300">{description}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bullets.map((bullet, index) => (
            <div key={`${title}-${bullet}`} className="flex items-start gap-3 border border-white/10 bg-[#121214] p-4">
              <div className="mt-1 flex h-6 w-6 items-center justify-center border border-red-600 bg-red-900/25 text-red-400">
                <Check className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm leading-6 text-zinc-200">{bullet}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
