import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isExport = isProd && process.env.NEXT_EXPORT === 'true';
const backendBaseUrl = (
  process.env.SIPKK_BACKEND_BASE_URL ||
  'https://alfredtakoi.net/villa-admin'
).replace(/\/+$/, '');

// Development: http://localhost:3000 (root)
// Production: /villa (subfolder for cPanel hosting)
const basePath = isProd ? (process.env.NEXT_PUBLIC_BASE_PATH || '/villa') : '';

const nextConfig: NextConfig = {
  ...(isExport ? { output: 'export' } : {}),
  basePath: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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

