import { GameState, PuckState, PaddleState, Vector2 } from './types'

export interface CollisionResult {
  collided: boolean
  newVx?: number
  newVy?: number
}

const PUCK_FRICTION = 0.99 // Reduced friction by 50% (was 0.98, now loses 1% instead of 2% per frame)
const WALL_BOUNCE_DAMPING = 0.95
const PADDLE_BOUNCE_MULTIPLIER = 2.2 // Increased significantly for much faster puck on paddle hits
const MIN_PUCK_VELOCITY = 50 // Increased minimum velocity for better gameplay
const PADDLE_VELOCITY_TRANSFER = 1.3 // Increased velocity transfer - harder hits = much faster puck
const MAX_PUCK_VELOCITY = 1000 // Increased max velocity for even more exciting gameplay
const COLLISION_PENETRATION_TOLERANCE = 0.5 // Small tolerance to prevent penetration

export function updatePuckPosition(
  puck: PuckState,
  deltaTime: number
): PuckState {
  // Apply friction
  const friction = PUCK_FRICTION
  const newVx = puck.vx * friction
  const newVy = puck.vy * friction

  // Stop very slow movement (increased threshold for smoother gameplay)
  const minVelocity = 1.0
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
  const puckRadius = puck.radius
  const paddleRadius = paddle.radius
  
  // Circle-circle collision detection with penetration prevention
  const dx = puck.x - paddle.x
  const dy = puck.y - paddle.y
  const distanceSquared = dx * dx + dy * dy
  const minDistance = puckRadius + paddleRadius
  const collisionDistance = minDistance - COLLISION_PENETRATION_TOLERANCE
  
  // Check if circles are overlapping (with tolerance to prevent penetration)
  if (distanceSquared < collisionDistance * collisionDistance) {
    const distance = Math.sqrt(distanceSquared)
    
    // Calculate collision normal (from paddle center to puck center)
    let normalX: number
    let normalY: number
    
    if (distance > 0.001) {
      // Normal from paddle center to puck center (for circle-circle collision)
      normalX = dx / distance
      normalY = dy / distance
    } else {
      // If circles are exactly overlapping, use fallback direction
      normalX = 0
      normalY = isAi ? -1 : 1 // Push away from paddle
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
      
      // Add paddle velocity transfer (scales with paddle speed for harder hits)
      const paddleSpeed = Math.sqrt(paddleVx * paddleVx + paddleVy * paddleVy)
      const speedMultiplier = 1 + (paddleSpeed / 600) * 1.2 // Even stronger scaling for maximum sensitivity
      newVx += paddleVx * PADDLE_VELOCITY_TRANSFER * speedMultiplier
      newVy += paddleVy * PADDLE_VELOCITY_TRANSFER * speedMultiplier
      
      // Add extra boost based on collision angle (more realistic physics)
      const impactForce = Math.abs(dotProduct) * 1.5 // Increased impact force
      newVx += normalX * impactForce * 70 // Increased boost
      newVy += normalY * impactForce * 70 // Increased boost
      
      // Ensure minimum velocity
      let velocityMagnitude = Math.sqrt(newVx * newVx + newVy * newVy)
      if (velocityMagnitude < MIN_PUCK_VELOCITY) {
        const scale = MIN_PUCK_VELOCITY / velocityMagnitude
        newVx *= scale
        newVy *= scale
        velocityMagnitude = MIN_PUCK_VELOCITY
      }
      
      // Cap maximum velocity for safety
      if (velocityMagnitude > MAX_PUCK_VELOCITY) {
        const scale = MAX_PUCK_VELOCITY / velocityMagnitude
        newVx *= scale
        newVy *= scale
      }
      
      // AI hits slightly harder (but not too much)
      if (isAi) {
        const aiBoost = 1.15  // Slightly increased for better gameplay
        newVx *= aiBoost
        newVy *= aiBoost
      }
      
      // Separation is handled in GameCanvas component
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
  goalWidth: number = 234  // Goal width increased by 2X (117 * 2 = 234)
): 'human' | 'ai' | null {
  const goalCenterX = tableWidth / 2
  const goalLeft = goalCenterX - goalWidth / 2
  const goalRight = goalCenterX + goalWidth / 2

  // AI scores (puck goes past human's goal line at bottom)
  // Check if puck has crossed the bottom edge AND is within goal width
  if (puck.y + puck.radius >= tableHeight - 1) {  // -1 for tolerance
    // Check if puck center or any part of puck is within goal area
    if (puck.x >= goalLeft - puck.radius && puck.x <= goalRight + puck.radius) {
      return 'ai'
    }
  }

  // Human scores (puck goes past AI's goal line at top)
  // Check if puck has crossed the top edge AND is within goal width
  if (puck.y - puck.radius <= 1) {  // +1 for tolerance
    // Check if puck center or any part of puck is within goal area
    if (puck.x >= goalLeft - puck.radius && puck.x <= goalRight + puck.radius) {
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
  const radius = paddle.radius
  
  // Clamp X position (same for both paddles)
  const clampedX = Math.max(radius, Math.min(tableWidth - radius, paddle.x))
  
  // Clamp Y position based on which player
  let clampedY: number
  if (isHuman) {
    // Human paddle: restricted to bottom half of table (their court)
    const centerLine = tableHeight / 2
    const minY = centerLine + radius // Can't cross center line
    const maxY = tableHeight - radius // Can't go below table
    clampedY = Math.max(minY, Math.min(maxY, paddle.y))
  } else {
    // AI paddle: restricted to top half of table (their court)
    const centerLine = tableHeight / 2
    const minY = radius // Can't go above table
    const maxY = centerLine - radius // Can't cross center line
    clampedY = Math.max(minY, Math.min(maxY, paddle.y))
  }
  
  return {
    ...paddle,
    x: clampedX,
    y: clampedY,
  }
}

