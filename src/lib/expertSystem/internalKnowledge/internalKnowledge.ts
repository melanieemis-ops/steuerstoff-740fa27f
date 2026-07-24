// Interne Wissensdatenbank — NICHT öffentlich sichtbar.
// Diese Datenbank wird ausschließlich vom Chat/Expertensystem durchsucht.
// Sie darf niemals in der Wissensdatenbank-UI oder Navigation gerendert werden.
//
// Inhalt (wird schrittweise ausgebaut):
//   - Gesetze (EStG, UStG, KStG, AO, GewStG, ErbStG …)
//   - Verwaltungsanweisungen (AEAO, UStAE, EStR, KStR)
//   - BMF-Schreiben
//   - Rechtsprechung (BFH, EuGH)
//   - Kanzleistandards, DATEV-Praxiswissen
//
// AUTOMATISCH GEPFLEGT: Der Gesetzes-Importer (Seite /gesetz-importieren)
// ergänzt Imports und Einträge zwischen den GENERATED-Markern alphabetisch.

import type { KBEntry } from "@/lib/knowledgeBase";
import { anschaffungskostenHgbEstg } from "./practice/anschaffungskosten-hgb-estg";
// GENERATED-IMPORTS-START
import { estg001Steuerpflicht } from "./laws/estg/estg-001-steuerpflicht";
import { estg002Einkunftsarten } from "./laws/estg/estg-002-einkunftsarten";
// GENERATED-IMPORTS-END

export const INTERNAL_KNOWLEDGE_BASE: KBEntry[] = [
  anschaffungskostenHgbEstg,
  // GENERATED-ENTRIES-START
  estg001Steuerpflicht,
  estg002Einkunftsarten,
  // GENERATED-ENTRIES-END
];
