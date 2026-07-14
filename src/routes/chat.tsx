import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

import {
  ArrowUp,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { generateAnswer, REVIEW_HINT, type ChatAnswer } from "@/lib/chatHeuristics";
import { useServerFn } from "@tanstack/react-start";
import { askChat } from "@/lib/ai/chat.functions";

function toChatAnswer(ai: Awaited<ReturnType<typeof askChat>>): ChatAnswer {
  const sourceLine = ai.sources && ai.sources.length > 0
    ? ai.sources
        .map((s) => (s.reference ? `${s.title} (${s.reference})` : s.title))
        .join(" · ")
    : undefined;
  const knowledgeParts = [ai.knowledge ?? undefined, sourceLine ? `Quellen: ${sourceLine}` : undefined].filter(
    Boolean,
  ) as string[];
  return {
    summary: ai.summary,
    reasoning: ai.reasoning ?? undefined,
    sections: ai.sections?.length ? ai.sections : undefined,
    risks: ai.risks?.length ? ai.risks : undefined,
    followUps: ai.followUps?.length ? ai.followUps : undefined,
    nextStep: ai.nextStep ?? undefined,
    knowledge: knowledgeParts.length ? knowledgeParts.join("\n") : undefined,
    sources: ai.sources?.length ? ai.sources : undefined,
    confidence: ai.confidence,
    needsHumanReview: ai.needsHumanReview,
  };
}

function withFallbackMarker(a: ChatAnswer): ChatAnswer {
  return {
    ...a,
    fromFallback: true,
    knowledge: [
      "Diese Antwort wurde aus der lokalen Wissenslogik erzeugt (KI-Modell nicht erreichbar).",
      a.knowledge ?? "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "steuerstoff Chat · Steuerlicher KI-Arbeitsassistent" },
      {
        name: "description",
        content:
          "steuerstoff Chat beantwortet steuerliche Fragen und strukturiert Kanzlei-Sachverhalte.",
      },
    ],
  }),
});

type Msg =
  | { id: string; role: "user"; text: string; t: number }
  | { id: string; role: "assistant"; answer: ChatAnswer; t: number }
  | { id: string; role: "error"; text: string; t: number; retryOf: string };

const STORAGE_KEY = "steuerstoff.chat.v1";

const SUGGEST = [
  "Was kann steuerstoff?",
  "NPO-Sphäre prüfen",
  "SKR03 in SKR42 umwandeln",
  "Mittelverwendung erklären",
  "Rückfrage formulieren",
  "Kfz-Wertabgabe berechnen",
];

const EXAMPLES = [
  "Was sind Mitgliedsbeiträge im Verein für eine Sphäre?",
  "Wie viel Umsatzsteuer fällt auf Strom an?",
  "Wandle SKR03 4210 in SKR42 um.",
  "Spende mit Logo-Nennung: Spende oder Sponsoring?",
  "Zufluss 2024: Bis wann muss die Mittelverwendung erfolgen?",
];

function loadMessages(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: Msg[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    // ignore quota / privacy mode
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type Phase = "welcome" | "starting" | "active";
const GREETING_TEXT = "Wie kann ich dir helfen?";

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [dots, setDots] = useState(false);
  const [typed, setTyped] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const startingRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }

  // hydrate once
  useEffect(() => {
    const m = loadMessages();
    setMessages(m);
    if (m.length > 0) setPhase("active");
    // Dev-Modus: KB-Regression per Konsole ausführbar machen.
    if (import.meta.env.DEV && typeof window !== "undefined") {
      void import("@/lib/regressionRunner").then((m) => {
        (window as unknown as { __runKbRegression?: (opts?: { verbose?: boolean }) => unknown }).__runKbRegression =
          (opts = { verbose: true }) => m.runKbRegression(opts);
        // eslint-disable-next-line no-console
        console.info("[steuerstoff] KB-Regression verfügbar: window.__runKbRegression()");
      });
    }
    return () => clearTimers();
  }, []);

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function startWelcomeFlow() {
    if (startingRef.current || phase !== "welcome") return;
    startingRef.current = true;
    setWelcomeLeaving(true);
    const t1 = window.setTimeout(() => {
      setPhase("starting");
      setShowGreetingBubble(true);
      if (prefersReducedMotion()) {
        setDots(false);
        setTyped(GREETING_TEXT);
        setPhase("active");
        const tf = window.setTimeout(() => textareaRef.current?.focus(), 60);
        timersRef.current.push(tf);
        return;
      }
      setDots(true);
      const t2 = window.setTimeout(() => {
        setDots(false);
        const text = GREETING_TEXT;
        let i = 0;
        const step = () => {
          i++;
          setTyped(text.slice(0, i));
          if (i < text.length) {
            const tn = window.setTimeout(step, 42);
            timersRef.current.push(tn);
          } else {
            const tf = window.setTimeout(() => {
              setPhase("active");
              textareaRef.current?.focus();
            }, 180);
            timersRef.current.push(tf);
          }
        };
        const t3 = window.setTimeout(step, 150);
        timersRef.current.push(t3);
      }, 900);
      timersRef.current.push(t2);
    }, 260);
    timersRef.current.push(t1);
  }

  function skipWelcomeAndAsk(text: string) {
    clearTimers();
    startingRef.current = true;
    setWelcomeLeaving(true);
    setShowGreetingBubble(false);
    setDots(false);
    setTyped("");
    const t = window.setTimeout(() => {
      setPhase("active");
      void ask(text);
    }, 240);
    timersRef.current.push(t);
  }


  // persist
  useEffect(() => {
    if (messages.length) saveMessages(messages);
  }, [messages]);

  // auto-scroll: sanft zum Beginn der neuesten Antwort, nicht ans absolute Ende.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nodes = el.querySelectorAll<HTMLElement>("[data-msg]");
    const last = nodes[nodes.length - 1];
    if (last) {
      last.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, busy]);

  // autosize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const askChatFn = useServerFn(askChat);

  async function ask(text: string, retryOf?: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const userMsg: Msg = { id: uid(), role: "user", text: trimmed, t: Date.now() };
    setMessages((prev) => {
      const base = retryOf ? prev.filter((m) => m.id !== retryOf) : prev;
      return [...base, userMsg];
    });
    setInput("");
    setBusy(true);

    // Baue kompakten Verlauf (letzte 10 Nachrichten, nur user/assistant).
    const priorMsgs = messages.filter((m) => m.role === "user" || m.role === "assistant");
    const history = priorMsgs.slice(-10).map((m) =>
      m.role === "user"
        ? { role: "user" as const, content: m.text }
        : { role: "assistant" as const, content: m.answer.summary },
    );

    try {
      const ai = await askChatFn({ data: { message: trimmed, history } });
      const aiMsg: Msg = { id: uid(), role: "assistant", answer: toChatAnswer(ai), t: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback auf lokale Heuristik, damit der Nutzer nicht leer ausgeht.
      console.warn("[steuerstoff-chat] AI unavailable, using local fallback:", (err as Error).message);
      try {
        const fallback = withFallbackMarker(generateAnswer(trimmed));
        const aiMsg: Msg = { id: uid(), role: "assistant", answer: fallback, t: Date.now() };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        const errMsg: Msg = {
          id: uid(),
          role: "error",
          text:
            (err as Error).message ||
            "Antwort konnte nicht erstellt werden. Bitte erneut versuchen.",
          t: Date.now(),
          retryOf: userMsg.id,
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setBusy(false);
      if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
        textareaRef.current?.focus();
      }
    }
  }

  function activateChatImmediately() {
    clearTimers();
    startingRef.current = true;
    setWelcomeLeaving(false);
    setShowGreetingBubble(false);
    setDots(false);
    setTyped("");
    setPhase("active");
  }

  function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (phase !== "active") activateChatImmediately();
    void ask(trimmed);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sendet, Shift+Enter erzeugt Zeilenumbruch. Auf Touch-Geräten
    // bleibt Enter = Zeilenumbruch, damit die Bildschirmtastatur nicht
    // ungewollt sendet.
    if (e.key === "Enter" && !e.shiftKey && !(e.nativeEvent as { isComposing?: boolean }).isComposing) {
      const isFine =
        typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
      if (isFine) {
        e.preventDefault();
        submitMessage(input);
      }
    }
  }

  function regenerate() {
    // last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "user") {
        // remove assistant messages after this user msg
        setMessages((prev) => prev.slice(0, i + 1));
        setBusy(true);
        setTimeout(async () => {
          await new Promise((r) => setTimeout(r, 250));
          const answer = generateAnswer(m.text);
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: "assistant", answer, t: Date.now() },
          ]);
          setBusy(false);
        }, 0);
        return;
      }
    }
  }

  function newChat() {
    clearTimers();
    setMessages([]);
    setPhase("welcome");
    setWelcomeLeaving(false);
    setShowGreetingBubble(false);
    setDots(false);
    setTyped("");
    setInput("");
    startingRef.current = false;
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }

  function markCopied(id: string) {
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
  }

  function copyAnswer(id: string, a: ChatAnswer) {
    const parts: string[] = [a.summary];
    if (a.reasoning) parts.push("\nBegründung: " + a.reasoning);
    if (a.risks?.length) parts.push("\nRisiken:\n- " + a.risks.join("\n- "));
    if (a.followUps?.length) parts.push("\nRückfragen:\n- " + a.followUps.join("\n- "));
    if (a.nextStep) parts.push("\nNächster Schritt: " + a.nextStep);
    copyTextToClipboard(parts.join("\n")).then((ok) => {
      if (ok) markCopied(id);
    });
  }

  function copyUserPrompt(id: string, text: string) {
    copyTextToClipboard(text).then((ok) => {
      if (ok) markCopied(id);
    });
  }

  const hasMessages = messages.length > 0;
  const canSend = input.trim().length > 0 && !busy;

  return (
    <div className="chat-page chat-bg-deep min-h-screen flex flex-col" data-page="chat">
      <SiteHeader />

      <div className="border-b border-white/10 bg-transparent">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-white">
              steuerstoff Chat
            </h1>
            <p className="text-[11px] text-white/60">
              Steuerlicher KI-Arbeitsassistent
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {(hasMessages || phase !== "welcome") && (
              <button
                type="button"
                onClick={newChat}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
                aria-label="Neuer Chat"
              >
                <Plus className="h-3.5 w-3.5" />
                Neuer Chat
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-[160px] md:pb-[180px]">
          {phase === "welcome" ? (
            <div
              className={`space-y-6 transition-all duration-300 ease-out ${
                welcomeLeaving ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
              }`}
              aria-hidden={welcomeLeaving}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label="Chat starten"
                onClick={startWelcomeFlow}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startWelcomeFlow();
                  }
                }}
                className="w-full cursor-pointer rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-transform hover:border-foreground/25 active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--gradient-accent)" }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-background" />
                  </span>
                  <div>
                    <p className="text-sm text-foreground">
                      Hallo, ich bin der steuerstoff Chat. Stell mir eine steuerliche Frage
                      oder beschreibe einen Kanzlei-Sachverhalt.
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Tippe hier, um zu starten.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Schnellzugriff
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGEST.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (s.endsWith("?")) {
                          submitMessage(s);
                        } else {
                          setInput(s + ": ");
                          activateChatImmediately();
                          setTimeout(() => textareaRef.current?.focus(), 0);
                        }
                      }}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Beispiel-Fragen
                </p>
                <div className="grid gap-2">
                  {EXAMPLES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submitMessage(q)}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <span className="min-w-0 truncate">{q}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {showGreetingBubble && (
                <div data-msg className="flex justify-start animate-in fade-in duration-300">
                  <div className="w-full max-w-[94%] rounded-2xl rounded-tl-md border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--gradient-accent)" }}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-background" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {dots ? (
                          <span
                            role="status"
                            aria-label="steuerstoff schreibt"
                            className="inline-flex items-center gap-1 py-1"
                          >
                            {prefersReducedMotion() ? (
                              <span className="text-sm text-muted-foreground">
                                steuerstoff schreibt …
                              </span>
                            ) : (
                              <>
                                <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                                <span className="typing-dot" style={{ animationDelay: "160ms" }} />
                                <span className="typing-dot" style={{ animationDelay: "320ms" }} />
                              </>
                            )}
                          </span>
                        ) : (
                          <>
                            <p
                              aria-hidden={phase !== "active"}
                              className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground"
                            >
                              {typed}
                              {phase === "starting" && typed.length < GREETING_TEXT.length && (
                                <span className="typing-caret" aria-hidden>|</span>
                              )}
                            </p>
                            {phase === "active" && (
                              <p className="sr-only" aria-live="polite">
                                {GREETING_TEXT}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  copied={copiedId === m.id}
                  onCopy={() => {
                    if (m.role === "assistant") copyAnswer(m.id, m.answer);
                    else if (m.role === "user") copyUserPrompt(m.id, m.text);
                  }}
                  onRetry={() => {
                    if (m.role === "error") ask(messageTextById(messages, m.retryOf) ?? "", m.id);
                  }}
                />
              ))}
              {busy && (
                <div
                  data-msg
                  className="flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-4 py-3 text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-foreground" />
                  steuerstoff denkt nach …
                </div>
              )}
              {!busy && messages.some((m) => m.role === "assistant") && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={regenerate}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Antwort erneut erstellen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07142f]/95 backdrop-blur pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-3"
        data-no-swipe="true"
      >
        <div className="mx-auto w-full max-w-3xl px-3 pt-3">
          <div className="flex items-end gap-2 rounded-3xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-foreground/30">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Stell eine steuerliche Frage …"
              className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
              style={{ maxHeight: 180 }}
              aria-label="Nachricht eingeben"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Nachricht senden"
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                canSend
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between px-2 pb-2 pt-1.5">
            <p className="text-[10px] text-muted-foreground">
              Arbeitshilfe, keine verbindliche Beratung.
            </p>
            {hasMessages && (
              <button
                type="button"
                onClick={newChat}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-3 w-3" />
                Verlauf löschen
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function messageTextById(msgs: Msg[], id: string): string | null {
  const m = msgs.find((x) => x.id === id);
  if (m && m.role === "user") return m.text;
  return null;
}
async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = String(text ?? "");
  if (!value) return false;

  // 1) Modern async Clipboard API (funktioniert auf iOS Safari 13.4+ innerhalb
  //    eines Nutzer-Gestures und ist die zuverlässigste Variante).
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function" &&
      (typeof window === "undefined" || window.isSecureContext !== false)
    ) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* Fallback unten */
  }

  // 2) iOS-Safari-Fallback: contentEditable + Range/Selection (execCommand).
  if (typeof document === "undefined") return false;
  const el = document.createElement("span");
  el.textContent = value;
  el.setAttribute("contenteditable", "true");
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.opacity = "0";
  el.style.whiteSpace = "pre-wrap";
  document.body.appendChild(el);

  let ok = false;
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection?.removeAllRanges();
    selection?.addRange(range);
    (el as HTMLElement).focus();
    ok = document.execCommand("copy");
    selection?.removeAllRanges();
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(el);
  }

  if (!ok) {
    try {
      window.prompt("Kopieren mit Cmd/Ctrl+C, dann Enter:", value);
      ok = true;
    } catch {
      ok = false;
    }
  }
  return ok;
}
function MessageBubble({
  msg,
  copied,
  onCopy,
  onRetry,
}: {
  msg: Msg;
  copied: boolean;
  onCopy: () => void;
  onRetry: () => void;
}) {
  if (msg.role === "user") {
    return (
      <div data-msg className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground">
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{msg.text}</p>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCopy();
            }}
            className="mt-2 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-[11px] text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground touch-manipulation"
            aria-label="Frage kopieren"
          >
            {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
            <span>{copied ? "Kopiert" : "Kopieren"}</span>
          </button>
        </div>
      </div>
    );
  }
  if (msg.role === "error") {
    return (
      <div data-msg className="flex justify-start">
        <div className="w-full max-w-[92%] rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Das hat gerade nicht geklappt.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bitte erneut versuchen oder die Frage etwas konkreter formulieren.
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground hover:bg-accent"
              >
                <RefreshCw className="h-3 w-3" />
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-msg className="flex justify-start">
      <AssistantCard msg={msg} copied={copied} onCopy={onCopy} />
    </div>
  );
}

// Sortiert Sections in „immer offen" vs. „einklappbar". Nummerierte
// Prüfungsschritte werden in einem gemeinsamen Akkordeon zusammengefasst.
const PRIMARY_TITLES = new Set(["Einordnung", "Ergebnis", "Berechnung"]);
const COLLAPSIBLE_TITLES = new Set([
  "Subsumtion",
  "Prüfschema",
  "Prüfungsschema",
  "Rechtsgrundlagen",
  "Vertiefung",
  "Alternative Regel",
  "Nicht anwenden",
  "Buchung",
]);

function AssistantCard({
  msg,
  copied,
  onCopy,
}: {
  msg: Extract<Msg, { role: "assistant" }>;
  copied: boolean;
  onCopy: () => void;
}) {
  const a = msg.answer;
  const sections = a.sections ?? [];
  const numbered: { title: string; body: string }[] = [];
  const primary: { title: string; body: string }[] = [];
  const collapsible: { title: string; body: string }[] = [];
  let ergebnis: { title: string; body: string } | null = null;

  for (const s of sections) {
    if (/^\s*\d+\.\s/.test(s.title)) {
      // "9. Ergebnis" separat hervorheben
      if (/ergebnis/i.test(s.title) && !ergebnis) {
        ergebnis = { title: "Ergebnis", body: s.body };
      } else {
        numbered.push(s);
      }
      continue;
    }
    if (s.title === "Ergebnis" && !ergebnis) {
      ergebnis = s;
      continue;
    }
    if (PRIMARY_TITLES.has(s.title)) primary.push(s);
    else if (COLLAPSIBLE_TITLES.has(s.title)) collapsible.push(s);
    else collapsible.push(s);
  }

  // Reasoning weglassen, wenn eine Subsumtion vorhanden ist (Doppelung vermeiden).
  const showReasoning =
    !!a.reasoning &&
    !sections.some((s) => /subsumtion|begründung/i.test(s.title));

  return (
    <div className="w-full max-w-[94%] space-y-3 rounded-2xl rounded-tl-md border border-border bg-card p-4 shadow-sm">
      {/* Ergebnis prominent oben */}
      <div className="rounded-xl bg-foreground/[0.04] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ergebnis
        </p>
        <p className="mt-1 break-words text-[15px] font-semibold leading-snug text-foreground">
          {ergebnis?.body ?? a.summary}
        </p>
      </div>

      {primary.map((s, i) => (
        <SectionBlock key={"p" + i} title={s.title} body={s.body} />
      ))}

      {showReasoning && (
        <SectionBlock title="Kurzbegründung" body={a.reasoning!} muted />
      )}

      {numbered.length > 0 && (
        <Accordion title={`Prüfungsschema (${numbered.length} Schritte)`}>
          <ol className="space-y-1.5 text-sm leading-relaxed text-foreground">
            {numbered.map((s, i) => (
              <li key={i} className="break-words">
                <span className="font-medium">{s.title}</span>
                {s.body ? <span className="text-muted-foreground"> — {s.body}</span> : null}
              </li>
            ))}
          </ol>
        </Accordion>
      )}

      {collapsible.map((s, i) => (
        <Accordion key={"c" + i} title={s.title}>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {s.body}
          </p>
        </Accordion>
      ))}

      {a.clarify && (
        <p className="rounded-lg border border-dashed border-border bg-background/30 p-3 text-sm text-foreground">
          {a.clarify}
        </p>
      )}

      {a.risks && a.risks.length > 0 && (
        <Accordion title={`Risiken (${a.risks.length})`}>
          <ul className="space-y-1 text-sm text-foreground">
            {a.risks.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span className="break-words">{r}</span>
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {a.followUps && a.followUps.length > 0 && (
        <Accordion title="Offene Punkte">
          <ul className="space-y-1 text-sm text-foreground">
            {a.followUps.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span className="break-words">{r}</span>
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {a.nextStep && (
        <div className="rounded-lg border border-border bg-background/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Nächster Schritt
          </p>
          <p className="mt-1 break-words text-sm text-foreground">{a.nextStep}</p>
        </div>
      )}

      {a.links && a.links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {a.links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
            >
              {l.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      )}

      {a.knowledge && (
        <p className="text-[11px] text-muted-foreground">
          Passender Wissensbereich:{" "}
          <Link to="/wissensdatenbank" className="underline-offset-2 hover:underline">
            {a.knowledge}
          </Link>
        </p>
      )}

      <p className="border-t border-border/60 pt-2 text-[10px] leading-snug text-muted-foreground">
        {REVIEW_HINT}
      </p>

      <div className="flex items-center gap-1 pt-1">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Antwort kopieren"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  body,
  muted = false,
}: {
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <div
      className={
        muted
          ? "rounded-lg bg-muted/40 p-3"
          : "rounded-lg border border-border bg-background/40 p-3"
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
        {body}
      </p>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-lg border border-border bg-background/40 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
        <span className="truncate">{title}</span>
        <span
          aria-hidden
          className="inline-block shrink-0 rounded-full border border-border px-1.5 text-[10px] font-normal text-muted-foreground group-open:hidden"
        >
          öffnen
        </span>
        <span
          aria-hidden
          className="hidden shrink-0 rounded-full border border-border px-1.5 text-[10px] font-normal text-muted-foreground group-open:inline-block"
        >
          schließen
        </span>
      </summary>
      <div className="border-t border-border/60 px-3 py-2">{children}</div>
    </details>
  );
}

export default ChatPage;
