import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const aktuellJahressteuergesetz2026Referentenentwurf: KBEntry = {
  id: "aktuell-jahressteuergesetz-2026-referentenentwurf",
  title: "Jahressteuergesetz 2026: geplante Änderungen im Überblick",
  short:
    "Kompakter Überblick über zentrale Vorschläge des Referentenentwurfs zum Jahressteuergesetz 2026 – vom neuen § 6f EStG bis zur erklärungsabhängigen umsatzsteuerlichen Organschaft.",
  category: "Aktuell",
  type: "verwaltung",
  source:
    "Zusammenfassung nach StuB 13/2026, S. 525, NWB KAAAK-18933. Stand des zugrunde liegenden Beitrags: 1.7.2026. Es handelt sich um ein laufendes Gesetzgebungsverfahren; Änderungen sind möglich.",
  keywords:
    "jahressteuergesetz 2026|jstg 2026|referentenentwurf jahressteuergesetz|§ 6f estg|kaufpreisaufteilung grund und boden gebäude|§ 3b estg grundlohn|erste tätigkeitsstätte 24 monate|kinderfreibetrag eu ewr|lohnsteuerbescheinigung 2028|großbuchstabe d dienstwagen|§ 2c ustg organschaft|umsatzsteuerliche organschaft 2029|§ 29c ao ki finanzverwaltung|§ 233a ao zinsen 3,6 prozent",
  references: [
    "StuB 13/2026, S. 525",
    "NWB KAAAK-18933",
    "BFH, Urteil vom 10.8.2023 – VI R 11/21, BStBl 2024 II S. 202",
    "BMF, Schreiben vom 2.12.2025 – IV C 3 - S 2285/00019/007/068, BStBl 2025 I S. 2039",
    "Schmittmann, StuB 2026 S. 485, NWB XAAAK-17734",
  ],
  importance: 5,
  body: `Das Bundesfinanzministerium übersandte am 26.5.2026 den Referentenentwurf eines Jahressteuergesetzes 2026 an die Verbände. Der zugrunde liegende Fachbeitrag bildet den Stand vom 1.7.2026 ab. Die folgenden Punkte sind daher noch nicht endgültig beschlossen und können sich im weiteren Gesetzgebungsverfahren ändern.

Geplante Kernänderungen

1. Kaufpreisaufteilung bei Grundstücken – § 6f EStG-E
Für die Aufteilung eines Gesamtkaufpreises auf Grund und Boden sowie Gebäude sollen erstmals besondere gesetzliche Regelungen geschaffen werden. Die Neuregelung soll für Kaufverträge gelten, die nach Verkündung des Jahressteuergesetzes 2026 abgeschlossen werden.

2. Sonntags-, Feiertags- und Nachtzuschläge – § 3b EStG
Die Definition des für die Steuerfreiheit maßgeblichen Grundlohns soll als Reaktion auf das BFH-Urteil vom 10.8.2023 – VI R 11/21 neu gefasst werden.

3. Erste Tätigkeitsstätte
Bei Inlandsfällen soll eine dauerhafte Zuordnung künftig bereits angenommen werden, wenn der Arbeitnehmer länger als 24 Monate an einer Tätigkeitsstätte eingesetzt werden soll. Bislang liegt die Grenze bei 48 Monaten. Die Verkürzung soll ab 2027 gelten. Betriebliche Reisekostenregelungen müssten nach endgültiger Verabschiedung überprüft werden.

4. Kinder- und Ausbildungsfreibetrag im EU-/EWR-Ausland
Die Ländergruppeneinteilung soll nicht angewendet werden, wenn das Kind in einem EU-Mitgliedstaat oder EWR-Staat wohnt. Dies entspricht bereits der Verwaltungsregelung im BMF-Schreiben vom 2.12.2025.

5. Erweiterte Lohnsteuerbescheinigung ab 2028
Die Lohnsteuerbescheinigung soll zusätzliche Angaben enthalten, um Einkommensteuererklärungen stärker medienbruchfrei bearbeiten zu können. Vorgesehen sind insbesondere:
- steuerfreie Arbeitgeberleistungen für Kinderbetreuung, ausgenommen Verpflegungskosten,
- der Großbuchstabe „D“ bei Dienstwagengestellung,
- eine getrennte betragsmäßige Angabe steuerfrei erstatteter Reisekosten,
- eine getrennte Angabe von Erstattungen für doppelte Haushaltsführung.

6. Umsatzsteuerliche Organschaft ab 2029 – § 2c UStG-E
Die bisherigen Eingliederungsvoraussetzungen sollen bestehen bleiben. Die Rechtsfolgen der Organschaft sollen künftig jedoch nur noch eintreten, wenn der Organträger gegenüber dem Finanzamt eine Erklärung für sich und die benannten Organgesellschaften abgibt. Die Wirkung soll nur für die Zukunft eintreten. Ergänzend sind besondere Rückabwicklungs- und Haftungsregeln vorgesehen.

7. KI-Nutzung durch die Finanzverwaltung – § 29c AO-E
Die Abgabenordnung soll eine ausdrückliche Grundlage für den Einsatz künstlicher Intelligenz und die Verarbeitung vorhandener Daten durch die Finanzverwaltung erhalten.

8. Höhere Nachzahlungs- und Erstattungszinsen – § 233a AO
Der Zinssatz soll für Verzinsungszeiträume ab 2027 von monatlich 0,15 % auf 0,30 % steigen. Das entspricht einer Erhöhung von jährlich 1,8 % auf 3,6 %.

Praxis-Hinweis
Die Vorschläge sollten noch nicht wie geltendes Recht behandelt werden. Für Gestaltungen, Vertragsabschlüsse, Reisekostenrichtlinien, Lohnabrechnung und Organschaftsstrukturen ist der weitere Verlauf des Gesetzgebungsverfahrens abzuwarten.

Merksatz
Der Referentenentwurf zeigt die geplante Richtung des Jahressteuergesetzes 2026, schafft aber noch keine unmittelbar anwendbaren Rechtsänderungen.`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === aktuellJahressteuergesetz2026Referentenentwurf.id)) {
  KNOWLEDGE_BASE.push(aktuellJahressteuergesetz2026Referentenentwurf);
}
