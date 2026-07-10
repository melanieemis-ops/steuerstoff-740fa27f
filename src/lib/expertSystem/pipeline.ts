// Orchestrator (data-driven): Input → Parser → Facts → Signals →
// scoreModules(ALL_MODULES) → bestModule.decide() → Calculation →
// Knowledge (nur bestModule.taxType) → Answer.
// Der Router kennt keine Steuerart namentlich — er iteriert nur.

import { parse } from "./parser/parser";
import { evaluateSignals } from "./signals/signalEngine";
import { matchScenario } from "./scenarios/scenarioMatcher";
import { runCalculation, type CalculationOutput } from "./calculations/calculationEngine";
import { findDeepDive } from "./internalKnowledge/knowledgeEngine";
import { buildAnswer, type BuiltAnswer } from "./answer/answerBuilder";
import { ALL_MODULES } from "./modules/registry";
import { scoreModules, pickBest } from "./modules/scoring";
import type { ModuleScore } from "./modules/types";
import type { RuleContext, RuleResult } from "./rules/ruleTypes";
import type { Facts } from "./facts/factModel";
import type { FiredSignal } from "./signals/signalTypes";
import type { TaxRoute } from "./router/taxRouter";
import { buildTrace, type ExpertTrace } from "./trace/expertTrace";

export const EXPERT_OVERRIDE_THRESHOLD = 0.9;

export interface ExpertResult {
  answer: BuiltAnswer | null;
  trace: ExpertTrace & { moduleScores?: { taxType: string; score: number }[] };
  knowledge?: string;
}

function synthTrace(
  facts: Facts,
  signals: FiredSignal[],
  scoresView: { taxType: string; score: number }[],
  best: ModuleScore | null,
  scenario: string | null,
  subScenario: string | null,
  rule: RuleResult | null,
) {
  const primary = best?.module.taxType ?? "unklar";
  const route: TaxRoute = {
    primary,
    confidence: best ? Math.min(1, best.score / 20) : 0,
    secondary: [],
    scores: Object.fromEntries(scoresView.map((s) => [s.taxType, s.score])) as TaxRoute["scores"],
    supportingSignals: best?.hits ?? [],
  };
  return {
    ...buildTrace(facts, signals, route, scenario, subScenario, rule),
    moduleScores: scoresView,
  };
}

export function runExpertSystem(prompt: string): ExpertResult {
  const facts = parse(prompt);
  const signals = evaluateSignals(facts);
  const scored = scoreModules(ALL_MODULES, facts);
  const scoresView = scored.map((s) => ({ taxType: s.module.taxType, score: s.score }));
  const best = pickBest(scored);

  if (!best) {
    return { answer: null, trace: synthTrace(facts, signals, scoresView, null, null, null, null) };
  }

  const { scenario, subScenario } = matchScenario(signals);
  const ctx: RuleContext = { facts, signals, scenario, subScenario };
  const rule = best.module.decide(ctx);
  if (!rule) {
    return { answer: null, trace: synthTrace(facts, signals, scoresView, best, scenario, subScenario, null) };
  }

  let calc: CalculationOutput | null = null;
  if (rule.calculationId) calc = runCalculation(rule.calculationId, facts);

  const answer = buildAnswer(rule, calc);
  // Knowledge Base — strikt auf den erkannten TaxType gefiltert.
  const knowledge = best.module.knowledgeFilter(rule.taxType)
    ? findDeepDive(rule.taxType, rule.scenario, rule.subScenario, prompt)
    : undefined;

  return {
    answer,
    trace: synthTrace(facts, signals, scoresView, best, rule.scenario, rule.subScenario, rule),
    knowledge,
  };
}

export { ALL_MODULES };
