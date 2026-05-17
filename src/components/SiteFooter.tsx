export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 pb-10 text-xs text-muted-foreground sm:px-6 sm:pb-6">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <span className="lowercase">© {new Date().getFullYear()} steuerstoff</span>
          <span>KI-Arbeitsassistent für deutsche Steuerkanzleien</span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          steuerstoff ist eine Arbeitshilfe und ersetzt keine verbindliche steuerliche Beratung.
        </p>
      </div>
    </footer>
  );
}
