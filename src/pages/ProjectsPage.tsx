import Projects from '../components/home/Projects'

export default function ProjectsPage() {
  return (
    <main className="home-scroll relative isolate overflow-hidden bg-black">
      <div className="racing-grid" aria-hidden="true" />
      <Projects />
    </main>
  )
}
