export interface TeamMember {
  id: string
  name: string
  role?: string
  department?: string
  category: string
  imageUrl: string
  bio?: string
  displayOrder: number
  active: boolean
}

export const teamMembers: TeamMember[] = [
  { id: 'dr-nikhil-m-thoppil', name: 'Dr. Nikhil M Thoppil', department: 'Mechanical Engineering', category: 'Faculty In Charge', imageUrl: '', displayOrder: 1, active: true },
  { id: 'dr-jim-george', name: 'Dr. Jim George', department: 'Electrical Engineering', category: 'Faculty In Charge', imageUrl: '', displayOrder: 2, active: true },
  { id: 'madhav-s', name: 'Madhav S', role: 'Chair', category: 'Executive Committee', imageUrl: '', displayOrder: 1, active: true },
  { id: 'abrem-vathakatel', name: 'Abrem Vathakatel', role: 'Vice-Chair', category: 'Executive Committee', imageUrl: '', displayOrder: 2, active: true },
  { id: 'allen-peter-geogie', name: 'Allen Peter Geogie', role: 'Secretary', category: 'Executive Committee', imageUrl: '', displayOrder: 3, active: true },
  { id: 'neha-h', name: 'Neha H', role: 'Treasurer', category: 'Executive Committee', imageUrl: '', displayOrder: 4, active: true },
  { id: 'abner-biju', name: 'Abner Biju', category: 'Program Council — Leads', imageUrl: '', displayOrder: 1, active: true },
  { id: 'mathews-k-shaji', name: 'Mathews K Shaji', category: 'Program Council — Leads', imageUrl: '', displayOrder: 2, active: true },
  { id: 'adidev-manoj', name: 'Adidev Manoj', category: 'Program Council — Leads', imageUrl: '', displayOrder: 3, active: true },
  { id: 'vishnupriya-kv', name: 'Vishnupriya KV', category: 'Program Council — Subcom', imageUrl: '', displayOrder: 1, active: true },
  { id: 'mohammed-riyas', name: 'Mohammed Riyas', category: 'Program Council — Subcom', imageUrl: '', displayOrder: 2, active: true },
  { id: 'dev-jayachandran', name: 'Dev Jayachandran', category: 'Program Council — Subcom', imageUrl: '', displayOrder: 3, active: true },
  { id: 'abhiram-p-reji', name: 'Abhiram P Reji', role: 'Lead', category: 'Program Council — Other/Leadership', imageUrl: '', displayOrder: 1, active: true },
  { id: 'gouri-lekshmi-b-a', name: 'Gouri Lekshmi B A', category: 'Program Council — Other/Leadership', imageUrl: '', displayOrder: 2, active: true },
  { id: 'denol-theresa', name: 'Denol Theresa', category: 'Program Council — Other/Leadership', imageUrl: '', displayOrder: 3, active: true },
  { id: 'ananthu-s-vijay', name: 'Ananthu S Vijay', category: 'Program Council — Other/Leadership', imageUrl: '', displayOrder: 4, active: true },
  { id: 'tony-saju', name: 'Tony Saju', role: 'Lead', category: 'Media Team', imageUrl: '', displayOrder: 1, active: true },
  { id: 'hruthika-m', name: 'Hruthika M', role: 'Lead', category: 'Media Team', imageUrl: '', displayOrder: 2, active: true },
  { id: 'eldho-reji', name: 'Eldho Reji', category: 'Media Team', imageUrl: '', displayOrder: 3, active: true },
  { id: 'noufa-riaz', name: 'Noufa Riaz', category: 'Media Team', imageUrl: '', displayOrder: 4, active: true },
]