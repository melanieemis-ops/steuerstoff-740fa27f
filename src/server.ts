import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleDirectChatRequest } from "./lib/ai/direct-chat-worker";

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

// Never probe ASSETS: it is a service binding, not a Secrets Store secret.
const SECRET_STORE_BINDING_NAMES = new Set(["GEMINIAI_API_KEY", "GEMINI_TTS"]);

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

  if (!payload || Array.isArray(payload) || typeof payload !== "object") return false;

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) return false;

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

async function importCloudflareEnv(): Promise<Record<string, unknown>> {
  try {
    const mod = (await import("cloudflare:workers")) as { env?: unknown };
    return (mod.env as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

function asRuntimeEnv(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

async function resolveRuntimeEnv(passedEnv: unknown): Promise<Record<string, unknown>> {
  return asRuntimeEnv(passedEnv) ?? (await importCloudflareEnv());
}

function isSecretStoreBinding(value: unknown): value is SecretStoreBinding {
  return Boolean(
    value &&
      (typeof value === "object" || typeof value === "function") &&
      "get" in value &&
      typeof (value as { get?: unknown }).get === "function",
  );
}

async function materializeWorkerEnv(env: Record<string, unknown>): Promise<Record<string, unknown>> {
  const resolvedEnv: Record<string, unknown> = { ...env };

  await Promise.all(
    Object.entries(env).map(async ([name, value]) => {
      if (typeof value === "string") {
        if (value.trim()) process.env[name] = value;
        return;
      }

      if (!SECRET_STORE_BINDING_NAMES.has(name) || !isSecretStoreBinding(value)) return;

      try {
        const resolvedValue = await value.get();
        if (typeof resolvedValue === "string" && resolvedValue.trim()) {
          resolvedEnv[name] = resolvedValue;
          process.env[name] = resolvedValue;
        }
      } catch (error) {
        console.error(`[worker-env] Secrets-Store-Binding ${name} konnte nicht gelesen werden`, error);
      }
    }),
  );

  (globalThis as { __env__?: Record<string, unknown> }).__env__ = resolvedEnv;
  return resolvedEnv;
}

function safeErrorDetails(error: unknown): Pick<BindingDiagnostic, "errorName" | "errorMessage"> {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message.slice(0, 500) };
  }
  return { errorName: typeof error, errorMessage: String(error).slice(0, 500) };
}

async function diagnoseBinding(binding: unknown): Promise<BindingDiagnostic> {
  const bindingPresent = binding !== undefined && binding !== null;
  const bindingType = binding === null ? "null" : typeof binding;

  if (!bindingPresent) {
    return { bindingPresent: false, bindingType, hasGetMethod: false, getSucceeded: null };
  }

  const constructorName =
    (typeof binding === "object" || typeof binding === "function") &&
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

  if (!isSecretStoreBinding(binding)) {
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
    return {
      bindingPresent: true,
      bindingType,
      constructorName,
      ownKeys,
      hasGetMethod: true,
      getSucceeded: true,
      returnedType: value === null ? "null" : typeof value,
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

async function ttsBindingDiagnostics(runtimeEnv: Record<string, unknown>): Promise<Response> {
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
        runtimeEnvType: typeof runtimeEnv,
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
  async fetch(request: Request, passedEnv: unknown, ctx: unknown) {
    try {
      const runtimeEnv = await materializeWorkerEnv(await resolveRuntimeEnv(passedEnv));

      const url = new URL(request.url);
      if (url.pathname === "/api/chat") {
        return await handleDirectChatRequest(request, runtimeEnv);
      }
      if (url.pathname === "/api/tts-env-debug") {
        return await ttsBindingDiagnostics(runtimeEnv);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, runtimeEnv, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
