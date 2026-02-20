'use client'

import { useEffect } from 'react'
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import L, { type LatLngBoundsExpression } from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import type { MapMarkerWithHighlight, MarkerType, MarkerFaction } from '@/lib/map-markers'

// ── Map constants ─────────────────────────────────────────────────────────────

const IMAGE_URL = '/images/Mapas/Mapa Aethorn.png'
// Coordinate space matches the user-verified 865×580 layout grid.
// The ImageOverlay stretches the PNG to fill these bounds — aspect
// ratios are ~1:1.49 vs 1:1.50 so distortion is negligible.
const IMAGE_W = 865
const IMAGE_H = 580
const BOUNDS: LatLngBoundsExpression = [[0, 0], [IMAGE_H, IMAGE_W]]

// ── Icon factory ──────────────────────────────────────────────────────────────

const TYPE_CHAR: Record<MarkerType, string> = {
  nation:       '♛',
  race:         '⛨',
  organization: '⚙',
  university:   '✦',
}

const FACTION_COLOR: Record<MarkerFaction, string> = {
  vornidas: '#c9a84c',
  vael:     '#5a9ab8',
  neutral:  '#8a8272',
}

function makeIcon(type: MarkerType, faction: MarkerFaction, highlight = false): L.DivIcon {
  const color  = FACTION_COLOR[faction]
  const char   = TYPE_CHAR[type]
  const size   = highlight ? 36 : 28
  const border = highlight ? `2px solid ${color}` : `1.5px solid ${color}`
  const glow   = highlight ? `0 0 10px ${color}88, 0 0 20px ${color}44` : 'none'
  const bg     = highlight ? `${color}22` : '#1a1810cc'

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      border-radius:50%;
      border:${border};
      background:${bg};
      color:${color};
      font-size:${highlight ? 14 : 11}px;
      line-height:1;
      box-shadow:${glow};
      transition:transform .15s;
    ">${char}</div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  })
}

// ── Fit bounds on mount ───────────────────────────────────────────────────────

function FitBounds() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    map.fitBounds(BOUNDS, { padding: [8, 8] })
  }, [map])
  return null
}

// ── Reset view control ────────────────────────────────────────────────────────

function ResetView() {
  const map = useMap()
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '86px',
        left: '10px',
        zIndex: 1000,
      }}>
      <button
        onClick={() => map.fitBounds(BOUNDS, { animate: true })}
        title="Restablecer vista"
        style={{
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1810',
          border: '1px solid #3a3020',
          borderRadius: '3px',
          color: '#c9a84c',
          fontSize: '14px',
          cursor: 'pointer',
          lineHeight: 1,
        }}>
        ↺
      </button>
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: 1000,
        background: '#1a1810ee',
        border: '1px solid #3a3020',
        borderRadius: '4px',
        padding: '6px 8px',
        fontSize: '0.6rem',
        color: '#9a8a6a',
        lineHeight: '1.6',
      }}>
      <div style={{ color: '#c9a84c', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.55rem' }}>Leyenda</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: '#c9a84c' }}>♛</span> Naciones Vornidas
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: '#5a9ab8' }}>♛</span> Naciones del Vael
      </div>
    </div>
  )
}

// ── Popup content ─────────────────────────────────────────────────────────────

function MarkerPopup({ marker }: { marker: MapMarkerWithHighlight }) {
  const factionLabel =
    marker.faction === 'vornidas' ? 'Alianza de las Forjas Vornidas'
    : marker.faction === 'vael'   ? 'Confluencia del Vael'
    :                               'Neutral'
  const factionColor = FACTION_COLOR[marker.faction]

  return (
    <div style={{ minWidth: '140px' }}>
      <p style={{ fontWeight: 700, color: '#c9a84c', fontSize: '0.82rem', marginBottom: '3px', fontFamily: 'Georgia, serif' }}>
        {marker.name}
      </p>
      <p style={{ fontSize: '0.65rem', color: factionColor, marginBottom: '6px', opacity: 0.9 }}>
        {factionLabel}
      </p>
      <Link
        href={`/wiki/${marker.slug.join('/')}`}
        style={{
          display: 'inline-block',
          fontSize: '0.65rem',
          color: '#c9a84c',
          borderBottom: '1px solid rgba(201,168,76,0.3)',
          textDecoration: 'none',
          paddingBottom: '1px',
        }}>
        Ver más →
      </Link>
    </div>
  )
}

// ── Main map component ────────────────────────────────────────────────────────

interface AethornMapClientProps {
  markers: MapMarkerWithHighlight[]
  height?: number
}

export default function AethornMapClient({ markers, height = 420 }: AethornMapClientProps) {
  return (
    <MapContainer
      crs={L.CRS.Simple}
      minZoom={-2}
      maxZoom={2}
      zoomControl={false}
      scrollWheelZoom={false}
      style={{ height, width: '100%', background: '#1a1810' }}>

      <FitBounds />
      <ImageOverlay url={IMAGE_URL} bounds={BOUNDS} />

      <ZoomControl position="bottomleft" />
      <ResetView />
      <Legend />

      {markers.map((m) => (
        <Marker
          key={m.id}
          position={m.coords}
          icon={makeIcon(m.type, m.faction, m.highlight)}>
          <Popup>
            <MarkerPopup marker={m} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
