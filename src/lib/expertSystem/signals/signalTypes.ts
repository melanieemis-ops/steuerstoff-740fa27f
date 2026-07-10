import type { TaxType } from "@/lib/router/taxTypes";
import type { Facts } from "../facts/factModel";

export type SignalId = string;

export interface SignalDef {
  id: SignalId;
  label: string;
  /** Alle müssen `true` sein. */
  requiredFacts: (keyof Facts)[];
  /** Wenn eines `true` ist, wird das Signal verworfen. */
  excludedFacts?: (keyof Facts)[];
  taxTypeScores: Partial<Record<TaxType, number>>;
  scenarioScores?: Record<string, number>;
  explanation?: string;
}

export interface FiredSignal {
  id: SignalId;
  label: string;
  taxTypeScores: Partial<Record<TaxType, number>>;
  scenarioScores?: Record<string, number>;
}
