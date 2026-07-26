// Lokale Volltext-/Keyword-Suche über die interne steuerstoff-Wissensbasis.
// Ziel: Für jede Nutzeranfrage die 6–10 relevantesten KB-Einträge liefern,
// damit sie serverseitig als Kontext an das KI-Modell übergeben werden
// können. Es gibt bewusst KEINEN Vektorstore/API-Aufruf – alles lokal.

import "@/lib/knowledgeBaseExtensions/abschreibung-afa-wertminderungen-hgb-estg-ifrs";
import "@/lib/knowledgeBaseExtensions/abschreibung-sonderabschreibungen-7a-7b-7g-estg";
import "@/lib/knowledgeBaseExtensions/abschreibung-umlaufvermoegen-niederstwertprinzip";
import "@/lib/knowledgeBaseExtensions/aufbewahrungspflichten-ao";
import "@/lib/knowledgeBaseExtensions/ao-schaetzung-besteuerungsgrundlagen-verfahrensrecht";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aufmerksamkeiten";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-auslandsaufenthalt";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-betriebspruefung";
import "@/lib/knowledgeBaseExtensions/sozialversicherungspflicht-lehrkraefte-uebergangsregelung-2027";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-minijob-widerruf-rentenversicherungsbefreiung-ab-juli-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-entfernungspauschale-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-kinderbetreuungskosten-getrennte-eltern-haushaltszugehoerigkeit";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-vorsorgepauschale-ab-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-grundstueckseigentuemer-update-2025-2026-paragraf-21";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-haeusliches-arbeitszimmer-betriebsvermoegen-taetigkeitsaufgabe-grundstuecksveraeusserung";
import "@/lib/knowledgeBaseExtensions/personengesellschaften-sonderbetriebsvermoegen-beispiele";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-vorsteuerabzug-verspaetete-rechnung-eug-2026";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-anzahlungen-vorauszahlungen";
import "@/lib/knowledgeBaseExtensions/kfz-dienstwagen-1-prozent";
import "@/lib/knowledgeBaseExtensions/eigenverbrauch-unentgeltliche-wertabgaben-lieferungen";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohnsteuerbescheinigung-erstellung-korrektur-inhalt";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-faelligkeit-lohnsteuer-sozialversicherungsbeitraege";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-gesetzliche-erbfolge";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-familienheim-eigennutzung-rueckforderungsrechte";
import "@/lib/knowledgeBaseExtensions/grunderwerbsteuer-aktuelle-entwicklung-2026-rechtsprechung";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-gewerblicher-grundstueckshandel";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-hgb-ueberblick";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-geleistete-erhaltene-anzahlungen";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-immaterielle-vermoegensgegenstaende-auftragsforschung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohn-und-gehaltsabrechnung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aussenpruefung";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-festsetzungsverjaehrung";
import { KNOWLEDGE_BASE, kbKeywordsToRegExp, type KBEntry } from "@/lib/knowledgeBase";

import { INTERNAL_KNOWLEDGE_BASE } from "@/lib/expertSystem/internalKnowledge";

export type KbHit = {
  id: string;
  title: string;
  reference: string | null;
  excerpt: string;
  score: number;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

function tokens(query: string): string[] {
  return Array.from(
    new Set(
      normalize(query)
        .replace(/[^a-z0-9§\s-]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length >= 2),
    ),
  );
}

function scoreEntry(entry: KBEntry, queryTokens: string[], rawQuery: string): number {
  const title = normalize(entry.title ?? "");
  const short = normalize(entry.short ?? "");
  const body = normalize(entry.body ?? "");
  const category = normalize(String(entry.category ?? ""));
  const keywords = normalize(entry.keywords ?? "");
  const references = normalize(entry.references?.join(" ") ?? "");
  let score = 0;

  for (const token of queryTokens) {
    if (title.includes(token)) score += 8;
    else if (category.includes(token)) score += 6;
    else if (keywords.includes(token)) score += 5;
    else if (short.includes(token)) score += 3;
    else if (references.includes(token)) score += 3;
    else if (body.includes(token)) score += 1;
  }

  if (entry.keywords) {
    try {
      if (kbKeywordsToRegExp(entry.keywords).test(rawQuery.toLowerCase())) score += 7;
    } catch {
      // Ungültige historische Keyword-Muster dürfen die Suche nicht blockieren.
    }
  }

  score += Math.min(entry.importance ?? 0, 5);
  return score;
}

export function searchKb(query: string, minHits = 6, maxHits = 10): KbHit[] {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];

  const all = [...KNOWLEDGE_BASE, ...INTERNAL_KNOWLEDGE_BASE];
  const scored = all
    .map((entry) => ({ entry, score: scoreEntry(entry, queryTokens, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];
  const best = scored[0]?.score ?? 0;
  const dynamicThreshold = Math.max(2, Math.floor(best * 0.28));
  const selected = scored
    .filter(({ score }, index) => index < minHits || score >= dynamicThreshold)
    .slice(0, maxHits);

  return selected.map(({ entry, score }) => ({
    id: entry.id,
    title: entry.title,
    reference: entry.references?.join(", ") ?? null,
    excerpt: entry.short || entry.body.slice(0, 500),
    score,
  }));
}

export function formatKbContext(hits: KbHit[]): string {
  return hits
    .map(
      (hit, index) =>
        `[${index + 1}] ${hit.title}${hit.reference ? `\nFundstellen: ${hit.reference}` : ""}\n${hit.excerpt}`,
    )
    .join("\n\n");
}
