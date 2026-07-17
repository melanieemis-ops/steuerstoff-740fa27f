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

/*
 * Die Karte öffnet nun bereits nach einem kurzen,
 * deutlichen Hochziehen. Ein schneller Flick reicht
 * ebenfalls aus.
 */
const OPEN_THRESHOLD_MIN = 54;
const OPEN_THRESHOLD_RATIO = 0.1;
const OPEN_VELOCITY = 0.45;
const DIRECTION_LOCK_DISTANCE = 8;
const EXIT_DURATION = 520;

function storageForMode(
  mode: WelcomeMode,
): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (mode === "session") {
    return window.sessionStorage;
  }

  if (mode === "once") {
    return window.localStorage;
  }

  return null;
}

function shouldShowWelcome(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (!window.matchMedia(MOBILE_MEDIA).matches) {
    return false;
  }

  if (WELCOME_SCREEN_MODE === "always") {
    return true;
  }

  return (
    storageForMode(WELCOME_SCREEN_MODE)?.getItem(
      STORAGE_KEY,
    ) !== "1"
  );
}

export function MobileWelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);

  const activePointerRef =
    useRef<number | null>(null);
  const directionRef = useRef<
    "unknown" | "vertical" | "horizontal"
  >("unknown");

  const frameRef =
    useRef<number | null>(null);
  const pendingDragRef = useRef(0);
  const exitTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    setVisible(shouldShowWelcome());
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const previousHtmlOverflow =
      document.documentElement.style.overflow;
    const previousBodyOverflow =
      document.body.style.overflow;

    document.documentElement.style.overflow =
      "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow =
        previousHtmlOverflow;
      document.body.style.overflow =
        previousBodyOverflow;
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      if (exitTimerRef.current !== null) {
        window.clearTimeout(
          exitTimerRef.current,
        );
      }
    };
  }, []);

  const commitDrag = useCallback(
    (next: number) => {
      pendingDragRef.current = next;

      if (frameRef.current !== null) {
        return;
      }

      frameRef.current =
        window.requestAnimationFrame(() => {
          setDragY(pendingDragRef.current);
          frameRef.current = null;
        });
    },
    [],
  );

  const finishOpen = useCallback(() => {
    if (leaving) {
      return;
    }

    activePointerRef.current = null;
    directionRef.current = "unknown";
    setDragging(false);
    setLeaving(true);

    storageForMode(
      WELCOME_SCREEN_MODE,
    )?.setItem(STORAGE_KEY, "1");

    if (exitTimerRef.current !== null) {
      window.clearTimeout(
        exitTimerRef.current,
      );
    }

    exitTimerRef.current =
      window.setTimeout(() => {
        setVisible(false);
        setDragY(0);
        pendingDragRef.current = 0;
        setLeaving(false);
        exitTimerRef.current = null;
      }, EXIT_DURATION);
  }, [leaving]);

  const resetDrag = useCallback(() => {
    activePointerRef.current = null;
    directionRef.current = "unknown";
    pendingDragRef.current = 0;
    setDragging(false);
    setDragY(0);
  }, []);

  function onPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (leaving) {
      return;
    }

    const now = performance.now();

    activePointerRef.current =
      event.pointerId;
    startYRef.current = event.clientY;
    startXRef.current = event.clientX;
    startTimeRef.current = now;
    lastYRef.current = event.clientY;
    lastTimeRef.current = now;
    directionRef.current = "unknown";

    pendingDragRef.current = 0;
    setDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function onPointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      !dragging ||
      activePointerRef.current !==
        event.pointerId ||
      leaving
    ) {
      return;
    }

    const deltaY =
      event.clientY - startYRef.current;
    const deltaX =
      event.clientX - startXRef.current;

    if (directionRef.current === "unknown") {
      if (
        Math.abs(deltaX) <
          DIRECTION_LOCK_DISTANCE &&
        Math.abs(deltaY) <
          DIRECTION_LOCK_DISTANCE
      ) {
        return;
      }

      directionRef.current =
        Math.abs(deltaY) >
          Math.abs(deltaX) &&
        deltaY < 0
          ? "vertical"
          : "horizontal";
    }

    if (
      directionRef.current !== "vertical"
    ) {
      return;
    }

    /*
     * Nur Hochziehen. Durch die leichte
     * Verstärkung fühlt sich die Karte weniger
     * schwer an und erreicht früher den Snap.
     */
    const nextDrag = Math.min(
      0,
      deltaY * 1.08,
    );

    const now = performance.now();
    lastYRef.current = event.clientY;
    lastTimeRef.current = now;

    commitDrag(nextDrag);
  }

  function onPointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      activePointerRef.current !==
      event.pointerId
    ) {
      return;
    }

    const now = performance.now();
    const elapsed = Math.max(
      1,
      now - startTimeRef.current,
    );
    const totalDistance =
      startYRef.current - event.clientY;
    const averageVelocity =
      totalDistance / elapsed;

    /*
     * pendingDragRef statt dragY:
     * Dadurch wird immer die tatsächliche,
     * aktuellste Fingerposition geprüft.
     */
    const finalPull = Math.abs(
      pendingDragRef.current,
    );

    const threshold = Math.max(
      OPEN_THRESHOLD_MIN,
      window.innerHeight *
        OPEN_THRESHOLD_RATIO,
    );

    const fastUpwardFlick =
      averageVelocity >= OPEN_VELOCITY &&
      totalDistance > 18;

    if (
      directionRef.current === "vertical" &&
      (finalPull >= threshold ||
        fastUpwardFlick)
    ) {
      finishOpen();
      return;
    }

    /*
     * Tap-Fallback: Wer nicht wischt, sondern
     * einfach irgendwo auf den Welcome-Screen
     * tippt, öffnet die App ebenfalls. Verhindert,
     * dass das Overlay die gesamte App blockiert,
     * wenn die Wisch-Geste nicht erkannt wird.
     */
    const totalMovement = Math.hypot(
      event.clientX - startXRef.current,
      event.clientY - startYRef.current,
    );
    if (
      directionRef.current === "unknown" &&
      totalMovement < DIRECTION_LOCK_DISTANCE &&
      elapsed < 500
    ) {
      finishOpen();
      return;
    }

    resetDrag();
  }


  function onPointerCancel() {
    /*
     * Ein von iOS abgebrochener Pointer darf
     * den Welcome-Screen niemals schließen.
     */
    resetDrag();
  }

  if (!visible) {
    return null;
  }

  const reducedMotion =
    typeof window !== "undefined" &&
    window
      .matchMedia(
        "(prefers-reduced-motion: reduce)",
      )
      .matches;

  const translateY = leaving
    ? "-105dvh"
    : `${dragY}px`;

  const viewportHeight =
    typeof window !== "undefined"
      ? Math.max(window.innerHeight, 1)
      : 1;

  const opacity = leaving
    ? 0
    : Math.max(
        0.82,
        1 -
          (Math.abs(dragY) /
            viewportHeight) *
            0.3,
      );

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
            ? "transform 80ms ease, opacity 100ms ease"
            : leaving
              ? `transform ${EXIT_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms ease`
              : "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Willkommen bei steuerstoff"
    >
      <div
        className="steuerstoff-welcome-glow"
        aria-hidden="true"
      />

      <main className="steuerstoff-welcome-content">
        <section
          className="steuerstoff-welcome-brand"
          aria-label="steuerstoff"
        >
          <div
            className="steuerstoff-welcome-logo"
            aria-hidden="true"
          >
            <span>§</span>
          </div>

          <h1>steuerstoff</h1>

          <p className="steuerstoff-welcome-byline">
            by Melanie Misakian
          </p>

          <div className="steuerstoff-welcome-copy">
            <h2>Willkommen</h2>
            <p>
              Dein steuerlicher
              Arbeitsassistent.
            </p>
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
          <span
            className="steuerstoff-welcome-handle"
            aria-hidden="true"
          />

          <ArrowUp
            className="steuerstoff-welcome-arrow"
            aria-hidden="true"
          />

          <span>Nach oben wischen</span>
        </button>
      </main>
    </div>
  );
}