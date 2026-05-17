// Zentrale Wissensthemen für die Hero-Chips. Bottom-Sheet liest aus dieser
// Datei. Eigene Handouts kommen per localStorage dazu (siehe handoutsStore).

export type TopicId = "ust" | "npo" | "skr42" | "datev" | "rueckfragen" | "review";

export interface QuickAction {
  label: string;
  to: string;
}

export interface KnowledgeTopic {
  id: TopicId;
  /** Wird im Chip angezeigt */
  chip: string;
  title: string;
  subtitle: string;
  summary: string;
  checklist: string[];
  quickActions: QuickAction[];
  /** Verweis auf Modul-Routen */
  module: { label: string; to: string } | null;
  /** Filter für Handouts (Kategorie-Werte) */
  handoutCategory: HandoutCategory;
  /** Optionale Beispiel-Handouts (read-only) */
  builtInHandouts?: { title: string; desc: string; tags?: string[] }[];
}

export type HandoutCategory =
  | "USt"
  | "NPO"
  | "SKR42"
  | "DATEV"
  | "Rückfragen"
  | "Review"
  | "Mittelverwendung"
  | "Sonstiges";

export const HANDOUT_CATEGORIES: HandoutCategory[] = [
  "USt",
  "NPO",
  "SKR42",
  "DATEV",
  "Rückfragen",
  "Review",
  "Mittelverwendung",
  "Sonstiges",
];

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: "ust",
    chip: "USt",
    title: "Umsatzsteuer",
    subtitle: "Steuerbarkeit, Befreiung, Satz, Vorsteuer",
    summary:
      "Steuerbarkeit, Steuerbefreiung, Steuersatz, Vorsteuerabzug und Sonderfälle strukturiert prüfen.",
    checklist: [
      "Steuerbarer Umsatz?",
      "Steuerfrei oder steuerpflichtig?",
      "7 % oder 19 %?",
      "Reverse Charge?",
      "Innergemeinschaftlicher Erwerb?",
      "Vorsteuerabzug möglich?",
      "Ordnungsgemäße Rechnung vorhanden?",
    ],
    quickActions: [
      { label: "USt-Fall prüfen", to: "/neue-anfrage" },
      { label: "Rückfrage formulieren", to: "/chat" },
      { label: "Buchungsvorschlag erstellen", to: "/neue-anfrage" },
    ],
    module: { label: "Neue Anfrage starten", to: "/neue-anfrage" },
    handoutCategory: "USt",
  },
  {
    id: "npo",
    chip: "NPO",
    title: "NPO / Gemeinnützigkeit",
    subtitle: "Sphären, Zweckbetrieb, Mittelverwendung",
    summary:
      "Sphären, Zweckbetrieb, Spenden, Zuschüsse, Mittelverwendung und gemeinnützigkeitsrechtliche Risiken prüfen.",
    checklist: [
      "Ideeller Bereich?",
      "Zweckbetrieb?",
      "Vermögensverwaltung?",
      "Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb?",
      "Spendenbescheinigung möglich?",
      "Mittelverwendung betroffen?",
      "Satzungszweck erfüllt?",
    ],
    quickActions: [
      { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
      { label: "Sphäre prüfen", to: "/npo-pruefassistent" },
      { label: "Mittelverwendung berechnen", to: "/mittelverwendungsrechner" },
    ],
    module: { label: "NPO-Prüfassistent", to: "/npo-pruefassistent" },
    handoutCategory: "NPO",
  },
  {
    id: "skr42",
    chip: "SKR42",
    title: "SKR42",
    subtitle: "NPO-Kontenrahmen & Mapping",
    summary:
      "NPO-Kontenrahmen, Sphärenzuordnung, SKR03-Umwandlung und DATEV-Buchungslogik.",
    checklist: [
      "Passende Sphäre?",
      "Richtiges SKR42-Konto?",
      "SKR03 → SKR42 Mapping?",
      "USt-Logik?",
      "Belegfluss?",
      "Individueller Kontenrahmen berücksichtigt?",
    ],
    quickActions: [
      { label: "SKR-Konverter öffnen", to: "/skr-konverter" },
      { label: "Konto suchen", to: "/skr-konverter" },
      { label: "Buchungstext analysieren", to: "/skr-konverter" },
    ],
    module: { label: "SKR-Konverter", to: "/skr-konverter" },
    handoutCategory: "SKR42",
  },
  {
    id: "datev",
    chip: "DATEV",
    title: "DATEV",
    subtitle: "Buchungslogik, Konten, OPOS, SuSa",
    summary:
      "Buchungslogiken, Konten, Belegprüfung, OPOS, SuSa und Kanzlei-Standards.",
    checklist: [
      "Konto / Gegenkonto",
      "BU-Schlüssel",
      "Steuerschlüssel",
      "Belegdatum / Leistungsdatum",
      "OPOS-Relevanz",
      "Kostenstelle / Sphäre",
      "Abstimmung mit SuSa",
      "Individueller Kontenrahmen",
    ],
    quickActions: [
      { label: "Buchungsvorschlag erstellen", to: "/neue-anfrage" },
      { label: "SKR-Konverter öffnen", to: "/skr-konverter" },
      { label: "DATEV-Handouts anzeigen", to: "/wissensdatenbank" },
    ],
    module: { label: "Wissensdatenbank", to: "/wissensdatenbank" },
    handoutCategory: "DATEV",
    builtInHandouts: [
      {
        title: "DATEV-Buchungslogik",
        desc: "Konto, Gegenkonto, BU-Schlüssel, Steuerschlüssel – Grundlagen.",
        tags: ["Buchung", "BU-Schlüssel"],
      },
      {
        title: "SKR42-Kontenrahmen",
        desc: "NPO-Kontenrahmen: Sphären, Konten, typische Sonderfälle.",
        tags: ["SKR42", "NPO"],
      },
      {
        title: "OPOS-Prüfung",
        desc: "Offene Posten Debitoren/Kreditoren strukturiert prüfen.",
        tags: ["OPOS"],
      },
      {
        title: "BU-Schlüssel / Steuerlogik",
        desc: "Wann welcher BU-Schlüssel, häufige Fehlerquellen.",
        tags: ["USt", "DATEV"],
      },
      {
        title: "Belegprüfung",
        desc: "Pflichtangaben, Eingangsrechnungen, Bewirtungsbelege.",
        tags: ["Belege"],
      },
    ],
  },
  {
    id: "rueckfragen",
    chip: "Rückfragen",
    title: "Rückfragen",
    subtitle: "Fehlende Angaben sauber klären",
    summary:
      "Fehlende Angaben erkennen und mandantenfreundliche Rückfragen formulieren.",
    checklist: [
      "Welche Angaben fehlen?",
      "Welche Belege fehlen?",
      "Welche steuerliche Einordnung ist unklar?",
      "Welche Frage muss an den Mandanten?",
      "Welche Rückfrage ist intern für Review relevant?",
    ],
    quickActions: [
      { label: "Rückfragebrief erstellen", to: "/neue-anfrage" },
      { label: "Mandantenantwort formulieren", to: "/chat" },
      { label: "Prüfnotiz erstellen", to: "/neue-anfrage" },
    ],
    module: { label: "Neue Anfrage starten", to: "/neue-anfrage" },
    handoutCategory: "Rückfragen",
  },
  {
    id: "review",
    chip: "Review",
    title: "Review",
    subtitle: "Risiken, Dokumentation, Steuerberater-Review",
    summary:
      "Offene Punkte, Risikostufen und Steuerberater-Review dokumentieren.",
    checklist: [
      "Risikostufe Grün / Gelb / Rot",
      "Steuerberater-Review erforderlich?",
      "Haftungsrelevanter Punkt?",
      "Offene Rückfragen?",
      "Belege vollständig?",
      "Dokumentation ausreichend?",
    ],
    quickActions: [
      { label: "Prüfnotiz erstellen", to: "/neue-anfrage" },
      { label: "Review-Liste öffnen", to: "/fallverlauf" },
      { label: "Export als Prüfnotiz", to: "/fallverlauf" },
    ],
    module: { label: "Fallverlauf öffnen", to: "/fallverlauf" },
    handoutCategory: "Review",
  },
];

export function getTopic(id: TopicId): KnowledgeTopic | undefined {
  return KNOWLEDGE_TOPICS.find((t) => t.id === id);
}

// ---------- Handouts (eigene, lokal gespeichert) ----------

export interface Handout {
  id: string;
  title: string;
  category: HandoutCategory;
  short: string;
  body: string;
  tags: string[];
  source: string;
  createdAt: number;
  updatedAt: number;
}

const HANDOUTS_KEY = "steuerstoff.handouts.v1";

export function listHandouts(): Handout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HANDOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHandouts(list: Handout[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HANDOUTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("steuerstoff:handouts"));
  } catch {
    // ignore
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function upsertHandout(h: Omit<Handout, "id" | "createdAt" | "updatedAt"> & { id?: string }): Handout {
  const list = listHandouts();
  const now = Date.now();
  if (h.id) {
    const idx = list.findIndex((x) => x.id === h.id);
    if (idx >= 0) {
      const updated: Handout = { ...list[idx], ...h, id: h.id, updatedAt: now };
      list[idx] = updated;
      saveHandouts(list);
      return updated;
    }
  }
  const created: Handout = {
    id: uid(),
    title: h.title,
    category: h.category,
    short: h.short,
    body: h.body,
    tags: h.tags,
    source: h.source,
    createdAt: now,
    updatedAt: now,
  };
  saveHandouts([created, ...list]);
  return created;
}

export function deleteHandout(id: string) {
  saveHandouts(listHandouts().filter((h) => h.id !== id));
}

export function handoutsForCategory(cat: HandoutCategory): Handout[] {
  return listHandouts().filter((h) => h.category === cat);
}
