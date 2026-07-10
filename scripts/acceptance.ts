// Acceptance-Runner: läuft echte Chat-Prompts durch generateAnswer und
// druckt für jeden Test den vollen Trace + eine minimale Abnahmeprüfung.
// Aufruf: `bunx tsx scripts/acceptance.ts` oder `bun scripts/acceptance.ts`

import { generateAnswer } from "../src/lib/chatHeuristics";

interface TestCase {
  id: string;
  phase: string;
  prompt: string;
  expect: string[];
}

const CASES: TestCase[] = [
  {
    id: "est.entfernungspauschale",
    phase: "Phase 1 — Einkommensteuer (Entfernungspauschale)",
    prompt:
      "Arbeitnehmer, 210 Arbeitstage, einfache Entfernung 28 km, erste Tätigkeitsstätte, privater Pkw. Wie hoch ist die Entfernungspauschale?",
    expect: ["1.898,40", "§ 9", "EStG"],
  },
  {
    id: "bilanz.garantieruecktellung",
    phase: "Phase 2 — Bilanzierung (Garantierückstellung)",
    prompt:
      "Eine GmbH verkauft im Dezember 2025 Waren mit einer zweijährigen Garantie. Aufgrund der Erfahrungen der vergangenen Jahre ist mit Garantieaufwendungen von 18.000 € zu rechnen. Die einzelnen Garantiefälle stehen am Bilanzstichtag noch nicht fest. Wie ist der Sachverhalt zum 31.12.2025 bilanziell und steuerlich zu behandeln?",
    expect: ["Rückstellung", "§ 249", "HGB", "18.000", "§ 5 Abs. 1 EStG"],
  },
  {
    id: "ust.ig_lieferung",
    phase: "Phase 2 — USt (innergemeinschaftliche Lieferung)",
    prompt:
      "Deutscher Unternehmer verkauft eine Maschine an einen österreichischen Unternehmer. Ware wird von München nach Wien transportiert. Beide haben gültige USt-IdNr., Rechnung ohne USt.",
    expect: ["§ 6a", "innergemein"],
  },
  {
    id: "ust.13b_werklieferung",
    phase: "Phase 2 — USt (Reverse Charge § 13b bei Werklieferung)",
    prompt:
      "Ein niederländischer Unternehmer erbringt eine Werklieferung an einen deutschen Unternehmer in München. Rechnung ohne USt, gültige USt-IdNr. beider Seiten.",
    expect: ["§ 13b", "Steuerschuldner"],
  },
  {
    id: "kst.vGA",
    phase: "Phase 5 — Körperschaftsteuer (vGA)",
    prompt:
      "Eine GmbH zahlt ihrem Gesellschafter-Geschäftsführer ein unangemessen hohes Gehalt. Liegt eine verdeckte Gewinnausschüttung vor?",
    expect: ["verdeckte Gewinnaussch", "§ 8 Abs. 3", "KStG", "Fremdvergleich"],
  },
  {
    id: "kst.hiddenContribution",
    phase: "Phase 5 — KSt (verdeckte Einlage)",
    prompt:
      "Ein Gesellschafter überträgt sein Grundstück unentgeltlich (als verdeckte Einlage) auf seine GmbH. Wie ist das körperschaftsteuerlich zu behandeln?",
    expect: ["verdeckte Einlage", "§ 8 Abs. 3", "§ 27 KStG"],
  },
  {
    id: "kst.organschaft",
    phase: "Phase 5 — KSt (Organschaft)",
    prompt:
      "Eine deutsche Konzernmutter und ihre 100%-Tochter-GmbH schließen einen Gewinnabführungsvertrag ab. Es liegt eine Organschaft vor. Wie wird das Einkommen zugerechnet?",
    expect: ["Organschaft", "§ 14", "Organträger"],
  },
  {
    id: "kst.contributionAccount",
    phase: "Phase 5 — KSt (steuerliches Einlagekonto)",
    prompt:
      "Eine GmbH leistet eine Auszahlung aus dem steuerlichen Einlagekonto nach § 27 KStG an ihren Gesellschafter. Steuerliche Folgen?",
    expect: ["Einlagekonto", "§ 27 KStG"],
  },
  {
    id: "kst.profitDistribution",
    phase: "Phase 5 — KSt (offene Ausschüttung)",
    prompt:
      "Eine GmbH beschließt eine ordentliche Gewinnausschüttung an ihren Alleingesellschafter. Wie ist der Vorgang bei Gesellschaft und Gesellschafter zu behandeln?",
    expect: ["§ 20 Abs. 1 Nr. 1 EStG", "Kapitalertragsteuer"],
  },
  {
    id: "kst.lossCarryforward",
    phase: "Phase 5 — KSt (Verlustvortrag)",
    prompt:
      "Eine GmbH hat einen Verlustvortrag von 3 Mio. €. Nun werden 60 % der Anteile an einen neuen Investor veräußert. Wie wirkt § 8c KStG?",
    expect: ["§ 8c KStG", "Verlustvortrag"],
  },
];

function contains(haystack: string, needles: string[]): { ok: boolean; missing: string[] } {
  const h = haystack.toLowerCase();
  const missing = needles.filter((n) => !h.includes(n.toLowerCase()));
  return { ok: missing.length === 0, missing };
}

function renderAnswer(a: ReturnType<typeof generateAnswer>): string {
  const parts: string[] = [];
  parts.push(a.summary ?? "");
  if (a.reasoning) parts.push(a.reasoning);
  if (a.sections) for (const s of a.sections) parts.push(`${s.title}: ${s.body}`);
  if (a.followUps) parts.push(a.followUps.join(" | "));
  if (a.knowledge) parts.push(a.knowledge);
  for (const t of a.trace ?? []) parts.push(`${t.step}: ${t.detail ?? ""}`);
  return parts.join("\n");
}

let pass = 0;
let fail = 0;
for (const tc of CASES) {
  console.log("\n" + "=".repeat(78));
  console.log(`▶ ${tc.phase}`);
  console.log(`  Prompt: ${tc.prompt}`);
  const a = generateAnswer(tc.prompt);
  console.log(`\n  Trace:`);
  const trace = a.trace ?? [];
  if (trace.length === 0) console.log("    (kein Trace)");
  for (const t of trace) console.log(`    • ${t.step}${t.detail ? " — " + t.detail : ""}`);
  console.log(`\n  Antwort-Summary: ${a.summary}`);
  if (a.paragraphs?.length) console.log(`  Erkannte Normen: ${a.paragraphs.join(", ")}`);
  if (a.taxTypeLabel) console.log(`  Steuerart: ${a.taxTypeLabel}`);
  const full = renderAnswer(a);
  const { ok, missing } = contains(full, tc.expect);
  if (ok) {
    console.log(`  ✅ PASS — erwartete Marker gefunden: ${tc.expect.join(", ")}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL — fehlend: ${missing.join(", ")}`);
    fail++;
  }
}

console.log("\n" + "=".repeat(78));
console.log(`Ergebnis: ${pass} pass, ${fail} fail (${CASES.length} Tests).`);
process.exit(fail === 0 ? 0 : 1);
