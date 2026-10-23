import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

const isLocalMode = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
}

async function getLocalUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  // In local mode, the token is just the email
  const email = authHeader.replace('Bearer ', '')
  if (!email) return null
  
  return { id: `user_${email}`, email }
}

async function getSupabaseUser(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function POST(request: NextRequest) {
  try {
    const user = isLocalMode() ? await getLocalUser(request) : await getSupabaseUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    if (isLocalMode()) {
      // Local mode: store enrollment in localStorage
      const enrollmentsKey = `mock_enrollments_${user.id}`
      const enrollments = JSON.parse(localStorage.getItem(enrollmentsKey) || '[]')
      
      if (enrollments.includes(courseId)) {
        return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
      }
      
      enrollments.push(courseId)
      localStorage.setItem(enrollmentsKey, JSON.stringify(enrollments))
      
      return NextResponse.json({ enrollment: { user_id: user.id, course_id: courseId }, message: 'Successfully enrolled (local)' })
    }

    // Supabase mode
    const supabase = await createClient()
    
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError)
      return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
    }

    return NextResponse.json({ enrollment, message: 'Successfully enrolled' })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Failed to process enrollment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = isLocalMode() ? await getLocalUser(request) : await getSupabaseUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    if (isLocalMode()) {
      const enrollmentsKey = `mock_enrollments_${user.id}`
      const enrollments = JSON.parse(localStorage.getItem(enrollmentsKey) || '[]')
      const filtered = enrollments.filter((id: string) => id !== courseId)
      localStorage.setItem(enrollmentsKey, JSON.stringify(filtered))
      
      return NextResponse.json({ message: 'Successfully unenrolled (local)' })
    }

    const supabase = await createClient()
    
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (error) {
      console.error('Unenrollment error:', error)
      return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Successfully unenrolled' })
  } catch (error) {
    console.error('Unenrollment error:', error)
    return NextResponse.json({ error: 'Failed to process unenrollment' }, { status: 500 })
  }
}