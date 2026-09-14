export interface Sponsor {
  id: string
  name: string
  logoUrl: string
  website?: string
  description?: string
  tier?: string
  displayOrder: number
  active: boolean
}

export const sponsorsData: Sponsor[] = [
  {
    id: 'muthoot-group',
    name: 'The Muthoot Group',
    logoUrl: '',
    website: '',
    description: '',
    tier: '',
    displayOrder: 1,
    active: true,
  },
  {
    id: 'z1',
    name: 'Z1',
    logoUrl: '',
    website: '',
    description: '',
    tier: '',
    displayOrder: 2,
    active: true,
  },
  {
    id: 'z2',
    name: 'Z2',
    logoUrl: '',
    website: '',
    description: '',
    tier: '',
    displayOrder: 3,
    active: true,
  },
  {
    id: 'z3',
    name: 'Z3',
    logoUrl: '',
    website: '',
    description: '',
    tier: '',
    displayOrder: 4,
    active: true,
  },
  {
    id: 'z4',
    name: 'Z4',
    logoUrl: '',
    website: '',
    description: '',
    tier: '',
    displayOrder: 5,
    active: true,
  },
]

export const activeSponsors = sponsorsData
  .filter((sponsor) => sponsor.active)
  .sort((a, b) => a.displayOrder - b.displayOrder)
