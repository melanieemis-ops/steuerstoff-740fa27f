import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateKfz,
  determineElectricVehicleBenefit,
  distanceAllowancePerDay,
  getKfzCalculationErrors,
  parseDe,
  roundListPrice,
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
    anschaffung: "01.01.2026",
    firstRegistration: "01.01.2026",
    yearInput: "2026",
    blpInput: "45.850",
    monateInput: "12",
    distanceInput: "20",
    workdaysInput: "220",
    vatPrivateShareInput: "50",
    vatEvidence: "nein",
    vehicleType: "combustion",
    co2Input: "",
    electricRangeInput: "",
    batteryCapacityInput: "",
    vehicleCode: "",
    classificationNote: "",
    nachweis: "ja",
    costs: costs("12.000", "2.000"),
    ...patch,
  };
}

function assertFiniteCalculation(value: unknown) {
  if (typeof value === "number")
    assert.ok(Number.isFinite(value), `Nicht endlicher Rechenwert: ${value}`);
  if (Array.isArray(value)) value.forEach(assertFiniteCalculation);
  if (value && typeof value === "object")
    Object.values(value as Record<string, unknown>).forEach(assertFiniteCalculation);
}

test("deutsche Zahlenformate werden korrekt gelesen", () => {
  assert.equal(parseDe("45.850"), 45_850);
  assert.equal(parseDe("45.850,75"), 45_850.75);
  assert.equal(parseDe("45850,75"), 45_850.75);
  assert.equal(parseDe("45850.75"), 45_850.75);
  assert.equal(parseDe(""), null);
});

test("Listenpreise werden zentral auf volle 100 Euro abgerundet", () => {
  assert.equal(roundListPrice(79_990), 79_900);
  assert.equal(roundListPrice(19_997.5), 19_900);
  assert.equal(roundListPrice(null), null);
});

test("Entfernungspauschale berücksichtigt die Rechtsstände 2023, 2025 und 2026", () => {
  closeTo(distanceAllowancePerDay(2023, 25), 7.75);
  closeTo(distanceAllowancePerDay(2025, 25), 7.9);
  closeTo(distanceAllowancePerDay(2026, 20), 7.6);
  closeTo(distanceAllowancePerDay(2026, 25), 9.5);
});

test("bestehendes Verbrenner-Testbeispiel bleibt unverändert korrekt", () => {
  const result = calculateKfz(vehicle());

  assert.equal(result.originalRoundedListPrice, 45_800);
  assert.equal(result.incomeTaxRelevantListPrice, 45_800);
  assert.equal(result.vatRelevantListPrice, 45_800);
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

test("reines Elektrofahrzeug 2026 bis 100.000 Euro erhält den Viertelansatz", () => {
  const result = calculateKfz(
    vehicle({ vehicleType: "electric", blpInput: "80.000", co2Input: "0" }),
  );

  assert.equal(result.electricBenefit.benefitType, "quarter");
  assert.equal(result.electricBenefit.taxableListPriceFactor, 0.25);
  assert.equal(result.incomeTaxRelevantListPrice, 20_000);
  assert.equal(result.vatRelevantListPrice, 80_000);
});

test("reines Elektrofahrzeug 2026 über 100.000 Euro erhält nachrangig den Halbansatz", () => {
  const result = calculateKfz(
    vehicle({ vehicleType: "electric", blpInput: "120.000", co2Input: "0" }),
  );

  assert.equal(result.electricBenefit.benefitType, "half");
  assert.equal(result.incomeTaxRelevantListPrice, 60_000);
  assert.equal(result.vatRelevantListPrice, 120_000);
  assert.match(result.electricBenefit.explanation, /überschreitet.*100\.000/);
});

test("100.000-Euro-Grenze gilt erst für Anschaffungen nach dem 30.06.2025", () => {
  const before = calculateKfz(
    vehicle({
      vehicleType: "electric",
      anschaffung: "30.06.2025",
      firstRegistration: "30.06.2025",
      blpInput: "80.000",
      co2Input: "0",
    }),
  );
  const after = calculateKfz(
    vehicle({
      vehicleType: "electric",
      anschaffung: "01.07.2025",
      firstRegistration: "01.07.2025",
      blpInput: "80.000",
      co2Input: "0",
    }),
  );

  assert.equal(before.electricBenefit.benefitType, "half");
  assert.equal(after.electricBenefit.benefitType, "quarter");
});

test("Plug-in-Hybrid 2026 erhält den Halbansatz über das CO₂-Kriterium", () => {
  const benefit = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      co2Input: "45",
      electricRangeInput: "50",
      blpInput: "60.000",
    }),
  );
  assert.equal(benefit.benefitType, "half");
  assert.match(benefit.explanation, /CO₂-Kriterium/);
});

test("Plug-in-Hybrid 2026 erhält den Halbansatz über 80 km Reichweite", () => {
  const benefit = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      co2Input: "60",
      electricRangeInput: "85",
      blpInput: "60.000",
    }),
  );
  assert.equal(benefit.benefitType, "half");
  assert.match(benefit.explanation, /80 km/);
});

test("Plug-in-Hybrid 2026 ohne erfülltes Kriterium erhält keine Begünstigung", () => {
  const benefit = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      co2Input: "60",
      electricRangeInput: "70",
      blpInput: "60.000",
    }),
  );
  assert.equal(benefit.benefitType, "none");
  assert.equal(benefit.taxableListPriceFactor, 1);
});

test("Plug-in-Hybrid 2023 berücksichtigt die 60-km-Grenze", () => {
  const qualifying = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      anschaffung: "01.01.2023",
      firstRegistration: "01.01.2023",
      co2Input: "60",
      electricRangeInput: "65",
    }),
  );
  const notQualifying = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      anschaffung: "01.01.2023",
      firstRegistration: "01.01.2023",
      co2Input: "60",
      electricRangeInput: "55",
    }),
  );

  assert.equal(qualifying.benefitType, "half");
  assert.equal(notQualifying.benefitType, "none");
});

test("Fahrzeug aus 2021 berücksichtigt die 40-km- und 50-g-Grenzen", () => {
  const byRange = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      anschaffung: "01.01.2021",
      firstRegistration: "01.01.2021",
      co2Input: "60",
      electricRangeInput: "40",
    }),
  );
  const byCo2 = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "plugin-hybrid",
      anschaffung: "01.01.2021",
      firstRegistration: "01.01.2021",
      co2Input: "50",
      electricRangeInput: "20",
    }),
  );
  assert.equal(byRange.benefitType, "half");
  assert.equal(byCo2.benefitType, "half");
});

test("Batterieabschlag 2018 beträgt bei 30 kWh höchstens 7.500 Euro", () => {
  const result = calculateKfz(
    vehicle({
      vehicleType: "plugin-hybrid",
      anschaffung: "01.07.2018",
      firstRegistration: "01.01.2018",
      blpInput: "45.000",
      co2Input: "80",
      electricRangeInput: "20",
      batteryCapacityInput: "30",
    }),
  );
  assert.equal(result.electricBenefit.benefitType, "battery-deduction");
  assert.equal(result.electricBenefit.batteryDeduction, 7_500);
  assert.equal(result.incomeTaxRelevantListPrice, 37_500);
});

test("Batterieabschlag wird auch bei hoher Kapazität auf den Höchstbetrag begrenzt", () => {
  const benefit = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "electric",
      anschaffung: "01.01.2018",
      firstRegistration: "01.01.2018",
      blpInput: "100.000",
      batteryCapacityInput: "100",
    }),
  );
  assert.equal(benefit.batteryDeduction, 7_500);
});

test("fehlende Batteriekapazität wird nicht als 0 kWh behandelt", () => {
  const benefit = determineElectricVehicleBenefit(
    vehicle({
      vehicleType: "electric",
      anschaffung: "01.01.2018",
      firstRegistration: "01.01.2018",
      batteryCapacityInput: "",
    }),
  );
  assert.equal(benefit.taxableListPriceFactor, null);
  assert.equal(benefit.batteryDeduction, null);
  assert.ok(benefit.warnings.some((warning) => warning.includes("Batteriekapazität")));
});

test("Umsatzsteuer übernimmt niemals Viertelung oder Halbierung", () => {
  const result = calculateKfz(
    vehicle({ vehicleType: "electric", blpInput: "80.000", co2Input: "0" }),
  );
  assert.equal(result.incomeTaxRelevantListPrice, 20_000);
  assert.equal(result.vatRelevantListPrice, 80_000);
  closeTo(result.privateUseIncomeTax, 2_400);
  closeTo(result.vatOnePercentValue, 9_600);
  closeTo(result.vatBaseBeforeCap, 7_680);
});

test("Kostendeckelung löst eine eigenständige USt-Schätzung aus", () => {
  const result = calculateKfz(
    vehicle({
      blpInput: "100.000",
      distanceInput: "0",
      workdaysInput: "0",
      costs: costs("6.000", "2.000"),
      vatEvidence: "nein",
      vatPrivateShareInput: "",
    }),
  );

  closeTo(result.pauschalIncomeTaxValues, 12_000);
  assert.equal(result.costCapApplies, true);
  closeTo(result.incomeTaxValuesAfterCap, 6_000);
  closeTo(result.incomeTaxCorrectionAfterCap, 6_000);
  assert.equal(result.vatPrivateSharePercent, 50);
  closeTo(result.vatBaseByEstimate, 2_000);
  closeTo(result.vatDueByEstimate, 380);
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

test("Kostendeckelung ist ohne positive Kosten nicht prüfbar", () => {
  const result = calculateKfz(vehicle({ costs: costs("", "") }));
  assert.equal(result.costCapApplies, null);
  assert.equal(result.incomeTaxValuesAfterCap, null);
  assert.equal(result.vatBase8921, null);
  assert.equal(result.totalAfterCap, null);
});

test("negative Differenz für Konto 8924 wird mit Warnung auf 0 Euro begrenzt", () => {
  const result = calculateKfz(
    vehicle({
      vehicleType: "electric",
      blpInput: "80.000",
      co2Input: "0",
      distanceInput: "0",
      workdaysInput: "0",
      costs: costs("30.000", "0"),
    }),
  );
  assert.ok((result.rawAmount8924 ?? 0) < 0);
  assert.equal(result.amount8924, 0);
  assert.ok(result.warnings.some((warning) => warning.includes("8924")));
});

test("es wird immer nur genau eine Elektro-/Hybridbegünstigung angewendet", () => {
  const result = calculateKfz(
    vehicle({
      vehicleType: "plugin-hybrid",
      anschaffung: "01.01.2021",
      firstRegistration: "01.01.2021",
      co2Input: "45",
      electricRangeInput: "80",
      batteryCapacityInput: "50",
    }),
  );
  assert.equal(result.electricBenefit.benefitType, "half");
  assert.equal(result.electricBenefit.batteryDeduction, 0);
});

test("Leasing/Miete und übrige Kosten werden nach Vorsteuerbelastung getrennt", () => {
  const result = calculateKfz(
    vehicle({
      costs: [
        { key: "leasing", label: "Leasing", totalNet: "1.000", withoutVat: "100" },
        { key: "miete", label: "Miete", totalNet: "500", withoutVat: "500" },
        { key: "kraft", label: "Kraftstoff", totalNet: "800", withoutVat: "50" },
      ],
    }),
  );
  closeTo(result.leasingRentalVatCostsNet, 900);
  closeTo(result.leasingRentalNonVatCosts, 600);
  closeTo(result.otherVatCostsNet, 750);
  closeTo(result.otherNonVatCosts, 50);
});

test("fehlender Anteil ohne Vorsteuer wird nicht stillschweigend als 0 behandelt", () => {
  const input = vehicle({ costs: costs("1.000", "") });
  const result = calculateKfz(input);

  assert.equal(result.costAllocations[0]?.withVat, null);
  assert.equal(result.vatVehicleCostsNet, null);
  assert.equal(result.vatBaseByEstimate, null);
  assert.ok(
    getKfzCalculationErrors(input).some((error) => error.includes("Betrag ohne Vorsteuer")),
  );
});

test("leere und ungültige Eingaben erzeugen weder NaN noch Infinity", () => {
  const result = calculateKfz(
    vehicle({
      anschaffung: "",
      firstRegistration: "",
      blpInput: "abc",
      monateInput: "0",
      distanceInput: "-1",
      workdaysInput: "-2",
      vehicleType: "plugin-hybrid",
      co2Input: "",
      electricRangeInput: "",
      costs: costs("", "100"),
    }),
  );
  assertFiniteCalculation(result);
  assert.ok(getKfzCalculationErrors(vehicle({ blpInput: "" })).length > 0);
});
