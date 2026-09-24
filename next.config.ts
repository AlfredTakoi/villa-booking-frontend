import type { NextConfig } from "next";

const backendBaseUrl = (
  process.env.SIPKK_BACKEND_BASE_URL ||
  'http://localhost/booking-app'
).replace(/\/+$/, '')

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
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
    }
  },
};

export default nextConfig;
