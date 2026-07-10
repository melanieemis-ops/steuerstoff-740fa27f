// Gemeinsame Typen für das 5-Ebenen-Expertensystem.
// Alle Ebenen (Parser → Signals → Router → RuleEngine → Knowledge) arbeiten
// auf diesen Typen und bleiben rein funktional.

import type { ScenarioType, KBEntry } from "../knowledgeBase";
import type { TaxType } from "../router/taxTypes";

export type { TaxType, ScenarioType };

/** Ebene 1 — strukturierte Fakten aus dem Prompt. Keine Wertung. */
export interface Facts {
  raw: { text: string; lower: string };
  entities: {
    unternehmerDE?: boolean;
    unternehmerEU?: boolean;
    unternehmerDrittland?: boolean;
    arbeitnehmer?: boolean;
    verein?: boolean;
    stiftung?: boolean;
    gesellschafter?: boolean;
    finanzamt?: boolean;
    privatperson?: boolean;
  };
  orte: {
    ausDE?: boolean;
    nachDE?: boolean;
    ausEU?: boolean;
    nachEU?: boolean;
    ausDrittland?: boolean;
    nachDrittland?: boolean;
    flow?: Array<{ from?: string; to?: string; fromKind?: "DE" | "EU" | "DL"; toKind?: "DE" | "EU" | "DL" }>;
  };
  zeit: { vz?: number; jahr?: number; stichtag?: string };
  betraege: {
    entgelt?: number;
    kaufpreis?: number;
    lohn?: number;
    gewinn?: number;
    umsatz?: number;
    ak?: number;
  };
  steuerFakten: {
    rechnung?: boolean;
    ustId?: boolean;
    warenbewegung?: boolean;
    lieferung?: boolean;
    dienstleistung?: boolean;
    grundstueck?: boolean;
    schenkung?: boolean;
    erbfall?: boolean;
    veraeusserung?: boolean;
    vermietung?: boolean;
    arbeitsverhaeltnis?: boolean;
    bilanzierung?: boolean;
    spende?: boolean;
    betriebsvermoegen?: boolean;
    privatvermoegen?: boolean;
    werklieferung?: boolean;
    werkleistung?: boolean;
    reverseCharge?: boolean;
    einspruch?: boolean;
    afa?: boolean;
    rueckstellung?: boolean;
  };
}

/** Ebene 2 — Signal-Definition. */
export interface SignalDef {
  id: string;
  description: string;
  requires: (f: Facts) => boolean;
  excludes?: (f: Facts) => boolean;
  /** Gewicht je Steuerart. Fehlende Steuerarten = 0. */
  weight: Partial<Record<TaxType, number>>;
  scenarios?: ScenarioType[];
  subCases?: string[];
}

export interface FiredSignal {
  id: string;
  description: string;
  weight: Partial<Record<TaxType, number>>;
  scenarios?: ScenarioType[];
  subCases?: string[];
}

/** Ebene 3 — Ergebnis des Steuerart-Routers. */
export interface RouteDecision {
  primary: TaxType;
  secondary: TaxType[];
  scores: Record<string, number>;
  reasons: string[];
}

/** Ebene 4 — Ergebnis einer Rule-Datei. */
export interface RuleResult {
  taxType: TaxType;
  scenario?: ScenarioType | null;
  subCase?: string | null;
  schemaId?: string;
  schemaSteps: Array<{ id: string; label: string; result?: string }>;
  normen: string[];
  berechnung?: string;
  ergebnis?: string;
  alternativen?: string[];
  missingFacts?: string[];
}

export interface RuleFile {
  taxType: TaxType;
  scenarios: ScenarioType[];
  subScenarios?: string[];
  decide: (facts: Facts, signals: FiredSignal[]) => RuleResult;
  regressionCases?: Array<{ id: string; prompt: string; expectScenario?: ScenarioType; expectSubCase?: string }>;
}

/** Ebene 5 — KB-Zitat, gescoped auf (taxType, scenario, subCase). */
export interface KbCitation {
  entry: KBEntry;
  score: number;
}
