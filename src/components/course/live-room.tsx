'use client'

import { 
  LiveKitRoom, 
  useRoomContext,
  useLocalParticipant,
  useParticipantPermissions,
  GridLayout,
  ParticipantTile,
  ParticipantName,
  ConnectionQualityIndicator,
  AudioVisualizer,
  TrackToggle,
  ConnectionState as ConnectionStateDisplay,
  TrackLoop,
  useTracks,
  VideoTrack,
  AudioTrack,
  useConnectionState,
  useChat,
} from '@livekit/components-react'
import { Room, RoomEvent, Track, ConnectionState, Track as TrackType, SendBytesOptions, DataPacket_Kind, RemoteParticipant } from 'livekit-client'
import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

interface LiveRoomProps {
  token: string
  serverUrl: string
  roomName: string
  participantName: string
  onLeave: () => void
}

interface RoomContextType {
  room: Room | null
  connectionState: ConnectionState
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

const RoomContext = createContext<RoomContextType | null>(null)

export function useRoom() {
  const context = useContext(RoomContext)
  if (!context) {
    throw new Error('useRoom must be used within LiveKitRoomProvider')
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

function RoomProvider({ children, room, connectionState, isScreenSharing, toggleScreenShare, onLeave, isChatOpen, toggleChat, raisedHands, addRaisedHand, removeRaisedHand, floatingReactions, addFloatingReaction }: {
  children: ReactNode
  room: Room | null
  connectionState: ConnectionState
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
}) {
  return (
    <RoomContext.Provider value={{ room, connectionState, isScreenSharing, toggleScreenShare, onLeave, isChatOpen, toggleChat, raisedHands, addRaisedHand, removeRaisedHand, floatingReactions, addFloatingReaction }}>
      {children}
    </RoomContext.Provider>
  )
}

function LocalParticipantTile() {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const cameraTracks = useTracks([TrackType.Source.Camera])
  const microphoneTracks = useTracks([TrackType.Source.Microphone])
  
  return (
    <div className="relative">
      <TrackLoop tracks={cameraTracks}>
        <VideoTrack className="w-full h-full object-cover" />
      </TrackLoop>
      <TrackLoop tracks={microphoneTracks}>
        <AudioTrack />
      </TrackLoop>
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
          You {isMicrophoneEnabled ? '' : ' 🔇'} {isCameraEnabled ? '' : ' 📷'}
        </div>
      </div>
    </div>
  )
}

function ConnectionStatus() {
  const connectionState = useConnectionState()
  
  const statusConfig: Record<ConnectionState, { label: string; color: string }> = {
    [ConnectionState.Connecting]: { label: 'Connecting...', color: 'text-yellow-600' },
    [ConnectionState.Connected]: { label: 'Connected', color: 'text-green-600' },
    [ConnectionState.Disconnected]: { label: 'Disconnected', color: 'text-red-600' },
    [ConnectionState.Reconnecting]: { label: 'Reconnecting...', color: 'text-yellow-600' },
    [ConnectionState.SignalReconnecting]: { label: 'Reconnecting...', color: 'text-yellow-600' },
  }

  const config = statusConfig[connectionState] ?? statusConfig[ConnectionState.Disconnected]
  
  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', config.color)}>
      {connectionState === ConnectionState.Connecting || connectionState === ConnectionState.Reconnecting || connectionState === ConnectionState.SignalReconnecting ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : connectionState === ConnectionState.Connected ? (
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
  const { isChatOpen, toggleChat, room } = useRoom()
  const { chatMessages, send, isSending } = useChat()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { localParticipant } = useLocalParticipant()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return
    const message = inputValue.trim()
    setInputValue('')
    try {
      await send(message)
    } catch (err) {
      console.error('Failed to send message:', err)
      setInputValue(message)
    }
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
          Chat
        </h3>
        <Button variant="ghost" size="sm" onClick={toggleChat} className="lg:hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-2">No messages yet</p>
            <p className="text-sm">Be the first to say hello!</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn('flex gap-2', msg.from?.identity === localParticipant.identity ? 'flex-row-reverse' : '')}
            >
              <div className={cn('flex-1 max-w-[70%]', msg.from?.identity === localParticipant.identity ? 'text-right' : '')}>
                <div className={cn('inline-block px-3 py-2 rounded-2xl text-sm', 
                  msg.from?.identity === localParticipant.identity 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                )}>
                  {msg.from?.identity !== localParticipant.identity && (
                    <p className="text-xs font-medium text-gray-500 mb-1">{msg.from?.name || msg.from?.identity}</p>
                  )}
                  <p>{msg.message}</p>
                </div>
                <p className={cn('text-xs text-gray-400 mt-1', msg.from?.identity === localParticipant.identity ? 'text-right' : '')}>
                  {formatTime(msg.timestamp)}
                </p>
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
            disabled={isSending}
          />
          <Button type="submit" disabled={!inputValue.trim() || isSending} size="sm" className="px-4">
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
  const { room } = useRoom()
  const { localParticipant } = useLocalParticipant()

  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '👏', label: 'Clap' },
    { emoji: '🙋', label: 'Raise Hand' },
  ]

  const sendReaction = async (emoji: string) => {
    if (!room) return
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'reaction', emoji, from: localParticipant.identity }))
      await localParticipant.sendBytes(payload, { topic: 'reactions' } as SendBytesOptions)
    } catch (err) {
      console.error('Failed to send reaction:', err)
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

function ControlBar() {
  const { room, isScreenSharing, toggleScreenShare, onLeave, isChatOpen, toggleChat } = useRoom()
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const permissions = useParticipantPermissions()
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 lg:p-6">
      <div className="mx-auto max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ConnectionStateDisplay />
        </div>

        <div className="flex items-center gap-2">
          <TrackToggle
            source={Track.Source.Microphone}
            className={cn(
              'p-3 rounded-full transition-colors',
              isMicrophoneEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
            )}
            aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
          />
          
          <TrackToggle
            source={Track.Source.Camera}
            className={cn(
              'p-3 rounded-full transition-colors',
              isCameraEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
            )}
            aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          />
          
          {permissions?.canPublish && (
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
          )}
          
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
            onClick={() => {
              room?.disconnect()
              onLeave()
            }}
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

function ParticipantList({ raisedHands }: { raisedHands: Set<string> }) {
  const { room } = useRoom()
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const [participants, setParticipants] = useState<Array<{
    identity: string
    name: string
    isLocal: boolean
    isMuted: boolean
    isCameraOff: boolean
  }>>([])

  const effectCallback = () => {
    if (!room) return

    const updateParticipants = () => {
      const list = []
      list.push({
        identity: room.localParticipant.identity,
        name: room.localParticipant.name || 'You',
        isLocal: true,
        isMuted: !isMicrophoneEnabled,
        isCameraOff: !isCameraEnabled,
      })
      room.remoteParticipants.forEach((p) => {
        const micPub = p.getTrackPublication(Track.Source.Microphone)
        const camPub = p.getTrackPublication(Track.Source.Camera)
        list.push({
          identity: p.identity,
          name: p.name || 'Participant',
          isLocal: false,
          isMuted: micPub?.isMuted ?? true,
          isCameraOff: camPub?.isMuted ?? true,
        })
      })
      setParticipants(list)
    }

    updateParticipants()
    const handleChange = () => updateParticipants()
    
    room.on(RoomEvent.ParticipantConnected, handleChange)
    room.on(RoomEvent.ParticipantDisconnected, handleChange)
    room.on(RoomEvent.TrackPublished, handleChange)
    room.on(RoomEvent.TrackUnpublished, handleChange)

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleChange)
      room.off(RoomEvent.ParticipantDisconnected, handleChange)
      room.off(RoomEvent.TrackPublished, handleChange)
      room.off(RoomEvent.TrackUnpublished, handleChange)
    }
  }

  useEffect(effectCallback, [room, isMicrophoneEnabled, isCameraEnabled])

return (
    <div className="fixed right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto lg:static lg:w-auto lg:border-0 lg:bg-transparent lg:p-0 lg:max-h-none">
      <h3 className="font-semibold text-gray-900 mb-3 lg:hidden">Participants</h3>
      <div className="space-y-2">
        {participants.map((p) => {
          const isRaised = raisedHands.has(p.identity)
          return (
            <div key={p.identity} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium text-sm truncate', p.isLocal && 'text-primary-600')}>
                  {p.name} {p.isLocal && '(You)'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={cn('flex items-center gap-1', p.isMuted ? 'text-red-500' : 'text-green-500')}>
                    <svg className="w-3 h-3" fill={p.isMuted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.isMuted ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6zm-6 6H8"} />
                    </svg>
                  </span>
                  <span className={cn('flex items-center gap-1', p.isCameraOff ? 'text-red-500' : 'text-green-500')}>
                    <svg className="w-3 h-3" fill={p.isCameraOff ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.isCameraOff ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 002-2H5a2 2 0 002-2z" : "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"} />
                    </svg>
                  </span>
                  {isRaised && (
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
          )
        })}
      </div>
    </div>
  )
}

function FloatingReactions() {
  const { floatingReactions } = useRoom()
  
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

function ReactionsReceiver() {
  const { room, addFloatingReaction, addRaisedHand, removeRaisedHand } = useRoom()
  const { localParticipant } = useLocalParticipant()
  const raiseHandSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!room) return

    // Create a subtle ding sound for raise hand
    if (typeof window !== 'undefined' && !raiseHandSoundRef.current) {
      raiseHandSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      raiseHandSoundRef.current.volume = 0.3
    }

    const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const decoder = new TextDecoder()
        const text = decoder.decode(payload)
        const data = JSON.parse(text)
        
        if (data.type === 'reaction' && data.emoji) {
          const emoji = data.emoji
          const from = data.from || participant?.identity || 'unknown'
          const fromName = participant?.name || from
          
          // Add floating reaction - position over video area (center of screen with offset)
          const videoAreaWidth = window.innerWidth * 0.8
          const videoAreaHeight = window.innerHeight * 0.6
          const x = (window.innerWidth - videoAreaWidth) / 2 + Math.random() * videoAreaWidth
          const y = (window.innerHeight - videoAreaHeight) / 2 + Math.random() * videoAreaHeight * 0.7 + videoAreaHeight * 0.15
          
          addFloatingReaction({
            id: `${from}-${Date.now()}-${Math.random()}`,
            emoji,
            from,
            fromName,
            timestamp: Date.now(),
            x,
            y
          })

          // Handle raise hand
          if (emoji === '🙋') {
            addRaisedHand(from)
            
            // Play subtle sound for raise hand
            if (raiseHandSoundRef.current) {
              raiseHandSoundRef.current.currentTime = 0
              raiseHandSoundRef.current.play().catch(() => {})
            }
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
              removeRaisedHand(from)
            }, 10000)
          }

          // Remove floating reaction after animation
          setTimeout(() => {
            // Parent component will clean up based on timestamp
          }, 2500)
        }
      } catch (err) {
        console.error('Failed to parse reaction:', err)
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived)

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room, addFloatingReaction, addRaisedHand, removeRaisedHand])

  return null
}

function LiveRoomContent() {
  const { room, connectionState, isScreenSharing, toggleScreenShare, onLeave, isChatOpen, floatingReactions, raisedHands } = useRoom()
  const [error, setError] = useState<string | null>(null)
  const tracks = useTracks([TrackType.Source.Camera, TrackType.Source.Microphone])

  useEffect(() => {
    const handleError = (e: CustomEvent) => setError(e.detail)
    window.addEventListener('livekit-error', handleError as EventListener)
    return () => window.removeEventListener('livekit-error', handleError as EventListener)
  }, [])

  // Clean up old floating reactions (older than 2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // The parent component manages the array, we just need to ensure cleanup happens
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 p-3 bg-red-600 text-white rounded-lg shadow-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-white hover:text-gray-200">×</button>
        </div>
      )}

      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 relative">
          <GridLayout tracks={tracks}>
            <LocalParticipantTile />
          </GridLayout>
          {/* Floating reactions overlay */}
          <FloatingReactions />
          {/* Data receiver for reactions */}
          <ReactionsReceiver />
        </div>

        <ParticipantList raisedHands={raisedHands} />
        <ChatSidebar />
        <ReactionsBar />
        <ControlBar />
      </div>
    </div>
  )
}

export function LiveRoom({ token, serverUrl, roomName, participantName, onLeave }: LiveRoomProps) {
  const [room, setRoom] = useState<Room | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set())
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])

  const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), [])

  const addRaisedHand = useCallback((identity: string) => {
    setRaisedHands(prev => new Set(prev).add(identity))
  }, [])

  const removeRaisedHand = useCallback((identity: string) => {
    setRaisedHands(prev => {
      const next = new Set(prev)
      next.delete(identity)
      return next
    })
  }, [])

  const addFloatingReaction = useCallback((reaction: FloatingReaction) => {
    setFloatingReactions(prev => [...prev, reaction])
    // Auto-remove after animation
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id))
    }, 2500)
  }, [])

  useEffect(() => {
    const handleLeave = () => {
      room?.disconnect()
      onLeave()
    }
    window.addEventListener('livekit-leave', handleLeave)
    return () => window.removeEventListener('livekit-leave', handleLeave)
  }, [room, onLeave])

  const toggleScreenShare = useCallback(async () => {
    if (!room) return
    try {
      if (isScreenSharing) {
        await room.localParticipant.setScreenShareEnabled(false)
      } else {
        await room.localParticipant.setScreenShareEnabled(true)
      }
      setIsScreenSharing(!isScreenSharing)
    } catch (err) {
      console.error('Screen share error:', err)
      setError('Failed to toggle screen share')
    }
  }, [room, isScreenSharing])

  return (
    <RoomProvider
      room={room}
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
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 p-3 bg-red-600 text-white rounded-lg shadow-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-white hover:text-gray-200">×</button>
          </div>
        )}

        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          onConnected={() => {
            // Room connected - room state will be available via hooks
          }}
          onDisconnected={() => {
            setConnectionState(ConnectionState.Disconnected)
            onLeave()
          }}
          onError={(err) => {
            console.error('LiveKit error:', err)
            setError(err.message)
          }}
        >
          <LiveRoomContent />
        </LiveKitRoom>
      </div>
    </RoomProvider>
  )
}