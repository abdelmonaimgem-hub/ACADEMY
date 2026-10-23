import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

const isLocalMode = () => {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
  )
}

export async function GET(request: NextRequest) {
  try {
    if (isLocalMode()) {
      let token = ''
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '').trim()
      }

      if (!token) {
        token =
          request.cookies.get('local_token')?.value ||
          request.cookies.get('mock_session')?.value ||
          ''
      }

      if (!token) {
        return NextResponse.json({ user: null })
      }

      const email = token.includes('@') ? token : `${token}@academy.local`
      const safeId = email.replace(/[^a-zA-Z0-9]/g, '_')

      return NextResponse.json({
        user: {
          id: `user_${safeId}`,
          email,
          user_metadata: {
            full_name: email.split('@')[0],
          },
          role: 'student',
          created_at: new Date().toISOString(),
        },
      })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user: {
        ...user,
        profile,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null })
  }
}