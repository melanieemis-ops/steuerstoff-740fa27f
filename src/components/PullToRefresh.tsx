import { useEffect, useRef, useState, type ReactNode } from "react";

type Status = "idle" | "pull" | "ready" | "loading" | "done";

const FORM_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "OPTION"]);
function isFormTarget(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false;
  if (FORM_TAGS.has(el.tagName)) return true;
  if (
    el.closest(
      'input,textarea,select,button,[contenteditable="true"],[role="textbox"],[role="combobox"],[role="listbox"],[role="slider"]',
    )
  )
    return true;
  return false;
}

const THRESHOLD = 75;
const MAX_PULL = 110;
const DECISION_THRESHOLD = 12;
const RATIO_LOCK = 1.5;

type Direction = "unknown" | "vertical" | "blocked";

/**
 * Pull-to-Refresh with direction lock.
 * - Only engages at scrollY <= 0 AND when the gesture is clearly vertical
 *   (|dy| > |dx| * 1.5 after ~12 px movement).
 * - Horizontal / diagonal gestures are blocked → swipe-nav can run normally.
 * - Never preventDefault → vertical scrolling stays untouched.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [pull, setPull] = useState(0);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const startX = useRef(0);
  const startY = useRef(0);
  const direction = useRef<Direction>("unknown");
  const engaged = useRef(false); // committed to pull-to-refresh
  const refreshing = useRef(false);
  const pullRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      engaged.current = false;
      direction.current = "unknown";
      pullRef.current = 0;
      setPull(0);
      setStatus("idle");
    };

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing.current) return;
      if (e.touches.length !== 1) {
        direction.current = "blocked";
        return;
      }
      if (window.scrollY > 0) {
        direction.current = "blocked";
        return;
      }
      if (isFormTarget(e.target)) {
        direction.current = "blocked";
        return;
      }
      const t = e.touches[0];
      startX.current = t.clientX;
      startY.current = t.clientY;
      direction.current = "unknown";
      engaged.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (refreshing.current) return;
      if (direction.current === "blocked") return;
      if (e.touches.length > 1) {
        reset();
        direction.current = "blocked";
        return;
      }
      const t = e.touches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);

      // direction lock
      if (direction.current === "unknown") {
        if (ax < DECISION_THRESHOLD && ay < DECISION_THRESHOLD) return;
        if (ay > ax * RATIO_LOCK && dy > 0) {
          direction.current = "vertical";
          engaged.current = true;
        } else {
          // horizontal or diagonal → leave it to swipe-nav / scroll
          direction.current = "blocked";
          return;
        }
      }

      if (!engaged.current) return;
      if (window.scrollY > 0) {
        reset();
        return;
      }
      if (dy <= 0) {
        pullRef.current = 0;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPull(0);
          setStatus("idle");
        });
        return;
      }
      const damped = Math.min(MAX_PULL, dy * 0.5);
      pullRef.current = damped;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPull(damped);
        setStatus(damped >= THRESHOLD ? "ready" : "pull");
      });
    };

    const onTouchEnd = async () => {
      if (refreshing.current) return;
      const wasEngaged = engaged.current;
      const finalPull = pullRef.current;
      engaged.current = false;
      direction.current = "unknown";
      if (!wasEngaged) return;
      if (finalPull >= THRESHOLD) {
        refreshing.current = true;
        setStatus("loading");
        setPull(48);
        pullRef.current = 48;
        const timeout = new Promise<void>((_, rej) =>
          window.setTimeout(() => rej(new Error("timeout")), 5000),
        );
        try {
          await Promise.race([Promise.resolve(onRefreshRef.current()), timeout]);
          setStatus("done");
        } catch {
          setStatus("done");
        } finally {
          refreshing.current = false;
          setPull(0);
          pullRef.current = 0;
          window.setTimeout(() => setStatus("idle"), 900);
        }
      } else {
        setPull(0);
        pullRef.current = 0;
        setStatus("idle");
      }
    };

    const onCancel = () => {
      if (!refreshing.current) reset();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onCancel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const label =
    status === "loading"
      ? "Aktualisiere …"
      : status === "done"
        ? "Aktualisiert"
        : status === "ready"
          ? "Loslassen zum Aktualisieren"
          : "Zum Aktualisieren ziehen";

  const visible = pull > 0 || status === "loading" || status === "done";
  const easing = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <>
      <div
        aria-hidden={!visible}
        className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-center md:hidden"
        style={{
          transform: `translate3d(0, ${visible ? Math.max(8, pull - 8) : -40}px, 0)`,
          transition: status === "pull" || status === "ready" ? "none" : easing,
        }}
      >
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1 text-[11px] text-foreground shadow-sm backdrop-blur">
          <span
            className={`inline-block h-3 w-3 rounded-full border-2 border-foreground/30 ${
              status === "loading" ? "animate-spin border-t-foreground" : ""
            }`}
            style={{
              transform:
                status === "pull" || status === "ready"
                  ? `rotate(${Math.min(360, (pull / THRESHOLD) * 360)}deg)`
                  : undefined,
            }}
          />
          <span>{label}</span>
        </div>
      </div>
      <div
        style={{
          transform: `translate3d(0, ${pull * 0.4}px, 0)`,
          transition: status === "pull" || status === "ready" ? "none" : easing,
        }}
      >
        {children}
      </div>
    </>
  );
}
