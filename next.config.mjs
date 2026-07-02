/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/roadtrip',
        destination: '/trips/na-road-trip-2026',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
