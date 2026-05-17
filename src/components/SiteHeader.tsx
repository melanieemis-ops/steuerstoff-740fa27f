import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/neue-anfrage", label: "Neue Anfrage" },
  { to: "/fallverlauf", label: "Fallverlauf" },
  { to: "/wissensdatenbank", label: "Wissensdatenbank" },
  { to: "/einstellungen", label: "Einstellungen" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--gradient-accent)]" style={{ background: "var(--gradient-accent)" }} />
          <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground lowercase">
            steuerstoff
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
          type="button"
          aria-label="Menü"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
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
