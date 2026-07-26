import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const MAX_TEXT_LENGTH = 12000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 24;
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
  | "OPENAI_ERROR"
  | "REQUEST_INVALID"
  | "TEXT_TOO_LONG";

const requestSchema = z
  .object({
    text: z.string().min(1).max(MAX_TEXT_LENGTH),
    provider: z.enum(["openai", "elevenlabs"]).default("openai"),
    voice: z.enum(["coral", "marin", "nova", "shimmer"]).optional(),
    modelId: z.string().trim().min(1).max(100).optional(),
    profileId: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

type CloudflareRuntimeRequest = Request & {
  runtime?: { cloudflare?: { env?: Record<string, unknown> } };
};

let cachedCloudflareEnv: Record<string, unknown> | null = null;

async function getCloudflareEnv(): Promise<Record<string, unknown>> {
  if (cachedCloudflareEnv !== null) return cachedCloudflareEnv;
  try {
    // @ts-ignore cloudflare:workers is only available in Cloudflare Workers
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
  if (typeof requestValue === "string" && requestValue.trim()) return requestValue.trim();

  const directValue = (await getCloudflareEnv())[name];
  if (typeof directValue === "string" && directValue.trim()) return directValue.trim();

  const workerValue = (globalThis as { __env__?: Record<string, unknown> }).__env__?.[name];
  if (typeof workerValue === "string" && workerValue.trim()) return workerValue.trim();

  const denoValue = (globalThis as { Deno?: { env?: { get: (key: string) => string | undefined } } }).Deno?.env?.get(name);
  if (typeof denoValue === "string" && denoValue.trim()) return denoValue.trim();

  const nodeValue = process.env[name];
  return typeof nodeValue === "string" && nodeValue.trim() ? nodeValue.trim() : undefined;
}

const buckets = new Map<string, number[]>();
function getIp(request: Request): string {
  const h = request.headers;
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ?? "unknown";
}
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const active = (buckets.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (active.length >= RATE_LIMIT) return false;
  active.push(now);
  buckets.set(ip, active);
  return true;
}
function jsonError(status: number, code: TtsErrorCode, message: string) {
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" },
  });
}

async function openAiSpeech(request: Request, text: string, voice: string): Promise<Response> {
  const apiKey = await readServerSecret("OPENAI_API_KEY", request);
  if (!apiKey) return jsonError(500, "CONFIGURATION_ERROR", "Die OpenAI-Stimme ist nicht konfiguriert.");

  const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, response_format: "mp3" }),
    signal: request.signal,
  }).catch(() => null);

  if (!upstream?.ok) {
    if (upstream?.status === 429) {
      const detail = await upstream.clone().text().catch(() => "");
      if (detail.includes("insufficient_quota")) {
        return jsonError(
          402,
          "OPENAI_ERROR",
          "Das OpenAI-Guthaben für die Vorlesefunktion ist aufgebraucht. Bitte Abrechnung im OpenAI-Konto prüfen.",
        );
      }
      return jsonError(429, "RATE_LIMITED", "Die OpenAI-Stimme ist gerade ausgelastet.");
    }
    return jsonError(502, "OPENAI_ERROR", "Die OpenAI-Stimme konnte gerade nicht erstellt werden.");
  }
  return new Response(await upstream.arrayBuffer(), {
    headers: { ...CORS_HEADERS, "content-type": "audio/mpeg", "cache-control": "private, max-age=3600", "x-tts-provider": "openai" },
  });
}

async function elevenLabsSpeech(request: Request, text: string, modelId?: string, profileId?: string): Promise<Response> {
  const apiKey = await readServerSecret("ELEVENLABS_API_KEY", request);
  const expectedCode = (await readServerSecret("STEUERSTOFF_TTS", request)) ?? (await readServerSecret("TTS_ACCESS_CODE", request));
  if (!apiKey || !expectedCode) return jsonError(500, "CONFIGURATION_ERROR", "Die ElevenLabs-Stimme ist nicht konfiguriert.");

  const submittedCode = request.headers.get("x-tts-access-code")?.trim();
  if (!submittedCode || submittedCode !== expectedCode) return jsonError(401, "INVALID_TTS_ACCESS_CODE", "Der Freischaltcode ist ungültig.");

  const configuredModelId = await readServerSecret("ELEVENLABS_MODEL_ID", request);
  const selectedModel = modelId?.trim() || configuredModelId || DEFAULT_TTS_MODEL_ID;
  const profile = getVoiceProfile(profileId);
  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(DEFAULT_VOICE_ID)}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "audio/mpeg", "xi-api-key": apiKey },
    body: JSON.stringify({
      text,
      model_id: selectedModel,
      voice_settings: {
        stability: profile.stability,
        similarity_boost: profile.similarityBoost,
        style: profile.style,
        use_speaker_boost: profile.useSpeakerBoost,
      },
    }),
    signal: request.signal,
  }).catch(() => null);

  if (!upstream?.ok) {
    if (upstream?.status === 429) return jsonError(429, "RATE_LIMITED", "ElevenLabs ist gerade ausgelastet.");
    return jsonError(502, "ELEVENLABS_ERROR", "Die ElevenLabs-Stimme konnte gerade nicht erstellt werden.");
  }
  return new Response(await upstream.arrayBuffer(), {
    headers: { ...CORS_HEADERS, "content-type": "audio/mpeg", "cache-control": "private, max-age=3600", "x-tts-provider": "elevenlabs" },
  });
}

export const Route = createFileRoute("/api/text-to-speech")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) return jsonError(415, "REQUEST_INVALID", "Ungültiger Content-Type.");
        if (!rateLimit(getIp(request))) return jsonError(429, "RATE_LIMITED", "Die Vorlesefunktion wird gerade sehr häufig verwendet.");

        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return jsonError(400, "REQUEST_INVALID", "Ungültige Anfrage.");
        const text = prepareTextForSpeech(parsed.data.text);
        if (!text) return jsonError(400, "REQUEST_INVALID", "Der Text ist leer oder ungültig.");
        if (text.length > MAX_TEXT_LENGTH) return jsonError(413, "TEXT_TOO_LONG", "Der Text ist zu lang.");

        return parsed.data.provider === "elevenlabs"
          ? elevenLabsSpeech(request, text, parsed.data.modelId, parsed.data.profileId)
          : openAiSpeech(request, text, parsed.data.voice ?? "coral");
      },
    },
  },
});
