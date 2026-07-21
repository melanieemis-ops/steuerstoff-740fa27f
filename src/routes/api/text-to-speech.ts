import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const MAX_TEXT_LENGTH = 12000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 24;

const requestSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
  voiceId: z.string().trim().min(1).max(200).optional(),
  modelId: z.string().trim().min(1).max(100).optional(),
  profileId: z.string().trim().min(1).max(80).optional(),
});

const buckets = new Map<string, number[]>();

function getIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ??
    "unknown"
  );
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const active = (buckets.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (active.length >= RATE_LIMIT) {
    buckets.set(ip, active);
    return false;
  }
  active.push(now);
  buckets.set(ip, active);
  return true;
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}

function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    const parsed = new URL(origin);
    return parsed.host === host;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/text-to-speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!assertSameOrigin(request)) {
          return jsonError(403, "Nicht erlaubt.");
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return jsonError(503, "Die Sprachausgabe ist derzeit nicht verfuegbar.");
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return jsonError(415, "Ungueltiger Content-Type.");
        }

        const ip = getIp(request);
        if (!rateLimit(ip)) {
          return jsonError(429, "Zu viele Anfragen. Bitte warte einen Moment.");
        }

        const rawBody = await request.json().catch(() => null);
        const parsed = requestSchema.safeParse(rawBody);
        if (!parsed.success) {
          return jsonError(400, "Ungueltige Anfrage.");
        }

        const preparedText = prepareTextForSpeech(parsed.data.text);
        if (!preparedText) {
          return jsonError(400, "Der Text ist leer oder ungueltig.");
        }

        if (preparedText.length > MAX_TEXT_LENGTH) {
          return jsonError(413, "Der Text ist zu lang und muss in Abschnitte geteilt werden.");
        }

        const configuredVoiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
        const configuredModelId = process.env.ELEVENLABS_MODEL_ID?.trim();

        const voiceId = parsed.data.voiceId?.trim() || configuredVoiceId;
        if (!voiceId) {
          return jsonError(503, "Es ist keine ElevenLabs Voice-ID konfiguriert.");
        }

        const modelId = parsed.data.modelId?.trim() || configuredModelId || DEFAULT_TTS_MODEL_ID;
        const profile = getVoiceProfile(parsed.data.profileId);

        const upstreamController = new AbortController();
        request.signal.addEventListener("abort", () => upstreamController.abort());

        const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "audio/mpeg",
            "xi-api-key": apiKey,
          },
          signal: upstreamController.signal,
          body: JSON.stringify({
            text: preparedText,
            model_id: modelId,
            voice_settings: {
              stability: profile.stability,
              similarity_boost: profile.similarityBoost,
              style: profile.style,
              use_speaker_boost: profile.useSpeakerBoost,
            },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const errorText = await upstream.text().catch(() => "");
          if (upstream.status === 401 || upstream.status === 403) {
            return jsonError(502, "Die Sprachausgabe konnte nicht autorisiert werden.");
          }
          if (upstream.status === 429) {
            return jsonError(429, "Die Sprachausgabe ist ausgelastet. Bitte erneut versuchen.");
          }
          if (upstream.status === 413) {
            return jsonError(413, "Der Text ist zu lang und wird in Abschnitten vorgelesen.");
          }
          if (errorText) {
            return jsonError(502, "Die Sprachausgabe konnte gerade nicht geladen werden.");
          }
          return jsonError(502, "Die Sprachausgabe konnte gerade nicht geladen werden.");
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "private, no-store",
            "x-tts-provider": "elevenlabs",
            "x-tts-model": modelId,
            "x-tts-voice-id": voiceId,
            "x-tts-profile-id": profile.id,
          },
        });
      },
    },
  },
});
