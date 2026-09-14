export interface LegacyImage {
  id: string
  imageUrl: string // empty string by default; manual input later
  alt?: string
  caption?: string
  displayOrder: number
  active: boolean
}

export interface LegacyAchievement {
  title: string
  description: string
}

export interface LegacyEntry {
  id: string
  year: string
  competition: string
  season?: string
  location?: string
  result?: string
  achievements: LegacyAchievement[]
  images: LegacyImage[]
  displayOrder: number
  active: boolean
}

export const legacyEntries: LegacyEntry[] = [
  {
    id: 'fkdc-2023',
    year: '2023',
    competition: 'FKDC 2023',
    season: 'Season 7',
    location: 'Kari Motorsports, Coimbatore',
    result: 'AIR 1',
    achievements: [
      {
        title: 'First Prize',
        description: 'Endurance, Acceleration, Cost Evaluation',
      },
      {
        title: 'Second Prize',
        description: 'Autocross',
      },
    ],
    images: [
      {
        id: 'fkdc-2023-1',
        imageUrl: '',
        alt: 'FKDC 2023 Team',
        caption: 'MITS Motorsports team at Kari Motorsports Track',
        displayOrder: 1,
        active: true,
      },
      {
        id: 'fkdc-2023-2',
        imageUrl: '',
        alt: 'FKDC 2023 Vehicle',
        caption: 'AIR 1 winning kart during dynamic endurance tests',
        displayOrder: 2,
        active: true,
      },
      {
        id: 'fkdc-2023-3',
        imageUrl: '',
        alt: 'FKDC 2023 Victory',
        caption: 'P Trophy presentation ceremony',
        displayOrder: 3,
        active: true,
      },
    ],
    displayOrder: 1,
    active: true,
  },
  {
    id: 'gkdc-2025',
    year: '2025',
    competition: 'GKDC 2025',
    season: 'Season 13',
    location: 'Kari Motorsports, Coimbatore',
    result: 'AIR 7',
    achievements: [],
    images: [
      {
        id: 'gkdc-2025-1',
        imageUrl: '',
        alt: 'GKDC 2025 Event',
        caption: 'GKDC Season 13 national finals entry',
        displayOrder: 1,
        active: true,
      },
      {
        id: 'gkdc-2025-2',
        imageUrl: '',
        alt: 'GKDC 2025 Track Testing',
        caption: 'Dynamic testing and telemetry setup',
        displayOrder: 2,
        active: true,
      },
      {
        id: 'gkdc-2025-3',
        imageUrl: '',
        alt: 'GKDC 2025 Crew',
        caption: 'MITS Motorsports engineering crew at Coimbatore',
        displayOrder: 3,
        active: true,
      },
    ],
    displayOrder: 2,
    active: true,
  },
]
