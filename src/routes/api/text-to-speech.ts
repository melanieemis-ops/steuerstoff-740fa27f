import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const MAX_TEXT_LENGTH = 12000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 24;
const FUNCTION_NAME = "api/text-to-speech";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

type TtsErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_API_KEY"
  | "VOICE_NOT_AVAILABLE"
  | "VOICE_NOT_FOUND"
  | "QUOTA_EXCEEDED"
  | "ELEVENLABS_ERROR"
  | "REQUEST_INVALID"
  | "FORBIDDEN_ORIGIN"
  | "TEXT_TOO_LONG";

const requestSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
  voiceId: z.string().trim().min(1).max(200).optional(),
  modelId: z.string().trim().min(1).max(100).optional(),
  profileId: z.string().trim().min(1).max(80).optional(),
});

function readServerSecret(name: string): string | undefined {
  const denoEnv = (globalThis as { Deno?: { env?: { get: (key: string) => string | undefined } } }).Deno?.env;
  const denoValue = denoEnv?.get(name);
  if (typeof denoValue === "string" && denoValue.trim()) {
    return denoValue.trim();
  }

  const nodeValue = process.env[name];
  return typeof nodeValue === "string" && nodeValue.trim() ? nodeValue.trim() : undefined;
}

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

function logDevError(status: number, code: TtsErrorCode, detail?: string) {
  if (process.env.NODE_ENV !== "development") return;
  const summary = detail ? detail.slice(0, 160) : "";
  console.warn(
    `[${FUNCTION_NAME}] status=${status} code=${code}${summary ? ` detail=${summary}` : ""}`,
  );
}

function jsonError(status: number, code: TtsErrorCode, message: string, detail?: string) {
  logDevError(status, code, detail);
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: {
      ...CORS_HEADERS,
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
      OPTIONS: async () => {
        return new Response("ok", { headers: CORS_HEADERS });
      },
      POST: async ({ request }) => {
        if (!assertSameOrigin(request)) {
          return jsonError(403, "FORBIDDEN_ORIGIN", "Nicht erlaubt.");
        }

        const apiKey = readServerSecret("ELEVENLABS_API_KEY");
        if (!apiKey) {
          return jsonError(
            503,
            "CONFIGURATION_ERROR",
            "ElevenLabs ist serverseitig noch nicht vollständig konfiguriert.",
          );
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return jsonError(415, "REQUEST_INVALID", "Ungueltiger Content-Type.");
        }

        const ip = getIp(request);
        if (!rateLimit(ip)) {
          return jsonError(429, "QUOTA_EXCEEDED", "Zu viele Anfragen. Bitte warte einen Moment.");
        }

        const rawBody = await request.json().catch(() => null);
        const parsed = requestSchema.safeParse(rawBody);
        if (!parsed.success) {
          return jsonError(400, "REQUEST_INVALID", "Ungueltige Anfrage.");
        }

        const preparedText = prepareTextForSpeech(parsed.data.text);
        if (!preparedText) {
          return jsonError(400, "REQUEST_INVALID", "Der Text ist leer oder ungueltig.");
        }

        if (preparedText.length > MAX_TEXT_LENGTH) {
          return jsonError(
            413,
            "TEXT_TOO_LONG",
            "Der Text ist zu lang und muss in Abschnitte geteilt werden.",
          );
        }

        const configuredVoiceId = readServerSecret("ELEVENLABS_VOICE_ID");
        const configuredModelId = readServerSecret("ELEVENLABS_MODEL_ID");

        const voiceId = parsed.data.voiceId?.trim() || configuredVoiceId;
        if (!voiceId) {
          return jsonError(
            503,
            "CONFIGURATION_ERROR",
            "ElevenLabs ist serverseitig noch nicht vollständig konfiguriert.",
          );
        }

        const modelId = parsed.data.modelId?.trim() || configuredModelId || DEFAULT_TTS_MODEL_ID;
        const profile = getVoiceProfile(parsed.data.profileId);

        const upstreamController = new AbortController();
        request.signal.addEventListener("abort", () => upstreamController.abort());

        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
          {
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
          },
        );

        if (!upstream.ok || !upstream.body) {
          const errorText = await upstream.text().catch(() => "");
          if (upstream.status === 401) {
            return jsonError(
              401,
              "INVALID_API_KEY",
              "Die KI-Stimme ist noch nicht korrekt eingerichtet.",
              errorText,
            );
          }
          if (upstream.status === 403) {
            return jsonError(
              403,
              "VOICE_NOT_AVAILABLE",
              "Diese Stimme kann mit dem aktuellen ElevenLabs-Konto nicht verwendet werden.",
              errorText,
            );
          }
          if (upstream.status === 404) {
            return jsonError(
              404,
              "VOICE_NOT_FOUND",
              "Die konfigurierte KI-Stimme wurde nicht gefunden.",
              errorText,
            );
          }
          if (upstream.status === 429) {
            return jsonError(
              429,
              "QUOTA_EXCEEDED",
              "Das verfügbare Sprachguthaben ist derzeit aufgebraucht.",
              errorText,
            );
          }
          if (upstream.status === 413) {
            return jsonError(
              413,
              "TEXT_TOO_LONG",
              "Der Text ist zu lang und wird in Abschnitten vorgelesen.",
              errorText,
            );
          }
          return jsonError(
            502,
            "ELEVENLABS_ERROR",
            "Die Sprachausgabe konnte gerade nicht geladen werden.",
            errorText,
          );
        }

        const audioBuffer = await upstream.arrayBuffer();
        return new Response(audioBuffer, {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "content-type": "audio/mpeg",
            "cache-control": "private, max-age=3600",
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
