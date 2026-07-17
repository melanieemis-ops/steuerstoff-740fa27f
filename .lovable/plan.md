# Diagnose: `/api/tts` Magazin-Audio (jstg-2026)

## Messergebnisse gegen Produktion

Direkter Abruf gegen die veröffentlichte Domain:

```
GET https://steuerstoff.lovable.app/api/tts?articleId=jstg-2026-einkommensteuer&v=2
→ 302 nach https://steuerstoff.com/api/tts?...
→ 200 OK
   content-type: audio/wav
   content-length: 49.305.644 Bytes (≈ 47 MB)
   cache-control: public, max-age=31536000, immutable
   x-steuerstoff-tts-model: gpt-4o-mini-tts-2025-12-15
   x-steuerstoff-tts-voice: marin
   Gesamtdauer bis vollständigem Body: 71 s
   TTFB (bis erstes Response-Byte): ~70 s (Body wird komplett gepuffert)
```

Damit ist gleichzeitig verifiziert:

- **`OPENAI_API_KEY` ist im Production Runtime vorhanden.** Sonst würde der Handler in `src/routes/api/tts.ts` Zeile 71–74 sofort `503 „Audio derzeit nicht verfügbar."` liefern.
- **Kein Upstream-OpenAI-Fehler** – Statuscode 200, korrekte WAV-Größe, korrekte Modell-/Voice-Header.
- **Kein Serverless-Timeout und kein 50-MB-Response-Limit-Abbruch** – der Cloudflare-Worker liefert die vollen 47 MB (knapp unter dem 100-MB-Streamed-Body-Limit) nach 71 s vollständig aus.
- **Kein fehlendes Secret, kein Speicherproblem serverseitig.**

Der Server ist nicht die Fehlerquelle.

## Wahrscheinlichste Ursache: Client-seitige Ladezeit + iOS/Safari

`ArticleAudioPlayer.tsx` erzeugt ein `<audio>`-Element mit `preload="metadata"` und ruft direkt `/api/tts?...v=2` als `src` auf. Der Endpoint puffert die 47 MB serverseitig komplett, bevor auch nur das erste Byte fließt (`new Response(body, ...)` mit gesetztem `content-length`, kein Streaming). Für den Browser bedeutet das:

- **~70 s Wartezeit bis zum ersten Byte** an einem `<audio>`-Element.
- Safari/iOS bricht Media-Requests, die keine progressiven Bytes liefern, in dieser Größenordnung regelmäßig mit `MediaError` ab → das `"error"`-Event in Zeile 169 feuert und der Player zeigt genau die Meldung, die die Nutzerin sieht: „Die KI-Audiofassung konnte nicht geladen werden. Sie können die Browserstimme als Ersatz nutzen."
- Auch in Chrome kann Cloudflares Edge die 70 s idle-Zeit vor dem ersten Byte als hängende Verbindung schließen; das Ergebnis ist derselbe `<audio>`-`error`.
- Zusätzlich: jeder Aufruf regeneriert das Audio komplett (weder ein Storage-Objekt noch ein Prewarm-Cache existiert; der `cache-control: immutable` hilft nur nach dem ersten vollständigen Download desselben Clients).

Sekundäre, aber real vorhandene Risiken bei einem 9-Min-Artikel:

- Der Handler puffert alle PCM-Chunks im Worker-RAM und baut *einen* WAV-Buffer (`pcmChunksToWav`). 47 MB Uint8Array plus die parallel gehaltenen Roh-Chunks liegen nahe an sinnvollen Worker-Memory-Grenzen; bei einem etwas längeren Artikel kippt das.
- Kein Retry auf Client-Seite, kein Fortschritt („Audio wird einmalig vorbereitet …" bleibt bis zum Fehler stehen, ohne Restzeitindikation).

## Robusteste Lösung (Empfehlung, noch nicht umsetzen)

Zwei Ebenen, in dieser Reihenfolge:

1. **Persistente Ablage statt On-Demand-Neugenerierung.**
   - Beim ersten Aufruf pro (`articleId`, `v`) das erzeugte WAV in Lovable Cloud Storage ablegen (öffentlicher Bucket, deterministischer Objektname `tts/{articleId}-v{v}.wav`).
   - `/api/tts` prüft zuerst Storage; existiert das Objekt, sofortiger **302-Redirect** auf die Storage-URL. Damit liefert der zweite und jeder weitere User TTFB <200 ms – iOS/Safari-Problem gelöst.
   - Erste Erzeugung: Job asynchron; der Endpoint antwortet sofort `202` mit einer `jobId`; ein zweiter, minimaler Poll-Endpoint liefert Status/Ziel-URL. Der Player pollt statt hängend zu laden und zeigt echten Fortschritt.

2. **Player-Härtung**
   - Statt `<audio src>` erst `fetch(audioSrc)` → Blob → `URL.createObjectURL` → `<audio>`; damit kontrollierbare Timeouts, echte Fehlermeldungen und Retry (2×) bei `NetworkError`.
   - `preload="metadata"` wechseln zu `preload="none"`, Ladung erst nach explizitem Play (spart iOS-Datenkosten, vermeidet stille MediaError-Aborts vor dem Klick).
   - Fortschrittsanzeige während des Vorbereitungs-Jobs (Sekundenschätzung anhand Textlänge).

Fallback ohne Storage-Umbau (nur Notlösung, ändert das Grundproblem nicht):

- Kürzere Chunks + höhere Concurrency helfen der Server-Wall-Time kaum (die 47 MB bleiben und werden am Ende weiterhin puffernd zurückgegeben).
- Alternativ: das WAV als **echter Streaming-Response** (ReadableStream) zurückgeben und pro fertigem Chunk sofort schieben. Reduziert TTFB drastisch und kann iOS/Safari das Abbruchproblem nehmen – erfordert aber, dass alle Chunk-PCM-Größen im Voraus bekannt sind, damit ein korrekter WAV-Header vorab geschrieben werden kann. Machbar, weil Sample-Rate/Kanäle fest sind und die PCM-Länge pro Chunk direkt beim OpenAI-Response `content-length` bekannt ist; die Gesamtgröße muss vor dem Header-Schreiben feststehen → erst alle Chunks anfragen (parallel), dann Header schreiben, dann streamen. Bringt nur Teilnutzen.

**Empfehlung:** Weg 1 (Storage + Job) ist die einzige belastbare Lösung für einen 9-Minuten-Artikel unter Cloudflare-Workers-Constraints und für iOS/Safari.

## Was nicht das Problem ist

- Fehlendes `OPENAI_API_KEY` – ausgeschlossen (200 mit korrektem Modell-Header).
- OpenAI-Upstream-Fehler – ausgeschlossen (kein 502 im Handler-Pfad Zeilen 164–168 / 195–199).
- Cloudflare 50 MB Response-Limit – knapp verfehlt (47 MB), aber der aktuelle Artikel liegt noch unter der Grenze; künftige Artikel würden das Limit reißen.
- Falsche Audio-Version – v=2 stimmt mit `AUDIO_CONTENT_VERSION` überein.

## Nächster Schritt

Bitte freigeben, ob ich Weg 1 (Storage-basierte Ablage + Job/Poll + Player-Fetch-mit-Blob) als Implementierungsplan ausarbeiten und danach umsetzen soll.
