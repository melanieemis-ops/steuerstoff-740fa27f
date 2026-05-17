import { useEffect, useRef } from "react";

export interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // min horizontal px
  ratio?: number; // min |dx|/|dy| to count as horizontal
  enabled?: boolean;
}

/**
 * Attach swipe-left / swipe-right handlers to an element.
 * - Only touch (no mouse) → desktop unaffected
 * - Requires horizontal movement clearly stronger than vertical
 *   to not interfere with vertical scrolling
 */
export function useSwipeNavigation<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  opts: SwipeOptions,
) {
  const { onSwipeLeft, onSwipeRight, threshold = 60, ratio = 1.6, enabled = true } = opts;
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    // Touch-only: skip on devices without coarse pointer
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const dt = Date.now() - s.t;
      if (dt > 800) return; // too slow
      if (ax < threshold) return;
      if (ax < ay * ratio) return; // not horizontal enough
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold, ratio, enabled]);
}
