// Lightweight heuristic "AI" answer engine for the steuerstoff Chat MVP.
// Replace generateAnswer() with a real API call later.

import "@/lib/knowledgeBaseExtensions";
import { lookupLexicon } from "./taxLexicon";
import {
  KNOWLEDGE_BASE,
  kbKeywordsToRegExp,
  resolveScenarioType,
  resolveTaxType,
  type KBEntry,
  type ScenarioType,
} from "./knowledgeBase";
import { routeTaxType, type RouterResult } from "./router/pipeline";
import { TAX_TYPE_LABELS, type TaxType } from "./router/taxTypes";
import { runExpertSystem, EXPERT_OVERRIDE_THRESHOLD } from "./expertSystem";
import { INTERNAL_KNOWLEDGE_BASE } from "./expertSystem/internalKnowledge";

import { parseFacts } from "./expert/parser";
import { evaluateSignals } from "./expert/signals";
import { routeTaxType as expertRoute } from "./expert/router";
import { runRules as runExpertLegacyRules } from "./expert/ruleEngine";


/**
 * Gezielte KB-Suche NACH der Klassifizierung.
 * Ablauf:
 *   1. Wenn ein scenarioType übergeben wird, werden ausschließlich Einträge
 *      mit demselben scenarioType (explizit oder heuristisch abgeleitet)
 *      als Kandidaten zugelassen.
 *   2. Erst danach wird gewertet: Paragraph-Treffer (stark) +
 *      Kategorie-Treffer (mittel) + Keyword-Treffer im Prompt (schwach).
 */
function findKbMatches(
  q: string,
  paragraphs: string[],
  categoryHints: string[] = [],
  limit = 2,
  scenarioType?: ScenarioType | null,
  taxType?: TaxType | null,
  source: KBEntry[] = KNOWLEDGE_BASE,
  minScore?: number,
): KBEntry[] {
  const text = q.toLowerCase();
  const paraTokens = paragraphs
    .map((p) => p.match(/§\s*\d+[a-z]?/i)?.[0]?.replace(/\s+/g, "").toLowerCase())
    .filter(Boolean) as string[];

  // 1) Hierarchische Kandidaten-Filterung: erst taxType, dann scenarioType.
  let candidates = source;
  if (taxType && taxType !== "unklar") {
    const byTax = candidates.filter((e) => {
      const t = resolveTaxType(e);
      return t == null || t === taxType; // unbekannte Einträge nicht ausschließen
    });
    // Nur anwenden, wenn wir dadurch nicht alles verlieren.
    if (byTax.length > 0) candidates = byTax;
  }
  if (scenarioType) {
    const byScenario = candidates.filter((e) => resolveScenarioType(e) === scenarioType);
    if (byScenario.length > 0) candidates = byScenario;
  }

  const threshold = minScore ?? (scenarioType ? 2 : 5);
  // 2) Paragraph-/Kategorie-/Keyword-Scoring auf den Kandidaten
  const scored = candidates.map((e) => {
    let score = 0;
    const hay = `${e.title}\n${e.body}\n${e.references?.join(" ") ?? ""}`.toLowerCase();
    for (const t of paraTokens) {
      if (hay.replace(/\s+/g, "").includes(t)) score += 5;
    }
    if (categoryHints.some((c) => e.category.toLowerCase().includes(c.toLowerCase()))) {
      score += 2;
    }
    if (e.keywords) {
      try {
        if (kbKeywordsToRegExp(e.keywords).test(text)) score += 3;
      } catch { /* ignore bad regex */ }
    }
    return { e, score };
  })
    .filter((x) => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => x.e);

}



const BROAD_KB_STOPWORDS = new Set([
  "aber", "alle", "auch", "dann", "das", "dass", "dem", "den", "der", "die", "ein",
  "eine", "einen", "einer", "eines", "für", "gibt", "haben", "hat", "ich", "ist", "kann",
  "mit", "nach", "oder", "sich", "sind", "über", "und", "vom", "von", "was", "welche",
  "welcher", "welches", "werden", "wie", "wird", "zur", "zum",
]);

function kbSearchText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (value instanceof RegExp) return value.source;
  if (Array.isArray(value)) return value.map((item) => kbSearchText(item)).join(" ");
  return String(value);
}

function normalizeKbSearch(value: unknown): string {
  return kbSearchText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}


function broadKbTokens(query: string): string[] {
  const normalized = normalizeKbSearch(query);
  const tokens = normalized
    .replace(/[^a-z0-9§\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !BROAD_KB_STOPWORDS.has(token));

  if (/abschreib|\bafa\b|wertminder|niederstwert|restbuchwert/.test(normalized)) {
    tokens.push("abschreib", "afa", "wertminder");
  }
  if (/sonderabschreib|§\s*7g|§\s*7b/.test(normalized)) {
    tokens.push("sonderabschreib", "7g", "7b");
  }

  return Array.from(new Set(tokens));
}

export interface KbScoreDetail {
  entry: KBEntry;
  score: number;
  hits: number;
  /** Angewandter Tie-Breaker gegenüber dem direkt davor platzierten Treffer. */
  tieBreaker?: string;
}

function scoreBroadKbMatches(query: string, limit = 4): KbScoreDetail[] {
  const tokens = broadKbTokens(query);
  if (tokens.length === 0) return [];

  const entries = [...KNOWLEDGE_BASE, ...INTERNAL_KNOWLEDGE_BASE];
  const scored = entries
    .map((entry) => {
      const title = normalizeKbSearch(entry.title ?? "");
      const category = normalizeKbSearch(String(entry.category ?? ""));
      const short = normalizeKbSearch(entry.short ?? "");
      const body = normalizeKbSearch(entry.body ?? "");
      const keywords = normalizeKbSearch(entry.keywords ?? "");
      const references = normalizeKbSearch(entry.references?.join(" ") ?? "");
      const haystack = `${title} ${category} ${short} ${body} ${keywords} ${references}`;
      let score = 0;
      let hits = 0;

      for (const token of tokens) {
        const stem = token.length > 8 ? token.slice(0, 8) : token;
        if (!haystack.includes(token) && !haystack.includes(stem)) continue;
        hits += 1;
        if (title.includes(token) || title.includes(stem)) score += 5;
        else if (category.includes(token) || category.includes(stem)) score += 4;
        else if (keywords.includes(token) || keywords.includes(stem)) score += 3;
        else if (short.includes(token) || short.includes(stem)) score += 2;
        else score += 1;
      }

      if (hits === tokens.length) score += 3;
      return { entry, score, hits } as KbScoreDetail;
    })
    .filter(({ score, hits }) => score >= 3 && hits > 0);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.hits !== a.hits) return b.hits - a.hits;
    const aShort = a.entry.short ? 1 : 0;
    const bShort = b.entry.short ? 1 : 0;
    if (bShort !== aShort) return bShort - aShort;
    return (a.entry.title?.length ?? 0) - (b.entry.title?.length ?? 0);
  });

  // Tie-Breaker dokumentieren (nur bei Punktgleichstand relevant).
  for (let i = 1; i < scored.length; i++) {
    const prev = scored[i - 1];
    const cur = scored[i];
    if (prev.score !== cur.score) continue;
    if (prev.hits !== cur.hits) prev.tieBreaker = "mehr Token-Treffer";
    else if (!!prev.entry.short !== !!cur.entry.short) prev.tieBreaker = "kuratierter Kurztext";
    else prev.tieBreaker = "kürzerer Titel";
  }

  return scored.slice(0, limit);
}

function findBroadKbMatches(query: string, limit = 4): KBEntry[] {
  return scoreBroadKbMatches(query, limit).map((x) => x.entry);
}



function kbSections(entries: KBEntry[]): { title: string; body: string }[] {
  return entries.map((e) => ({
    title: `Wissensbaustein: ${e.title}`,
    body:
      (e.short ? `${e.short}\n\n` : "") +
      e.body +
      (e.references?.length ? `\n\nRechtsgrundlage: ${e.references.join(", ")}` : ""),
  }));
}

export type ChatLink = { label: string; to: string };

export interface TraceStep {
  step: string;
  detail?: string;
}

export interface ChatAnswer {
  summary: string;
  reasoning?: string;
  /** Strukturierte Abgrenzungen (optional, statt langer Fließtext-Begründung). */
  sections?: { title: string; body: string }[];
  risks?: string[];
  followUps?: string[];
  nextStep?: string;
  links?: ChatLink[];
  knowledge?: string;
  /** Optionale Folgefrage am Ende ("Meinst du …?"). */
  clarify?: string;
  /** Kompakter Antworttyp — UI kann Prüfkarte schlanker rendern. */
  kind?: "info" | "case" | "npo";
  /** Debug-Trace der Klassifizierungsentscheidung (Dev-Modus). */
  trace?: TraceStep[];
  /** Erkannter Sachverhaltstyp, wenn USt-Klassifizierung durchgeführt wurde. */
  scenarioType?: string;
  /** Erkannte Kernparagraphen (aus Klassifizierung). */
  paragraphs?: string[];
  /** Erkannte Steuerart (Router-Ergebnis). */
  taxType?: TaxType;
  /** Menschenlesbares Label der Steuerart. */
  taxTypeLabel?: string;
  /** Quellen (aus KI-Antwort / semantischer Retrieval-Suche). */
  sources?: { id?: string; title: string; reference?: string | null; excerpt?: string | null }[];
  /** Selbsteinschätzung der KI. */
  confidence?: "low" | "medium" | "high";
  /** Empfehlung, den Fall menschlich prüfen zu lassen. */
  needsHumanReview?: boolean;
  /** Wurde diese Antwort aus lokalem Fallback erzeugt statt vom KI-Modell? */
  fromFallback?: boolean;
}



const has = (q: string, ...terms: string[]) =>
  terms.some((t) => q.includes(t));

const REVIEW =
  "steuerstoff ist eine Arbeitshilfe und ersetzt keine verbindliche steuerliche Beratung. Bitte fachlich prüfen lassen.";

// ============================================================
// USt-Klassifizierung — bestimmt VOR § 13b die Sachverhaltsart
// (Lieferung, sonstige Leistung, ig. Erwerb, ig. Lieferung,
//  Werklieferung/-leistung, Reihengeschäft, Grundstück,
//  Ausfuhr, Einfuhr, unentgeltliche Wertabgabe, Verbringen).
// ============================================================

type UstType =
  | "innergemeinschaftlicher_erwerb"
  | "innergemeinschaftliche_lieferung"
  | "reverse_charge"
  | "werklieferung"
  | "werkleistung"
  | "reihengeschaeft"
  | "grundstueck"
  | "ausfuhr"
  | "einfuhr"
  | "unentgeltliche_wertabgabe"
  | "verbringen"
  | "lieferung_inland"
  | "sonstige_leistung"
  | "unbestimmt";

interface UstClassification {
  type: UstType;
  label: string;
  paragraph: string;
  reasoning: string;
  scheme: { title: string; body: string }[];
  followUps: string[];
  negative?: string;
  /** true, wenn alle klassifizierungsrelevanten Angaben im Prompt enthalten sind → keine Rückfragen stellen */
  complete?: boolean;
  /** Kompaktes Endergebnis bei vollständigem Sachverhalt */
  ergebnis?: string;
  /** Kurze, nachvollziehbare Erkennungsspur (Signale → Norm). */
  trail?: string;
}

/** Mapping vom internen UstType auf den ScenarioType der Knowledge Base. */
function ustTypeToScenarioType(t: UstType): ScenarioType | null {
  switch (t) {
    case "innergemeinschaftlicher_erwerb": return "innergemeinschaftlicher_erwerb";
    case "innergemeinschaftliche_lieferung": return "innergemeinschaftliche_lieferung";
    case "reverse_charge": return "reverse_charge";
    case "werklieferung": return "werklieferung";
    case "werkleistung": return "werkleistung";
    case "reihengeschaeft": return "reihengeschaeft";
    case "grundstueck": return "grundstuecksleistung";
    case "ausfuhr": return "ausfuhrlieferung";
    case "einfuhr": return "einfuhr";
    case "unentgeltliche_wertabgabe": return "unentgeltliche_wertabgabe";
    case "verbringen": return "verbringen";
    case "lieferung_inland": return "lieferung_inland";
    case "sonstige_leistung": return "sonstige_leistung";
    default: return null;
  }
}



function classifyUst(q: string): UstClassification | null {
  if (!hasUstTriggers(q)) return null;


  // Städte → Länder mappen (typische EU/DE-Städte, damit „Amsterdam → München" erkannt wird)
  const CITY_DE = /\b(m(ü|ue)nchen|berlin|hamburg|k(ö|oe)ln|frankfurt|stuttgart|d(ü|ue)sseldorf|leipzig|dresden|hannover|bremen|n(ü|ue)rnberg|essen|dortmund)\b/i;
  const CITY_EU = /\b(amsterdam|rotterdam|den\s*haag|utrecht|wien|salzburg|graz|innsbruck|paris|lyon|marseille|nizza|nice|rom|roma|mailand|milano|neapel|napoli|madrid|barcelona|valencia|sevilla|warschau|warsaw|krakau|krakow|br(ü|ue)ssel|brussels|antwerpen|gent|luxemburg|luxembourg|dublin|prag|prague|bratislava|budapest|stockholm|kopenhagen|copenhagen|helsinki|lissabon|lisbon|athen|athens)\b/i;
  const cityDE = CITY_DE.test(q);
  const cityEU = CITY_EU.test(q);
  // Bewegung „X → Y" / „X nach Y" / „von X nach Y"
  const flow = q.match(/([A-Za-zÄÖÜäöüß\s-]+?)\s*(?:->|→|=>|nach)\s+([A-Za-zÄÖÜäöüß-]+)/i);
  let flowEUtoDE = false;
  let flowDEtoEU = false;
  if (flow) {
    const from = flow[1] ?? "";
    const to = flow[2] ?? "";
    if (CITY_EU.test(from) && CITY_DE.test(to)) flowEUtoDE = true;
    if (CITY_DE.test(from) && CITY_EU.test(to)) flowDEtoEU = true;
  }

  let hasWare = /\b(ware|waren|gegenst|liefer|lieferung|liefert|geliefert|transport|transportiert|versand|versendet|versand|kauf|kauft|gekauft|erwirbt|erworben|erwerb|verkauf|verkauft|maschine|maschinen|ger(ä|ae)t|hardware|material|palette|container|m(ö|oe)bel|fahrzeug|pkw|lkw|kfz|auto|anlage|produkt|t(ü|ue)r(en)?)\b/i.test(q);
  const hasDienst = /\b(dienstleistung|beratung|reparatur|softwarelizen|lizenz|schulung|werkleistung|montage(?!\s*mit)|honorar|design|marketing|übersetzung|uebersetzung)\b/i.test(q);
  let nachDE = /\b(nach\s+deutschland|nach\s+de\b|ins\s+inland|inland)\b/i.test(q) || flowEUtoDE || (cityDE && !cityEU) || (cityDE && flowEUtoDE);
  let ausDE = /\b(aus\s+deutschland|von\s+deutschland|ins\s+ausland|in\s+(einen\s+anderen\s+)?(eu-?)?mitgliedstaat|nach\s+(österreich|oesterreich|frankreich|italien|spanien|niederlande|polen|belgien|eu-?ausland))\b/i.test(q) || flowDEtoEU;
  let euCtx = /\b(eu-?ausland|eu-?mitgliedstaat|(anderen?\s+)?mitgliedstaat|innergemein[a-zäöüß]*|frankreich|italien|spanien|niederlande|holland|polen|belgien|österreich|oesterreich|irland|luxemburg|tschechien|slowakei|schweden|dänemark|daenemark|finnland|portugal|griechenland|ungarn)\b/i.test(q) || cityEU || flowEUtoDE || flowDEtoEU;

  // Explizite Phrasen „innergemeinschaftlicher Erwerb/Lieferung" als starke Signale:
  // erzwingt hasWare/euCtx/Richtung, damit die Klassifizierung in die richtige Branch fällt.
  const explicitIgErwerb = /\binnergemeinschaftlich[a-zäöüß]*\s+erwerb\b/i.test(q) || /\big\.?\s*erwerb\b/i.test(q);
  const explicitIgLieferung = /\binnergemeinschaftlich[a-zäöüß]*\s+lieferung\b/i.test(q) || /\big\.?\s*lieferung\b/i.test(q);
  if (explicitIgErwerb) { hasWare = true; euCtx = true; nachDE = true; }
  if (explicitIgLieferung) { hasWare = true; euCtx = true; ausDE = true; }

  const drittland = /\b(drittland|schweiz|usa|uk|großbritannien|grossbritannien|china|japan|türkei|tuerkei)\b/i.test(q);
  const b2b = /\b(unternehmer|unternehmen|firma|gmbh|ug|ohg|kg|ag|b2b|ust-?id|ustid|umsatzsteuer-?identifikationsnummer|vat[-\s]?id)\b/i.test(q) || /\bbeide\s+(sind\s+)?unternehmer\b/i.test(q);
  const grundstueck = /\b(grundst[a-zäöüß]*|immobilie[a-zäöüß]*|geb(ä|ae)ud[a-zäöüß]*|wohnung[a-zäöüß]*|bautr(ä|ae)ger|zwischenvermietung|vermietung|sportanlage|betriebsvorrichtung|tennishalle)\b/i.test(q);
  const werkMitMaterial = /\bwerklieferung|montage\s+mit\s+material|einbau\s+mit\s+material\b/i.test(q);
  const werkOhneMaterial = /\bwerkleistung|reparatur|montage(?!\s*mit\s*material)|installation\b/i.test(q);
  const reihe = /\breihengesch|kettengesch|drei(ecks|-ecks?)gesch/i.test(q);
  const verbringen = /\bverbringen|eigene ware ins ausland|innergemeinschaftliches verbringen\b/i.test(q);
  const uwa = /\bunentgeltlich|privatnutzung|privatentnahme|wertabgabe\b/i.test(q);
  const rechnungOhneUst = /\brechnung\s+ohne\s+(ust|mwst|umsatzsteuer|steuer)|ohne\s+(ausgewiesene\s+)?(ust|mwst|umsatzsteuer)\b/i.test(q);
  const transportNachDE = /\b(transport|versand|bef(ö|oe)rder|versendet|geliefert|gelangt)[^.]*\b(nach\s+de(utschland)?|ins\s+inland)\b/i.test(q)
    || /\bvon\s+(den\s+niederlanden|niederlande|frankreich|italien|spanien|polen|belgien|österreich|oesterreich|irland|luxemburg|tschechien|slowakei|schweden|dänemark|daenemark|finnland|portugal|griechenland|ungarn)\s+nach\s+de(utschland)?\b/i.test(q);
  const bothUstId = /\b(beide|jeweils|jeder)[^.]*ust-?id/i.test(q)
    || (/(ust-?id|ustid|umsatzsteuer-?identifikationsnummer)/i.test(q) && b2b);
  // Leistender ist im Ausland ansässig (EU oder Drittland).
  const leistenderAusland = /\b(eu-?unternehmer|ausl(ä|ae)ndisch(er|e|en|es)?\s+(unternehmer|unternehmen|dienstleister|leistender|firma|subunternehmer))\b/i.test(q)
    || /\b(unternehmer|unternehmen|anbieter|leistender|dienstleister|subunternehmer|firma|lieferant)\s+(aus|mit\s+sitz\s+in|ans(ä|ae)ssig\s+in)\s+(dem\s+)?(eu-?ausland|ausland|drittland|österreich|oesterreich|frankreich|italien|spanien|niederlande|polen|belgien|irland|luxemburg|tschechien|slowakei|schweden|d(ä|ae)nemark|finnland|portugal|griechenland|ungarn|schweiz|usa|uk|gro(ß|ss)britannien|china|japan|t(ü|ue)rkei)\b/i.test(q)
    || /(^|[\s.,;:(])(österreichisch|oesterreichisch|franz(ö|oe)sisch|italienisch|spanisch|niederl(ä|ae)ndisch|polnisch|belgisch|irisch|luxemburgisch|tschechisch|slowakisch|schwedisch|d(ä|ae)nisch|finnisch|portugiesisch|griechisch|ungarisch|schweizerisch|amerikanisch|britisch|chinesisch|japanisch|t(ü|ue)rkisch|eu-?ausl(ä|ae)ndisch|ausl(ä|ae)ndisch)(er|e|en|es)?\s+(unternehmer|unternehmen|dienstleister|leistender|firma|subunternehmer|lieferant)\b/i.test(q)
    || /(^|[\s.,;:(])(schweizer|wiener|pariser|londoner|holl(ä|ae)ndischer?)\s+(unternehmer|unternehmen|dienstleister|firma|subunternehmer|lieferant)\b/i.test(q)
    || /\bvon\s+ein(em|er)?\s+(schweizer|österreichisch|oesterreichisch|franz(ö|oe)sisch|italienisch|spanisch|niederl(ä|ae)ndisch|polnisch|belgisch|irisch|luxemburgisch|tschechisch|slowakisch|schwedisch|d(ä|ae)nisch|finnisch|portugiesisch|griechisch|ungarisch|amerikanisch|britisch|chinesisch|japanisch|t(ü|ue)rkisch|ausl(ä|ae)ndisch)(er|e|en|es)?\s+(unternehmer|unternehmen|dienstleister|firma|subunternehmer|lieferant)\b/i.test(q)
    || /\b(leistungsempf(ä|ae)nger|empf(ä|ae)nger)\s+(ist\s+)?(deutscher?\s+unternehmer|deutsches?\s+unternehmen|in\s+deutschland)\b/i.test(q);
  // Empfänger ist deutscher Unternehmer
  const empfaengerDE = /\b(deutscher?\s+unternehmer|deutsches?\s+unternehmen|leistungsempf(ä|ae)nger\s+in\s+deutschland|empf(ä|ae)nger\s+in\s+deutschland|inl(ä|ae)ndischer?\s+unternehmer|inl(ä|ae)ndisches?\s+unternehmen)\b/i.test(q)
    || /\b(wir|unser(e|es)?\s+(kanzlei|mandant|unternehmen|firma|gmbh))\b/i.test(q) && b2b
    || (b2b && nachDE);


  // Kurze, menschlich lesbare Signal-Spur für die Antwort ("Erkennung: …").
  const signals: string[] = [];
  if (hasWare && !hasDienst) signals.push("Ware/Lieferung");
  else if (hasDienst && !hasWare) signals.push("sonstige Leistung");
  else if (hasWare && hasDienst) signals.push("Ware + Leistung");
  if (nachDE) signals.push("→ Deutschland");
  if (ausDE) signals.push("aus Deutschland →");
  if (euCtx) signals.push("EU-Ausland");
  if (drittland) signals.push("Drittland");
  if (b2b) signals.push("B2B");
  if (bothUstId) signals.push("beide USt-IdNr.");
  if (grundstueck) signals.push("Grundstück");
  if (reihe) signals.push("Reihe/Dreieck");
  if (werkMitMaterial) signals.push("Werk mit Material");
  else if (werkOhneMaterial) signals.push("Werk ohne Material");
  const buildTrail = (norm: string) =>
    `Erkennung: ${signals.length ? signals.join(" · ") : "USt-Sachverhalt"} → ${norm}`;

  const baseScheme = (extra: { title: string; body: string }[] = []) => [

    { title: "1. Sachverhaltsart", body: "" }, // filled per type
    { title: "2. Steuerbarkeit", body: "§ 1 Abs. 1 UStG prüfen (Leistung im Inland, gegen Entgelt, im Rahmen des Unternehmens)." },
    { title: "3. Ort", body: "§§ 3, 3a–3g UStG — Ortsbestimmung je nach Leistungsart." },
    { title: "4. Steuerbefreiung / -pflicht", body: "§ 4 UStG (z. B. Nr. 1b ig. Lieferung, Nr. 1a Ausfuhr, Nr. 9a Grundstück) oder Steuerpflicht 7 %/19 %." },
    { title: "5. Steuerschuldner", body: "§ 13a UStG Regel, § 13b UStG nur bei ausdrücklich normierten Fällen." },
    { title: "6. Bemessungsgrundlage", body: "§ 10 UStG — Entgelt ohne USt." },
    { title: "7. Steuerbetrag", body: "§ 12 UStG — Regelsatz 19 %, ermäßigt 7 %." },
    { title: "8. Vorsteuerabzug", body: "§ 15 UStG — ordnungsgemäße Rechnung (§ 14 UStG), Verwendung für steuerpflichtige Ausgangsumsätze." },
    ...extra,
  ];

  // 1) Innergemeinschaftlicher Erwerb — Ware aus EU-Ausland nach DE, B2B
  //    WICHTIG: § 1a UStG greift NUR auf der Erwerberseite (Ware gelangt nach Deutschland).
  //    Wenn der Prompt eindeutig eine Warenbewegung AUS Deutschland IN einen anderen EU-Mitgliedstaat
  //    beschreibt (ausDE / flowDEtoEU / explizite ig. Lieferung), NICHT § 1a wählen — dann greift § 6a
  //    (siehe Branch 2 direkt darunter).
  const igErwerbGate = hasWare && euCtx && !hasDienst && !drittland && !reihe && !uwa
    && !ausDE && !flowDEtoEU && !explicitIgLieferung
    && (nachDE || flowEUtoDE || transportNachDE || explicitIgErwerb);
  if (igErwerbGate) {
    const scheme = baseScheme();
    scheme[0].body = "Warenbewegung aus einem anderen EU-Mitgliedstaat nach Deutschland an einen Unternehmer für sein Unternehmen → innergemeinschaftlicher Erwerb (§ 1a UStG).";
    scheme[4].body = "Steuerschuldner ist der Erwerber (§ 13a Abs. 1 Nr. 2 UStG). Kein § 13b UStG — dieser gilt nur für sonstige Leistungen und einzelne Sonderfälle.";
    scheme[2].body = "Ort des Erwerbs: Ende der Beförderung/Versendung (§ 3d Satz 1 UStG) — hier Deutschland.";
    const complete = b2b && bothUstId && (transportNachDE || nachDE);
    if (complete) {
      scheme[3].body = "Steuerpflichtig 19 % (§ 12 Abs. 1 UStG) bzw. 7 % (§ 12 Abs. 2 UStG) — keine Befreiung einschlägig.";
      scheme[5].body = "Bemessungsgrundlage: Entgelt der Rechnung (§ 10 Abs. 1 UStG) ohne USt.";
      scheme[6].body = "Erwerbsteuer 19 % auf das Entgelt (§ 12 Abs. 1 UStG).";
      scheme[7].body = "Vorsteuerabzug in gleicher Höhe (§ 15 Abs. 1 Satz 1 Nr. 3 UStG), soweit für steuerpflichtige Ausgangsumsätze verwendet → wirtschaftlich neutral.";
    }
    return {
      type: "innergemeinschaftlicher_erwerb",
      label: "Innergemeinschaftlicher Erwerb",
      paragraph: "§ 1a UStG",
      trail: buildTrail("§ 1a UStG (ig. Erwerb)"),
      reasoning:
        "Ware gelangt aus einem EU-Mitgliedstaat nach Deutschland an einen Unternehmer für sein Unternehmen. Das ist ein ig. Erwerb (§ 1a UStG), kein Reverse Charge nach § 13b UStG.",
      scheme,
      followUps: complete
        ? []
        : [
            "Ist die USt-IdNr. des Erwerbers dem Lieferer mitgeteilt worden?",
            "Wurde der Erwerb im Inland (Deutschland) beendet?",
            "Erfolgt der Erwerb ausschließlich für das Unternehmen?",
          ],
      negative: "Reverse Charge nach § 13b UStG bewusst NICHT anwenden — bei Warenbewegung greift § 1a UStG (ig. Erwerb).",
      complete,
      ergebnis: complete
        ? "Innergemeinschaftlicher Erwerb im Inland steuerbar (§ 1 Abs. 1 Nr. 5, § 3d S. 1 UStG) und steuerpflichtig (19 %). Steuerschuldner ist der deutsche Erwerber (§ 13a Abs. 1 Nr. 2 UStG); zugleich Vorsteuerabzug in gleicher Höhe nach § 15 Abs. 1 S. 1 Nr. 3 UStG → Zahllast 0. Meldepflichten: Erwerb in UStVA (Zeilen ig. Erwerbe 19 %), Lieferer meldet ig. Lieferung in ZM."
        : undefined,
    };

  }

  // 2) Innergemeinschaftliche Lieferung
  if (hasWare && ausDE && euCtx) {
    const scheme = baseScheme();
    scheme[0].body = "Warenlieferung aus Deutschland in einen anderen EU-Mitgliedstaat an einen Unternehmer → innergemeinschaftliche Lieferung (§ 6a UStG).";
    scheme[1].body = "Steuerbar nach § 1 Abs. 1 Nr. 1 UStG (Lieferung im Inland gegen Entgelt durch einen Unternehmer im Rahmen seines Unternehmens).";
    scheme[2].body = "Lieferort: Deutschland — Beginn der Beförderung/Versendung (§ 3 Abs. 6 UStG).";
    scheme[3].body = "Steuerfrei nach § 4 Nr. 1b i. V. m. § 6a UStG bei gültiger USt-IdNr. des Abnehmers und Beleg-/Buchnachweis (§§ 17a ff. UStDV).";
    scheme[4].body = "Bemessungsgrundlage: vereinbartes Entgelt (§ 10 UStG), aber steuerfrei → keine deutsche USt.";
    scheme[5].body = "Steuerschuldner: der deutsche Lieferer (§ 13a Abs. 1 Nr. 1 UStG) — Lieferung ist jedoch steuerfrei, keine deutsche USt.";
    scheme[6].body = 'Rechnung ohne deutsche USt mit Hinweis „Steuerfreie innergemeinschaftliche Lieferung" (§ 14 Abs. 4 Nr. 8 UStG), USt-IdNr. beider Beteiligter.';
    scheme[7].body = "Meldepflichten: Zusammenfassende Meldung (§ 18a UStG), USt-Voranmeldung Zeile ig. Lieferungen; Buch-/Belegnachweis (§§ 17a ff. UStDV, Gelangensbestätigung).";
    // Vollständig, sobald Ware + Ausgang aus D + EU-Kontext + Unternehmerstatus vorliegen.
    // USt-IdNr./B2B stärkt das Ergebnis, blockiert es aber nicht (Beleg-/Buchnachweis bleibt Hinweis).
    const complete = b2b || bothUstId;
    return {
      type: "innergemeinschaftliche_lieferung",
      label: "Innergemeinschaftliche Lieferung",
      paragraph: "§ 6a UStG, § 4 Nr. 1b UStG",
      trail: buildTrail("§ 6a UStG (ig. Lieferung)"),
      reasoning: "Ware verlässt Deutschland in Richtung EU-Ausland an einen Unternehmer — steuerfreie ig. Lieferung, kein § 13b UStG.",
      scheme,
      followUps: complete
        ? []
        : [
            "Ist der Abnehmer Unternehmer mit gültiger USt-IdNr. des Bestimmungsmitgliedstaats?",
            "Ist der Warenweg (Deutschland → EU-Mitgliedstaat) belegt (Gelangensbestätigung)?",
          ],
      complete,
      ergebnis: complete
        ? "Innergemeinschaftliche Lieferung: Lieferort Deutschland (§ 3 Abs. 6 UStG), steuerbar (§ 1 Abs. 1 Nr. 1 UStG), steuerfrei nach § 4 Nr. 1b i. V. m. § 6a UStG. Keine deutsche USt. Steuerschuldner ist der deutsche Lieferer (§ 13a Abs. 1 Nr. 1 UStG), Lieferung jedoch steuerfrei. Rechnung ohne deutsche USt mit Hinweis auf Steuerfreiheit / innergemeinschaftliche Lieferung (§ 14 Abs. 4 Nr. 8 UStG). Buch- und Belegnachweise nach §§ 17a ff. UStDV (Gelangensbestätigung). Meldung in Zusammenfassender Meldung (§ 18a UStG)."
        : undefined,
    };

  }


  // 3) Reihengeschäft
  if (reihe) {
    const scheme = baseScheme();
    scheme[0].body = "Mehrere Unternehmer schließen Umsatzgeschäfte über denselben Gegenstand, der unmittelbar vom ersten Lieferer an den letzten Abnehmer gelangt → Reihengeschäft (§ 3 Abs. 6a UStG).";
    scheme[2].body = "Nur eine Lieferung ist die 'bewegte' Lieferung (Ort Beginn der Beförderung), die übrigen sind 'ruhende' Lieferungen (§ 3 Abs. 7 UStG).";
    return {
      type: "reihengeschaeft",
      label: "Reihengeschäft",
      paragraph: "§ 3 Abs. 6a, § 3 Abs. 7 UStG",
      trail: buildTrail("§ 3 Abs. 6a UStG (Reihengeschäft)"),
      reasoning: "Beteiligte, Transportverantwortung und USt-IdNr. entscheiden über die bewegte Lieferung — § 13b UStG greift hier nicht automatisch.",
      scheme,
      followUps: [
        "Wer transportiert / beauftragt den Transport?",
        "Welche USt-IdNr. verwendet der mittlere Unternehmer?",
        "Handelt es sich um ein innergemeinschaftliches Dreiecksgeschäft (§ 25b UStG)?",
      ],
    };

  }

  // 4) Werklieferung / Werkleistung
  //    Sonderfall: Werk(-lieferung/-leistung) eines im Ausland ansässigen
  //    Unternehmers an einen deutschen Unternehmer → Reverse Charge § 13b.
  //    Diese Konstellation muss VOR den generischen Werk-Zweigen greifen und
  //    eine vollständige Falllösung liefern.
  const werk = werkMitMaterial || werkOhneMaterial;
  const rcSignals = leistenderAusland || euCtx || drittland;
  const empfDE = empfaengerDE || nachDE || (b2b && !ausDE);
  if (werk && rcSignals && (b2b || bothUstId || rechnungOhneUst) && empfDE) {
    const scheme = baseScheme();
    scheme[0].body = werkMitMaterial
      ? "Werklieferung eines im Ausland ansässigen Unternehmers an einen deutschen Unternehmer. Werklieferung = Lieferung (§ 3 Abs. 4 UStG); Ort nach § 3 Abs. 7 Satz 1 UStG dort, wo sich der Gegenstand bei Verschaffung der Verfügungsmacht befindet — hier Deutschland."
      : "Werkleistung (Bearbeitung/Verarbeitung fremder Gegenstände) → sonstige Leistung (§ 3 Abs. 9 UStG). Leistender ist im Ausland ansässiger Unternehmer, Empfänger ist deutscher Unternehmer.";
    scheme[1].body = "Steuerbar im Inland nach § 1 Abs. 1 Nr. 1 UStG (Leistung im Inland gegen Entgelt im Rahmen des Unternehmens).";
    scheme[2].body = werkMitMaterial
      ? "Lieferort: § 3 Abs. 7 Satz 1 UStG — Ort der Verschaffung der Verfügungsmacht (Deutschland)."
      : "Leistungsort: § 3a Abs. 2 UStG — Sitz des Leistungsempfängers (Deutschland).";
    scheme[3].body = "Keine Steuerbefreiung nach § 4 UStG einschlägig → steuerpflichtig.";
    scheme[4].body = werkMitMaterial
      ? "Steuerschuldner ist der Leistungsempfänger (deutscher Unternehmer) nach § 13b Abs. 2 Nr. 1, Abs. 5 Satz 1 UStG (Werklieferung eines im Ausland ansässigen Unternehmers)."
      : "Steuerschuldner ist der Leistungsempfänger (deutscher Unternehmer) nach § 13b Abs. 1, Abs. 5 Satz 1 UStG (sonstige Leistung eines im übrigen Gemeinschaftsgebiet ansässigen Unternehmers).";
    scheme[5].body = "Bemessungsgrundlage: Nettoentgelt nach § 10 Abs. 1 UStG (Rechnung ohne deutsche USt).";
    scheme[6].body = "Steuerbetrag: 19 % nach § 12 Abs. 1 UStG (bzw. 7 % bei § 12 Abs. 2 UStG-Fällen).";
    scheme[7].body = "Vorsteuerabzug in gleicher Höhe nach § 15 Abs. 1 Satz 1 Nr. 4 UStG, wenn der Empfänger die Leistung für sein Unternehmen bezieht und kein Ausschluss (§ 15 Abs. 1a, Abs. 2 UStG) greift.";
    return {
      type: werkMitMaterial ? "werklieferung" : "werkleistung",
      label: werkMitMaterial
        ? "Werklieferung eines ausländischen Unternehmers → Reverse Charge"
        : "Werkleistung eines ausländischen Unternehmers → Reverse Charge",
      paragraph: werkMitMaterial
        ? "§ 3 Abs. 4, § 3 Abs. 7 S. 1, § 13b Abs. 2 Nr. 1, Abs. 5 UStG"
        : "§ 3 Abs. 9, § 3a Abs. 2, § 13b Abs. 1, Abs. 5 UStG",
      trail: buildTrail(werkMitMaterial
        ? "§ 13b Abs. 2 Nr. 1 UStG (Werklieferung, RC)"
        : "§ 13b Abs. 1 UStG (Werkleistung, RC)"),
      reasoning: werkMitMaterial
        ? "Werklieferung eines im Ausland ansässigen Unternehmers an einen deutschen Unternehmer im Inland → Steuerschuld verlagert sich auf den Leistungsempfänger (§ 13b Abs. 2 Nr. 1 UStG). Rechnung ohne deutsche USt; Empfänger schuldet 19 % und zieht sie zugleich als Vorsteuer ab."
        : "Sonstige Leistung eines im übrigen Gemeinschaftsgebiet ansässigen Unternehmers an einen deutschen Unternehmer → Leistungsort § 3a Abs. 2 UStG in Deutschland, Steuerschuldner ist der Leistungsempfänger (§ 13b Abs. 1, Abs. 5 UStG).",
      scheme,
      complete: true,
      followUps: [],
      ergebnis: `Reverse Charge: Der deutsche Leistungsempfänger schuldet die Umsatzsteuer (${werkMitMaterial ? "§ 13b Abs. 2 Nr. 1" : "§ 13b Abs. 1"}, Abs. 5 UStG), 19 % auf das Nettoentgelt (§ 10, § 12 Abs. 1 UStG). Gleichzeitig Vorsteuerabzug in gleicher Höhe nach § 15 Abs. 1 S. 1 Nr. 4 UStG, soweit für das Unternehmen bezogen und kein Ausschluss greift → wirtschaftlich neutral. Rechnungshinweis „Steuerschuldnerschaft des Leistungsempfängers" (§ 14a Abs. 5 UStG); Deklaration in UStVA (§ 13b-Umsätze + Vorsteuer § 15 Abs. 1 Nr. 4).`,
    };
  }

  const explicitRCEarly = /\breverse\s*charge|§\s*13b|13b\s*ustg\b/i.test(q);
  if (werkMitMaterial && !explicitRCEarly) {
    const scheme = baseScheme();
    scheme[0].body = "Werklieferung: Unternehmer stellt aus selbst beschafftem Hauptstoff ein Werk her → Lieferung (§ 3 Abs. 4 UStG).";
    return {
      type: "werklieferung",
      label: "Werklieferung",
      paragraph: "§ 3 Abs. 4 UStG",
      trail: buildTrail("§ 3 Abs. 4 UStG (Werklieferung)"),
      reasoning: "Wird der Hauptstoff vom leistenden Unternehmer beschafft, liegt eine Lieferung vor — Ortsbestimmung nach Lieferungsregeln.",
      scheme,
      complete: true,
      followUps: [],
    };
  }
  if (werkOhneMaterial && !explicitRCEarly) {
    const scheme = baseScheme();
    scheme[0].body = "Werkleistung: Bearbeitung/Verarbeitung fremder Gegenstände → sonstige Leistung (§ 3 Abs. 9 UStG).";
    const complete = b2b && (euCtx || drittland || nachDE || ausDE);
    return {
      type: "werkleistung",
      label: "Werkleistung",
      paragraph: "§ 3 Abs. 9 UStG",
      trail: buildTrail("§ 3 Abs. 9 UStG (Werkleistung / sonstige Leistung)"),
      reasoning: "Wird kein Hauptstoff geliefert, liegt eine sonstige Leistung vor. § 13b UStG nur, wenn Empfänger Unternehmer und Leistender im Ausland ansässig ist.",
      scheme,
      complete,
      followUps: complete ? [] : ["Wo ist der Leistende ansässig?", "Empfänger Unternehmer (B2B)?"],
    };

  }


  // 5) Grundstück
  if (grundstueck) {
    // Sub-Klassifizierung: Vermietung vs. Verkauf
    const isVermietung = /\b(vermiet[a-zäöüß]*|miet[a-zäöüß]*|pacht[a-zäöüß]*)\b/i.test(q);
    const isVerkauf = /\b(verkauf[a-zäöüß]*|verkauft|veräußer[a-zäöüß]*|kaufpreis|käufer)\b/i.test(q);
    // Option nach § 9 UStG explizit erwähnt oder als relevant erkannt
    const option9 =
      /\b(optier[a-zäöüß]*|option\b)\b/i.test(q) ||
      /§\s*9\s*(?:abs\.?\s*[12])?\s*ustg|§\s*9\s*ustg/i.test(q) ||
      /\b(zur\s+steuerpflicht\s+optier|optier[a-zäöüß]*\s+zur\s+steuerpflicht)\b/i.test(q);

    // -----------------------------------------------------------------------
    // Spezialfall: Grundstücksvermietung + Option § 9 UStG
    // Pflicht: alle 5 entscheidungserheblichen Angaben müssen vorliegen,
    // bevor ein endgültiges Ergebnis ausgegeben werden darf.
    // -----------------------------------------------------------------------
    if (isVermietung && !isVerkauf && option9) {
      // 1. Art des Mieters
      const hasArtDesMieters =
        /\b(unternehmer|gewerblich|privat(?:person|e?[sr]?\s+mieter|kunde)?|endverbraucher|arzt|zahnarzt|ärztin|praxis|klinik|krankenhaus|apotheke|bank|sparkasse|kreditinstitut|versicherung|schule|universität|kindergarten|pflegeheim|altenheim|gemeinnützig[a-zäöüß]*|freiberufl[a-zäöüß]*|steuerberater|rechtsanwalt|architekt|ingenieur|handwerker|einzelhändler|gastronomie|hotel|träger|verein|stiftung|körperschaft|gmbh|ug\b|ag\b|ohg|kg\b|kommunal)\b/i.test(q);

      // 2. Tätigkeit des Mieters
      const hasTaetigkeitDesMieters =
        /\b(tätigkeit|tätig\b|tätige[rns]?\b|branche|betreib[a-zäöüß]*|erbring[a-zäöüß]*|ausüb[a-zäöüß]*|heilbehandlung|ärztlich[a-zäöüß]*|medizinisch[a-zäöüß]*|zahnärztlich[a-zäöüß]*|therapeut[a-zäöüß]*|heilberuf[a-zäöüß]*|freiberuflich|gewerblich|handwerk[a-zäöüß]*|einzelhandel|gastronomisch|produzier[a-zäöüß]*|dienstleist[a-zäöüß]*|versicherungsvermittl[a-zäöüß]*|bildung[a-zäöüß]*|pfleg[a-zäöüß]*|sozial[a-zäöüß]*)\b/i.test(q);

      // 3. Steuerpflichtige oder steuerfreie Ausgangsumsätze
      const hasAusgangsumsaetze =
        /\b(steuerpflichtige?\s+(?:ausgangsumsätze?|umsätze?|leistungen?|tätigkei[a-zäöüß]*)|steuerfreie?\s+(?:ausgangsumsätze?|umsätze?|leistungen?|tätigkei[a-zäöüß]*)|ausgangsumsätze?|steuerpflichtig\b|steuerfrei\b|vollunternehmer|ausschließlich\s+(?:steuerpflichtig|steuerfrei)|§\s*15\s*abs\.?\s*2\s*ustg|vorsteuerschädlich[a-zäöüß]*|vorsteuerunschädlich[a-zäöüß]*)\b/i.test(q);

      // 4. Vorsteuerabzugsberechtigung
      const hasVorsteuer =
        /\b(vorsteuerabzug[a-zäöüß]*|vorsteuerberechtigt[a-zäöüß]*|vorsteuerabzugsberechtigt[a-zäöüß]*|vorsteuerschädlich[a-zäöüß]*|nicht\s+vorsteuerabzugsberechtigt|vorsteuer\b|§\s*15\s*(?:abs\.?\s*[12])?\s*ustg)\b/i.test(q);

      // 5. Getrennte Prüfung je Einheit
      const hasEinheitPruefung =
        /\b(je\s+einheit|pro\s+einheit|getrennt(?:e[rs]?\s+prüfung)?|räumlich(?:e\s+(?:aufteilung|trennung))?|einzeln|mehrere\s+(?:einheiten|wohnungen|büros|flächen|räume|mieteinheiten|mietobjekte)|zum\s+teil|teilweise|gemischt(?:e\s+nutzung)?|teils|stockwerk|etage|mieteinheit(?:en)?|je\s+mietobjekt|je\s+fläche)\b/i.test(q);

      const missing: string[] = [];
      if (!hasArtDesMieters)
        missing.push("Art des Mieters (z. B. Unternehmer, Heilberufler, Privatperson)?");
      if (!hasTaetigkeitDesMieters)
        missing.push("Welcher Tätigkeit geht der Mieter nach (Berufs-/Branchenbeschreibung)?");
      if (!hasAusgangsumsaetze)
        missing.push("Erzielt der Mieter steuerpflichtige oder steuerfreie Ausgangsumsätze?");
      if (!hasVorsteuer)
        missing.push("Ist der Mieter (voll oder anteilig) vorsteuerabzugsberechtigt (§ 15 UStG)?");
      if (!hasEinheitPruefung)
        missing.push(
          "Sind mehrere Einheiten betroffen? (Getrennte Prüfung je Einheit nach § 9 Abs. 2 UStG erforderlich.)",
        );

      const complete = missing.length === 0;

      const optionScheme = [
        {
          title: "1. Steuerbefreiung (Ausgangspunkt)",
          body: "Grundstücksvermietung ist grundsätzlich steuerfrei (§ 4 Nr. 12a UStG).",
        },
        {
          title: "2. Optionsmöglichkeit § 9 Abs. 1 UStG",
          body: "Verzicht auf Steuerbefreiung möglich, wenn der Mieter Unternehmer ist und das Grundstück für sein Unternehmen nutzt.",
        },
        {
          title: "3. Einschränkung § 9 Abs. 2 UStG",
          body: "Die Option ist nur zulässig, wenn der Mieter das Grundstück ausschließlich für Umsätze verwendet, die den Vorsteuerabzug nicht ausschließen (§ 15 Abs. 2 UStG).",
        },
        {
          title: "4. Art des Mieters",
          body: hasArtDesMieters
            ? "✓ Im Sachverhalt angegeben."
            : "⚠ Fehlt — für die Optionsprüfung zwingend erforderlich.",
        },
        {
          title: "5. Tätigkeit des Mieters",
          body: hasTaetigkeitDesMieters
            ? "✓ Im Sachverhalt angegeben."
            : "⚠ Fehlt — entscheidend für Vorsteuerschädlichkeit nach § 9 Abs. 2 UStG.",
        },
        {
          title: "6. Ausgangsumsätze (steuerpflichtig / steuerfrei)",
          body: hasAusgangsumsaetze
            ? "✓ Im Sachverhalt angegeben."
            : "⚠ Fehlt — maßgeblich für die Zulässigkeit der Option.",
        },
        {
          title: "7. Vorsteuerabzugsberechtigung",
          body: hasVorsteuer
            ? "✓ Im Sachverhalt angegeben."
            : "⚠ Fehlt — bestimmt, ob Option nach § 9 Abs. 2 UStG zulässig ist.",
        },
        {
          title: "8. Prüfung je Einheit",
          body: hasEinheitPruefung
            ? "✓ Im Sachverhalt berücksichtigt."
            : "⚠ Fehlt — getrennte Prüfung je Mieteinheit ist zwingend (§ 9 Abs. 2 UStG).",
        },
        {
          title: "9. Ergebnis",
          body: complete
            ? "Alle Pflichtangaben vorhanden — Optionsprüfung nach § 9 UStG kann abgeschlossen werden."
            : `Unvollständiger Sachverhalt — kein endgültiges Ergebnis möglich. Fehlende Angaben: ${missing.map((m, i) => `(${i + 1}) ${m}`).join("; ")}`,
        },
      ];

      return {
        type: "grundstueck",
        label: "Grundstücksvermietung — Optionsprüfung § 9 UStG",
        paragraph: "§ 4 Nr. 12a, § 9 UStG",
        trail: buildTrail("§ 4 Nr. 12a UStG (Grundstücksvermietung), § 9 UStG (Option)"),
        reasoning: complete
          ? "Alle entscheidungserheblichen Angaben zur § 9 UStG-Option liegen vor — Prüfung kann abgeschlossen werden."
          : "Für die Optionsprüfung nach § 9 UStG bei Grundstücksvermietung fehlen Pflichtangaben. Ohne diese darf kein endgültiges Ergebnis ausgegeben werden.",
        scheme: optionScheme,
        complete,
        followUps: missing,
        ergebnis: complete
          ? "Sachverhalt vollständig: § 9 Abs. 2 UStG-Prüfung abschließbar. Die Option ist zulässig, wenn der Mieter das Grundstück ausschließlich für vorsteuerabzugsunschädliche Umsätze verwendet. Bei gemischter Nutzung gilt § 9 Abs. 2 UStG — raumeinheitliche Prüfung je Einheit. Bei voller Vorsteuerabzugsberechtigung des Mieters: Option wirksam → Vermietung 19 % USt, Vorsteuerabzug aus Eingangsleistungen des Vermieters steht zu."
          : undefined,
      };
    }

    // Allgemeiner Grundstücksfall (kein Vermietung+Option-Spezialfall)
    const scheme = baseScheme();
    scheme[0].body =
      "Grundstücksbezogene Leistung / Grundstücksumsatz — Ort nach § 3a Abs. 3 Nr. 1 UStG (Belegenheitsort); Umsatz ggf. steuerfrei nach § 4 Nr. 9a UStG mit Optionsmöglichkeit § 9 UStG.";
    return {
      type: "grundstueck",
      label: "Grundstücksleistung / Grundstücksumsatz",
      paragraph: "§ 3a Abs. 3 Nr. 1, § 4 Nr. 9a, § 9, § 13b Abs. 2 Nr. 3 UStG",
      trail: buildTrail("§ 3a Abs. 3 Nr. 1 UStG (Grundstück)"),
      reasoning:
        "Bei Grundstücken gelten Sonderregeln (Belegenheitsort, § 4 Nr. 9a Befreiung, Option, ggf. § 13b Abs. 2 Nr. 3).",
      scheme,
      followUps: isVermietung
        ? ["Wird zur Steuerpflicht optiert (§ 9 UStG)?", "Empfänger Unternehmer?"]
        : isVerkauf
          ? [
              "Unternehmer als Verkäufer?",
              "Wird nach § 9 UStG zur Steuerpflicht optiert?",
            ]
          : [
              "Verkauf oder Vermietung?",
              "Wird zur Steuerpflicht optiert (§ 9 UStG)?",
              "Empfänger Unternehmer?",
            ],
    };
  }

  // 6) Ausfuhr / Einfuhr
  if (hasWare && drittland && ausDE) {
    const scheme = baseScheme();
    scheme[0].body = "Ausfuhrlieferung ins Drittland (§ 6 UStG), steuerfrei nach § 4 Nr. 1a UStG bei Belegnachweis (Ausfuhrnachweis, Buchnachweis).";
    return {
      type: "ausfuhr", label: "Ausfuhrlieferung", paragraph: "§ 6, § 4 Nr. 1a UStG",
      trail: buildTrail("§ 6 UStG (Ausfuhrlieferung)"),
      reasoning: "Ware verlässt das Zollgebiet der EU — steuerfreie Ausfuhrlieferung.", scheme,
      complete: true,
      followUps: [],
    };
  }
  if (hasWare && drittland && nachDE) {
    const scheme = baseScheme();
    scheme[0].body = "Einfuhr aus dem Drittland → Einfuhrumsatzsteuer (§ 1 Abs. 1 Nr. 4 UStG), Vorsteuerabzug nach § 15 Abs. 1 Nr. 2 UStG.";
    return {
      type: "einfuhr", label: "Einfuhr / EUSt", paragraph: "§ 1 Abs. 1 Nr. 4, § 15 Abs. 1 Nr. 2 UStG",
      trail: buildTrail("§ 1 Abs. 1 Nr. 4 UStG (Einfuhr / EUSt)"),
      reasoning: "Bei Wareneinfuhr aus Drittland entsteht EUSt beim Zoll — kein § 13b UStG.", scheme,
      complete: true,
      followUps: [],
    };

  }

  // 7) Verbringen
  if (verbringen) {
    const scheme = baseScheme();
    scheme[0].body = "Innergemeinschaftliches Verbringen eigener Ware ins EU-Ausland → einer ig. Lieferung gleichgestellt (§ 3 Abs. 1a UStG).";
    return {
      type: "verbringen", label: "Innergemeinschaftliches Verbringen", paragraph: "§ 3 Abs. 1a UStG",
      trail: buildTrail("§ 3 Abs. 1a UStG (ig. Verbringen)"),
      reasoning: "Eigene Ware wird ohne Umsatz ins EU-Ausland verbracht — als ig. Lieferung/ig. Erwerb zu behandeln.", scheme,
      followUps: ["Zweck der Verbringung (dauerhaft / vorübergehend)?"],
    };
  }

  // 8) Unentgeltliche Wertabgabe
  if (uwa) {
    const scheme = baseScheme();
    scheme[0].body = "Unentgeltliche Wertabgabe (§ 3 Abs. 1b / Abs. 9a UStG) — Gleichstellung mit entgeltlicher Lieferung/Leistung.";
    return {
      type: "unentgeltliche_wertabgabe", label: "Unentgeltliche Wertabgabe", paragraph: "§ 3 Abs. 1b, Abs. 9a UStG",
      trail: buildTrail("§ 3 Abs. 1b/9a UStG (unentgeltliche Wertabgabe)"),
      reasoning: "Privatnutzung / Entnahme aus dem Unternehmen — Bemessungsgrundlage § 10 Abs. 4 UStG.", scheme,
      followUps: ["Vorsteuerabzug bei Anschaffung möglich gewesen?", "Nutzungsanteil dokumentiert?"],
    };

  }

  // 9) Reverse Charge — nur wenn wirklich sonstige Leistung / § 13b-Fall
  const explicitRC = /\breverse\s*charge|§\s*13b|13b\s*ustg\b/i.test(q);
  if (explicitRC || (hasDienst && (euCtx || drittland) && b2b)) {
    const scheme = baseScheme();
    scheme[0].body = "Sonstige Leistung eines im Ausland ansässigen Unternehmers an einen inländischen Unternehmer → Reverse Charge (§ 13b Abs. 1/Abs. 2 UStG).";
    scheme[4].body = "Steuerschuldner ist der Leistungsempfänger (§ 13b Abs. 5 UStG). Rechnung ohne USt mit Hinweis 'Steuerschuldnerschaft des Leistungsempfängers'.";
    const complete = explicitRC || (hasDienst && (euCtx || drittland) && b2b);
    return {
      type: "reverse_charge",
      label: "Reverse Charge",
      paragraph: "§ 13b UStG",
      trail: buildTrail("§ 13b UStG (Reverse Charge)"),
      reasoning:
        "Nur bei ausdrücklich in § 13b UStG genannten Fällen (v. a. sonstige Leistungen ausländischer Unternehmer, Bauleistungen B2B, Schrott, Gebäudereinigung, Emissionshandel).",
      scheme,
      complete,
      followUps: complete
        ? []
        : [
            "Handelt es sich wirklich um eine sonstige Leistung (nicht Ware)?",
            "Ist der Leistende im Ausland ansässig?",
            "Empfänger inländischer Unternehmer?",
          ],
    };
  }


  // 10) Sachverhalts-Router (Sicherheitsnetz) — bevor wir „unbestimmt" zurückgeben,
  //     prüfen wir noch einmal explizit die häufigsten Warenbewegungen. So werden
  //     Formulierungen wie „kauft eine Maschine, Amsterdam → München, beide Unternehmer,
  //     gültige USt-IdNr., Rechnung ohne USt." nicht mehr als „Sachverhaltsart offen"
  //     ausgegeben.
  if (hasWare && !hasDienst && !drittland && !reihe && !uwa) {
    // Ware bewegt sich in ein anderes EU-Land aus Deutschland → ig. Lieferung.
    if (flowDEtoEU || (ausDE && euCtx)) {
      const scheme = baseScheme();
      scheme[0].body = "Warenlieferung aus Deutschland in einen anderen EU-Mitgliedstaat an einen Unternehmer → innergemeinschaftliche Lieferung (§ 6a UStG).";
      scheme[1].body = "Steuerbar nach § 1 Abs. 1 Nr. 1 UStG (Lieferung im Inland gegen Entgelt).";
      scheme[2].body = "Lieferort: Deutschland — Beginn der Beförderung/Versendung (§ 3 Abs. 6 UStG).";
      scheme[3].body = "Steuerfrei nach § 4 Nr. 1b i. V. m. § 6a UStG bei gültiger USt-IdNr. des Abnehmers und Beleg-/Buchnachweis.";
      scheme[4].body = "Bemessungsgrundlage: vereinbartes Entgelt (§ 10 UStG), aber steuerfrei.";
      scheme[5].body = "Steuerschuldner: der deutsche Lieferer (§ 13a Abs. 1 Nr. 1 UStG) — Lieferung steuerfrei.";
      scheme[6].body = 'Rechnung ohne deutsche USt mit Hinweis „Steuerfreie innergemeinschaftliche Lieferung" (§ 14 Abs. 4 Nr. 8 UStG).';
      scheme[7].body = "ZM (§ 18a UStG), UStVA Zeile ig. Lieferungen, Gelangensbestätigung (§§ 17a ff. UStDV).";
      const complete = b2b || bothUstId;
      return {
        type: "innergemeinschaftliche_lieferung",
        label: "Innergemeinschaftliche Lieferung",
        paragraph: "§ 6a UStG, § 4 Nr. 1b UStG",
        trail: buildTrail("§ 6a UStG (ig. Lieferung, Router)"),
        reasoning: "Warenbewegung Deutschland → EU-Mitgliedstaat an einen Unternehmer.",
        scheme,
        complete,
        followUps: complete ? [] : ["Gültige USt-IdNr. des Abnehmers vorhanden?", "Warenweg belegt (Gelangensbestätigung)?"],
        ergebnis: complete
          ? "Steuerfreie ig. Lieferung nach § 4 Nr. 1b i. V. m. § 6a UStG. Lieferort Deutschland (§ 3 Abs. 6 UStG), keine deutsche USt. Rechnung ohne USt mit Hinweis auf Steuerfreiheit; ZM nach § 18a UStG; Nachweise §§ 17a ff. UStDV."
          : undefined,
      };
    }
    // Ware bewegt sich aus EU nach Deutschland → ig. Erwerb (Kern des Nutzer-Beispiels).
    if (flowEUtoDE || (nachDE && euCtx) || (euCtx && !ausDE && b2b)) {
      const scheme = baseScheme();
      scheme[0].body = "Warenbewegung aus einem anderen EU-Mitgliedstaat nach Deutschland an einen Unternehmer für sein Unternehmen → innergemeinschaftlicher Erwerb (§ 1a UStG).";
      scheme[1].body = "Steuerbar im Inland nach § 1 Abs. 1 Nr. 5 UStG.";
      scheme[2].body = "Ort des Erwerbs: Ende der Beförderung/Versendung (§ 3d Satz 1 UStG) — hier Deutschland.";
      scheme[3].body = "Steuerpflichtig 19 % (§ 12 Abs. 1 UStG); keine § 4-Befreiung einschlägig.";
      scheme[4].body = "Bemessungsgrundlage: Entgelt der Rechnung ohne USt (§ 10 Abs. 1 UStG).";
      scheme[5].body = "Steuerschuldner: der deutsche Erwerber (§ 13a Abs. 1 Nr. 2 UStG). Kein § 13b UStG.";
      scheme[6].body = "Erwerbsteuer 19 % (§ 12 Abs. 1 UStG).";
      scheme[7].body = "Vorsteuerabzug in gleicher Höhe nach § 15 Abs. 1 Satz 1 Nr. 3 UStG → wirtschaftlich neutral.";
      const complete = b2b && (bothUstId || rechnungOhneUst);
      return {
        type: "innergemeinschaftlicher_erwerb",
        label: "Innergemeinschaftlicher Erwerb",
        paragraph: "§ 1a UStG",
        trail: buildTrail("§ 1a UStG (ig. Erwerb, Router)"),
        reasoning: "Ware gelangt aus einem EU-Mitgliedstaat nach Deutschland an einen Unternehmer für sein Unternehmen — ig. Erwerb (§ 1a UStG), nicht § 13b UStG.",
        scheme,
        complete,
        followUps: complete ? [] : ["USt-IdNr. beider Beteiligten gültig?", "Warenweg im Inland (Deutschland) beendet?"],
        negative: "Reverse Charge nach § 13b UStG bewusst NICHT anwenden — bei Warenbewegung greift § 1a UStG.",
        ergebnis: complete
          ? "Innergemeinschaftlicher Erwerb: im Inland steuerbar (§ 1 Abs. 1 Nr. 5, § 3d S. 1 UStG) und steuerpflichtig 19 % (§ 12 Abs. 1 UStG). Steuerschuldner ist der deutsche Erwerber (§ 13a Abs. 1 Nr. 2 UStG); zugleich Vorsteuerabzug in gleicher Höhe nach § 15 Abs. 1 S. 1 Nr. 3 UStG → Zahllast 0. Meldung: UStVA (ig. Erwerbe 19 %); Lieferer meldet ig. Lieferung in ZM."
          : undefined,
      };
    }
    // Reine Inlandslieferung
    if (nachDE && !euCtx && !drittland) {
      const scheme = baseScheme();
      scheme[0].body = "Lieferung im Inland (§ 3 Abs. 1 UStG).";
      scheme[2].body = "Lieferort § 3 Abs. 6 UStG — Beginn der Beförderung/Versendung.";
      return {
        type: "lieferung_inland",
        label: "Inlandslieferung",
        paragraph: "§ 3 Abs. 1, § 3 Abs. 6 UStG",
        trail: buildTrail("§ 3 Abs. 1 UStG (Inlandslieferung)"),
        reasoning: "Warenlieferung im Inland — Regelbesteuerung.",
        scheme,
        complete: b2b,
        followUps: b2b ? [] : ["Empfänger Unternehmer oder Endkunde?"],
      };
    }
  }

  // 11) Kein spezifischer Typ erkannt, aber USt-Trigger vorhanden
  //     → USt-Workflow trotzdem starten (keine allgemeine „Welche Steuerart?"-Rückfrage).
  return {
    type: "unbestimmt",
    label: "Umsatzsteuerlicher Sachverhalt — Klassifizierung erforderlich",
    paragraph: "§ 1 UStG (Systematik)",
    trail: buildTrail("Sachverhaltsart offen"),

    reasoning:
      "Umsatzsteuerliche Begriffe im Prompt erkannt. Die konkrete Sachverhaltsart (Lieferung, sonstige Leistung, ig. Erwerb § 1a, ig. Lieferung § 6a, Reverse Charge § 13b, Ausfuhr § 6, Einfuhr, Reihen-/Dreiecksgeschäft) ist noch nicht eindeutig — bitte die entscheidungserheblichen Angaben ergänzen.",
    scheme: [
      { title: "1. Was wurde geleistet?", body: "Ware (Lieferung, § 3 Abs. 1 UStG) oder Dienstleistung (sonstige Leistung, § 3 Abs. 9 UStG)?" },
      { title: "2. Warenweg / Leistungsort", body: "Woher / wohin? Inland, EU-Ausland oder Drittland? Ort nach §§ 3, 3a–3g UStG." },
      { title: "3. Beteiligte", body: "B2B mit gültigen USt-IdNr.? Ansässigkeit des Leistenden / Empfängers?" },
      { title: "4. Rechnungsangaben", body: "USt ausgewiesen? Hinweis auf § 13b oder ig. Lieferung? § 14 UStG." },
      { title: "5. Erst dann Norm", body: "§ 1a (ig. Erwerb) vs. § 13b (RC) vs. § 6a (ig. Lieferung) vs. § 25b (Dreieck) vs. § 6 (Ausfuhr) usw." },
    ],
    followUps: [
      "Handelt es sich um Ware oder Dienstleistung?",
      "Aus welchem Land wird geliefert / geleistet, wohin?",
      "Sind beide Beteiligte Unternehmer (USt-IdNr.)?",
    ],
    negative:
      "Bitte nicht vorschnell auf § 13b UStG schließen — bei Warenbewegungen ist regelmäßig § 1a UStG (ig. Erwerb) einschlägig.",
  };
}


/**
 * Erzeugt eine reine Zitat-/Vertiefungssektion aus einem KB-Eintrag.
 * Wichtig: der Body des KB-Eintrags (der oft einen Beispiel-Sachverhalt enthält)
 * wird bewusst NICHT in die Antwort kopiert. Es werden ausschließlich Titel,
 * Rechtsgrundlagen und — falls vorhanden — die regelhafte Kurzbeschreibung
 * (`short`) übernommen, damit die eigene Falllösung nicht überschrieben wird.
 */
function kbCitationSection(
  e: KBEntry,
  role: "Vertiefung" | "Alternative Regel" = "Vertiefung",
): { title: string; body: string } {
  const refs = e.references?.length ? `Rechtsgrundlage: ${e.references.join(", ")}` : "";
  const rule = e.short ? e.short.trim() : "";
  const body = [rule, refs].filter(Boolean).join("\n\n")
    || "Regelhafte Vertiefung siehe Wissensdatenbank.";
  return { title: `${role}: ${e.title}`, body };
}

/** Prüft, ob ein KB-Zitat inhaltlich zur Klassifizierung passt (mindestens ein Paragraph gemeinsam). */
function citationMatchesNorm(entry: KBEntry, paragraphs: string[]): boolean {
  const tokens = paragraphs
    .flatMap((p) => p.match(/§\s*\d+[a-z]?/gi) ?? [])
    .map((s) => s.replace(/\s+/g, "").toLowerCase());
  if (!tokens.length) return true;
  const hay = (entry.references?.join(" ") ?? "").toLowerCase().replace(/\s+/g, "");
  return tokens.some((t) => hay.includes(t));
}

function buildTrace(q: string, c: UstClassification): TraceStep[] {
  const trace: TraceStep[] = [];
  trace.push({ step: "Eingang", detail: q.slice(0, 240) });
  if (c.trail) trace.push({ step: "Erkennung", detail: c.trail });
  trace.push({ step: "Sachverhaltsart", detail: `${c.label} (${c.paragraph})` });
  if (c.negative) trace.push({ step: "Verworfene Zweige", detail: c.negative });
  trace.push({ step: "Vollständig", detail: c.complete ? "ja — keine Rückfragen" : "nein — Rückfragen aktiv" });
  return trace;
}

/** Öffentliche Klassifizierung — für Regressionstests. */
export function classifyForRegression(q: string): {
  scenarioType: string | null;
  paragraph: string | null;
  complete: boolean;
  followUps: string[];
  label: string | null;
} {
  const c = classifyUst(q);
  if (!c) return { scenarioType: null, paragraph: null, complete: false, followUps: [], label: null };
  return {
    scenarioType: ustTypeToScenarioType(c.type),
    paragraph: c.paragraph,
    complete: !!c.complete,
    followUps: c.followUps ?? [],
    label: c.label,
  };
}

function classifyUstSachverhalt(q: string): ChatAnswer | null {
  const c = classifyUst(q);
  if (!c) return null;

  const scenarioType = ustTypeToScenarioType(c.type);
  const kbRaw = findKbMatches(q, [c.paragraph], ["Umsatzsteuer"], 3, scenarioType, "umsatzsteuer");

  // Konsistenzprüfung: KB-Zitate, deren Rechtsgrundlagen keine Überschneidung
  // mit der klassifizierten Norm haben, werden verworfen (Qualitätssicherung).
  const kb = kbRaw.filter((e) => citationMatchesNorm(e, [c.paragraph])).slice(0, 2);
  const main = kb[0];
  const alt = kb[1];

  // Reihenfolge: Klassifizierung → Falllösung → Schema → Ergebnis → KB-Vertiefung
  const sections: { title: string; body: string }[] = [
    ...(c.trail ? [{ title: "Klassifizierung", body: c.trail }] : []),
    { title: "Sachverhaltsart", body: `${c.label} (${c.paragraph})` },
    ...c.scheme,
    { title: "9. Ergebnis", body: c.ergebnis ?? c.reasoning },
  ];

  if (main) sections.push(kbCitationSection(main, "Vertiefung"));
  if (alt) sections.push(kbCitationSection(alt, "Alternative Regel"));

  // "Nicht anwenden" nur ausgeben, wenn Sachverhalt NICHT bereits vollständig
  // klassifiziert wurde (bei c.complete ist die Norm eindeutig, Warnung überflüssig).
  if (c.negative && !c.complete) sections.push({ title: "Nicht anwenden", body: c.negative });

  return {
    kind: "case",
    summary: c.complete
      ? `USt-Prüfung abgeschlossen: ${c.label} (${c.paragraph}).`
      : `USt-Prüfung: ${c.label} (${c.paragraph}).`,
    reasoning: c.reasoning,
    sections,
    followUps: c.complete ? undefined : c.followUps,
    nextStep: c.complete
      ? "Buchung/Meldung ableiten: UStVA (ig. Erwerbe 19 %, Vorsteuer), ZM des Lieferers, Belegnachweise archivieren."
      : "Erst nach vollständiger Klassifizierung Buchung/Meldung ableiten (UStVA, ZM, ggf. § 18 Abs. 4c UStG).",
    knowledge: "Umsatzsteuer / Prüfschema",
    links: [
      { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      { label: "Strukturierte Anfrage anlegen", to: "/neue-anfrage" },
    ],
    scenarioType: scenarioType ?? undefined,
    paragraphs: [c.paragraph],
    taxType: "umsatzsteuer",
    taxTypeLabel: TAX_TYPE_LABELS.umsatzsteuer,
    trace: buildTrace(q, c),
  };
}






// --- Meta-Intent „steuerstoff_info“ ---
function isSteuerstoffInfoQuery(q: string): boolean {
  const s = q.trim();
  if (!s) return false;
  // direkte Hilfe-Trigger
  if (/^(hilfe|einführung|einfuehrung|app erklären|app erklaeren)\??$/.test(s)) return true;
  // Fragen rund um die App / „du“
  const aboutApp =
    /\bsteuerstoff\b/.test(s) ||
    /\bdiese[r]?\s+app\b/.test(s) ||
    /\bdas\s+hier\b/.test(s) ||
    /\bder\s+steuerstoff\s+chat\b/.test(s);
  const askVerb =
    /^(was\s+(ist|kann|macht|bringt|bietet|leistet))\b/.test(s) ||
    /^(wofür|wofuer|wozu)\b/.test(s) ||
    /^(wie\s+(benutze|nutze|funktioniert))\b/.test(s) ||
    /^(erklär|erklaer|zeig|hilf)\b/.test(s) ||
    /\bwelche\s+funktionen\b/.test(s) ||
    /^was\s+kannst\s+du\b/.test(s);
  return aboutApp && askVerb;
}

function steuerstoffInfoAnswer(): ChatAnswer {
  return {
    kind: "info",
    summary:
      "steuerstoff ist dein steuerlicher KI-Arbeitsassistent für deutsche Steuerkanzleien. Du kannst einfache Fragen stellen oder konkrete Sachverhalte prüfen lassen – z. B. NPO-Sphären, SKR42-Konten, Kfz-Wertabgaben, Umsatzsteuer oder Jahresabschluss-Themen.",
    sections: [
      { title: "Steuer-Chat", body: "Einfache Fragen oder Sachverhalte beschreiben — steuerstoff gibt eine erste Einordnung, nennt offene Punkte und verweist auf passende Module." },
      { title: "NPO-Prüfassistent", body: "Sphären, Zweckbetrieb, Vermögensverwaltung, wirtschaftlicher Geschäftsbetrieb, Spenden, Zuschüsse, Mittelweitergabe und gemeinnützigkeitsrechtliche Risiken." },
      { title: "SKR-Konverter", body: "SKR03-Konten und Buchungstexte in passende SKR42-Konten überführen — mit NPO-Sphärenlogik." },
      { title: "Kfz-Wertabgaben-Rechner", body: "Private Kfz-Nutzung nach 1-%-Methode, Fahrten Wohnung/Betrieb (0,03 %), USt-Aufteilung und Kostendeckelung." },
      { title: "Wissensdatenbank", body: "Handouts, Kanzlei-Standards, Steuerwissen, DATEV-Logiken, NPO-Wissen und Prüfhinweise." },
      { title: "Rückfragen & Review", body: "Mandantenrückfragen, interne Prüfnotizen, To-do-Listen und Review-Hinweise strukturiert erzeugen." },
      { title: "DATEV / Buchhaltung", body: "Buchungsvorschläge, Belegprüfung, OPOS, SKR-Logik, USt-Hinweise und Jahresabschlussvorbereitung." },
    ],
    nextStep:
      "steuerstoff ersetzt keine Steuerberatung — hilft aber dabei, Sachverhalte zu sortieren, Rückfragen zu formulieren, Buchungsvorschläge vorzubereiten und Review-Punkte zu dokumentieren.",
    links: [
      { label: "Neue Frage stellen", to: "/chat" },
      { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
      { label: "SKR-Konverter öffnen", to: "/skr-konverter" },
      { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      { label: "Kfz-Wertabgabe berechnen", to: "/kfz-wertabgabe" },
    ],
    knowledge: "Über steuerstoff",
  };
}

// Trigger-Wörter, die den USt-Workflow zwingend aktivieren.
const UST_TRIGGERS: RegExp[] = [
  /\brechnung(en)?\b/i,
  /\b(umsatzsteuer|ust|mwst|mehrwertsteuer)\b/i,
  /\bvorsteuer\b/i,
  /\b(ust-?id(nr)?\.?|ustid|umsatzsteuer-?identifikationsnummer)\b/i,
  /\breverse\s*charge\b/i,
  /§\s*13b|13b\s*ustg/i,
  /§\s*1a|1a\s*ustg/i,
  /§\s*3a|3a\s*ustg/i,
  /§\s*6a|6a\s*ustg/i,
  /\binnergemeinschaftlich(e[nrs]?)?\s+(erwerb|lieferung|verbringen)\b/i,
  /\big\.?\s*(erwerb|lieferung)\b/i,
  /\b(ware|waren|lieferung|liefer(n|t|ung)|dienstleistung|werklieferung|werkleistung)\b/i,
  /\b(eu-?ausland|eu\b|drittland)\b/i,
  /\b(niederlande|österreich|oesterreich|frankreich|polen|italien|spanien|belgien|luxemburg|tschechien|slowakei|schweden|dänemark|daenemark|finnland|portugal|griechenland|ungarn|irland)\b/i,
  /\bdeutschland|inland\b/i,
  /\b(transport|versand|bef(ö|oe)rder|versendet|gelangt|geliefert)\b/i,
  /\bleistungsort|ort\s+der\s+leistung\b/i,
  /\bsteuerschuldner(schaft)?\b/i,
  /\bbemessungsgrundlage\b/i,
  /\bausfuhrlieferung\b/i,
  /\berwerb\b/i,
  /\b(ausfuhr|einfuhr|eust|einfuhrumsatzsteuer)\b/i,
];

function ustTriggerCount(q: string): number {
  let n = 0;
  for (const r of UST_TRIGGERS) if (r.test(q)) n++;
  return n;
}

// Fachbegriffe, die für sich allein den USt-Workflow zwingend auslösen.
const UST_STRONG = /\b(umsatzsteuer[a-zäöüß]*|ust\b|mwst|mehrwertsteuer|vorsteuer[a-zäöüß]*|reverse\s*charge|innergemein[a-zäöüß]*|ig\.?\s*(erwerb|lieferung)|ust-?id|werklieferung|werkleistung|ausfuhrlieferung|ausfuhr|einfuhr|eust|leistungsort|steuerschuldner(schaft)?|bemessungsgrundlage|grundst[a-zäöüß]*|geb(ä|ae)ude|immobilie|zwischenvermietung|vermietung|sportanlage|betriebsvorrichtung|tennishalle|bauleistung)\b|§\s*(13b|1a|3a|6a|15a?|4\s*nr\.?\s*(9a?|12)|9\b)|(?:^|[^a-z])(13b|1a|3a|6a|15a?)\s*ustg/i;

function hasUstTriggers(q: string): boolean {
  // Ein starker Kernbegriff reicht, sonst mindestens zwei allgemeine Trigger.
  if (UST_STRONG.test(q)) return true;
  return ustTriggerCount(q) >= 2;
}


/**
 * Deterministische Router-Pipeline:
 *   Eingabe → Steuerart → Sachverhaltsart → Prüfschema → Prüfung → Ergebnis → KB.
 * `annotateWithRouter` hängt an jede Antwort die erkannte Steuerart sowie
 * einen Router-Trace-Schritt an. Die eigentliche Klassifizierung findet
 * weiterhin in den bewährten Zweigen unten statt (USt: `classifyUstSachverhalt`,
 * Erb/Schenk/NPO/Bilanz/AO/… in `generateAnswer`).
 */
function annotateWithRouter(a: ChatAnswer, router: RouterResult): ChatAnswer {
  const routerStep: TraceStep = { step: "Steuerart (Router)", detail: router.trail };
  return {
    ...a,
    taxType: a.taxType ?? router.taxType,
    taxTypeLabel: a.taxTypeLabel ?? TAX_TYPE_LABELS[router.taxType],
    trace: [routerStep, ...(a.trace ?? [])],
  };
}

/**
 * Klassifiziert die Nutzeranfrage in eine von vier Kategorien:
 *   A) Wissensfrage  — Definition / Paragraph / "Was ist …?" / "Wann …?"
 *   B) Sachverhalt   — konkreter Mandantenfall
 *   C) Berechnung    — Beträge, Steuer ermitteln
 *   D) Recherche     — Norm-/Urteilssuche
 * Wissensfragen dürfen niemals mit generischen Rückfragen beantwortet werden.
 */
export type QueryIntent = "wissen" | "sachverhalt" | "berechnung" | "recherche";

export function classifyIntent(rawQuestion: string): QueryIntent {
  const q = rawQuestion.toLowerCase().trim();

  const sachverhaltMarker = [
    "mandant", "mandantin", "unser mandant", "meine mandantin",
    "die gmbh hat", "der verein hat", "die kg hat", "die ohg hat",
    "die stiftung hat", "unsere gmbh", "rechnung erhalten",
    "rechnung geschrieben", "wir haben verkauft", "wir haben gekauft",
    "hat gekauft", "hat verkauft", "hat geliefert", "hat vermietet",
    "wurde geliefert", "buchung", "buchungssatz",
  ];
  const looksLikeSachverhalt = sachverhaltMarker.some((m) => q.includes(m));

  if (
    /\b(berechne|berechnung|rechne\s+aus|wie\s+viel|wieviel|höhe\s+der)\b/i.test(q) ||
    /\b(steuerlast|steuerbetrag|zahllast|vorsteuer|umsatzsteuer)\s+(für|von|ermitteln|berechnen)/i.test(q)
  ) return "berechnung";

  if (/\b(bfh|bmf|urteil|rechtsprechung|az\.|az\s+[ivx]+\s*r)/i.test(q)) return "recherche";

  if (looksLikeSachverhalt) return "sachverhalt";

  if (
    /^(was\s+(ist|sind|bedeutet)|wann\s+|wie\s+funktioniert|warum\s+|welche\s+voraussetzungen|erklär|erkl[aä]re|definiere|unterschied\s+zwischen|prüfungsschema|pruefungsschema)/i.test(q) ||
    /§\s*\d+[a-z]?/i.test(q)
  ) return "wissen";

  return "sachverhalt";
}

/** Erste 1–3 Sätze aus einem Fließtext extrahieren, ohne Aufzählungen zu zerschneiden. */
function firstSentences(text: string, max = 3): string {
  const cleaned = text.replace(/\r/g, "").trim();
  // Nimm den ersten zusammenhängenden Absatz (keine Listen).
  const paragraphs = cleaned.split(/\n\s*\n/);
  const firstProse = paragraphs.find((p) => !/^\s*[-*\d]/.test(p.trim())) ?? paragraphs[0] ?? "";
  const sentences = firstProse.replace(/\n+/g, " ").match(/[^.!?]+[.!?]+/g);
  if (!sentences) return firstProse.slice(0, 320).trim();
  return sentences.slice(0, max).join(" ").trim();
}

/** Extrahiert einen Beispielabschnitt aus dem Body, wenn vorhanden. */
function extractExample(body: string): string | null {
  const m = body.match(/(^|\n)\s*(Beispiel|Bsp\.?)\s*[:\-–][^\n]*(\n(?!\n)[^\n]*)*/i);
  if (m) return m[0].replace(/^\s*\n/, "").trim();
  const idx = body.toLowerCase().indexOf("beispiel");
  if (idx >= 0) {
    const chunk = body.slice(idx, idx + 400);
    const stop = chunk.search(/\n\s*\n/);
    return (stop > 0 ? chunk.slice(0, stop) : chunk).trim();
  }
  return null;
}

/**
 * GESETZESMODUS: erkennt reine Gesetzesfragen.
 * Trigger: § im Prompt ODER Prompt beginnt mit Gesetzesbezeichner (EStG, UStG, KStG, AO, GewStG, HGB, BGB).
 */
function isLawOnlyQuestion(q: string): boolean {
  const t = q.toLowerCase();
  if (/§\s*\d/.test(t)) return true;
  if (/\b(estg|ustg|kstg|gewstg|erbstg|hgb|bgb|ao|aeao)\b/.test(t) && !/mandant|fall|kunde|klient/.test(t)) return true;
  return false;
}

/** Zerlegt einen Gesetzes-Body in die Standardabschnitte des Gesetzesmodus. */
function parseLawSections(body: string): {
  tatbestand?: string;
  rechtsfolge?: string;
  ausnahmen?: string;
  beispiel?: string;
  merksatz?: string;
} {
  const pick = (re: RegExp): string | undefined => {
    const m = body.match(re);
    if (!m) return undefined;
    const start = (m.index ?? 0) + m[0].length;
    const rest = body.slice(start);
    const next = rest.search(/\n⇨{1,6}\s/);
    return (next > 0 ? rest.slice(0, next) : rest).trim() || undefined;
  };
  return {
    tatbestand: pick(/⇨{1,6}\s*(Tatbestand(svoraussetzungen)?|Voraussetzungen)\b[^\n]*\n/i),
    rechtsfolge: pick(/⇨{1,6}\s*Rechtsfolge[n]?\b[^\n]*\n/i),
    ausnahmen: pick(/⇨{1,6}\s*Ausnahmen?\b[^\n]*\n/i),
    beispiel: pick(/⇨{1,6}\s*(Praxisbeispiel|Beispiel)\b[^\n]*\n/i),
    merksatz: pick(/⇨{1,6}\s*Merksatz\b[^\n]*\n/i),
  };
}

/**
 * Wissensfrage-Antwort direkt aus Lexikon + Knowledge Base. Nie Rückfragen.
 * Antwortschema:
 *   1) Direkte Antwort (summary)
 *   2) Gesetzesgrundlage (paragraphs)
 *   3) Kurze Begründung (reasoning)
 *   4) Beispiel (sections)
 *   5) Verwendeter Wissensbaustein (knowledge)
 */
function answerFromKnowledge(rawQuestion: string): ChatAnswer | null {
  const lex = lookupLexicon(rawQuestion);
  if (lex) return { ...lex, followUps: [], clarify: undefined, kind: lex.kind ?? "info" };

  const paras = (rawQuestion.match(/§\s*\d+[a-z]?/gi) ?? []).map((s) => s.trim());
  // Priorität: interne KB (Gesetze, Verwaltungsanweisungen, Rechtsprechung) vor öffentlicher KB.
  const internalHits = findKbMatches(rawQuestion, paras, [], 2, null, null, INTERNAL_KNOWLEDGE_BASE, 2);
  const publicHits = findKbMatches(rawQuestion, paras, [], 2, null, null);
  const hits = internalHits.length > 0 ? internalHits : publicHits;
  if (hits.length === 0) return null;
  const usedInternal = internalHits.length > 0;


  const first = hits[0];
  const body = first.body ?? "";

  // 1) Direkte Antwort: bevorzugt `short`, sonst erste Sätze des Body.
  const directAnswer =
    (first.short && first.short.trim().length > 0
      ? first.short.trim()
      : firstSentences(body, 3)) || first.title;

  // 3) Kurze Begründung: wenn `short` genutzt wurde, ergänze Kontext aus Body.
  const reasoningSource =
    first.short && first.short.trim().length > 0 ? firstSentences(body, 2) : firstSentences(body.split(/\n\s*\n/).slice(1).join("\n\n"), 2);
  const reasoning = reasoningSource && reasoningSource !== directAnswer ? reasoningSource : undefined;

  // 4) Beispiel (optional)
  const example = extractExample(body);

  const sections: { title: string; body: string }[] = [];

  // GESETZESMODUS: Wenn Frage rein gesetzesbezogen ist und ein Gesetzes-Baustein trifft,
  // folgt die Antwort dem Schema: Gesetz / Tatbestand / Rechtsfolge / Ausnahmen / Beispiel / Merksatz.
  const lawMode = usedInternal && isLawOnlyQuestion(rawQuestion) && /gesetz/i.test(first.category ?? "");
  if (lawMode) {
    const law = parseLawSections(body);
    sections.push({ title: "Gesetz", body: `${first.title}${first.references?.length ? ` — ${first.references.join(", ")}` : ""}` });
    if (law.tatbestand) sections.push({ title: "Tatbestandsvoraussetzungen", body: law.tatbestand });
    if (law.rechtsfolge) sections.push({ title: "Rechtsfolge", body: law.rechtsfolge });
    if (law.ausnahmen) sections.push({ title: "Ausnahmen", body: law.ausnahmen });
    const bsp = law.beispiel ?? example;
    if (bsp) sections.push({ title: "Praxisbeispiel", body: bsp });
    if (law.merksatz) sections.push({ title: "Merksatz", body: law.merksatz });
    if (hits.length > 1) {
      sections.push({
        title: "Verknüpfte Normen",
        body: hits.slice(1).map((h) => `${h.title}${h.references?.length ? ` (${h.references.join(", ")})` : ""}`).join(" · "),
      });
    }
  } else {
    if (first.references?.length) {
      sections.push({ title: "Gesetzesgrundlage", body: first.references.join(", ") });
    }
    if (example) {
      sections.push({ title: "Beispiel", body: example });
    }
    sections.push({
      title: `Verwendeter Wissensbaustein: ${first.title}`,
      body:
        (first.short ? `${first.short}\n\n` : "") +
        body +
        (first.references?.length ? `\n\nRechtsgrundlage: ${first.references.join(", ")}` : ""),
    });
    if (hits.length > 1) {
      for (const h of hits.slice(1)) {
        sections.push({
          title: `Weiterer Wissensbaustein: ${h.title}`,
          body:
            (h.short ? `${h.short}\n\n` : "") +
            h.body +
            (h.references?.length ? `\n\nRechtsgrundlage: ${h.references.join(", ")}` : ""),
        });
      }
    }
  }

  return {
    kind: "info",
    summary: directAnswer,
    reasoning,
    sections,
    followUps: [],
    knowledge: first.title,
    paragraphs: first.references,
    links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
    trace: [
      { step: "Intent", detail: "Wissensfrage → Knowledge Base zuerst" },
      { step: "Quelle", detail: usedInternal ? "Interne Wissensdatenbank (Gesetz/Verwaltung/Rechtsprechung)" : "Öffentliche Wissensdatenbank" },
      { step: "KB-Treffer", detail: hits.map((h) => h.title).join(" · ") },
      { step: "Antwortschema", detail: "Direkte Antwort → Gesetz → Begründung → Beispiel → Wissensbaustein" },

    ],
  };
}

export function generateAnswer(rawQuestion: string): ChatAnswer {
  const intent = classifyIntent(rawQuestion);

  // Wissens-/Recherchefragen: Knowledge Base zuerst, KEINE Rückfragen.
  if (intent === "wissen" || intent === "recherche") {
    const know = answerFromKnowledge(rawQuestion);
    if (know) return know;
  }
  const stripFollowUps = intent === "wissen" || intent === "recherche";
  const finalize = (a: ChatAnswer): ChatAnswer =>
    stripFollowUps ? { ...a, followUps: [], clarify: undefined } : a;

  return finalize(_generateAnswerEntry(rawQuestion));
}

function _generateAnswerEntry(rawQuestion: string): ChatAnswer {
  const router = routeTaxType(rawQuestion);
  // Neue Expertensystem-Pipeline ZUERST. Nur wenn sie kein belastbares
  // Ergebnis liefert, greift die Legacy-Kette.
  try {
    const r = runExpertSystem(rawQuestion);
    const resolved =
      r.answer && (r.trace.ruleConfidence ?? 0) >= EXPERT_OVERRIDE_THRESHOLD;
    if (resolved && r.answer) {
      const trace: TraceStep[] = [
        { step: "Entry", detail: "generateAnswer → runExpertSystem" },
        {
          step: "Parser: Facts",
          detail:
            Object.entries(r.trace.parsedFacts)
              .filter(([, v]) => v !== undefined && v !== "unknown")
              .map(([k, v]) => `${k}=${v}`)
              .join(", ") || "–",
        },
        { step: "Signale", detail: r.trace.firedSignals.join(", ") || "–" },
        {
          step: "Router: Scores",
          detail:
            Object.entries(r.trace.taxRoute.scores ?? {})
              .map(([k, v]) => `${k}:${v}`)
              .join(", ") || "–",
        },
        {
          step: "Scenario",
          detail: `${r.trace.scenario ?? "–"} / ${r.trace.subScenario ?? "–"}`,
        },
        {
          step: "Rule",
          detail: `${r.trace.matchedRule ?? "-"} (conf ${(r.trace.ruleConfidence ?? 0).toFixed(2)})`,
        },
        { step: "Answer", detail: "Expertensystem-Ergebnis, Legacy übersprungen" },
      ];
      return {
        summary: r.answer.summary,
        reasoning: r.answer.reasoning,
        sections: r.answer.sections,
        followUps: r.answer.followUps,
        knowledge: r.knowledge,
        kind: "case",
        taxType: r.answer.taxType,
        taxTypeLabel: r.answer.taxTypeLabel,
        scenarioType: r.answer.scenarioType,
        paragraphs: r.answer.paragraphs,
        trace,
      };
    }
  } catch (err) {
    // Nur echte Laufzeitfehler landen hier — sichtbar in der Konsole,
    // damit die Pipeline-Integration nicht mehr stumm ausfällt.
    console.error("[expertSystem] runExpertSystem failed:", err);
  }
  const answer = _generateAnswerImpl(rawQuestion, router);
  return annotateWithExpertSystem(annotateWithRouter(answer, router), rawQuestion);
}

/**
 * Ebene 1–5 Expertensystem (Parser → Signals → Router → Rules → Knowledge).
 * Läuft parallel und ergänzt Trace + Steuerart-Score, ohne die bewährte
 * Antwort-Auswahl zu überschreiben. Sobald ein Sub-Router (USt/ESt/…) eine
 * ausgereifte Rule-Datei hat, kann er hier verdrahtet werden.
 */
function annotateWithExpertSystem(a: ChatAnswer, rawQuestion: string): ChatAnswer {
  try {
    const facts = parseFacts(rawQuestion);
    const signals = evaluateSignals(facts);
    const decision = expertRoute(signals, rawQuestion);
    if (decision.primary === "unklar") return a;
    const rule = runExpertLegacyRules(decision.primary, facts, signals);
    const unsupported = rule.subCase === "unsupported";
    const trace: TraceStep[] = [
      ...(a.trace ?? []),
      { step: "Expertensystem: Signale", detail: signals.map((s) => s.id).join(", ") || "–" },
      { step: "Expertensystem: Steuerart", detail: `${decision.primary}${decision.secondary.length ? ` (auch: ${decision.secondary.join(", ")})` : ""}` },
      unsupported
        ? { step: "Expertensystem: Rule", detail: `noch nicht unterstützt (${decision.primary})` }
        : { step: "Expertensystem: Rule", detail: `${rule.schemaId ?? "–"}${rule.subCase ? ` / ${rule.subCase}` : ""}` },
    ];
    return { ...a, trace };
  } catch {
    return a;
  }
}


function _generateAnswerImpl(rawQuestion: string, router: RouterResult): ChatAnswer {

  const q = rawQuestion.toLowerCase().trim();

  // --- 0) Meta-Fragen über die App selbst (vor Router) ---
  if (isSteuerstoffInfoQuery(q)) return steuerstoffInfoAnswer();

  // --- USt-Zweig: bestehende feinjustierte Klassifizierung wiederverwenden ---
  if (router.taxType === "umsatzsteuer" || hasUstTriggers(q)) {
    const ust = classifyUstSachverhalt(q);
    if (ust) return ust;
  }



  // --- 1) Lexikon / Begriffsfrage (vor allen Spezialmodulen) ---
  const lex = lookupLexicon(rawQuestion);
  if (lex) return lex;




  // --- Allgemeine Steuerlehre: "Was sind Steuern?" / Steuerarten ---
  if (
    /^(was\s+(ist|sind))\s+(eine\s+)?steuer/i.test(rawQuestion.trim()) ||
    has(q, "steuerarten", "steuersystem", "abgabenarten") ||
    (has(q, "unterschied") && has(q, "gebühr", "gebuehr", "beitrag")) ||
    has(q, "direkte steuer", "indirekte steuer")
  ) {
    return {
      kind: "info",
      summary:
        "Steuern sind Geldleistungen, die ein öffentlich-rechtliches Gemeinwesen ohne Anspruch auf konkrete Gegenleistung von allen erhebt, bei denen der gesetzliche Tatbestand zutrifft (§ 3 Abs. 1 AO).",
      sections: [
        {
          title: "Abgrenzung",
          body:
            "Gebühr = Entgelt für konkrete Amtshandlung. Beitrag = Entgelt für die Möglichkeit der Inanspruchnahme einer Leistung. Sonderabgabe = Finanzierung gruppennütziger Zwecke. Nur die Steuer ist gegenleistungslos.",
        },
        {
          title: "Nach Bemessungsgrundlage",
          body:
            "Ertragsteuern (ESt, KSt, GewSt), Verkehrsteuern (USt, GrESt), Substanzsteuern (GrSt, ErbSt), Verbrauchsteuern (Energie, Tabak).",
        },
        {
          title: "Nach Steuergläubiger",
          body:
            "Bundessteuern, Landessteuern (z. B. ErbSt, GrESt), Gemeindesteuern (GrSt, GewSt) und Gemeinschaftsteuern (USt, ESt, KSt — Aufkommen wird aufgeteilt).",
        },
        {
          title: "Direkt vs. indirekt",
          body:
            "Direkt: Steuerschuldner = Steuerträger (ESt, KSt). Indirekt: Last wird überwälzt (USt, Verbrauchsteuern).",
        },
      ],
      clarify:
        "Möchtest du zu einer bestimmten Steuerart vertiefen (z. B. ESt, KSt, USt, GewSt, ErbSt)?",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: "Steuern — Grundlagen",
    };
  }

  // --- Erbschaft-/Schenkungsteuer ---
  if (has(q, "erbschaftsteuer", "erbschaft-steuer", "schenkungsteuer", "erbstg", "nachlass", "erbanfall") || /\berbst\b/i.test(q)) {
    return {
      kind: "info",
      summary:
        "Die Erbschaft- und Schenkungsteuer erfasst den unentgeltlichen Vermögensübergang von Todes wegen (§ 3 ErbStG) bzw. unter Lebenden (§ 7 ErbStG). Bewertungsstichtag ist der Tag der Steuerentstehung (§§ 9, 11 ErbStG).",
      sections: [
        {
          title: "Steuerklassen (§ 15 ErbStG)",
          body:
            "I: Ehegatten, Kinder, Enkel, bei Erbfall auch Eltern. II: Geschwister, Nichten/Neffen, Schwiegerkinder. III: alle übrigen Erwerber.",
        },
        {
          title: "Persönliche Freibeträge (§ 16 ErbStG)",
          body:
            "Ehegatte 500.000 €, Kinder 400.000 €, Enkel 200.000 € (400.000 € bei verstorbenem Elternteil), Eltern bei Erbfall 100.000 €, StKl II/III 20.000 €.",
        },
        {
          title: "Bewertung",
          body:
            "Anteile nicht notierter Kapitalgesellschaften: gemeiner Wert mit Substanzwert als Mindestwert (§ 11 BewG). Grundbesitz: Vergleichs-, Ertrags- oder Sachwertverfahren (§§ 182 ff. BewG). Gesonderte Feststellung nach § 151 BewG.",
        },
        {
          title: "Begünstigungen",
          body:
            "§§ 13a/13b ErbStG: Betriebsvermögen / Kapitalanteile > 25 %. § 13d ErbStG: 10 %-Abschlag für zu Wohnzwecken vermietete Grundstücke. § 13 Abs. 1 Nr. 4b/c: Familienheim.",
        },
      ],
      followUps: [
        "Welche Steuerklasse liegt vor?",
        "Welche Vermögensarten gehören zum Nachlass (Grundbesitz, GmbH-Anteile, Bankguthaben)?",
        "Gibt es Vorerwerbe innerhalb von 10 Jahren (§ 14 ErbStG)?",
      ],
      nextStep: "Schema: Vermögensanfall ./. Nachlassverbindlichkeiten = Bereicherung ./. Freibetrag = stpfl. Erwerb × Tarif § 19 ErbStG.",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: "Erbschaftsteuer",
    };
  }

  // --- Kfz-Wertabgabe / 1-%-Methode ---
  if (
    has(
      q,
      "kfz-wertabgabe",
      "kfz wertabgabe",
      "1%-methode",
      "1 % methode",
      "1%methode",
      "1-%-methode",
      "1 prozent methode",
      "ein prozent methode",
      "private kfz-nutzung",
      "private kfz nutzung",
      "bruttolistenpreis",
      "kostendeckelung",
      "8921",
      "8924",
      "fahrten wohnung betrieb",
      "fahrten wohnung-betrieb",
      "firmenwagen",
    )
  ) {
    return {
      kind: "info",
      summary:
        "Dafür kann ich den Kfz-Wertabgaben-Rechner öffnen. Er rechnet 1-%-Methode, Fahrten Wohnung/Betrieb (0,03 %), USt-Aufteilung auf ⇨ 8921 0 / ⇨ 8924 0 und die Kostendeckelung nach Arbeitspapier.",
      nextStep:
        "Bruttolistenpreis, Nutzungsmonate, Entfernung und Arbeitstage erfassen — anschließend Kostendeckelung prüfen.",
      links: [
        { label: "Kfz-Wertabgabe berechnen", to: "/kfz-wertabgabe" },
        { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      ],
      knowledge: "Kfz-Wertabgabe",
    };
  }

  // --- SKR ---
  if (has(q, "skr03", "skr 03", "skr42", "skr 42", "skr", "konto ", "kontierung", "buchungstext")) {
    const skrMatch = q.match(/skr\s*0?3?\s*(\d{3,5})/);
    const konto = skrMatch?.[1];
    return {
      summary: konto
        ? `SKR03 ${konto} lässt sich häufig auf ein passendes SKR42-Konto übertragen. Bitte Sphäre, NPO-Zuordnung und individuellen Kontenrahmen prüfen.`
        : "Für SKR03 ↔ SKR42 Zuordnungen empfiehlt sich der SKR-Konverter mit Mapping-Vorschlag und Buchungstextanalyse.",
      reasoning:
        "Die Konvertierung hängt vom Buchungsinhalt, der Sphärenzuordnung (ideell, Zweckbetrieb, wirtschaftlich) und vom Mandanten-Kontenrahmen ab.",
      followUps: ["Welche Sphäre ist betroffen?", "Liegt ein abweichender Mandanten-Kontenplan vor?"],
      nextStep: "Im SKR-Konverter Konto und Buchungstext prüfen.",
      links: [{ label: "Im SKR-Konverter öffnen", to: "/skr-konverter" }],
      knowledge: "SKR-Konverter",
    };
  }

  // --- NPO-Kontext-Trigger (für Mittelverwendung / § 62 / Rücklagen) ---
  const npoContext = has(
    q,
    "verein",
    "ggmbh",
    "gug",
    "stiftung",
    "gemeinnützig",
    "gemeinnuetzig",
    "npo",
    "mittelverwendung",
    "§ 55",
    "§ 62",
    "§55",
    "§62",
    "rücklagenspiegel",
    "verwendungsüberhang",
    "verwendungsueberhang",
    "zuflussjahr",
    "zwei-jahres-frist",
    "zeitnah",
    "wiederbeschaffung",
    "betriebsmittelrücklage",
    "betriebsmittelruecklage",
    "freie rücklage",
    "freie ruecklage",
  );

  // --- Rückstellung vs. Rücklage (allgemeine Abgrenzungsfrage) ---
  if (has(q, "rückstellung", "rueckstellung") && has(q, "rücklage", "ruecklage", "unterschied")) {
    return {
      kind: "info",
      summary:
        "Rücklage und Rückstellung sind nicht dasselbe — der Unterschied liegt in Bilanzposition und Anlass.",
      sections: [
        {
          title: "Rücklage",
          body:
            "Teil des Eigenkapitals. Zurückbehaltene Mittel zur Stärkung der Organisation oder für künftige Zwecke. Beispiele: Gewinnrücklage, Kapitalrücklage, gemeinnützigkeitsrechtliche Rücklagen nach § 62 AO.",
        },
        {
          title: "Rückstellung",
          body:
            "Fremdkapital. Sie bildet ungewisse Verbindlichkeiten oder drohende Belastungen ab (Höhe oder Fälligkeit unsicher). Beispiele: Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung.",
        },
      ],
      clarify:
        "Soll ich die Abgrenzung im NPO-Kontext (§ 62 AO) oder bei einer Kapitalgesellschaft vertiefen?",
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
      ],
      knowledge: "Bilanzielle Abgrenzung",
    };
  }

  // --- Allgemeine Rücklagen-Wissensfrage (NICHT NPO-Kontext) ---
  if (has(q, "rücklage", "ruecklage", "gewinnrücklage", "kapitalrücklage") && !npoContext) {
    return {
      kind: "info",
      summary:
        "Eine Rücklage ist zurückbehaltenes Eigenkapital bzw. ein zweckgebundener oder freier Betrag, der nicht unmittelbar ausgeschüttet oder verwendet wird. Im steuerlichen Kontext muss man unterscheiden, welche Art von Rücklage gemeint ist.",
      sections: [
        {
          title: "1. Allgemeine Rücklage",
          body:
            "Eigenkapitalposition, z. B. Gewinnrücklage oder Kapitalrücklage. Dient der Stärkung des Eigenkapitals.",
        },
        {
          title: "2. Steuerliche Spezialrücklage",
          body:
            "Steuerliche Sonderregelung möglich, z. B. Rücklagen im Zusammenhang mit Reinvestitionen — abhängig vom konkreten Steuertatbestand.",
        },
        {
          title: "3. Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO",
          body:
            "Relevant für Vereine, gGmbHs, Stiftungen und NPOs — z. B. freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage. Muss dokumentiert und häufig im Rücklagenspiegel dargestellt werden.",
        },
        {
          title: "4. Rückstellung ist nicht Rücklage",
          body:
            "Rückstellung betrifft ungewisse Verbindlichkeiten oder drohende Belastungen (Fremdkapital). Rücklage ist grundsätzlich Eigenkapital bzw. Mittelbindung.",
        },
      ],
      clarify:
        "Meinst du eine allgemeine steuerliche Rücklage oder eine Rücklage bei einer gemeinnützigen Organisation?",
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
        { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      ],
      knowledge: "Rücklage — Grundlagen",
    };
  }

  // --- Mittelverwendung / NPO-Rücklagen (nur bei NPO-Kontext) ---
  if (
    npoContext &&
    has(
      q,
      "mittelverwendung",
      "rücklage",
      "ruecklage",
      "freie rücklage",
      "betriebsmittelrücklage",
      "rücklagenspiegel",
      "verwendungsüberhang",
      "zuflussjahr",
      "zwei-jahres-frist",
      "zeitnah",
      "§ 55",
      "§ 62",
    )
  ) {
    return {
      kind: "npo",
      summary:
        "Mittel gemeinnütziger Körperschaften müssen grundsätzlich zeitnah verwendet werden: Zufluss im Jahr X bis Ende des zweiten Folgejahres (X+2) für satzungsmäßige Zwecke.",
      reasoning:
        "Ausnahmen bilden zulässige Rücklagen nach § 62 AO (freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage). Diese sind im Rücklagenspiegel zu dokumentieren.",
      risks: [
        "Ein positiver Verwendungsüberhang kann auf eine nicht zeitnahe Mittelverwendung hinweisen und sollte geprüft werden.",
        "Ein Verstoß führt nicht automatisch sofort zum Verlust der Gemeinnützigkeit — das Finanzamt kann nach § 63 Abs. 4 AO eine Verwendungsauflage erteilen.",
      ],
      followUps: [
        "Wann ist der Mittelzufluss erfolgt?",
        "Sind bereits Rücklagen gebildet und dokumentiert?",
      ],
      nextStep: "Sphäre, Zufluss, Verwendung und Rücklagen im NPO-Prüfassistenten strukturieren.",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }],
      knowledge: "NPO / Mittelverwendung",
    };
  }

  // --- NPO-Sphäre / Spende / Sponsoring ---
  if (
    has(
      q,
      "verein",
      "ggmbh",
      "stiftung",
      "spende",
      "mitgliedsbeitrag",
      "mitgliedsbeiträge",
      "zuschuss",
      "sphäre",
      "sphaere",
      "zweckbetrieb",
      "vermögensverwaltung",
      "vermoegensverwaltung",
      "wirtschaftlicher geschäftsbetrieb",
      "gemeinnützig",
      "sponsoring",
      "logo",
    )
  ) {
    if (has(q, "mitgliedsbeitr")) {
      return {
        summary:
          "Echte Mitgliedsbeiträge eines Vereins gehören regelmäßig zum ideellen Bereich.",
        reasoning:
          "Werden mit dem Beitrag konkrete Gegenleistungen abgegolten (Kurse, Eintritt, Nutzung, Sonderleistungen), kann anteilig Zweckbetrieb oder wirtschaftlicher Geschäftsbetrieb vorliegen.",
        followUps: [
          "Bekommen Mitglieder konkrete Leistungen für den Beitrag?",
          "Gibt es unterschiedliche Beitragsklassen mit Zusatzleistungen?",
        ],
        nextStep: "Im NPO-Prüfassistenten Sphärenzuordnung dokumentieren.",
        links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
        knowledge: "NPO / Sphären",
      };
    }
    if (has(q, "logo", "sponsoring", "werbung", "gegenleistung")) {
      return {
        summary:
          "Logo-Nennung mit aktiver Werbewirkung spricht eher für Sponsoring bzw. Leistungsaustausch — eine Spendenbescheinigung wäre kritisch.",
        reasoning:
          "Reine Duldung der Namensnennung kann ideell bleiben; aktive Werbung führt regelmäßig zum wirtschaftlichen Geschäftsbetrieb oder Zweckbetrieb (Sponsoringerlass).",
        risks: [
          "Unzulässige Spendenbescheinigung → Haftung nach § 10b EStG.",
          "Umsatzsteuerpflicht der Sponsoringleistung.",
        ],
        followUps: [
          "Liegt ein Sponsoringvertrag vor?",
          "Wie aktiv ist die Werbewirkung (verlinktes Logo, Werbeflächen, Social Posts)?",
        ],
        nextStep: "Im NPO-Prüfassistenten Sphäre und USt prüfen.",
        links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
        knowledge: "NPO / Sponsoring",
      };
    }
    return {
      summary:
        "Für NPO-Sachverhalte ist die Sphärenzuordnung (ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) zentral.",
      reasoning:
        "Die Zuordnung steuert Ertragsteuer, Umsatzsteuer, Mittelverwendung und Spendenfähigkeit.",
      followUps: [
        "Welche Rechtsform liegt vor?",
        "Gibt es eine Gegenleistung?",
        "Wer ist Empfänger / Geldgeber?",
      ],
      nextStep: "Im NPO-Prüfassistenten strukturieren.",
      links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
      knowledge: "NPO",
    };
  }

  // --- USt Strom ---
  if (has(q, "strom") && has(q, "umsatzsteuer", "ust", "mwst")) {
    return {
      summary:
        "Auf Stromlieferungen fällt in Deutschland regelmäßig der allgemeine Umsatzsteuersatz von 19 % an.",
      reasoning: "Stromlieferung ist keine begünstigte Leistung nach § 12 Abs. 2 UStG.",
      followUps: ["Liegt eine Rechnung mit ausgewiesener USt vor?", "Ist der Leistungsempfänger vorsteuerabzugsberechtigt?"],
      nextStep: "Rechnung und Leistungszeitraum prüfen.",
      knowledge: "Umsatzsteuer",
    };
  }

  // --- Umsatzsteuer: Pflicht-Klassifizierung VOR § 13b ---
  const ustAnswer = classifyUstSachverhalt(q);
  if (ustAnswer) return ustAnswer;

  // --- Sommerfest / gemischter Sachverhalt ---
  if (has(q, "sommerfest", "fest mit eintritt", "getränkeverkauf", "getraenkeverkauf")) {
    return {
      summary:
        "Ein Sommerfest mit Eintritt und Getränkeverkauf führt regelmäßig zum wirtschaftlichen Geschäftsbetrieb bzw. ggf. Zweckbetrieb (z. B. gesellige Veranstaltung).",
      risks: [
        "Überschreiten der 45.000-€-Grenze (§ 64 Abs. 3 AO).",
        "Umsatzsteuerpflicht für Eintritt und Getränkeverkauf.",
      ],
      followUps: ["Höhe der Einnahmen?", "Welcher Verein / welche Sphärenstruktur?"],
      nextStep: "Im NPO-Prüfassistenten Sphäre, Freigrenze und USt prüfen.",
      links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
      knowledge: "NPO / wirtschaftlicher Geschäftsbetrieb",
    };
  }

  // --- KB-First-Fallback ---
  // Wenn die Spezialheuristik keine eindeutige Route findet, wird zuerst die
  // vollständige Wissensdatenbank durchsucht. Erst ohne brauchbaren Treffer
  // wird um eine Präzisierung gebeten.
  const broadKbMatches = findBroadKbMatches(q, 4);
  if (broadKbMatches.length > 0) {
    const primary = broadKbMatches[0];
    return {
      kind: "info",
      summary:
        primary.short ||
        `Dazu gibt es passende Inhalte in der steuerstoff-Wissensdatenbank: ${primary.title}.`,
      sections: kbSections(broadKbMatches),
      nextStep: "Die passenden Wissensbausteine prüfen und bei Bedarf den konkreten Sachverhalt ergänzen.",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: `Wissensdatenbank · ${primary.category}`,
      sources: broadKbMatches.map((entry) => ({
        id: entry.id,
        title: entry.title,
        reference: entry.references?.join(", ") ?? null,
        excerpt: entry.short ?? null,
      })),
      confidence: broadKbMatches.length >= 2 ? "high" : "medium",
    };
  }

  // --- Letzter Fallback: wirklich keine passende KB-Grundlage ---
  return {
    summary:
      "Dazu habe ich in der lokalen Wissensdatenbank noch keinen eindeutigen Treffer gefunden. Eine kurze Präzisierung zu Steuerart und Sachverhalt hilft.",
    followUps: [
      "Um welche Steuerart oder welches Bilanzthema geht es?",
      "Geht es um einen allgemeinen Überblick oder einen konkreten Fall?",
      "Welche Beträge und Zeiträume liegen vor?",
    ],
    nextStep: "Sachverhalt kurz ergänzen oder die Wissensdatenbank durchsuchen.",
    links: [
      { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      { label: "Neue Anfrage öffnen", to: "/neue-anfrage" },
    ],
  };
}

export const REVIEW_HINT = REVIEW;
