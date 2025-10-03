// lib/config.ts
// Central configuration for core API base URL
// Prefer env override if provided. Runtimes (Vercel) should expose NEXT_PUBLIC_CORE_API_BASE.

export const CORE_BASE: string = process.env.NEXT_PUBLIC_CORE_API_BASE || "https://nuroki.duckdns.org";

export const coreUrl = (path: string): string => {
  if (!path) return CORE_BASE;
  return `${CORE_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};
