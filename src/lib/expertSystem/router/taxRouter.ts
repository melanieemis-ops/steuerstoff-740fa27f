// Ebene 5 — Tax Router. Bewertet alle Steuerarten parallel.

import type { TaxType } from "@/lib/router/taxTypes";
import type { FiredSignal } from "../signals/signalTypes";

const MIN_ABS_SCORE = 10;
const SECONDARY_RATIO = 0.75;

export interface TaxRoute {
  primary: TaxType | "unklar";
  confidence: number;
  secondary: TaxType[];
  scores: Partial<Record<TaxType, number>>;
  supportingSignals: string[];
}

export function routeTax(signals: FiredSignal[]): TaxRoute {
  const scores: Partial<Record<TaxType, number>> = {};
  const support = new Map<TaxType, string[]>();

  for (const s of signals) {
    for (const [tt, w] of Object.entries(s.taxTypeScores)) {
      if (!w) continue;
      const key = tt as TaxType;
      scores[key] = (scores[key] ?? 0) + w;
      const arr = support.get(key) ?? [];
      arr.push(s.id);
      support.set(key, arr);
    }
  }

  const ordered = (Object.entries(scores) as [TaxType, number][]).sort((a, b) => b[1] - a[1]);
  if (ordered.length === 0 || ordered[0][1] < MIN_ABS_SCORE) {
    return { primary: "unklar", confidence: 0, secondary: [], scores, supportingSignals: [] };
  }
  const [top, topScore] = ordered[0];
  const secondary = ordered
    .slice(1)
    .filter(([, s]) => s >= topScore * SECONDARY_RATIO && s >= MIN_ABS_SCORE - 2)
    .map(([t]) => t);
  const confidence = Math.min(1, topScore / 20);
  return {
    primary: top,
    confidence,
    secondary,
    scores,
    supportingSignals: support.get(top) ?? [],
  };
}
