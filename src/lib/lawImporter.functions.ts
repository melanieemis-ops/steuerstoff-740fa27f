import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LAWS = [
  "AO",
  "EStG",
  "UStG",
  "KStG",
  "GewStG",
  "UmwStG",
  "GrEStG",
  "ErbStG",
  "BewG",
  "FGO",
] as const;

const LAW_TO_TAXTYPE: Record<string, string | undefined> = {
  EStG: "einkommensteuer",
  UStG: "umsatzsteuer",
  KStG: "koerperschaftsteuer",
  GewStG: "gewerbesteuer",
  AO: "abgabenordnung",
  ErbStG: "erbschaftsteuer",
  GrEStG: "grunderwerbsteuer",
  UmwStG: "koerperschaftsteuer",
};

const InputSchema = z.object({
  law: z.enum(LAWS),
  originalText: z.string().min(20).max(30000),
});

const toStringArray = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (Array.isArray(v) ? [v] : v).flat().map((s) => String(s).trim()).filter(Boolean));

const KbSchema = z.object({
  paragraph: z.string().min(1).max(30),
  title: z.string().min(2).max(200),
  short: z.string().min(10).max(400),
  keywords: z.array(z.string().min(2)).min(2).max(20),
  references: z.array(z.string().min(2)).min(1).max(20),
  category: z.string().min(2).max(80),
  importance: z.number().int().min(1).max(10),
  ueberblick: z.string().min(10),
  tatbestand: toStringArray,
  rechtsfolge: toStringArray,
  ausnahmen: toStringArray,
  verknuepft: toStringArray,
  praxisbeispiel: toStringArray,
  merksatz: toStringArray,
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseParagraphNumber(p: string): { padded: string; num: number } {
  const m = p.match(/(\d+)([a-z]?)/i);
  if (!m) return { padded: "000", num: 0 };
  const num = parseInt(m[1], 10);
  const suffix = (m[2] ?? "").toLowerCase();
  return { padded: String(num).padStart(3, "0") + suffix, num };
}

function toIdentifier(law: string, paddedPara: string, titleSlug: string): string {
  const camel = titleSlug
    .split("-")
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join("");
  return `${law.toLowerCase()}${paddedPara.replace(/[^0-9a-z]/gi, "")}${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
}

function escapeBackticks(s: string): string {
  return s.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

async function generateWithAi(input: z.infer<typeof InputSchema>): Promise<z.infer<typeof KbSchema>> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY ist nicht konfiguriert.");

  const system = `Du bist ein deutscher Steuerrechts-Experte. Du erstellst interne Knowledge-Base-Bausteine für ein Expertensystem. WICHTIG: Gib NIEMALS den Gesetzeswortlaut vollständig wieder. Fasse fachlich korrekt zusammen. Keine urheberrechtlich problematischen Vollzitate. Antworte ausschließlich als valides JSON gemäß Schema.`;

  const user = `Analysiere den folgenden Gesetzestext aus dem ${input.law} vollständig automatisch.
Erkenne selbst: Paragraph-Nummer (inkl. ggf. Buchstaben-Suffix wie 15a), Überschrift, Absätze, Nummerierungen, verwiesene Paragraphen, passende Schlagwörter, sinnvolle Kategorie und Praxisrelevanz.

Originaltext (nur zur inhaltlichen Analyse, NICHT vollständig zurückgeben — nur zusammenfassen):
"""
${input.originalText}
"""

Antworte als JSON mit genau diesen Feldern:
{
  "paragraph": "z. B. § 15 oder § 15a (mit § und ggf. Buchstabe)",
  "title": "Amtliche Überschrift des Paragraphen",
  "short": "1–2 Sätze Kurzbeschreibung",
  "keywords": ["...", "..."],
  "references": ["§ X ${input.law}", "..."],
  "category": "z. B. 'Einkommensteuer' oder 'Umsatzsteuer'",
  "importance": 1-10,
  "ueberblick": "Kurzüberblick (Fließtext, 2–4 Sätze)",
  "tatbestand": "Tatbestandsvoraussetzungen (Markdown-Bullet-Liste mit - )",
  "rechtsfolge": "Rechtsfolge (Fließtext, ggf. Bullets)",
  "ausnahmen": "Ausnahmen (Bullet-Liste oder 'Keine')",
  "verknuepft": "Verknüpfte Paragraphen mit kurzer Erläuterung",
  "praxisbeispiel": "Konkretes Beispiel (2–5 Sätze)",
  "merksatz": "Ein prägnanter Merksatz"
}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate-Limit erreicht — bitte kurz warten und erneut versuchen.");
    if (res.status === 402) throw new Error("AI-Credits aufgebraucht — bitte im Workspace-Billing aufladen.");
    throw new Error(`AI-Gateway ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI-Antwort war kein valides JSON.");
  }
  return KbSchema.parse(parsed);
}

function buildFileContent(
  identifier: string,
  law: string,
  ai: z.infer<typeof KbSchema>,
  id: string,
  paragraphNumber: number,
): string {
  const taxType = LAW_TO_TAXTYPE[law];
  const keywordsRegex = ai.keywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const body = `# Kurzüberblick

${ai.ueberblick}

# Tatbestandsvoraussetzungen

${ai.tatbestand}

# Rechtsfolge

${ai.rechtsfolge}

# Ausnahmen

${ai.ausnahmen}

# Verknüpfte Paragraphen

${ai.verknuepft}

# Praxisbeispiel

${ai.praxisbeispiel}

# Merksatz

${ai.merksatz}
`;

  return `import type { KBEntry } from "@/lib/knowledgeBase";

// AUTOMATISCH ERZEUGT via /gesetz-importieren.
// Nur intern — darf NICHT in der öffentlichen Wissensdatenbank erscheinen.

export const ${identifier}: KBEntry = {
  id: ${JSON.stringify(id)},
  title: ${JSON.stringify(`${ai.paragraph} ${law} – ${ai.title}`)},
  short: ${JSON.stringify(ai.short)},
  category: ${JSON.stringify(ai.category || `Gesetze / ${law}`)},
  source: ${JSON.stringify(`${law} — interne Zusammenfassung`)},
  keywords: /(${keywordsRegex})/i,
  references: ${JSON.stringify(ai.references)},
  law: ${JSON.stringify(law)},
  paragraph: ${JSON.stringify(ai.paragraph)},
  paragraphNumber: ${paragraphNumber},
  type: "gesetz",
  importance: ${ai.importance},${taxType ? `\n  taxType: ${JSON.stringify(taxType)},` : ""}
  body: \`${escapeBackticks(body)}\`,
};
`;
}

async function writeAndRegister(
  law: string,
  ai: z.infer<typeof KbSchema>,
): Promise<{ filePath: string; identifier: string; id: string }> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const { padded, num } = parseParagraphNumber(ai.paragraph);
  const titleSlug = slugify(ai.title);
  const fileBase = `${law.toLowerCase()}-${padded}-${titleSlug}`;
  const id = fileBase;
  const identifier = toIdentifier(law, padded, titleSlug);

  const dir = path.join(
    process.cwd(),
    "src",
    "lib",
    "expertSystem",
    "internalKnowledge",
    "laws",
    law.toLowerCase(),
  );
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${fileBase}.ts`);

  try {
    await fs.access(filePath);
    throw new Error(`Datei existiert bereits: ${fileBase}.ts — bitte anderen Titel/Paragraphen wählen.`);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Datei existiert")) throw e;
  }

  const content = buildFileContent(identifier, law, ai, id, num);
  await fs.writeFile(filePath, content, "utf-8");

  const indexPath = path.join(
    process.cwd(),
    "src",
    "lib",
    "expertSystem",
    "internalKnowledge",
    "internalKnowledge.ts",
  );
  const src = await fs.readFile(indexPath, "utf-8");
  const importLine = `import { ${identifier} } from "./laws/${law.toLowerCase()}/${fileBase}";`;
  const entryLine = `  ${identifier},`;

  if (src.includes(importLine)) {
    throw new Error("Import existiert bereits in internalKnowledge.ts.");
  }

  const importsRe = /(\/\/ GENERATED-IMPORTS-START\n)([\s\S]*?)(\/\/ GENERATED-IMPORTS-END)/;
  const entriesRe = /(\/\/ GENERATED-ENTRIES-START\n)([\s\S]*?)(\s*\/\/ GENERATED-ENTRIES-END)/;

  if (!importsRe.test(src) || !entriesRe.test(src)) {
    throw new Error("Marker in internalKnowledge.ts fehlen — bitte Datei prüfen.");
  }

  const nextImports = (block: string) => {
    const lines = block.split("\n").filter((l) => l.trim().startsWith("import "));
    lines.push(importLine);
    lines.sort((a, b) => a.localeCompare(b));
    return lines.join("\n") + "\n";
  };
  const nextEntries = (block: string) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.endsWith(","));
    lines.push(entryLine.trim());
    lines.sort((a, b) => a.localeCompare(b));
    return "\n" + lines.map((l) => "  " + l).join("\n") + "\n  ";
  };

  const updated = src
    .replace(importsRe, (_, a, b, c) => `${a}${nextImports(b)}${c}`)
    .replace(entriesRe, (_, a, b, c) => `${a}${nextEntries(b)}${c}`);

  await fs.writeFile(indexPath, updated, "utf-8");

  return { filePath, identifier, id };
}

export const importLawEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const ai = await generateWithAi(data);
    const result = await writeAndRegister(data.law, ai);
    return {
      ok: true as const,
      id: result.id,
      identifier: result.identifier,
      relativePath: result.filePath.split("src/")[1] ? "src/" + result.filePath.split("src/")[1] : result.filePath,
      preview: ai,
    };
  });
