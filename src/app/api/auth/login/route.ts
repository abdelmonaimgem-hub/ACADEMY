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
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]')
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, '{}')
  }
}

function getUsers(): MockUser[] {
  ensureDataDir()
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
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

function setSession(user: MockUser | null) {
  ensureDataDir()
  const sessions = getSessions()
  if (user) {
    sessions['current'] = user
  } else {
    delete sessions['current']
  }
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const users = getUsers()
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    setSession(user)

    return NextResponse.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      session: { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } },
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}