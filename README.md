# LMS Platform - Next.js + Supabase + LiveKit

A modern Learning Management System with live streaming capabilities.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/Database/Auth**: Supabase (PostgreSQL, Auth, RLS, Realtime)
- **Live Streaming**: LiveKit Web SDK (in-browser video/audio)

## Quick Start

### 1. Install Dependencies

```bash
cd lms-platform
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit WebSocket URL | LiveKit Cloud Dashboard or self-hosted |
| `LIVEKIT_API_KEY` | LiveKit API key | LiveKit Cloud Dashboard |
| `LIVEKIT_API_SECRET` | LiveKit API secret | LiveKit Cloud Dashboard |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` for dev |

### 3. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the contents of `supabase-schema.sql` (in project root)
4. This creates tables, RLS policies, and the auth trigger

### 4. LiveKit Setup

1. Create a LiveKit Cloud account at [livekit.io](https://livekit.io)
2. Create a new project
3. Copy the WebSocket URL, API Key, and API Secret to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Signup pages
│   ├── (dashboard)/      # Protected student area
│   ├── (public)/         # Landing, course catalog
│   └── api/              # API routes
├── components/
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Auth forms
│   ├── dashboard/        # Dashboard components
│   └── course/           # Course & LiveKit components
├── lib/
│   ├── supabase/         # Supabase clients (browser/server/middleware)
│   ├── livekit/          # LiveKit token generation
│   └── utils/            # Helper functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

## Key Features

### Authentication
- Email/password signup & login
- Automatic profile creation with `role: 'basic'`
- Session persistence via Supabase SSR

### Role-Based Access Control
- **Basic User**: Can browse courses only
- **Enrolled Student**: Access to enrolled course content + live rooms
- Enforced via Supabase RLS policies

### Live Streaming (LiveKit)
- Token-based authentication
- In-browser video/audio controls
- Room per lesson via `room_identifier`

### Database Security
- Row Level Security on all tables
- Lessons only readable by enrolled students
- LiveKit tokens only issued to enrolled users

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Supabase Edge Functions (Alternative for API)
Move `/api/livekit/token` and `/api/enroll` to Supabase Edge Functions for better performance.

## License

MIT