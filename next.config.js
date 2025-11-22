/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use static export when building for Capacitor (via CAPACITOR_BUILD env var)
  ...(process.env.CAPACITOR_BUILD === 'true' && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

