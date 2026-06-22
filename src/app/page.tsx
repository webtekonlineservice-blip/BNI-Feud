import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-2">
          <span className="text-bni-red">BNI</span> Family Feud
        </h1>
        <p className="text-lg text-gray-500">Lunch is on the line</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link
          href="/board"
          className="flex items-center gap-3 px-6 py-5 bg-white border-2 border-gray-200 hover:border-bni-red rounded-xl transition group"
        >
          <span className="text-2xl">📺</span>
          <div>
            <div className="font-bold text-black group-hover:text-bni-red transition">Game Board</div>
            <div className="text-xs text-gray-500">Project on big screen</div>
          </div>
        </Link>
        <Link
          href="/host"
          className="flex items-center gap-3 px-6 py-5 bg-white border-2 border-gray-200 hover:border-bni-red rounded-xl transition group"
        >
          <span className="text-2xl">🎤</span>
          <div>
            <div className="font-bold text-black group-hover:text-bni-red transition">Host Panel</div>
            <div className="text-xs text-gray-500">Control the game</div>
          </div>
        </Link>
        <Link
          href="/rules"
          className="flex items-center gap-3 px-6 py-5 bg-white border-2 border-gray-200 hover:border-bni-red rounded-xl transition group"
        >
          <span className="text-2xl">📋</span>
          <div>
            <div className="font-bold text-black group-hover:text-bni-red transition">Rules</div>
            <div className="text-xs text-gray-500">How to play</div>
          </div>
        </Link>
        <div className="flex items-center gap-3 px-6 py-5 bg-gray-50 border-2 border-gray-200 rounded-xl">
          <span className="text-2xl">📱</span>
          <div>
            <div className="font-bold text-black">Players</div>
            <div className="text-xs text-gray-500">Text to join — SMS only</div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400">Players text their name to</p>
        <p className="text-bni-red text-2xl font-bold mt-1">{process.env.NEXT_PUBLIC_TWILIO_PHONE || '+16366892103'}</p>
      </div>
    </div>
  )
}
