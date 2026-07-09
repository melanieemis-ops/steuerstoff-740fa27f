// Deterministische Router-Pipeline für den Steuer-Assistant.
//
// Reihenfolge (unverhandelbar):
//   Eingabe → Steuerart → Sachverhaltsart → Unterfall → Prüfschema →
//   steuerliche Prüfung → Ergebnis → Knowledge Base → Antwort
//
// Die KB darf niemals Steuerart, Sachverhaltsart, Paragraphen oder das
// Ergebnis überschreiben. Sie dient ausschließlich als Vertiefung.
//
// Der USt-Zweig delegiert an die bereits vorhandene, feinjustierte
// Klassifizierung in `chatHeuristics`. Alle übrigen Steuerarten laufen
// über ein Basisschema mit standardisierten Sektionen; die vorhandenen
// spezifischen Antwort-Zweige in `generateAnswer` bleiben unverändert
// wirksam und werden bei Bedarf davor gerendert.

import { detectTaxType, TAX_TYPE_LABELS, type TaxType, type TaxTypeDetection } from "./taxTypes";

export interface RouterResult {
  taxType: TaxType;
  detection: TaxTypeDetection;
  /** Kurzer, für UI/Trace geeigneter Erkennungssatz. */
  trail: string;
}

export function routeTaxType(rawQuestion: string): RouterResult {
  const detection = detectTaxType(rawQuestion.toLowerCase());
  const trail = detection.type === "unklar"
    ? "Steuerart unklar — Rückfrage erforderlich."
    : `Erkannte Steuerart: ${TAX_TYPE_LABELS[detection.type]} (Signale: ${detection.reasons.slice(0, 4).join(", ") || "–"}).`;
  return { taxType: detection.type, detection, trail };
}
