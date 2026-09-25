/**
 * URL builder untuk request frontend.
 *
 * Semua request ke backend dilakukan via API proxy Next.js (server-side)
 * untuk menghindari CORS issue. Tidak ada lagi referensi ke /web_api/.
 *
 * Backend utama: web.php → ApiController
 */

const BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_SIPKK_BACKEND_BASE_URL ||
  'https://alfredtakoi.net/villa-admin'
).replace(/\/+$/, '');

const FRONTEND_BASE_PATH = (
  process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_BASE_PATH || '/villa')
    : ''
).replace(/\/+$/, '');

/**
 * Base URL API backend (Yii2 ApiController).
 */
export function getApiBaseUrl(): string {
  return `${BACKEND_BASE_URL}/api`;
}

/**
 * Build URL langsung ke endpoint backend API.
 */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === '/api' || normalizedPath === '/api/') {
    return getApiBaseUrl();
  }

  if (normalizedPath.startsWith('/api/')) {
    return `${BACKEND_BASE_URL}${normalizedPath}`;
  }

  return `${getApiBaseUrl()}${normalizedPath}`;
}

/**
 * Resolves any media or asset URL to a valid, working absolute or base-path-prefixed URL.
 * Handles:
 * - Local uploads from DB (/booking-app/uploads/villa/... -> https://alfredtakoi.net/villa-admin/uploads/villa/...)
 * - Server uploads (/uploads/villa/... -> https://alfredtakoi.net/villa-admin/uploads/villa/...)
 * - Protocol-relative URLs (//alfredtakoi.net/... -> https://alfredtakoi.net/...)
 * - Static frontend assets (/villa-logo.png -> /villa/villa-logo.png)
 * - External URLs (https://images.unsplash.com/...)
 */
export function resolveMediaUrl(url?: string | null, fallback = '/villa-logo.png'): string {
  const target = (url || fallback || '').trim();
  if (!target) return `${FRONTEND_BASE_PATH}/villa-logo.png`;

  // Absolute URLs (http/https/data/blob)
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('data:') ||
    target.startsWith('blob:')
  ) {
    return target;
  }

  // Protocol-relative (e.g. //alfredtakoi.net/villa-admin/file-upload/...)
  if (target.startsWith('//')) {
    return `https:${target}`;
  }

  // Database stored path from Laragon local: /booking-app/uploads/...
  if (target.startsWith('/booking-app/uploads/')) {
    return `${BACKEND_BASE_URL}${target.replace('/booking-app', '')}`;
  }
  if (target.startsWith('booking-app/uploads/')) {
    return `${BACKEND_BASE_URL}/${target.replace('booking-app/', '')}`;
  }

  // Backend uploads: /uploads/...
  if (target.startsWith('/uploads/')) {
    return `${BACKEND_BASE_URL}${target}`;
  }
  if (target.startsWith('uploads/')) {
    return `${BACKEND_BASE_URL}/${target}`;
  }

  // Static assets located in Next.js public/ directory: prefix with FRONTEND_BASE_PATH
  const cleanPath = target.startsWith('/') ? target : `/${target}`;
  if (cleanPath.startsWith(`${FRONTEND_BASE_PATH}/`) || FRONTEND_BASE_PATH === '') {
    return cleanPath;
  }

  return `${FRONTEND_BASE_PATH}${cleanPath}`;
}

