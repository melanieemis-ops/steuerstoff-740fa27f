import { useEffect, useRef, useState, type ReactNode } from "react";

type Status = "idle" | "pull" | "ready" | "loading" | "done";

const FORM_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "OPTION"]);
function isFormTarget(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false;
  if (FORM_TAGS.has(el.tagName)) return true;
  if (el.closest("input,textarea,select,button,[contenteditable=true],[role=textbox],[role=combobox],[role=listbox],[role=slider]")) return true;
  return false;
}

const THRESHOLD = 70;
const MAX_PULL = 110;

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);
  const active = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (window.scrollY > 0) return;
      if (isFormTarget(e.target)) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!active.current || startY.current == null) return;
      if (window.scrollY > 0) {
        active.current = false;
        setPull(0);
        setStatus("idle");
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPull(0);
        return;
      }
      // dampened
      const damped = Math.min(MAX_PULL, dy * 0.5);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPull(damped);
        setStatus(damped >= THRESHOLD ? "ready" : "pull");
      });
    };
    const onTouchEnd = async () => {
      if (!active.current) return;
      active.current = false;
      startY.current = null;
      if (status === "ready" || pull >= THRESHOLD) {
        setStatus("loading");
        setPull(48);
        try {
          await onRefresh();
        } catch {
          // swallow
        }
        setStatus("done");
        setPull(0);
        window.setTimeout(() => setStatus("idle"), 900);
      } else {
        setPull(0);
        setStatus("idle");
      }
    };
    const onCancel = () => {
      active.current = false;
      startY.current = null;
      setPull(0);
      setStatus("idle");
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
  }, [onRefresh, pull, status]);

  const label =
    status === "loading"
      ? "Aktualisiere …"
      : status === "done"
        ? "Aktualisiert"
        : status === "ready"
          ? "Loslassen zum Aktualisieren"
          : "Zum Aktualisieren ziehen";

  const visible = pull > 0 || status === "loading" || status === "done";

  return (
    <>
      <div
        aria-hidden={!visible}
        className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-center md:hidden"
        style={{
          transform: `translate3d(0, ${visible ? Math.max(8, pull - 8) : -40}px, 0)`,
          transition: status === "pull" || status === "ready" ? "none" : "transform 220ms ease",
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
          transition: status === "pull" || status === "ready" ? "none" : "transform 220ms ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
