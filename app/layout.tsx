import type { Metadata } from 'next'
import { Geist, Geist_Mono, EB_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import MusicPlayer from '@/components/music-player'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Aethorn — Wiki del Mundo',
  description: 'Wiki del setting de D&D 5e Aethorn, un mundo de fantasía épica steampunk.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${geistMono.variable} ${ebGaramond.variable}`}>
      <body className="antialiased bg-background text-foreground min-h-screen" style={{ fontFamily: 'var(--font-geist, ui-sans-serif, system-ui, sans-serif)' }}>
        {children}
        <MusicPlayer />
        <Analytics />
      </body>
    </html>
  )
}
