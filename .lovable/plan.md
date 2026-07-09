# Universeller Steuer-Router (Expertensystem)

Ziel: Vor jeder Antwort läuft eine feste Pipeline
`Steuerart → Sachverhaltsart → Unterfall → Prüfschema → Prüfung → Ergebnis → KB`.
Die Knowledge Base darf Klassifizierung und Ergebnis nie überschreiben, sondern nur vertiefen.

Arbeit bleibt minimal-invasiv: kein Redesign, keine neuen Seiten, keine neuen Runtime-Deps.
Öffentliche API von `generateAnswer(prompt)` bleibt gleich.

## 1. Neue Router-Schicht (rein logisch)

Neue Dateien unter `src/lib/router/`:

- `taxTypeRouter.ts` — bestimmt `TaxType`
  (`einkommensteuer | umsatzsteuer | koerperschaftsteuer | gewerbesteuer | lohnsteuer |
  bilanzsteuerrecht | abgabenordnung | gemeinnuetzigkeit | erbschaftsteuer |
  schenkungsteuer | grunderwerbsteuer | umwandlungssteuer | internationales_steuerrecht |
  sonstige | unklar`) — deterministisch per Regex/Lexikon-Signale.
- `scenarioRouter.ts` — bestimmt pro `TaxType` die `ScenarioType`
  (bestehende USt-Szenarien bleiben; neu: EStG-Werbungskosten/Sonderausgaben/agB/§35a/
  Gewinneinkünfte/Überschusseinkünfte/Vermietung/Kapital/Veräußerung/AfA,
  Bilanz-Rückstellungen/RAP/Bewertung/AfA/…, AO-Einspruch/Verjährung/Änderungsnormen/…).
- `subCaseRouter.ts` — feinere Unterfälle je Sachverhalt (z. B. Entfernungspauschale,
  häusliches Arbeitszimmer; ig. Erwerb vs. ig. Lieferung; Rückstellung drohend vs. ungewiss).
- `schemaRegistry.ts` — Registry `Map<ScenarioType | SubCase, PruefSchema>`.
  Ein `PruefSchema` ist eine Datenstruktur (nicht Text): `steps[]` mit `id, label, evaluate(facts)`.
- `pipeline.ts` — orchestriert: `extractFacts → routeTaxType → routeScenario → routeSubCase →
  loadSchema → runSchema → deriveResult → citeKb`. Liefert `RouterResult` mit
  `taxType, scenarioType, subCase, schema, findings[], result, trace[], kbCitations[]`.

## 2. Integration in `chatHeuristics.ts`

- `generateAnswer` ruft zuerst Lexikon (Begriffsfrage) wie bisher.
- Sonst: `pipeline.run(prompt)` und dann Rendering in fester Reihenfolge:
  1. Klassifizierung  2. Sachverhaltsart  3. Prüfungsschema  4. Rechtsgrundlagen
  5. Steuerliche Prüfung  6. Ergebnis  7. Vertiefung KB  8. Alternative Regel
  9. Nicht anwenden  10. Rückfragen (nur bei fehlenden Fakten).
- Bestehende `classifyUst` bleibt bestehen, wird aber vom `scenarioRouter` für
  `taxType === "umsatzsteuer"` aufgerufen (keine Doppel-Logik).
- KB-Suche (`findKbMatches`) wird strikt zweistufig: erst nach `taxType` filtern,
  dann nach `scenarioType`; darf nie Norm/Ergebnis der Klassifizierung überschreiben
  (`citationMatchesNorm` bleibt aktiv).
- Rückfragen erscheinen nur, wenn `pipeline` `missingFacts[]` meldet.

## 3. KB-Modell erweitern (additiv)

`KBEntry` bekommt optional:
```
taxType?: TaxType
subCase?: string
```
Bestehende Einträge bleiben gültig; fehlende Felder werden aus `category` /
`scenarioType` heuristisch abgeleitet (`resolveTaxType(entry)`).

## 4. Prüfschemata (Startumfang)

Nur die im Prompt genannten Kernschemata initial umsetzen, jeweils als Datenstruktur:
- USt 9-Punkte (bestehend, in Registry überführen)
- EStG Werbungskosten (inkl. Entfernungspauschale-Berechnung)
- EStG §35a (Höchstbeträge, haushaltsnahe/Handwerker)
- Bilanz Rückstellung (Voraussetzungen, Bewertung, Auflösung)
- AO Einspruch (Zulässigkeit, Frist, Begründetheit)
- Erbschaft-/Schenkungsteuer Grundschema (Steuerklasse, Freibeträge, Tarif)

Weitere Schemata sind später ohne Architekturänderung ergänzbar (nur neue Registry-Einträge).

## 5. Regression pro Steuerart

`src/lib/regressionRunner.ts` erweitern:
- Cases werden pro `TaxType` gruppiert.
- Pro Case zusätzlich geprüft: erkannter `taxType`, `scenarioType`, Prüfschema-ID,
  Antwortreihenfolge (Sektionstitel-Sequenz), KB-Auswahl nur nach Klassifizierung,
  keine überflüssigen Rückfragen, erwartete Paragraphen.
- Bestehende KB-Einträge dürfen nicht regressieren (harte Baseline = aktueller Stand
  102/102 grün). Neue Steuerarten starten mit „soft"-Erwartungen, damit initialer Lauf
  nicht flächig fehlschlägt.
- Vitest-Datei `src/lib/__tests__/router.test.ts` mit gezielten Prompts pro Steuerart
  (mind. 2–3 Positiv- und 1 Negativfall).
- Dev-Toggle `window.__runKbRegression()` bleibt.

## 6. UI

Keine Änderung. Optional im Dev-Modus (`import.meta.env.DEV`) wird die Trace um
`taxType → scenarioType → subCase → schemaId` erweitert; produktiv unsichtbar.

## Technisches

- Alle Router sind reine Funktionen auf einem gemeinsamen `Facts`-Objekt
  (`extractFacts` in bestehender Form; nur um Felder erweitert, die weitere Steuerarten
   brauchen: `arbeitsweg, entfernungKm, arbeitstage, aufwandArt, rechtsbehelf, frist, …`).
- Keine externen Deps. Keine Änderungen an Routen, Layouts, Styles, Assets.
- Änderungspunkte: `src/lib/router/*` (neu), `src/lib/chatHeuristics.ts` (Integration),
  `src/lib/knowledgeBase.ts` (nur additive Felder + `resolveTaxType`),
  `src/lib/regressionRunner.ts` (erweitert), `src/lib/__tests__/router.test.ts` (neu).

## Out of scope

- Keine neuen Seiten, keine UI-Anpassung, keine KB-Inhaltserweiterung.
- Keine Änderung an Kfz-Rechner, MVR, Lexikon-Route, Wissensdatenbank-Filter.
- Keine LLM-Anbindung; die Logik bleibt deterministisch.

## Rollout in 3 kleinen Schritten

1. Router-Skeleton + USt-Migration in Registry, alle bestehenden Regressionen bleiben grün.
2. EStG + AO + Bilanz-Schemata + zugehörige Regressionstests.
3. Erbschaft/Schenkung/GrESt/KStG/GewSt/LSt/UmwSt/IntStR als Stubs mit klaren Fallback-Schemata,
   damit die Steuerart erkannt wird, auch wenn das Fach-Schema minimal ist.
