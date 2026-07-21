/**
 * tts-normalize.ts
 * Bereitet Klausurtexte nur fuer die Sprachausgabe auf.
 */

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bzzgl\./gi, "zuzueglich"],
  [/\bi\.\s*H\.\s*v\./gi, "in Hoehe von"],
  [/\bNr\./gi, "Nummer"],
  [/\bAbs\./gi, "Absatz"],
  [/\bS\./gi, "Satz"],
  [/\bUStG\b/g, "Umsatzsteuergesetz"],
  [/\bUSt\b/g, "Umsatzsteuer"],
  [/\bAO\b/g, "Abgabenordnung"],
  [/\bEStG\b/g, "Einkommensteuergesetz"],
  [/\bBMF\b/g, "Bundesministerium der Finanzen"],
  [/§/g, "Paragraph"],
];

export function normalizeTextForSpeech(input: string): string {
  let text = input;

  // Entfernt reine Markup-/UI-Reste, ohne den sichtbaren Text in der UI zu aendern.
  text = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
    .replace(/[\u2600-\u27BF]/g, " ");

  for (const [pattern, replacement] of REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  // Datumswerte wie 01.01.2025 leicht sprechbarer machen.
  text = text.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g, "$1. $2. $3");

  return text
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
