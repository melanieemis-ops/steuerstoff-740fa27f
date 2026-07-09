# Steuerstoff Assistant – Deterministische Entscheidungslogik + KB‑Regressionstests

Ziel: Der Chat klassifiziert immer zuerst, löst dann den Fall, und nutzt die Knowledge Base nur zur Vertiefung. Alle bestehenden KB‑Einträge dienen zusätzlich automatisch als Regressionstests.

## Umfang (minimal-invasiv)
Nur Logik/Tests, kein Redesign. Betroffen:
- `src/lib/chatHeuristics.ts` – Klassifizierung, Vollständigkeitsprüfung, Trace, Antwort‑Pipeline
- `src/lib/knowledgeBase.ts` – optionale Felder `testPrompt`, `expect` (Steuerart, scenarioType, Paragraphen) – nur additiv
- `src/lib/taxLexicon.ts` – nur wenn nötig, additiv
- `src/routes/chat.tsx` – kleiner Dev‑Toggle „Trace anzeigen" (nur wenn `import.meta.env.DEV`), keine visuelle Änderung für Nutzer
- **Neu**: `src/lib/classifier.ts` (interne Extraktion + Router, ausgelagert für Testbarkeit)
- **Neu**: `src/lib/__tests__/classifier.test.ts` + `src/lib/__tests__/kb-regression.test.ts` (Vitest)

## 1. Prompt‑Vollständigkeit
Neuer Extractor `extractFacts(prompt)` liefert strukturiertes Objekt:
`{ steuerart, beteiligte, unternehmerstatus, leistungsart, warenbewegung{from,to,fromKind,toKind}, laender[], staedte[], betraege[], zeitraum, rechnungOhneUst, ustIdNr, sonstigeSignale[] }`.
`isComplete(facts, scenarioType)` entscheidet, ob Rückfragen unterdrückt werden. Rückfragen nur für fehlende Felder des gewählten Zweigs.

## 2. Klassifizierungs‑Router (deterministisch)
Reihenfolge fix:
1. Lexikon/Begriffsfrage
2. `extractFacts` → `classify(facts)` → `scenarioType` + Paragraphen
3. Falllösung + 9‑Punkte‑Schema aus Templates pro `scenarioType`
4. KB nur als Vertiefung (Citations), niemals als Hauptantwort
5. Fallback „Sachverhaltsart offen" nur wenn `classify` `null` liefert UND `isComplete` false

## 3. Heuristik‑Trace (Dev)
`classify` gibt `{ result, trace }` zurück. `trace` = Array Schritte:
erkannte Entitäten, Länder, Städte→Land, B2B/B2C, Ware/sL, Warenbewegung, Ort, Paragraphen, gewählter Zweig, verworfene Zweige mit Grund. Im Chat als collapsibles „Debug" nur unter `import.meta.env.DEV`.

## 4. Stadt‑Land‑Mapping erweitern
Vorhandene `CITY_DE`/`CITY_EU` um EU‑Hauptstädte + große Wirtschaftszentren ergänzen (Paris/FR, Wien/AT, Mailand/IT, Madrid/ES, Warschau/PL, Prag/CZ, …). Drittland‑Set (`CITY_3RD`: Zürich, London, New York, Istanbul …) für Ausfuhr/Einfuhr‑Routing.

## 5. EU‑Routing‑Matrix
`classify` deckt alle Zweige ab:
- Inland
- EU→DE (ig. Erwerb § 1a)
- DE→EU (ig. Lieferung § 6a, § 4 Nr. 1b)
- EU→EU (Reihen/Dreieck bei ≥3 Beteiligten)
- Drittland→DE (Einfuhr § 1 Abs. 1 Nr. 4)
- DE→Drittland (Ausfuhr § 6, § 4 Nr. 1a)
- Werklieferung/Werkleistung ausl. Unternehmer → § 13b
- Reihen‑ und Dreiecksgeschäft (§ 25b) bei 3+ Parteien
- Grundstück (§ 3a Abs. 3 Nr. 1), Personenbeförderung, elektronische Leistungen B2C (§ 3a Abs. 5)

## 6. KB‑Regressionstests
Jeder KB‑Eintrag erhält optional:
```
testPrompt?: string
expect?: { steuerart?, scenarioType?, paragraphen?: string[], mustNotAskFollowup?: boolean }
```
Für Einträge ohne `testPrompt` wird ein Prompt aus `title + keywords` synthetisiert.
`kb-regression.test.ts` iteriert alle Einträge:
- ruft `classify(extractFacts(prompt))`
- prüft: Steuerart passt, scenarioType passt (falls angegeben), mindestens ein erwarteter Paragraph, kein Fallback "unbestimmt" wenn `mustNotAskFollowup`, KB‑Zitat kommt nach Falllösung.

Beim ersten Lauf werden fehlende `expect`‑Felder als „soft assertions" nur geloggt (kein Fail), harte Fails nur bei Kernfällen (USt‑Matrix, Werklieferung, ig. Erwerb/Lieferung, Ausfuhr, Einfuhr, § 13b, § 25b). So schlägt der initiale Lauf nicht flächig fehl.

## 7. Antwortreihenfolge (fest)
Renderer in `chatHeuristics.ts`:
1. Klassifizierung (1 Zeile: Sachverhaltsart + Kernnorm)
2. Falllösung (konkret)
3. 9‑Punkte‑Schema
4. Ergebnis
5. Begründung
6. Vertiefung KB (optional, klar abgesetzt)

Bei eindeutiger Klassifizierung werden „Sachverhalt offen", generisches Prüfschema, „Nicht anwenden"‑Blöcke unterdrückt.

## 8. Qualitätsprüfung (Self‑Check)
Vor Rückgabe: `assertConsistent(result, kbCitations)` – wirft Warnung im Trace wenn ein KB‑Zitat einer anderen Norm folgt als die Klassifizierung; solche Zitate werden dann verworfen statt angezeigt.

## 9. Technisches
- Vitest ist bereits im Stack; Tests unter `src/lib/__tests__/`
- Keine neuen Runtime‑Dependencies
- Keine Änderung der öffentlichen Chat‑UI außer Dev‑Trace hinter `import.meta.env.DEV`
- Öffentliche API von `generateAnswer` bleibt gleich

## Out of scope
- Kein Redesign, keine neuen Seiten, keine KB‑Inhaltserweiterung in diesem Schritt
- Keine Änderung an Wissensdatenbank‑Route, Lexikon‑Route, Kfz‑Rechner
