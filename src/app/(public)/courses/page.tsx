'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMyEnrollments } from '@/hooks/use-enrollment'
import { useToast } from '@/components/ui/toast'

interface Course {
  id: string
  title: string
  description: string | null
  instructor_name: string
  thumbnail_url: string | null
  created_at: string
}

export default function CoursesCatalogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { courses: enrolledCourses, refetch: refetchEnrollments } = useMyEnrollments()
  const { success: toastSuccess, error: toastError, promise: toastPromise } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const enrolledIds = new Set(enrolledCourses.map((c) => c.id))

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch courses:', error)
        return
      }

      setCourses(data || [])
      setLoading(false)
    }

    fetchCourses()
  }, [])

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    setEnrollingId(courseId)

    try {
      await toastPromise(
        (async () => {
          const res = await fetch('/api/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || 'Failed to enroll')
          }

          return data
        })(),
        {
          loading: `Enrolling in ${courseTitle}...`,
          success: (data) => {
            refetchEnrollments()
            return `Successfully enrolled in ${courseTitle}!`
          },
          error: (err) => err instanceof Error ? err.message : 'Failed to enroll',
        }
      )
    } finally {
      setEnrollingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardContent className="space-y-3 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="mt-2 text-gray-600">Explore our catalog of live interactive courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No courses available</h3>
          <p className="mt-2 text-gray-600">Check back soon for new courses!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id)
            return (
              <Card key={course.id} className="flex flex-col">
                <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-xl">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {isEnrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Enrolled
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="flex-1 flex flex-col p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">{course.description}</p>
                  <p className="mt-2 text-sm text-gray-400">Instructor: {course.instructor_name}</p>
                  <div className="mt-4">
                    {isEnrolled ? (
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Button className="w-full" variant="primary">
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id, course.title)}
                        disabled={enrollingId === course.id}
                        isLoading={enrollingId === course.id}
                      >
                        Enroll Free
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}