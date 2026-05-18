/**
 * Clientseitige PDF-Textextraktion für Vite/TanStack-Apps.
 *
 * Wichtig für Kontoauszüge: Wir lesen nicht einfach alle PDF-Textteile mit Leerzeichen
 * zusammen, sondern rekonstruieren Zeilen anhand der PDF-Koordinaten. Bank-PDFs
 * enthalten Tabellen; ohne Zeilenumbrüche kann der Parser einzelne Umsätze nicht sauber
 * erkennen.
 */
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

type PdfTextItemLike = {
  str: string;
  transform?: number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
};

type TextToken = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

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

function isTextItemLike(item: unknown): item is PdfTextItemLike {
  if (typeof item !== "object" || item === null) return false;
  const maybe = item as Partial<PdfTextItemLike>;
  return typeof maybe.str === "string";
}

function tokenFromItem(item: PdfTextItemLike): TextToken | undefined {
  const text = item.str.replace(/\u00a0/g, " ").trim();
  if (!text) return undefined;

  const transform = Array.isArray(item.transform) ? item.transform : [];
  const x = typeof transform[4] === "number" ? transform[4] : 0;
  const y = typeof transform[5] === "number" ? transform[5] : 0;
  const height = typeof item.height === "number" && item.height > 0 ? item.height : Math.abs(transform[3] ?? 10) || 10;
  const estimatedWidth = text.length * Math.max(height * 0.45, 4);
  const width = typeof item.width === "number" && item.width > 0 ? item.width : estimatedWidth;

  return { text, x, y, width, height };
}

function buildLine(tokens: TextToken[]): string {
  const sorted = tokens.slice().sort((a, b) => a.x - b.x);
  let line = "";
  let previousEnd = Number.NEGATIVE_INFINITY;

  for (const token of sorted) {
    const averageHeight = Math.max(token.height, 8);
    const gap = token.x - previousEnd;

    if (line && gap > averageHeight * 0.28) {
      line += " ";
    }

    line += token.text;
    previousEnd = Math.max(previousEnd, token.x + token.width);
  }

  return line.replace(/[ \t]+/g, " ").trim();
}

function textItemsToLines(items: unknown[]): string {
  const tokens = items
    .map((item) => (isTextItemLike(item) ? tokenFromItem(item) : undefined))
    .filter((token): token is TextToken => Boolean(token));

  if (tokens.length === 0) return "";

  tokens.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 2) return yDiff;
    return a.x - b.x;
  });

  const lines: TextToken[][] = [];
  const lineYs: number[] = [];

  for (const token of tokens) {
    const tolerance = Math.max(2.2, token.height * 0.45);
    let targetIndex = -1;

    for (let index = 0; index < lineYs.length; index += 1) {
      if (Math.abs(lineYs[index] - token.y) <= tolerance) {
        targetIndex = index;
        break;
      }
    }

    if (targetIndex === -1) {
      lineYs.push(token.y);
      lines.push([token]);
    } else {
      lines[targetIndex].push(token);
      lineYs[targetIndex] = (lineYs[targetIndex] + token.y) / 2;
    }
  }

  return lines
    .map(buildLine)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
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
    const pageText = textItemsToLines(content.items as unknown[]).trim();
    if (pageText) pages.push(pageText);
  }

  const fullText = pages.join("\n\n").trim();
  if (!fullText) {
    throw new Error(`${file.name}: Kein Text im PDF gefunden. Das ist wahrscheinlich ein Scan und braucht OCR.`);
  }
  return fullText;
}
