import { createFileRoute } from "@tanstack/react-router";

/**
 * Diagnose-Endpunkt für die Vorlesefunktion.
 * Gibt ausschließlich Booleans/Statuscodes zurück – niemals Secret-Werte.
 */

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, x-tts-access-code",
  "access-control-max-age": "86400",
};

const UPSTREAM_TTS_URL = "https://steuerstoff-740fa27f.melanieemis.workers.dev/api/text-to-speech";

type SecretStoreBinding = { get: () => Promise<unknown> | unknown };

function normalizeSecret(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isSecretStoreBinding(value: unknown): value is SecretStoreBinding {
  return Boolean(
    value && typeof value === "object" && "get" in value &&
      typeof (value as { get?: unknown }).get === "function",
  );
}

async function readBindingValue(binding: unknown): Promise<string | undefined> {
  const direct = normalizeSecret(binding);
  if (direct) return direct;
  if (!isSecretStoreBinding(binding)) return undefined;
  try {
    return normalizeSecret(await binding.get());
  } catch {
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

async function hasSecret(name: string): Promise<boolean> {
  return Boolean(await readServerSecret(name));
}

function safeMessage(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 200 ? `${compact.slice(0, 200)}…` : compact;
}

async function buildReport(request: Request) {
  const secrets = {
    GEMINIAI_API_KEY: await hasSecret("GEMINIAI_API_KEY"),
    GEMINI_API_KEY: await hasSecret("GEMINI_API_KEY"),
    GOOGLE_API_KEY: await hasSecret("GOOGLE_API_KEY"),
    GEMINI_TTS: await hasSecret("GEMINI_TTS"),
    OPENAI_API_KEY: await hasSecret("OPENAI_API_KEY"),
    ELEVENLABS_API_KEY: await hasSecret("ELEVENLABS_API_KEY"),
    STEUERSTOFF_TTS: await hasSecret("STEUERSTOFF_TTS"),
    TTS_ACCESS_CODE: await hasSecret("TTS_ACCESS_CODE"),
  };

  const expectedGeminiCode = await readServerSecret("GEMINI_TTS");
  const submittedCode = request.headers.get("x-tts-access-code")?.trim();

  let upstream: { reachable: boolean; status?: number; error?: string } = { reachable: false };
  try {
    const probe = await fetch(UPSTREAM_TTS_URL, { method: "OPTIONS" });
    upstream = { reachable: true, status: probe.status };
    console.log("[tts-debug] upstream probe status", probe.status);
  } catch (error) {
    const detail = error instanceof Error ? safeMessage(error.message) : "unbekannter Netzwerkfehler";
    upstream = { reachable: false, error: detail };
    console.error("[tts-debug] upstream probe failed", detail);
  }

  return {
    ok: true,
    time: new Date().toISOString(),
    secretsConfigured: secrets,
    accessCode: {
      submitted: Boolean(submittedCode),
      matchesGeminiCode: Boolean(submittedCode && expectedGeminiCode && submittedCode === expectedGeminiCode),
    },
    proxy: {
      willProxyGemini: !new URL(request.url).hostname.endsWith(".workers.dev"),
      upstreamHost: new URL(UPSTREAM_TTS_URL).host,
      upstream,
    },
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" },
  });
}

export const Route = createFileRoute("/api/tts-proxy-debug")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => {
        try {
          console.log("[tts-debug] request received");
          return jsonResponse(await buildReport(request));
        } catch (error) {
          const detail = error instanceof Error ? safeMessage(error.message) : "unbekannter Fehler";
          console.error("[tts-debug] handler failed", detail);
          return jsonResponse({ ok: false, error: "DEBUG_FAILED", message: detail }, 500);
        }
      },
      POST: async ({ request }) => {
        try {
          console.log("[tts-debug] request received (POST)");
          return jsonResponse(await buildReport(request));
        } catch (error) {
          const detail = error instanceof Error ? safeMessage(error.message) : "unbekannter Fehler";
          console.error("[tts-debug] handler failed", detail);
          return jsonResponse({ ok: false, error: "DEBUG_FAILED", message: detail }, 500);
        }
      },
    },
  },
});
