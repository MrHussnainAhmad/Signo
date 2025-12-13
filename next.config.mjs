/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  // Ignore ESLint errors during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during production build (use with caution)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;