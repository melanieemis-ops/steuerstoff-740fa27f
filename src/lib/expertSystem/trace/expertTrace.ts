import type { Facts } from "../facts/factModel";
import type { TaxRoute } from "../router/taxRouter";
import type { FiredSignal } from "../signals/signalTypes";
import type { RuleResult } from "../rules/ruleTypes";

export interface ExpertTrace {
  parsedFacts: Partial<Facts>;
  firedSignals: string[];
  taxRoute: TaxRoute;
  scenario: string | null;
  subScenario: string | null;
  matchedRule?: string;
  ruleConfidence?: number;
  missingFacts?: string[];
}

export function buildTrace(
  facts: Facts,
  signals: FiredSignal[],
  route: TaxRoute,
  scenario: string | null,
  subScenario: string | null,
  rule?: RuleResult | null,
): ExpertTrace {
  // Facts kompakt: nur "true"-Werte + Zahlen mitschicken.
  const compact: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(facts)) {
    if (k === "raw") continue;
    if (v === true || typeof v === "number" || typeof v === "string") {
      compact[k] = v;
    }
  }
  return {
    parsedFacts: compact as Partial<Facts>,
    firedSignals: signals.map((s) => s.id),
    taxRoute: route,
    scenario,
    subScenario,
    matchedRule: rule?.taxType ? `${rule.taxType}:${rule.subScenario ?? rule.scenario ?? "-"}` : undefined,
    ruleConfidence: rule?.confidence,
    missingFacts: rule?.missingFacts,
  };
}
