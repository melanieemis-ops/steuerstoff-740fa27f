import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 10 * 1024 * 1024;

const PROMPT = [
  "Kontext: deutschsprachiger steuerlicher Arbeitsassistent für Steuerkanzleien.",
  "Bitte deutsche Zeichensetzung und Groß-/Kleinschreibung korrekt setzen.",
  "Fachbegriffe und Eigennamen wie folgt schreiben:",
  "steuerstoff, DATEV, Unternehmen online, DUO, LODAS, SKR03, SKR04, SKR42, EÜR, Bilanz, Jahresabschluss,",
  "Abgabenordnung, AO, Einkommensteuergesetz, EStG, Umsatzsteuergesetz, UStG, Körperschaftsteuergesetz, KStG,",
  "Gewerbesteuergesetz, GewStG, Bewertungsgesetz, BewG, Vorsteuer, Vorsteuerabzug, Vorsteueraufteilung,",
  "§ 13b UStG, Reverse Charge, innergemeinschaftlicher Erwerb, Gemeinnützigkeit, NPO, NGO, ideeller Bereich,",
  "Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb, Mittelverwendungsrechnung,",
  "zeitnahe Mittelverwendung, freie Rücklage, gebundene Rücklage, Zuwendungsbestätigung, Spendenbescheinigung,",
  "Debitor, Kreditor, OPOS, Kostenstelle, Buchungssatz.",
].join(" ");

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/transcribe")({
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
          return jsonResponse(413, { error: "Audiodatei zu groß (max. 10 MB)." });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return jsonResponse(400, { error: "Audiodatei konnte nicht gelesen werden." });
        }

        const file = form.get("audio");
        if (!file || !(file instanceof File)) {
          return jsonResponse(400, { error: "Keine Audiodatei erhalten." });
        }
        if (file.size === 0) {
          return jsonResponse(400, { error: "Aufnahme war leer." });
        }
        if (file.size > MAX_BYTES) {
          return jsonResponse(413, { error: "Audiodatei zu groß (max. 10 MB)." });
        }

        const upstream = new FormData();
        upstream.append("file", file, file.name || "voice.webm");
        upstream.append("model", "gpt-4o-mini-transcribe");
        upstream.append("language", "de");
        upstream.append("response_format", "json");
        upstream.append("temperature", "0");
        upstream.append("prompt", PROMPT);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);

        try {
          const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}` },
            body: upstream,
            signal: controller.signal,
          });

          if (!res.ok) {
            console.error("[transcribe] upstream error", res.status);
            if (res.status === 429) {
              return jsonResponse(429, { error: "Zu viele Anfragen. Bitte in einigen Sekunden erneut versuchen." });
            }
            if (res.status === 413) {
              return jsonResponse(413, { error: "Audiodatei zu groß." });
            }
            return jsonResponse(502, { error: "Transkription fehlgeschlagen." });
          }

          const data = (await res.json()) as { text?: string };
          const text = (data.text ?? "").trim();
          if (!text) {
            return jsonResponse(422, { error: "Es wurde kein Text erkannt. Bitte deutlicher sprechen." });
          }
          return jsonResponse(200, { text });
        } catch (e) {
          const aborted = (e as Error)?.name === "AbortError";
          console.error("[transcribe] error", aborted ? "timeout" : "network");
          return jsonResponse(504, {
            error: aborted ? "Zeitüberschreitung bei der Transkription." : "Netzwerkfehler bei der Transkription.",
          });
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  },
});
