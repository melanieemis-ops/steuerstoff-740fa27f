// NPO-Prüfassistent — Regelbasierte Demo-Logik
// Nicht verbindlich. Arbeitshilfe für Kanzleien.

export type Sphaere = "" | "ideell" | "zweckbetrieb" | "vermoegen" | "wgb";
export type OrgTyp = "verein" | "ggmbh" | "stiftung" | "sonstige";
export type Richtung = "einnahme" | "ausgabe";
export type Tool =
  | "sphaere"
  | "zweck_vs_wgb"
  | "spende"
  | "zuschuss"
  | "mittelweitergabe"
  | "ruecklage"
  | "ust";

export type Ampel = "gruen" | "gelb" | "rot";

export interface NpoInput {
  beschreibung: string;
  orgTyp: OrgTyp;
  jahr: number;
  betrag: number;
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
  ampel: Ampel;
  sicherheit: Sicherheit;
  einschaetzung: string;
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
    orgTyp: "verein",
    jahr: new Date().getFullYear(),
    betrag: 0,
    beteiligte: "",
    richtung: "einnahme",
    belegVorhanden: false,
    vertragVorhanden: false,
    satzungsbezug: false,
    zweckbindung: false,
    sphaere: "",
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);

function basisFehlend(i: NpoInput): string[] {
  // Hilfreiche, NICHT blockierende Angaben für belastbarere Einschätzung.
  const f: string[] = [];
  if (!i.betrag) f.push("Betrag (für Wesentlichkeit und Schwellenwerte)");
  if (!i.beteiligte.trim()) f.push("Beteiligte Personen oder Organisationen");
  if (!i.belegVorhanden) f.push("Beleg / Rechnung");
  if (!i.vertragVorhanden) f.push("Vertrag oder schriftliche Vereinbarung");
  if (!i.satzungsbezug) f.push("Bestätigung Satzungsbezug");
  return f;
}

function worse(a: Ampel, b: Ampel): Ampel {
  const r = { gruen: 0, gelb: 1, rot: 2 } as const;
  return r[a] >= r[b] ? a : b;
}

function bewerteSphaere(i: NpoInput){
  const risiken: string[] = [];
  const fehlend = basisFehlend(i);
  let ampel: Ampel = "gruen";
  let sphaereVermutung = i.sphaere;
  const text = i.beschreibung.toLowerCase();

  if (!sphaereVermutung) {
    if (/spende|zuwend/.test(text)) sphaereVermutung = "ideell";
    else if (/kurs|seminar|workshop|eintritt|aufführ|sport|kultur/.test(text)) sphaereVermutung = "zweckbetrieb";
    else if (/miete|vermiet|zins|kapital|pacht/.test(text)) sphaereVermutung = "vermoegen";
    else if (/verkauf|werbung|sponsor|gastronom|festzelt|merch/.test(text)) sphaereVermutung = "wgb";
  }

  if (!sphaereVermutung) {
    ampel = "gelb";
    risiken.push("Sphäre nicht eindeutig zuordenbar.");
    fehlend.push("Sphärenzuordnung");
  }
  if (sphaereVermutung === "wgb") {
    ampel = worse(ampel, "gelb");
    risiken.push("Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb — § 64 AO prüfen (Freigrenze 45.000 € Einnahmen).");
  }
  if (sphaereVermutung === "zweckbetrieb" && !i.satzungsbezug) {
    ampel = worse(ampel, "gelb");
    risiken.push("Zweckbetrieb benötigt Satzungsbezug nach §§ 65–68 AO.");
    fehlend.push("Nachweis Satzungsbezug");
  }
  if (sphaereVermutung === "vermoegen" && /werbung|sponsor/.test(text)) {
    ampel = "rot";
    risiken.push("Werbung/Sponsoring kann aus Vermögensverwaltung in wGb umqualifiziert werden.");
  }

  const sphaereLabel: Record<Exclude<Sphaere, "">, string> = {
    ideell: "ideeller Bereich",
    zweckbetrieb: "Zweckbetrieb",
    vermoegen: "Vermögensverwaltung",
    wgb: "steuerpflichtiger wirtschaftlicher Geschäftsbetrieb",
  };
  const einsch = sphaereVermutung
    ? `Vorgang spricht für Zuordnung zum ${sphaereLabel[sphaereVermutung]}.`
    : "Sphärenzuordnung konnte aus den Angaben nicht abgeleitet werden.";

  return {
    tool: "sphaere",
    toolLabel: TOOL_LABEL.sphaere,
    ampel,
    einschaetzung: `${einsch} Organisationstyp: ${i.orgTyp}. Betrag: ${fmt(i.betrag)}.`,
    risiken,
    fehlendeAngaben: fehlend,
    unterlagen: ["Beleg / Rechnung", "Vertrag oder Vereinbarung", "Satzungsauszug", "ggf. Vorstandsbeschluss"],
    rueckfragen: [
      "Wofür wurden die Mittel konkret verwendet?",
      "Besteht ein direkter Bezug zum Satzungszweck?",
      "Gibt es Gegenleistungen für die andere Seite?",
    ],
    buchungshinweis:
      sphaereVermutung === "ideell"
        ? "Ideeller Bereich SKR42: z. B. 4100 Beiträge / 4200 Spenden."
        : sphaereVermutung === "zweckbetrieb"
          ? "Zweckbetrieb SKR42: 4400er Konten."
          : sphaereVermutung === "vermoegen"
            ? "Vermögensverwaltung SKR42: 4600er Konten."
            : sphaereVermutung === "wgb"
              ? "wGb SKR42: 4800er Konten — separat erfassen."
              : "Sphäre vor Buchung klären, sonst Korrekturaufwand.",
    reviewHinweis: "Sphärenzuordnung im Jahresabschluss separat dokumentieren.",
    textbaustein: rueckfrageText(i, "Sphärenzuordnung"),
  };
}

function bewerteZweckVsWgb(i: NpoInput){
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  const istKlassZweck = /(sport|bildung|kultur|jugend|wissenschaft|kunst)/.test(t);
  const istErwerb = /(gewinn|wettbewerb|markt|konkurr|gastronom|verkauf)/.test(t);
  if (istKlassZweck && i.satzungsbezug) {
    ampel = "gruen";
  }
  if (istErwerb) {
    ampel = "rot";
    risiken.push("Wettbewerbsrelevanz — Indiz für steuerpflichtigen wGb (§ 65 Nr. 3 AO).");
  }
  if (!i.satzungsbezug) {
    risiken.push("Ohne Satzungsbezug greift § 65 AO nicht.");
  }
  if (i.betrag > 45000 && istErwerb) {
    risiken.push("Einnahmen > 45.000 € — Freigrenze § 64 Abs. 3 AO überschritten, KSt/GewSt-Pflicht möglich.");
  }
  return {
    tool: "zweck_vs_wgb",
    toolLabel: TOOL_LABEL.zweck_vs_wgb,
    ampel,
    einschaetzung: istErwerb
      ? "Tätigkeit weist Wettbewerbsmerkmale auf — wGb wahrscheinlich."
      : istKlassZweck && i.satzungsbezug
        ? "Tätigkeit deckt sich mit klassischem Zweckbetrieb (§§ 65–68 AO)."
        : "Abgrenzung nicht eindeutig — weitere Angaben nötig.",
    risiken,
    fehlendeAngaben: basisFehlend(i).concat(i.satzungsbezug ? [] : ["Satzungsbezug"]),
    unterlagen: ["Satzung", "Tätigkeitsbeschreibung", "ggf. Wettbewerbsanalyse"],
    rueckfragen: [
      "Welche Leistung wird konkret an wen erbracht?",
      "Tritt die Körperschaft zu kommerziellen Anbietern in Wettbewerb?",
      "Lassen sich die Zwecke ausschließlich über diese Tätigkeit erreichen?",
    ],
    buchungshinweis:
      ampel === "rot"
        ? "Trennrechnung wGb anlegen, Einnahmen + Ausgaben separat (SKR42 4800er)."
        : "Buchung Zweckbetrieb 4400er; bei Mischfällen Aufteilung dokumentieren.",
    reviewHinweis: "Abgrenzungspapier im Mandantenakte ablegen.",
    textbaustein: rueckfrageText(i, "Abgrenzung Zweckbetrieb / wGb"),
  };
}

function bewerteSpende(i: NpoInput){
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gruen";
  const gegenleistung = /(gegenleistung|werbung|sponsor|eintritt|leistung|logo|nennung)/.test(t);
  if (gegenleistung) {
    ampel = "rot";
    risiken.push("Gegenleistung erkennbar — keine Spende, sondern Entgelt (§ 10b EStG).");
  }
  if (i.richtung !== "einnahme") {
    ampel = worse(ampel, "gelb");
    risiken.push("Spendenbescheinigung nur für Einnahmen der Körperschaft.");
  }
  if (!i.satzungsbezug) {
    ampel = worse(ampel, "gelb");
    risiken.push("Verwendung muss steuerbegünstigtem Zweck dienen.");
  }
  if (i.betrag > 300 && !i.belegVorhanden) {
    ampel = worse(ampel, "gelb");
    risiken.push("Über 300 € förmliche Zuwendungsbestätigung erforderlich (§ 50 EStDV).");
  }
  return {
    tool: "spende",
    toolLabel: TOOL_LABEL.spende,
    ampel,
    einschaetzung: gegenleistung
      ? "Vorgang spricht gegen Spendenbescheinigung — Leistungsentgelt prüfen."
      : "Spendenbescheinigung grundsätzlich möglich, Voraussetzungen prüfen.",
    risiken,
    fehlendeAngaben: basisFehlend(i),
    unterlagen: ["Zuwendungsbestätigung (amtliches Muster)", "Zahlungsnachweis", "Verwendungsnachweis"],
    rueckfragen: [
      "Wurde eine konkrete Gegenleistung vereinbart?",
      "Liegt eine schriftliche Spendenerklärung vor?",
      "Wurde die Zuwendung freiwillig und ohne Rechtspflicht geleistet?",
    ],
    buchungshinweis: "SKR42 4200 Geldspenden / 4210 Sachspenden — separat zur Zweckbindung erfassen.",
    reviewHinweis: "Zuwendungsbestätigungen nummerieren und revisionssicher archivieren.",
    textbaustein: rueckfrageText(i, "Spendenbescheinigung"),
  };
}

function bewerteZuschuss(i: NpoInput){
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
  if (!i.zweckbindung) {
    ampel = worse(ampel, "gelb");
    risiken.push("Zweckbindung nicht dokumentiert — Mittelverwendungsnachweis erforderlich.");
  }
  return {
    tool: "zuschuss",
    toolLabel: TOOL_LABEL.zuschuss,
    ampel,
    einschaetzung: leistungsbezogen
      ? "Zuschuss hat Entgeltcharakter — Umsatzsteuer prüfen."
      : echterZuschuss
        ? "Echter Zuschuss wahrscheinlich, nicht umsatzsteuerbar."
        : "Charakter des Zuschusses unklar — Bescheid prüfen.",
    risiken,
    fehlendeAngaben: basisFehlend(i).concat(i.zweckbindung ? [] : ["Zweckbindung"]),
    unterlagen: ["Bewilligungsbescheid", "Verwendungsnachweis", "Kosten- und Finanzierungsplan"],
    rueckfragen: [
      "Welche konkrete Leistung erwartet der Zuschussgeber?",
      "Gibt es einen Bewilligungsbescheid mit Auflagen?",
      "Ist der Zuschuss zweckgebunden und rückforderbar?",
    ],
    buchungshinweis:
      "Echter Zuschuss SKR42 4300; bei Leistungsbezug 4400/4800 + ggf. Umsatzsteuer.",
    reviewHinweis: "Verwendungsnachweis vor Verjährung erstellen und ablegen.",
    textbaustein: rueckfrageText(i, "Zuschuss-/Fördermitteleinordnung"),
  };
}

function bewerteMittelweitergabe(i: NpoInput){
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  if (i.richtung !== "ausgabe") {
    ampel = worse(ampel, "gelb");
    risiken.push("Mittelweitergabe ist eine Ausgabe der gebenden Körperschaft.");
  }
  if (!i.vertragVorhanden) {
    ampel = worse(ampel, "gelb");
    risiken.push("Keine Vereinbarung — Empfängerstatus § 58 Nr. 1 AO nicht nachgewiesen.");
  }
  if (!i.zweckbindung) {
    ampel = "rot";
    risiken.push("Ohne Zweckbindung droht Verlust der Gemeinnützigkeit.");
  }
  if (i.satzungsbezug && i.vertragVorhanden && i.zweckbindung) ampel = "gruen";
  return {
    tool: "mittelweitergabe",
    toolLabel: TOOL_LABEL.mittelweitergabe,
    ampel,
    einschaetzung:
      "Mittelweitergabe nach § 58 Nr. 1 AO ist zulässig, wenn Empfänger steuerbegünstigt ist und Mittel zweckentsprechend verwendet werden.",
    risiken,
    fehlendeAngaben: basisFehlend(i)
      .concat(i.vertragVorhanden ? [] : ["Vereinbarung mit Empfänger"])
      .concat(i.zweckbindung ? [] : ["Zweckbindung"]),
    unterlagen: [
      "Freistellungsbescheid des Empfängers",
      "Mittelweitergabe-Vereinbarung",
      "Verwendungsnachweis",
    ],
    rueckfragen: [
      "Liegt ein aktueller Freistellungsbescheid des Empfängers vor?",
      "Wurde die Verwendung schriftlich bestätigt?",
      "Ist die Weitergabe von der eigenen Satzung gedeckt?",
    ],
    buchungshinweis: "SKR42 5710/5720 Mittelweitergabe; getrennt nach Empfänger erfassen.",
    reviewHinweis: "Empfängerliste mit Beträgen jährlich abgleichen.",
    textbaustein: rueckfrageText(i, "Mittelweitergabe"),
  };
}

function bewerteRuecklage(i: NpoInput){
  const t = i.beschreibung.toLowerCase();
  const risiken: string[] = [];
  let ampel: Ampel = "gelb";
  const fehlend = basisFehlend(i);
  const istFrei = /freie\s*rücklage/.test(t);
  const istZweck = /(zweck|projekt|gebundene)\s*rücklage/.test(t);
  const istBetrieb = /betriebsmittel/.test(t);
  if (!i.vertragVorhanden && !/beschluss/.test(t)) {
    risiken.push("Kein Vorstandsbeschluss erkennbar — § 62 AO verlangt Dokumentation.");
    fehlend.push("Vorstandsbeschluss");
  }
  if (istZweck && !i.zweckbindung) {
    ampel = "rot";
    risiken.push("Zweckgebundene Rücklage ohne dokumentierten Zweck und Zeitplan.");
  }
  if (istFrei && i.betrag > 0) {
    ampel = worse(ampel, "gelb");
    risiken.push("Freie Rücklage: max. 10 % zeitnah zu verwendende Mittel + 1/3 Überschuss Vermögensverwaltung (§ 62 Abs. 1 Nr. 3 AO).");
  }
  if (istBetrieb) {
    ampel = worse(ampel, "gelb");
    risiken.push("Betriebsmittelrücklage: in Höhe periodisch wiederkehrender Ausgaben für angemessenen Zeitraum.");
  }
  if (i.vertragVorhanden && i.zweckbindung && i.satzungsbezug) ampel = "gruen";
  return {
    tool: "ruecklage",
    toolLabel: TOOL_LABEL.ruecklage,
    ampel,
    einschaetzung:
      "Rücklage muss durch Beschluss, Zweck, Betrag, Zeitraum und Finanzierungsplan dokumentiert sein.",
    risiken,
    fehlendeAngaben: fehlend,
    unterlagen: ["Vorstandsbeschluss", "Projekt-/Verwendungsplan", "Finanzierungsplan", "Rücklagenspiegel"],
    rueckfragen: [
      "Welcher konkrete Zweck wird mit der Rücklage verfolgt?",
      "Bis wann soll die Rücklage aufgelöst werden?",
      "Wie ist der Finanzierungsbedarf belegt?",
    ],
    buchungshinweis: "SKR42 9xxx Rücklagenkonten; Rücklagenspiegel zur Anlage des Jahresabschlusses.",
    reviewHinweis: "Rücklagenspiegel jährlich aktualisieren, Auflösungen dokumentieren.",
    textbaustein: rueckfrageText(i, "Rücklagenbeschluss"),
  };
}

function bewerteUst(i: NpoInput){
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
  if (/sponsor/.test(t)) {
    satz = "19 % — aktives Sponsoring ist steuerbar (Abschn. 1.1 Abs. 23 UStAE).";
    ampel = "rot";
    risiken.push("Aktives Sponsoring = Leistungsaustausch; Vorsteuerabzug prüfen.");
  }
  if (/raumvermiet|kurzfrist/.test(t)) {
    satz = "19 % bei kurzfristiger Vermietung; sonst § 4 Nr. 12 UStG steuerfrei.";
    ampel = worse(ampel, "gelb");
  }
  if (/zuschuss|förder/.test(t)) {
    satz = "echter Zuschuss nicht steuerbar; bei Leistungsbezug 19 %.";
    ampel = worse(ampel, "gelb");
  }
  if (i.betrag > 22000) {
    risiken.push("Kleinunternehmergrenze § 19 UStG (22.000 €/50.000 €) prüfen.");
  }
  return {
    tool: "ust",
    toolLabel: TOOL_LABEL.ust,
    ampel,
    einschaetzung: `Umsatzsteuerliche Einordnung: ${satz}`,
    risiken,
    fehlendeAngaben: basisFehlend(i),
    unterlagen: ["Rechnung mit Steuerausweis", "Vertrag", "Leistungsbeschreibung", "Preisliste"],
    rueckfragen: [
      "Liegt ein Leistungsaustausch vor?",
      "Wird aktiv geworben (Logo, Nennung, Verlinkung)?",
      "Welche Befreiungsnorm könnte greifen?",
    ],
    buchungshinweis: "USt-Konten SKR42 entsprechend Steuersatz (19/7/0). Aufteilung bei gemischter Nutzung.",
    reviewHinweis: "USt-Einordnung im Buchungsbeleg dokumentieren.",
    textbaustein: rueckfrageText(i, "Umsatzsteuer-Einordnung"),
  };
}

function rueckfrageText(i: NpoInput, thema: string): string {
  return `Sehr geehrte Damen und Herren,

zur abschließenden Beurteilung des Vorgangs „${i.beschreibung || "(bitte ergänzen)"}" (${fmt(i.betrag)}, ${i.jahr}) benötigen wir noch folgende Angaben zum Thema ${thema}:

- Beleg / Rechnung im Original
- Vertrag oder schriftliche Vereinbarung
- Bezug zum Satzungszweck
- Angaben zur Zweckbindung der Mittel

Bitte senden Sie uns die Unterlagen kurzfristig zu. Bei Rückfragen stehen wir gern zur Verfügung.

Mit freundlichen Grüßen
Ihre Kanzlei`;
}

type RunnerOut = Partial<NpoErgebnis> & Pick<NpoErgebnis, "tool" | "toolLabel" | "ampel" | "einschaetzung" | "risiken" | "fehlendeAngaben" | "unterlagen" | "rueckfragen" | "buchungshinweis" | "reviewHinweis" | "textbaustein">;
const RUNNER: Record<Tool, (i: NpoInput) => RunnerOut> = {
  sphaere: bewerteSphaere,
  zweck_vs_wgb: bewerteZweckVsWgb,
  spende: bewerteSpende,
  zuschuss: bewerteZuschuss,
  mittelweitergabe: bewerteMittelweitergabe,
  ruecklage: bewerteRuecklage,
  ust: bewerteUst,
};

export function pruefe(tool: Tool, input: NpoInput){
  const raw = RUNNER[tool](input as NpoInput);
  return enrich(raw, input);
}

function enrich(e: Partial<NpoErgebnis> & Pick<NpoErgebnis, "tool" | "toolLabel" | "ampel" | "einschaetzung" | "risiken" | "fehlendeAngaben" | "unterlagen" | "rueckfragen" | "buchungshinweis" | "reviewHinweis" | "textbaustein">, i: NpoInput){
  const sicherheit = bewerteSicherheit(i);
  const annahmen = ableiteAnnahmen(i);
  const alternativen = e.alternativen ?? [];
  const ustHinweis = e.ustHinweis ?? defaultUstHinweis(i);
  // bei nur Kurzbeschreibung: Ampel max. gelb (vorsichtig)
  let ampel = e.ampel;
  if (sicherheit === "niedrig" && ampel === "gruen") ampel = "gelb";
  return {
    ...e,
    ampel,
    sicherheit,
    annahmen,
    alternativen,
    ustHinweis,
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
  if (!i.betrag) a.push("Betrag nicht angegeben — Wesentlichkeit kann nicht bewertet werden.");
  if (!i.beteiligte.trim()) a.push("Beteiligte unbekannt — Empfänger-/Geberstatus nicht geprüft.");
  if (!i.sphaere) a.push("Sphäre nicht vorgegeben — Einordnung erfolgt heuristisch aus Beschreibung.");
  if (!i.belegVorhanden && !i.vertragVorhanden) a.push("Keine Belege/Verträge bestätigt — formale Nachweise offen.");
  return a;
}

function defaultUstHinweis(i: NpoInput): string {
  const t = i.beschreibung.toLowerCase();
  if (/sponsor|werbung|logo/.test(t)) return "Aktives Sponsoring i. d. R. 19 % USt; Leistungsaustausch prüfen.";
  if (/eintritt|aufführ|konzert|kultur/.test(t)) return "Ggf. 7 % USt (§ 12 Abs. 2 Nr. 7 UStG) oder Steuerbefreiung § 4 Nr. 20 UStG.";
  if (/spende|zuwend/.test(t)) return "Spenden ohne Gegenleistung sind nicht steuerbar.";
  if (/zuschuss|förder/.test(t)) return "Echter Zuschuss nicht steuerbar; bei Leistungsbezug 19 %.";
  return "Steuerbarkeit, Steuersatz und etwaige Befreiungen (§ 4 UStG, § 19 UStG) prüfen.";
}

export function ergebnisAlsText(e: NpoErgebnis, i: NpoInput): string {
  const a = e.ampel === "gruen" ? "GRÜN" : e.ampel === "gelb" ? "GELB" : "ROT";
  return [
    `Prüfnotiz — ${e.toolLabel}`,
    `Ampel: ${a}`,
    "",
    "Sachverhalt:",
    i.beschreibung,
    `Organisationstyp: ${i.orgTyp} | Jahr: ${i.jahr} | Betrag: ${fmt(i.betrag)}`,
    `Beteiligte: ${i.beteiligte || "—"}`,
    "",
    "Einschätzung:",
    e.einschaetzung,
    "",
    "Risiken:",
    ...e.risiken.map((r) => `- ${r}`),
    "",
    "Fehlende Angaben:",
    ...e.fehlendeAngaben.map((r) => `- ${r}`),
    "",
    "Benötigte Unterlagen:",
    ...e.unterlagen.map((r) => `- ${r}`),
    "",
    "Empfohlene Rückfragen:",
    ...e.rueckfragen.map((r) => `- ${r}`),
    "",
    `Buchungs-/SKR42-Hinweis: ${e.buchungshinweis}`,
    `Review-Hinweis: ${e.reviewHinweis}`,
    "",
    "Hinweis: steuerstoff ist eine Arbeitshilfe. Die Einschätzung ist fachlich durch eine Steuerberaterin oder einen Steuerberater zu prüfen.",
  ].join("\n");
}
