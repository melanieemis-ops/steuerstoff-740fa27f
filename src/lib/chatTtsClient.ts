/**
 * chatTtsClient.ts
 *
 * Session-Cache für Chat-Audio (Blob-URLs), gehasht per Antworttext.
 * Sorgt dafür, dass identische Antworten in derselben Browsersitzung
 * nur einmal beim Backend generiert werden. Object-URLs werden beim
 * Seiten-Unload freigegeben. Zusätzlich koordiniert dieses Modul,
 * dass immer nur eine Audioausgabe gleichzeitig läuft.
 */

const STOP_EVENT = "steuerstoff:audio-stop";

const cache = new Map<string, string>();

// FNV-1a 32-bit als kompakter Hash
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return "h" + h.toString(16) + "-" + text.length;
}

export function getCachedAudioUrl(key: string): string | undefined {
  return cache.get(key);
}

export function setCachedAudioUrl(key: string, url: string): void {
  cache.set(key, url);
}

/** Alle laufenden Audioausgaben stoppen (andere Chat-Antworten, Magazin, Browserstimme). */
export function requestStopAllAudio(source: string): void {
  if (typeof window === "undefined") return;
  try {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(STOP_EVENT, { detail: { source } }));
}

export function onAudioStop(cb: (source: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const src = (e as CustomEvent<{ source: string }>).detail?.source ?? "";
    cb(src);
  };
  window.addEventListener(STOP_EVENT, handler);
  return () => window.removeEventListener(STOP_EVENT, handler);
}

// Beim Seiten-Unload alle Blob-URLs freigeben.
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    for (const url of cache.values()) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    }
    cache.clear();
  });
}
