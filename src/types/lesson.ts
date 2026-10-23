export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  room_identifier: string
  is_live: boolean
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}