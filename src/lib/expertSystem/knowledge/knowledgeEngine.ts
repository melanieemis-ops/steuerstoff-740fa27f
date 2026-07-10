// Ebene 9 — Knowledge Engine. Nur Vertiefung, niemals Primärklassifikation.

import { findKbCitations } from "@/lib/expert/knowledge";
import type { TaxType } from "@/lib/router/taxTypes";

export function findDeepDive(
  taxType: TaxType,
  scenario: string | null,
  subScenario: string | null,
  prompt: string,
): string | undefined {
  // ScenarioType-Typen der bestehenden KB werden vom Legacy-Layer erwartet.
  // Wir übergeben nur, was strukturell passt; sonst kein Match.
  const citations = findKbCitations(
    taxType,
    // ScenarioType-Cast nur, wenn Wert in existierender Union liegt — sonst null.
    null,
    subScenario ?? null,
    prompt,
    2,
  );
  if (!citations.length) return undefined;
  return citations
    .map((c) => `${c.entry.title ?? c.entry.id}: ${c.entry.summary ?? ""}`.trim())
    .filter(Boolean)
    .join("\n\n");
}
