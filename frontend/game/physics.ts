import { GameState, PuckState, PaddleState, Vector2 } from './types'

export interface CollisionResult {
  collided: boolean
  newVx?: number
  newVy?: number
}

const PUCK_FRICTION = 0.98
const WALL_BOUNCE_DAMPING = 0.95
const PADDLE_BOUNCE_MULTIPLIER = 1.5 // Increased for better response
const MIN_PUCK_VELOCITY = 50 // Minimum velocity after paddle hit
const PADDLE_VELOCITY_TRANSFER = 0.8 // How much paddle velocity transfers to puck

export function updatePuckPosition(
  puck: PuckState,
  deltaTime: number
): PuckState {
  // Apply friction
  const friction = PUCK_FRICTION
  const newVx = puck.vx * friction
  const newVy = puck.vy * friction

  // Stop very slow movement
  const minVelocity = 0.5
  const finalVx = Math.abs(newVx) < minVelocity ? 0 : newVx
  const finalVy = Math.abs(newVy) < minVelocity ? 0 : newVy

  return {
    ...puck,
    x: puck.x + finalVx * deltaTime,
    y: puck.y + finalVy * deltaTime,
    vx: finalVx,
    vy: finalVy,
  }
}

export function checkWallCollision(
  puck: PuckState,
  tableWidth: number,
  tableHeight: number
): CollisionResult {
  const radius = puck.radius
  let newVx = puck.vx
  let newVy = puck.vy
  let collided = false

  // Left wall
  if (puck.x - radius <= 0) {
    newVx = Math.abs(puck.vx) * WALL_BOUNCE_DAMPING
    collided = true
  }
  // Right wall
  if (puck.x + radius >= tableWidth) {
    newVx = -Math.abs(puck.vx) * WALL_BOUNCE_DAMPING
    collided = true
  }
  // Top wall (AI goal area - but we check boundaries)
  if (puck.y - radius <= 0) {
    newVy = Math.abs(puck.vy) * WALL_BOUNCE_DAMPING
    collided = true
  }
  // Bottom wall (Human goal area - but we check boundaries)
  if (puck.y + radius >= tableHeight) {
    newVy = -Math.abs(puck.vy) * WALL_BOUNCE_DAMPING
    collided = true
  }

  return {
    collided,
    newVx: collided ? newVx : undefined,
    newVy: collided ? newVy : undefined,
  }
}

export function checkPaddleCollision(
  puck: PuckState,
  paddle: PaddleState,
  paddleVx: number = 0,
  paddleVy: number = 0,
  isAi: boolean = false
): CollisionResult {
  const radius = puck.radius
  const paddleLeft = paddle.x - paddle.width / 2
  const paddleRight = paddle.x + paddle.width / 2
  const paddleTop = paddle.y - paddle.height / 2
  const paddleBottom = paddle.y + paddle.height / 2

  // Find closest point on paddle to puck center
  const closestX = Math.max(paddleLeft, Math.min(puck.x, paddleRight))
  const closestY = Math.max(paddleTop, Math.min(puck.y, paddleBottom))
  
  // Calculate distance from puck center to closest point on paddle
  const dx = puck.x - closestX
  const dy = puck.y - closestY
  const distanceSquared = dx * dx + dy * dy
  
  // Check if puck is colliding (distance less than radius)
  if (distanceSquared < radius * radius) {
    const distance = Math.sqrt(distanceSquared)
    
    // Calculate collision normal
    let normalX: number
    let normalY: number
    
    if (distance > 0.001) {
      // Normal from paddle edge to puck center
      normalX = dx / distance
      normalY = dy / distance
    } else {
      // If puck is exactly on paddle, use direction from paddle center
      const centerDx = puck.x - paddle.x
      const centerDy = puck.y - paddle.y
      const centerDist = Math.sqrt(centerDx * centerDx + centerDy * centerDy)
      if (centerDist > 0.001) {
        normalX = centerDx / centerDist
        normalY = centerDy / centerDist
      } else {
        // Fallback: push away from paddle center
        normalX = 0
        normalY = isAi ? -1 : 1 // Push away from paddle
      }
    }

    // Calculate relative velocity
    const relativeVx = puck.vx - paddleVx
    const relativeVy = puck.vy - paddleVy
    
    // Reflect relative velocity
    const dotProduct = relativeVx * normalX + relativeVy * normalY
    
    // Only reflect if moving towards paddle
    if (dotProduct < 0) {
      // Calculate new velocity after collision
      let newVx = relativeVx - 2 * dotProduct * normalX
      let newVy = relativeVy - 2 * dotProduct * normalY
      
      // Apply bounce multiplier
      newVx *= PADDLE_BOUNCE_MULTIPLIER
      newVy *= PADDLE_BOUNCE_MULTIPLIER
      
      // Add paddle velocity transfer
      newVx += paddleVx * PADDLE_VELOCITY_TRANSFER
      newVy += paddleVy * PADDLE_VELOCITY_TRANSFER
      
      // Ensure minimum velocity (especially for AI hits)
      const velocityMagnitude = Math.sqrt(newVx * newVx + newVy * newVy)
      if (velocityMagnitude < MIN_PUCK_VELOCITY) {
        const scale = MIN_PUCK_VELOCITY / velocityMagnitude
        newVx *= scale
        newVy *= scale
      }
      
      // AI hits harder
      if (isAi) {
        const aiBoost = 1.3
        newVx *= aiBoost
        newVy *= aiBoost
      }
      
      // Separate puck from paddle to prevent sticking
      const separation = radius - distance + 2
      const separationX = normalX * separation
      const separationY = normalY * separation
      
      return {
        collided: true,
        newVx,
        newVy,
      }
    }
  }

  return { collided: false }
}

export function checkGoal(
  puck: PuckState,
  tableWidth: number,
  tableHeight: number,
  goalWidth: number = 100
): 'human' | 'ai' | null {
  const goalCenterX = tableWidth / 2
  const goalLeft = goalCenterX - goalWidth / 2
  const goalRight = goalCenterX + goalWidth / 2

  // AI scores (puck goes past human's goal line at bottom)
  if (puck.y + puck.radius >= tableHeight) {
    if (puck.x >= goalLeft && puck.x <= goalRight) {
      return 'ai'
    }
  }

  // Human scores (puck goes past AI's goal line at top)
  if (puck.y - puck.radius <= 0) {
    if (puck.x >= goalLeft && puck.x <= goalRight) {
      return 'human'
    }
  }

  return null
}

export function clampPuckToBounds(
  puck: PuckState,
  tableWidth: number,
  tableHeight: number
): PuckState {
  const radius = puck.radius
  return {
    ...puck,
    x: Math.max(radius, Math.min(tableWidth - radius, puck.x)),
    y: Math.max(radius, Math.min(tableHeight - radius, puck.y)),
  }
}

export function clampPaddleToBounds(
  paddle: PaddleState,
  tableWidth: number,
  tableHeight: number,
  isHuman: boolean = false
): PaddleState {
  const halfWidth = paddle.width / 2
  const halfHeight = paddle.height / 2
  
  // Clamp X position (same for both paddles)
  const clampedX = Math.max(halfWidth, Math.min(tableWidth - halfWidth, paddle.x))
  
  // Clamp Y position based on which player
  let clampedY: number
  if (isHuman) {
    // Human paddle: restricted to bottom half of table (their court)
    const centerLine = tableHeight / 2
    const minY = centerLine + halfHeight // Can't cross center line
    const maxY = tableHeight - halfHeight // Can't go below table
    clampedY = Math.max(minY, Math.min(maxY, paddle.y))
  } else {
    // AI paddle: restricted to top half of table (their court)
    const centerLine = tableHeight / 2
    const minY = halfHeight // Can't go above table
    const maxY = centerLine - halfHeight // Can't cross center line
    clampedY = Math.max(minY, Math.min(maxY, paddle.y))
  }
  
  return {
    ...paddle,
    x: clampedX,
    y: clampedY,
  }
}

