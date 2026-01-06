'use client'

import { GameState } from '@/game/types'
import { isBackendAvailable } from '@/game/aiClient'

interface HUDProps {
  gameState: GameState
}

export default function HUD({ gameState }: HUDProps) {
  const formatTime = (seconds?: number): string => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-400">Human</div>
            <div className="text-3xl font-bold text-cyan-400">{gameState.humanScore}</div>
          </div>
          <div className="text-2xl font-bold">vs</div>
          <div className="text-center">
            <div className="text-sm text-gray-400">AI</div>
            <div className="text-3xl font-bold text-red-400">{gameState.aiScore}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {gameState.timeRemaining !== undefined && (
            <div className="text-center">
              <div className="text-sm text-gray-400">Time</div>
              <div className="text-xl font-bold">{formatTime(gameState.timeRemaining)}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-sm text-gray-400">Difficulty</div>
            <div className="text-lg font-semibold capitalize">{gameState.difficulty}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">AI Mode</div>
            <div className="text-lg font-semibold">
              {gameState.aiMode === 'rule_based' ? 'Rule-based' : 'Model-based'}
            </div>
          </div>
        </div>
      </div>

      {!isBackendAvailable() && (
        <div className="mt-2 text-yellow-400 text-sm text-center">
          ⚠️ Backend unavailable - using client-side AI
        </div>
      )}
    </div>
  )
}

