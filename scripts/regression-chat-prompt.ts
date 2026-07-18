// Offline-Regression: prüft, dass der System-Prompt des Chat-Backends die
// Anti-Verweigerungs- und Kurzantwort-Regeln enthält. Läuft ohne API-Call
// und ist deshalb credit-frei.
//
// Aufruf: `bunx tsx scripts/regression-chat-prompt.ts`

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { analyze } from "../src/lib/analyze";

const chatSrc = readFileSync(resolve("src/routes/api/chat.ts"), "utf-8");

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function must(name: string, cond: boolean, detail?: string) {
  checks.push({ name, ok: cond, detail });
}

// 1. Systemprompt enthält Kurzantwort-Regel.
must(
  "prompt: erster Satz nennt Ergebnis",
  /ERSTE SATZ/i.test(chatSrc),
);

// 2. Systemprompt verbietet Verweigerung mangels Kontext.
must(
  "prompt: verbietet Verweigerung mangels Wissenskontext",
  /verweigere NIE/i.test(chatSrc) && /nicht ableitbar/i.test(chatSrc),
);

// 3. Systemprompt begrenzt Rückfragen auf höchstens EINE.
must(
  "prompt: max. eine Rückfrage",
  /HÖCHSTENS EINE Rückfrage/i.test(chatSrc),
);

// 4. Systemprompt verbietet Wiederholung des Arbeitshilfe-Hinweises.
must(
  "prompt: kein wiederholter Arbeitshilfe-Disclaimer",
  /Wiederhole NICHT den Hinweis .Arbeitshilfe/i.test(chatSrc),
);

// 5. Empty-Context-Hinweis erlaubt allgemeines Steuerrecht.
must(
  "prompt: leerer Kontext → allgemeines Steuerrecht zulässig",
  /allgemein anerkannten deutschen Steuerrechts/i.test(chatSrc),
);

// 6. Lokale Analyse-Fallback: Cola-Frage darf keinen NPO-Tag mehr auslösen.
const cola = analyze({
  title: "",
  topic: "USt",
  description: "Wie viel Steuer fällt auf Cola?",
});
must(
  "analyze: Cola-USt-Frage nicht als NPO getaggt",
  cola.kind !== "npo",
  `kind=${cola.kind}`,
);

// 7. Fallback muss bei fachfremden USt-Anfragen nicht auf EStG-§1a springen.
must(
  "analyze: Cola-Antwort enthält kein § 1a EStG",
  !/§\s*1a\s*EStG/i.test(JSON.stringify(cola)),
);

// 8. Standard-USt-Wissensfrage bekommt eine Antwort.
const strom = analyze({
  title: "",
  topic: "USt",
  description: "Wie viel Umsatzsteuer fällt auf Strom an?",
});
must("analyze: Strom-USt-Wissensantwort vorhanden", !!strom.knowledge);

// 9. NPO-Standardfrage bleibt NPO.
const npo = analyze({
  title: "",
  topic: "NPO",
  description: "Was ist ein Zweckbetrieb?",
});
must("analyze: NPO-Zweckbetrieb bleibt NPO", npo.kind === "npo");

// 10. Buchhaltungs-Standardfrage bleibt Buchung.
const arap = analyze({
  title: "",
  topic: "Buchhaltung",
  description: "Was ist ein ARAP?",
});
must("analyze: ARAP bleibt Buchungsfrage", arap.kind === "buchung");

let fail = 0;
for (const c of checks) {
  console.log(`${c.ok ? "✅" : "❌"} ${c.name}${c.detail ? ` (${c.detail})` : ""}`);
  if (!c.ok) fail++;
}
console.log(`\n${checks.length - fail}/${checks.length} Checks bestanden.`);
process.exit(fail === 0 ? 0 : 1);
