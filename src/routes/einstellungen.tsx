import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/einstellungen")({
  component: () => (
    <PageShell
      title="Einstellungen"
      description="Kanzleiprofil, DATEV-Anbindung, Kontenrahmen (SKR42) und Team-Verwaltung."
    />
  ),
  head: () => ({ meta: [{ title: "Einstellungen · steuerstoff" }] }),
});
