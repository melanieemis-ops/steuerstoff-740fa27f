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
// Struktur ist bewusst identisch zu KBEntry, damit der bestehende
// Scoring-/Filter-Code wiederverwendet werden kann.

import type { KBEntry } from "@/lib/knowledgeBase";
import { estg001Steuerpflicht } from "./laws/estg/estg-001-steuerpflicht";
import { estg002Einkunftsarten } from "./laws/estg/estg-002-einkunftsarten";
export const INTERNAL_KNOWLEDGE_BASE: KBEntry[] = [
  estg001Steuerpflicht,
];
export const INTERNAL_KNOWLEDGE_BASE: KBEntry[] = [
  estg001Steuerpflicht,
  estg002Einkunftsarten,
];
