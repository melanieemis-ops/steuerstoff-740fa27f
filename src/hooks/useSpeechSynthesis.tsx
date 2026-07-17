/**
 * useSpeechSynthesis.ts
 *
 * Zentrale React-Logik für die Web Speech API (window.speechSynthesis).
 * Verwaltet:
 * - Stimmenauswahl (de-DE bevorzugt)
 * - Segment-Queue für lange Antworten
 * - Zustandsmaschine: idle | playing | paused
 * - Globale Exklusivität: immer nur eine Nachricht gleichzeitig
 * - Cleanup bei Unmount
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { loadSpeechSettings, type SpeechSettings } from "@/lib/speech-storage";
import { prepareTextForSpeech, segmentTextForSpeech } from "@/lib/speech-utils";

// ─── Typen ───────────────────────────────────────────────────────────────────

export type SpeechState = "idle" | "playing" | "paused";

export type SpeechContextValue = {
  /** Ob die Web Speech API im Browser verfügbar ist */
  isSupported: boolean;
  /** ID der aktuell aktiven (oder pausierten) Nachricht */
  activeId: string | null;
  /** Aktueller Zustand der Wiedergabe */
  state: SpeechState;
  /** Aktuelle Einstellungen */
  settings: SpeechSettings;
  /** Verfügbare deutsche Stimmen */
  germanVoices: SpeechSynthesisVoice[];
  /** Vorlesen starten (oder andere Nachricht unterbrechen und neue starten) */
  speak: (id: string, text: string) => void;
  /** Pause */
  pause: () => void;
  /** Fortsetzen */
  resume: () => void;
  /** Stoppen */
  cancel: () => void;
  /** Einstellungen aktualisieren */
  updateSettings: (s: Partial<SpeechSettings>) => void;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function useSpeechContext(): SpeechContextValue {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error("useSpeechContext must be used inside SpeechProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SpeechProvider({ children }: { children: ReactNode }) {
  const isSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [settings, setSettings] = useState<SpeechSettings>(() => loadSpeechSettings());
  const [germanVoices, setGermanVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs für Segment-Queue (kein Re-render nötig)
  const queueRef = useRef<string[]>([]);
  const segmentIndexRef = useRef(0);
  const activeIdRef = useRef<string | null>(null);
  const settingsRef = useRef<SpeechSettings>(settings);
  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);

  // Settings-Ref synchron halten
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Stimmen laden
  useEffect(() => {
    if (!isSupported) return;

    function loadVoices() {
      const all = window.speechSynthesis.getVoices();
      const german = all.filter((v) => v.lang.startsWith("de-DE") || v.lang.startsWith("de"));
      // Sortierung: de-DE zuerst
      german.sort((a, b) => {
        const aDE = a.lang === "de-DE" ? 0 : 1;
        const bDE = b.lang === "de-DE" ? 0 : 1;
        return aDE - bDE;
      });
      setGermanVoices(german);
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isSupported]);

  /** Beste verfügbare Stimme ermitteln */
  function selectVoice(voiceURI?: string): SpeechSynthesisVoice | null {
    const all = window.speechSynthesis.getVoices();
    if (!all.length) return null;

    // Gespeicherte Stimme bevorzugen
    if (voiceURI) {
      const saved = all.find((v) => v.voiceURI === voiceURI);
      if (saved) return saved;
    }

    // 1. de-DE
    const deDE = all.find((v) => v.lang === "de-DE");
    if (deDE) return deDE;

    // 2. de (any)
    const de = all.find((v) => v.lang.startsWith("de"));
    if (de) return de;

    // 3. Gerätestandardstimme
    const def = all.find((v) => v.default);
    return def ?? null;
  }

  /** Ein Segment sprechen */
  function speakSegment(index: number, id: string) {
    if (cancelledRef.current) return;
    if (index >= queueRef.current.length) {
      // Queue fertig → Reset
      setActiveId(null);
      setSpeechState("idle");
      activeIdRef.current = null;
      return;
    }

    const segmentText = queueRef.current[index];
    if (!segmentText) {
      speakSegment(index + 1, id);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(segmentText);
    utterance.lang = "de-DE";
    utterance.rate = settingsRef.current.rate;

    const voice = selectVoice(settingsRef.current.voiceURI);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (cancelledRef.current || pausedRef.current) return;
      if (activeIdRef.current !== id) return;
      segmentIndexRef.current = index + 1;
      speakSegment(index + 1, id);
    };

    utterance.onerror = (e) => {
      // "interrupted" ist kein echter Fehler – passiert beim cancel()
      if (e.error === "interrupted" || e.error === "canceled") return;
      // Bei anderen Fehlern: nächstes Segment versuchen
      if (cancelledRef.current) return;
      if (activeIdRef.current !== id) return;
      segmentIndexRef.current = index + 1;
      speakSegment(index + 1, id);
    };

    window.speechSynthesis.speak(utterance);
  }

  const speak = useCallback(
    (id: string, rawText: string) => {
      if (!isSupported) return;

      // Laufende Ausgabe stoppen
      cancelledRef.current = true;
      pausedRef.current = false;
      window.speechSynthesis.cancel();

      const prepared = prepareTextForSpeech(rawText);
      const segments = segmentTextForSpeech(prepared);

      if (!segments.length) return;

      queueRef.current = segments;
      segmentIndexRef.current = 0;
      activeIdRef.current = id;
      cancelledRef.current = false;

      setActiveId(id);
      setSpeechState("playing");

      // iOS Safari-Fix: kleines Delay nach cancel()
      window.setTimeout(() => {
        if (cancelledRef.current) return;
        speakSegment(0, id);
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSupported],
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    pausedRef.current = true;
    window.speechSynthesis.pause();
    setSpeechState("paused");
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    pausedRef.current = false;
    window.speechSynthesis.resume();
    setSpeechState("playing");
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    cancelledRef.current = true;
    pausedRef.current = false;
    window.speechSynthesis.cancel();
    setActiveId(null);
    setSpeechState("idle");
    activeIdRef.current = null;
  }, [isSupported]);

  const updateSettings = useCallback((partial: Partial<SpeechSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (!isSupported) return;
      cancelledRef.current = true;
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const value: SpeechContextValue = {
    isSupported,
    activeId,
    state: speechState,
    settings,
    germanVoices,
    speak,
    pause,
    resume,
    cancel,
    updateSettings,
  };

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}
