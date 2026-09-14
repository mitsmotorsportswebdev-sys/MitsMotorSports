import { motion } from 'framer-motion'
import type { Alumni } from '../../data/alumni'
import AlumniCard from './AlumniCard'

export default function AlumniSection({ year, members }: { year: string; members: Alumni[] }) {
  return (
    <section className="relative border-t border-white/10 py-14 sm:py-20" aria-labelledby={`alumni-${year}`}>
      <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
        <div>
          <motion.p initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-xs font-bold uppercase tracking-[.28em] text-red-500">Season archive</motion.p>
          <motion.h2 id={`alumni-${year}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .08 }} className="mt-2 font-display text-4xl font-black tracking-tight text-white sm:text-6xl">ALUMNI <span className="text-red-600">{year}</span></motion.h2>
        </div>
        <span className="hidden text-right text-xs font-semibold uppercase tracking-[.18em] text-neutral-600 sm:block">{String(members.length).padStart(2, '0')} members<br />on record</span>
      </div>
      <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member, index) => <motion.div key={member.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .45, delay: Math.min(index * .035, .28) }}><AlumniCard alumni={member} /></motion.div>)}
      </div>
    </section>
  )
}