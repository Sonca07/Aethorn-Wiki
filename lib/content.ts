import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

// Root of the Obsidian vault content.
// In production / CI: content/ lives inside the Webapp (bundled for deployment).
// In local dev: falls back to the sibling Aethorn vault folder.
const CONTENT_BUNDLED = path.join(process.cwd(), 'content')
const CONTENT_SIBLING = path.join(process.cwd(), '..', 'Aethorn', 'Setting - [Aethorn]')
const VAULT_PATH = fs.existsSync(CONTENT_BUNDLED) ? CONTENT_BUNDLED : CONTENT_SIBLING

// Public images folder — source of truth for image URL resolution
const PUBLIC_IMAGES_PATH = path.join(process.cwd(), 'public', 'images')

// ---------------------------------------------------------------------------
// Slugification
// ---------------------------------------------------------------------------

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WikiPage {
  slug: string[]       // URL segments, e.g. ['facciones', 'alianza-de-las-forjas-vornidas', 'brennakhar']
  title: string        // original filename without .md
  filePath: string     // absolute filesystem path
  folderNames: string[] // original (non-slugified) ancestor folder names, e.g. ['Facciones', 'Alianza de las Forjas Vornidas']
}

export interface WikiFolder {
  slug: string[]
  name: string           // original folder name
  ancestorNames: string[] // original names of all ancestor folders (not including this folder)
  children: NavNode[]
}

export interface NavNode {
  name: string      // display name (original folder/file name)
  slug: string[]
  children: NavNode[]
  isFile: boolean
}

export interface PageContent {
  title: string
  html: string
  frontmatter: Record<string, unknown>
  links: { name: string; slug: string[] }[]
}

export interface SearchEntry {
  title: string
  slug: string[]
  excerpt: string
  category: string
}

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

// ---------------------------------------------------------------------------
// Internal indexes (built once, cached in module scope)
// ---------------------------------------------------------------------------

let _pageMap: Map<string, WikiPage> | null = null   // key: slug.join('/')
let _titleMap: Map<string, WikiPage> | null = null  // key: toSlug(title)
let _imageMap: Map<string, string> | null = null    // key: filename.toLowerCase() → /images/…
let _navTree: NavNode[] | null = null

function ensureBuilt() {
  if (_pageMap) return

  _pageMap = new Map()
  _titleMap = new Map()
  _imageMap = new Map()

  buildImageMap(PUBLIC_IMAGES_PATH, PUBLIC_IMAGES_PATH)

  for (const page of scanMdFiles(VAULT_PATH, [], [])) {
    _pageMap.set(page.slug.join('/'), page)
    // Last writer wins on title collisions (titles are unique in this vault)
    _titleMap.set(toSlug(page.title), page)
  }

  _navTree = buildNavTree(VAULT_PATH, [])
}

// ---------------------------------------------------------------------------
// Image index
// ---------------------------------------------------------------------------

// Scans public/images/ recursively and maps filename.toLowerCase() → /images/subpath/file.ext
function buildImageMap(dir: string, base: string): void {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      buildImageMap(full, base)
    } else if (/\.(png|jpe?g|gif|webp|svg)$/i.test(entry.name)) {
      const key = entry.name.toLowerCase()
      // First occurrence wins — prevents regional map duplicates from overwriting blasones
      if (!_imageMap!.has(key)) {
        const rel = path.relative(base, full).replace(/\\/g, '/')
        const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
        _imageMap!.set(key, bp + '/images/' + rel)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// MD file scan
// ---------------------------------------------------------------------------

function scanMdFiles(dir: string, folderSlugs: string[], folderNames: string[]): WikiPage[] {
  if (!fs.existsSync(dir)) return []
  const pages: WikiPage[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      pages.push(...scanMdFiles(
        full,
        [...folderSlugs, toSlug(entry.name)],
        [...folderNames, entry.name],
      ))
    } else if (entry.name.endsWith('.md')) {
      const title = entry.name.slice(0, -3)
      pages.push({ slug: [...folderSlugs, toSlug(title)], title, filePath: full, folderNames })
    }
  }
  return pages
}

// ---------------------------------------------------------------------------
// Navigation tree
// ---------------------------------------------------------------------------

function buildNavTree(dir: string, parentSlugs: string[]): NavNode[] {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith('.'))
    .sort((a, b) => {
      // Folders first, then files; alphabetical within each group
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
      return a.name.localeCompare(b.name, 'es')
    })

  const nodes: NavNode[] = []
  for (const entry of entries) {
    const slug = [...parentSlugs, toSlug(entry.name.replace(/\.md$/, ''))]
    if (entry.isDirectory()) {
      const children = buildNavTree(path.join(dir, entry.name), slug)
      if (children.length > 0) {
        nodes.push({ name: entry.name, slug, children, isFile: false })
      }
    } else if (entry.name.endsWith('.md')) {
      nodes.push({ name: entry.name.slice(0, -3), slug, children: [], isFile: true })
    }
  }
  return nodes
}

// ---------------------------------------------------------------------------
// Tree walker helpers
// ---------------------------------------------------------------------------

function walkToNode(
  nodes: NavNode[],
  slugParts: string[],
  ancestorNames: string[],
): { node: NavNode; ancestorNames: string[] } | null {
  if (slugParts.length === 0) return null
  const [head, ...rest] = slugParts
  for (const node of nodes) {
    const nodeSlugTail = node.slug[node.slug.length - 1]
    if (nodeSlugTail === head) {
      if (rest.length === 0) return { node, ancestorNames }
      if (!node.isFile) {
        return walkToNode(node.children, rest, [...ancestorNames, node.name])
      }
    }
  }
  return null
}

function collectFolderPaths(nodes: NavNode[], acc: string[][]): void {
  for (const node of nodes) {
    if (!node.isFile) {
      acc.push(node.slug)
      collectFolderPaths(node.children, acc)
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllPages(): WikiPage[] {
  ensureBuilt()
  return [..._pageMap!.values()]
}

export function getNavTree(): NavNode[] {
  ensureBuilt()
  return _navTree!
}

export function getPageBySlug(slugParts: string[]): WikiPage | null {
  ensureBuilt()
  return _pageMap!.get(slugParts.join('/')) ?? null
}

export function getFolderBySlug(slugParts: string[]): WikiFolder | null {
  ensureBuilt()
  const result = walkToNode(_navTree!, slugParts, [])
  if (!result || result.node.isFile) return null
  return {
    slug: slugParts,
    name: result.node.name,
    ancestorNames: result.ancestorNames,
    children: result.node.children,
  }
}

export function getAllFolderPaths(): string[][] {
  ensureBuilt()
  const paths: string[][] = []
  collectFolderPaths(_navTree!, paths)
  return paths
}

export function getPageExcerpt(slugParts: string[]): string {
  ensureBuilt()
  const page = _pageMap!.get(slugParts.join('/'))
  if (!page) return ''
  const raw = fs.readFileSync(page.filePath, 'utf-8')
  const { content } = matter(raw)
  return content
    .replace(/!\[\[[^\]]+\]\]/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^#+\s*/gm, '')
    .trim()
    .slice(0, 120)
}

export function getSearchIndex(): SearchEntry[] {
  ensureBuilt()
  const entries: SearchEntry[] = []
  for (const page of _pageMap!.values()) {
    const raw = fs.readFileSync(page.filePath, 'utf-8')
    const { content } = matter(raw)
    const excerpt = content
      .replace(/!\[\[[^\]]+\]\]/g, '')
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^#+\s*/gm, '')
      .trim()
      .slice(0, 120)
    entries.push({
      title: page.title,
      slug: page.slug,
      excerpt,
      category: page.slug[0],
    })
  }
  return entries
}

export async function loadPageContent(page: WikiPage): Promise<PageContent> {
  ensureBuilt()
  const raw = fs.readFileSync(page.filePath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)

  // Collect unique internal links (excluding images)
  const links: { name: string; slug: string[] }[] = []
  const seen = new Set<string>()
  for (const m of content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    const noteName = m[1].trim()
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(noteName)) continue
    if (!seen.has(noteName)) {
      seen.add(noteName)
      const linked = _titleMap!.get(toSlug(noteName))
      if (linked) links.push({ name: noteName, slug: linked.slug })
    }
  }

  const processed = resolveObsidian(content)
  const result = await remark()
    .use(remarkHtml, { sanitize: false })
    .process(processed)

  return {
    title: (frontmatter.title as string) ?? page.title,
    html: String(result),
    frontmatter,
    links,
  }
}

// ---------------------------------------------------------------------------
// Obsidian syntax resolver
// ---------------------------------------------------------------------------

function resolveObsidian(content: string): string {
  // ![[image.ext]] or ![[path/to/image.ext]] → standard markdown image
  // A1 fix: extract basename so full-path references like ![[Arte/Retratos/Razas/Neutral/Thael.png]] resolve correctly
  content = content.replace(
    /!\[\[([^\]]+\.(png|jpe?g|gif|webp|svg))\]\]/gi,
    (_, filename: string) => {
      const basename = path.basename(filename)
      const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
      const src = _imageMap!.get(basename.toLowerCase()) ?? `${bp}/images/${basename}`
      // URL-encode spaces so remark parses paths like "Reinos - Ciudades/..." correctly
      const encodedSrc = src.replace(/ /g, '%20')
      return `![${basename}](${encodedSrc})`
    }
  )

  // [[Note|Alias]] or [[Note]] → markdown link (or plain text if unresolved)
  content = content.replace(/\[\[([^\]]+)\]\]/g, (_, inner: string) => {
    const [noteName, alias] = inner.split('|').map((s: string) => s.trim())
    const label = alias ?? noteName
    const linked = _titleMap!.get(toSlug(noteName))
    if (linked) return `[${label}](/wiki/${linked.slug.join('/')})`
    return `<span class="wiki-unresolved">${label}</span>`
  })

  return content
}

// ---------------------------------------------------------------------------
// Heading extraction (for TOC)
// ---------------------------------------------------------------------------

// Parses h2/h3 tags from rendered HTML, injects id= attributes, and returns
// both the modified HTML and an array of headings for the TOC.
export function extractHeadings(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = []
  const seen = new Map<string, number>()

  const processed = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const level = parseInt(tag[1]) as 2 | 3
      const text = inner.replace(/<[^>]+>/g, '').trim()
      const base = toSlug(text)
      const count = seen.get(base) ?? 0
      const id = count === 0 ? base : `${base}-${count}`
      seen.set(base, count + 1)
      headings.push({ id, text, level })
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
    },
  )

  return { html: processed, headings }
}
