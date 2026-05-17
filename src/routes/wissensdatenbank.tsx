import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/wissensdatenbank")({
  component: () => (
    <PageShell
      title="Wissensdatenbank"
      description="Kuratierte steuerliche Inhalte, BMF-Schreiben, Buchungslogiken und Kanzlei-Standards."
    />
  ),
  head: () => ({ meta: [{ title: "Wissensdatenbank · steuerstoff" }] }),
});
