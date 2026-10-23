# Next.js App Router Folder Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth route group (no layout persistence)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Sign up page
│   │   └── layout.tsx            # Auth-specific layout (centered card)
│   │
│   ├── (dashboard)/               # Protected dashboard route group
│   │   ├── layout.tsx            # Dashboard layout with sidebar/navbar
│   │   ├── page.tsx              # Student dashboard - enrolled courses
│   │   └── courses/
│   │       └── [courseId]/
│   │           └── page.tsx      # Course details + LiveKit room
│   │
│   ├── (public)/                  # Public route group
│   │   ├── layout.tsx            # Public layout with marketing navbar
│   │   ├── page.tsx              # Landing page
│   │   └── courses/
│   │       └── page.tsx          # Course catalog (browse all)
│   │
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   │   ├── signup/route.ts   # Handle signup (if custom)
│   │   │   └── callback/route.ts # OAuth callback
│   │   ├── livekit/
│   │   │   └── token/route.ts    # Generate LiveKit access tokens
│   │   └── enroll/
│   │       └── route.ts          # Handle course enrollment
│   │
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to dashboard or landing
│   └── loading.tsx               # Global loading UI
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── course-card.tsx
│   │   └── enrollment-badge.tsx
│   ├── course/
│   │   ├── lesson-list.tsx
│   │   ├── live-room.tsx         # LiveKit video room component
│   │   └── course-header.tsx
│   └── providers.tsx             # Context providers
│
├── lib/
│   ├── supabase/
│   │   ├── browser-client.ts     # Client-side Supabase client
│   │   ├── server-client.ts      # Server-side Supabase client
│   │   └── middleware.ts         # Session refresh middleware
│   ├── livekit/
│   │   └── token-generator.ts    # LiveKit token generation logic
│   ├── utils/
│   │   ├── cn.ts                 # clsx + tailwind-merge helper
│   │   └── format-date.ts
│   ├── database.types.ts         # Generated Supabase types
│   └── constants.ts              # App constants
│
├── hooks/
│   ├── use-auth.ts               # Auth state hook
│   ├── use-enrollment.ts         # Enrollment check hook
│   └── use-livekit.ts            # LiveKit connection hook
│
├── types/
│   ├── course.ts
│   ├── lesson.ts
│   └── user.ts
│
└── middleware.ts                 # Next.js middleware (session refresh)
```

## Route Groups Explained

| Group | Purpose | Layout |
|-------|---------|--------|
| `(auth)` | Login, Signup - no persistent layout | Centered card, no navbar |
| `(public)` | Landing, Course catalog | Marketing navbar, footer |
| `(dashboard)` | Protected student area | Sidebar + top nav, requires auth |

## Key Files to Create Next

1. **Auth Pages**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`
2. **Dashboard Layout**: `src/app/(dashboard)/layout.tsx`
3. **Student Dashboard**: `src/app/(dashboard)/page.tsx`
4. **Course Detail + LiveKit**: `src/app/(dashboard)/courses/[courseId]/page.tsx`
5. **LiveKit Token API**: `src/app/api/livekit/token/route.ts`
6. **Enrollment API**: `src/app/api/enroll/route.ts`
7. **UI Components**: Button, Input, Card, LiveRoom component