import { motion } from 'framer-motion'
import {
  Activity,
  BatteryCharging,
  Car,
  Cpu,
  Gauge,
  Power,
  Shield,
  TimerReset,
  Users,
  Wrench,
  Zap,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectSpecification } from '../../data/projects'

const iconMap: Record<string, LucideIcon> = {
  power: Power,
  battery: BatteryCharging,
  speed: Gauge,
  chassis: Shield,
  suspension: Car,
  brake: Wrench,
  electronics: Cpu,
  engineering: Workflow,
  team: Users,
  drive: Zap,
  voltage: Activity,
  time: TimerReset,
}

export type TechnicalSpecsProps = {
  specs: ProjectSpecification[]
}

export default function TechnicalSpecs({ specs }: TechnicalSpecsProps) {
  return (
    <section id="technical-specs" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.18),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.32em] text-red-500">Technical package</p>
          <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Technical Specifications
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {specs.map((spec, index) => {
            const Icon = iconMap[spec.icon] ?? Workflow

            return (
              <motion.article
                key={spec.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="group relative overflow-hidden border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(127,29,29,0.12),transparent_40%)] opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center border border-red-700/70 bg-red-900/20 text-red-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[.24em] text-zinc-500">{spec.label}</p>
                  <p className="mt-3 font-display text-3xl font-black uppercase tracking-tight text-white">{spec.value}</p>
                  {spec.description ? <p className="mt-3 text-sm leading-6 text-zinc-400">{spec.description}</p> : null}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
