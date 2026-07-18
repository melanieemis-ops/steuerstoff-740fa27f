// Regression: analyze() darf für die "Cola"-Anfrage keinen EStG-Baustein
// (§ 1a EStG) einziehen und keinen NPO-Tag setzen. Zusätzlich ein paar
// Cross-Domain-Sanity-Checks, damit die Word-Boundary-Verschärfung in
// kbKeywordsToRegExp keine Regressionen bei anderen Rechtsgebieten macht.

import { analyze } from "../src/lib/analyze";
import { kbKeywordsToRegExp } from "../src/lib/knowledgeBase";

interface Case {
  id: string;
  input: { title: string; topic: string; description: string };
  mustNotContain?: string[];
  mustNotKind?: string[];
  mustKind?: string[];
  mustContainAny?: string[][];
}

const CASES: Case[] = [
  {
    id: "cola.ust",
    input: { title: "", topic: "USt", description: "Wie viel Steuer fällt auf Cola" },
    mustNotContain: ["§ 1a EStG", "Ehegattenbesteuerung", "EU-/EWR-Sonderreg"],
    mustNotKind: ["npo"],
  },
  {
    id: "strom.ust",
    input: { title: "", topic: "USt", description: "Wie viel Umsatzsteuer fällt auf Strom an?" },
    mustKind: ["ust"],
    mustContainAny: [["19", "§ 12"]],
  },
  {
    id: "zweckbetrieb.npo",
    input: { title: "", topic: "NPO", description: "Was ist ein Zweckbetrieb?" },
    mustKind: ["npo"],
    mustContainAny: [["Zweckbetrieb"]],
  },
  {
    id: "arap.buchung",
    input: { title: "", topic: "Buchhaltung", description: "Was ist ein ARAP?" },
    mustKind: ["buchung"],
    mustContainAny: [["ARAP", "Rechnungsabgrenzung"]],
  },
];

// Unit-Test für die Word-Boundary-Fix:
const rx = kbKeywordsToRegExp("estg|eu|ewr|sonderausgaben");
if (rx.test("Wie viel Steuer fällt auf Cola")) {
  console.error("❌ kbKeywordsToRegExp: 'eu' matcht immer noch innerhalb von 'Steuer'");
  process.exit(1);
}
if (!rx.test("EU-Sachverhalt")) {
  console.error("❌ kbKeywordsToRegExp: 'eu' matcht 'EU-Sachverhalt' nicht mehr");
  process.exit(1);
}
console.log("✅ kbKeywordsToRegExp Wortgrenzen ok");

let pass = 0;
let fail = 0;
for (const c of CASES) {
  const a = analyze(c.input);
  const text = [a.summary, a.recommendation, a.knowledge?.answer, a.knowledge?.explanation]
    .filter(Boolean)
    .join("\n");
  const reasons: string[] = [];
  for (const bad of c.mustNotContain ?? []) {
    if (text.toLowerCase().includes(bad.toLowerCase())) reasons.push(`enthält verbotenes '${bad}'`);
  }
  for (const bad of c.mustNotKind ?? []) {
    if (a.kind === bad) reasons.push(`kind='${bad}' unerwartet`);
  }
  for (const k of c.mustKind ?? []) {
    if (a.kind !== k) reasons.push(`kind erwartet='${k}', ist='${a.kind}'`);
  }
  for (const group of c.mustContainAny ?? []) {
    if (!group.some((n) => text.toLowerCase().includes(n.toLowerCase()))) {
      reasons.push(`keiner von [${group.join(", ")}] enthalten`);
    }
  }
  if (reasons.length === 0) {
    console.log(`✅ ${c.id}`);
    pass++;
  } else {
    console.log(`❌ ${c.id} — ${reasons.join("; ")}`);
    console.log(`   kind=${a.kind} summary=${a.summary?.slice(0, 120)}`);
    fail++;
  }
}
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
