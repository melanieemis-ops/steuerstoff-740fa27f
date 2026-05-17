// NPO-Prüfassistent — Regelbasierte Demo-Logik
// Nicht verbindlich. Arbeitshilfe für Kanzleien.

export type Sphaere = "" | "ideell" | "zweckbetrieb" | "vermoegen" | "wgb";
export type OrgTyp = "" | "verein" | "ggmbh" | "stiftung" | "sonstige";
export type Richtung = "" | "einnahme" | "ausgabe";
export type Tool =
  | "sphaere"
  | "zweck_vs_wgb"
  | "spende"
  | "zuschuss"
  | "mittelweitergabe"
  | "ruecklage"
  | "ust";

export type Ampel = "gruen" | "gelb" | "rot";
export type Modus = "wissen" | "sachverhalt";

export interface NpoInput {
  beschreibung: string;
  orgTyp: OrgTyp;
  jahr?: number;
  betrag?: number;
  beteiligte: string;
  richtung: Richtung;
  belegVorhanden: boolean;
  vertragVorhanden: boolean;
  satzungsbezug: boolean;
  zweckbindung: boolean;
  sphaere: Sphaere;
  skr42?: string;
}

export type Sicherheit = "hoch" | "mittel" | "niedrig";

export interface NpoErgebnis {
  tool: Tool;
  toolLabel: string;
  titel: string; // z. B. "Schnelle Sphäreneinschätzung" oder "Sphärenprüfung"
  modus: Modus;
  ampel: Ampel;
  sicherheit: Sicherheit;
  einschaetzung: string;
  begruendung?: string;
  wannAnders?: string[]; // "Wann wäre die Einordnung anders?"
  annahmen: string[];
  alternativen: string[];
  risiken: string[];
  fehlendeAngaben: string[]; // hilfreiche, nicht blockierende Hinweise
  unterlagen: string[];
  rueckfragen: string[];
  ustHinweis: string;
  buchungshinweis: string;
  reviewHinweis: string;
  textbaustein: string;
}

export const TOOLS: Array<{ id: Tool; label: string; desc: string }> = [
  { id: "sphaere", label: "Sphärenprüfer", desc: "Ideell, Zweckbetrieb, Vermögensverwaltung oder wGb." },
  { id: "zweck_vs_wgb", label: "Zweckbetrieb vs. wGb", desc: "§§ 65–68 AO Abgrenzung." },
  { id: "spende", label: "Spendenbescheinigungs-Checker", desc: "Zuwendung oder Leistungsentgelt?" },
  { id: "zuschuss", label: "Zuschuss-/Fördermittel-Checker", desc: "Echter Zuschuss oder Entgelt?" },
  { id: "mittelweitergabe", label: "Mittelweitergabe-Checker", desc: "§ 58 Nr. 1 AO." },
  { id: "ruecklage", label: "Rücklagenbeschluss-Checker", desc: "§ 62 AO Dokumentation." },
  { id: "ust", label: "NPO-Umsatzsteuer-Checker", desc: "Steuerbarkeit & Satz." },
];

export const TOOL_LABEL: Record<Tool, string> = TOOLS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t.label }),
  {} as Record<Tool, string>,
);

export function emptyInput(): NpoInput {
  return {
    beschreibung: "",
    orgTyp: "",
    jahr: undefined,
    betrag: undefined,
    beteiligte: "",
    richtung: "",
    belegVorhanden: false,
    vertragVorhanden: false,
    satzungsbezug: false,
    zweckbindung: false,
    sphaere: "",
  };
}

const fmt = (n?: number) =>
  typeof n === "number" && n > 0
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n)
    : "nicht angegeben";

function worse(a: Ampel, b: Ampel): Ampel {
  const r = { gruen: 0, gelb: 1, rot: 2 } as const;
  return r[a] >= r[b] ? a : b;
}

// ============================================================
// Intent-Erkennung: Wissensfrage vs. konkreter Sachverhalt
// ============================================================
const WISSEN_PATTERNS = [
  /^\s*(was|wo|wer|wie|wann|warum|wieso|welche|welcher|welches|ist|sind|gehört|gehören|zählt|zählen)\b/i,
  /\bin welche sphäre\b/i,
  /\bwas ist ein\b/i,
  /\?\s*$/,
];

export function erkenneModus(beschreibung: string): Modus {
  const t = beschreibung.trim();
  if (!t) return "sachverhalt";
  // kurze Beschreibung ohne Zahlen / Namen → eher Wissensfrage
  const kurzOhneFakten = t.length < 80 && !/\d{2,}/.test(t) && !/€|EUR|euro/i.test(t);
  const trifft = WISSEN_PATTERNS.some((r) => r.test(t));
  return trifft || (kurzOhneFakten && /\b(mitgliedsbeitr|spende|zuschuss|zins|kapital|vermiet|miete|verkauf|kurs|seminar|sponsor|raumvermiet|tagesgeld)\b/i.test(t))
    ? "wissen"
    : "sachverhalt";
}

// ============================================================
// Festregeln nach Begriffen (Mitgliedsbeiträge, Spenden, ...)
// ============================================================
type Regel = {
  match: RegExp;
  sphaere: Exclude<Sphaere, "">;
  titel: string;
  einschaetzung: string;
  begruendung: string;
  wannAnders: string[];
  rueckfragen: string[];
  ustHinweis: string;
  buchungshinweis: string;
  reviewHinweis: string;
  basisAmpel: Ampel;
  // Begriffe, die auf eine Gegenleistung / Risiko hindeuten und die Ampel verschärfen
  risikoBegriffe?: RegExp;
  alternativen?: string[];
};

const REGELN: Regel[] = [
  {
    match: /mitgliedsbeitr|vereinsbeitrag|beiträge mitglieder|jahresbeitrag|aufnahmebeitrag/i,
    sphaere: "ideell",
    titel: "Mitgliedsbeiträge",
    einschaetzung: "Ideeller Bereich",
    begruendung:
      "Echte Mitgliedsbeiträge ohne konkrete Gegenleistung gehören regelmäßig zum ideellen Bereich des Vereins.",
    wannAnders: [
      "Wenn der Beitrag für eine konkrete Gegenleistung (Kurs, Eintritt, Nutzung) gezahlt wird — dann ggf. Zweckbetrieb oder wGb.",
      "Bei unechten Mitgliedsbeiträgen / Sonderumlagen mit Leistungsbezug.",
    ],
    rueckfragen: [
      "Handelt es sich um echte satzungsmäßige Mitgliedsbeiträge?",
      "Gibt es eine konkrete Gegenleistung?",
      "Zahlen alle Mitglieder nach Satzung/Beitragsordnung?",
      "Sind Sonderleistungen, Kurse, Veranstaltungen oder Nutzungen enthalten?",
      "Gibt es eine Beitragsordnung oder Satzungsregelung?",
    ],
    ustHinweis:
      "Echte Mitgliedsbeiträge ohne konkrete Gegenleistung sind regelmäßig nicht als steuerbarer Leistungsaustausch zu behandeln. Bei konkreten Gegenleistungen bitte USt prüfen.",
    buchungshinweis:
      "Mitgliedsbeiträge regelmäßig im ideellen Bereich erfassen. Konkretes Konto nach individuellem Kontenrahmen prüfen.",
    reviewHinweis: "Bei Sonderbeiträgen, Umlagen oder Beiträgen mit Gegenleistung bitte fachlich prüfen.",
    basisAmpel: "gruen",
    risikoBegriffe: /gegenleistung|kurs|seminar|eintritt|nutzung|leistung|veranstaltung|sonderumlage|umlage/i,
    alternativen: ["Zweckbetrieb (bei Leistungsbezug zum Satzungszweck)", "wirtschaftl. Geschäftsbetrieb (bei reiner Leistung)"],
  },
  {
    match: /\bspende|zuwendung\b/i,
    sphaere: "ideell",
    titel: "Spenden / Zuwendungen",
    einschaetzung: "Ideeller Bereich",
    begruendung:
      "Spenden sind grundsätzlich dem ideellen Bereich zuzuordnen, sofern keine Gegenleistung vorliegt.",
    wannAnders: [
      "Bei Logo-Nennung, Werbung, Verlinkung oder anderem Vorteil → Sponsoring / wGb prüfen.",
      "Bei Sachzuwendungen mit Bewertung → besondere Anforderungen an Zuwendungsbestätigung.",
    ],
    rueckfragen: [
      "Wurde eine konkrete Gegenleistung vereinbart?",
      "Gibt es Logo-Nennung, Werbung oder Verlinkung?",
      "Liegt eine Zuwendungsbestätigung (amtl. Muster) vor?",
    ],
    ustHinweis: "Spenden ohne Gegenleistung sind nicht steuerbar. Bei Gegenleistung Leistungsaustausch (i. d. R. 19 % USt) prüfen.",
    buchungshinweis: "Spenden im ideellen Bereich erfassen, getrennt nach Geld- und Sachspenden.",
    reviewHinweis: "Spendenbescheinigung kritisch prüfen, sobald irgendeine Form von Gegenleistung erkennbar ist.",
    basisAmpel: "gruen",
    risikoBegriffe: /logo|werbung|sponsor|nennung|verlink|gegenleistung|vorteil/i,
    alternativen: ["Sponsoring (wirtschaftl. Geschäftsbetrieb)"],
  },
  {
    match: /zuschuss|fördermittel|förderung|förderbescheid/i,
    sphaere: "ideell",
    titel: "Zuschüsse / Fördermittel",
    einschaetzung: "Ideeller Bereich oder Zweckbetrieb möglich – abhängig vom Förderzweck",
    begruendung:
      "Echte Zuschüsse ohne Leistungsbezug sind dem ideellen Bereich zuzuordnen. Bei Leistungsbezug oder Auftragscharakter kann es sich um steuerbares Entgelt handeln.",
    wannAnders: [
      "Bei Leistungsbezug / Auftragscharakter → steuerbares Entgelt (19 % USt).",
      "Bei Projektförderung mit Bezug zum Satzungszweck → Zweckbetrieb möglich.",
    ],
    rueckfragen: [
      "Echter Zuschuss oder Entgelt für eine Leistung?",
      "Welche Zweckbindung gibt der Bewilligungsbescheid vor?",
      "Welcher Projektzeitraum ist abgedeckt?",
      "Wie wird die Mittelverwendung dokumentiert?",
    ],
    ustHinweis: "Echter Zuschuss nicht steuerbar; bei Leistungsbezug i. d. R. 19 % USt.",
    buchungshinweis: "Echte Zuschüsse im ideellen Bereich / Zweckbetrieb erfassen. Bei Leistungsbezug separate Erfassung mit USt.",
    reviewHinweis: "Verwendungsnachweis fristgerecht erstellen und ablegen.",
    basisAmpel: "gelb",
    alternativen: ["Zweckbetrieb (bei Projektbezug zum Satzungszweck)", "Entgelt / wGb (bei Leistungsbezug)"],
  },
  {
    match: /\bzins|tagesgeld|kapitalertr|dividend|wertpapier/i,
    sphaere: "vermoegen",
    titel: "Zinserträge / Kapitalerträge",
    einschaetzung: "Vermögensverwaltung",
    begruendung:
      "Zinsen, Tagesgeld und vergleichbare Kapitalerträge sind regelmäßig der Vermögensverwaltung zuzuordnen.",
    wannAnders: [
      "Bei gewerblichem Wertpapierhandel → wGb möglich.",
    ],
    rueckfragen: [
      "Liegt eine Steuerbescheinigung der Bank vor?",
      "Wurde Kapitalertragsteuer einbehalten / freigestellt (NV-Bescheinigung)?",
      "Wie werden die Mittel zeitnah verwendet?",
    ],
    ustHinweis: "Zinserträge sind regelmäßig nicht umsatzsteuerbar.",
    buchungshinweis: "Vermögensverwaltung — Zinserträge separat erfassen.",
    reviewHinweis: "Rücklagen- und Mittelverwendung dokumentieren.",
    basisAmpel: "gruen",
  },
  {
    match: /raumvermiet|vermietung|vermiet|\bmiete\b|pacht/i,
    sphaere: "vermoegen",
    titel: "Vermietung / Verpachtung",
    einschaetzung: "Vermögensverwaltung oder wirtschaftlicher Geschäftsbetrieb",
    begruendung:
      "Langfristige Vermietung ist regelmäßig Vermögensverwaltung. Kurzfristige Vermietung oder Vermietung mit Nebenleistungen kann wGb sein.",
    wannAnders: [
      "Kurzfristige Vermietung (z. B. Tagungsräume mit Service) → wGb möglich.",
      "Vermietung mit Bewirtung, Personal, Werbung → wGb wahrscheinlich.",
    ],
    rueckfragen: [
      "Kurz- oder langfristige Vermietung?",
      "Welche Nebenleistungen werden erbracht (Service, Reinigung, Technik)?",
      "Wird an Vereinsmitglieder oder an Dritte vermietet?",
    ],
    ustHinweis: "Langfristige Vermietung i. d. R. steuerfrei (§ 4 Nr. 12 UStG). Kurzfristige Vermietung 19 %.",
    buchungshinweis: "Vermögensverwaltung oder wGb — je nach Charakter trennen.",
    reviewHinweis: "Bei Nebenleistungen Umqualifizierung in wGb prüfen.",
    basisAmpel: "gelb",
    alternativen: ["wirtschaftl. Geschäftsbetrieb (bei kurzfristiger Vermietung mit Nebenleistungen)"],
  },
  {
    match: /verkauf|getränk|speisen|bewirt|eintritt|sommerfest|vereinsfest|basar|tombola|festzelt|merch/i,
    sphaere: "wgb",
    titel: "Verkauf / Bewirtung / Fest",
    einschaetzung: "Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb möglich",
    begruendung:
      "Verkauf von Speisen, Getränken, Eintrittskarten oder Festeinnahmen sind regelmäßig wGb. Zweckbetrieb nur bei unmittelbarer Erfüllung des Satzungszwecks.",
    wannAnders: [
      "Eintritt zu kulturellen / sportlichen Veranstaltungen mit Satzungsbezug → Zweckbetrieb (§§ 67a, 68 AO).",
      "Bewirtung als Nebenleistung kann separat als wGb zu erfassen sein.",
    ],
    rueckfragen: [
      "Welcher Teil entfällt auf Eintritt (Satzungszweck) und welcher auf Bewirtung/Verkauf?",
      "Wird in Wettbewerb zu kommerziellen Anbietern getreten?",
      "Wie hoch sind die voraussichtlichen Einnahmen (§ 64 AO Freigrenze 45.000 €)?",
    ],
    ustHinweis: "Verkauf von Speisen/Getränken i. d. R. 19 % bzw. 7 %. Eintritt ggf. 7 % oder steuerfrei (§ 4 Nr. 20 UStG).",
    buchungshinweis: "wGb separat erfassen. Mischfälle aufteilen (Trennrechnung).",
    reviewHinweis: "§ 64 AO: Freigrenze 45.000 € Einnahmen prüfen.",
    basisAmpel: "gelb",
    alternativen: ["Zweckbetrieb (bei unmittelbarem Satzungsbezug, z. B. Eintritt zur Sportveranstaltung)"],
  },
  {
    match: /\bkurs|seminar|workshop|bildung|unterricht|lehrgang|fortbildung/i,
    sphaere: "zweckbetrieb",
    titel: "Kurse / Seminare / Bildung",
    einschaetzung: "Zweckbetrieb möglich, wenn unmittelbarer Satzungszweck erfüllt wird",
    begruendung:
      "Bildungsangebote sind regelmäßig Zweckbetrieb (§ 68 Nr. 8 AO), wenn sie unmittelbar den Satzungszweck erfüllen.",
    wannAnders: [
      "Ohne Satzungsbezug oder bei Wettbewerb zu kommerziellen Anbietern → wGb.",
    ],
    rueckfragen: [
      "Welcher Satzungszweck wird erfüllt?",
      "Wer ist Teilnehmerkreis (Mitglieder, Dritte)?",
      "Wie hoch ist das Teilnahmeentgelt?",
    ],
    ustHinweis: "Bildungsleistungen ggf. steuerfrei nach § 4 Nr. 21/22 UStG.",
    buchungshinweis: "Zweckbetrieb erfassen. Bei fehlendem Satzungsbezug wGb prüfen.",
    reviewHinweis: "Bescheinigung nach § 4 Nr. 21 UStG ggf. einholen.",
    basisAmpel: "gruen",
    alternativen: ["wirtschaftl. Geschäftsbetrieb (ohne Satzungsbezug)"],
  },
  {
    match: /sponsor|logo|werbung|trikotwerbung|bandenwerbung/i,
    sphaere: "wgb",
    titel: "Sponsoring",
    einschaetzung: "Aktives Sponsoring = wirtschaftlicher Geschäftsbetrieb",
    begruendung:
      "Sponsoring mit aktiver Werbeleistung (Logo, Nennung, Verlinkung) ist regelmäßig steuerpflichtiger wGb.",
    wannAnders: [
      "Passive Duldung (reine Namensnennung in Dankesliste) → ggf. Vermögensverwaltung.",
    ],
    rueckfragen: [
      "Welche Werbeleistung wird konkret erbracht?",
      "Liegt ein Sponsoringvertrag vor?",
      "Wird das Logo aktiv beworben oder nur geduldet?",
    ],
    ustHinweis: "Aktives Sponsoring i. d. R. 19 % USt (Abschn. 1.1 Abs. 23 UStAE).",
    buchungshinweis: "wGb erfassen. Spendenbescheinigung nicht möglich.",
    reviewHinweis: "Abgrenzung Sponsoring / Spende dokumentieren.",
    basisAmpel: "gelb",
    alternativen: ["Vermögensverwaltung (bei reiner Duldung)", "Spende (nur ohne Gegenleistung)"],
  },
];

function findeRegel(beschreibung: string): Regel | null {
  return REGELN.find((r) => r.match.test(beschreibung)) ?? null;
}

const sphaereLabel: Record<Exclude<Sphaere, "">, string> = {
  ideell: "ideeller Bereich",
  zweckbetrieb: "Zweckbetrieb",
  vermoegen: "Vermögensverwaltung",
  wgb: "steuerpflichtiger wirtschaftlicher Geschäftsbetrieb",
};

// ============================================================
// Schnelle Sphäreneinschätzung (Wissensmodus)
// ============================================================
function schnelleSphaerenEinschaetzung(i: NpoInput): NpoErgebnis {
  const regel = findeRegel(i.beschreibung);
  if (regel) {
    const text = i.beschreibung.toLowerCase();
    let ampel = regel.basisAmpel;
    const risiken: string[] = [];
    if (regel.risikoBegriffe && regel.risikoBegriffe.test(text)) {
      ampel = worse(ampel, "gelb");
      risiken.push("Hinweis auf Gegenleistung / Leistungsbezug — abweichende Sphäre prüfen.");
    }
    return {
      tool: "sphaere",
      toolLabel: TOOL_LABEL.sphaere,
      titel: "Schnelle Sphäreneinschätzung",
      modus: "wissen",
      ampel,
      sicherheit: "mittel",
      einschaetzung: `Wahrscheinliche Sphäre: ${regel.einschaetzung} (${sphaereLabel[regel.sphaere]}).`,
      begruendung: regel.begruendung,
      wannAnders: regel.wannAnders,
      annahmen: [
        "Einschätzung auf Basis typischer Sachverhalte — kein konkreter Einzelfall geprüft.",
      ],
      alternativen: regel.alternativen ?? [],
      risiken,
      fehlendeAngaben: [],
      unterlagen: [],
      rueckfragen: regel.rueckfragen,
      ustHinweis: regel.ustHinweis,
      buchungshinweis: regel.buchungshinweis,
      reviewHinweis: regel.reviewHinweis,
      textbaustein: kurzAntwortText(i, regel),
    };
  }

  // Kein Regel-Treffer — generische, freundliche Wissensantwort
  return {
    tool: "sphaere",
    toolLabel: TOOL_LABEL.sphaere,
    titel: "Schnelle Sphäreneinschätzung",
    modus: "wissen",
    ampel: "gelb",
    sicherheit: "niedrig",
    einschaetzung:
      "Zur Frage liegt keine direkte Festregel vor. Mögliche Einordnungen: ideeller Bereich, Zweckbetrieb, Vermögensverwaltung oder wirtschaftlicher Geschäftsbetrieb.",
    begruendung:
      "Die vier Sphären unterscheiden sich nach Zweck und Gegenleistung. Bitte konkretisieren, ob eine Leistung erbracht wird und welcher Satzungszweck betroffen ist.",
    wannAnders: [
      "Bei reinen Mitgliedsbeiträgen / Spenden ohne Gegenleistung → ideeller Bereich.",
      "Bei Tätigkeiten zur unmittelbaren Erfüllung des Satzungszwecks → Zweckbetrieb.",
      "Bei Zinsen, langfristiger Vermietung, Kapitalerträgen → Vermögensverwaltung.",
      "Bei Verkauf, Bewirtung, Sponsoring, Werbung → wirtschaftlicher Geschäftsbetrieb.",
    ],
    annahmen: [],
    alternativen: [],
    risiken: [],
    fehlendeAngaben: [],
    unterlagen: [],
    rueckfragen: [
      "Wird eine konkrete Gegenleistung erbracht?",
      "Besteht ein direkter Bezug zum Satzungszweck?",
      "Liegt aktives Auftreten am Markt vor?",
    ],
    ustHinweis: defaultUstHinweis(i),
    buchungshinweis: "Vor Buchung Sphäre klären, sonst Korrekturaufwand.",
    reviewHinweis: "Bei Unklarheit fachlich prüfen lassen.",
    textbaustein: kurzAntwortText(i, null),
  };
}

function kurzAntwortText(i: NpoInput, r: Regel | null): string {
  if (r) {
    return `Frage: „${i.beschreibung}"

Schnelle Sphäreneinschätzung:
${r.einschaetzung} (${sphaereLabel[r.sphaere]}).

Begründung:
${r.begruendung}

Wann wäre die Einordnung anders?
${r.wannAnders.map((w) => `- ${w}`).join("\n")}

USt-Hinweis:
${r.ustHinweis}

Hinweis: steuerstoff ist eine Arbeitshilfe. Die Einschätzung ist fachlich zu prüfen.`;
  }
  return `Frage: „${i.beschreibung}"

Zur Sphärenzuordnung sind weitere Angaben hilfreich (Gegenleistung, Satzungsbezug, Art der Tätigkeit).

Hinweis: steuerstoff ist eine Arbeitshilfe. Die Einschätzung ist fachlich zu prüfen.`;
}

// ============================================================
// Sphärenprüfung im Sachverhaltsmodus
// ============================================================
function bewerteSphaere(i: NpoInput): RunnerOut {
  const regel = findeRegel(i.beschreibung);
  const text = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  const rueckfragen: string[] = [];
  const alternativen: string[] = [];
  let ampel: Ampel = "gelb";
  let sphaereVermutung: Sphaere = i.sphaere;
  let begruendung = "";
  let wannAnders: string[] = [];
  let ustHinweis = defaultUstHinweis(i);
  let buchungshinweis = "Vor Buchung Sphäre klären.";
  let reviewHinweis = "Sphärenzuordnung im Jahresabschluss dokumentieren.";

  if (regel) {
    sphaereVermutung = regel.sphaere;
    ampel = regel.basisAmpel;
    begruendung = regel.begruendung;
    wannAnders = regel.wannAnders;
    rueckfragen.push(...regel.rueckfragen);
    alternativen.push(...(regel.alternativen ?? []));
    ustHinweis = regel.ustHinweis;
    buchungshinweis = regel.buchungshinweis;
    reviewHinweis = regel.reviewHinweis;
    if (regel.risikoBegriffe && regel.risikoBegriffe.test(text)) {
      ampel = worse(ampel, "gelb");
      risiken.push("Hinweis auf Gegenleistung / Leistungsbezug — abweichende Sphäre prüfen.");
    }
  }

  // Mischfall Sommerfest / Eintritt + Verkauf
  if (/sommerfest|vereinsfest/.test(text) && /(verkauf|getränk|bewirt|eintritt)/.test(text)) {
    sphaereVermutung = "zweckbetrieb";
    if (!alternativen.includes("wirtschaftl. Geschäftsbetrieb (Bewirtung/Verkauf)"))
      alternativen.push("wirtschaftl. Geschäftsbetrieb (Bewirtung/Verkauf)");
    risiken.push("Mischfall: Einnahmen und Ausgaben pro Sphäre trennen (Trennrechnung).");
    rueckfragen.push("Welcher Anteil entfällt auf Eintritt (Satzungszweck) und welcher auf Verkauf/Bewirtung?");
  }

  if (sphaereVermutung === "wgb" || alternativen.length) {
    risiken.push("§ 64 AO: Freigrenze 45.000 € Einnahmen pro Jahr im wGb prüfen.");
    if (typeof i.betrag === "number" && i.betrag > 45000) ampel = "rot";
  }

  const einsch = sphaereVermutung
    ? `Wahrscheinliche Einordnung: ${sphaereLabel[sphaereVermutung as Exclude<Sphaere, "">]}.`
    : "Sphärenzuordnung erfolgt heuristisch — bitte Sachverhalt konkretisieren.";

  return {
    tool: "sphaere",
    toolLabel: TOOL_LABEL.sphaere,
    titel: "Sphärenprüfung",
    modus: "sachverhalt",
    ampel,
    einschaetzung: einsch,
    begruendung,
    wannAnders,
    alternativen,
    risiken,
    fehlendeAngaben: [], // nicht-blockierende Hinweise werden in enrich ergänzt
    unterlagen: regel
      ? ["ggf. Beleg / Rechnung", "ggf. Vertrag oder Vereinbarung", "ggf. Satzungsauszug"]
      : ["Beleg / Rechnung", "Vertrag oder Vereinbarung", "Satzungsauszug"],
    rueckfragen,
    ustHinweis,
    buchungshinweis,
    reviewHinweis,
    textbaustein: rueckfrageText(i, "Sphärenzuordnung"),
  };
}

// ============================================================
// Restliche Tools (unverändert in Logik, ohne harte Blockaden)
// ============================================================
function bewerteZweckVsWgb(i: NpoInput): RunnerOut {
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  const istKlassZweck = /(sport|bildung|kultur|jugend|wissenschaft|kunst)/.test(t);
  const istErwerb = /(gewinn|wettbewerb|markt|konkurr|gastronom|verkauf)/.test(t);
  if (istKlassZweck && i.satzungsbezug) ampel = "gruen";
  if (istErwerb) {
    ampel = "rot";
    risiken.push("Wettbewerbsrelevanz — Indiz für steuerpflichtigen wGb (§ 65 Nr. 3 AO).");
  }
  if (typeof i.betrag === "number" && i.betrag > 45000 && istErwerb) {
    risiken.push("Einnahmen > 45.000 € — Freigrenze § 64 Abs. 3 AO überschritten.");
  }
  return {
    tool: "zweck_vs_wgb",
    toolLabel: TOOL_LABEL.zweck_vs_wgb,
    titel: "Zweckbetrieb vs. wGb",
    modus: "sachverhalt",
    ampel,
    einschaetzung: istErwerb
      ? "Tätigkeit weist Wettbewerbsmerkmale auf — wGb wahrscheinlich."
      : istKlassZweck
        ? "Tätigkeit deckt sich mit klassischem Zweckbetrieb (§§ 65–68 AO)."
        : "Abgrenzung nicht eindeutig — weitere Angaben hilfreich.",
    risiken,
    fehlendeAngaben: [],
    unterlagen: ["Satzung", "Tätigkeitsbeschreibung", "ggf. Wettbewerbsanalyse"],
    rueckfragen: [
      "Welche Leistung wird konkret an wen erbracht?",
      "Tritt die Körperschaft zu kommerziellen Anbietern in Wettbewerb?",
      "Lassen sich die Zwecke ausschließlich über diese Tätigkeit erreichen?",
    ],
    buchungshinweis:
      ampel === "rot"
        ? "Trennrechnung wGb anlegen, Einnahmen + Ausgaben separat."
        : "Buchung Zweckbetrieb; bei Mischfällen Aufteilung dokumentieren.",
    reviewHinweis: "Abgrenzungspapier in der Mandantenakte ablegen.",
    textbaustein: rueckfrageText(i, "Abgrenzung Zweckbetrieb / wGb"),
  };
}

function bewerteSpende(i: NpoInput): RunnerOut {
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gruen";
  const gegenleistung = /(gegenleistung|werbung|sponsor|eintritt|leistung|logo|nennung|verlink)/.test(t);
  if (gegenleistung) {
    ampel = "rot";
    risiken.push("Gegenleistung erkennbar — keine Spende, sondern Entgelt (§ 10b EStG).");
  }
  if (typeof i.betrag === "number" && i.betrag > 300 && !i.belegVorhanden) {
    ampel = worse(ampel, "gelb");
    risiken.push("Über 300 € förmliche Zuwendungsbestätigung erforderlich (§ 50 EStDV).");
  }
  return {
    tool: "spende",
    toolLabel: TOOL_LABEL.spende,
    titel: "Spendenbescheinigung",
    modus: "sachverhalt",
    ampel,
    einschaetzung: gegenleistung
      ? "Vorgang spricht gegen Spendenbescheinigung — Leistungsentgelt prüfen."
      : "Spendenbescheinigung grundsätzlich möglich, Voraussetzungen prüfen.",
    risiken,
    fehlendeAngaben: [],
    unterlagen: ["Zuwendungsbestätigung (amtliches Muster)", "Zahlungsnachweis", "Verwendungsnachweis"],
    rueckfragen: [
      "Wurde eine konkrete Gegenleistung vereinbart?",
      "Liegt eine schriftliche Spendenerklärung vor?",
      "Wurde die Zuwendung freiwillig und ohne Rechtspflicht geleistet?",
    ],
    buchungshinweis: "Geldspenden / Sachspenden separat zur Zweckbindung erfassen.",
    reviewHinweis: "Zuwendungsbestätigungen nummerieren und revisionssicher archivieren.",
    textbaustein: rueckfrageText(i, "Spendenbescheinigung"),
  };
}

function bewerteZuschuss(i: NpoInput): RunnerOut {
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  const echterZuschuss = /(förder|öffentlich|kommun|land|bund|stiftung)/.test(t);
  const leistungsbezogen = /(gegenleistung|auftrag|projektleistung|abrechnung nach leistung)/.test(t);
  if (echterZuschuss && !leistungsbezogen) ampel = "gruen";
  if (leistungsbezogen) {
    ampel = "rot";
    risiken.push("Leistungsbezug erkennbar — steuerbares Entgelt statt echtem Zuschuss (Abschn. 10.2 UStAE).");
  }
  return {
    tool: "zuschuss",
    toolLabel: TOOL_LABEL.zuschuss,
    titel: "Zuschuss / Fördermittel",
    modus: "sachverhalt",
    ampel,
    einschaetzung: leistungsbezogen
      ? "Zuschuss hat Entgeltcharakter — Umsatzsteuer prüfen."
      : echterZuschuss
        ? "Echter Zuschuss wahrscheinlich, nicht umsatzsteuerbar."
        : "Charakter des Zuschusses unklar — Bescheid prüfen.",
    risiken,
    fehlendeAngaben: [],
    unterlagen: ["Bewilligungsbescheid", "Verwendungsnachweis", "Kosten- und Finanzierungsplan"],
    rueckfragen: [
      "Welche konkrete Leistung erwartet der Zuschussgeber?",
      "Gibt es einen Bewilligungsbescheid mit Auflagen?",
      "Ist der Zuschuss zweckgebunden und rückforderbar?",
    ],
    buchungshinweis: "Echter Zuschuss im ideellen Bereich; bei Leistungsbezug separat erfassen.",
    reviewHinweis: "Verwendungsnachweis fristgerecht erstellen und ablegen.",
    textbaustein: rueckfrageText(i, "Zuschuss-/Fördermitteleinordnung"),
  };
}

function bewerteMittelweitergabe(i: NpoInput): RunnerOut {
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  if (!i.zweckbindung) {
    ampel = "rot";
    risiken.push("Ohne dokumentierte Zweckbindung droht Verlust der Gemeinnützigkeit.");
  }
  if (i.satzungsbezug && i.vertragVorhanden && i.zweckbindung) ampel = "gruen";
  return {
    tool: "mittelweitergabe",
    toolLabel: TOOL_LABEL.mittelweitergabe,
    titel: "Mittelweitergabe (§ 58 Nr. 1 AO)",
    modus: "sachverhalt",
    ampel,
    einschaetzung:
      "Mittelweitergabe nach § 58 Nr. 1 AO ist zulässig, wenn Empfänger steuerbegünstigt ist und Mittel zweckentsprechend verwendet werden.",
    risiken,
    fehlendeAngaben: [],
    unterlagen: ["Freistellungsbescheid des Empfängers", "Mittelweitergabe-Vereinbarung", "Verwendungsnachweis"],
    rueckfragen: [
      "Liegt ein aktueller Freistellungsbescheid des Empfängers vor?",
      "Wurde die Verwendung schriftlich bestätigt?",
      "Ist die Weitergabe von der eigenen Satzung gedeckt?",
    ],
    buchungshinweis: "Mittelweitergabe getrennt nach Empfänger erfassen.",
    reviewHinweis: "Empfängerliste mit Beträgen jährlich abgleichen.",
    textbaustein: rueckfrageText(i, "Mittelweitergabe"),
  };
}

function bewerteRuecklage(i: NpoInput): RunnerOut {
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  const istFrei = /freie\s*rücklage/.test(t);
  const istZweck = /(zweck|projekt|gebundene)\s*rücklage/.test(t);
  const istBetrieb = /betriebsmittel/.test(t);
  if (istZweck && !i.zweckbindung) {
    ampel = "rot";
    risiken.push("Zweckgebundene Rücklage ohne dokumentierten Zweck und Zeitplan.");
  }
  if (istFrei) risiken.push("Freie Rücklage: max. 10 % zeitnah zu verwendende Mittel + 1/3 Überschuss VV (§ 62 Abs. 1 Nr. 3 AO).");
  if (istBetrieb) risiken.push("Betriebsmittelrücklage: in Höhe periodisch wiederkehrender Ausgaben.");
  if (i.vertragVorhanden && i.zweckbindung && i.satzungsbezug) ampel = "gruen";
  return {
    tool: "ruecklage",
    toolLabel: TOOL_LABEL.ruecklage,
    titel: "Rücklagenbeschluss (§ 62 AO)",
    modus: "sachverhalt",
    ampel,
    einschaetzung:
      "Rücklage muss durch Beschluss, Zweck, Betrag, Zeitraum und Finanzierungsplan dokumentiert sein.",
    risiken,
    fehlendeAngaben: [],
    unterlagen: ["Vorstandsbeschluss", "Projekt-/Verwendungsplan", "Finanzierungsplan", "Rücklagenspiegel"],
    rueckfragen: [
      "Welcher konkrete Zweck wird mit der Rücklage verfolgt?",
      "Bis wann soll die Rücklage aufgelöst werden?",
      "Wie ist der Finanzierungsbedarf belegt?",
    ],
    buchungshinweis: "Rücklagenkonten; Rücklagenspiegel zur Anlage des Jahresabschlusses.",
    reviewHinweis: "Rücklagenspiegel jährlich aktualisieren.",
    textbaustein: rueckfrageText(i, "Rücklagenbeschluss"),
  };
}

function bewerteUst(i: NpoInput): RunnerOut {
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  let satz = "—";
  if (/eintritt|aufführ|konzert|theater|museum/.test(t)) {
    satz = "7 % möglich (§ 12 Abs. 2 Nr. 7 UStG) oder steuerfrei (§ 4 Nr. 20 UStG)";
    ampel = "gruen";
  }
  if (/kurs|seminar|bildung|unterricht/.test(t)) {
    satz = "ggf. steuerfrei nach § 4 Nr. 21/22 UStG";
    ampel = "gruen";
  }
  if (/sponsor|logo|werbung/.test(t)) {
    satz = "19 % — aktives Sponsoring ist steuerbar (Abschn. 1.1 Abs. 23 UStAE).";
    ampel = "rot";
    risiken.push("Aktives Sponsoring = Leistungsaustausch; Vorsteuerabzug prüfen.");
  }
  if (/raumvermiet|kurzfrist/.test(t)) {
    satz = "19 % bei kurzfristiger Vermietung; sonst § 4 Nr. 12 UStG steuerfrei.";
  }
  if (/zuschuss|förder/.test(t)) {
    satz = "echter Zuschuss nicht steuerbar; bei Leistungsbezug 19 %.";
  }
  if (typeof i.betrag === "number" && i.betrag > 22000) {
    risiken.push("Kleinunternehmergrenze § 19 UStG (22.000 €/50.000 €) prüfen.");
  }
  return {
    tool: "ust",
    toolLabel: TOOL_LABEL.ust,
    titel: "Umsatzsteuer-Einordnung",
    modus: "sachverhalt",
    ampel,
    einschaetzung: `Umsatzsteuerliche Einordnung: ${satz}`,
    risiken,
    fehlendeAngaben: [],
    unterlagen: ["Rechnung mit Steuerausweis", "Vertrag", "Leistungsbeschreibung"],
    rueckfragen: [
      "Liegt ein Leistungsaustausch vor?",
      "Wird aktiv geworben (Logo, Nennung, Verlinkung)?",
      "Welche Befreiungsnorm könnte greifen?",
    ],
    buchungshinweis: "USt-Konten entsprechend Steuersatz. Aufteilung bei gemischter Nutzung.",
    reviewHinweis: "USt-Einordnung im Buchungsbeleg dokumentieren.",
    textbaustein: rueckfrageText(i, "Umsatzsteuer-Einordnung"),
  };
}

function rueckfrageText(i: NpoInput, thema: string): string {
  return `Sehr geehrte Damen und Herren,

zur abschließenden Beurteilung des Vorgangs „${i.beschreibung || "(bitte ergänzen)"}" (${fmt(i.betrag)}${i.jahr ? `, ${i.jahr}` : ""}) wären zum Thema ${thema} folgende Angaben hilfreich:

- Beleg / Rechnung
- Vertrag oder schriftliche Vereinbarung
- Bezug zum Satzungszweck
- Angaben zur Zweckbindung der Mittel

Bei Rückfragen stehen wir gern zur Verfügung.

Mit freundlichen Grüßen
Ihre Kanzlei`;
}

type RunnerOut = Omit<NpoErgebnis, "sicherheit" | "annahmen" | "alternativen" | "ustHinweis" | "begruendung" | "wannAnders"> &
  Partial<Pick<NpoErgebnis, "alternativen" | "ustHinweis" | "begruendung" | "wannAnders">>;

const RUNNER = {
  sphaere: bewerteSphaere,
  zweck_vs_wgb: bewerteZweckVsWgb,
  spende: bewerteSpende,
  zuschuss: bewerteZuschuss,
  mittelweitergabe: bewerteMittelweitergabe,
  ruecklage: bewerteRuecklage,
  ust: bewerteUst,
} as Record<Tool, (i: NpoInput) => RunnerOut>;

export function pruefe(tool: Tool, input: NpoInput): NpoErgebnis {
  // Intent: kurze Wissensfrage zur Sphäre → Schnellantwort, keine Pflichtfelder
  if (tool === "sphaere" && erkenneModus(input.beschreibung) === "wissen") {
    return schnelleSphaerenEinschaetzung(input);
  }
  const raw = RUNNER[tool](input);
  return enrich(raw, input);
}

function enrich(e: RunnerOut, i: NpoInput): NpoErgebnis {
  const sicherheit = bewerteSicherheit(i);
  const hilfreich = hilfreicheAngaben(i, e.tool);
  const annahmen = ableiteAnnahmen(i);
  const alternativen = e.alternativen ?? [];
  const ustHinweis = e.ustHinweis ?? defaultUstHinweis(i);
  let ampel = e.ampel;
  if (sicherheit === "niedrig" && ampel === "gruen") ampel = "gelb";
  return {
    ...e,
    ampel,
    sicherheit,
    annahmen,
    alternativen,
    ustHinweis,
    fehlendeAngaben: hilfreich,
    begruendung: e.begruendung,
    wannAnders: e.wannAnders,
  };
}

function bewerteSicherheit(i: NpoInput): Sicherheit {
  let score = 0;
  if (i.betrag) score++;
  if (i.beteiligte.trim()) score++;
  if (i.sphaere) score++;
  if (i.belegVorhanden || i.vertragVorhanden) score++;
  if (i.satzungsbezug || i.zweckbindung) score++;
  if (score >= 4) return "hoch";
  if (score >= 2) return "mittel";
  return "niedrig";
}

function ableiteAnnahmen(i: NpoInput): string[] {
  const a: string[] = [];
  if (!i.orgTyp) a.push("Organisationstyp nicht angegeben.");
  if (!i.betrag) a.push("Betrag nicht angegeben — Wesentlichkeit kann nicht bewertet werden.");
  if (!i.sphaere) a.push("Sphäre nicht vorgegeben — Einordnung erfolgt heuristisch aus Beschreibung.");
  return a;
}

function hilfreicheAngaben(i: NpoInput, tool: Tool): string[] {
  const f: string[] = [];
  if (!i.betrag) f.push("Betrag (für Wesentlichkeit und Schwellenwerte)");
  if (!i.beteiligte.trim()) f.push("Beteiligte Personen oder Organisationen");
  if (tool === "spende" && !i.belegVorhanden) f.push("Zahlungsnachweis / Beleg");
  if ((tool === "mittelweitergabe" || tool === "ruecklage") && !i.vertragVorhanden)
    f.push("Vertrag / Beschluss");
  if (tool === "zuschuss" && !i.zweckbindung) f.push("Zweckbindung dokumentieren");
  return f;
}

function defaultUstHinweis(i: NpoInput): string {
  const t = i.beschreibung.toLowerCase();
  if (/sponsor|werbung|logo/.test(t)) return "Aktives Sponsoring i. d. R. 19 % USt; Leistungsaustausch prüfen.";
  if (/eintritt|aufführ|konzert|kultur/.test(t)) return "Ggf. 7 % USt (§ 12 Abs. 2 Nr. 7 UStG) oder § 4 Nr. 20 UStG.";
  if (/spende|zuwend|mitgliedsbeitr/.test(t)) return "Ohne konkrete Gegenleistung regelmäßig nicht steuerbar.";
  if (/zuschuss|förder/.test(t)) return "Echter Zuschuss nicht steuerbar; bei Leistungsbezug 19 %.";
  if (/zins|tagesgeld|kapital/.test(t)) return "Zinserträge regelmäßig nicht umsatzsteuerbar.";
  return "Steuerbarkeit, Steuersatz und etwaige Befreiungen (§ 4 UStG, § 19 UStG) prüfen.";
}

export function ergebnisAlsText(e: NpoErgebnis, i: NpoInput): string {
  const a = e.ampel === "gruen" ? "GRÜN" : e.ampel === "gelb" ? "GELB" : "ROT";
  const lines = [
    `Prüfnotiz — ${e.titel}`,
    `Ampel: ${a} | Sicherheit: ${e.sicherheit}`,
    "",
    "Sachverhalt:",
    i.beschreibung || "—",
    `Organisationstyp: ${i.orgTyp || "nicht angegeben"} | Jahr: ${i.jahr || "nicht angegeben"} | Betrag: ${fmt(i.betrag)}`,
    `Beteiligte: ${i.beteiligte || "nicht angegeben"}`,
    "",
    "Einschätzung:",
    e.einschaetzung,
  ];
  if (e.begruendung) lines.push("", "Begründung:", e.begruendung);
  if (e.wannAnders && e.wannAnders.length)
    lines.push("", "Wann wäre die Einordnung anders?", ...e.wannAnders.map((x) => `- ${x}`));
  if (e.alternativen.length)
    lines.push("", "Mögliche Alternativ-Einordnung:", ...e.alternativen.map((x) => `- ${x}`));
  if (e.risiken.length) lines.push("", "Risiken:", ...e.risiken.map((x) => `- ${x}`));
  if (e.fehlendeAngaben.length)
    lines.push("", "Hilfreich wäre:", ...e.fehlendeAngaben.map((x) => `- ${x}`));
  if (e.unterlagen.length) lines.push("", "Benötigte Unterlagen:", ...e.unterlagen.map((x) => `- ${x}`));
  if (e.rueckfragen.length)
    lines.push("", "Empfohlene Rückfragen:", ...e.rueckfragen.map((x) => `- ${x}`));
  lines.push(
    "",
    `USt-Hinweis: ${e.ustHinweis}`,
    `Buchungs-/SKR42-Hinweis: ${e.buchungshinweis}`,
    `Review-Hinweis: ${e.reviewHinweis}`,
    "",
    "Hinweis: steuerstoff ist eine Arbeitshilfe. Die Einschätzung ist fachlich zu prüfen.",
  );
  return lines.join("\n");
}
