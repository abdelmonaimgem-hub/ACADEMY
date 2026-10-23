'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { useAuth } from './use-auth'
export interface Course {
  id: string
  title: string
  slug?: string
  description?: string
  thumbnail_url?: string
  instructor_name?: string
  is_live?: boolean
  live_room_id?: string
  progress?: number
  enrolled_at?: string
  lessons?: Array<{
    id: string
    title: string
    duration: string
    completed?: boolean
  }>
}

const isLocalMode = () => {
  if (typeof window === 'undefined') return false
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
  )
}

export function useEnrollment(courseId: string | null) {
  const { user } = useAuth()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    createClient().then(setSupabase)
  }, [])

  const checkEnrollment = useCallback(async () => {
    if (!user || !courseId) {
      setIsEnrolled(false)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      if (isLocalMode()) {
        const enrollmentsKey = `mock_enrollments_${user.id}`
        const enrollments = JSON.parse(localStorage.getItem(enrollmentsKey) || '[]')
        setIsEnrolled(enrollments.includes(courseId))
        setLoading(false)
        return
      }

      const client = supabase || (await createClient())
      if (!supabase) setSupabase(client)

      const { data, error } = await client
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setIsEnrolled(!!data)
    } catch (err) {
      console.error('Enrollment check error:', err)
      setError('Failed to check enrollment')
      setIsEnrolled(false)
    } finally {
      setLoading(false)
    }
  }, [user, courseId, supabase])

  useEffect(() => {
    checkEnrollment()
  }, [checkEnrollment])

  const enroll = async () => {
    if (!user || !courseId) return { error: 'Not authenticated' }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (isLocalMode()) {
        headers['Authorization'] = `Bearer ${user.email}`
      }

      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers,
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll')
      }

      if (isLocalMode()) {
        const enrollmentsKey = `mock_enrollments_${user.id}`
        const enrollments: string[] = JSON.parse(localStorage.getItem(enrollmentsKey) || '[]')
        if (!enrollments.includes(courseId)) {
          enrollments.push(courseId)
          localStorage.setItem(enrollmentsKey, JSON.stringify(enrollments))
        }
      }

      setIsEnrolled(true)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enroll'
      setError(message)
      return { error: message }
    }
  }

  const unenroll = async () => {
    if (!user || !courseId) return { error: 'Not authenticated' }

    try {
      const headers: Record<string, string> = {}
      if (isLocalMode()) {
        headers['Authorization'] = `Bearer ${user.email}`
      }

      const res = await fetch(`/api/enroll?courseId=${courseId}`, {
        method: 'DELETE',
        headers,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to unenroll')
      }

      if (isLocalMode()) {
        const enrollmentsKey = `mock_enrollments_${user.id}`
        const enrollments: string[] = JSON.parse(localStorage.getItem(enrollmentsKey) || '[]')
        const updated = enrollments.filter((id: string) => id !== courseId)
        localStorage.setItem(enrollmentsKey, JSON.stringify(updated))
      }

      setIsEnrolled(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unenroll'
      setError(message)
      return { error: message }
    }
  }

  return {
    isEnrolled,
    loading,
    error,
    checkEnrollment,
    enroll,
    unenroll,
  }
}

export function useMyEnrollments() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEnrollments = useCallback(async () => {
    if (!user) {
      setCourses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      if (isLocalMode()) {
        const res = await fetch('/api/courses')
        if (res.ok) {
          const allCourses: Course[] = await res.json()
          const enrollmentsKey = `mock_enrollments_${user.id}`
          let enrolledIds: string[] = JSON.parse(localStorage.getItem(enrollmentsKey) || '[]')

          if (enrolledIds.length === 0 && allCourses.length > 0) {
            enrolledIds = [allCourses[0].id]
            localStorage.setItem(enrollmentsKey, JSON.stringify(enrolledIds))
          }

          const filtered = allCourses.filter((course) => enrolledIds.includes(course.id))
          setCourses(filtered.length > 0 ? filtered : allCourses)
        } else {
          setCourses([])
        }
        return
      }

      const client = await createClient()
      const { data, error } = await client
        .from('enrollments')
        .select(`
          enrolled_at,
          courses (*)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (error) throw error

      const fullCourses = (data || []).map((e: any) => ({
        ...e.courses,
        enrolled_at: e.enrolled_at,
      }))
      setCourses(fullCourses)
    } catch (err) {
      console.error('Failed to fetch enrollments:', err)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  return { courses, loading, refetch: fetchEnrollments }
}