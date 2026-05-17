// Mittelverwendungsrechner – Datenmodell, Berechnungen, Persistenz

const KEY = "steuerstoff.mvr.v1";

export type Rechtsform = "Verein" | "gGmbH" | "Stiftung" | "sonstige";
export type Gewinnermittlung = "EÜR" | "Bilanz" | "unklar";
export type Gemeinnuetzig = "ja" | "nein" | "pruefung";
export type ReviewStatus = "Entwurf" | "in Prüfung" | "geprüft";
export type Ampel = "gruen" | "gelb" | "rot";

export interface Stammdaten {
  name: string;
  rechtsform: Rechtsform;
  jahr: string;
  gewinnermittlung: Gewinnermittlung;
  gemeinnuetzig: Gemeinnuetzig;
  artOrganisation: string;
  bearbeiter: string;
  reviewStatus: ReviewStatus;
}

export interface Schwelle {
  ideell: number;
  zweckbetrieb: number;
  vermoegensverwaltung: number;
  wgB: number;
}

export interface Zufluesse {
  spenden: number;
  mitgliedsbeitraege: number;
  zuschuesse: number;
  ideell: number;
  ueberschussZweckbetrieb: number;
  gewinnWgB: number;
  ueberschussVV: number;
  sonstigeZeitnah: number;
  vermoegenszufuehrung62Abs3: number;
  grundstockvermoegen: number;
  einlagenStifter: number;
  zuflussjahr: string;
}

export interface Verwendung {
  ausgIdeell: number;
  ausgZweckbetrieb: number;
  mittelweitergabe: number;
  anlagevermoegenNutzungsgebunden: number;
  anlagevermoegenSonstiges: number;
  ausgVV: number;
  ausgWgB: number;
  darlehen: number;
  sonstige: number;
}

export interface Vermoegen {
  bank: number;
  kasse: number;
  forderungenKurz: number;
  forderungenLang: number;
  saIdeell: number;
  saVV: number;
  saWgB: number;
  saSonstiges: number;
  verbindlichkeiten: number;
  darlehen: number;
  rueckstellungen: number;
}

export interface ZweckRuecklage {
  id: string;
  projekt: string;
  zweck: string;
  geplant: number;
  bisher: number;
  zufuehrung: number;
  verwendungAm: string;
  finanzplan: boolean;
  beschluss: boolean;
  beleg: boolean;
}

export interface Betriebsmittel {
  personal: number;
  miete: number;
  energie: number;
  sonstige: number;
  monate: number;
  beschluss: boolean;
}

export interface Wiederbeschaffung {
  id: string;
  wirtschaftsgut: string;
  ak: number;
  nutzungsdauer: number;
  afa: number;
  ersatzAm: string;
  zufuehrung: number;
  beschluss: boolean;
}

export interface FreieRuecklage {
  ueberschussVV: number;
  unterdeckungVorjahre: number;
  sonstigeZeitnah: number;
  nichtAusgeschoepftVJ1: number;
  nichtAusgeschoepftVJ2: number;
  geplanteZufuehrung: number;
}

export interface Gesellschaftsrechte {
  vorhanden: boolean;
  bisher: number;
  nachher: number;
  zweck: "erhaltung" | "erstmalig";
  betrag: number;
}

export interface Vermoegenszufuehrung62Abs3 {
  todesfall: number;
  ausstattung: number;
  spendenaufruf: number;
  sachzuwendung: number;
  nachweis: boolean;
}

export interface Mittelvortrag {
  id: string;
  zuflussjahr: number;
  betrag: number;
  verwendetZufluss: number;
  verwendetFolge1: number;
  verwendetFolge2: number;
  inRuecklage: number;
}

export type RuecklageArt =
  | "frei"
  | "zweckgebunden"
  | "betriebsmittel"
  | "wiederbeschaffung"
  | "gesellschaftsrechte"
  | "vermoegenszufuehrung"
  | "sonstige";

export interface RuecklagenspiegelZeile {
  id: string;
  art: RuecklageArt;
  anfangsbestand: number;
  zufuehrung: number;
  entnahme: number;
  zweck: string;
  beschlussdatum: string;
  nachweis: boolean;
  pruefstatus: "offen" | "geprüft" | "kritisch";
  kommentar: string;
}

export interface MvrState {
  stamm: Stammdaten;
  schwelle: Schwelle;
  zufluesse: Zufluesse;
  verwendung: Verwendung;
  vermoegen: Vermoegen;
  zweckRuecklagen: ZweckRuecklage[];
  betriebsmittel: Betriebsmittel;
  wiederbeschaffung: Wiederbeschaffung[];
  freieRuecklage: FreieRuecklage;
  gesellschaftsrechte: Gesellschaftsrechte;
  vz62Abs3: Vermoegenszufuehrung62Abs3;
  mittelvortrag: Mittelvortrag[];
  spiegel: RuecklagenspiegelZeile[];
  updatedAt: string;
}

export const REVIEW_NOTE =
  "Diese Berechnung ist eine Arbeitshilfe. Die Mittelverwendungsrechnung und Rücklagenbildung sind fachlich durch eine Steuerberaterin oder einen Steuerberater zu prüfen.";

export function emptyState(): MvrState {
  return {
    stamm: {
      name: "",
      rechtsform: "Verein",
      jahr: String(new Date().getFullYear()),
      gewinnermittlung: "unklar",
      gemeinnuetzig: "ja",
      artOrganisation: "Verein",
      bearbeiter: "",
      reviewStatus: "Entwurf",
    },
    schwelle: { ideell: 0, zweckbetrieb: 0, vermoegensverwaltung: 0, wgB: 0 },
    zufluesse: {
      spenden: 0,
      mitgliedsbeitraege: 0,
      zuschuesse: 0,
      ideell: 0,
      ueberschussZweckbetrieb: 0,
      gewinnWgB: 0,
      ueberschussVV: 0,
      sonstigeZeitnah: 0,
      vermoegenszufuehrung62Abs3: 0,
      grundstockvermoegen: 0,
      einlagenStifter: 0,
      zuflussjahr: String(new Date().getFullYear()),
    },
    verwendung: {
      ausgIdeell: 0,
      ausgZweckbetrieb: 0,
      mittelweitergabe: 0,
      anlagevermoegenNutzungsgebunden: 0,
      anlagevermoegenSonstiges: 0,
      ausgVV: 0,
      ausgWgB: 0,
      darlehen: 0,
      sonstige: 0,
    },
    vermoegen: {
      bank: 0,
      kasse: 0,
      forderungenKurz: 0,
      forderungenLang: 0,
      saIdeell: 0,
      saVV: 0,
      saWgB: 0,
      saSonstiges: 0,
      verbindlichkeiten: 0,
      darlehen: 0,
      rueckstellungen: 0,
    },
    zweckRuecklagen: [],
    betriebsmittel: {
      personal: 0, miete: 0, energie: 0, sonstige: 0, monate: 3, beschluss: false,
    },
    wiederbeschaffung: [],
    freieRuecklage: {
      ueberschussVV: 0,
      unterdeckungVorjahre: 0,
      sonstigeZeitnah: 0,
      nichtAusgeschoepftVJ1: 0,
      nichtAusgeschoepftVJ2: 0,
      geplanteZufuehrung: 0,
    },
    gesellschaftsrechte: { vorhanden: false, bisher: 0, nachher: 0, zweck: "erhaltung", betrag: 0 },
    vz62Abs3: { todesfall: 0, ausstattung: 0, spendenaufruf: 0, sachzuwendung: 0, nachweis: false },
    mittelvortrag: [],
    spiegel: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadState(): MvrState {
  if (typeof localStorage === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) } as MvrState;
  } catch {
    return emptyState();
  }
}

export function saveState(s: MvrState) {
  if (typeof localStorage === "undefined") return;
  s.updatedAt = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(s));
}

// -------- Berechnungen --------

export function gesamtEinnahmen(s: Schwelle): number {
  return s.ideell + s.zweckbetrieb + s.vermoegensverwaltung + s.wgB;
}

export function schwelleAmpel(s: Schwelle): { ampel: Ampel; hinweis: string } {
  const sum = gesamtEinnahmen(s);
  if (sum <= 45000) {
    return {
      ampel: "gruen",
      hinweis:
        "Kleine Körperschaft: Nach der hinterlegten Logik ist eine Mittelverwendungsrechnung grundsätzlich nicht erforderlich. Eine freiwillige Dokumentation kann sinnvoll sein.",
    };
  }
  const vollstaendig = s.ideell > 0 || s.zweckbetrieb > 0 || s.vermoegensverwaltung > 0 || s.wgB > 0;
  return {
    ampel: vollstaendig ? "gelb" : "rot",
    hinweis: "Die zeitnahe Mittelverwendung sollte dokumentiert und rechnerisch geprüft werden.",
  };
}

export function zeitnahZuVerwendendeMittel(z: Zufluesse): number {
  return (
    z.spenden + z.mitgliedsbeitraege + z.zuschuesse + z.ideell +
    z.ueberschussZweckbetrieb + z.gewinnWgB + z.ueberschussVV + z.sonstigeZeitnah
  );
}

export function zweckentsprechendeVerwendung(v: Verwendung): number {
  return v.ausgIdeell + v.ausgZweckbetrieb + v.mittelweitergabe + v.anlagevermoegenNutzungsgebunden;
}

export function pruefpflichtigeVerwendung(v: Verwendung): number {
  return v.ausgVV + v.ausgWgB + v.anlagevermoegenSonstiges + v.darlehen + v.sonstige;
}

export function betriebsmittelSumme(b: Betriebsmittel): number {
  return (b.personal + b.miete + b.energie + b.sonstige) * b.monate;
}

export interface FreieRuecklageErgebnis {
  verrechenbarerVV: number;
  unterdeckungVortrag: number;
  drittelVV: number;
  zehnProzentSonstige: number;
  nachholung: number;
  maxZuluessig: number;
  geplant: number;
  differenz: number;
  ampel: Ampel;
}

export function berechneFreieRuecklage(f: FreieRuecklage): FreieRuecklageErgebnis {
  const verrechenbarerVV = f.ueberschussVV - f.unterdeckungVorjahre;
  const unterdeckungVortrag = verrechenbarerVV < 0 ? Math.abs(verrechenbarerVV) : 0;
  const drittelVV = verrechenbarerVV > 0 ? verrechenbarerVV / 3 : 0;
  const zehnProzentSonstige = f.sonstigeZeitnah * 0.1;
  const nachholung = (f.nichtAusgeschoepftVJ1 || 0) + (f.nichtAusgeschoepftVJ2 || 0);
  const maxZuluessig = drittelVV + zehnProzentSonstige + nachholung;
  const differenz = maxZuluessig - f.geplanteZufuehrung;
  let ampel: Ampel = "gruen";
  if (f.geplanteZufuehrung > maxZuluessig) ampel = "rot";
  else if (f.geplanteZufuehrung > maxZuluessig * 0.95 || maxZuluessig === 0) ampel = "gelb";
  return {
    verrechenbarerVV, unterdeckungVortrag, drittelVV, zehnProzentSonstige,
    nachholung, maxZuluessig, geplant: f.geplanteZufuehrung, differenz, ampel,
  };
}

export function vermoegenszufuehrungSumme(v: Vermoegenszufuehrung62Abs3): number {
  return v.todesfall + v.ausstattung + v.spendenaufruf + v.sachzuwendung;
}

export function summeZulaessigeRuecklagen(s: MvrState): number {
  const fr = berechneFreieRuecklage(s.freieRuecklage);
  const frBetrag = Math.min(s.freieRuecklage.geplanteZufuehrung, fr.maxZuluessig);
  const zr = s.zweckRuecklagen.reduce((a, r) => a + (r.zufuehrung || 0), 0);
  const bm = betriebsmittelSumme(s.betriebsmittel);
  const wb = s.wiederbeschaffung.reduce((a, r) => a + (r.zufuehrung || 0), 0);
  const gr = s.gesellschaftsrechte.zweck === "erhaltung" ? s.gesellschaftsrechte.betrag : 0;
  return frBetrag + zr + bm + wb + gr;
}

export interface MvrErgebnis {
  zeitnah: number;
  zweckentsprechend: number;
  ruecklagen: number;
  vz62: number;
  mittelvortragOffen: number;
  verwendungsueberhang: number;
  gesamtAmpel: Ampel;
  hinweise: string[];
}

export function fristStatus(m: Mittelvortrag, currentYear: number): {
  status: "innerhalb" | "endetBald" | "ueberschritten";
  fristende: number;
  offen: number;
} {
  const fristende = m.zuflussjahr + 2;
  const verbraucht = m.verwendetZufluss + m.verwendetFolge1 + m.verwendetFolge2 + m.inRuecklage;
  const offen = m.betrag - verbraucht;
  let status: "innerhalb" | "endetBald" | "ueberschritten" = "innerhalb";
  if (currentYear > fristende) status = "ueberschritten";
  else if (currentYear === fristende) status = "endetBald";
  return { status, fristende, offen };
}

export function berechneErgebnis(s: MvrState): MvrErgebnis {
  const zeitnah = zeitnahZuVerwendendeMittel(s.zufluesse);
  const zweckentsprechend = zweckentsprechendeVerwendung(s.verwendung);
  const ruecklagen = summeZulaessigeRuecklagen(s);
  const vz62 = vermoegenszufuehrungSumme(s.vz62Abs3) + s.zufluesse.vermoegenszufuehrung62Abs3;
  const curYear = Number(s.stamm.jahr) || new Date().getFullYear();
  const mittelvortragOffen = s.mittelvortrag.reduce((a, m) => {
    const st = fristStatus(m, curYear);
    return st.status === "innerhalb" ? a + st.offen : a;
  }, 0);
  const verwendungsueberhang = zeitnah - zweckentsprechend - ruecklagen - vz62 - mittelvortragOffen;
  const hinweise: string[] = [];
  let ampel: Ampel = "gruen";
  const fr = berechneFreieRuecklage(s.freieRuecklage);
  if (fr.ampel === "rot") { ampel = "rot"; hinweise.push("Freie Rücklage überschreitet das zulässige Maß."); }
  else if (fr.ampel === "gelb") { ampel = "gelb"; }
  if (verwendungsueberhang > 0) {
    ampel = "rot";
    hinweise.push("Rechnerischer Verwendungsüberhang – mögliche nicht zeitnahe Mittelverwendung.");
  }
  if (s.verwendung.darlehen > 0) {
    hinweise.push("Darlehen aus zeitnah zu verwendenden Mitteln – fachlich prüfen.");
    if (ampel === "gruen") ampel = "gelb";
  }
  s.mittelvortrag.forEach((m) => {
    const st = fristStatus(m, curYear);
    if (st.status === "ueberschritten" && st.offen > 0) {
      ampel = "rot";
      hinweise.push(`Mittelvortrag Zufluss ${m.zuflussjahr}: Frist überschritten (offen ${st.offen.toLocaleString("de-DE")} €).`);
    }
  });
  if (s.gesellschaftsrechte.vorhanden && s.gesellschaftsrechte.zweck === "erstmalig" && s.gesellschaftsrechte.betrag > 0) {
    if (ampel === "gruen") ampel = "gelb";
    hinweise.push("Rücklage Gesellschaftsrechte: erstmaliger Erwerb ist nach hinterlegter Logik nicht vorgesehen.");
  }
  return { zeitnah, zweckentsprechend, ruecklagen, vz62, mittelvortragOffen, verwendungsueberhang, gesamtAmpel: ampel, hinweise };
}

export function ampelClass(a: Ampel): string {
  if (a === "gruen") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (a === "gelb") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export function ampelLabel(a: Ampel): string {
  return a === "gruen" ? "Grün" : a === "gelb" ? "Gelb" : "Rot";
}

export function fmt(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// -------- Erweiterte Risiko- und Antwortlogik --------

export interface RiskFinding {
  level: Ampel;
  text: string;
}

export interface MvrAnalyse {
  ergebnis: MvrErgebnis;
  schwelle: ReturnType<typeof schwelleAmpel>;
  freie: FreieRuecklageErgebnis;
  findings: RiskFinding[];
  gesamt: Ampel;
  kernsatz: string;
  naechsterSchritt: string;
  hauptauffaelligkeit: string;
  fehlendeUnterlagen: string[];
  rueckfragen: string[];
  todos: string[];
  beschluesse: { art: string; betrag: number; begruendung: string }[];
}

function worse(a: Ampel, b: Ampel): Ampel {
  const r = ["gruen", "gelb", "rot"] as const;
  return r.indexOf(a) >= r.indexOf(b) ? a : b;
}

export function analysiere(s: MvrState): MvrAnalyse {
  const ergebnis = berechneErgebnis(s);
  const sw = schwelleAmpel(s.schwelle);
  const fr = berechneFreieRuecklage(s.freieRuecklage);
  const curYear = Number(s.stamm.jahr) || new Date().getFullYear();
  const findings: RiskFinding[] = [];
  let gesamt: Ampel = "gruen";

  // 45k-Schwelle
  if (sw.ampel !== "gruen") {
    findings.push({ level: sw.ampel, text: `45.000-€-Grenze überschritten – ${sw.hinweis}` });
    gesamt = worse(gesamt, sw.ampel);
  }

  // Freie Rücklage
  if (fr.ampel === "rot") {
    findings.push({ level: "rot", text: "Freie Rücklage überschreitet das nach § 62 Abs. 1 Nr. 3 AO zulässige Maß." });
    gesamt = "rot";
  } else if (fr.ampel === "gelb") {
    findings.push({ level: "gelb", text: "Freie Rücklage nahe am zulässigen Maximum – Berechnung sauber dokumentieren." });
    gesamt = worse(gesamt, "gelb");
  }

  // Verwendungsüberhang
  if (ergebnis.verwendungsueberhang > 0) {
    const altMittel = s.mittelvortrag.some((m) => fristStatus(m, curYear).status !== "innerhalb" && fristStatus(m, curYear).offen > 0);
    const lvl: Ampel = altMittel || ergebnis.verwendungsueberhang > ergebnis.zeitnah * 0.1 ? "rot" : "gelb";
    findings.push({ level: lvl, text: `Positiver Verwendungsüberhang von ${fmt(ergebnis.verwendungsueberhang)} – mögliche nicht zeitnahe Mittelverwendung.` });
    gesamt = worse(gesamt, lvl);
  }

  // Mittelvortrag-Fristen
  s.mittelvortrag.forEach((m) => {
    const st = fristStatus(m, curYear);
    if (st.status === "ueberschritten" && st.offen > 0) {
      findings.push({ level: "rot", text: `Mittelvortrag Zufluss ${m.zuflussjahr}: Zwei-Jahres-Frist überschritten (offen ${fmt(st.offen)}).` });
      gesamt = "rot";
    } else if (st.status === "endetBald" && st.offen > 0) {
      findings.push({ level: "gelb", text: `Mittelvortrag Zufluss ${m.zuflussjahr}: Frist endet ${st.fristende} – Verwendung sicherstellen.` });
      gesamt = worse(gesamt, "gelb");
    }
  });

  // Darlehen
  if (s.verwendung.darlehen > 0) {
    findings.push({ level: "gelb", text: "Darlehensvergabe aus zeitnah zu verwendenden Mitteln – Zweckbezug schriftlich begründen." });
    gesamt = worse(gesamt, "gelb");
  }

  // VV/wGB ohne freie Rücklage gedeckt
  const vvWgB = s.verwendung.ausgVV + s.verwendung.ausgWgB + s.verwendung.anlagevermoegenSonstiges;
  const freieDeckung = Math.min(s.freieRuecklage.geplanteZufuehrung, fr.maxZuluessig);
  if (vvWgB > freieDeckung + s.zufluesse.vermoegenszufuehrung62Abs3 + vermoegenszufuehrungSumme(s.vz62Abs3)) {
    findings.push({ level: "rot", text: "Mittel in Vermögensverwaltung / wirt. Geschäftsbetrieb ohne erkennbare Deckung aus freier Rücklage oder Vermögenszuführung." });
    gesamt = "rot";
  }

  // Rücklagen ohne Beschluss/Zweck/Plan
  s.zweckRuecklagen.forEach((r) => {
    if (r.zufuehrung > 0 && (!r.beschluss || !r.finanzplan || !r.zweck)) {
      findings.push({ level: "rot", text: `Zweckgebundene Rücklage „${r.projekt || "(ohne Bezeichnung)"}": Beschluss, Finanzierungsplan oder Zweck fehlen.` });
      gesamt = "rot";
    }
  });
  s.spiegel.forEach((r) => {
    if (r.zufuehrung > 0 && (!r.beschlussdatum || !r.zweck)) {
      findings.push({ level: "gelb", text: `Rücklage (${r.art}): Beschlussdatum oder Zweckangabe im Spiegel fehlt.` });
      gesamt = worse(gesamt, "gelb");
    }
  });

  // Fehlende Sphärenzuordnung im Anlagevermögen
  if ((s.vermoegen.saIdeell + s.vermoegen.saVV + s.vermoegen.saWgB) === 0 && s.vermoegen.saSonstiges > 0) {
    findings.push({ level: "gelb", text: "Sachanlagen nicht den Sphären zugeordnet (ideell / Zweckbetrieb / VV / wGB)." });
    gesamt = worse(gesamt, "gelb");
  }

  // Stammdaten unvollständig
  if (!s.stamm.name || !s.zufluesse.zuflussjahr) {
    findings.push({ level: "gelb", text: "Stammdaten unvollständig (Name der Körperschaft oder Zuflussjahr fehlt)." });
    gesamt = worse(gesamt, "gelb");
  }

  // Kernsatz + nächster Schritt
  let kernsatz = "";
  let naechsterSchritt = "";
  if (gesamt === "gruen") {
    kernsatz = `Die Mittelverwendung ${s.stamm.jahr} ist rechnerisch unauffällig. Zeitnah zu verwenden waren ${fmt(ergebnis.zeitnah)}; davon wurden ${fmt(ergebnis.zweckentsprechend)} zweckentsprechend eingesetzt und ${fmt(ergebnis.ruecklagen)} in zulässige Rücklagen überführt. Ein Verwendungsüberhang besteht rechnerisch nicht.`;
    naechsterSchritt = "Prüfnotiz und Rücklagenspiegel zur Akte nehmen und Steuerberater-Review dokumentieren.";
  } else if (gesamt === "gelb") {
    kernsatz = `Die Mittelverwendung ${s.stamm.jahr} ist mit Einschränkungen plausibel: zeitnah zu verwenden ${fmt(ergebnis.zeitnah)}, zweckentsprechend ${fmt(ergebnis.zweckentsprechend)}, Rücklagen ${fmt(ergebnis.ruecklagen)}, Verwendungsüberhang ${fmt(ergebnis.verwendungsueberhang)}. Einzelne Angaben oder Nachweise sind nachzuziehen.`;
    naechsterSchritt = "Offene Punkte und Rückfragen mit dem Mandanten klären, bevor die Rechnung finalisiert wird.";
  } else {
    kernsatz = `Die Mittelverwendung ${s.stamm.jahr} weist gemeinnützigkeitsrechtliche Risiken auf. Zeitnah ${fmt(ergebnis.zeitnah)}, zweckentsprechend ${fmt(ergebnis.zweckentsprechend)}, Rücklagen ${fmt(ergebnis.ruecklagen)}, Verwendungsüberhang ${fmt(ergebnis.verwendungsueberhang)}.`;
    naechsterSchritt = "Sofort fachlich prüfen lassen: Fristen, Rücklagenbeschlüsse und Sphärenzuordnung priorisiert klären.";
  }

  const haupt = findings.find((f) => f.level === "rot")?.text
    || findings.find((f) => f.level === "gelb")?.text
    || "Keine wesentliche Auffälligkeit.";

  const fehlendeUnterlagen: string[] = [];
  if (s.zweckRuecklagen.some((r) => r.zufuehrung > 0 && !r.beschluss)) fehlendeUnterlagen.push("Vorstandsbeschluss zur zweckgebundenen Rücklage");
  if (s.zweckRuecklagen.some((r) => r.zufuehrung > 0 && !r.finanzplan)) fehlendeUnterlagen.push("Projekt- und Finanzierungsplan");
  if (s.spiegel.some((r) => r.zufuehrung > 0 && !r.beschlussdatum)) fehlendeUnterlagen.push("Beschlussdatum im Rücklagenspiegel");
  if (s.spiegel.some((r) => !r.nachweis)) fehlendeUnterlagen.push("Nachweise/Belege je Rücklage");
  if (!s.betriebsmittel.beschluss && betriebsmittelSumme(s.betriebsmittel) > 0) fehlendeUnterlagen.push("Beschluss zur Betriebsmittelrücklage");
  if (s.wiederbeschaffung.some((w) => !w.beschluss)) fehlendeUnterlagen.push("Beschluss zur Wiederbeschaffungsrücklage");
  if (!s.vz62Abs3.nachweis && vermoegenszufuehrungSumme(s.vz62Abs3) > 0) fehlendeUnterlagen.push("Nachweis zur Vermögenszuführung § 62 Abs. 3 AO");

  const rueckfragen: string[] = [
    "Gibt es für jede gebildete Rücklage einen schriftlichen Vorstandsbeschluss?",
    "Liegt für zweckgebundene Rücklagen ein konkreter Projekt- und Finanzierungsplan vor?",
    "Wurden Mittel aus der Vermögensverwaltung nicht doppelt als Bemessungsgrundlage für die 10 %-Rücklage angesetzt?",
    "Welche Mittel stammen aus welchem Zuflussjahr (Zuordnung Mittelvortrag)?",
    "Sind alle offenen Mittel noch innerhalb der Zwei-Jahres-Frist nach § 55 Abs. 1 Nr. 5 AO?",
    "Gibt es Vermögenszuführungen nach § 62 Abs. 3 AO (Todesfall, Ausstattung, Spendenaufruf, Sachzuwendung)?",
    "Sind Anlagegüter eindeutig dem ideellen Bereich, Zweckbetrieb, der Vermögensverwaltung oder dem wirtschaftlichen Geschäftsbetrieb zugeordnet?",
  ];
  if (s.verwendung.darlehen > 0) rueckfragen.push("Wofür wurden Darlehen vergeben und besteht ein unmittelbarer Zweckbezug?");
  if (s.gesellschaftsrechte.vorhanden) rueckfragen.push("Dient die Rücklage zur Erhaltung von Gesellschaftsrechten – nicht zum erstmaligen Erwerb?");

  const todos: string[] = [
    "Rücklagenbeschluss prüfen und ggf. nachholen",
    "Finanzierungsplan und Zeitplan für zweckgebundene Rücklagen ergänzen",
    "Mittelvortrag mit Zuflussjahren abstimmen",
    "Offene Altmittel innerhalb der Zwei-Jahres-Frist klären",
    "Vermögensverwaltung separat von ideellem Bereich prüfen",
    "Sphärenzuordnung der Anlagegüter dokumentieren",
    "Steuerberater-Review durchführen und Ergebnis ablegen",
  ];

  const beschluesse: { art: string; betrag: number; begruendung: string }[] = [];
  if (s.freieRuecklage.geplanteZufuehrung > 0) {
    beschluesse.push({
      art: "Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO)",
      betrag: Math.min(s.freieRuecklage.geplanteZufuehrung, fr.maxZuluessig),
      begruendung: `Zuführung gestützt auf 1/3 des verrechenbaren VV-Überschusses (${fmt(fr.drittelVV)}) zzgl. 10 % sonstiger zeitnah zu verwendender Mittel (${fmt(fr.zehnProzentSonstige)}) zzgl. Nachholung (${fmt(fr.nachholung)}).`,
    });
  }
  s.zweckRuecklagen.forEach((r) => {
    if (r.zufuehrung > 0) {
      beschluesse.push({
        art: `Zweckgebundene Rücklage „${r.projekt || "ohne Bezeichnung"}" (§ 62 Abs. 1 Nr. 1 AO)`,
        betrag: r.zufuehrung,
        begruendung: r.zweck || "Zweck zu ergänzen; Finanzierungs- und Zeitplan beifügen.",
      });
    }
  });
  const bm = betriebsmittelSumme(s.betriebsmittel);
  if (bm > 0) beschluesse.push({
    art: "Betriebsmittelrücklage (§ 62 Abs. 1 Nr. 1 AO)",
    betrag: bm,
    begruendung: `Sicherung der periodisch wiederkehrenden Ausgaben für ${s.betriebsmittel.monate} Monate (Personal, Miete, Energie, Sonstiges).`,
  });
  s.wiederbeschaffung.forEach((w) => {
    if (w.zufuehrung > 0) beschluesse.push({
      art: `Wiederbeschaffungsrücklage „${w.wirtschaftsgut}" (§ 62 Abs. 1 Nr. 2 AO)`,
      betrag: w.zufuehrung,
      begruendung: `AK ${fmt(w.ak)}, Nutzungsdauer ${w.nutzungsdauer} Jahre, jährliche AfA ${fmt(w.afa)}, geplanter Ersatz ${w.ersatzAm || "offen"}.`,
    });
  });

  return {
    ergebnis, schwelle: sw, freie: fr, findings, gesamt,
    kernsatz, naechsterSchritt, hauptauffaelligkeit: haupt,
    fehlendeUnterlagen, rueckfragen, todos, beschluesse,
  };
}

// -------- Antwortmodi (Text-Builder) --------

const DISCLAIMER = "Nicht verbindlich. Bitte steuerlich prüfen lassen.";

export function buildKurz(s: MvrState): string {
  const a = analysiere(s);
  const L = [
    `Ampel: ${ampelLabel(a.gesamt).toUpperCase()}`,
    "",
    a.kernsatz,
    "",
    `Wichtigste Auffälligkeit: ${a.hauptauffaelligkeit}`,
    `Nächster Schritt: ${a.naechsterSchritt}`,
    "",
    DISCLAIMER,
  ];
  return L.join("\n");
}

export function buildPruefnotiz(s: MvrState): string {
  const a = analysiere(s);
  const e = a.ergebnis;
  const curYear = Number(s.stamm.jahr) || new Date().getFullYear();
  const L: string[] = [];
  L.push("KANZLEIINTERNE PRÜFNOTIZ – MITTELVERWENDUNGSRECHNUNG");
  L.push("=".repeat(60));
  L.push(`Mandant: ${s.stamm.name || "(ohne)"} · Rechtsform: ${s.stamm.rechtsform} · WJ ${s.stamm.jahr}`);
  L.push(`Bearbeiter/in: ${s.stamm.bearbeiter || "—"} · Review: ${s.stamm.reviewStatus}`);
  L.push(`Gesamtampel: ${ampelLabel(a.gesamt)}`);
  L.push("");
  L.push("1. SACHVERHALT");
  L.push(`Geprüft wird die Mittelverwendung für das Wirtschaftsjahr ${s.stamm.jahr} der ${s.stamm.rechtsform} „${s.stamm.name || "—"}" (Gemeinnützigkeit: ${s.stamm.gemeinnuetzig}).`);
  L.push("");
  L.push("2. DATENGRUNDLAGE");
  L.push(`- Stammdaten und Sphäreneinnahmen erfasst (Gesamt: ${fmt(gesamtEinnahmen(s.schwelle))}).`);
  L.push(`- Mittelzuflüsse, Mittelverwendung, Vermögen, Rücklagen und Mittelvortrag erfasst.`);
  L.push(`- ${s.spiegel.length} Position(en) im Rücklagenspiegel, ${s.mittelvortrag.length} Mittelvortragsposition(en).`);
  L.push("");
  L.push("3. 45.000-€-SCHWELLENPRÜFUNG");
  L.push(`Gesamteinnahmen ${fmt(gesamtEinnahmen(s.schwelle))} – Ampel ${ampelLabel(a.schwelle.ampel)}.`);
  L.push(`${a.schwelle.hinweis}`);
  L.push("");
  L.push("4. ZEITNAH ZU VERWENDENDE MITTEL");
  L.push(`Summe: ${fmt(e.zeitnah)} (Zuflussjahr ${s.zufluesse.zuflussjahr}).`);
  L.push("");
  L.push("5. ZWECKENTSPRECHENDE MITTELVERWENDUNG");
  L.push(`Summe: ${fmt(e.zweckentsprechend)} (ideell, Zweckbetrieb, Mittelweitergabe, nutzungsgebundenes AV).`);
  L.push(`Prüfpflichtige Verwendung: ${fmt(pruefpflichtigeVerwendung(s.verwendung))}.`);
  L.push("");
  L.push("6. RÜCKLAGENPRÜFUNG");
  L.push(`Freie Rücklage max. zulässig: ${fmt(a.freie.maxZuluessig)} – geplant: ${fmt(a.freie.geplant)} – Differenz: ${fmt(a.freie.differenz)} (${ampelLabel(a.freie.ampel)}).`);
  L.push(`Zweckgebundene Rücklagen: ${s.zweckRuecklagen.length} · Betriebsmittel: ${fmt(betriebsmittelSumme(s.betriebsmittel))} · Wiederbeschaffung: ${s.wiederbeschaffung.length}.`);
  L.push(`Summe zulässige Rücklagen: ${fmt(e.ruecklagen)}.`);
  L.push("");
  L.push("7. MITTELVORTRAG / ZWEI-JAHRES-FRIST");
  if (s.mittelvortrag.length === 0) L.push("Keine Mittelvortragspositionen erfasst.");
  else s.mittelvortrag.forEach((m) => {
    const st = fristStatus(m, curYear);
    L.push(`- Zufluss ${m.zuflussjahr}: ${fmt(m.betrag)} · offen ${fmt(st.offen)} · Frist ${st.fristende} (${st.status}).`);
  });
  L.push("");
  L.push("8. VERWENDUNGSÜBERHANG");
  L.push(`Rechnerisch: ${fmt(e.verwendungsueberhang)} (${ampelLabel(a.gesamt)}).`);
  L.push("");
  L.push("9. OFFENE PUNKTE");
  if (a.findings.length === 0) L.push("- keine");
  else a.findings.forEach((f) => L.push(`- [${ampelLabel(f.level)}] ${f.text}`));
  if (a.fehlendeUnterlagen.length > 0) {
    L.push("Fehlende Unterlagen:");
    a.fehlendeUnterlagen.forEach((u) => L.push(`- ${u}`));
  }
  L.push("");
  L.push("10. REVIEW-HINWEIS");
  L.push(REVIEW_NOTE);
  L.push("");
  L.push(DISCLAIMER);
  return L.join("\n");
}

export function buildMandant(s: MvrState): string {
  const a = analysiere(s);
  const e = a.ergebnis;
  const L: string[] = [];
  L.push(`Hinweise zur Mittelverwendung ${s.stamm.jahr}`);
  L.push("");
  L.push(`Gesamtbild: ${ampelLabel(a.gesamt).toUpperCase()}.`);
  L.push("");
  L.push(`Im Jahr ${s.stamm.jahr} sind bei Ihnen rund ${fmt(e.zeitnah)} an Mitteln eingegangen, die zeitnah – das heißt innerhalb von zwei Jahren – für Ihre satzungsmäßigen Zwecke verwendet werden müssen. Davon wurden ${fmt(e.zweckentsprechend)} direkt für den ideellen Bereich, den Zweckbetrieb oder die Mittelweitergabe eingesetzt. Weitere ${fmt(e.ruecklagen)} wurden in zulässige Rücklagen gestellt.`);
  L.push("");
  if (e.verwendungsueberhang > 0) {
    L.push(`Rechnerisch verbleibt ein Überhang von ${fmt(e.verwendungsueberhang)}. Das bedeutet nicht automatisch ein Problem, muss aber erklärt werden – entweder durch zusätzliche Rücklagen, durch Vermögenszuführungen oder durch geplante Projekte im Folgejahr.`);
    L.push("");
  }
  if (a.fehlendeUnterlagen.length > 0) {
    L.push("Bitte stellen Sie uns folgende Unterlagen zur Verfügung, damit wir die Rechnung sauber abschließen können:");
    a.fehlendeUnterlagen.forEach((u) => L.push(`- ${u}`));
    L.push("");
  }
  L.push("Warum sind Rücklagen-Beschlüsse so wichtig?");
  L.push("Das Finanzamt erkennt eine Rücklage nur dann an, wenn klar dokumentiert ist, wofür die Mittel zurückgelegt werden, wann sie verwendet werden sollen und wer das beschlossen hat. Ein formloser Vorstandsbeschluss mit Projektbeschreibung, Finanzierungs- und Zeitplan reicht in der Regel. Ohne diese Dokumentation kann die Rücklage steuerlich nicht stehen bleiben und wirkt wie nicht zeitnah verwendete Mittel.");
  L.push("");
  L.push(DISCLAIMER);
  return L.join("\n");
}

export function buildVorstand(s: MvrState): string {
  const a = analysiere(s);
  const L: string[] = [];
  L.push(`Vorstandsvorlage – Rücklagenbeschlüsse ${s.stamm.jahr}`);
  L.push("=".repeat(60));
  L.push(`Körperschaft: ${s.stamm.name || "(ohne)"}`);
  L.push("");
  if (a.beschluesse.length === 0) {
    L.push("Es liegen aktuell keine zuführungsfähigen Rücklagen vor.");
  } else {
    a.beschluesse.forEach((b, i) => {
      L.push(`Beschluss ${i + 1}: ${b.art}`);
      L.push(`Betrag: ${fmt(b.betrag)}`);
      L.push(`Begründung: ${b.begruendung}`);
      L.push("");
    });
  }
  L.push("Beschlussvorschlag:");
  L.push(`„Der Vorstand beschließt die o. g. Rücklagenzuführungen für das Wirtschaftsjahr ${s.stamm.jahr}. Die Rücklagen werden zweckgebunden geführt und gemäß § 62 AO dokumentiert."`);
  L.push("");
  L.push("Dokumentationshinweis:");
  L.push("Zu jedem Beschluss sind aufzubewahren: Beschlussprotokoll mit Datum, Projekt-/Verwendungsbeschreibung, Finanzierungs- und Zeitplan, Nachweis der Mittelherkunft sowie spätere Auflösungs-/Verwendungsdokumentation.");
  L.push("");
  L.push(DISCLAIMER);
  return L.join("\n");
}

export function buildRueckfragen(s: MvrState): string {
  const a = analysiere(s);
  return ["Rückfragen an den Mandanten", "", ...a.rueckfragen.map((q, i) => `${i + 1}. ${q}`), "", DISCLAIMER].join("\n");
}

export function buildTodos(s: MvrState): string {
  const a = analysiere(s);
  return ["To-do – Mittelverwendungsrechnung", "", ...a.todos.map((t) => `[ ] ${t}`), "", DISCLAIMER].join("\n");
}

export function buildExport(s: MvrState): string {
  const e = berechneErgebnis(s);
  const sw = schwelleAmpel(s.schwelle);
  const fr = berechneFreieRuecklage(s.freieRuecklage);
  const curYear = Number(s.stamm.jahr) || new Date().getFullYear();
  const lines: string[] = [];
  lines.push("MITTELVERWENDUNGSRECHNUNG – ARBEITSHILFE");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("1. STAMMDATEN");
  lines.push(`   Körperschaft: ${s.stamm.name || "(ohne)"}`);
  lines.push(`   Rechtsform: ${s.stamm.rechtsform}`);
  lines.push(`   Wirtschaftsjahr: ${s.stamm.jahr}`);
  lines.push(`   Gewinnermittlung: ${s.stamm.gewinnermittlung}`);
  lines.push(`   Gemeinnützigkeit: ${s.stamm.gemeinnuetzig}`);
  lines.push(`   Bearbeiter/in: ${s.stamm.bearbeiter}`);
  lines.push(`   Review: ${s.stamm.reviewStatus}`);
  lines.push("");
  lines.push("2. SCHWELLENPRÜFUNG (45.000 €)");
  lines.push(`   Gesamteinnahmen: ${fmt(gesamtEinnahmen(s.schwelle))}`);
  lines.push(`   Ampel: ${ampelLabel(sw.ampel)} – ${sw.hinweis}`);
  lines.push("");
  lines.push("3. MITTELZUFLÜSSE");
  lines.push(`   Zeitnah zu verwendende Mittel: ${fmt(e.zeitnah)}`);
  lines.push(`   Vermögenszuführungen § 62 Abs. 3 AO: ${fmt(s.zufluesse.vermoegenszufuehrung62Abs3 + vermoegenszufuehrungSumme(s.vz62Abs3))}`);
  lines.push(`   Grundstockvermögen/Einlagen Stifter: ${fmt(s.zufluesse.grundstockvermoegen + s.zufluesse.einlagenStifter)}`);
  lines.push("");
  lines.push("4. MITTELVERWENDUNG");
  lines.push(`   Zweckentsprechend: ${fmt(e.zweckentsprechend)}`);
  lines.push(`   Prüfpflichtig: ${fmt(pruefpflichtigeVerwendung(s.verwendung))}`);
  lines.push("");
  lines.push("5. RÜCKLAGENRECHNUNG");
  lines.push(`   Freie Rücklage max. zulässig: ${fmt(fr.maxZuluessig)}`);
  lines.push(`   Geplante Zuführung: ${fmt(fr.geplant)}  → Differenz: ${fmt(fr.differenz)} (${ampelLabel(fr.ampel)})`);
  lines.push(`   Zweckgebundene Rücklagen: ${s.zweckRuecklagen.length} Position(en)`);
  lines.push(`   Betriebsmittelrücklage: ${fmt(betriebsmittelSumme(s.betriebsmittel))} (${s.betriebsmittel.monate} Monate)`);
  lines.push(`   Wiederbeschaffungsrücklagen: ${s.wiederbeschaffung.length} Position(en)`);
  lines.push("");
  lines.push("6. RÜCKLAGENSPIEGEL");
  if (s.spiegel.length === 0) lines.push("   (keine Einträge)");
  else s.spiegel.forEach((r) => {
    const end = r.anfangsbestand + r.zufuehrung - r.entnahme;
    lines.push(`   - ${r.art}: Anfang ${fmt(r.anfangsbestand)} +${fmt(r.zufuehrung)} -${fmt(r.entnahme)} = ${fmt(end)} | ${r.zweck}`);
  });
  lines.push("");
  lines.push("7. MITTELVORTRAG / ZWEI-JAHRES-FRIST");
  if (s.mittelvortrag.length === 0) lines.push("   (keine Einträge)");
  else s.mittelvortrag.forEach((m) => {
    const st = fristStatus(m, curYear);
    lines.push(`   - Zufluss ${m.zuflussjahr}: ${fmt(m.betrag)} | offen ${fmt(st.offen)} | Frist ${st.fristende} (${st.status})`);
  });
  lines.push("");
  lines.push("8. VERWENDUNGSÜBERHANG");
  lines.push(`   Rechnerisch: ${fmt(e.verwendungsueberhang)} (${ampelLabel(e.gesamtAmpel)})`);
  lines.push("");
  lines.push("9. OFFENE PUNKTE / HINWEISE");
  if (e.hinweise.length === 0) lines.push("   (keine)");
  else e.hinweise.forEach((h) => lines.push(`   - ${h}`));
  lines.push("");
  lines.push("10. REVIEW-HINWEIS");
  lines.push("   " + REVIEW_NOTE);
  return lines.join("\n");
}
