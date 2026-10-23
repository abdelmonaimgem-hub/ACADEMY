'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Course Not Found</h2>
        <p className="mt-2 text-gray-600">
          This course doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="primary">My Courses</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline">Browse All</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}