import { Capacitor } from "@capacitor/core";

const DEFAULT_NATIVE_API_BASE_URL = "https://steuerstoff.com";

function withLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function withoutTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function apiUrl(path: string): string {
  const normalizedPath = withLeadingSlash(path);

  // Web requests stay on the currently deployed origin; native builds use the public API origin.
  if (!Capacitor.isNativePlatform()) {
    return normalizedPath;
  }

  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
  const base = envBase && envBase.length > 0 ? envBase : DEFAULT_NATIVE_API_BASE_URL;

  return `${withoutTrailingSlash(base)}${normalizedPath}`;
}

const DEFAULT_CHAT_API_BASE_URL = "https://steuerstoff.com";

/**
 * Chat-Endpunkt. Läuft immer über https://steuerstoff.com/api/chat,
 * optional überschreibbar per VITE_CHAT_API_BASE_URL. Keine workers.dev-Route
 * und kein api.steuerstoff.com (DNS nicht auflösbar).
 */
export function chatApiUrl(path = "/api/chat"): string {
  const configuredBase = import.meta.env.VITE_CHAT_API_BASE_URL?.trim();
  const isUnusable =
    !configuredBase ||
    configuredBase.length === 0 ||
    configuredBase.includes("api.steuerstoff.com") ||
    configuredBase.includes(".workers.dev");
  const usableBase = isUnusable ? DEFAULT_CHAT_API_BASE_URL : configuredBase;
  return `${withoutTrailingSlash(usableBase)}${withLeadingSlash(path)}`;
}

