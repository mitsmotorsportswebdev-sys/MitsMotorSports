export type RegistrationStatus = 'open' | 'closing-soon' | 'closed'

export type EventScheduleItem = {
  time: string
  title: string
  description: string
}

export type EventData = {
  id: string
  category: string
  title: string
  tagline: string
  description: string
  image: string
  date: string
  time: string
  venue: string
  location: string
  address: string
  registrationStatus: RegistrationStatus
  entryFee: string
  eventType: string
  eligibility: string
  highlights: string[]
  rules: string[]
  eligibilityDetails: string[]
  schedule: EventScheduleItem[]
  venueDescription: string
}

export const events: EventData[] = [
  {
    id: 'annual-motorsport-meet',
    category: 'MITS MOTORSPORTS PRESENTS',
    title: 'MITS MOTORSPORTS FEST 2026',
    tagline: 'Experience speed, engineering and motorsport.',
    description: 'A motorsport-focused festival bringing together students, automotive enthusiasts and engineering teams for a full day of competition, learning and machines in motion.',
    image: '/images/homepage/homepageCover.jpg',
    date: '20 December 2026',
    time: '9:00 AM - 5:00 PM',
    venue: 'MITS Campus',
    location: 'Kochi, Kerala',
    address: 'Muthoot Institute of Technology and Science, Kochi, Kerala, India',
    registrationStatus: 'open',
    entryFee: '₹500',
    eventType: 'Motorsport Competition',
    eligibility: 'Open to students',
    highlights: ['Motorsport competition', 'Vehicle showcase', 'Engineering challenge', 'Team activities'],
    rules: [
      'Participants must carry a valid college or institution ID.',
      'All participants must attend the safety briefing before taking part in activities.',
      'Closed-toe footwear and appropriate protective equipment are required in the pit area.',
      'Teams are responsible for the safe operation of their vehicles and equipment.',
    ],
    eligibilityDetails: [
      'Open to currently enrolled students and student engineering teams.',
      'Individual participants and teams of up to six are welcome.',
      'Participants under 18 must provide a consent form at check-in.',
    ],
    schedule: [
      { time: '09:00 AM', title: 'Registration & Check-in', description: 'Participants collect credentials and complete event check-in.' },
      { time: '10:00 AM', title: 'Opening Ceremony', description: 'Meet the teams, organizers and the machines taking to the course.' },
      { time: '10:30 AM', title: 'Technical Inspection', description: 'Vehicle and equipment checks with the MITS MotorSports technical crew.' },
      { time: '12:00 PM', title: 'Motorsport Activities', description: 'Hands-on activities, demonstrations and engineering challenges.' },
      { time: '02:00 PM', title: 'Main Competition', description: 'Teams put their preparation and engineering decisions to the test.' },
      { time: '04:00 PM', title: 'Awards Ceremony', description: 'Celebrate the day’s standout performances and teams.' },
    ],
    venueDescription: 'Set against the MITS campus, the venue gives participants a close view of the workshop, vehicles and the people who build them.',
  },
]

export function getEventById(eventId: string | undefined) {
  return events.find((event) => event.id === eventId)
}
