import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeContent } from '../../data/home'
import ProjectCard from './ProjectCard'

export default function Projects() {
  return <section id="projects" className="page-snap-section relative overflow-hidden py-24 sm:py-32">
    <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
      <motion.div className="flex flex-wrap items-end justify-between gap-6" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .6 }}><div><p className="home-kicker">Engineering in motion</p><h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-none tracking-[-.03em] sm:text-7xl">Featured projects</h2></div><p className="max-w-sm text-sm leading-6 text-zinc-400">Research, design, testing, and manufacturing brought together for competition.</p></motion.div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">{homeContent.projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div>
      <div className="mt-10 flex justify-end"><Link className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-red-400 hover:text-white" to="/projects">Explore all projects <ArrowUpRight className="h-4 w-4" /></Link></div>
    </div>
  </section>
}
