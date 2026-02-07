import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'suyu-repair-uploads-thinkij.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path((?!auth).*)',
        // Use BACKEND_URL if available (server-side), otherwise fallback (local dev)
        destination: `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
