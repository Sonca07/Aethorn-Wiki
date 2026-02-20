import Link from 'next/link'
import type { WikiFolder, NavNode } from '@/lib/content'
import { getPageExcerpt } from '@/lib/content'

interface Props {
  folder: WikiFolder
  slug: string[]
}

function countItems(nodes: NavNode[]): number {
  let count = 0
  for (const node of nodes) {
    if (node.isFile) count++
    else count += countItems(node.children)
  }
  return count
}

export default function FolderIndex({ folder, slug }: Props) {
  const breadcrumbs = slug.map((_, i) => ({
    label: i === slug.length - 1 ? folder.name : folder.ancestorNames[i],
    href: `/wiki/${slug.slice(0, i + 1).join('/')}`,
    isLast: i === slug.length - 1,
  }))

  return (
    <div className="page-enter max-w-[1000px] mx-auto">

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs mb-10" style={{ color: '#5a4a2a' }}>
        <Link href="/" className="hover:underline transition-colors" style={{ color: '#9a8a6a' }}>
          Aethorn
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <span style={{ color: '#c9a84c', opacity: 0.5, fontSize: '0.8rem' }}>›</span>
            {crumb.isLast ? (
              <span style={{ color: '#c8b89a' }}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline transition-colors" style={{ color: '#9a8a6a' }}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Section title with decorative borders */}
      <div className="text-center mb-12">
        <div className="flex items-center gap-4 justify-center mb-4">
          <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, transparent, #4a3820)' }} />
          <h1 className="font-serif font-bold px-2" style={{ color: '#c9a84c', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', lineHeight: 1.2 }}>
            {folder.name}
          </h1>
          <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, #4a3820, transparent)' }} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, #3a3020)' }} />
          <span style={{ color: '#c9a84c', fontSize: '0.42rem', letterSpacing: '0.5em', opacity: 0.45 }}>◆ · ◆</span>
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #3a3020, transparent)' }} />
        </div>
      </div>

      {/* Children grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folder.children.map((child) => {
          const href = `/wiki/${child.slug.join('/')}`

          if (!child.isFile) {
            const itemCount = countItems(child.children)
            return (
              <Link
                key={child.slug.join('/')}
                href={href}
                className="group relative block rounded-lg border p-5 card-lift overflow-hidden"
                style={{ background: '#16140c', borderColor: '#2e2810' }}>
                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.07) 0%, transparent 70%)' }}
                />
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(201, 168, 76, 0.18)' }}
                />
                <div className="relative flex items-start gap-3">
                  <span className="shrink-0 text-sm mt-0.5 transition-opacity duration-200" style={{ color: '#c9a84c', opacity: 0.6 }}>▶</span>
                  <div className="min-w-0">
                    <p className="font-semibold font-serif text-sm leading-snug mb-1.5 transition-colors duration-200 group-hover:text-yellow-300" style={{ color: '#f0e6c8' }}>
                      {child.name}
                    </p>
                    <p className="text-xs" style={{ color: '#4a3a20' }}>
                      {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          }

          // File card with excerpt
          const excerpt = getPageExcerpt(child.slug)
          return (
            <Link
              key={child.slug.join('/')}
              href={href}
              className="group relative block rounded-lg border p-5 card-lift overflow-hidden"
              style={{ background: '#14120a', borderColor: '#282210' }}>
              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.05) 0%, transparent 70%)' }}
              />
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(201, 168, 76, 0.12)' }}
              />
              <div className="relative">
                <p className="font-semibold font-serif text-sm leading-snug mb-1.5 transition-colors duration-200 group-hover:text-yellow-200" style={{ color: '#e0d0a8' }}>
                  {child.name}
                </p>
                {excerpt && (
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#4a3a22' }}>
                    {excerpt}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
