/**
 * Sync steuerstoff knowledge into an OpenAI Vector Store for file_search.
 *
 * Run:  bun run scripts/sync-knowledge-to-vector-store.ts
 *
 * Reads:
 *   src/lib/knowledgeBase.ts            (KNOWLEDGE_BASE)
 *   src/lib/expertSystem/internalKnowledge  (INTERNAL_KNOWLEDGE_BASE)
 *   src/lib/taxLexicon.ts               (LEXICON via re-export helper)
 *   src/lib/knowledgeTopics.ts          (KNOWLEDGE_TOPICS)
 *
 * Requires env: OPENAI_API_KEY
 * Optional env: OPENAI_VECTOR_STORE_ID  (reuse existing store; otherwise creates one)
 */

import OpenAI, { toFile } from "openai";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

import { KNOWLEDGE_BASE, type KBEntry } from "../src/lib/knowledgeBase";
import { INTERNAL_KNOWLEDGE_BASE } from "../src/lib/expertSystem/internalKnowledge";
import { KNOWLEDGE_TOPICS } from "../src/lib/knowledgeTopics";
// Lexicon is not exported directly; we import the module and read via a helper.
import * as Lex from "../src/lib/taxLexicon";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY missing");
  process.exit(1);
}
const client = new OpenAI({ apiKey });

const OUT_DIR = resolve("scripts/.knowledge-out");
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c]!))
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "entry";
}

function kwToString(k: unknown): string {
  if (!k) return "";
  if (k instanceof RegExp) return k.source;
  if (Array.isArray(k)) return k.map(kwToString).filter(Boolean).join(", ");
  if (typeof k === "string") return k;
  return "";
}

type OutFile = { name: string; content: string };
const files: OutFile[] = [];
let errors = 0;

function pushKb(e: KBEntry, ns: string) {
  try {
    const front: string[] = [
      `id: ${e.id}`,
      `title: ${e.title}`,
      `category: ${e.category ?? ""}`,
    ];
    if (e.law) front.push(`law: ${e.law}`);
    if (e.paragraph) front.push(`paragraph: ${e.paragraph}`);
    if (e.taxType) front.push(`taxType: ${e.taxType}`);
    if (e.scenarioType) front.push(`scenarioType: ${e.scenarioType}`);
    if (e.source) front.push(`source: ${e.source}`);
    const refs = (e.references ?? []).filter(Boolean);
    if (refs.length) front.push(`references: ${refs.join(", ")}`);
    const kws = kwToString(e.keywords);
    const md =
      `---\n${front.join("\n")}\n---\n\n⇨ ${e.title}\n\n` +
      (e.short ? `_${e.short}_\n\n` : "") +
      (e.body ?? "") +
      (kws ? `\n\n<!-- keywords: ${kws} -->\n` : "");
    files.push({ name: `${ns}-${slugify(e.id)}.md`, content: md });
  } catch (err) {
    errors++;
    console.error(`[skip] ${ns}/${e?.id}:`, (err as Error).message);
  }
}

for (const e of KNOWLEDGE_BASE) pushKb(e, "kb");
for (const e of INTERNAL_KNOWLEDGE_BASE) pushKb(e, "int");

// Lexicon: iterate exported LEXICON if accessible, else via lookupLexicon over aliases.
const lexRaw = (Lex as unknown as { LEXICON?: Array<{ aliases: string[]; answer: { summary?: string; reasoning?: string | null; sections?: Array<{ title: string; body: string }>; knowledge?: string | null } }> }).LEXICON;
if (Array.isArray(lexRaw)) {
  for (const item of lexRaw) {
    try {
      const title = item.aliases?.[0] ?? "Lexikon";
      const id = `lex-${slugify(title)}`;
      const sections = (item.answer.sections ?? [])
        .map((s) => `► ${s.title}\n\n${s.body}`)
        .join("\n\n");
      const md =
        `---\nid: ${id}\ntitle: ${title}\ncategory: Steuerlexikon\naliases: ${item.aliases.join(", ")}\n---\n\n` +
        `⇨ ${title}\n\n${item.answer.summary ?? ""}\n\n` +
        (item.answer.reasoning ? `${item.answer.reasoning}\n\n` : "") +
        sections;
      files.push({ name: `${id}.md`, content: md });
    } catch (err) {
      errors++;
      console.error("[skip] lex:", (err as Error).message);
    }
  }
}

// Topics: summary/checklist as short cards
for (const t of KNOWLEDGE_TOPICS as Array<Record<string, unknown>>) {
  try {
    if (!t.title || !t.summary) continue;
    const id = `topic-${slugify(String(t.id ?? t.title))}`;
    const md =
      `---\nid: ${id}\ntitle: ${t.title}\ncategory: Wissensthema (${t.handoutCategory ?? "-"})\n---\n\n` +
      `⇨ ${t.title}\n\n${t.subtitle ?? ""}\n\n${t.summary}\n\n` +
      (Array.isArray(t.checklist) && t.checklist.length
        ? `► Checkliste\n${(t.checklist as string[]).map((c) => `- ${c}`).join("\n")}\n`
        : "");
    files.push({ name: `${id}.md`, content: md });
  } catch (err) {
    errors++;
    console.error("[skip] topic:", (err as Error).message);
  }
}

console.log(`Prepared ${files.length} knowledge files (${errors} errors) in ${OUT_DIR}`);

for (const f of files) writeFileSync(join(OUT_DIR, f.name), f.content, "utf8");

async function main() {
  let vsId = process.env.OPENAI_VECTOR_STORE_ID;
  if (vsId) {
    console.log(`Reusing vector store ${vsId} — clearing existing files`);
    try {
      let cursor: string | undefined = undefined;
      // paginate
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page: { data: Array<{ id: string }>; has_more?: boolean; last_id?: string } =
          (await client.vectorStores.files.list(vsId, cursor ? { limit: 100, after: cursor } : { limit: 100 })) as unknown as { data: Array<{ id: string }>; has_more?: boolean; last_id?: string };
        for (const f of page.data) {
          await client.vectorStores.files.del(vsId, f.id).catch(() => {});
          await client.files.del(f.id).catch(() => {});
        }
        if (!page.has_more) break;
        cursor = page.last_id ?? page.data[page.data.length - 1]?.id;
        if (!cursor) break;
      }
    } catch (e) {
      console.warn("Could not fully clear existing files:", (e as Error).message);
    }
  } else {
    const vs = await client.vectorStores.create({ name: "steuerstoff-knowledge" });
    vsId = vs.id;
    console.log(`Created vector store ${vsId}`);
  }

  console.log(`Uploading ${files.length} files ...`);
  const fileIds: string[] = [];
  let uploadErrors = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const uploaded = await client.files.create({
        file: await toFile(Buffer.from(f.content, "utf8"), f.name, { type: "text/markdown" }),
        purpose: "assistants",
      });
      fileIds.push(uploaded.id);
      if ((i + 1) % 25 === 0) console.log(`  uploaded ${i + 1}/${files.length}`);
    } catch (e) {
      uploadErrors++;
      console.error(`  upload failed for ${f.name}:`, (e as Error).message);
    }
  }
  console.log(`Uploaded ${fileIds.length} (upload errors: ${uploadErrors})`);

  // Attach in batches of 500 (API cap)
  const CHUNK = 400;
  for (let i = 0; i < fileIds.length; i += CHUNK) {
    const chunk = fileIds.slice(i, i + CHUNK);
    const batch = await client.vectorStores.fileBatches.createAndPoll(vsId, {
      file_ids: chunk,
    });
    console.log(
      `Batch ${i / CHUNK + 1}: ${batch.status} — completed=${batch.file_counts.completed} failed=${batch.file_counts.failed}`,
    );
  }

  console.log("\n=========================================");
  console.log(`OPENAI_VECTOR_STORE_ID=${vsId}`);
  console.log(`Files synced: ${fileIds.length}`);
  console.log(`Prep errors: ${errors}, upload errors: ${uploadErrors}`);
  console.log("=========================================\n");
}

main().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
