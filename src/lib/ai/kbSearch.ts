// Lokale Volltext-/Keyword-Suche über die interne steuerstoff-Wissensbasis.
// Ziel: Für jede Nutzeranfrage die 6–10 relevantesten KB-Einträge liefern,
// damit sie serverseitig als Kontext an das KI-Modell übergeben werden
// können. Es gibt bewusst KEINEN Vektorstore/API-Aufruf – alles lokal.

import {
  KNOWLEDGE_BASE,
  getKbBody,
  getKbKeywords,
  getKbShort,
  getKbTitle,
  kbKeywordsToRegExp,
  type KBEntry,
} from "@/lib/knowledgeBase";
import type { UILanguage } from "@/lib/language";

import { INTERNAL_KNOWLEDGE_BASE } from "@/lib/expertSystem/internalKnowledge";

export type KbHit = {
  id: string;
  title: string;
  reference: string | null;
  excerpt: string;
  score: number;
};

const STOPWORDS = new Set([
  "der","die","das","und","oder","aber","ist","sind","war","waren","wird","werden",
  "ein","eine","einer","eines","einem","einen","dem","den","des","auf","für","von",
  "mit","zu","zum","zur","im","in","am","an","als","wie","wenn","dann","es","so",
  "auch","nicht","nur","noch","schon","bei","bis","um","über","unter","vor","nach",
  "durch","aus","was","wer","wo","wann","warum","welche","welcher","welches",
  "ich","du","er","sie","wir","ihr","mich","mir","dir","uns","euch","kann","muss",
  "soll","dürfen","darf","hat","habe","haben","sein","seine","seinem","seiner",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zäöüß0-9§\s.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function referenceOf(e: KBEntry): string | null {
  if (Array.isArray(e.references) && e.references.length > 0) return e.references.join("; ");
  if (e.paragraph && e.law) return `${e.paragraph} ${e.law}`;
  if (e.paragraph) return String(e.paragraph);
  if (e.law) return String(e.law);
  return null;
}

function excerptOf(e: KBEntry, language: UILanguage, maxChars = 900): string {
  const body = getKbBody(e, language).trim();
  const short = (getKbShort(e, language) ?? "").trim();
  const base = body || short;
  const cleaned = base.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars).replace(/\s+\S*$/, "") + " …";
}

function scoreEntry(
  e: KBEntry,
  tokens: string[],
  rawLower: string,
  language: UILanguage,
): number {
  if (tokens.length === 0) return 0;
  let score = 0;
  const title = getKbTitle(e, language);
  const short = getKbShort(e, language) ?? "";
  const body = getKbBody(e, language);
  const fallbackHay =
    language === "en"
      ? `${e.title} ${e.short ?? ""} ${e.body ?? ""}`
      : "";
  const hay = `${title} ${short} ${body} ${fallbackHay} ${e.category ?? ""} ${e.id}`.toLowerCase();
  const titleHay = `${title} ${e.title} ${e.id}`.toLowerCase();

  // Keyword-Regex Treffer haben höchstes Gewicht.
  const keywords = getKbKeywords(e, language);
  if (keywords) {
    try {
      if (kbKeywordsToRegExp(keywords).test(rawLower)) score += 8;
    } catch { /* noop */ }
  }

  // Tokenweise Trefferzahl (mit Title-Bonus).
  let hits = 0;
  for (const t of tokens) {
    if (hay.includes(t)) {
      hits += 1;
      if (titleHay.includes(t)) score += 2;
      else score += 1;
    }
  }
  // Deckungsgrad-Bonus
  score += Math.min(3, Math.round((hits / tokens.length) * 3));

  // Paragraphen-Erkennung: "§ 15", "13b", "1 abs. 1"
  const paras = rawLower.match(/§\s*\d+[a-z]?/g) ?? [];
  for (const p of paras) {
    if (hay.includes(p.replace(/\s+/g, " "))) score += 4;
  }
  return score;
}

/** Findet 6–10 relevante KB-Einträge für die Anfrage. */
export function searchKb(
  query: string,
  language: UILanguage = "de",
  min = 6,
  max = 10,
): KbHit[] {
  const rawLower = query.toLowerCase();
  const tokens = Array.from(new Set(tokenize(query)));

  const all: KBEntry[] = [
    ...KNOWLEDGE_BASE,
    ...INTERNAL_KNOWLEDGE_BASE,
  ];

  const scored = all
    .map((e) => ({ entry: e, score: scoreEntry(e, tokens, rawLower, language) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const cutoff = Math.max(min, Math.min(max, scored.length));
  const top = scored.slice(0, cutoff);

  // Wenn zu wenige echte Treffer, mit besten (auch schwachen) auffüllen bis min – aber niemals unter Score 0.
  return top.map(({ entry, score }) => ({
    id: entry.id,
    title: getKbTitle(entry, language),
    reference: referenceOf(entry),
    excerpt: excerptOf(entry, language),
    score,
  }));
}

/** Formatiert die Treffer als kompakten, modellfreundlichen Kontextblock. */
export function formatKbContext(hits: KbHit[]): string {
  if (hits.length === 0) return "";
  const parts = hits.map((h, i) => {
    const head = `[${i + 1}] ${h.title}${h.reference ? ` — ${h.reference}` : ""} (id: ${h.id})`;
    return `${head}\n${h.excerpt}`;
  });
  return parts.join("\n\n---\n\n");
}
