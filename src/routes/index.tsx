import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { listCases, relativeTime, type CaseRecord } from "@/lib/casesStore";
import {
  ArrowRight,
  ArrowRightLeft,
  FileSearch,
  Building2,
  Calculator,
  MessageSquareText,
  Clock,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "steuerstoff — KI-Steuer-Arbeitsassistent für Kanzleien" },
      {
        name: "description",
        content:
          "steuerstoff strukturiert steuerliche Sachverhalte, erkennt fehlende Angaben und erstellt Rückfragen, Buchungsvorschläge und Review-Dokumentation für deutsche Kanzleien.",
      },
    ],
  }),
});

const chips = ["USt", "NPO", "SKR42", "DATEV", "Rückfragen", "Review"];

const quickstart = [
  {
    icon: FileSearch,
    title: "Umsatzsteuer prüfen",
    desc: "Sachverhalt strukturieren, Steuerbarkeit und Satz klären.",
    accent: "var(--magenta)",
  },
  {
    icon: Building2,
    title: "NPO-Sachverhalt strukturieren",
    desc: "Sphären, Mittelverwendung und steuerliche Folgen ordnen.",
    accent: "var(--violet)",
  },
  {
    icon: Calculator,
    title: "Buchungsvorschlag erstellen",
    desc: "Konten und Belegfluss nach SKR42 / DATEV.",
    accent: "var(--cyan)",
  },
  {
    icon: MessageSquareText,
    title: "Rückfragebrief vorbereiten",
    desc: "Fehlende Angaben erkennen und Mandantenanfrage formulieren.",
    accent: "var(--deep-blue)",
  },
  {
    icon: ArrowRightLeft,
    title: "SKR-Konverter",
    desc: "SKR03 → SKR42 zuordnen, Textanalyse und eigene Mappings.",
    accent: "var(--magenta)",
    to: "/skr-konverter" as const,
  },
];

function Home() {
  const [recent, setRecent] = useState<CaseRecord[]>([]);
  useEffect(() => {
    const update = () => setRecent(listCases().slice(0, 4));
    update();
    window.addEventListener("steuerstoff:cases", update);
    return () => window.removeEventListener("steuerstoff:cases", update);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
          {/* Dezente runde Akzente */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--gradient-accent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 h-[360px] w-[360px] rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--cyan), transparent 60%)" }}
          />

          {/* Subtiles Wort-Branding im Hintergrund */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center"
          >
            <span
              className="block leading-none lowercase font-semibold tracking-tighter text-foreground/[0.04]"
              style={{ fontSize: "clamp(6rem, 22vw, 18rem)" }}
            >
              steuerstoff
            </span>
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--magenta)" }} />
                KI-Arbeitsassistent · für Kanzleien
              </span>

              <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                KI-gestützter Steuer-Arbeitsassistent
                <br className="hidden sm:block" />
                <span className="text-gradient-brand"> für deutsche Kanzleien</span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
                Strukturiert steuerliche Sachverhalte, erkennt fehlende Angaben, erstellt
                Rückfragen, Buchungsvorschläge und Review-Dokumentation.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                <Button asChild size="default" className="h-10 px-5">
                  <Link to="/neue-anfrage">
                    Neue steuerliche Anfrage
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="default" className="h-10 px-5">
                  <Link to="/fallverlauf">Fallverlauf öffnen</Link>
                </Button>
                <Button asChild variant="ghost" size="default" className="h-10 px-5">
                  <Link to="/wissensdatenbank">Wissensdatenbank öffnen</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Schnellstart */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Schnellstart
              </h2>
              <p className="text-sm text-muted-foreground">Häufige Arbeitsabläufe in einem Klick.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {quickstart.map(({ icon: Icon, title, desc, accent, to }) => (
              <Link
                key={title}
                to={to ?? "/neue-anfrage"}
                className="group rounded-2xl border border-border bg-card p-4 shadow-card-soft transition-all hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                  style={{ background: accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                  Öffnen <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Zuletzt bearbeitet */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Zuletzt bearbeitet
              </h2>
              <p className="text-sm text-muted-foreground">Fortsetzen, prüfen oder dokumentieren.</p>
            </div>
            <Link to="/fallverlauf" className="text-xs text-muted-foreground hover:text-foreground">
              Alle Fälle →
            </Link>
          </div>

          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  to="/fall/$caseId"
                  params={{ caseId: r.id }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 sm:px-5"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                        {r.topic}
                      </span>
                      <Clock className="h-3 w-3" /> {relativeTime(r.updatedAt)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
