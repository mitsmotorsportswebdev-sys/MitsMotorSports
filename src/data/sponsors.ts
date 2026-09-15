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
    logoUrl: 'images/sponsors/Mlogo.png',
    website: '',
    description: '',
    tier: '',
    displayOrder: 1,
    active: true,
  },
  {
    id: 'shul',
    name: 'SHUL MOTORS',
    logoUrl: 'images/sponsors/shul.png',
    website: '',
    description: '',
    tier: '',
    displayOrder: 2,
    active: true,
  },
  {
    id: 'CrossHead',
    name: 'CROSSHEAD ENGINEERING',
    logoUrl: 'images/sponsors/crosshead.png',
    website: '',
    description: '',
    tier: '',
    displayOrder: 3,
    active: true,
  },
  {
    id: 'C2M',
    name: 'C2M',
    logoUrl: 'images/sponsors/c2m.png',
    website: '',
    description: '',
    tier: '',
    displayOrder: 4,
    active: true,
  },
  {
    id: 'Lakerol',
    name: 'LAKEROL',
    logoUrl: 'images/sponsors/Lakerol.png',
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
