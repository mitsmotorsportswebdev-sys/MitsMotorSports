import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AlumniSection from '../components/alumni/AlumniSection'
import { getPublicProject, resolveProjectImageUrl, type ApiProject } from '../services/projectService'

export default function AlumniPage() {
  const [project, setProject] = useState<ApiProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicProject('alumni')
      .then(setProject)
      .catch((err) => setError(err instanceof Error ? err.message : 'The alumni could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const seasons = project?.groups
    .map((group) => ({
      year: group.name,
      members: group.members
        .filter((member) => member.name)
        .map((member) => ({
          id: member.id,
          name: member.name,
          year: group.name,
          role: member.role,
          imageUrl: resolveProjectImageUrl(member.imageUrl),
        })),
    }))
    .filter((season) => season.members.length > 0) ?? []

  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]') ?? document.head.appendChild(document.createElement('meta'))
    const previousDescription = description.getAttribute('content')
    document.title = 'Alumni | MITS Motorsports'
    description.setAttribute('name', 'description')
    description.setAttribute('content', 'Meet the alumni who helped shape the engineering legacy of MITS Motorsports.')
    return () => {
      document.title = previousTitle
      if (previousDescription === null) description.remove()
      else description.setAttribute('content', previousDescription)
    }
  }, [])

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .45 }} className="relative isolate min-h-screen overflow-x-clip bg-transparent pb-20 pt-24 text-white">
    <div className="pointer-events-none absolute right-0 top-0 h-[560px] w-[42%] border-l border-white/5 bg-red-950/[.08] [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]" aria-hidden="true" />
    <div className="relative mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
      <header className="flex min-h-[52vh] flex-col justify-end border-b border-white/10 pb-14 pt-16 sm:pb-20">
        <motion.p initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 }} className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-red-500"><span className="h-px w-10 bg-red-600" /> MITS Motorsports / People</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="max-w-5xl font-display text-6xl font-black uppercase leading-[.86] tracking-[-.04em] sm:text-8xl lg:text-[9rem]">Built by<br /><span className="text-red-600">many.</span></motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }} className="mt-10 flex max-w-2xl items-end gap-8"><p className="max-w-md text-sm leading-7 text-neutral-400 sm:text-base">The people who carried MITS Motorsports from workshop floors to the start line. A record of the teams that came before.</p></motion.div>
      </header>
      <main>
        {loading && <div className="py-16 text-center text-zinc-400">Loading alumni...</div>}
        {!loading && error && <div className="py-16 text-center text-zinc-400">{error}</div>}
        {!loading && !error && seasons.map((season) => <AlumniSection key={season.year} year={season.year} members={season.members} />)}
      </main>
    </div>
  </motion.div>
}
