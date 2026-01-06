import { GameState, GameConfig, Difficulty, AiMode } from './types'

const DEFAULT_CONFIG: GameConfig = {
  tableWidth: 1020, // Reduced by 15% from 1200
  tableHeight: 680,  // Reduced by 15% from 800
  paddleWidth: 100,
  paddleHeight: 20,
  puckRadius: 15,
  puckSpeed: 400,
  paddleSpeed: 500,
  friction: 0.98,
  difficulty: 'medium',
  aiMode: 'rule_based',
}

export function createInitialState(config: Partial<GameConfig> = {}): GameState {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  return {
    puck: {
      x: finalConfig.tableWidth / 2,
      y: finalConfig.tableHeight / 2,
      vx: 0,
      vy: 0,
      radius: finalConfig.puckRadius,
    },
    humanPaddle: {
      x: finalConfig.tableWidth / 2,
      y: finalConfig.tableHeight - finalConfig.tableHeight / 4, // Start in middle of human's court
      width: finalConfig.paddleWidth,
      height: finalConfig.paddleHeight,
    },
    aiPaddle: {
      x: finalConfig.tableWidth / 2,
      y: finalConfig.paddleHeight + 20,
      width: finalConfig.paddleWidth,
      height: finalConfig.paddleHeight,
    },
    tableWidth: finalConfig.tableWidth,
    tableHeight: finalConfig.tableHeight,
    humanScore: 0,
    aiScore: 0,
    difficulty: finalConfig.difficulty,
    aiMode: finalConfig.aiMode,
    isPaused: false,
    gameStarted: false,
    timeLimit: finalConfig.timeLimit,
    timeRemaining: finalConfig.timeLimit,
  }
}

export function resetGameState(state: GameState): GameState {
  return {
    ...state,
    puck: {
      x: state.tableWidth / 2,
      y: state.tableHeight / 2,
      vx: 0,
      vy: 0,
      radius: state.puck.radius,
    },
    humanPaddle: {
      ...state.humanPaddle,
      x: state.tableWidth / 2,
      y: state.tableHeight - state.tableHeight / 4, // Reset to middle of human's court
    },
    aiPaddle: {
      ...state.aiPaddle,
      x: state.tableWidth / 2,
      y: state.aiPaddle.height + 20,
    },
    isPaused: false,
    gameStarted: false,
  }
}

export function resetAfterGoal(state: GameState): GameState {
  return {
    ...state,
    puck: {
      x: state.tableWidth / 2,
      y: state.tableHeight / 2,
      vx: 0,
      vy: 0,
      radius: state.puck.radius,
    },
    humanPaddle: {
      ...state.humanPaddle,
      x: state.tableWidth / 2,
    },
    aiPaddle: {
      ...state.aiPaddle,
      x: state.tableWidth / 2,
    },
    isPaused: false,
    gameStarted: false,
  }
}

export function updateDifficulty(
  state: GameState,
  difficulty: Difficulty
): GameState {
  return {
    ...state,
    difficulty,
  }
}

export function updateAiMode(state: GameState, aiMode: AiMode): GameState {
  return {
    ...state,
    aiMode,
  }
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    gameStarted: true,
    isPaused: false,
    puck: {
      ...state.puck,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
    },
  }
}

export function pauseGame(state: GameState): GameState {
  return {
    ...state,
    isPaused: !state.isPaused,
  }
}

export function updateScore(
  state: GameState,
  scorer: 'human' | 'ai'
): GameState {
  return {
    ...state,
    humanScore: scorer === 'human' ? state.humanScore + 1 : state.humanScore,
    aiScore: scorer === 'ai' ? state.aiScore + 1 : state.aiScore,
  }
}

export function updateTimeRemaining(
  state: GameState,
  deltaTime: number
): GameState {
  if (!state.timeLimit || !state.timeRemaining) {
    return state
  }

  const newTimeRemaining = Math.max(0, state.timeRemaining - deltaTime)
  return {
    ...state,
    timeRemaining: newTimeRemaining,
  }
}

