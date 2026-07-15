import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowUp } from "lucide-react";

type WelcomeMode = "always" | "session" | "once";

const WELCOME_SCREEN_MODE: WelcomeMode = "session";
const STORAGE_KEY = "steuerstoff_welcome_seen";
const MOBILE_MEDIA = "(max-width: 767px)";
const OPEN_THRESHOLD_MIN = 128;
const OPEN_THRESHOLD_RATIO = 0.22;

function storageForMode(mode: WelcomeMode): Storage | null {
  if (typeof window === "undefined") return null;
  if (mode === "session") return window.sessionStorage;
  if (mode === "once") return window.localStorage;
  return null;
}

function shouldShowWelcome(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia(MOBILE_MEDIA).matches) return false;
  if (WELCOME_SCREEN_MODE === "always") return true;
  return storageForMode(WELCOME_SCREEN_MODE)?.getItem(STORAGE_KEY) !== "1";
}

export function MobileWelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const activePointerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingDragRef = useRef(0);

  useEffect(() => {
    setVisible(shouldShowWelcome());
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [visible]);

  const commitDrag = useCallback((next: number) => {
    pendingDragRef.current = next;
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      setDragY(pendingDragRef.current);
      frameRef.current = null;
    });
  }, []);

  const finishOpen = useCallback(() => {
    if (leaving) return;
    setDragging(false);
    setLeaving(true);
    storageForMode(WELCOME_SCREEN_MODE)?.setItem(STORAGE_KEY, "1");

    window.setTimeout(() => {
      setVisible(false);
      setDragY(0);
      setLeaving(false);
    }, 720);
  }, [leaving]);

  const resetDrag = useCallback(() => {
    setDragging(false);
    setDragY(0);
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (leaving) return;
    activePointerRef.current = event.pointerId;
    startYRef.current = event.clientY;
    startXRef.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || activePointerRef.current !== event.pointerId || leaving) return;

    const deltaY = event.clientY - startYRef.current;
    const deltaX = event.clientX - startXRef.current;

    // Horizontale Gesten niemals übernehmen.
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) return;

    // Nur Hochziehen erlauben, nie nach unten oder seitlich.
    commitDrag(Math.min(0, deltaY));
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (activePointerRef.current !== event.pointerId) return;
    activePointerRef.current = null;

    const threshold = Math.max(
      OPEN_THRESHOLD_MIN,
      window.innerHeight * OPEN_THRESHOLD_RATIO,
    );

    if (Math.abs(dragY) >= threshold) finishOpen();
    else resetDrag();
  }

  if (!visible) return null;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const translateY = leaving ? "-105dvh" : `${dragY}px`;
  const opacity = leaving
    ? 0
    : Math.max(0.78, 1 - Math.abs(dragY) / Math.max(window.innerHeight, 1) * 0.35);

  return (
    <div
      className={[
        "steuerstoff-mobile-welcome",
        dragging ? "is-dragging" : "",
        leaving ? "is-leaving" : "",
      ].join(" ")}
      style={{
        transform: `translate3d(0, ${translateY}, 0)`,
        opacity,
        transition: dragging
          ? "none"
          : reducedMotion
            ? "transform 120ms ease, opacity 100ms ease"
            : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Willkommen bei steuerstoff"
    >
      <div className="steuerstoff-welcome-glow" aria-hidden="true" />

      <main className="steuerstoff-welcome-content">
        <section className="steuerstoff-welcome-brand" aria-label="steuerstoff">
          <div className="steuerstoff-welcome-logo" aria-hidden="true">
            <span>§</span>
          </div>

          <h1>steuerstoff</h1>
          <p className="steuerstoff-welcome-byline">by Melanie Misakian</p>

          <div className="steuerstoff-welcome-copy">
            <h2>Willkommen</h2>
            <p>Dein steuerlicher Arbeitsassistent.</p>
          </div>
        </section>

        <button
          type="button"
          className="steuerstoff-welcome-open"
          onClick={(event) => {
            event.stopPropagation();
            finishOpen();
          }}
          aria-label="steuerstoff öffnen"
        >
          <span className="steuerstoff-welcome-handle" aria-hidden="true" />
          <ArrowUp className="steuerstoff-welcome-arrow" aria-hidden="true" />
          <span>Nach oben wischen</span>
        </button>
      </main>
    </div>
  );
}
