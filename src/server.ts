import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type SecretStoreBinding = {
  get: () => Promise<unknown> | unknown;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function exposeWorkerEnv(env: unknown): void {
  if (!env || typeof env !== "object") return;

  const runtimeEnv = env as Record<string, unknown>;
  (globalThis as { __env__?: Record<string, unknown> }).__env__ = runtimeEnv;

  // Normal string bindings remain available through process.env for local/server fallbacks.
  // Secrets Store bindings stay as objects and are read asynchronously with binding.get().
  for (const [name, value] of Object.entries(runtimeEnv)) {
    if (typeof value === "string" && value.trim()) {
      process.env[name] = value;
    }
  }
}

function isSecretStoreBinding(value: unknown): value is SecretStoreBinding {
  return Boolean(
    value &&
      typeof value === "object" &&
      "get" in value &&
      typeof (value as { get?: unknown }).get === "function",
  );
}

async function bindingIsConfigured(binding: unknown): Promise<boolean> {
  if (typeof binding === "string") return binding.trim().length > 0;
  if (!isSecretStoreBinding(binding)) return false;

  try {
    const value = await binding.get();
    return typeof value === "string" && value.trim().length > 0;
  } catch (error) {
    console.error("[tts-env-debug] Secrets-Store-Binding konnte nicht gelesen werden", error);
    return false;
  }
}

async function ttsBindingDiagnostics(env: unknown): Promise<Response> {
  const runtimeEnv = env && typeof env === "object" ? (env as Record<string, unknown>) : {};
  const names = [
    "GEMINI_TTS",
    "GEMINIAI_API_KEY",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "OPENAI_API_KEY",
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID",
  ];
  const bindings = Object.fromEntries(
    await Promise.all(names.map(async (name) => [name, await bindingIsConfigured(runtimeEnv[name])] as const)),
  );

  return new Response(JSON.stringify({ ok: true, bindings }, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      exposeWorkerEnv(env);
      const url = new URL(request.url);
      if (url.pathname === "/api/tts-env-debug") {
        return await ttsBindingDiagnostics(env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
