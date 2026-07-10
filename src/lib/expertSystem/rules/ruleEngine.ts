import type { TaxType } from "@/lib/router/taxTypes";
import type { Facts } from "../facts/factModel";
import type { FiredSignal } from "../signals/signalTypes";
import { INCOME_TAX_RULES } from "./incomeTaxRules";
import { BALANCE_SHEET_RULES } from "./balanceSheetRules";
import type { RuleContext, RuleDef, RuleResult } from "./ruleTypes";

const RULES_BY_TAX: Partial<Record<TaxType, RuleDef[]>> = {
  einkommensteuer: INCOME_TAX_RULES,
  bilanzsteuerrecht: BALANCE_SHEET_RULES,
};

export function runRules(
  taxType: TaxType,
  facts: Facts,
  signals: FiredSignal[],
  scenario: string | null,
  subScenario: string | null,
): RuleResult | null {
  const rules = RULES_BY_TAX[taxType];
  if (!rules) return null;
  const ctx: RuleContext = { facts, signals, scenario, subScenario };
  const matches = rules.filter((r) => r.matches(ctx));
  if (matches.length === 0) return null;
  matches.sort((a, b) => b.priority - a.priority);
  return matches[0].apply(ctx);
}
