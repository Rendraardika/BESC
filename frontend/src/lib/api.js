export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1');

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const timeoutMs = options.timeoutMs || 10000;
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
    if (error.name === 'AbortError') {
      throw new Error('Permintaan ke server terlalu lama. Coba lagi sebentar.');
    }
    throw new Error(`Tidak bisa terhubung ke server API (${API_URL}). Pastikan backend berjalan dan VITE_API_URL sudah benar.`);
  } finally {
    window.clearTimeout(timeoutId);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || 'Request gagal');
  }
  return body.data;
}

export function saveAuthSession(auth) {
  localStorage.removeItem('besc_token');
  localStorage.removeItem('besc_admin_token');
  localStorage.removeItem('besc_admin');
  localStorage.setItem('besc_user', JSON.stringify(auth.user));
}

export function clearAuthSession() {
  localStorage.removeItem('besc_token');
  localStorage.removeItem('besc_admin_token');
  localStorage.removeItem('besc_user');
  localStorage.removeItem('besc_admin');
}
