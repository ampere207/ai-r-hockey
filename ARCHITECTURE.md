# 🏗️ System Architecture

## Overview

AI Air Hockey is a full-stack real-time game application with a Next.js frontend and FastAPI backend. The system uses heuristic rule-based prediction for AI decision-making and supports both HTTP polling and WebSocket communication.

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Client Browser                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React)                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐   │  │
│  │  │   Pages      │  │ Components   │  │   Game    │   │  │
│  │  │  (App Router)│  │  (React)     │  │  Logic    │   │  │
│  │  └──────────────┘  └──────────────┘  └───────────┘   │  │
│  │         │                 │                │         │  │
│  │         └─────────────────┼────────────────┘         │  │
│  │                          │                           │  │
│  │                   ┌───────▼────────┐                 │  │
│  │                   │  HTML5 Canvas  │                 │  │
│  │                   │  (Game Render) │                 │  │
│  │                   └───────┬────────┘                 │  │
│  └───────────────────────────┼──────────────────────────┘  │
│                              │                              │
│                    ┌─────────▼─────────┐                    │
│                    │   AI Client       │                    │
│                    │  (HTTP/WebSocket) │                    │
│                    └─────────┬─────────┘                    │
└──────────────────────────────┼──────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Network Layer     │
                    │  HTTP/WebSocket    │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer (Routers)                     │  │
│  │  ┌──────────────┐         ┌──────────────┐           │  │
│  │  │ POST /ai/move│         │ WS /ws/ai    │           │  │
│  │  └──────┬───────┘         └──────┬───────┘           │  │
│  └─────────┼─────────────────────────┼──────────────────┘ │
│            │                         │                   │
│  ┌─────────▼─────────────────────────▼────────┐          │
│  │         AI Logic Layer (models/ai.py)      │          │
│  │  ┌──────────────────────────────────────┐  │          │
│  │  │   Rule-based AI (Heuristic)          │  │          │
│  │  │   - Trajectory Prediction            │  │          │
│  │  │   - Difficulty Modifiers             │  │          │
│  │  │   - Intercept Calculation            │  │          │
│  │  └──────────────────────────────────────┘  │          │
│  │  ┌──────────────────────────────────────┐  │          │
│  │  │   Model-based AI (Stub)              │  │          │
│  │  │   - Ready for ML integration         │  │          │
│  │  └──────────────────────────────────────┘  │          │
│  └────────────────────────────────────────────┘          │
│                                                          │
│  ┌──────────────────────────────────────────┐            │
│  │      Data Validation (Pydantic)          │            │
│  │      - GameState schema                  │            │
│  │      - AiResponse schema                 │            │
│  └──────────────────────────────────────────┘             │
└───────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App (Root Layout)
├── page.tsx (Landing Page)
│   └── Tech stack showcase, CTA button
│
└── play/page.tsx (Game Page)
    └── GamePage Component
        ├── HUD Component
        │   └── Score display, game info
        │
        ├── GameCanvas Component (Client Component)
        │   ├── Canvas rendering
        │   ├── Game loop (requestAnimationFrame)
        │   ├── Input handling (mouse/touch)
        │   └── Physics updates
        │
        └── SettingsPanel Component
            ├── Difficulty selector
            ├── AI mode toggle
            ├── WebSocket toggle
            └── Debug toggle
```

### Game Logic Modules (`frontend/game/`)

```
game/
├── types.ts          # TypeScript interfaces & types
│   ├── Vector2
│   ├── PuckState
│   ├── PaddleState
│   ├── GameState
│   └── DTOs (AiRequestPayload, AiResponsePayload)
│
├── physics.ts        # Physics engine
│   ├── updatePuckPosition()      # Friction & movement
│   ├── checkWallCollision()      # Wall bounces
│   ├── checkPaddleCollision()    # Paddle hits
│   ├── checkGoal()               # Goal detection
│   └── clampPaddleToBounds()     # Boundary enforcement
│
├── state.ts          # State management
│   ├── createInitialState()      # Game initialization
│   ├── resetGameState()          # Reset logic
│   ├── updateScore()             # Score tracking
│   └── updateDifficulty()        # Difficulty changes
│
├── render.ts         # Canvas rendering
│   ├── renderTable()             # Table & goals
│   ├── renderPuck()              # Puck rendering
│   ├── renderPaddle()            # Paddle rendering
│   ├── renderDebugOverlay()      # Debug visualization
│   └── renderGoalCelebration()   # Goal animations
│
└── aiClient.ts       # Backend communication
    ├── requestAiMoveHttp()      # HTTP polling
    ├── connectAiWebSocket()     # WebSocket setup
    ├── sendWebSocketState()     # WebSocket send
    ├── clientSideAi()           # Fallback AI
    └── isBackendAvailable()     # Health check
```

### Frontend Data Flow

```
User Input (Mouse/Touch)
    │
    ▼
GameCanvas Component
    │
    ├─► Update Human Paddle Position
    │       │
    │       └─► GameState.humanPaddle
    │
    ├─► Game Loop (60 FPS)
    │       │
    │       ├─► Physics Engine
    │       │   ├─► Update Puck Position
    │       │   ├─► Check Collisions
    │       │   └─► Check Goals
    │       │
    │       └─► Render Engine
    │           ├─► Clear Canvas
    │           ├─► Render Table
    │           ├─► Render Puck
    │           └─► Render Paddles
    │
    └─► AI Update Timer (50ms)
            │
            ├─► HTTP: POST /ai/move
            │   └─► Backend AI Logic
            │       └─► Update AI Paddle Target
            │
            └─► WebSocket: Send State
                └─► Receive AI Target
                    └─► Update AI Paddle Position
```

## Backend Architecture

### API Layer (`backend/routers/`)

```
routers/
└── ai.py
    ├── POST /ai/move
    │   ├── Accepts: GameState (Pydantic model)
    │   ├── Validates: Request payload
    │   ├── Calls: compute_ai_move()
    │   └── Returns: AiResponse {target_x, target_y}
    │
    └── WebSocket /ws/ai
        ├── Accepts: JSON GameState messages
        ├── Validates: Each message
        ├── Calls: compute_ai_move()
        └── Sends: JSON AiResponse messages
```

### AI Logic Layer (`backend/models/`)

```
models/
└── ai.py
    ├── rule_based_ai(state: GameState) -> Tuple[float, float]
    │   ├── Court Detection
    │   ├── Trajectory Prediction
    │   ├── Intercept Calculation
    │   ├── Difficulty Application
    │   └── Boundary Clamping
    │
    ├── model_based_ai(state: GameState) -> Tuple[float, float]
    │   └── Stub (currently calls rule_based_ai)
    │
    └── compute_ai_move(state: GameState) -> AiResponse
        └── Routes to rule_based_ai or model_based_ai
```

### Data Models (`backend/schemas.py`)

```python
Pydantic Models:
├── Vector2
│   ├── x: float
│   └── y: float
│
├── PuckState
│   ├── x, y: float (position)
│   ├── vx, vy: float (velocity)
│   └── radius: float
│
├── PaddleState
│   ├── x, y: float (position)
│   └── radius: float
│
├── GameState
│   ├── puck: PuckState
│   ├── human_paddle: PaddleState
│   ├── ai_paddle: PaddleState
│   ├── table_width, table_height: float
│   ├── difficulty: Literal["easy", "medium", "hard"]
│   └── ai_mode: Literal["rule_based", "model_based"]
│
└── AiResponse
    ├── target_x: float
    └── target_y: float
```

## Communication Patterns

### HTTP Polling (Default)

```
Frontend                          Backend
   │                                │
   │  POST /ai/move                 │
   │  {GameState}                   │
   ├───────────────────────────────►│
   │                                │
   │                                │  compute_ai_move()
   │                                │  └─► rule_based_ai()
   │                                │
   │  {target_x, target_y}          │
   │◄───────────────────────────────┤
   │                                │
   │  (Repeat every 50ms)           │
   │                                │
```

### WebSocket (Real-time)

```
Frontend                          Backend
   │                                │
   │  WS Connection                 │
   ├───────────────────────────────►│
   │                                │
   │  {GameState} (JSON)            │
   ├───────────────────────────────►│
   │                                │
   │                                │  compute_ai_move()
   │                                │  └─► rule_based_ai()
   │                                │
   │  {target_x, target_y} (JSON)   │
   │◄───────────────────────────────┤
   │                                │
   │  (Continuous bidirectional)    │
   │                                │
```

## Game Loop Architecture

### Frontend Game Loop (60 FPS)

```
requestAnimationFrame Loop:
├── Calculate deltaTime
├── Update Human Paddle (follow mouse/touch)
├── Update AI Paddle (interpolate to target)
├── Update Puck Physics
│   ├── Apply friction
│   ├── Update position
│   └── Check collisions
│       ├── Wall collisions
│       ├── Human paddle collision
│       └── AI paddle collision
├── Check for goals
├── Render everything
└── Update state
```

### AI Update Cycle (50ms)

```
setInterval (50ms):
├── Get current GameState
├── Send to backend (HTTP or WebSocket)
├── Receive AI target {target_x, target_y}
└── Store target for interpolation
```

## State Management

### GameState Structure

```typescript
GameState {
  puck: {
    x, y: number          // Position
    vx, vy: number        // Velocity
    radius: number        // Size
  }
  humanPaddle: {
    x, y: number          // Position
    radius: number        // Size
  }
  aiPaddle: {
    x, y: number          // Position
    radius: number        // Size
  }
  tableWidth: number      // Table dimensions
  tableHeight: number
  humanScore: number      // Scores
  aiScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  aiMode: 'rule_based' | 'model_based'
  isPaused: boolean
  gameStarted: boolean
  timeLimit?: number      // Optional timer
  timeRemaining?: number
}
```

### State Flow

```
Initial State
    │
    ├─► User Starts Game
    │       │
    │       └─► gameStarted = true
    │
    ├─► Game Loop Updates
    │       │
    │       ├─► Physics updates positions
    │       ├─► Collisions update velocities
    │       └─► Goals update scores
    │
    └─► User Changes Settings
            │
            ├─► Difficulty change
            ├─► AI mode change
            └─► WebSocket toggle
```

## AI Decision-Making Process

### Rule-based AI Algorithm

```
1. Input: GameState
   │
2. Detect Game Situation
   ├─► Puck in AI's court?
   ├─► Puck idle?
   ├─► Puck moving towards AI?
   └─► Puck moving away?
   │
3. Calculate Target Position
   ├─► If idle in court: Hit puck actively
   ├─► If moving towards: Predict intercept
   └─► If moving away: Defensive position
   │
4. Apply Difficulty Modifiers
   ├─► Speed multiplier (25-100%)
   ├─► Add noise (±5px to ±80px)
   ├─► Add human variation
   ├─► Apply reaction delay (0-300ms)
   └─► Random miss chance (0-50%)
   │
5. Clamp to Boundaries
   └─► Ensure paddle stays in court
   │
6. Output: {target_x, target_y}
```

## Error Handling & Fallbacks

### Backend Unavailable

```
Backend Request Fails
    │
    ├─► HTTP Error
    │   └─► Fallback to clientSideAi()
    │
    ├─► WebSocket Error
    │   └─► Fallback to HTTP polling
    │       └─► If HTTP fails → clientSideAi()
    │
    └─► Game Continues
        └─► User sees warning (optional)
```

### Client-Side AI Fallback

```
clientSideAi() implements:
├─► Simplified rule-based logic
├─► Same difficulty modifiers
├─► Basic trajectory prediction
└─► Ensures game remains playable
```

## Performance Considerations

### Frontend Optimization

- **60 FPS Game Loop**: Uses `requestAnimationFrame` for smooth rendering
- **Separate AI Timer**: AI updates at 50ms (20 Hz) to reduce network load
- **Interpolation**: Smooth AI paddle movement between updates
- **Canvas Optimization**: Single canvas context, efficient rendering
- **State Management**: Refs for mutable values to avoid re-renders

### Backend Optimization

- **Fast AI Computation**: Rule-based AI completes in <10ms
- **Pydantic Validation**: Fast request validation
- **WebSocket Efficiency**: Persistent connection reduces overhead
- **CORS Configuration**: Pre-configured for frontend origin

## Security Considerations

- **CORS**: Configured for specific frontend origins
- **Input Validation**: Pydantic models validate all inputs
- **No Authentication**: Simple game, no user data stored
- **Client-Side Fallback**: Game works offline (no backend dependency)

## Scalability

### Current Architecture

- **Single Instance**: Designed for local/single-server deployment
- **Stateless Backend**: Each request is independent
- **No Database**: No persistent storage needed

### Future Scalability Options

- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Redis**: For WebSocket connection management
- **Database**: For leaderboards, statistics (if needed)
- **CDN**: For frontend static assets

## Technology Stack Summary

```
Frontend:
├── Framework: Next.js 14+ (App Router)
├── Language: TypeScript
├── Styling: TailwindCSS
├── Rendering: HTML5 Canvas
└── State: React Hooks + Refs

Backend:
├── Framework: FastAPI
├── Language: Python 3.10+
├── Validation: Pydantic
├── Server: Uvicorn
└── Communication: HTTP + WebSocket

AI:
├── Algorithm: Heuristic Rule-based Prediction
├── Implementation: Python
└── Future: ML Model Integration (stub ready)
```

## Deployment Architecture

```
Production Deployment:
├── Frontend
│   ├── Build: `pnpm build`
│   ├── Host: Vercel / Netlify / Static Host
│   └── Environment: NEXT_PUBLIC_API_BASE_URL
│
└── Backend
    ├── Server: Uvicorn / Gunicorn
    ├── Host: AWS / GCP / Azure / Railway
    └── Port: 8000 (configurable)
```

---

This architecture supports:
- ✅ Real-time gameplay
- ✅ Scalable AI computation
- ✅ Graceful degradation (client-side fallback)
- ✅ Modern web standards
- ✅ Easy deployment
- ✅ Future ML integration ready

