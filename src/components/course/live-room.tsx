'use client'

import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

export interface LocalLiveRoomProps {
  roomName: string
  participantName: string
  onLeave: () => void
  token?: string
  serverUrl?: string
}

export interface FloatingReaction {
  id: string
  emoji: string
  from: string
  fromName: string
  timestamp: number
  x: number
  y: number
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
  isMicMuted: boolean
  toggleMic: () => void
  isVideoOff: boolean
  toggleVideo: () => void
}

const LocalRoomContext = createContext<LocalRoomContextType | null>(null)

export function useLocalRoom() {
  const context = useContext(LocalRoomContext)
  if (!context) {
    throw new Error('useLocalRoom must be used within LocalLiveRoomProvider')
  }
  return context
}

function LocalParticipantTile({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
      {stream && stream.getVideoTracks().some((t) => t.enabled) ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-200">
            You
          </div>
          <span className="text-sm">Camera Off</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3">
        <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-medium">
          You (Presenter)
        </div>
      </div>
    </div>
  )
}

function ConnectionStatus({
  state,
}: {
  state: LocalRoomContextType['connectionState']
}) {
  const config = {
    connecting: { label: 'Connecting...', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40' },
    connected: { label: 'Connected (Live)', color: 'text-green-500 bg-green-50 dark:bg-green-950/40' },
    disconnected: { label: 'Disconnected', color: 'text-red-500 bg-red-50 dark:bg-red-950/40' },
  }[state]

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-current/20',
        config.color
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          state === 'connected'
            ? 'bg-green-500 animate-pulse'
            : state === 'connecting'
            ? 'bg-yellow-500 animate-spin'
            : 'bg-red-500'
        )}
      />
      <span>{config.label}</span>
    </div>
  )
}

export function LocalLiveRoom({
  roomName,
  participantName,
  onLeave,
}: LocalLiveRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] =
    useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set())
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])

  const streamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let active = true

    async function initMedia() {
      try {
        setConnectionState('connecting')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })

        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        setLocalStream(stream)
        setConnectionState('connected')
        setMediaError(null)
      } catch (err: any) {
        if (!active) return
        console.warn('Media devices access error:', err)
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMediaError('Camera/microphone permissions were denied. You are in listen-only mode.')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setMediaError('No media hardware detected. You are connected in spectator mode.')
        } else {
          setMediaError('Could not initialize video devices.')
        }
        setConnectionState('connected')
      }
    }

    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      initMedia()
    } else {
      setConnectionState('connected')
    }

    return () => {
      active = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
        screenStreamRef.current = null
      }
    }
  }, [])

  const toggleMic = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      const nextState = !isMicMuted
      audioTracks.forEach((t) => {
        t.enabled = !nextState
      })
      setIsMicMuted(nextState)
    }
  }, [isMicMuted])

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      const nextState = !isVideoOff
      videoTracks.forEach((t) => {
        t.enabled = !nextState
      })
      setIsVideoOff(nextState)
    }
  }, [isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }
      setIsScreenSharing(false)
      if (streamRef.current) {
        setLocalStream(streamRef.current)
      }
      return
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      screenStreamRef.current = screenStream
      setLocalStream(screenStream)
      setIsScreenSharing(true)

      const videoTrack = screenStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop())
            screenStreamRef.current = null
          }
          setIsScreenSharing(false)
          if (streamRef.current) {
            setLocalStream(streamRef.current)
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err)
      }
    }
  }, [isScreenSharing])

  const addRaisedHand = useCallback((identity: string) => {
    setRaisedHands((prev) => new Set(prev).add(identity))
  }, [])

  const removeRaisedHand = useCallback((identity: string) => {
    setRaisedHands((prev) => {
      const next = new Set(prev)
      next.delete(identity)
      return next
    })
  }, [])

  const addFloatingReaction = useCallback((reaction: FloatingReaction) => {
    setFloatingReactions((prev) => [...prev, reaction])
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id))
    }, 2500)
  }, [])

  const contextValue: LocalRoomContextType = {
    localStream,
    remoteStreams: new Map(),
    connectionState,
    isScreenSharing,
    toggleScreenShare,
    onLeave,
    isChatOpen,
    toggleChat: () => setIsChatOpen((prev) => !prev),
    raisedHands,
    addRaisedHand,
    removeRaisedHand,
    floatingReactions,
    addFloatingReaction,
    isMicMuted,
    toggleMic,
    isVideoOff,
    toggleVideo,
  }

  return (
    <LocalRoomContext.Provider value={contextValue}>
      <div className="relative w-full h-[680px] bg-gray-950 text-white rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-gray-800">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur border-b border-gray-800 z-10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="font-semibold text-sm sm:text-base">{roomName}</h2>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus state={connectionState} />
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="border-red-600/40 text-red-400 hover:bg-red-950/50 hover:text-red-300"
            >
              Leave Room
            </Button>
          </div>
        </div>

        {/* Media error banner */}
        {mediaError && (
          <div className="bg-amber-900/40 border-b border-amber-700/50 px-4 py-2 text-xs text-amber-200 text-center">
            {mediaError}
          </div>
        )}

        {/* Main Video Viewport */}
        <div className="relative flex-1 p-4 bg-gray-950 flex items-center justify-center overflow-hidden">
          <LocalParticipantTile stream={localStream} />

          {/* Floating Reactions Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {floatingReactions.map((reaction) => (
              <div
                key={reaction.id}
                className="absolute text-4xl animate-bounce transition-all duration-700"
                style={{
                  left: `${reaction.x}%`,
                  bottom: `${reaction.y}%`,
                }}
              >
                {reaction.emoji}
              </div>
            ))}
          </div>

          {/* Raised Hands Overlay */}
          {raisedHands.size > 0 && (
            <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2">
              {Array.from(raisedHands).map((id) => (
                <div
                  key={id}
                  className="bg-amber-500 text-gray-950 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <span>✋</span>
                  <span>{id === participantName ? 'You' : id} raised hand</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="px-6 py-4 bg-gray-900/90 backdrop-blur border-t border-gray-800 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isMicMuted ? 'outline' : 'primary'}
              onClick={toggleMic}
              className={isMicMuted ? 'border-red-500 text-red-400 bg-red-950/20' : ''}
            >
              {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            </Button>

            <Button
              size="sm"
              variant={isVideoOff ? 'outline' : 'primary'}
              onClick={toggleVideo}
              className={isVideoOff ? 'border-red-500 text-red-400 bg-red-950/20' : ''}
            >
              {isVideoOff ? 'Start Video' : 'Stop Video'}
            </Button>

            <Button
              size="sm"
              variant={isScreenSharing ? 'outline' : 'primary'}
              onClick={toggleScreenShare}
              className={isScreenSharing ? 'border-green-500 text-green-400 bg-green-950/20' : ''}
            >
              {isScreenSharing ? 'Stop Screen' : 'Share Screen'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const isRaised = raisedHands.has(participantName)
                if (isRaised) removeRaisedHand(participantName)
                else addRaisedHand(participantName)
              }}
              className="border-gray-700 hover:bg-gray-800 text-gray-200"
            >
              {raisedHands.has(participantName) ? 'Lower Hand' : '✋ Raise Hand'}
            </Button>

            {['👏', '🔥', '❤️', '💡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() =>
                  addFloatingReaction({
                    id: `${Date.now()}_${Math.random()}`,
                    emoji,
                    from: participantName,
                    fromName: participantName,
                    timestamp: Date.now(),
                    x: 20 + Math.random() * 60,
                    y: 20 + Math.random() * 40,
                  })
                }
                className="p-1.5 hover:scale-125 transition-transform text-lg"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </LocalRoomContext.Provider>
  )
}
export { LocalLiveRoom as LiveRoom }