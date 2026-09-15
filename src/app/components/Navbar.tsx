'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/img/Logo.png"
            alt="Webtek"
            width={120}
            height={36}
            className="h-9 w-auto transition-all duration-300 hover:scale-110 hover:brightness-125 hover:drop-shadow-lg"
          />
          <span className="inline-block bg-gray-700 text-gray-300 text-[10px] font-normal px-2 py-0.5 rounded uppercase tracking-wide">
            Beta
          </span>
        </Link>
      </div>
    </nav>
  )
}
