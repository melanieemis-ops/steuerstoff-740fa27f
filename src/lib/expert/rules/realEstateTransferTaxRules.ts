import type { RuleFile } from "../types";

export const realEstateTransferTaxRules: RuleFile = {
  taxType: "grunderwerbsteuer",
  scenarios: [],
  decide: () => ({
    taxType: "grunderwerbsteuer",
    scenario: null,
    subCase: null,
    schemaId: "grest.basis",
    schemaSteps: [
      { id: "erwerbsvorgang", label: "Erwerbsvorgang (§ 1 GrEStG)" },
      { id: "bmg", label: "Bemessungsgrundlage (§ 8, § 9 GrEStG)" },
      { id: "steuersatz", label: "Steuersatz (§ 11 GrEStG, Landesrecht)" },
      { id: "befreiungen", label: "Befreiungen (§§ 3–7 GrEStG)" },
    ],
    normen: ["§ 1 GrEStG", "§ 8 GrEStG", "§ 11 GrEStG"],
    ergebnis: "Grunderwerbsteuer — Erwerbsvorgang × Landessteuersatz.",
  }),
};
