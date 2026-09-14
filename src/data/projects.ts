import aethonImage from '../assets/images/Garage_upscaled.jpg'
import ebajaImage from '../assets/images/ebaja5.jpg'

export type ProjectPreview = {
  name: string
  description: string
  image: string
  href: string
}

export type ProjectMember = {
  id: string
  name: string
  role: string
  imageUrl: string
  linkedin?: string
  email?: string
  department?: string
  displayOrder: number
  active: boolean
}

export type ProjectSpecification = {
  id: string
  label: string
  value: string
  description?: string
  icon: 'power' | 'battery' | 'speed' | 'chassis' | 'suspension' | 'brake' | 'electronics' | 'engineering' | 'team' | 'drive' | 'voltage' | 'time'
}

export type ProjectSection = {
  id: string
  title: string
  description: string
  bullets: string[]
}

export type ProjectDefinition = {
  id: string
  name: string
  shortName: string
  description: string
  heroImageUrl: string
  overview: {
    title: string
    description: string
    stats: Array<{ label: string; value: string }>
  }
  team: ProjectMember[]
  specifications: ProjectSpecification[]
  sections: ProjectSection[]
}

export const aethonTeam: ProjectMember[] = [
  { id: 'aethon-adidev', name: 'Adidev', role: 'Captain', imageUrl: '', department: 'Leadership Team', displayOrder: 1, active: true },
  { id: 'aethon-basil', name: 'Basil', role: 'Manager', imageUrl: '', department: 'Leadership Team', displayOrder: 2, active: true },
  { id: 'aethon-elmer', name: 'Elmer', role: 'Co-Captain', imageUrl: '', department: 'Leadership Team', displayOrder: 3, active: true },
  { id: 'aethon-nithin', name: 'Nithin', role: 'Design and Manufacturing Head', imageUrl: '', department: 'Leadership Team', displayOrder: 4, active: true },
  { id: 'aethon-mathews', name: 'Mathews', role: 'Vehicle Dynamics Head', imageUrl: '', department: 'Leadership Team', displayOrder: 5, active: true },
  { id: 'aethon-julian', name: 'Julian', role: 'Brakes & Drive Train Head', imageUrl: '', department: 'Leadership Team', displayOrder: 6, active: true },
  { id: 'aethon-rahul', name: 'Rahul', role: 'Chassis & Fabrication Head', imageUrl: '', department: 'Leadership Team', displayOrder: 7, active: true },
  { id: 'aethon-abhinav', name: 'Abhinav', role: 'High Voltage Head', imageUrl: '', department: 'Leadership Team', displayOrder: 8, active: true },
  { id: 'aethon-irin', name: 'Irine', role: 'Low Voltage Head', imageUrl: '', department: 'Leadership Team', displayOrder: 9, active: true },
  { id: 'aethon-navaneeth', name: 'Navaneeth', role: 'Treasurer', imageUrl: '', department: 'Treasurer', displayOrder: 10, active: true },
  { id: 'aethon-chandrachoodan', name: 'Chandrachoodan', role: 'Junior Engineer', imageUrl: '', department: 'HV (High Voltage)', displayOrder: 11, active: true },
  { id: 'aethon-vignesh', name: 'Vignesh', role: 'Junior Engineer', imageUrl: '', department: 'HV (High Voltage)', displayOrder: 12, active: true },
  { id: 'aethon-ghanasyam', name: 'Ghanasyam', role: 'Junior Engineer', imageUrl: '', department: 'LV (Low Voltage)', displayOrder: 13, active: true },
  { id: 'aethon-bharath', name: 'Bharath', role: 'Junior Engineer', imageUrl: '', department: 'LV (Low Voltage)', displayOrder: 14, active: true },
  { id: 'aethon-fahim', name: 'Fahim', role: 'Junior Engineer', imageUrl: '', department: 'LV (Low Voltage)', displayOrder: 15, active: true },
  { id: 'aethon-achuth', name: 'Achuth', role: 'Junior Engineer', imageUrl: '', department: 'Design & Manufacturing', displayOrder: 16, active: true },
  { id: 'aethon-ananthakrishnan', name: 'Ananthakrishnan', role: 'Junior Engineer', imageUrl: '', department: 'Vehicle Dynamics', displayOrder: 17, active: true },
  { id: 'aethon-rohit', name: 'Rohit', role: 'Junior Engineer', imageUrl: '', department: 'Brakes & Drive Train', displayOrder: 18, active: true },
  { id: 'aethon-vishnupriya', name: 'Vishnupriya', role: 'Junior Engineer', imageUrl: '', department: 'Brakes & Drive Train', displayOrder: 19, active: true },
  { id: 'aethon-hruthika', name: 'Hruthika', role: 'Junior Engineer', imageUrl: '', department: 'Chassis & Foundation', displayOrder: 20, active: true },
  { id: 'aethon-riyas', name: 'Riyas', role: 'Junior Engineer', imageUrl: '', department: 'Chassis & Foundation', displayOrder: 21, active: true },
  { id: 'aethon-asraya', name: 'Asraya', role: 'Documentation', imageUrl: '', department: 'Documentation', displayOrder: 22, active: true },
  { id: 'aethon-leah', name: 'Leah', role: 'Documentation', imageUrl: '', department: 'Documentation', displayOrder: 23, active: true },
  { id: 'aethon-khaiz', name: 'Khaiz', role: 'Driver', imageUrl: '', department: 'Driver', displayOrder: 24, active: true },
  { id: 'aethon-nikhil', name: 'Dr.Nikhil M Thoppil', role: 'Faculty Lead', imageUrl: '', department: 'Faculty Lead', displayOrder: 25, active: true },
  { id: 'aethon-venugopalan', name: 'Mr.Venugopalan Kurupath', role: 'Faculty Lead', imageUrl: '', department: 'Faculty Lead', displayOrder: 26, active: true },
]

export const ebajaTeam: ProjectMember[] = [
  { id: 'ebaja-gabrin', name: 'Gabrin', role: 'Captain', imageUrl: '', department: 'Leadership Team', displayOrder: 1, active: true },
  { id: 'ebaja-justinian', name: 'Justinian', role: 'Manager', imageUrl: '', department: 'Leadership Team', displayOrder: 2, active: true },
  { id: 'ebaja-abrem', name: 'Abrem', role: 'Vice-Captain', imageUrl: '', department: 'Leadership Team', displayOrder: 3, active: true },
  { id: 'ebaja-fathima', name: 'Fathima Biju', role: 'Treasurer', imageUrl: '', department: 'Leadership Team', displayOrder: 4, active: true },
  { id: 'ebaja-viswas', name: 'Viswas', role: 'Chassis & Fabrication Head', imageUrl: '', department: 'Leadership Team', displayOrder: 5, active: true },
  { id: 'ebaja-albin', name: 'Albin', role: 'Vehicle Dynamics & Suspension Head', imageUrl: '', department: 'Leadership Team', displayOrder: 6, active: true },
  { id: 'ebaja-alan', name: 'Alan', role: 'Design & Manufacturing Head', imageUrl: '', department: 'Leadership Team', displayOrder: 7, active: true },
  { id: 'ebaja-abner', name: 'Abner', role: 'Brake & Drive Train Head', imageUrl: '', department: 'Leadership Team', displayOrder: 8, active: true },
  { id: 'ebaja-dilshad', name: 'Dilshad', role: 'HV (High Voltage) Head', imageUrl: '', department: 'Leadership Team', displayOrder: 9, active: true },
  { id: 'ebaja-remiel', name: 'Remiel', role: 'LV (Low Voltage) Head', imageUrl: '', department: 'Leadership Team', displayOrder: 10, active: true },
  { id: 'ebaja-aswinlal', name: 'Aswin Lal', role: 'Accumulator & BMS Head', imageUrl: '', department: 'Leadership Team', displayOrder: 11, active: true },
  { id: 'ebaja-madhav', name: 'Madhav', role: 'Junior Engineer', imageUrl: '', department: 'Chassis & Fabrication', displayOrder: 12, active: true },
  { id: 'ebaja-asim', name: 'Asim', role: 'Junior Engineer', imageUrl: '', department: 'Chassis & Fabrication', displayOrder: 13, active: true },
  { id: 'ebaja-rohit-vehicle', name: 'Rohit', role: 'Junior Engineer', imageUrl: '', department: 'Vehicle Dynamics & Suspension', displayOrder: 14, active: true },
  { id: 'ebaja-saurabh', name: 'Saurabh', role: 'Junior Engineer', imageUrl: '', department: 'Vehicle Dynamics & Suspension', displayOrder: 15, active: true },
  { id: 'ebaja-vyshnav', name: 'Vyshnav', role: 'Junior Engineer', imageUrl: '', department: 'Design & Manufacturing', displayOrder: 16, active: true },
  { id: 'ebaja-abhiram', name: 'Abhiram', role: 'Junior Engineer', imageUrl: '', department: 'Design & Manufacturing', displayOrder: 17, active: true },
  { id: 'ebaja-tony', name: 'Tony', role: 'Junior Engineer', imageUrl: '', department: 'Brake & Drive Train', displayOrder: 18, active: true },
  { id: 'ebaja-madhavs', name: 'Madhav', role: 'Junior Engineer', imageUrl: '', department: 'Brake & Drive Train', displayOrder: 19, active: true },
  { id: 'ebaja-neha', name: 'Neha', role: 'Junior Engineer', imageUrl: '', department: 'Brake & Drive Train', displayOrder: 20, active: true },
  { id: 'ebaja-sonel', name: 'Sonel', role: 'Junior Engineer', imageUrl: '', department: 'HV (High Voltage)', displayOrder: 21, active: true },
  { id: 'ebaja-gowri', name: 'Gowri', role: 'Junior Engineer', imageUrl: '', department: 'HV (High Voltage)', displayOrder: 22, active: true },
  { id: 'ebaja-nehajose', name: 'Neha Jose', role: 'Junior Engineer', imageUrl: '', department: 'HV (High Voltage)', displayOrder: 23, active: true },
  { id: 'ebaja-aswinmanoj', name: 'Aswin Manoj', role: 'Junior Engineer', imageUrl: '', department: 'HV (High Voltage)', displayOrder: 24, active: true },
  { id: 'ebaja-madhavps', name: 'Madhav P S', role: 'Junior Engineer', imageUrl: '', department: 'LV (Low Voltage)', displayOrder: 25, active: true },
  { id: 'ebaja-alin', name: 'Alin', role: 'Junior Engineer', imageUrl: '', department: 'LV (Low Voltage)', displayOrder: 26, active: true },
  { id: 'ebaja-erin', name: 'Erin', role: 'Junior Engineer', imageUrl: '', department: 'LV (Low Voltage)', displayOrder: 27, active: true },
  { id: 'ebaja-vivek', name: 'Vivek Biju', role: 'Junior Engineer', imageUrl: '', department: 'Accumulators & BMS', displayOrder: 28, active: true },
  { id: 'ebaja-dhanya', name: 'Dhanya S', role: 'Junior Engineer', imageUrl: '', department: 'Accumulators & BMS', displayOrder: 29, active: true },
  { id: 'ebaja-allen', name: 'Allen Peter', role: 'Junior Engineer', imageUrl: '', department: 'Accumulators & BMS', displayOrder: 30, active: true },
  { id: 'ebaja-nikhil', name: 'Dr.Nikhil M Thoppil', role: 'Faculty Lead', imageUrl: '', department: 'Faculty Lead', displayOrder: 31, active: true },
  { id: 'ebaja-jim', name: 'Dr.Jim George', role: 'Faculty Lead', imageUrl: '', department: 'Faculty Lead', displayOrder: 32, active: true },
]

export const aethonProject: ProjectDefinition = {
  id: 'aethon',
  name: 'Aethon',
  shortName: 'Aethon',
  description: 'Our flagship GoKart project engineered for high speed, efficiency, and reliability on the track.',
  heroImageUrl: '',
  overview: {
    title: 'Project Overview',
    description: 'Aethon V4 is our latest electric GoKart engineered for high speed, efficiency, and reliability in GKDC Season 13. Designed for 80 kmph top speed with up to 1 hour of battery life, it features a 7.5 kW tractive system and a lightweight, high-strength chassis.',
    stats: [
      { label: 'Top Speed', value: '80 kmph' },
      { label: 'Battery Life', value: '1 hour' },
      { label: 'Power', value: '7.5 kW' },
      { label: 'Team', value: '24 members' },
    ],
  },
  team: aethonTeam,
  specifications: [
    { id: 'aethon-aero-body', label: 'Bodywork Design', value: 'High Efficiency', description: 'Optimized for minimal drag', icon: 'engineering' },
    { id: 'aethon-battery-config', label: 'Battery Configuration', value: '4 Modules, 92 Cells', description: 'LiFePO₄ (CBAK 32140FS)', icon: 'battery' },
    { id: 'aethon-motor', label: 'Motor Configuration', value: '1 Rear QSM3B-A3000W', description: 'PMSM Mid-Drive Motor', icon: 'power' },
    { id: 'aethon-power', label: 'Peak Power Output', value: '11 kW', description: 'Maximum power delivery', icon: 'power' },
    { id: 'aethon-torque', label: 'Peak Torque', value: '55 Nm', description: 'Instant torque delivery', icon: 'drive' },
    { id: 'aethon-chassis', label: 'Material Grade', value: 'Chromoly 4130', description: 'ASTM 106 Grade specification', icon: 'chassis' },
    { id: 'aethon-stiffness', label: 'Stiffness Rating', value: '205 GPa', description: 'Superior structural integrity', icon: 'engineering' },
    { id: 'aethon-chassis-mass', label: 'Chassis Mass', value: '66 kg', description: 'Lightweight construction', icon: 'chassis' },
    { id: 'aethon-drag', label: 'Drag Coefficient', value: 'Extremely Low', description: 'Advanced aerodynamic profile', icon: 'speed' },
    { id: 'aethon-bms', label: 'Battery Management', value: 'Active Cell Balancing', description: 'Smart BMS system', icon: 'electronics' },
    { id: 'aethon-steer', label: 'Steering Geometry', value: 'Ackerman Optimized', description: 'Precision steering response', icon: 'suspension' },
    { id: 'aethon-brake', label: 'Rear Disc System', value: '200mm Apache RTR 180', description: 'Single piston floating caliper', icon: 'brake' },
  ],
  sections: [
    { id: 'aethon-performance', title: 'Performance engineering', description: 'Built around a lightweight, high-strength chassis with a compact powertrain and optimized cooling and aero package.', bullets: ['High-efficiency electric drivetrain', 'Optimized track-focused packaging', 'Designed for reliability in competition conditions'] },
    { id: 'aethon-dynamics', title: 'Vehicle dynamics', description: 'The project focuses on confidence, control and predictable handling through precise steering geometry and balanced mass distribution.', bullets: ['Ackerman-optimized steering', 'Lightweight structural design', 'Track-focused suspension tuning'] },
  ],
}

export const ebajaProject: ProjectDefinition = {
  id: 'ebaja',
  name: 'EBaja',
  shortName: 'EBaja',
  description: 'Our latest electric off-road vehicle engineered for high performance, efficiency, and reliability in BAJA SAE competitions.',
  heroImageUrl: '',
  overview: {
    title: 'Project Overview',
    description: 'EBaja ATV is our latest electric off-road vehicle engineered for high performance, efficiency, and reliability in BAJA SAE competitions. Designed for 70 kmph top speed with up to 4 hours of battery life, it features a 9 kW tractive system and a lightweight, high-strength Chromoly chassis.',
    stats: [
      { label: 'Top Speed', value: '70 kmph' },
      { label: 'Battery Life', value: '4 hours' },
      { label: 'Power', value: '9 kW' },
      { label: 'Chassis', value: 'Chromoly' },
    ],
  },
  team: ebajaTeam,
  specifications: [
    { id: 'ebaja-power', label: 'Max Tractive System Power', value: '9 kW', description: 'Peak electrical power output', icon: 'power' },
    { id: 'ebaja-voltage', label: 'System Voltage', value: '72V', description: 'Operating voltage range', icon: 'voltage' },
    { id: 'ebaja-speed', label: 'Top Speed', value: '55 kmph', description: 'Maximum achievable speed', icon: 'speed' },
    { id: 'ebaja-chassis', label: 'Chassis Material', value: 'Chromoly', description: 'High-strength steel alloy', icon: 'chassis' },
    { id: 'ebaja-battery-life', label: 'Battery Life', value: 'Up to 4 hours', description: 'Race-ready endurance', icon: 'time' },
    { id: 'ebaja-team', label: 'Team', value: 'Engineering groups', description: 'Leadership, departments and faculty', icon: 'team' },
  ],
  sections: [
    { id: 'ebaja-powertrain', title: 'Electric Powertrain', description: 'Advanced electric powertrain technology and rugged off-road components engineered for peak performance.', bullets: ['9 kW tractive system', 'Lightweight high-strength package', 'Reliable power delivery for off-road terrain'] },
    { id: 'ebaja-off-road', title: 'Off-Road Engineering', description: 'Focused on durability, traction and vehicle control across varied terrain and competition conditions.', bullets: ['High-strength chassis architecture', 'Optimized power delivery', 'Built for reliability and endurance'] },
  ],
}

export const projectCatalog: Record<string, ProjectDefinition> = {
  aethon: aethonProject,
  ebaja: ebajaProject,
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
