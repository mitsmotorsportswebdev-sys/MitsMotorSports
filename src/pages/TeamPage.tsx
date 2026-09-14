import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import TeamMemberCard from '../components/TeamMemberCard'
import { teamMembers } from '../data/team'

const categoryOrder = ['Faculty In Charge', 'Executive Committee', 'Program Council — Leads', 'Program Council — Subcom', 'Program Council — Other/Leadership', 'Media Team']
const headingFor = (category: string) => category.startsWith('Program Council') ? `Program Council / ${category.replace('Program Council — ', '')}` : category

export default function TeamPage() {
  const groupedMembers = useMemo(() => categoryOrder.map((category) => ({ category, members: teamMembers.filter((member) => member.active && member.category === category).sort((a, b) => a.displayOrder - b.displayOrder) })).filter((group) => group.members.length > 0), [])
  const activeCount = teamMembers.filter((member) => member.active).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .45 }} className="relative isolate overflow-x-clip bg-[#090909] pb-20 text-white">
      <Helmet><title>Meet the Team | MITS Motorsports</title><meta name="description" content="Meet the students, leaders, and faculty behind MITS Motorsports." /></Helmet>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(118deg,transparent_42%,rgba(127,29,29,.16)_42.1%,transparent_42.5%)] [background-size:46px_46px,46px_46px,auto]" />
      <div className="pointer-events-none absolute right-0 top-0 h-[42rem] w-[46%] border-l border-red-900/30 bg-red-950/[.08] [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" />
      <header className="relative mx-auto flex min-h-[calc(78svh-5rem)] max-w-7xl flex-col justify-end border-b border-white/10 px-5 pb-14 pt-32 sm:px-10 sm:pb-20 lg:px-16">
        <motion.p initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 }} className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-red-500"><span className="h-px w-10 bg-red-600" /> MITS Motorsports / People</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="max-w-5xl font-display text-[clamp(3.6rem,10vw,9.5rem)] font-black uppercase leading-[.84] tracking-[-.06em]">MEET <span className="text-red-600">THE TEAM</span></motion.h1>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38 }} className="mt-9 flex max-w-2xl flex-col justify-between gap-8 sm:flex-row sm:items-end"><p className="max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">Built by students. Driven by engineering. Racing as one.</p><span className="font-display text-5xl font-black text-white/10 sm:text-7xl">{String(activeCount).padStart(2, '0')}</span></motion.div>
      </header>
      <main className="relative mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        {groupedMembers.map((group, index) => <motion.section key={group.category} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .6 }} className="border-b border-white/10 py-16 sm:py-20" aria-labelledby={`team-${index}`}><div className="mb-9 flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-red-500">Roster / {String(index + 1).padStart(2, '0')}</p><h2 id={`team-${index}`} className="mt-3 font-display text-3xl font-black uppercase tracking-tight sm:text-5xl">{headingFor(group.category)}</h2></div><span className="hidden text-right text-xs font-bold uppercase tracking-[.18em] text-white/25 sm:block">{String(group.members.length).padStart(2, '0')} members</span></div><div className={`grid gap-6 ${group.category === 'Faculty In Charge' ? 'sm:grid-cols-2 lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>{group.members.map((member) => <TeamMemberCard key={member.id} member={member} featured={group.category === 'Faculty In Charge'} />)}</div></motion.section>)}
        <section className="flex flex-col justify-between gap-7 py-16 sm:flex-row sm:items-end sm:py-20"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-red-500">Next lap</p><h2 className="mt-3 max-w-xl font-display text-4xl font-black uppercase leading-[.9] sm:text-6xl">There is always room in the workshop.</h2></div><Link to="/about" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-red-400 transition hover:text-white">Discover MITS Motorsports <ArrowUpRight className="h-4 w-4" /></Link></section>
      </main>
    </motion.div>
  )
}