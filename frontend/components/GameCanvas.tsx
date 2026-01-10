'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GameState } from '@/game/types'
import {
  updatePuckPosition,
  checkWallCollision,
  checkPaddleCollision,
  checkGoal,
  clampPuckToBounds,
  clampPaddleToBounds,
} from '@/game/physics'
import {
  renderTable,
  renderPuck,
  renderPaddle,
  renderDebugOverlay,
  renderStartScreen,
  renderGoalCelebration,
} from '@/game/render'
import {
  requestAiMoveHttp,
  connectAiWebSocket,
  sendWebSocketState,
  disconnectWebSocket,
  isWebSocketConnected,
  clientSideAi,
  isBackendAvailable,
} from '@/game/aiClient'
import { Vector2 } from '@/game/types'

interface GameCanvasProps {
  gameState: GameState
  onStateUpdate: (state: GameState) => void
  onGoal: (scorer: 'human' | 'ai') => void
  showDebug: boolean
  useWebSocket: boolean
}

const AI_UPDATE_INTERVAL = 50 // ms
const PADDLE_SPEED = 600 // Increased paddle speed for more responsive gameplay

// Difficulty-based AI paddle speed multipliers
const AI_SPEED_MULTIPLIERS = {
  easy: 0.4,    // Much slower for easy mode
  medium: 0.7,  // Moderate speed
  hard: 1.0,    // Full speed
}

export default function GameCanvas({
  gameState,
  onStateUpdate,
  onGoal,
  showDebug,
  useWebSocket,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const aiUpdateTimerRef = useRef<NodeJS.Timeout>()
  const [aiTarget, setAiTarget] = useState<Vector2 | null>(null)
  const [goalCelebration, setGoalCelebration] = useState<'human' | 'ai' | null>(null)
  const mousePosRef = useRef<Vector2 | null>(null)
  const lastAiResponseRef = useRef<{ target_x: number; target_y: number } | null>(null)
  const gameStateRef = useRef<GameState>(gameState)
  const humanPaddleVelocityRef = useRef<Vector2>({ x: 0, y: 0 })
  const aiPaddleVelocityRef = useRef<Vector2>({ x: 0, y: 0 })
  const lastHumanPaddlePosRef = useRef<Vector2>({ x: 0, y: 0 })
  const lastAiPaddlePosRef = useRef<Vector2>({ x: 0, y: 0 })
  
  // Keep gameStateRef in sync with gameState prop
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Handle mouse/touch input
  const handleInput = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    mousePosRef.current = { x, y }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      handleInput(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        handleInput(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleInput])

  // WebSocket setup
  useEffect(() => {
    if (useWebSocket && gameStateRef.current.gameStarted) {
      connectAiWebSocket(
        (response) => {
          lastAiResponseRef.current = response
          setAiTarget({ x: response.target_x, y: response.target_y })
        },
        () => {
          // On error, fallback to client-side AI
          const fallback = clientSideAi(gameStateRef.current)
          lastAiResponseRef.current = fallback
          setAiTarget({ x: fallback.target_x, y: fallback.target_y })
        }
      )
    }

    return () => {
      if (useWebSocket) {
        disconnectWebSocket()
      }
    }
  }, [useWebSocket, gameState.gameStarted])

  // AI update timer (HTTP polling or WebSocket sending)
  useEffect(() => {
    if (!gameStateRef.current.gameStarted || gameStateRef.current.isPaused) {
      if (aiUpdateTimerRef.current) {
        clearInterval(aiUpdateTimerRef.current)
        aiUpdateTimerRef.current = undefined
      }
      return
    }

    const updateAi = async () => {
      const currentState = gameStateRef.current
      try {
        if (useWebSocket && isWebSocketConnected()) {
          sendWebSocketState(currentState)
        } else {
          const response = await requestAiMoveHttp(currentState)
          lastAiResponseRef.current = response
          setAiTarget({ x: response.target_x, y: response.target_y })
        }
      } catch (error) {
        // Fallback to client-side AI
        const fallback = clientSideAi(currentState)
        lastAiResponseRef.current = fallback
        setAiTarget({ x: fallback.target_x, y: fallback.target_y })
      }
    }

    aiUpdateTimerRef.current = setInterval(updateAi, AI_UPDATE_INTERVAL)
    updateAi() // Initial call

    return () => {
      if (aiUpdateTimerRef.current) {
        clearInterval(aiUpdateTimerRef.current)
      }
    }
  }, [gameState.gameStarted, gameState.isPaused, useWebSocket]) // Only depend on flags, not entire state

  // Canvas setup and resize handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set initial canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        // Reduced width by 50% - was 850x680, now 425x680
        const containerWidth = container.clientWidth - 40
        const containerHeight = window.innerHeight - 250
        // Width reduced by 50%, height stays the same
        const maxWidth = Math.max(375, Math.min(425, containerWidth))
        const maxHeight = Math.max(595, Math.min(680, containerHeight))
        // Only resize if dimensions actually changed
        if (canvas.width !== maxWidth || canvas.height !== maxHeight) {
          canvas.width = maxWidth
          canvas.height = maxHeight
          // Update state ref with new dimensions
          gameStateRef.current = {
            ...gameStateRef.current,
            tableWidth: maxWidth,
            tableHeight: maxHeight,
          }
        }
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, []) // Only run once on mount

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      if (deltaTime > 0.1) {
        // Skip large time jumps
        animationFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Use ref to get latest state without triggering re-renders
      let newState = { ...gameStateRef.current }

      // Sync canvas dimensions with state
      newState.tableWidth = canvas.width
      newState.tableHeight = canvas.height

      // Handle start screen
      if (!newState.gameStarted && !goalCelebration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        renderTable(ctx, canvas.width, canvas.height)
        renderStartScreen(ctx, canvas.width, canvas.height)
        animationFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Handle goal celebration
      if (goalCelebration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        renderTable(ctx, canvas.width, canvas.height)
        renderGoalCelebration(ctx, canvas.width, canvas.height, goalCelebration)
        animationFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      if (!newState.isPaused && newState.gameStarted) {
        // Track paddle velocities for momentum transfer
        const lastHumanX = lastHumanPaddlePosRef.current.x
        const lastHumanY = lastHumanPaddlePosRef.current.y
        const lastAiX = lastAiPaddlePosRef.current.x
        const lastAiY = lastAiPaddlePosRef.current.y
        
        // Update human paddle position (follow mouse/touch)
        if (mousePosRef.current) {
          const targetX = mousePosRef.current.x
          const targetY = mousePosRef.current.y
          const currentX = newState.humanPaddle.x
          const currentY = newState.humanPaddle.y
          
          // Calculate distance for both X and Y
          const distanceX = targetX - currentX
          const distanceY = targetY - currentY
          const maxMove = PADDLE_SPEED * deltaTime
          
          // Move towards target with speed limit
          const moveX = Math.sign(distanceX) * Math.min(Math.abs(distanceX), maxMove)
          const moveY = Math.sign(distanceY) * Math.min(Math.abs(distanceY), maxMove)
          
          newState.humanPaddle.x = currentX + moveX
          newState.humanPaddle.y = currentY + moveY
          newState.humanPaddle = clampPaddleToBounds(
            newState.humanPaddle,
            newState.tableWidth,
            newState.tableHeight,
            true // isHuman = true
          )
          
          // Calculate velocity
          if (deltaTime > 0) {
            humanPaddleVelocityRef.current = {
              x: (newState.humanPaddle.x - lastHumanX) / deltaTime,
              y: (newState.humanPaddle.y - lastHumanY) / deltaTime,
            }
          }
          
          lastHumanPaddlePosRef.current = {
            x: newState.humanPaddle.x,
            y: newState.humanPaddle.y,
          }
        }

        // Update AI paddle position (interpolate to target)
        if (lastAiResponseRef.current) {
          const targetX = lastAiResponseRef.current.target_x
          const targetY = lastAiResponseRef.current.target_y
          const currentX = newState.aiPaddle.x
          const currentY = newState.aiPaddle.y
          
          // Calculate distance for both X and Y
          const distanceX = targetX - currentX
          const distanceY = targetY - currentY
          
          // Apply difficulty-based speed multiplier
          const speedMultiplier = AI_SPEED_MULTIPLIERS[newState.difficulty] || 0.7
          const maxMove = PADDLE_SPEED * speedMultiplier * deltaTime
          
          // Move towards target with speed limit
          const moveX = Math.sign(distanceX) * Math.min(Math.abs(distanceX), maxMove)
          const moveY = Math.sign(distanceY) * Math.min(Math.abs(distanceY), maxMove)
          
          newState.aiPaddle.x = currentX + moveX
          newState.aiPaddle.y = currentY + moveY
          newState.aiPaddle = clampPaddleToBounds(
            newState.aiPaddle,
            newState.tableWidth,
            newState.tableHeight,
            false // isHuman = false
          )
          
          // Calculate velocity
          if (deltaTime > 0) {
            aiPaddleVelocityRef.current = {
              x: (newState.aiPaddle.x - lastAiX) / deltaTime,
              y: (newState.aiPaddle.y - lastAiY) / deltaTime,
            }
          }
          
          lastAiPaddlePosRef.current = {
            x: newState.aiPaddle.x,
            y: newState.aiPaddle.y,
          }
        }

        // Update puck physics
        newState.puck = updatePuckPosition(newState.puck, deltaTime)
        
        // Check for goals BEFORE clamping (so puck can cross goal line)
        const goal = checkGoal(
          newState.puck,
          newState.tableWidth,
          newState.tableHeight
        )
        if (goal) {
          onGoal(goal)
          setGoalCelebration(goal)
          setTimeout(() => {
            setGoalCelebration(null)
          }, 2000)
          // Don't update state during goal celebration
          return
        }

        // Check collisions
        const wallCollision = checkWallCollision(
          newState.puck,
          newState.tableWidth,
          newState.tableHeight
        )
        if (wallCollision.collided) {
          newState.puck.vx = wallCollision.newVx ?? newState.puck.vx
          newState.puck.vy = wallCollision.newVy ?? newState.puck.vy
          newState.puck = clampPuckToBounds(
            newState.puck,
            newState.tableWidth,
            newState.tableHeight
          )
        }

        // Check collisions with velocity transfer
        const humanCollision = checkPaddleCollision(
          newState.puck,
          newState.humanPaddle,
          humanPaddleVelocityRef.current.x,
          humanPaddleVelocityRef.current.y,
          false // isAi = false
        )
        if (humanCollision.collided) {
          // Separate puck from paddle FIRST to prevent penetration
          const dx = newState.puck.x - newState.humanPaddle.x
          const dy = newState.puck.y - newState.humanPaddle.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = newState.puck.radius + newState.humanPaddle.radius
          
          // Force separation if overlapping
          if (dist < minDist) {
            if (dist < 0.001) {
              // If exactly overlapping, push in a direction
              newState.puck.x = newState.humanPaddle.x
              newState.puck.y = newState.humanPaddle.y + minDist
            } else {
              // Push apart along collision normal
              const normalX = dx / dist
              const normalY = dy / dist
              newState.puck.x = newState.humanPaddle.x + normalX * minDist
              newState.puck.y = newState.humanPaddle.y + normalY * minDist
            }
          }
          
          // Then apply velocity changes
          newState.puck.vx = humanCollision.newVx ?? newState.puck.vx
          newState.puck.vy = humanCollision.newVy ?? newState.puck.vy
        }

        const aiCollision = checkPaddleCollision(
          newState.puck,
          newState.aiPaddle,
          aiPaddleVelocityRef.current.x,
          aiPaddleVelocityRef.current.y,
          true // isAi = true (hits harder)
        )
        if (aiCollision.collided) {
          // Separate puck from paddle FIRST to prevent penetration
          const dx = newState.puck.x - newState.aiPaddle.x
          const dy = newState.puck.y - newState.aiPaddle.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = newState.puck.radius + newState.aiPaddle.radius
          
          // Force separation if overlapping
          if (dist < minDist) {
            if (dist < 0.001) {
              // If exactly overlapping, push in a direction
              newState.puck.x = newState.aiPaddle.x
              newState.puck.y = newState.aiPaddle.y - minDist
            } else {
              // Push apart along collision normal
              const normalX = dx / dist
              const normalY = dy / dist
              newState.puck.x = newState.aiPaddle.x + normalX * minDist
              newState.puck.y = newState.aiPaddle.y + normalY * minDist
            }
          }
          
          // Then apply velocity changes
          newState.puck.vx = aiCollision.newVx ?? newState.puck.vx
          newState.puck.vy = aiCollision.newVy ?? newState.puck.vy
        }

        // Goals are now checked before clamping (above)
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      renderTable(ctx, canvas.width, canvas.height)
      renderPuck(
        ctx,
        newState.puck.x,
        newState.puck.y,
        newState.puck.radius
      )
      renderPaddle(
        ctx,
        newState.humanPaddle.x,
        newState.humanPaddle.y,
        newState.humanPaddle.radius,
        true
      )
      renderPaddle(
        ctx,
        newState.aiPaddle.x,
        newState.aiPaddle.y,
        newState.aiPaddle.radius,
        false
      )
      renderDebugOverlay(ctx, aiTarget, showDebug)

      onStateUpdate(newState)
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [onStateUpdate, onGoal, showDebug, aiTarget, goalCelebration]) // Removed gameState from deps

  // Clear goal celebration when game resets
  useEffect(() => {
    if (!gameState.gameStarted && goalCelebration) {
      setGoalCelebration(null)
    }
  }, [gameState.gameStarted, goalCelebration])

  // Initialize paddle position refs
  useEffect(() => {
    lastHumanPaddlePosRef.current = {
      x: gameState.humanPaddle.x,
      y: gameState.humanPaddle.y,
    }
    lastAiPaddlePosRef.current = {
      x: gameState.aiPaddle.x,
      y: gameState.aiPaddle.y,
    }
  }, [gameState.humanPaddle.x, gameState.humanPaddle.y, gameState.aiPaddle.x, gameState.aiPaddle.y])

  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-600 rounded-lg shadow-xl bg-gray-900"
      style={{ cursor: 'none' }}
    />
  )
}

