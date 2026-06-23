'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import Image from 'next/image'

interface Player { display_name: string; total_score: number }

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerCount, setPlayerCount] = useState(0)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'players'), (snap) => {
      const allPlayers = snap.docs.map(d => d.data() as Player)
      allPlayers.sort((a, b) => b.total_score - a.total_score)
      setPlayers(allPlayers.slice(0, 10))
      setPlayerCount(snap.size)
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6">
      {/* Big centered title */}
      <h1 className="text-6xl md:text-7xl font-black text-center mb-8">
        <span className="text-bni-red">BNI</span> Family Feud
      </h1>

      {/* Two columns: QR left, Instructions right */}
      <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl">
        {/* Left: QR + players */}
        <div className="flex flex-col items-center text-center flex-1">
          <p className="text-gray-600 text-lg mb-4">Scan to join the game!</p>
          <Image
            src="/img/TB-QR.png"
            alt="Scan to register"
            width={220}
            height={220}
            className="rounded-xl shadow-lg mb-4"
            priority
          />
          <div className="mt-2">
            <span className="text-3xl font-black text-bni-red">{playerCount}</span>
            <span className="text-gray-500 ml-2 text-lg">players ready</span>
          </div>
          {players.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mt-3 max-w-xs">
              {players.map((p, i) => (
                <span key={i} className="bg-gray-100 text-black text-xs px-2 py-0.5 rounded-full border border-gray-200">{p.display_name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: How to Play */}
        <div className="flex-1 max-w-sm">
          <h3 className="font-bold text-lg mb-4">How to Play</h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span className="bg-bni-red text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <span>Scan the QR code and register with your name + phone</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-bni-red text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <span>Watch the big screen for each question</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-bni-red text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <span>Text your answer to the game number</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-bni-red text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
              <span>If it matches the board — you score points!</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-5">One guess per round. Top scorer wins lunch!</p>
        </div>
      </div>
    </div>
  )
}
