export function FileDropZone({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-cyan-400/80 bg-cyan-400/10">
      <div className="rounded-2xl border border-fuchsia-400/50 bg-background/90 px-5 py-4 text-center shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-foreground">Dateien hier ablegen</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, PDF, TXT, CSV, DOC, DOCX, XLS, XLSX
        </p>
      </div>
    </div>
  );
}
