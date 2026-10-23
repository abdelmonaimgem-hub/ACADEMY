'use client'

import { Course } from '@/types/course'

interface CourseHeaderProps {
  course: Course
  isEnrolled: boolean
  onEnroll: () => void
}

export function CourseHeader({ course, isEnrolled, onEnroll }: CourseHeaderProps) {
  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden relative">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
            <svg className="w-24 h-24 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Live Badge */}
        {course.is_live && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE NOW
            </span>
          </div>
        )}

        {/* Enrollment Status */}
        {!isEnrolled && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center p-8">
              <svg className="mx-auto h-16 w-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-4 text-2xl font-bold text-white">Enrollment Required</h3>
              <p className="mt-2 text-lg text-white/80 max-w-md mx-auto">
                You must be enrolled in this course to access the content and live sessions.
              </p>
              <button
                onClick={onEnroll}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Enroll Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          {course.is_live && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Live Session Active
            </span>
          )}
        </div>
        <p className="text-gray-600 text-lg mb-4">{course.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {course.instructor_name}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(course.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}