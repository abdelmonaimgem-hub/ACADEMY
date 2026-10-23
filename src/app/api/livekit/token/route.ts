import { createClient } from '@/lib/supabase/server-client'
import { generateLiveKitToken } from '@/lib/livekit/token-generator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, lessonId, roomName } = body

    if (!courseId || !roomName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Verify enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    // Verify lesson exists and belongs to course (optional but recommended)
    if (lessonId) {
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, room_identifier')
        .eq('id', lessonId)
        .eq('course_id', courseId)
        .single()

      if (lessonError || !lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const participantName = profile?.full_name || user.email?.split('@')[0] || 'Student'
    const participantId = user.id

    // Generate LiveKit token
    const token = await generateLiveKitToken({
      roomName,
      participantName,
      participantId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('LiveKit token error:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}