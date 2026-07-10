import type { TaxType } from "@/lib/router/taxTypes";
import type { Facts } from "../facts/factModel";
import type { FiredSignal } from "../signals/signalTypes";

export interface RuleContext {
  facts: Facts;
  signals: FiredSignal[];
  scenario: string | null;
  subScenario: string | null;
}

export interface RuleResult {
  taxType: TaxType;
  scenario: string | null;
  subScenario: string | null;
  legalRefs: string[];
  confidence: number;
  /** Kalibrierte Ausgabe für den Answer Builder. */
  calculationId?: string;
  headline: string;
  narrative: string;
  missingFacts?: string[];
  schemaSteps?: { id: string; label: string; result?: string }[];
}

export interface RuleDef {
  id: string;
  taxType: TaxType;
  priority: number;
  matches: (ctx: RuleContext) => boolean;
  apply: (ctx: RuleContext) => RuleResult;
}
