// Ebene 5 — Knowledge Engine.
// Sucht KB-Einträge NUR im gescopten Bereich (taxType → scenario → subCase).
// Darf niemals klassifizieren; nur vertiefen.

import { KNOWLEDGE_BASE, kbKeywordsToRegExp, resolveScenarioType, resolveTaxType } from "../knowledgeBase";
import type { KbCitation, ScenarioType, TaxType } from "./types";

export function findKbCitations(
  taxType: TaxType,
  scenario: ScenarioType | null | undefined,
  subCase: string | null | undefined,
  prompt: string,
  limit = 3,
): KbCitation[] {
  const lower = prompt.toLowerCase();
  let candidates = KNOWLEDGE_BASE;

  if (taxType && taxType !== "unklar") {
    const byTax = candidates.filter((e) => {
      const t = resolveTaxType(e);
      return t == null || t === taxType;
    });
    if (byTax.length > 0) candidates = byTax;
  }
  if (scenario) {
    const byScenario = candidates.filter((e) => resolveScenarioType(e) === scenario);
    if (byScenario.length > 0) candidates = byScenario;
  }
  if (subCase) {
    const bySub = candidates.filter((e) => e.subCase === subCase);
    if (bySub.length > 0) candidates = bySub;
  }

  const scored = candidates
    .map((e) => {
      let score = 0;
      if (e.keywords) {
        try { if (kbKeywordsToRegExp(e.keywords).test(lower)) score += 3; } catch { /* noop */ }
      }
      score += 1; // Grundtreffer im Scope
      return { entry: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
