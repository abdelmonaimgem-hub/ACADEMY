'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { useAuth } from './use-auth'

const isLocalMode = () => {
  if (typeof window === 'undefined') return false
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
}

export interface LiveKitTokenResponse {
  token: string
}

export function useLiveKitToken(courseId: string | null, roomName: string | null) {
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchToken = useCallback(async () => {
    if (!user || !courseId || !roomName) {
      setToken(null)
      return
    }

    if (isLocalMode()) {
      setToken('local-mock-token')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, roomName }),
      })

      const data: LiveKitTokenResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.token || 'Failed to generate token')
      }

      setToken(data.token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get LiveKit token'
      setError(message)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [user, courseId, roomName])

  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  return { token, loading, error, refetch: fetchToken }
}