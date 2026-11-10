import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, adminApi, type AdminProjectSummary } from '../services/api'

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<AdminProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void adminApi.getAdminProjects().then(async (items) => {
      const detailed = await Promise.all(items.map(async (item) => {
        const project = await adminApi.getAdminProject(item.slug)
        return { ...item, memberCount: project.groups.reduce((count, group) => count + group.members.filter((member) => member.visible).length, 0) }
      }))
      setProjects(detailed)
    }).catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load projects.')).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-state">Loading projects...</div>
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="admin-eyebrow">CONTENT / PROJECTS</span><h2>Projects</h2></div></div>
    {error && <div className="admin-alert admin-alert-error">{error}</div>}
    {!error && projects.length === 0 && <div className="admin-state">No projects found.</div>}
    <div className="team-project-grid">
      {projects.map((project) => <article className="team-project-card" key={project.id}>
        {project.heroImageUrl ? <img src={project.heroImageUrl} alt="" /> : <div className="team-project-placeholder">No hero photo</div>}
        <div className="team-project-card-body"><h3>{project.title}</h3><p>{project.tagline}</p><small>{project.memberCount} visible members</small><Link className="admin-button admin-button-primary" to={`/admin/projects/${project.slug}`}>Edit</Link></div>
      </article>)}
    </div>
  </section>
}
