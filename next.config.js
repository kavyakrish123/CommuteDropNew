/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For Capacitor, we'll use regular build (not static export) due to dynamic routes
  // The build output will be in .next directory
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

