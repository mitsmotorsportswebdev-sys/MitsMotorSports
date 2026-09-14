import { projectPreviews } from '../../data/projects'
import ProjectCard from './ProjectCard'

export default function Projects() {
  return <section id="projects" className="page-snap-section relative mx-auto flex min-h-svh max-w-7xl flex-col justify-center px-6 py-16 sm:px-8">
    <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-semibold uppercase tracking-[.25em] text-red-500">Engineering in motion</p><h2 className="mt-3 font-display text-4xl font-extrabold">Our Projects</h2><p className="mt-4 leading-7 text-zinc-300">We design and build innovative vehicles for competition. Every project carries intensive research, design, testing, and manufacturing.</p></div>
    <div className="mt-12 grid gap-8 md:grid-cols-2">{projectPreviews.map((project, index) => <ProjectCard key={project.name} project={project} index={index} />)}</div>
    <p className="mt-12 text-center text-zinc-400">Our projects are the result of teamwork, innovation, and dedication from all our members.</p>
  </section>
}
