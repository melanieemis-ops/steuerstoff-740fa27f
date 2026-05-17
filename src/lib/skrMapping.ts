// SKR03 ↔ SKR42 Mapping basierend auf den individuellen Kontenrahmen
// (DATEV-Kontenbeschriftungen, NPO-Arbeitsfassung).
// WICHTIG: Vorschläge sind Hilfestellungen, KEINE verbindliche Kontierung.

import officialMappingsRaw from "@/data/skrMappings.json";

export type Sicherheit = "hoch" | "mittel" | "pruefen";

export interface SkrMapping {
  skr03: string;
  skr03Name: string;
  skr42: string;
  skr42Name: string;
  hinweis: string;
  beispiel: string;
  sicherheit: Sicherheit;
  /** true = klare 1:1-Zuordnung; false = prüfpflichtig */
  oneToOne: boolean;
  /** Optional: relevant für NPO / SKR42 / Sphärenzuordnung */
  npoRelevant?: boolean;
  /** Trigger-Wörter für Textanalyse (lowercased substrings) */
  textPatterns?: string[];
  sphaere?: string;
  /** true = aus offiziellem Kontenrahmen (DATEV-Beschriftung) */
  official?: boolean;
}

interface OfficialRaw {
  skr03: string;
  skr03Name: string;
  skr42: string;
  skr42Name: string;
  kontoart: string;
  sphaere: string;
  suchwoerter: string;
  pruefhilfe: string;
  ambiguous: boolean;
  unmapped: boolean;
}

const NPO_HINTS = /spende|kollekte|zweck|sphäre|sphaere|rücklage|ruecklage|mittelverwendung|ideell|gemeinn|§\s*6[02]|ao\b/i;

function toPatterns(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[;,·|/]+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3 && x !== "—");
}

export const OFFICIAL_MAPPINGS: SkrMapping[] = (officialMappingsRaw as OfficialRaw[])
  .filter((r) => r.skr03 && r.skr03Name && r.skr03Name !== "(ohne Beschriftung sichtbar)")
  .map((r) => {
    const sicherheit: Sicherheit = r.unmapped
      ? "pruefen"
      : r.ambiguous
      ? "mittel"
      : "hoch";
    const npo =
      NPO_HINTS.test(r.skr42Name + " " + r.sphaere + " " + r.pruefhilfe) ||
      /^(20\d|40[34]|48[23])/.test(r.skr42);
    const hinweis = [r.pruefhilfe, r.sphaere && `Sphäre/Hinweis: ${r.sphaere}`]
      .filter(Boolean)
      .join(" · ");
    return {
      skr03: r.skr03,
      skr03Name: r.skr03Name,
      skr42: r.skr42 || "—",
      skr42Name: r.skr42Name || "Kein eindeutiges SKR42-Spiegelkonto – bitte prüfen",
      hinweis: hinweis || "Aus individuellem Kontenrahmen übernommen.",
      beispiel: r.suchwoerter || r.skr03Name,
      sicherheit,
      oneToOne: !r.unmapped && !r.ambiguous,
      npoRelevant: npo || undefined,
      textPatterns: toPatterns(r.suchwoerter + " " + r.skr03Name),
      sphaere: r.sphaere || undefined,
      official: true,
    } as SkrMapping;
  });

const DEMO_MAPPINGS: SkrMapping[] = [
  {
    skr03: "4210",
    skr03Name: "Miete",
    skr42: "6310",
    skr42Name: "Raummiete",
    hinweis: "Aufwand für angemietete Räume. Bei NPO ggf. anteilig auf Sphären verteilen.",
    beispiel: "Miete Büro Mai – Vermieter Mustermann GmbH",
    sicherheit: "hoch",
    oneToOne: true,
    npoRelevant: true,
    textPatterns: ["miete", "raummiete", "büromiete", "buero miete"],
    sphaere: "—",
  },
  {
    skr03: "4910",
    skr03Name: "Büromaterial",
    skr42: "6815",
    skr42Name: "Büromaterial",
    hinweis: "Verbrauchsmaterial Büro. Bei NPO i. d. R. ideeller Bereich.",
    beispiel: "Druckerpapier, Toner, Kugelschreiber",
    sicherheit: "hoch",
    oneToOne: true,
    textPatterns: ["büromaterial", "buromaterial", "papier", "toner", "kugelschreiber", "ordner"],
    sphaere: "Ideeller Bereich",
  },
  {
    skr03: "4806",
    skr03Name: "Wartungskosten für Hard- und Software",
    skr42: "6837",
    skr42Name: "Wartungskosten für Hard- und Software",
    hinweis: "Laufende Wartung/Support. Investitionen separat aktivieren.",
    beispiel: "Wartungsvertrag IT-Systemhaus Q2",
    sicherheit: "hoch",
    oneToOne: true,
    textPatterns: ["wartung", "support", "softwarewartung", "it-wartung"],
  },
  {
    skr03: "4920",
    skr03Name: "Telefon",
    skr42: "6805",
    skr42Name: "Telefon",
    hinweis: "Telefon-/Mobilfunkkosten. Private Anteile ggf. ausbuchen.",
    beispiel: "Telekom Festnetz + Mobilfunk Juni",
    sicherheit: "hoch",
    oneToOne: true,
    textPatterns: ["telefon", "mobilfunk", "telekom", "vodafone", "handy"],
  },
  {
    skr03: "4945",
    skr03Name: "Fortbildungskosten",
    skr42: "6821",
    skr42Name: "Fortbildungskosten",
    hinweis: "Berufliche Fortbildung. Bei Organmitgliedern Abgrenzung prüfen.",
    beispiel: "Online-Seminar Umsatzsteuer 2026",
    sicherheit: "hoch",
    oneToOne: true,
    textPatterns: ["fortbildung", "seminar", "schulung", "weiterbildung", "training"],
  },
  {
    skr03: "4650",
    skr03Name: "Bewirtungskosten",
    skr42: "6640",
    skr42Name: "Bewirtungskosten",
    hinweis:
      "Geschäftlich veranlasste Bewirtung: 70 % abzugsfähig, 30 % nicht abzugsfähig. Bewirtungsbeleg mit Anlass, Teilnehmern erforderlich.",
    beispiel: "Geschäftsessen mit Mandant – Restaurant XY",
    sicherheit: "mittel",
    oneToOne: true,
    textPatterns: ["bewirtung", "geschäftsessen", "restaurant", "mandantenessen"],
  },
  {
    skr03: "4630",
    skr03Name: "Geschenke abzugsfähig",
    skr42: "6620",
    skr42Name: "Geschenke abzugsfähig",
    hinweis: "Freigrenze 50 € netto/Empfänger/Jahr (§ 4 Abs. 5 Nr. 1 EStG). Empfängerliste führen.",
    beispiel: "Weinpräsent zum Jahresende – Mandant XY",
    sicherheit: "mittel",
    oneToOne: true,
    textPatterns: ["geschenk", "präsent", "präsente", "kundengeschenk"],
  },
  {
    skr03: "4660",
    skr03Name: "Reisekosten Arbeitnehmer",
    skr42: "6650",
    skr42Name: "Reisekosten Arbeitnehmer",
    hinweis: "Pauschalen / Einzelnachweise nach LStR. Trennung Fahrt-, Übernachtungs-, Verpflegungskosten.",
    beispiel: "Dienstreise MA Müller – Berlin → München",
    sicherheit: "hoch",
    oneToOne: true,
    textPatterns: ["reisekosten arbeitnehmer", "dienstreise", "reisekosten mitarbeiter"],
  },
  {
    skr03: "4670",
    skr03Name: "Reisekosten Unternehmer",
    skr42: "6630",
    skr42Name: "Reisekosten Vorstand / Organmitglieder",
    hinweis:
      "PRÜFPFLICHTIG: Abgrenzung Unternehmer vs. Organ vs. Vorstand bei NPO/Verein wichtig. Ehrenamtliche Tätigkeit separat (§ 3 Nr. 26a EStG).",
    beispiel: "Reisekosten Vorstandsmitglied – JHV Hamburg",
    sicherheit: "pruefen",
    oneToOne: false,
    npoRelevant: true,
    textPatterns: ["reisekosten vorstand", "reisekosten unternehmer", "reisekosten geschäftsführer", "vorstandsreise"],
  },
  {
    skr03: "4900",
    skr03Name: "Sonstige betriebliche Aufwendungen",
    skr42: "—",
    skr42Name: "Bitte prüfen – keine automatische 1:1-Zuordnung",
    hinweis:
      "Sammelkonto. Im SKR42 inhaltlich nach konkretem Aufwand auflösen (Beratung, Beiträge, Versicherungen, Sonstiges).",
    beispiel: "Diverse Kleinaufwendungen ohne klare Zuordnung",
    sicherheit: "pruefen",
    oneToOne: false,
    textPatterns: ["sonstige aufwendungen", "diverses", "verschiedenes"],
  },
  {
    skr03: "6855",
    skr03Name: "Nebenkosten des Geldverkehrs",
    skr42: "6855",
    skr42Name: "Nebenkosten Geldverkehr",
    hinweis:
      "Kontoführung, Überweisungsgebühren. Übernahme nur, wenn im individuellen SKR42-Kontenrahmen vorhanden – sonst auf passendes Konto umkontieren.",
    beispiel: "Kontoführungsgebühr Volksbank Q3",
    sicherheit: "mittel",
    oneToOne: false,
    textPatterns: ["kontoführung", "bankgebühr", "überweisungsgebühr", "nebenkosten geldverkehr"],
  },
  {
    skr03: "—",
    skr03Name: "Abraum-/Abfallbeseitigung",
    skr42: "6859",
    skr42Name: "Aufwand Abraum-/Abfallbeseitigung",
    hinweis: "Belegtext-basiert (z. B. Berlin Recycling GmbH). SKR03-Entsprechung individuell prüfen.",
    beispiel: "Berlin Recycling GmbH – Entsorgung",
    sicherheit: "mittel",
    oneToOne: false,
    textPatterns: ["recycling", "entsorgung", "abfall", "abraum", "müll", "berlin recycling"],
  },
  {
    skr03: "4830",
    skr03Name: "Softwarelizenz / Software laufend",
    skr42: "6835",
    skr42Name: "Software (Aufwand)",
    hinweis: "Laufende SaaS-/Abo-Lizenzen. Mehrjahreslizenzen ggf. abgrenzen (ARAP).",
    beispiel: "Microsoft 365 Jahreslizenz",
    sicherheit: "mittel",
    oneToOne: false,
    textPatterns: ["softwarelizenz", "software", "saas", "abo", "lizenz", "microsoft", "adobe"],
  },
];

/** Demo-Mappings zuerst (höhere Priorität bei Textanalyse), dann offizielle DATEV-Mappings. */
export const SKR_MAPPINGS: SkrMapping[] = [...DEMO_MAPPINGS, ...OFFICIAL_MAPPINGS];

export const COMPLIANCE_NOTE =
  "Kontenvorschlag bitte fachlich prüfen – insbesondere bei NPO, Umsatzsteuer und Sphärenzuordnung.";

export function findBySkr03(input: string): SkrMapping[] {
  const q = input.trim().toLowerCase();
  if (!q) return [];
  return SKR_MAPPINGS.filter(
    (m) => m.skr03.toLowerCase() === q || m.skr03.toLowerCase().startsWith(q),
  );
}

export function findByText(text: string): SkrMapping[] {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  const scored = SKR_MAPPINGS.map((m) => {
    const patterns = m.textPatterns ?? [];
    const hits = patterns.filter((p) => q.includes(p)).length;
    return { m, hits };
  })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits);
  return scored.map((x) => x.m);
}

export function sicherheitLabel(s: Sicherheit): string {
  return s === "hoch" ? "Hoch" : s === "mittel" ? "Mittel" : "Bitte prüfen";
}

export function sicherheitColor(s: Sicherheit): string {
  return s === "hoch"
    ? "var(--green, #15803d)"
    : s === "mittel"
    ? "var(--amber, #b45309)"
    : "var(--red, #b91c1c)";
}

// ===== User Mappings (manual) =====
const STORAGE_KEY = "steuerstoff:skr:userMappings";

export interface UserMapping extends SkrMapping {
  id: string;
  createdAt: number;
}

export function listUserMappings(): UserMapping[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUserMapping(m: Omit<UserMapping, "id" | "createdAt">): UserMapping {
  const rec: UserMapping = { ...m, id: crypto.randomUUID(), createdAt: Date.now() };
  const all = [rec, ...listUserMappings()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return rec;
}

export function deleteUserMapping(id: string) {
  const all = listUserMappings().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function formatMappingAsText(m: SkrMapping): string {
  return [
    `SKR03: ${m.skr03} – ${m.skr03Name}`,
    `SKR42: ${m.skr42} – ${m.skr42Name}`,
    `Hinweis: ${m.hinweis}`,
    `Beispiel: ${m.beispiel}`,
    `Sicherheit: ${sicherheitLabel(m.sicherheit)}`,
    `Zuordnung: ${m.oneToOne ? "1:1" : "prüfpflichtig"}`,
    "",
    COMPLIANCE_NOTE,
  ].join("\n");
}
