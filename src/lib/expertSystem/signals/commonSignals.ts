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
    taxTypeScores: { koerperschaftsteuer: 15 },
    scenarioScores: { hiddenProfitDistribution: 18 },
    explanation: "Indiziertes Muster für vGA nach § 8 Abs. 3 Satz 2 KStG.",
  },
  {
    id: "ust.workDelivery.explicit",
    label: "Werklieferung ausdrücklich genannt",
    requiredFacts: ["workDelivery"],
    excludedFacts: ["workService"],
    taxTypeScores: { umsatzsteuer: 10 },
    scenarioScores: { workDelivery: 12 },
  },
];
