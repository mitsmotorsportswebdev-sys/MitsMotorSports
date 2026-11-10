import { motion } from 'framer-motion'
import CrewCard from '../crew/CrewCard'

export type DepartmentSectionProps = {
  title: string
  members: Array<{ id?: string; name: string; role?: string; imageUrl?: string; active?: boolean; displayOrder?: number }>
  project: 'aethon' | 'ebaja' | 'team'
  className?: string
}

export default function DepartmentSection({ title, members, project, className = '' }: DepartmentSectionProps) {
  const orderedMembers = [...members]
    .filter((member) => member.active !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  if (orderedMembers.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
      className={`mb-16 ${className}`}
    >
      <div className="mb-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.32em] text-red-500">Department</p>
        <h3 className="mt-3 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">{title}</h3>
        <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 place-items-center justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {orderedMembers.map((member) => (
          <CrewCard
            key={member.id ?? `${member.name}-${member.role ?? 'member'}`}
            name={member.name}
            role={member.role ?? 'Team Member'}
            image={member.imageUrl}
            project={project}
          />
        ))}
      </div>
    </motion.section>
  )
}
