// Ebene 4 — Registry und Executor für Rule-Dateien.

import type { Facts, FiredSignal, RuleFile, RuleResult, TaxType } from "./types";
import { vatRules } from "./rules/vatRules";
import { incomeTaxRules } from "./rules/incomeTaxRules";
import { corporateTaxRules } from "./rules/corporateTaxRules";
import { tradeTaxRules } from "./rules/tradeTaxRules";
import { payrollTaxRules } from "./rules/payrollTaxRules";
import { balanceSheetRules } from "./rules/balanceSheetRules";
import { aoRules } from "./rules/aoRules";
import { nonprofitRules } from "./rules/nonprofitRules";
import { inheritanceTaxRules } from "./rules/inheritanceTaxRules";
import { giftTaxRules } from "./rules/giftTaxRules";
import { realEstateTransferTaxRules } from "./rules/realEstateTransferTaxRules";
import { internationalTaxRules } from "./rules/internationalTaxRules";
import { reorganizationTaxRules } from "./rules/reorganizationTaxRules";
import { fallbackRule } from "./rules/fallbackRule";

export const RULE_REGISTRY: Partial<Record<TaxType, RuleFile>> = {
  umsatzsteuer: vatRules,
  einkommensteuer: incomeTaxRules,
  koerperschaftsteuer: corporateTaxRules,
  gewerbesteuer: tradeTaxRules,
  lohnsteuer: payrollTaxRules,
  bilanzsteuerrecht: balanceSheetRules,
  abgabenordnung: aoRules,
  gemeinnuetzigkeit: nonprofitRules,
  erbschaftsteuer: inheritanceTaxRules,
  schenkungsteuer: giftTaxRules,
  grunderwerbsteuer: realEstateTransferTaxRules,
  internationales_steuerrecht: internationalTaxRules,
  umwandlungssteuer: reorganizationTaxRules,
};

export function runRules(taxType: TaxType, facts: Facts, signals: FiredSignal[]): RuleResult {
  const rule = RULE_REGISTRY[taxType];
  if (!rule) return fallbackRule(taxType, facts, signals);
  try {
    return rule.decide(facts, signals);
  } catch {
    return fallbackRule(taxType, facts, signals);
  }
}
