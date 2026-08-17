import { API_URL } from './api.js';

export const normalizePhotoSrc = (src) => {
  if (!src) return '';
  const value = String(src).trim();
  if (!value || value === 'null' || value === 'undefined') return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')) {
    return value;
  }
  const cleanPath = value.replace(/^public\//, '').replace(/^\/?uploads\//, '');
  const baseUrl = API_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}/uploads/${cleanPath}`;
};
