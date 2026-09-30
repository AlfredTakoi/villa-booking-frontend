/**
 * URL builder untuk request frontend.
 *
 * Semua request ke backend dilakukan via API proxy Next.js (server-side)
 * untuk menghindari CORS issue. Tidak ada lagi referensi ke /web_api/.
 *
 * Backend utama: web.php → ApiController
 */

export function getBackendBaseUrl(): string {
  // Prioritas 1: Deteksi runtime browser langsung dari URL yang sedang diakses
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('alfredtakoi.net')) {
      return 'https://alfredtakoi.net/villa-admin';
    }
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
      return 'http://localhost/booking-app';
    }
  }

  // Prioritas 2: Environment variables
  if (process.env.NEXT_PUBLIC_SIPKK_BACKEND_BASE_URL) {
    const envUrl = process.env.NEXT_PUBLIC_SIPKK_BACKEND_BASE_URL.replace(/\/+$/, '');
    if (envUrl) return envUrl;
  }

  return 'https://alfredtakoi.net/villa-admin';
}

const FRONTEND_BASE_PATH = (
  process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_BASE_PATH || '/villa')
    : ''
).replace(/\/+$/, '');

/**
 * Base URL API backend (Yii2 ApiController).
 */
export function getApiBaseUrl(): string {
  return `${getBackendBaseUrl()}/api`;
}

/**
 * Build URL langsung ke endpoint backend API.
 */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getBackendBaseUrl();

  if (normalizedPath === '/api' || normalizedPath === '/api/') {
    return getApiBaseUrl();
  }

  if (normalizedPath.startsWith('/api/')) {
    return `${base}${normalizedPath}`;
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
  let target = (url || fallback || '').trim();
  if (!target) return `${FRONTEND_BASE_PATH}/villa-logo.png`;

  // Fix HTTPS di localhost (Laragon berjalan di HTTP port 80, bukan HTTPS)
  if (target.startsWith('https://localhost') || target.startsWith('https://127.0.0.1')) {
    target = target.replace(/^https:/, 'http:');
  }

  // Absolute URLs (http/https/data/blob)
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('data:') ||
    target.startsWith('blob:')
  ) {
    return target;
  }

  // Protocol-relative (e.g. //localhost/... atau //alfredtakoi.net/...)
  if (target.startsWith('//')) {
    if (
      target.startsWith('//localhost') ||
      target.startsWith('//127.0.0.1') ||
      (typeof window !== 'undefined' && window.location.protocol === 'http:')
    ) {
      return `http:${target}`;
    }
    return `https:${target}`;
  }

  const base = getBackendBaseUrl();

  // Backend uploads: matches /villa-admin/uploads/..., /booking-app/uploads/..., /uploads/..., uploads/...
  const uploadsMatch = target.match(/(?:^|\/)(uploads\/[^\s]+)/);
  if (uploadsMatch) {
    const uploadPath = uploadsMatch[1];
    return `${base}/${uploadPath}`;
  }

  // Backend app assets: matches /villa-admin/app_asset/..., /booking-app/app_asset/..., app_asset/...
  const appAssetMatch = target.match(/(?:^|\/)(app_asset\/[^\s]+)/);
  if (appAssetMatch) {
    const assetPath = appAssetMatch[1];
    return `${base}/${assetPath}`;
  }

  // Backend file-upload render: matches /villa-admin/file-upload/..., file-upload/...
  const fileUploadMatch = target.match(/(?:^|\/)(file-upload\/[^\s]+)/);
  if (fileUploadMatch) {
    const fileUploadPath = fileUploadMatch[1];
    return `${base}/${fileUploadPath}`;
  }

  // Static assets located in Next.js public/ directory: prefix with FRONTEND_BASE_PATH
  const cleanPath = target.startsWith('/') ? target : `/${target}`;
  if (cleanPath.startsWith(`${FRONTEND_BASE_PATH}/`) || FRONTEND_BASE_PATH === '') {
    return cleanPath;
  }

  return `${FRONTEND_BASE_PATH}${cleanPath}`;
}

