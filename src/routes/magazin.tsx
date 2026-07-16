import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/magazin")({
  component: MagazinPage,
});

function MagazinPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            steuerstoff Magazin
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            Magazin
          </h1>

          <p className="mt-4 text-muted-foreground">
            Die erste Ausgabe ist in Vorbereitung.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}