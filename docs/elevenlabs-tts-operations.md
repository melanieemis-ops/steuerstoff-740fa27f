# ElevenLabs TTS: Sichere Inbetriebnahme

Diese Anwendung nutzt ElevenLabs ausschliesslich serverseitig ueber die Route `src/routes/api/text-to-speech.ts`.

## 1) Pflicht-Variablen

Setze folgende Variablen in der Laufzeitumgebung:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `ELEVENLABS_MODEL_ID` (optional, Standard ist `eleven_multilingual_v2`)

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
wrangler secret put ELEVENLABS_VOICE_ID
wrangler secret put ELEVENLABS_MODEL_ID
```

Danach deployen. Secrets bleiben serverseitig und landen nicht im Browser-Bundle.

## 4) Produktions-Check nach Deploy

1. `POST /api/text-to-speech` mit kleinem deutschen Testtext pruefen.
2. Erfolgsfall: `200` und `content-type: audio/mpeg`.
3. Fehlerfall testen: ungultiger Origin, leere Payload, sehr lange Payload.
4. Verifizieren, dass in Network-Requests kein API-Key auftaucht.

## 5) iOS Smoke-Test (manuell)

1. Klausurfall oeffnen und Vorlesen starten.
2. Pause/Fortsetzen pruefen.
3. `-10s` und `+10s` pruefen.
4. Seekbar ziehen und Abschnittssprung pruefen.
5. Flugmodus aktivieren und Fehlerzustand pruefen.
6. Falls aktiviert: Button `Standardstimme verwenden` pruefen.

## 6) Incident-Playbook

Bei `401/403` von ElevenLabs:

- API-Key auf Ablauf/Rotation pruefen.
- Secret im Zielsystem neu setzen.

Bei `429`:

- Kurz warten, erneut versuchen.
- Lastprofil pruefen, ggf. Server-Rate-Limits anpassen.

Bei `413`:

- Segmentierung pruefen (`src/lib/splitTextForSpeech.ts`).
- Payload-Laenge im Client reduzieren.
