import { Capacitor } from "@capacitor/core";

const DEFAULT_NATIVE_API_BASE_URL = "https://steuerstoff.com";
const DEFAULT_WEB_TTS_API_BASE_URL = "https://steuerstoff-740fa27f.melanieemis.workers.dev";
const TTS_PATHS = ["/api/text-to-speech", "/api/chat-tts"] as const;

function withLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function withoutTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function isTtsPath(path: string): boolean {
  return TTS_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function isSteuerstoffWebHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "steuerstoff.com" || host === "www.steuerstoff.com";
}

export function apiUrl(path: string): string {
  const normalizedPath = withLeadingSlash(path);

  if (!Capacitor.isNativePlatform() && isTtsPath(normalizedPath) && isSteuerstoffWebHost()) {
    const envBase = import.meta.env.VITE_TTS_API_BASE_URL?.trim();
    const base = envBase && envBase.length > 0 ? envBase : DEFAULT_WEB_TTS_API_BASE_URL;
    return `${withoutTrailingSlash(base)}${normalizedPath}`;
  }

  if (!Capacitor.isNativePlatform()) {
    return normalizedPath;
  }

  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
  const base = envBase && envBase.length > 0 ? envBase : DEFAULT_NATIVE_API_BASE_URL;

  return `${withoutTrailingSlash(base)}${normalizedPath}`;
}
