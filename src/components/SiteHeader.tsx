import { Link, useLocation } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRightLeft,
  BookOpenText,
  CalendarDays,
  Car,
  Database,
  FilePlus2,
  FileSpreadsheet,
  FileUp,
  GraduationCap,
  History,
  Loader2,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";

import { useIsAdmin } from "@/hooks/useIsAdmin";

type NavItem = {
  to: string;
  label: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
};

const baseNav: NavItem[] = [
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
    to: "/neue-anfrage",
    label: "Neue Anfrage",
    Icon: FilePlus2,
  },
  {
    to: "/fallverlauf",
    label: "Fallverlauf",
    Icon: History,
  },
  {
    to: "/fristenkalender",
    label: "Fristenkalender",
    Icon: CalendarDays,
  },
{
  to: "/wissensdatenbank",
  label: "Wissensdatenbank",
  Icon: Database,
},
{
  to: "/magazin",
  label: "Magazin",
  Icon: BookOpenText,
},
{
  to: "/gesetz-importieren",
  label: "Gesetz importieren",
  Icon: FileUp,
  adminOnly: true,
},
  {
    to: "/skr-konverter",
    label: "SKR-Konverter",
    Icon: ArrowRightLeft,
  },
  {
    to: "/csv-konverter",
    label: "CSV-Konverter",
    Icon: FileSpreadsheet,
  },
  {
    to: "/kfz-wertabgabe",
    label: "Kfz-Wertabgabe",
    Icon: Car,
  },
  {
    to: "/npo-pruefassistent",
    label: "NPO-Prüfassistent",
    Icon: ShieldCheck,
  },
  {
    to: "/einstellungen",
    label: "Einstellungen",
    Icon: Settings,
  },
];

function onboardingTargetForPath(
  path: string,
): "learn" | "skr" | undefined {
  if (path === "/lernen") {
    return "learn";
  }

  if (path === "/skr-konverter") {
    return "skr";
  }

  return undefined;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] =
    useState(false);

  const location = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(
    null,
  );
  const buttonRef =
    useRef<HTMLButtonElement | null>(null);

  const isAdmin = useIsAdmin();

  const navigation = useMemo(
    () =>
      baseNav.filter(
        (item) => !item.adminOnly || isAdmin,
      ),
    [isAdmin],
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.dataset.menuOpen = open
      ? "true"
      : "false";

    if (open && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("steuerstoff:menu-open"),
      );
    }

    return () => {
      document.body.dataset.menuOpen = "false";
    };
  }, [open]);

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent =
        event as CustomEvent<boolean>;

      setRefreshing(Boolean(customEvent.detail));
    };

    window.addEventListener(
      "steuerstoff:refreshing",
      handleRefresh,
    );

    return () => {
      window.removeEventListener(
        "steuerstoff:refreshing",
        handleRefresh,
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      const target = event.target as Node | null;

      if (panelRef.current?.contains(target)) {
        return;
      }

      if (buttonRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener(
      "pointerdown",
      handlePointerDown,
      true,
    );

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true,
      );

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 shrink items-center gap-2"
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              background:
                "var(--gradient-accent)",
            }}
            aria-hidden="true"
          />

          <span className="shrink-0 text-base font-semibold lowercase tracking-tight text-foreground sm:text-lg">
            steuerstoff
          </span>

          <span className="hidden whitespace-nowrap text-[11px] font-normal tracking-tight text-muted-foreground/80 min-[390px]:inline sm:text-xs">
            by Melanie Misakian
          </span>

          <span
            aria-hidden={!refreshing}
            className={[
              "inline-flex h-4 w-4 shrink-0 items-center justify-center transition-opacity",
              refreshing
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </span>
        </Link>

        <nav
          className="hidden min-w-0 items-center gap-1 overflow-x-auto md:flex"
          data-onboarding-target="menu"
          aria-label="Desktop Navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-onboarding-target={onboardingTargetForPath(
                item.to,
              )}
              className="shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{
                className:
                  "shrink-0 whitespace-nowrap rounded-md bg-accent px-3 py-1.5 text-sm text-foreground",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          ref={buttonRef}
          type="button"
          aria-label={
            open
              ? "Menü schließen"
              : "Menü öffnen"
          }
          aria-expanded={open}
          data-onboarding-target="menu"
          onClick={() =>
            setOpen((current) => !current)
          }
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {open ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {open && (
        <div
          ref={panelRef}
          data-no-swipe="true"
          className="fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col border-t border-border bg-background shadow-lg md:hidden"
          style={{ height: "calc(100dvh - 3.5rem)" }}
        >
          <nav
            className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-3"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              paddingBottom:
                "calc(env(safe-area-inset-bottom) + 160px)",
              scrollPaddingBottom:
                "calc(env(safe-area-inset-bottom) + 160px)",
            }}
            aria-label="Hauptmenü"
          >
            {navigation.map(
              ({ to, label, Icon }) => {
                const active =
                  location.pathname === to ||
                  (to !== "/" &&
                    location.pathname.startsWith(
                      to,
                    ));

                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-accent",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-background/15"
                          : "bg-muted",
                      ].join(" ")}
                    >
                      <Icon
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      {label}
                    </span>

                    {to === "/lernen" && (
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          active
                            ? "bg-background/15 text-background"
                            : "bg-emerald-100 text-emerald-700",
                        ].join(" ")}
                      >
                        Neu
                      </span>
                    )}
                  </Link>
                );
              },
            )}
          </nav>
        </div>
      )}
      </header>
    </>
  );
}