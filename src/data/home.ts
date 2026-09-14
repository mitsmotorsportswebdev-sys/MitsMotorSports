import { Award, Cpu, Handshake, Wrench } from 'lucide-react'

export type HomeImage = {
  imageUrl: string
  alt: string
}

export type HomeProject = HomeImage & {
  id: string
  name: string
  description: string
  route: string
}

export type HomeHighlight = {
  title: string
  description: string
  icon: typeof Cpu
}

export type HomeAchievement = {
  id: string
  year: string
  competition: string
  result?: string
  description: string
}

export const homeContent = {
  hero: {
    eyebrow: 'MITS MOTORSPORTS',
    title: 'Engineering the next lap.',
    subtitle: 'A student-run motorsports organization designing, building, and racing vehicles for competitive engineering challenges.',
    imageUrl: '',
    imageAlt: 'MITS Motorsports vehicle on track',
  },
  intro: {
    eyebrow: 'Built by students. Tested in competition.',
    title: 'From classroom theory to machines that move.',
    description: 'MITS Motorsports is a student-run organization where engineering students apply theoretical knowledge to practical challenges. Our work spans design, manufacturing, testing, telemetry, and racing.',
    imageUrl: '',
    imageAlt: 'MITS Motorsports engineering workshop',
  },
  projects: [
    {
      id: 'aethon-v4',
      name: 'Aethon V4',
      description: 'Our latest electric GoKart, built for GKDC Season 13 with a 7.5 kW motor, 80 kmph top speed, one-hour battery life, and a lightweight, high-strength chassis.',
      imageUrl: '',
      alt: 'Aethon V4 electric GoKart',
      route: '/projects/aethon',
    },
    {
      id: 'e-baja',
      name: 'E-Baja',
      description: 'An ATV engineered for the SAE E-Baja challenge, with a 9 kW tractive system, torque vectoring, lightweight construction, and up to four hours of battery life.',
      imageUrl: '',
      alt: 'MITS Motorsports E-Baja ATV',
      route: '/projects/ebaja',
    },
  ] satisfies HomeProject[],
  highlights: [
    { title: 'Engineering', description: 'Mechanical, electrical, electronics, and software disciplines working together.', icon: Cpu },
    { title: 'Hands-on learning', description: 'Practical experience across manufacturing, telemetry, testing, and project work.', icon: Wrench },
    { title: 'Teamwork', description: 'A collaborative environment for turning classroom knowledge into working vehicles.', icon: Handshake },
  ] satisfies HomeHighlight[],
  achievements: [
    { id: 'fkdc-2023', year: '2023', competition: 'FKDC 2023', result: 'AIR 1', description: 'First prizes in Endurance, Acceleration, and Cost Evaluation; second prize in Autocross.' },
    { id: 'gkdc-2025', year: '2025', competition: 'GKDC 2025', result: 'AIR 7', description: 'National finals entry at Kari Motorsports, Coimbatore.' },
  ] satisfies HomeAchievement[],
}
