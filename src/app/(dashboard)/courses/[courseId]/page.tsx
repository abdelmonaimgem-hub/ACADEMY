'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser-client'
import { useAuth } from '@/hooks/use-auth'
import { useEnrollment } from '@/hooks/use-enrollment'
import { useLiveKitToken } from '@/hooks/use-livekit'
import { CourseHeader } from '@/components/course/course-header'
import { LessonList } from '@/components/course/lesson-list'
import { LiveRoom } from '@/components/course/live-room'
import { LocalLiveRoom } from '@/components/course/local-live-room'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Course } from '@/types/course'
import { Lesson } from '@/types/lesson'
import { cn } from '@/lib/utils/cn'

const isLocalMode = () => {
  if (typeof window === 'undefined') return false
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const { user } = useAuth()
  const { isEnrolled, loading: enrollmentLoading, enroll, error: enrollmentError } = useEnrollment(courseId)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLiveRoom, setShowLiveRoom] = useState(false)

  // Fetch LiveKit token for active lesson
  const { token, loading: tokenLoading, error: tokenError, refetch: fetchToken } = useLiveKitToken(
    courseId,
    activeLesson?.room_identifier || null
  )

  // Fetch course and lessons
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return
    
    try {
      setLoading(true)
      const supabase = await createClient()
      
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (lessonsError) throw lessonsError
      setLessons(lessonsData || [])

      // Auto-select first live lesson or first lesson
      const liveLesson = lessonsData?.find((l: Lesson) => l.is_live)
      const firstLesson = liveLesson || lessonsData?.[0] || null
      if (firstLesson) {
        setActiveLesson(firstLesson)
      }
    } catch (err) {
      console.error('Failed to fetch course:', err)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchCourseData()
  }, [fetchCourseData])

  // Fetch token when active lesson changes
  useEffect(() => {
    if (activeLesson && isEnrolled) {
      fetchToken()
    }
  }, [activeLesson, isEnrolled, fetchToken])

  const handleEnroll = async () => {
    const result = await enroll()
    if (result.success) {
      router.refresh()
    }
  }

  const handleLessonSelect = (lesson: Lesson) => {
    if (!isEnrolled) return
    
    // Check if lesson is accessible (not upcoming/ended for regular lessons)
    const isUpcoming = lesson.scheduled_at && new Date(lesson.scheduled_at) > new Date()
    const isPast = lesson.ended_at && new Date(lesson.ended_at) < new Date()
    
    if (!lesson.is_live && (isUpcoming || isPast)) {
      return // Don't allow selection
    }
    
    setActiveLesson(lesson)
    setShowLiveRoom(lesson.is_live)
  }

  const handleLeaveRoom = () => {
    setShowLiveRoom(false)
  }

  // Show loading state
  if (loading || enrollmentLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Course not found</h3>
        <p className="mt-2 text-gray-600">This course may have been removed or the link is invalid.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  // Check if live lesson is selected but token failed
  const showTokenError = activeLesson?.is_live && tokenError && !tokenLoading

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Course Header with Access Control */}
      <CourseHeader 
        course={course} 
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
      />

      {isEnrolled && (
        <>
          {/* Main Content Area */}
          <div className={cn('grid gap-6 lg:grid-cols-3', showLiveRoom && 'lg:grid-cols-1')}>
            {/* Live Room / Video Area */}
            <div className={cn('lg:col-span-2', showLiveRoom && 'lg:col-span-1')}>
              {showLiveRoom && activeLesson?.is_live ? (
                <div className="h-[calc(100vh-300px)] min-h-[500px] lg:h-[calc(100vh-120px)]">
                  {isLocalMode() ? (
                    <LocalLiveRoom
                      roomName={activeLesson.room_identifier}
                      participantName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
                      onLeave={handleLeaveRoom}
                    />
                  ) : tokenLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
                        <p className="text-white/80">Connecting to live session...</p>
                        <p className="text-sm text-white/50 mt-2">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : showTokenError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl">
                      <div className="text-center p-8">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-white">Unable to Join</h3>
                        <p className="mt-2 text-white/70 max-w-md mx-auto">{tokenError}</p>
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => fetchToken()}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : token ? (
                    <LiveRoom
                      token={token}
                      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
                      roomName={activeLesson.room_identifier}
                      participantName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
                      onLeave={handleLeaveRoom}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl">
                      <div className="text-center p-8">
                        <svg className="mx-auto h-12 w-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-white">Ready to Join</h3>
                        <p className="mt-2 text-white/70">Click "Join Live Session" to enter the room</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeLesson ? (
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">{activeLesson.title}</h3>
                    <p className="mt-2 text-gray-600 max-w-md mx-auto">
                      {activeLesson.description || 'Select this lesson to view content or join the live session.'}
                    </p>
                    {activeLesson.is_live && (
                      <Button 
                        className="mt-6 w-full sm:w-auto" 
                        size="lg"
                        onClick={() => setShowLiveRoom(true)}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Join Live Session
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center p-8 text-gray-500">
                    <p>Select a lesson to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson List Sidebar */}
            <div className={cn('lg:col-span-1', showLiveRoom && 'hidden lg:block')}>
              <Card className="sticky top-24 h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Lessons
                    {activeLesson && (
                      <Button variant="ghost" size="sm" onClick={() => setShowLiveRoom(false)}>
                        Back
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <LessonList
                    lessons={lessons}
                    activeLessonId={activeLesson?.id || null}
                    onSelectLesson={handleLessonSelect}
                    isEnrolled={isEnrolled}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Lesson Selector when in Live Room */}
          {showLiveRoom && activeLesson?.is_live && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{activeLesson.title}</p>
                  <p className="text-sm text-gray-500">Live session in progress</p>
                </div>
                <Button variant="outline" onClick={handleLeaveRoom} className="ml-4">
                  Leave
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}