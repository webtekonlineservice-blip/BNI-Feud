import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'B&I Family Feud',
  description: 'B&I networking group Family Feud game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f3d] antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
