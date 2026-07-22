import { Capacitor } from "@capacitor/core";

// Guarded service-worker registration. Never registers in dev/preview/iframe/kill-switch.
// Emits a "steuerstoff:sw-update" CustomEvent when a new version is waiting.

const SW_PATH = "/sw.js";
const CACHE_CLEANUP_MARKER = "steuerstoff:cache-cleanup:2026-07-22-tts-fix";
const CACHE_NAME_FRAGMENTS = [
  "workbox",
  "html-nav",
  "static-assets",
  "images",
  "google-fonts",
  "steuerstoff-",
  "tanstack-start-app",
];

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  if (!import.meta.env.PROD) return true;
  if (Capacitor.isNativePlatform()) return true;
  try {
    if (window.top !== window.self) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") return true;
  return false;
}

async function unregisterMatching() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const scriptURL = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
      if (scriptURL.endsWith(SW_PATH)) await r.unregister();
    }
  } catch {
    /* noop */
  }
}

async function clearMatchingCaches(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;
  try {
    const names = await caches.keys();
    let deletedAny = false;
    for (const name of names) {
      if (CACHE_NAME_FRAGMENTS.some((fragment) => name.includes(fragment))) {
        await caches.delete(name);
        deletedAny = true;
      }
    }
    return deletedAny;
  } catch {
    return false;
  }
}

async function purgeStaleOfflineState(): Promise<void> {
  if (typeof window === "undefined") return;

  const hadServiceWorker = typeof navigator !== "undefined" && "serviceWorker" in navigator;
  if (hadServiceWorker) {
    await unregisterMatching();
  }
  const clearedCaches = await clearMatchingCaches();

  try {
    const alreadyReloaded = window.sessionStorage.getItem(CACHE_CLEANUP_MARKER) === "1";
    if ((hadServiceWorker || clearedCaches) && !alreadyReloaded) {
      window.sessionStorage.setItem(CACHE_CLEANUP_MARKER, "1");
      window.location.reload();
      return;
    }
  } catch {
    // ignore storage errors and continue without reload guard
  }
}

export async function registerSteuerstoffSW(): Promise<void> {
  await purgeStaleOfflineState();

  // Service Worker ist temporaer deaktiviert, bis alle alten TTS-Caches bereinigt sind.
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    await unregisterMatching();
  }
  return;

  if (shouldSkip()) {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      await unregisterMatching();
    }
    return;
  }
  try {
    const { Workbox } = await import("workbox-window");
    const wb = new Workbox(SW_PATH);
    wb.addEventListener("waiting", () => {
      const evt = new CustomEvent("steuerstoff:sw-update", {
        detail: {
          activate: () => {
            wb.addEventListener("controlling", () => window.location.reload());
            wb.messageSkipWaiting();
          },
        },
      });
      window.dispatchEvent(evt);
    });
    await wb.register();
  } catch (e) {
    console.warn("SW register failed", e);
  }
}
