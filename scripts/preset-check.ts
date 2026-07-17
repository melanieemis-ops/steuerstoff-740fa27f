import {
  buildStandardEvents,
  DEFAULT_PRESET_SETTINGS,
  computeHolidays,
} from "@/lib/calendar-standard-events";
import { overdueOccurrences } from "@/lib/calendar-utils";

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok  :", msg);
  }
}

const hByDates = new Set(computeHolidays(2026, "BY").map((h) => h.date));
for (const d of ["2026-01-06", "2026-04-03", "2026-04-06", "2026-06-04", "2026-11-01"]) {
  assert(hByDates.has(d), `BY 2026 enthält ${d}`);
}
assert(!hByDates.has("2026-08-15"), "BY 2026 NICHT pauschal 2026-08-15");
assert(!hByDates.has("2026-08-08"), "BY 2026 NICHT 2026-08-08");

const evts = buildStandardEvents(DEFAULT_PRESET_SETTINGS);
const byKey = new Map(evts.map((e) => [e.presetKey, e]));

assert(byKey.get("filing:vz2024:beraten")?.startDate === "2026-04-30",
  "Steuererklärung 2024 beraten = 2026-04-30");
assert(byKey.get("filing:vz2025:unberaten")?.startDate === "2026-07-31",
  "Steuererklärung 2025 unberaten = 2026-07-31");
assert(byKey.get("filing:vz2025:beraten")?.startDate === "2027-03-01",
  "Steuererklärung 2025 beraten = 2027-03-01");

const gewst2027 = byKey.get("gewst-vz:2027-08");
assert(gewst2027?.startDate === "2027-08-16",
  `GewSt-VZ 15.08.2027 (So.) → 2027-08-16 (Mo.), got ${gewst2027?.startDate}`);

const past = overdueOccurrences(evts);
assert(past.length === 0, `overdueOccurrences ignoriert Presets (got ${past.length})`);

console.log(`\nGeneriert: ${evts.length} Preset-Termine`);
