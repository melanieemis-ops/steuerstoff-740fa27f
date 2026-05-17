import { Link, useLocation } from "@tanstack/react-router";
import { Home, FilePlus, ArrowRightLeft, Calculator, ShieldCheck } from "lucide-react";

export const SECTIONS = [
  { to: "/", label: "Dashboard", short: "Home" },
  { to: "/neue-anfrage", label: "Anfrage", short: "Anfrage" },
  { to: "/fallverlauf", label: "Verlauf", short: "Verlauf" },
  { to: "/wissensdatenbank", label: "Wissen", short: "Wissen" },
  { to: "/skr-konverter", label: "SKR", short: "SKR" },
  { to: "/mittelverwendungsrechner", label: "MVR", short: "MVR" },
  { to: "/npo-pruefassistent", label: "NPO", short: "NPO" },
  { to: "/einstellungen", label: "Einstellungen", short: "Mehr" },
] as const;

function currentIndex(pathname: string): number {
  let best = 0;
  let bestLen = 0;
  SECTIONS.forEach((s, i) => {
    const p = s.to as string;
    if (pathname === p || (p !== "/" && pathname.startsWith(p))) {
      if (p.length > bestLen) {
        best = i;
        bestLen = p.length;
      }
    }
  });
  return best;
}

/**
 * Page-level wrapper. Global horizontal page swipe is intentionally OFF —
 * it conflicted with vertical scrolling and form interaction. Use the
 * bottom navigation, section dots, or burger menu to change pages.
 * Local swipe (carousels, wizard steps, tool tabs) is still supported
 * via useSwipeNavigation on the relevant containers.
 */
export function GlobalSwipeArea({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}


/** Mini horizontal dots indicator (mobile only). */
export function SectionDots() {
  const loc = useLocation();
  const idx = currentIndex(loc.pathname);
  return (
    <div className="md:hidden sticky top-14 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5">
        {SECTIONS.map((s, i) => (
          <Link
            key={s.to}
            to={s.to}
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
              i === idx
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Bottom navigation, mobile only. */
export function MobileBottomNav() {
  const items = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/neue-anfrage", label: "Anfrage", Icon: FilePlus },
    { to: "/skr-konverter", label: "SKR", Icon: ArrowRightLeft },
    { to: "/mittelverwendungsrechner", label: "MVR", Icon: Calculator },
    { to: "/npo-pruefassistent", label: "NPO", Icon: ShieldCheck },
  ] as const;
  const loc = useLocation();
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation"
    >
      <ul className="mx-auto flex w-full max-w-6xl items-stretch justify-between px-2">
        {items.map(({ to, label, Icon }) => {
          const active =
            loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-foreground" : ""}`} />
                {label}
                <span
                  className={`mt-0.5 h-0.5 w-6 rounded-full ${
                    active ? "bg-foreground" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
