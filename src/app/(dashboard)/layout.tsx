'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'My Courses', href: '/dashboard', icon: 'book' },
  { name: 'Browse Courses', href: '/courses', icon: 'search' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login'
    }
  }, [user, authLoading])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Academy LMS
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="text-xs border-gray-300 dark:border-gray-600"
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-300 p-2 focus:outline-none"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-primary-600 dark:text-primary-400">Academy LMS</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}