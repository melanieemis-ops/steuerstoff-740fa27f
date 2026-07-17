/**
 * /api/tts – Segmentierte Magazin-Audioarchitektur (v3)
 *
 * Zwei GET-Modi:
 *  - Manifest: ?articleId=...&v=3&manifest=1 → JSON mit Segment-URLs
 *  - Segment : ?articleId=...&v=3&segment=N  → einzelne, gültige MP3
 *
 * Grund: iOS/Safari brach bei einer 49 MB großen Gesamt-WAV mit ~70 s TTFB
 * ab. Kleine, sofort abspielbare MP3-Segmente lösen das Problem, ohne dass
 * Segmente byteweise konkateniert werden.
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  AUDIO_CONTENT_VERSION,
  buildArticleSpeechText,
  estimateSpeechSeconds,
  isAudioAllowed,
  segmentSpeechText,
} from "@/lib/articleSpeechText";

const PRIMARY_MODEL = "gpt-4o-mini-tts-2025-12-15";
const SECONDARY_MODEL = "gpt-4o-mini-tts";
const FALLBACK_MODEL = "tts-1-hd";

const PRIMARY_VOICE = "marin";
const FALLBACK_VOICE = "nova";

const SPEECH_INSTRUCTIONS =
  "Sprich natürliches Hochdeutsch, warm, kompetent, souverän, ruhig und klar – wie die professionelle Sprecherin eines modernen steuerrechtlichen Fachmagazins. Nicht werblich, nicht übertrieben, sachlich präzise. Rechtsnormen wie Paragrafen, Absätze, Sätze, Nummern und Gesetzesnamen deutlich, langsam und klar artikulieren.";

async function ttsCall(opts: {
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

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function generateSegment(
  apiKey: string,
  input: string,
  signal: AbortSignal,
): Promise<{ ok: true; bytes: Uint8Array; model: string; voice: string } | { ok: false; status: number; message: string }> {
  // Fallback-Kette identisch zur bisherigen Logik.
  let r = await ttsCall({
    apiKey,
    model: PRIMARY_MODEL,
    voice: PRIMARY_VOICE,
    input,
    useInstructions: true,
    signal,
  });
  if (r.ok) {
    return { ok: true, bytes: new Uint8Array(await r.arrayBuffer()), model: PRIMARY_MODEL, voice: PRIMARY_VOICE };
  }
  const err1 = await r.text().catch(() => "");
  if (r.status === 404 || /model_not_found|deprecated|does not exist/i.test(err1)) {
    r = await ttsCall({
      apiKey,
      model: SECONDARY_MODEL,
      voice: PRIMARY_VOICE,
      input,
      useInstructions: true,
      signal,
    });
    if (r.ok) {
      return { ok: true, bytes: new Uint8Array(await r.arrayBuffer()), model: SECONDARY_MODEL, voice: PRIMARY_VOICE };
    }
    const err2 = await r.text().catch(() => "");
    const voiceInvalid = /voice/i.test(err2) && /invalid|unknown|not/i.test(err2);
    if (voiceInvalid) {
      r = await ttsCall({
        apiKey,
        model: SECONDARY_MODEL,
        voice: FALLBACK_VOICE,
        input,
        useInstructions: true,
        signal,
      });
      if (r.ok) {
        return { ok: true, bytes: new Uint8Array(await r.arrayBuffer()), model: SECONDARY_MODEL, voice: FALLBACK_VOICE };
      }
    }
    if (r.status === 404 || /model_not_found|deprecated/i.test(err2)) {
      r = await ttsCall({
        apiKey,
        model: FALLBACK_MODEL,
        voice: FALLBACK_VOICE,
        input,
        useInstructions: false,
        signal,
      });
      if (r.ok) {
        return { ok: true, bytes: new Uint8Array(await r.arrayBuffer()), model: FALLBACK_MODEL, voice: FALLBACK_VOICE };
      }
    }
  }
  const bodyTxt = await r.text().catch(() => "");
  console.error("[steuerstoff-tts] upstream error", r.status, bodyTxt.slice(0, 300));
  const message = r.status === 429
    ? "Audio derzeit ausgelastet. Bitte in einem Moment erneut versuchen."
    : "Audioabschnitt konnte nicht erzeugt werden.";
  return { ok: false, status: 502, message };
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const articleId = (url.searchParams.get("articleId") ?? "").trim();
        const v = (url.searchParams.get("v") ?? "").trim();
        const manifestFlag = url.searchParams.get("manifest") === "1";
        const hlsFlag = url.searchParams.get("hls") === "1";
        const segmentParam = url.searchParams.get("segment");

        if (!articleId || !isAudioAllowed(articleId)) {
          return jsonError(404, "Unbekannter Artikel.");
        }
        if (v !== AUDIO_CONTENT_VERSION) {
          return jsonError(400, "Ungültige Audio-Version.");
        }

        const speechText = buildArticleSpeechText(articleId);
        if (!speechText) {
          return jsonError(404, "Kein Sprechtext verfügbar.");
        }

        const segments = segmentSpeechText(speechText);

        // Manifest-Modus – kein OpenAI-Aufruf.
        if (manifestFlag) {
          const base = `/api/tts?articleId=${encodeURIComponent(articleId)}&v=${encodeURIComponent(v)}`;
          const manifest = {
            version: v,
            articleId,
            segmentCount: segments.length,
            estimatedDurationSeconds: estimateSpeechSeconds(speechText),
            segments: segments.map((s, i) => ({
              index: i,
              url: `${base}&segment=${i}`,
              chars: s.length,
              estimatedSeconds: estimateSpeechSeconds(s),
            })),
          };
          return new Response(JSON.stringify(manifest), {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "public, max-age=3600",
              "x-steuerstoff-audio-version": v,
            },
          });
        }

        // HLS-Modus – VOD-Media-Playlist, kein OpenAI-Aufruf.
        // EXTINF-Dauern beruhen auf der deterministischen Schätzung
        // (estimateSpeechSeconds). Native HLS-Player (Safari/iOS) lädt die
        // Segmente selbstständig nach; tatsächliche Dauern werden vom
        // Decoder pro Segment ermittelt, die Schätzung dient nur zur
        // initialen Playlist-Struktur (TARGETDURATION/EXTINF).
        if (hlsFlag) {
          const base = `/api/tts?articleId=${encodeURIComponent(articleId)}&v=${encodeURIComponent(v)}`;
          const segDurations = segments.map((s) => {
            const d = estimateSpeechSeconds(s);
            return Number.isFinite(d) && d > 0 ? d : 1;
          });
          const targetDuration = Math.max(1, Math.ceil(Math.max(...segDurations)));
          const lines: string[] = [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            "#EXT-X-PLAYLIST-TYPE:VOD",
            "#EXT-X-MEDIA-SEQUENCE:0",
            `#EXT-X-TARGETDURATION:${targetDuration}`,
          ];
          for (let i = 0; i < segments.length; i++) {
            // Jedes Segment ist eine unabhängig erzeugte MP3-Datei →
            // Discontinuity zwischen den Segmenten, damit der Decoder
            // sauber neu initialisiert.
            if (i > 0) lines.push("#EXT-X-DISCONTINUITY");
            lines.push(`#EXTINF:${segDurations[i].toFixed(1)},`);
            lines.push(`${base}&segment=${i}`);
          }
          lines.push("#EXT-X-ENDLIST");
          return new Response(lines.join("\n") + "\n", {
            status: 200,
            headers: {
              "content-type": "application/vnd.apple.mpegurl; charset=utf-8",
              "cache-control": "public, max-age=3600",
              "x-steuerstoff-audio-version": v,
            },
          });
        }

        // Segment-Modus
        if (segmentParam !== null) {
          const idx = Number.parseInt(segmentParam, 10);
          if (!Number.isInteger(idx) || idx < 0 || idx >= segments.length) {
            return jsonError(400, "Ungültiger Segment-Index.");
          }
          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return jsonError(503, "Audio derzeit nicht verfügbar.");
          }
          const controller = new AbortController();
          request.signal?.addEventListener("abort", () => controller.abort());

          const result = await generateSegment(apiKey, segments[idx], controller.signal);
          if (!result.ok) {
            if (request.signal?.aborted) return new Response(null, { status: 499 });
            return jsonError(result.status, result.message);
          }
          const bytes = result.bytes;
          const body: ArrayBuffer = bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength,
          ) as ArrayBuffer;
          return new Response(body, {
            status: 200,
            headers: {
              "content-type": "audio/mpeg",
              "content-length": String(bytes.byteLength),
              "cache-control": "public, max-age=31536000, immutable",
              "x-steuerstoff-tts-model": result.model,
              "x-steuerstoff-tts-voice": result.voice,
              "x-steuerstoff-tts-segment": String(idx),
              "x-steuerstoff-tts-segment-count": String(segments.length),
              "x-steuerstoff-audio-version": v,
            },
          });
        }

        return jsonError(
          400,
          "Bitte manifest=1 oder segment=N angeben. Die Gesamtdatei wird nicht mehr erzeugt.",
        );
      },
    },
  },
});
