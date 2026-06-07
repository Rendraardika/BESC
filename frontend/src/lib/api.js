const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || 'Request gagal');
  }
  return body.data;
}

export function saveAuthSession(auth) {
  localStorage.setItem('besc_token', auth.token);
  localStorage.setItem('besc_user', JSON.stringify(auth.user));
}

export function clearAuthSession() {
  localStorage.removeItem('besc_token');
  localStorage.removeItem('besc_user');
}
