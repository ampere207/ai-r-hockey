import Link from 'next/link'

export default function Home() {
  const techStack = [
    { name: 'Next.js', color: 'bg-black text-white', icon: '⚛️' },
    { name: 'FastAPI', color: 'bg-green-600 text-white', icon: '🚀' },
    { name: 'Python', color: 'bg-yellow-500 text-white', icon: '🐍' },
    { name: 'WebSocket', color: 'bg-purple-600 text-white', icon: '🔌' },
    { name: 'Game Canvas', color: 'bg-orange-600 text-white', icon: '🎨' },
    { name: 'Heuristic Rule-based Prediction', color: 'bg-blue-600 text-white', icon: '🧠' },
    { name: 'PyCharm', color: 'bg-emerald-600 text-white', icon: '💻' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            🏒 AI Air Hockey
          </h1>
          <h2 className="text-2xl md:text-3xl mb-2 text-blue-200 font-light">
            Human vs AI
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experience the thrill of air hockey with an intelligent AI opponent powered by heuristic rule-based prediction
          </p>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6 text-blue-200">
            Built With Modern Technology
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className={`${tech.color} px-4 py-2 rounded-lg font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg hover:scale-105 transition-transform duration-200`}
              >
                <span className="text-lg">{tech.icon}</span>
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="text-xl font-semibold mb-2">Smart AI</h4>
            <p className="text-sm text-gray-300">
              Three difficulty levels with heuristic prediction algorithms
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-4xl mb-3">⚡</div>
            <h4 className="text-xl font-semibold mb-2">Real-time</h4>
            <p className="text-sm text-gray-300">
              WebSocket support for ultra-low latency gameplay
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-4xl mb-3">🎮</div>
            <h4 className="text-xl font-semibold mb-2">Smooth Physics</h4>
            <p className="text-sm text-gray-300">
              60 FPS rendering with realistic collision detection
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/play"
          className="inline-block group relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition-all duration-200 shadow-2xl transform group-hover:scale-105">
            <span className="flex items-center gap-2">
              <span>Play vs AI</span>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </Link>

        {/* Footer note */}
        <p className="mt-8 text-sm text-gray-400">
          Powered by Next.js App Router • FastAPI Backend • Real-time WebSocket Communication
        </p>
      </div>
    </main>
  )
}
