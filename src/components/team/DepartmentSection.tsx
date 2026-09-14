import { motion } from 'framer-motion'
import TeamMemberCard, { type TeamMemberCardProps } from './TeamMemberCard'

export type DepartmentSectionProps = {
  title: string
  members: Array<TeamMemberCardProps & { id?: string; active?: boolean; displayOrder?: number }>
  className?: string
}

export default function DepartmentSection({ title, members, className = '' }: DepartmentSectionProps) {
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

      <div className="grid grid-cols-1 place-items-center justify-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {orderedMembers.map((member) => (
          <TeamMemberCard
            key={member.id ?? `${member.name}-${member.role ?? 'member'}`}
            name={member.name}
            role={member.role}
            imageUrl={member.imageUrl}
            department={member.department}
            email={member.email}
            linkedin={member.linkedin}
          />
        ))}
      </div>
    </motion.section>
  )
}
