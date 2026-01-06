'use client'

import { Difficulty, AiMode } from '@/game/types'

interface SettingsPanelProps {
  difficulty: Difficulty
  aiMode: AiMode
  onDifficultyChange: (difficulty: Difficulty) => void
  onAiModeChange: (mode: AiMode) => void
  onRestart: () => void
  showDebug: boolean
  onDebugChange: (show: boolean) => void
  useWebSocket: boolean
  onWebSocketChange: (use: boolean) => void
}

export default function SettingsPanel({
  difficulty,
  aiMode,
  onDifficultyChange,
  onAiModeChange,
  onRestart,
  showDebug,
  onDebugChange,
  useWebSocket,
  onWebSocketChange,
}: SettingsPanelProps) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">AI Mode</label>
            <select
              value={aiMode}
              onChange={(e) => onAiModeChange(e.target.value as AiMode)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="rule_based">Rule-based</option>
              <option value="model_based">Model-based (stub)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="websocket"
              checked={useWebSocket}
              onChange={(e) => onWebSocketChange(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="websocket" className="text-sm">
              Use WebSocket
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="debug"
              checked={showDebug}
              onChange={(e) => onDebugChange(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="debug" className="text-sm">
              Show Debug
            </label>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
        >
          Restart Game
        </button>
      </div>
    </div>
  )
}

