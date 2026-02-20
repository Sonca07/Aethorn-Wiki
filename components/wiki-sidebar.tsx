'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import type { NavNode, SearchEntry } from '@/lib/content'

interface SidebarProps {
  tree: NavNode[]
  searchIndex: SearchEntry[]
}

function findNode(nodes: NavNode[], lastSlug: string): NavNode | undefined {
  return nodes.find(n => n.slug[n.slug.length - 1] === lastSlug)
}

// ── Single nav link ───────────────────────────────────────────────────────────

function NavLink({ node, dimColor = '#9a8878' }: { node: NavNode; dimColor?: string }) {
  const pathname = usePathname()
  const href = `/wiki/${node.slug.join('/')}`
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className="block truncate rounded py-0.5 text-xs transition-colors hover:bg-white/5"
      style={{
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        borderLeft: isActive ? '2px solid #c9a84c' : '2px solid transparent',
        color: isActive ? '#c9a84c' : dimColor,
        background: isActive ? 'rgba(201, 168, 76, 0.06)' : 'transparent',
        fontWeight: isActive ? 600 : 400,
      }}
      title={node.name}>
      {node.name}
    </Link>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{icon}</span>
        <span style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c9a84c',
          lineHeight: 1,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, rgba(201,168,76,0.5) 0%, rgba(201,168,76,0.12) 55%, transparent 100%)',
      }} />
    </div>
  )
}

// ── Section separator ─────────────────────────────────────────────────────────

function SectionSep() {
  return (
    <div style={{
      margin: '0.6rem 0',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(58,48,32,0.7) 35%, rgba(58,48,32,0.7) 65%, transparent)',
    }} />
  )
}

// ── Collapsible faction group ─────────────────────────────────────────────────

function FactionGroup({ node, accent }: { node: NavNode; accent: string }) {
  const pathname = usePathname()
  const href = `/wiki/${node.slug.join('/')}`
  const isInside = pathname === href || pathname.startsWith(href + '/')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (isInside) setOpen(true)
  }, [isInside])

  return (
    <div style={{ marginBottom: '0.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            flexShrink: 0,
            color: accent,
            opacity: 0.6,
            fontSize: '0.48rem',
            lineHeight: 1,
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease-out',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '0.25rem 0.2rem',
          }}>
          ▶
        </button>
        <Link
          href={href}
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.7rem',
            fontWeight: 600,
            lineHeight: '1.4',
            padding: '0.1rem 0.25rem 0.1rem 0',
            color: isInside ? accent : accent + 'aa',
            transition: 'color 0.15s',
          }}
          title={node.name}>
          {node.name}
        </Link>
      </div>
      {open && (
        <div className="nav-children" style={{ marginLeft: '0.9rem', marginTop: '0.1rem' }}>
          {node.children.map(child => (
            <NavLink key={child.slug.join('/')} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Race group: micro-label + flat list ───────────────────────────────────────

function RaceGroup({ node }: { node: NavNode }) {
  const pathname = usePathname()
  const href = `/wiki/${node.slug.join('/')}`
  const isInGroup = pathname === href || pathname.startsWith(href + '/')

  return (
    <div style={{ marginBottom: '0.55rem' }}>
      <p style={{
        fontSize: '0.56rem',
        fontWeight: 700,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        padding: '0 0.25rem',
        marginBottom: '0.1rem',
        color: isInGroup ? '#7a6a4a' : '#4a3a22',
      }}>
        {node.name}
      </p>
      <div>
        {node.children.map(child => (
          <NavLink key={child.slug.join('/')} node={child} dimColor="#8a7a5a" />
        ))}
      </div>
    </div>
  )
}

// ── Historia section ──────────────────────────────────────────────────────────

function HistoriaSection({ node }: { node: NavNode }) {
  const calendarioNode = findNode(node.children, 'calendario')
  const erasNode = findNode(node.children, 'las-eras-de-aethorn')

  return (
    <div>
      {calendarioNode && <NavLink node={calendarioNode} />}
      {erasNode?.children.map(era => (
        <NavLink key={era.slug.join('/')} node={era} />
      ))}
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function WikiSidebar({ tree, searchIndex }: SidebarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const fuse = useMemo(
    () => new Fuse(searchIndex, { keys: ['title', 'excerpt'], threshold: 0.4, minMatchCharLength: 2 }),
    [searchIndex],
  )

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    return fuse.search(query.trim()).slice(0, 8)
  }, [fuse, query])

  const showResults = query.trim().length >= 2

  // Locate structural nodes
  const faccionesNode   = findNode(tree, 'facciones')
  const razasNode       = findNode(tree, 'razas')
  const historiaNode    = findNode(tree, 'historia-de-aethorn')

  const vornidasNode    = faccionesNode ? findNode(faccionesNode.children, 'alianza-de-las-forjas-vornidas') : undefined
  const vaelFacNode     = faccionesNode ? findNode(faccionesNode.children, 'confluencia-de-vael') : undefined
  const neutralidadNode = faccionesNode ? findNode(faccionesNode.children, 'neutralidad') : undefined

  const razasForjas    = razasNode ? findNode(razasNode.children, 'forjas-vornidas') : undefined
  const razasVaelNode  = razasNode ? findNode(razasNode.children, 'confluencia-de-vael') : undefined
  const razasNeutrales = razasNode ? findNode(razasNode.children, 'neutrales') : undefined

  return (
    <nav className="flex flex-col text-sm">
      {/* Back to home */}
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity"
        style={{
          marginBottom: '0.75rem',
          fontSize: '0.7rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#c9a84c',
        }}>
        ← Aethorn
      </Link>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '0.25rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('')
            if (e.key === 'Enter' && results.length > 0) {
              router.push(`/wiki/${results[0].item.slug.join('/')}`)
              setQuery('')
            }
          }}
          placeholder="Buscar en el wiki..."
          className="w-full rounded outline-none transition-colors"
          style={{
            padding: '0.375rem 0.625rem',
            fontSize: '0.75rem',
            background: '#1a1810',
            border: '1px solid #3a3020',
            color: '#f0e6c8',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#3a3020' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity opacity-40 hover:opacity-80"
            style={{ fontSize: '0.75rem', color: '#c9a84c' }}>
            ✕
          </button>
        )}
      </div>

      {showResults ? (
        /* ── Search results ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginTop: '0.5rem' }}>
          {results.length === 0 ? (
            <p style={{ padding: '0.5rem 0.5rem', fontSize: '0.75rem', color: '#5a4a2a' }}>Sin resultados</p>
          ) : (
            results.map(({ item }, i) => (
              <Link
                key={item.slug.join('/')}
                href={`/wiki/${item.slug.join('/')}`}
                onClick={() => setQuery('')}
                className="search-result block rounded transition-colors hover:bg-white/5"
                style={{ padding: '0.5rem', animationDelay: `${i * 45}ms` }}>
                <p style={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: '1.25', color: '#f0e6c8' }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '0.68rem', marginTop: '0.1rem', fontWeight: 500, color: '#c9a84c', opacity: 0.7 }}>
                  {item.category}
                </p>
                {item.excerpt && (
                  <p className="line-clamp-2" style={{ fontSize: '0.68rem', marginTop: '0.1rem', lineHeight: '1.35', color: '#6a5a3a' }}>
                    {item.excerpt}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      ) : (
        /* ── Structured navigation ── */
        <div>
          {/* ⚙ FACCIONES */}
          <SectionHeader icon="⚙" label="Facciones" />
          <div>
            {vornidasNode    && <FactionGroup node={vornidasNode}    accent="#c9a84c" />}
            {vaelFacNode     && <FactionGroup node={vaelFacNode}     accent="#5a9ab8" />}
            {neutralidadNode && <FactionGroup node={neutralidadNode} accent="#8a8272" />}
          </div>

          <SectionSep />

          {/* ◈ RAZAS */}
          <SectionHeader icon="◈" label="Razas" />
          <div>
            {razasForjas    && <RaceGroup node={razasForjas} />}
            {razasVaelNode  && <RaceGroup node={razasVaelNode} />}
            {razasNeutrales && <RaceGroup node={razasNeutrales} />}
          </div>

          <SectionSep />

          {/* 📜 HISTORIA */}
          <SectionHeader icon="📜" label="Historia de Aethorn" />
          {historiaNode && <HistoriaSection node={historiaNode} />}
        </div>
      )}
    </nav>
  )
}
