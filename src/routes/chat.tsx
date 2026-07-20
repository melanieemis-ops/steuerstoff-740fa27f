import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AttachmentPreviewList } from "@/components/chat/AttachmentPreviewList";
import { ChatAttachmentButton } from "@/components/chat/ChatAttachmentButton";
import { ChatMessageAttachments } from "@/components/chat/ChatMessageAttachments";
import { FileDropZone } from "@/components/chat/FileDropZone";
import { MessageSpeechControls } from "@/components/chat/MessageSpeechControls";
import { SpeechMiniPlayer } from "@/components/chat/SpeechMiniPlayer";
import { UploadSafetyNotice } from "@/components/chat/UploadSafetyNotice";
import { useChatAttachments } from "@/hooks/useChatAttachments";
import { SpeechProvider, useSpeechContext } from "@/hooks/useSpeechSynthesis";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import {
  ALL_ATTACHMENT_ACCEPT,
  UPLOAD_WARNING_STORAGE_KEY,
  type AttachmentPickerAction,
  type ChatMessageAttachment,
} from "@/lib/attachment-types";
import { generateAnswer, REVIEW_HINT, type ChatAnswer } from "@/lib/chatHeuristics";
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  LoaderCircle,
  Mic,
  Plus,
  RefreshCw,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";

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
  | { id: string; role: "user"; text: string; attachments?: ChatMessageAttachment[]; t: number }
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

function hasAcceptedUploadNotice() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(UPLOAD_WARNING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function storeAcceptedUploadNotice() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UPLOAD_WARNING_STORAGE_KEY, "1");
  } catch {
    // ignore storage failures
  }
}

function formatUserHistoryContent(msg: Extract<Msg, { role: "user" }>) {
  const parts = [msg.text.trim()];
  if (msg.attachments?.length) {
    parts.push(`Anhänge: ${msg.attachments.map((attachment) => attachment.name).join(", ")}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

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
  const [showUploadSafetyNotice, setShowUploadSafetyNotice] = useState(false);
  const [pendingPickerAction, setPendingPickerAction] = useState<AttachmentPickerAction | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const startingRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const chatAttachments = useChatAttachments();

  function clearTimers() {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }

  useEffect(() => {
    const persistedMessages = loadMessages();
    setMessages(persistedMessages);
    if (persistedMessages.length > 0) setPhase("active");
    if (import.meta.env.DEV && typeof window !== "undefined") {
      void import("@/lib/regressionRunner").then((module) => {
        (
          window as unknown as { __runKbRegression?: (opts?: { verbose?: boolean }) => unknown }
        ).__runKbRegression = (opts = { verbose: true }) => module.runKbRegression(opts);
        console.info("[steuerstoff] KB-Regression verfügbar: window.__runKbRegression()");
      });
    }
    return () => clearTimers();
  }, []);

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
        const greetingText = GREETING_TEXT;
        let i = 0;
        const step = () => {
          i += 1;
          setTyped(greetingText.slice(0, i));
          if (i < greetingText.length) {
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

  function skipWelcomeAndAsk(question: string) {
    clearTimers();
    startingRef.current = true;
    setWelcomeLeaving(true);
    setShowGreetingBubble(false);
    setDots(false);
    setTyped("");
    const t = window.setTimeout(() => {
      setPhase("active");
      void ask(question);
    }, 240);
    timersRef.current.push(t);
  }

  useEffect(() => {
    if (messages.length) saveMessages(messages);
  }, [messages]);

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
  }, [messages.length, busy, chatAttachments.attachments.length]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  async function ask(
    textValue: string,
    attachmentsToSend: ChatMessageAttachment[] = [],
    retryOf?: string,
  ) {
    const trimmed = textValue.trim();
    if ((!trimmed && attachmentsToSend.length === 0) || busy) return;
    const userMsg: Msg = {
      id: uid(),
      role: "user",
      text: trimmed,
      attachments: attachmentsToSend.length ? attachmentsToSend : undefined,
      t: Date.now(),
    };
    const assistantId = uid();
    setMessages((prev) => {
      const base = retryOf ? prev.filter((msg) => msg.id !== retryOf) : prev;
      return [...base, userMsg];
    });
    setInput("");
    setBusy(true);

    const priorMsgs = messages.filter((msg) => msg.role === "user" || msg.role === "assistant");
    const history = priorMsgs
      .slice(-8)
      .map((msg) =>
        msg.role === "user"
          ? { role: "user" as const, content: formatUserHistoryContent(msg) }
          : { role: "assistant" as const, content: msg.answer.summary },
      );

    let assistantInserted = false;
    let accumulated = "";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          attachments: attachmentsToSend.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            mimeType: attachment.mimeType,
            size: attachment.size,
            kind: attachment.kind,
            uploadedFileId: attachment.uploadedFileId,
          })),
        }),
      });
      if (!resp.ok || !resp.body) {
        const messageText = await resp.text().catch(() => "");
        throw new Error(messageText || `HTTP ${resp.status}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let meta: {
        sources?: Array<{ id: string; title: string; reference: string | null; excerpt: string }>;
        model?: string;
        attachmentFailures?: string[];
      } = {};

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const metaIdx = buf.indexOf("<<STEUERSTOFF_META>>");
        const errIdx = buf.indexOf("<<STEUERSTOFF_ERROR>>");
        let visible = buf;
        if (metaIdx !== -1) visible = buf.slice(0, metaIdx);
        else if (errIdx !== -1) visible = buf.slice(0, errIdx);
        if (visible !== accumulated) {
          accumulated = visible;
          const summarySoFar = accumulated.trimStart();
          if (!assistantInserted && summarySoFar.length > 0) {
            assistantInserted = true;
            setMessages((prev) => [
              ...prev,
              {
                id: assistantId,
                role: "assistant",
                answer: {
                  summary: summarySoFar,
                  confidence: "medium",
                  needsHumanReview: false,
                } as ChatAnswer,
                t: Date.now(),
              },
            ]);
          } else if (assistantInserted) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId && msg.role === "assistant"
                  ? { ...msg, answer: { ...msg.answer, summary: summarySoFar } }
                  : msg,
              ),
            );
          }
        }
        if (metaIdx !== -1 && buf.length >= metaIdx + "<<STEUERSTOFF_META>>".length) {
          const metaJson = buf.slice(metaIdx + "<<STEUERSTOFF_META>>".length);
          try {
            meta = JSON.parse(metaJson);
          } catch {
            // wait for more
          }
        }
        if (errIdx !== -1) {
          throw new Error(
            buf.slice(errIdx + "<<STEUERSTOFF_ERROR>>".length).trim() || "Streamfehler",
          );
        }
      }

      const finalSummary = accumulated.trim();
      if (!finalSummary) throw new Error("Leere Antwort vom Modell.");
      const sources = Array.isArray(meta.sources) ? meta.sources : [];
      if (!assistantInserted) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            answer: {
              summary: finalSummary,
              sources: sources.length ? sources : undefined,
              confidence: "medium",
              needsHumanReview: sources.length === 0,
            } as ChatAnswer,
            t: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId && msg.role === "assistant"
              ? {
                  ...msg,
                  answer: {
                    ...msg.answer,
                    summary: finalSummary,
                    sources: sources.length ? sources : msg.answer.sources,
                    needsHumanReview: sources.length === 0 ? true : msg.answer.needsHumanReview,
                  },
                }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.warn(
        "[steuerstoff-chat] AI unavailable, using local fallback:",
        (error as Error).message,
      );
      if (assistantInserted) {
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
      }
      if (trimmed && attachmentsToSend.length === 0) {
        try {
          const fallback = withFallbackMarker(generateAnswer(trimmed));
          const aiMsg: Msg = { id: uid(), role: "assistant", answer: fallback, t: Date.now() };
          setMessages((prev) => [...prev, aiMsg]);
        } catch {
          const errMsg: Msg = {
            id: uid(),
            role: "error",
            text:
              (error as Error).message ||
              "Antwort konnte nicht erstellt werden. Bitte erneut versuchen.",
            t: Date.now(),
            retryOf: userMsg.id,
          };
          setMessages((prev) => [...prev, errMsg]);
        }
      } else {
        const errMsg: Msg = {
          id: uid(),
          role: "error",
          text:
            (error as Error).message ||
            "Backend unterstützt Anhänge derzeit noch nicht zuverlässig. Bitte erneut versuchen.",
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

  const voice = useVoiceInput({
    onTranscript: (textValue) => {
      setInput((prev) => {
        const trimmedTranscript = textValue.trim();
        if (!trimmedTranscript) return prev;
        const base = prev.trimEnd();
        return base ? `${base} ${trimmedTranscript}` : trimmedTranscript;
      });
      if (phase !== "active") activateChatImmediately();
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
  });

  function openPicker(action: AttachmentPickerAction) {
    const inputRef =
      action === "camera" ? cameraInputRef : action === "image" ? imageInputRef : fileInputRef;
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  function handleAttachmentAction(action: AttachmentPickerAction) {
    if (!hasAcceptedUploadNotice()) {
      setPendingPickerAction(action);
      setShowUploadSafetyNotice(true);
      return;
    }
    openPicker(action);
  }

  async function handleAttachmentInputChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (fileList) {
      if (phase !== "active") activateChatImmediately();
      await chatAttachments.addFiles(fileList);
    }
    event.target.value = "";
  }

  function acceptUploadNotice() {
    storeAcceptedUploadNotice();
    setShowUploadSafetyNotice(false);
    const nextAction = pendingPickerAction;
    setPendingPickerAction(null);
    if (nextAction) openPicker(nextAction);
  }

  function submitMessage(
    textValue: string,
    attachmentsToSend: ChatMessageAttachment[] = chatAttachments.readyAttachments,
  ) {
    const trimmed = textValue.trim();
    if ((!trimmed && attachmentsToSend.length === 0) || busy) return;
    if (phase !== "active") activateChatImmediately();
    chatAttachments.clearAttachments();
    void ask(trimmed, attachmentsToSend);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !(event.nativeEvent as { isComposing?: boolean }).isComposing
    ) {
      const isFine = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
      if (isFine) {
        event.preventDefault();
        submitMessage(input);
      }
    }
  }

  function regenerate() {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg.role === "user") {
        setMessages((prev) => prev.slice(0, i));
        void ask(msg.text, msg.attachments ?? []);
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
    setShowUploadSafetyNotice(false);
    setPendingPickerAction(null);
    chatAttachments.clearAttachments();
    startingRef.current = false;
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }

  function markCopied(id: string) {
    setCopiedId(id);
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
  }

  function copyAnswer(id: string, answer: ChatAnswer) {
    const parts: string[] = [answer.summary];
    if (answer.reasoning) parts.push("\nBegründung: " + answer.reasoning);
    if (answer.risks?.length) parts.push("\nRisiken:\n- " + answer.risks.join("\n- "));
    if (answer.followUps?.length) parts.push("\nRückfragen:\n- " + answer.followUps.join("\n- "));
    if (answer.nextStep) parts.push("\nNächster Schritt: " + answer.nextStep);
    copyTextToClipboard(parts.join("\n")).then((ok) => {
      if (ok) markCopied(id);
    });
  }

  function copyUserPrompt(
    id: string,
    textValue: string,
    attachmentsToSend?: ChatMessageAttachment[],
  ) {
    const payload = [textValue.trim()];
    if (attachmentsToSend?.length) {
      payload.push(`Anhänge: ${attachmentsToSend.map((attachment) => attachment.name).join(", ")}`);
    }
    copyTextToClipboard(payload.filter(Boolean).join("\n\n")).then((ok) => {
      if (ok) markCopied(id);
    });
  }

  const hasMessages = messages.length > 0;
  const hasText = input.trim().length > 0;
  const allAttachmentsReady =
    chatAttachments.attachments.length > 0 &&
    chatAttachments.readyAttachments.length === chatAttachments.attachments.length &&
    !chatAttachments.hasPendingUploads &&
    !chatAttachments.hasUploadErrors;
  const canSend =
    !busy && ((chatAttachments.attachments.length === 0 && hasText) || allAttachmentsReady);

  return (
    <SpeechProvider>
      <div
        className="chat-page chat-bg-deep relative flex min-h-screen flex-col"
        data-page="chat"
        onDragEnter={chatAttachments.onDragEnter}
        onDragOver={chatAttachments.onDragOver}
        onDragLeave={chatAttachments.onDragLeave}
        onDrop={chatAttachments.onDrop}
      >
        <SiteHeader />
        <FileDropZone active={chatAttachments.dragActive} />

        <div className="border-b border-white/10 bg-transparent">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight text-white">
                steuerstoff Chat
              </h1>
              <p className="text-[11px] text-white/60">Steuerlicher KI-Arbeitsassistent</p>
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
          <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-[220px] md:pb-[230px]">
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
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
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
                        Hallo, ich bin der steuerstoff Chat. Stell mir eine steuerliche Frage oder
                        beschreibe einen Kanzlei-Sachverhalt.
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
                    {SUGGEST.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          if (suggestion.endsWith("?")) {
                            submitMessage(suggestion);
                          } else {
                            setInput(suggestion + ": ");
                            activateChatImmediately();
                            setTimeout(() => textareaRef.current?.focus(), 0);
                          }
                        }}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Beispiel-Fragen
                  </p>
                  <div className="grid gap-2">
                    {EXAMPLES.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => submitMessage(question)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <span className="min-w-0 truncate">{question}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {showGreetingBubble && (
                  <div data-msg className="flex animate-in justify-start fade-in duration-300">
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
                                  <span
                                    className="typing-dot"
                                    style={{ animationDelay: "160ms" }}
                                  />
                                  <span
                                    className="typing-dot"
                                    style={{ animationDelay: "320ms" }}
                                  />
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
                                  <span className="typing-caret" aria-hidden>
                                    |
                                  </span>
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
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    copied={copiedId === msg.id}
                    isStreaming={busy && index === messages.length - 1 && msg.role === "assistant"}
                    onCopy={() => {
                      if (msg.role === "assistant") copyAnswer(msg.id, msg.answer);
                      else if (msg.role === "user")
                        copyUserPrompt(msg.id, msg.text, msg.attachments);
                    }}
                    onRetry={() => {
                      if (msg.role !== "error") return;
                      const retryMsg = userMessageById(messages, msg.retryOf);
                      if (retryMsg) void ask(retryMsg.text, retryMsg.attachments ?? [], msg.id);
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
                {!busy && messages.some((msg) => msg.role === "assistant") && (
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
            <p className="sr-only" aria-live="polite">
              {chatAttachments.notice ?? ""}
            </p>
            <AttachmentPreviewList
              attachments={chatAttachments.attachments}
              onRemove={chatAttachments.removeAttachment}
              onRetry={(id) => void chatAttachments.retryAttachment(id)}
              onClear={chatAttachments.clearAttachments}
            />
            {chatAttachments.notice && (
              <div className="mb-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                {chatAttachments.notice}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-3xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-foreground/30">
              <ChatAttachmentButton
                buttonRef={attachmentButtonRef}
                disabled={busy}
                onAction={handleAttachmentAction}
              />
              {voice.isSupported && (
                <button
                  type="button"
                  onClick={() => {
                    if (voice.isTranscribing) return;
                    if (voice.isRecording) voice.stopRecording();
                    else void voice.startRecording();
                  }}
                  disabled={voice.isTranscribing}
                  aria-label={
                    voice.isTranscribing
                      ? "Sprache wird transkribiert"
                      : voice.isRecording
                        ? "Sprachaufnahme beenden"
                        : "Frage diktieren"
                  }
                  aria-pressed={voice.isRecording}
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
                    voice.isTranscribing
                      ? "bg-muted text-muted-foreground"
                      : voice.isRecording
                        ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                        : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {voice.isTranscribing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : voice.isRecording ? (
                    <Square className="h-4 w-4" fill="currentColor" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={(event) => void chatAttachments.handlePaste(event)}
                rows={1}
                placeholder={
                  voice.isRecording
                    ? "Sprich jetzt …"
                    : voice.isTranscribing
                      ? "Sprache wird in Text umgewandelt …"
                      : "Stell eine steuerliche Frage …"
                }
                className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1.5 py-2 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80"
                style={{ maxHeight: 180 }}
                aria-label="Nachricht eingeben"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Nachricht senden"
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
                  canSend
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            {(voice.isRecording || voice.isTranscribing || voice.error) && (
              <div className="px-2 pt-1.5" aria-live="polite">
                {voice.isRecording && (
                  <p className="text-[11px] text-muted-foreground">
                    Aufnahme läuft · {voice.elapsedSeconds}s von 60s · Mikrofon erneut antippen zum
                    Beenden
                  </p>
                )}
                {voice.isTranscribing && (
                  <p className="text-[11px] text-muted-foreground">
                    Sprache wird in Text umgewandelt …
                  </p>
                )}
                {voice.error && !voice.isRecording && !voice.isTranscribing && (
                  <p role="alert" className="text-[11px] text-red-500">
                    {voice.error}{" "}
                    <button
                      type="button"
                      onClick={voice.clearError}
                      className="underline hover:no-underline"
                    >
                      Ausblenden
                    </button>
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between px-2 pb-2 pt-1.5">
              <p className="text-[10px] text-muted-foreground">
                Arbeitshilfe, keine verbindliche Beratung. Max. 5 Dateien, 15 MB je Datei, 40 MB
                gesamt.
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

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => void handleAttachmentInputChange(event)}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void handleAttachmentInputChange(event)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={ALL_ATTACHMENT_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => void handleAttachmentInputChange(event)}
        />

        <UploadSafetyNotice
          open={showUploadSafetyNotice}
          onAccept={acceptUploadNotice}
          onOpenChange={(open) => {
            setShowUploadSafetyNotice(open);
            if (!open) setPendingPickerAction(null);
          }}
        />
      </div>
      <SpeechMiniPlayer />
    </SpeechProvider>
  );
}

function userMessageById(msgs: Msg[], id: string): Extract<Msg, { role: "user" }> | null {
  const msg = msgs.find((entry) => entry.id === id);
  if (msg && msg.role === "user") return msg;
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
  isStreaming,
  onCopy,
  onRetry,
}: {
  msg: Msg;
  copied: boolean;
  isStreaming?: boolean;
  onCopy: () => void;
  onRetry: () => void;
}) {
  if (msg.role === "user") {
    return (
      <div data-msg className="flex justify-end">
        <div className="max-w-[92%] overflow-hidden rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground">
          {msg.attachments?.length ? (
            <ChatMessageAttachments attachments={msg.attachments} />
          ) : null}
          {msg.text ? (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
              {msg.text}
            </p>
          ) : (
            <p className="text-[13px] text-primary-foreground/80">
              {msg.attachments?.length
                ? `Anhänge gesendet (${msg.attachments.length})`
                : "Nachricht gesendet"}
            </p>
          )}
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
            {copied ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3" aria-hidden="true" />
            )}
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
                {msg.text || "Bitte erneut versuchen oder die Frage etwas konkreter formulieren."}
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
      <AssistantCard msg={msg} copied={copied} isStreaming={isStreaming} onCopy={onCopy} />
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
  isStreaming,
  onCopy,
}: {
  msg: Extract<Msg, { role: "assistant" }>;
  copied: boolean;
  isStreaming?: boolean;
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
    !!a.reasoning && !sections.some((s) => /subsumtion|begründung/i.test(s.title));

  // Sprachausgabe: aktiver Zustand
  const { isSupported, activeId, state } = useSpeechContext();
  const isActive = isSupported && activeId === msg.id;
  const isPlaying = isActive && state === "playing";
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Text für die Sprachausgabe: bevorzugt summary, ggf. mit Ergebnis und Sections
  const speechText = [
    ergebnis ? `Ergebnis: ${ergebnis.body}` : a.summary,
    ...primary.map((s) => `${s.title}: ${s.body}`),
    a.reasoning && showReasoning ? `Kurzbegründung: ${a.reasoning}` : "",
    ...collapsible.map((s) => `${s.title}: ${s.body}`),
    a.clarify ?? "",
    ...(a.risks ?? []).map((r) => r),
    a.nextStep ? `Nächster Schritt: ${a.nextStep}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div
      className={[
        "w-full max-w-[94%] space-y-3 rounded-2xl rounded-tl-md border bg-card p-4 shadow-sm transition-all duration-300",
        isActive
          ? "border-cyan-400/60 dark:border-cyan-500/50 shadow-[0_0_0_1px_theme(colors.cyan.400/30),0_4px_24px_-4px_theme(colors.cyan.400/20)] dark:shadow-[0_0_0_1px_theme(colors.cyan.500/25),0_4px_24px_-4px_theme(colors.cyan.500/15)]"
          : "border-border",
      ].join(" ")}
    >
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

      {showReasoning && <SectionBlock title="Kurzbegründung" body={a.reasoning!} muted />}

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

      {a.sources && a.sources.length > 0 && (
        <Accordion title={`Verwendete Wissensquellen (${a.sources.length})`}>
          <ul className="space-y-2 text-sm text-foreground">
            {a.sources.map((s, i) => (
              <li
                key={s.id ?? i}
                className="rounded-md border border-border/60 bg-background/40 p-2"
              >
                <p className="break-words font-medium">{s.title}</p>
                {s.reference && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.reference}</p>
                )}
                {s.excerpt && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-snug text-muted-foreground">
                    „{s.excerpt}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {a.knowledge && (
        <p className="text-[11px] text-muted-foreground">
          Passender Wissensbereich:{" "}
          <Link to="/wissensdatenbank" className="underline-offset-2 hover:underline">
            {a.knowledge}
          </Link>
        </p>
      )}

      {a.fromFallback && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-300">
          Diese Antwort stammt aus der lokalen Fallback-Wissenslogik (KI-Modell nicht erreichbar).
        </p>
      )}

      <p className="border-t border-border/60 pt-2 text-[10px] leading-snug text-muted-foreground">
        {REVIEW_HINT}
      </p>

      <div className="flex flex-wrap items-center gap-1 pt-1">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Antwort kopieren"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>

        {/* Animiertes Audio-Symbol während des Vorlesens */}
        {isActive && (
          <span
            aria-hidden="true"
            className={[
              "inline-flex h-4 w-4 items-center justify-center rounded-full ml-1",
              isPlaying && !reducedMotion ? "animate-pulse" : "",
            ].join(" ")}
            style={{ background: "var(--gradient-accent)" }}
          />
        )}

        <MessageSpeechControls messageId={msg.id} rawText={speechText} isStreaming={isStreaming} />
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
