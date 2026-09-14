import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import ProjectHero from '../components/projects/ProjectHero'
import ProjectOverview from '../components/projects/ProjectOverview'
import TechnicalSpecs from '../components/projects/TechnicalSpecs'
import EngineeringSection from '../components/projects/EngineeringSection'
import DepartmentSection from '../components/team/DepartmentSection'
import { ebajaProject } from '../data/projects'

export default function EBajaPage() {
  const project = ebajaProject

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden bg-black text-white"
    >
      <Helmet>
        <title>EBaja | MITS Motorsports</title>
        <meta
          name="description"
          content="EBaja by MITS Motorsports – electric off-road engineering, team, and technical specifications."
        />
      </Helmet>

      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <div className="absolute left-8 top-8 h-60 w-60 rotate-45 border border-red-700/50" />
        <div className="absolute right-10 top-24 h-72 w-72 rotate-12 border border-red-700/40" />
        <div className="absolute bottom-8 left-1/3 h-56 w-56 -rotate-12 border border-red-700/45" />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rotate-45 border border-red-700/40" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-red-700/40 to-transparent" />
      </div>

      <div className="relative z-10">
        <ProjectHero
          title={project.name}
          description={project.description}
          eyebrow="Electric off-road racing"
          imageUrl={project.heroImageUrl}
          primaryCtaLabel="View specifications"
          primaryCtaHref="#technical-specs"
          secondaryCtaLabel="Meet the team"
          secondaryCtaHref="#team"
        />

        <ProjectOverview
          title={project.overview.title}
          description={project.overview.description}
          imageUrl={project.heroImageUrl}
          stats={project.overview.stats}
        />

        <div id="team" className="px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[.32em] text-red-500">Project team</p>
              <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
                Team structure
              </h2>
              <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            </div>

            {[
              'Leadership Team',
              'Chassis & Fabrication',
              'Vehicle Dynamics & Suspension',
              'Design & Manufacturing',
              'Brake & Drive Train',
              'HV (High Voltage)',
              'LV (Low Voltage)',
              'Accumulators & BMS',
              'Faculty Lead',
            ].map((departmentTitle) => {
              const members = project.team.filter((member) => member.department === departmentTitle)
              if (members.length === 0) return null

              return (
                <DepartmentSection
                  key={departmentTitle}
                  title={departmentTitle}
                  members={members}
                  className="mb-12"
                />
              )
            })}
          </div>
        </div>

        <TechnicalSpecs specs={project.specifications} />

        {project.sections.map((section) => (
          <EngineeringSection
            key={section.id}
            title={section.title}
            description={section.description}
            bullets={section.bullets}
          />
        ))}
      </div>
    </motion.main>
  )
}
