import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

const IMPULSE_MIN = 80; // px per down-impulse
const WINDOW_MS = 1200; // two impulses within
const AUTO_HIDE_MS = 4000;
const BOTTOM_SLACK = 24;

function isFormFocused(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return true;
  if (el.isContentEditable) return true;
  return false;
}

export function ScrollToBottom() {
  const [visible, setVisible] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const location = useLocation();

  const lastY = useRef(0);
  const impulseStart = useRef(0); // accumulated px since last reset
  const impulseStartedAt = useRef(0);
  const downCount = useRef(0);
  const downCountAt = useRef(0);
  const hideTimer = useRef<number | null>(null);

  // reset on route change
  useEffect(() => {
    setVisible(false);
    downCount.current = 0;
    impulseStart.current = 0;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastY.current = window.scrollY;

    const scheduleHide = () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      lastY.current = y;

      const doc = document.documentElement;
      const atBottom = y + window.innerHeight >= doc.scrollHeight - BOTTOM_SLACK;
      const longEnough = doc.scrollHeight > window.innerHeight * 1.6;

      if (atBottom || dy < 0) {
        setVisible(false);
        downCount.current = 0;
        impulseStart.current = 0;
        return;
      }

      if (!longEnough) return;
      if (document.body.dataset.menuOpen === "true") return;
      if (isFormFocused()) return;

      if (dy > 0) {
        const now = Date.now();
        if (now - impulseStartedAt.current > 250) {
          // new impulse window
          impulseStart.current = dy;
          impulseStartedAt.current = now;
        } else {
          impulseStart.current += dy;
        }
        if (impulseStart.current >= IMPULSE_MIN) {
          // count one impulse, reset accumulator
          impulseStart.current = 0;
          if (now - downCountAt.current > WINDOW_MS) {
            downCount.current = 1;
          } else {
            downCount.current += 1;
          }
          downCountAt.current = now;
          if (downCount.current >= 2) {
            setVisible(true);
            scheduleHide();
          }
        }
      }
    };

    const onMenu = () => setVisible(false);
    const onRefresh = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) setVisible(false);
    };
    const onFocus = () => {
      if (isFormFocused()) setVisible(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("steuerstoff:menu-open", onMenu);
    window.addEventListener("steuerstoff:refreshing", onRefresh);
    document.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("steuerstoff:menu-open", onMenu);
      window.removeEventListener("steuerstoff:refreshing", onRefresh);
      document.removeEventListener("focusin", onFocus);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const onClick = () => {
    setVisible(false);
    setShowHint(false);
    if (typeof window === "undefined") return;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Zum Ende der Seite scrollen"
      onClick={onClick}
      className="fixed right-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur transition-opacity duration-200 md:hidden"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 92px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,8px,0)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 200ms ease-out, transform 200ms ease-out",
      }}
    >
      <ChevronDown className="h-4 w-4" />
      {showHint && <span>Zum Ende</span>}
    </button>
  );
}
