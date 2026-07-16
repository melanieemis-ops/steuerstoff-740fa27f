import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCase } from "@/lib/casesStore";
import {
  CURATED_TOPICS,
  EXAMPLES_BY_TOPIC,
  findCuratedExample,
  type CuratedExample,
} from "@/lib/curatedExamples";

export const Route = createFileRoute(
  "/neue-anfrage",
)({
  component: NeueAnfrage,
  head: () => ({
    meta: [
      {
        title: "Neue Anfrage · steuerstoff",
      },
    ],
  }),
});

const TOPICS = [...CURATED_TOPICS];
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type DocumentAnalysisResponse = {
  analysis?: unknown;
  filename?: unknown;
  model?: unknown;
  error?: unknown;
};

function extensionFromName(
  filename: string,
): string {
  const index = filename.lastIndexOf(".");

  return index >= 0
    ? filename.slice(index + 1).toLowerCase()
    : "";
}

function isAllowedFile(file: File): boolean {
  if (ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return true;
  }

  return [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "webp",
  ].includes(extensionFromName(file.name));
}

function formatFileSize(
  size: number,
): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function suggestedTitleFromFile(
  filename: string,
): string {
  const withoutExtension =
    filename.replace(/\.[^.]+$/, "");

  const cleaned = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 200);
}

function NeueAnfrage() {
  const navigate = useNavigate();
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [topic, setTopic] =
    useState<string>("USt");
  const [description, setDescription] =
    useState("");
  const [
    selectedExampleId,
    setSelectedExampleId,
  ] = useState<string | null>(null);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [documentFile, setDocumentFile] =
    useState<File | null>(null);
  const [
    documentAnalysis,
    setDocumentAnalysis,
  ] = useState<string | null>(null);
  const [
    documentError,
    setDocumentError,
  ] = useState<string | null>(null);
  const [
    analyzingDocument,
    setAnalyzingDocument,
  ] = useState(false);
  const [
    analysisTransferred,
    setAnalysisTransferred,
  ] = useState(false);

  const canSubmit =
    description.trim().length >= 5;

  const visibleExamples =
    useMemo<CuratedExample[]>(
      () => EXAMPLES_BY_TOPIC[topic] ?? [],
      [topic],
    );

  function loadExample(
    example: CuratedExample,
  ) {
    setTitle(example.title);
    setTopic(example.topic);
    setDescription(example.description);
    setSelectedExampleId(example.id);
  }

  function resetDocumentSelection() {
    setDocumentFile(null);
    setDocumentAnalysis(null);
    setDocumentError(null);
    setAnalysisTransferred(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setDocumentError(null);
    setDocumentAnalysis(null);
    setAnalysisTransferred(false);

    if (!file) {
      setDocumentFile(null);
      return;
    }

    if (!isAllowedFile(file)) {
      setDocumentFile(null);
      setDocumentError(
        "Unterstützt werden PDF, JPG, PNG und WebP. HEIC-Dateien bitte vorher als JPG oder PDF speichern.",
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setDocumentFile(null);
      setDocumentError(
        "Die Datei ist größer als 8 MB. Bitte verkleinere sie oder verwende einen kürzeren PDF-Auszug.",
      );
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setDocumentFile(null);
      setDocumentError(
        "Die ausgewählte Datei ist leer.",
      );
      event.target.value = "";
      return;
    }

    setDocumentFile(file);
  }

  async function analyzeDocument() {
    if (!documentFile) {
      setDocumentError(
        "Bitte wähle zuerst eine Unterlage aus.",
      );
      return;
    }

    setAnalyzingDocument(true);
    setDocumentError(null);
    setDocumentAnalysis(null);
    setAnalysisTransferred(false);

    try {
      const formData = new FormData();
      formData.append(
        "file",
        documentFile,
        documentFile.name,
      );
      formData.append("topic", topic);

      const instruction =
        description.trim();

      if (instruction) {
        formData.append(
          "instruction",
          instruction.slice(0, 1500),
        );
      }

      const response = await fetch(
        "/api/analyze-document",
        {
          method: "POST",
          body: formData,
        },
      );

      const payload =
        (await response
          .json()
          .catch(() => null)) as
          | DocumentAnalysisResponse
          | null;

      if (!response.ok) {
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Die Unterlage konnte nicht analysiert werden.";

        throw new Error(message);
      }

      const analysis =
        typeof payload?.analysis === "string"
          ? payload.analysis.trim()
          : "";

      if (!analysis) {
        throw new Error(
          "Die KI hat keine auswertbare Analyse zurückgegeben.",
        );
      }

      setDocumentAnalysis(analysis);

      if (!title.trim()) {
        setTitle(
          suggestedTitleFromFile(
            documentFile.name,
          ),
        );
      }
    } catch (analysisError) {
      setDocumentError(
        analysisError instanceof Error
          ? analysisError.message
          : "Die Unterlage konnte nicht analysiert werden.",
      );
    } finally {
      setAnalyzingDocument(false);
    }
  }

  function transferAnalysis() {
    if (
      !documentAnalysis ||
      !documentFile
    ) {
      return;
    }

    const analysisBlock = [
      `Unterlagenanalyse – ${documentFile.name}`,
      "",
      documentAnalysis,
    ].join("\n");

    setDescription((current) => {
      const existing = current.trim();

      return existing
        ? `${existing}\n\n---\n\n${analysisBlock}`
        : analysisBlock;
    });

    setSelectedExampleId(null);
    setAnalysisTransferred(true);
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError(
        "Bitte beschreibe deine Frage oder den Sachverhalt (mindestens 5 Zeichen).",
      );
      return;
    }

    setSubmitting(true);

    try {
      const desc = description.trim();
      const trimmedTitle = title.trim();

      let presetKnowledge:
        | Parameters<
            typeof createCase
          >[0]["presetKnowledge"]
        | undefined;

      if (selectedExampleId) {
        const example =
          findCuratedExample(
            selectedExampleId,
          );

        if (
          example &&
          example.topic === topic &&
          example.title ===
            trimmedTitle &&
          example.description === desc
        ) {
          presetKnowledge = {
            answer: example.answer,
            explanation:
              example.explanation,
            references:
              example.references,
            curatedReviewedAt:
              example.lastReviewed,
          };
        }
      }

      const derivedTitle =
        trimmedTitle.length >= 3
          ? trimmedTitle
          : desc.length > 80
            ? `${desc
                .slice(0, 77)
                .trimEnd()}…`
            : desc;

      const record = createCase({
        title: derivedTitle,
        topic,
        description: desc,
        presetKnowledge,
      });

      void navigate({
        to: "/fall/$caseId",
        params: {
          caseId: record.id,
        },
      });
    } catch (submitError) {
      setSubmitting(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unbekannter Fehler",
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Neue Anfrage
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Beschreibe einen Sachverhalt oder
            lade eine Unterlage hoch.
            steuerstoff erkennt wichtige
            Angaben und schlägt die nächsten
            Bearbeitungsschritte vor.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6"
          >
            <div>
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Titel{" "}
                <span className="text-muted-foreground">
                  (optional)
                </span>
              </label>

              <Input
                id="title"
                value={title}
                onChange={(event) => {
                  setTitle(
                    event.target.value,
                  );
                  setSelectedExampleId(null);
                }}
                placeholder="z. B. Bewirtungsbeleg 03/2025 oder leer lassen"
                className="mt-1.5"
                maxLength={200}
              />
            </div>

            <div>
              <label
                htmlFor="topic"
                className="text-sm font-medium text-foreground"
              >
                Themenbereich
              </label>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TOPICS.map(
                  (topicOption) => (
                    <button
                      type="button"
                      key={topicOption}
                      onClick={() => {
                        setTopic(
                          topicOption,
                        );
                        setSelectedExampleId(
                          null,
                        );
                        setDocumentAnalysis(
                          null,
                        );
                        setAnalysisTransferred(
                          false,
                        );
                      }}
                      className={[
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        topic === topicOption
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {topicOption}
                    </button>
                  ),
                )}
              </div>
            </div>

            <section className="rounded-2xl border border-border bg-background/55 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{
                    background:
                      "var(--gradient-accent)",
                  }}
                >
                  <Upload
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-foreground">
                    Unterlage analysieren
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Rechnung, Beleg, Gutschrift,
                    Schreiben oder PDF hochladen
                    und einen vorläufigen
                    Bearbeitungsvorschlag erhalten.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={
                  handleFileSelection
                }
                className="sr-only"
                aria-label="Unterlage auswählen"
              />

              {!documentFile ? (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-4 flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-5 text-center transition-colors hover:border-foreground/30 hover:bg-accent/45"
                >
                  <Upload
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <span className="mt-2 text-sm font-medium text-foreground">
                    PDF oder Foto auswählen
                  </span>

                  <span className="mt-1 text-xs text-muted-foreground">
                    PDF, JPG, PNG oder WebP ·
                    maximal 8 MB
                  </span>
                </button>
              ) : (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <FileText
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {documentFile.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(
                        documentFile.size,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      resetDocumentSelection
                    }
                    disabled={
                      analyzingDocument
                    }
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                    aria-label="Unterlage entfernen"
                  >
                    <X
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/8 px-3 py-2.5">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300"
                  aria-hidden="true"
                />

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Bitte zunächst nur
                  anonymisierte Unterlagen
                  verwenden. Die Datei wird zur
                  Analyse an OpenAI übertragen,
                  aber nicht im lokalen
                  steuerstoff-Fall gespeichert.
                </p>
              </div>

              {documentError && (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive"
                >
                  {documentError}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void analyzeDocument()
                }
                disabled={
                  !documentFile ||
                  analyzingDocument
                }
                className="mt-4 h-10 w-full"
              >
                {analyzingDocument ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Sparkles
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                {analyzingDocument
                  ? "Unterlage wird geprüft …"
                  : "Unterlage auswerten"}
              </Button>
            </section>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Frage oder Sachverhalt
              </label>

              <Textarea
                id="description"
                value={description}
                onChange={(event) => {
                  setDescription(
                    event.target.value,
                  );
                  setSelectedExampleId(null);
                  setAnalysisTransferred(
                    false,
                  );
                }}
                placeholder={
                  "Wissensfrage, z. B. „Wie viel Umsatzsteuer fällt auf Strom an?“\n\n" +
                  "Oder Sachverhalt: Beteiligte, Zeitraum, Beträge, Belege, offene Punkte …\n\n" +
                  "Bei einer hochgeladenen Unterlage kannst du hier zusätzlich schreiben, was besonders geprüft werden soll."
                }
                className="mt-1.5 min-h-[180px]"
                maxLength={8000}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                {description.length} / 8000
                Zeichen
              </p>
            </div>

            {documentAnalysis && (
              <section
                className="rounded-2xl border border-border bg-background/55 p-4 sm:p-5"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-foreground">
                      Vorläufige
                      Unterlagenanalyse
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Prüfe die Angaben und
                      übernimm sie anschließend
                      in deinen Sachverhalt.
                    </p>
                  </div>
                </div>

                <div className="mt-4 max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
                  {documentAnalysis}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {analysisTransferred ? (
                    <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      In den Sachverhalt
                      übernommen
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Die Analyse wird nicht
                      automatisch als richtig
                      bestätigt.
                    </p>
                  )}

                  <Button
                    type="button"
                    onClick={
                      transferAnalysis
                    }
                    disabled={
                      analysisTransferred
                    }
                    className="h-10"
                  >
                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    {analysisTransferred
                      ? "Übernommen"
                      : "In Sachverhalt übernehmen"}
                  </Button>
                </div>
              </section>
            )}

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Der Text des Falls wird lokal
                gespeichert. Die hochgeladene
                Originaldatei wird nicht in den
                Fall übernommen.
              </p>

              <Button
                type="submit"
                disabled={
                  !canSubmit || submitting
                }
                className="h-10 px-5"
              >
                <Sparkles className="h-4 w-4" />

                {submitting
                  ? "Wird beantwortet …"
                  : "Antwort generieren"}

                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-sm font-medium text-foreground">
              Beispiele für {topic}
            </h2>

            {visibleExamples.length ===
            0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Für diesen Themenbereich sind
                aktuell keine Beispiele
                hinterlegt.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {visibleExamples.map(
                  (example) => {
                    const isSelected =
                      selectedExampleId ===
                      example.id;

                    return (
                      <button
                        key={example.id}
                        type="button"
                        onClick={() =>
                          loadExample(
                            example,
                          )
                        }
                        className={[
                          "rounded-xl border p-3 text-left text-xs shadow-card-soft transition-colors",
                          isSelected
                            ? "border-foreground/60 bg-card text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                        ].join(" ")}
                      >
                        <span className="mb-1 inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                          {example.topic}
                        </span>

                        <p className="text-sm font-medium text-foreground">
                          {example.title}
                        </p>

                        <p className="mt-1 line-clamp-2">
                          {
                            example.description
                          }
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}