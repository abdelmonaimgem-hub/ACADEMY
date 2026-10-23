import { AccessToken } from 'livekit-server-sdk'

export interface LiveKitTokenParams {
  roomName: string
  participantName: string
  participantId: string
  canPublish?: boolean
  canSubscribe?: boolean
  canPublishData?: boolean
}

export async function generateLiveKitToken(params: LiveKitTokenParams): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit credentials not configured')
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: params.participantId,
    name: params.participantName,
  })

  at.addGrant({
    room: params.roomName,
    roomJoin: true,
    canPublish: params.canPublish ?? true,
    canSubscribe: params.canSubscribe ?? true,
    canPublishData: params.canPublishData ?? true,
  })

  return at.toJwt()
}