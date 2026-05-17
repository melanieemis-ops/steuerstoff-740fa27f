import { useEffect, useRef } from "react";

export interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // min horizontal px
  ratio?: number; // |dx| must be at least ratio × |dy|
  enabled?: boolean;
}

const FORM_TAGS = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "OPTION",
  "LABEL",
]);

function isFormTarget(t: EventTarget | null): boolean {
  if (!(t instanceof Element)) return false;
  if (FORM_TAGS.has(t.tagName)) return true;
  if (t.getAttribute("contenteditable") === "true") return true;
  const role = t.getAttribute("role");
  if (
    role &&
    [
      "button",
      "checkbox",
      "radio",
      "switch",
      "menuitem",
      "option",
      "combobox",
      "listbox",
      "textbox",
      "slider",
    ].includes(role)
  )
    return true;
  const closest = t.closest(
    'input,textarea,select,button,[contenteditable="true"],[role="button"],[role="combobox"],[role="listbox"],[role="slider"],[role="textbox"],[role="menuitem"],[data-no-swipe="true"],[data-radix-scroll-area-viewport],[data-vaul-drawer]',
  );
  return Boolean(closest);
}

type Direction = "unknown" | "horizontal" | "vertical" | "blocked";
const DECISION_THRESHOLD = 12; // px before locking direction
const RATIO_LOCK = 1.5;

/**
 * Horizontal swipe handler with direction lock.
 * - Decides direction after ~12 px movement, then sticks with it.
 * - Vertical / diagonal gestures never trigger a swipe (they belong to scroll
 *   or pull-to-refresh).
 * - Suppressed inside form controls.
 * - Callbacks are read from a ref so re-renders don't tear down listeners
 *   mid-gesture.
 */
export function useSwipeNavigation<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  opts: SwipeOptions,
) {
  const { threshold = 60, ratio = RATIO_LOCK, enabled = true } = opts;
  const cbRef = useRef(opts);
  cbRef.current = opts;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) return;

    let startX = 0;
    let startY = 0;
    let startedAt = 0;
    let direction: Direction = "unknown";
    let active = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        active = false;
        direction = "blocked";
        return;
      }
      if (isFormTarget(e.target)) {
        active = false;
        direction = "blocked";
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startedAt = Date.now();
      direction = "unknown";
      active = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active) return;
      if (e.touches.length > 1) {
        active = false;
        direction = "blocked";
        return;
      }
      if (direction !== "unknown") return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < DECISION_THRESHOLD && ay < DECISION_THRESHOLD) return;
      if (ax > ay * ratio) {
        direction = "horizontal";
      } else if (ay > ax * ratio) {
        direction = "vertical";
      } else {
        // diagonal — neither; let the page scroll naturally
        direction = "blocked";
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!active) {
        direction = "unknown";
        return;
      }
      const wasHorizontal = direction === "horizontal";
      active = false;
      direction = "unknown";
      if (!wasHorizontal) return;
      const dt = Date.now() - startedAt;
      if (dt > 800) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < threshold) return;
      if (Math.abs(dx) < Math.abs(dy) * ratio) return;
      if (dx < 0) cbRef.current.onSwipeLeft?.();
      else cbRef.current.onSwipeRight?.();
    };

    const onCancel = () => {
      active = false;
      direction = "unknown";
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, [ref, enabled, threshold, ratio]);
}
