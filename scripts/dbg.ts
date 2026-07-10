import { runExpertSystem } from "../src/lib/expertSystem/pipeline";
const cases = [
  "Ein Gesellschafter mit 20 % GmbH-Anteilen zieht in die Schweiz. Wegzugsbesteuerung nach § 6 AStG?",
  "Ein Arbeitnehmer erhält einen Firmenwagen mit Bruttolistenpreis 40.000 €. Wie ist die 1-%-Regelung anzuwenden?",
];
for (const p of cases) {
  const r = runExpertSystem(p);
  console.log("===", p);
  console.log("winner:", r.trace.taxRoute?.primary);
  console.log("summary:", r.answer?.summary);
  console.log("sections:", r.answer?.sections?.map(s => s.title + ": " + s.body.slice(0,100)));
  console.log("scores:", r.trace.moduleScores);
}
