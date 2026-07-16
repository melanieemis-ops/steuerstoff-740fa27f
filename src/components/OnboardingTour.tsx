import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, X } from "lucide-react";

const STORAGE_KEY = "steuerstoff.onboarding.v1";
const START_DELAY_MS = 520;
const TARGET_PADDING = 7;
const CARD_MARGIN = 16;
const ARROW_GAP = 28;

type TargetName = "learn" | "skr" | "menu";
type CompletionState = "completed" | "skipped";

type ViewportRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type CardPosition = {
  left: number;
  top: number;
  width: number;
  height: number;
  placement: "above" | "below";
};

type ArrowGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  path: string;
  head: string;
};

type Step = {
  target: TargetName;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
};

const STEPS: Step[] = [
  {
    target: "learn",
    eyebrow: "Lernen",
    title: "Dein persönlicher Lernbereich",
    description:
      "Hier kannst du lernen, Fragen beantworten und deinen Fortschritt verfolgen.",
    accent: "var(--magenta)",
  },
  {
    target: "skr",
    eyebrow: "SKR-Konverter",
    title: "Konten schnell zuordnen",
    description:
      "Hier wandelst du Konten zwischen SKR03, SKR04 und SKR42 um.",
    accent: "var(--cyan)",
  },
  {
    target: "menu",
    eyebrow: "Menü",
    title: "Alle Werkzeuge an einem Ort",
    description:
      "Hier findest du alle weiteren Werkzeuge, deinen Verlauf und die Einstellungen.",
    accent: "var(--violet)",
  },
];

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) !== 0 &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

function uniqueElements(elements: HTMLElement[]): HTMLElement[] {
  return Array.from(new Set(elements));
}

function findTarget(target: TargetName): HTMLElement | null {
  const selectors: Record<TargetName, string[]> = {
    learn: [
      '[data-onboarding-target="learn"]',
      'nav[aria-label="Mobile Navigation"] a[href="/lernen"]',
      'header nav a[href="/lernen"]',
    ],
    skr: [
      '[data-onboarding-target="skr"]',
      'nav[aria-label="Mobile Navigation"] a[href="/skr-konverter"]',
      'header nav a[href="/skr-konverter"]',
    ],
    menu: [
      '[data-onboarding-target="menu"]',
      'button[aria-label="Menü öffnen"]',
      'button[aria-label="Menü schließen"]',
      "header nav",
    ],
  };

  const candidates = uniqueElements(
    selectors[target].flatMap((selector) =>
      Array.from(
        document.querySelectorAll<HTMLElement>(selector),
      ),
    ),
  );

  return candidates.find(isVisible) ?? null;
}

function toViewportRect(rect: DOMRect): ViewportRect {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function makeArrowGeometry(
  card: CardPosition,
  target: ViewportRect,
): ArrowGeometry {
  const cardCenterX = card.left + card.width / 2;
  const targetCenterX = target.left + target.width / 2;

  const start =
    card.placement === "above"
      ? {
          x: cardCenterX,
          y: card.top + card.height - 2,
        }
      : {
          x: cardCenterX,
          y: card.top + 2,
        };

  const end =
    card.placement === "above"
      ? {
          x: targetCenterX,
          y: target.top - 5,
        }
      : {
          x: targetCenterX,
          y: target.bottom + 5,
        };

  const padding = 18;
  const left = Math.min(start.x, end.x) - padding;
  const top = Math.min(start.y, end.y) - padding;
  const width = Math.max(Math.abs(end.x - start.x) + padding * 2, 52);
  const height = Math.max(Math.abs(end.y - start.y) + padding * 2, 52);

  const startX = start.x - left;
  const startY = start.y - top;
  const endX = end.x - left;
  const endY = end.y - top;

  const direction = card.placement === "above" ? 1 : -1;
  const sideways = endX >= startX ? 1 : -1;

  const control1X = startX + 18 * sideways;
  const control1Y = startY + 22 * direction;
  const control2X = endX - 22 * sideways;
  const control2Y = endY - 22 * direction;

  const angle = Math.atan2(endY - control2Y, endX - control2X);
  const headLength = 10;
  const headSpread = Math.PI / 5;

  const head1X = endX - headLength * Math.cos(angle - headSpread);
  const head1Y = endY - headLength * Math.sin(angle - headSpread);
  const head2X = endX - headLength * Math.cos(angle + headSpread);
  const head2Y = endY - headLength * Math.sin(angle + headSpread);

  return {
    left,
    top,
    width,
    height,
    path: [
      `M ${startX} ${startY}`,
      `C ${control1X} ${control1Y},`,
      `${control2X} ${control2Y},`,
      `${endX} ${endY}`,
    ].join(" "),
    head: `M ${head1X} ${head1Y} L ${endX} ${endY} L ${head2X} ${head2Y}`,
  };
}

function onboardingAlreadyHandled(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "completed" || value === "skipped";
}

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] =
    useState<ViewportRect | null>(null);
  const [cardPosition, setCardPosition] =
    useState<CardPosition | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const updateTarget = useCallback(() => {
    if (!open) {
      return;
    }

    const element = findTarget(STEPS[stepIndex].target);

    if (!element) {
      setTargetRect(null);
      setCardPosition(null);
      return;
    }

    setTargetRect(toViewportRect(element.getBoundingClientRect()));
  }, [open, stepIndex]);

  const scheduleStart = useCallback(() => {
    if (startedRef.current || onboardingAlreadyHandled()) {
      return;
    }

    if (document.querySelector(".steuerstoff-mobile-welcome")) {
      return;
    }

    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }

    startTimerRef.current = window.setTimeout(() => {
      if (
        !onboardingAlreadyHandled() &&
        !document.querySelector(".steuerstoff-mobile-welcome")
      ) {
        previousFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        startedRef.current = true;
        setStepIndex(0);
        setOpen(true);
      }
    }, START_DELAY_MS);
  }, []);

  useEffect(() => {
    if (onboardingAlreadyHandled()) {
      return;
    }

    scheduleStart();

    const observer = new MutationObserver(() => {
      scheduleStart();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const restart = () => {
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
      }

      startedRef.current = true;
      setStepIndex(0);
      setTargetRect(null);
      setCardPosition(null);
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setOpen(true);
    };

    window.addEventListener(
      "steuerstoff:onboarding-restart",
      restart,
    );

    return () => {
      observer.disconnect();

      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
      }

      window.removeEventListener(
        "steuerstoff:onboarding-restart",
        restart,
      );
    };
  }, [scheduleStart]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousHtmlOverflow =
      document.documentElement.style.overflow;
    const previousBodyOverflow =
      document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    updateTarget();

    const handleViewportChange = () => {
      updateTarget();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener(
      "orientationchange",
      handleViewportChange,
    );
    window.addEventListener(
      "scroll",
      handleViewportChange,
      true,
    );

    window.visualViewport?.addEventListener(
      "resize",
      handleViewportChange,
    );
    window.visualViewport?.addEventListener(
      "scroll",
      handleViewportChange,
    );

    const observer = new MutationObserver(updateTarget);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const retry = window.setInterval(updateTarget, 350);

    return () => {
      document.documentElement.style.overflow =
        previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;

      window.removeEventListener(
        "resize",
        handleViewportChange,
      );
      window.removeEventListener(
        "orientationchange",
        handleViewportChange,
      );
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true,
      );

      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleViewportChange,
      );

      observer.disconnect();
      window.clearInterval(retry);
    };
  }, [open, updateTarget]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCardPosition(null);
    updateTarget();
  }, [open, stepIndex, updateTarget]);

  useLayoutEffect(() => {
    if (!open || !targetRect || !cardRef.current) {
      return;
    }

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportWidth =
      window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight =
      window.visualViewport?.height ?? window.innerHeight;

    let placement: "above" | "below" =
      targetRect.top > viewportHeight * 0.5 ? "above" : "below";

    let top =
      placement === "above"
        ? targetRect.top - cardRect.height - ARROW_GAP
        : targetRect.bottom + ARROW_GAP;

    const fitsAbove =
      targetRect.top - cardRect.height - ARROW_GAP >= CARD_MARGIN;
    const fitsBelow =
      targetRect.bottom + cardRect.height + ARROW_GAP <=
      viewportHeight - CARD_MARGIN;

    if (placement === "above" && !fitsAbove && fitsBelow) {
      placement = "below";
      top = targetRect.bottom + ARROW_GAP;
    } else if (placement === "below" && !fitsBelow && fitsAbove) {
      placement = "above";
      top = targetRect.top - cardRect.height - ARROW_GAP;
    }

    const left = clamp(
      targetRect.left +
        targetRect.width / 2 -
        cardRect.width / 2,
      CARD_MARGIN,
      Math.max(
        CARD_MARGIN,
        viewportWidth - cardRect.width - CARD_MARGIN,
      ),
    );

    top = clamp(
      top,
      CARD_MARGIN,
      Math.max(
        CARD_MARGIN,
        viewportHeight - cardRect.height - CARD_MARGIN,
      ),
    );

    setCardPosition({
      left,
      top,
      width: cardRect.width,
      height: cardRect.height,
      placement,
    });
  }, [open, stepIndex, targetRect]);

  const close = useCallback((state: CompletionState) => {
    window.localStorage.setItem(STORAGE_KEY, state);
    setOpen(false);
    setTargetRect(null);
    setCardPosition(null);

    window.setTimeout(() => {
      previousFocusRef.current?.focus();
    }, 0);
  }, []);

  const goNext = useCallback(() => {
    if (isLastStep) {
      close("completed");
      return;
    }

    setStepIndex((current) => current + 1);

    window.setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 0);
  }, [close, isLastStep]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close("skipped");
        return;
      }

      if (event.key !== "Tab" || !cardRef.current) {
        return;
      }

      const focusable = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 80);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [close, open]);

  const arrowGeometry = useMemo(() => {
    if (!cardPosition || !targetRect) {
      return null;
    }

    return makeArrowGeometry(cardPosition, targetRect);
  }, [cardPosition, targetRect]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const highlightStyle: CSSProperties | undefined = targetRect
    ? {
        left: targetRect.left - TARGET_PADDING,
        top: targetRect.top - TARGET_PADDING,
        width: targetRect.width + TARGET_PADDING * 2,
        height: targetRect.height + TARGET_PADDING * 2,
        borderColor: step.accent,
        borderRadius: Math.max(14, targetRect.height / 3),
      }
    : undefined;

  const cardStyle: CSSProperties = cardPosition
    ? {
        left: cardPosition.left,
        top: cardPosition.top,
        visibility: "visible",
      }
    : {
        left: CARD_MARGIN,
        top: CARD_MARGIN,
        visibility: "hidden",
      };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="steuerstoff-onboarding-title"
      aria-describedby="steuerstoff-onboarding-description"
    >
      <div
        className="absolute inset-0"
        aria-hidden="true"
      />

      {targetRect && (
        <div
          className="pointer-events-none fixed border-2 transition-[left,top,width,height] duration-300"
          style={{
            ...highlightStyle,
            boxShadow:
              "0 0 0 9999px rgba(3, 8, 20, 0.58), 0 0 0 5px color-mix(in oklab, currentColor 20%, transparent), 0 0 30px color-mix(in oklab, currentColor 45%, transparent)",
            color: step.accent,
          }}
          aria-hidden="true"
        />
      )}

      {arrowGeometry && (
        <svg
          key={step.target}
          className="pointer-events-none fixed overflow-visible"
          style={{
            left: arrowGeometry.left,
            top: arrowGeometry.top,
            width: arrowGeometry.width,
            height: arrowGeometry.height,
          }}
          viewBox={`0 0 ${arrowGeometry.width} ${arrowGeometry.height}`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d={arrowGeometry.path}
            pathLength="1"
            stroke={step.accent}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="steuerstoff-onboarding-arrow-line"
          />

          <path
            d={arrowGeometry.head}
            pathLength="1"
            stroke={step.accent}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="steuerstoff-onboarding-arrow-head"
          />
        </svg>
      )}

      <div
        ref={cardRef}
        className="fixed w-[calc(100vw-2rem)] max-w-[350px] rounded-[1.6rem] border border-border bg-card p-5 text-foreground shadow-2xl"
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: step.accent }}
            >
              {step.eyebrow}
            </p>

            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Schritt {stepIndex + 1} von {STEPS.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => close("skipped")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Einführung überspringen"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="steuerstoff-onboarding-title"
          className="mt-4 text-xl font-semibold tracking-tight"
        >
          {step.title}
        </h2>

        <p
          id="steuerstoff-onboarding-description"
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          {step.description}
        </p>

        <div
          className="mt-5 flex items-center gap-1.5"
          aria-label={`Schritt ${stepIndex + 1} von ${STEPS.length}`}
        >
          {STEPS.map((item, index) => (
            <span
              key={item.target}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                index <= stepIndex
                  ? "w-6"
                  : "w-1.5 bg-muted-foreground/25",
              ].join(" ")}
              style={
                index <= stepIndex
                  ? { background: item.accent }
                  : undefined
              }
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => close("skipped")}
            className="min-h-11 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Überspringen
          </button>

          <button
            ref={nextButtonRef}
            type="button"
            onClick={goNext}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {isLastStep ? (
              <>
                Fertig
                <Check className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                Weiter
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .steuerstoff-onboarding-arrow-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation:
            steuerstoff-onboarding-draw 680ms
              cubic-bezier(0.22, 1, 0.36, 1)
              forwards,
            steuerstoff-onboarding-float 2.8s
              ease-in-out 760ms infinite;
          filter: drop-shadow(
            0 2px 4px rgba(0, 0, 0, 0.2)
          );
        }

        .steuerstoff-onboarding-arrow-head {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation:
            steuerstoff-onboarding-draw 260ms
              ease-out 520ms forwards,
            steuerstoff-onboarding-float 2.8s
              ease-in-out 760ms infinite;
        }

        @keyframes steuerstoff-onboarding-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes steuerstoff-onboarding-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0)
              rotate(0deg);
          }

          50% {
            transform: translate3d(0, -2px, 0)
              rotate(-0.6deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .steuerstoff-onboarding-arrow-line,
          .steuerstoff-onboarding-arrow-head {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}