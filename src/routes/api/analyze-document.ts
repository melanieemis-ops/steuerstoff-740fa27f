import { createFileRoute } from "@tanstack/react-router";
import OpenAI from "openai";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_BYTES = 10 * 1024 * 1024;
const PRIMARY_MODEL = "gpt-4.1-mini";

const SYSTEM_PROMPT = `Du bist ein KI-Arbeitsassistent für deutsche Steuerkanzleien.

Deine Aufgabe ist es, hochgeladene Unterlagen und die Angaben des Nutzers fachlich zu analysieren und eine erste steuerliche Einschätzung zu erstellen.

Prüfe insbesondere:
1. Sachverhalt
- Fasse den erkennbaren Sachverhalt kurz und neutral zusammen.
- Trenne gesicherte Tatsachen von Vermutungen.
- Weise ausdrücklich auf unklare oder widersprüchliche Angaben hin.

2. Steuerliche Einordnung
- Nenne die möglicherweise betroffenen Steuerarten.
- Ordne den Sachverhalt den einschlägigen steuerlichen Themenbereichen zu.
- Nenne relevante gesetzliche Vorschriften, soweit diese zuverlässig bestimmbar sind.
- Erfinde keine Fundstellen, Urteile oder Verwaltungsanweisungen.

3. Risiken und Fristen
- Weise auf erkennbare steuerliche Risiken hin.
- Nenne mögliche Fristen, Erklärungspflichten, Aufzeichnungspflichten und Nachweiserfordernisse.
- Kennzeichne Fristen als prüfungsbedürftig, wenn der konkrete Beginn oder Ablauf nicht sicher aus den Unterlagen hervorgeht.

4. Fehlende Unterlagen und Rückfragen
- Liste konkret auf, welche Unterlagen oder Informationen noch benötigt werden.
- Formuliere gezielte Rückfragen an den Mandanten.
- Vermeide allgemeine oder unnötige Fragen.

5. Handlungsempfehlung
- Nenne die nächsten sinnvollen Prüfungsschritte.
- Unterscheide zwischen:
  a) sofort zu klären,
  b) vor Abgabe oder Buchung zu prüfen,
  c) langfristig zu beachten.

6. Ausgabeformat
Strukturiere die Antwort immer wie folgt:

Erste steuerliche Einschätzung

Sachverhalt
[Kurze Zusammenfassung]

Mögliche steuerliche Themen
[Steuerarten und Themenbereiche]

Was besonders zu beachten ist
[Risiken, Fristen und Besonderheiten]

Fehlende Unterlagen
[Konkrete Liste]

Rückfragen
[Konkrete Fragen]

Empfohlene nächste Schritte
[Priorisierte Handlungsschritte]

Hinweis
Diese Einschätzung wurde automatisiert auf Grundlage der bereitgestellten Informationen erstellt. Sie ersetzt keine abschließende fachliche Prüfung und keine verbindliche Steuerberatung. Die steuerliche Würdigung kann sich durch weitere Unterlagen oder abweichende tatsächliche Umstände ändern.

Wichtige Regeln:
- Antworte ausschließlich auf Grundlage der hochgeladenen Unterlagen und der Nutzereingaben.
- Erfinde keine Tatsachen.
- Erfinde keine Gesetzesstellen oder Urteile.
- Gib klar an, wenn eine zuverlässige Beurteilung nicht möglich ist.
- Bei Unsicherheiten formuliere „prüfungsbedürftig“ statt eine definitive Aussage zu treffen.
- Weise auf mögliche Haftungs-, Frist- oder Strafbarkeitsrisiken sachlich hin, ohne zu dramatisieren.
- Gib keine endgültige Freigabe oder verbindliche steuerliche Empfehlung.
`;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function extractTextFromPdf(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data: bytes }).promise;
  const parts: string[] = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is { str: string } => "str" in item)
      .map((item) => item.str)
      .join(" ");

    if (text.trim()) {
      parts.push(text.trim());
    }
  }

  return parts.join("\n\n").trim();
}

async function extractTextFromImage(file: File): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt.");
  }

  const client = new OpenAI({ apiKey });
  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  const response = await client.responses.create({
    model: PRIMARY_MODEL,
    input: [
      {
        role: "system",
        content: "Extrahiere den lesbaren Text aus dem hochgeladenen Dokument. Gib nur den Text zurück, ohne zusätzliche Kommentare.",
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Bitte extrahiere den lesbaren Text aus diesem Dokument. Falls es sich um ein Bild handelt, beschreibe zudem die erkennbaren Tabellen, Zahlen und relevanten Stellen.`,
          },
          {
            type: "input_image",
            image_url: `data:${file.type || "image/png"};base64,${base64}`,
          },
        ],
      },
    ],
    temperature: 0,
    max_output_tokens: 1200,
  });

  return response.output_text?.trim() ?? "";
}

async function extractDocumentText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }

  if (/^image\/(jpeg|png|jpg)/.test(file.type) || /\.(jpg|jpeg|png)$/i.test(file.name)) {
    return extractTextFromImage(file);
  }

  return "";
}

async function createAnalysis(description: string, documentText: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: PRIMARY_MODEL,
    input: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Nutzereingabe / Sachverhalt:\n${description.trim()}\n\nExtrahierter Dokumentinhalt:\n${documentText.trim()}`,
      },
    ],
    temperature: 0.2,
    max_output_tokens: 2200,
  });

  return response.output_text?.trim() || "Die Analyse konnte nicht erzeugt werden.";
}

export const Route = createFileRoute("/api/analyze-document")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return jsonResponse(500, { error: "Serverkonfiguration unvollständig." });
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.includes("multipart/form-data")) {
          return jsonResponse(400, { error: "Ungültiges Anfrageformat." });
        }

        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength && contentLength > MAX_BYTES) {
          return jsonResponse(413, { error: "Datei zu groß (max. 10 MB)." });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return jsonResponse(400, { error: "Datei konnte nicht gelesen werden." });
        }

        const description = String(form.get("description") ?? "").trim();
        const file = form.get("file");
        if (!file || !(file instanceof File)) {
          return jsonResponse(400, { error: "Bitte lade zuerst eine Datei hoch." });
        }
        if (!description) {
          return jsonResponse(400, { error: "Bitte beschreibe kurz den Sachverhalt." });
        }
        if (file.size === 0) {
          return jsonResponse(400, { error: "Die Datei ist leer." });
        }
        if (file.size > MAX_BYTES) {
          return jsonResponse(413, { error: "Datei zu groß (max. 10 MB)." });
        }

        try {
          const documentText = await extractDocumentText(file);
          const analysis = await createAnalysis(description, documentText);
          return jsonResponse(200, { analysis });
        } catch (error) {
          console.error("[analyze-document] error", error);
          const message = error instanceof Error ? error.message : "Analyse fehlgeschlagen.";
          return jsonResponse(500, { error: message });
        }
      },
    },
  },
});
