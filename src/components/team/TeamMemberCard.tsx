import { motion } from 'framer-motion'
import { Image as ImageIcon, UserRound } from 'lucide-react'

export type TeamMemberCardProps = {
  name: string
  role?: string
  imageUrl?: string
  department?: string
  email?: string
  linkedin?: string
}

const clipPath = 'polygon(0 5%, 5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%)'

export default function TeamMemberCard({
  name,
  role,
  imageUrl = '',
  department,
  email,
  linkedin,
}: TeamMemberCardProps) {
  const hasImage = imageUrl.trim().length > 0

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="group relative mx-auto w-full max-w-[320px] overflow-hidden bg-[#120b0b] text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
      style={{ clipPath }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(190,24,24,0.95)_0%,rgba(95,10,10,0.92)_38%,#0d0d0f_38%,#0d0d0f_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.18)_0,rgba(255,255,255,.18)_1px,transparent_1px,transparent_16px)]" />

      <div className="relative aspect-[3/4]">
        <div className="absolute left-4 top-4 z-10 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[.28em] text-white/70">MITS</p>
          <div className="mt-3 h-px w-12 bg-white/50" />
        </div>

        <p className="absolute right-4 top-6 z-10 text-[9px] font-bold uppercase tracking-[.3em] text-white/65 [writing-mode:vertical-rl]">
          {department ?? 'Team'}
        </p>

        <div className="absolute inset-x-0 top-0 h-[52%] overflow-hidden">
          {hasImage ? (
            <motion.img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover object-top"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,#221515_25%,#120e0e_25%,#120e0e_50%,#221515_50%,#221515_75%,#120e0e_75%)] bg-[length:24px_24px] text-center">
              <div className="grid h-20 w-20 place-items-center border border-red-500/60 bg-black/20 text-red-400/80">
                <ImageIcon className="h-9 w-9" strokeWidth={1.2} />
              </div>
              <span className="px-5 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Portrait pending</span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 top-[52%] bottom-[18%] z-10 bg-[#0b0b0d] px-5 pt-4">
          <p className="text-[9px] font-bold uppercase tracking-[.24em] text-red-500">{department ?? 'Department'}</p>
          <h3 className="mt-2 max-w-[90%] font-display text-[22px] font-black uppercase leading-[.94] tracking-tight sm:text-2xl">
            {name}
          </h3>
          {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[.18em] text-zinc-300">{role}</p> : null}
          {email || linkedin ? (
            <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-zinc-400">
              {email ? <span>{email}</span> : null}
              {linkedin ? <span className="text-red-400">LinkedIn</span> : null}
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 min-h-[18%] bg-red-700/90 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/70">Role</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[.18em] text-white">{role ?? 'Team Member'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-white/30 bg-black/20 text-white/80">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
