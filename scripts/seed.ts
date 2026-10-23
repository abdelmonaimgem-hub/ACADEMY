/**
 * Test Data Seed Script
 * Run with: npx tsx scripts/seed.ts
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

interface LessonSeed {
  course_id: string
  title: string
  description: string
  room_identifier: string
  is_live: boolean
  scheduled_at?: string
  started_at?: string
  ended_at?: string
}

const courses = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'React Fundamentals: From Zero to Hero',
    description: 'Master React.js with hands-on projects. Learn hooks, context, routing, and state management while building real applications.',
    instructor_name: 'Sarah Chen',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'TypeScript for JavaScript Developers',
    description: 'Level up your JavaScript skills with TypeScript. Learn types, interfaces, generics, and advanced patterns for scalable code.',
    instructor_name: 'Marcus Johnson',
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Full-Stack Next.js 14 with Supabase',
    description: 'Build production-ready apps with Next.js App Router, Server Components, Supabase Auth, Database, and Realtime.',
    instructor_name: 'Emily Rodriguez',
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'LiveKit Real-time Video Applications',
    description: 'Create Zoom-like video conferencing apps. WebRTC fundamentals, LiveKit SDK, custom layouts, and production deployment.',
    instructor_name: 'David Kim',
    thumbnail_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    title: 'PostgreSQL & Supabase Deep Dive',
    description: 'Master PostgreSQL with Supabase. Advanced queries, RLS policies, triggers, functions, and database design patterns.',
    instructor_name: 'Lisa Thompson',
    thumbnail_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    title: 'Tailwind CSS: Rapid UI Development',
    description: 'Design beautiful, responsive interfaces fast. Utility-first CSS, custom themes, dark mode, and component patterns.',
    instructor_name: 'Alex Turner',
    thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
]

const lessons: LessonSeed[] = [
  // React Fundamentals
  { course_id: '11111111-1111-1111-1111-111111111111', title: 'Introduction to React & Components', description: 'What is React? Components, props, and JSX fundamentals.', room_identifier: 'react-fundamentals-lesson-1', is_live: false },
  { course_id: '11111111-1111-1111-1111-111111111111', title: 'State & useHook Deep Dive', description: 'useState, useEffect, useContext, useReducer, and custom hooks.', room_identifier: 'react-fundamentals-lesson-2', is_live: false },
  { course_id: '11111111-1111-1111-1111-111111111111', title: 'React Router & Navigation', description: 'Client-side routing, dynamic routes, nested routes, and navigation guards.', room_identifier: 'react-fundamentals-lesson-3', is_live: false },
  { course_id: '11111111-1111-1111-1111-111111111111', title: 'Live Q&A: React Best Practices', description: 'Weekly live session covering React patterns, performance, and Q&A.', room_identifier: 'react-fundamentals-live-weekly', is_live: true, scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { course_id: '11111111-1111-1111-1111-111111111111', title: 'Project Workshop: Build a Todo App', description: 'Live coding session building a complete todo application.', room_identifier: 'react-fundamentals-workshop-1', is_live: true, scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },

  // TypeScript
  { course_id: '22222222-2222-2222-2222-222222222222', title: 'TypeScript Basics & Type System', description: 'Primitive types, interfaces, type aliases, and type inference.', room_identifier: 'typescript-lesson-1', is_live: false },
  { course_id: '22222222-2222-2222-2222-222222222222', title: 'Advanced Types: Generics & Utilities', description: 'Generic constraints, mapped types, conditional types, and utility types.', room_identifier: 'typescript-lesson-2', is_live: false },
  { course_id: '22222222-2222-2222-2222-222222222222', title: 'Live: TypeScript in React Projects', description: 'Applying TypeScript to React components, hooks, and context.', room_identifier: 'typescript-live-react', is_live: true, scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },

  // Next.js 14 + Supabase
  { course_id: '33333333-3333-3333-3333-333333333333', title: 'Next.js 14 App Router Fundamentals', description: 'Server Components, routing, layouts, and data fetching.', room_identifier: 'nextjs-lesson-1', is_live: false },
  { course_id: '33333333-3333-3333-3333-333333333333', title: 'Supabase Auth & Database Integration', description: 'Row Level Security, realtime subscriptions, and edge functions.', room_identifier: 'nextjs-lesson-2', is_live: false },
  { course_id: '33333333-3333-3333-3333-333333333333', title: 'Live: Building a Full-Stack App', description: 'End-to-end live coding: auth, database, realtime, deployment.', room_identifier: 'nextjs-live-build', is_live: true, scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },

  // LiveKit
  { course_id: '44444444-4444-4444-4444-444444444444', title: 'WebRTC & LiveKit Architecture', description: 'Understanding WebRTC, SFU vs MCU, and LiveKit architecture.', room_identifier: 'livekit-lesson-1', is_live: false },
  { course_id: '44444444-4444-4444-4444-444444444444', title: 'Building Custom Video Layouts', description: 'Grid, speaker view, picture-in-picture, and responsive layouts.', room_identifier: 'livekit-lesson-2', is_live: false },
  { course_id: '44444444-4444-4444-4444-444444444444', title: 'Live: LiveKit Workshop - Build a Meeting App', description: 'Hands-on: Create a Zoom clone with screen share, recording, and chat.', room_identifier: 'livekit-live-workshop', is_live: true, scheduled_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() },
  { course_id: '44444444-4444-4444-4444-444444444444', title: 'Past Session: Advanced LiveKit Patterns', description: 'Recording from last week: tokens, permissions, and scaling.', room_identifier: 'livekit-past-advanced', is_live: false, scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), ended_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 3600000).toISOString() },

  // PostgreSQL
  { course_id: '55555555-5555-5555-5555-555555555555', title: 'PostgreSQL Fundamentals & Supabase Setup', description: 'Tables, indexes, relationships, and Supabase project configuration.', room_identifier: 'postgres-lesson-1', is_live: false },
  { course_id: '55555555-5555-5555-5555-555555555555', title: 'RLS Policies & Security Best Practices', description: 'Row Level Security, policies, and securing your data.', room_identifier: 'postgres-lesson-2', is_live: false },
  { course_id: '55555555-5555-5555-5555-555555555555', title: 'Live: Database Design Clinic', description: 'Bring your schema questions - live review and optimization.', room_identifier: 'postgres-live-clinic', is_live: true, scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },

  // Tailwind
  { course_id: '66666666-6666-6666-6666-666666666666', title: 'Tailwind Basics & Utility-First CSS', description: 'Utility classes, responsive design, and custom configurations.', room_identifier: 'tailwind-lesson-1', is_live: false },
  { course_id: '66666666-6666-6666-6666-666666666666', title: 'Component Patterns & Dark Mode', description: 'Building reusable components, theming, and dark mode strategies.', room_identifier: 'tailwind-lesson-2', is_live: false },
  { course_id: '66666666-6666-6666-6666-666666666666', title: 'Live: Design System Workshop', description: 'Build a complete design system with Tailwind CSS.', room_identifier: 'tailwind-live-design-system', is_live: true, scheduled_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() },
]

async function seed() {
  console.log('🌱 Starting seed...')

  // Insert courses
  console.log('\n📚 Inserting courses...')
  for (const course of courses) {
    const { error } = await supabase
      .from('courses')
      .upsert(course, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Failed to insert course ${course.title}:`, error.message)
    } else {
      console.log(`✅ ${course.title}`)
    }
  }

  // Insert lessons
  console.log('\n📝 Inserting lessons...')
  for (const lesson of lessons) {
    const { error } = await supabase
      .from('lessons')
      .upsert(lesson, { onConflict: 'room_identifier' })
    
    if (error) {
      console.error(`❌ Failed to insert lesson ${lesson.title}:`, error.message)
    } else {
      console.log(`✅ ${lesson.title} (${lesson.is_live ? 'LIVE' : 'recorded'})`)
    }
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Sign up at http://localhost:3000/signup with test@test.com / password123')
  console.log('2. Go to /courses and enroll in a course')
  console.log('3. Visit /dashboard/courses/<course-id> to see lessons and live rooms')
  process.exit(0)
}

seed().catch(console.error)