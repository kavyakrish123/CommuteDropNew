/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
  },
  // Enable static export for Capacitor builds
  ...(isCapacitorBuild && {
    output: 'export',
    trailingSlash: true,
  }),
}

module.exports = nextConfig

