const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const DEFAULT_MODEL = "gemini-3.6-flash";
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-flash-latest"];
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY = 8;

function jsonError(status: number, error: string, message: string, reason?: string): Response {
  return new Response(JSON.stringify({ error, status, message, reason }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...CORS_HEADERS,
    },
  });
}

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatBody = {
  message?: unknown;
  history?: unknown;
  attachments?: unknown;
};

type GeminiSsePayload = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

function safeJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function validHistory(value: unknown): IncomingMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is IncomingMessage =>
        Boolean(item) &&
        typeof item === "object" &&
        ((item as IncomingMessage).role === "user" ||
          (item as IncomingMessage).role === "assistant") &&
        typeof (item as IncomingMessage).content === "string" &&
        (item as IncomingMessage).content.length > 0 &&
        (item as IncomingMessage).content.length <= MAX_MESSAGE_LENGTH,
    )
    .slice(-MAX_HISTORY);
}

async function callGemini(opts: {
  apiKey: string;
  model: string;
  message: string;
  history: IncomingMessage[];
  signal: AbortSignal;
}): Promise<Response> {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}` +
    ":streamGenerateContent?alt=sse";

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": opts.apiKey,
    },
    signal: opts.signal,
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              'Du bist "steuerstoff", ein deutschsprachiger steuerlicher Arbeitsassistent. Antworte klar, praxisorientiert und ausschließlich auf Deutsch. Erfinde keine Fundstellen. Füge am Ende hinzu: *Hinweis: Steuerliche Arbeitshilfe, keine verbindliche Beratung.*',
          },
        ],
      },
      contents: [
        ...opts.history.map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content }],
        })),
        { role: "user", parts: [{ text: opts.message }] },
      ],
      generationConfig: {
        maxOutputTokens: 1400,
        temperature: 0.2,
      },
    }),
  });
}

function extractTextFromSseEvent(event: string): string {
  const data = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("");

  if (!data || data === "[DONE]") return "";

  const payload = safeJson<GeminiSsePayload>(data);
  return (payload?.candidates?.[0]?.content?.parts ?? [])
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("");
}

function createPlainTextStream(
  upstream: Response,
  model: string,
  controller: AbortController,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(streamController) {
      const reader = upstream.body?.getReader();
      if (!reader) {
        streamController.error(new Error("Gemini-Antwort enthält keinen Stream."));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          for (const event of events) {
            const text = extractTextFromSseEvent(event);
            if (text) streamController.enqueue(encoder.encode(text));
          }
        }

        buffer += decoder.decode();
        if (buffer.trim()) {
          const text = extractTextFromSseEvent(buffer);
          if (text) streamController.enqueue(encoder.encode(text));
        }

        streamController.enqueue(
          encoder.encode(`\n\n<<STEUERSTOFF_META>>${JSON.stringify({ model })}`),
        );
        streamController.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gemini-Streamfehler";
        console.error("[gemini-upstream] stream failed", { model, message });
        try {
          streamController.enqueue(
            encoder.encode(`\n\n<<STEUERSTOFF_ERROR>>${message}`),
          );
          streamController.close();
        } catch {
          streamController.error(error);
        }
      }
    },
    cancel() {
      controller.abort();
    },
  });
}

export async function handleDirectChatRequest(
  request: Request,
  runtimeEnv: Record<string, unknown>,
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Nur POST ist erlaubt.");
  }

  const apiKey =
    typeof runtimeEnv.GEMINIAI_API_KEY === "string"
      ? runtimeEnv.GEMINIAI_API_KEY.trim()
      : "";

  if (!apiKey) {
    return jsonError(
      503,
      "missing_gemini_binding",
      "KI-Funktion ist derzeit serverseitig nicht konfiguriert.",
      "GEMINIAI_API_KEY binding not available",
    );
  }

  const body = (await request.json().catch(() => null)) as ChatBody | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return jsonError(400, "invalid_message", "Ungültige Nachricht.");
  }

  const history = validHistory(body?.history);
  const configuredModel =
    typeof runtimeEnv.GEMINI_CHAT_MODEL === "string" && runtimeEnv.GEMINI_CHAT_MODEL.trim()
      ? runtimeEnv.GEMINI_CHAT_MODEL.trim()
      : DEFAULT_MODEL;
  const models = [configuredModel, ...FALLBACK_MODELS.filter((model) => model !== configuredModel)];

  const controller = new AbortController();
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  let lastStatus = 502;
  let lastReason = "Gemini konnte nicht erreicht werden.";

  for (const model of models) {
    const upstream = await callGemini({
      apiKey,
      model,
      message,
      history,
      signal: controller.signal,
    });

    if (upstream.ok && upstream.body) {
      return new Response(createPlainTextStream(upstream, model, controller), {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-accel-buffering": "no",
          "x-chat-provider": "google-gemini-direct",
          "x-chat-model": model,
          ...CORS_HEADERS,
        },
      });
    }

    lastStatus = upstream.status || 502;
    const upstreamText = await upstream.text().catch(() => "");
    lastReason = upstreamText.slice(0, 1000) || `Gemini HTTP ${lastStatus}`;

    console.warn("[gemini-upstream] request failed", {
      model,
      status: lastStatus,
      reason: lastReason,
    });

    const modelUnavailable =
      lastStatus === 404 ||
      /not found|not supported|invalid model|does not exist/i.test(lastReason);
    const retryWithFallbackModel = modelUnavailable || lastStatus === 429;

    if (!retryWithFallbackModel) break;
  }

  return jsonError(
    lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502,
    "gemini_upstream_error",
    "Das KI-Modell konnte die Anfrage nicht verarbeiten.",
    lastReason,
  );
}
