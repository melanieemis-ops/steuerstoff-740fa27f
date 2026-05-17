import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, X } from "lucide-react";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import { HandoutsManager } from "@/components/HandoutsManager";

export const Route = createFileRoute("/wissensdatenbank")({
  component: Wissensdatenbank,
  head: () => ({ meta: [{ title: "Wissensdatenbank · steuerstoff" }] }),
});

const CATEGORIES = [
  "Alle",
  "Umsatzsteuer",
  "NPO / Gemeinnützigkeit",
  "SKR03",
  "SKR42",
  "DATEV",
  "Rückfragen",
  "Jahresabschluss",
  "Buchhaltung",
] as const;

type Category = (typeof CATEGORIES)[number];

interface Article {
  id: string;
  title: string;
  short: string;
  category: Category;
  body: string;
}

const ARTICLES: Article[] = [
  {
    id: "mittelverwendung",
    title: "Mittelverwendungsrechnung",
    short:
      "Pflicht für gemeinnützige Körperschaften: Mittel zeitnah verwenden (§ 55 AO).",
    category: "NPO / Gemeinnützigkeit",
    body: `Gemeinnützige Körperschaften müssen ihre Mittel grundsätzlich zeitnah für die satzungsmäßigen Zwecke verwenden (§ 55 Abs. 1 Nr. 5 AO).

Zeitnahe Mittelverwendung:
- Mittel sind spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren zu verwenden.
- Befreiung von der zeitnahen Mittelverwendung für kleine Körperschaften (Einnahmen ≤ 45.000 €).

Nachweis:
- Mittelverwendungsrechnung als Anlage zur Jahresrechnung.
- Differenz zwischen verwendbaren und tatsächlich verwendeten Mitteln darstellen.

Tipp: Excel-Vorlage in der Mandantenakte verlinken, jährlich aktualisieren.`,
  },
  {
    id: "ruecklagen-62-ao",
    title: "Rücklagen nach § 62 AO",
    short:
      "Zweckgebundene, Wiederbeschaffungs- und freie Rücklage — Voraussetzungen und Grenzen.",
    category: "NPO / Gemeinnützigkeit",
    body: `§ 62 AO erlaubt vier Rücklagenarten:

1) Zweckgebundene Rücklage (Abs. 1 Nr. 1): konkretes Vorhaben, Zeitrahmen.
2) Wiederbeschaffungsrücklage (Abs. 1 Nr. 2): Ersatzbeschaffung von Wirtschaftsgütern.
3) Freie Rücklage (Abs. 1 Nr. 3): bis zu 1/3 des Überschusses aus Vermögensverwaltung + 10 % der sonstigen zeitnah zu verwendenden Mittel.
4) Rücklage zum Erwerb von Gesellschaftsrechten (Abs. 1 Nr. 4).

Formal:
- Beschluss des zuständigen Organs.
- Dokumentation in der Mittelverwendungsrechnung.
- Unterlassene Bildung der freien Rücklage kann nicht in Folgejahren nachgeholt werden.`,
  },
  {
    id: "bewirtungsbelege",
    title: "Bewirtungsbelege",
    short:
      "70 %-Regel, Pflichtangaben, Vorsteuerabzug — typische Fehlerquellen.",
    category: "Umsatzsteuer",
    body: `Voraussetzungen für den Betriebsausgabenabzug (§ 4 Abs. 5 Nr. 2 EStG):
- Maschinell erstellte Restaurantrechnung mit Steuernummer / USt-ID.
- Datum, Anlass, Teilnehmer (Name, Funktion), Höhe der Aufwendungen.
- Unterschrift des Bewirtenden.

Steuerliche Behandlung:
- 70 % als abzugsfähige Betriebsausgabe, 30 % nicht abzugsfähig.
- 100 % Vorsteuerabzug bei ordnungsgemäßer Rechnung (§ 15 UStG).

Typische Fehler:
- Sammelbegriff „Geschäftsessen“ ohne konkreten Anlass.
- Fehlende Teilnehmerangaben — gilt insbesondere für eigene Mitarbeitende.
- Handgeschriebene Rechnungen unzulässig.`,
  },
  {
    id: "reverse-charge",
    title: "Reverse Charge nach § 13b UStG",
    short:
      "Übergang der Steuerschuldnerschaft — Voraussetzungen und Rechnungspflichten.",
    category: "Umsatzsteuer",
    body: `Bei bestimmten Leistungen geht die Steuerschuldnerschaft auf den Leistungsempfänger über (§ 13b UStG).

Typische Fälle:
- Sonstige Leistungen ausländischer Unternehmer an inländische Unternehmer (§ 13b Abs. 1 UStG).
- Bauleistungen an Bauleistende (Abs. 2 Nr. 4).
- Lieferungen von Schrott, Altmetall, Gold, Mobilfunkgeräten (≥ 5.000 €).

Rechnungspflicht:
- Kein Ausweis deutscher USt.
- Pflichthinweis: „Steuerschuldnerschaft des Leistungsempfängers“.

Buchung:
- USt selbst berechnen und in der UStVA anmelden.
- Gleichzeitig Vorsteuerabzug (sofern berechtigt).
- Bei EU-Leistungen ZM-Meldung erforderlich.`,
  },
  {
    id: "arap",
    title: "ARAP — Aktive Rechnungsabgrenzung",
    short:
      "Ausgaben vor dem Stichtag, Aufwand danach — periodengerechte Abgrenzung.",
    category: "Jahresabschluss",
    body: `§ 250 Abs. 1 HGB / § 5 Abs. 5 EStG verlangen die Bildung eines aktiven Rechnungsabgrenzungspostens, wenn Ausgaben vor dem Abschlussstichtag Aufwand für eine bestimmte Zeit danach darstellen.

Voraussetzungen:
- Bestimmte Zeit nach dem Stichtag (kalendermäßig festgelegt).
- Ausgabe ist vor dem Stichtag erfolgt.

Typische Fälle: Versicherungen, Mieten, Hosting, Wartungsverträge, Kfz-Steuer.

Praxis:
- Erfassung über Konto SKR03 980 / SKR04 1900.
- Monatliche Auflösung als wiederkehrende Buchung anlegen.
- Wesentlichkeitsgrenze (z. B. 800 € netto) intern definieren.`,
  },
  {
    id: "opos",
    title: "OPOS — Offene-Posten-Verwaltung",
    short:
      "Forderungs- und Verbindlichkeitsabstimmung, Wertberichtigung, USt-Korrektur.",
    category: "Buchhaltung",
    body: `OPOS-Listen liefern die Basis für Mahnwesen, Liquiditätsplanung und Jahresabschluss.

Zum Jahresabschluss prüfen:
- Altersstruktur der Forderungen.
- Einzelwertberichtigung bei begründetem Ausfallrisiko.
- Pauschalwertberichtigung (empirisch, oft 1 %).
- Endgültig uneinbringliche Forderungen ausbuchen; USt-Berichtigung nach § 17 UStG.

Tipp: Kontenklärung Debitoren/Kreditoren vor der Bilanz aufstellen, ungeklärte Differenzen über Klärungskonto sammeln.`,
  },
  {
    id: "spendenbescheinigung",
    title: "Spendenbescheinigungen (Zuwendungsbestätigung)",
    short:
      "Amtliches Muster, vereinfachter Nachweis, Sachspenden.",
    category: "NPO / Gemeinnützigkeit",
    body: `Zuwendungsbestätigungen sind formgebunden (§ 50 EStDV, amtliches Muster).

Vereinfachter Nachweis bis 300 € (§ 50 Abs. 4 EStDV):
- Bareinzahlungsbeleg oder Buchungsbestätigung des Kreditinstituts.
- Plus Beleg der Empfängerkörperschaft (Zweck, Freistellungsbescheid).

Sachspenden:
- Wertansatz: gemeiner Wert, ggf. Buchwert bei Entnahme aus Betriebsvermögen.
- Nachweis der Wertermittlung in der Akte.

Haftung: Aussteller haftet bei vorsätzlich/grob fahrlässig falscher Bestätigung (§ 10b Abs. 4 EStG).`,
  },
  {
    id: "datev-kontenrahmen",
    title: "DATEV Kontenrahmen SKR03 vs. SKR04",
    short:
      "Wann SKR03, wann SKR04? Unterschiede für Kanzleien und NPOs.",
    category: "DATEV",
    body: `SKR03: Prozess­gliederungs­prinzip (Aufwand/Ertrag). Weit verbreitet im Mittelstand.
SKR04: Abschluss­gliederungs­prinzip (orientiert an § 266 HGB). Vorteilhaft bei größeren Kapitalgesellschaften.
SKR42: Spezialkontenrahmen für gemeinnützige Vereine und Stiftungen — Sphärenzuordnung integriert.

Empfehlung:
- Wechsel ausschließlich zum Geschäftsjahresbeginn.
- Bei NPOs SKR42 prüfen, weil Sphären (ideell, Vermögensverwaltung, Zweckbetrieb, wGB) sauber abgebildet werden.`,
  },
  {
    id: "rueckfrage-checkliste",
    title: "Checkliste Mandanten-Rückfragen",
    short:
      "Was muss eine gute Rückfrage enthalten — Form und Inhalt.",
    category: "Rückfragen",
    body: `Eine gute Rückfrage:
1) Konkrete Frage (kein „bitte Unterlagen nachreichen“).
2) Verweis auf den Sachverhalt / die Belegnummer.
3) Frist mit Datum.
4) Hinweis auf Konsequenz (z. B. Schätzung, Fristverlängerung).
5) Kanal: Mandantenportal bevorzugt vor E-Mail (Revisionssicherheit).

Tonalität: sachlich, freundlich, ohne Fachjargon gegenüber Mandanten.`,
  },
  {
    id: "skr03-typische-konten",
    title: "SKR03 — typische Konten Kanzleialltag",
    short:
      "Schnellüberblick: 4980 Werbung, 4650 Bewirtung, 1576 Vorsteuer, …",
    category: "SKR03",
    body: `Häufig genutzte SKR03-Konten:
- 1200 Bank
- 1576 Abziehbare Vorsteuer 19 %
- 1577 Abziehbare Vorsteuer § 13b
- 1771 Umsatzsteuer 19 %
- 4380 Fremdleistungen / EDV-Kosten
- 4650 Bewirtungskosten (70 %)
- 4654 Nicht abzugsfähige Bewirtungskosten
- 4980 Werbe-/Reisekosten
- 0980 Aktive Rechnungsabgrenzung

Buchungssätze stets mit eindeutigem Belegtext und Belegnummer erfassen.`,
  },
  {
    id: "skr42-sphaeren",
    title: "SKR42 — Sphären gemeinnütziger Körperschaften",
    short:
      "Ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb.",
    category: "SKR42",
    body: `SKR42 bildet die vier Sphären nach AO ab:

1) Ideeller Bereich — Beiträge, Spenden, Zuschüsse (steuerfrei).
2) Vermögensverwaltung — Zinsen, Mieten (steuerfrei, aber Mittelverwendung).
3) Zweckbetrieb (§§ 65–68 AO) — z. B. Bildungsangebote (steuerfrei, ermäßigter USt-Satz).
4) Wirtschaftlicher Geschäftsbetrieb — z. B. Cafeteria (KSt- & GewSt-pflichtig oberhalb 45.000 € Einnahmen).

Trennung der Konten zwingend, um die Steuerpflicht korrekt zu ermitteln.`,
  },
  {
    id: "jahresabschluss-checkliste",
    title: "Jahresabschluss — Checkliste",
    short:
      "Inventur, Abgrenzungen, Rückstellungen, OPOS, latente Steuern.",
    category: "Jahresabschluss",
    body: `Vorbereitung:
- Inventur körperlich + Bewertung.
- Kontenklärung Debitoren/Kreditoren.
- Bank- und Kassenabstimmung.

Bewertung:
- ARAP / PRAP.
- Rückstellungen (Urlaub, Boni, Prozessrisiken, Steuern).
- Abschreibungen + Sonderabschreibungen.

Steuerlich:
- Latente Steuern (ab mittelgroßen KapGes).
- Verrechnungskonten gegen 0.
- E-Bilanz: Taxonomie aktuell? Berichtsperiode korrekt?`,
  },
];

// Aus interner Wissensbasis (Kanzlei-Arbeitspapiere) ergänzte Einträge.
// Die zugrundeliegenden PDFs werden bewusst nicht ausgeliefert.
const KB_ARTICLES: Article[] = KNOWLEDGE_BASE.map((e) => ({
  id: `kb-${e.id}`,
  title: e.title,
  short: e.short,
  category: e.category as Category,
  body: `${e.body}\n\nQuelle (intern): ${e.source}${
    e.references?.length ? `\nRechtsgrundlagen: ${e.references.join(", ")}` : ""
  }`,
}));

const ALL_ARTICLES: Article[] = [...ARTICLES, ...KB_ARTICLES];

function Wissensdatenbank() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("Alle");
  const [open, setOpen] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ARTICLES.filter((a) => {
      if (cat !== "Alle" && a.category !== cat) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.short.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Wissensdatenbank
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Kuratierte steuerliche Inhalte, Buchungslogiken und Kanzlei-Standards.
          </p>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach Stichwort, Paragraf, Konto …"
              className="pl-9"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={
                  "rounded-full border px-3 py-1 text-xs transition-colors " +
                  (cat === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground")
                }
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Keine Treffer für „{query}“.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <article
                  key={a.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card-soft transition-colors hover:border-foreground/30"
                >
                  <span className="inline-flex items-center gap-1.5 self-start rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {a.category}
                  </span>
                  <h2 className="mt-3 text-sm font-semibold text-foreground">{a.title}</h2>
                  <p className="mt-1 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {a.short}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 self-start"
                    onClick={() => setOpen(a)}
                  >
                    Öffnen
                  </Button>
                </article>
              ))}
            </div>
          )}

          <HandoutsManager />
        </div>
      </main>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
              <div>
                <span className="inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {open.category}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{open.title}</h3>
              </div>
              <button
                type="button"
                aria-label="Schließen"
                onClick={() => setOpen(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {open.body}
              </pre>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
