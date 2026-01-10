import { GameState, AiRequestPayload, AiResponsePayload } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

let wsConnection: WebSocket | null = null
let wsConnected = false
let backendAvailable = true

export function isBackendAvailable(): boolean {
  return backendAvailable
}

export async function requestAiMoveHttp(
  state: GameState
): Promise<AiResponsePayload> {
  const payload: AiRequestPayload = {
    puck: {
      x: state.puck.x,
      y: state.puck.y,
      vx: state.puck.vx,
      vy: state.puck.vy,
      radius: state.puck.radius,
    },
    human_paddle: {
      x: state.humanPaddle.x,
      y: state.humanPaddle.y,
      radius: state.humanPaddle.radius,
    },
    ai_paddle: {
      x: state.aiPaddle.x,
      y: state.aiPaddle.y,
      radius: state.aiPaddle.radius,
    },
    table_width: state.tableWidth,
    table_height: state.tableHeight,
    difficulty: state.difficulty,
    ai_mode: state.aiMode,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    backendAvailable = true
    return data as AiResponsePayload
  } catch (error) {
    console.error('Backend AI request failed:', error)
    backendAvailable = false
    throw error
  }
}

export function connectAiWebSocket(
  onMessage: (response: AiResponsePayload) => void,
  onError?: (error: Error) => void
): void {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    return
  }

  const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')
  const ws = new WebSocket(`${wsUrl}/ai/ws`)

  ws.onopen = () => {
    wsConnected = true
    backendAvailable = true
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.error) {
        console.error('WebSocket error:', data.error)
        if (onError) {
          onError(new Error(data.error))
        }
      } else {
        onMessage(data as AiResponsePayload)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    wsConnected = false
    backendAvailable = false
    if (onError) {
      onError(new Error('WebSocket connection error'))
    }
  }

  ws.onclose = () => {
    wsConnected = false
    console.log('WebSocket disconnected')
  }

  wsConnection = ws
}

export function sendWebSocketState(state: GameState): void {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    return
  }

  const payload: AiRequestPayload = {
    puck: {
      x: state.puck.x,
      y: state.puck.y,
      vx: state.puck.vx,
      vy: state.puck.vy,
      radius: state.puck.radius,
    },
    human_paddle: {
      x: state.humanPaddle.x,
      y: state.humanPaddle.y,
      radius: state.humanPaddle.radius,
    },
    ai_paddle: {
      x: state.aiPaddle.x,
      y: state.aiPaddle.y,
      radius: state.aiPaddle.radius,
    },
    table_width: state.tableWidth,
    table_height: state.tableHeight,
    difficulty: state.difficulty,
    ai_mode: state.aiMode,
  }

  wsConnection.send(JSON.stringify(payload))
}

export function disconnectWebSocket(): void {
  if (wsConnection) {
    wsConnection.close()
    wsConnection = null
    wsConnected = false
  }
}

export function isWebSocketConnected(): boolean {
  return wsConnected && wsConnection?.readyState === WebSocket.OPEN
}

// Client-side fallback AI (simple rule-based)
export function clientSideAi(state: GameState): AiResponsePayload {
  const puck = state.puck
  const aiPaddle = state.aiPaddle
  const tableWidth = state.tableWidth
  const tableHeight = state.tableHeight

  const centerLineY = tableHeight / 2
  const paddleRadius = aiPaddle.radius

  // Check if puck is in AI's court
  const puckInAiCourt = puck.y < centerLineY
  
  // Check if puck is idle
  const puckSpeed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy)
  const puckIsIdle = puckSpeed < 20
  
  const distanceToPuck = Math.sqrt(
    Math.pow(puck.x - aiPaddle.x, 2) + Math.pow(puck.y - aiPaddle.y, 2)
  )

  let targetX: number
  let targetY: number

  // If puck is idle in AI's court, actively hit it!
  if (puckIsIdle && puckInAiCourt) {
    // Add human-like variation
    const humanError = Math.random() * 30 - 15
    
    // Position to hit puck downward with force
    targetX = puck.x + humanError
    targetY = puck.y - 25
    
    targetX = Math.max(
      paddleRadius,
      Math.min(tableWidth - paddleRadius, targetX)
    )
    targetY = Math.max(
      paddleRadius,
      Math.min(centerLineY - paddleRadius, targetY)
    )
  }
  // If puck is moving towards AI or in AI's court, be aggressive
  else if (puck.vy < 0 || puckInAiCourt) {
    // Aggressive mode: Try to hit the puck back
    const optimalHitY = centerLineY * 0.3 // Upper part of AI's court
    
    if (puck.vy !== 0) {
      let interceptY: number
      if (puck.y < optimalHitY) {
        // Puck already past optimal position, chase it
        interceptY = puck.y
      } else {
        interceptY = optimalHitY
      }
      
      const t = (interceptY - puck.y) / puck.vy
      const predictedX = puck.x + puck.vx * t
      
      // If close to puck, aim slightly ahead
      if (distanceToPuck < 150) {
        const humanError = Math.random() * 20 - 10
        targetX = puck.x + puck.vx * 0.1 + humanError
      } else {
        targetX = predictedX
      }
      
      targetX = Math.max(
        paddleRadius,
        Math.min(tableWidth - paddleRadius, targetX)
      )
      targetY = Math.max(
        paddleRadius,
        Math.min(centerLineY - paddleRadius, interceptY)
      )
    } else {
      // Puck not moving horizontally, hit it!
      const humanError = Math.random() * 40 - 20
      targetX = puck.x + humanError
      targetY = puck.y - 30
      
      targetX = Math.max(
        paddleRadius,
        Math.min(tableWidth - paddleRadius, targetX)
      )
      targetY = Math.max(
        paddleRadius,
        Math.min(centerLineY - paddleRadius, targetY)
      )
    }
  } else {
    // Defensive mode: Puck moving away
    if (puck.vy > 0) {
      targetX = tableWidth / 2
      targetY = centerLineY * 0.4
    } else {
      const interceptY = centerLineY * 0.3
      const t = (interceptY - puck.y) / puck.vy
      const predictedX = puck.x + puck.vx * t
      targetX = Math.max(
        paddleRadius,
        Math.min(tableWidth - paddleRadius, predictedX)
      )
      targetY = interceptY
    }
  }

  return {
    target_x: targetX,
    target_y: targetY,
  }
}

