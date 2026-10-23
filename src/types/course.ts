export interface Course {
  id: string
  title: string
  description: string | null
  instructor_name: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  is_live?: boolean
}