import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chronivs/shared', '@chronivs/ui'],
  async rewrites() {
    const backendUrl =
      process.env.ADMIN_API_INTERNAL_URL ??
      process.env.BACKEND_URL ??
      'http://localhost:8000';

    return [
      {
        source: '/api/v1/admin/:path*',
        destination: `${backendUrl}/api/v1/admin/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'zustand',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
