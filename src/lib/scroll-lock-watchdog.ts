/**
 * Scroll-Lock Watchdog
 *
 * Overlays (Radix Dialog, custom sheets, ...) set body/html overflow to
 * "hidden" while open. If a component unmounts without restoring it — for
 * example after a router transition or a crash inside a portal — the whole
 * page becomes non-scrollable and unclickable. This watchdog runs a light
 * MutationObserver on `<body>` and `<html>` and undoes stray scroll locks
 * whenever no visible overlay/dialog is present in the DOM.
 */

let started = false;
let observer: MutationObserver | null = null;

const OVERLAY_SELECTOR = [
  '[data-state="open"][role="dialog"]',
  '[data-state="open"][data-radix-dialog-content]',
  '[data-state="open"][data-radix-sheet-content]',
  '[data-state="open"][data-radix-popper-content-wrapper]',
  "[data-scroll-lock-owner]",
].join(",");

function hasVisibleOverlay(): boolean {
  return !!document.querySelector(OVERLAY_SELECTOR);
}

function clearBodyLock() {
  const body = document.body;
  const html = document.documentElement;
  if (!body || !html) return;
  // Only touch obviously locking values; leave everything else alone.
  if (body.style.overflow === "hidden") body.style.overflow = "";
  if (body.style.position === "fixed") body.style.position = "";
  if (body.style.touchAction === "none") body.style.touchAction = "";
  if (html.style.overflow === "hidden") html.style.overflow = "";
  if (html.style.touchAction === "none") html.style.touchAction = "";
  // Radix marks the body while a Dialog is open.
  if (body.hasAttribute("data-scroll-locked") && !hasVisibleOverlay()) {
    body.removeAttribute("data-scroll-locked");
  }
}

function tick() {
  if (!hasVisibleOverlay()) clearBodyLock();
}

export function startScrollLockWatchdog(): () => void {
  if (started || typeof document === "undefined") return () => {};
  started = true;

  observer = new MutationObserver(() => {
    // Debounce to next frame; DOM churn during route transitions is heavy.
    window.requestAnimationFrame(tick);
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "data-state", "data-scroll-locked"],
  });

  // Also poll after visibility changes and route pops.
  const onVisibility = () => tick();
  const onPageShow = () => tick();
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("popstate", onPageShow);

  // Initial sweep.
  tick();

  return () => {
    started = false;
    observer?.disconnect();
    observer = null;
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("popstate", onPageShow);
  };
}
