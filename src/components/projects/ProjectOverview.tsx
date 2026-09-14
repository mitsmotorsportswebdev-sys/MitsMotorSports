import { motion } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'

export type ProjectOverviewStat = {
  label: string
  value: string
}

export type ProjectOverviewProps = {
  title: string
  description: string
  imageUrl?: string
  stats?: ProjectOverviewStat[]
}

export default function ProjectOverview({ title, description, imageUrl = '', stats = [] }: ProjectOverviewProps) {
  const hasImage = imageUrl.trim().length > 0

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,29,29,0.14),transparent_30%),linear-gradient(180deg,#000_0%,#0b0b0d_100%)]" />

      <div className="relative mx-auto max-w-7xl overflow-hidden border border-white/10 bg-[#0e0e10] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="grid items-center gap-10 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-14">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 translate-x-4 translate-y-4 border border-red-700/50" />
            {hasImage ? (
              <img src={imageUrl} alt={title} className="relative h-[420px] w-full object-cover object-center sm:h-[500px]" />
            ) : (
              <div className="relative flex h-[420px] w-full flex-col items-center justify-center gap-5 border border-dashed border-red-700/50 bg-[linear-gradient(135deg,#201414_25%,#140d0d_25%,#140d0d_50%,#201414_50%,#201414_75%,#140d0d_75%)] bg-[length:22px_22px] text-center sm:h-[500px]">
                <div className="grid h-20 w-20 place-items-center border border-red-500/50 bg-black/20 text-red-400/80">
                  <ImageIcon className="h-10 w-10" strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/45">Project image pending</p>
                  <p className="mt-2 text-sm text-zinc-400">Image URL will be supplied later</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-red-500">Overview</p>
            <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">{title}</h2>
            <div className="mt-4 h-px w-20 bg-gradient-to-r from-red-700 to-transparent" />
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">{description}</p>

            {stats.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-[#121214] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[.22em] text-zinc-500">{stat.label}</p>
                    <p className="mt-2 font-display text-2xl font-black uppercase text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
