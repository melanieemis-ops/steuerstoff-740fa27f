import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Status =
  | "idle"
  | "pull"
  | "ready"
  | "loading"
  | "done";

type Direction =
  | "unknown"
  | "vertical"
  | "blocked";

const FORM_TAGS = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "OPTION",
]);

const THRESHOLD = 64;
const MAX_PULL = 96;
const DECISION_THRESHOLD = 10;
const RATIO_LOCK = 1.25;
const REFRESH_TIMEOUT = 6000;

function isFormTarget(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (FORM_TAGS.has(target.tagName)) {
    return true;
  }

  return Boolean(
    target.closest(
      [
        "input",
        "textarea",
        "select",
        "button",
        '[contenteditable="true"]',
        '[role="textbox"]',
        '[role="combobox"]',
        '[role="listbox"]',
        '[role="slider"]',
        '[data-no-pull-refresh="true"]',
      ].join(","),
    ),
  );
}

function isAtPageTop(): boolean {
  return (
    window.scrollY <= 1 &&
    document.documentElement.scrollTop <= 1
  );
}

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [status, setStatus] =
    useState<Status>("idle");
  const [pull, setPull] = useState(0);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const startX = useRef(0);
  const startY = useRef(0);
  const pullRef = useRef(0);

  const direction =
    useRef<Direction>("unknown");
  const engaged = useRef(false);
  const refreshing = useRef(false);
  const rafRef = useRef<number | null>(null);
  const doneTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    const cancelFrame = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const cancelDoneTimer = () => {
      if (doneTimerRef.current !== null) {
        window.clearTimeout(
          doneTimerRef.current,
        );
        doneTimerRef.current = null;
      }
    };

    const publishRefreshing = (
      value: boolean,
    ) => {
      window.dispatchEvent(
        new CustomEvent(
          "steuerstoff:refreshing",
          {
            detail: value,
          },
        ),
      );
    };

    const updatePull = (
      nextPull: number,
      nextStatus: Status,
    ) => {
      pullRef.current = nextPull;
      cancelFrame();

      rafRef.current =
        requestAnimationFrame(() => {
          setPull(nextPull);
          setStatus(nextStatus);
          rafRef.current = null;
        });
    };

    const resetGesture = (
      force = false,
    ) => {
      if (refreshing.current && !force) {
        return;
      }

      cancelFrame();
      engaged.current = false;
      direction.current = "unknown";
      pullRef.current = 0;
      setPull(0);
      setStatus("idle");
    };

    const blockGesture = () => {
      engaged.current = false;
      direction.current = "blocked";
      pullRef.current = 0;
      setPull(0);
      setStatus("idle");
    };

    const onTouchStart = (
      event: TouchEvent,
    ) => {
      if (refreshing.current) {
        return;
      }

      resetGesture();

      if (
        event.touches.length !== 1 ||
        !isAtPageTop() ||
        document.body.dataset.menuOpen ===
          "true" ||
        isFormTarget(event.target)
      ) {
        blockGesture();
        return;
      }

      const touch = event.touches[0];

      startX.current = touch.clientX;
      startY.current = touch.clientY;
      direction.current = "unknown";
    };

    const onTouchMove = (
      event: TouchEvent,
    ) => {
      if (
        refreshing.current ||
        direction.current === "blocked"
      ) {
        return;
      }

      if (event.touches.length !== 1) {
        blockGesture();
        return;
      }

      const touch = event.touches[0];
      const dx =
        touch.clientX - startX.current;
      const dy =
        touch.clientY - startY.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (
        direction.current === "unknown"
      ) {
        if (
          absX < DECISION_THRESHOLD &&
          absY < DECISION_THRESHOLD
        ) {
          return;
        }

        const clearlyDownward =
          dy > 0 &&
          absY > absX * RATIO_LOCK &&
          isAtPageTop();

        if (!clearlyDownward) {
          blockGesture();
          return;
        }

        direction.current = "vertical";
        engaged.current = true;
      }

      if (
        !engaged.current ||
        !isAtPageTop()
      ) {
        resetGesture();
        return;
      }

      /*
       * Sobald die Geste eindeutig als
       * Pull-to-refresh erkannt wurde,
       * übernehmen wir sie selbst.
       * Dadurch konkurriert sie nicht mehr
       * mit dem iOS-Gummiband.
       */
      if (event.cancelable) {
        event.preventDefault();
      }

      if (dy <= 0) {
        updatePull(0, "idle");
        return;
      }

      const damped = Math.min(
        MAX_PULL,
        dy * 0.58,
      );

      updatePull(
        damped,
        damped >= THRESHOLD
          ? "ready"
          : "pull",
      );
    };

    const finishGesture = async () => {
      if (refreshing.current) {
        return;
      }

      const shouldRefresh =
        engaged.current &&
        pullRef.current >= THRESHOLD;

      engaged.current = false;
      direction.current = "unknown";

      if (!shouldRefresh) {
        updatePull(0, "idle");
        return;
      }

      refreshing.current = true;
      cancelDoneTimer();
      setStatus("loading");
      setPull(44);
      pullRef.current = 44;
      publishRefreshing(true);

      let timeoutId: number | undefined;

      const timeoutPromise =
        new Promise<void>((_, reject) => {
          timeoutId = window.setTimeout(
            () =>
              reject(
                new Error(
                  "Pull-to-refresh timeout",
                ),
              ),
            REFRESH_TIMEOUT,
          );
        });

      try {
        await Promise.race([
          Promise.resolve(
            onRefreshRef.current(),
          ),
          timeoutPromise,
        ]);
      } catch {
        // Auch bei einem Ladefehler darf
        // die Oberfläche niemals hängen.
      } finally {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }

        refreshing.current = false;
        publishRefreshing(false);
        setStatus("done");
        setPull(36);
        pullRef.current = 36;

        doneTimerRef.current =
          window.setTimeout(() => {
            setPull(0);
            pullRef.current = 0;
            setStatus("idle");
            doneTimerRef.current = null;
          }, 550);
      }
    };

    const onTouchEnd = () => {
      void finishGesture();
    };

    const onTouchCancel = () => {
      resetGesture();
    };

    const onPageInterruption = () => {
      refreshing.current = false;
      publishRefreshing(false);
      resetGesture(true);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        onPageInterruption();
      }
    };

    const onScroll = () => {
      if (
        !refreshing.current &&
        !isAtPageTop() &&
        engaged.current
      ) {
        resetGesture();
      }
    };

    const onMenuOpen = () => {
      resetGesture();
    };

    window.addEventListener(
      "touchstart",
      onTouchStart,
      {
        passive: true,
        capture: true,
      },
    );

    window.addEventListener(
      "touchmove",
      onTouchMove,
      {
        passive: false,
        capture: true,
      },
    );

    window.addEventListener(
      "touchend",
      onTouchEnd,
      {
        passive: true,
        capture: true,
      },
    );

    window.addEventListener(
      "touchcancel",
      onTouchCancel,
      {
        passive: true,
        capture: true,
      },
    );

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true },
    );

    window.addEventListener(
      "blur",
      onPageInterruption,
    );

    window.addEventListener(
      "pagehide",
      onPageInterruption,
    );

    window.addEventListener(
      "steuerstoff:menu-open",
      onMenuOpen,
    );

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "touchstart",
        onTouchStart,
        true,
      );

      window.removeEventListener(
        "touchmove",
        onTouchMove,
        true,
      );

      window.removeEventListener(
        "touchend",
        onTouchEnd,
        true,
      );

      window.removeEventListener(
        "touchcancel",
        onTouchCancel,
        true,
      );

      window.removeEventListener(
        "scroll",
        onScroll,
      );

      window.removeEventListener(
        "blur",
        onPageInterruption,
      );

      window.removeEventListener(
        "pagehide",
        onPageInterruption,
      );

      window.removeEventListener(
        "steuerstoff:menu-open",
        onMenuOpen,
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );

      cancelFrame();
      cancelDoneTimer();
      publishRefreshing(false);
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

  const visible =
    pull > 0 ||
    status === "loading" ||
    status === "done";

  const indicatorOffset =
    status === "pull" ||
    status === "ready"
      ? Math.max(8, pull - 10)
      : status === "loading"
        ? 28
        : status === "done"
          ? 22
          : -44;

  return (
    <>
      <div
        aria-hidden={!visible}
        className={[
          "pointer-events-none fixed left-0 right-0 top-0 z-[70] flex justify-center md:hidden",
          visible
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
        style={{
          transform: `translate3d(0, ${indicatorOffset}px, 0)`,
          transition:
            status === "pull" ||
            status === "ready"
              ? "none"
              : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease",
        }}
      >
        <div className="mt-[calc(env(safe-area-inset-top)+0.5rem)] inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <span
            className={[
              "inline-block h-3 w-3 rounded-full border-2 border-foreground/25",
              status === "loading"
                ? "animate-spin border-t-foreground"
                : "",
            ].join(" ")}
            style={{
              transform:
                status === "pull" ||
                status === "ready"
                  ? `rotate(${Math.min(
                      360,
                      (pull / THRESHOLD) *
                        360,
                    )}deg)`
                  : undefined,
            }}
          />

          <span>{label}</span>
        </div>
      </div>

      {children}
    </>
  );
}