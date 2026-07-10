// Ebene 4 — Registry und Executor für Rule-Dateien.
//
// WICHTIG: Es gibt bewusst KEINE Platzhalter-Rule-Dateien.
// Steuerarten ohne echte, getestete Regel-Logik werden als
// "noch nicht unterstützt" markiert und laufen in den Fallback,
// der genau das ausweist — damit die Antwort nicht suggeriert,
// es gäbe ein geprüftes Regelwerk, wo keines ist.

import type { Facts, FiredSignal, RuleFile, RuleResult, TaxType } from "./types";
import { vatRules } from "./rules/vatRules";
import { incomeTaxRules } from "./rules/incomeTaxRules";
import { fallbackRule } from "./rules/fallbackRule";

/** Steuerarten mit echter, deterministischer Rule-Datei. */
export const RULE_REGISTRY: Partial<Record<TaxType, RuleFile>> = {
  umsatzsteuer: vatRules,
  einkommensteuer: incomeTaxRules,
};

/** Alles, was der Router erkennen kann, aber (noch) keine Rules hat. */
export const UNSUPPORTED_TAX_TYPES: TaxType[] = [
  "koerperschaftsteuer",
  "gewerbesteuer",
  "lohnsteuer",
  "bilanzsteuerrecht",
  "abgabenordnung",
  "gemeinnuetzigkeit",
  "erbschaftsteuer",
  "schenkungsteuer",
  "grunderwerbsteuer",
  "umwandlungssteuer",
  "internationales_steuerrecht",
  "sonstige",
];

export function isSupportedTaxType(taxType: TaxType): boolean {
  return Boolean(RULE_REGISTRY[taxType]);
}

export function runRules(taxType: TaxType, facts: Facts, signals: FiredSignal[]): RuleResult {
  const rule = RULE_REGISTRY[taxType];
  if (!rule) return fallbackRule(taxType, facts, signals);
  try {
    return rule.decide(facts, signals);
  } catch {
    return fallbackRule(taxType, facts, signals);
  }
}
