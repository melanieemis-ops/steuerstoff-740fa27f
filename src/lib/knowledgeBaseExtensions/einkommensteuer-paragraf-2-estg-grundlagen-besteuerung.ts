import { KNOWLEDGE_BASE, type KBEntry } from "@/lib/knowledgeBase";

export const einkommensteuerParagraf2EstgGrundlagen: KBEntry = {
  id: "einkommensteuer-paragraf-2-estg-grundlagen-besteuerung",
  title: "§ 2 EStG: Grundlagen der Einkommensteuer und Ermittlung des zu versteuernden Einkommens",
  short:
    "§ 2 EStG ordnet die sieben Einkunftsarten und zeigt den Rechenweg von den Einkünften bis zur festzusetzenden Einkommensteuer.",
  category: "Gesetze / Einkommensteuer",
  type: "gesetz",
  law: "EStG",
  paragraph: "§ 2",
  paragraphNumber: 2,
  source:
    "Kompakte Zusammenfassung des § 2 EStG nach der amtlichen Gesetzesdarstellung im Screenshot; Rechtsstand des bereitgestellten Materials.",
  keywords:
    "§ 2 estg|einkunftsarten|sieben einkunftsarten|summe der einkünfte|gesamtbetrag der einkünfte|einkommen|zu versteuerndes einkommen|tarifliche einkommensteuer|festzusetzende einkommensteuer|gewinn einkünfte|überschusseinkünfte|welteinkommensprinzip|jahressteuer",
  references: [
    "§ 2 EStG",
    "§§ 13 bis 24 EStG",
    "§ 32a EStG",
    "§ 32d EStG",
    "§ 34c EStG",
  ],
  importance: 5,
  body: `§ 2 EStG ist die zentrale Grundnorm für den Aufbau der Einkommensteuer. Die Vorschrift bestimmt, welche Einkünfte der Einkommensteuer unterliegen und wie aus ihnen das zu versteuernde Einkommen sowie die festzusetzende Einkommensteuer ermittelt werden.

1. Die sieben Einkunftsarten
Der Einkommensteuer unterliegen:
- Einkünfte aus Land- und Forstwirtschaft,
- Einkünfte aus Gewerbebetrieb,
- Einkünfte aus selbstständiger Arbeit,
- Einkünfte aus nichtselbstständiger Arbeit,
- Einkünfte aus Kapitalvermögen,
- Einkünfte aus Vermietung und Verpachtung,
- sonstige Einkünfte im Sinne des § 22 EStG.

Bei unbeschränkter Steuerpflicht gilt grundsätzlich das Welteinkommensprinzip. Bei beschränkter Steuerpflicht werden nur die inländischen Einkünfte erfasst.

2. Gewinn- und Überschusseinkünfte
Bei Land- und Forstwirtschaft, Gewerbebetrieb und selbstständiger Arbeit sind die Einkünfte der Gewinn. Bei den übrigen Einkunftsarten werden die Einkünfte grundsätzlich als Überschuss der Einnahmen über die Werbungskosten ermittelt.

3. Rechenweg der Einkommensteuer
Der gesetzliche Aufbau lautet vereinfacht:
- Summe der Einkünfte
- abzüglich Altersentlastungsbetrag, Entlastungsbetrag für Alleinerziehende und Abzug nach § 13 Abs. 3 EStG
- ergibt den Gesamtbetrag der Einkünfte
- abzüglich Sonderausgaben und außergewöhnliche Belastungen
- ergibt das Einkommen
- abzüglich Freibeträge nach § 32 Abs. 6 EStG und sonstige gesetzliche Abzüge
- ergibt das zu versteuernde Einkommen
- darauf wird die tarifliche Einkommensteuer berechnet
- nach Anrechnungen, Ermäßigungen und Hinzurechnungen ergibt sich die festzusetzende Einkommensteuer.

4. Besondere Berechnungsregeln
Für bestimmte Vorschriften werden einzelne steuerfreie oder besonders besteuerte Beträge nicht in die üblichen Zwischensummen einbezogen. Dazu gehören insbesondere bestimmte Kapitalerträge nach § 32d EStG. Außerdem können Kinderfreibeträge, Kindergeld, ausländische Steuern und Steuerermäßigungen die endgültige Steuerberechnung beeinflussen.

5. Jahressteuerprinzip
Die Einkommensteuer ist eine Jahressteuer. Die Besteuerungsgrundlagen werden grundsätzlich für jedes Kalenderjahr gesondert ermittelt. Treffen unbeschränkte und beschränkte Steuerpflicht innerhalb eines Kalenderjahres zusammen, sind die in diesem Jahr erzielten inländischen Einkünfte grundsätzlich gemeinsam zu veranlagen.

Merksatz:
§ 2 EStG beantwortet drei Kernfragen: Welche Einkünfte sind steuerpflichtig? Wie werden sie ermittelt? Wie gelangt man vom Gesamtbetrag der Einkünfte zur festzusetzenden Einkommensteuer?`,
};

if (!KNOWLEDGE_BASE.some((entry) => entry.id === einkommensteuerParagraf2EstgGrundlagen.id)) {
  KNOWLEDGE_BASE.push(einkommensteuerParagraf2EstgGrundlagen);
}
