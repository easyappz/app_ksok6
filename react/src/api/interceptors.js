import { instance } from './axios';

const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/games/open',
  '/api/leaderboard',
];

function resolvePath(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname + (u.search || '');
  } catch (e) {
    return url || '';
  }
}

function isPublic(url) {
  const path = resolvePath(url);
  for (let i = 0; i < PUBLIC_ENDPOINTS.length; i += 1) {
    const ep = PUBLIC_ENDPOINTS[i];
    if (path.startsWith(ep)) return true;
  }
  return false;
}

function isTokenExpired(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payloadB64Url = parts[1];
    let b64 = payloadB64Url.split('-').join('+').split('_').join('/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const json = atob(b64);
    const payload = JSON.parse(json);
    const now = Math.floor(Date.now() / 1000);
    if (!payload || typeof payload.exp !== 'number') return true;
    return payload.exp <= now;
  } catch (e) {
    return true;
  }
}

// Request interceptor: drop Authorization for public endpoints and drop expired/broken token before sending
instance.interceptors.request.use(
  (config) => {
    if (isPublic(config.url || '')) {
      if (config.headers) {
        delete config.headers['Authorization'];
        delete config.headers['authorization'];
      }
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      if (config.headers) delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: clear token on 401, and on 403 when details indicate auth issues
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail = (error?.response?.data && (error.response.data.detail || error.response.data.message)) || '';
    const detailStr = typeof detail === 'string' ? detail.toLowerCase() : '';

    const shouldClear = (
      status === 401 ||
      (status === 403 && (
        detailStr.includes('invalid') ||
        detailStr.includes('expired') ||
        detailStr.includes('authentication credentials were not provided')
      ))
    );

    if (shouldClear) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/login') {
        const next = encodeURIComponent(window.location.pathname);
        window.location.assign(`/login?next=${next}`);
      }
    }
    return Promise.reject(error);
  }
);
