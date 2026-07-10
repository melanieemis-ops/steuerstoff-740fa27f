// Zentrales Modul-Register.
// Neue Steuerarten werden durch Hinzufügen einer *.module.ts Datei und einer
// Zeile in dieser Datei registriert — der Router selbst muss nie angepasst werden.

import incomeTax from "./incomeTax.module";
import balanceSheet from "./balanceSheet.module";
import corporateTax from "./corporateTax.module";
import abgabenordnung from "./abgabenordnung.module";
import gewerbesteuer from "./gewerbesteuer.module";
import lohnsteuer from "./lohnsteuer.module";
import internationalTax from "./internationalTax.module";
import nonProfit from "./nonProfit.module";
import inheritanceTax from "./inheritanceTax.module";
import type { RuleModule } from "./types";

export const ALL_MODULES: RuleModule[] = [
  incomeTax,
  balanceSheet,
  corporateTax,
  abgabenordnung,
  gewerbesteuer,
  lohnsteuer,
  internationalTax,
  nonProfit,
  inheritanceTax,
];
