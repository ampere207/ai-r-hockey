# AI Air Hockey Game

A production-quality air hockey game featuring human vs AI gameplay, built with Next.js (App Router) frontend and FastAPI backend.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) + TypeScript + TailwindCSS
- **Rendering**: HTML5 Canvas
- **Backend**: FastAPI (Python)
- **AI**: Rule-based opponent with difficulty levels (Easy/Medium/Hard)
- **Package Managers**: pnpm (frontend), uv (backend)

## Project Structure

```
.
├── frontend/          # Next.js application
│   ├── app/          # App Router pages and layouts
│   ├── components/   # React components (GamePage, GameCanvas, HUD, etc.)
│   ├── game/         # Game logic (physics, state, rendering, AI client)
│   └── package.json
├── backend/          # FastAPI application
│   ├── main.py       # FastAPI app entry point
│   ├── routers/      # API routes (AI endpoints)
│   ├── models/       # AI logic (rule-based and model-based stub)
│   ├── schemas.py    # Pydantic models
│   └── pyproject.toml
└── README.md
```

## Prerequisites

- **Node.js** 18+ and **pnpm** (for frontend)
- **Python** 3.10+ and **uv** (for backend)

### Installing uv (Python package manager)

```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## Installation

### Frontend Setup

```bash
cd frontend
pnpm install
```

### Backend Setup

```bash
cd backend
# Option 1: Install dependencies only (recommended)
uv pip install -r requirements.txt

# Option 2: Use uv sync (if package structure is fixed)
uv sync

# Note: If you see a hardlink warning, it's harmless - uv will use file copies instead
```

## Running the Application

### Option 1: Using npm scripts (recommended)

From the project root:

```bash
# Terminal 1: Start backend
cd backend
uv run uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
pnpm dev
```

### Option 2: Using Make (if available)

```bash
make dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## How to Play

1. Navigate to http://localhost:3000
2. Click "Play vs AI" on the landing page
3. Click the canvas to start the game
4. Move your mouse (or touch on mobile) to control your paddle (bottom)
5. Score by getting the puck past the AI's goal (top)

## Game Features

- **Difficulty Levels**: Easy, Medium, Hard
- **AI Modes**: Rule-based (default) or Model-based (stub for future ML integration)
- **Communication**: HTTP polling (default) or WebSocket for real-time updates
- **Debug Mode**: Visualize AI target predictions and direction arrows
- **Responsive Design**: Works on desktop and mobile browsers
- **Graceful Fallback**: If backend is unavailable, game uses client-side AI

## Architecture Overview

### Frontend Architecture

- **Game Loop**: Uses `requestAnimationFrame` for 60 FPS rendering
- **Physics Engine**: Deterministic physics with friction, collisions, and goal detection
- **State Management**: Centralized game state with React hooks
- **AI Integration**: Separate timer for AI updates (50-100ms) with interpolation for smooth movement
- **Input Handling**: Mouse and touch support for paddle control

### Backend Architecture

- **API Endpoints**:
  - `POST /ai/move` - HTTP endpoint for AI move computation
  - `WebSocket /ws/ai` - Real-time bidirectional communication
- **AI Logic**:
  - **Rule-based**: Predicts puck trajectory and intercepts with difficulty modifiers
  - **Model-based stub**: Structured for easy ML model integration

### AI Implementation

The rule-based AI:
1. Predicts where the puck will cross the AI's defending line (top of table)
2. Accounts for difficulty (speed multiplier, noise, reaction delay)
3. Clamps to table bounds and max paddle speed

Difficulty levels:
- **Easy**: 60% speed, ±30px noise, 100ms delay
- **Medium**: 85% speed, ±10px noise, 50ms delay
- **Hard**: 100% speed, ±2px noise, 0ms delay

## Development

### Frontend Development

```bash
cd frontend
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Backend Development

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

### Environment Variables

Create `frontend/.env.local` (if it doesn't exist):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Note**: The `.env.local` file is gitignored. Create it manually if needed.

## Future Enhancements

- [ ] Implement actual ML model for model-based AI mode
- [ ] Add game timer with configurable duration
- [ ] Implement power-ups or special moves
- [ ] Add sound effects and background music
- [ ] Multiplayer support (human vs human)
- [ ] Tournament mode with AI difficulty progression

## License

MIT

