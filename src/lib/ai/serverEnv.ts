// Serverseitige Auflösung von Cloudflare-Bindings.
// Unterstützt String-Bindings und Secrets-Store-Bindings mit .get().
// Wird nur serverseitig verwendet; Werte werden niemals an den Client gegeben.

type SecretStoreBinding = { get: () => Promise<unknown> | unknown };

function normalizeValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isSecretStoreBinding(value: unknown): value is SecretStoreBinding {
  return Boolean(
    value &&
      (typeof value === "object" || typeof value === "function") &&
      "get" in value &&
      typeof (value as { get?: unknown }).get === "function",
  );
}

async function readBindingValue(binding: unknown): Promise<string | undefined> {
  const direct = normalizeValue(binding);
  if (direct) return direct;
  if (!isSecretStoreBinding(binding)) return undefined;
  try {
    return normalizeValue(await binding.get());
  } catch {
    // Kein Secret loggen, nur den Fehlschlag melden.
    console.error("[server-env] Secrets-Store-Binding konnte nicht gelesen werden");
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

export async function readServerBinding(name: string): Promise<string | undefined> {
  const runtimeEnv = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const runtimeValue = await readBindingValue(runtimeEnv?.[name]);
  if (runtimeValue) return runtimeValue;

  const importedValue = await readBindingValue((await readCloudflareEnv())[name]);
  if (importedValue) return importedValue;

  return normalizeValue(process.env[name]);
}

/** Gemini-Key ausschließlich serverseitig; kein OpenAI-/Lovable-Fallback. */
export async function readGeminiApiKey(): Promise<string | undefined> {
  return (
    (await readServerBinding("GEMINIAI_API_KEY")) ??
    (await readServerBinding("GEMINI_API_KEY")) ??
    (await readServerBinding("GOOGLE_API_KEY"))
  );
}
