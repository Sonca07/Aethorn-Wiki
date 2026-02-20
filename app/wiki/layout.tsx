import { getNavTree, getSearchIndex } from '@/lib/content'
import WikiSidebar from '@/components/wiki-sidebar'

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  const tree = getNavTree()
  const searchIndex = getSearchIndex()

  return (
    <div className="flex min-h-screen" style={{ background: '#1a1a1a' }}>
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 overflow-y-auto border-r px-4 py-6 sticky top-0 h-screen"
        style={{ borderColor: '#3a3020', background: '#161410' }}>
        <WikiSidebar tree={tree} searchIndex={searchIndex} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-6 py-8">
        {children}
      </main>
    </div>
  )
}
