import { instance } from './axios';

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

// Request interceptor: drop expired/broken token before sending
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      if (config.headers) delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, clear token
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
