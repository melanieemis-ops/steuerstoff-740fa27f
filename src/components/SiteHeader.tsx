import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, Loader2 } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

type NavItem = { to: string; label: string; adminOnly?: boolean };

const baseNav: NavItem[] = [
  { to: "/chat", label: "Chat" },
  { to: "/neue-anfrage", label: "Neue Anfrage" },
  { to: "/fallverlauf", label: "Fallverlauf" },
  { to: "/wissensdatenbank", label: "Wissensdatenbank" },
  { to: "/gesetz-importieren", label: "Gesetz importieren", adminOnly: true },
  { to: "/skr-konverter", label: "SKR-Konverter" },
  { to: "/csv-konverter", label: "CSV-Konverter" },
  { to: "/mittelverwendungsrechner", label: "Mittelverwendungsrechner" },
  { to: "/kfz-wertabgabe", label: "Kfz-Wertabgabe" },
  { to: "/npo-pruefassistent", label: "NPO-Prüfassistent" },
  { to: "/einstellungen", label: "Einstellungen" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const isAdmin = useIsAdmin();
  const nav = useMemo(
    () => baseNav.filter((n) => !n.adminOnly || isAdmin),
    [isAdmin],
  );

  // close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // mark body + notify pull-to-refresh
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.menuOpen = open ? "true" : "false";
    if (open && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("steuerstoff:menu-open"));
    }
  }, [open]);

  // header spinner reflects pull-to-refresh state
  useEffect(() => {
    const onRefresh = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setRefreshing(Boolean(ce.detail));
    };
    window.addEventListener("steuerstoff:refreshing", onRefresh);
    return () => window.removeEventListener("steuerstoff:refreshing", onRefresh);
  }, []);

  // close on outside tap / scroll / escape when open
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--gradient-accent)" }} />
          <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground lowercase">
            steuerstoff
          </span>
          <span className="text-[11px] sm:text-xs font-normal tracking-tight text-muted-foreground/80 whitespace-nowrap">
            by Melanie Misakian
          </span>
          <span
            aria-hidden={!refreshing}
            className={`inline-flex h-4 w-4 items-center justify-center transition-opacity ${
              refreshing ? "opacity-100" : "opacity-0"
            }`}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          ref={btnRef}
          type="button"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div ref={panelRef} className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
