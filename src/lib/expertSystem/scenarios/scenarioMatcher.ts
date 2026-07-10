// Ebene 6 — Scenario Matcher. Wählt Sachverhaltsart pro Steuerart aus.

import type { FiredSignal } from "../signals/signalTypes";

export interface ScenarioMatch {
  scenario: string | null;
  subScenario: string | null;
  score: number;
}

export function matchScenario(signals: FiredSignal[]): ScenarioMatch {
  const agg: Record<string, number> = {};
  for (const s of signals) {
    if (!s.scenarioScores) continue;
    for (const [k, v] of Object.entries(s.scenarioScores)) {
      agg[k] = (agg[k] ?? 0) + v;
    }
  }
  const ordered = Object.entries(agg).sort((a, b) => b[1] - a[1]);
  if (ordered.length === 0) return { scenario: null, subScenario: null, score: 0 };
  const [scen, sc] = ordered[0];
  // Sub-Scenario Konvention: scenario "commutingAllowance" ist zugleich subScenario.
  return { scenario: scen, subScenario: scen, score: sc };
}
