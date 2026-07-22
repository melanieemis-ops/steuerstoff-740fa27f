# ElevenLabs TTS: Freischaltcode und sichere Inbetriebnahme

Diese Anwendung nutzt ElevenLabs ausschliesslich serverseitig ueber die Route `src/routes/api/text-to-speech.ts`.

## 1) Pflicht-Variablen

Setze folgende Variablen in der Laufzeitumgebung:

- `ELEVENLABS_API_KEY`
- `TTS_ACCESS_CODE`
- `ELEVENLABS_MODEL_ID` (optional, Standard ist `eleven_multilingual_v2`)

Die Voice-ID `g1jpii0iyvtRs8fqXsd1` ist fest im Worker hinterlegt und wird nicht vom Client
gesendet.

Wichtig:

- Niemals als `VITE_...` definieren.
- Niemals in Frontend-Code einchecken.
- Niemals in Client-Logs oder Browser-Konsole ausgeben.

## 2) Lokale Entwicklung

1. `.env.example` nach `.env` kopieren.
2. Werte lokal setzen.
3. Entwicklungsserver starten.

Hinweis: Die `.env` darf nicht committed werden.

## 3) Cloudflare/Wrangler (empfohlen fuer dieses Repo)

Dieses Repo enthaelt `wrangler.jsonc`. Secrets als echte Worker-Secrets setzen:

```bash
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put TTS_ACCESS_CODE
```

Danach deployen. Secrets bleiben serverseitig und landen nicht im Browser-Bundle.

## 4) Produktions-Check nach Deploy

1. In den Einstellungen den Wert aus `TTS_ACCESS_CODE` als Freischaltcode speichern.
2. `POST /api/text-to-speech` mit kleinem deutschen Testtext und dem Header
   `x-tts-access-code` pruefen.
3. Erfolgsfall: `200` und `content-type: audio/mpeg`.
4. Fehlenden und falschen Freischaltcode testen: jeweils `401` und
   `INVALID_TTS_ACCESS_CODE`.
5. Leere Payload, sehr lange Payload und Rate-Limit testen.
6. Verifizieren, dass in Network-Requests kein ElevenLabs-API-Key und keine Voice-ID auftaucht.

## 5) iOS Smoke-Test (manuell)

1. Klausurfall oeffnen und Vorlesen starten.
2. Pause/Fortsetzen pruefen.
3. `-10s` und `+10s` pruefen.
4. Seekbar ziehen und Abschnittssprung pruefen.
5. Flugmodus aktivieren und Fehlerzustand pruefen.
6. Freischaltcode entfernen und die Verlinkung zu den Einstellungen pruefen.

## 6) Incident-Playbook

Bei `401` vom Steuerstoff-Worker:

- Freischaltcode im Gerät und `TTS_ACCESS_CODE` im Worker vergleichen.

Bei Konfigurationsfehlern des Workers:

- API-Key auf Ablauf/Rotation pruefen.
- `ELEVENLABS_API_KEY` und `TTS_ACCESS_CODE` im Zielsystem neu setzen.

Bei `429`:

- Kurz warten, erneut versuchen.
- Lastprofil pruefen, ggf. Server-Rate-Limits anpassen.

Bei `413`:

- Segmentierung pruefen (`src/lib/splitTextForSpeech.ts`).
- Payload-Laenge im Client reduzieren.
