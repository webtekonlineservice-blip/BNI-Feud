'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/play', label: 'Play', icon: '🎮' },
  { href: '/rules', label: 'Rules', icon: '📋' },
  { href: '/host', label: 'Host', icon: '🎤' },
  { href: '/board', label: 'Board', icon: '📺' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a2e]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">⭐</span>
          <span className="text-lg font-bold text-yellow-400 group-hover:text-yellow-300 transition">
            B&I Feud
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-yellow-400'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
