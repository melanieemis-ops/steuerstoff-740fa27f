/**
 * /api/tts
 *
 * Serverseitige, sichere TTS-Ausgabe für whitelisted Magazin-Artikel.
 * - GET-Parameter: articleId (whitelist), v (Inhaltsversion)
 * - Der Sprechtext wird ausschließlich aus den bekannten Artikeldaten aufgebaut.
 * - Modell-Wahl mit Fallback: gpt-4o-mini-tts-2025-12-15 → gpt-4o-mini-tts → tts-1-hd
 * - OpenAI liefert PCM16 (mono, 24 kHz, LE); Server verpackt alle Chunks in
 *   einen einzigen, validen WAV-Stream, damit Safari/iOS die Dauer korrekt
 *   erkennt (MP3-Konkatenation war dort nicht seekbar).
 * - Antwort: audio/wav
 * - Cache: public, immutable pro (articleId, v)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  AUDIO_CONTENT_VERSION,
  buildArticleSpeechText,
  chunkSpeechText,
  isAudioAllowed,
} from "@/lib/articleSpeechText";
import { mapWithConcurrency, pcmChunksToWav } from "@/lib/audioWav";

const PRIMARY_MODEL = "gpt-4o-mini-tts-2025-12-15";
const SECONDARY_MODEL = "gpt-4o-mini-tts";
const FALLBACK_MODEL = "tts-1-hd";

const PRIMARY_VOICE = "marin";
const FALLBACK_VOICE = "nova";

const CHUNK_CONCURRENCY = 3;

const SPEECH_INSTRUCTIONS =
  "Sprich natürliches Hochdeutsch, warm, kompetent, souverän, ruhig und klar – wie die professionelle Sprecherin eines modernen steuerrechtlichen Fachmagazins. Nicht werblich, nicht übertrieben, sachlich präzise. Rechtsnormen wie Paragrafen, Absätze, Sätze, Nummern und Gesetzesnamen deutlich, langsam und klar artikulieren.";

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
    response_format: "pcm",
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

function friendlyError(status: number): string {
  if (status === 429) return "Audio derzeit ausgelastet. Bitte in einem Moment erneut versuchen.";
  return "Audio konnte nicht erzeugt werden.";
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return new Response("Audio derzeit nicht verfügbar.", { status: 503 });
        }

        const url = new URL(request.url);
        const articleId = (url.searchParams.get("articleId") ?? "").trim();
        const v = (url.searchParams.get("v") ?? "").trim();

        if (!articleId || !isAudioAllowed(articleId)) {
          return new Response("Unbekannter Artikel.", { status: 404 });
        }
        if (v !== AUDIO_CONTENT_VERSION) {
          return new Response("Ungültige Version.", { status: 400 });
        }

        const speechText = buildArticleSpeechText(articleId);
        if (!speechText) {
          return new Response("Kein Sprechtext verfügbar.", { status: 404 });
        }

        const chunks = chunkSpeechText(speechText, 2500);
        const controller = new AbortController();
        request.signal?.addEventListener("abort", () => controller.abort());

        // Erst mit dem ersten Chunk die Modellkette festlegen, danach die
        // restlichen Chunks parallel mit derselben Konfiguration abrufen.
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
          const errTxt1 = await r.text().catch(() => "");
          if (r.status === 404 || /model_not_found|deprecated|does not exist/i.test(errTxt1)) {
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
            const errTxt2 = await r.text().catch(() => "");
            const voiceInvalid = /voice/i.test(errTxt2) && /invalid|unknown|not/i.test(errTxt2);
            if (voiceInvalid) {
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
            if (r.status === 404 || /model_not_found|deprecated/i.test(errTxt2)) {
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
          }
          return r;
        };

        const firstResp = await tryChain(chunks[0]);
        if (!firstResp.ok) {
          const status = firstResp.status;
          const bodyTxt = await firstResp.text().catch(() => "");
          console.error("[steuerstoff-tts] upstream error", status, bodyTxt.slice(0, 300));
          return new Response(friendlyError(status), { status: 502 });
        }

        const pcmParts: Uint8Array[] = new Array(chunks.length);
        pcmParts[0] = new Uint8Array(await firstResp.arrayBuffer());

        if (chunks.length > 1) {
          try {
            const rest = chunks.slice(1);
            const results = await mapWithConcurrency(rest, CHUNK_CONCURRENCY, async (input) => {
              const r = await ttsChunk({
                apiKey,
                model: modelUsed,
                voice: voiceUsed,
                input,
                useInstructions,
                signal: controller.signal,
              });
              if (!r.ok) {
                const t = await r.text().catch(() => "");
                throw new Error(`chunk ${r.status}: ${t.slice(0, 200)}`);
              }
              return new Uint8Array(await r.arrayBuffer());
            });
            for (let i = 0; i < results.length; i++) {
              pcmParts[i + 1] = results[i];
            }
          } catch (e) {
            if (request.signal?.aborted) return new Response(null, { status: 499 });
            console.error("[steuerstoff-tts] chunk error", e);
            return new Response(friendlyError(502), { status: 502 });
          }
        }

        const wav = pcmChunksToWav(pcmParts);
        return new Response(wav, {
          status: 200,
          headers: {
            "content-type": "audio/wav",
            "content-length": String(wav.byteLength),
            "cache-control": "public, max-age=31536000, immutable",
            "x-steuerstoff-tts-model": modelUsed,
            "x-steuerstoff-tts-voice": voiceUsed,
          },
        });
      },
    },
  },
});
