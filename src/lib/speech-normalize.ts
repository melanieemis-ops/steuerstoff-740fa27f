/**
 * speech-normalize.ts
 *
 * Zentrale Normalisierung von Fachtexten für die Sprachausgabe
 * (Web Speech API und OpenAI TTS). Sowohl im Browser als auch
 * serverseitig verwendbar.
 */

export function normalizeForSpeech(text: string): string {
  let t = text;

  // Markdown/URLs entfernen
  t = t.replace(/```[\s\S]*?```/g, " ");
  t = t.replace(/`[^`\n]+`/g, " ");
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  t = t.replace(/https?:\/\/\S+/g, " ");
  t = t.replace(/\*\*(.+?)\*\*/g, "$1");
  t = t.replace(/\*(.+?)\*/g, "$1");
  t = t.replace(/_{1,3}(.+?)_{1,3}/g, "$1");

  // Typografische Zeichen vereinheitlichen
  t = t.replace(/[‚‘’]/g, "'").replace(/[„“”]/g, '"');
  t = t.replace(/\u00A0/g, " ");

  // Aufzählungen
  t = t.replace(/^[\s]*[-*•]\s+/gm, "");
  t = t.replace(/^[\s]*\d+[.)]\s+/gm, "");

  // Rechtsnormen und Abkürzungen
  t = t.replace(/§§/g, "Paragrafen");
  t = t.replace(/§/g, "Paragraf");
  // alphanumerische Normen: "50c" -> "50 c"
  t = t.replace(/(\d+)([a-zA-Z])\b/g, "$1 $2");
  t = t.replace(/\bAbs\.\s?/g, "Absatz ");
  t = t.replace(/\bNr\.\s?/g, "Nummer ");
  t = t.replace(/\bBuchst\.\s?/g, "Buchstabe ");
  t = t.replace(/\bS\.\s?(\d)/g, "Satz $1");

  t = t.replace(/\bEStG\b/g, "Einkommensteuergesetz");
  t = t.replace(/\bUStG\b/g, "Umsatzsteuergesetz");
  t = t.replace(/\bAO\b/g, "Abgabenordnung");
  t = t.replace(/\bKStG\b/g, "Körperschaftsteuergesetz");
  t = t.replace(/\bGewStG\b/g, "Gewerbesteuergesetz");
  t = t.replace(/\bBGB\b/g, "Bürgerliches Gesetzbuch");
  t = t.replace(/\bBFH\b/g, "Bundesfinanzhof");
  t = t.replace(/\bBMF\b/g, "Bundesministerium der Finanzen");
  t = t.replace(/\bEuGH\b/g, "Europäischer Gerichtshof");
  t = t.replace(/\bEWR\b/g, "Europäischer Wirtschaftsraum");
  t = t.replace(/\bEU\b/g, "Europäische Union");
  t = t.replace(/\bHGB\b/g, "Handelsgesetzbuch");
  t = t.replace(/\bBVerfG\b/g, "Bundesverfassungsgericht");

  // Whitespace bereinigen
  t = t.replace(/[ \t]{2,}/g, " ");
  t = t.replace(/\s+([,.;:!?])/g, "$1");
  t = t.replace(/\.{2,}/g, ".");

  return t.trim();
}
