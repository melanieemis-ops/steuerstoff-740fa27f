import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateKfz,
  distanceAllowancePerDay,
  parseDe,
  type CostRow,
  type Vehicle,
} from "../src/lib/kfzWertabgabe.ts";

function closeTo(actual: number | null, expected: number, message?: string) {
  assert.notEqual(actual, null, message);
  assert.ok(Math.abs((actual ?? 0) - expected) < 0.000001, message ?? `${actual} ≠ ${expected}`);
}

function costs(totalNet: string, withoutVat: string): CostRow[] {
  return [{ key: "test", label: "Testkosten", totalNet, withoutVat }];
}

function vehicle(patch: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "test",
    bez: "Testfahrzeug",
    kennz: "",
    fuehrer: "",
    anschaffung: "",
    yearInput: "2026",
    blpInput: "45.850",
    monateInput: "12",
    distanceInput: "20",
    workdaysInput: "220",
    vatPrivateShareInput: "50",
    nachweis: "ja",
    costs: costs("12.000", "2.000"),
    ...patch,
  };
}

test("deutsche Zahlenformate werden korrekt gelesen", () => {
  assert.equal(parseDe("45.850"), 45_850);
  assert.equal(parseDe("45.850,75"), 45_850.75);
  assert.equal(parseDe("45850,75"), 45_850.75);
  assert.equal(parseDe("45850.75"), 45_850.75);
});

test("Entfernungspauschale berücksichtigt die Rechtsstände 2025 und 2026", () => {
  closeTo(distanceAllowancePerDay(2025, 20), 6);
  closeTo(distanceAllowancePerDay(2025, 25), 7.9);
  closeTo(distanceAllowancePerDay(2026, 20), 7.6);
  closeTo(distanceAllowancePerDay(2026, 25), 9.5);
});

test("Testbeispiel 2026 ergibt die korrigierten Werte", () => {
  const result = calculateKfz(vehicle());

  assert.equal(result.roundedListPrice, 45_800);
  closeTo(result.onePercentValue, 5_496);
  closeTo(result.vatBaseBeforeCap, 4_396.8);
  closeTo(result.vatBeforeCap, 835.392);
  closeTo(result.commuteValue, 3_297.6);
  closeTo(result.nonDeductibleCommuteExpense, 1_672);
  closeTo(result.commuteCorrection, 1_625.6);
  assert.equal(result.costCapApplies, false);
  closeTo(result.vatBase8921, 4_396.8);
  closeTo(result.amount8924, 2_724.8);
  closeTo(result.totalAfterCap, 7_956.992);
});

test("Kostendeckelung löst eine eigenständige USt-Schätzung aus", () => {
  const result = calculateKfz(
    vehicle({
      blpInput: "100.000",
      distanceInput: "0",
      workdaysInput: "0",
      costs: costs("6.000", "2.000"),
    }),
  );

  closeTo(result.pauschalIncomeTaxValues, 12_000);
  assert.equal(result.costCapApplies, true);
  closeTo(result.incomeTaxValuesAfterCap, 6_000);
  closeTo(result.incomeTaxCorrectionAfterCap, 6_000);
  closeTo(result.vatBaseByEstimate, 2_000);
  closeTo(result.vatDue, 380);
  closeTo(result.amount8924, 4_000);
  closeTo(result.totalAfterCap, 6_380);
});

test("ohne Kostendeckelung bleibt die 80-%-BMG trotz niedriger Vorsteuerkosten bestehen", () => {
  const result = calculateKfz(
    vehicle({
      blpInput: "100.000",
      distanceInput: "0",
      workdaysInput: "0",
      costs: costs("20.000", "19.000"),
    }),
  );

  assert.equal(result.costCapApplies, false);
  closeTo(result.vatVehicleCostsNet, 1_000);
  closeTo(result.vatBase8921, 9_600);
});
