// Ebene 2b — Synonym-Normalisierung.
// Bildet unterschiedliche Formulierungen auf einheitliche Fakten ab.

import type { Facts } from "../facts/factModel";

export function normalizeFacts(f: Facts): Facts {
  const t = f.raw.lower;

  // "erste Arbeitsstätte" == "erste Tätigkeitsstätte"
  if (f.firstPlaceOfWork !== true && /erste[nrs]?\s+arbeitsst(ä|ae)tte/i.test(t)) {
    f.firstPlaceOfWork = true;
  }

  // "eigener Pkw" == "privater Pkw"
  if (f.privateCar !== true && /eigenen?\s*(pkw|auto|kfz|fahrzeug)/i.test(t)) {
    f.privateCar = true;
  }

  return f;
}
