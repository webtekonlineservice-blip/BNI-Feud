'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks: { href: string; label: string }[] = []

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bni-red shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-white text-2xl font-black tracking-tight transition-transform duration-300 group-hover:scale-110 animate-[pulse_2s_ease-in-out_1]">BNI</span>
          <span className="text-white/80 text-sm font-medium">Think Big</span>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-bni-red'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
