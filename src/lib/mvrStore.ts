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
  else if (fr.ampel === "gelb") { if (ampel !== "rot") ampel = "gelb"; }
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
