import { motion } from 'framer-motion'
import { Image as ImageIcon, UserRound } from 'lucide-react'
import type { TeamMember } from '../data/team'

const clipPath = 'polygon(0 5%, 5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%)'

export default function TeamMemberCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  const hasImage = member.imageUrl.trim().length > 0

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`group relative w-full overflow-hidden bg-[#110d0d] text-white shadow-[0_18px_50px_rgba(0,0,0,.42)] ${featured ? 'max-w-[390px]' : 'max-w-[320px]'}`}
      style={{ clipPath }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(185,28,28,.94)_0%,rgba(85,10,10,.9)_34%,#0d0d0f_34%,#0d0d0f_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.18)_0,rgba(255,255,255,.18)_1px,transparent_1px,transparent_16px)]" />
      <div className="relative aspect-[3/4]">
        <div className="absolute left-5 top-5 z-10"><p className="text-[9px] font-bold uppercase tracking-[.28em] text-white/75">MITS / PERSONNEL</p><div className="mt-3 h-px w-12 bg-white/50" /></div>
        <p className="absolute right-4 top-6 z-10 text-[9px] font-bold uppercase tracking-[.25em] text-white/65 [writing-mode:vertical-rl]">ENGINEERING ORGANIZATION</p>
        <div className="absolute inset-x-0 top-0 h-[52%] overflow-hidden">
          {hasImage ? <img src={member.imageUrl} alt={`${member.name}, MITS Motorsports team member`} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,#221515_25%,#120e0e_25%,#120e0e_50%,#221515_50%,#221515_75%,#120e0e_75%)] bg-[length:24px_24px] text-center"><div className="grid h-20 w-20 place-items-center border border-red-500/60 bg-black/20 text-red-400/80"><ImageIcon className="h-9 w-9" strokeWidth={1.2} /></div><span className="px-5 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Portrait pending</span></div>}
        </div>
        <div className="absolute inset-x-0 top-[52%] bottom-[18%] z-10 bg-[#0b0b0d] px-5 pt-4"><p className="text-[9px] font-bold uppercase tracking-[.24em] text-red-500">MITS MOTORSPORTS</p><h3 className="mt-2 max-w-[92%] font-display text-[22px] font-black uppercase leading-[.94] tracking-tight sm:text-2xl">{member.name}</h3>{member.department ? <p className="mt-3 text-xs leading-5 text-zinc-400">{member.department}</p> : null}</div>
        <div className="absolute inset-x-0 bottom-0 z-10 min-h-[18%] bg-red-700/90 px-5 py-3"><div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/70">{member.role ? 'Role' : 'Team section'}</p><p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-white">{member.role ?? member.category}</p></div><div className="flex h-10 w-10 items-center justify-center border border-white/30 bg-black/20 text-white/80"><UserRound className="h-4 w-4" /></div></div></div>
      </div>
    </motion.article>
  )
}