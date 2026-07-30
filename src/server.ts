import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type SecretStoreBinding = {
  get: () => Promise<unknown> | unknown;
};

type BindingDiagnostic = {
  bindingPresent: boolean;
  bindingType: string;
  constructorName?: string;
  ownKeys?: string[];
  hasGetMethod: boolean;
  getSucceeded: boolean | null;
  returnedType?: string;
  valueConfigured?: boolean;
  errorName?: string;
  errorMessage?: string;
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
      (typeof value === "object" || typeof value === "function") &&
      "get" in value &&
      typeof (value as { get?: unknown }).get === "function",
  );
}

function safeErrorDetails(error: unknown): Pick<BindingDiagnostic, "errorName" | "errorMessage"> {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message.slice(0, 500),
    };
  }

  return {
    errorName: typeof error,
    errorMessage: String(error).slice(0, 500),
  };
}

async function diagnoseBinding(binding: unknown): Promise<BindingDiagnostic> {
  const bindingPresent = binding !== undefined && binding !== null;
  const bindingType = binding === null ? "null" : typeof binding;

  if (!bindingPresent) {
    return {
      bindingPresent: false,
      bindingType,
      hasGetMethod: false,
      getSucceeded: null,
    };
  }

  const constructorName =
    (typeof binding === "object" || typeof binding === "function") &&
    (binding as { constructor?: { name?: unknown } }).constructor &&
    typeof (binding as { constructor?: { name?: unknown } }).constructor?.name === "string"
      ? String((binding as { constructor?: { name?: unknown } }).constructor?.name)
      : undefined;

  let ownKeys: string[] | undefined;
  try {
    ownKeys = Object.keys(binding as object).slice(0, 20);
  } catch {
    ownKeys = undefined;
  }

  if (typeof binding === "string") {
    return {
      bindingPresent: true,
      bindingType,
      constructorName,
      ownKeys,
      hasGetMethod: false,
      getSucceeded: null,
      returnedType: "string",
      valueConfigured: binding.trim().length > 0,
    };
  }

  const hasGetMethod = isSecretStoreBinding(binding);
  if (!hasGetMethod) {
    return {
      bindingPresent: true,
      bindingType,
      constructorName,
      ownKeys,
      hasGetMethod: false,
      getSucceeded: null,
    };
  }

  try {
    const value = await binding.get();
    const returnedType = value === null ? "null" : typeof value;
    return {
      bindingPresent: true,
      bindingType,
      constructorName,
      ownKeys,
      hasGetMethod: true,
      getSucceeded: true,
      returnedType,
      valueConfigured: typeof value === "string" ? value.trim().length > 0 : value != null,
    };
  } catch (error) {
    console.error("[tts-env-debug] Secrets-Store-Binding konnte nicht gelesen werden", error);
    return {
      bindingPresent: true,
      bindingType,
      constructorName,
      ownKeys,
      hasGetMethod: true,
      getSucceeded: false,
      ...safeErrorDetails(error),
    };
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
    await Promise.all(names.map(async (name) => [name, await diagnoseBinding(runtimeEnv[name])] as const)),
  );

  return new Response(
    JSON.stringify(
      {
        ok: true,
        runtimeEnvType: env === null ? "null" : typeof env,
        runtimeBindingNames: Object.keys(runtimeEnv).sort(),
        bindings,
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
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
