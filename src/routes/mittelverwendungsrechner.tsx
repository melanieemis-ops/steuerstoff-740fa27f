import { createFileRoute, redirect } from "@tanstack/react-router";

// Der Mittelverwendungsrechner wurde entfernt. Alte Aufrufe der URL
// werden dauerhaft auf die Startseite umgeleitet.
export const Route = createFileRoute("/mittelverwendungsrechner")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
