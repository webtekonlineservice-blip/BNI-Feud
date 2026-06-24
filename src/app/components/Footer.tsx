import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-4 border-t border-gray-200 flex items-center justify-between px-6">
      <p className="text-sm text-gray-500">
        Built by{' '}
        <a href="https://webtek.ai/" target="_blank" rel="noopener noreferrer" className="text-bni-red font-medium hover:underline">
          Webtek
        </a>
      </p>
      <Link href="/admin" className="text-xs text-gray-300 hover:text-bni-red transition">
        Login
      </Link>
    </footer>
  )
}
