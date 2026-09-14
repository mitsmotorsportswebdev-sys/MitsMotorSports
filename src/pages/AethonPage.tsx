import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import ProjectHero from '../components/projects/ProjectHero'
import ProjectOverview from '../components/projects/ProjectOverview'
import TechnicalSpecs from '../components/projects/TechnicalSpecs'
import EngineeringSection from '../components/projects/EngineeringSection'
import DepartmentSection from '../components/team/DepartmentSection'
import { aethonProject } from '../data/projects'

export default function AethonPage() {
  const project = aethonProject

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden bg-black text-white"
    >
      <Helmet>
        <title>Aethon | MITS Motorsports</title>
        <meta
          name="description"
          content="Aethon by MITS Motorsports – engineering, design, team, and technical specifications."
        />
      </Helmet>

      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <div className="absolute left-10 top-10 h-64 w-64 rotate-45 border border-red-700/50" />
        <div className="absolute right-12 top-20 h-80 w-80 rotate-12 border border-red-700/40" />
        <div className="absolute bottom-10 left-1/4 h-60 w-60 -rotate-12 border border-red-700/45" />
        <div className="absolute bottom-16 right-1/3 h-72 w-72 rotate-45 border border-red-700/40" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-red-700/40 to-transparent" />
      </div>

      <div className="relative z-10">
        <ProjectHero
          title={project.name}
          description={project.description}
          eyebrow="Performance racing"
          imageUrl={project.heroImageUrl}
          primaryCtaLabel="Explore specs"
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
                Meet the crew
              </h2>
              <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            </div>

            {['Leadership Team', 'Treasurer', 'HV (High Voltage)', 'LV (Low Voltage)', 'Design & Manufacturing', 'Vehicle Dynamics', 'Brakes & Drive Train', 'Chassis & Foundation', 'Documentation', 'Driver', 'Faculty Lead'].map((departmentTitle) => {
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
