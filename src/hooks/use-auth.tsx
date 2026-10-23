'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import type { User, Session } from '@supabase/supabase-js'

const isLocalMode = () => {
  if (typeof window === 'undefined') return false
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
  )
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    createClient().then((client) => {
      if (mounted) setSupabase(client)
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    let mounted = true
    let subscription: { unsubscribe: () => void } | undefined

    if (isLocalMode()) {
      const checkLocalSession = async () => {
        try {
          const savedToken =
            typeof window !== 'undefined'
              ? localStorage.getItem('local_token') || 'demo@academy.local'
              : 'demo@academy.local'

          if (typeof window !== 'undefined' && !localStorage.getItem('local_token')) {
            localStorage.setItem('local_token', savedToken)
          }

          const res = await fetch('/api/auth/session', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          })

          const data = await res.json()

          if (mounted && data.user) {
            const mockUser = {
              id: data.user.id,
              email: data.user.email,
              user_metadata: {
                full_name:
                  data.user.user_metadata?.full_name ||
                  data.user.fullName ||
                  data.user.email.split('@')[0],
              },
              role: 'authenticated',
              app_metadata: {},
              aud: 'authenticated',
              created_at:
                data.user.created_at || data.user.createdAt || new Date().toISOString(),
            } as User

            const mockSession = {
              access_token: savedToken,
              refresh_token: 'local-refresh',
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              token_type: 'bearer',
              user: mockUser,
            } as Session

            setUser(mockUser)
            setSession(mockSession)
          }
        } catch (err) {
          console.error('Local auth check failed:', err)
        } finally {
          if (mounted) setLoading(false)
        }
      }

      checkLocalSession()

      return () => {
        mounted = false
      }
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })
    subscription = data?.subscription

    return () => {
      mounted = false
      subscription?.unsubscribe?.()
    }
  }, [supabase])

  const signOut = async () => {
    if (isLocalMode()) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('local_token')
      }
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setSession(null)
      return
    }
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}