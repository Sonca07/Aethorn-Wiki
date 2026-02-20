// ---------------------------------------------------------------------------
// Aethorn map marker data
// ---------------------------------------------------------------------------
// Coordinate system: CRS.Simple with bounds [[0,0],[580,865]]
// Coordinates below are given as image pixels [x, y] from the top-left
// of an 865×580 reference grid.  The px() helper converts them to the
// Leaflet [lat, lng] = [580 - y, x] convention used by CRS.Simple.
// ---------------------------------------------------------------------------

export type MarkerType = 'nation' | 'race' | 'organization' | 'university'
export type MarkerFaction = 'vornidas' | 'vael' | 'neutral'

export interface MapMarker {
  id: string                   // matches last slug segment, used for highlight
  name: string
  type: MarkerType
  faction: MarkerFaction
  slug: string[]               // full slug for wiki link
  coords: [number, number]     // Leaflet [lat, lng] in CRS.Simple
  description?: string
}

// Helper: pixel (x, y) from top-left of 865×580 grid → Leaflet [lat, lng]
function px(x: number, y: number): [number, number] {
  return [580 - y, x]
}

export const MAP_MARKERS: MapMarker[] = [
  // ── Alianza de las Forjas Vornidas ────────────────────────────────────────

  {
    id: 'kaldrymor',
    name: 'Kaldrymor',
    type: 'nation',
    faction: 'vornidas',
    slug: ['facciones', 'alianza-de-las-forjas-vornidas', 'naciones-reinos', 'kaldrymor'],
    coords: px(490, 180), // northern part of upper-right continent
    description: 'Reino de las Forjas Vornidas',
  },
  {
    id: 'thaerevorn',
    name: 'Thaerevorn',
    type: 'nation',
    faction: 'vornidas',
    slug: ['facciones', 'alianza-de-las-forjas-vornidas', 'naciones-reinos', 'thaerevorn'],
    coords: px(300, 280), // center of western continent, inland plains
    description: 'Reino de las Forjas Vornidas',
  },
  {
    id: 'gholnekrath',
    name: 'Gholnekrath',
    type: 'nation',
    faction: 'vornidas',
    slug: ['facciones', 'alianza-de-las-forjas-vornidas', 'naciones-reinos', 'gholnekrath'],
    coords: px(195, 420), // southwest coast of western continent
    description: 'Reino de las Forjas Vornidas',
  },
  {
    id: 'brennakhar',
    name: 'Brennakhar',
    type: 'nation',
    faction: 'vornidas',
    slug: ['facciones', 'alianza-de-las-forjas-vornidas', 'naciones-reinos', 'brennakhar'],
    coords: px(600, 390), // northern area of lower-right continent
    description: 'Reino de las Forjas Vornidas',
  },

  // ── Confluencia del Vael ──────────────────────────────────────────────────

  {
    id: 'sylvareth',
    name: 'Sylvareth',
    type: 'nation',
    faction: 'vael',
    slug: ['facciones', 'confluencia-de-vael', 'naciones-reinos', 'sylvareth'],
    coords: px(270, 220), // northwest forest of western continent
    description: 'Reino de la Confluencia del Vael',
  },
  {
    id: 'vaenmoor',
    name: 'Vaenmoor',
    type: 'nation',
    faction: 'vael',
    slug: ['facciones', 'confluencia-de-vael', 'naciones-reinos', 'vaenmoor'],
    coords: px(580, 210), // center of upper-right continent, near inland sea
    description: 'Reino de la Confluencia del Vael',
  },
  {
    id: 'draevorn',
    name: 'Draevorn',
    type: 'nation',
    faction: 'vael',
    slug: ['facciones', 'confluencia-de-vael', 'naciones-reinos', 'draevorn'],
    coords: px(660, 360), // upper area of lower-right continent
    description: 'Reino de la Confluencia del Vael',
  },
  {
    id: 'nhaelorn',
    name: 'Nhaelorn',
    type: 'nation',
    faction: 'vael',
    slug: ['facciones', 'confluencia-de-vael', 'naciones-reinos', 'nhaelorn'],
    coords: px(250, 460), // southern peninsula of western continent
    description: 'Reino de la Confluencia del Vael',
  },
]

// ── Filter helpers ────────────────────────────────────────────────────────────

export function filterMarkers(
  faction?: MarkerFaction | null,
  highlightId?: string | null,
): MapMarker[] {
  const base = faction ? MAP_MARKERS.filter(m => m.faction === faction) : MAP_MARKERS
  if (!highlightId) return base
  return base.map(m => (m.id === highlightId ? { ...m, highlight: true } : m))
}

// Augmented type used internally in the component
export type MapMarkerWithHighlight = MapMarker & { highlight?: boolean }
