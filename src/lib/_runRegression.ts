import { runKbRegression } from "./regressionRunner";
const r = runKbRegression({ verbose: false });
console.log(JSON.stringify({ total: r.total, passed: r.passed, hardFails: r.hardFails, softFails: r.softFails }));
console.log("hardFails:");
for (const x of r.results.filter(x=>x.hardFail)) {
  console.log(" -", x.id, "exp=", x.expectedScenario, "got=", x.actualScenario, "reasons=", x.reasons.join(" | "));
}
