export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'basic' | 'enrolled_student' | 'instructor' | 'admin'
  created_at: string
  updated_at: string
}