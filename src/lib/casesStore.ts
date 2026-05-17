import { analyze, type Analysis, type AnalysisInput } from "./analyze";

export interface CaseRecord {
  id: string;
  title: string;
  topic: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  analysis: Analysis;
}

const KEY = "steuerstoff.cases.v1";

function read(): CaseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CaseRecord[];
  } catch {
    return [];
  }
}

function write(cases: CaseRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cases));
  window.dispatchEvent(new Event("steuerstoff:cases"));
}

const DEMO: AnalysisInput[] = [
  {
    title: "Bewirtungsbeleg Geschäftsessen 03/2025",
    topic: "USt",
    description:
      "Restaurantrechnung über 184,50 € brutto vom 14.03.2025. Auf dem Beleg fehlen die Teilnehmerangaben sowie der konkrete Anlass. Vorsteuerabzug und 70-%-Regel sollen geprüft werden.",
  },
  {
    title: "Mittelverwendungsrechnung Verein 2024",
    topic: "NPO",
    description:
      "Gemeinnütziger Verein mit Zweckbetrieb (Bildungsangebote) und kleinem wirtschaftlichen Geschäftsbetrieb (Cafeteria). Bildung einer freien Rücklage nach § 62 Abs. 1 Nr. 3 AO geplant. Mittelverwendungsfrist zu prüfen.",
  },
  {
    title: "ARAP Hostingkosten 2025",
    topic: "Abgrenzung",
    description:
      "Rechnung über 1.200 € netto für Hostingleistungen mit Leistungszeitraum 01.10.2024 – 30.09.2025. Periodengerechte Abgrenzung zum Bilanzstichtag 31.12.2024 erforderlich.",
  },
  {
    title: "Reverse-Charge IT-Dienstleistung Irland",
    topic: "USt",
    description:
      "Rechnung eines irischen Cloud-Anbieters über 4.500 € netto ohne USt-Ausweis. Hinweis auf Reverse-Charge nach § 13b UStG. Verbuchung und Anmeldung in der USt-Voranmeldung klären.",
  },
];

function seedIfEmpty(): CaseRecord[] {
  const existing = read();
  if (existing.length > 0) return existing;
  const now = Date.now();
  const seeded: CaseRecord[] = DEMO.map((d, i) => ({
    id: `demo-${i + 1}`,
    title: d.title,
    topic: d.topic,
    description: d.description,
    createdAt: now - (i + 1) * 86_400_000,
    updatedAt: now - (i + 1) * 86_400_000,
    analysis: analyze(d),
  }));
  write(seeded);
  return seeded;
}

export function listCases(): CaseRecord[] {
  return seedIfEmpty().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getCase(id: string): CaseRecord | undefined {
  return listCases().find((c) => c.id === id);
}

export function createCase(input: AnalysisInput): CaseRecord {
  const cases = listCases();
  const now = Date.now();
  const rec: CaseRecord = {
    id: `case-${now}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    topic: input.topic,
    description: input.description,
    createdAt: now,
    updatedAt: now,
    analysis: analyze(input),
  };
  write([rec, ...cases]);
  return rec;
}

export function deleteCase(id: string) {
  write(listCases().filter((c) => c.id !== id));
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.round(h / 24);
  if (d === 1) return "gestern";
  if (d < 7) return `vor ${d} Tagen`;
  const w = Math.round(d / 7);
  if (w < 5) return `vor ${w} Wochen`;
  return new Date(ts).toLocaleDateString("de-DE");
}
