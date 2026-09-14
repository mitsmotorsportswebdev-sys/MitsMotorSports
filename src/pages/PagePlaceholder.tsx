import { Link } from 'react-router-dom'

export default function PagePlaceholder() {
  return (
    <section className="grid min-h-screen place-items-center px-6 pt-24 text-center">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">MITS Motorsports</p>
        <h1 className="font-display text-4xl font-bold">This page is in the next build phase.</h1>
        <Link className="mt-7 inline-flex rounded-lg bg-red-900 px-5 py-3 font-semibold transition hover:bg-red-800" to="/">Return home</Link>
      </div>
    </section>
  )
}
