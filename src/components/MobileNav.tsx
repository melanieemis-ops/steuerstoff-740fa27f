import {
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useRef, type ReactNode } from "react";
import {
  ArrowRightLeft,
  CalendarDays,
  FilePlus,
  GraduationCap,
  Home,
  MessageSquare,
} from "lucide-react";

import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

export const SECTIONS = [
  {
    to: "/chat",
    label: "Chat",
    short: "Chat",
  },
  {
    to: "/akademie",
    label: "Lernen",
    short: "Lernen",
  },
  {
    to: "/",
    label: "Dashboard",
    short: "Home",
  },
  {
    to: "/neue-anfrage",
    label: "Anfrage",
    short: "Anfrage",
  },
  {
    to: "/fallverlauf",
    label: "Verlauf",
    short: "Verlauf",
  },
  {
    to: "/wissensdatenbank",
    label: "Wissen",
    short: "Wissen",
  },
  {
    to: "/skr-konverter",
    label: "SKR",
    short: "SKR",
  },
  {
    to: "/kfz-wertabgabe",
    label: "Kfz",
    short: "Kfz",
  },
  {
    to: "/npo-pruefassistent",
    label: "NPO",
    short: "NPO",
  },
  {
    to: "/einstellungen",
    label: "Einstellungen",
    short: "Mehr",
  },
] as const;

function currentIndex(pathname: string): number {
  let best = 0;
  let bestLength = 0;

  SECTIONS.forEach((section, index) => {
    const path = section.to as string;

    const matches =
      pathname === path ||
      (path !== "/" && pathname.startsWith(path));

    if (matches && path.length > bestLength) {
      best = index;
      bestLength = path.length;
    }
  });

  return best;
}

/**
 * Ermöglicht horizontale Seitennavigation auf freien Flächen.
 * Eingabefelder, Schaltflächen und Bereiche mit data-no-swipe
 * bleiben von der Swipe-Navigation ausgenommen.
 */
export function GlobalSwipeArea({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const index = currentIndex(location.pathname);

  const go = (direction: -1 | 1) => {
    if (
      typeof document !== "undefined" &&
      document.body.dataset.menuOpen === "true"
    ) {
      return;
    }

    const nextIndex = index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= SECTIONS.length
    ) {
      return;
    }

    navigate({
      to: SECTIONS[nextIndex].to,
    });
  };

  useSwipeNavigation(ref, {
    onSwipeLeft: () => go(1),
    onSwipeRight: () => go(-1),
    threshold: 60,
  });

  return (
    <div
      ref={ref}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}

/**
 * Horizontale Bereichsnavigation für Mobilgeräte.
 */
export function SectionDots() {
  const location = useLocation();
  const index = currentIndex(location.pathname);

  return (
    <div className="sticky top-14 z-30 border-b border-border/60 bg-background/85 backdrop-blur md:hidden">
      <div
        className="tab-scroll-container mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5"
        data-horizontal-tabs="true"
      >
        {SECTIONS.map((section, sectionIndex) => (
          <Link
            key={section.to}
            to={section.to}
            className={[
              "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] transition-colors",
              sectionIndex === index
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {section.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Untere Hauptnavigation für Mobilgeräte.
 */
export function MobileBottomNav() {
  const items = [
    {
      to: "/chat",
      label: "Chat",
      Icon: MessageSquare,
    },
    {
      to: "/lernen",
      label: "Lernen",
      Icon: GraduationCap,
    },
    {
      to: "/",
      label: "Home",
      Icon: Home,
    },
    {
      to: "/neue-anfrage",
      label: "Anfrage",
      Icon: FilePlus,
    },
    {
      to: "/fristenkalender",
      label: "Fristen",
      Icon: CalendarDays,
    },
    {
      to: "/skr-konverter",
      label: "SKR",
      Icon: ArrowRightLeft,
    },
  ] as const;

  const location = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Mobile Navigation"
    >
      <ul className="mx-auto flex w-full max-w-6xl items-stretch justify-between px-2">
        {items.map(({ to, label, Icon }) => {
          const active =
            location.pathname === to ||
            (to !== "/" &&
              location.pathname.startsWith(to));

          const onboardingTarget =
            to === "/lernen"
              ? "learn"
              : to === "/skr-konverter"
                ? "skr"
                : undefined;

          return (
            <li
              key={to}
              className="min-w-0 flex-1"
            >
              <Link
                to={to}
                data-onboarding-target={onboardingTarget}
                className={[
                  "flex min-w-0 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                <Icon
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                <span className="truncate">
                  {label}
                </span>

                <span
                  className={[
                    "mt-0.5 h-0.5 w-6 rounded-full",
                    active
                      ? "bg-foreground"
                      : "bg-transparent",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}