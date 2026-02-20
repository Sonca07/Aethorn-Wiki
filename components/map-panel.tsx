'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { MapMarkerWithHighlight } from '@/lib/map-markers'

// Leaflet must not run on the server
const AethornMapClient = dynamic(() => import('./aethorn-map-client'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1810',
        color: '#5a4a2a',
        fontSize: '0.75rem',
      }}>
      Cargando mapa…
    </div>
  ),
})

interface MapPanelProps {
  markers: MapMarkerWithHighlight[]
  height?: number
  /** additional className for the outer <aside> */
  className?: string
}

export default function MapPanel({ markers, height = 420, className = '' }: MapPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`shrink-0 self-start sticky top-8 ${className}`} style={{ width: '500px' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.75rem',
          background: '#1a1810',
          border: '1px solid #3a3020',
          borderBottom: collapsed ? '1px solid #3a3020' : 'none',
          borderRadius: collapsed ? '0.375rem' : '0.375rem 0.375rem 0 0',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem' }}>🗺</span>
          <span
            style={{
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c9a84c',
            }}>
            Mapa de Aethorn
          </span>
        </div>
        <button
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Mostrar mapa' : 'Ocultar mapa'}
          style={{
            fontSize: '0.6rem',
            color: '#9a8a6a',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9a8a6a')}>
          {collapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Map frame */}
      {!collapsed && (
        <div className="aethorn-map-frame">
          <AethornMapClient markers={markers} height={height} />
        </div>
      )}
    </aside>
  )
}
