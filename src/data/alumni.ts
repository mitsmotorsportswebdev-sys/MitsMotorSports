export interface AlumniStat {
  label: string
  value: string | number
}

export interface Alumni {
  id: string
  name: string
  year: string
  imageUrl: string
  role?: string
  rating?: number
  subtitle?: string
  flag?: string
  stats?: AlumniStat[]
  displayOrder: number
  active: boolean
}

export const alumni: Alumni[] = [
  { id: 'alumni-2025-01', name: 'Arjun M Nair', year: '2025', imageUrl: '', role: 'Captain', displayOrder: 1, active: true },
  { id: 'alumni-2025-02', name: 'Shuhaib Sadiq', year: '2025', imageUrl: '', displayOrder: 2, active: true },
  { id: 'alumni-2025-03', name: 'Albin Shibhu', year: '2025', imageUrl: '', displayOrder: 3, active: true },
  { id: 'alumni-2025-04', name: 'Adnan Razi', year: '2025', imageUrl: '', displayOrder: 4, active: true },
  { id: 'alumni-2025-05', name: 'Ajzal V A', year: '2025', imageUrl: '', displayOrder: 5, active: true },
  { id: 'alumni-2025-06', name: 'Athul T Sajeevan', year: '2025', imageUrl: '', displayOrder: 6, active: true },
  { id: 'alumni-2025-07', name: 'Basil Benny', year: '2025', imageUrl: '', displayOrder: 7, active: true },
  { id: 'alumni-2025-08', name: 'Harinarayanan K S', year: '2025', imageUrl: '', displayOrder: 8, active: true },
  { id: 'alumni-2025-09', name: 'Hebin Kurian', year: '2025', imageUrl: '', displayOrder: 9, active: true },
  { id: 'alumni-2025-10', name: 'Muhammed Sahal', year: '2025', imageUrl: '', displayOrder: 10, active: true },
  { id: 'alumni-2025-11', name: 'Pranoy Prince', year: '2025', imageUrl: '', displayOrder: 11, active: true },
  { id: 'alumni-2025-12', name: 'Sreeraj Sreevalsalan', year: '2025', imageUrl: '', displayOrder: 12, active: true },
  { id: 'alumni-2024-01', name: 'Laveena Wels', year: '2024', imageUrl: '', role: 'Captain', displayOrder: 1, active: true },
  { id: 'alumni-2024-02', name: 'Malavika N R', year: '2024', imageUrl: '', displayOrder: 2, active: true },
  { id: 'alumni-2024-03', name: 'Abhijith Jithesh', year: '2024', imageUrl: '', displayOrder: 3, active: true },
  { id: 'alumni-2024-04', name: 'Abhinand Rajesh', year: '2024', imageUrl: '', displayOrder: 4, active: true },
  { id: 'alumni-2024-05', name: 'Ananthakrishnan', year: '2024', imageUrl: '', displayOrder: 5, active: true },
  { id: 'alumni-2024-06', name: 'Ananthkrishnan', year: '2024', imageUrl: '', displayOrder: 6, active: true },
  { id: 'alumni-2024-07', name: 'Febin', year: '2024', imageUrl: '', displayOrder: 7, active: true },
  { id: 'alumni-2024-08', name: 'Kevin Paul', year: '2024', imageUrl: '', displayOrder: 8, active: true },
  { id: 'alumni-2024-09', name: 'Midhul Manoj', year: '2024', imageUrl: '', displayOrder: 9, active: true },
  { id: 'alumni-2024-10', name: 'Nandhu', year: '2024', imageUrl: '', displayOrder: 10, active: true },
  { id: 'alumni-2024-11', name: 'Navaneeth Menon', year: '2024', imageUrl: '', displayOrder: 11, active: true },
  { id: 'alumni-2024-12', name: 'Nirrosh', year: '2024', imageUrl: '', displayOrder: 12, active: true },
  { id: 'alumni-2024-13', name: 'Prithviraj K', year: '2024', imageUrl: '', displayOrder: 13, active: true },
  { id: 'alumni-2024-14', name: 'Sudhev P', year: '2024', imageUrl: '', displayOrder: 14, active: true },
  { id: 'alumni-2024-15', name: 'Vaibhav', year: '2024', imageUrl: '', displayOrder: 15, active: true },
  { id: 'alumni-2023-01', name: 'Ayyappadas N', year: '2023', imageUrl: '', displayOrder: 1, active: true },
  { id: 'alumni-2023-02', name: 'Basil Raju', year: '2023', imageUrl: '', displayOrder: 2, active: true },
  { id: 'alumni-2023-03', name: 'Eldo George', year: '2023', imageUrl: '', displayOrder: 3, active: true },
  { id: 'alumni-2023-04', name: 'Jerin J Attacheril', year: '2023', imageUrl: '', displayOrder: 4, active: true },
  { id: 'alumni-2023-05', name: 'Roshan Prince', year: '2023', imageUrl: '', displayOrder: 5, active: true },
  { id: 'alumni-2023-06', name: 'V Shiva', year: '2023', imageUrl: '', displayOrder: 6, active: true },
]