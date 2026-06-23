import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'BNI Family Feud',
  description: 'Think Big St. Louis — BNI Family Feud game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-16 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
