import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
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
    const backendUrl = process.env.BACKEND_URL || 'http://Suyu-repair-backend-env.eba-dx67sygm.ap-northeast-2.elasticbeanstalk.com';
    return [
      { source: '/socket.io/:path*', destination: `${backendUrl}/socket.io/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
