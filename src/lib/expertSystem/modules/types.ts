// Ebene 4b — Rule-Modul-Vertrag.
// Ein RuleModule ist selbsttragend: es liefert Trigger, Scoring-Beitrag,
// Decision Tree, Berechnungen (via ruleTypes.calculationId), KB-Filter,
// Follow-ups und eigene Regressionstests. Der Router iteriert automatisch
// über alle registrierten Module — er kennt keine Steuerarten fest.

import type { TaxType } from "@/lib/router/taxTypes";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

export interface RegressionTest {
  id: string;
  prompt: string;
  /** Diese Marker müssen in der gerenderten Antwort erscheinen. */
  expect?: string[];
  /** Erwartete Steuerart im Router-Ergebnis. */
  mustBeTaxType?: TaxType;
  /** Wenn true, DARF dieses Modul NICHT gewinnen. */
  mustNotWin?: boolean;
}

export interface RuleModule {
  taxType: TaxType;
  taxLabel: string;

  // ─── Scoring: Trigger-Gruppen (Regex auf Prompt.lower) ───
  weakTriggers: RegExp[];       // +1 je Treffer
  mediumTriggers: RegExp[];     // +3 je Treffer
  strongTriggers: RegExp[];     // +5 je Treffer
  exclusiveTriggers: RegExp[];  // +10 je Treffer (Kernbegriff der Steuerart)
  negativeTriggers: RegExp[];   // Ein Treffer → Modul komplett verworfen

  /** Ab welchem Score darf dieses Modul überhaupt gewinnen. */
  minimumScore: number;

  scenarioTypes: string[];
  followUpQuestions: string[];

  /** Welche KB-TaxTypes darf der Knowledge-Layer für diese Steuerart durchsuchen? */
  knowledgeFilter: (kbTaxType: TaxType) => boolean;

  /** Decision Tree — liefert das eigentliche RuleResult (mit schemaSteps). */
  decide: (ctx: RuleContext) => RuleResult | null;

  regressionTests: RegressionTest[];
}

export interface ModuleScore {
  module: RuleModule;
  score: number;
  hits: string[];
  vetoed: boolean;
}
