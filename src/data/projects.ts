import aethonImage from '../assets/images/Garage_upscaled.jpg'
import ebajaImage from '../assets/images/ebaja5.jpg'

export type ProjectPreview = {
  name: string
  description: string
  image: string
  href: string
}

export const projectPreviews: ProjectPreview[] = [
  {
    name: 'Aethon V4',
    description: 'Aethon V4 is our latest electric GoKart, built for GKDC Season 13 with a 7.5 kW motor, 80 kmph top speed, one-hour battery life, and a lightweight, high-strength chassis.',
    image: aethonImage,
    href: '/projects/aethon',
  },
  {
    name: 'E-Baja',
    description: 'Our E-Baja ATV is engineered for the SAE E-Baja challenge, with a 9 kW tractive system, torque vectoring, lightweight construction, and up to four hours of battery life.',
    image: ebajaImage,
    href: '/projects/ebaja',
  },
]
