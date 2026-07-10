import { TAX_TYPE_LABELS } from "@/lib/router/taxTypes";
import type { CalculationOutput } from "../calculations/calculationEngine";
import type { RuleResult } from "../rules/ruleTypes";

export interface BuiltAnswer {
  summary: string;
  reasoning: string;
  sections: { title: string; body: string }[];
  followUps?: string[];
  taxType: RuleResult["taxType"];
  taxTypeLabel: string;
  scenarioType?: string;
  paragraphs: string[];
}

export function buildAnswer(rule: RuleResult, calc: CalculationOutput | null): BuiltAnswer {
  const label = TAX_TYPE_LABELS[rule.taxType] ?? rule.taxType;
  const sections: { title: string; body: string }[] = [];

  sections.push({ title: "Einordnung", body: `${label} — ${rule.headline}.` });

  if (rule.schemaSteps?.length) {
    sections.push({
      title: "Prüfschema",
      body: rule.schemaSteps.map((s, i) => `${i + 1}. ${s.label}`).join("\n"),
    });
  }

  sections.push({ title: "Subsumtion", body: rule.narrative });

  let summary = rule.headline;
  const followUps: string[] = [];

  if (calc?.id === "calculateCommutingAllowance") {
    const r = calc.result;
    sections.push({
      title: "Berechnung",
      body: [
        r.formula,
        ...r.breakdown.map((b) => `• ${b.label} = ${format(b.amount)} €`),
      ].join("\n"),
    });
    sections.push({
      title: "Ergebnis",
      body: `Abziehbare Entfernungspauschale: **${format(r.total)} €**.`,
    });
    summary = `Entfernungspauschale: ${format(r.total)} € (Werbungskosten, § 9 Abs. 1 Satz 3 Nr. 4 EStG).`;
  } else if (calc?.id === "missingInputs") {
    followUps.push(
      `Für eine belastbare Berechnung fehlen: ${calc.missing.join(", ")}.`,
    );
  }

  sections.push({
    title: "Rechtsgrundlagen",
    body: rule.legalRefs.join(", "),
  });

  return {
    summary,
    reasoning:
      rule.narrative +
      (rule.confidence < 0.9
        ? ` (Confidence: ${(rule.confidence * 100).toFixed(0)} %)`
        : ""),
    sections,
    followUps: followUps.length ? followUps : undefined,
    taxType: rule.taxType,
    taxTypeLabel: label,
    scenarioType: rule.subScenario ?? rule.scenario ?? undefined,
    paragraphs: rule.legalRefs,
  };
}

function format(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
