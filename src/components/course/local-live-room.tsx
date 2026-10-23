'use client'

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

interface LocalLiveRoomProps {
  roomName: string
  participantName: string
  onLeave: () => void
}

interface LocalRoomContextType {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  connectionState: 'connecting' | 'connected' | 'disconnected'
  isScreenSharing: boolean
  toggleScreenShare: () => Promise<void>
  onLeave: () => void
  isChatOpen: boolean
  toggleChat: () => void
  raisedHands: Set<string>
  addRaisedHand: (identity: string) => void
  removeRaisedHand: (identity: string) => void
  floatingReactions: FloatingReaction[]
  addFloatingReaction: (reaction: FloatingReaction) => void
}

const LocalRoomContext = createContext<LocalRoomContextType | null>(null)

export function useLocalRoom() {
  const context = useContext(LocalRoomContext)
  if (!context) {
    throw new Error('useLocalRoom must be used within LocalLiveRoomProvider')
  }
  return context
}

interface FloatingReaction {
  id: string
  emoji: string
  from: string
  fromName: string
  timestamp: number
  x: number
  y: number
}

function LocalProvider({ children, ...value }: { children: ReactNode } & LocalRoomContextType) {
  return (
    <LocalRoomContext.Provider value={value}>
      {children}
    </LocalRoomContext.Provider>
  )
}

function LocalParticipantTile({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
          You
        </div>
      </div>
    </div>
  )
}

function ConnectionStatus({ state }: { state: LocalRoomContextType['connectionState'] }) {
  const config = {
    connecting: { label: 'Connecting...', color: 'text-yellow-600' },
    connected: { label: 'Connected (Local)', color: 'text-green-600' },
    disconnected: { label: 'Disconnected', color: 'text-red-600' },
  }[state]

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', config.color)}>
      {state === 'connecting' ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : state === 'connected' ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      {config.label}
    </div>
  )
}

function ChatSidebar() {
  const { isChatOpen, toggleChat } = useLocalRoom()
  const [messages, setMessages] = useState<{ id: string; from: string; message: string; timestamp: number }[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { localStream } = useLocalRoom()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    const message = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      from: 'You',
      message,
      timestamp: Date.now(),
    }])
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isChatOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm lg:w-80 bg-white border-l border-gray-200 flex flex-col z-40 animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat (Local)
        </h3>
        <Button variant="ghost" size="sm" onClick={toggleChat} className="lg:hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-2">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 flex-row-reverse">
              <div className="flex-1 max-w-[70%] text-right">
                <div className="inline-block px-3 py-2 rounded-2xl text-sm bg-primary-600 text-white rounded-tr-none">
                  <p>{msg.message}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          <Button type="submit" disabled={!inputValue.trim()} size="sm" className="px-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  )
}

function ReactionsBar() {
  const { addFloatingReaction, addRaisedHand, removeRaisedHand } = useLocalRoom()

  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '👏', label: 'Clap' },
    { emoji: '🙋', label: 'Raise Hand' },
  ]

  const sendReaction = (emoji: string) => {
    const x = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1
    const y = window.innerHeight * 0.7 + Math.random() * 100

    addFloatingReaction({
      id: `local-${Date.now()}-${Math.random()}`,
      emoji,
      from: 'local',
      fromName: 'You',
      timestamp: Date.now(),
      x,
      y,
    })

    if (emoji === '🙋') {
      addRaisedHand('local')
      setTimeout(() => removeRaisedHand('local'), 10000)
    }
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:bottom-20 lg:left-auto lg:translate-x-0 lg:right-4 flex gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1 border border-gray-200 shadow-lg z-30 hidden lg:flex">
      {reactions.map((r) => (
        <Button
          key={r.emoji}
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => sendReaction(r.emoji)}
          aria-label={r.label}
        >
          <span className="text-xl">{r.emoji}</span>
        </Button>
      ))}
    </div>
  )
}

function ParticipantList({ raisedHands }: { raisedHands: Set<string> }) {
  return (
    <div className="fixed right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto lg:static lg:w-auto lg:border-0 lg:bg-transparent lg:p-0 lg:max-h-none">
      <h3 className="font-semibold text-gray-900 mb-3 lg:hidden">Participants (Local)</h3>
      <div className="space-y-2">
        <div key="local" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
            Y
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-primary-600">You (Local)</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-green-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6zm-6 6H8" />
                </svg>
              </span>
              <span className="flex items-center gap-1 text-green-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </span>
              {raisedHands.has('local') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full" style={{ animation: 'pulse-raise-hand 1.5s ease-in-out infinite' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V17a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                  </svg>
                  Hand Raised
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FloatingReactions() {
  const { floatingReactions } = useLocalRoom()

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {floatingReactions.map((reaction) => (
        <FloatingReactionItem key={reaction.id} reaction={reaction} />
      ))}
    </div>
  )
}

function FloatingReactionItem({ reaction }: { reaction: FloatingReaction }) {
  const style = {
    '--rx': `${reaction.x}px`,
    '--ry': `${reaction.y}px`,
    animation: 'floatUp 2s ease-out forwards',
  } as React.CSSProperties

  return (
    <div
      className="absolute select-none pointer-events-none"
      style={style}
      aria-label={`${reaction.fromName} reacted with ${reaction.emoji}`}
    >
      <span className="text-3xl text-shadow-lg filter drop-shadow-lg">{reaction.emoji}</span>
    </div>
  )
}

function ControlBar() {
  const { localStream, isScreenSharing, toggleScreenShare, onLeave, isChatOpen, toggleChat, connectionState } = useLocalRoom()

  const hasVideo = localStream?.getVideoTracks().some(t => t.enabled) ?? false
  const hasAudio = localStream?.getAudioTracks().some(t => t.enabled) ?? false

  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach(t => t.enabled = !t.enabled)
  }

  const toggleAudio = () => {
    localStream?.getAudioTracks().forEach(t => t.enabled = !t.enabled)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 lg:p-6">
      <div className="mx-auto max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ConnectionStatus state={connectionState} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={hasAudio ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleAudio}
            className="p-3 rounded-full"
            aria-label={hasAudio ? 'Mute microphone' : 'Unmute microphone'}
          >
            <svg className="w-5 h-5" fill={hasVideo ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hasAudio ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6zm-6 6H8" : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"} />
            </svg>
          </Button>

          <Button
            variant={hasVideo ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleVideo}
            className="p-3 rounded-full"
            aria-label={hasVideo ? 'Turn off camera' : 'Turn on camera'}
          >
            <svg className="w-5 h-5" fill={hasVideo ? 'none' : 'currentColor'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hasVideo ? "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"} />
            </svg>
          </Button>

          <Button
            variant={isScreenSharing ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleScreenShare}
            className="hidden sm:flex items-center gap-2 px-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>

          <Button
            variant={isChatOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleChat}
            className="hidden sm:flex items-center gap-2 px-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            className="px-6 py-2.5"
            onClick={onLeave}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave Session
          </Button>
        </div>
      </div>
    </div>
  )
}

function LocalLiveRoomContent() {
  const { localStream, connectionState, raisedHands, floatingReactions } = useLocalRoom()

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 relative">
          <div className="w-full h-full bg-gray-800 relative">
            <LocalParticipantTile stream={localStream} />
            <FloatingReactions />
          </div>
        </div>

        <ParticipantList raisedHands={raisedHands} />
        <ChatSidebar />
        <ReactionsBar />
        <ControlBar />
      </div>
    </div>
  )
}

export function LocalLiveRoom({ roomName, participantName, onLeave }: LocalLiveRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set())
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
  const screenStreamRef = useRef<MediaStream | null>(null)

  const toggleChat = () => setIsChatOpen(prev => !prev)

  const addRaisedHand = (identity: string) => {
    setRaisedHands(prev => new Set(prev).add(identity))
  }

  const removeRaisedHand = (identity: string) => {
    setRaisedHands(prev => {
      const next = new Set(prev)
      next.delete(identity)
      return next
    })
  }

  const addFloatingReaction = (reaction: FloatingReaction) => {
    setFloatingReactions(prev => [...prev, reaction])
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id))
    }, 2500)
  }

  const initMedia = async () => {
    try {
      setConnectionState('connecting')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      setLocalStream(stream)
      setConnectionState('connected')
    } catch (error) {
      console.error('Failed to access media devices:', error)
      setConnectionState('disconnected')
      alert('Could not access camera/microphone. Please check permissions.')
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        screenStreamRef.current = stream
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          screenStreamRef.current = null
        }
        setIsScreenSharing(true)
      } catch (error) {
        console.error('Screen share failed:', error)
      }
    }
  }

  useEffect(() => {
    initMedia()
    return () => {
      localStream?.getTracks().forEach(t => t.stop())
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <LocalProvider
      localStream={localStream}
      remoteStreams={new Map()}
      connectionState={connectionState}
      isScreenSharing={isScreenSharing}
      toggleScreenShare={toggleScreenShare}
      onLeave={onLeave}
      isChatOpen={isChatOpen}
      toggleChat={toggleChat}
      raisedHands={raisedHands}
      addRaisedHand={addRaisedHand}
      removeRaisedHand={removeRaisedHand}
      floatingReactions={floatingReactions}
      addFloatingReaction={addFloatingReaction}
    >
      <div className="relative w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden">
        <LocalLiveRoomContent />
      </div>
    </LocalProvider>
  )
}