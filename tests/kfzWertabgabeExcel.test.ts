import assert from "node:assert/strict";
import test from "node:test";
import type { CostRow, Vehicle } from "../src/lib/kfzWertabgabe.ts";
import { createKfzWorkpaper, getKfzWorkpaperErrors } from "../src/lib/kfzWertabgabeExcel.ts";

const EURO_FORMAT = "#,##0.00 [$€-407]";

function closeTo(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} ≠ ${expected}`);
}

function costs(): CostRow[] {
  return [
    { key: "afa", label: "Abschreibungen (Steuerrecht)", totalNet: "2.000", withoutVat: "2.000" },
    { key: "leasing", label: "Leasingzahlungen", totalNet: "", withoutVat: "" },
    { key: "miete", label: "Mietzahlungen", totalNet: "", withoutVat: "" },
    {
      key: "leasingsonderzahlung",
      label: "Leasingsonderzahlungen",
      totalNet: "",
      withoutVat: "",
    },
    { key: "zinsen", label: "Schuldzinsen", totalNet: "", withoutVat: "" },
    { key: "kfzst", label: "Kfz-Steuer", totalNet: "", withoutVat: "" },
    { key: "vers", label: "Kfz-Versicherung", totalNet: "", withoutVat: "" },
    { key: "kraft", label: "Kraftstoff", totalNet: "10.000", withoutVat: "0" },
    { key: "ladestrom", label: "Ladestrom", totalNet: "", withoutVat: "" },
    { key: "pflege", label: "Wagenpflege", totalNet: "", withoutVat: "" },
    { key: "oel", label: "Öl", totalNet: "", withoutVat: "" },
    { key: "rep", label: "Reparaturen", totalNet: "", withoutVat: "" },
    { key: "wartung", label: "Wartungen", totalNet: "", withoutVat: "" },
    { key: "verse", label: "Versicherungsentschädigungen (-)", totalNet: "", withoutVat: "" },
    { key: "garage", label: "Garagenmiete", totalNet: "", withoutVat: "" },
    { key: "sonst", label: "Sonstige Kosten", totalNet: "", withoutVat: "" },
  ];
}

function vehicle(patch: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "test",
    bez: "Testfahrzeug",
    kennz: "B-AB 1234",
    fuehrer: "Max Mustermann",
    anschaffung: "01.01.2026",
    yearInput: "2026",
    blpInput: "45.850",
    monateInput: "12",
    distanceInput: "20",
    workdaysInput: "220",
    vatPrivateShareInput: "50",
    nachweis: "ja",
    costs: costs(),
    ...patch,
  };
}

async function readWorkbook(bytes: ArrayBuffer) {
  const module = await import("xlsx");
  const XLSX = ("utils" in module ? module : module.default) as typeof import("xlsx");
  return XLSX.read(bytes, {
    type: "array",
    cellDates: true,
    cellFormula: true,
    cellNF: true,
  });
}

test("vollständige Eingaben erzeugen ein prüfbares Excel-Arbeitspapier", async () => {
  const input = vehicle();
  assert.deepEqual(getKfzWorkpaperErrors([input]), []);

  const file = await createKfzWorkpaper([input]);
  const workbook = await readWorkbook(file.bytes);
  const overview = workbook.Sheets["Übersicht"];
  const detail = workbook.Sheets["Fahrzeug 1"];

  assert.equal(file.fileName, "kfz-wertabgabe-arbeitspapier-2026.xlsx");
  assert.deepEqual(workbook.SheetNames, ["Übersicht", "Fahrzeug 1"]);
  assert.ok(overview);
  assert.ok(detail);
  assert.equal(detail.B14.f, "ROUNDDOWN(B13/100,0)*100");
  assert.equal(detail.B14.v, 45_800);
  assert.equal(detail.B19.f, "ROUNDDOWN((B13*B16)/100,0)*100");
  assert.equal(detail.B19.v, 45_800);
  assert.equal(detail.B20.f, "B14");
  assert.equal(detail.B20.v, 45_800);
  assert.equal(detail.B38.v, 1_672);
  closeTo(detail.B39.v, 1_625.6);
  closeTo(detail.B77.v, 4_396.8);
  closeTo(detail.B82.v, 7_956.992);
  assert.equal(detail.B82.z, EURO_FORMAT);
  assert.equal(overview.K6.f, "'Fahrzeug 1'!B82");
  closeTo(overview.K6.v, 7_956.992);
});

test("Excel trennt bei einem Elektrofahrzeug ertrag- und umsatzsteuerlichen BLP", async () => {
  const input = vehicle({
    vehicleType: "electric",
    blpInput: "80.000",
    co2Input: "0",
  });
  assert.deepEqual(getKfzWorkpaperErrors([input]), []);

  const file = await createKfzWorkpaper([input]);
  const workbook = await readWorkbook(file.bytes);
  const overview = workbook.Sheets["Übersicht"];
  const detail = workbook.Sheets["Fahrzeug 1"];

  assert.equal(detail.B15.v, "25-%-Ansatz");
  assert.equal(detail.B16.v, 0.25);
  assert.equal(detail.B19.f, "ROUNDDOWN((B13*B16)/100,0)*100");
  assert.equal(detail.B19.v, 20_000);
  assert.equal(detail.B20.f, "B14");
  assert.equal(detail.B20.v, 80_000);
  assert.equal(detail.B70.f, "B69*1%*B21");
  assert.equal(detail.B70.v, 9_600);
  assert.equal(detail.B77.v, 7_680);
  assert.equal(overview.E6.v, 20_000);
  assert.equal(overview.F6.v, 80_000);
});

test("unvollständige Eingaben blockieren den Excel-Export", async () => {
  const input = vehicle({
    blpInput: "",
    costs: costs().map((cost) => ({ ...cost, totalNet: "", withoutVat: "" })),
  });
  const errors = getKfzWorkpaperErrors([input]);

  assert.ok(errors.some((error) => error.includes("Bruttolistenpreis")));
  assert.ok(errors.some((error) => error.includes("Gesamtfahrzeugkosten")));
  await assert.rejects(() => createKfzWorkpaper([input]), /Bruttolistenpreis/);
});
