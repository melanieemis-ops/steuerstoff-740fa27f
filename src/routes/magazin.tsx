import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpenText,
  ChevronRight,
  Scale,
  Sparkles,
} from "lucide-react";

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
          "Das steuerstoff Magazin mit Rechtsprechung, Gesetzesänderungen und prüfungsorientiertem Steuerwissen.",
      },
    ],
  }),
});

function MagazinCover() {
  return (
    <div
      className="
        relative mx-auto aspect-[210/297] w-full max-w-[350px]
        overflow-hidden rounded-[1.5rem]
        border border-stone-200/80
        bg-[#f8f3eb]
        shadow-[0_30px_80px_-35px_rgba(28,25,23,0.55)]
      "
      aria-label="Vorläufiges Cover des steuerstoff Magazins"
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-24 -top-20
          h-64 w-64 rounded-full
          bg-amber-200/35 blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-28 -left-20
          h-72 w-72 rounded-full
          bg-slate-300/30 blur-3xl
        "
      />

      <div className="relative flex h-full min-w-0 flex-col p-6 sm:p-8">
        <header className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
              steuerstoff
            </p>

            <p className="mt-1 text-[10px] text-stone-400">
              by Melanie Misakian
            </p>
          </div>

          <span
            className="
              inline-flex shrink-0 items-center rounded-full
              border border-stone-300/70 bg-white/55
              px-2.5 py-1 text-[9px] font-semibold
              uppercase tracking-[0.14em] text-stone-600
              backdrop-blur
            "
          >
            Ausgabe 01
          </span>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div
            className="
              relative flex h-24 w-24 items-center justify-center
              rounded-[2rem] border border-white/70
              bg-white/45 shadow-[0_18px_45px_-25px_rgba(28,25,23,0.7)]
              backdrop-blur-sm sm:h-28 sm:w-28
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute inset-3 rounded-[1.5rem]
                bg-gradient-to-br from-amber-100/70
                via-white/40 to-slate-200/60
              "
            />

            <span
              aria-hidden="true"
              className="
                relative text-6xl font-semibold leading-none
                tracking-tighter text-stone-800 sm:text-7xl
              "
            >
              §
            </span>
          </div>

          <h1
            className="
              mt-8 text-[2rem] font-semibold leading-[0.95]
              tracking-[-0.055em] text-stone-900 sm:text-[2.4rem]
            "
          >
            Steuerwissen.
            <br />
            Klar. Digital.
          </h1>

          <p className="mt-5 max-w-[245px] text-xs leading-5 text-stone-500">
            Rechtsprechung, Reformen und Prüfungsschemata für die
            steuerliche Praxis.
          </p>
        </div>

        <footer className="border-t border-stone-300/60 pt-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-600">
                Magazin für Steuerpraxis
              </p>

              <p className="mt-1 truncate text-[10px] text-stone-400">
                Einkommensteuer · Umsatzsteuer · Gemeinnützigkeit
              </p>
            </div>

            <Scale
              className="h-4 w-4 shrink-0 text-stone-500"
              aria-hidden="true"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

function MagazinPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main className="min-w-0 flex-1 pb-24 md:pb-16">
        <section className="relative overflow-hidden border-b border-border/60 bg-card/30">
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -right-24 -top-28
              h-72 w-72 rounded-full opacity-10 blur-3xl
            "
            style={{
              background: "var(--gradient-accent)",
            }}
          />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-border bg-background/80
                  px-3 py-1.5 text-xs font-medium
                  text-muted-foreground shadow-sm
                "
              >
                <BookOpenText
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                steuerstoff Magazin
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Wissen, das bleibt.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Steuerrecht verständlich, kompakt und prüfungsorientiert
                aufbereitet.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div
            className="
              mx-auto grid max-w-4xl min-w-0 items-center gap-10
              md:grid-cols-[minmax(0,350px)_minmax(0,1fr)]
              md:gap-14
            "
          >
            <article className="min-w-0">
              <MagazinCover />
            </article>

            <div className="min-w-0 text-center md:text-left">
              <div
                className="
                  inline-flex items-center gap-2
                  text-xs font-semibold uppercase
                  tracking-[0.16em] text-muted-foreground
                "
              >
                <Sparkles
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                In Vorbereitung
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Die erste steuerstoff-Ausgabe
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Das Magazin verbindet aktuelle Rechtsprechung,
                Gesetzesänderungen und steuerliche Prüfungsschemata mit
                einer klaren, modernen Darstellung.
              </p>

              <div className="mt-6 flex min-w-0 flex-wrap justify-center gap-2 md:justify-start">
                {[
                  "Einkommensteuer",
                  "Umsatzsteuer",
                  "Gemeinnützigkeit",
                  "BFH-Rechtsprechung",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="
                      max-w-full rounded-full border border-border
                      bg-card px-3 py-1.5 text-xs
                      text-muted-foreground
                    "
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <button
                type="button"
                disabled
                className="
                  mt-8 inline-flex items-center gap-2 rounded-2xl
                  border border-border bg-muted/70
                  px-4 py-2.5 text-sm font-medium
                  text-muted-foreground
                  disabled:cursor-not-allowed
                "
              >
                Erste Ausgabe erscheint bald

                <ChevronRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}