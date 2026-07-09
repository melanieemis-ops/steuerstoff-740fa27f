import { KNOWLEDGE_BASE } from "./src/lib/knowledgeBase.ts";
import { buildPromptForEntry } from "./src/lib/regressionRunner.ts";
const ids = ["ust-vollzuordnung-gebaeude","reverse-charge-grundschema"];
for (const id of ids) {
  const e = KNOWLEDGE_BASE.find(x=>x.id===id);
  const p = buildPromptForEntry(e);
  console.log("===", id);
  console.log(p);
  console.log("---");
  console.log("has 'grundst':", /\bgrundst/i.test(p));
  console.log("full grundstueck regex hit:", /\b(grundst|immobilie|gebäude|gebaeude|wohnung|bauleistung|bauträger|bautraeger|zwischenvermietung|vermietung|sportanlage|betriebsvorrichtung|tennishalle)\b/i.test(p));
}
