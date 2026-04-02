/**
 * basePath-aware fetch wrapper.
 * In client components, native fetch("/api/...") ignores Next.js basePath.
 * This helper prepends it automatically.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // Only prefix paths that start with /
  const url = path.startsWith("/") ? `${basePath}${path}` : path;
  return fetch(url, init);
}
