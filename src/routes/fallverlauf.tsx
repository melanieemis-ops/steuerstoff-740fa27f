import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/fallverlauf")({
  component: () => (
    <PageShell
      title="Fallverlauf"
      description="Übersicht aller bearbeiteten Sachverhalte, Rückfragen und Review-Dokumentationen."
    />
  ),
  head: () => ({ meta: [{ title: "Fallverlauf · steuerstoff" }] }),
});
