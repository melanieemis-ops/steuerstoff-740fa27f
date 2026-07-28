// Lokale, fehlertolerante Suche über die interne steuerstoff-Wissensbasis.
// Sie funktioniert vollständig ohne externen KI-/Vektor-API-Aufruf und erkennt
// neben exakten Begriffen auch steuerliche Synonyme, Wortstämme, Paragraphen und
// typische umgangssprachliche Frageformulierungen.

import "@/lib/knowledgeBaseExtensions/abschreibung-afa-wertminderungen-hgb-estg-ifrs";
import "@/lib/knowledgeBaseExtensions/abschreibung-ausserplanmaessige-wertminderung-afaa";
import "@/lib/knowledgeBaseExtensions/abschreibung-sonderabschreibungen-7a-7b-7g-estg";
import "@/lib/knowledgeBaseExtensions/abschreibung-umlaufvermoegen-niederstwertprinzip";
import "@/lib/knowledgeBaseExtensions/aktuell-jahressteuergesetz-2026-referentenentwurf";
import "@/lib/knowledgeBaseExtensions/aufbewahrungspflichten-ao";
import "@/lib/knowledgeBaseExtensions/ao-betriebspruefung-mitwirkungspflichten-rechte-pruefer";
import "@/lib/knowledgeBaseExtensions/ao-schaetzung-besteuerungsgrundlagen-verfahrensrecht";
import "@/lib/knowledgeBaseExtensions/ao-schaetzungsbefugnis-betriebspruefung-kasse-methoden";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aufmerksamkeiten";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-auslandsaufenthalt";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-betriebspruefung";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-kuenstlersozialabgabe-2027";
import "@/lib/knowledgeBaseExtensions/sozialversicherungspflicht-lehrkraefte-uebergangsregelung-2027";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-minijob-widerruf-rentenversicherungsbefreiung-ab-juli-2026";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-pruefpflichten-steuerberater-geschaeftsfuehrer-status";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-unfallversicherung-homeoffice-mobiles-arbeiten-mittagspause-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-entfernungspauschale-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-kinderbetreuungskosten-getrennte-eltern-haushaltszugehoerigkeit";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-teilentgeltliche-grundstuecksuebertragung-23-estg";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-vorsorgepauschale-ab-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-grundstueckseigentuemer-update-2025-2026-paragraf-21";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-haeusliches-arbeitszimmer-betriebsvermoegen-taetigkeitsaufgabe-grundstuecksveraeusserung";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-bilanzierung-beteiligungen-idw-rs-fab-18";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-grundlagen-steuerliche-besonderheiten";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-sonderbetriebsvermoegen-beispiele";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-vorsteuerabzug-verspaetete-rechnung-eug-2026";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-anzahlungen-vorauszahlungen";
import "@/lib/knowledgeBaseExtensions/kfz-dienstwagen-1-prozent";
import "@/lib/knowledgeBaseExtensions/eigenverbrauch-unentgeltliche-wertabgaben-lieferungen";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohnsteuerbescheinigung-erstellung-korrektur-inhalt";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-faelligkeit-lohnsteuer-sozialversicherungsbeitraege";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-gesetzliche-erbfolge";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-familienheim-eigennutzung-rueckforderungsrechte";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-steuerstrafrechtliche-risiken-ehegatten";
import "@/lib/knowledgeBaseExtensions/gewerbesteuer-anrechnung-steuerermaessigung-35-estg";
import "@/lib/knowledgeBaseExtensions/gewerbesteuer-berechnung-rueckstellung";
import "@/lib/knowledgeBaseExtensions/gewerbesteuer-einheitlicher-gewerbebetrieb-hinzuerwerb-bfh-x-r-8-23";
import "@/lib/knowledgeBaseExtensions/grunderwerbsteuer-aktuelle-entwicklung-2026-rechtsprechung";
import "@/lib/knowledgeBaseExtensions/grunderwerbsteuer-nahe-angehoerige-sperrfrist-personengesellschaft";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-gewerblicher-grundstueckshandel";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-hgb-ueberblick";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-geleistete-erhaltene-anzahlungen";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-immaterielle-vermoegensgegenstaende-auftragsforschung";
import "@/lib/knowledgeBaseExtensions/koerperschaftsteuer-darlehen-betriebspruefung-8b-abs-3-kstg";
import "@/lib/knowledgeBaseExtensions/koerperschaftsteuer-gmbh-grundlagen-steuerliche-besonderheiten";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohn-und-gehaltsabrechnung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aussenpruefung";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-festsetzungsverjaehrung";
import "@/lib/knowledgeBaseExtensions/ertragsteuer-anschaffungsnaher-aufwand-6-abs-1-nr-1a-estg";
import "@/lib/knowledgeBaseExtensions/bilanzierung-grundlagen-steuerlicher-bilanzenzusammenhang";
import "@/lib/knowledgeBaseExtensions/npo-gemeinnuetzigkeit-bfh-demokratie-verfassungsschutz-zweckbetrieb-krankenhaus";
import { KNOWLEDGE_BASE, kbKeywordsToRegExp, type KBEntry } from "@/lib/knowledgeBase";
import { INTERNAL_KNOWLEDGE_BASE } from "@/lib/expertSystem/internalKnowledge";

export type KbHit = {
  id: string;
  title: string;
  reference: string | null;
  excerpt: string;
  score: number;
};

const STOPWORDS = new Set([
  "der", "die", "das", "und", "oder", "aber", "ist", "sind", "war", "waren", "wird", "werden",
  "ein", "eine", "einer", "eines", "einem", "einen", "dem", "den", "des", "auf", "für", "von",
  "mit", "zu", "zum", "zur", "im", "in", "am", "an", "als", "wie", "wenn", "dann", "es", "so",
  "auch", "nicht", "nur", "noch", "schon", "bei", "bis", "um", "über", "unter", "vor", "nach",
  "durch", "aus", "was", "wer", "wo", "wann", "warum", "welche", "welcher", "welches", "wieviel",
  "ich", "du", "er", "sie", "wir", "ihr", "mich", "mir", "dir", "uns", "euch", "kann", "muss",
  "soll", "dürfen", "darf", "hat", "habe", "haben", "sein", "seine", "seinem", "seiner", "bitte",
  "steuerlich", "steuerliche", "steuerlicher", "steuerlichen", "behandelt", "behandlung", "gilt",
]);

// Kleine, bewusst kuratierte steuerliche Begriffswelt. Jede Gruppe wird
// bidirektional erweitert: Eine Frage mit „Kredit“ findet damit auch einen
// KB-Eintrag, der nur „Darlehen“ oder „Forderung“ enthält.
const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ["darlehen", "kredit", "forderung", "gesellschafterdarlehen", "finanzierung"],
  ["abschreiben", "abschreibung", "wertminderung", "teilwertabschreibung", "ausfall", "verlust"],
  ["betriebsprüfung", "betriebspruefung", "außenprüfung", "aussenpruefung", "prüfung", "pruefung", "finanzamtprüfung"],
  ["gmbh", "kapitalgesellschaft", "körperschaft", "koerperschaft", "gesellschaft"],
  ["personengesellschaft", "kg", "ohg", "gbr", "mitunternehmerschaft"],
  ["umsatzsteuer", "ust", "mehrwertsteuer", "mwst"],
  ["vorsteuer", "vorsteuerabzug", "eingangssteuer"],
  ["einkommensteuer", "est", "estg"],
  ["körperschaftsteuer", "koerperschaftsteuer", "kst", "kstg"],
  ["gewerbesteuer", "gewst", "gewstg"],
  ["grunderwerbsteuer", "grest", "grestg"],
  ["erbschaftsteuer", "schenkungsteuer", "erbst", "erbstg", "schenkung"],
  ["lohnsteuer", "lohnabrechnung", "gehaltsabrechnung", "abrechnung"],
  ["sozialversicherung", "sv", "beiträge", "beitraege", "rentenversicherung", "krankenversicherung"],
  ["dienstwagen", "firmenwagen", "geschäftswagen", "geschaeftswagen", "kfz", "auto"],
  ["eigenverbrauch", "privatentnahme", "unentgeltliche wertabgabe", "wertabgabe"],
  ["anzahlung", "vorauszahlung", "abschlag", "abschlagszahlung"],
  ["arbeitszimmer", "homeoffice", "häusliches arbeitszimmer", "haeusliches arbeitszimmer"],
  ["grundstück", "grundstueck", "immobilie", "haus", "wohnung"],
  ["verkauf", "veräußerung", "veraeusserung", "übertragung", "uebertragung"],
  ["angehörige", "angehoerige", "familie", "ehegatte", "ehefrau", "ehemann", "kind", "eltern"],
  ["gemeinnützig", "gemeinnuetzig", "gemeinnützigkeit", "gemeinnuetzigkeit", "npo", "verein", "stiftung"],
  ["jahresabschluss", "bilanz", "abschluss", "bilanzierung"],
  ["rückstellung", "rueckstellung", "ungewisse verbindlichkeit"],
  ["verjährung", "verjaehrung", "festsetzungsverjährung", "festsetzungsverjaehrung", "fristablauf"],
  ["aufbewahrung", "aufbewahrungsfrist", "belege aufheben", "unterlagen aufbewahren"],
  ["schätzung", "schaetzung", "hinzuschätzung", "hinzuschaetzung", "kassenmangel"],
  ["kinderbetreuung", "kita", "kindergarten", "betreuungskosten"],
  ["entfernungspauschale", "pendlerpauschale", "arbeitsweg", "fahrt zur arbeit"],
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9§.\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(token: string): string {
  if (token.length <= 5 || token.startsWith("§")) return token;
  return token
    .replace(/(ungen|igkeit|keiten|licher|lichen|lichem|liche|lich|ern|erer|endes|ende|ung|en|er|es|e|n|s)$/i, "")
    .slice(0, Math.max(4, token.length));
}

function baseTokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

function expandTokens(text: string): string[] {
  const normalizedText = normalize(text);
  const source = new Set(baseTokens(text));
  const expanded = new Set<string>();

  for (const token of source) {
    expanded.add(token);
    const tokenStem = stem(token);
    if (tokenStem.length >= 4) expanded.add(tokenStem);
  }

  for (const group of SYNONYM_GROUPS) {
    const normalizedGroup = group.map(normalize);
    const matched = normalizedGroup.some((term) =>
      term.includes(" ")
        ? normalizedText.includes(term)
        : source.has(term) || normalizedText.split(" ").some((part) => stem(part) === stem(term)),
    );
    if (!matched) continue;
    for (const term of normalizedGroup) {
      for (const token of term.split(" ")) {
        if (token.length >= 3) {
          expanded.add(token);
          expanded.add(stem(token));
        }
      }
    }
  }

  return [...expanded].filter((token) => token.length >= 3);
}

function extractReferences(text: string): string[] {
  const normalized = normalize(text);
  const refs = new Set<string>();
  const pattern = /§\s*\d+[a-z]?(?:\s*abs\.?\s*\d+[a-z]?)?(?:\s*(?:s|satz)\.?\s*\d+)?(?:\s*nr\.?\s*\d+[a-z]?)?/g;
  for (const match of normalized.match(pattern) ?? []) {
    refs.add(match.replace(/\s+/g, " ").trim());
  }
  return [...refs];
}

function referenceOf(entry: KBEntry): string | null {
  if (Array.isArray(entry.references) && entry.references.length > 0) return entry.references.join("; ");
  if (entry.paragraph && entry.law) return `${entry.paragraph} ${entry.law}`;
  if (entry.paragraph) return String(entry.paragraph);
  if (entry.law) return String(entry.law);
  return null;
}

function excerptOf(entry: KBEntry, maxChars = 900): string {
  const body = (entry.body ?? "").trim();
  const short = (entry.short ?? "").trim();
  const cleaned = (body || short).replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars).replace(/\s+\S*$/, "") + " …";
}

function includesToken(haystack: string, token: string): boolean {
  if (haystack.includes(token)) return true;
  if (token.length < 5) return false;
  return haystack.split(" ").some((word) => word.length >= 4 && stem(word) === token);
}

function scoreEntry(entry: KBEntry, tokens: string[], rawQuery: string): number {
  if (tokens.length === 0) return 0;

  const rawNormalized = normalize(rawQuery);
  const title = normalize(`${entry.title} ${entry.id}`);
  const metadata = normalize(`${entry.category ?? ""} ${entry.law ?? ""} ${entry.paragraph ?? ""} ${referenceOf(entry) ?? ""}`);
  const body = normalize(`${entry.short ?? ""} ${entry.body ?? ""}`);
  const allText = `${title} ${metadata} ${body}`;
  let score = 0;
  let matchedTokens = 0;

  if (entry.keywords) {
    try {
      if (kbKeywordsToRegExp(entry.keywords).test(rawQuery.toLowerCase())) score += 12;
    } catch {
      // Ein fehlerhaftes optionales Keyword-Muster darf die lokale Suche nie blockieren.
    }
  }

  for (const token of tokens) {
    if (includesToken(title, token)) {
      score += 5;
      matchedTokens += 1;
    } else if (includesToken(metadata, token)) {
      score += 4;
      matchedTokens += 1;
    } else if (includesToken(body, token)) {
      score += 2;
      matchedTokens += 1;
    }
  }

  // Mehrwortphrasen aus der Frage sind besonders aussagekräftig.
  const important = baseTokens(rawQuery);
  for (let i = 0; i < important.length - 1; i += 1) {
    const phrase = `${important[i]} ${important[i + 1]}`;
    if (title.includes(phrase)) score += 7;
    else if (allText.includes(phrase)) score += 3;
  }

  const queryReferences = extractReferences(rawQuery);
  for (const reference of queryReferences) {
    if (allText.includes(reference)) score += 18;
    else {
      const paragraphOnly = reference.match(/§\s*\d+[a-z]?/)?.[0];
      if (paragraphOnly && allText.includes(paragraphOnly)) score += 8;
    }
  }

  const coverage = matchedTokens / Math.max(1, tokens.length);
  if (coverage >= 0.65) score += 8;
  else if (coverage >= 0.4) score += 4;
  else if (coverage < 0.15) score -= 3;

  // Ein einzelner sehr allgemeiner Treffer im langen Body soll keinen falschen
  // KB-Kontext erzeugen. Mindestens ein starker Treffer oder mehrere Treffer.
  const strongMatch = score >= 8 || matchedTokens >= 2 || queryReferences.length > 0;
  return strongMatch ? Math.max(0, score) : 0;
}

export function searchKb(query: string, min = 6, max = 10): KbHit[] {
  const tokens = expandTokens(query);
  if (tokens.length === 0) return [];

  const allEntries: KBEntry[] = [...KNOWLEDGE_BASE, ...INTERNAL_KNOWLEDGE_BASE];
  const scored = allEntries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens, query) }))
    .filter(({ score }) => score >= 6)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "de"));

  if (scored.length === 0) return [];

  const bestScore = scored[0].score;
  const confidenceFloor = Math.max(6, Math.floor(bestScore * 0.42));
  const confident = scored.filter(({ score }) => score >= confidenceFloor);

  // Bei schwacher/mehrdeutiger Suche lieber wenige belastbare Treffer liefern,
  // statt die Liste künstlich mit unpassenden Artikeln aufzufüllen.
  const desired = bestScore >= 20 ? Math.max(min, Math.min(max, confident.length)) : Math.min(4, confident.length);
  const top = confident.slice(0, Math.max(1, desired));

  return top.map(({ entry, score }) => ({
    id: entry.id,
    title: entry.title,
    reference: referenceOf(entry),
    excerpt: excerptOf(entry),
    score,
  }));
}

export function formatKbContext(hits: KbHit[]): string {
  if (hits.length === 0) return "";
  return hits
    .map((hit, index) => {
      const head = `[${index + 1}] ${hit.title}${hit.reference ? ` — ${hit.reference}` : ""} (id: ${hit.id}, Relevanz: ${hit.score})`;
      return `${head}\n${hit.excerpt}`;
    })
    .join("\n\n---\n\n");
}
