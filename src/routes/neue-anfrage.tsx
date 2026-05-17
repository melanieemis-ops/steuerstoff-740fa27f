import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/neue-anfrage")({
  component: () => (
    <PageShell
      title="Neue steuerliche Anfrage"
      description="Beschreibe den Sachverhalt – steuerstoff strukturiert ihn, erkennt fehlende Angaben und schlägt nächste Schritte vor."
    />
  ),
  head: () => ({ meta: [{ title: "Neue Anfrage · steuerstoff" }] }),
});
