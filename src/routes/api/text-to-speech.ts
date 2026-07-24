import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const MAX_TEXT_LENGTH = 12000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 24;
const FUNCTION_NAME = "api/text-to-speech";
const DEFAULT_VOICE_ID = "g1jpii0iyvtRs8fqXsd1";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, x-tts-access-code",
  "access-control-max-age": "86400",
};

type TtsErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_TTS_ACCESS_CODE"
  | "RATE_LIMITED"
  | "ELEVENLABS_ERROR"
  | "REQUEST_INVALID"
  | "TEXT_TOO_LONG";

const requestSchema = z
  .object({
    text: z.string().min(1).max(MAX_TEXT_LENGTH),
    modelId: z.string().trim().min(1).max(100).optional(),
    profileId: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

type CloudflareRuntimeRequest = Request & {
  runtime?: {
    cloudflare?: {
      env?: Record<string, unknown>;
    };
  };
};

let cachedCloudflareEnv: Record<string, unknown> | null = null;

async function getCloudflareEnv(): Promise<Record<string, unknown>> {
  if (cachedCloudflareEnv !== null) {
    return cachedCloudflareEnv;
  }
  try {
    // @ts-ignore cloudflare:workers is only available in the Cloudflare Workers runtime
    const mod = await import("cloudflare:workers");
    cachedCloudflareEnv = (mod.env as unknown as Record<string, unknown>) ?? {};
  } catch {
    cachedCloudflareEnv = {};
  }
  return cachedCloudflareEnv;
}

async function readServerSecret(name: string, request?: Request): Promise<string | undefined> {
  const requestEnv = (request as CloudflareRuntimeRequest | undefined)?.runtime?.cloudflare?.env;
  const requestValue = requestEnv?.[name];
  if (typeof requestValue === "string" && requestValue.trim()) {
    return requestValue.trim();
  }

  const directWorkerValue = (await getCloudflareEnv())[name];
  if (typeof directWorkerValue === "string" && directWorkerValue.trim()) {
    return directWorkerValue.trim();
  }

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

function logDevError(status: number, code: TtsErrorCode) {
  if (process.env.NODE_ENV !== "development") return;
  console.warn(`[${FUNCTION_NAME}] status=${status} code=${code}`);
}

function jsonError(status: number, code: TtsErrorCode, message: string) {
  logDevError(status, code);
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}

export const Route = createFileRoute("/api/text-to-speech")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      },
      POST: async ({ request }) => {
        const apiKey = readServerSecret("ELEVENLABS_API_KEY", request);
        const expectedAccessCode = readServerSecret("TTS_ACCESS_CODE", request);

        if (!apiKey || !expectedAccessCode) {
          return jsonError(
            500,
            "CONFIGURATION_ERROR",
            "Die Vorlesefunktion ist momentan nicht verfügbar.",
          );
        }

        const submittedAccessCode = request.headers.get("x-tts-access-code")?.trim();
        if (!submittedAccessCode || submittedAccessCode !== expectedAccessCode) {
          return jsonError(401, "INVALID_TTS_ACCESS_CODE", "Der Freischaltcode ist ungültig.");
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return jsonError(415, "REQUEST_INVALID", "Ungueltiger Content-Type.");
        }

        const ip = getIp(request);
        if (!rateLimit(ip)) {
          return jsonError(
            429,
            "RATE_LIMITED",
            "Die Vorlesefunktion wird gerade sehr häufig verwendet. Bitte versuche es in Kürze erneut.",
          );
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

        const configuredModelId = readServerSecret("ELEVENLABS_MODEL_ID", request);

        const voiceId = DEFAULT_VOICE_ID;
        const modelId = parsed.data.modelId?.trim() || configuredModelId || DEFAULT_TTS_MODEL_ID;
        const profile = getVoiceProfile(parsed.data.profileId);

        const upstreamController = new AbortController();
        request.signal.addEventListener("abort", () => upstreamController.abort(), { once: true });

        let upstream: Response;
        try {
          upstream = await fetch(
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
        } catch {
          if (request.signal.aborted) {
            return new Response(null, { status: 499, headers: CORS_HEADERS });
          }
          return jsonError(
            502,
            "ELEVENLABS_ERROR",
            "Die Audiodatei konnte gerade nicht erstellt werden. Bitte versuche es erneut.",
          );
        }

        if (!upstream.ok || !upstream.body) {
          if (upstream.status === 429) {
            return jsonError(
              429,
              "RATE_LIMITED",
              "Die Vorlesefunktion wird gerade sehr häufig verwendet. Bitte versuche es in Kürze erneut.",
            );
          }
          if (upstream.status === 413) {
            return jsonError(
              413,
              "TEXT_TOO_LONG",
              "Die Audiodatei konnte gerade nicht erstellt werden. Bitte versuche es erneut.",
            );
          }
          return jsonError(
            502,
            "ELEVENLABS_ERROR",
            "Die Audiodatei konnte gerade nicht erstellt werden. Bitte versuche es erneut.",
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
            "x-tts-profile-id": profile.id,
          },
        });
      },
    },
  },
});
