/**
 * articleSpeechText.ts
 *
 * Baut den Sprechtext für einen erlaubten Magazin-Artikel serverseitig
 * ausschließlich aus dessen bekannten Daten auf. Keine Nutzereingaben
 * werden an das TTS-Modell durchgereicht.
 */

import { magazineArticles, type MagazineArticle } from "@/data/magazineArticles";
import { normalizeForSpeech } from "./speech-normalize";

/** Whitelist erlaubter Artikel für TTS (nur diese IDs werden vertont). */
export const AUDIO_ALLOWED_ARTICLE_IDS: readonly string[] = ["jstg-2026-einkommensteuer"];

/** Aktuelle Inhaltsversion – bei inhaltlichen Änderungen erhöhen. */
export const AUDIO_CONTENT_VERSION = "3";

/** Zielsegmentgröße in Zeichen für die Playlist-Segmente (satzsauber). */
export const AUDIO_SEGMENT_TARGET_CHARS = 1100;
export const AUDIO_SEGMENT_MAX_CHARS = 1200;

/** Grobe Schätzung Sprechdauer: ~15 Zeichen pro Sekunde in ruhigem Fach-Deutsch. */
export function estimateSpeechSeconds(text: string): number {
  return Math.max(1, Math.round(text.length / 15));
}

/**
 * Deterministische satzsaubere Segmentierung des vollständigen Sprechtexts.
 * Bei identischem Text stabil, kein Segment > AUDIO_SEGMENT_MAX_CHARS.
 */
export function segmentSpeechText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const sentences: string[] = [];
  for (const para of paragraphs) {
    const parts = para.match(/[^.!?]+[.!?]+(?:["»)\]]+)?|\S[^.!?]*$/g) ?? [para];
    for (const p of parts) {
      const s = p.trim();
      if (!s) continue;
      if (s.length <= AUDIO_SEGMENT_MAX_CHARS) {
        sentences.push(s);
      } else {
        // Notfall-Split zuerst an Kommas/Semikolons/Doppelpunkten
        const sub = s.split(/(?<=[,;:])\s+/);
        const pushWithWordSplit = (piece: string) => {
          let rest = piece.trim();
          while (rest.length > AUDIO_SEGMENT_MAX_CHARS) {
            // Wortsauber am letzten Leerzeichen vor der Grenze schneiden;
            // notfalls (extrem langes „Wort") hart am Limit.
            let cut = rest.lastIndexOf(" ", AUDIO_SEGMENT_MAX_CHARS);
            if (cut < 200) cut = AUDIO_SEGMENT_MAX_CHARS;
            sentences.push(rest.slice(0, cut).trim());
            rest = rest.slice(cut).trim();
          }
          if (rest) sentences.push(rest);
        };
        let buf = "";
        for (const part of sub) {
          if ((buf + " " + part).trim().length > AUDIO_SEGMENT_MAX_CHARS && buf) {
            pushWithWordSplit(buf);
            buf = part;
          } else {
            buf = buf ? buf + " " + part : part;
          }
        }
        if (buf.trim()) pushWithWordSplit(buf);
      }
    }
  }

  const segments: string[] = [];
  let current = "";
  for (const s of sentences) {
    if (!current) {
      current = s;
      continue;
    }
    const merged = current + " " + s;
    if (merged.length <= AUDIO_SEGMENT_TARGET_CHARS) {
      current = merged;
    } else if (current.length < 400 && merged.length <= AUDIO_SEGMENT_MAX_CHARS) {
      // Zu kurzes Segment weiter füllen, wenn wir unter Max bleiben
      current = merged;
    } else {
      segments.push(current);
      current = s;
    }
  }
  if (current.trim()) segments.push(current.trim());
  return segments;
}

export function isAudioAllowed(articleId: string): boolean {
  return AUDIO_ALLOWED_ARTICLE_IDS.includes(articleId);
}

function blockToSpeech(block: MagazineArticle["blocks"][number]): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "subheading":
      return block.text;
    case "notice":
      return block.text;
    case "legalStatus":
      return `${block.label}: ${block.text}`;
    case "list":
      return block.items.join(". ");
    case "summary":
      return `${block.title}. ${block.items.join(". ")}`;
    case "keyNumbers":
      return `${block.title}. ${block.items.map((n) => `${n.big}: ${n.label}`).join(". ")}`;
    case "change":
      return [
        `Änderung ${block.number}: ${block.title}.`,
        `Fundstelle: ${block.lawRef}.`,
        ...block.paragraphs,
        ...(block.list ?? []),
        block.practice ? `Für die Praxis: ${block.practice}` : "",
        block.effective ? `Geplantes Inkrafttreten: ${block.effective}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "editorial":
      return `${block.title}. ${block.paragraphs.join(" ")}`;
    case "checklist":
      // Interaktive Checkliste – Zustände nicht mitsprechen, nur Punkte nennen
      return `${block.title}. ${block.items.join(". ")}`;
    case "sourceLink":
      // Nur Titel und Beschreibung, keine URL
      return `${block.title}. ${block.text}`;
    default:
      return "";
  }
}

export function buildArticleSpeechText(articleId: string): string | null {
  if (!isAudioAllowed(articleId)) return null;
  const article = magazineArticles.find((a) => a.id === articleId);
  if (!article) return null;

  const parts: string[] = [];
  parts.push(article.title + ".");
  if (article.subtitle) parts.push(article.subtitle + ".");
  if (article.author) parts.push(`Von ${article.author}.`);
  parts.push(article.lead);
  for (const b of article.blocks) {
    const s = blockToSpeech(b);
    if (s) parts.push(s);
  }
  parts.push("Sie haben eine KI-generierte Audiofassung von steuerstoff gehört.");

  return normalizeForSpeech(parts.join("\n\n"));
}

/**
 * Teilt einen Text an Absatzgrenzen in Chunks von maximal ~maxChars Zeichen,
 * ohne Sätze zu zerschneiden.
 */
export function chunkSpeechText(text: string, maxChars = 2500): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  const pushSentences = (sentences: string[]) => {
    for (const s of sentences) {
      if (!s) continue;
      if ((current + " " + s).length > maxChars && current) {
        flush();
      }
      current = current ? current + " " + s : s;
    }
  };

  for (const para of paragraphs) {
    if (para.length <= maxChars && (current + " " + para).length <= maxChars) {
      current = current ? current + " " + para : para;
      continue;
    }
    if (current) flush();
    if (para.length <= maxChars) {
      current = para;
    } else {
      const sentences = para.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [para];
      pushSentences(sentences.map((s) => s.trim()));
    }
  }
  flush();
  return chunks;
}
