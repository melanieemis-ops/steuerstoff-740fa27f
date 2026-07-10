# Steuerstoff-Expertensystem (5 Ebenen)

Ziel: Der Assistant entscheidet deterministisch über eine feste Pipeline
`Parser → Signal Engine → Steuerart-Router → Regelmaschine → Knowledge Engine`.
Die KB klassifiziert nichts mehr, sie vertieft nur. Bestehende 102/102-Regressionen
müssen grün bleiben; neue Steuerarten starten mit „soft"-Erwartungen.

Arbeit bleibt minimal-invasiv: kein Redesign, keine neuen Seiten, keine neuen
Runtime-Deps, keine UI-Änderungen. Öffentliche API von `generateAnswer(prompt)`
bleibt gleich.

## Neue Ordnerstruktur

```
src/lib/expert/
  parser.ts             # Ebene 1 — Fakten-Extraktion (Entitäten, Orte, Zeit, Beträge, Steuer-Fakten)
  signals.ts            # Ebene 2 — Signal-Definitionen + Evaluator
  router.ts             # Ebene 3 — Score-basierter Steuerart-Router (parallele Bewertung)
  ruleEngine.ts         # Ebene 4 — Registry + Executor für Rule-Dateien
  knowledge.ts          # Ebene 5 — Scoped KB-Zugriff (taxType + scenario + subCase)
  types.ts              # gemeinsame Typen: Facts, Signal, RuleFile, RuleResult, ExpertAnswer
  rules/
    vatRules.ts             # bestehende USt-Logik migriert
    incomeTaxRules.ts       # EStG (Werbungskosten, §35a, V+V, Kapital, sonstige Einkünfte)
    corporateTaxRules.ts    # KStG-Basisschema
    tradeTaxRules.ts        # GewStG-Basisschema
    payrollTaxRules.ts      # LStG (geldwerter Vorteil, Sachbezug)
    balanceSheetRules.ts    # Bilanzsteuerrecht (Rückstellung, RAP, AfA)
    aoRules.ts              # Einspruch, Verjährung, Änderungsnormen
    nonprofitRules.ts       # §§ 51–68 AO
    inheritanceTaxRules.ts
    giftTaxRules.ts
    realEstateTransferTaxRules.ts
    internationalTaxRules.ts
    reorganizationTaxRules.ts   # UmwStG
    investmentTaxRules.ts       # InvStG (Stub)
    customsRules.ts             # Zoll (Stub)
    energyTaxRules.ts           # (Stub)
    insuranceTaxRules.ts        # (Stub)
    motorVehicleTaxRules.ts     # KraftStG (Stub)
    propertyTaxRules.ts         # GrStG (Stub)
```

Stubs enthalten ein Basisschema, damit die Steuerart erkannt und mit einer
sauberen (wenn auch flachen) Prüfstruktur beantwortet wird. Kein leerer Zweig.

## Ebene 1 — Parser (`parser.ts`)

Reine Funktion `parseFacts(prompt) → Facts`.

`Facts` (Beispielausschnitt):
```
entities:   { unternehmerDE, unternehmerEU, unternehmerDrittland,
              arbeitnehmer, verein, stiftung, gesellschafter, finanzamt }
orte:       { ausDE, nachDE, ausEU, nachEU, ausDrittland, nachDrittland,
              flow: [{from,to,fromKind,toKind}] }
zeit:       { vz, wj, stichtag, jahr }
betraege:   { entgelt, kaufpreis, lohn, gewinn, umsatz, ak }
steuerFakten: { rechnung, ustId, warenbewegung, lieferung, dienstleistung,
                grundstueck, schenkung, veraeusserung, vermietung,
                arbeitsverhaeltnis, bilanzierung, spende, betriebsvermoegen,
                privatvermoegen, werklieferung, werkleistung, reverseCharge }
raw:        { text, tokens }
```

Nutzt und ersetzt schrittweise die verstreute Extraktion in `chatHeuristics`
(City-Maps, Flow-Parser, `hasWare`, `euCtx` …). Trifft **keine** steuerliche
Entscheidung.

## Ebene 2 — Signal Engine (`signals.ts`)

Signal-Typ:
```
{ id, description, requires: (f)=>boolean, excludes: (f)=>boolean,
  weight: Partial<Record<TaxType, number>>,
  scenarios?: ScenarioType[], subCases?: string[] }
```

`evaluateSignals(facts) → Signal[]` liefert alle feuernden Signale mit Gewichten.
Startumfang deckt USt (ig. Erwerb, ig. Lieferung, Werklieferung/-leistung,
Reverse Charge, Ausfuhr, Einfuhr), ESt (erste Tätigkeitsstätte, Arbeitszimmer,
§35a, V+V, Kapital), Bilanz (Rückstellung, RAP), AO (Einspruch, Verjährung),
NPO, Erb/Schenkung, GrESt, IntStR ab.

## Ebene 3 — Steuerart-Router (`router.ts`)

`routeTaxType(signals) → { primary: TaxType, secondary: TaxType[], scores }`.

- Parallele Bewertung aller Steuerarten.
- Mehrsteuerfall: zweiter Score ≥ 70 % des ersten UND absolut ≥ Schwellwert
  → `secondary` befüllen (typische Kombos: KSt+Bilanz, USt+Zoll, ESt+LSt, NPO+USt).
- Fallback `unklar` nur bei Score < Minimum-Schwelle.

Ersetzt das bisherige Regex-Voting in `router/taxTypes.ts`; die alte Datei bleibt
zunächst als Dünn-Adapter, der die neue Engine aufruft, damit `regressionRunner`
und `chatHeuristics` nicht sofort umgezogen werden müssen.

## Ebene 4 — Regelmaschine (`ruleEngine.ts` + `rules/*`)

RuleFile-Typ:
```
{ taxType, scenarios: ScenarioType[],
  subScenarios: string[],
  decisionTree(facts, signals) → { scenario, subCase, schemaSteps[], normen[],
                                   berechnung?, ergebnis, alternativen?,
                                   missingFacts? },
  kbFilter: { taxType, scenarios, subCases },
  regressionCases: RegressionCase[] }
```

`runRules(taxType, facts, signals) → RuleResult`. `vatRules.ts` migriert die
bestehende `classifyUst` 1:1; alle heutigen USt-Zweige (§1a, §6a, §13b,
Werklieferung, Reihe/Dreieck, Ausfuhr/Einfuhr) bleiben inhaltlich identisch —
nur strukturiert als Decision-Tree-Steps. Andere Rule-Dateien liefern
Basisschemata (Startumfang wie in altem Plan Schritt 4).

## Ebene 5 — Knowledge Engine (`knowledge.ts`)

`findKbCitations(taxType, scenario, subCase) → KBEntry[]`
- Filtert KB strikt nach `taxType` → `scenarioType` → `subCase`.
- Rankt nur innerhalb dieses Scopes.
- Darf `RuleResult` niemals überschreiben; liefert reine Vertiefung
  (Merksätze, BFH, Verwaltung, Sonderfälle, Klausurhinweise).

## Integration in `chatHeuristics.ts`

`generateAnswer(prompt)`:
1. Lexikon-Kurzantwort (unverändert).
2. `facts = parseFacts(prompt)`
3. `signals = evaluateSignals(facts)`
4. `route = routeTaxType(signals)`
5. `ruleResult = runRules(route.primary, facts, signals)` (+ optional secondary
   als „Auch relevant"-Hinweis)
6. `kb = findKbCitations(route.primary, ruleResult.scenario, ruleResult.subCase)`
7. Rendering in fester 11-Punkt-Reihenfolge (Steuerart, Sachverhaltsart,
   Unterfall, Prüfungsschema, Normen, Prüfung, Berechnung, Ergebnis, KB,
   Alternativen, Rückfragen — Rückfragen nur bei `missingFacts`).

Rückwärtskompatibilität: bestehende NPO-/MVR-/SKR-/Kfz-Vorschaltintents bleiben
vor Schritt 2. `classifyForRegression` wird intern auf den neuen Weg umgestellt,
gibt aber weiter `{ scenarioType, paragraph, complete, trail }` zurück.

## Regression (`regressionRunner.ts`)

- Cases werden pro `TaxType` gruppiert (bereits vorhanden).
- Zusätzlich aggregiert nach `RuleFile`.
- Pro Rule-Datei automatisch generiert: Standard-, Grenz-, Negativ-,
  Mehrsteuer-, Sonder-, Prüfungsfälle (`regressionCases` in der Rule-Datei).
- Harte Baseline: **alle heutigen 102 KB-Cases bleiben grün** (USt hart, Rest
  soft), sonst gilt der Schritt als fehlgeschlagen und wird zurückgerollt.
- Neue Vitest-Datei `src/lib/__tests__/expert.test.ts` mit gezielten Prompts
  pro Rule-Datei (min. 2 Positiv + 1 Negativ).
- Dev-Toggle `window.__runKbRegression()` bleibt.

## UI

Keine Änderung. Trace (`taxType → scenario → subCase → schemaId → signals`)
nur in `import.meta.env.DEV` sichtbar, produktiv unsichtbar.

## Rollout in 4 kleinen Schritten (jeder Schritt = grüne Baseline)

1. **Skeleton + Migration USt.** `expert/{types,parser,signals,router,ruleEngine,
   knowledge}.ts` + `rules/vatRules.ts`. `chatHeuristics.generateAnswer` ruft
   für `taxType === 'umsatzsteuer'` die neue Engine, sonst weiter alten Pfad.
   102/102 grün.
2. **ESt + AO + Bilanz + NPO Rule-Dateien** (echte Schemata) + zugehörige
   Regressionstests. Alter Pfad wird für diese Steuerarten deaktiviert.
3. **Erb/Schenk/GrESt/KStG/GewSt/LSt/UmwSt/IntStR** als schlanke Rule-Dateien
   mit Basisschema (kein Stub-Text, aber flache Bäume).
4. **Restliche Stubs** (InvStG, Zoll, EnergieStG, VersStG, KraftStG, GrStG) +
   Aufräumen: `router/taxTypes.ts` wird zum Dünn-Adapter, alte
   USt-Klassifizierung in `chatHeuristics` entfernt, sobald `vatRules` alle
   USt-Regressionen bedient.

## Out of scope

- Keine neuen Seiten, keine UI-Anpassung, keine KB-Inhaltserweiterung.
- Keine Änderung an Kfz-Rechner, MVR, Lexikon-Route, Wissensdatenbank-Filter.
- Keine LLM-Anbindung; die Logik bleibt vollständig deterministisch.

## Technisches

- Alle Ebenen sind reine Funktionen ohne Seiteneffekte; leicht unit-testbar.
- Keine neuen Runtime-Deps. Vitest ist als Dev-Dep akzeptabel, sonst genügt
  der bestehende `window.__runKbRegression()`-Runner.
- Performance: Signal-Evaluation ist O(n · Regeln); mit Kurzschluss über
  `requires` bleibt der Aufruf auch bei tausenden KB-Einträgen konstant, weil
  die KB erst NACH der Klassifizierung und nur im gescopten Bereich angefragt wird.
