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
  BookOpen,
  ShieldCheck,
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

const heroModules = [
  {
    icon: ArrowRightLeft,
    title: "SKR-Konverter",
    desc: "SKR03 → SKR42 zuordnen, Buchungstexte analysieren und Mapping prüfen.",
    cta: "SKR-Konto umwandeln",
    accent: "var(--magenta)",
    to: "/skr-konverter" as const,
  },
  {
    icon: Calculator,
    title: "Mittelverwendungsrechner",
    desc: "Zeitnahe Mittelverwendung, Rücklagen und Verwendungsüberhang für NPOs berechnen.",
    cta: "MVR berechnen",
    accent: "var(--violet)",
    to: "/mittelverwendungsrechner" as const,
  },
  {
    icon: ShieldCheck,
    title: "NPO-Prüfassistent",
    desc: "Sphären, Zweckbetrieb, Rücklagen und gemeinnützigkeitsrechtliche Risiken strukturieren.",
    cta: "NPO-Fall prüfen",
    accent: "var(--cyan)",
    to: "/npo-pruefassistent" as const,
  },
];

const quickstart = [
  {
    icon: FileSearch,
    title: "Umsatzsteuer prüfen",
    desc: "Sachverhalt strukturieren, Steuerbarkeit und Satz klären.",
    cta: "USt-Fall prüfen",
    accent: "var(--magenta)",
    to: "/neue-anfrage" as const,
  },
  {
    icon: Building2,
    title: "NPO-Sachverhalt strukturieren",
    desc: "Sphären, Mittelverwendung und steuerliche Folgen ordnen.",
    cta: "NPO-Fall starten",
    accent: "var(--violet)",
    to: "/neue-anfrage" as const,
  },
  {
    icon: Calculator,
    title: "Buchungsvorschlag erstellen",
    desc: "Konten und Belegfluss nach SKR42 / DATEV.",
    cta: "Buchungsvorschlag erstellen",
    accent: "var(--cyan)",
    to: "/neue-anfrage" as const,
  },
  {
    icon: MessageSquareText,
    title: "Rückfragebrief vorbereiten",
    desc: "Fehlende Angaben erkennen und Mandantenanfrage formulieren.",
    cta: "Rückfrage formulieren",
    accent: "var(--deep-blue)",
    to: "/neue-anfrage" as const,
  },
  {
    icon: ArrowRightLeft,
    title: "SKR-Konverter",
    desc: "SKR03 → SKR42 zuordnen, Textanalyse und eigene Mappings.",
    cta: "SKR-Konto umwandeln",
    accent: "var(--magenta)",
    to: "/skr-konverter" as const,
  },
  {
    icon: Calculator,
    title: "Mittelverwendungsrechnung",
    desc: "Zeitnahe Mittelverwendung, Rücklagen und Verwendungsüberhang.",
    cta: "Mittelverwendung berechnen",
    accent: "var(--violet)",
    to: "/mittelverwendungsrechner" as const,
  },
];

function Home() {
  const [recent, setRecent] = useState<CaseRecord[]>([]);
  useEffect(() => {
    const update = () => setRecent(listCases().slice(0, 5));
    update();
    window.addEventListener("steuerstoff:cases", update);
    return () => window.removeEventListener("steuerstoff:cases", update);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero – kompakt */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
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

          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--magenta)" }} />
                KI-Arbeitsassistent · für Kanzleien
              </span>

              <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                KI-gestützter Steuer-Arbeitsassistent
                <span className="text-gradient-brand"> für deutsche Kanzleien</span>
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground">
                Sachverhalte strukturieren, fehlende Angaben erkennen, Rückfragen, Buchungen und
                Review-Dokumentation erzeugen.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                <Button asChild size="default" className="h-10 px-5">
                  <Link to="/neue-anfrage">
                    Neue steuerliche Anfrage
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="default" className="h-10 px-5">
                  <Link to="/fallverlauf">Fallverlauf öffnen</Link>
                </Button>
              </div>
            </div>

            {/* Hervorgehobene Module direkt unter dem Hero-CTA */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3">
              {heroModules.map(({ icon: Icon, title, desc, cta, accent, to }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card-soft"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                      style={{ background: accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                  <Button asChild size="sm" variant="outline" className="mt-3 h-9 w-full">
                    <Link to={to}>
                      {cta}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schnellstart */}
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Schnellstart
              </h2>
              <p className="text-sm text-muted-foreground">Häufige Arbeitsabläufe in einem Klick.</p>
            </div>
          </div>

          {/* Mobile: horizontaler Carousel */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickstart.map(({ icon: Icon, title, desc, cta, accent, to }) => (
              <div
                key={title}
                className="snap-start shrink-0 basis-[78%] flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card-soft"
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                  style={{ background: accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                <Button asChild size="sm" variant="ghost" className="mt-3 h-8 justify-start px-2 text-xs">
                  <Link to={to}>
                    {cta}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1 sm:hidden">
            {quickstart.map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {quickstart.map(({ icon: Icon, title, desc, cta, accent, to }) => (
              <div
                key={title}
                className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card-soft transition-all hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                  style={{ background: accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                <Button asChild size="sm" variant="ghost" className="mt-3 h-8 justify-start px-2 text-xs">
                  <Link to={to}>
                    {cta}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Wissensdatenbank Card */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
                style={{ background: "var(--deep-blue)" }}
              >
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">Wissensdatenbank</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  PDFs, Kanzlei-Standards, NPO-Wissen und Buchungslogiken durchsuchen.
                </p>
              </div>
            </div>
            <Button asChild className="h-10 w-full sm:w-auto">
              <Link to="/wissensdatenbank">
                Wissen durchsuchen
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Zuletzt bearbeitet */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mb-5 flex items-end justify-between gap-4">
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
