import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface Lesson {
  id: string
  title: string
  duration: string
  completed?: boolean
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string
  instructor_name: string
  is_live: boolean
  live_room_id?: string
  progress?: number
  lessons: Lesson[]
}

const FALLBACK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Full-Stack Next.js & WebRTC Masterclass',
    slug: 'nextjs-webrtc-masterclass',
    description:
      'Learn how to architect, develop, and scale real-time streaming classrooms using Next.js App Router and WebRTC.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    instructor_name: 'Dr. Sarah Lin',
    is_live: true,
    live_room_id: 'live-masterclass-room',
    progress: 45,
    lessons: [
      { id: 'les-1', title: 'Introduction to Real-Time Streaming', duration: '14:20', completed: true },
      { id: 'les-2', title: 'MediaStream Teardown & Device Permissions', duration: '22:15', completed: true },
      { id: 'les-3', title: 'Interactive Live Classrooms & Signaling', duration: '45:00', completed: false },
    ],
  },
  {
    id: 'course-2',
    title: 'Advanced TypeScript & Resilient State Management',
    slug: 'advanced-typescript-state',
    description:
      'Master client-server synchronization, persistent auth flows, and edge middleware patterns.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    instructor_name: 'Alex Mercer',
    is_live: false,
    progress: 20,
    lessons: [
      { id: 'les-4', title: 'Type-Safe App Router Patterns', duration: '18:40', completed: true },
      { id: 'les-5', title: 'Hydration Invariants & SSR Safety', duration: '26:10', completed: false },
    ],
  },
]

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), '.local-data')
    const filePath = path.join(dataDir, 'courses.json')

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json(parsed)
      }
    }
  } catch (err) {
    console.error('Error reading .local-data/courses.json:', err)
  }

  return NextResponse.json(FALLBACK_COURSES)
}