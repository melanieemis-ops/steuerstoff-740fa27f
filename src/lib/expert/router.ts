// Ebene 3 — Steuerart-Router.
// Bewertet ALLE Steuerarten parallel anhand der Signal-Gewichte und wählt
// die höchste belastbare aus. Erkennt Mehrsteuerfälle.

import { detectTaxType } from "../router/taxTypes";
import type { FiredSignal, RouteDecision, TaxType } from "./types";

const MIN_ABS_SCORE = 8;
const SECONDARY_RATIO = 0.7;

export function routeTaxType(signals: FiredSignal[], rawPrompt: string): RouteDecision {
  const scores: Record<string, number> = {};
  const reasonMap = new Map<TaxType, string[]>();

  for (const s of signals) {
    for (const [tt, w] of Object.entries(s.weight)) {
      if (!w) continue;
      scores[tt] = (scores[tt] ?? 0) + w;
      const arr = reasonMap.get(tt as TaxType) ?? [];
      arr.push(s.id);
      reasonMap.set(tt as TaxType, arr);
    }
  }

  // Regex-Fallback aus dem alten Router einbeziehen (schwaches Grundsignal),
  // damit reine Norm-Zitate ohne Fakten trotzdem routen.
  const legacy = detectTaxType(rawPrompt.toLowerCase());
  if (legacy.type !== "unklar") {
    scores[legacy.type] = (scores[legacy.type] ?? 0) + Math.min(6, legacy.confidence);
    const arr = reasonMap.get(legacy.type) ?? [];
    arr.push(...legacy.reasons.map((r) => `legacy:${r}`));
    reasonMap.set(legacy.type, arr);
  }

  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ordered.length === 0 || ordered[0][1] < MIN_ABS_SCORE) {
    return { primary: "unklar", secondary: [], scores, reasons: [] };
  }

  const [topType, topScore] = ordered[0];
  const secondary = ordered
    .slice(1)
    .filter(([, s]) => s >= topScore * SECONDARY_RATIO && s >= MIN_ABS_SCORE - 2)
    .map(([t]) => t as TaxType);

  return {
    primary: topType as TaxType,
    secondary,
    scores,
    reasons: reasonMap.get(topType as TaxType) ?? [],
  };
}
