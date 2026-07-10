import type { SignalDef } from "./signalTypes";

// Startset — bewusst klein. Jedes Signal fordert mindestens zwei zusammen-
// gehörige Fakten oder Fakt+Ausschluss. Kein Keyword allein entscheidet.

export const COMMON_SIGNALS: SignalDef[] = [
  {
    id: "est.commutingAllowance.pattern",
    label: "Arbeitnehmer mit erster Tätigkeitsstätte und bekannter Entfernung",
    requiredFacts: ["employee", "firstPlaceOfWork"],
    taxTypeScores: { einkommensteuer: 15 },
    scenarioScores: { commutingAllowance: 18 },
    explanation: "Vollständiges Muster für § 9 Abs. 1 Satz 3 Nr. 4 EStG.",
  },
  {
    id: "kst.vGA.pattern",
    label: "Kapitalgesellschaft + Gesellschafter + überhöhte Vergütung",
    requiredFacts: ["corporation", "shareholder", "disproportionateCompensation"],
    taxTypeScores: { koerperschaftsteuer: 20 },
    scenarioScores: { hiddenProfitDistribution: 25 },
    explanation: "Indiziertes Muster für vGA nach § 8 Abs. 3 Satz 2 KStG.",
  },
  {
    id: "kst.vGA.explicit",
    label: "vGA / verdeckte Gewinnausschüttung ausdrücklich genannt",
    requiredFacts: ["corporation", "hiddenProfitDistribution"],
    taxTypeScores: { koerperschaftsteuer: 20 },
    scenarioScores: { hiddenProfitDistribution: 25 },
  },
  {
    id: "kst.hiddenContribution.pattern",
    label: "Verdeckte Einlage",
    requiredFacts: ["corporation", "hiddenContribution"],
    taxTypeScores: { koerperschaftsteuer: 20 },
    scenarioScores: { hiddenContribution: 25 },
  },
  {
    id: "kst.organschaft.pattern",
    label: "Organschaft § 14 KStG",
    requiredFacts: ["organschaft"],
    taxTypeScores: { koerperschaftsteuer: 18 },
    scenarioScores: { organschaft: 22 },
  },
  {
    id: "kst.contributionAccount.pattern",
    label: "Steuerliches Einlagekonto § 27 KStG",
    requiredFacts: ["taxContributionAccount"],
    taxTypeScores: { koerperschaftsteuer: 18 },
    scenarioScores: { contributionAccount: 22 },
  },
  {
    id: "kst.profitDistribution.pattern",
    label: "Ausschüttung einer Kapitalgesellschaft",
    requiredFacts: ["corporation", "profitDistribution"],
    excludedFacts: ["hiddenProfitDistribution"],
    taxTypeScores: { koerperschaftsteuer: 15 },
    scenarioScores: { profitDistribution: 20 },
  },
  {
    id: "kst.lossCarryforward.pattern",
    label: "Verlustvortrag / Verlustabzug",
    requiredFacts: ["lossCarryforward"],
    taxTypeScores: { koerperschaftsteuer: 15 },
    scenarioScores: { lossCarryforward: 20 },
  },
  {
    id: "ust.workDelivery.explicit",
    label: "Werklieferung ausdrücklich genannt",
    requiredFacts: ["workDelivery"],
    excludedFacts: ["workService"],
    taxTypeScores: { umsatzsteuer: 10 },
    scenarioScores: { workDelivery: 12 },
  },

  // ─────────── Bilanzierung / Bilanzsteuerrecht ───────────
  {
    id: "bilanz.warrantyProvision.pattern",
    label: "Garantie + ungewisse Verbindlichkeit + Bilanzstichtag",
    requiredFacts: ["warranty", "uncertainObligation", "balanceSheetDate"],
    taxTypeScores: { bilanzsteuerrecht: 20 },
    scenarioScores: { provisions: 20, warrantyProvision: 25 },
    explanation:
      "Vollständiges Muster für Rückstellung nach § 249 Abs. 1 Satz 1 HGB / § 5 Abs. 1 EStG.",
  },
  {
    id: "bilanz.provision.generic",
    label: "Rückstellung ausdrücklich zum Bilanzstichtag",
    requiredFacts: ["provision", "balanceSheetDate"],
    taxTypeScores: { bilanzsteuerrecht: 15 },
    scenarioScores: { provisions: 15 },
  },
  {
    id: "bilanz.balanceSheetDate.solo",
    label: "Bilanzstichtag ohne weiteren Fachtatbestand",
    requiredFacts: ["balanceSheetDate"],
    taxTypeScores: { bilanzsteuerrecht: 6 },
  },

  // ─────────── Einkommensteuer — weitere Muster ───────────
  {
    id: "est.homeOffice.pattern",
    label: "Arbeitnehmer im Homeoffice mit Tagen",
    requiredFacts: ["employee", "homeOffice"],
    taxTypeScores: { einkommensteuer: 15 },
    scenarioScores: { homeOfficeAllowance: 18 },
  },
  {
    id: "est.travelExpenses.pattern",
    label: "Arbeitnehmer + Auswärtstätigkeit / Dienstreise",
    requiredFacts: ["employee"],
    excludedFacts: ["firstPlaceOfWork"],
    taxTypeScores: { einkommensteuer: 8 },
    scenarioScores: { travelExpenses: 8 },
  },
];
