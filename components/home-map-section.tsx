'use client'

import dynamic from 'next/dynamic'
import { MAP_MARKERS, type MapMarkerWithHighlight } from '@/lib/map-markers'

const AethornMapClient = dynamic(() => import('./aethorn-map-client'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 550,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1810',
        color: '#5a4a2a',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
      }}>
      Cargando mapa…
    </div>
  ),
})

export default function HomeMapSection() {
  return (
    <section className="w-full max-w-5xl mb-14">

      {/* Title */}
      <div className="text-center mb-6">
        <div className="flex items-center gap-4 justify-center mb-3">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #4a3820)' }} />
          <h2
            className="font-serif font-bold px-2"
            style={{
              color: '#c9a84c',
              fontSize: 'clamp(1.1rem, 3vw, 1.55rem)',
              letterSpacing: '0.06em',
              textShadow: '0 0 30px rgba(201, 168, 76, 0.12)',
            }}>
            El Mundo de Aethorn
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #4a3820, transparent)' }} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #3a3020)' }} />
          <span style={{ color: '#c9a84c', fontSize: '0.42rem', letterSpacing: '0.5em', opacity: 0.45 }}>◆ · ◆</span>
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, #3a3020, transparent)' }} />
        </div>
      </div>

      {/* Map */}
      <div className="aethorn-map-frame aethorn-map-frame-full">
        <AethornMapClient
          markers={MAP_MARKERS as MapMarkerWithHighlight[]}
          height={550}
        />
      </div>
    </section>
  )
}
