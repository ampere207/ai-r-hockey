import { GameState, Vector2 } from './types'

export function renderTable(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Background
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  // Center line
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Goal areas (top and bottom) - visual representation
  const goalWidth = 234  // Match physics goal width (increased by 2X)
  const goalCenterX = width / 2
  const goalLeft = goalCenterX - goalWidth / 2
  const goalRight = goalCenterX + goalWidth / 2

  // Top goal (AI) - draw goal box
  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(goalLeft, 0)
  ctx.lineTo(goalRight, 0)
  ctx.stroke()
  // Draw goal posts
  ctx.beginPath()
  ctx.moveTo(goalLeft, 0)
  ctx.lineTo(goalLeft, 15)
  ctx.moveTo(goalRight, 0)
  ctx.lineTo(goalRight, 15)
  ctx.stroke()

  // Bottom goal (Human) - draw goal box
  ctx.strokeStyle = '#4ecdc4'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(goalLeft, height)
  ctx.lineTo(goalRight, height)
  ctx.stroke()
  // Draw goal posts
  ctx.beginPath()
  ctx.moveTo(goalLeft, height)
  ctx.lineTo(goalLeft, height - 15)
  ctx.moveTo(goalRight, height)
  ctx.lineTo(goalRight, height - 15)
  ctx.stroke()

  // Side walls
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.strokeRect(0, 0, width, height)
}

export function renderPuck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
): void {
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.ellipse(x + 2, y + 2, radius, radius, 0, 0, Math.PI * 2)
  ctx.fill()

  // Puck body
  const gradient = ctx.createRadialGradient(
    x - radius / 3,
    y - radius / 3,
    0,
    x,
    y,
    radius
  )
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(1, '#cccccc')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Border
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 2
  ctx.stroke()
}

export function renderPaddle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  isHuman: boolean = false
): void {
  const color = isHuman ? '#4ecdc4' : '#ff6b6b'
  const label = isHuman ? 'YOU' : 'AI'

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2)
  ctx.fill()

  // Paddle body (circular)
  const gradient = ctx.createRadialGradient(
    x - radius / 3,
    y - radius / 3,
    0,
    x,
    y,
    radius
  )
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, color + 'cc')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Border
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  // Label
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.max(8, Math.min(radius / 2.5, 12))}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
  
  // Add inner circle for better visibility
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2)
  ctx.stroke()
}

export function renderDebugOverlay(
  ctx: CanvasRenderingContext2D,
  aiTarget: Vector2 | null,
  showDebug: boolean
): void {
  if (!showDebug || !aiTarget) return

  // Draw AI target position
  ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'
  ctx.beginPath()
  ctx.arc(aiTarget.x, aiTarget.y, 10, 0, Math.PI * 2)
  ctx.fill()

  // Draw direction arrow (from AI paddle to target)
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(aiTarget.x, aiTarget.y)
  ctx.lineTo(aiTarget.x, aiTarget.y - 50)
  ctx.stroke()
  ctx.setLineDash([])
}

export function renderStartScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Click to Start', width / 2, height / 2)

  ctx.font = '16px sans-serif'
  ctx.fillText('Move your mouse to control your paddle', width / 2, height / 2 + 50)
}

export function renderGoalCelebration(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scorer: 'human' | 'ai'
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(0, 0, width, height)

  const message = scorer === 'human' ? 'You Scored!' : 'AI Scored!'
  const color = scorer === 'human' ? '#4ecdc4' : '#ff6b6b'

  ctx.fillStyle = color
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(message, width / 2, height / 2)
}

