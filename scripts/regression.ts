// Generischer Regressions-Runner: iteriert über ALLE registrierten Module
// und führt deren self-declared regressionTests aus. Neue Steuerarten =
// neue *.module.ts + Registry-Zeile — der Testcode wird NICHT angepasst.
//
// Aufruf: `bunx tsx scripts/regression.ts`

import { ALL_MODULES } from "../src/lib/expertSystem/modules/registry";
import { runExpertSystem } from "../src/lib/expertSystem/pipeline";
import type { RegressionTest, RuleModule } from "../src/lib/expertSystem/modules/types";

function renderAnswerText(r: ReturnType<typeof runExpertSystem>): string {
  const a = r.answer;
  if (!a) return "";
  const parts: string[] = [a.summary ?? "", a.reasoning ?? ""];
  for (const s of a.sections ?? []) parts.push(`${s.title}: ${s.body}`);
  if (a.followUps) parts.push(a.followUps.join(" | "));
  if (r.knowledge) parts.push(r.knowledge);
  return parts.join("\n");
}

function contains(hay: string, needles: string[]): { ok: boolean; missing: string[] } {
  const h = hay.toLowerCase();
  const missing = needles.filter((n) => !h.includes(n.toLowerCase()));
  return { ok: missing.length === 0, missing };
}

let pass = 0;
let fail = 0;
const failures: string[] = [];

for (const m of ALL_MODULES as RuleModule[]) {
  console.log("\n" + "=".repeat(78));
  console.log(`▶ ${m.taxLabel}  [${m.regressionTests.length} Tests]`);
  for (const t of m.regressionTests as RegressionTest[]) {
    const r = runExpertSystem(t.prompt);
    const winner = r.trace.taxRoute?.primary ?? "unklar";
    let ok = true;
    const reasons: string[] = [];

    if (t.mustNotWin) {
      if (winner === m.taxType) {
        ok = false;
        reasons.push(`Modul ${m.taxType} durfte nicht gewinnen, hat aber gewonnen`);
      }
    } else {
      const expectedTax = t.mustBeTaxType ?? m.taxType;
      if (winner !== expectedTax) {
        ok = false;
        reasons.push(`taxType erwartet=${expectedTax}, tatsächlich=${winner}`);
      }
      if (t.expect?.length) {
        const c = contains(renderAnswerText(r), t.expect);
        if (!c.ok) { ok = false; reasons.push(`fehlend: ${c.missing.join(", ")}`); }
      }
    }

    if (ok) {
      console.log(`  ✅ ${t.id}`);
      pass++;
    } else {
      console.log(`  ❌ ${t.id} — ${reasons.join("; ")}`);
      console.log(`     Prompt: ${t.prompt.slice(0, 120)}`);
      console.log(`     Scores: ${(r.trace.moduleScores ?? []).map(s => `${s.taxType}:${s.score}`).join(", ")}`);
      failures.push(`${m.taxType}/${t.id}`);
      fail++;
    }
  }
}

console.log("\n" + "=".repeat(78));
console.log(`Ergebnis: ${pass} pass, ${fail} fail (${pass + fail} Tests).`);
if (failures.length) console.log("Fehlgeschlagen: " + failures.join(", "));
process.exit(fail === 0 ? 0 : 1);
