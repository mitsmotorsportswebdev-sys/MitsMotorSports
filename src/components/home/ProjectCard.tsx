import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { HomeProject } from '../../data/home'

export default function ProjectCard({ project, index }: { project: HomeProject, index: number }) {
  return <motion.article className="group overflow-hidden border border-white/10 bg-[#0d0d0d] transition-colors duration-500 hover:border-red-700/70" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6, delay: index * .12 }} whileHover={{ y: -5 }}>
    <div className="home-project-visual" role={project.imageUrl ? 'img' : undefined} aria-label={project.imageUrl ? project.alt : undefined} style={project.imageUrl ? { backgroundImage: `url(${project.imageUrl})` } : undefined}><span className="home-project-number">0{index + 1}</span></div>
    <div className="border-t border-red-700/70 p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><h3 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">{project.name}</h3><span className="text-xs font-semibold uppercase tracking-[.2em] text-red-500">Project</span></div><p className="mt-4 max-w-xl leading-7 text-zinc-300">{project.description}</p><Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-red-400 transition hover:text-white" to={project.route}>Explore project <ArrowRight className="h-4 w-4" /></Link></div>
  </motion.article>
}
