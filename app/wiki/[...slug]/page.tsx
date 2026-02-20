import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getAllPages,
  getAllFolderPaths,
  getPageBySlug,
  getFolderBySlug,
  loadPageContent,
  extractHeadings,
  type Heading,
} from '@/lib/content'
import { MAP_MARKERS, filterMarkers, type MarkerFaction, type MapMarkerWithHighlight } from '@/lib/map-markers'
import FolderIndex from '@/components/folder-index'
import MapPanel from '@/components/map-panel'
import RegionalMapToggle from '@/components/regional-map-toggle'

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const pages = getAllPages().map((p) => ({ slug: p.slug }))
  const folders = getAllFolderPaths().map((s) => ({ slug: s }))
  return [...pages, ...folders]
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = getPageBySlug(slug)
  if (page) return { title: `${page.title} — Aethorn` }
  const folder = getFolderBySlug(slug)
  if (folder) return { title: `${folder.name} — Aethorn` }
  return {}
}

// ── Map config detection ──────────────────────────────────────────────────────

interface MapConfig {
  faction: MarkerFaction | null
  highlightId: string | null
}

function getMapConfig(slug: string[]): MapConfig | null {
  if (slug[0] !== 'facciones') return null

  // /wiki/facciones — all markers
  if (slug.length === 1) return { faction: null, highlightId: null }

  // /wiki/facciones/alianza-de-las-forjas-vornidas[/...]
  if (slug[1] === 'alianza-de-las-forjas-vornidas') {
    const lastSlug = slug[slug.length - 1]
    const isNation = MAP_MARKERS.some(m => m.faction === 'vornidas' && m.id === lastSlug)
    return { faction: 'vornidas', highlightId: isNation ? lastSlug : null }
  }

  // /wiki/facciones/confluencia-de-vael[/...]
  if (slug[1] === 'confluencia-de-vael') {
    const lastSlug = slug[slug.length - 1]
    const isNation = MAP_MARKERS.some(m => m.faction === 'vael' && m.id === lastSlug)
    return { faction: 'vael', highlightId: isNation ? lastSlug : null }
  }

  return null
}

// ── Header image injection ────────────────────────────────────────────────────

interface HeaderImage {
  src: string
  alt: string
  maxWidth: number
}

interface RegionalMap {
  src: string
  alt: string
}

const HEADER_IMAGES: Record<string, HeaderImage> = {
  // Blasones — Vornidas nations (200px)
  'brennakhar':  { src: '/images/Blasones/Control/Brennakhar.png',  alt: 'Blasón de Brennakhar',  maxWidth: 200 },
  'gholnekrath': { src: '/images/Blasones/Control/Gholnekrath.png', alt: 'Blasón de Gholnekrath', maxWidth: 200 },
  'kaldrymor':   { src: '/images/Blasones/Control/Kaldrymor.png',   alt: 'Blasón de Kaldrymor',   maxWidth: 200 },
  'thaerevorn':  { src: '/images/Blasones/Control/Thaerevorn.png',  alt: 'Blasón de Thaerevorn',  maxWidth: 200 },
  // Blasones — Vael nations (200px)
  'draevorn': { src: '/images/Blasones/Flujo/Draevorn.png',  alt: 'Blasón de Draevorn',  maxWidth: 200 },
  'nhaelorn': { src: '/images/Blasones/Flujo/Nhaelorn.png',  alt: 'Blasón de Nhaelorn',  maxWidth: 200 },
  'sylvareth': { src: '/images/Blasones/Flujo/Sylvareth.png', alt: 'Blasón de Sylvareth', maxWidth: 200 },
  'vaenmoor':  { src: '/images/Blasones/Flujo/Vaenmoor.png',  alt: 'Blasón de Vaenmoor',  maxWidth: 200 },
  // Portraits — races (300px)
  'los-ruhnkai-original': { src: '/images/Retratos/Razas/Neutral/Rhunkai.png', alt: 'Retrato Ruhnkai', maxWidth: 300 },
}

// Regional maps — exact filenames from public/images/Mapas/Reinos - Ciudades/
const REGIONAL_MAPS: Record<string, RegionalMap> = {
  'brennakhar':  { src: '/images/Mapas/Reinos - Ciudades/Control/Brennakhar.png',       alt: 'Mapa regional de Brennakhar'  },
  'gholnekrath': { src: '/images/Mapas/Reinos - Ciudades/Control/Gholnekrath.png',      alt: 'Mapa regional de Gholnekrath' },
  'kaldrymor':   { src: '/images/Mapas/Reinos - Ciudades/Control/Kaldrymor Regional.png', alt: 'Mapa regional de Kaldrymor' },
  'thaerevorn':  { src: '/images/Mapas/Reinos - Ciudades/Control/Tharevorn.png',        alt: 'Mapa regional de Thaerevorn'  },
  'draevorn':    { src: '/images/Mapas/Reinos - Ciudades/Flujo/Dreavorn.png',           alt: 'Mapa regional de Draevorn'    },
  'nhaelorn':    { src: '/images/Mapas/Reinos - Ciudades/Flujo/Nhaelorn.png',           alt: 'Mapa regional de Nhaelorn'    },
  'sylvareth':   { src: '/images/Mapas/Reinos - Ciudades/Flujo/Sylvareth.png',          alt: 'Mapa regional de Sylvareth'   },
  'vaenmoor':    { src: '/images/Mapas/Reinos - Ciudades/Flujo/Vaenmoor.png',           alt: 'Mapa regional de Vaenmoor'    },
}

function getHeaderImage(slug: string[]): HeaderImage | null {
  const last = slug[slug.length - 1]
  return HEADER_IMAGES[last] ?? null
}

function getRegionalMap(slug: string[]): RegionalMap | null {
  const last = slug[slug.length - 1]
  return REGIONAL_MAPS[last] ?? null
}

// Strip an <img> (and its wrapping <p> if sole child) from HTML by src.
// Prevents duplicates when the same image is both in the MD and injected above.
function stripImageFromHtml(html: string, src: string): string {
  const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '(%20| )')
  // Remove <p><img src="..."></p> (sole child)
  html = html.replace(
    new RegExp(`<p>\\s*<img[^>]*src="${escapedSrc}"[^>]*>\\s*<\\/p>`, 'gi'),
    ''
  )
  // Remove any remaining bare <img src="...">
  html = html.replace(
    new RegExp(`<img[^>]*src="${escapedSrc}"[^>]*>`, 'gi'),
    ''
  )
  return html
}

// ── Section metadata for the right TOC panel ─────────────────────────────────

const SECTION_META: Record<string, { icon: string; label: string }> = {
  facciones:             { icon: '⚙',  label: 'Facciones' },
  razas:                 { icon: '◈',  label: 'Razas' },
  'historia-de-aethorn': { icon: '📜', label: 'Historia de Aethorn' },
}

// ── TOC + related panel (server component) ────────────────────────────────────

function TocPanel({
  sectionSlug,
  headings,
  relatedLinks,
}: {
  sectionSlug: string
  headings: Heading[]
  relatedLinks: { slug: string[]; name: string }[]
}) {
  const section = SECTION_META[sectionSlug]

  if (!section && headings.length === 0 && relatedLinks.length === 0) return null

  return (
    <div style={{ borderLeft: '1px solid #2a2010', paddingLeft: '1.25rem' }}>
      {section && (
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid #2a2010' }}>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>{section.icon}</span>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a4a2a' }}>
              {section.label}
            </span>
          </div>
        </div>
      )}

      {headings.length > 0 && (
        <div className="mb-5">
          <p className="mb-2" style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a4a2a' }}>
            En esta página
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="block truncate transition-colors hover:text-yellow-300"
                  style={{ fontSize: '0.72rem', lineHeight: '1.5', paddingLeft: h.level === 3 ? '0.75rem' : '0', color: h.level === 2 ? '#8a7a5a' : '#6a5a3a' }}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedLinks.length > 0 && (
        <div style={{ borderTop: '1px solid #2a2010', paddingTop: '1rem' }}>
          <p className="mb-2" style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a4a2a' }}>
            Ver también
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {relatedLinks.map((link) => (
              <li key={link.slug.join('/')}>
                <Link href={`/wiki/${link.slug.join('/')}`} className="block truncate text-xs transition-colors hover:text-yellow-300" style={{ color: '#7a6a4a' }}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function WikiPage({ params }: Props) {
  const { slug } = await params
  const mapConfig = getMapConfig(slug)

  // ── Folder page ────────────────────────────────────────────────────────────
  const page = getPageBySlug(slug)
  if (!page) {
    const folder = getFolderBySlug(slug)
    if (!folder) notFound()

    if (mapConfig) {
      const markers = filterMarkers(mapConfig.faction, mapConfig.highlightId) as MapMarkerWithHighlight[]
      return (
        <div className="flex gap-6 items-start page-enter">
          <div className="flex-1 min-w-0">
            <FolderIndex folder={folder!} slug={slug} />
          </div>
          <MapPanel
            markers={markers}
            className="hidden 2xl:block"
          />
        </div>
      )
    }

    return <FolderIndex folder={folder!} slug={slug} />
  }

  // ── Article page ───────────────────────────────────────────────────────────
  const content = await loadPageContent(page)
  const headerImage = getHeaderImage(slug)
  const regionalMap = getRegionalMap(slug)
  // Strip the blasón from rendered HTML if we're injecting it above to avoid duplicates
  const rawHtml = headerImage ? stripImageFromHtml(content.html, headerImage.src) : content.html
  const { html, headings } = extractHeadings(rawHtml)

  const mapMarkers = mapConfig
    ? (filterMarkers(mapConfig.faction, mapConfig.highlightId) as MapMarkerWithHighlight[])
    : null

  // Right panel width depends on whether the map is shown
  const rightPanelWidth = mapMarkers ? '500px' : '240px'

  // Build breadcrumb
  const breadcrumbs = slug.map((_, i) => ({
    label: i === slug.length - 1
      ? content.title
      : (page.folderNames[i] ?? slug[i].replace(/-/g, ' ')),
    href: `/wiki/${slug.slice(0, i + 1).join('/')}`,
    isLast: i === slug.length - 1,
  }))

  return (
    <div className="flex gap-8 items-start max-w-[1200px] mx-auto page-enter">

      {/* ── Article ── */}
      <article className="flex-1 min-w-0">

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-xs mb-8" style={{ color: '#5a4a2a' }}>
          <Link href="/" className="hover:underline transition-colors" style={{ color: '#9a8a6a' }}>Aethorn</Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <span style={{ color: '#c9a84c', opacity: 0.5, fontSize: '0.8rem' }}>›</span>
              {crumb.isLast ? (
                <span style={{ color: '#c8b89a' }}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:underline transition-colors" style={{ color: '#9a8a6a' }}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>

        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold mb-3"
            style={{ color: '#c9a84c', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.15, textShadow: '0 0 40px rgba(201, 168, 76, 0.1)' }}>
            {content.title}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #4a3820)' }} />
            <span style={{ color: '#c9a84c', fontSize: '0.45rem', letterSpacing: '0.5em', opacity: 0.5 }}>◆ · ◆</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #4a3820, transparent)' }} />
          </div>
        </div>

        {/* Frontmatter */}
        {content.frontmatter.faction && (
          <p className="text-xs mb-2 text-center" style={{ color: '#9a8a6a' }}>
            Facción: <span style={{ color: '#c9a84c' }}>{String(content.frontmatter.faction)}</span>
          </p>
        )}
        {Array.isArray(content.frontmatter.tags) && content.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {(content.frontmatter.tags as string[]).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded"
                style={{ background: '#2a2010', color: '#9a8a6a', border: '1px solid #3a3020' }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="mb-8" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #3a3020 30%, #3a3020 70%, transparent)' }} />

        {/* Header image — coat of arms or portrait, injected by slug */}
        {headerImage && (
          <div className="flex justify-center mb-6">
            <figure className="wiki-image-frame" style={{ maxWidth: headerImage.maxWidth }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headerImage.src}
                alt={headerImage.alt}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </figure>
          </div>
        )}

        {/* Content */}
        <div className="wiki-prose" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Regional map toggle — appears below article text */}
        {regionalMap && (
          <RegionalMapToggle src={regionalMap.src} alt={regionalMap.alt} />
        )}

        {/* Related pages — visible on mobile only */}
        {content.links.length > 0 && (
          <aside className="mt-12 pt-6 xl:hidden" style={{ borderTop: '1px solid #2a2010' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6a5a3a', letterSpacing: '0.2em' }}>
              Ver también
            </h2>
            <div className="flex flex-wrap gap-2">
              {content.links.map((link) => (
                <Link key={link.slug.join('/')} href={`/wiki/${link.slug.join('/')}`}
                  className="text-sm px-3 py-1 rounded border transition-all duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: '#3a3020', color: '#c9a84c', background: 'transparent' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>

      {/* ── Right column (xl+ for TOC only, 2xl+ when map is present) ── */}
      <div
        className={`hidden ${mapMarkers ? '2xl:flex' : 'xl:flex'} flex-col gap-4 shrink-0 self-start sticky top-8`}
        style={{ width: rightPanelWidth }}>

        {/* Map panel — only on faction/nation pages */}
        {mapMarkers && (
          <MapPanel markers={mapMarkers} height={400} className="!static !w-full" />
        )}

        {/* TOC + section + related */}
        <TocPanel
          sectionSlug={slug[0] ?? ''}
          headings={headings}
          relatedLinks={content.links}
        />
      </div>
    </div>
  )
}
