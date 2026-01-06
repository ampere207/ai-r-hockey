'use client'

import { useState, useCallback } from 'react'
import { GameState, Difficulty, AiMode } from '@/game/types'
import {
  createInitialState,
  resetGameState,
  resetAfterGoal,
  updateDifficulty,
  updateAiMode,
  startGame,
  updateScore,
  updateTimeRemaining,
} from '@/game/state'
import GameCanvas from './GameCanvas'
import HUD from './HUD'
import SettingsPanel from './SettingsPanel'

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState()
  )
  const [showDebug, setShowDebug] = useState(false)
  const [useWebSocket, setUseWebSocket] = useState(false)

  const handleStateUpdate = useCallback((newState: GameState) => {
    setGameState((prevState) => {
      let updated = newState

      // Update time if time limit is set
      if (updated.timeLimit && updated.gameStarted && !updated.isPaused) {
        updated = updateTimeRemaining(updated, 1 / 60) // Assuming 60 FPS
      }

      return updated
    })
  }, [])

  const handleGoal = useCallback(
    (scorer: 'human' | 'ai') => {
      setGameState((prevState) => {
        const updated = updateScore(prevState, scorer)
        setTimeout(() => {
          setGameState((prevState) => resetAfterGoal(prevState))
        }, 2000)
        return updated
      })
    },
    []
  )

  const handleRestart = useCallback(() => {
    setGameState((prevState) => resetGameState(prevState))
  }, [])

  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setGameState((prevState) => updateDifficulty(prevState, difficulty))
  }, [])

  const handleAiModeChange = useCallback((mode: AiMode) => {
    setGameState((prevState) => updateAiMode(prevState, mode))
  }, [])

  const handleStartClick = useCallback(() => {
    if (!gameState.gameStarted) {
      setGameState((prevState) => startGame(prevState))
    }
  }, [gameState.gameStarted])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          AI Air Hockey
        </h1>

        <HUD gameState={gameState} />

        <div className="flex justify-center mb-4 w-full">
          <div onClick={handleStartClick} className="cursor-pointer w-full flex justify-center">
            <GameCanvas
              gameState={gameState}
              onStateUpdate={handleStateUpdate}
              onGoal={handleGoal}
              showDebug={showDebug}
              useWebSocket={useWebSocket}
            />
          </div>
        </div>

        <SettingsPanel
          difficulty={gameState.difficulty}
          aiMode={gameState.aiMode}
          onDifficultyChange={handleDifficultyChange}
          onAiModeChange={handleAiModeChange}
          onRestart={handleRestart}
          showDebug={showDebug}
          onDebugChange={setShowDebug}
          useWebSocket={useWebSocket}
          onWebSocketChange={setUseWebSocket}
        />
      </div>
    </div>
  )
}

