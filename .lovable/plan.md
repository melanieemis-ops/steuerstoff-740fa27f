## Ziel

Steuerstoff Assistant wird zu einem modularen, regelbasierten Expertensystem mit strikter Pipeline
`Input → Parser → Facts → Signals → TaxRouter → ScenarioMatcher → RuleEngine → CalculationEngine → KnowledgeEngine → AnswerBuilder`.
Bestehende USt-Logik bleibt erhalten und wird schrittweise migriert.

Umsetzung strikt phasenweise, credit-schonend. Jede Phase endet mit Typecheck + Regression. Keine UI-Änderungen.

## Phase 1 — Fundament & Trace (dieser Turn)

Neue modulare Struktur unter `src/lib/expertSystem/` aufbauen. Bestehendes `src/lib/expert/` bleibt zunächst als Legacy-Adapter erhalten und wird von der neuen Pipeline aufgerufen, damit die USt-Regression grün bleibt.

Neu angelegt:

```text
src/lib/expertSystem/
  facts/factModel.ts            # normalisiertes Facts-Interface (positiv/negativ/unknown)
  parser/parser.ts              # Entity-/Fact-Extraktion (baut auf src/lib/expert/parser.ts auf, ergänzt Personen, Rechtsformen, Beträge, Vorgänge, Dokumente)
  parser/factNormalizer.ts      # Synonym-Mapping (erste Arbeitsstätte = firstPlaceOfWork usw.)
  signals/signalTypes.ts
  signals/signalEngine.ts       # gewichtete Kombinations-Signale (+1/+3/+5/+10/+15, −10)
  signals/commonSignals.ts      # Startset: USt-Signale, ESt-Werbungskosten, Entfernungspauschale, vGA, Rückstellung
  router/taxRouter.ts           # Multi-Score, Mindestscore, Abstand, Mehrsteuerfall
  scenarios/scenarioMatcher.ts  # taxType → scenario → subScenario
  rules/ruleTypes.ts
  rules/ruleEngine.ts           # Konfliktlösung: spezielle vor allgemeiner, Priorität, Confidence
  rules/vatRules.ts             # Adapter → bestehende src/lib/expert/rules/vatRules.ts + classifyUst
  rules/incomeTaxRules.ts       # Entfernungspauschale als erste vollständige Regel
  calculations/calculationEngine.ts
  calculations/incomeTaxCalculations.ts  # calculateCommutingAllowance (0,30 €/km bis 20 km, 0,38 €/km ab 21. km, aktuelle Rechtslage)
  knowledge/knowledgeEngine.ts  # hierarchischer Filter taxType → scenario → sub → paragraph
  answer/answerBuilder.ts       # zwei Templates: Berechnungsfrage (5 Punkte) vs. Fallprüfung (12 Punkte)
  trace/expertTrace.ts          # Trace-Objekt, nur im Dev sichtbar
  pipeline.ts                   # orchestriert die 10 Ebenen
  index.ts                      # public API: runExpertSystem(prompt) → { answer, trace }
```

Integration:

- `src/lib/chatHeuristics.ts` ruft `runExpertSystem(prompt)` zusätzlich zur bestehenden Kette auf. Wenn das Expertensystem einen Treffer mit `confidence ≥ Schwelle` liefert, ersetzt es die bisherige USt-/Fallback-Antwort. Sonst fällt es auf die aktuelle Logik zurück. Damit keine Regression.
- Trace nur in `import.meta.env.DEV`.

Erster verbindlicher End-to-End-Test: „Arbeitnehmer, 210 Tage, 28 km, erste Tätigkeitsstätte, privater Pkw“ muss ohne Rückfrage die korrekt gestaffelte Entfernungspauschale liefern. Wird als Vitest-Case in `src/lib/expertSystem/__tests__/commutingAllowance.test.ts` abgelegt.

USt-Regression (`src/lib/regressionRunner.ts`) muss unverändert grün bleiben.

## Phase 2 — USt-Migration

`classifyUst` aus `chatHeuristics.ts` in `expertSystem/rules/vatRules.ts` als echte Regeln überführen (Werklieferung, Werkleistung, § 6a, § 1a, § 13b, Reihen-/Dreiecksgeschäft). Der Legacy-Aufruf verschwindet erst, wenn alle bestehenden USt-Regressionstests im neuen System grün sind.

## Phase 3 — Einkommensteuer breit

Weitere ESt-Unterfälle: Reisekosten, Homeoffice, Arbeitszimmer, § 35a, V+V, Kapital, Rente, private Veräußerung, Gewinneinkünfte. Jeweils Signale + Regeln + ggf. Calculation.

## Phase 4 — AO, Bilanz, KSt, GewSt, LSt

Regeln + Signale je Steuerart, Adapter zu bestehenden Skeletten in `src/lib/expert/rules/*` bleiben Fallback.

## Phase 5 — NPO, ErbSt, SchenkSt, GrESt, IStR

Analog Phase 4.

## Nach jeder Phase

- `tsgo` Typecheck
- Vitest (neue Cases + Regression)
- Report pro Steuerart in Konsole
- keine UI-Änderung

## Technische Leitplanken

- Keine Regel darf ausschließlich aus einem Keyword bestehen — alle Regeln verlangen ≥ 2 Fakten oder eine Fakt+Ausschluss-Kombination.
- Fakten sind `true | false | "unknown"`, nie implizit angenommen.
- Confidence pro Ebene, Fallback nur bei echtem Widerspruch oder fehlenden Fakten.
- Trace nie in Prod-Antworten.
- Bestehende Dateien in `src/lib/expert/*` bleiben unverändert bis Phase 2 abgeschlossen ist.

## Deliverable dieses Turns

Nur Phase 1: Verzeichnisstruktur, Grundmodule, Entfernungspauschale als erster grüner End-to-End-Fall, Integration in `chatHeuristics.ts` als non-breaking Zusatzpfad, USt-Regression unverändert grün.