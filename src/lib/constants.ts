export const APP_CONFIG = {
  name: 'LMS Platform',
  description: 'Learn Live - Modern Learning Management System',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  courses: '/courses',
  courseDetail: (courseId: string) => `/dashboard/courses/${courseId}`,
  api: {
    livekitToken: '/api/livekit/token',
    enroll: '/api/enroll',
  },
}

export const USER_ROLES = {
  basic: 'basic',
  enrolledStudent: 'enrolled_student',
  instructor: 'instructor',
  admin: 'admin',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const LIVEKIT_CONFIG = {
  url: process.env.NEXT_PUBLIC_LIVEKIT_URL || '',
}