import { runKbRegression } from "./src/lib/regressionRunner.ts";
const r = runKbRegression();
const fails = r.results.filter(x => x.softFail || x.hardFail);
console.log(JSON.stringify({total:r.total, hard:r.hardFails, soft:r.softFails, fails}, null, 2));
