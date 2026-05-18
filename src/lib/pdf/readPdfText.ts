/**
 * Clientseitige PDF-Textextraktion für Vite/TanStack-Apps.
 * Wichtig: Funktioniert bei Text-PDFs. Gescannte PDFs brauchen zusätzlich OCR.
 */
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then(async (pdfjsLib) => {
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjsLib;
    });
  }
  return pdfjsPromise;
}

export async function readPdfText(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error(`${file.name}: Bitte nur PDF-Dateien hochladen.`);
  }

  const pdfjsLib = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
  }

  const fullText = pages.join("\n").trim();
  if (!fullText) {
    throw new Error(`${file.name}: Kein Text im PDF gefunden. Das ist wahrscheinlich ein Scan und braucht OCR.`);
  }
  return fullText;
}
