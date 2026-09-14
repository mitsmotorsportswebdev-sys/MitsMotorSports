import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProjectPreview } from '../../data/projects'

export default function ProjectCard({ project, index }: { project: ProjectPreview, index: number }) {
  return <motion.article className="group overflow-hidden rounded-xl bg-gradient-to-br from-red-950 via-black to-red-950 shadow-2xl transition-shadow duration-500 hover:shadow-red-950/80" initial={{ opacity: 0, y: 42 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6, delay: index * .15 }}>
    <div className="h-60 overflow-hidden"><img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={project.image} alt={project.name} /></div>
    <div className="p-6"><h3 className="font-display text-3xl font-extrabold">{project.name}</h3><p className="mt-3 leading-7 text-zinc-300">{project.description}</p><Link className="mt-5 inline-flex items-center gap-2 font-semibold text-red-400 transition hover:text-red-300" to={project.href}>Learn more <ArrowRight className="h-5 w-5" /></Link></div>
  </motion.article>
}
