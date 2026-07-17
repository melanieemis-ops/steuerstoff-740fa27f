/**
 * speech-utils.ts
 * Bereitet Text für die Browser-Sprachausgabe (Web Speech API) auf.
 */

/**
 * Teilt einen langen Text in sinnvolle Segmente von maximal `maxLen` Zeichen auf
 * (Standard: 800). Trennung erfolgt bevorzugt an Absätzen, dann an Satzgrenzen.
 */
export function segmentTextForSpeech(text: string, maxLen = 800): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const segments: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Paragraph fits in one segment
    if (current.length + trimmed.length + 1 <= maxLen) {
      current = current ? current + " " + trimmed : trimmed;
    } else {
      // Flush current
      if (current) {
        segments.push(current.trim());
        current = "";
      }
      // Split paragraph at sentence boundaries if too long
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const sentences = trimmed.split(/(?<=[.!?;])\s+/);
        for (const sentence of sentences) {
          if (current.length + sentence.length + 1 <= maxLen) {
            current = current ? current + " " + sentence : sentence;
          } else {
            if (current) segments.push(current.trim());
            // Hard-split overly long sentences
            if (sentence.length > maxLen) {
              let remaining = sentence;
              while (remaining.length > maxLen) {
                segments.push(remaining.slice(0, maxLen).trim());
                remaining = remaining.slice(maxLen).trim();
              }
              current = remaining;
            } else {
              current = sentence;
            }
          }
        }
      }
    }
  }

  if (current.trim()) segments.push(current.trim());

  return segments.filter((s) => s.length > 0);
}

/**
 * Bereitet den Markdown/HTML-Inhalt einer Assistentenantwort
 * für die Sprachausgabe auf.
 */
export function prepareTextForSpeech(content: string): string {
  let text = content;

  // 1. Codeblöcke entfernen und durch Platzhalter ersetzen
  text = text.replace(/```[\s\S]*?```/g, " Es folgt ein Codebeispiel. ");
  text = text.replace(/`[^`\n]+`/g, " ");

  // 2. HTML-Tags entfernen
  text = text.replace(/<[^>]+>/g, " ");

  // 3. HTML-Entitäten in einem einzigen Durchlauf ersetzen (vermeidet Doppel-Dekodierung)
  const htmlEntityMap: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "",
    "&gt;": "",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };
  text = text.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (match) => htmlEntityMap[match] ?? "");

  // 4. Markdown-Links → „Weiterführender Link."
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/https?:\/\/\S+/g, "Weiterführender Link.");

  // 5. Markdown-Überschriften: # Titel → „Titel."
  text = text.replace(/^#{1,6}\s+(.+)$/gm, "$1.");

  // 6. Markdown-Fettschrift und Kursivschrift
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "$1");
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/___(.+?)___/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");

  // 7. Markdown-Tabellen: Trennzeilen entfernen, Pipes durch Leerzeichen ersetzen
  text = text.replace(/^\|[-:| ]+\|$/gm, "");
  text = text.replace(/\|/g, " ");

  // 8. Aufzählungszeichen – Pause hinzufügen
  text = text.replace(/^[\s]*[-*+]\s+/gm, ". ");
  text = text.replace(/^[\s]*\d+\.\s+/gm, ". ");

  // 9. Zitat-Blöcke
  text = text.replace(/^>\s+/gm, "");

  // 10. Horizontale Trennlinien
  text = text.replace(/^[-*_]{3,}$/gm, "");

  // 11. Emojis entfernen (Unicode-Emoji-Property)
  text = text.replace(/\p{Emoji}/gu, "");

  // 12. Interne technische Marker / Sentinel-Strings entfernen
  text = text.replace(/<<[A-Z_]+>>/g, "");

  // 13. Mehrfach-Whitespace und Zeilenumbrüche bereinigen
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/\n/g, " ");

  // 14. Mehrfache Punkte bereinigen
  text = text.replace(/\.{2,}/g, ".");
  text = text.replace(/\.\s+\./g, ".");

  return text.trim();
}
