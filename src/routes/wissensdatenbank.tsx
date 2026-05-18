import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, X, Copy, Check, ClipboardList, FileText } from "lucide-react";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import { HandoutsManager } from "@/components/HandoutsManager";
import { listHandouts, type Handout } from "@/lib/knowledgeTopics";

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
  "Kfz",
  "AO / Verfahrensrecht",
  "Erbschaftsteuer",
  "Umwandlungsteuer",
  "Bilanzierung",
] as const;

type Category = (typeof CATEGORIES)[number];

// Strikte Kategorie-Zuordnung über stabile Artikel-IDs.
// Keine breite Substring-/Keyword-Suche mehr — dadurch keine Cross-Treffer
// wie „Reverse Charge“ unter „Erbschaftsteuer“.
//
// PRIMARY_OVERRIDE: Setzt die effektive (primäre) Kategorie einzelner Artikel,
//   ohne die Rohdaten zu ändern. Wird auch für Anzeige + Counts verwendet.
// RELATED: Zusätzliche Kategorien, in denen ein Artikel ebenfalls erscheinen darf
//   (bewusst sparsam einsetzen).
const PRIMARY_OVERRIDE: Record<string, Category> = {
  "kb-erbschaftsteuer-grundlagen": "Erbschaftsteuer",
  "kb-erbschaftsteuer-merksaetze": "Erbschaftsteuer",
  "kb-anteilstausch-umwstg": "Umwandlungsteuer",
  "kb-aenderung-173a-ao": "AO / Verfahrensrecht",
  "kb-kfz-wertabgabe-1prozent": "Kfz",
  "kb-bilanzierung-immaterielle-rueckstellungen": "Bilanzierung",
  "kb-rhb-vorratsbewertung": "Bilanzierung",
};

const RELATED: Record<string, Category[]> = {
  "kb-reverse-charge-npo": ["NPO / Gemeinnützigkeit"],
  "kb-ruecklage-allgemein": ["Bilanzierung"],
};

function effectiveCategory(a: Article): Category {
  return PRIMARY_OVERRIDE[a.id] ?? a.category;
}

function articleMatchesCategory(a: Article, c: Category): boolean {
  if (c === "Alle") return true;
  // Strikt: ausschließlich effektive Kategorie + explizit erlaubte RELATED-IDs.
  // Keine Tag-/Substring-Heuristik mehr – verhindert Cross-Treffer
  // (z. B. USt-Karten unter „DATEV“).
  if (effectiveCategory(a) === c) return true;
  return RELATED[a.id]?.includes(c) ?? false;
}

interface Article {
  id: string;
  title: string;
  short: string;
  category: Category;
  body: string;
  checklist?: string[];
  commonMistakes?: string[];
  questions?: string[];
  relatedModules?: { label: string; to: string }[];
  tags?: string[];
  source?: string;
}

const ARTICLES: Article[] = [
  {
    id: "mittelverwendung",
    title: "Mittelverwendungsrechnung",
    short:
      "Pflicht für gemeinnützige Körperschaften: Mittel zeitnah verwenden (§ 55 AO).",
    category: "NPO / Gemeinnützigkeit",
    tags: ["NPO", "Mittelverwendung", "§ 55 AO", "Rücklagenspiegel", "Verwendungsüberhang"],
    body: `Die Mittelverwendungsrechnung (MVR) dokumentiert, ob eine gemeinnützige Körperschaft ihre Mittel zeitnah und satzungsgemäß verwendet (§ 55 Abs. 1 Nr. 5 AO).

Zeitnahe Mittelverwendung
- Mittel sind grundsätzlich bis zum Ende des zweiten auf den Zufluss folgenden Kalender- bzw. Wirtschaftsjahres zu verwenden.
- Befreiung möglich für kleine Körperschaften mit Einnahmen ≤ 45.000 € (§ 55 Abs. 1 Nr. 5 Satz 4 AO).

Bestandteile der MVR
- Mittelzuflüsse (ideeller Bereich, Vermögensverwaltung, Zweckbetrieb, wGB)
- Mittelverwendung (zweckgebundene Ausgaben)
- Rücklagenbildung nach § 62 AO
- Mittelvortrag aus Vorjahren
- Rücklagenspiegel
- Verwendungsüberhang / -unterhang

Nachweis
- MVR als Nebenrechnung zum Jahresabschluss.
- Differenz zwischen verwendbaren und tatsächlich verwendeten Mitteln darstellen.

Praxis
- Excel-Vorlage in der Mandantenakte verlinken, jährlich fortschreiben.
- Ein positiver Verwendungsüberhang kann auf eine nicht zeitnahe Mittelverwendung hinweisen und sollte geprüft werden.`,
    checklist: [
      "Zuflussjahr je Mittelart erfasst?",
      "Zwei-Jahres-Frist je Tranche dokumentiert?",
      "Rücklagenspiegel aktuell?",
      "Verwendungsüberhang erklärt?",
      "Befreiung nach § 55 Abs. 1 Nr. 5 Satz 4 AO geprüft?",
    ],
    commonMistakes: [
      "Mittel aus mehreren Jahren in einem Topf — keine Tranchen-Sicht.",
      "Rücklagen nicht beschlossen oder nicht dokumentiert.",
      "Verwendungsüberhang ohne Begründung stehen gelassen.",
    ],
    questions: [
      "Welches Wirtschafts-/Kalenderjahr betrachten wir?",
      "Liegen Einnahmen ≤ 45.000 € vor (Befreiung)?",
      "Existieren Rücklagenbeschlüsse?",
    ],
    relatedModules: [
      { label: "Mittelverwendungsrechner", to: "/mittelverwendungsrechner" },
      { label: "NPO-Prüfassistent", to: "/npo-pruefassistent" },
    ],
    source: "Internes Arbeitspapier — MVR-Standard.",
  },
  {
    id: "ruecklagen-62-ao",
    title: "Rücklagen nach § 62 AO",
    short:
      "Zweckgebundene, Wiederbeschaffungs- und freie Rücklage — Voraussetzungen und Grenzen.",
    category: "NPO / Gemeinnützigkeit",
    tags: ["NPO", "Rücklagen", "§ 62 AO", "Rücklagenspiegel", "Mittelverwendung"],
    body: `§ 62 AO erlaubt gemeinnützigen Körperschaften bestimmte Rücklagen. Mittel, die in eine zulässige Rücklage eingestellt werden, gelten als verwendet und sind der zeitnahen Mittelverwendung entzogen.

Rücklagenarten
1) Zweckgebundene Rücklage (Abs. 1 Nr. 1) — konkretes Vorhaben, Zeitrahmen.
2) Wiederbeschaffungsrücklage (Abs. 1 Nr. 2) — Ersatzbeschaffung von Wirtschaftsgütern.
3) Freie Rücklage (Abs. 1 Nr. 3) — bis 1/3 des Überschusses aus Vermögensverwaltung + 10 % der sonstigen zeitnah zu verwendenden Mittel.
4) Rücklage zum Erwerb von Gesellschaftsrechten (Abs. 1 Nr. 4).
5) Betriebsmittelrücklage — laufender Liquiditätsbedarf.
6) Vermögenszuführungen (§ 62 Abs. 3 AO) — Sachzuwendungen, Erbschaften.

Formal
- Beschluss des zuständigen Organs.
- Dokumentation in der Mittelverwendungsrechnung und im Rücklagenspiegel.
- Unterlassene Bildung der freien Rücklage kann nicht in Folgejahren nachgeholt werden.`,
    checklist: [
      "Rücklagenart eindeutig bestimmt?",
      "Beschluss des Organs vorhanden?",
      "Zweck, Betrag, Finanzierungsplan dokumentiert?",
      "Geplanter Verwendungszeitpunkt festgehalten?",
      "Rücklagenspiegel aktualisiert?",
    ],
    commonMistakes: [
      "Freie Rücklage nicht im Jahr gebildet — Nachholung nicht möglich.",
      "Zweckgebundene Rücklage ohne konkretes Vorhaben.",
      "Wiederbeschaffungsrücklage ohne tatsächliche Ersatzplanung.",
    ],
    questions: [
      "Welcher Zweck wird mit der Rücklage verfolgt?",
      "Wann ist die Verwendung geplant?",
      "Gibt es einen Organbeschluss?",
    ],
    relatedModules: [
      { label: "Mittelverwendungsrechner", to: "/mittelverwendungsrechner" },
      { label: "NPO-Prüfassistent", to: "/npo-pruefassistent" },
    ],
  },
  {
    id: "bewirtungsbelege",
    title: "Bewirtungsbelege",
    short:
      "70 %-Regel, Pflichtangaben, Vorsteuerabzug — typische Fehlerquellen.",
    category: "Umsatzsteuer",
    tags: ["USt", "Bewirtung", "§ 4 EStG", "Vorsteuer"],
    body: `Voraussetzungen für den Betriebsausgabenabzug (§ 4 Abs. 5 Nr. 2 EStG):
- Maschinell erstellte Restaurantrechnung mit Steuernummer / USt-ID.
- Datum, Anlass, Teilnehmer (Name, Funktion), Höhe der Aufwendungen.
- Unterschrift des Bewirtenden.
- Trinkgeld separat dokumentieren.

Steuerliche Behandlung
- 70 % als abzugsfähige Betriebsausgabe, 30 % nicht abzugsfähig.
- 100 % Vorsteuerabzug bei ordnungsgemäßer Rechnung (§ 15 UStG).

Bei rein eigener Belegschaft (z. B. Weihnachtsfeier) gelten gesonderte Regeln — keine 70/30-Aufteilung, sondern Sachbezugs- und Lohnsteuerlogik.`,
    checklist: [
      "Maschinelle Rechnung mit Steuernummer?",
      "Anlass konkret formuliert?",
      "Alle Teilnehmer (inkl. Funktion) genannt?",
      "Datum und Ort eindeutig?",
      "Trinkgeld separat ausgewiesen?",
      "Geschäftlicher / betrieblicher Bezug klar?",
    ],
    commonMistakes: [
      "Sammelbegriff „Geschäftsessen“ ohne konkreten Anlass.",
      "Fehlende Teilnehmerangaben — insbesondere eigene Mitarbeitende.",
      "Handgeschriebene Rechnungen unzulässig.",
      "70/30-Logik auf interne Veranstaltungen angewendet.",
    ],
    questions: [
      "Wer war anwesend (Namen, Funktionen)?",
      "Was war der konkrete Anlass?",
      "Liegt eine maschinelle Rechnung vor?",
    ],
    relatedModules: [
      { label: "Neue Anfrage starten", to: "/neue-anfrage" },
    ],
  },
  {
    id: "reverse-charge",
    title: "Reverse Charge nach § 13b UStG",
    short:
      "Übergang der Steuerschuldnerschaft — Voraussetzungen und Rechnungspflichten.",
    category: "Umsatzsteuer",
    tags: ["USt", "Reverse Charge", "§ 13b UStG"],
    body: `Bei bestimmten Leistungen geht die Steuerschuldnerschaft auf den Leistungsempfänger über (§ 13b UStG).

Typische Fälle
- Sonstige Leistungen ausländischer Unternehmer an inländische Unternehmer (§ 13b Abs. 1 UStG).
- Bauleistungen an Bauleistende (Abs. 2 Nr. 4).
- Lieferungen von Schrott, Altmetall, Gold, Mobilfunkgeräten (≥ 5.000 €).

Rechnungspflicht
- Kein Ausweis deutscher USt.
- Pflichthinweis: „Steuerschuldnerschaft des Leistungsempfängers“.

Buchung
- USt selbst berechnen und in der UStVA anmelden.
- Gleichzeitig Vorsteuerabzug (sofern berechtigt).
- Bei EU-Leistungen ZM-Meldung erforderlich.`,
    checklist: [
      "Empfänger ist Unternehmer?",
      "Leistungsart fällt unter § 13b UStG?",
      "Rechnung ohne USt + Pflichthinweis?",
      "UStVA und ggf. ZM vorbereitet?",
    ],
    commonMistakes: [
      "Pflichthinweis auf der Rechnung vergessen.",
      "Vorsteuerabzug ohne USt-Buchung.",
      "ZM bei EU-Leistungen vergessen.",
    ],
  },
  {
    id: "arap",
    title: "ARAP — Aktive Rechnungsabgrenzung",
    short:
      "Ausgaben vor dem Stichtag, Aufwand danach — periodengerechte Abgrenzung.",
    category: "Jahresabschluss",
    tags: ["Jahresabschluss", "ARAP", "§ 250 HGB"],
    body: `§ 250 Abs. 1 HGB / § 5 Abs. 5 EStG verlangen die Bildung eines aktiven Rechnungsabgrenzungspostens, wenn Ausgaben vor dem Abschlussstichtag Aufwand für eine bestimmte Zeit danach darstellen.

Voraussetzungen
- Bestimmte Zeit nach dem Stichtag (kalendermäßig festgelegt).
- Ausgabe ist vor dem Stichtag erfolgt.

Typische Fälle: Versicherungen, Mieten, Hosting, Wartungsverträge, Kfz-Steuer.

Praxis
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
    tags: ["OPOS", "DATEV", "Debitoren", "Kreditoren"],
    body: `OPOS-Listen liefern die Basis für Mahnwesen, Liquiditätsplanung und Jahresabschluss.

Zum Jahresabschluss prüfen
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
    tags: ["NPO", "Spende", "§ 10b EStG", "§ 50 EStDV"],
    body: `Zuwendungsbestätigungen sind formgebunden (§ 50 EStDV, amtliches Muster).

Vereinfachter Nachweis bis 300 € (§ 50 Abs. 4 EStDV)
- Bareinzahlungsbeleg oder Buchungsbestätigung des Kreditinstituts.
- Plus Beleg der Empfängerkörperschaft (Zweck, Freistellungsbescheid).

Sachspenden
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
    tags: ["DATEV", "SKR03", "SKR04", "SKR42", "Kontenrahmen"],
    body: `SKR03 — Prozess­gliederungs­prinzip (Aufwand/Ertrag). Weit verbreitet im Mittelstand.
SKR04 — Abschluss­gliederungs­prinzip (orientiert an § 266 HGB). Vorteilhaft bei größeren Kapitalgesellschaften.
SKR42 — Spezialkontenrahmen für gemeinnützige Vereine und Stiftungen — Sphärenzuordnung integriert.

Empfehlung
- Wechsel ausschließlich zum Geschäftsjahresbeginn.
- Bei NPOs SKR42 prüfen, weil Sphären (ideell, Vermögensverwaltung, Zweckbetrieb, wGB) sauber abgebildet werden.`,
    relatedModules: [{ label: "SKR-Konverter", to: "/skr-konverter" }],
  },
  {
    id: "rueckfrage-checkliste",
    title: "Checkliste Mandanten-Rückfragen",
    short:
      "Was muss eine gute Rückfrage enthalten — Form und Inhalt.",
    category: "Rückfragen",
    tags: ["Rückfragen"],
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
    tags: ["SKR03", "DATEV"],
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
    tags: ["NPO", "SKR42", "Sphären", "Mittelverwendung", "DATEV"],
    body: `SKR42 wird bei gemeinnützigen Organisationen genutzt, um Vorgänge nach steuerlichen Sphären zu strukturieren. Die Sphärenzuordnung beeinflusst Umsatzsteuer, Ertragsteuer, Mittelverwendung und Kontierung.

Die vier Sphären nach AO
1) Ideeller Bereich — Beiträge, Spenden, Zuschüsse (steuerfrei).
2) Vermögensverwaltung — Zinsen, Mieten (steuerfrei, aber Mittelverwendung beachten).
3) Zweckbetrieb (§§ 65–68 AO) — z. B. Bildungsangebote (steuerfrei, ermäßigter USt-Satz möglich).
4) Wirtschaftlicher Geschäftsbetrieb — z. B. Cafeteria (KSt- & GewSt-pflichtig oberhalb 45.000 € Einnahmen).

Vor der Kontierung sollte die Sphäre geprüft werden. Trennung der Konten zwingend, um die Steuerpflicht korrekt zu ermitteln.`,
    checklist: [
      "Welche Art von Einnahme oder Ausgabe liegt vor?",
      "Gibt es eine Gegenleistung?",
      "Besteht ein direkter Satzungsbezug?",
      "Handelt es sich um Vermögensverwaltung?",
      "Liegt ein Zweckbetrieb vor?",
      "Ist ein steuerpflichtiger wirtschaftlicher Geschäftsbetrieb möglich?",
    ],
    commonMistakes: [
      "Sponsoring mit Gegenleistung im ideellen Bereich gebucht.",
      "Vermögensverwaltung mit Zweckbetrieb vermischt.",
      "wGB-Grenze (45.000 €) übersehen.",
    ],
    questions: [
      "Liegt eine konkrete Gegenleistung vor?",
      "Wird der Satzungszweck unmittelbar erfüllt?",
      "Welche USt-Logik gilt?",
    ],
    relatedModules: [
      { label: "SKR-Konverter", to: "/skr-konverter" },
      { label: "NPO-Prüfassistent", to: "/npo-pruefassistent" },
    ],
  },
  {
    id: "vier-sphaeren",
    title: "Die vier Sphären gemeinnütziger Körperschaften",
    short:
      "Ideeller Bereich, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb.",
    category: "NPO / Gemeinnützigkeit",
    tags: ["NPO", "Sphären", "Zweckbetrieb", "wGB"],
    body: `Ideeller Bereich
- Mitgliedsbeiträge, Spenden, echte Zuschüsse ohne Gegenleistung.
- Steuerfrei.

Vermögensverwaltung
- Zinsen, langfristige Vermietung, Kapitalerträge.
- Steuerfrei, aber Mittelverwendungspflicht beachten.

Zweckbetrieb (§§ 65–68 AO)
- Tätigkeit dient unmittelbar dem steuerbegünstigten Satzungszweck.
- Steuerbegünstigt, oft ermäßigter USt-Satz.

Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb
- Wirtschaftliche Tätigkeit mit Einnahmen und möglichem Wettbewerb.
- Beispiele: Verkauf, Fest, Sponsoring mit Gegenleistung.
- KSt- und GewSt-pflichtig oberhalb 45.000 € Einnahmen.`,
    checklist: [
      "Sphäre eindeutig bestimmt?",
      "Gegenleistung vorhanden?",
      "Satzungsbezug dokumentiert?",
      "USt-Logik je Sphäre korrekt?",
    ],
    relatedModules: [{ label: "NPO-Prüfassistent", to: "/npo-pruefassistent" }],
  },
  {
    id: "ruecklage-grundlagen",
    title: "Rücklage — Grundlagen und Abgrenzungen",
    short:
      "Allgemeine Rücklage, steuerliche Spezialrücklage, § 62 AO und Abgrenzung zur Rückstellung.",
    category: "Buchhaltung",
    tags: ["Rücklage", "Rückstellung", "§ 62 AO", "Eigenkapital"],
    body: `Eine Rücklage ist grundsätzlich zurückbehaltenes Eigenkapital bzw. gebundene Mittel. Zu unterscheiden sind:

1) Allgemeine Rücklage
- Eigenkapitalposition (Gewinnrücklage, Kapitalrücklage, gesetzliche Rücklage).

2) Steuerliche Spezialrücklage
- z. B. § 6b EStG Reinvestitionsrücklage, Ersatzbeschaffungsrücklage (R 6.6 EStR).

3) Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO
- Freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage.

4) Abgrenzung Rückstellung
- Rückstellung = Fremdkapital, ungewisse Verbindlichkeit (§ 249 HGB).
- Rücklage = Eigenkapital bzw. Mittelbindung.
- Rückstellung ist nicht gleich Rücklage.`,
    checklist: [
      "Welche Art der Rücklage liegt vor?",
      "Eigenkapital oder Fremdkapital?",
      "Bei NPO: § 62 AO geprüft?",
      "Beschluss / Dokumentation vorhanden?",
    ],
    commonMistakes: [
      "Rückstellung und Rücklage verwechselt.",
      "Freie Rücklage nicht im Entstehungsjahr gebildet.",
    ],
    relatedModules: [
      { label: "Mittelverwendungsrechner", to: "/mittelverwendungsrechner" },
    ],
  },
  {
    id: "jahresabschluss-checkliste",
    title: "Jahresabschluss — Checkliste",
    short:
      "Inventur, Abgrenzungen, Rückstellungen, OPOS, latente Steuern.",
    category: "Jahresabschluss",
    tags: ["Jahresabschluss", "Bilanz", "Review"],
    body: `Vorbereitung
- Inventur körperlich + Bewertung.
- Kontenklärung Debitoren/Kreditoren.
- Bank- und Kassenabstimmung.

Bewertung
- ARAP / PRAP.
- Rückstellungen (Urlaub, Boni, Prozessrisiken, Steuern).
- Abschreibungen + Sonderabschreibungen.

Steuerlich
- Latente Steuern (ab mittelgroßen KapGes).
- Verrechnungskonten gegen 0.
- E-Bilanz: Taxonomie aktuell? Berichtsperiode korrekt?

Bei NPO zusätzlich
- Sphärenrechnung sauber abgegrenzt.
- Rücklagenspiegel aktualisiert.
- Mittelverwendungsrechnung erstellt.`,
    checklist: [
      "Bankabstimmung",
      "Kassenprüfung",
      "OPOS Debitoren",
      "OPOS Kreditoren",
      "ARAP / PRAP",
      "Rückstellungen",
      "Anlagevermögen",
      "Darlehen",
      "Umsatzsteuer-Verprobung",
      "Lohnkonten",
      "NPO: Sphären, Rücklagen, MVR",
    ],
    relatedModules: [
      { label: "Mittelverwendungsrechner", to: "/mittelverwendungsrechner" },
      { label: "SKR-Konverter", to: "/skr-konverter" },
    ],
  },
];

// Aus interner Wissensbasis (Kanzlei-Arbeitspapiere) ergänzte Einträge.
const KB_ARTICLES: Article[] = KNOWLEDGE_BASE.map((e) => ({
  id: `kb-${e.id}`,
  title: e.title,
  short: e.short,
  category: e.category as Category,
  body: `${e.body}${
    e.references?.length ? `\n\nRechtsgrundlagen: ${e.references.join(", ")}` : ""
  }`,
  source: e.source,
  tags: [e.category],
}));

// Dedupe nach ID — KNOWLEDGE_BASE enthält teilweise doppelte Einträge
// (z. B. „reverse-charge-npo“, „darlehen-npo“). Doppelte React-Keys führen
// zu stehengebliebenen DOM-Nodes beim Filterwechsel.
const ALL_ARTICLES: Article[] = (() => {
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const a of [...ARTICLES, ...KB_ARTICLES]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    out.push(a);
  }
  return out;
})();

function matchHandouts(article: Article): Handout[] {
  const all = listHandouts();
  if (all.length === 0) return [];
  const tagSet = new Set(
    [...(article.tags ?? []), article.category, article.title]
      .join(" ")
      .toLowerCase()
      .split(/[\s,/]+/)
      .filter((s) => s.length > 2),
  );
  return all.filter((h) => {
    const hay = [h.category, h.title, h.short, ...(h.tags ?? [])]
      .join(" ")
      .toLowerCase();
    for (const t of tagSet) if (hay.includes(t)) return true;
    return false;
  });
}

function articleBody(article: Article) {
  const body = article.body?.trim();
  if (body) return body;
  return `${article.title}\n\n${article.short}\n\nDieser Wissenseintrag gehört zur Kategorie ${article.category}. Prüfe den Sachverhalt anhand der Kurzbeschreibung, der Prüfpunkte und der passenden Module.`;
}

function ArticleDetails({
  article,
  copied,
  notice,
  onCopy,
  onPruefnotiz,
  onClose,
}: {
  article: Article;
  copied: boolean;
  notice: string | null;
  onCopy: (article: Article) => void;
  onPruefnotiz: (article: Article) => void;
  onClose: () => void;
}) {
  const handouts = matchHandouts(article);

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border p-4">
        <div className="min-w-0">
          <span className="inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {effectiveCategory(article)}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{article.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{article.short}</p>
        </div>
        <button
          type="button"
          aria-label="Schließen"
          onClick={onClose}
          className="relative z-[1002] rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-6">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inhalt
          </h4>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {articleBody(article)}
          </pre>
        </section>

        {article.checklist && article.checklist.length > 0 && (
          <section className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prüfpunkte
            </h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {article.checklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {article.commonMistakes && article.commonMistakes.length > 0 && (
          <section className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Typische Fehler
            </h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {article.commonMistakes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {article.questions && article.questions.length > 0 && (
          <section className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rückfragen
            </h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {article.questions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {article.relatedModules && article.relatedModules.length > 0 && (
          <section className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Passende Module
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {article.relatedModules.map((m, i) => (
                <a
                  key={i}
                  href={m.to}
                  className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                >
                  {m.label}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Eigene Handouts
          </h4>
          {handouts.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Keine eigenen Handouts zu diesem Thema hinterlegt.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {handouts.map((h) => (
                <li key={h.id} className="rounded-md border border-border bg-background p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{h.title}</p>
                    <span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {h.category}
                    </span>
                  </div>
                  {h.short && <p className="mt-1 text-xs text-muted-foreground">{h.short}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {article.source && (
          <p className="mt-5 text-[11px] text-muted-foreground">
            Quelle (intern): {article.source}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button type="button" size="sm" variant="outline" onClick={() => onCopy(article)}>
          {copied ? (
            <>
              <Check className="mr-1 h-3.5 w-3.5" />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3.5 w-3.5" />
              Text kopieren
            </>
          )}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onPruefnotiz(article)}>
          <ClipboardList className="mr-1 h-3.5 w-3.5" />
          Als Prüfnotiz verwenden
        </Button>
        <div className="flex-1" />
        {notice && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            {notice}
          </span>
        )}
        <Button type="button" size="sm" onClick={onClose}>
          Schließen
        </Button>
      </div>
    </>
  );
}

function KnowledgeDetailPortal({
  article,
  copied,
  notice,
  onCopy,
  onPruefnotiz,
  onClose,
}: {
  article: Article;
  copied: boolean;
  notice: string | null;
  onCopy: (article: Article) => void;
  onPruefnotiz: (article: Article) => void;
  onClose: () => void;
}) {
  if (typeof document === "undefined" || !document.body || !articleBody(article).trim()) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1000] bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        data-no-swipe="true"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[1001] flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(720px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
        data-no-swipe="true"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <ArticleDetails
          article={article}
          copied={copied}
          notice={notice}
          onCopy={onCopy}
          onPruefnotiz={onPruefnotiz}
          onClose={onClose}
        />
      </div>
    </>,
    document.body,
  );
}

function Wissensdatenbank() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("Alle");
  const [open, setOpen] = useState<Article | null>(null);
  const [inlineOpenId, setInlineOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [canUsePortal, setCanUsePortal] = useState(false);

  // Einzige Quelle der Wahrheit: gleiche Liste für Count UND Karten.
  const finalVisibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ARTICLES.filter((a) => {
      if (!articleMatchesCategory(a, cat)) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.short.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, cat]);
  const filtered = finalVisibleItems;

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIES) {
      m[c] = ALL_ARTICLES.filter((a) => articleMatchesCategory(a, c)).length;
    }
    return m;
  }, []);

  const grouped = useMemo(() => {
    if (cat !== "Alle") return null;
    const seen = new Set<string>();
    const groups: { category: Category; items: Article[] }[] = [];
    for (const c of CATEGORIES) {
      if (c === "Alle") continue;
      const items = filtered.filter(
        (a) => !seen.has(a.id) && articleMatchesCategory(a, c),
      );
      items.forEach((a) => seen.add(a.id));
      if (items.length) groups.push({ category: c, items });
    }
    const rest = filtered.filter((a) => !seen.has(a.id));
    if (rest.length) groups.push({ category: "Buchhaltung" as Category, items: rest });
    return groups;
  }, [cat, filtered]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Dev-Debug: aktiver Filter + tatsächlich angezeigte Kategorien.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("[KB-Filter]", {
        activeCategoryId: cat,
        query,
        visible: filtered.map((a) => ({ id: a.id, cat: effectiveCategory(a) })),
      });
    }
    const el = document.getElementById("kb-list-anchor");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [cat, query, filtered]);

  useEffect(() => {
    setCanUsePortal(typeof document !== "undefined" && !!document.body);
  }, []);

  const buildFullText = (a: Article) => {
    const lines = [
      `${a.category} — ${a.title}`,
      "",
      a.short,
      "",
      articleBody(a),
    ];
    if (a.checklist?.length) {
      lines.push("", "Prüfpunkte:", ...a.checklist.map((c) => `- ${c}`));
    }
    if (a.commonMistakes?.length) {
      lines.push("", "Typische Fehler:", ...a.commonMistakes.map((c) => `- ${c}`));
    }
    if (a.questions?.length) {
      lines.push("", "Rückfragen:", ...a.questions.map((c) => `- ${c}`));
    }
    if (a.source) lines.push("", `Quelle (intern): ${a.source}`);
    return lines.join("\n");
  };

  const openArticle = (article: Article) => {
    if (!articleBody(article).trim()) {
      setOpen(null);
      setInlineOpenId(article.id);
      return;
    }
    setInlineOpenId(article.id);
    setOpen(article);
  };

  const closeArticle = () => {
    setOpen(null);
    setInlineOpenId(null);
  };

  const handleCopy = async (a: Article) => {
    try {
      await navigator.clipboard.writeText(buildFullText(a));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotice("Kopieren fehlgeschlagen.");
      setTimeout(() => setNotice(null), 2000);
    }
  };

  const handlePruefnotiz = async (a: Article) => {
    try {
      await navigator.clipboard.writeText(buildFullText(a));
      setNotice("Inhalt kopiert — kann in eine Prüfnotiz übernommen werden.");
      setTimeout(() => setNotice(null), 2500);
    } catch {
      setNotice("Kopieren fehlgeschlagen.");
      setTimeout(() => setNotice(null), 2000);
    }
  };

  const renderCard = (a: Article) => (
    <div key={a.id} className="sm:contents">
      <article
        role="button"
        tabIndex={0}
        onClick={() => openArticle(a)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openArticle(a);
          }
        }}
        data-no-swipe="true"
        className="pointer-events-auto flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-4 shadow-card-soft transition-colors hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className="inline-flex items-center gap-1.5 self-start rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          {effectiveCategory(a)}
        </span>
        <h2 className="mt-3 text-sm font-semibold text-foreground">{a.title}</h2>
        <p className="mt-1 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
          {a.short}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto mt-3 self-start"
          onClick={(e) => {
            e.stopPropagation();
            openArticle(a);
          }}
        >
          Öffnen
        </Button>
      </article>
      {inlineOpenId === a.id && (!open || !canUsePortal) && (
        <div className="mt-3 flex max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-card-soft sm:col-span-2 lg:col-span-3">
          <ArticleDetails
            article={a}
            copied={copied}
            notice={notice}
            onCopy={handleCopy}
            onPruefnotiz={handlePruefnotiz}
            onClose={closeArticle}
          />
        </div>
      )}
    </div>
  );

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

          <div className="mt-4 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                
                type="button"
                onClick={() => setCat(c)}
                className={
                  "shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors " +
                  (cat === c
                    ? "border-foreground bg-foreground text-background ring-1 ring-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground")
                }
              >
                <span>{c}</span>
                <span
                  className={
                    "text-[10px] " +
                    (cat === c ? "text-background/70" : "text-muted-foreground/70")
                  }
                >
                  {counts[c] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div
            id="kb-list-anchor"
            className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground"
          >
            <span>
              {filtered.length} {filtered.length === 1 ? "Inhalt" : "Inhalte"} gefunden
              {cat !== "Alle" ? ` · Kategorie „${cat}“` : ""}
              {query.trim() ? ` · Suche „${query.trim()}“` : ""}
            </span>
            {(cat !== "Alle" || query.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setCat("Alle");
                  setQuery("");
                }}
                className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground hover:border-foreground/40"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              <p>Keine passenden Inhalte gefunden.</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                  >
                    Suche zurücksetzen
                  </button>
                )}
                {cat !== "Alle" && (
                  <button
                    type="button"
                    onClick={() => setCat("Alle")}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                  >
                    Alle Inhalte anzeigen
                  </button>
                )}
              </div>
            </div>
          ) : grouped ? (
            <div className="mt-6 space-y-8">
              {grouped.map((g) => (
                <section key={g.category}>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    {g.category}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({g.items.length})
                    </span>
                  </h2>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.items.map((a) => renderCard(a))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => renderCard(a))}
            </div>
          )}

          <HandoutsManager />
        </div>
      </main>

      {open && canUsePortal && articleBody(open).trim() && (
        <KnowledgeDetailPortal
          article={open}
          copied={copied}
          notice={notice}
          onCopy={handleCopy}
          onPruefnotiz={handlePruefnotiz}
          onClose={closeArticle}
        />
      )}

      <SiteFooter />
    </div>
  );
}
