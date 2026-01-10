export type Difficulty = 'easy' | 'medium' | 'hard'
export type AiMode = 'rule_based' | 'model_based'

export interface Vector2 {
  x: number
  y: number
}

export interface PaddleState {
  x: number
  y: number
  radius: number  // Changed from width/height to radius for circular paddles
}

export interface PuckState {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export interface GameState {
  puck: PuckState
  humanPaddle: PaddleState
  aiPaddle: PaddleState
  tableWidth: number
  tableHeight: number
  humanScore: number
  aiScore: number
  difficulty: Difficulty
  aiMode: AiMode
  isPaused: boolean
  gameStarted: boolean
  timeLimit?: number
  timeRemaining?: number
}

export interface AiRequestPayload {
  puck: {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
  }
  human_paddle: {
    x: number
    y: number
    radius: number  // Changed from width/height to radius
  }
  ai_paddle: {
    x: number
    y: number
    radius: number  // Changed from width/height to radius
  }
  table_width: number
  table_height: number
  difficulty: Difficulty
  ai_mode: AiMode
}

export interface AiResponsePayload {
  target_x: number
  target_y: number
}

export interface GameConfig {
  tableWidth: number
  tableHeight: number
  paddleRadius: number  // Changed from paddleWidth/paddleHeight
  puckRadius: number
  puckSpeed: number
  paddleSpeed: number
  friction: number
  difficulty: Difficulty
  aiMode: AiMode
  timeLimit?: number
}

