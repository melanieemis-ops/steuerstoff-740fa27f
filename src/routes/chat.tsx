import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
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

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // hydrate once
  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  // persist
  useEffect(() => {
    if (messages.length) saveMessages(messages);
  }, [messages]);

  // auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // autosize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

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
    try {
      // small delay to feel like a real response
      await new Promise((r) => setTimeout(r, 350));
      const answer = generateAnswer(trimmed);
      const aiMsg: Msg = { id: uid(), role: "assistant", answer, t: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Msg = {
        id: uid(),
        role: "error",
        text: "Antwort konnte nicht erstellt werden.",
        t: Date.now(),
        retryOf: userMsg.id,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setBusy(false);
      // refocus on desktop only
      if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
        textareaRef.current?.focus();
      }
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      const isFine =
        typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
      if (isFine) {
        e.preventDefault();
        ask(input);
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
    setMessages([]);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }

  function copyAnswer(id: string, a: ChatAnswer) {
    const parts: string[] = [a.summary];
    if (a.reasoning) parts.push("\nBegründung: " + a.reasoning);
    if (a.risks?.length) parts.push("\nRisiken:\n- " + a.risks.join("\n- "));
    if (a.followUps?.length) parts.push("\nRückfragen:\n- " + a.followUps.join("\n- "));
    if (a.nextStep) parts.push("\nNächster Schritt: " + a.nextStep);
    const text = parts.join("\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      });
    }
  }

  const hasMessages = messages.length > 0;
  const canSend = input.trim().length > 0 && !busy;

  return (
    <div className="chat-bg-deep min-h-screen flex flex-col">
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
            {hasMessages && (
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
          {!hasMessages ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                    <p className="mt-2 text-[11px] text-muted-foreground">{REVIEW_HINT}</p>
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
                      onClick={() => (s.endsWith("?") ? ask(s) : setInput(s + ": "))}
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
                      onClick={() => ask(q)}
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
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  copied={copiedId === m.id}
                  onCopy={() => m.role === "assistant" && copyAnswer(m.id, m.answer)}
                  onRetry={() => {
                    if (m.role === "error") ask(messageTextById(messages, m.retryOf) ?? "", m.id);
                  }}
                />
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
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
async function copyTextToClipboard(text: string) {
  const value = String(text ?? "");
  if (!value) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fallback unten
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);

    return ok;
  } catch {
    return false;
  }
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
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/10 px-4 py-3 text-white">
        <p className="whitespace-pre-wrap">{msg.text}</
<button
  type="button"
  onClick={async (event) => {
    event.preventDefault();
    event.stopPropagation();

    await copyTextToClipboard(msg.text);
  }}
  className="mt-3 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
  aria-label="Prompt kopieren"
>
  <Copy className="h-3 w-3" />
  Kopieren
</button>
      </div>
    </div>
  );
}
  if (msg.role === "error") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{msg.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bitte versuche es erneut oder formuliere die Frage etwas konkreter.
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

  const a = msg.answer;
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-3 rounded-2xl rounded-tl-md border border-border bg-card p-4 shadow-sm">
        <p className="text-sm leading-relaxed text-foreground">{a.summary}</p>

        {a.sections && a.sections.length > 0 && (
          <div className="space-y-2">
            {a.sections.map((s, i) => (
              <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        )}

        {a.reasoning && (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Begründung
            </p>
            <p className="mt-1 text-sm text-foreground">{a.reasoning}</p>
          </div>
        )}

        {a.clarify && (
          <p className="rounded-lg border border-dashed border-border bg-background/30 p-3 text-sm text-foreground">
            {a.clarify}
          </p>
        )}

        {a.risks && a.risks.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Risiken</p>
            <ul className="mt-1 space-y-1 text-sm text-foreground">
              {a.risks.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-destructive" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {a.followUps && a.followUps.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rückfragen</p>
            <ul className="mt-1 space-y-1 text-sm text-foreground">
              {a.followUps.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {a.nextStep && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Nächster Schritt
            </p>
            <p className="mt-1 text-sm text-foreground">{a.nextStep}</p>
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
    </div>
  );
}

export default ChatPage;
