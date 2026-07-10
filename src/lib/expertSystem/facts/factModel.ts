// Ebene 3 — normalisiertes Facts-Modell.
// Fakten sind explizit true/false/unknown. Keine implizite Annahme.

export type Tri = true | false | "unknown";

export interface Facts {
  raw: { text: string; lower: string };

  // Personen
  employee: Tri;
  employer: Tri;
  businessOwner: Tri;         // Unternehmer allgemein
  shareholder: Tri;
  corporation: Tri;           // Kapitalgesellschaft
  partnership: Tri;
  association: Tri;           // Verein
  foundation: Tri;
  privatePerson: Tri;
  taxAuthority: Tri;

  // Orte / Länder
  departureCountry?: "DE" | "EU" | "DL";
  destinationCountry?: "DE" | "EU" | "DL";
  goodsMovement: Tri;

  // Zeit / Mengen
  oneWayDistanceKm?: number;
  workDays?: number;
  vz?: number;

  // Beträge
  entgelt?: number;
  kaufpreis?: number;
  lohn?: number;
  gewinn?: number;

  // Steuerlich relevante Vorgänge / Merkmale
  firstPlaceOfWork: Tri;
  privateCar: Tri;
  publicTransport: Tri;
  homeOffice: Tri;
  goodsSupplied: Tri;
  service: Tri;
  workDelivery: Tri;          // Werklieferung
  workService: Tri;           // Werkleistung
  realEstate: Tri;
  vatIdAvailable: Tri;
  invoiceWithoutVat: Tri;
  reverseChargeMentioned: Tri;
  gift: Tri;
  inheritance: Tri;
  rental: Tri;
  saleTransaction: Tri;
  provision: Tri;             // Rückstellung
  depreciation: Tri;          // AfA
  donation: Tri;
  employmentRelation: Tri;
  benefitToShareholder: Tri;  // vGA-Indiz
  disproportionateCompensation: Tri;

  // Dokumente
  invoice: Tri;

  // Explizite Fachbegriffe (starke Trigger)
  explicitTerms: string[];
}

export function emptyFacts(text: string): Facts {
  return {
    raw: { text, lower: text.toLowerCase() },
    employee: "unknown",
    employer: "unknown",
    businessOwner: "unknown",
    shareholder: "unknown",
    corporation: "unknown",
    partnership: "unknown",
    association: "unknown",
    foundation: "unknown",
    privatePerson: "unknown",
    taxAuthority: "unknown",
    goodsMovement: "unknown",
    firstPlaceOfWork: "unknown",
    privateCar: "unknown",
    publicTransport: "unknown",
    homeOffice: "unknown",
    goodsSupplied: "unknown",
    service: "unknown",
    workDelivery: "unknown",
    workService: "unknown",
    realEstate: "unknown",
    vatIdAvailable: "unknown",
    invoiceWithoutVat: "unknown",
    reverseChargeMentioned: "unknown",
    gift: "unknown",
    inheritance: "unknown",
    rental: "unknown",
    saleTransaction: "unknown",
    provision: "unknown",
    depreciation: "unknown",
    donation: "unknown",
    employmentRelation: "unknown",
    benefitToShareholder: "unknown",
    disproportionateCompensation: "unknown",
    invoice: "unknown",
    explicitTerms: [],
  };
}

export const isTrue = (t: Tri): boolean => t === true;
export const isFalse = (t: Tri): boolean => t === false;
