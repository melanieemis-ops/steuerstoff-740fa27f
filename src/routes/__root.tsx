import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { GlobalSwipeArea, SectionDots, MobileBottomNav } from "@/components/MobileNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ScrollToBottom } from "@/components/ScrollToBottom";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Seite nicht gefunden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Bereich existiert noch nicht oder wurde verschoben.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Zur Startseite
          </Link>
          <Link
            to="/fallverlauf"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Zum Dashboard
          </Link>
          <Link
            to="/neue-anfrage"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Neue Anfrage starten
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  const tryAgain = () => {
    try {
      router.invalidate();
    } catch {
      // ignore
    }
    reset();
  };

  const hardReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Etwas hat nicht funktioniert.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Die Ansicht konnte nicht sauber geladen werden. Bitte erneut versuchen oder zur
          Startseite zurückkehren.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={tryAgain}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Erneut versuchen
          </button>
          <button
            onClick={hardReload}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Aktuelle Seite neu laden
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "steuerstoff — KI-Steuer-Arbeitsassistent für Kanzleien" },
      { name: "description", content: "steuerstoff strukturiert steuerliche Sachverhalte, erkennt fehlende Angaben und erstellt Rückfragen, Buchungsvorschläge und Review-Dokumentation für deutsche Kanzleien." },
      { name: "author", content: "steuerstoff" },
      { property: "og:title", content: "steuerstoff — KI-Steuer-Arbeitsassistent für Kanzleien" },
      { property: "og:description", content: "steuerstoff strukturiert steuerliche Sachverhalte, erkennt fehlende Angaben und erstellt Rückfragen, Buchungsvorschläge und Review-Dokumentation für deutsche Kanzleien." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "steuerstoff — KI-Steuer-Arbeitsassistent für Kanzleien" },
      { name: "twitter:description", content: "steuerstoff strukturiert steuerliche Sachverhalte, erkennt fehlende Angaben und erstellt Rückfragen, Buchungsvorschläge und Review-Dokumentation für deutsche Kanzleien." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/CjQopLmSORNbez2iC4oaUmefOTs1/social-images/social-1779019056799-58A18C81-365C-40F4-8127-765D2429813C.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/CjQopLmSORNbez2iC4oaUmefOTs1/social-images/social-1779019056799-58A18C81-365C-40F4-8127-765D2429813C.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  const handleRefresh = async () => {
    try {
      // notify pages so they can re-run local computations / clear errors
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("steuerstoff:refresh"));
      }
      await router.invalidate();
    } catch {
      // soft refresh failed → controlled hard reload as fallback
      if (typeof window !== "undefined") window.location.reload();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PullToRefresh onRefresh={handleRefresh}>
        <GlobalSwipeArea>
          <SectionDots />
          <Outlet />
          <div aria-hidden className="md:hidden h-16" />
          <MobileBottomNav />
        </GlobalSwipeArea>
      </PullToRefresh>
    </QueryClientProvider>
  );
}
