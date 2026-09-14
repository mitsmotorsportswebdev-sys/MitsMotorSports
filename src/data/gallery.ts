export type GalleryCategoryId = 'gkdc' | 'fkdc' | 'baja'

export interface GalleryCategory {
  id: GalleryCategoryId
  label: string
  shortLabel: string
  description: string
  color: string
}

export interface GalleryItem {
  id: string
  title: string
  imageUrl: string
  description: string
  caption?: string
  category: GalleryCategoryId
  year?: number
  displayOrder: number
  active: boolean
}

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'gkdc',
    label: 'GKDC Season 12',
    shortLabel: 'GKDC 12',
    description: 'Brains, grit and grease behind the next kart on the grid.',
    color: '#ef4444',
  },
  {
    id: 'fkdc',
    label: 'FKDC Season 7',
    shortLabel: 'FKDC 7',
    description: 'From the workshop to the track, every lap is earned.',
    color: '#f97316',
  },
  {
    id: 'baja',
    label: 'SAE BAJA 2026',
    shortLabel: 'BAJA 26',
    description: 'Off-road engineering built for the toughest challenges.',
    color: '#facc15',
  },
]

// Local seed data mirrors the future GET /api/gallery response.
export const galleryItems: GalleryItem[] = [
  { id: 'gkdc-01', title: 'Brains, Grit & Grease', imageUrl: '', description: 'Passion fuels innovation.', caption: 'Engineering and preparation before competition.', category: 'gkdc', year: 2026, displayOrder: 1, active: true },
  { id: 'gkdc-02', title: 'All Hands on Deck', imageUrl: '', description: 'Unified team, unstoppable force.', category: 'gkdc', year: 2026, displayOrder: 2, active: true },
  { id: 'gkdc-03', title: 'Competition Grid', imageUrl: '', description: 'Adrenaline-fueled competition.', category: 'gkdc', year: 2026, displayOrder: 3, active: true },
  { id: 'gkdc-04', title: 'Powertrain Perspective', imageUrl: '', description: 'Precision power dynamics.', category: 'gkdc', year: 2026, displayOrder: 4, active: true },
  { id: 'gkdc-05', title: 'MITS Go-Kart Project', imageUrl: '', description: 'Engineering excellence unleashed.', category: 'gkdc', year: 2026, displayOrder: 5, active: true },
  { id: 'fkdc-01', title: 'FKDC Season 7 Project', imageUrl: '', description: 'Driven by passion.', caption: 'A season shaped by design, testing and teamwork.', category: 'fkdc', year: 2025, displayOrder: 1, active: true },
  { id: 'fkdc-02', title: 'To the Track', imageUrl: '', description: 'Hands that build, hands that push.', category: 'fkdc', year: 2025, displayOrder: 2, active: true },
  { id: 'fkdc-03', title: 'Grid Ready', imageUrl: '', description: 'Ready, steady, race.', category: 'fkdc', year: 2025, displayOrder: 3, active: true },
  { id: 'fkdc-04', title: 'Track Racer', imageUrl: '', description: 'Test lap in motion.', category: 'fkdc', year: 2025, displayOrder: 4, active: true },
  { id: 'fkdc-05', title: 'FKDC Passion', imageUrl: '', description: 'Formula kart design excellence.', category: 'fkdc', year: 2025, displayOrder: 5, active: true },
  { id: 'baja-01', title: 'SAE BAJA 2026 Project', imageUrl: '', description: 'Off-road excellence.', caption: 'The build begins with a clear purpose: go further.', category: 'baja', year: 2026, displayOrder: 1, active: true },
  { id: 'baja-02', title: 'Team at Work', imageUrl: '', description: 'Built for the toughest challenges.', category: 'baja', year: 2026, displayOrder: 2, active: true },
  { id: 'baja-03', title: 'BAJA Engineering', imageUrl: '', description: 'Competition-ready vehicle.', category: 'baja', year: 2026, displayOrder: 3, active: true },
  { id: 'baja-04', title: 'The Crew', imageUrl: '', description: 'Strength behind the build.', category: 'baja', year: 2026, displayOrder: 4, active: true },
  { id: 'baja-05', title: 'MITS BAJA Excellence', imageUrl: '', description: 'Innovation in motion.', category: 'baja', year: 2026, displayOrder: 5, active: true },
]
