export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8081/api/v1' : '/api/v1');

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const timeoutMs = options.timeoutMs || 15000;
  const retries = options.retries ?? MAX_RETRIES;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: options.credentials || 'include',
        signal: controller.signal,
        headers: {
          ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      window.clearTimeout(timeoutId);
      const isRetryable =
        error.name === 'AbortError' ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('ERR_CONNECTION');

      if (isRetryable && attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      if (error.name === 'AbortError') {
        throw new Error('Permintaan ke server terlalu lama. Silakan coba lagi.');
      }
      throw new Error('Tidak bisa terhubung ke server. Silakan periksa koneksi internet Anda dan coba lagi.');
    } finally {
      window.clearTimeout(timeoutId);
    }

    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) {
      if (response.status === 401 && attempt < retries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw new Error(body.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
    return body.data;
  }
}

export function saveAuthSession(auth) {
  localStorage.removeItem('besc_token');
  localStorage.removeItem('besc_admin_token');
  localStorage.removeItem('besc_admin');
  safeSetItem('besc_user', JSON.stringify(auth.user));
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    try {
      localStorage.clear();
      localStorage.setItem(key, value);
    } catch {
      // Silently ignore - app will work without localStorage cache
    }
  }
}

export function clearAuthSession() {
  localStorage.removeItem('besc_token');
  localStorage.removeItem('besc_admin_token');
  localStorage.removeItem('besc_user');
  localStorage.removeItem('besc_admin');
}
