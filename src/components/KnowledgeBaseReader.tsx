import { useEffect, useRef, useState } from "react";

const VOICE_ID = "g1jpii0iyvtRs8fqXsd1";

// Hier exakt denselben Cloudflare-Endpunkt einsetzen,
// den die Vorlesefunktion der Klausurfälle bereits verwendet.
const TTS_ENDPOINT = "/api/tts";

interface KnowledgeBaseReaderProps {
  title?: string;
  content: string;
}

function prepareTextForSpeech(value: string): string {
  return value
    // Codeblöcke vollständig entfernen
    .replace(/```[\s\S]*?```/g, " ")

    // Inline-Code lesbar machen
    .replace(/`([^`]+)`/g, "$1")

    // Bilder entfernen
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")

    // Links: nur den sichtbaren Linktext behalten
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")

    // Markdown-Überschriften entfernen
    .replace(/^#{1,6}\s+/gm, "")

    // Fettdruck und Kursivschrift entfernen
    .replace(/(\*\*|__|\*|_)/g, "")

    // Listenzeichen entfernen
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")

    // Blockquotes entfernen
    .replace(/^\s*>\s?/gm, "")

    // Tabellenzeichen und HTML-Tags entfernen
    .replace(/\|/g, " ")
    .replace(/<[^>]+>/g, " ")

    // Mehrfache Leerzeichen und Leerzeilen reduzieren
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitTextIntoChunks(text: string, maxLength = 2200): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk = "";

  const addChunk = () => {
    const cleaned = currentChunk.trim();

    if (cleaned) {
      chunks.push(cleaned);
    }

    currentChunk = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLength) {
      const combined = currentChunk
        ? `${currentChunk}\n\n${paragraph}`
        : paragraph;

      if (combined.length <= maxLength) {
        currentChunk = combined;
      } else {
        addChunk();
        currentChunk = paragraph;
      }

      continue;
    }

    // Sehr lange Absätze zusätzlich nach Sätzen aufteilen
    const sentences =
      paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) =>
        sentence.trim(),
      ) ?? [paragraph];

    for (const sentence of sentences) {
      const combined = currentChunk
        ? `${currentChunk} ${sentence}`
        : sentence;

      if (combined.length <= maxLength) {
        currentChunk = combined;
      } else {
        addChunk();

        // Falls selbst ein einzelner Satz zu lang ist
        if (sentence.length > maxLength) {
          for (let index = 0; index < sentence.length; index += maxLength) {
            chunks.push(sentence.slice(index, index + maxLength));
          }
        } else {
          currentChunk = sentence;
        }
      }
    }
  }

  addChunk();

  return chunks;
}

async function createSpeechAudio(text: string): Promise<Blob> {
  const response = await fetch(TTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      voiceId: VOICE_ID,
    }),
  });

  if (!response.ok) {
    let message = "Die Sprachausgabe konnte nicht erstellt werden.";

    try {
      const data = await response.json();

      if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      // Die Standardfehlermeldung bleibt bestehen.
    }

    throw new Error(message);
  }

  return response.blob();
}

export default function KnowledgeBaseReader({
  title,
  content,
}: KnowledgeBaseReaderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const readingSessionRef = useRef(0);

  const [isPreparing, setIsPreparing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [totalParts, setTotalParts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const releaseCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const stopReading = () => {
    readingSessionRef.current += 1;
    releaseCurrentAudio();

    setIsPreparing(false);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPart(0);
    setTotalParts(0);
  };

  const playAudioBlob = (
    blob: Blob,
    sessionId: number,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (sessionId !== readingSessionRef.current) {
        resolve();
        return;
      }

      releaseCurrentAudio();

      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);

      objectUrlRef.current = objectUrl;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPreparing(false);
        setIsPlaying(true);
        setIsPaused(false);
      };

      audio.onpause = () => {
        if (!audio.ended && sessionId === readingSessionRef.current) {
          setIsPaused(true);
          setIsPlaying(false);
        }
      };

      audio.onended = () => {
        releaseCurrentAudio();
        resolve();
      };

      audio.onerror = () => {
        releaseCurrentAudio();
        reject(new Error("Die Audiodatei konnte nicht abgespielt werden."));
      };

      audio.play().catch((playError: unknown) => {
        releaseCurrentAudio();

        reject(
          playError instanceof Error
            ? playError
            : new Error("Die Wiedergabe konnte nicht gestartet werden."),
        );
      });
    });
  };

  const startReading = async () => {
    stopReading();
    setError(null);

    const preparedContent = prepareTextForSpeech(
      [title, content].filter(Boolean).join("\n\n"),
    );

    if (!preparedContent) {
      setError("Für diesen Beitrag wurde kein vorlesbarer Text gefunden.");
      return;
    }

    const chunks = splitTextIntoChunks(preparedContent);
    const sessionId = readingSessionRef.current;

    setTotalParts(chunks.length);
    setIsPreparing(true);

    try {
      for (let index = 0; index < chunks.length; index += 1) {
        if (sessionId !== readingSessionRef.current) {
          return;
        }

        setCurrentPart(index + 1);
        setIsPreparing(true);

        const audioBlob = await createSpeechAudio(chunks[index]);

        if (sessionId !== readingSessionRef.current) {
          return;
        }

        await playAudioBlob(audioBlob, sessionId);
      }

      if (sessionId === readingSessionRef.current) {
        releaseCurrentAudio();
        setIsPreparing(false);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPart(0);
        setTotalParts(0);
      }
    } catch (unknownError) {
      if (sessionId !== readingSessionRef.current) {
        return;
      }

      releaseCurrentAudio();
      setIsPreparing(false);
      setIsPlaying(false);
      setIsPaused(false);

      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Beim Vorlesen ist ein unbekannter Fehler aufgetreten.",
      );
    }
  };

  const togglePause = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setError("Die Wiedergabe konnte nicht fortgesetzt werden.");
      }
    } else {
      audio.pause();
    }
  };

  useEffect(() => {
    return () => {
      readingSessionRef.current += 1;
      releaseCurrentAudio();
    };
  }, []);

  return (
    <div className="my-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying && !isPaused && !isPreparing && (
          <button
            type="button"
            onClick={startReading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            🔊 Beitrag vorlesen
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            {isPaused ? "▶️ Weiter" : "⏸ Pause"}
          </button>
        )}

        {(isPlaying || isPaused || isPreparing) && (
          <button
            type="button"
            onClick={stopReading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            ⏹ Beenden
          </button>
        )}

        {isPreparing && (
          <span className="text-sm text-slate-500">
            Stimme wird vorbereitet …
          </span>
        )}

        {totalParts > 1 && currentPart > 0 && (
          <span className="text-sm text-slate-500">
            Abschnitt {currentPart} von {totalParts}
          </span>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
