import { useEffect, useRef } from "react";

export interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // min horizontal px
  ratio?: number; // min |dx|/|dy| to count as horizontal
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
  // role-based controls (radix dropdowns, comboboxes etc.)
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
  // walk up a few levels for nested icons inside buttons / inputs
  const closest = t.closest(
    'input,textarea,select,button,[contenteditable="true"],[role="button"],[role="combobox"],[role="listbox"],[role="slider"],[role="textbox"],[role="menuitem"]',
  );
  return Boolean(closest);
}

/**
 * Attach swipe-left / swipe-right handlers to an element.
 * - Touch-only (coarse pointer) → desktop untouched
 * - Suppressed inside form controls so users can fill fields safely
 * - Single-touch only; ignores multi-touch / pinch
 * - Fires only after touchend with a clearly horizontal gesture
 *   (|dx| ≥ threshold AND |dx| ≥ ratio × |dy|)
 */
export function useSwipeNavigation<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  opts: SwipeOptions,
) {
  const { onSwipeLeft, onSwipeRight, threshold = 80, ratio = 1.7, enabled = true } = opts;
  const start = useRef<{ x: number; y: number; t: number; blocked: boolean } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) return;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        start.current = null;
        return;
      }
      const blocked = isFormTarget(e.target);
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now(), blocked };
    };
    const onMove = (e: TouchEvent) => {
      // cancel if a second finger lands during the gesture
      if (e.touches.length > 1) start.current = null;
    };
    const onEnd = (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || s.blocked) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const dt = Date.now() - s.t;
      if (dt > 800) return;
      if (ax < threshold) return;
      if (ax < ay * ratio) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", () => (start.current = null), { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold, ratio, enabled]);
}
