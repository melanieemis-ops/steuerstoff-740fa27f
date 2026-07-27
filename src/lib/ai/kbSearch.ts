// Lokale Volltext-/Keyword-Suche über die interne steuerstoff-Wissensbasis.
// Ziel: Für jede Nutzeranfrage die 6–10 relevantesten KB-Einträge liefern,
// damit sie serverseitig als Kontext an das KI-Modell übergeben werden
// können. Es gibt bewusst KEINEN Vektorstore/API-Aufruf – alles lokal.

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

function excerptOf(e: KBEntry, maxChars = 900): string {
  const body = (e.body ?? "").trim();
  const short = (e.short ?? "").trim();
  const base = body || short;
  const cleaned = base.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars).replace(/\s+\S*$/, "") + " …";
}

function scoreEntry(e: KBEntry, tokens: string[], rawLower: string): number {
  if (tokens.length === 0) return 0;
  let score = 0;
  const hay = `${e.title} ${e.short ?? ""} ${e.body ?? ""} ${e.category ?? ""} ${e.id}`.toLowerCase();
  const titleHay = `${e.title} ${e.id}`.toLowerCase();

  if (e.keywords) {
    try {
      if (kbKeywordsToRegExp(e.keywords).test(rawLower)) score += 8;
    } catch { /* noop */ }
  }

  let hits = 0;
  for (const t of tokens) {
    if (hay.includes(t)) {
      hits += 1;
      if (titleHay.includes(t)) score += 2;
      else score += 1;
    }
  }
  score += Math.min(3, Math.round((hits / tokens.length) * 3));

  const paras = rawLower.match(/§\s*\d+[a-z]?/g) ?? [];
  for (const p of paras) {
    if (hay.includes(p.replace(/\s+/g, " "))) score += 4;
  }
  return score;
}

export function searchKb(query: string, min = 6, max = 10): KbHit[] {
  const rawLower = query.toLowerCase();
  const tokens = Array.from(new Set(tokenize(query)));

  const all: KBEntry[] = [
    ...KNOWLEDGE_BASE,
    ...INTERNAL_KNOWLEDGE_BASE,
  ];

  const scored = all
    .map((e) => ({ entry: e, score: scoreEntry(e, tokens, rawLower) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const cutoff = Math.max(min, Math.min(max, scored.length));
  const top = scored.slice(0, cutoff);

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
  const parts = hits.map((h, i) => {
    const head = `[${i + 1}] ${h.title}${h.reference ? ` — ${h.reference}` : ""} (id: ${h.id})`;
    return `${head}\n${h.excerpt}`;
  });
  return parts.join("\n\n---\n\n");
}
