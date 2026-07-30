import { env } from "cloudflare:workers";
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

const requestSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
  provider: z.enum(["openai", "elevenlabs", "gemini"]).default("openai"),
  voice: z.enum(["coral", "marin", "nova", "shimmer"]).optional(),
  modelId: z.string().trim().min(1).max(100).optional(),
  profileId: z.string().trim().min(1).max(80).optional(),
}).strict();

function readServerSecret(name: string): string | undefined {
  const value = (env as unknown as Record<string, unknown>)[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readGeminiApiKey(): string | undefined {
  return (
    readServerSecret("GEMINIAI_API_KEY") ??
    readServerSecret("GEMINI_API_KEY") ??
    readServerSecret("GOOGLE_API_KEY")
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

function validateGeminiAccess(request: Request): Response | null {
  const expectedCode = readServerSecret("GEMINI_TTS");
  if (!expectedCode) return jsonError(500, "CONFIGURATION_ERROR", "Der Gemini-Freischaltcode ist serverseitig nicht konfiguriert.");
  const submittedCode = request.headers.get("x-tts-access-code")?.trim();
  if (!submittedCode) return jsonError(401, "MISSING_TTS_ACCESS_CODE", "Für die Vorlesefunktion ist ein Freischaltcode erforderlich.");
  if (submittedCode !== expectedCode) return jsonError(401, "INVALID_TTS_ACCESS_CODE", "Der Freischaltcode ist ungültig.");
  return null;
}

function safeUpstreamMessage(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 240 ? `${compact.slice(0, 240)}…` : compact;
}

async function geminiSpeech(request: Request, text: string): Promise<Response> {
  const accessError = validateGeminiAccess(request);
  if (accessError) return accessError;

  const apiKey = readGeminiApiKey();
  if (!apiKey) return jsonError(500, "CONFIGURATION_ERROR", "Der Gemini-API-Key GEMINIAI_API_KEY ist serverseitig nicht konfiguriert.");

  const prompt = `Erzeuge eine deutsche Sprachausgabe. Lies ausschließlich den Text nach TRANSKRIPT vollständig, natürlich, klar und in ruhigem professionellem Tempo vor.\n\nTRANSKRIPT:\n${text}`;
  let lastFailure = "";

  for (const model of GEMINI_TTS_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
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
        continue;
      }

      if (!upstream.ok) {
        const body = safeUpstreamMessage(await upstream.text().catch(() => ""));
        lastFailure = `${model}: HTTP ${upstream.status}${body ? ` – ${body}` : ""}`;
        console.error("[gemini-tts]", lastFailure);
        if (upstream.status === 401 || upstream.status === 403) break;
        continue;
      }

      const payload = (await upstream.json().catch(() => null)) as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
      } | null;
      const inlineData = payload?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
      if (!inlineData?.data) {
        lastFailure = `${model}: Die Antwort enthielt keine Audiodaten.`;
        console.error("[gemini-tts]", lastFailure);
        continue;
      }

      const pcm = decodeBase64(inlineData.data);
      const wav = pcmToWav(pcm);
      return new Response(wav, {
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

  return jsonError(502, "GEMINI_ERROR", lastFailure || "Die Gemini-Stimme konnte gerade nicht erstellt werden.");
}

async function openAiSpeech(request: Request, text: string, voice: string): Promise<Response> {
  const apiKey = readServerSecret("OPENAI_API_KEY");
  if (!apiKey) return geminiSpeech(request, text);

  const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, response_format: "mp3" }),
    signal: request.signal,
  }).catch(() => null);

  if (!upstream?.ok) return geminiSpeech(request, text);
  return new Response(await upstream.arrayBuffer(), {
    headers: { ...CORS_HEADERS, "content-type": "audio/mpeg", "cache-control": "private, max-age=3600", "x-tts-provider": "openai" },
  });
}

async function elevenLabsSpeech(request: Request, text: string, modelId?: string, profileId?: string): Promise<Response> {
  const apiKey = readServerSecret("ELEVENLABS_API_KEY");
  const expectedCode = readServerSecret("STEUERSTOFF_TTS") ?? readServerSecret("TTS_ACCESS_CODE");
  if (!apiKey || !expectedCode) return geminiSpeech(request, text);

  const submittedCode = request.headers.get("x-tts-access-code")?.trim();
  if (!submittedCode || submittedCode !== expectedCode) return geminiSpeech(request, text);

  const configuredModelId = readServerSecret("ELEVENLABS_MODEL_ID");
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

  if (!upstream?.ok) return geminiSpeech(request, text);
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

        if (parsed.data.provider === "gemini") return geminiSpeech(request, text);
        if (parsed.data.provider === "elevenlabs") return elevenLabsSpeech(request, text, parsed.data.modelId, parsed.data.profileId);
        return openAiSpeech(request, text, parsed.data.voice ?? "coral");
      },
    },
  },
});
