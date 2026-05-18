/**
 * Resolves a backend URL. In dev, VITE_API_BASE_URL is unset and Vite's proxy
 * forwards /api/* to the local Hono server. In prod, set VITE_API_BASE_URL to
 * the deployed Render URL (e.g. https://landmark-server.onrender.com).
 */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
