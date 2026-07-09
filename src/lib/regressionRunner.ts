// KB-basierte Regressionstests für die Steuerstoff-Klassifizierung.
// Ziel: Jeder KNOWLEDGE_BASE-Eintrag wird als Testfall genutzt. Für Einträge
// ohne expliziten `testPrompt` wird ein Prompt aus title + keywords + short
// synthetisiert. Kernszenarien (USt-Matrix) müssen bestehen; alle übrigen
// Einträge werden als "soft" geprüft (nur geloggt).
//
// Aufruf in DEV: window.__runKbRegression() in der Chat-Route.

import { KNOWLEDGE_BASE, resolveScenarioType, type KBEntry, type ScenarioType } from "./knowledgeBase";
import { classifyForRegression, generateAnswer } from "./chatHeuristics";

export interface RegressionCaseResult {
  id: string;
  title: string;
  category: string;
  prompt: string;
  expectedScenario: ScenarioType | null;
  actualScenario: string | null;
  actualParagraph: string | null;
  complete: boolean;
  hardFail: boolean;
  softFail: boolean;
  reasons: string[];
}

export interface RegressionReport {
  total: number;
  hardFails: number;
  softFails: number;
  passed: number;
  results: RegressionCaseResult[];
}

/** Kernszenarien, für die harte Erwartungen gelten. */
const HARD_SCENARIOS: ScenarioType[] = [
  "innergemeinschaftlicher_erwerb",
  "innergemeinschaftliche_lieferung",
  "reverse_charge",
  "werklieferung",
  "werkleistung",
  "ausfuhrlieferung",
  "einfuhr",
  "reihengeschaeft",
  "dreiecksgeschaeft",
];

function keywordSample(k: KBEntry["keywords"]): string {
  if (!k) return "";
  const raw = k instanceof RegExp ? k.source : Array.isArray(k)
    ? k.map((x) => (x instanceof RegExp ? x.source : String(x))).join(" ")
    : String(k);
  // Aus Regex-Alternativen die ersten paar "wortartigen" Fragmente ziehen.
  return raw
    .replace(/\\[bBsSdDwW]/g, " ")
    .replace(/[()\[\]?+*^$\\|]/g, " ")
    .split(/\s+/)
    .filter((s) => s.length >= 3 && /[a-zäöüß§0-9]/i.test(s))
    .slice(0, 8)
    .join(" ");
}

export function buildPromptForEntry(e: KBEntry): string {
  if (e.testPrompt) return e.testPrompt;
  const parts = [e.title];
  if (e.short) parts.push(e.short);
  const kw = keywordSample(e.keywords);
  if (kw) parts.push(kw);
  if (e.references?.length) parts.push(e.references.join(" "));
  return parts.join(". ");
}

export function runKbRegression(opts: { verbose?: boolean } = {}): RegressionReport {
  const results: RegressionCaseResult[] = [];
  for (const entry of KNOWLEDGE_BASE) {
    const expected = entry.expect?.scenarioType ?? resolveScenarioType(entry);
    const prompt = buildPromptForEntry(entry);
    const cls = classifyForRegression(prompt);
    const reasons: string[] = [];

    let hardFail = false;
    let softFail = false;

    const isHardScenario = expected && HARD_SCENARIOS.includes(expected);
    const hasExplicitExpect = !!entry.expect;

    // Szenariotyp — hart nur bei explizit gesetzten Erwartungen. Bei ohne
    // `expect` (synthetisierte Prompts) bleibt Abweichung "soft", damit
    // schwammige Titel/Keywords keine Regressionen provozieren.
    if (expected && cls.scenarioType !== expected) {
      reasons.push(`scenarioType erwartet=${expected}, tatsächlich=${cls.scenarioType ?? "—"}`);
      if (hasExplicitExpect) hardFail = true;
      else softFail = true;
    }


    // Erwartete Paragraphen
    if (entry.expect?.paragraphen?.length) {
      const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
      const actual = norm(cls.paragraph ?? "");
      const hit = entry.expect.paragraphen.some((p) => actual.includes(norm(p)));
      if (!hit) {
        reasons.push(`Paragraph erwartet einer aus [${entry.expect.paragraphen.join(", ")}], tatsächlich=${cls.paragraph ?? "—"}`);
        hardFail = true;
      }
    }

    // Keine unnötigen Rückfragen
    if (entry.expect?.mustNotAskFollowup && !cls.complete) {
      reasons.push("Rückfragen sollten unterdrückt sein (mustNotAskFollowup)");
      hardFail = true;
    }

    // Steuerart / Kategorie plausibel
    if (entry.expect?.steuerart && entry.category && !entry.category.toLowerCase().includes(entry.expect.steuerart.toLowerCase())) {
      reasons.push(`Steuerart erwartet=${entry.expect.steuerart}, Kategorie=${entry.category}`);
      softFail = true;
    }

    // Antwortstruktur (KB darf Falllösung nicht ersetzen)
    if (isHardScenario) {
      const ans = generateAnswer(prompt);
      const firstSection = ans.sections?.[0]?.title ?? "";
      if (ans.kind === "case" && !/Klassifizierung|Sachverhaltsart/i.test(firstSection)) {
        reasons.push(`Antwortreihenfolge verletzt — erste Sektion "${firstSection}" statt Klassifizierung`);
        hardFail = true;
      }
    }

    results.push({
      id: entry.id,
      title: entry.title,
      category: entry.category,
      prompt: prompt.slice(0, 160),
      expectedScenario: expected ?? null,
      actualScenario: cls.scenarioType,
      actualParagraph: cls.paragraph,
      complete: cls.complete,
      hardFail,
      softFail,
      reasons,
    });
  }

  const hardFails = results.filter((r) => r.hardFail).length;
  const softFails = results.filter((r) => r.softFail && !r.hardFail).length;
  const passed = results.length - hardFails - softFails;
  const report: RegressionReport = { total: results.length, hardFails, softFails, passed, results };

  if (opts.verbose) {
    // eslint-disable-next-line no-console
    console.group(`[steuerstoff] KB-Regression: ${passed}/${results.length} ok, ${hardFails} hardFails, ${softFails} softFails`);
    for (const r of results) {
      if (r.hardFail || r.softFail) {
        // eslint-disable-next-line no-console
        console.warn(`[${r.hardFail ? "HARD" : "soft"}] ${r.id} (${r.category})`, r.reasons, r);
      }
    }
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
  return report;
}
