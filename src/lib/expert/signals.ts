// Ebene 2 — Signal Engine.
// Signale bewerten die Facts. Keine Steuerart-Entscheidung — nur Gewichte.

import type { Facts, FiredSignal, SignalDef } from "./types";

export const SIGNAL_DEFS: SignalDef[] = [
  // ── Umsatzsteuer ────────────────────────────────────────────────────────
  {
    id: "ust.ig_erwerb",
    description: "Innergemeinschaftlicher Erwerb (Ware, EU→DE, Unternehmer)",
    requires: (f) => !!(f.steuerFakten.lieferung && (f.orte.ausEU || f.orte.nachDE) && f.entities.unternehmerDE),
    excludes: (f) => !!(f.steuerFakten.grundstueck || (f.steuerFakten.dienstleistung && !f.steuerFakten.werklieferung)),
    weight: { umsatzsteuer: 12 },
    scenarios: ["innergemeinschaftlicher_erwerb"],
  },
  {
    id: "ust.ig_lieferung",
    description: "Innergemeinschaftliche Lieferung (Ware, DE→EU, Unternehmer)",
    requires: (f) => !!(f.steuerFakten.lieferung && (f.orte.ausDE || f.orte.nachEU) && f.steuerFakten.ustId),
    excludes: (f) => !!f.steuerFakten.grundstueck,
    weight: { umsatzsteuer: 12 },
    scenarios: ["innergemeinschaftliche_lieferung"],
  },
  {
    id: "ust.reverse_charge",
    description: "Reverse Charge (§ 13b UStG, EU-Leister an DE-Unternehmer)",
    requires: (f) => !!(f.steuerFakten.reverseCharge || (f.entities.unternehmerEU && f.entities.unternehmerDE && (f.steuerFakten.dienstleistung || f.steuerFakten.werkleistung))),
    weight: { umsatzsteuer: 11 },
    scenarios: ["reverse_charge"],
  },
  {
    id: "ust.werklieferung",
    description: "Werklieferung (§ 3 Abs. 4 UStG)",
    requires: (f) => !!f.steuerFakten.werklieferung,
    weight: { umsatzsteuer: 9 },
    scenarios: ["werklieferung"],
  },
  {
    id: "ust.werkleistung",
    description: "Werkleistung (§ 3 Abs. 9 UStG)",
    requires: (f) => !!f.steuerFakten.werkleistung,
    weight: { umsatzsteuer: 9 },
    scenarios: ["werkleistung"],
  },
  {
    id: "ust.ausfuhr",
    description: "Ausfuhrlieferung (§ 6 UStG, DE→Drittland)",
    requires: (f) => !!(f.steuerFakten.lieferung && (f.orte.nachDrittland || f.entities.unternehmerDrittland)),
    weight: { umsatzsteuer: 10 },
    scenarios: ["ausfuhrlieferung"],
  },
  {
    id: "ust.einfuhr",
    description: "Einfuhr (§ 1 Abs. 1 Nr. 4 UStG, Drittland→DE)",
    requires: (f) => !!(f.steuerFakten.lieferung && f.orte.ausDrittland),
    weight: { umsatzsteuer: 10 },
    scenarios: ["einfuhr"],
  },
  {
    id: "ust.grundstueck",
    description: "Grundstücksleistung (§ 3a Abs. 3 Nr. 1 UStG)",
    requires: (f) => !!(f.steuerFakten.grundstueck && (f.steuerFakten.dienstleistung || f.steuerFakten.werkleistung || f.steuerFakten.werklieferung)),
    weight: { umsatzsteuer: 8 },
  },

  // ── Einkommensteuer ─────────────────────────────────────────────────────
  {
    id: "est.werbungskosten",
    description: "Werbungskosten (§ 9 EStG)",
    requires: (f) => !!(f.entities.arbeitnehmer && /\b(werbungskosten|entfernungspauschal|pendlerpauschal|arbeitszimmer|fortbildung|reisekosten)\b/i.test(f.raw.lower)),
    weight: { einkommensteuer: 12, lohnsteuer: 3 },
  },
  {
    id: "est.35a",
    description: "Haushaltsnahe / Handwerkerleistungen (§ 35a EStG)",
    requires: (f) => /\b(§\s*35a|haushaltsnah|handwerkerleistung)\b/i.test(f.raw.lower),
    weight: { einkommensteuer: 12 },
  },
  {
    id: "est.vuv",
    description: "Vermietung und Verpachtung (§ 21 EStG)",
    requires: (f) => !!f.steuerFakten.vermietung,
    weight: { einkommensteuer: 10 },
  },
  {
    id: "est.kapital",
    description: "Kapitalvermögen (§ 20 EStG)",
    requires: (f) => /\b(kapitalertr(ä|ae)ge|abgeltungsteuer|dividende|zinsen|§\s*20\s*estg?)\b/i.test(f.raw.lower),
    weight: { einkommensteuer: 10 },
  },
  {
    id: "est.veraeusserung",
    description: "Private Veräußerungsgeschäfte (§ 23 EStG)",
    requires: (f) => !!(f.steuerFakten.veraeusserung && f.steuerFakten.privatvermoegen) || /\b§\s*23\s*estg?\b/i.test(f.raw.lower),
    weight: { einkommensteuer: 9 },
  },

  // ── Lohnsteuer ──────────────────────────────────────────────────────────
  {
    id: "lst.geldwerter_vorteil",
    description: "Geldwerter Vorteil / Sachbezug",
    requires: (f) => /\b(geldwerter\s+vorteil|dienstwagen|sachbezug|lohnsteueranmeldung)\b/i.test(f.raw.lower),
    weight: { lohnsteuer: 12, einkommensteuer: 4 },
  },

  // ── Körperschaftsteuer ──────────────────────────────────────────────────
  {
    id: "kst.vga",
    description: "Verdeckte Gewinnausschüttung",
    requires: (f) => /\b(vga\b|verdeckte\s+gewinnaussch(ü|ue)ttung|organschaft|§\s*8[a-z]?\s*kstg?)\b/i.test(f.raw.lower),
    weight: { koerperschaftsteuer: 12, bilanzsteuerrecht: 5 },
  },

  // ── Gewerbesteuer ───────────────────────────────────────────────────────
  {
    id: "gewst.hinzurechnung",
    description: "GewSt Hinzurechnungen / Kürzungen",
    requires: (f) => /\b(gewerbesteuer|gewst|hinzurechnung|k(ü|ue)rzung|hebesatz)\b/i.test(f.raw.lower),
    weight: { gewerbesteuer: 12 },
  },

  // ── Bilanzsteuerrecht ───────────────────────────────────────────────────
  {
    id: "bilanz.rueckstellung",
    description: "Rückstellungsbildung / -bewertung",
    requires: (f) => !!f.steuerFakten.rueckstellung,
    weight: { bilanzsteuerrecht: 12 },
  },
  {
    id: "bilanz.afa",
    description: "AfA / Abschreibung",
    requires: (f) => !!f.steuerFakten.afa,
    weight: { bilanzsteuerrecht: 8, einkommensteuer: 4 },
  },
  {
    id: "bilanz.rap",
    description: "Rechnungsabgrenzungsposten",
    requires: (f) => /\b(rap\b|rechnungsabgrenz)\b/i.test(f.raw.lower),
    weight: { bilanzsteuerrecht: 10 },
  },

  // ── Abgabenordnung ──────────────────────────────────────────────────────
  {
    id: "ao.einspruch",
    description: "Einspruchsverfahren (§§ 347 ff. AO)",
    requires: (f) => !!f.steuerFakten.einspruch,
    weight: { abgabenordnung: 12 },
  },
  {
    id: "ao.verjaehrung",
    description: "Festsetzungs-/Zahlungsverjährung",
    requires: (f) => /\b(festsetzungsverj(ä|ae)hrung|zahlungsverj(ä|ae)hrung|§\s*(169|170|228)\s*ao\b)/i.test(f.raw.lower),
    weight: { abgabenordnung: 12 },
  },
  {
    id: "ao.aenderung",
    description: "Änderungsnormen (§§ 172–175 AO)",
    requires: (f) => /\b§\s*(172|173|174|175)\s*ao\b/i.test(f.raw.lower),
    weight: { abgabenordnung: 12 },
  },

  // ── Gemeinnützigkeit ────────────────────────────────────────────────────
  {
    id: "npo.gemeinnuetzig",
    description: "Gemeinnützigkeit (§§ 51–68 AO)",
    requires: (f) => !!(f.entities.verein || f.entities.stiftung) || /\b(gemeinn(ü|ue)tzig|zweckbetrieb|mittelverwendung|zweckbet|verm(ö|oe)gensverwaltung)\b/i.test(f.raw.lower),
    weight: { gemeinnuetzigkeit: 12 },
  },

  // ── Erbschaft / Schenkung ───────────────────────────────────────────────
  {
    id: "erbst.erbfall",
    description: "Erbfall / Nachlass",
    requires: (f) => !!f.steuerFakten.erbfall,
    weight: { erbschaftsteuer: 12 },
  },
  {
    id: "schenkst.schenkung",
    description: "Schenkung / unentgeltliche Zuwendung",
    requires: (f) => !!f.steuerFakten.schenkung,
    weight: { schenkungsteuer: 12 },
  },

  // ── Grunderwerbsteuer ───────────────────────────────────────────────────
  {
    id: "grest.kauf",
    description: "Grundstückskauf / Share Deal",
    requires: (f) => !!(f.steuerFakten.grundstueck && f.steuerFakten.veraeusserung) || /\b(grunderwerbsteuer|grest|share\s*deal|asset\s*deal)\b/i.test(f.raw.lower),
    weight: { grunderwerbsteuer: 12 },
  },

  // ── Umwandlung ──────────────────────────────────────────────────────────
  {
    id: "umw.umwandlung",
    description: "Verschmelzung / Spaltung / Einbringung",
    requires: (f) => /\b(umwandlung|umwstg|verschmelzung|spaltung|einbringung|formwechsel|§\s*(20|24|3|4|11|13|15|21|22)\s*umwstg?)\b/i.test(f.raw.lower),
    weight: { umwandlungssteuer: 12 },
  },

  // ── Internationales ─────────────────────────────────────────────────────
  {
    id: "int.dba",
    description: "DBA / Verrechnungspreise / Betriebsstätte",
    requires: (f) => /\b(dba|doppelbesteuerung|verrechnungspreis|betriebsst(ä|ae)tte|astg|au(ß|ss)ensteuergesetz|hinzurechnungsbesteuerung|quellensteuer|beps)\b/i.test(f.raw.lower),
    weight: { internationales_steuerrecht: 12 },
  },
];

export function evaluateSignals(f: Facts): FiredSignal[] {
  const fired: FiredSignal[] = [];
  for (const s of SIGNAL_DEFS) {
    if (!s.requires(f)) continue;
    if (s.excludes && s.excludes(f)) continue;
    fired.push({
      id: s.id,
      description: s.description,
      weight: s.weight,
      scenarios: s.scenarios,
      subCases: s.subCases,
    });
  }
  return fired;
}
