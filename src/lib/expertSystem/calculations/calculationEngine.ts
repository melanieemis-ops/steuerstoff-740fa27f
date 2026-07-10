import type { Facts } from "../facts/factModel";
import { calculateCommutingAllowance, type CommutingAllowanceResult } from "./incomeTaxCalculations";

export type CalculationOutput =
  | { id: "calculateCommutingAllowance"; result: CommutingAllowanceResult }
  | { id: "missingInputs"; missing: string[] };

export function runCalculation(id: string, facts: Facts): CalculationOutput | null {
  if (id === "calculateCommutingAllowance") {
    if (facts.oneWayDistanceKm === undefined || facts.workDays === undefined) {
      const missing: string[] = [];
      if (facts.oneWayDistanceKm === undefined) missing.push("einfache Entfernung in km");
      if (facts.workDays === undefined) missing.push("Anzahl der Arbeitstage");
      return { id: "missingInputs", missing };
    }
    return {
      id: "calculateCommutingAllowance",
      result: calculateCommutingAllowance({
        oneWayDistanceKm: facts.oneWayDistanceKm,
        workDays: facts.workDays,
      }),
    };
  }
  return null;
}
