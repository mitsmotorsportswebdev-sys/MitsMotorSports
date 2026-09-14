import { motion } from 'framer-motion'
import campusBackground from '../../assets/images/Mitsbg.jpg'
import mitsLogo from '../../assets/images/mits new logo.jpg'

export default function CollegeAbout() {
  return <section id="college" className="page-snap-section relative mx-auto flex min-h-svh max-w-7xl items-center overflow-hidden rounded-b-xl px-6 py-8 shadow-2xl md:px-12 md:py-12">
    <motion.div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: `url(${campusBackground})`, maskImage: 'radial-gradient(circle at center, black 35%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 100%)' }} initial={{ opacity: 0, scale: 1.05 }} whileInView={{ opacity: .85, scale: 1 }} viewport={{ once: true, amount: .25 }} transition={{ duration: 1.2 }} />
    <div className="absolute inset-0 bg-gradient-to-r from-red-950/35 via-black/20 to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(7rem,20vh,12rem)] bg-gradient-to-b from-black via-black/80 to-transparent" aria-hidden="true" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(7rem,22vh,13rem)] bg-gradient-to-b from-transparent via-black/75 to-black" aria-hidden="true" />
    <div className="section-lines" aria-hidden="true" />
    <div className="relative z-20 grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <motion.div initial={{ opacity: 0, x: -36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7 }}>
        <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Muthoot Institute of Technology and Science</h2>
        <p className="mt-4 max-w-xl leading-7 text-zinc-300">A premier institute dedicated to fostering innovation, academic excellence, and cutting-edge research in engineering and technology. We nurture future leaders through world-class education in a vibrant, collaborative environment.</p>
      </motion.div>
      <motion.div className="flex justify-center md:justify-end" initial={{ opacity: 0, x: 36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7, delay: .15 }}><img className="w-56 rounded-xl object-contain shadow-2xl sm:w-72" src={mitsLogo} alt="Muthoot Institute of Technology and Science" /></motion.div>
    </div>
  </section>
}
