# Expertensystem-Ausbau: 5 Kernbereiche

Ausbau der bestehenden Pipeline in `src/lib/expertSystem/` — keine neue Architektur, keine UI-Änderungen. Umsetzung strikt in Phasen mit Nachweis über den Acceptance-Runner (`scripts/acceptance.ts`) und im produktiven Chat.

## Phase 1 — Einkommensteuer ausbauen
Bestehende `commutingAllowanceRule` bleibt. Ergänzt werden:
- **Signals** (`incomeTaxSignals.ts`): Reisekosten, Homeoffice, doppelte Haushaltsführung, § 35a, V+V, Kapital, Renten, private Veräußerung, Sonderausgaben, agB — jeweils erst bei mehreren zusammengehörigen Fakten.
- **Scenarios** (`incomeTaxScenarios.ts`): employmentIncome/{commuting, homeOffice, travelExpenses, doubleHousehold}, householdServices/§35a, rentalIncome, capitalIncome, pension, privateSale.
- **Rules** (`incomeTaxRules.ts`): je Scenario eine Rule mit Prüfschema und Rechtsgrundlagen.
- **Calculations** (`incomeTaxCalculations.ts`): Entfernungspauschale (vorhanden), Homeoffice-Pauschale (6 €/Tag, max. 210 Tage/1.260 €), Verpflegungsmehraufwand (14/28 €), § 35a (20 %, Höchstbeträge), AfA linear, Sparer-Pauschbetrag.
- Jahres-Rückfrage bei zeitabhängigen Beträgen, wenn `VZ` fehlt.

## Phase 2 — Bilanzierung/Bilanzsteuerrecht neu
Neuer Bereich `balanceSheet` als eigener `TaxType`:
- **factModel**: `hasBalanceSheetDate`, `hasUncertainObligation`, `hasWarranty`, `provisionAmount`, `economicCauseYear`, `assetType`.
- **Parser-Erweiterung**: „Bilanzstichtag“, „31.12.“, „Rückstellung“, „Garantie/Gewährleistung“, „ungewisse Verbindlichkeit“, „Aktivierung/Passivierung“, „AfA/Nutzungsdauer“, „ARAP/PRAP“, „Erhaltungsaufwand/Herstellungskosten“, Beträge €.
- **balanceSheetSignals.ts**: provision.warranty, provision.pension, provision.litigation, valuation.impairment, capitalization.intangible, rap.deferral, afa.linear, gwg — jeweils Mehrfach-Fakten-Regel.
- **balanceSheetScenarios.ts**: provisions/{warranty, pension, litigation, maintenance}, valuation/{impairment, forex}, capitalization/{intangible, goodwill}, rap/{active, passive}, fixedAssets/{afa, gwg}.
- **balanceSheetRules.ts**: `warrantyProvisionRule` (Test 2), plus Basisrules für Pensions-, Prozess-, Instandhaltungsrückstellung, ARAP/PRAP-Grundfall, AfA-Grundfall.
- **balanceSheetCalculations.ts**: AfA linear, Rückstellungsabzinsung (§ 6 Abs. 1 Nr. 3a EStG, 5,5 %) grob.
- **Guard**: „GmbH + Waren verkauft“ triggert NICHT USt/KSt, wenn Bilanzstichtag + Garantie + Rückstellungsindikatoren dominieren.

## Verbindliche Testfälle (Phase 1 + 2)
1. Entfernungspauschale 210×28 km → 1.898,40 €, § 9 EStG.
2. Garantierückstellung 18.000 € zum 31.12.2025 → Rückstellung für ungewisse Verbindlichkeiten, § 249 Abs. 1 Satz 1 HGB, § 5 Abs. 1 EStG, wirtsch. Verursachung 2025, HB=StB, Aufwand gewinnmindernd.

Beide Tests in `scripts/acceptance.ts` erweitern und mit Trace nachweisen.

## Nicht in diesem Turn
Phase 3 (USt-Konsolidierung), Phase 4 (AO), Phase 5 (KStG) werden in Folge-Turns umgesetzt — der Nutzer fordert explizit Phase-für-Phase mit Test-Nachweis; Phasen 1+2 zuerst.

## Technisches
- Keine UI-Datei anfassen.
- `src/lib/router/taxTypes.ts` nur um `balanceSheet` erweitern, falls fehlt.
- Bestehende funktionierende USt-Legacy-Logik in `chatHeuristics.ts` bleibt unverändert.
- `EXPERT_OVERRIDE_THRESHOLD` (0.9) bleibt Gate zum Chat.
- Nach jeder Phase: `bunx tsx scripts/acceptance.ts` ausführen, Trace zeigen.
