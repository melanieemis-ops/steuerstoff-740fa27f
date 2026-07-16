import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCase } from "@/lib/casesStore";
import { readPdfText } from "@/lib/pdf/readPdfText";
import { extractVoucher } from "@/lib/pdf/pdfAccountingExtractor";
import {
  CURATED_TOPICS,
  EXAMPLES_BY_TOPIC,
  findCuratedExample,
  type CuratedExample,
} from "@/lib/curatedExamples";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export const Route = createFileRoute("/neue-anfrage")({
  component: NeueAnfrage,
  head: () => ({ meta: [{ title: "Neue Anfrage · steuerstoff" }] }),
});

const TOPICS = [...CURATED_TOPICS];
const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 6000;
const MAX_PDF_EXCERPT_LENGTH = 1800;

type PdfPreview = {
  fileName: string;
  counterparty: string;
  documentDate: string;
  invoiceNumber: string;
  grossAmount: string;
  vatRate: string;
  excerpt: string;
  extractionNote?: string;
};

function formatGermanDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function baseName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
}

function NeueAnfrage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<string>("USt");
  const [description, setDescription] = useState("");
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<PdfPreview | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [readingPdf, setReadingPdf] = useState(false);
  const [pdfTransferred, setPdfTransferred] = useState(false);

  const canSubmit = description.trim().length >= 5;
  const visibleExamples = useMemo<CuratedExample[]>(
    () => EXAMPLES_BY_TOPIC[topic] ?? [],
    [topic],
  );

  function loadExample(example: CuratedExample) {
    setTitle(example.title);
    setTopic(example.topic);
    setDescription(example.description);
    setSelectedExampleId(example.id);
    setPdfTransferred(false);
  }

  function resetPdf() {
    setPdfFile(null);
    setPdfPreview(null);
    setPdfError(null);
    setPdfTransferred(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handlePdfSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setPdfPreview(null);
    setPdfError(null);
    setPdfTransferred(false);

    if (!file) {
      setPdfFile(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setPdfFile(null);
      setPdfError("Bitte wähle in dieser ersten Version ausschließlich eine PDF-Datei aus.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setPdfFile(null);
      setPdfError("Die ausgewählte PDF-Datei ist leer.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_BYTES) {
      setPdfFile(null);
      setPdfError("Die PDF ist größer als 8 MB. Bitte verkleinere sie oder verwende einen Auszug.");
      event.target.value = "";
      return;
    }

    setPdfFile(file);
  }

  async function readSelectedPdf() {
    if (!pdfFile) {
      setPdfError("Bitte wähle zuerst eine PDF-Datei aus.");
      return;
    }

    setReadingPdf(true);
    setPdfError(null);
    setPdfPreview(null);
    setPdfTransferred(false);

    try {
      const text = await readPdfText(pdfFile);
      const excerpt = text.trim().slice(0, MAX_PDF_EXCERPT_LENGTH);

      let preview: PdfPreview;

      try {
        const voucher = extractVoucher(pdfFile.name, text);

        preview = {
          fileName: pdfFile.name,
          counterparty: voucher.counterparty || "nicht eindeutig erkannt",
          documentDate: formatGermanDate(voucher.belegDate),
          invoiceNumber: voucher.invoiceNumber || "nicht eindeutig erkannt",
          grossAmount: formatEuro(voucher.amount),
          vatRate:
            voucher.vatRate !== undefined
              ? `${voucher.vatRate} %`
              : "nicht eindeutig erkannt",
          excerpt,
        };
      } catch (voucherError) {
        preview = {
          fileName: pdfFile.name,
          counterparty: "nicht eindeutig erkannt",
          documentDate: "nicht eindeutig erkannt",
          invoiceNumber: "nicht eindeutig erkannt",
          grossAmount: "nicht eindeutig erkannt",
          vatRate: "nicht eindeutig erkannt",
          excerpt,
          extractionNote:
            voucherError instanceof Error
              ? voucherError.message
              : "Einzelne Rechnungsdaten konnten nicht eindeutig erkannt werden.",
        };
      }

      setPdfPreview(preview);

      if (!title.trim()) {
        setTitle(baseName(pdfFile.name).slice(0, 200));
      }
    } catch (readError) {
      const message =
        readError instanceof Error
          ? readError.message
          : "Die PDF konnte nicht gelesen werden.";

      setPdfError(
        message.includes("Kein Text im PDF gefunden")
          ? "Kein Text erkannt. Gescannte PDFs und Fotos benötigen später OCR."
          : message,
      );
    } finally {
      setReadingPdf(false);
    }
  }

  function transferPdfToDescription() {
    if (!pdfPreview) {
      return;
    }

    const header = [
      "PDF-Unterlage zur Prüfung",
      `Dateiname: ${pdfPreview.fileName}`,
      "",
      "Vorläufig erkannte Angaben:",
      `- Möglicher Aussteller/Absender: ${pdfPreview.counterparty}`,
      `- Beleg-/Rechnungsdatum: ${pdfPreview.documentDate}`,
      `- Rechnungs-/Belegnummer: ${pdfPreview.invoiceNumber}`,
      `- Bruttobetrag: ${pdfPreview.grossAmount}`,
      `- Umsatzsteuersatz: ${pdfPreview.vatRate}`,
      pdfPreview.extractionNote
        ? `- Hinweis zur Auslesung: ${pdfPreview.extractionNote}`
        : "",
      "",
      "Auszug aus dem PDF-Text:",
    ]
      .filter(Boolean)
      .join("\n");

    const instruction = [
      "",
      "",
      "Arbeitsauftrag:",
      "Bitte prüfe die Unterlage buchhalterisch und steuerlich, nenne fehlende Angaben, mögliche Auffälligkeiten, die nächsten Bearbeitungsschritte und nur bei ausreichender Grundlage einen Buchungsvorschlag.",
    ].join("\n");

    const existing = description.trim();
    const separator = existing ? "\n\n---\n\n" : "";
    const fixedLength =
      existing.length + separator.length + header.length + instruction.length + 2;
    const availableExcerptLength = Math.max(
      0,
      MAX_DESCRIPTION_LENGTH - fixedLength,
    );

    if (availableExcerptLength < 200) {
      setPdfError(
        "Im Sachverhaltsfeld ist nicht mehr genug Platz. Bitte kürze den bisherigen Text und versuche es erneut.",
      );
      return;
    }

    const excerpt = pdfPreview.excerpt.slice(0, availableExcerptLength);
    const block = `${header}\n${excerpt}${instruction}`;
    const combined = `${existing}${separator}${block}`;

    setDescription(combined.slice(0, MAX_DESCRIPTION_LENGTH));
    setSelectedExampleId(null);
    setPdfTransferred(true);
    setPdfError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Bitte beschreibe deine Frage oder den Sachverhalt (mindestens 5 Zeichen).");
      return;
    }

    setSubmitting(true);

    try {
      const desc = description.trim();
      const trimmedTitle = title.trim();

      let presetKnowledge: Parameters<typeof createCase>[0]["presetKnowledge"];

      if (selectedExampleId) {
        const example = findCuratedExample(selectedExampleId);

        if (
          example &&
          example.topic === topic &&
          example.title === trimmedTitle &&
          example.description === desc
        ) {
          presetKnowledge = {
            answer: example.answer,
            explanation: example.explanation,
            references: example.references,
            curatedReviewedAt: example.lastReviewed,
          };
        }
      }

      const derivedTitle =
        trimmedTitle.length >= 3
          ? trimmedTitle
          : desc.length > 80
            ? `${desc.slice(0, 77).trimEnd()}…`
            : desc;

      const rec = createCase({
        title: derivedTitle,
        topic,
        description: desc,
        presetKnowledge,
      });

      navigate({
        to: "/fall/$caseId",
        params: { caseId: rec.id },
      });
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
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

          <p className="mt-2 text-sm text-muted-foreground">
            Stelle eine kurze Wissensfrage, beschreibe einen konkreten Sachverhalt
            oder lies eine PDF-Unterlage ein.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6"
          >
            <div>
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Titel <span className="text-muted-foreground">(optional)</span>
              </label>

              <Input
                id="title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setSelectedExampleId(null);
                }}
                placeholder="z. B. Bewirtungsbeleg 03/2025 oder leer lassen"
                className="mt-1.5"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="topic" className="text-sm font-medium text-foreground">
                Themenbereich
              </label>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TOPICS.map((topicOption) => (
                  <button
                    type="button"
                    key={topicOption}
                    onClick={() => {
                      setTopic(topicOption);
                      setSelectedExampleId(null);
                    }}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors " +
                      (topic === topicOption
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground")
                    }
                  >
                    {topicOption}
                  </button>
                ))}
              </div>
            </div>

            <section className="min-w-0 rounded-2xl border border-border bg-background/55 p-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-foreground">
                    PDF-Unterlage einlesen
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Textbasierte Rechnung oder Beleg-PDF lokal auslesen und erkannte
                    Angaben in den Sachverhalt übernehmen.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfSelection}
                className="sr-only"
                aria-label="PDF-Datei auswählen"
              />

              {!pdfFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 h-10 w-full"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  PDF auswählen
                </Button>
              ) : (
                <div className="mt-4 flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <FileText
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {pdfFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetPdf}
                    disabled={readingPdf}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                    aria-label="PDF entfernen"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-card/70 px-3 py-2.5">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Das PDF wird auf diesem Gerät ausgelesen. Erst wenn du die
                  erkannten Angaben in den Sachverhalt übernimmst und eine Antwort
                  erzeugst, wird dieser Text über den bestehenden steuerstoff-Ablauf
                  verarbeitet. Die Originaldatei wird nicht gespeichert.
                </p>
              </div>

              {pdfError && (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive"
                >
                  {pdfError}
                </div>
              )}

              <Button
                type="button"
                onClick={() => void readSelectedPdf()}
                disabled={!pdfFile || readingPdf}
                className="mt-4 h-10 w-full"
              >
                {readingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileText className="h-4 w-4" aria-hidden="true" />
                )}
                {readingPdf ? "PDF wird ausgelesen …" : "PDF auslesen"}
              </Button>

              {pdfPreview && (
                <div className="mt-4 min-w-0 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Vorläufig erkannte Angaben
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Bitte vor der weiteren Verarbeitung fachlich kontrollieren.
                      </p>
                    </div>
                  </div>

                  <dl className="mt-3 grid min-w-0 gap-2 text-xs">
                    <div className="min-w-0">
                      <dt className="text-muted-foreground">Aussteller/Absender</dt>
                      <dd className="break-words font-medium text-foreground">
                        {pdfPreview.counterparty}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Datum</dt>
                      <dd className="font-medium text-foreground">
                        {pdfPreview.documentDate}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted-foreground">Rechnungs-/Belegnummer</dt>
                      <dd className="break-words font-medium text-foreground">
                        {pdfPreview.invoiceNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Bruttobetrag</dt>
                      <dd className="font-medium text-foreground">
                        {pdfPreview.grossAmount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Umsatzsteuersatz</dt>
                      <dd className="font-medium text-foreground">
                        {pdfPreview.vatRate}
                      </dd>
                    </div>
                  </dl>

                  {pdfPreview.extractionNote && (
                    <p className="mt-3 break-words rounded-lg bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                      {pdfPreview.extractionNote}
                    </p>
                  )}

                  <Button
                    type="button"
                    variant={pdfTransferred ? "outline" : "default"}
                    onClick={transferPdfToDescription}
                    disabled={pdfTransferred}
                    className="mt-4 h-10 w-full"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    {pdfTransferred
                      ? "In Sachverhalt übernommen"
                      : "In Sachverhalt übernehmen"}
                  </Button>
                </div>
              )}
            </section>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Frage oder Sachverhalt
              </label>

              <Textarea
                id="description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setSelectedExampleId(null);
                  setPdfTransferred(false);
                }}
                placeholder={
                  "Wissensfrage, z. B. „Wie viel Umsatzsteuer fällt auf Strom an?“\n\n" +
                  "Oder Sachverhalt: Beteiligte, Zeitraum, Beträge, Belege, offene Punkte …"
                }
                className="mt-1.5 min-h-[180px]"
                maxLength={MAX_DESCRIPTION_LENGTH}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                {description.length} / {MAX_DESCRIPTION_LENGTH} Zeichen
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Eingaben werden lokal gespeichert (Demo-Modus).
              </p>

              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                className="h-10 px-5"
              >
                <Sparkles className="h-4 w-4" />
                {submitting ? "Wird beantwortet …" : "Antwort generieren"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-sm font-medium text-foreground">
              Beispiele für {topic}
            </h2>

            {visibleExamples.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Für diesen Themenbereich sind aktuell keine Beispiele hinterlegt.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {visibleExamples.map((example) => {
                  const isSelected = selectedExampleId === example.id;

                  return (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => loadExample(example)}
                      className={
                        "rounded-xl border p-3 text-left text-xs shadow-card-soft transition-colors " +
                        (isSelected
                          ? "border-foreground/60 bg-card text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground")
                      }
                    >
                      <span className="mb-1 inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                        {example.topic}
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {example.title}
                      </p>
                      <p className="mt-1 line-clamp-2">{example.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}