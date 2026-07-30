import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const MAX_TEXT_LENGTH = 12000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 24;
const DEFAULT_VOICE_ID = "g1jpii0iyvtRs8fqXsd1";
const GEMINI_TTS_MODELS = [
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
] as const;
const GEMINI_TTS_VOICE = "Kore";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, x-tts-access-code",
  "access-control-max-age": "86400",
};

type TtsErrorCode =
  | "CONFIGURATION_ERROR"
  | "MISSING_TTS_ACCESS_CODE"
  | "INVALID_TTS_ACCESS_CODE"
  | "RATE_LIMITED"
  | "ELEVENLABS_ERROR"
  | "OPENAI_ERROR"
  | "GEMINI_ERROR"
  | "REQUEST_INVALID"
  | "TEXT_TOO_LONG";

type SecretStoreBinding = {
  get: () => Promise<unknown> | unknown;
};

const requestSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
  provider: z.enum(["openai", "elevenlabs", "gemini"]).default("openai"),
  voice: z.enum(["coral", "marin", "nova", "shimmer"]).optional(),
  modelId: z.string().trim().min(1).max(100).optional(),
  profileId: z.string().trim().min(1).max(80).optional(),
}).strict();

function normalizeSecret(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isSecretStoreBinding(value: unknown): value is SecretStoreBinding {
  return Boolean(
    value &&
      typeof value === "object" &&
      "get" in value &&
      typeof (value as { get?: unknown }).get === "function",
  );
}

async function readBindingValue(binding: unknown): Promise<string | undefined> {
  const direct = normalizeSecret(binding);
  if (direct) return direct;
  if (!isSecretStoreBinding(binding)) return undefined;

  try {
    return normalizeSecret(await binding.get());
  } catch (error) {
    console.error("[tts-secret-store] Secret konnte nicht gelesen werden", error);
    return undefined;
  }
}

async function readCloudflareEnv(): Promise<Record<string, unknown>> {
  try {
    const mod = (await import("cloudflare:workers")) as { env?: unknown };
    return (mod.env as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

async function readServerSecret(name: string): Promise<string | undefined> {
  const runtimeEnv = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const runtimeValue = await readBindingValue(runtimeEnv?.[name]);
  if (runtimeValue) return runtimeValue;

  const importedValue = await readBindingValue((await readCloudflareEnv())[name]);
  if (importedValue) return importedValue;

  return normalizeSecret(process.env[name]);
}

async function readGeminiApiKey(): Promise<string | undefined> {
  return (
    (await readServerSecret("GEMINIAI_API_KEY")) ??
    (await readServerSecret("GEMINI_API_KEY")) ??
    (await readServerSecret("GOOGLE_API_KEY"))
  );
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

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function pcmToWav(pcm: Uint8Array, sampleRate = 24000, channels = 1, bitsPerSample = 16): ArrayBuffer {
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + pcm.byteLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const writeAscii = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) bytes[offset + i] = value.charCodeAt(i);
  };
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(36, "data");
  view.setUint32(40, pcm.byteLength, true);
  bytes.set(pcm, headerSize);
  return buffer;
}

async function validateGeminiAccess(request: Request): Promise<Response | null> {
  const expectedCode = await readServerSecret("GEMINI_TTS");
  if (!expectedCode) return jsonError(500, "CONFIGURATION_ERROR", "Der Gemini-Freischaltcode ist serverseitig nicht konfiguriert.");
  const submittedCode = request.headers.get("x-tts-access-code")?.trim();
  if (!submittedCode) return jsonError(401, "MISSING_TTS_ACCESS_CODE", "Für die Vorlesefunktion ist ein Freischaltcode erforderlich.");
  if (submittedCode !== expectedCode) return jsonError(401, "INVALID_TTS_ACCESS_CODE", "Der Freischaltcode ist ungültig.");
  return null;
}

function safeUpstreamMessage(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 4000 ? `${compact.slice(0, 4000)}…` : compact;
}

const UPSTREAM_TTS_URL = "https://steuerstoff-740fa27f.melanieemis.workers.dev/api/text-to-speech";
const PROXY_MARKER_HEADER = "x-tts-proxy-hop";

/**
 * Reicht die Anfrage an den Cloudflare-Worker weiter, wenn lokal kein Gemini-Key vorhanden ist.
 * Der Marker-Header verhindert eine Endlosschleife, falls derselbe Code upstream läuft.
 */
async function proxyToUpstream(request: Request, payload: Record<string, unknown>): Promise<Response> {
  if (request.headers.get(PROXY_MARKER_HEADER)) {
    console.warn("[tts-proxy] Proxy-Hop erkannt – Abbruch, kein lokaler Gemini-Key");
    return jsonError(500, "CONFIGURATION_ERROR", "Der Gemini-API-Key GEMINIAI_API_KEY ist serverseitig nicht konfiguriert.");
  }

  const accessCode = request.headers.get("x-tts-access-code");
  const headers: Record<string, string> = {
    "content-type": "application/json",
    [PROXY_MARKER_HEADER]: "1",
  };
  if (accessCode) headers["x-tts-access-code"] = accessCode;

  let upstream: Response;
  const startedAt = Date.now();
  try {
    console.log("[tts-proxy] proxy start", { host: new URL(UPSTREAM_TTS_URL).host, hasAccessCode: Boolean(accessCode) });
    upstream = await fetch(UPSTREAM_TTS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, provider: "gemini" }),
      signal: request.signal,
    });
    console.log("[tts-proxy] proxy response status", upstream.status, `${Date.now() - startedAt}ms`);
  } catch (error) {
    const detail = error instanceof Error ? safeUpstreamMessage(error.message) : "unbekannter Netzwerkfehler";
    console.error("[tts-proxy] Upstream nicht erreichbar", detail);
    return jsonError(502, "GEMINI_ERROR", `Der Sprachdienst ist nicht erreichbar (${detail}).`);
  }

  const responseHeaders = new Headers(CORS_HEADERS);
  for (const name of ["content-type", "x-tts-provider", "x-tts-model"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  responseHeaders.set("cache-control", "private, no-store");

  if (!upstream.ok) {
    const upstreamBody = await upstream.text().catch(() => "");
    const detail = upstreamBody.trim() || "Leerer Fehlerbody";
    console.error("[tts-proxy] upstream error", {
      status: upstream.status,
      body: detail,
    });
    return jsonError(
      upstream.status,
      "GEMINI_ERROR",
      `TTS-Worker HTTP ${upstream.status}: ${safeUpstreamMessage(detail)}`,
    );
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}


/** Läuft der Request bereits auf der Worker-Domain? Dann lokal erzeugen, sonst weiterleiten. */
function isUpstreamWorkerHost(request: Request): boolean {
  try {
    return new URL(request.url).hostname.endsWith(".workers.dev");
  } catch {
    return false;
  }
}

async function geminiSpeech(request: Request, text: string, payload: Record<string, unknown>): Promise<Response> {
  if (!isUpstreamWorkerHost(request)) {
    console.log("[tts] gemini: forwarding to upstream worker (non-workers.dev host)");
    return proxyToUpstream(request, { ...payload, text });
  }

  const apiKey = await readGeminiApiKey();
  if (!apiKey) {
    return jsonError(500, "CONFIGURATION_ERROR", "Der Gemini-API-Key ist serverseitig nicht konfiguriert.");
  }

  const accessError = await validateGeminiAccess(request);
  if (accessError) return accessError;



  const prompt = `Erzeuge eine deutsche Sprachausgabe. Lies ausschließlich den Text nach TRANSKRIPT vollständig, natürlich, klar und in ruhigem professionellem Tempo vor.\n\nTRANSKRIPT:\n${text}`;
  let lastFailure = "";
  let lastStatus = 502;

  for (const model of GEMINI_TTS_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const upstream = await fetch(
        endpoint,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE } } },
            },
          }),
          signal: request.signal,
        },
      ).catch(() => null);

      if (!upstream) {
        lastFailure = `${model}: Netzwerkfehler`;
        lastStatus = 502;
        console.error("[gemini-tts] network error", { model, endpoint });
        continue;
      }

      if (!upstream.ok) {
        const body = await upstream.text().catch(() => "");
        lastStatus = upstream.status;
        lastFailure = `${model}: Gemini HTTP ${upstream.status}${body ? ` – ${safeUpstreamMessage(body)}` : " – Leerer Response-Body"}`;
        console.error("[gemini-tts] Gemini API error", {
          model,
          endpoint,
          status: upstream.status,
          body,
        });
        if (upstream.status === 401 || upstream.status === 403) break;
        continue;
      }

      const geminiPayload = (await upstream.json().catch(() => null)) as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
      } | null;
      const inlineData = geminiPayload?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
      if (!inlineData?.data) {
        lastStatus = 502;
        const responseBody = JSON.stringify(geminiPayload);
        lastFailure = `${model}: Gemini HTTP ${upstream.status}, aber die Antwort enthielt keine Audiodaten – ${safeUpstreamMessage(responseBody)}`;
        console.error("[gemini-tts] Gemini response without audio", {
          model,
          status: upstream.status,
          body: responseBody,
        });
        continue;
      }

      const audioBytes = decodeBase64(inlineData.data);
      const mimeType = inlineData.mimeType?.toLowerCase() ?? "audio/l16;rate=24000";
      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? Number(sampleRateMatch[1]) : 24000;
      const isWav = mimeType.includes("audio/wav") || mimeType.includes("audio/x-wav");
      const audio = isWav ? new Uint8Array(audioBytes) : pcmToWav(audioBytes, sampleRate);
      console.log("[gemini-tts] audio received", {
        model,
        status: upstream.status,
        sourceMimeType: mimeType,
        bytes: audioBytes.byteLength,
      });
      return new Response(audio, {
        headers: {
          ...CORS_HEADERS,
          "content-type": "audio/wav",
          "cache-control": "private, max-age=3600",
          "x-tts-provider": "gemini",
          "x-tts-model": model,
        },
      });
    }
  }

  return jsonError(lastStatus, "GEMINI_ERROR", lastFailure || "Gemini lieferte keine verwertbare Antwort.");
}

async function openAiSpeech(request: Request, text: string, voice: string, payload: Record<string, unknown>): Promise<Response> {
  const apiKey = await readServerSecret("OPENAI_API_KEY");
  if (!apiKey) return geminiSpeech(request, text, payload);

  const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, response_format: "mp3" }),
    signal: request.signal,
  }).catch(() => null);

  if (!upstream?.ok) return geminiSpeech(request, text, payload);
  return new Response(await upstream.arrayBuffer(), {
    headers: { ...CORS_HEADERS, "content-type": "audio/mpeg", "cache-control": "private, max-age=3600", "x-tts-provider": "openai" },
  });
}

async function elevenLabsSpeech(request: Request, text: string, payload: Record<string, unknown>, modelId?: string, profileId?: string): Promise<Response> {
  const apiKey = await readServerSecret("ELEVENLABS_API_KEY");
  const expectedCode = (await readServerSecret("STEUERSTOFF_TTS")) ?? (await readServerSecret("TTS_ACCESS_CODE"));
  if (!apiKey || !expectedCode) return geminiSpeech(request, text, payload);

  const submittedCode = request.headers.get("x-tts-access-code")?.trim();
  if (!submittedCode || submittedCode !== expectedCode) return geminiSpeech(request, text, payload);

  const configuredModelId = await readServerSecret("ELEVENLABS_MODEL_ID");
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

  if (!upstream?.ok) return geminiSpeech(request, text, payload);
  return new Response(await upstream.arrayBuffer(), {
    headers: { ...CORS_HEADERS, "content-type": "audio/mpeg", "cache-control": "private, max-age=3600", "x-tts-provider": "elevenlabs" },
  });
}

export const Route = createFileRoute("/api/text-to-speech")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") ?? "";
          console.log("[tts] request received", {
            hasAccessCode: Boolean(request.headers.get("x-tts-access-code")),
            proxyHop: Boolean(request.headers.get(PROXY_MARKER_HEADER)),
          });
          if (!contentType.toLowerCase().includes("application/json")) return jsonError(415, "REQUEST_INVALID", "Ungültiger Content-Type.");
          if (!rateLimit(getIp(request))) return jsonError(429, "RATE_LIMITED", "Die Vorlesefunktion wird gerade sehr häufig verwendet.");

          const parsed = requestSchema.safeParse(await request.json().catch(() => null));
          if (!parsed.success) return jsonError(400, "REQUEST_INVALID", "Ungültige Anfrage.");
          const text = prepareTextForSpeech(parsed.data.text);
          if (!text) return jsonError(400, "REQUEST_INVALID", "Der Text ist leer oder ungültig.");
          if (text.length > MAX_TEXT_LENGTH) return jsonError(413, "TEXT_TOO_LONG", "Der Text ist zu lang.");

          const payload: Record<string, unknown> = {
            modelId: parsed.data.modelId,
            profileId: parsed.data.profileId,
            voice: parsed.data.voice,
          };

          console.log("[tts] provider", parsed.data.provider, "textLength", text.length);

          if (parsed.data.provider === "gemini") return await geminiSpeech(request, text, payload);
          if (parsed.data.provider === "elevenlabs") return await elevenLabsSpeech(request, text, payload, parsed.data.modelId, parsed.data.profileId);
          return await openAiSpeech(request, text, parsed.data.voice ?? "coral", payload);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            console.warn("[tts] request aborted by client");
            return jsonError(400, "REQUEST_INVALID", "Die Anfrage wurde abgebrochen.");
          }
          const detail = error instanceof Error ? safeUpstreamMessage(error.message) : "unbekannter Fehler";
          console.error("[tts] unhandled error", detail);
          return jsonError(500, "CONFIGURATION_ERROR", `Interner Fehler in der Vorlesefunktion: ${detail}`);
        }
      },

    },
  },
});
