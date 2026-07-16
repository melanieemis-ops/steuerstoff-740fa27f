/**
 * Evaluation: run a set of fachliche Testfragen against the OpenAI vector store,
 * using the same file_search setup as the server chat function.
 *
 * Run: bun run scripts/eval-chat.ts        (default: alle Fragen)
 *      bun run scripts/eval-chat.ts 5      (nur die ersten 5)
 */

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const vsId = process.env.OPENAI_VECTOR_STORE_ID;
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
if (!apiKey || !vsId) {
  console.error("OPENAI_API_KEY / OPENAI_VECTOR_STORE_ID fehlen.");
  process.exit(1);
}
const client = new OpenAI({ apiKey });

const SYSTEM = `Du bist "steuerstoff". Antworte ausschließlich auf Deutsch als JSON:
{"summary":"...","reasoning":"...","sections":[],"risks":[],"followUps":[],"nextStep":null,"knowledge":null,"sources":[],"confidence":"low|medium|high","needsHumanReview":true|false}
Nutze VORRANGIG die per file_search bereitgestellten Wissensauszüge. Erfinde keine Fundstellen. Wenn nichts Passendes gefunden wurde: sage das, setze confidence="low", needsHumanReview=true.`;

type Q = { area: string; q: string };
const QUESTIONS: Q[] = [
  { area: "ESt",  q: "Wer ist nach § 1 EStG unbeschränkt einkommensteuerpflichtig?" },
  { area: "ESt",  q: "Welche sieben Einkunftsarten kennt das EStG?" },
  { area: "USt",  q: "Wann liegt ein innergemeinschaftlicher Erwerb vor?" },
  { area: "USt",  q: "Ein deutscher Handwerker montiert ein Fenster in einem Wohnhaus in Österreich. Wo ist der Ort der Leistung?" },
  { area: "USt",  q: "Wie hoch ist die USt auf Stromlieferungen an Endkunden 2025?" },
  { area: "USt",  q: "Was ist Reverse Charge nach § 13b UStG?" },
  { area: "KSt",  q: "Wer ist unbeschränkt körperschaftsteuerpflichtig nach § 1 KStG?" },
  { area: "NPO",  q: "Wie ordne ich Mitgliedsbeiträge im Verein einer Sphäre zu?" },
  { area: "Bilanz", q: "Was besagt der Grundsatz der Vorsicht nach § 252 HGB?" },
  { area: "SKR42", q: "Welches SKR42-Konto entspricht dem SKR03-Konto 4210 (Löhne und Gehälter)?" },
  { area: "DATEV", q: "Was sind GoBD-konforme Anforderungen an digitale Belege?" },
  { area: "AO",   q: "Welche Aufbewahrungsfristen gelten nach § 147 AO?" },
  { area: "Rueckfrage", q: "Ist das eine Betriebsausgabe?" },
  { area: "Rueckfrage", q: "Kann ich das absetzen?" },
  { area: "Ohne KB", q: "Wie viel kostet ein Espresso in Neapel?" },
  { area: "Ohne KB", q: "Wer hat 2018 die Fußball-WM gewonnen?" },
  { area: "Lexikon", q: "Was ist die GoBD?" },
  { area: "Lexikon", q: "Was bedeutet UStVA?" },
  { area: "Lexikon", q: "Was ist eine EÜR?" },
  { area: "Kfz",  q: "Wie funktioniert die 1-Prozent-Methode bei der Kfz-Wertabgabe?" },
];

async function ask(qq: Q) {
  const resp = await client.responses.create({
    model,
    instructions: SYSTEM,
    input: [{ role: "user", content: qq.q }],
    tools: [{ type: "file_search", vector_store_ids: [vsId!], max_num_results: 10 }],
    include: ["file_search_call.results"],
  });
  const text = (resp as { output_text?: string }).output_text ?? "";
  const output = (resp as { output?: unknown[] }).output ?? [];
  let retrievedCount = 0;
  const titles: string[] = [];
  for (const it of output as Array<{ type?: string; results?: Array<{ filename?: string; content?: Array<{ text?: string }> }> }>) {
    if (it.type === "file_search_call" && Array.isArray(it.results)) {
      retrievedCount += it.results.length;
      for (const r of it.results.slice(0, 3)) {
        const chunk = (r.content ?? []).map((c) => c.text ?? "").join("\n");
        const m = chunk.replace(/^---[\s\S]*?---\s*/m, "").match(/^⇨\s+(.+)$/m);
        titles.push(m ? m[1].trim() : (r.filename ?? "?"));
      }
    }
  }
  let parsed: { summary?: string; confidence?: string; needsHumanReview?: boolean; sources?: unknown[] } = {};
  try { parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, "").replace(/```$/,"").trim()); } catch { /* keep raw */ }
  return { retrievedCount, titles, parsed, raw: text };
}

const limit = Number(process.argv[2] ?? QUESTIONS.length);
const subset = QUESTIONS.slice(0, limit);

let ok = 0, jsonFail = 0, noContext = 0;
for (const q of subset) {
  process.stdout.write(`\n[${q.area}] ${q.q}\n`);
  try {
    const r = await ask(q);
    if (!r.parsed.summary) jsonFail++; else ok++;
    if (r.retrievedCount === 0) noContext++;
    const conf = r.parsed.confidence ?? "?";
    const review = r.parsed.needsHumanReview ? "REVIEW" : "";
    const srcs = Array.isArray(r.parsed.sources) ? r.parsed.sources.length : 0;
    console.log(`  retrieved=${r.retrievedCount} conf=${conf} sources=${srcs} ${review}`);
    console.log(`  top: ${r.titles.slice(0, 3).join(" | ")}`);
    console.log(`  → ${(r.parsed.summary ?? r.raw).slice(0, 220).replace(/\s+/g, " ")}`);
  } catch (e) {
    console.log(`  ERROR: ${(e as Error).message}`);
  }
}
console.log(`\n== Summary: ok=${ok}/${subset.length}, jsonFail=${jsonFail}, noContext=${noContext} ==`);
