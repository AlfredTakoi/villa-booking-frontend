import type { NextConfig } from "next";

const isExport = process.env.NEXT_EXPORT === 'true';
const backendBaseUrl = (
  process.env.SIPKK_BACKEND_BASE_URL ||
  'https://alfredtakoi.net/villa-admin'
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  ...(isExport ? { output: 'export' } : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    if (isExport) {
      return [];
    }
    return {
      fallback: [
        // Semua /api/* diteruskan ke backend Yii2 di Laragon
        {
          source: '/api/:path*',
          destination: `${backendBaseUrl}/api/:path*`,
        },
        // Static uploads dari backend Laragon
        {
          source: '/uploads/:path*',
          destination: `${backendBaseUrl}/uploads/:path*`,
        },
        {
          source: '/booking-app/uploads/:path*',
          destination: `${backendBaseUrl}/uploads/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

