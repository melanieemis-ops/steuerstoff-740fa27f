// Hilfsfunktion: Wählt aus einem RuleDef-Array das Rule-Objekt mit dem
// höchsten Priority, dessen matches(ctx) zutrifft. Wird von Modulen genutzt,
// die klassische Rule-Arrays (INCOME_TAX_RULES etc.) kapseln.

import type { RuleContext, RuleDef, RuleResult } from "../rules/ruleTypes";

export function runFirstMatchingRule(rules: RuleDef[], ctx: RuleContext): RuleResult | null {
  const matches = rules.filter((r) => r.matches(ctx)).sort((a, b) => b.priority - a.priority);
  return matches[0]?.apply(ctx) ?? null;
}
