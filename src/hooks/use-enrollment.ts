'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { useAuth } from './use-auth'

const isLocalMode = () => {
  if (typeof window === 'undefined') return false
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
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

      if (!supabase) {
        const client = await createClient()
        setSupabase(client)
      }
      
      const { data, error } = await supabase
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
  }, [user, courseId])

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

      setIsEnrolled(false)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unenroll'
      setError(message)
      return { error: message }
    }
  }

  return { isEnrolled, loading, error, enroll, unenroll, refetch: checkEnrollment }
}

import { Course } from '@/types/course'

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
        // In local mode, we don't have course data in localStorage
        // This would need a mock courses API to work fully
        setCourses([])
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
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