// Universeller Steuerarten-Router.
// Zweck: VOR jeder fachlichen Antwort wird die Steuerart bestimmt.
// Nur wenn keine Steuerart mit ausreichender Sicherheit erkannt wird,
// darf "unklar" gesetzt werden.

export type TaxType =
  | "einkommensteuer"
  | "umsatzsteuer"
  | "koerperschaftsteuer"
  | "gewerbesteuer"
  | "lohnsteuer"
  | "bilanzsteuerrecht"
  | "abgabenordnung"
  | "gemeinnuetzigkeit"
  | "erbschaftsteuer"
  | "schenkungsteuer"
  | "grunderwerbsteuer"
  | "umwandlungssteuer"
  | "internationales_steuerrecht"
  | "sonstige"
  | "unklar";

export const TAX_TYPE_LABELS: Record<TaxType, string> = {
  einkommensteuer: "Einkommensteuer",
  umsatzsteuer: "Umsatzsteuer",
  koerperschaftsteuer: "Körperschaftsteuer",
  gewerbesteuer: "Gewerbesteuer",
  lohnsteuer: "Lohnsteuer",
  bilanzsteuerrecht: "Bilanzsteuerrecht",
  abgabenordnung: "Abgabenordnung",
  gemeinnuetzigkeit: "Gemeinnützigkeit",
  erbschaftsteuer: "Erbschaftsteuer",
  schenkungsteuer: "Schenkungsteuer",
  grunderwerbsteuer: "Grunderwerbsteuer",
  umwandlungssteuer: "Umwandlungssteuer",
  internationales_steuerrecht: "Internationales Steuerrecht",
  sonstige: "Sonstige",
  unklar: "Steuerart unklar",
};

// Regex-Signale pro Steuerart. Reihenfolge = Priorität bei mehreren Treffern.
const SIGNALS: { type: TaxType; re: RegExp; weight: number }[] = [
  // sehr starke Signale (Norm-Zitat)
  { type: "umsatzsteuer", re: /\b(umsatzsteuer[a-zäöüß]*|ust\b|mwst|mehrwertsteuer|vorsteuer[a-zäöüß]*|reverse\s*charge|innergemein[a-zäöüß]*|ig\.?\s*(erwerb|lieferung)|ust-?id|werklieferung|werkleistung|ausfuhrlieferung|ausfuhr|einfuhr|eust|leistungsort|bemessungsgrundlage)\b|§\s*(13b|1a|3a|6a|15a?)\s*ustg?/i, weight: 5 },
  { type: "einkommensteuer", re: /\b(einkommensteuer|est\b|werbungskosten|sonderausgaben|au(ß|ss)ergew(ö|oe)hnliche\s+belastung|entfernungspauschal|pendlerpauschal|arbeitszimmer|kapitalertr(ä|ae)ge|abgeltungsteuer|vermietung\s+und\s+verpachtung|v\+v|kapitalvermögen|verä(ß|ss)erungsgesch(ä|ae)ft|einkünfte\s+aus|§\s*(9|10|33|35a?|20|21|22|23)\s*estg?)\b/i, weight: 5 },
  { type: "koerperschaftsteuer", re: /\b(k(ö|oe)rperschaftsteuer|kst\b|kstg|verdeckte\s+gewinnausschüttung|vga\b|organschaft)\b|§\s*8[a-z]?\s*kstg?/i, weight: 5 },
  { type: "gewerbesteuer", re: /\b(gewerbesteuer|gewst\b|gewstg|hinzurechnung|kürzung(en)?\s*gewst|hebesatz)\b|§\s*(7|8|9)\s*gewstg?/i, weight: 5 },
  { type: "lohnsteuer", re: /\b(lohnsteuer|lst\b|lstg|geldwerter\s+vorteil|dienstwagen(besteuerung)?|sachbezug|lohnkonto|lohnsteueranmeldung)\b/i, weight: 5 },
  { type: "bilanzsteuerrecht", re: /\b(bilanz|handelsbilanz|steuerbilanz|hgb\b|r(ü|ue)ckstellung|rechnungsabgrenz|anlagevermögen|umlaufvermögen|abschreibung(en)?|afa\b|zuschreibung|bewertung|niederstwertprinzip|maßgeblichkeit)\b/i, weight: 4 },
  { type: "abgabenordnung", re: /\b(abgabenordnung|ao\b|einspruch|festsetzungsverj(ä|ae)hrung|zahlungsverj(ä|ae)hrung|außenpr(ü|ue)fung|betriebspr(ü|ue)fung|haftung|vollstreckung|(ä|ae)nderungsnorm|§\s*(129|164|165|172|173|174|175)\s*ao\b)/i, weight: 5 },
  { type: "gemeinnuetzigkeit", re: /\b(gemeinn(ü|ue)tzig|verein|ggmbh|gug\b|stiftung|npo\b|zweckbetrieb|verm(ö|oe)gensverwaltung|wirtschaftlicher\s+geschäftsbetrieb|mittelverwendung|r(ü|ue)cklagenspiegel|§\s*(52|55|58|62|63|64|65|66|67|67a|68)\s*ao\b)/i, weight: 4 },
  { type: "erbschaftsteuer", re: /\b(erbschaftsteuer|erbst\b|nachlass|erbanfall|erbfall|verm(ä|ae)chtnis)\b|erbstg/i, weight: 5 },
  { type: "schenkungsteuer", re: /\b(schenkungsteuer|schenkung(en)?|unentgeltlich(e[nrs]?)?\s+(übertragung|zuwendung))\b/i, weight: 5 },
  { type: "grunderwerbsteuer", re: /\b(grunderwerbsteuer|grest\b|grestg|share\s*deal|asset\s*deal|grundst(ü|ue)cks(kauf|erwerb))\b/i, weight: 5 },
  { type: "umwandlungssteuer", re: /\b(umwandlung(en)?|umwandlungssteuer|umwstg?\b|verschmelzung|spaltung|einbringung|formwechsel|§\s*(20|24|3|4|11|13|15|21|22)\s*umwstg?)\b/i, weight: 5 },
  { type: "internationales_steuerrecht", re: /\b(doppelbesteuerungs(abkommen)?|dba\b|verrechnungspreis|betriebsst(ä|ae)tte|hinzurechnungsbesteuerung|astg\b|au(ß|ss)ensteuergesetz|quellensteuer|beps)\b/i, weight: 5 },
];

export interface TaxTypeDetection {
  type: TaxType;
  confidence: number;
  reasons: string[];
}

export function detectTaxType(q: string): TaxTypeDetection {
  const scores = new Map<TaxType, { score: number; hits: string[] }>();
  for (const s of SIGNALS) {
    const m = q.match(s.re);
    if (m) {
      const cur = scores.get(s.type) ?? { score: 0, hits: [] };
      cur.score += s.weight;
      cur.hits.push(m[0]);
      scores.set(s.type, cur);
    }
  }
  if (scores.size === 0) return { type: "unklar", confidence: 0, reasons: [] };
  const ordered = [...scores.entries()].sort((a, b) => b[1].score - a[1].score);
  const [top, top2] = ordered;
  const gap = top[1].score - (top2?.[1].score ?? 0);
  // ausreichende Sicherheit: absoluter Score >= 4 oder klarer Abstand
  if (top[1].score < 4 && gap < 3) return { type: "unklar", confidence: top[1].score, reasons: top[1].hits };
  return { type: top[0], confidence: top[1].score, reasons: top[1].hits };
}

/** Heuristische Ableitung der TaxType aus einem KB-Eintrag (id/title/category). */
export function resolveTaxTypeFromText(text: string): TaxType | null {
  const d = detectTaxType(text.toLowerCase());
  return d.type === "unklar" ? null : d.type;
}
