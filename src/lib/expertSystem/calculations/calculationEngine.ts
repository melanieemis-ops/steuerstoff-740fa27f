import type { Facts } from "../facts/factModel";
import {
  calculateCommutingAllowance,
  calculateHomeOfficeAllowance,
  type CommutingAllowanceResult,
  type HomeOfficeResult,
} from "./incomeTaxCalculations";
import { reportProvisionAmount, type ProvisionReport } from "./balanceSheetCalculations";

export type CalculationOutput =
  | { id: "calculateCommutingAllowance"; result: CommutingAllowanceResult }
  | { id: "calculateHomeOfficeAllowance"; result: HomeOfficeResult }
  | { id: "reportProvisionAmount"; result: ProvisionReport }
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
  if (id === "calculateHomeOfficeAllowance") {
    const days = facts.homeOfficeDays ?? facts.workDays;
    if (days === undefined) return { id: "missingInputs", missing: ["Anzahl der Homeoffice-Tage"] };
    return { id: "calculateHomeOfficeAllowance", result: calculateHomeOfficeAllowance(days) };
  }
  if (id === "reportProvisionAmount") {
    if (facts.provisionAmount === undefined) {
      return { id: "missingInputs", missing: ["voraussichtliche Höhe der Rückstellung in €"] };
    }
    return { id: "reportProvisionAmount", result: reportProvisionAmount(facts.provisionAmount) };
  }
  return null;
}
