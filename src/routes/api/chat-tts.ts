/**
 * /api/chat-tts
 *
 * Sichere TTS für Chat-Antworten.
 * - POST-Only, Body: { text: string }
 * - Rate-Limit best-effort in-memory pro IP (bei Serverless nur je Instanz).
 * - Normalisierung serverseitig via speech-normalize.
 * - Modell-Fallback-Kette wie /api/tts.
 * - Cache-Control: private, no-store (dynamische Inhalte).
 */

import { createFileRoute } from "@tanstack/react-router";
import { normalizeForSpeech } from "@/lib/speech-normalize";

const PRIMARY_MODEL = "gpt-4o-mini-tts-2025-12-15";
const SECONDARY_MODEL = "gpt-4o-mini-tts";
const FALLBACK_MODEL = "tts-1-hd";
const PRIMARY_VOICE = "marin";
const FALLBACK_VOICE = "nova";

const SPEECH_INSTRUCTIONS =
  "Sprich natürliches Hochdeutsch, warm, kompetent, souverän, ruhig und klar – wie die professionelle Sprecherin eines modernen steuerrechtlichen Fachmagazins. Rechtsnormen wie Paragrafen, Absätze, Sätze, Nummern und Gesetzesnamen deutlich und klar artikulieren.";

const MAX_TEXT_LENGTH = 8000;
const CHUNK_TARGET = 2500;

// ── Rate-Limit (best-effort; auf Serverless nur pro Instanz gültig) ──────────
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const rateBuckets = new Map<string, number[]>();

function rateLimitCheck(ip: string): boolean {
  const now = Date.now();
  const arr = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    rateBuckets.set(ip, arr);
    return false;
  }
  arr.push(now);
  rateBuckets.set(ip, arr);
  // Aufräumen
  if (rateBuckets.size > 500) {
    for (const [k, v] of rateBuckets) {
      if (!v.some((t) => now - t < RATE_WINDOW_MS)) rateBuckets.delete(k);
    }
  }
  return true;
}

function getIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ??
    "unknown"
  );
}

function chunkText(text: string, target: number): string[] {
  if (text.length <= target) return [text];
  const parts: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let cur = "";
  for (const s of sentences) {
    if ((cur + " " + s).trim().length > target && cur) {
      parts.push(cur.trim());
      cur = s;
    } else {
      cur = (cur + " " + s).trim();
    }
  }
  if (cur) parts.push(cur.trim());
  return parts.filter(Boolean);
}

async function ttsChunk(opts: {
  apiKey: string;
  model: string;
  voice: string;
  input: string;
  useInstructions: boolean;
  signal: AbortSignal;
}): Promise<Response> {
  const body: Record<string, unknown> = {
    model: opts.model,
    voice: opts.voice,
    input: opts.input,
    response_format: "mp3",
  };
  if (opts.useInstructions) body.instructions = SPEECH_INSTRUCTIONS;
  return fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    signal: opts.signal,
    body: JSON.stringify(body),
  });
}

export const Route = createFileRoute("/api/chat-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return new Response("Audio derzeit nicht verfügbar.", { status: 503 });
        }

        // Same-origin best-effort: Origin muss zum Host passen, falls gesetzt.
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");
        if (origin && host) {
          try {
            const o = new URL(origin);
            if (o.host !== host) {
              return new Response("Forbidden.", { status: 403 });
            }
          } catch {
            return new Response("Forbidden.", { status: 403 });
          }
        }

        // Content-Type prüfen
        const ct = request.headers.get("content-type") ?? "";
        if (!ct.toLowerCase().includes("application/json")) {
          return new Response("Ungültiger Content-Type.", { status: 415 });
        }

        let parsed: unknown;
        try {
          parsed = await request.json();
        } catch {
          return new Response("Ungültiges JSON.", { status: 400 });
        }
        if (!parsed || typeof parsed !== "object") {
          return new Response("Ungültiger Body.", { status: 400 });
        }
        const rawText = (parsed as { text?: unknown }).text;
        if (typeof rawText !== "string") {
          return new Response("text fehlt.", { status: 400 });
        }
        const trimmed = rawText.trim();
        if (!trimmed) {
          return new Response("Leerer Text.", { status: 400 });
        }
        if (trimmed.length > MAX_TEXT_LENGTH) {
          return new Response("Text zu lang.", { status: 413 });
        }

        // Rate-Limit
        const ip = getIp(request);
        if (!rateLimitCheck(ip)) {
          return new Response("Zu viele Audio-Anfragen. Bitte kurz warten.", {
            status: 429,
            headers: { "cache-control": "private, no-store" },
          });
        }

        // Metadaten/Sentinel und Markdown vor der Vertonung entfernen.
        let cleaned = trimmed;
        const metaIdx = cleaned.indexOf("<<STEUERSTOFF_META>>");
        if (metaIdx !== -1) cleaned = cleaned.slice(0, metaIdx);
        cleaned = normalizeForSpeech(cleaned).trim();
        if (!cleaned) {
          return new Response("Leerer Sprechtext.", { status: 400 });
        }

        const chunks = chunkText(cleaned, CHUNK_TARGET);
        const controller = new AbortController();
        request.signal?.addEventListener("abort", () => controller.abort());

        let modelUsed = PRIMARY_MODEL;
        let voiceUsed = PRIMARY_VOICE;
        let useInstructions = true;

        const tryChain = async (input: string): Promise<Response> => {
          let r = await ttsChunk({
            apiKey,
            model: PRIMARY_MODEL,
            voice: PRIMARY_VOICE,
            input,
            useInstructions: true,
            signal: controller.signal,
          });
          if (r.ok) return r;
          const err1 = await r.text().catch(() => "");
          if (r.status === 404 || /model_not_found|deprecated|does not exist/i.test(err1)) {
            r = await ttsChunk({
              apiKey,
              model: SECONDARY_MODEL,
              voice: PRIMARY_VOICE,
              input,
              useInstructions: true,
              signal: controller.signal,
            });
            if (r.ok) {
              modelUsed = SECONDARY_MODEL;
              return r;
            }
            const err2 = await r.text().catch(() => "");
            if (/voice/i.test(err2) && /invalid|unknown|not/i.test(err2)) {
              r = await ttsChunk({
                apiKey,
                model: SECONDARY_MODEL,
                voice: FALLBACK_VOICE,
                input,
                useInstructions: true,
                signal: controller.signal,
              });
              if (r.ok) {
                modelUsed = SECONDARY_MODEL;
                voiceUsed = FALLBACK_VOICE;
                return r;
              }
            }
            r = await ttsChunk({
              apiKey,
              model: FALLBACK_MODEL,
              voice: FALLBACK_VOICE,
              input,
              useInstructions: false,
              signal: controller.signal,
            });
            if (r.ok) {
              modelUsed = FALLBACK_MODEL;
              voiceUsed = FALLBACK_VOICE;
              useInstructions = false;
              return r;
            }
          }
          return r;
        };

        try {
          const first = await tryChain(chunks[0]);
          if (!first.ok) {
            const status = first.status;
            const t = await first.text().catch(() => "");
            console.error("[steuerstoff-chat-tts] upstream", status, t.slice(0, 300));
            return new Response("Audio konnte nicht erzeugt werden.", {
              status: 502,
              headers: { "cache-control": "private, no-store" },
            });
          }
          const parts: Uint8Array[] = [new Uint8Array(await first.arrayBuffer())];
          for (let i = 1; i < chunks.length; i++) {
            const r = await ttsChunk({
              apiKey,
              model: modelUsed,
              voice: voiceUsed,
              input: chunks[i],
              useInstructions,
              signal: controller.signal,
            });
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              console.error("[steuerstoff-chat-tts] chunk", i, r.status, t.slice(0, 200));
              return new Response("Audio konnte nicht erzeugt werden.", {
                status: 502,
                headers: { "cache-control": "private, no-store" },
              });
            }
            parts.push(new Uint8Array(await r.arrayBuffer()));
          }
          const total = parts.reduce((n, p) => n + p.byteLength, 0);
          const merged = new Uint8Array(total);
          let offset = 0;
          for (const p of parts) {
            merged.set(p, offset);
            offset += p.byteLength;
          }
          return new Response(merged, {
            status: 200,
            headers: {
              "content-type": "audio/mpeg",
              "content-length": String(total),
              "cache-control": "private, no-store",
            },
          });
        } catch (e) {
          if (request.signal?.aborted) return new Response(null, { status: 499 });
          console.error("[steuerstoff-chat-tts] error", e);
          return new Response("Audio konnte nicht erzeugt werden.", {
            status: 502,
            headers: { "cache-control": "private, no-store" },
          });
        }
      },
    },
  },
});
