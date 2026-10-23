'use client'

import { AuthProvider } from '@/hooks/use-auth'
import { ToasterProvider } from '@/components/ui/toast'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToasterProvider />
      {children}
    </AuthProvider>
  )
}