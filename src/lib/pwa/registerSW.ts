// Guarded service-worker registration. Never registers in dev/preview/iframe/kill-switch.
// Emits a "steuerstoff:sw-update" CustomEvent when a new version is waiting.

const SW_PATH = "/sw.js";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  if (!import.meta.env.PROD) return true;
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

export async function registerSteuerstoffSW(): Promise<void> {
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
