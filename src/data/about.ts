import type { LucideIcon } from 'lucide-react'

export type AboutIcon = 'award' | 'expertise' | 'competition' | 'learning'

export type AboutFeature = {
  id: string
  title: string
  description: string
  icon: AboutIcon
}

export type AboutDeveloper = {
  id: string
  name: string
  linkedin: string
  imageUrl: string
}

export type AboutContent = {
  hero: {
    title: string
    subtitle: string
    imageUrl: string
  }
  introduction: {
    title: string
    description: string
    imageUrl: string
  }
  mission: {
    title: string
    description: string
  }
  features: AboutFeature[]
  developers: AboutDeveloper[]
}

export const aboutContent: AboutContent = {
  hero: {
    title: 'ABOUT US',
    subtitle: 'Discover the passion, innovation, and excellence that drives MITS Motorsports',
    imageUrl: '/images/about/faviconLogo.png',
  },
  introduction: {
    title: 'About MITS Motorsports',
    description: 'MITS Motorsports is a student-run organization that designs, builds, and races vehicles for various competitions. Our team is composed of passionate engineering students dedicated to applying theoretical knowledge to practical challenges.',
    imageUrl: '/images/about/about.jpg',
  },
  mission: {
    title: 'Our Mission',
    description: 'To provide students with hands-on experience in automotive engineering and create innovative solutions that push the boundaries of motorsport technology. We aim to nurture the next generation of engineering talent through practical application of classroom knowledge.',
  },
  features: [
    {
      id: 'award-winning',
      title: 'Award-Winning Team',
      description: 'Multiple national awards for engineering excellence and innovation in motorsports.',
      icon: 'award',
    },
    {
      id: 'diverse-expertise',
      title: 'Diverse Expertise',
      description: 'Team members specializing in mechanical, electrical, and computer science engineering.',
      icon: 'expertise',
    },
    {
      id: 'competitive-spirit',
      title: 'Competitive Spirit',
      description: 'Participating in prestigious competitions across the country.',
      icon: 'competition',
    },
    {
      id: 'hands-on-learning',
      title: 'Hands-on Learning',
      description: 'Practical experience in designing, building, and testing real-world vehicles.',
      icon: 'learning',
    },
  ],
  developers: [
    {
      id: 'aksa-susan-mathew',
      name: 'Aksa Susan Mathew',
      linkedin: 'https://www.linkedin.com/in/aksa-susan/',
      imageUrl: '',
    },
    {
      id: 'sethulakshmi-s',
      name: 'Sethulakshmi S',
      linkedin: 'https://www.linkedin.com/in/sethulakshmi-s-3728aa2b7/',
      imageUrl: '',
    },
    {
      id: 'shona-mariyam-binu',
      name: 'Shona Mariyam Binu',
      linkedin: 'https://www.linkedin.com/in/shona-mariyam-binu-4512b0255/',
      imageUrl: '',
    },
  ],
}

export type AboutIconMap = Record<AboutIcon, LucideIcon>