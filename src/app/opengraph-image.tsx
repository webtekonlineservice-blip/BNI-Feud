import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BNI Family Feud — Think Big St. Louis'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Top red bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: '#CC0000' }} />

        {/* Think Big */}
        <div style={{ fontSize: 28, color: '#666666', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>
          Think Big St. Louis
        </div>

        {/* BNI */}
        <div style={{ fontSize: 140, fontWeight: 900, color: '#CC0000', lineHeight: 1 }}>
          BNI
        </div>

        {/* Family Feud */}
        <div style={{ fontSize: 56, fontWeight: 700, color: '#000000', marginTop: 8 }}>
          Family Feud
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 24, color: '#888888', marginTop: 32 }}>
          Scan • Text • Play • Win Lunch!
        </div>

        {/* Bottom red bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, backgroundColor: '#CC0000' }} />

        {/* Built by */}
        <div style={{ position: 'absolute', bottom: 24, fontSize: 16, color: '#AAAAAA' }}>
          Built by Webtek
        </div>
      </div>
    ),
    { ...size }
  )
}
