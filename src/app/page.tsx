import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
      <h1 className="text-5xl font-bold mb-4 text-yellow-400">B&I Family Feud</h1>
      <p className="text-xl mb-10 text-gray-300">Choose your role to get started</p>
      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          href="/play"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-semibold transition"
        >
          Play (SMS)
        </Link>
        <Link
          href="/host"
          className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl text-xl font-semibold transition"
        >
          Host Control
        </Link>
        <Link
          href="/board"
          className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-xl font-semibold transition"
        >
          Game Board
        </Link>
      </div>
    </div>
  )
}
