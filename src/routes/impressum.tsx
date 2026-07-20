import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/impressum")({
  component: ImpressumPage,
  head: () => ({
    meta: [
      { title: "Impressum · steuerstoff" },
      {
        name: "description",
        content: "Impressum und rechtliche Informationen von steuerstoff.",
      },
    ],
  }),
});

function ImpressumPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground">
            Impressum
          </h1>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">Anbieter</h2>
              <p className="mt-2">
                Melanie Misakian<br />
                [Adresse hier eintragen]<br />
                [PLZ Ort]<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Kontakt</h2>
              <p className="mt-2">
                E-Mail: [E-Mail-Adresse hier eintragen]<br />
                Telefon: [Telefonnummer hier eintragen]
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Verantwortlich für den Inhalt (gem. § 55 Abs. 2 RStV)
              </h2>
              <p className="mt-2">
                Melanie Misakian<br />
                [Adresse hier eintragen]<br />
                [PLZ Ort]<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Haftungsausschluss</h2>
              <p className="mt-2">
                steuerstoff ist eine Arbeitshilfe und ersetzt keine verbindliche steuerliche Beratung.
                Die Inhalte dieser Anwendung werden mit großer Sorgfalt recherchiert und bereitgestellt.
                Eine Gewähr oder Haftung für die Richtigkeit, Vollständigkeit und Aktualität kann jedoch
                nicht übernommen werden. Alle Angaben ohne Gewähr.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Urheberrecht und Markenrecht
              </h2>
              <p className="mt-2">
                Die Inhalte und Werke auf dieser Webseite unterliegen deutschem Urheberrecht.
                Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
                der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des Autors oder
                Erstellers. Downloads und Kopien dieser Webseite sind nur für den privaten, nicht
                kommerziellen Gebrauch gestattet.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Datenschutz</h2>
              <p className="mt-2">
                Informationen zur Datenverarbeitung finden Sie in unserer{" "}
                <a
                  href="/steuerstoff-datenschutzerklaerung.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-accent"
                >
                  Datenschutzerklärung
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
