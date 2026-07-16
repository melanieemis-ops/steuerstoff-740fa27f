import type { KBEntry } from "@/lib/knowledgeBase";

export const estg001Steuerpflicht: KBEntry = {
  id: "estg-001-steuerpflicht",
  title: "§ 1 EStG – Steuerpflicht",
  short: "Regelt die unbeschränkte und beschränkte Einkommensteuerpflicht.",
  category: "Gesetze / Einkommensteuer",
  source: "Gesetze im Internet – EStG",
  keywords:
    /(§\s*1\s*estg|steuerpflicht|wohnsitz|gewöhnlicher aufenthalt|beschränkte steuerpflicht|unbeschränkte steuerpflicht)/i,
  references: ["§ 1 EStG", "§ 49 EStG"],
  taxType: "einkommensteuer",
  body: `⇨ § 1 EStG – Steuerpflicht

► Kurzüberblick
Der Paragraph regelt,
- wer unbeschränkt einkommensteuerpflichtig ist,
- wer beschränkt einkommensteuerpflichtig ist,
- wann eine Antragsveranlagung möglich ist.

► Abs. 1 – Unbeschränkte Einkommensteuerpflicht
Voraussetzungen: Wohnsitz im Inland ODER gewöhnlicher Aufenthalt im Inland.
Rechtsfolge: Besteuerung des Welteinkommens.

► Abs. 2
Unbeschränkte Steuerpflicht bestimmter deutscher Staatsangehöriger im Ausland.

► Abs. 3 – Antragsveranlagung
Voraussetzungen:
- mindestens 90 % der Einkünfte unterliegen der deutschen ESt, oder
- ausländische Einkünfte liegen unter dem Grundfreibetrag.

► Abs. 4 – Beschränkte Steuerpflicht
Voraussetzung: Kein Wohnsitz und kein gewöhnlicher Aufenthalt im Inland.
Rechtsfolge: Besteuerung nur der inländischen Einkünfte (§ 49 EStG).

► Merksatz
Wohnsitz oder gewöhnlicher Aufenthalt → unbeschränkte Steuerpflicht.
Kein Wohnsitz → nur § 49 EStG prüfen.

► Verknüpfte Vorschriften
§ 1 EStG ↔ § 2 EStG ↔ § 49 EStG
`,
};
