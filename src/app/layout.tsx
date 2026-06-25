import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'BNI Family Feud',
  description: 'Think Big St. Louis — Play BNI Family Feud! Scan, text your answers, and win lunch.',
  metadataBase: new URL('https://bni-feud.vercel.app'),
  openGraph: {
    title: 'BNI Family Feud',
    description: 'Think Big St. Louis — Scan, text your answers, and win lunch!',
    url: 'https://bni-feud.vercel.app',
    siteName: 'BNI Family Feud',
    images: [
      {
        url: '/img/og-share.png',
        width: 1200,
        height: 630,
        alt: 'BNI Family Feud — Think Big St. Louis',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BNI Family Feud',
    description: 'Think Big St. Louis — Scan, text your answers, and win lunch!',
    images: ['/img/og-share.png'],
  },
  icons: {
    icon: '/img/favicon.svg',
    apple: '/img/apple-icon.png',
  },
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
