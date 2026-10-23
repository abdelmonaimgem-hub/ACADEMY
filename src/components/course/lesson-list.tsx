'use client'

import { Lesson } from '@/types/lesson'
import { cn } from '@/lib/utils/cn'

interface LessonListProps {
  lessons: Lesson[]
  activeLessonId: string | null
  onSelectLesson: (lesson: Lesson) => void
  isEnrolled: boolean
}

export function LessonList({ lessons, activeLessonId, onSelectLesson, isEnrolled }: LessonListProps) {
  if (!isEnrolled) {
    return null
  }

  const liveLessons = lessons.filter(l => l.is_live)
  const regularLessons = lessons.filter(l => !l.is_live)

  return (
    <div className="space-y-6">
      {/* Live Sessions Section */}
      {liveLessons.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Live Sessions
          </h3>
          <div className="space-y-2">
            {liveLessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isActive={activeLessonId === lesson.id}
                onClick={() => onSelectLesson(lesson)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Regular Lessons Section */}
      {regularLessons.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Lessons</h3>
          <div className="space-y-2">
            {regularLessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isActive={activeLessonId === lesson.id}
                onClick={() => onSelectLesson(lesson)}
              />
            ))}
          </div>
        </section>
      )}

      {lessons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="mt-2">No lessons available yet</p>
        </div>
      )}
    </div>
  )
}

function LessonItem({ lesson, isActive, onClick }: { lesson: Lesson; isActive: boolean; onClick: () => void }) {
  const isUpcoming = lesson.scheduled_at && new Date(lesson.scheduled_at) > new Date()
  const isPast = lesson.ended_at && new Date(lesson.ended_at) < new Date()
  const isLiveNow = lesson.is_live && lesson.started_at && !lesson.ended_at
  const isDisabled = !isActive && (Boolean(isUpcoming) || Boolean(isPast))

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-all',
        isActive
          ? 'border-primary-500 bg-primary-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        isDisabled && 'opacity-60 cursor-not-allowed'
      )}
      disabled={isDisabled}
    >
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', 
          isLiveNow ? 'bg-red-100 text-red-600' :
          isUpcoming ? 'bg-yellow-100 text-yellow-600' :
          isPast ? 'bg-gray-100 text-gray-400' :
          'bg-blue-100 text-blue-600'
        )}>
          {isLiveNow && (
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          )}
          {isUpcoming && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {isPast && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {!isLiveNow && !isUpcoming && !isPast && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium truncate', isActive ? 'text-gray-900' : 'text-gray-700')}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {lesson.scheduled_at && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(lesson.scheduled_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
            {isLiveNow && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                Upcoming
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                Ended
              </span>
            )}
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Description Preview */}
      {lesson.description && (
        <p className={cn('mt-2 text-sm line-clamp-2', isActive ? 'text-gray-600' : 'text-gray-400')}>
          {lesson.description}
        </p>
      )}
    </button>
  )
}