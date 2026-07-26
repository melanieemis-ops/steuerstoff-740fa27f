from pathlib import Path

path = Path('src/lib/chatHeuristics.ts')
text = path.read_text(encoding='utf-8')

import_old = '// Lightweight heuristic "AI" answer engine for the steuerstoff Chat MVP.\n// Replace generateAnswer() with a real API call later.\n\n'
import_new = import_old + 'import "@/lib/knowledgeBaseExtensions";\n'
if 'import "@/lib/knowledgeBaseExtensions";' not in text:
    if import_old not in text:
        raise SystemExit('Header for knowledgeBaseExtensions import not found')
    text = text.replace(import_old, import_new, 1)

helper_anchor = '\n\nfunction kbSections(entries: KBEntry[]): { title: string; body: string }[] {'
helper = r'''

const BROAD_KB_STOPWORDS = new Set([
  "aber", "alle", "auch", "dann", "das", "dass", "dem", "den", "der", "die", "ein",
  "eine", "einen", "einer", "eines", "für", "gibt", "haben", "hat", "ich", "ist", "kann",
  "mit", "nach", "oder", "sich", "sind", "über", "und", "vom", "von", "was", "welche",
  "welcher", "welches", "werden", "wie", "wird", "zur", "zum",
]);

function normalizeKbSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

function broadKbTokens(query: string): string[] {
  const normalized = normalizeKbSearch(query);
  const tokens = normalized
    .replace(/[^a-z0-9§\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !BROAD_KB_STOPWORDS.has(token));

  if (/abschreib|\bafa\b|wertminder|niederstwert|restbuchwert/.test(normalized)) {
    tokens.push("abschreib", "afa", "wertminder");
  }
  if (/sonderabschreib|§\s*7g|§\s*7b/.test(normalized)) {
    tokens.push("sonderabschreib", "7g", "7b");
  }

  return Array.from(new Set(tokens));
}

function findBroadKbMatches(query: string, limit = 4): KBEntry[] {
  const tokens = broadKbTokens(query);
  if (tokens.length === 0) return [];

  const entries = [...KNOWLEDGE_BASE, ...INTERNAL_KNOWLEDGE_BASE];
  return entries
    .map((entry) => {
      const title = normalizeKbSearch(entry.title ?? "");
      const category = normalizeKbSearch(String(entry.category ?? ""));
      const short = normalizeKbSearch(entry.short ?? "");
      const body = normalizeKbSearch(entry.body ?? "");
      const keywords = normalizeKbSearch(entry.keywords ?? "");
      const references = normalizeKbSearch(entry.references?.join(" ") ?? "");
      const haystack = `${title} ${category} ${short} ${body} ${keywords} ${references}`;
      let score = 0;
      let hits = 0;

      for (const token of tokens) {
        const stem = token.length > 8 ? token.slice(0, 8) : token;
        if (!haystack.includes(token) && !haystack.includes(stem)) continue;
        hits += 1;
        if (title.includes(token) || title.includes(stem)) score += 5;
        else if (category.includes(token) || category.includes(stem)) score += 4;
        else if (keywords.includes(token) || keywords.includes(stem)) score += 3;
        else if (short.includes(token) || short.includes(stem)) score += 2;
        else score += 1;
      }

      if (hits === tokens.length) score += 3;
      return { entry, score, hits };
    })
    .filter(({ score, hits }) => score >= 3 && hits > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
'''
if 'function findBroadKbMatches(' not in text:
    if helper_anchor not in text:
        raise SystemExit('kbSections anchor not found')
    text = text.replace(helper_anchor, helper + helper_anchor, 1)

fallback_old = '''  // --- Fallback ---
  return {
    summary:
      "Die Frage konnte heuristisch nicht eindeutig zugeordnet werden. Eine kurze Präzisierung (Rechtsform, Steuerart, Sachverhalt) hilft.",
    followUps: [
      "Um welche Steuerart geht es (USt, ErtragSt, Gemeinnützigkeit)?",
      "Wer ist beteiligt (Mandant, Empfänger, Geldgeber)?",
      "Welche Beträge und Zeiträume liegen vor?",
    ],
    nextStep: "Strukturierte Anfrage in 'Neue Anfrage' erfassen.",
    links: [{ label: "Neue Anfrage öffnen", to: "/neue-anfrage" }],
  };'''

fallback_new = '''  // --- KB-First-Fallback ---
  // Wenn die Spezialheuristik keine eindeutige Route findet, wird zuerst die
  // vollständige Wissensdatenbank durchsucht. Erst ohne brauchbaren Treffer
  // wird um eine Präzisierung gebeten.
  const broadKbMatches = findBroadKbMatches(q, 4);
  if (broadKbMatches.length > 0) {
    const primary = broadKbMatches[0];
    return {
      kind: "info",
      summary:
        primary.short ||
        `Dazu gibt es passende Inhalte in der steuerstoff-Wissensdatenbank: ${primary.title}.`,
      sections: kbSections(broadKbMatches),
      nextStep: "Die passenden Wissensbausteine prüfen und bei Bedarf den konkreten Sachverhalt ergänzen.",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: `Wissensdatenbank · ${primary.category}`,
      sources: broadKbMatches.map((entry) => ({
        id: entry.id,
        title: entry.title,
        reference: entry.references?.join(", ") ?? null,
        excerpt: entry.short ?? null,
      })),
      confidence: broadKbMatches.length >= 2 ? "high" : "medium",
    };
  }

  // --- Letzter Fallback: wirklich keine passende KB-Grundlage ---
  return {
    summary:
      "Dazu habe ich in der lokalen Wissensdatenbank noch keinen eindeutigen Treffer gefunden. Eine kurze Präzisierung zu Steuerart und Sachverhalt hilft.",
    followUps: [
      "Um welche Steuerart oder welches Bilanzthema geht es?",
      "Geht es um einen allgemeinen Überblick oder einen konkreten Fall?",
      "Welche Beträge und Zeiträume liegen vor?",
    ],
    nextStep: "Sachverhalt kurz ergänzen oder die Wissensdatenbank durchsuchen.",
    links: [
      { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      { label: "Neue Anfrage öffnen", to: "/neue-anfrage" },
    ],
  };'''

if fallback_old not in text:
    raise SystemExit('Expected final heuristic fallback not found')
text = text.replace(fallback_old, fallback_new, 1)

path.write_text(text, encoding='utf-8')

Path('scripts/add-kb-first-chat-fallback.py').unlink(missing_ok=True)
Path('.github/workflows/add-kb-first-chat-fallback-once.yml').unlink(missing_ok=True)
