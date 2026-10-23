import { ReactNode } from 'react'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <span>LMS Platform</span>
              </Link>
            </div>
            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="/courses" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Courses
              </Link>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link href="/signup">
                <button className="btn-primary text-sm">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} LMS Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}