export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <span className="lowercase">© {new Date().getFullYear()} steuerstoff</span>
        <span>KI-Arbeitsassistent für deutsche Steuerkanzleien</span>
      </div>
    </footer>
  );
}
