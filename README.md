# 🏒 AI Air Hockey Game

A production-quality, real-time air hockey game featuring human vs AI gameplay. Built with modern web technologies for smooth 60 FPS gameplay, realistic physics, and intelligent AI opponents powered by **heuristic rule-based prediction**.

![Game Preview](https://img.shields.io/badge/Status-Production%20Ready-success) ![Next.js](https://img.shields.io/badge/Next.js-14+-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![Python](https://img.shields.io/badge/Python-3.10+-yellow) ![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-purple)

## 🎮 What It Does

This is a fully playable 2D air hockey game where you compete against an AI opponent powered by **heuristic rule-based prediction algorithms**. The game features:

- **Realistic Physics**: Smooth puck movement with friction, collisions, and velocity transfer
- **Intelligent AI**: Rule-based opponent with three difficulty levels (Easy, Medium, Hard)
- **Heuristic Prediction**: AI predicts puck trajectories and intercepts with smart positioning
- **Responsive Controls**: Mouse and touch support for paddle control
- **Real-time Communication**: HTTP polling or WebSocket for ultra-low latency AI updates
- **Visual Feedback**: Goal celebrations, score tracking, and debug overlays
- **Cross-platform**: Works on desktop and mobile browsers
- **Modern UI**: Beautiful landing page with animated backgrounds and tech stack showcase

## ✨ Key Features

### Gameplay
- **Circular Paddles**: Allows angled shots for strategic gameplay
- **Dynamic Physics**: Puck speed scales with paddle hit force
- **Large Goals**: 234px wide goals for exciting scoring opportunities
- **Smooth Movement**: 60 FPS rendering with `requestAnimationFrame`
- **Goal Detection**: Accurate collision detection with visual goal posts

### AI Opponent
- **Heuristic Rule-based Prediction**: Advanced algorithm that predicts puck trajectories and calculates optimal intercept points
- **Three Difficulty Levels**:
  - **Easy**: 40% speed, large errors (±50px), 0.2s delay - Perfect for beginners
  - **Medium**: 70% speed, moderate errors (±20px), 0.1s delay - Balanced challenge
  - **Hard**: 100% speed, minimal errors (±5px), instant reactions - Maximum challenge
- **Smart Behavior**: 
  - Actively hits idle pucks in AI's court
  - Predicts puck trajectory using physics calculations
  - Adapts positioning based on game state
  - Accounts for difficulty modifiers (speed, noise, delay)
- **Human-like Variation**: Random errors and reaction delays for realistic gameplay

### Settings & Options
- **AI Mode**: Rule-based (current) or Model-based (stub for future ML)
- **Communication**: HTTP polling (default) or WebSocket (lower latency)
- **Debug Mode**: Visualize AI target predictions and movement arrows
- **Restart**: Reset game state at any time

## 🛠️ Tech Stack

### Frontend
- **⚛️ Next.js 14+** - React framework with App Router
- **🎨 Game Canvas** - HTML5 Canvas for smooth 60 FPS rendering
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **🚀 FastAPI** - Modern Python web framework
- **🐍 Python 3.10+** - Backend programming language
- **🔌 WebSocket** - Real-time bidirectional communication
- **Pydantic** - Data validation and settings management

### AI & Development
- **🧠 Heuristic Rule-based Prediction** - AI algorithm for opponent behavior
- **💻 PyCharm** - Python IDE for backend development
- **Package Managers**:
  - `pnpm` (frontend)
  - `uv` (backend)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **pnpm**
  ```bash
  # Install pnpm if you don't have it
  npm install -g pnpm
  ```

- **Python** 3.10+ and **uv** (Python package manager)
  ```bash
  # On macOS/Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # On Windows (PowerShell)
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

  # Verify installation
  uv --version
  ```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-r-hockey
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
pnpm install
```

**Backend:**
```bash
cd backend
uv pip install -r requirements.txt
```

> **Note**: If you see a hardlink warning on Windows, it's harmless - `uv` will use file copies instead.

### 3. Configure Environment Variables

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Run the Application

You'll need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

### 5. Play!

Open your browser and navigate to:
- **Game**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (FastAPI Swagger UI)

## 🎯 How to Play

1. **Start the Game**: Click "Play vs AI" on the landing page
2. **Begin Play**: Click the canvas to start the game
3. **Control Your Paddle**: Move your mouse (or touch on mobile) to control the bottom paddle
4. **Score Goals**: Get the puck past the AI's goal (top) to score
5. **Adjust Settings**: Use the settings panel to change difficulty, AI mode, or enable debug mode

### Controls

- **Mouse**: Move mouse to control paddle position
- **Touch**: Touch and drag on mobile/tablet devices
- **Settings**: Adjust difficulty, AI mode, WebSocket, and debug options

## 📁 Project Structure

```
ai-r-hockey/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── page.tsx        # Landing page
│   │   └── play/           # Game page
│   ├── components/         # React components
│   │   ├── GameCanvas.tsx  # Main game canvas & loop
│   │   ├── GamePage.tsx    # Game orchestration
│   │   ├── HUD.tsx         # Score & game info display
│   │   └── SettingsPanel.tsx # Settings UI
│   ├── game/               # Game logic
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── physics.ts      # Collision & movement physics
│   │   ├── state.ts        # Game state management
│   │   ├── render.ts       # Canvas rendering functions
│   │   └── aiClient.ts     # Backend AI communication
│   └── package.json
├── backend/                # FastAPI application
│   ├── main.py            # FastAPI app entry point
│   ├── schemas.py         # Pydantic models
│   ├── routers/           # API routes
│   │   └── ai.py          # AI endpoints (HTTP & WebSocket)
│   ├── models/            # AI logic
│   │   └── ai.py          # Rule-based & model-based AI
│   ├── requirements.txt   # Python dependencies
│   └── pyproject.toml     # Python project config
└── README.md
```

## ⚙️ Configuration Options

### Difficulty Levels

| Level | Speed | Noise | Delay | Best For |
|-------|-------|-------|-------|----------|
| **Easy** | 40% | ±50px | 0.2s | Beginners, learning |
| **Medium** | 70% | ±20px | 0.1s | Balanced gameplay |
| **Hard** | 100% | ±5px | 0s | Maximum challenge |

### AI Modes

- **Rule-based** (Default): Uses prediction algorithms and difficulty modifiers
- **Model-based** (Stub): Currently calls rule-based AI; structured for future ML integration

### Communication Methods

- **HTTP Polling** (Default): Simple, reliable, sends requests every 50ms
- **🔌 WebSocket**: Lower latency, more efficient, real-time bidirectional communication for smoother gameplay

### Debug Mode

When enabled, shows:
- Yellow circle: AI's target position
- Yellow dashed line: AI's intended movement direction

Useful for understanding AI behavior and learning game mechanics.

## 🏗️ Architecture

### Frontend Architecture

- **Game Loop**: `requestAnimationFrame` for 60 FPS rendering
- **Physics Engine**: Deterministic physics with:
  - Friction (0.99 per frame)
  - Wall collisions with damping
  - Circle-circle paddle collisions
  - Velocity transfer from paddle movement
- **State Management**: Centralized game state with React hooks
- **AI Integration**: Separate timer (50ms) for AI updates with interpolation
- **Input Handling**: Mouse and touch support with smooth interpolation

### Backend Architecture

- **API Endpoints**:
  - `POST /ai/move` - HTTP endpoint for AI move computation
  - `WebSocket /ws/ai` - Real-time bidirectional communication
  - `GET /health` - Health check endpoint
- **AI Logic**:
  - **Rule-based**: Predicts puck trajectory, intercepts with difficulty modifiers
  - **Model-based stub**: Structured for easy ML model integration

### AI Implementation Details

The **heuristic rule-based prediction** AI uses the following algorithm:

1. **Court Detection**: Detects if puck is idle in AI's court and actively hits it
2. **Trajectory Prediction**: Predicts where puck will cross AI's defending line using physics calculations
3. **Intercept Calculation**: Calculates optimal intercept point based on puck velocity and position
4. **Difficulty Application**: Applies difficulty modifiers:
   - Speed multiplier (40-100% based on difficulty)
   - Random noise (±5px to ±50px)
   - Reaction delay (0-200ms)
5. **Boundary Clamping**: Ensures paddle stays within table bounds and respects speed limits
6. **Human-like Behavior**: Adds random variations for more realistic gameplay

The AI is implemented in `backend/models/ai.py` using Python, with a client-side fallback in `frontend/game/aiClient.ts` for offline play.

## 🔧 Development

### Frontend Development

```bash
cd frontend
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Backend Development

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

The backend will auto-reload on file changes.

### API Testing

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

## 🐛 Troubleshooting

### Backend won't start

- **Port 8000 already in use**: Change port in `uvicorn` command or kill the process using port 8000
- **Python version**: Ensure Python 3.10+ is installed (`python --version`)
- **Dependencies**: Reinstall with `uv pip install -r requirements.txt`

### Frontend won't start

- **Port 3000 already in use**: Change port or kill the process
- **Node version**: Ensure Node.js 18+ is installed (`node --version`)
- **Dependencies**: Reinstall with `pnpm install`

### AI not responding

- **Backend not running**: Ensure backend is running on port 8000
- **CORS errors**: Check that `NEXT_PUBLIC_API_BASE_URL` in `.env.local` matches backend URL
- **Fallback**: Game will use client-side AI if backend is unavailable (check browser console)

### Game feels laggy

- **Enable WebSocket**: Check "Use WebSocket" in settings for lower latency
- **Close other tabs**: Free up browser resources
- **Check FPS**: Open browser dev tools to check frame rate

### Puck goes through paddle

- This should be fixed, but if it happens:
  - Refresh the page
  - Check browser console for errors
  - Ensure you're using the latest code

## 📝 Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Note**: `.env.local` is gitignored. Create it manually if it doesn't exist.

## 🚀 Production Deployment

### Frontend

```bash
cd frontend
pnpm build
pnpm start
```

### Backend

```bash
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

Update `NEXT_PUBLIC_API_BASE_URL` to point to your production backend URL.

## 🎨 UI/UX Features

- **Modern Landing Page**: 
  - Animated gradient background with floating blobs
  - Tech stack badges showcasing all technologies
  - Glassmorphism effects with backdrop blur
  - Responsive design for all screen sizes
- **Game Interface**:
  - Clean HUD with scores and game info
  - Settings panel with easy-to-use controls
  - Debug overlay for AI visualization
  - Smooth animations and transitions

## 🔮 Future Enhancements

- [ ] Implement actual ML model for model-based AI mode
- [ ] Add game timer with configurable duration
- [ ] Implement power-ups or special moves
- [ ] Add sound effects and background music
- [ ] Multiplayer support (human vs human)
- [ ] Tournament mode with AI difficulty progression
- [ ] Leaderboard and statistics tracking
- [ ] Replay system
- [ ] Enhanced AI with machine learning models

## 📄 License

MIT License - feel free to use this project for learning or as a base for your own games!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review the code comments
3. Check browser console for errors
4. Verify backend logs for API issues

---

**Enjoy playing AI Air Hockey! 🏒**
