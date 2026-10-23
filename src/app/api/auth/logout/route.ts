import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

function getSessions(): Record<string, any> {
  ensureDataDir()
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

function setSession(user: any) {
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
    setSession(null)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}