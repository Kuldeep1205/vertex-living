const BASE = import.meta.env.VITE_API_URL || 'https://vertex-living-server.onrender.com';

// Retry fetch with Render cold-start awareness
// Tries up to 3 times, waiting 8s between each attempt (handles ~30-60s wake-up)
export async function apiFetch(url, options = {}, retries = 3) {
  const fullUrl = url.startsWith('http') ? url : `${BASE}${url}`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(fullUrl, options);
      return res;
    } catch {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 8000));
      }
    }
  }
  throw new Error('Server not reachable after retries');
}

export const WA_NUMBER = '919876543210'; // WhatsApp number without +

export function whatsappLink(msg = '') {
  return `https://wa.me/${WA_NUMBER}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
}
