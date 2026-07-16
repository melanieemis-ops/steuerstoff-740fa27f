import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/magazin")({
  component: MagazinPage,
  head: () => ({
    meta: [
      {
        title: "steuerstoff Magazin · Steuerwissen klar und digital",
      },
      {
        name: "description",
        content:
          "Das steuerstoff Magazin mit aktuellen steuerlichen Themen, Rechtsprechung und praxisnahen Prüfungsschemata.",
      },
    ],
  }),
});

function MagazinPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main className="min-w-0 flex-1 pb-24 md:pb-16">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full opacity-15 blur-3xl"
            style={{ background: "var(--gradient-accent)" }}
          />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                steuerstoff Magazin
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Steuerwissen.
                <br />
                Klar. Digital.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Aktuelle Rechtsprechung, Gesetzesänderungen und
                prüfungsorientierte Steuerinhalte – kompakt aufbereitet.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-12">
            <article className="min-w-0">
              <div className="relative mx-auto w-full max-w-[360px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-8 bottom-0 top-10 rounded-[2rem] bg-foreground/15 blur-3xl"
                />

                <div className="relative overflow-hidden rounded-[1.35rem] border border-border/70 bg-card p-2 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)]">
                  <img
                    src="/magazin/steuerstoff-magazin-cover.webp"
                    alt="Cover des steuerstoff Magazins"
                    className="block aspect-[210/297] h-auto w-full rounded-[1rem] object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </article>

            <div className="min-w-0 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <BookOpenText className="h-4 w-4" />
                Aktuelle Ausgabe
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Das steuerstoff Magazin
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Steuerliche Entwicklungen verständlich erklärt – mit
                Lernsätzen, genauen Gesetzesstellen, BFH-Rechtsprechung und
                kompakten Prüfungsschemata für die tägliche Praxis.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                  Einkommensteuer
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                  Umsatzsteuer
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                  Gemeinnützigkeit
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                  Rechtsprechung
                </span>
              </div>

              <p className="mt-7 text-xs text-muted-foreground">
                Weitere Ausgaben und einzelne Magazinbeiträge folgen.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}