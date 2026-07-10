import type { Facts } from "../facts/factModel";
import { isTrue } from "../facts/factModel";
import { COMMON_SIGNALS } from "./commonSignals";
import type { FiredSignal, SignalDef } from "./signalTypes";

export function evaluateSignals(facts: Facts, defs: SignalDef[] = COMMON_SIGNALS): FiredSignal[] {
  const fired: FiredSignal[] = [];
  for (const d of defs) {
    if (!d.requiredFacts.every((k) => isTrue(facts[k] as never))) continue;
    if (d.excludedFacts?.some((k) => isTrue(facts[k] as never))) continue;
    fired.push({
      id: d.id,
      label: d.label,
      taxTypeScores: d.taxTypeScores,
      scenarioScores: d.scenarioScores,
    });
  }
  return fired;
}
