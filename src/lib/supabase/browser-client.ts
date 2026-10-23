'use client'

const isLocalMode = () => {
  if (typeof window === 'undefined') return false
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-ref.supabase.co'
}

async function apiFetch(action: string, body?: any) {
  const endpoints: Record<string, string> = {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    session: '/api/auth/session',
  }
  
  const method = action === 'session' ? 'GET' : 'POST'
  
  const res = await fetch(endpoints[action] || `/api/auth/${action}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })
  return res.json()
}

function createMockClient() {
  let currentUser: any = null
  const listeners: Set<(user: any) => void> = new Set()

  const notify = (user: any) => {
    currentUser = user
    listeners.forEach(cb => cb(user))
  }

  return {
    auth: {
      async signUp({ email, password, options }: any) {
        const data = await apiFetch('signup', { email, password, fullName: options?.data?.full_name, role: options?.data?.role })
        if (data.error) return { data: null, error: { message: data.error } }
        notify(data.user)
        return { data: { user: data.user, session: data.session }, error: null }
      },

      async signInWithPassword({ email, password }: any) {
        const data = await apiFetch('login', { email, password })
        if (data.error) return { data: null, error: { message: data.error } }
        notify(data.user)
        return { data: { user: data.user, session: data.session }, error: null }
      },

      async signOut() {
        await apiFetch('logout')
        notify(null)
        return { error: null }
      },

      async getSession() {
        const data = await apiFetch('session')
        return { data: { session: data.session }, error: null }
      },

      async getUser() {
        const data = await apiFetch('session')
        return { data: { user: data.user }, error: null }
      },

      onAuthStateChange(callback: (event: string, session: any) => void) {
        const handler = (user: any) => callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null)
        listeners.add(handler)
        return {
          data: { subscription: { unsubscribe: () => listeners.delete(handler) } },
        }
      },
    },
  }
}

let cachedClient: any = null

export async function createClient() {
  if (cachedClient) return cachedClient

  if (isLocalMode()) {
    cachedClient = createMockClient()
    return cachedClient
  }

  const { createBrowserClient } = await import('@supabase/ssr')
  cachedClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return cachedClient
}