import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface MockUser {
  id: string
  email: string
  password: string
  fullName: string
  createdAt: string
  role: 'student' | 'instructor'
}

const DATA_DIR = path.join(process.cwd(), '.local-data')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, '{}')
  }
}

function getSessions(): Record<string, MockUser> {
  ensureDataDir()
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

function getSession(): MockUser | null {
  ensureDataDir()
  const sessions = getSessions()
  return sessions['current'] || null
}

export async function GET(request: NextRequest) {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ user: null, session: null })
    }
    return NextResponse.json({
      user: { id: session.id, email: session.email, fullName: session.fullName, role: session.role },
      session: { user: { id: session.id, email: session.email, fullName: session.fullName, role: session.role } },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}