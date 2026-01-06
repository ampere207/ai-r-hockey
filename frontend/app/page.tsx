import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold mb-6">AI Air Hockey</h1>
        <h2 className="text-2xl mb-8 text-blue-200">Human vs AI</h2>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8 text-left">
          <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>
          <ul className="space-y-2 text-blue-100">
            <li>• <strong>Frontend:</strong> Next.js (App Router) + TypeScript + TailwindCSS</li>
            <li>• <strong>Rendering:</strong> HTML5 Canvas</li>
            <li>• <strong>Backend:</strong> FastAPI (Python)</li>
            <li>• <strong>AI:</strong> Rule-based opponent with difficulty levels</li>
          </ul>
        </div>

        <Link
          href="/play"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Play vs AI
        </Link>
      </div>
    </main>
  )
}

