/**
 * /api/chat-tts
 *
 * Sichere TTS für Chat-Antworten.
 * - POST-Only, Body: { text: string }
 * - Rate-Limit best-effort in-memory pro IP (bei Serverless nur je Instanz).
 * - Normalisierung serverseitig via speech-normalize.
 * - ElevenLabs-Aufruf ausschließlich serverseitig mit Cloudflare-Secret.
 * - Feste Voice-ID, kein API-Key/Voice-ID im Frontend.
 * - Cache-Control: private, no-store (dynamische Inhalte).
 */

import { createFileRoute } from "@tanstack/react-router";
import { normalizeForSpeech } from "@/lib/speech-normalize";

const ELEVENLABS_VOICE_ID = "g1jpii0iyvtRs8fqXsd1";
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";
const MAX_TEXT_LENGTH = 5000;

function readServerSecret(name: string): string | undefined {
  const workerEnv = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const workerValue = workerEnv?.[name];
  if (typeof workerValue === "string" && workerValue.trim()) {
    return workerValue.trim();
  }

  const denoEnv = (
    globalThis as {
      Deno?: { env?: { get: (key: string) => string | undefined } };
    }
  ).Deno?.env;
  const denoValue = denoEnv?.get(name);
  if (typeof denoValue === "string" && denoValue.trim()) {
    return denoValue.trim();
  }

  const nodeValue = process.env[name];
  return typeof nodeValue === "string" && nodeValue.trim() ? nodeValue.trim() : undefined;
}

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

async function elevenLabsTts(opts: {
  apiKey: string;
  text: string;
  signal: AbortSignal;
}): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      "xi-api-key": opts.apiKey,
    },
    signal: opts.signal,
    body: JSON.stringify({
      model_id: ELEVENLABS_MODEL_ID,
      text: opts.text,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
      },
    }),
  },
  );
}

export const Route = createFileRoute("/api/chat-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = readServerSecret("ELEVENLABS_API_KEY");
        if (!apiKey) {
          return new Response("Audio derzeit nicht verfügbar.", { status: 503 });
        }

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

        const ip = getIp(request);
        if (!rateLimitCheck(ip)) {
          return new Response("Zu viele Audio-Anfragen. Bitte kurz warten.", {
            status: 429,
            headers: { "cache-control": "private, no-store" },
          });
        }

        let cleaned = trimmed;
        const metaIdx = cleaned.indexOf("<<STEUERSTOFF_META>>");
        if (metaIdx !== -1) cleaned = cleaned.slice(0, metaIdx);
        cleaned = normalizeForSpeech(cleaned).trim();
        if (!cleaned) {
          return new Response("Leerer Sprechtext.", { status: 400 });
        }
        const controller = new AbortController();
        request.signal?.addEventListener("abort", () => controller.abort());

        try {
          const upstream = await elevenLabsTts({
            apiKey,
            text: cleaned,
            signal: controller.signal,
          });

          if (!upstream.ok) {
            const status = upstream.status;
            const t = await upstream.text().catch(() => "");
            console.error("[steuerstoff-chat-tts] elevenlabs upstream", status, t.slice(0, 300));
            return new Response("Audio konnte nicht erzeugt werden.", {
              status: 502,
              headers: { "cache-control": "private, no-store" },
            });
          }

          const body = await upstream.arrayBuffer();
          const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";

          const headers = new Headers({
            "content-type": contentType,
            "cache-control": "private, no-store",
          });
          const upstreamLength = upstream.headers.get("content-length");
          if (upstreamLength) {
            headers.set("content-length", upstreamLength);
          }

          return new Response(body, {
            status: 200,
            headers,
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
