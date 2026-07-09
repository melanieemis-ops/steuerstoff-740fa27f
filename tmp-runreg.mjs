import { runKbRegression } from "./src/lib/regressionRunner.ts";
const r = runKbRegression();
console.log("total",r.total,"hard",r.hardFails,"soft",r.softFails,"passed",r.passed);
for (const x of r.results.filter(x=>x.softFail||x.hardFail)) console.log("-",x.hardFail?"HARD":"soft",x.id,"| exp=",x.expectedScenario,"act=",x.actualScenario);
