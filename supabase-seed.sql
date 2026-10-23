-- Seed Data for LMS Platform
-- Run this in Supabase SQL Editor after running the main schema
-- This creates sample courses, lessons, and a test user for development

-- ============================================
-- TEST USER (optional - created via auth signup)
-- ============================================
-- After running this, sign up with test@test.com / password123 in your app
-- The auth trigger will auto-create the profile with role='basic'

-- ============================================
-- SAMPLE COURSES
-- ============================================
INSERT INTO public.courses (id, title, description, instructor_name, thumbnail_url, created_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'React Fundamentals: From Zero to Hero',
  'Master React.js with hands-on projects. Learn hooks, context, routing, and state management while building real applications.',
  'Sarah Chen',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  NOW() - INTERVAL '30 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  'TypeScript for JavaScript Developers',
  'Level up your JavaScript skills with TypeScript. Learn types, interfaces, generics, and advanced patterns for scalable code.',
  'Marcus Johnson',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  NOW() - INTERVAL '25 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Full-Stack Next.js 14 with Supabase',
  'Build production-ready apps with Next.js App Router, Server Components, Supabase Auth, Database, and Realtime.',
  'Emily Rodriguez',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  NOW() - INTERVAL '20 days'
),
(
  '44444444-4444-4444-4444-444444444444',
  'LiveKit Real-time Video Applications',
  'Create Zoom-like video conferencing apps. WebRTC fundamentals, LiveKit SDK, custom layouts, and production deployment.',
  'David Kim',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
  NOW() - INTERVAL '15 days'
),
(
  '55555555-5555-5555-5555-555555555555',
  'PostgreSQL & Supabase Deep Dive',
  'Master PostgreSQL with Supabase. Advanced queries, RLS policies, triggers, functions, and database design patterns.',
  'Lisa Thompson',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  NOW() - INTERVAL '10 days'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Tailwind CSS: Rapid UI Development',
  'Design beautiful, responsive interfaces fast. Utility-first CSS, custom themes, dark mode, and component patterns.',
  'Alex Turner',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE LESSONS
-- ============================================

-- Course 1: React Fundamentals
INSERT INTO public.lessons (id, course_id, title, description, room_identifier, is_live, scheduled_at, started_at, ended_at, created_at) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Introduction to React & Components',
  'What is React? Components, props, and JSX fundamentals.',
  'react-fundamentals-lesson-1',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '28 days'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'State & useHook Deep Dive',
  'useState, useEffect, useContext, useReducer, and custom hooks.',
  'react-fundamentals-lesson-2',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '26 days'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'React Router & Navigation',
  'Client-side routing, dynamic routes, nested routes, and navigation guards.',
  'react-fundamentals-lesson-3',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '24 days'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '11111111-1111-1111-1111-111111111111',
  'Live Q&A: React Best Practices',
  'Weekly live session covering React patterns, performance, and Q&A.',
  'react-fundamentals-live-weekly',
  TRUE,
  NOW() + INTERVAL '2 days',
  NULL, NULL,
  NOW() - INTERVAL '20 days'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '11111111-1111-1111-1111-111111111111',
  'Project Workshop: Build a Todo App',
  'Live coding session building a complete todo application.',
  'react-fundamentals-workshop-1',
  TRUE,
  NOW() + INTERVAL '5 days',
  NULL, NULL,
  NOW() - INTERVAL '18 days'
);

-- Course 2: TypeScript
INSERT INTO public.lessons (id, course_id, title, description, room_identifier, is_live, scheduled_at, started_at, ended_at, created_at) VALUES
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '22222222-2222-2222-2222-222222222222',
  'TypeScript Basics & Type System',
  'Primitive types, interfaces, type aliases, and type inference.',
  'typescript-lesson-1',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '23 days'
),
(
  '11111111-2222-3333-4444-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'Advanced Types: Generics & Utilities',
  'Generic constraints, mapped types, conditional types, and utility types.',
  'typescript-lesson-2',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '21 days'
),
(
  '22222222-3333-4444-5555-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'Live: TypeScript in React Projects',
  'Applying TypeScript to React components, hooks, and context.',
  'typescript-live-react',
  TRUE,
  NOW() + INTERVAL '1 day',
  NULL, NULL,
  NOW() - INTERVAL '18 days'
);

-- Course 3: Next.js 14 + Supabase
INSERT INTO public.lessons (id, course_id, title, description, room_identifier, is_live, scheduled_at, started_at, ended_at, created_at) VALUES
(
  '33333333-4444-5555-6666-777777777777',
  '33333333-3333-3333-3333-333333333333',
  'Next.js 14 App Router Fundamentals',
  'Server Components, routing, layouts, and data fetching.',
  'nextjs-lesson-1',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '18 days'
),
(
  '44444444-5555-6666-7777-888888888888',
  '33333333-3333-3333-3333-333333333333',
  'Supabase Auth & Database Integration',
  'Row Level Security, realtime subscriptions, and edge functions.',
  'nextjs-lesson-2',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '16 days'
),
(
  '55555555-6666-7777-8888-999999999999',
  '33333333-3333-3333-3333-333333333333',
  'Live: Building a Full-Stack App',
  'End-to-end live coding: auth, database, realtime, deployment.',
  'nextjs-live-build',
  TRUE,
  NOW() + INTERVAL '3 days',
  NULL, NULL,
  NOW() - INTERVAL '12 days'
);

-- Course 4: LiveKit Video
INSERT INTO public.lessons (id, course_id, title, description, room_identifier, is_live, scheduled_at, started_at, ended_at, created_at) VALUES
(
  '66666666-7777-8888-9999-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'WebRTC & LiveKit Architecture',
  'Understanding WebRTC, SFU vs MCU, and LiveKit architecture.',
  'livekit-lesson-1',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '13 days'
),
(
  '77777777-8888-9999-0000-111111111111',
  '44444444-4444-4444-4444-444444444444',
  'Building Custom Video Layouts',
  'Grid, speaker view, picture-in-picture, and responsive layouts.',
  'livekit-lesson-2',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '11 days'
),
(
  '88888888-9999-0000-1111-222222222222',
  '44444444-4444-4444-4444-444444444444',
  'Live: LiveKit Workshop - Build a Meeting App',
  'Hands-on: Create a Zoom clone with screen share, recording, and chat.',
  'livekit-live-workshop',
  TRUE,
  NOW() + INTERVAL '4 days',
  NULL, NULL,
  NOW() - INTERVAL '8 days'
),
(
  '99999999-0000-1111-2222-333333333333',
  '44444444-4444-4444-4444-444444444444',
  'Past Session: Advanced LiveKit Patterns',
  'Recording from last week: tokens, permissions, and scaling.',
  'livekit-past-advanced',
  FALSE,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '6 days 23 hours',
  NOW() - INTERVAL '10 days'
);

-- Course 5: PostgreSQL & Supabase
INSERT INTO public.lessons (id, course_id, title, description, room_identifier, is_live, scheduled_at, started_at, ended_at, created_at) VALUES
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  '55555555-5555-5555-5555-555555555555',
  'PostgreSQL Fundamentals & Supabase Setup',
  'Tables, indexes, relationships, and Supabase project configuration.',
  'postgres-lesson-1',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '8 days'
),
(
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
  '55555555-5555-5555-5555-555555555555',
  'RLS Policies & Security Best Practices',
  'Row Level Security, policies, and securing your data.',
  'postgres-lesson-2',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '6 days'
),
(
  'cccccccc-dddd-eeee-ffff-000000000001',
  '55555555-5555-5555-5555-555555555555',
  'Live: Database Design Clinic',
  'Bring your schema questions - live review and optimization.',
  'postgres-live-clinic',
  TRUE,
  NOW() + INTERVAL '1 day',
  NULL, NULL,
  NOW() - INTERVAL '3 days'
);

-- Course 6: Tailwind CSS
INSERT INTO public.lessons (id, course_id, title, description, room_identifier, is_live, scheduled_at, started_at, ended_at, created_at) VALUES
(
  'dddddddd-eeee-ffff-0000-111111111112',
  '66666666-6666-6666-6666-666666666666',
  'Tailwind Basics & Utility-First CSS',
  'Utility classes, responsive design, and custom configurations.',
  'tailwind-lesson-1',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '3 days'
),
(
  'eeeeeeee-ffff-0000-1111-222222222223',
  '66666666-6666-6666-6666-666666666666',
  'Component Patterns & Dark Mode',
  'Building reusable components, theming, and dark mode strategies.',
  'tailwind-lesson-2',
  FALSE,
  NULL, NULL, NULL,
  NOW() - INTERVAL '1 day'
),
(
  'ffffffff-0000-1111-2222-333333333334',
  '66666666-6666-6666-6666-666666666666',
  'Live: Design System Workshop',
  'Build a complete design system with Tailwind CSS.',
  'tailwind-live-design-system',
  TRUE,
  NOW() + INTERVAL '6 days',
  NULL, NULL,
  NOW() - INTERVAL '12 hours'
);

-- ============================================
-- ENROLL TEST USER IN FIRST COURSE
-- ============================================
-- Run AFTER creating a test user via signup (test@test.com)
-- Replace USER_ID with actual auth.users.id from Supabase Dashboard

-- INSERT INTO public.enrollments (user_id, course_id) VALUES
-- ('REPLACE_WITH_ACTUAL_USER_ID', '11111111-1111-1111-1111-111111111111');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check courses: SELECT * FROM public.courses ORDER BY created_at DESC;
-- Check lessons: SELECT * FROM public.lessons ORDER BY course_id, created_at;
-- Check enrollments: SELECT * FROM public.enrollments;
-- Check profiles: SELECT * FROM public.profiles;