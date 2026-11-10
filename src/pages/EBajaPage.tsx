import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import ProjectHero from '../components/projects/ProjectHero'
import ProjectOverview from '../components/projects/ProjectOverview'
import TechnicalSpecs from '../components/projects/TechnicalSpecs'
import EngineeringSection from '../components/projects/EngineeringSection'
import DepartmentSection from '../components/team/DepartmentSection'
import { getPublicProject, mapProjectResponse, type MappedProject, ProjectServiceError } from '../services/projectService'
import './events.css'

export default function EBajaPage() {
  const [project, setProject] = useState<MappedProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  function load() {
    setLoading(true)
    setError('')
    setNotFound(false)
    getPublicProject('ebaja')
      .then((data) => setProject(mapProjectResponse(data)))
      .catch((err) => {
        if (err instanceof ProjectServiceError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof ProjectServiceError ? err.message : 'The project could not be loaded.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (notFound) {
    return <Navigate to="/" replace />
  }

  const defaultDepartments = [
    'Leadership Team',
    'Chassis & Fabrication',
    'Vehicle Dynamics & Suspension',
    'Design & Manufacturing',
    'Brake & Drive Train',
    'HV (High Voltage)',
    'LV (Low Voltage)',
    'Accumulators & BMS',
    'Faculty Lead',
  ]

  const departments = project?.groups && project.groups.length > 0
    ? project.groups.map((g) => g.name)
    : defaultDepartments

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden bg-transparent text-white"
    >
      <Helmet>
        <title>{project ? `${project.name} | MITS Motorsports` : 'EBaja | MITS Motorsports'}</title>
        <meta
          name="description"
          content="EBaja by MITS Motorsports – electric off-road engineering, team, and technical specifications."
        />
      </Helmet>

      {loading && (
        <div className="relative z-10 py-32">
          <div className="events-state" role="status">
            <span className="events-spinner" /> Loading project...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="relative z-10 py-32">
          <div className="events-state events-state-error" role="alert">
            <p>{error}</p>
            <button className="button-outline" type="button" onClick={load}>
              <RefreshCw aria-hidden="true" /> Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && project && (
        <div className="relative z-10">
          <ProjectHero
            title={project.name}
            description={project.description}
            eyebrow={project.heroEyebrow}
            imageUrl={project.heroImageUrl}
            primaryCtaLabel={project.primaryCtaLabel}
            primaryCtaHref={project.primaryCtaHref}
            secondaryCtaLabel={project.secondaryCtaLabel}
            secondaryCtaHref={project.secondaryCtaHref}
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
                <p className="text-[10px] font-bold uppercase tracking-[.32em] text-red-500">
                  {project.teamSectionLabel}
                </p>
                <h2 className="mt-4 font-display text-6xl font-black uppercase tracking-tight text-white sm:text-7xl">
                  {project.teamSectionTitle}
                </h2>
                <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
              </div>

              {departments.map((departmentTitle) => {
                const members = project.team.filter((member) => member.department === departmentTitle)
                if (members.length === 0) return null

                return (
                  <DepartmentSection
                    key={departmentTitle}
                    title={departmentTitle}
                    members={members}
                    project="ebaja"
                    className="mb-12"
                  />
                )
              })}
            </div>
          </div>

          <TechnicalSpecs
            specs={project.specifications}
            sectionLabel={project.specsSectionLabel}
            sectionTitle={project.specsSectionTitle}
          />

          {project.sections.map((section) => (
            <EngineeringSection
              key={section.id}
              title={section.title}
              description={section.description}
              bullets={section.bullets}
              sectionLabel={project.engineeringSectionLabel}
            />
          ))}
        </div>
      )}
    </motion.main>
  )
}
