// Orchestrator: Input → Parser → Facts → Signals → TaxRouter →
// ScenarioMatcher → RuleEngine → CalculationEngine → KnowledgeEngine →
// AnswerBuilder. Trace über alle Ebenen.

import { parse } from "./parser/parser";
import { evaluateSignals } from "./signals/signalEngine";
import { routeTax } from "./router/taxRouter";
import { matchScenario } from "./scenarios/scenarioMatcher";
import { runRules } from "./rules/ruleEngine";
import { runCalculation, type CalculationOutput } from "./calculations/calculationEngine";
import { findDeepDive } from "./knowledge/knowledgeEngine";
import { buildAnswer, type BuiltAnswer } from "./answer/answerBuilder";
import { buildTrace, type ExpertTrace } from "./trace/expertTrace";

export interface ExpertResult {
  answer: BuiltAnswer | null;
  trace: ExpertTrace;
  knowledge?: string;
}

/** Mindest-Confidence, ab der die Expertensystem-Antwort die Legacy-Kette ersetzt. */
export const EXPERT_OVERRIDE_THRESHOLD = 0.9;

export function runExpertSystem(prompt: string): ExpertResult {
  const facts = parse(prompt);
  const signals = evaluateSignals(facts);
  const route = routeTax(signals);

  if (route.primary === "unklar") {
    return { answer: null, trace: buildTrace(facts, signals, route, null, null, null) };
  }

  const { scenario, subScenario } = matchScenario(signals);
  const rule = runRules(route.primary, facts, signals, scenario, subScenario);

  if (!rule) {
    return { answer: null, trace: buildTrace(facts, signals, route, scenario, subScenario, null) };
  }

  let calc: CalculationOutput | null = null;
  if (rule.calculationId) {
    calc = runCalculation(rule.calculationId, facts);
  }

  const answer = buildAnswer(rule, calc);
  const knowledge = findDeepDive(rule.taxType, rule.scenario, rule.subScenario, prompt);

  return {
    answer,
    trace: buildTrace(facts, signals, route, scenario, subScenario, rule),
    knowledge,
  };
}
