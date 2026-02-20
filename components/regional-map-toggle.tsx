'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
}

export default function RegionalMapToggle({ src, alt }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-10 pt-6" style={{ borderTop: '1px solid #2a2010' }}>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: '1px solid #3a3020',
          borderRadius: '4px',
          padding: '0.4rem 0.85rem',
          color: '#c9a84c',
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
          fontFamily: 'Georgia, serif',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#c9a84c'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3020'
        }}>
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>🗺</span>
        Mapa Regional
        <span style={{
          fontSize: '0.55rem',
          opacity: 0.6,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>▼</span>
      </button>

      {/* Collapsible map */}
      {open && (
        <div className="mt-4">
          <figure style={{ margin: 0 }}>
            <div
              className="wiki-image-frame"
              style={{ maxWidth: 'min(420px, 100%)', margin: '0 auto' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <figcaption style={{
              textAlign: 'center',
              fontSize: '0.62rem',
              color: '#5a4a2a',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: '0.45rem',
            }}>
              Mapa Regional
            </figcaption>
          </figure>
        </div>
      )}

    </div>
  )
}
