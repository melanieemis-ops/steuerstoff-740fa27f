import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  onTranscript: (text: string) => void;
  maxSeconds?: number;
};

type State = {
  isSupported: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  elapsedSeconds: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearError: () => void;
};

function pickMime(): { mime: string; ext: string } {
  if (typeof MediaRecorder === "undefined") return { mime: "", ext: "webm" };
  const candidates: Array<{ mime: string; ext: string }> = [
    { mime: "audio/mp4;codecs=mp4a.40.2", ext: "m4a" },
    { mime: "audio/mp4", ext: "m4a" },
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c.mime)) return c;
    } catch {
      /* ignore */
    }
  }
  return { mime: "", ext: "webm" };
}

function detectSupport(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined") return false;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  if (typeof window.MediaRecorder === "undefined") return false;
  return true;
}

export function useVoiceInput({ onTranscript, maxSeconds = 60 }: Options): State {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mimeRef = useRef<{ mime: string; ext: string }>({ mime: "", ext: "webm" });
  const busyRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const mountedRef = useRef(true);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    setIsSupported(detectSupport());
  }, []);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          /* ignore */
        }
      });
      streamRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      cleanupStream();
    };
  }, [cleanupStream]);

  const safeSet = useCallback(
    <T,>(setter: (v: T) => void, v: T) => {
      if (mountedRef.current) setter(v);
    },
    [],
  );

  const transcribe = useCallback(async (file: File) => {
    const form = new FormData();
    form.append("audio", file);
    let res: Response;
    try {
      res = await fetch("/api/transcribe", { method: "POST", body: form });
    } catch {
      throw new Error("Netzwerkfehler. Bitte Verbindung prüfen.");
    }
    let data: { text?: string; error?: string } = {};
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      throw new Error(data.error || "Transkription fehlgeschlagen.");
    }
    return (data.text ?? "").trim();
  }, []);

  const handleStop = useCallback(async () => {
    const chunks = chunksRef.current;
    chunksRef.current = [];
    const { mime, ext } = mimeRef.current;
    cleanupStream();
    safeSet(setIsRecording, false);

    const blob = new Blob(chunks, { type: mime || "audio/webm" });
    if (blob.size < 1200) {
      busyRef.current = false;
      safeSet(setError, "Aufnahme war zu kurz oder leer. Bitte erneut versuchen.");
      safeSet(setElapsedSeconds, 0);
      return;
    }

    safeSet(setIsTranscribing, true);
    try {
      const file = new File([blob], `voice.${ext}`, { type: mime || "audio/webm" });
      const text = await transcribe(file);
      if (text) onTranscriptRef.current(text);
      else safeSet(setError, "Es wurde kein Text erkannt. Bitte erneut versuchen.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transkription fehlgeschlagen.";
      safeSet(setError, msg);
    } finally {
      busyRef.current = false;
      safeSet(setIsTranscribing, false);
      safeSet(setElapsedSeconds, 0);
    }
  }, [cleanupStream, safeSet, transcribe]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (busyRef.current) return;
    if (!detectSupport()) {
      setError("Dieses Gerät unterstützt keine Sprachaufnahme.");
      return;
    }
    busyRef.current = true;
    setError(null);
    setElapsedSeconds(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      busyRef.current = false;
      const err = e as DOMException;
      const name = err?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("Mikrofonzugriff wurde abgelehnt. Bitte in den Browser-Einstellungen erlauben.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("Kein Mikrofon gefunden.");
      } else if (name === "NotReadableError") {
        setError("Mikrofon wird gerade von einer anderen App verwendet.");
      } else {
        setError("Mikrofonzugriff fehlgeschlagen.");
      }
      return;
    }

    streamRef.current = stream;
    const picked = pickMime();
    mimeRef.current = picked;
    chunksRef.current = [];

    let recorder: MediaRecorder;
    try {
      recorder = picked.mime
        ? new MediaRecorder(stream, { mimeType: picked.mime })
        : new MediaRecorder(stream);
    } catch {
      cleanupStream();
      busyRef.current = false;
      setError("Dieses Gerät unterstützt keine Sprachaufnahme.");
      return;
    }
    recorderRef.current = recorder;

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onerror = () => {
      safeSet(setError, "Aufnahme fehlgeschlagen.");
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    };
    recorder.onstop = () => {
      void handleStop();
    };

    try {
      recorder.start();
    } catch {
      cleanupStream();
      busyRef.current = false;
      setError("Aufnahme konnte nicht gestartet werden.");
      return;
    }

    setIsRecording(true);
    const startedAt = Date.now();
    tickRef.current = setInterval(() => {
      const el = Math.floor((Date.now() - startedAt) / 1000);
      safeSet(setElapsedSeconds, el);
    }, 250);
    autoStopRef.current = setTimeout(() => {
      stopRecording();
    }, maxSeconds * 1000);
  }, [cleanupStream, handleStop, maxSeconds, safeSet, stopRecording]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isSupported,
    isRecording,
    isTranscribing,
    elapsedSeconds,
    error,
    startRecording,
    stopRecording,
    clearError,
  };
}
