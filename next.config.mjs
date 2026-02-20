/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'

const nextConfig = {
  output: 'export',
  // basePath is only needed on GitHub Pages (/Aethorn-Wiki).
  // In local dev (and any other host) it stays empty so the app
  // serves from / as normal.
  basePath: isGitHubActions ? '/Aethorn-Wiki' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
