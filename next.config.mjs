/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const BASE_PATH = isGitHubActions ? '/Aethorn-Wiki' : ''

const nextConfig = {
  output: 'export',
  // basePath is only needed on GitHub Pages (/Aethorn-Wiki).
  // In local dev (and any other host) it stays empty so the app
  // serves from / as normal.
  basePath: BASE_PATH,
  // Expose to all server and client code at build time
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
