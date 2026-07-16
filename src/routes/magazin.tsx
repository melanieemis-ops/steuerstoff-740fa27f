import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/magazin")({
  component: MagazinPage,
  head: () => ({
    meta: [
      {
        title: "Magazin · steuerstoff",
      },
      {
        name: "description",
        content:
          "Das steuerstoff Magazin mit aktuellen steuerlichen Themen, Rechtsprechung und prüfungsorientiertem Wissen.",
      },
    ],
  }),
});

function MagazinPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main className="min-w-0 flex-1 pb-24 md:pb-16">
        <section className="relative overflow-hidden border-b border-border/60 bg-card/30">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-10 blur-3xl"
            style={{
              background: "var(--gradient-accent)",
            }}
          />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <BookOpenText
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                steuerstoff Magazin
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Steuerwissen.
                <br />
                Klar. Digital.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Rechtsprechung, Gesetzesänderungen und steuerliche
                Prüfungsschemata – verständlich und hochwertig aufbereitet.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-4xl items-center gap-9 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-14">
            <article className="min-w-0">
              <div className="relative mx-auto w-full max-w-[360px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-8 bottom-0 top-12 rounded-[2rem] bg-foreground/15 blur-3xl"
                />

                <div className="relative overflow-hidden rounded-[1.4rem] border border-border/70 bg-card p-2 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)]">
                <img
                  src="/magazin/steuerstoff-magazin-cover.png"
                  alt="Cover des steuerstoff Magazins – Ausgabe 01/2026"
                  className="block h-auto w-full rounded-[1rem] object-contain"
                  loading="eager"
                  decoding="async"
                />
                </div>
              </div>
            </article>

            <div className="min-w-0 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Aktuelle Ausgabe
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Das steuerstoff Magazin
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Aktuelle steuerliche Entwicklungen mit genauen
                Gesetzesstellen, BFH-Rechtsprechung, kompakten Lernsätzen
                und klaren Prüfungsschemata.
              </p>

              <div className="mt-6 flex min-w-0 flex-wrap justify-center gap-2 md:justify-start">
                {[
                  "Einkommensteuer",
                  "Umsatzsteuer",
                  "Gemeinnützigkeit",
                  "Rechtsprechung",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="max-w-full rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <p className="mt-7 text-xs leading-5 text-muted-foreground">
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