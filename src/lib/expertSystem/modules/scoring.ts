// Generisches Scoring über ALLE Rule-Module.
// Der Router muss keine Steuerart namentlich kennen.

import type { Facts } from "../facts/factModel";
import type { ModuleScore, RuleModule } from "./types";

export function scoreModules(modules: RuleModule[], facts: Facts): ModuleScore[] {
  const text = facts.raw.lower;
  const results: ModuleScore[] = [];

  for (const m of modules) {
    // Harte Ausschlusstrigger — Modul wird verworfen.
    let vetoed = false;
    for (const r of m.negativeTriggers) {
      if (r.test(text)) { vetoed = true; break; }
    }
    if (vetoed) {
      results.push({ module: m, score: -Infinity, hits: [], vetoed: true });
      continue;
    }

    const hits: string[] = [];
    let score = 0;
    let groups = 0;
    const bucket = (arr: RegExp[], weight: number, tag: string) => {
      let h = 0;
      for (const r of arr) {
        const m2 = text.match(r);
        if (m2) { h++; hits.push(`${tag}:${m2[0]}`); }
      }
      if (h > 0) groups++;
      return h * weight;
    };
    score += bucket(m.weakTriggers, 1, "weak");
    score += bucket(m.mediumTriggers, 3, "med");
    score += bucket(m.strongTriggers, 5, "strong");
    score += bucket(m.exclusiveTriggers, 10, "excl");
    // Kombinationsbonus wenn mehrere Trigger-Ebenen greifen.
    if (groups >= 2) score += 2;
    if (groups >= 3) score += 3;

    results.push({ module: m, score, hits, vetoed: false });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

export function pickBest(scores: ModuleScore[]): ModuleScore | null {
  const top = scores.find((s) => !s.vetoed);
  if (!top) return null;
  if (top.score < top.module.minimumScore) return null;
  return top;
}
