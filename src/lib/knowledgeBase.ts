// Interne Wissensbasis für steuerstoff
// Quelle: kanzleiinterne Arbeitspapiere und Fachunterlagen (nicht öffentlich).
// Die zugrundeliegenden PDFs werden bewusst NICHT mit der App ausgeliefert.
// Hier sind ausschließlich die inhaltlichen Kernaussagen als bearbeiteter
// Fließtext hinterlegt, damit die App Wissens- und Fallfragen beantworten kann.

import { resolveTaxTypeFromText, type TaxType } from "./router/taxTypes";


export type ScenarioType =
  | "innergemeinschaftlicher_erwerb"
  | "innergemeinschaftliche_lieferung"
  | "reverse_charge"
  | "reihengeschaeft"
  | "dreiecksgeschaeft"
  | "grundstuecksleistung"
  | "werklieferung"
  | "werkleistung"
  | "ausfuhrlieferung"
  | "einfuhr"
  | "unentgeltliche_wertabgabe"
  | "verbringen"
  | "lieferung_inland"
  | "sonstige_leistung"
  | "sonstiges";

export interface KBExpectation {
  /** Erwartete Steuerart (Kategorie-Bereich), z. B. "Umsatzsteuer". */
  steuerart?: string;
  /** Erwarteter Sachverhaltstyp der Klassifizierung. */
  scenarioType?: ScenarioType;
  /** Mindestens einer dieser Paragraphen muss in der Antwort auftauchen. */
  paragraphen?: string[];
  /** Wenn true: Assistent darf bei diesem Prompt KEINE Rückfragen stellen. */
  mustNotAskFollowup?: boolean;
}

export interface KBEntry {
  id: string;
  title: string;
  short?: string;
  /** Kategorie — bewusst offen gehalten, damit neue Rechtsgebiete ohne Migration ergänzt werden können. */
  category: string;
  body: string;
  /** Interner Quellenhinweis (nicht öffentlich verlinkt). */
  source?: string;
  /** Trigger für Wissensfrage-Erkennung. Regex, Regex-Quelltext-String oder Liste von Strings/Regexen. */
  keywords?: RegExp | string | (RegExp | string)[];
  references?: string[];
  /** Umsatzsteuerlicher Sachverhaltstyp — für gezielte KB-Suche nach Klassifizierung. */
  scenarioType?: ScenarioType;
  /** Übergeordnete Steuerart — für hierarchische KB-Filterung (Router → Steuerart → Sachverhalt). */
  taxType?: TaxType;
  /** Feinerer Unterfall (frei, z. B. "entfernungspauschale"). */
  subCase?: string;
  /** Optionaler Testprompt für die automatische KB-Regression. Wenn leer, wird ein Prompt aus title+keywords synthetisiert. */
  testPrompt?: string;
  /** Optionale Erwartungen für die Regressionsprüfung. */
  expect?: KBExpectation;
  /** Optionale Metadaten für importierte Gesetzesbausteine. */
  law?: string;
  paragraph?: string;
  paragraphNumber?: number;
  type?: "gesetz" | "verwaltung" | "rechtsprechung" | "praxis";
  importance?: number;
  [key: string]: unknown;
}

/** TaxType eines KB-Eintrags — explizit oder heuristisch aus category/title/id. */
export function resolveTaxType(e: KBEntry): TaxType | null {
  if (e.taxType) return e.taxType;
  const hay = `${e.category} ${e.title} ${e.id}`;
  return resolveTaxTypeFromText(hay);
}



/** Heuristische Ableitung des scenarioType aus id/title, falls kein explizites Feld gesetzt ist. */
export function resolveScenarioType(e: KBEntry): ScenarioType | null {
  if (e.scenarioType) return e.scenarioType;
  const h = `${e.id} ${e.title}`.toLowerCase();
  if (/dreieck/.test(h)) return "dreiecksgeschaeft";
  if (/reihen|kettengesch/.test(h)) return "reihengeschaeft";
  if (/(ig[-_ ]?erwerb|innergemeinschaftlich(er)?[-_ ]?erwerb|\b1a\b)/.test(h)) return "innergemeinschaftlicher_erwerb";
  if (/(ig[-_ ]?lieferung|innergemeinschaftlich(e)?[-_ ]?lieferung|\b6a\b)/.test(h)) return "innergemeinschaftliche_lieferung";
  if (/verbringen/.test(h)) return "verbringen";
  if (/ausfuhr/.test(h)) return "ausfuhrlieferung";
  if (/einfuhr|eust/.test(h)) return "einfuhr";
  if (/wertabgabe|privatnutzung|privatentnahme|kfz.*(1[-_ ]?prozent|wertabgabe)/.test(h)) return "unentgeltliche_wertabgabe";
  if (/werklieferung/.test(h)) return "werklieferung";
  if (/werkleistung/.test(h)) return "werkleistung";
  if (/grundst|immobilie|geb(ä|ae)ude|tennishalle/.test(h)) return "grundstuecksleistung";
  if (/reverse[-_ ]?charge|\b13b\b/.test(h)) return "reverse_charge";
  return null;
}


/** Trigger-Wert in RegExp konvertieren (Pipe-Strings/Arrays zulassen). */
// Regex-Metazeichen, an denen wir erkennen, dass eine Alternative bereits
// ein bewusst geschriebenes Regex-Fragment ist (dann NICHT mit Wortgrenzen
// umschließen).
const REGEX_META = /[\\()[\]{}?*+^$.]/;

/**
 * Baut aus KB-`keywords` (Regex, String oder Mischliste) einen einzigen Matcher.
 *
 * Kritischer Punkt: reine Wort-Alternativen wie `"eu"` oder `"estg"` werden mit
 * Wortgrenzen (via Lookaround auf Unicode-Buchstaben/Ziffern) umschlossen, damit
 * `eu` NICHT innerhalb von `Steuer` matcht. Ohne diese Absicherung matchen kurze
 * Tokens quer durch die KB und führen zu fachfremden Treffern (z. B. § 1a EStG
 * bei „Wie viel Steuer fällt auf Cola“).
 */
export function kbKeywordsToRegExp(k: KBEntry["keywords"]): RegExp {
  if (!k) return /$^/;
  if (k instanceof RegExp) return k;
  const raw = Array.isArray(k)
    ? k.map((p) => (p instanceof RegExp ? p.source : String(p)))
    : [String(k)];
  const parts: string[] = [];
  for (const item of raw) {
    for (const altRaw of item.split("|")) {
      const alt = altRaw.trim();
      if (!alt) continue;
      if (REGEX_META.test(alt)) {
        // bereits Regex-Fragment → wie bisher übernehmen
        parts.push(alt);
        continue;
      }
      // reine Wort-/Phrasen-Alternative → escapen und mit Unicode-Wortgrenzen umgeben
      const escaped = alt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      parts.push(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`);
    }
  }
  if (parts.length === 0) return /$^/;
  return new RegExp(parts.join("|"), "iu");
}

export const KNOWLEDGE_BASE: KBEntry[] = [
  {
    id: "ruecklage-allgemein",
    title: "Rücklage — Grundlagen und Abgrenzungen",
    short:
      "Allgemeine Rücklage, steuerliche Spezialrücklage, gemeinnützigkeitsrechtliche Rücklage (§ 62 AO) und Abgrenzung zur Rückstellung.",
    category: "Buchhaltung",
    source: "Internes Arbeitspapier — Begriffsabgrenzung Rücklage / Rückstellung.",
    keywords: /(^|\s)rücklage(n)?($|\s)|gewinnrücklage|kapitalrücklage|rückstellung\s+(und|vs|gegen)\s+rücklage|unterschied\s+rücklage/i,
    references: ["§ 62 AO", "§ 266 HGB", "§ 249 HGB"],
    body: `Eine Rücklage ist zurückbehaltenes Eigenkapital bzw. ein zweckgebundener oder freier Betrag, der nicht unmittelbar ausgeschüttet oder verwendet wird. Im steuerlichen Kontext muss man unterscheiden, welche Art von Rücklage gemeint ist.

1) Allgemeine Rücklage
- Eigenkapitalposition (Passivseite der Bilanz).
- Beispiele: Gewinnrücklage, Kapitalrücklage, gesetzliche Rücklage (§ 5a Abs. 3 GmbHG bei der UG).
- Dient der Stärkung des Eigenkapitals.

2) Steuerliche Spezialrücklage
- Spezialregelungen erlauben in bestimmten Fällen die Bildung steuerlicher Rücklagen oder Übertragungen, z. B. § 6b EStG (Reinvestitionsrücklage), § 7g EStG (Investitionsabzugsbetrag — keine echte Rücklage, sondern außerbilanzielle Kürzung) oder Ersatzbeschaffungsrücklage (R 6.6 EStR).
- Abhängig vom konkreten Steuertatbestand.

3) Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO
- Relevant für Vereine, gGmbHs, gUGs, Stiftungen und sonstige NPOs.
- Arten: freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage, Rücklage zum Erwerb von Gesellschaftsrechten.
- Mittel, die in eine zulässige Rücklage eingestellt werden, gelten als verwendet und sind der zeitnahen Mittelverwendung entzogen.
- Dokumentation über Beschluss, Mittelverwendungsrechnung und Rücklagenspiegel.

4) Abgrenzung zur Rückstellung
- Rückstellung = Fremdkapital. Sie bildet ungewisse Verbindlichkeiten oder drohende Belastungen ab (Höhe oder Fälligkeit unsicher) — § 249 HGB.
- Rücklage = Eigenkapital bzw. Mittelbindung.
- Beispiele für Rückstellungen: Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung, Prozesskostenrückstellung.

Review-Hinweis: Bei Mandantenfragen zuerst klären, ob eine allgemeine bilanzielle Rücklage, eine steuerliche Spezialrücklage oder eine § 62 AO-Rücklage gemeint ist.`,
  },
{
  id: "einkommensteuerreform-2027-koalitionsausschuss-juli-2026",

  title:
    "Einkommensteuerreform 2027 – Ergebnisse des Koalitionsausschusses vom 02.07.2026",

  short:
    "Die Regierungskoalition plant zum 01.01.2027 eine Einkommensteuerreform zur Entlastung kleiner und mittlerer Einkommen. Vorgesehen sind unter anderem höhere Freibeträge, mehr Kindergeld, ein höherer Arbeitnehmer-Pauschbetrag und eine Abflachung des Einkommensteuertarifs. Zur Gegenfinanzierung sollen Spitzeneinkommen stärker belastet sowie einzelne Steuervergünstigungen reduziert werden. Es handelt sich noch nicht um geltendes Recht.",

  category:
    "Einkommensteuer",

  topicType: "politische-reformplanung",

  sourceDate: "2026-07-02",

  verifiedAt: "2026-07-14",

  plannedEffectiveDate: "2027-01-01",

  plannedFullEffectFrom: "2028-01-01",

  status:
    "Beschluss des Koalitionsausschusses – noch kein verabschiedetes Gesetz",

  legalStatus: {
    enacted: false,
    cabinetDraftAvailable: false,
    governmentDraftAvailable: false,
    bundestagApproved: false,
    bundesratApproved: false,
    publishedInFederalGazette: false,
    bindingLaw: false
  },

  warning:
    "Die dargestellten Maßnahmen sind politische Reformpläne. Bundestag und gegebenenfalls Bundesrat müssen den gesetzlichen Änderungen noch zustimmen. Beträge, Voraussetzungen, Anwendungszeitpunkte und Übergangsregelungen können sich im Gesetzgebungsverfahren ändern.",

  keywords:
    "einkommensteuerreform 2027|steuerreform 2027|koalitionsausschuss juli 2026|programm für aufschwung und beschäftigung|grundfreibetrag 2027|grundfreibetrag 2028|12900 euro|kindergeld 272 euro|arbeitnehmer-pauschbetrag 1430 euro|reichensteuer 45 prozent|reichensteuer 47 prozent|zve 250000|zve 280000|minijob pauschalsteuer 5 prozent|handwerkerleistungen 15 prozent|handwerkerbonus 900 euro|sonntagszuschlag|feiertagszuschlag|grundlohn 75 euro|§ 3b estg|abfindung neue beschäftigung|steuerentlastung familien|kleine und mittlere einkommen|gesetzgebungsverfahren|politischer plan|noch kein geltendes recht",

  references: [
    "§ 3b EStG",
    "§ 9a Satz 1 Nr. 1 Buchst. a EStG",
    "§ 24 Nr. 1 Buchst. a EStG",
    "§ 32a Abs. 1 EStG",
    "§ 32 Abs. 6 EStG",
    "§ 34 Abs. 1 und Abs. 2 Nr. 2 EStG",
    "§ 35a Abs. 3 EStG",
    "§ 40a Abs. 2 EStG",
    "§ 66 Abs. 1 EStG",
    "Ergebnisse des Koalitionsausschusses vom 02.07.2026",
    "Programm für Aufschwung und Beschäftigung",
    "BMF-Information zur Einkommensteuerreform vom 02.07.2026"
  ],

  officialSources: [
    "https://www.bundesregierung.de/resource/blob/2196306/2445592/344cc50b4c10a5939658e3fc0a5fd93f/2026-07-02-koaausschuss-data.pdf?download=1",
    "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/koalitionsausschuss-einigung-auf-steuerentlastung.html",
    "https://www.bundesregierung.de/breg-de/aktuelles/reformen-rente-arbeitsmarkt-steuern-2445598",
    "https://www.gesetze-im-internet.de/estg/__3b.html",
    "https://www.gesetze-im-internet.de/estg/__9a.html",
    "https://www.gesetze-im-internet.de/estg/__32a.html",
    "https://www.gesetze-im-internet.de/estg/__35a.html",
    "https://www.gesetze-im-internet.de/estg/__40a.html",
    "https://www.gesetze-im-internet.de/estg/__66.html"
  ],

  currentLaw2026: {
    grundfreibetragSingle: 12348,
    grundfreibetragJointAssessmentTariffEquivalent: 24696,
    kindergeldMonthlyPerChild: 259,
    employeeLumpSum: 1230,
    richTaxRate: 45,
    richTaxThresholdSingle: 277826,
    minijobFlatTaxRatePercent: 2,
    craftsmanTaxReductionPercent: 20,
    craftsmanMaximumTaxReduction: 1200,
    section3bMaximumBasicHourlyWage: 50
  },

  plannedChanges: [
    {
      measure: "Grundfreibetrag",
      currentValue2026: "12.348 €",
      plannedValue2028: "voraussichtlich 12.900 €",
      implementation: "voraussichtlich zweistufig in den Jahren 2027 und 2028",
      legalBasisCurrent: "§ 32a Abs. 1 Satz 2 Nr. 1 EStG",
      status: "Betrag noch nicht endgültig festgelegt",
      note:
        "Bei Anwendung des Splittingverfahrens entspricht der steuerfreie Tarifbereich grundsätzlich dem Doppelten des Grundfreibetrags."
    },

    {
      measure: "Kinderfreibetrag",
      currentValue2026: "geltender Betrag nach § 32 Abs. 6 EStG",
      plannedValue2028: "Erhöhung vorgesehen",
      implementation: "voraussichtlich zweistufig",
      legalBasisCurrent: "§ 32 Abs. 6 EStG",
      status: "Konkreter Betrag noch nicht endgültig festgelegt",
      note:
        "Die endgültige Bezifferung soll insbesondere unter Berücksichtigung des Existenzminimumberichts erfolgen."
    },

    {
      measure: "Kindergeld",
      currentValue2026: "259 € monatlich je Kind",
      plannedValue2028: "voraussichtlich 272 € monatlich je Kind",
      implementation: "voraussichtlich zweistufig in den Jahren 2027 und 2028",
      legalBasisCurrent: "§ 66 Abs. 1 EStG",
      status: "Betrag noch nicht endgültig festgelegt"
    },

    {
      measure: "Arbeitnehmer-Pauschbetrag",
      currentValue2026: "1.230 € jährlich",
      plannedValue2028: "voraussichtlich 1.430 € jährlich",
      change: "+ 200 €",
      legalBasisCurrent: "§ 9a Satz 1 Nr. 1 Buchst. a EStG",
      status: "Betrag noch nicht endgültig festgelegt"
    },

    {
      measure: "Einkommensteuertarif",
      currentValue2026:
        "geltender Tarif gemäß § 32a Abs. 1 EStG; Spitzensteuersatz von 42 % derzeit ab 69.879 € zvE",
      plannedValue:
        "Abflachung der zweiten Progressionszone und Rechtsverschiebung des Spitzensteuersatzes",
      plannedThreshold:
        "42 % sollen nach den bisherigen Planungen erst ab 70.600 € zvE greifen",
      legalBasisCurrent: "§ 32a Abs. 1 EStG",
      status:
        "Tarifformel und endgültige Grenzbeträge müssen gesetzlich festgelegt werden"
    },

    {
      measure: "Reichensteuer – erste Stufe",
      currentValue2026:
        "45 % ab einem zu versteuernden Einkommen von 277.826 €",
      plannedValue2027:
        "45 % ab einem zu versteuernden Einkommen von 250.000 €",
      legalBasisCurrent: "§ 32a Abs. 1 Satz 2 Nr. 5 EStG",
      purpose: "Gegenfinanzierung der Entlastungsmaßnahmen",
      status:
        "Geplante Absenkung der Einkommensgrenze; noch nicht geltendes Recht"
    },

    {
      measure: "Reichensteuer – neue zweite Stufe",
      currentValue2026: "keine gesonderte 47-%-Tarifstufe",
      plannedValue2027:
        "47 % ab einem zu versteuernden Einkommen von 280.000 €",
      legalBasisPlanned:
        "voraussichtliche Änderung des Einkommensteuertarifs in § 32a EStG",
      purpose: "Gegenfinanzierung der Entlastungsmaßnahmen",
      status: "Neue Tarifstufe bislang nur politisch vereinbart"
    },

    {
      measure: "Pauschalsteuer bei Minijobs",
      currentValue2026: "2 % des Arbeitsentgelts",
      plannedValue2027: "5 % des Arbeitsentgelts",
      legalBasisCurrent: "§ 40a Abs. 2 EStG",
      taxpayer:
        "Die Pauschalsteuer wird grundsätzlich vom Arbeitgeber erhoben",
      status: "Geplante Erhöhung; noch nicht geltendes Recht"
    },

    {
      measure: "Steuerermäßigung für Handwerkerleistungen",
      currentValue2026:
        "20 % der begünstigten Arbeitskosten, höchstens 1.200 € jährlich",
      plannedValue2027:
        "15 % der begünstigten Arbeitskosten, höchstens 900 € jährlich",
      legalBasisCurrent: "§ 35a Abs. 3 EStG",
      excludedCosts:
        "Materialkosten sind grundsätzlich nicht begünstigt",
      affectedMeasures:
        "Renovierungs-, Erhaltungs- und Modernisierungsmaßnahmen",
      status:
        "Geplante Reduzierung einer Steuervergünstigung; noch nicht geltendes Recht"
    },

    {
      measure: "Steuerfreie Sonn- und Feiertagszuschläge",
      currentValue2026:
        "Berechnung der Steuerfreiheit grundsätzlich höchstens auf Basis eines Grundlohns von 50 € je Stunde",
      plannedValue2027:
        "Erhöhung der Obergrenze auf einen Grundlohn von 75 € je Stunde",
      legalBasisCurrent: "§ 3b Abs. 1 und Abs. 2 Satz 1 EStG",
      plannedEffectiveDate: "2027-01-01",
      status: "Geplante Erhöhung; noch nicht geltendes Recht",
      warning:
        "Der Koalitionsbeschluss bezieht sich ausdrücklich auf Sonn- und Feiertagszuschläge. Daraus darf ohne Gesetzestext nicht automatisch geschlossen werden, dass sämtliche Regelungen für Nachtzuschläge ebenfalls geändert werden."
    },

    {
      measure:
        "Beitragsfreiheit tarifvertraglicher Sonn- und Feiertagszuschläge",
      currentValue2026:
        "Beitragsrecht richtet sich nach den geltenden sozialversicherungsrechtlichen Vorschriften",
      plannedValue2027:
        "Steuerfreie Zuschläge im Regelungsbereich eines Tarifvertrags sollen vollständig beitragsfrei gestellt werden",
      legalBasisPlanned:
        "sozialversicherungsrechtliche Umsetzung noch offen",
      status:
        "Konkrete gesetzliche Ausgestaltung und Abgrenzung noch nicht bekannt"
    },

    {
      measure: "Steuerliche Begünstigung von Abfindungen",
      currentValue2026:
        "Entschädigungen können unter den Voraussetzungen der §§ 24 und 34 EStG tarifbegünstigt sein",
      plannedValue2027:
        "Zusätzliche steuerliche Privilegierung bei zügiger Aufnahme einer neuen Erwerbstätigkeit",
      principle:
        "Der Vorteil soll umso größer sein, je schneller eine neue Beschäftigung aufgenommen wird",
      legalBasisCurrent:
        "insbesondere § 24 Nr. 1 Buchst. a und § 34 Abs. 1, Abs. 2 Nr. 2 EStG",
      legalBasisPlanned:
        "noch nicht benannt",
      status:
        "Keine konkreten Fristen, Berechnungsformeln oder Tatbestandsvoraussetzungen veröffentlicht"
    }
  ],

  body: `
⇨ Einkommensteuerreform 2027

► Ergebnisse des Koalitionsausschusses vom 02.07.2026

⇨ 1. Rechtsstand

Die Regierungskoalition hat Anfang Juli 2026 ein „Programm für Aufschwung und Beschäftigung“ beschlossen.

Ein wesentlicher Bestandteil ist eine geplante Reform der Einkommensteuer.

Die Reform soll

- zum 01.01.2027 in Kraft treten und
- ab dem Jahr 2028 ihre volle Entlastungswirkung erreichen.

Das jährliche Entlastungsvolumen soll insgesamt rund 10 Mrd. € betragen.

► Achtung

Bei den Ergebnissen des Koalitionsausschusses handelt es sich noch nicht um geltendes Recht.

Erforderlich sind insbesondere:

1. die Erarbeitung eines Gesetzentwurfs,

2. das parlamentarische Gesetzgebungsverfahren,

3. die Zustimmung des Bundestags,

4. je nach Ausgestaltung die Beteiligung beziehungsweise Zustimmung des Bundesrats,

5. die Ausfertigung und

6. die Verkündung im Bundesgesetzblatt.

Bis dahin können

- Beträge,
- Einkommensgrenzen,
- Tatbestandsvoraussetzungen,
- Anwendungszeitpunkte,
- Übergangsregelungen und
- Gegenfinanzierungsmaßnahmen

geändert, ergänzt oder gestrichen werden.

⇨ Zentraler Lernsatz

**Der Beschluss des Koalitionsausschusses ist eine politische Einigung, aber noch keine unmittelbar anwendbare Rechtsgrundlage.**

---

⇨ 2. Zielsetzung der Reform

Die Reform soll vor allem

- Steuerpflichtige mit kleinen Einkommen,
- Steuerpflichtige mit mittleren Einkommen,
- Familien mit Kindern und
- gewerbliche Personenunternehmen

entlasten.

Die Entlastung soll insbesondere durch folgende Maßnahmen erreicht werden:

1. Erhöhung des Grundfreibetrags,

2. Erhöhung des Kinderfreibetrags,

3. Erhöhung des Kindergelds,

4. Erhöhung des Arbeitnehmer-Pauschbetrags,

5. Abflachung der zweiten Progressionszone und

6. Verschiebung des Beginns des Spitzensteuersatzes.

► Lernsatz

⇶ Der Schwerpunkt der geplanten Einkommensteuerreform liegt auf der Entlastung kleiner und mittlerer Einkommen sowie von Familien mit Kindern.

---

⇨ 3. Grundfreibetrag

► Geltendes Recht 2026

Der Grundfreibetrag beträgt im Jahr 2026

12.348 €

für einzeln veranlagte Steuerpflichtige.

⇶ Rechtsgrundlage

§ 32a Abs. 1 Satz 2 Nr. 1 EStG.

Bis zur Höhe des Grundfreibetrags beträgt die tarifliche Einkommensteuer grundsätzlich 0 €.

Bei zusammen veranlagten Ehegatten oder Lebenspartnern wirkt sich der Grundfreibetrag aufgrund des Splittingverfahrens grundsätzlich doppelt aus.

Dies entspricht für 2026 einem Betrag von

12.348 € × 2 = 24.696 €.

►  Reformplanung

Der Grundfreibetrag soll voraussichtlich in zwei Stufen bis zum Jahr 2028 auf

12.900 €

angehoben werden.

Bei entsprechender Anwendung des Splittingtarifs würde dies rechnerisch einem Betrag von

12.900 € × 2 = 25.800 €

entsprechen.

►  Vorläufigkeit

Der endgültige Grundfreibetrag soll erst

- im Gesetzgebungsverfahren und
- nach Vorliegen des Existenzminimumberichts

festgelegt werden.

► Lernsatz

Der für 2028 genannte Grundfreibetrag von 12.900 € ist bislang ein voraussichtlicher Planwert und noch kein gesetzlich festgelegter Betrag.

---

⇨ 4. Kindergeld

► Geltendes Recht 2026

Das Kindergeld beträgt im Jahr 2026

259 € monatlich für jedes Kind.

⇶ Rechtsgrundlage

§ 66 Abs. 1 EStG.

► Reformplanung

Das Kindergeld soll voraussichtlich in zwei Stufen bis zum Jahr 2028 auf

272 € monatlich für jedes Kind

angehoben werden.

► Veränderung

272 €  
./. 259 €  
= 13 € monatliche Erhöhung je Kind

Jährliche rechnerische Mehrleistung je Kind:

13 € × 12 Monate = 156 €.

⇶ Achtung

Auch der geplante Betrag von 272 € ist noch nicht abschließend gesetzlich festgelegt.

► Lernsatz

Das Kindergeld soll nach den Reformplänen bis 2028 voraussichtlich von 259 € auf 272 € monatlich je Kind steigen.

---

► 5. Kinderfreibetrag

Neben dem Kindergeld soll auch der Kinderfreibetrag erhöht werden.

⇶ Rechtsgrundlage des geltenden Rechts

§ 32 Abs. 6 EStG.

Die konkrete Höhe des künftigen Kinderfreibetrags wurde im Koalitionsbeschluss noch nicht abschließend festgelegt.

Sie soll insbesondere unter Berücksichtigung des Existenzminimumberichts bestimmt werden.

► Lernsatz

Kindergeld und Kinderfreibetrag sollen erhöht werden; die endgültigen Beträge werden erst im Gesetzgebungsverfahren festgelegt.

---

► 6. Arbeitnehmer-Pauschbetrag

Geltendes Recht 2026

Der Arbeitnehmer-Pauschbetrag beträgt

*1.230 € jährlich.**

⇶  Rechtsgrundlage

§ 9a Satz 1 Nr. 1 Buchst. a EStG.

Der Pauschbetrag wird bei den Einkünften aus nichtselbständiger Arbeit berücksichtigt, soweit keine höheren Werbungskosten nachgewiesen werden.

► Reformplanung

Der Arbeitnehmer-Pauschbetrag soll voraussichtlich um 200 € erhöht werden.

Geplanter Betrag:

1.230 € + 200 € = **1.430 €

⇶  Bedeutung

Arbeitnehmer mit tatsächlichen Werbungskosten unterhalb des Pauschbetrags können von der Erhöhung profitieren, ohne einzelne Aufwendungen nachweisen zu müssen.

⇶  Lernsatz

**Der Arbeitnehmer-Pauschbetrag soll voraussichtlich von 1.230 € auf 1.430 € steigen.**

⇶  Achtung

Der Betrag von 1.430 € ist noch nicht endgültig gesetzlich festgelegt.

---

⇨ 7. Abflachung des Einkommensteuertarifs

Die zweite Progressionszone des Einkommensteuertarifs soll abgeflacht werden.

Gleichzeitig soll die Einkommensgrenze, ab der der Spitzensteuersatz von 42 % greift, nach rechts verschoben werden.

Nach den bisherigen Angaben soll der Spitzensteuersatz von 42 % künftig erst ab einem zu versteuernden Einkommen von etwa

**70.600 €**

greifen.

⇶  Rechtsgrundlage des geltenden Tarifs

§ 32a Abs. 1 EStG.

⇶  Bedeutung

Eine Rechtsverschiebung bedeutet, dass der höhere Steuersatz erst bei einem höheren zu versteuernden Einkommen erreicht wird.

⇶  Lernsatz

**Die geplante Tarifverschiebung soll den sogenannten Mittelstandsbauch abmildern und den Spitzensteuersatz etwas später einsetzen lassen.**

---

⇨ 8. Entlastungsbeispiel für Familien

Nach einer Berechnung des Bundesministeriums der Finanzen soll ab dem Jahr 2028 eine vierköpfige Familie

- mit zwei Kindern und
- zwei mittleren Einkommen beziehungsweise einem Haushaltseinkommen von etwa 60.000 €

gegenüber dem heutigen Stand um mehr als

**600 € jährlich**

entlastet werden.

⇶  Achtung

Dabei handelt es sich um eine Modellrechnung beziehungsweise erste Schätzung.

Die tatsächliche Entlastung hängt unter anderem ab von

- der endgültigen Tarifformel,
- dem individuellen zu versteuernden Einkommen,
- der Veranlagungsart,
- der Anzahl der Kinder,
- dem Kinderfreibetrag,
- dem Kindergeld,
- den Sozialversicherungsbeiträgen und
- den persönlichen Abzugsbeträgen.

⇶  Lernsatz

**Die angekündigte Entlastung von mehr als 600 € ist ein Berechnungsbeispiel und kein pauschaler Anspruch jedes Vierpersonenhaushalts.**

---

⇨ 9. Gegenfinanzierung durch Änderung der Reichensteuer

Die Entlastungen sollen insbesondere durch eine stärkere Belastung sehr hoher Einkommen mitfinanziert werden.

► Geltendes Recht 2026

Der Steuersatz von 45 % gilt derzeit ab einem zu versteuernden Einkommen von

**277.826 €.**

⇶  Rechtsgrundlage

§ 32a Abs. 1 Satz 2 Nr. 5 EStG.

► Reformplanung: erste Stufe

Ab einem zu versteuernden Einkommen von

**250.000 €**

soll künftig ein Steuersatz von

**45 %**

gelten.

► Reformplanung: neue zweite Stufe

Ab einem zu versteuernden Einkommen von

**280.000 €**

soll künftig ein Steuersatz von

**47 %**

gelten.

⇶  Übersicht

Bis unter 250.000 € zvE:

Anwendung des allgemeinen Einkommensteuertarifs.

Ab 250.000 € zvE:

45 % Reichensteuersatz.

Ab 280.000 € zvE:

47 % neue erhöhte Tarifstufe.

⇶  Achtung

Die genaue Tarifformel, der Umgang mit dem Splittingverfahren sowie Übergangs- und Rundungsregelungen müssen erst gesetzlich geregelt werden.

⇶  Lernsatz

**Die Reichensteuer soll künftig zweistufig ausgestaltet werden: 45 % ab 250.000 € und 47 % ab 280.000 € zu versteuerndem Einkommen.**

---

⇨ 10. Pauschalsteuer bei Minijobs

► Geltendes Recht

Der Arbeitgeber kann die Lohnsteuer bei einer geringfügigen Beschäftigung unter den gesetzlichen Voraussetzungen mit einem einheitlichen Pauschsteuersatz von

**2 %**

des Arbeitsentgelts erheben.

⇶  Rechtsgrundlage

§ 40a Abs. 2 EStG.

► Reformplanung

Der Pauschalsteuersatz soll von

2 % auf **5 %**

angehoben werden.

⇶  Bedeutung

Die Maßnahme betrifft grundsätzlich die vom Arbeitgeber zu tragende beziehungsweise zu erhebende Pauschalsteuer.

Sie bedeutet nicht automatisch, dass dem Minijobber unmittelbar 5 % vom Arbeitsentgelt abgezogen werden.

Ob und in welchem Umfang der Arbeitgeber die Pauschalsteuer arbeitsrechtlich auf den Arbeitnehmer abwälzen kann, ist gesondert zu beurteilen.

⇶  Lernsatz

**Der Pauschalsteuersatz für Minijobs soll nach den Reformplänen von 2 % auf 5 % steigen.**

---

⇨ 11. Handwerkerleistungen

► Geltendes Recht

Für die Inanspruchnahme von Handwerkerleistungen für

- Renovierungsmaßnahmen,
- Erhaltungsmaßnahmen und
- Modernisierungsmaßnahmen

kann eine Steuerermäßigung beansprucht werden.

Die Ermäßigung beträgt

**20 % der begünstigten Aufwendungen, höchstens 1.200 € jährlich.**

⇶  Rechtsgrundlage

§ 35a Abs. 3 EStG.

Begünstigt sind grundsätzlich Arbeits-, Maschinen- und Fahrtkosten.

Materialkosten sind grundsätzlich nicht begünstigt.

► Reformplanung

Die Steuerermäßigung soll reduziert werden auf

**15 % der begünstigten Aufwendungen, höchstens 900 € jährlich.**

⇶  Beispiel geltendes Recht

Begünstigte Arbeitskosten: 5.000 €

5.000 € × 20 % = 1.000 € Steuerermäßigung.

⇶  Beispiel geplantes Recht

5.000 € × 15 % = 750 € Steuerermäßigung.

⇶  Maximalbetrag

Geltendes Recht:

maximal 1.200 €.

Geplante Reform:

maximal 900 €.

⇶  Lernsatz

**Die Steuerermäßigung für Handwerkerleistungen soll von 20 % beziehungsweise maximal 1.200 € auf 15 % beziehungsweise maximal 900 € reduziert werden.**

---

⇨ 12. Sonn- und Feiertagszuschläge

► Geltendes Recht

Zuschläge für tatsächlich geleistete

- Sonntagsarbeit,
- Feiertagsarbeit und
- Nachtarbeit

können unter den Voraussetzungen des § 3b EStG steuerfrei sein.

Für die Berechnung der Steuerfreiheit ist der Grundlohn derzeit grundsätzlich höchstens mit

**50 € je Stunde**

anzusetzen.

⇶  Rechtsgrundlage

§ 3b Abs. 1 und Abs. 2 Satz 1 EStG.

► Reformplanung

Für steuerlich begünstigte Sonn- und Feiertagszuschläge soll die Obergrenze zum 01.01.2027 auf einen Stundenlohn von

**75 €**

angehoben werden.

⇶  Achtung

Der politische Beschluss nennt ausdrücklich Sonn- und Feiertagszuschläge.

Ohne konkreten Gesetzestext darf nicht unterstellt werden, dass die Erhöhung automatisch in gleicher Weise auf sämtliche Nachtzuschläge übertragen wird.

⇶  Lernsatz

**Die Grundlohngrenze für steuerlich begünstigte Sonn- und Feiertagszuschläge soll zum 01.01.2027 von 50 € auf 75 € je Stunde steigen.**

---

⇨ 13. Beitragsfreiheit tarifvertraglicher Zuschläge

Gleichzeitig sollen steuerfreie Sonn- und Feiertagszuschläge im Regelungsbereich eines Tarifvertrags vollständig beitragsfrei gestellt werden.

Diese Maßnahme betrifft nicht nur das Einkommensteuerrecht, sondern insbesondere das Sozialversicherungsrecht.

Noch offen sind unter anderem:

- die konkrete gesetzliche Grundlage,
- der Begriff des maßgebenden Tarifvertrags,
- die Behandlung allgemeinverbindlicher Tarifverträge,
- die Behandlung arbeitsvertraglicher Bezugnahmeklauseln,
- die genaue Höhe der Beitragsfreiheit und
- das Verhältnis zur steuerrechtlichen Grundlohngrenze.

⇶  Lernsatz

**Die geplante Beitragsfreiheit tarifvertraglicher Zuschläge bedarf einer eigenständigen sozialversicherungsrechtlichen Regelung.**

---

⇨ 14. Steuerliche Begünstigung von Abfindungen

Abfindungszahlungen sollen künftig besonders begünstigt werden, wenn nach der Beendigung eines Arbeitsverhältnisses zügig eine neue Erwerbstätigkeit aufgenommen wird.

Nach der politischen Einigung soll gelten:

**Je schneller eine neue Beschäftigung aufgenommen wird, desto größer soll der steuerliche Vorteil sein.**

► Geltendes Recht

Entschädigungen können bereits nach geltendem Recht unter bestimmten Voraussetzungen tarifbegünstigt sein.

⇶  Rechtsgrundlagen

§ 24 Nr. 1 Buchst. a EStG  
in Verbindung mit  
§ 34 Abs. 1 und Abs. 2 Nr. 2 EStG.

► Noch offene Fragen

Nicht veröffentlicht wurden bislang insbesondere:

1. Innerhalb welcher Frist eine neue Beschäftigung aufgenommen werden muss.

2. Ob die Frist tage-, wochen- oder monatsweise berechnet wird.

3. Wie hoch die jeweilige Steuerbegünstigung sein soll.

4. Ob eine Vollzeitbeschäftigung erforderlich ist.

5. Ob auch Teilzeitbeschäftigungen oder selbständige Tätigkeiten genügen.

6. Ob eine Mindestdauer der neuen Erwerbstätigkeit vorgesehen wird.

7. Wie mit Probezeitkündigungen umzugehen ist.

8. Ob die neue Begünstigung neben der Tarifermäßigung des § 34 EStG angewendet werden kann.

9. Ob Höchstbeträge oder Einkommensgrenzen eingeführt werden.

⇶  Lernsatz

**Eine konkrete Berechnung der geplanten Abfindungsbegünstigung ist derzeit nicht möglich, weil noch keine gesetzlichen Tatbestandsmerkmale oder Berechnungsformeln veröffentlicht wurden.**

---

⇨ 15. Übersicht: geltendes Recht und Reformplanung

► Grundfreibetrag

Geltendes Recht 2026:

12.348 €.

Plan 2028:

voraussichtlich 12.900 €.

► Kindergeld

Geltendes Recht 2026:

259 € monatlich je Kind.

Plan 2028:

voraussichtlich 272 € monatlich je Kind.

► Arbeitnehmer-Pauschbetrag

Geltendes Recht 2026:

1.230 €.

Plan:

voraussichtlich 1.430 €.

► Reichensteuer

Geltendes Recht 2026:

45 % ab 277.826 € zvE.

Plan:

45 % ab 250.000 € zvE;  
47 % ab 280.000 € zvE.

► Minijob-Pauschalsteuer

Geltendes Recht:

2 %.

Plan:

5 %.

► Handwerkerleistungen

Geltendes Recht:

20 %, maximal 1.200 €.

Plan:

15 %, maximal 900 €.

► Grundlohngrenze Sonn- und Feiertagszuschläge

Geltendes Recht:

50 € je Stunde.

Plan ab 01.01.2027:

75 € je Stunde.

► Abfindungen

Geltendes Recht:

Tarifbegünstigung gegebenenfalls nach §§ 24, 34 EStG.

Plan:

zusätzliche Begünstigung bei schneller Aufnahme einer neuen Erwerbstätigkeit; konkrete Ausgestaltung offen.

---

⇨ 16. Prüfungssichere Einordnung

► Frage

Sind die genannten Reformmaßnahmen bereits anzuwenden?

► Antwort

Nein.

Die Ergebnisse des Koalitionsausschusses stellen zunächst eine politische Einigung dar.

Sie entfalten keine unmittelbare Außenwirkung gegenüber Steuerpflichtigen und Finanzbehörden.

Erst ein ordnungsgemäß beschlossenes, ausgefertigtes und im Bundesgesetzblatt verkündetes Gesetz kann die bestehenden gesetzlichen Regelungen ändern.

⇶  Prüfungssatz

**Die im Koalitionsausschuss vereinbarten Maßnahmen sind mangels abgeschlossenen Gesetzgebungsverfahrens noch nicht anzuwenden. Maßgeblich bleibt bis zum Inkrafttreten einer gesetzlichen Neuregelung das geltende Einkommensteuergesetz.**

---

⇨ 17. Kompakte Lernsätze

1. Die Einkommensteuerreform soll zum 01.01.2027 beginnen und ab 2028 ihre volle Wirkung entfalten.

2. Das geplante Entlastungsvolumen beträgt rund 10 Mrd. € jährlich.

3. Der Schwerpunkt liegt auf kleinen und mittleren Einkommen sowie Familien mit Kindern.

4. Der Grundfreibetrag soll bis 2028 voraussichtlich auf 12.900 € steigen.

5. Der Betrag von 12.900 € ist noch nicht endgültig gesetzlich festgelegt.

6. Das Kindergeld soll bis 2028 voraussichtlich auf 272 € monatlich je Kind steigen.

7. Der Arbeitnehmer-Pauschbetrag soll voraussichtlich von 1.230 € auf 1.430 € steigen.

8. Auch der Kinderfreibetrag soll erhöht werden; die genaue Höhe ist noch offen.

9. Die zweite Progressionszone soll abgeflacht werden.

10. Der Spitzensteuersatz von 42 % soll künftig etwas später einsetzen.

11. Die Reichensteuer soll künftig zweistufig ausgestaltet werden.

12. Ein Steuersatz von 45 % soll ab 250.000 € zvE gelten.

13. Ein Steuersatz von 47 % soll ab 280.000 € zvE gelten.

14. Der Minijob-Pauschalsteuersatz soll von 2 % auf 5 % steigen.

15. Die Steuerermäßigung für Handwerkerleistungen soll auf 15 % und maximal 900 € sinken.

16. Materialkosten sind bei § 35a Abs. 3 EStG grundsätzlich nicht begünstigt.

17. Die Grundlohngrenze für begünstigte Sonn- und Feiertagszuschläge soll auf 75 € steigen.

18. Die Erhöhung auf 75 € soll zum 01.01.2027 erfolgen.

19. Tarifvertraglich geregelte steuerfreie Zuschläge sollen vollständig beitragsfrei werden.

20. Die sozialversicherungsrechtliche Umsetzung der Beitragsfreiheit ist noch offen.

21. Abfindungen sollen bei schneller Aufnahme einer neuen Erwerbstätigkeit zusätzlich steuerlich begünstigt werden.

22. Für die geplante Abfindungsbegünstigung existieren noch keine konkreten Berechnungsregeln.

23. Die Reformpläne sind noch kein geltendes Recht.

24. Bundestag und gegebenenfalls Bundesrat müssen den Änderungen noch zustimmen.

25. Die Reformmaßnahmen dürfen erst nach Inkrafttreten der gesetzlichen Neuregelungen angewendet werden.

---

⇨ 18. Antwortlogik für den Steuerstoff-Chatbot

Bei Fragen zur Einkommensteuerreform 2027 muss der Chatbot zunächst unterscheiden:

► A. Frage nach geltendem Recht

Bei Fragen wie

- „Wie hoch ist der Grundfreibetrag?“
- „Wie hoch ist das Kindergeld?“
- „Wie hoch ist der Arbeitnehmer-Pauschbetrag?“
- „Wie hoch ist die Minijob-Pauschalsteuer?“
- „Wie hoch ist der Handwerkerbonus?“

muss der Chatbot grundsätzlich den aktuell geltenden Rechtsstand nennen.

Anschließend kann er ergänzend auf die geplante Reform hinweisen.

► B. Frage nach der Reformplanung

Bei Fragen wie

- „Was soll sich 2027 ändern?“
- „Wie hoch soll der Grundfreibetrag 2028 sein?“
- „Wird die Reichensteuer erhöht?“
- „Was plant die Koalition bei Handwerkerleistungen?“

muss der Chatbot ausdrücklich darauf hinweisen, dass es sich um eine politische Planung und noch nicht um geltendes Recht handelt.

► C. Frage nach einer konkreten Steuerberechnung für 2027 oder 2028

Solange der endgültige Gesetzestext nicht vorliegt, darf der Chatbot keine verbindliche Steuerberechnung auf Grundlage der Reformpläne vornehmen.

Er darf lediglich

- eine unverbindliche Modellrechnung,
- eine Szenarioberechnung oder
- einen Vergleich anhand der veröffentlichten Planwerte

erstellen.

Die Berechnung muss deutlich als vorläufig gekennzeichnet werden.

---

⇨ 19. Pflichtformulierungen des Chatbots

Der Chatbot soll Formulierungen verwenden wie:

- „Nach dem derzeitigen Beschlussstand ist vorgesehen …“

- „Die Regierungskoalition plant …“

- „Voraussichtlich soll der Betrag …“

- „Die endgültige gesetzliche Ausgestaltung bleibt abzuwarten.“

- „Es handelt sich noch nicht um geltendes Recht.“

- „Maßgeblich bleibt bis zum Inkrafttreten einer Neuregelung der aktuelle Gesetzesstand.“

Der Chatbot darf nicht formulieren:

- „Ab 2027 beträgt der Grundfreibetrag sicher …“

- „Das neue Gesetz schreibt bereits vor …“

- „Die Reichensteuer beträgt ab 2027 definitiv …“

- „Der Handwerkerbonus wurde bereits auf 900 € reduziert.“

- „Minijobs werden bereits mit 5 % besteuert.“

---

⇨ 20. Kurzantwort des Chatbots

**Die Regierungskoalition plant zum 01.01.2027 eine Reform der Einkommensteuer, die ab 2028 ihre volle Wirkung entfalten soll. Vorgesehen sind insbesondere ein höherer Grundfreibetrag, ein höheres Kindergeld, ein höherer Arbeitnehmer-Pauschbetrag und eine Abflachung des Einkommensteuertarifs. Zur Gegenfinanzierung sollen ab 250.000 € zvE 45 % und ab 280.000 € zvE 47 % Einkommensteuer gelten. Außerdem sollen die Minijob-Pauschalsteuer von 2 % auf 5 % steigen und die Steuerermäßigung für Handwerkerleistungen auf 15 % beziehungsweise maximal 900 € sinken. Die Grundlohngrenze für begünstigte Sonn- und Feiertagszuschläge soll auf 75 € steigen. Es handelt sich bislang um einen Beschluss des Koalitionsausschusses und noch nicht um geltendes Recht.**

---

⇨ 21. Warnhinweis für den Chatbot

Der Chatbot darf die Reformpläne nicht als bereits verabschiedetes Recht darstellen.

Insbesondere die geplanten Werte

- 12.900 € Grundfreibetrag,
- 272 € Kindergeld,
- 1.430 € Arbeitnehmer-Pauschbetrag,
- 45 % ab 250.000 € zvE,
- 47 % ab 280.000 € zvE,
- 5 % Minijob-Pauschalsteuer,
- 15 % beziehungsweise 900 € für Handwerkerleistungen und
- 75 € Grundlohngrenze bei Sonn- und Feiertagszuschlägen

sind bis zum Abschluss des Gesetzgebungsverfahrens als vorläufige Planwerte zu kennzeichnen.

Bei einer späteren Gesetzesänderung muss dieser KB-Eintrag aktualisiert oder durch einen Eintrag zum endgültigen Gesetz ersetzt werden.
`,

  chatbotRules: [
    "Geltendes Recht und Reformplanung immer getrennt darstellen.",
    "Die Reform nicht als bereits beschlossenes und verkündetes Gesetz bezeichnen.",
    "Bei den Beträgen 12.900 €, 272 € und 1.430 € immer auf deren Vorläufigkeit hinweisen.",
    "Bei einer konkreten Berechnung für 2027 oder 2028 ausdrücklich auf den vorläufigen Charakter hinweisen.",
    "Die neue Abfindungsbegünstigung nicht berechnen, solange keine gesetzliche Berechnungsformel veröffentlicht wurde.",
    "Die geplante 75-€-Grenze nicht ohne Weiteres auf Nachtzuschläge übertragen.",
    "Beim Minijob darauf hinweisen, dass § 40a Abs. 2 EStG grundsätzlich eine Pauschalsteuer des Arbeitgebers regelt.",
    "Bei Handwerkerleistungen zwischen Arbeitskosten und nicht begünstigten Materialkosten unterscheiden.",
    "Bei Ehegatten die Auswirkungen des Splittingverfahrens nur unter Vorbehalt der endgültigen Tarifregelung darstellen.",
    "Nach Veröffentlichung eines Gesetzentwurfs die Beträge, Normen und Anwendungsregelungen erneut prüfen."
  ],

  updateTriggers: [
    "Veröffentlichung eines Referentenentwurfs",
    "Veröffentlichung eines Regierungsentwurfs",
    "Kabinettsbeschluss",
    "Beschluss des Deutschen Bundestags",
    "Beteiligung oder Zustimmung des Bundesrats",
    "Veröffentlichung des Existenzminimumberichts",
    "Verkündung im Bundesgesetzblatt",
    "Veröffentlichung eines BMF-Schreibens zur Anwendung",
    "Änderung des geplanten Inkrafttretens",
    "Änderung der Tarifgrenzen oder Entlastungsbeträge"
  ]
},
{
  id: "allgemeines-steuerrecht-grundlagen-abgaben-steuerarten-nebenleistungen",

  title:
    "Allgemeines Steuerrecht: Abgaben, Steuerarten und steuerliche Nebenleistungen",

  short:
    "Grundlagen zu Steuern, Gebühren und Beiträgen, Steueraufkommen, Ertragshoheit, Einteilung und Erhebung der Steuern, Abzugsfähigkeit, Besteuerungsgrundsätzen sowie steuerlichen Nebenleistungen.",

  category: "Allgemeines Steuerrecht / Grundlagen",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Lehrzusammenfassung Allgemeines Steuerrecht",

  keywords:
    "allgemeines steuerrecht|öffentlich-rechtliche abgaben|steuerbegriff|steuern|gebühren|beiträge|steueraufkommen|ertragshoheit|gemeinschaftsteuern|bundessteuern|landessteuern|gemeindesteuern|personensteuern|sachsteuern|realsteuern|veranlagungssteuern|abzugsteuern|steuerquote|abgabenquote|steuerliche nebenleistungen|verzögerungsgeld|verspätungszuschlag|mitwirkungsverzögerungsgeld|zinsen|säumniszuschlag|zwangsgeld|besteuerungsgrundsätze",

  references: [
    "Art. 3 Abs. 1 GG",
    "Art. 106 GG",
    "§ 3 AO",
    "§ 85 AO",
    "§ 89 AO",
    "§ 89a Abs. 7 AO",
    "§ 146 Abs. 2c AO",
    "§ 152 AO",
    "§ 162 Abs. 4 und 4a AO",
    "§ 178 AO",
    "§ 200a Abs. 2 und 3 AO",
    "§§ 233 bis 237 AO",
    "§§ 238 und 239 AO",
    "§ 240 AO",
    "§ 329 AO",
    "§§ 337 bis 345 AO",
    "§ 12 Nr. 3 EStG",
    "§ 4 Abs. 5b EStG",
    "§ 10 Nr. 2 KStG",
    "§§ 38 ff. EStG",
    "§§ 43 ff. EStG",
    "§§ 48 ff. EStG",
    "§ 22a Abs. 5 EStG",
    "§ 1 GewStG",
    "§ 3 Abs. 2 AO"
  ],

  body: `
⇨ Allgemeines Steuerrecht: Grundlagen der öffentlich-rechtlichen Abgaben

► 1. Finanzierung staatlicher Aufgaben

Bund, Länder und Gemeinden erfüllen zahlreiche öffentliche Aufgaben.

Hierzu gehören beispielsweise:

– innere und äußere Sicherheit,
– Schulen und Hochschulen,
– Straßen und öffentliche Infrastruktur,
– soziale Sicherung,
– Gesundheitswesen,
– Justiz und Verwaltung,
– Kultur und Umweltschutz.

Zur Finanzierung dieser Aufgaben erhebt der Staat öffentlich-rechtliche Abgaben.

Zu den öffentlich-rechtlichen Abgaben gehören insbesondere:

1. Steuern,
2. Gebühren,
3. Beiträge,
4. steuerliche Nebenleistungen.

---

⇨ 2. Begriff der Steuer

Nach § 3 Abs. 1 AO sind Steuern Geldleistungen,

– die keine Gegenleistung für eine besondere staatliche Leistung darstellen,
– die von einem öffentlich-rechtlichen Gemeinwesen erhoben werden,
– die der Erzielung von Einnahmen dienen und
– die allen auferlegt werden, bei denen der gesetzliche Tatbestand erfüllt ist.

Die Erzielung von Einnahmen muss nicht der einzige Zweck der Steuer sein.

Eine Steuer kann zusätzlich eine Lenkungswirkung verfolgen.

Beispiele:

– Die Tabaksteuer soll Einnahmen erzielen, kann aber zugleich den Tabakkonsum beeinflussen.
– Energiesteuern können neben der Einnahmeerzielung ökologische Lenkungszwecke verfolgen.
– Steuervergünstigungen können bestimmte wirtschaftliche oder gesellschaftliche Tätigkeiten fördern.

► Merksatz

Bei einer Steuer erhält der Steuerpflichtige keine bestimmte, individuell zurechenbare Gegenleistung.

---

⇨ 3. Abgrenzung zwischen Steuern, Gebühren und Beiträgen

► Steuern

Steuern werden unabhängig davon erhoben, ob der Steuerpflichtige eine konkrete staatliche Leistung erhält.

Beispiele:

– Einkommensteuer,
– Körperschaftsteuer,
– Umsatzsteuer,
– Gewerbesteuer,
– Grundsteuer.

► Gebühren

Gebühren werden für die tatsächliche Inanspruchnahme einer bestimmten öffentlichen Leistung oder Einrichtung erhoben.

Beispiele:

– Gebühr für die Ausstellung eines Reisepasses,
– Gebühr für eine behördliche Genehmigung,
– Gerichtsgebühren,
– Abwasser- oder Müllgebühren.

► Beiträge

Beiträge werden für die Möglichkeit der Inanspruchnahme oder für einen besonderen Vorteil erhoben.

Eine tatsächliche Nutzung ist nicht zwingend erforderlich.

Beispiele:

– Erschließungsbeiträge,
– Straßenbaubeiträge,
– Beiträge zu öffentlich-rechtlichen Kammern.

► Prüfungsschema

1. Liegt eine konkrete Gegenleistung vor?

Ja:
Es kann sich um eine Gebühr handeln.

Nein:
Weiterprüfen.

2. Wird bereits die Möglichkeit der Nutzung oder ein besonderer Vorteil abgegolten?

Ja:
Es kann sich um einen Beitrag handeln.

Nein:
Es kann sich um eine Steuer handeln.

---

⇨ 4. Steueraufkommen und Ertragshoheit

Die Ertragshoheit beantwortet die Frage:

Welcher Gebietskörperschaft steht das Aufkommen einer Steuer zu?

Zu unterscheiden sind:

1. Gemeinschaftsteuern,
2. Bundessteuern,
3. Landessteuern,
4. Gemeindesteuern.

Die Verteilung des Steueraufkommens ist insbesondere in Art. 106 GG geregelt.

► Gemeinschaftsteuern

Gemeinschaftsteuern stehen Bund und Ländern gemeinschaftlich zu.

Die Gemeinden werden bei bestimmten Gemeinschaftsteuern beteiligt.

Zu den Gemeinschaftsteuern gehören insbesondere:

– Einkommensteuer,
– Körperschaftsteuer,
– Umsatzsteuer.

Die Lohnsteuer und die Kapitalertragsteuer sind besondere Erhebungsformen der Einkommensteuer.

► Bundessteuern

Das Aufkommen der Bundessteuern steht grundsätzlich dem Bund zu.

Beispiele:

– Energiesteuer,
– Tabaksteuer,
– Versicherungsteuer,
– Kraftfahrzeugsteuer,
– Solidaritätszuschlag als Ergänzungsabgabe.

► Landessteuern

Das Aufkommen der Landessteuern steht grundsätzlich den Ländern zu.

Beispiele:

– Erbschaft- und Schenkungsteuer,
– Grunderwerbsteuer,
– Biersteuer,
– Rennwett- und Lotteriesteuer,
– Feuerschutzsteuer.

► Gemeindesteuern

Das Aufkommen der Gemeindesteuern steht grundsätzlich den Gemeinden zu.

Beispiele:

– Gewerbesteuer,
– Grundsteuer,
– örtliche Verbrauch- und Aufwandsteuern.

Zu den örtlichen Verbrauch- und Aufwandsteuern können beispielsweise gehören:

– Hundesteuer,
– Vergnügungsteuer,
– Zweitwohnungsteuer.

► Wichtig

Ertragshoheit, Gesetzgebungshoheit und Verwaltungshoheit müssen nicht bei derselben Körperschaft liegen.

Eine Steuer kann beispielsweise durch Bundesgesetz geregelt, von Landesfinanzbehörden verwaltet und zwischen Bund, Ländern und Gemeinden verteilt werden.

---

⇨ 5. Steuerquote und Abgabenquote

► Steuerquote

Die volkswirtschaftliche Steuerquote beschreibt das Verhältnis zwischen dem gesamten Steueraufkommen und dem Bruttoinlandsprodukt.

Formel:

Steueraufkommen
÷ Bruttoinlandsprodukt
× 100
= Steuerquote in Prozent

► Abgabenquote

Die Abgabenquote berücksichtigt zusätzlich die Sozialabgaben.

Formel:

Steuern + Sozialversicherungsbeiträge
÷ Bruttoinlandsprodukt
× 100
= Abgabenquote in Prozent

Die Höhe des Steueraufkommens hängt insbesondere ab von:

– der gesamtwirtschaftlichen Entwicklung,
– der Beschäftigung,
– der Höhe der Einkommen und Unternehmensgewinne,
– dem Konsum,
– den geltenden Steuergesetzen,
– Steuervergünstigungen und Freibeträgen.

Hinweis:

Zahlen aus älteren Lehrbüchern stellen historische Werte dar. Für aktuelle Steueraufkommenszahlen sind die jeweils aktuellen amtlichen Statistiken maßgebend.

---

⇨ 6. Einteilung der Steuern nach der Ertragshoheit

Nach der Ertragshoheit wird unterschieden zwischen:

– Gemeinschaftsteuern,
– Bundessteuern,
– Landessteuern,
– Gemeindesteuern.

► Merksatz

Die Ertragshoheit beantwortet nicht die Frage, wer die Steuer festsetzt oder verwaltet, sondern wem das Steueraufkommen zusteht.

---

⇨ 7. Personensteuern und Sachsteuern

► Personensteuern

Personensteuern knüpfen an die Person und ihre persönliche oder wirtschaftliche Leistungsfähigkeit an.

Beispiele:

– Einkommensteuer,
– Körperschaftsteuer.

Steuern vom Einkommen und sonstige Personensteuern sind bei der steuerlichen Gewinnermittlung grundsätzlich nicht abziehbar.

Für natürliche Personen ergibt sich das Abzugsverbot insbesondere aus § 12 Nr. 3 EStG.

Bei Körperschaften ist insbesondere § 10 Nr. 2 KStG zu beachten.

Das Abzugsverbot kann auch die auf diese Steuern entfallenden steuerlichen Nebenleistungen umfassen.

► Sachsteuern

Sachsteuern knüpfen an einen Gegenstand, einen wirtschaftlichen Vorgang oder ein bestimmtes Objekt an.

Zu den Sachsteuern gehören insbesondere:

– Realsteuern,
– Verkehrsteuern,
– Verbrauchsteuern.

Der Begriff der Sachsteuer ist weiter als der Begriff der Realsteuer.

► Realsteuern

Nach § 3 Abs. 2 AO sind Realsteuern:

1. die Grundsteuer und
2. die Gewerbesteuer.

Realsteuern knüpfen an ein bestimmtes Steuerobjekt an und berücksichtigen persönliche Verhältnisse grundsätzlich nur eingeschränkt.

► Abzugsfähigkeit

Betrieblich veranlasste Sachsteuern können grundsätzlich Betriebsausgaben sein.

Beispiel:

Die Grundsteuer für ein betrieblich genutztes Grundstück kann grundsätzlich als Betriebsausgabe berücksichtigt werden.

Ausnahme:

Die Gewerbesteuer und die darauf entfallenden Nebenleistungen sind nach § 4 Abs. 5b EStG keine Betriebsausgaben.

► Merksatz

Grundsteuer auf Betriebsvermögen:
grundsätzlich betrieblich abziehbar.

Gewerbesteuer:
ausdrücklich nicht als Betriebsausgabe abziehbar.

---

⇨ 8. Veranlagungssteuern und Abzugsteuern

Nach der Form der Steuererhebung wird insbesondere unterschieden zwischen:

1. Veranlagungssteuern und
2. Abzugsteuern.

► Veranlagungssteuern

Bei Veranlagungssteuern werden die Besteuerungsgrundlagen grundsätzlich im Rahmen eines Veranlagungsverfahrens ermittelt.

Die Steuer wird regelmäßig durch einen Steuerbescheid festgesetzt.

Beispiele:

– Einkommensteuer,
– Körperschaftsteuer,
– Gewerbesteuer.

Typischer Ablauf:

1. Abgabe der Steuererklärung,
2. Prüfung durch die Finanzbehörde,
3. Ermittlung der Besteuerungsgrundlagen,
4. Festsetzung der Steuer,
5. Bekanntgabe des Steuerbescheids.

► Abzugsteuern

Bei Abzugsteuern wird die Steuer unmittelbar an der Quelle einbehalten.

Der zum Steuerabzug Verpflichtete behält die Steuer ein und führt sie an die Finanzbehörde ab.

Beispiele:

– Lohnsteuer nach §§ 38 ff. EStG,
– Kapitalertragsteuer nach §§ 43 ff. EStG,
– Bauabzugsteuer nach §§ 48 ff. EStG.

► Beispiel Lohnsteuer

Der Arbeitgeber behält die Lohnsteuer vom Arbeitslohn des Arbeitnehmers ein und führt sie an das Finanzamt ab.

Steuerschuldner und die Person, die den Steuerabzug vornimmt, können daher unterschiedliche Personen sein.

---

⇨ 9. Grundsätze der Besteuerung

Ein Steuersystem soll sowohl die finanziellen Interessen des Staates als auch die Interessen der Bürger berücksichtigen.

Zu den wichtigen Besteuerungsgrundsätzen gehören:

1. der Grundsatz eines ausreichenden Steueraufkommens,
2. das Leistungsfähigkeitsprinzip,
3. der Grundsatz der steuerlichen Gerechtigkeit,
4. der Grundsatz einer einfachen und sparsamen Steuerverwaltung.

► Ausreichendes Steueraufkommen

Das Steueraufkommen soll grundsätzlich ausreichen, um die staatlichen Aufgaben dauerhaft zu finanzieren.

Dieser Gedanke wird teilweise als Grundsatz des objektiven Steuermaßes oder als fiskalischer Besteuerungsgrundsatz bezeichnet.

► Leistungsfähigkeitsprinzip

Die steuerliche Belastung soll sich an der wirtschaftlichen Leistungsfähigkeit des Steuerpflichtigen orientieren.

Anzeichen für wirtschaftliche Leistungsfähigkeit können sein:

– Einkommen,
– Vermögen,
– Konsum,
– wirtschaftlicher Ertrag.

Dieser Gedanke wird teilweise als Grundsatz des subjektiven Steuermaßes bezeichnet.

► Steuerliche Gerechtigkeit

Vergleichbare Sachverhalte sollen steuerlich gleich behandelt werden.

Unterschiedliche Sachverhalte dürfen entsprechend ihrer Unterschiede verschieden behandelt werden.

Der allgemeine Gleichheitssatz des Art. 3 Abs. 1 GG besitzt deshalb auch im Steuerrecht besondere Bedeutung.

► Einfache und sparsame Steuerverwaltung

Die Erhebung einer Steuer soll:

– verständlich,
– praktikabel,
– rechtssicher,
– möglichst einfach und
– mit angemessenem Verwaltungsaufwand durchführbar sein.

Die Kosten der Steuererhebung sollen nicht außer Verhältnis zum erzielten Steueraufkommen stehen.

---

⇨ 10. Steuerliche Nebenleistungen

Steuerliche Nebenleistungen sind selbst keine Steuern.

Sie entstehen jedoch im Zusammenhang mit der Besteuerung, der Steuererhebung oder dem steuerlichen Verwaltungsverfahren.

Die steuerlichen Nebenleistungen sind in § 3 Abs. 4 AO aufgezählt.

Zu ihnen gehören insbesondere:

1. Verzögerungsgelder nach § 146 Abs. 2c AO,
2. Verspätungszuschläge nach § 152 AO,
3. Zuschläge nach § 162 Abs. 4 und 4a AO,
4. Mitwirkungsverzögerungsgelder nach § 200a Abs. 2 AO,
5. Zuschläge zum Mitwirkungsverzögerungsgeld nach § 200a Abs. 3 AO,
6. Zinsen nach den §§ 233 bis 237 AO,
7. Säumniszuschläge nach § 240 AO,
8. Zwangsgelder nach § 329 AO,
9. bestimmte Kosten des steuerlichen Verwaltungsverfahrens,
10. Zinsen auf Einfuhr- und Ausfuhrabgaben,
11. Verspätungsgelder nach § 22a Abs. 5 EStG,
12. bestimmte Kosten nach dem Plattformen-Steuertransparenzgesetz.

---

⇨ 11. Verzögerungsgeld

Ein Verzögerungsgeld kann nach § 146 Abs. 2c AO festgesetzt werden, wenn bestimmten gesetzlichen Pflichten im Zusammenhang mit elektronischen Büchern, Aufzeichnungen, Datenzugriffen oder der Vorlage von Unterlagen nicht nachgekommen wird.

Das Verzögerungsgeld dient dazu, die Erfüllung steuerlicher Mitwirkungs- und Aufzeichnungspflichten sicherzustellen.

► Wichtig

In älteren Lehrbüchern kann noch auf § 146 Abs. 2b AO verwiesen werden.

Nach der aktuellen Nummerierung befindet sich die Regelung zum Verzögerungsgeld in § 146 Abs. 2c AO.

---

⇨ 12. Verspätungszuschlag

Ein Verspätungszuschlag kann festgesetzt werden, wenn eine vorgeschriebene Steuererklärung nicht oder nicht fristgerecht abgegeben wird.

Rechtsgrundlage:

§ 152 AO

Je nach Fall unterscheidet das Gesetz zwischen:

– einer Ermessensentscheidung der Finanzbehörde und
– einer verpflichtenden Festsetzung des Verspätungszuschlags.

► Merksatz

Verspätungszuschlag:
verspätete Abgabe einer Steuererklärung.

---

⇨ 13. Zuschläge nach § 162 AO

Zuschläge nach § 162 Abs. 4 und 4a AO können insbesondere bei Verletzungen bestimmter Aufzeichnungs-, Dokumentations- oder Mitwirkungspflichten festgesetzt werden.

Die Regelungen sind vor allem bei grenzüberschreitenden Sachverhalten und Verrechnungspreisdokumentationen von Bedeutung.

Die Zuschläge treten neben eine mögliche Schätzung der Besteuerungsgrundlagen.

---

⇨ 14. Mitwirkungsverzögerungsgeld

Im Rahmen einer Außenprüfung kann die Finanzbehörde ein qualifiziertes Mitwirkungsverlangen erlassen.

Kommt der Steuerpflichtige diesem Mitwirkungsverlangen nicht oder nicht ausreichend nach, kann beziehungsweise muss nach Maßgabe des § 200a AO ein Mitwirkungsverzögerungsgeld festgesetzt werden.

Rechtsgrundlagen:

– § 200a Abs. 2 AO,
– § 200a Abs. 3 AO für einen möglichen zusätzlichen Zuschlag.

► Merksatz

Das Mitwirkungsverzögerungsgeld betrifft besonders die verzögerte Mitwirkung während einer Außenprüfung.

---

⇨ 15. Zinsen

Ansprüche aus dem Steuerschuldverhältnis werden nur verzinst, wenn eine gesetzliche Grundlage dies ausdrücklich vorsieht.

Rechtsgrundlage:

§§ 233 bis 237 AO

Zu unterscheiden sind insbesondere:

– Zinsen auf Steuernachforderungen und Steuererstattungen nach § 233a AO,
– Stundungszinsen nach § 234 AO,
– Hinterziehungszinsen nach § 235 AO,
– Prozesszinsen auf Erstattungsbeträge nach § 236 AO,
– Aussetzungszinsen nach § 237 AO.

► Merksatz

Im Steuerrecht entstehen Zinsen nicht allein deshalb, weil eine Forderung besteht.

Es muss eine besondere gesetzliche Verzinsungsregelung vorliegen.

---

⇨ 16. Säumniszuschlag

Wird eine fällige Steuer nicht rechtzeitig entrichtet, können Säumniszuschläge entstehen.

Rechtsgrundlage:

§ 240 AO

Der Säumniszuschlag knüpft an die verspätete Zahlung an.

► Abgrenzung

Verspätungszuschlag:
Die Steuererklärung wird verspätet abgegeben.

Säumniszuschlag:
Die festgesetzte oder angemeldete Steuer wird verspätet bezahlt.

► Merksatz

Erklärung zu spät:
Verspätungszuschlag.

Zahlung zu spät:
Säumniszuschlag.

---

⇨ 17. Zwangsgeld

Ein Zwangsgeld ist ein Mittel zur Durchsetzung einer Handlung, Duldung oder Unterlassung.

Rechtsgrundlage:

§ 329 AO

Ein Zwangsgeld kann beispielsweise angedroht und festgesetzt werden, wenn ein Steuerpflichtiger einer durchsetzbaren Mitwirkungspflicht nicht nachkommt.

Das Zwangsgeld soll den Steuerpflichtigen zur Erfüllung seiner Pflicht bewegen.

Es besitzt daher grundsätzlich keinen Strafcharakter.

► Beispiel

Ein Steuerpflichtiger wird zur Abgabe einer noch fehlenden Steuererklärung aufgefordert.

Kommt er der Aufforderung trotz Zwangsgeldandrohung nicht nach, kann das Zwangsgeld festgesetzt werden.

---

⇨ 18. Kosten

Bestimmte Gebühren und Auslagen des steuerlichen Verwaltungsverfahrens gehören ebenfalls zu den steuerlichen Nebenleistungen.

Hierzu zählen insbesondere bestimmte Kosten nach:

– § 89 AO,
– § 89a Abs. 7 AO,
– § 178 AO,
– §§ 337 bis 345 AO.

Ein Beispiel sind Gebühren für die Bearbeitung bestimmter verbindlicher Auskünfte.

---

⇨ 19. Bußgelder und Geldstrafen

Bußgelder und Geldstrafen gehören nicht zu den steuerlichen Nebenleistungen.

Dies gilt auch dann, wenn sie im Zusammenhang mit einer Steuerordnungswidrigkeit oder Steuerstraftat festgesetzt werden.

Beispiele:

– Bußgeld wegen einer leichtfertigen Steuerverkürzung,
– Geldstrafe wegen einer Steuerhinterziehung.

Der Grund:

Bußgelder und Geldstrafen dienen in erster Linie der Ahndung eines rechtswidrigen Verhaltens.

Sie dienen nicht der Erzielung von Steuereinnahmen und nicht der gewöhnlichen Durchführung des Besteuerungsverfahrens.

---

⇨ 20. Gesamtübersicht

► Öffentlich-rechtliche Abgaben

Steuern:
keine konkrete Gegenleistung.

Gebühren:
tatsächliche Inanspruchnahme einer konkreten Leistung.

Beiträge:
Möglichkeit der Nutzung oder besonderer Vorteil.

Steuerliche Nebenleistungen:
entstehen im Zusammenhang mit dem Besteuerungs- oder Erhebungsverfahren.

► Ertragshoheit

Gemeinschaftsteuern:
insbesondere Einkommensteuer, Körperschaftsteuer und Umsatzsteuer.

Bundessteuern:
beispielsweise Energiesteuer, Tabaksteuer und Versicherungsteuer.

Landessteuern:
beispielsweise Erbschaftsteuer und Grunderwerbsteuer.

Gemeindesteuern:
insbesondere Gewerbesteuer und Grundsteuer.

► Einteilung nach dem Steuergegenstand

Personensteuern:
knüpfen an die Person und ihre Leistungsfähigkeit an.

Sachsteuern:
knüpfen an einen Gegenstand oder wirtschaftlichen Vorgang an.

Realsteuern:
Grundsteuer und Gewerbesteuer.

► Einteilung nach der Erhebungsform

Veranlagungssteuern:
Festsetzung regelmäßig nach Durchführung einer Veranlagung.

Abzugsteuern:
Einbehaltung unmittelbar an der Einkommens- oder Zahlungsquelle.

► Nebenleistungen

Erklärung verspätet:
Verspätungszuschlag.

Zahlung verspätet:
Säumniszuschlag.

Mitwirkung nicht erfüllt:
Zwangsgeld oder besondere Mitwirkungszuschläge.

Gesetzlich angeordnete Verzinsung:
Zinsen.

---

⇨ 21. Wiederholungsfragen

1. Welche Voraussetzungen muss eine Geldleistung erfüllen, um eine Steuer im Sinne des § 3 AO zu sein?

2. Worin unterscheiden sich Steuern, Gebühren und Beiträge?

3. Was versteht man unter der Ertragshoheit?

4. Welche Steuern gehören zu den Gemeinschaftsteuern?

5. Welche Steuern werden als Realsteuern bezeichnet?

6. Was ist der Unterschied zwischen Personensteuern und Sachsteuern?

7. Warum ist die Gewerbesteuer trotz ihrer betrieblichen Veranlassung nicht als Betriebsausgabe abziehbar?

8. Was ist der Unterschied zwischen Veranlagungssteuern und Abzugsteuern?

9. Was beschreibt die Steuerquote?

10. Was beschreibt die Abgabenquote?

11. Welche steuerlichen Nebenleistungen nennt § 3 Abs. 4 AO?

12. Worin unterscheiden sich Verspätungszuschlag und Säumniszuschlag?

13. Wann kann ein Zwangsgeld eingesetzt werden?

14. Warum gehören Bußgelder und Geldstrafen nicht zu den steuerlichen Nebenleistungen?

15. Welche Besteuerungsgrundsätze sollen bei der Ausgestaltung eines Steuersystems berücksichtigt werden?

---

⇨ 22. Klausur-Merksätze

► Steuer

Geldleistung ohne Anspruch auf eine konkrete Gegenleistung.

► Gebühr

Entgelt für die tatsächliche Inanspruchnahme einer besonderen öffentlichen Leistung.

► Beitrag

Abgabe für die Möglichkeit der Nutzung oder einen besonderen Vorteil.

► Realsteuern

Grundsteuer und Gewerbesteuer.

► Gewerbesteuer

Nach § 4 Abs. 5b EStG keine Betriebsausgabe.

► Verspätungszuschlag

Die Steuererklärung wurde nicht oder verspätet abgegeben.

► Säumniszuschlag

Eine fällige Steuer wurde nicht rechtzeitig bezahlt.

► Zwangsgeld

Druckmittel zur Durchsetzung einer steuerlichen Pflicht.

► Bußgeld und Geldstrafe

Keine Steuer und keine steuerliche Nebenleistung.
`
},
{
  id: "bfh-v-r-11-24-gemeinnuetzigkeit-unternehmensverbundene-stiftung",

  title:
    "Gemeinnützigkeit einer unternehmensverbundenen Stiftung – private Interessen des Stifters",

  short:
    "Private wirtschaftliche, familiäre oder sonstige eigennützige Interessen des Stifters können die Selbstlosigkeit einer Stiftung ausschließen, wenn die Stiftung vorrangig diesen Interessen dient. Erforderlich ist eine Gesamtwürdigung und Abwägung zwischen der Förderung der Allgemeinheit und den Vorteilen des Stifters oder ihm nahestehender Personen. Ein bloßer Verstoß gegen eine stiftungsrechtliche Satzungsregelung zum Erhalt des Stiftungsvermögens führt dagegen nicht automatisch zu einem Verstoß gegen § 63 Abs. 1 AO.",

  category:
    "NPO / Gemeinnützigkeit",

  topicType: "bfh-rechtsprechung",

  decision: {
    court: "Bundesfinanzhof",
    senate: "V. Senat",
    date: "2025-12-04",
    fileNumber: "V R 11/24",
    proceedingOutcome:
      "Aufhebung und Zurückverweisung an das Finanzgericht zur weiteren Sachverhaltsaufklärung",
    publication:
      "Kommentierte Nachricht NWB 21/2026, Seite 1368"
  },

  status:
    "BFH-Entscheidung mit Zurückverweisung – endgültige gemeinnützigkeitsrechtliche Beurteilung des Einzelfalls noch offen",

  warning:
    "Der BFH hat nicht abschließend festgestellt, dass die Stiftung ihre Gemeinnützigkeit verloren hat. Das Finanzgericht muss im zweiten Rechtsgang insbesondere prüfen, ob die Stiftung vorrangig eigenwirtschaftliche, familiäre oder sonstige eigennützige Interessen der Stifterin verfolgte.",

  keywords:
    "BFH V R 11/24|gemeinnützige Stiftung|unternehmensverbundene Stiftung|Selbstlosigkeit|§ 55 AO|§ 55 Abs. 1 AO|eigenwirtschaftliche Zwecke|private Interessen des Stifters|familiäre Interessen|Pflichtteilsansprüche|Pflichtteil vermeiden|nahestehende Personen|Stifterinteresse|Konzernfinanzierung|Finanzierungsgesellschaft|Stimmbindungsvereinbarung|Zustiftung|Zuwendung|Sonderbetriebsausgabenabzug|Stiftungsvermögen|Vermögenserhaltung|§ 63 AO|§ 63 Abs. 1 AO|tatsächliche Geschäftsführung|Satzungsverstoß|§§ 51 bis 68 AO|§ 5 Abs. 1 Nr. 9 KStG|Gemeinnützigkeitsverlust|Stiftungsrat|Grundstockvermögen|verbindliche Auskunft",

  references: [
    "§ 5 Abs. 1 Nr. 9 KStG",
    "§ 51 AO",
    "§ 52 AO",
    "§ 55 Abs. 1 AO",
    "§ 56 AO",
    "§ 57 AO",
    "§ 60 AO",
    "§ 60a AO",
    "§ 63 Abs. 1 AO",
    "§§ 51 bis 68 AO",
    "§ 272 Abs. 2 Nr. 4 HGB",
    "BFH, Urteil vom 04.12.2025 – V R 11/24",
    "NWB 21/2026, Seite 1368"
  ],

  coreStatements: [
    {
      statement:
        "Private Interessen des Stifters können die Selbstlosigkeit der Stiftung ausschließen.",
      legalBasis: "§ 55 Abs. 1 AO",
      explanation:
        "Dies gilt sowohl für wirtschaftliche Interessen als auch für sonstige eigennützige oder familiäre Interessen."
    },
    {
      statement:
        "Nicht jedes private Motiv des Stifters führt automatisch zum Verlust der Gemeinnützigkeit.",
      legalBasis: "§ 55 Abs. 1 AO",
      explanation:
        "Entscheidend ist, ob die Stiftung in erster Linie eigenwirtschaftliche Zwecke verfolgt."
    },
    {
      statement:
        "Erforderlich ist eine Abwägung zwischen Allgemeininteresse und privaten Vorteilen.",
      legalBasis: "§ 55 Abs. 1 AO",
      explanation:
        "Die Förderung der Allgemeinheit muss gegenüber den eigenwirtschaftlichen Vorteilen des Stifters oder nahestehender Personen überwiegen."
    },
    {
      statement:
        "Auch familiäre oder ideelle Motive können gemeinnützigkeitsschädlich sein.",
      legalBasis: "§ 55 Abs. 1 AO",
      explanation:
        "Ein Interesse am Erhalt des familiären Unternehmens oder am Ausschluss von Pflichtteilsberechtigten kann ein eigennütziges Interesse darstellen."
    },
    {
      statement:
        "Ein bloßer Verstoß gegen eine stiftungsrechtliche Vermögenserhaltungsklausel führt nicht automatisch zum Verlust der Gemeinnützigkeit.",
      legalBasis: "§ 63 Abs. 1 AO",
      explanation:
        "Gemeinnützigkeitsrechtlich maßgeblich sind Verstöße gegen die Vorgaben der §§ 51 bis 68 AO."
    },
    {
      statement:
        "Nicht jede Satzungsbestimmung ist zugleich eine gemeinnützigkeitsrechtliche Vorgabe.",
      legalBasis: "§ 63 Abs. 1 AO",
      explanation:
        "Satzungsregelungen, die ausschließlich dem Stiftungsrecht entstammen und nicht durch die Abgabenordnung vorgegeben sind, sind für die Steuerbefreiung nicht ohne Weiteres maßgeblich."
    }
  ],

  facts: {
    foundation:
      "Rechtsfähige, im Jahr 2015 errichtete und anerkannte gemeinnützige Stiftung bürgerlichen Rechts.",

    founder:
      "Die Stifterin übertrug Geld und Aktien einer AG auf die Stiftung und behielt über Stimmbindungsvereinbarungen erheblichen Einfluss auf die gesellschaftsrechtliche Nutzung der Beteiligung.",

    corporateStructure:
      "Die Stiftung hielt Aktien an einer AG, die als Finanzierungsgesellschaft innerhalb eines Konzerns eingesetzt wurde. Weitere Beteiligte waren insbesondere eine GmbH, die A-Gesellschaft und B.",

    financingFunction:
      "Die Stimmbindungsvereinbarungen sollten darauf hinwirken, die Finanzierungsfunktion der AG im Konzern der GmbH zu fördern.",

    contributions:
      "Die Stifterin leistete Zustiftungen und Zuwendungen an die Stiftung. Die Verwendung war daran geknüpft, dass die Mittel in die bereits von der Stiftung gehaltene AG investiert wurden.",

    flowOfFunds:
      "Die Stiftung zahlte Beträge in die Kapitalrücklage der AG ein, nachdem ihr jeweils am selben Tag entsprechende Beträge von der Stifterin als Zustiftung zugeflossen waren.",

    taxAdvantage:
      "Durch die Übertragung der Mittel auf die Stiftung konnte die Stifterin einen ansonsten nicht möglichen Sonderbetriebsausgabenabzug von bis zu 1 Mio. € geltend machen.",

    successionInterest:
      "Es bestand der Verdacht, dass die Gestaltung zugleich dazu dienen sollte, Pflichtteilsansprüche der Kinder faktisch auszuschließen und das Unternehmensvermögen im Konzern zu sichern.",

    foundationGovernance:
      "Dem Stiftungsrat gehörte ausschließlich die Stifterin an. Der Stiftungsvorstand wurde zur Umsetzung der von der Stifterin vorgegebenen Investitionen ermächtigt und unwiderruflich angewiesen."
  },

  disputedIssues: [
    "Verfolgte die Stiftung tatsächlich selbstlos gemeinnützige Zwecke?",
    "Diente die Stiftung vorrangig der Finanzierung und Sicherung des Konzerns?",
    "Standen private, wirtschaftliche oder familiäre Interessen der Stifterin im Vordergrund?",
    "Sollten Pflichtteilsansprüche der Kinder faktisch ausgeschlossen werden?",
    "Waren die GmbH oder B der Stifterin nahestehende Personen?",
    "War der steuerliche Sonderbetriebsausgabenabzug ein wesentlicher Zweck der Gestaltung?",
    "Führte die Investition in die AG zu einem gemeinnützigkeitsschädlichen Vermögensverstoß?",
    "Ist ein Verstoß gegen eine Satzungsklausel zum Erhalt des Stiftungsvermögens steuerlich erheblich?"
  ],

  body: `
⇨ Gemeinnützigkeit einer unternehmensverbundenen Stiftung

► BFH vom 04.12.2025 – V R 11/24

⇨ 1. Kernaussage

Private Interessen des Stifters können die Gemeinnützigkeit einer Stiftung ausschließen.

Dies gilt insbesondere für

- wirtschaftliche Interessen,
- steuerliche Interessen,
- familiäre Interessen und
- sonstige eigennützige Interessen.

Entscheidend ist jedoch nicht allein, ob bei der Gründung oder Finanzierung der Stiftung auch private Motive vorhanden waren.

Maßgeblich ist vielmehr, ob die Stiftung

**in erster Linie eigenwirtschaftliche Zwecke**

verfolgt.

⇶  Rechtsgrundlage

§ 55 Abs. 1 AO.

---

⇨ 2. Selbstlosigkeit nach § 55 Abs. 1 AO

Eine Körperschaft handelt selbstlos, wenn sie nicht in erster Linie eigenwirtschaftliche Zwecke verfolgt.

Eigenwirtschaftliche Zwecke können sein:

- eigene wirtschaftliche Interessen der Körperschaft,
- wirtschaftliche Interessen ihrer Mitglieder,
- wirtschaftliche Interessen des Stifters,
- mittelbare Interessen nahestehender Personen,
- familiäre Interessen oder
- sonstige eigennützige Interessen.

⇶  Lernsatz

**Eine gemeinnützige Stiftung darf nicht vorrangig als Instrument zur Förderung privater Interessen ihres Stifters oder nahestehender Personen eingesetzt werden, § 55 Abs. 1 AO.**

---

⇨ 3. Bedeutung des Ausdrucks „in erster Linie“

Die Formulierung „in erster Linie“ bedeutet, dass nicht jedes private Interesse automatisch schädlich ist.

Private Vorteile können unschädlich sein, wenn sie lediglich

- untergeordnet,
- reflexartig,
- nebensächlich oder
- bloße Folge der gemeinnützigen Tätigkeit

sind.

Gemeinnützigkeitsschädlich wird die Gestaltung, wenn die privaten Interessen

- überwiegen,
- die Stiftungstätigkeit prägen oder
- den eigentlichen Schwerpunkt der Tätigkeit darstellen.

⇶  Lernsatz

**Nicht jeder private Nebeneffekt ist gemeinnützigkeitsschädlich. Schädlich ist die vorrangige Förderung privater Interessen.**

---

⇨ 4. Erforderliche Interessenabwägung

Für die Prüfung der Selbstlosigkeit ist eine Gesamtwürdigung erforderlich.

Dabei sind insbesondere gegenüberzustellen:

► Gemeinnützige Interessen

- tatsächliche Förderung der Allgemeinheit,
- Verwirklichung der steuerbegünstigten Satzungszwecke,
- Umfang der gemeinnützigen Mittelverwendung,
- Zahl und Bedeutung der geförderten Projekte,
- tatsächlicher Nutzen für die Allgemeinheit.

► Private oder eigenwirtschaftliche Interessen

- Erhalt oder Finanzierung eines Familienunternehmens,
- Konzernfinanzierung,
- Sicherung des Lebenswerks des Stifters oder dessen Familie,
- steuerliche Sonderausgaben- oder Betriebsausgabenvorteile,
- Ausschluss von Pflichtteilsberechtigten,
- Erhalt von Einfluss- und Stimmrechten,
- Förderung nahestehender Personen oder Unternehmen.

⇶  Prüfungsfrage

**Überwiegt die Förderung der Allgemeinheit gegenüber den Vorteilen des Stifters und der ihm nahestehenden Personen?**

⇶  Lernsatz

**Die Selbstlosigkeit ist anhand einer Abwägung zwischen Allgemeininteresse und privaten Vorteilen zu beurteilen.**

---

⇨ 5. Interesse am Erhalt des Lebenswerks

Die Stifterin berief sich unter anderem darauf, das persönliche Lebenswerk ihres verstorbenen Ehemanns erhalten zu wollen.

Ein solches Motiv ist nicht zwingend ein unmittelbares wirtschaftliches Interesse.

Es kann aber ein

- familiäres,
- ideelles oder
- sonstiges eigennütziges Interesse

darstellen.

Auch nicht unmittelbar wirtschaftliche Interessen können daher für die Prüfung des § 55 Abs. 1 AO relevant sein.

⇶  Lernsatz

**§ 55 Abs. 1 AO erfasst nicht nur finanzielle Eigeninteressen, sondern auch sonstige eigennützige oder familiäre Interessen.**

---

⇨ 6. Pflichtteilsansprüche als mögliches Eigeninteresse

Nach dem Sachverhalt bestand die Möglichkeit, dass die Stiftungskonstruktion dazu dienen sollte, Vermögen dem Zugriff pflichtteilsberechtigter Kinder zu entziehen.

Das Verhältnis der Stifterin zu den Kindern soll zerrüttet gewesen sein.

Die Übertragung des Vermögens auf die Stiftung konnte dazu führen, dass

- das Vermögen nicht an die Kinder gelangt,
- künftige Pflichtteilsansprüche faktisch reduziert oder ausgeschlossen werden,
- die Beteiligungen innerhalb der gewünschten Unternehmensstruktur verbleiben.

Ein solches Ziel stellt kein gemeinnützigkeitsrechtliches Allgemeininteresse dar.

Es kann vielmehr ein privates familiäres Eigeninteresse der Stifterin sein.

⇶  Lernsatz

**Die Nutzung einer gemeinnützigen Stiftung zur Vermeidung oder Reduzierung von Pflichtteilsansprüchen kann ein die Selbstlosigkeit ausschließendes Eigeninteresse darstellen.**

⇶  Achtung

Der BFH hat nicht abschließend festgestellt, dass tatsächlich ein Pflichtteilsausschluss beabsichtigt war.

Das Finanzgericht muss die Motivation und die wirtschaftlichen Auswirkungen im zweiten Rechtsgang aufklären.

---

⇨ 7. Unternehmenssicherung und Konzernfinanzierung

Die Stiftung hielt eine Beteiligung an einer AG.

Diese AG sollte als Finanzierungsgesellschaft eines Konzerns dienen.

Die von der Stifterin geleisteten Zustiftungen und Zuwendungen wurden unter der Bedingung geleistet, dass die Stiftung die Mittel in die AG investiert.

Die AG verwendete ihre Mittel insbesondere für Darlehen an Konzern- und Tochtergesellschaften.

Damit stellt sich die Frage, ob die Stiftung tatsächlich

- die Allgemeinheit förderte oder
- vorrangig als Finanzierungsinstrument für den Konzern eingesetzt wurde.

⇶  Lernsatz

**Wird eine gemeinnützige Stiftung vorrangig zur Finanzierung oder Sicherung eines Unternehmensverbunds eingesetzt, kann dies gegen die Selbstlosigkeit nach § 55 Abs. 1 AO sprechen.**

---

⇨ 8. Steuerlicher Vorteil der Stifterin

Durch die Zuwendung an die Stiftung konnte die Stifterin einen steuerlichen Abzug geltend machen, der bei einer unmittelbaren Finanzierung des Unternehmens nicht möglich gewesen wäre.

Nach dem mitgeteilten Sachverhalt ging es um einen Sonderbetriebsausgabenabzug in Höhe von bis zu 1 Mio. €.

Der steuerliche Vorteil allein führt nicht zwingend zum Verlust der Gemeinnützigkeit.

Er ist aber in die Gesamtwürdigung einzubeziehen.

Zu prüfen ist insbesondere:

- War die steuerliche Abziehbarkeit nur eine Nebenfolge?
- Oder war der steuerliche Vorteil ein wesentlicher Grund für die Gestaltung?
- Wäre die Zuwendung auch ohne den Steuervorteil erfolgt?
- Wurden die Mittel tatsächlich gemeinnützig verwendet?
- Dienten die Mittel unmittelbar oder mittelbar der Konzernfinanzierung?

⇶  Lernsatz

**Ein steuerlicher Vorteil des Stifters ist nicht automatisch gemeinnützigkeitsschädlich, kann aber ein Indiz für eine eigennützige Zwecksetzung sein.**

---

⇨ 9. Nahestehende Personen

Für die Prüfung der Selbstlosigkeit sind nicht nur unmittelbare Vorteile des Stifters zu berücksichtigen.

Einzubeziehen sind auch mittelbare Vorteile von

- Familienangehörigen,
- Gesellschaftern,
- beherrschten Unternehmen,
- wirtschaftlich verbundenen Unternehmen und
- sonstigen nahestehenden Personen.

Der BFH gab dem Finanzgericht auf, insbesondere zu prüfen, ob

- die GmbH und/oder
- B

der Stifterin nahestehende Personen waren.

⇶  Lernsatz

**Auch die mittelbare Förderung nahestehender Personen oder Unternehmen kann eine eigenwirtschaftliche Zweckverfolgung nach § 55 Abs. 1 AO darstellen.**

---

⇨ 10. Bedeutung der Stimmbindungsvereinbarung

Die Stiftung übernahm eine Stimmbindungsvereinbarung, die inhaltlich der zuvor zwischen der Stifterin und der GmbH bestehenden Vereinbarung entsprach.

Ziel der einheitlichen Stimmausübung war es, die Finanzierungsfunktion der AG innerhalb des Konzerns zu fördern.

Die Stimmbindungsvereinbarung kann ein Indiz dafür sein, dass die Beteiligung der Stiftung nicht ausschließlich als gewöhnliche Vermögensanlage gehalten wurde.

Zu prüfen ist vielmehr, ob die Stiftung gesellschaftsrechtlich in eine vorgegebene Konzernstrategie eingebunden war.

⇶  Lernsatz

**Stimmbindungsvereinbarungen können ein Indiz dafür sein, dass eine Stiftung Beteiligungen nicht unabhängig, sondern zur Förderung privater Unternehmensinteressen hält.**

---

⇨ 11. Stellung der Stifterin in den Stiftungsorganen

Dem Stiftungsrat gehörte ausschließlich die Stifterin an.

Der Stiftungsvorstand wurde ermächtigt und unwiderruflich angewiesen, die von der Stifterin gewünschten Investitionen umzusetzen.

Dies kann gegen eine eigenständige Entscheidungsbildung der Stiftung sprechen.

Für die Gesamtwürdigung sind daher insbesondere relevant:

- Zusammensetzung der Stiftungsorgane,
- personelle Unabhängigkeit,
- Weisungsrechte der Stifterin,
- tatsächliche Entscheidungsfreiheit des Vorstands,
- mögliche Interessenkonflikte,
- dokumentierte Abwägung zwischen Stiftung und Konzerninteressen.

⇶  Lernsatz

**Beherrscht der Stifter die Stiftungsorgane und gibt er konkrete Investitionsentscheidungen vor, kann dies ein Indiz für eine vorrangige Förderung seiner privaten Interessen sein.**

---

⇨ 12. Tatsächliche Geschäftsführung nach § 63 Abs. 1 AO

Nach § 63 Abs. 1 AO muss die tatsächliche Geschäftsführung der Körperschaft auf die ausschließliche und unmittelbare Erfüllung der steuerbegünstigten Zwecke gerichtet sein.

Die tatsächliche Geschäftsführung muss daher mit den gemeinnützigkeitsrechtlichen Anforderungen der Abgabenordnung übereinstimmen.

⇶  Rechtsgrundlage

§ 63 Abs. 1 AO.

⇶  Lernsatz

**Die tatsächliche Geschäftsführung muss den steuerbegünstigten Satzungszwecken und den Vorgaben der §§ 51 bis 68 AO entsprechen.**

---

⇨ 13. Verstoß gegen die Vermögenserhaltungsklausel

Die Stiftungssatzung bestimmte, dass das Stiftungsvermögen in seinem Bestand erhalten werden müsse.

Das Finanzgericht hatte angenommen, die Einzahlungen in das Eigenkapital der AG verstießen gegen diesen Grundsatz und führten deshalb zum Verlust der Steuerbefreiung.

Der BFH widersprach dieser Beurteilung.

Ein allgemeiner steuerlicher Grundsatz, nach dem eine gemeinnützige Stiftung ihr Vermögen stets ungeschmälert erhalten müsse, existiert im Gemeinnützigkeitsrecht nicht.

⇶  Lernsatz

**Ein allgemeiner gemeinnützigkeitsrechtlicher Grundsatz der ungeschmälerten Erhaltung des Stiftungsvermögens besteht nicht.**

---

⇨ 14. Nicht jeder Satzungsverstoß ist gemeinnützigkeitsschädlich

Ein Verstoß gegen eine Satzungsbestimmung führt nur dann zur Versagung der Gemeinnützigkeit, wenn die verletzte Regelung für das Gemeinnützigkeitsrecht maßgeblich ist.

Relevant sind insbesondere die Vorgaben der

§§ 51 bis 68 AO.

Eine rein stiftungsrechtliche Regelung zum Erhalt des Stiftungsvermögens ist nicht automatisch eine steuerliche Gemeinnützigkeitsvoraussetzung.

⇶  Lernsatz

**Verstöße gegen Satzungsbestimmungen, die nicht durch die §§ 51 bis 68 AO vorgegeben sind, führen nicht ohne Weiteres zum Verlust der Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG.**

---

⇨ 15. Abgrenzung: Stiftungsrecht und Gemeinnützigkeitsrecht

► Stiftungsrecht

Das Stiftungsrecht betrifft unter anderem:

- Erhalt des Grundstockvermögens,
- Organpflichten,
- Verwaltung des Stiftungsvermögens,
- staatliche Stiftungsaufsicht,
- Zulässigkeit von Vermögensumschichtungen.

► Gemeinnützigkeitsrecht

Das Gemeinnützigkeitsrecht betrifft insbesondere:

- Förderung steuerbegünstigter Zwecke,
- Ausschließlichkeit,
- Unmittelbarkeit,
- Selbstlosigkeit,
- Vermögensbindung,
- zeitnahe Mittelverwendung,
- ordnungsgemäße tatsächliche Geschäftsführung.

⇶  Lernsatz

**Ein stiftungsrechtlicher Verstoß ist nicht automatisch ein gemeinnützigkeitsrechtlicher Verstoß. Beide Rechtsgebiete sind getrennt zu prüfen.**

---

⇨ 16. Vermögensbindung und Vermögenserhaltung

Die Begriffe dürfen nicht verwechselt werden.

► Vermögensbindung

Die gemeinnützigkeitsrechtliche Vermögensbindung betrifft insbesondere die Verwendung des Vermögens bei

- Auflösung,
- Aufhebung oder
- Wegfall der steuerbegünstigten Zwecke.

Sie soll verhindern, dass gemeinnützig gebundenes Vermögen anschließend privat verteilt wird.

► Vermögenserhaltung

Die stiftungsrechtliche Vermögenserhaltung betrifft die Frage, ob das Grundstockvermögen dauerhaft erhalten werden muss.

⇶  Merksatz

**Gemeinnützigkeitsrechtliche Vermögensbindung ist nicht dasselbe wie stiftungsrechtliche Vermögenserhaltung.**

---

⇨ 17. Formelle Satzungsmäßigkeit und tatsächliche Geschäftsführung

Die Stiftung hatte zunächst einen Feststellungsbescheid über die formelle Satzungsmäßigkeit erhalten.

Dieser Bescheid beantwortet grundsätzlich die Frage, ob die Satzung die gemeinnützigkeitsrechtlichen Voraussetzungen erfüllt.

Davon zu unterscheiden ist die tatsächliche Geschäftsführung.

⇶  Formelle Satzungsmäßigkeit

§ 60 AO und § 60a AO.

Prüfung der Satzung anhand ihres Wortlauts.

⇶  Tatsächliche Geschäftsführung

§ 63 AO.

Prüfung, wie die Stiftung ihre Tätigkeit tatsächlich ausübt und ihre Mittel tatsächlich verwendet.

⇶  Lernsatz

**Ein Feststellungsbescheid nach § 60a AO schützt nicht vor einer späteren Prüfung, ob die tatsächliche Geschäftsführung den gemeinnützigkeitsrechtlichen Anforderungen entspricht.**

---

⇨ 18. Ergebnis des BFH

Der BFH konnte nicht abschließend entscheiden, ob die Stiftung in den Jahren 2015 bis 2017 selbstlos tätig war.

Das Finanzgericht muss im zweiten Rechtsgang weitere Feststellungen treffen.

Es muss insbesondere prüfen:

1. Welche wirtschaftlichen Ziele verfolgte die Stifterin?

2. Welche familiären Interessen bestanden?

3. Sollte das Konzernunternehmen dauerhaft gesichert werden?

4. Sollten Pflichtteilsansprüche ausgeschlossen oder reduziert werden?

5. Welche steuerlichen Vorteile waren mit der Gestaltung verbunden?

6. Diente die Stiftung vorrangig als Finanzierungsgesellschaft?

7. Welche Vorteile entstanden der GmbH, B oder anderen nahestehenden Personen?

8. In welchem Umfang wurde tatsächlich die Allgemeinheit gefördert?

9. Überwog die Förderung der Allgemeinheit die privaten Vorteile?

⇶  Lernsatz

**Bei einer unternehmensverbundenen Stiftung entscheidet eine Gesamtwürdigung aller wirtschaftlichen, familiären, steuerlichen und gemeinnützigen Umstände.**

---

⇨ 19. Streitjahr 2018

Für das Jahr 2018 hatte das Finanzgericht die Steuerbefreiung wegen eines vermeintlichen Verstoßes gegen den Grundsatz der Erhaltung des Stiftungsvermögens versagt.

Diese Begründung hielt der BFH für rechtsfehlerhaft.

Die Sache wurde jedoch auch für 2018 zurückverwiesen.

Das bedeutet:

Die Steuerbefreiung steht nicht automatisch fest.

Das Finanzgericht muss weiterhin prüfen, ob andere gemeinnützigkeitsrechtliche Verstöße vorliegen.

⇶  Lernsatz

**Die Zurückweisung der Begründung des Finanzgerichts bedeutet nicht automatisch, dass die Stiftung für 2018 gemeinnützig war.**

---

⇨ 20. Prüfungsschema für unternehmensverbundene Stiftungen

► Schritt 1: Steuerbegünstigter Satzungszweck

Liegt ein steuerbegünstigter Zweck nach §§ 52 bis 54 AO vor?

► Schritt 2: Formelle Satzungsmäßigkeit

Entspricht die Satzung den §§ 59, 60 und 61 AO?

► Schritt 3: Ausschließlichkeit

Verfolgt die Stiftung ausschließlich steuerbegünstigte Zwecke, § 56 AO?

► Schritt 4: Unmittelbarkeit

Verwirklicht die Stiftung ihre Zwecke unmittelbar, § 57 AO?

► Schritt 5: Selbstlosigkeit

Verfolgt die Stiftung nicht in erster Linie eigenwirtschaftliche Zwecke, § 55 Abs. 1 AO?

► Schritt 6: Private Interessen

Bestehen wirtschaftliche, steuerliche, familiäre oder sonstige eigennützige Interessen des Stifters?

► Schritt 7: Nahestehende Personen

Werden verbundene Unternehmen, Familienangehörige oder sonstige nahestehende Personen gefördert?

► Schritt 8: Interessenabwägung

Überwiegt die tatsächliche Förderung der Allgemeinheit gegenüber den privaten Vorteilen?

► Schritt 9: Tatsächliche Geschäftsführung

Entspricht die tatsächliche Geschäftsführung § 63 Abs. 1 AO?

► Schritt 10: Art des Satzungsverstoßes

Betrifft ein festgestellter Satzungsverstoß eine Vorgabe der §§ 51 bis 68 AO oder lediglich das allgemeine Stiftungsrecht?

---

⇨ 21. Indizien für eine gemeinnützigkeitsschädliche Eigennützigkeit

Folgende Umstände können gegen die Selbstlosigkeit sprechen:

- Stiftung dient als Finanzierungsgesellschaft des Familienkonzerns,
- Zuwendungen sind zwingend in bestimmte Konzerngesellschaften zu investieren,
- der Stifter kontrolliert allein den Stiftungsrat,
- der Vorstand ist an Weisungen des Stifters gebunden,
- Stimmbindungsverträge sichern Unternehmensinteressen,
- Konzernunternehmen erhalten Darlehen oder Eigenkapital,
- die Gestaltung führt zu erheblichen Steuervorteilen,
- Pflichtteilsberechtigte sollen vom Vermögen ausgeschlossen werden,
- nahestehende Personen werden mittelbar begünstigt,
- gemeinnützige Projekte treten wirtschaftlich deutlich in den Hintergrund.

⇶  Achtung

Keines dieser Indizien führt isoliert zwingend zum Verlust der Gemeinnützigkeit.

Erforderlich bleibt eine Gesamtwürdigung.

---

⇨ 22. Indizien für eine weiterhin selbstlose Stiftung

Für die Selbstlosigkeit können sprechen:

- unabhängige Stiftungsorgane,
- keine Weisungsgebundenheit gegenüber dem Stifter,
- marktübliche Konditionen bei Geschäften mit verbundenen Unternehmen,
- dokumentierte Investitionsentscheidungen im Interesse der Stiftung,
- angemessene Risikostreuung,
- tatsächliche und umfangreiche Förderung gemeinnütziger Projekte,
- private Vorteile nur als unbedeutende Nebenfolge,
- keine unangemessene Begünstigung nahestehender Personen,
- transparente Offenlegung der Unternehmensverbindungen,
- nachvollziehbare gemeinnützige Anlagestrategie.

---

⇨ 23. Gestaltungsberatung

Bei der Errichtung und Betreuung einer unternehmensverbundenen Stiftung sollten insbesondere dokumentiert werden:

1. die gemeinnützige Motivation des Stifters,

2. die wirtschaftliche Begründung der Beteiligungsstruktur,

3. die Unabhängigkeit der Stiftungsorgane,

4. die Angemessenheit aller Geschäfte mit verbundenen Unternehmen,

5. die Verwendung der Erträge für gemeinnützige Zwecke,

6. mögliche Pflichtteils- und Nachfolgeinteressen,

7. steuerliche Vorteile des Stifters,

8. Interessenkonflikte innerhalb der Stiftungsorgane,

9. Auswahl und Überwachung von Investitionen,

10. die Abwägung zwischen Vermögensertrag und Anlagerisiko.

⇶  Lernsatz

**Je enger eine gemeinnützige Stiftung personell und wirtschaftlich mit einem Unternehmen verbunden ist, desto sorgfältiger müssen Entscheidungsprozesse, Fremdüblichkeit und Gemeinwohlorientierung dokumentiert werden.**

---

⇨ 24. Verbindliche Auskunft

Bei komplexen Gestaltungen kann eine verbindliche Auskunft gegenüber dem Finanzamt sinnvoll sein.

Dabei sollten sämtliche relevanten Umstände vollständig offengelegt werden, insbesondere:

- Beteiligungsverhältnisse,
- familiäre Beziehungen,
- Stimmbindungsverträge,
- Finanzierungsvorgänge,
- Pflichtteilsmotive,
- steuerliche Abzugsmöglichkeiten,
- Weisungs- und Kontrollrechte,
- geplante Mittelverwendung.

⇶  Lernsatz

**Eine verbindliche Auskunft schützt nur, wenn der maßgebliche Sachverhalt vollständig und zutreffend offengelegt wird.**

---

⇨ 25. Kompakte Lernsätze

1. Eine Stiftung ist nur selbstlos, wenn sie nicht in erster Linie eigenwirtschaftliche Zwecke verfolgt, § 55 Abs. 1 AO.

2. Eigenwirtschaftliche Zwecke können auch mittelbare Interessen des Stifters betreffen.

3. Neben wirtschaftlichen Interessen sind auch familiäre oder sonstige eigennützige Interessen zu berücksichtigen.

4. Private Motive führen nicht automatisch zum Verlust der Gemeinnützigkeit.

5. Entscheidend ist, ob die private Zweckverfolgung gegenüber der Förderung der Allgemeinheit überwiegt.

6. Erforderlich ist eine Gesamtwürdigung aller Umstände.

7. Die Sicherung eines Familienunternehmens kann ein privates Eigeninteresse darstellen.

8. Der faktische Ausschluss von Pflichtteilsansprüchen kann gegen die Selbstlosigkeit sprechen.

9. Eine steuerlich vorteilhafte Gestaltung ist ein mögliches Indiz für Eigennützigkeit.

10. Ein steuerlicher Vorteil allein schließt die Gemeinnützigkeit nicht zwingend aus.

11. Auch Vorteile nahestehender Personen sind in die Prüfung einzubeziehen.

12. Die Nutzung einer Stiftung als Konzernfinanzierungsinstrument kann gemeinnützigkeitsschädlich sein.

13. Stimmbindungsverträge können auf eine Förderung privater Unternehmensinteressen hindeuten.

14. Die alleinige Kontrolle eines Stiftungsorgans durch den Stifter kann ein relevantes Indiz sein.

15. Die tatsächliche Geschäftsführung muss den Vorgaben der §§ 51 bis 68 AO entsprechen, § 63 Abs. 1 AO.

16. Nicht jeder Satzungsverstoß führt zum Verlust der Gemeinnützigkeit.

17. Nur gemeinnützigkeitsrechtlich relevante Verstöße sind für § 5 Abs. 1 Nr. 9 KStG entscheidend.

18. Ein stiftungsrechtlicher Verstoß ist nicht automatisch ein steuerrechtlicher Gemeinnützigkeitsverstoß.

19. Ein allgemeiner steuerlicher Grundsatz der ungeschmälerten Erhaltung des Stiftungsvermögens besteht nicht.

20. Vermögensbindung und Vermögenserhaltung sind voneinander zu unterscheiden.

21. Ein Feststellungsbescheid nach § 60a AO betrifft die Satzung und ersetzt nicht die Prüfung der tatsächlichen Geschäftsführung.

22. Bei unternehmensverbundenen Stiftungen ist die Fremdüblichkeit aller Geschäftsbeziehungen besonders wichtig.

23. Die Förderung der Allgemeinheit muss gegenüber den privaten Vorteilen überwiegen.

24. Der BFH hat die Gemeinnützigkeit im Streitfall nicht abschließend beurteilt.

25. Das Finanzgericht muss den Sachverhalt im zweiten Rechtsgang weiter aufklären.

---

⇨ 26. Prüfungssicherer Antwortsatz

**Nach § 55 Abs. 1 AO handelt eine Stiftung nur selbstlos, wenn sie nicht in erster Linie eigenwirtschaftliche Zwecke verfolgt. Private wirtschaftliche, familiäre oder sonstige eigennützige Interessen des Stifters können daher die Gemeinnützigkeit ausschließen, wenn sie gegenüber der tatsächlichen Förderung der Allgemeinheit überwiegen. Erforderlich ist eine Gesamtwürdigung aller Umstände. Ein bloßer Verstoß gegen eine stiftungsrechtliche Satzungsregelung zum Erhalt des Stiftungsvermögens führt dagegen nicht automatisch zu einem Verstoß gegen § 63 Abs. 1 AO, sofern die verletzte Regelung nicht auf den gemeinnützigkeitsrechtlichen Vorgaben der §§ 51 bis 68 AO beruht.**

---

⇨ 27. Kurzantwort des Steuerstoff-Chatbots

**Der BFH hat entschieden, dass auch private wirtschaftliche, familiäre oder sonstige eigennützige Interessen des Stifters die Selbstlosigkeit einer Stiftung ausschließen können. Maßgeblich ist, ob die Stiftung nach einer Gesamtwürdigung in erster Linie diese privaten Interessen oder überwiegend die Allgemeinheit fördert, § 55 Abs. 1 AO. Bei einer unternehmensverbundenen Stiftung sind insbesondere Konzernfinanzierung, Steuervorteile, Pflichtteilsinteressen, Stimmbindungen und Vorteile nahestehender Personen zu prüfen. Ein bloßer Verstoß gegen eine rein stiftungsrechtliche Vermögenserhaltungsklausel führt dagegen nicht automatisch zum Verlust der Gemeinnützigkeit nach § 63 Abs. 1 AO. Der BFH hat den Fall zur weiteren Sachverhaltsaufklärung an das Finanzgericht zurückverwiesen.**

---

⇨ 28. Fehlervermeidung

Der Chatbot darf nicht pauschal behaupten:

- „Jedes private Motiv des Stifters führt zum Verlust der Gemeinnützigkeit.“

- „Eine Unternehmensbeteiligung ist für eine gemeinnützige Stiftung unzulässig.“

- „Jede Investition in ein verbundenes Unternehmen ist gemeinnützigkeitsschädlich.“

- „Jeder Satzungsverstoß führt zum Entzug der Gemeinnützigkeit.“

- „Stiftungsvermögen darf niemals umgeschichtet werden.“

- „Der BFH hat der Stiftung endgültig die Gemeinnützigkeit entzogen.“

Richtig ist:

- Private Interessen sind im Rahmen einer Gesamtwürdigung zu prüfen.

- Unternehmensbeteiligungen sind nicht grundsätzlich unzulässig.

- Geschäfte mit verbundenen Unternehmen müssen insbesondere fremdüblich und am Stiftungsinteresse orientiert sein.

- Nur gemeinnützigkeitsrechtlich relevante Verstöße führen zur Versagung der Steuerbefreiung.

- Der BFH hat die Sache an das Finanzgericht zurückverwiesen.

---

⇨ 29. Entscheidungslogik für den Chatbot

Bei einer Frage zu einer unternehmensverbundenen Stiftung soll der Chatbot folgende Reihenfolge verwenden:

1. Welchen gemeinnützigen Zweck verfolgt die Stiftung?

2. Welche Unternehmen oder Beteiligungen hält die Stiftung?

3. Welche Beziehungen bestehen zwischen Stifter, Stiftung und Unternehmen?

4. Erhält ein verbundenes Unternehmen Darlehen, Eigenkapital oder sonstige Vorteile?

5. Sind die Konditionen fremdüblich?

6. Welche steuerlichen Vorteile erhält der Stifter?

7. Bestehen familiäre Nachfolge- oder Pflichtteilsinteressen?

8. Wer kontrolliert Vorstand und Stiftungsrat?

9. Ist der Vorstand tatsächlich unabhängig?

10. Überwiegt die Allgemeinwohlförderung gegenüber den privaten Vorteilen?

11. Liegt ein Verstoß gegen die §§ 51 bis 68 AO vor?

12. Oder betrifft der mögliche Verstoß ausschließlich das allgemeine Stiftungsrecht?

Erst danach darf eine Einschätzung zur Selbstlosigkeit und Gemeinnützigkeit erfolgen.
`,

  chatbotRules: [
    "Nicht jedes private Motiv automatisch als gemeinnützigkeitsschädlich behandeln.",
    "Immer prüfen, ob die Stiftung in erster Linie eigenwirtschaftliche Zwecke verfolgt.",
    "Zwischen unmittelbaren und mittelbaren Vorteilen unterscheiden.",
    "Auch familiäre und sonstige eigennützige Interessen berücksichtigen.",
    "Vorteile nahestehender Personen und verbundener Unternehmen einbeziehen.",
    "Eine Gesamtwürdigung und Interessenabwägung vornehmen.",
    "Unternehmensbeteiligungen nicht pauschal als unzulässig bezeichnen.",
    "Zwischen stiftungsrechtlicher Vermögenserhaltung und gemeinnützigkeitsrechtlicher Vermögensbindung unterscheiden.",
    "Einen Satzungsverstoß nur dann als gemeinnützigkeitsschädlich werten, wenn er eine Vorgabe der §§ 51 bis 68 AO betrifft.",
    "Den Feststellungsbescheid nach § 60a AO von der Prüfung der tatsächlichen Geschäftsführung nach § 63 AO unterscheiden.",
    "Bei BFH V R 11/24 immer auf die Zurückverweisung und die noch offene endgültige Beurteilung hinweisen.",
    "Keine abschließende Behauptung über den Verlust oder Fortbestand der Gemeinnützigkeit des konkreten Streitfalls treffen."
  ],

  answerTemplates: {
    coreAnswer:
      "Private wirtschaftliche, familiäre oder sonstige eigennützige Interessen des Stifters können die Selbstlosigkeit einer Stiftung nach § 55 Abs. 1 AO ausschließen. Entscheidend ist, ob die Stiftung nach einer Gesamtwürdigung in erster Linie diese privaten Interessen oder überwiegend die Allgemeinheit fördert.",

    statuteViolation:
      "Ein Verstoß gegen eine Satzungsbestimmung führt nicht automatisch zum Verlust der Gemeinnützigkeit. Nach § 63 Abs. 1 AO ist entscheidend, ob die tatsächliche Geschäftsführung gegen die gemeinnützigkeitsrechtlichen Vorgaben der §§ 51 bis 68 AO verstößt.",

    foundationAssets:
      "Das Gemeinnützigkeitsrecht enthält keinen allgemeinen Grundsatz, nach dem das Stiftungsvermögen stets ungeschmälert erhalten bleiben muss. Die stiftungsrechtliche Vermögenserhaltung ist von der gemeinnützigkeitsrechtlichen Vermögensbindung zu unterscheiden.",

    proceduralStatus:
      "Der BFH hat nicht abschließend über die Gemeinnützigkeit entschieden, sondern die Sache zur weiteren Sachverhaltsaufklärung an das Finanzgericht zurückverwiesen."
  },

  updateTriggers: [
    "Veröffentlichung des vollständigen BFH-Urteils in amtlicher Sammlung",
    "Veröffentlichung im Bundessteuerblatt",
    "Entscheidung des Finanzgerichts im zweiten Rechtsgang",
    "Erneutes Revisionsverfahren zum selben Sachverhalt",
    "BMF-Schreiben zu unternehmensverbundenen Stiftungen",
    "Änderung der §§ 55 oder 63 AO",
    "Änderung des Stiftungsrechts zur Vermögenserhaltung",
    "Neue BFH-Rechtsprechung zu Pflichtteilsinteressen bei gemeinnützigen Stiftungen"
  ]
},
{
  id: "gemeinnuetzigkeit-liquidationsphase",

  title:
    "Gemeinnützigkeit einer Körperschaft während der Liquidations- und Abwicklungsphase",

  short:
    "Der Eintritt in die Liquidation führt nach derzeit noch nicht abschließend geklärter Rechtslage nicht zwingend automatisch zum Verlust der Gemeinnützigkeit. Entscheidend sind insbesondere die tatsächliche Geschäftsführung, die fortbestehende Vermögensbindung, die ordnungsgemäße Gläubigerbefriedigung und die abschließende Auskehr des Restvermögens an den steuerbegünstigten Anfallsberechtigten.",

  category:
    "NPO / Gemeinnützigkeit",

  legalStatus: {
    status: "BFH-Verfahren anhängig",
    currentCaseNumber: "VII R 24/25",
    formerCaseNumber: "V R 27/25",
    admissionDecision: "BFH, Beschluss vom 30.07.2025 – V B 3/24",
    lowerCourt:
      "FG Münster, Urteil vom 29.11.2023 – 13 K 1127/22 K",
    statusAsOf: "2026-07-14",
    warning:
      "Die Gemeinnützigkeitsfähigkeit einer Körperschaft in der Liquidationsphase ist höchstrichterlich noch nicht abschließend geklärt. Literaturauffassungen dürfen nicht als bereits geltende BFH-Rechtsprechung dargestellt werden."
  },

  source:
    "BFH-Verfahren VII R 24/25, vormals V R 27/25; BFH-Beschluss vom 30.07.2025 – V B 3/24; FG Münster vom 29.11.2023 – 13 K 1127/22 K",

  court: "Bundesfinanzhof, VII. Senat",

  keywords:
    "gemeinnützigkeit liquidation|gemeinnützigkeit liquidationsphase|gemeinnützige abwicklungsphase|gemeinnütziger verein in liquidation|stiftung in liquidation|ggmbh in liquidation|auflösung gemeinnützige körperschaft|aufhebung stiftung|vermögensbindung|anfallsberechtigter|restvermögen|liquidator|gläubigerbefriedigung|tatsächliche geschäftsführung|förderkörperschaft|nachversteuerung gemeinnützigkeit|zehn jahre rückwirkend|§ 5 abs. 1 nr. 9 kstg|§ 55 abs. 1 nr. 4 ao|§ 58 nr. 1 ao|§ 61 abs. 3 ao|§ 63 ao|§ 175 ao|bfh vii r 24/25|bfh v r 27/25|bfh v b 3/24|fg münster 13 k 1127/22 k",

  references: [
    "§§ 51 bis 68 AO",
    "§ 55 Abs. 1 Nr. 1 AO",
    "§ 55 Abs. 1 Nr. 4 AO",
    "§ 58 Nr. 1 AO",
    "§ 59 AO",
    "§ 61 Abs. 1 AO",
    "§ 61 Abs. 3 AO",
    "§ 63 Abs. 1 AO",
    "§ 63 Abs. 2 AO",
    "§ 63 Abs. 3 AO",
    "§ 64 AO",
    "§ 65 AO",
    "§ 175 Abs. 1 Satz 1 Nr. 2 AO",
    "§ 5 Abs. 1 Nr. 9 Satz 1 KStG",
    "§ 11 KStG",
    "§ 13 KStG",
    "§ 10b EStG",
    "§ 47 BGB",
    "§ 48 BGB",
    "§ 49 BGB",
    "§ 51 BGB",
    "§ 53 BGB",
    "§ 87c BGB",
    "BFH, Beschluss vom 30.07.2025 – V B 3/24",
    "BFH, anhängiges Verfahren VII R 24/25",
    "vormals BFH V R 27/25",
    "FG Münster, Urteil vom 29.11.2023 – 13 K 1127/22 K",
    "BFH, Urteil vom 16.05.2007 – I R 14/06",
    "BFH, Urteil vom 23.07.2003 – I R 29/02"
  ],

  officialSources: [
    "https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE202550142/",
    "https://www.bundesfinanzhof.de/de/anhaengige-verfahren/aktuelle-verfahren/",
    "https://www.fg-muenster.nrw.de/behoerde/presse/Revisionsverfahren/index.php",
    "https://nrwe.justiz.nrw.de/fgs/muenster/j2023/13_K_1127_22_K_Urteil_20231129.html",
    "https://www.gesetze-im-internet.de/kstg_1977/__5.html",
    "https://www.gesetze-im-internet.de/ao_1977/__55.html",
    "https://www.gesetze-im-internet.de/ao_1977/__58.html",
    "https://www.gesetze-im-internet.de/ao_1977/__61.html",
    "https://www.gesetze-im-internet.de/ao_1977/__63.html",
    "https://www.gesetze-im-internet.de/ao_1977/__175.html",
    "https://www.gesetze-im-internet.de/bgb/__47.html",
    "https://www.gesetze-im-internet.de/bgb/__48.html",
    "https://www.gesetze-im-internet.de/bgb/__49.html",
    "https://www.gesetze-im-internet.de/bgb/__53.html",
    "https://www.gesetze-im-internet.de/bgb/__87c.html"
  ],

  body: `
⇨ Gemeinnützigkeit in der Liquidationsphase

► 1. Aktueller Rechtsstand

Die Frage, ob eine steuerbegünstigte Körperschaft auch während ihrer Liquidations- oder Abwicklungsphase gemeinnützig bleiben kann, ist höchstrichterlich noch nicht abschließend entschieden.

Beim Bundesfinanzhof ist hierzu das Revisionsverfahren

**BFH VII R 24/25**

anhängig.

Das Verfahren wurde zuvor unter dem Aktenzeichen

**BFH V R 27/25**

geführt.

Vorinstanz ist das Urteil des FG Münster vom 29.11.2023 – 13 K 1127/22 K.

Die Revision wurde durch den BFH-Beschluss vom 30.07.2025 – V B 3/24 zugelassen.

► Zwingender Hinweis für den Chatbot

Der Chatbot darf nicht behaupten, der BFH habe bereits entschieden, dass

- die Liquidation automatisch zum Verlust der Gemeinnützigkeit führt,
- die Gemeinnützigkeit während jeder Liquidation fortbesteht oder
- eine zehnjährige rückwirkende Nachversteuerung stets oder niemals zulässig ist.

Diese Fragen sind Gegenstand des noch anhängigen Revisionsverfahrens.

---

⇨ 2. Zentrale Rechtsfragen des BFH-Verfahrens

Der BFH wird insbesondere folgende Fragen klären:

► Erste Rechtsfrage

**Führen die Auflösung oder Aufhebung einer Körperschaft und der Eintritt in die Liquidation bereits für sich genommen zum Verlust der Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG?**

► Zweite Rechtsfrage

**Kann bei Auflösung oder Aufhebung einer Körperschaft aufgrund von § 61 Abs. 3 Satz 2 und § 63 Abs. 2 AO eine Nachversteuerung für Steuern erfolgen, die innerhalb der letzten zehn Kalenderjahre vor der Auflösung oder Aufhebung entstanden sind?**

---

⇨ 3. Ausgangspunkt der Steuerbefreiung

► § 5 Abs. 1 Nr. 9 Satz 1 KStG

Von der Körperschaftsteuer sind Körperschaften, Personenvereinigungen und Vermögensmassen befreit, die

- nach ihrer Satzung und
- nach ihrer tatsächlichen Geschäftsführung

ausschließlich und unmittelbar gemeinnützigen, mildtätigen oder kirchlichen Zwecken dienen.

Die Voraussetzungen richten sich nach den §§ 51 bis 68 AO.

⇶  Lernsatz

**Die Gemeinnützigkeit verlangt sowohl eine ordnungsgemäße Satzung als auch eine den Satzungsbestimmungen entsprechende tatsächliche Geschäftsführung.**

---

⇨ 4. Liquidation beendet die Körperschaft nicht sofort

Die Auflösung einer Körperschaft und ihr endgültiges Erlöschen sind voneinander zu unterscheiden.

Mit dem Auflösungsbeschluss beginnt regelmäßig zunächst die Liquidations- oder Abwicklungsphase.

Die Körperschaft besteht während dieser Phase für die Zwecke der Liquidation grundsätzlich fort.

► Beispiel Verein

Nach § 49 Abs. 2 BGB gilt der Verein bis zur Beendigung der Liquidation als fortbestehend, soweit der Zweck der Liquidation dies erfordert.

► Beispiel Stiftung

Für Stiftungen ergeben sich die Regelungen zur Vermögensabwicklung insbesondere aus § 87c BGB.

⇶  Lernsatz

**Auflösung ist nicht gleich Erlöschen. Die Körperschaft besteht während der notwendigen Liquidationsphase für Abwicklungszwecke fort.**

---

⇨ 5. Zivilrechtliche Aufgaben des Liquidators

Nach § 49 Abs. 1 BGB haben die Liquidatoren insbesondere

1. die laufenden Geschäfte zu beenden,
2. Forderungen einzuziehen,
3. das übrige Vermögen erforderlichenfalls in Geld umzusetzen,
4. die Gläubiger zu befriedigen und
5. den verbleibenden Überschuss den Anfallsberechtigten auszukehren.

Zur Beendigung schwebender Geschäfte dürfen die Liquidatoren auch neue, dem Liquidationszweck dienende Geschäfte eingehen.

⇶  Lernsatz

**Die Befriedigung bestehender Gläubiger ist eine gesetzliche Liquidationsaufgabe und geht der Auskehr des Restvermögens an den Anfallsberechtigten voraus.**

⇶  Achtung

Die Begleichung bestehender Verbindlichkeiten ist nicht allein deshalb gemeinnützigkeitsschädlich, weil der Gläubiger selbst keine steuerbegünstigte Körperschaft ist.

Es muss geprüft werden,

- ob die Verbindlichkeit wirksam besteht,
- ob sie ordnungsgemäß begründet wurde,
- ob ihre Erfüllung dem Liquidationszweck dient und
- ob keine verdeckte Mittelzuwendung oder privatnützige Begünstigung vorliegt.

---

⇨ 6. Tatsächliche Geschäftsführung während der Liquidation

► § 63 Abs. 1 AO

Die tatsächliche Geschäftsführung muss auf die ausschließliche und unmittelbare Erfüllung der steuerbegünstigten Zwecke gerichtet sein und den Satzungsbestimmungen entsprechen.

Auch während der Liquidationsphase muss daher geprüft werden, wie die Körperschaft ihr Vermögen tatsächlich verwaltet und verwendet.

⇶  Maßgebliche Fragen

- Werden nur notwendige Abwicklungsmaßnahmen durchgeführt?
- Werden bestehende und berechtigte Gläubiger befriedigt?
- Wird das Vermögen erhalten, soweit dies für die Abwicklung möglich ist?
- Wird eine zweckwidrige oder privatnützige Verwendung vermieden?
- Wird das verbleibende Restvermögen dem satzungsmäßigen steuerbegünstigten Anfallsberechtigten zugeführt?
- Wird die Liquidation ohne sachlich nicht gerechtfertigte Verzögerung durchgeführt?
- Werden Satzung, Gesetz und Vermögensbindung eingehalten?

⇶  Lernsatz

**Auch in der Liquidation ist nicht die bloße Bezeichnung als gemeinnützig entscheidend, sondern die tatsächliche Verwendung und Verwaltung des Vermögens.**

---

⇨ 7. Grundsatz der Vermögensbindung

► § 55 Abs. 1 Nr. 4 AO

Bei Auflösung oder Aufhebung der Körperschaft oder bei Wegfall ihres bisherigen Zwecks darf das Vermögen grundsätzlich nur für steuerbegünstigte Zwecke verwendet werden.

Ausgenommen sind lediglich die in § 55 Abs. 1 Nr. 2 AO bezeichneten Rückgewährungen von Kapitalanteilen und Sacheinlagen.

Die Vermögensbindung kann insbesondere erfüllt werden, indem das Restvermögen

- einer anderen steuerbegünstigten Körperschaft oder
- einer juristischen Person des öffentlichen Rechts

zur Verwendung für steuerbegünstigte Zwecke übertragen wird.

⇶  Lernsatz

**Das nach Abschluss der Liquidation verbleibende gebundene Vermögen muss dem satzungsmäßigen steuerbegünstigten Anfallsberechtigten zugeführt oder für den genau bezeichneten steuerbegünstigten Zweck verwendet werden.**

---

⇨ 8. Satzungsmäßige Vermögensbindung

► § 61 Abs. 1 AO

Die Satzung muss den Verwendungszweck des Vermögens bei

- Auflösung,
- Aufhebung oder
- Wegfall des bisherigen steuerbegünstigten Zwecks

so genau bestimmen, dass geprüft werden kann, ob der vorgesehene Vermögensanfall steuerbegünstigt ist.

⇶  Erforderlich ist grundsätzlich

- die genaue Bezeichnung eines steuerbegünstigten Anfallsberechtigten oder
- die genaue Bezeichnung des steuerbegünstigten Verwendungszwecks.

⇶  Lernsatz

**Die Satzung muss eine anderweitige, insbesondere privatnützige Verwendung des verbleibenden Restvermögens ausschließen.**

---

⇨ 9. Formelle und tatsächliche Vermögensbindung

Es sind zwei Ebenen zu unterscheiden.

► Formelle Vermögensbindung

Die Satzung enthält eine den Anforderungen des § 61 Abs. 1 AO entsprechende Vermögensbindungsklausel.

► Tatsächliche Vermögensbindung

Die Körperschaft und ihre Liquidatoren verwenden das Vermögen tatsächlich entsprechend der Satzung und den §§ 55, 61 und 63 AO.

⇶  Wichtig

Eine formal ordnungsgemäße Satzung schützt nicht vor dem Verlust der Gemeinnützigkeit, wenn die tatsächliche Geschäftsführung das Vermögen entgegen der Bindung verwendet.

⇶  Lernsatz

**Die Vermögensbindung muss sowohl in der Satzung als auch in der tatsächlichen Abwicklung eingehalten werden.**

---

⇨ 10. Nicht jede Verzögerung der Vermögensauskehr ist automatisch schädlich

Das Restvermögen kann regelmäßig erst ausgekehrt werden, nachdem

- laufende Geschäfte beendet,
- Forderungen eingezogen,
- Vermögensgegenstände verwertet,
- Steuern und sonstige Verbindlichkeiten ermittelt,
- Gläubiger befriedigt und
- bestehende Risiken abgewickelt wurden.

Die bloße Tatsache, dass die Auskehr nicht unmittelbar nach dem Auflösungsbeschluss erfolgt, begründet daher nicht ohne Weiteres einen Verstoß gegen die Vermögensbindung.

⇶  Entscheidend sind

- der Grund der Verzögerung,
- die Notwendigkeit der noch laufenden Abwicklung,
- die Höhe und Berechtigung bestehender Verbindlichkeiten,
- die Sicherung des gebundenen Vermögens,
- die Tätigkeit des Liquidators und
- die ernsthafte Vorbereitung der endgültigen Vermögensauskehr.

⇶  Lernsatz

**Eine sachlich notwendige Verzögerung der Auskehr ist von einer gemeinnützigkeitsschädlichen Zweckentfremdung des Vermögens zu unterscheiden.**

---

⇨ 11. Der Fall des FG Münster

► Sachverhalt in Grundzügen

Bei der Klägerin handelte es sich um eine Stiftung, die durch die Stiftungsaufsicht aufgehoben worden war und sich in Liquidation befand.

Die Stiftung war mit einer lebenslangen Rentenverpflichtung belastet.

Nach ihrer Aufhebung verfolgte sie keine operativen gemeinnützigen Zwecke mehr, sondern bediente weiterhin die Rentenverpflichtung.

Das Vermögen wurde nicht an den satzungsmäßigen steuerbegünstigten Anfallsberechtigten ausgekehrt.

► Entscheidung des FG Münster

Das FG Münster nahm einen Verstoß der tatsächlichen Geschäftsführung gegen den Grundsatz der Vermögensbindung an.

Das Gericht hielt eine rückwirkende Aberkennung der Gemeinnützigkeit und die Nachversteuerung der Jahre 2008 bis 2017 für rechtmäßig.

Nach Auffassung des FG

- verfolgte die Stiftung nach ihrer Aufhebung keine gemeinnützigen Zwecke mehr,
- diente ihre Tätigkeit ausschließlich der Erfüllung der individualnützigen Rentenverpflichtung,
- wurde das gebundene Vermögen nicht an den Anfallsberechtigten ausgekehrt und
- war nicht absehbar, dass eine solche Auskehr noch erfolgen würde.

Das FG stellte außerdem darauf ab, dass keine strikte Trennung zwischen dem für die Rentenverpflichtung bestimmten Vermögen und dem gemeinnützig gebundenen Vermögen erfolgt war.

⇶  Wichtig

Das FG hat nicht lediglich abstrakt entschieden, dass jede Liquidation automatisch gemeinnützigkeitsschädlich sei.

Das Gericht stellte maßgeblich auf die konkrete tatsächliche Geschäftsführung, die Vermögensverwendung und die dauerhafte Nichterfüllung der gemeinnützigen Vermögensbindung ab.

---

⇨ 12. Keine Verschuldensprüfung nach Auffassung des FG Münster

Das FG Münster ging davon aus, dass die Nachversteuerung nach § 63 Abs. 2 in Verbindung mit § 61 Abs. 3 AO an einen objektiven Verstoß gegen die Vermögensbindung anknüpft.

Ein persönliches Verschulden der Stiftung oder des Liquidators sei danach nicht erforderlich.

⇶  Lernsatz zur FG-Entscheidung

**Nach Auffassung des FG Münster kann ein objektiver Verstoß gegen die tatsächliche Vermögensbindung auch ohne Verschulden zu einer rückwirkenden Nachversteuerung führen.**

⇶  Achtung

Ob der BFH diese Auffassung bestätigt, ist noch offen.

---

⇨ 13. Die Gegenauffassung: Gemeinnützige Abwicklungsphase

In der Fachliteratur wird vertreten, dass einer steuerbegünstigten Körperschaft spiegelbildlich zur anerkannten Anlaufphase auch eine notwendige gemeinnützige Abwicklungsphase zuzugestehen ist.

Danach führt die Einstellung der operativen Zweckverwirklichung während einer notwendigen Liquidation nicht automatisch zum Verlust der Gemeinnützigkeit.

► Begründungsansätze

⇶  1. Spiegelbildlichkeit zur Anlaufphase

Kann eine Körperschaft bereits während vorbereitender Maßnahmen gemeinnützig sein, obwohl sie ihren Satzungszweck noch nicht vollständig verwirklicht, soll dies entsprechend auch für die notwendige Abwicklungsphase gelten.

⇶  2. Gesetzliche Notwendigkeit der Liquidation

Die Liquidation ist gesetzlich vorgeschrieben und notwendiger Teil der rechtlichen Beendigung einer Körperschaft.

⇶  3. Einheit der Rechtsordnung

Steuerrecht und Zivilrecht sollten nicht widersprüchliche Anforderungen stellen.

Ein Liquidator darf Vermögen nicht an den Anfallsberechtigten auskehren, solange berechtigte Gläubiger noch nicht befriedigt oder gesichert sind.

⇶  4. Fortbestehende Vermögensbindung

Auch während der Liquidation bleibt das Restvermögen gemeinnützig gebunden.

⇶  5. Finale gemeinnützige Mittelverwendung

Die abschließende Zuwendung des Restvermögens an den steuerbegünstigten Anfallsberechtigten kann als letzter Akt der gemeinnützigen Mittelverwendung verstanden werden.

► Zwingender Statushinweis

Diese sogenannte gemeinnützige Abwicklungsphase ist eine in der Literatur vertretene Rechtsauffassung.

Sie ist bislang nicht als allgemeiner Grundsatz durch eine abschließende BFH-Entscheidung bestätigt.

---

⇨ 14. Einordnung als Förderkörperschaft

Nach einer in der Literatur vertretenen Auffassung kann sich die operative Körperschaft während der Liquidation funktional zu einer Förderkörperschaft entwickeln.

► § 58 Nr. 1 AO

Die Steuervergünstigung wird nicht dadurch ausgeschlossen, dass eine Körperschaft einer anderen Körperschaft oder einer juristischen Person des öffentlichen Rechts Mittel zur Verwirklichung steuerbegünstigter Zwecke zuwendet.

Die abschließende Auskehr des Restvermögens an den steuerbegünstigten Anfallsberechtigten könnte danach als eigene steuerbegünstigte Zweckverwirklichung durch Mittelweitergabe beurteilt werden.

⇶  Vorsichtige Formulierung

**Nach einer Literaturauffassung kann die abschließende Auskehr des Restvermögens an einen steuerbegünstigten Anfallsberechtigten als Fördertätigkeit im Sinne des § 58 Nr. 1 AO verstanden werden.**

⇶  Nicht zulässige Formulierung

**Mit der Auflösung wird jede gemeinnützige Körperschaft automatisch und rechtssicher zu einer Förderkörperschaft.**

Diese Aussage wäre derzeit zu weitgehend und höchstrichterlich nicht abgesichert.

---

⇨ 15. Zulässige Abwicklungsmaßnahmen

Folgende Maßnahmen können grundsätzlich notwendige und gemeinnützigkeitsrechtlich unschädliche Liquidationshandlungen sein:

- Beendigung laufender Verträge,
- Kündigung von Dauerschuldverhältnissen,
- Einziehung bestehender Forderungen,
- Veräußerung nicht mehr benötigter Vermögensgegenstände,
- Erfüllung wirksamer Altverbindlichkeiten,
- Begleichung von Arbeitnehmer-, Miet-, Steuer- und Lieferantenverbindlichkeiten,
- Bildung erforderlicher Sicherheiten für bekannte Gläubiger,
- Durchführung notwendiger Prozesse,
- Erstellung der Liquidationsrechnungslegung,
- Erfüllung steuerlicher Erklärungspflichten,
- Ermittlung des verbleibenden Restvermögens,
- Vorbereitung und Durchführung der Auskehr an den Anfallsberechtigten.

⇶  Voraussetzung

Die Maßnahmen müssen

- tatsächlich dem Liquidationszweck dienen,
- wirtschaftlich angemessen sein,
- ordnungsgemäß dokumentiert werden und
- dürfen keine verdeckte privatnützige Vermögensverwendung darstellen.

---

⇨ 16. Mögliche gemeinnützigkeitsschädliche Vorgänge

Gemeinnützigkeitsrechtlich problematisch können insbesondere sein:

- Auskehr des Vermögens an Mitglieder oder Gesellschafter,
- Verwendung des Vermögens für private Zwecke,
- Begünstigung nahestehender Personen ohne angemessene Gegenleistung,
- Zahlung nicht bestehender oder überhöhter Verbindlichkeiten,
- zweckwidrige Veräußerung unter Wert,
- Fortführung einer nicht mehr dem Liquidationszweck dienenden Tätigkeit,
- Vermögensverbrauch ohne Bezug zur Abwicklung,
- dauerhafte Untätigkeit des Liquidators,
- vermeidbare Verzögerung der Vermögensauskehr,
- fehlende Trennung zwischen gebundenem Vermögen und privatnützigen Verpflichtungen,
- Auskehr an einen nicht steuerbegünstigten Anfallsberechtigten,
- Abweichung von der satzungsmäßigen Vermögensbindung.

---

⇨ 17. Zehnjährige rückwirkende Nachversteuerung

► Gesetzlicher Ausgangspunkt

Nach § 63 Abs. 2 AO gilt für eine Verletzung der Vermögensbindung § 61 Abs. 3 AO.

§ 61 Abs. 3 AO enthält eine besondere rückwirkende Rechtsfolge und verweist auf § 175 Abs. 1 Satz 1 Nr. 2 AO.

Dadurch können unter den gesetzlichen Voraussetzungen Steuerbescheide für einen Zeitraum von bis zu zehn Kalenderjahren betroffen sein.

► Auffassung des FG Münster

Das FG Münster hielt im konkreten Fall eine rückwirkende Aberkennung der Gemeinnützigkeit für zehn Jahre für zulässig.

► Gegenauffassung

In der Literatur wird vertreten, dass der bloße Eintritt in die Liquidation jedenfalls keine rückwirkende Aberkennung für bereits abgeschlossene Zeiträume rechtfertige.

Selbst bei einem Verlust der Gemeinnützigkeit solle die Wirkung danach grundsätzlich erst ab Eintritt in die schädliche Liquidations- oder Geschäftsführungsphase eintreten.

► Offene BFH-Frage

Ob und unter welchen Voraussetzungen die zehnjährige Rückwirkung im Fall der Auflösung oder Aufhebung einer Körperschaft eingreift, ist ausdrücklich Gegenstand des anhängigen BFH-Verfahrens.

⇶  Lernsatz

**Eine zehnjährige Rückwirkung ist keine automatische Folge jeder Liquidation, kann aber bei einem tatsächlichen Verstoß gegen die Vermögensbindung nach §§ 61 Abs. 3, 63 Abs. 2 AO in Betracht kommen.**

---

⇨ 18. Abgrenzung: Liquidation und Verstoß gegen die Vermögensbindung

► Liquidation allein

- Auflösungsbeschluss wurde gefasst.
- Operative Tätigkeit wird beendet.
- Forderungen und Verbindlichkeiten werden abgewickelt.
- Restvermögen bleibt gesichert.
- Auskehr an den steuerbegünstigten Anfallsberechtigten wird vorbereitet.

► Möglicher schädlicher Verstoß

- Vermögen wird tatsächlich zweckwidrig verbraucht.
- Privatnützige Verpflichtungen werden aus gebundenem Vermögen erfüllt, obwohl dies unzulässig ist.
- Eine Auskehr an den steuerbegünstigten Anfallsberechtigten ist dauerhaft ausgeschlossen.
- Die Satzungsbindung wird tatsächlich nicht eingehalten.
- Die Körperschaft verfolgt ausschließlich sachfremde Zwecke.

⇶  Lernsatz

**Nicht der formale Liquidationsstatus, sondern die konkrete tatsächliche Geschäftsführung und Vermögensverwendung können den entscheidenden Gemeinnützigkeitsverstoß begründen.**

---

⇨ 19. Körperschaftsteuer während der Liquidation

Besteht die Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG fort, können insbesondere weiterhin steuerfrei sein:

- Einkünfte des ideellen Bereichs,
- Einkünfte aus einer steuerfreien Vermögensverwaltung und
- Einkünfte aus steuerbegünstigten Zweckbetrieben.

Einkünfte aus einem steuerpflichtigen wirtschaftlichen Geschäftsbetrieb bleiben nach Maßgabe des § 64 AO grundsätzlich steuerpflichtig.

Entfällt die Steuerbefreiung, können auch zuvor steuerfreie Vermögensverwaltungs- oder Zweckbetriebserträge der Körperschaftsteuer unterliegen.

⇶  Lernsatz

**Die Liquidation ändert nicht automatisch die Einordnung sämtlicher Tätigkeitsbereiche; entscheidend ist zunächst, ob die Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG fortbesteht.**

---

⇨ 20. Zuwendungsbestätigungen während der Liquidation

Eine Körperschaft darf nicht allein deshalb Zuwendungsbestätigungen ausstellen, weil sie früher gemeinnützig war.

Vor Ausstellung muss geprüft werden, ob

- die Körperschaft im betreffenden Zeitpunkt noch zum Empfang steuerlich abziehbarer Zuwendungen berechtigt ist,
- ein gültiger Freistellungsbescheid oder eine sonstige ausreichende steuerliche Grundlage besteht,
- die tatsächliche Geschäftsführung weiterhin den §§ 51 ff. AO entspricht und
- die Zuwendung tatsächlich für steuerbegünstigte Zwecke verwendet wird.

⇶  Besondere Vorsicht

Bestehen erhebliche Zweifel am Fortbestand der Gemeinnützigkeit oder befindet sich die Körperschaft in einem streitigen Liquidationsfall, sollte die Ausstellung von Zuwendungsbestätigungen vorab mit dem zuständigen Finanzamt abgestimmt werden.

⇶  Lernsatz

**Der Liquidationsstatus allein berechtigt weder zur Ausstellung noch führt er automatisch zum Verbot von Zuwendungsbestätigungen; maßgeblich ist der aktuelle steuerliche Gemeinnützigkeitsstatus.**

---

⇨ 21. Abgrenzung zum Insolvenzverfahren

Liquidation und Insolvenz sind nicht gleichzusetzen.

► Liquidation

Die Körperschaft wird geordnet abgewickelt. Grundsätzlich sollen sämtliche Gläubiger befriedigt und das verbleibende Restvermögen ausgekehrt werden.

► Insolvenz

Das Vermögen reicht regelmäßig nicht aus, um alle Gläubiger vollständig zu befriedigen, oder die Körperschaft ist zahlungsunfähig.

Der BFH hat für einen Insolvenzfall entschieden, dass die Körperschaftsteuerbefreiung jedenfalls dann endet, wenn

- die steuerbegünstigte Tätigkeit eingestellt wird und
- über das Vermögen der Körperschaft das Insolvenzverfahren eröffnet ist.

Ob bereits die Insolvenzeröffnung allein genügt oder zusätzliche Voraussetzungen erforderlich sind, ist in der Literatur umstritten.

⇶  Lernsatz

**Die Rechtsprechung zum Insolvenzverfahren darf nicht ohne weitere Prüfung auf eine geordnete Liquidation übertragen werden.**

---

⇨ 22. Prüfungsschema Gemeinnützigkeit in Liquidation

► Schritt 1: Körperschaft und Auflösungsgrund feststellen

- Verein?
- Stiftung?
- gGmbH?
- andere Körperschaft?
- freiwillige Auflösung?
- behördliche Aufhebung?
- Insolvenz?

► Schritt 2: Zivilrechtlichen Status prüfen

- Auflösung beschlossen?
- Liquidatoren bestellt?
- Körperschaft bereits erloschen?
- Liquidation noch nicht beendet?

► Schritt 3: Satzungsmäßige Voraussetzungen prüfen

- Steuerbegünstigter Zweck weiterhin enthalten?
- Ordnungsgemäße Vermögensbindung nach § 61 Abs. 1 AO?
- Steuerbegünstigter Anfallsberechtigter eindeutig bestimmt?

► Schritt 4: Tatsächliche Geschäftsführung prüfen

- Welche Tätigkeiten werden noch ausgeübt?
- Dienen sie der notwendigen Abwicklung?
- Werden steuerbegünstigte Zwecke noch operativ verfolgt?
- Erfolgt eine Fördertätigkeit?
- Werden nur Altverbindlichkeiten erfüllt?
- Gibt es privatnützige Zahlungen?

► Schritt 5: Vermögensbindung prüfen

- Ist das Restvermögen gesichert?
- Wird es für steuerbegünstigte Zwecke erhalten?
- Ist die Auskehr an den Anfallsberechtigten ernsthaft vorgesehen?
- Bestehen unzulässige Vermögensabflüsse?
- Wurde gebundenes Vermögen verbraucht?

► Schritt 6: Gläubigerbefriedigung prüfen

- Besteht die Verbindlichkeit rechtlich?
- Wurde sie bereits vor der Liquidation wirksam begründet?
- Ist die Zahlung zur ordnungsgemäßen Abwicklung erforderlich?
- Ist die Zahlung angemessen?
- Liegt eine verdeckte Begünstigung vor?

► Schritt 7: Steuerbefreiung beurteilen

- Fortbestand nach § 5 Abs. 1 Nr. 9 KStG vertretbar?
- Nur einzelne wirtschaftliche Geschäftsbetriebe steuerpflichtig?
- Vollständiger Verlust der Gemeinnützigkeit?
- Rechtslage wegen BFH VII R 24/25 offen?

► Schritt 8: Rückwirkung prüfen

- Liegt tatsächlich ein Verstoß gegen die Vermögensbindung vor?
- Wann begann der Verstoß?
- Sind §§ 61 Abs. 3, 63 Abs. 2 und 175 Abs. 1 Satz 1 Nr. 2 AO anwendbar?
- Welche Veranlagungszeiträume wären betroffen?
- Einspruch oder Ruhen des Verfahrens wegen BFH VII R 24/25 prüfen.

---

⇨ 23. Risikostufen für die Chatbot-Antwort

► Geringeres Risiko

- Abwicklung erfolgt zügig.
- Gläubiger werden ordnungsgemäß befriedigt.
- Vermögen bleibt gesichert.
- Anfallsberechtigter ist steuerbegünstigt.
- Auskehr wird vorbereitet.
- Sämtliche Vorgänge sind dokumentiert.

► Mittleres Risiko

- Liquidation dauert mehrere Jahre.
- Einzelne Rechtsstreitigkeiten oder Dauerschuldverhältnisse bestehen.
- Operative Zweckverwirklichung wurde eingestellt.
- Restvermögen ist grundsätzlich noch gesichert.
- Abstimmung mit dem Finanzamt fehlt.

► Hohes Risiko

- Gebundenes Vermögen wird laufend für privatnützige Zwecke verbraucht.
- Eine Auskehr an den Anfallsberechtigten ist nicht absehbar.
- Der Liquidator bleibt untätig.
- Vermögenstrennung fehlt.
- Forderungen nahestehender Personen werden überhöht bedient.
- Satzung und tatsächliche Geschäftsführung weichen voneinander ab.

---

⇨ 24. Kompakte Lernsätze

1. Die Auflösung einer Körperschaft ist von ihrem endgültigen Erlöschen zu unterscheiden.

2. Eine Körperschaft besteht während der Liquidation grundsätzlich für Abwicklungszwecke fort.

3. Die Liquidation führt nach derzeit ungeklärter Rechtslage nicht nachweislich allein und automatisch zum Verlust der Gemeinnützigkeit.

4. Die Steuerbefreiung richtet sich auch während der Liquidation nach § 5 Abs. 1 Nr. 9 KStG in Verbindung mit den §§ 51 bis 68 AO.

5. Satzungsmäßige Voraussetzungen und tatsächliche Geschäftsführung müssen nebeneinander erfüllt sein.

6. Die tatsächliche Geschäftsführung muss nach § 63 Abs. 1 AO auf die ausschließliche und unmittelbare Erfüllung steuerbegünstigter Zwecke gerichtet sein.

7. Das nach der Liquidation verbleibende Vermögen unterliegt der Vermögensbindung des § 55 Abs. 1 Nr. 4 AO.

8. Die Satzung muss den steuerbegünstigten Anfallsberechtigten oder den steuerbegünstigten Verwendungszweck hinreichend genau bestimmen, § 61 Abs. 1 AO.

9. Eine ordnungsgemäße Satzung genügt nicht, wenn die tatsächliche Vermögensverwendung gegen die Vermögensbindung verstößt.

10. Liquidatoren müssen zunächst laufende Geschäfte beenden und die Gläubiger befriedigen, § 49 Abs. 1 BGB.

11. Das Restvermögen darf erst nach der notwendigen Abwicklung an den Anfallsberechtigten ausgekehrt werden.

12. Die Erfüllung wirksamer Altverbindlichkeiten ist grundsätzlich eine zulässige Liquidationsmaßnahme.

13. Die Begleichung bestehender Verbindlichkeiten ist nicht automatisch eine gemeinnützigkeitsschädliche Mittelverwendung.

14. Privatnützige, überhöhte oder nicht bestehende Zahlungen können gegen die Selbstlosigkeit und Vermögensbindung verstoßen.

15. Eine sachlich notwendige Verzögerung der Vermögensauskehr ist von einer zweckwidrigen Vermögensverwendung zu unterscheiden.

16. Nach Auffassung des FG Münster kann ein objektiver Verstoß gegen die Vermögensbindung auch ohne Verschulden zur Nachversteuerung führen.

17. Das FG Münster hielt im Verfahren 13 K 1127/22 K eine zehnjährige rückwirkende Nachversteuerung für zulässig.

18. Ob der BFH die Auffassung des FG Münster bestätigt, ist im Verfahren VII R 24/25 noch offen.

19. Das Verfahren VII R 24/25 wurde zuvor unter dem Aktenzeichen V R 27/25 geführt.

20. Der BFH hat die Revision mit Beschluss vom 30.07.2025 – V B 3/24 zugelassen.

21. In der Literatur wird eine gemeinnützige Abwicklungsphase spiegelbildlich zur gemeinnützigen Anlaufphase befürwortet.

22. Die gemeinnützige Abwicklungsphase ist bislang keine abschließend bestätigte BFH-Rechtsprechung.

23. Nach einer Literaturauffassung kann die abschließende Auskehr des Restvermögens als Mittelweitergabe nach § 58 Nr. 1 AO eingeordnet werden.

24. Eine automatische Umwandlung jeder Körperschaft in eine Förderkörperschaft ist rechtlich noch nicht gesichert.

25. Die abschließende Übertragung des Restvermögens an den steuerbegünstigten Anfallsberechtigten ist der letzte Akt der Vermögensbindung.

26. Eine zehnjährige Rückwirkung ist nicht automatisch Folge des bloßen Liquidationsbeschlusses.

27. Die Anwendung der §§ 61 Abs. 3 und 63 Abs. 2 AO setzt einen rechtlich relevanten Verstoß gegen die Vermögensbindung voraus.

28. Liquidation und Insolvenz müssen gemeinnützigkeitsrechtlich voneinander unterschieden werden.

29. Zuwendungsbestätigungen dürfen während der Liquidation nur bei fortbestehender Berechtigung ausgestellt werden.

30. Bei ungeklärtem Gemeinnützigkeitsstatus sollte vor Ausstellung von Zuwendungsbestätigungen eine Abstimmung mit dem Finanzamt erfolgen.

31. Einkünfte aus einem steuerpflichtigen wirtschaftlichen Geschäftsbetrieb bleiben auch bei fortbestehender Gemeinnützigkeit nach § 64 AO grundsätzlich steuerpflichtig.

32. Entscheidend sind stets die konkrete tatsächliche Geschäftsführung und die tatsächliche Verwendung des Vermögens.

---

⇨ 25. Prüfungssichere Formulierung

**Die Auflösung der Körperschaft und der Eintritt in die Liquidation führen nach der bislang nicht abschließend geklärten Rechtslage nicht zwingend bereits für sich genommen zum Verlust der Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG. Auch während der Liquidation müssen jedoch die satzungsmäßigen Voraussetzungen und die Anforderungen an die tatsächliche Geschäftsführung nach §§ 59, 61 und 63 AO eingehalten werden. Insbesondere muss das nach Befriedigung der Gläubiger verbleibende Vermögen entsprechend § 55 Abs. 1 Nr. 4 AO an den satzungsmäßigen steuerbegünstigten Anfallsberechtigten ausgekehrt oder für den bestimmten steuerbegünstigten Zweck verwendet werden. Ob der bloße Eintritt in die Liquidation zum Verlust der Steuerbefreiung führt und ob eine zehnjährige rückwirkende Nachversteuerung nach §§ 61 Abs. 3, 63 Abs. 2 und 175 Abs. 1 Satz 1 Nr. 2 AO zulässig ist, ist Gegenstand des anhängigen BFH-Verfahrens VII R 24/25, vormals V R 27/25.**

---

⇨ 26. Kurzantwort des Chatbots

**Die Liquidation einer gemeinnützigen Körperschaft führt nach derzeit noch ungeklärter Rechtslage nicht automatisch zum Verlust der Gemeinnützigkeit. Entscheidend ist, ob die tatsächliche Geschäftsführung weiterhin den §§ 51 ff. AO entspricht, die Gläubiger ordnungsgemäß befriedigt werden und das verbleibende Vermögen nach § 55 Abs. 1 Nr. 4 und § 61 AO dem steuerbegünstigten Anfallsberechtigten zufließt. Das FG Münster hat in einem konkreten Fall wegen eines Verstoßes gegen die Vermögensbindung eine zehnjährige Nachversteuerung bestätigt. Ob diese Grundsätze Bestand haben und bereits die Liquidation als solche schädlich ist, wird der BFH im anhängigen Verfahren VII R 24/25, vormals V R 27/25, klären.**

---

⇨ 27. Antwortlogik für den Steuerstoff-Chatbot

Bei Fragen zur Gemeinnützigkeit in der Liquidation soll der Chatbot zunächst folgende Informationen erfragen:

1. Welche Rechtsform hat die Körperschaft?

2. Wurde sie lediglich aufgelöst oder ist sie bereits endgültig erloschen?

3. Seit wann befindet sie sich in Liquidation?

4. Wer ist Liquidator?

5. Welche Tätigkeiten werden noch ausgeübt?

6. Werden noch operative steuerbegünstigte Zwecke verwirklicht?

7. Werden lediglich bestehende Geschäfte und Verbindlichkeiten abgewickelt?

8. Welche Gläubigerforderungen bestehen?

9. Wann und aus welchem Grund wurden diese Verbindlichkeiten begründet?

10. Ist die Vermögensbindungsklausel der Satzung ordnungsgemäß?

11. Wer ist satzungsmäßiger Anfallsberechtigter?

12. Ist der Anfallsberechtigte steuerbegünstigt?

13. Ist das Restvermögen vollständig gesichert?

14. Wurde Vermögen für Mitglieder, Gesellschafter oder andere Privatpersonen verwendet?

15. Besteht eine ordnungsgemäße Trennung verschiedener Vermögensbereiche?

16. Ist die endgültige Auskehr konkret geplant?

17. Warum dauert die Liquidation gegebenenfalls mehrere Jahre?

18. Liegt bereits eine Aberkennung der Gemeinnützigkeit oder eine Nachversteuerung vor?

19. Sind die betroffenen Steuerbescheide noch anfechtbar?

20. Kommt ein Einspruch mit Hinweis auf das anhängige BFH-Verfahren VII R 24/25 in Betracht?

---

⇨ 28. Verbotene Übervereinfachungen

Der Chatbot darf nicht pauschal sagen:

- „Eine Körperschaft in Liquidation ist immer gemeinnützig.“
- „Mit dem Liquidationsbeschluss endet die Gemeinnützigkeit automatisch.“
- „Alle Gläubigerzahlungen sind gemeinnützigkeitsschädlich.“
- „Die Gemeinnützigkeit fällt immer zehn Jahre rückwirkend weg.“
- „In der Liquidation dürfen immer Zuwendungsbestätigungen ausgestellt werden.“
- „Die Körperschaft wird automatisch zu einer Förderkörperschaft.“
- „Das FG-Münster-Urteil ist bereits abschließende BFH-Rechtsprechung.“
- „Das Verfahren läuft weiterhin ausschließlich unter V R 27/25.“

Stattdessen ist auf die offene Rechtslage und das aktuelle Verfahren VII R 24/25 hinzuweisen.
`
},
{
  id: "estg-001-steuerpflicht",
  title: "§ 1 EStG – Steuerpflicht",
  short: "Regelt die unbeschränkte und beschränkte Einkommensteuerpflicht.",
  category: "Gesetze",
  source: "EStG",
  keywords: "estg|§1|steuerpflicht",
  references: ["§ 1 EStG"],
  body: `Einkommensteuergesetz (EStG)
§ 1 Steuerpflicht
(1) 1Natürliche Personen, die im Inland einen Wohnsitz oder ihren gewöhnlichen Aufenthalt haben, sind unbeschränkt einkommensteuerpflichtig. 2Zum Inland im Sinne dieses Gesetzes gehört auch der der Bundesrepublik Deutschland zustehende Anteil
1.
an der ausschließlichen Wirtschaftszone, soweit dort
a)
die lebenden und nicht lebenden natürlichen Ressourcen der Gewässer über dem Meeresboden, des Meeresbodens und seines Untergrunds erforscht, ausgebeutet, erhalten oder bewirtschaftet werden,
b)
andere Tätigkeiten zur wirtschaftlichen Erforschung oder Ausbeutung der ausschließlichen Wirtschaftszone ausgeübt werden, wie beispielsweise die Energieerzeugung aus Wasser, Strömung und Wind oder
c)
künstliche Inseln errichtet oder genutzt werden und Anlagen und Bauwerke für die in den Buchstaben a und b genannten Zwecke errichtet oder genutzt werden, und
2.
am Festlandsockel, soweit dort
a)
dessen natürliche Ressourcen erforscht oder ausgebeutet werden; natürliche Ressourcen in diesem Sinne sind die mineralischen und sonstigen nicht lebenden Ressourcen des Meeresbodens und seines Untergrunds sowie die zu den sesshaften Arten gehörenden Lebewesen, die im nutzbaren Stadium entweder unbeweglich auf oder unter dem Meeresboden verbleiben oder sich nur in ständigem körperlichen Kontakt mit dem Meeresboden oder seinem Untergrund fortbewegen können; oder
b)
künstliche Inseln errichtet oder genutzt werden und Anlagen und Bauwerke für die in Buchstabe a genannten Zwecke errichtet oder genutzt werden.
(2) 1Unbeschränkt einkommensteuerpflichtig sind auch deutsche Staatsangehörige, die
1.
im Inland weder einen Wohnsitz noch ihren gewöhnlichen Aufenthalt haben und
2.
zu einer inländischen juristischen Person des öffentlichen Rechts in einem Dienstverhältnis stehen und dafür Arbeitslohn aus einer inländischen öffentlichen Kasse beziehen,
sowie zu ihrem Haushalt gehörende Angehörige, die die deutsche Staatsangehörigkeit besitzen oder keine Einkünfte oder nur Einkünfte beziehen, die ausschließlich im Inland einkommensteuerpflichtig sind. 2Dies gilt nur für natürliche Personen, die in dem Staat, in dem sie ihren Wohnsitz oder ihren gewöhnlichen Aufenthalt haben, lediglich in einem der beschränkten Einkommensteuerpflicht ähnlichen Umfang zu einer Steuer vom Einkommen herangezogen werden.
(3) 1Auf Antrag werden auch natürliche Personen als unbeschränkt einkommensteuerpflichtig behandelt, die im Inland weder einen Wohnsitz noch ihren gewöhnlichen Aufenthalt haben, soweit sie inländische Einkünfte im Sinne des § 49 haben. 2Dies gilt nur, wenn ihre Einkünfte im Kalenderjahr mindestens zu 90 Prozent der deutschen Einkommensteuer unterliegen oder die nicht der deutschen Einkommensteuer unterliegenden Einkünfte den Grundfreibetrag nach § 32a Absatz 1 Satz 2 Nummer 1 nicht übersteigen; dieser Betrag ist zu kürzen, soweit es nach den Verhältnissen im Wohnsitzstaat des Steuerpflichtigen notwendig und angemessen ist. 3Inländische Einkünfte, die nach einem Abkommen zur Vermeidung der Doppelbesteuerung nur der Höhe nach beschränkt besteuert werden dürfen, gelten hierbei als nicht der deutschen Einkommensteuer unterliegend. 4Unberücksichtigt bleiben bei der Ermittlung der Einkünfte nach Satz 2 nicht der deutschen Einkommensteuer unterliegende Einkünfte, die im Ausland nicht besteuert werden, soweit vergleichbare Einkünfte im Inland steuerfrei sind. 5Weitere Voraussetzung ist, dass die Höhe der nicht der deutschen Einkommensteuer unterliegenden Einkünfte durch eine Bescheinigung der zuständigen ausländischen Steuerbehörde nachgewiesen wird. 6Der Steuerabzug nach § 50a ist ungeachtet der Sätze 1 bis 4 vorzunehmen.
(4) Natürliche Personen, die im Inland weder einen Wohnsitz noch ihren gewöhnlichen Aufenthalt haben, sind vorbehaltlich der Absätze 2 und 3 und des § 1a beschränkt einkommensteuerpflichtig, wenn sie inländische Einkünfte im Sinne des § 49 haben.

`
},
{
  id: "estg-001a-eu-ewr-sonderausgaben-ehegatten",

  title: "§ 1a EStG – EU-/EWR-Sonderregelungen",

  short:
    "Erweitert für bestimmte EU-/EWR-Sachverhalte den Sonderausgabenabzug und die Ehegattenbesteuerung bei grenzüberschreitenden Fällen.",

  category: "Gesetze / Einkommensteuer",

  source:
    "Gesetze im Internet – Einkommensteuergesetz, § 1a EStG",

  keywords:
    "estg|§ 1a estg|§1a|eu|ewr|eu staatsangehörige|sonderausgaben|§ 10 absatz 1a estg|unterhaltsleistungen|versorgungsausgleich|ehegatte im ausland|zusammenveranlagung|§ 26 estg|ausländischer ehepartner|ausländische steuerbehörde|bescheinigung|ausländischer dienstort|grenzüberschreitende besteuerung",

  references: [
    "§ 1a EStG",
    "§ 1 Abs. 1 EStG",
    "§ 1 Abs. 2 EStG",
    "§ 1 Abs. 3 EStG",
    "§ 10 Abs. 1a EStG",
    "§ 26 Abs. 1 Satz 1 EStG",
    "§ 32a Abs. 1 Satz 2 Nr. 1 EStG"
  ],

  taxType: "einkommensteuer",

  law: "EStG",

  paragraph: "§ 1a EStG",

  paragraphNumber: 1,

  type: "gesetz",

  importance: 7,

  testPrompt:
    "Ein in Deutschland unbeschränkt einkommensteuerpflichtiger französischer Staatsangehöriger zahlt begünstigte Leistungen nach § 10 Abs. 1a EStG an einen in Frankreich lebenden Empfänger. Unter welchen Voraussetzungen kommt ein Sonderausgabenabzug in Betracht?",

  expect: {
    steuerart: "einkommensteuer",
    paragraphen: [
      "§ 1a EStG",
      "§ 10 Abs. 1a EStG"
    ],
    mustNotAskFollowup: true
  },

  body: `
⇨ § 1a EStG – EU-/EWR-Sonderregelungen

► Gesetz

§ 1a EStG enthält besondere Regelungen für grenzüberschreitende Sachverhalte innerhalb der Europäischen Union und des Europäischen Wirtschaftsraums.

Die Vorschrift ergänzt insbesondere:

- die unbeschränkte Steuerpflicht nach § 1 EStG,
- den Sonderausgabenabzug nach § 10 Abs. 1a EStG und
- die Ehegattenbesteuerung nach § 26 EStG.

---

⇨ 1. Persönlicher Anwendungsbereich

§ 1a Abs. 1 EStG gilt grundsätzlich für Staatsangehörige

- eines Mitgliedstaates der Europäischen Union oder
- eines Staates des Europäischen Wirtschaftsraums,

die

- nach § 1 Abs. 1 EStG unbeschränkt einkommensteuerpflichtig sind oder
- nach § 1 Abs. 3 EStG als unbeschränkt einkommensteuerpflichtig behandelt werden.

Damit reicht allein ein grenzüberschreitender Sachverhalt nicht aus.

Erforderlich sind zusätzlich:

1. die begünstigte Staatsangehörigkeit und
2. eine unbeschränkte Einkommensteuerpflicht oder Gleichstellung nach § 1 Abs. 3 EStG.

---

⇨ 2. Sonderausgabenabzug bei ausländischem Empfänger

► Grundsatz

Bestimmte Aufwendungen nach § 10 Abs. 1a EStG können auch dann als Sonderausgaben abgezogen werden, wenn der Empfänger nicht in Deutschland unbeschränkt einkommensteuerpflichtig ist.

► Tatbestandsvoraussetzungen

Der Sonderausgabenabzug setzt voraus, dass

1. der Steuerpflichtige in den persönlichen Anwendungsbereich des § 1a EStG fällt,

2. es sich um Aufwendungen im Sinne des § 10 Abs. 1a EStG handelt,

3. der Empfänger seinen Wohnsitz oder gewöhnlichen Aufenthalt in einem anderen EU- oder EWR-Staat hat und

4. die Besteuerung der Leistung beim Empfänger durch eine Bescheinigung der zuständigen ausländischen Steuerbehörde nachgewiesen wird.

► Rechtsfolge

Bei Vorliegen der Voraussetzungen kann die Zahlung trotz ausländischen Empfängers als Sonderausgabe berücksichtigt werden.

► Wichtig

Die ausländische Besteuerung muss nachgewiesen werden.

Eine bloße Erklärung des Empfängers reicht regelmäßig nicht aus.

Erforderlich ist eine Bescheinigung der zuständigen ausländischen Steuerbehörde.

---

⇨ 3. Ehegatte mit Wohnsitz im EU-/EWR-Ausland

► Grundfall

Der nicht dauernd getrennt lebende Ehegatte hat

- keinen Wohnsitz im Inland und
- keinen gewöhnlichen Aufenthalt im Inland.

► Voraussetzung

Der Ehegatte lebt in einem anderen Mitgliedstaat der Europäischen Union oder des Europäischen Wirtschaftsraums.

Zusätzlich muss ein Antrag gestellt werden.

► Rechtsfolge

Der ausländische Ehegatte wird für die Anwendung des § 26 Abs. 1 Satz 1 EStG als unbeschränkt einkommensteuerpflichtig behandelt.

Dadurch kann insbesondere eine Zusammenveranlagung in Betracht kommen.

► Einschränkung

Die Gleichstellung erfolgt nicht allgemein für das gesamte Einkommensteuerrecht.

Sie gilt speziell für die Anwendung der Ehegattenveranlagung nach § 26 Abs. 1 Satz 1 EStG.

---

⇨ 4. Prüfung der Einkunftsgrenzen bei Ehegatten

Wird § 1 Abs. 3 Satz 2 EStG angewendet, sind die Einkünfte beider Ehegatten gemeinsam zu betrachten.

Dabei wird der Grundfreibetrag nach § 32a Abs. 1 Satz 2 Nr. 1 EStG verdoppelt.

► Prüfung

Zu berücksichtigen sind:

- die Einkünfte des in Deutschland steuerpflichtigen Ehegatten,
- die Einkünfte des ausländischen Ehegatten und
- der verdoppelte Grundfreibetrag.

► Merksatz

Bei der Ehegattenprüfung nach § 1a EStG werden nicht nur die Einkünfte eines Ehegatten betrachtet.

Die Einkünfte beider Ehegatten sind einzubeziehen.

---

⇨ 5. Sonderregelung für bestimmte Personen an ausländischen Dienstorten

§ 1a Abs. 2 EStG erweitert die Ehegattenregelung auf besondere Personengruppen.

Erfasst werden insbesondere:

- bestimmte deutsche Staatsangehörige im ausländischen öffentlichen Dienst nach § 1 Abs. 2 EStG und
- bestimmte nach § 1 Abs. 3 EStG unbeschränkt steuerpflichtige Personen, die an einem ausländischen Dienstort tätig sind.

► Besonderheit

Bei diesen Personen wird für die Beurteilung des Wohnsitzes oder gewöhnlichen Aufenthalts des Ehegatten auf den Staat des ausländischen Dienstortes abgestellt.

► Rechtsfolge

Die Regelung des § 1a Abs. 1 Nr. 2 EStG über die Ehegattenbesteuerung gilt entsprechend.

---

⇨ 6. Prüfungsschema

► Schritt 1: Staatsangehörigkeit

Ist die betroffene Person Staatsangehöriger eines EU- oder EWR-Staates?

- Ja: weiterprüfen.
- Nein: § 1a Abs. 1 EStG grundsätzlich nicht anwendbar.

► Schritt 2: Steuerpflicht

Liegt

- unbeschränkte Steuerpflicht nach § 1 Abs. 1 EStG oder
- eine Behandlung als unbeschränkt steuerpflichtig nach § 1 Abs. 3 EStG

vor?

► Schritt 3: Begünstigter Sachverhalt

Geht es um

- Sonderausgaben nach § 10 Abs. 1a EStG oder
- die Ehegattenveranlagung nach § 26 EStG?

► Schritt 4: EU-/EWR-Bezug

Hat der Empfänger beziehungsweise Ehegatte seinen Wohnsitz oder gewöhnlichen Aufenthalt in einem EU- oder EWR-Staat?

► Schritt 5: Nachweise

Bei Leistungen nach § 10 Abs. 1a EStG:

Liegt eine Bescheinigung der zuständigen ausländischen Steuerbehörde über die Besteuerung beim Empfänger vor?

► Schritt 6: Rechtsfolge

- Sonderausgabenabzug zulässig oder
- Ehegatte wird für § 26 Abs. 1 Satz 1 EStG als unbeschränkt steuerpflichtig behandelt.

---

⇨ 7. Praxisbeispiel: Sonderausgaben

Eine französische Staatsangehörige lebt in Deutschland und ist hier unbeschränkt einkommensteuerpflichtig.

Sie zahlt begünstigte Leistungen nach § 10 Abs. 1a EStG an einen in Frankreich lebenden Empfänger.

Der Empfänger ist in Deutschland nicht unbeschränkt einkommensteuerpflichtig.

Die französische Steuerbehörde bescheinigt, dass die Zahlung beim Empfänger besteuert wird.

► Lösung

Die Steuerpflichtige ist Staatsangehörige eines EU-Mitgliedstaates und in Deutschland unbeschränkt einkommensteuerpflichtig.

Der Empfänger lebt ebenfalls in einem EU-Mitgliedstaat.

Die Besteuerung beim Empfänger wird durch eine ausländische Behördenbescheinigung nachgewiesen.

Ergebnis:

Die Aufwendungen können bei Vorliegen der weiteren Voraussetzungen als Sonderausgaben berücksichtigt werden.

---

⇨ 8. Praxisbeispiel: Ausländischer Ehegatte

Ein deutscher Steuerpflichtiger lebt und arbeitet in Deutschland.

Seine Ehefrau lebt in Österreich.

Die Ehegatten leben nicht dauernd getrennt.

Die Ehefrau hat keinen Wohnsitz und keinen gewöhnlichen Aufenthalt in Deutschland.

► Lösung

Österreich ist Mitgliedstaat der Europäischen Union.

Auf Antrag kann die Ehefrau für die Anwendung des § 26 Abs. 1 Satz 1 EStG als unbeschränkt einkommensteuerpflichtig behandelt werden.

Die weiteren Voraussetzungen der Ehegattenveranlagung müssen zusätzlich erfüllt sein.

---

⇨ 9. Ausnahmen und Abgrenzungen

► Keine automatische Gleichstellung

Ein ausländischer Empfänger oder Ehegatte wird nicht automatisch unbeschränkt einkommensteuerpflichtig.

Die Rechtsfolge hängt von den jeweiligen Voraussetzungen und gegebenenfalls von einem Antrag ab.

► Kein weltweiter Anwendungsbereich

§ 1a EStG ist grundsätzlich auf EU-/EWR-Sachverhalte beschränkt.

Drittstaatenfälle sind nicht ohne Weiteres erfasst.

► Nachweispflicht beachten

Bei Leistungen an ausländische Empfänger ist die Bescheinigung der zuständigen ausländischen Steuerbehörde eine zentrale Voraussetzung.

► Weggefallene Nummern

§ 1a Abs. 1 Nr. 1a und Nr. 1b EStG sind weggefallen und haben keinen eigenständigen Regelungsinhalt mehr.

---

⇨ 10. Typische Klausurfallen

► Fehler 1: Nur auf den Wohnsitz abstellen

Falsch:

Ein Wohnsitz in der EU oder im EWR reicht allein nicht aus.

Richtig:

Auch die Staatsangehörigkeit sowie die unbeschränkte Steuerpflicht oder Gleichstellung nach § 1 Abs. 3 EStG müssen geprüft werden.

---

► Fehler 2: Sonderausgaben ohne Nachweis anerkennen

Falsch:

Die ausländische Besteuerung wird lediglich behauptet.

Richtig:

Die Besteuerung beim Empfänger muss grundsätzlich durch eine Bescheinigung der zuständigen ausländischen Steuerbehörde nachgewiesen werden.

---

► Fehler 3: Ehegatten automatisch zusammen veranlagen

Falsch:

Der ausländische Ehegatte wird ohne Antrag berücksichtigt.

Richtig:

Die Behandlung als unbeschränkt einkommensteuerpflichtig für § 26 Abs. 1 Satz 1 EStG erfolgt auf Antrag.

---

► Fehler 4: Nur die Einkünfte eines Ehegatten prüfen

Falsch:

Bei der Prüfung nach § 1 Abs. 3 EStG werden ausschließlich die Einkünfte des inländischen Ehegatten verwendet.

Richtig:

Im Anwendungsbereich des § 1a Abs. 1 Nr. 2 EStG sind die Einkünfte beider Ehegatten zu berücksichtigen; der Grundfreibetrag wird verdoppelt.

---

⇨ 11. Merksätze

- § 1a EStG ist eine EU-/EWR-Sonderregelung.

- Die Vorschrift verbindet § 1 EStG mit § 10 Abs. 1a und § 26 EStG.

- Auslandszahlungen können bei nachgewiesener Besteuerung beim Empfänger als Sonderausgaben abzugsfähig sein.

- Ein im EU-/EWR-Ausland lebender Ehegatte kann auf Antrag für die Ehegattenveranlagung gleichgestellt werden.

- Bei der Einkunftsprüfung sind grundsätzlich die Einkünfte beider Ehegatten einzubeziehen.

- Der Grundfreibetrag wird bei der gemeinsamen Prüfung verdoppelt.

- Ohne Behördenbescheinigung kann der Sonderausgabenabzug gefährdet sein.
`
},
{
  id: "ust-reverse-charge-steuersatz-bmg-vorsteuerabzug",

  title:
    "Reverse Charge, Steuersatz, Bemessungsgrundlage und Vorsteuerabzug",

  short:
    "Umsatzsteuerliche Prüfung von § 13b UStG, Steuersätzen, Bemessungsgrundlage, Unternehmenszuordnung, Vorsteuerabzug, Ausschlussumsätzen und Vorsteueraufteilung.",

  category: "Umsatzsteuer",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Umsatzsteuer, Rechtsstand Juli 2026",

  keywords:
    "§ 13b ustg|reverse charge|steuerschuldnerschaft leistungsempfänger|ausländischer unternehmer|bauleistung|gebäudereinigung|grundstücksumsatz|sicherungsübereignung|schrott|gold|mobilfunkgeräte|tablet computer|spielekonsole|metalle|telekommunikation|steuersatz|19 prozent|7 prozent|restaurant|verpflegungsdienstleistung|speisen|getränke|anlage 2 ustg|personenbeförderung|beherbergung|bemessungsgrundlage|§ 10 ustg|entgelt|brutto netto|durchlaufender posten|entgelt von dritter seite|tausch|tauschähnlicher umsatz|baraufgabe|vorsteuerabzug|§ 15 ustg|unternehmereigenschaft|gesetzlich geschuldete steuer|leistungsbezug für das unternehmen|ordnungsgemäße rechnung|zuordnung unternehmensvermögen|10 prozent grenze|gemischte nutzung|ausschlussumsätze|rückausschluss|vorsteueraufteilung|umsatzschlüssel|flächenschlüssel|einfuhrumsatzsteuer|innergemeinschaftlicher erwerb",

  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 2 UStG",
    "§ 3 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 3g UStG",
    "§ 4 UStG",
    "§ 9 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13b UStG",
    "§ 14 UStG",
    "§ 14a UStG",
    "§ 14c UStG",
    "§ 15 Abs. 1 UStG",
    "§ 15 Abs. 1a UStG",
    "§ 15 Abs. 1b UStG",
    "§ 15 Abs. 2 UStG",
    "§ 15 Abs. 3 UStG",
    "§ 15 Abs. 4 UStG",
    "§ 15a UStG",
    "§ 16 Abs. 6 UStG",
    "§ 17 UStG",
    "§ 18 Abs. 4a UStG",
    "§ 19 UStG",
    "Anlage 2 UStG",
    "Anlage 3 UStG",
    "Anlage 4 UStG",
    "Abschn. 10.1 UStAE",
    "Abschn. 12 UStAE",
    "Abschn. 13b.1 bis 13b.15 UStAE",
    "Abschn. 15.2 UStAE",
    "Abschn. 15.12 UStAE",
    "Abschn. 15.15 UStAE",
    "Abschn. 15.16 UStAE",
    "Abschn. 15.17 UStAE",
    "Abschn. 15.23 UStAE"
  ],

  body: `
⇨ Reverse Charge, Steuersatz, Bemessungsgrundlage und Vorsteuerabzug

⇨ Teil A: Steuerschuldnerschaft des Leistungsempfängers nach § 13b UStG

► 1. Grundprinzip

Grundsätzlich schuldet der leistende Unternehmer die Umsatzsteuer.

§ 13b UStG durchbricht diesen Grundsatz bei bestimmten steuerpflichtigen Umsätzen.

In diesen Fällen schuldet nicht der leistende Unternehmer, sondern der Leistungsempfänger die Umsatzsteuer.

Dieses Verfahren wird bezeichnet als:

- Reverse Charge,
- Umkehr der Steuerschuldnerschaft,
- Steuerschuldnerschaft des Leistungsempfängers.

► Rechtsfolgen

Der leistende Unternehmer

- stellt grundsätzlich eine Nettorechnung aus,
- weist keine Umsatzsteuer gesondert aus,
- nimmt den Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ auf.

Der Leistungsempfänger

- berechnet die Umsatzsteuer selbst,
- meldet sie in seiner Umsatzsteuer-Voranmeldung an,
- kann sie bei Vorliegen der Voraussetzungen gleichzeitig als Vorsteuer abziehen.

► Merksatz

§ 13b UStG führt nicht zu einer Steuerbefreiung.

Es handelt sich weiterhin um einen steuerpflichtigen Umsatz.

Lediglich die Person des Steuerschuldners ändert sich.

---

⇨ 2. Grundprüfung des § 13b UStG

Vor Anwendung des Reverse-Charge-Verfahrens ist zu prüfen:

1. Liegt eine Lieferung oder sonstige Leistung vor?
2. Ist der Umsatz im Inland steuerbar?
3. Ist der Umsatz steuerpflichtig?
4. Ist der Umsatz in § 13b Abs. 1 oder Abs. 2 UStG genannt?
5. Erfüllt der Leistungsempfänger die Voraussetzungen des § 13b Abs. 5 UStG?
6. Liegt eine gesetzliche Ausnahme vor?
7. Wann entsteht die Steuer?
8. Besteht beim Leistungsempfänger ein Vorsteuerabzug?

► Wichtig

§ 13b UStG greift grundsätzlich nur bei im Inland steuerpflichtigen Umsätzen.

Ist der Umsatz

- nicht im Inland steuerbar oder
- im Inland steuerfrei,

entsteht keine deutsche Umsatzsteuer nach § 13b UStG.

---

⇨ 3. Sonstige Leistungen aus dem übrigen Gemeinschaftsgebiet

Nach § 13b Abs. 1 UStG schuldet der Leistungsempfänger die Steuer für eine sonstige Leistung, wenn

1. der leistende Unternehmer im übrigen Gemeinschaftsgebiet ansässig ist,
2. der Leistungsort nach § 3a Abs. 2 UStG im Inland liegt und
3. die Leistung im Inland steuerpflichtig ist.

► Typische Fälle

- Beratungsleistungen,
- Werbeleistungen,
- Programmierleistungen,
- Softwaredienstleistungen,
- Lizenzleistungen,
- Übersetzungsleistungen,
- Rechts- und Steuerberatung,
- digitale B2B-Dienstleistungen.

► Beispiel

Ein französischer Unternehmer erbringt eine Beratungsleistung an einen deutschen Unternehmer.

Der deutsche Unternehmer bezieht die Leistung für sein Unternehmen.

Der Leistungsort liegt nach § 3a Abs. 2 UStG in Deutschland.

Die Leistung ist in Deutschland steuerpflichtig.

Der deutsche Leistungsempfänger schuldet die Umsatzsteuer nach § 13b Abs. 1 und Abs. 5 UStG.

---

⇨ 4. Entstehung der Steuer nach § 13b Abs. 1 UStG

Bei Leistungen nach § 13b Abs. 1 UStG entsteht die Steuer mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt wurde.

Auf den Zeitpunkt der Rechnungsausstellung kommt es grundsätzlich nicht an.

► Beispiel

Die Beratungsleistung wird am 15. März ausgeführt.

Die Rechnung wird erst am 10. April ausgestellt.

Die Umsatzsteuer entsteht mit Ablauf des Voranmeldungszeitraums März.

► Merksatz

§ 13b Abs. 1 UStG:

**Leistungsausführung bestimmt den Voranmeldungszeitraum.**

---

⇨ 5. Umsätze nach § 13b Abs. 2 Nr. 1 UStG

§ 13b Abs. 2 Nr. 1 UStG erfasst insbesondere

- Werklieferungen und
- sonstige Leistungen,

die von einem im Ausland ansässigen Unternehmer im Inland ausgeführt werden und nicht bereits unter § 13b Abs. 1 UStG fallen.

Nicht erfasst wird grundsätzlich eine reine Lieferung eines Gegenstands, soweit kein anderer Tatbestand des § 13b UStG eingreift.

► Typische Fälle

- Montage einer Anlage durch einen ausländischen Unternehmer,
- Errichtung eines Messestands,
- Reparaturarbeiten an einem inländischen Grundstück,
- Werkleistung an einem im Inland befindlichen Gegenstand,
- Grundstücksleistung eines ausländischen Unternehmers.

---

⇨ 6. Im Ausland ansässiger Unternehmer

Ein Unternehmer ist grundsätzlich im Ausland ansässig, wenn er im Inland weder

- seinen Sitz,
- seine Geschäftsleitung,
- eine an der Leistung beteiligte Betriebsstätte,
- seinen Wohnsitz noch
- seinen gewöhnlichen Aufenthalt

hat.

Eine inländische Betriebsstätte verhindert die Anwendung des § 13b UStG nur, wenn diese Betriebsstätte an der konkreten Leistung beteiligt ist.

► Besonderheit Grundstücksvermietung

Besitzt ein ausländischer Unternehmer lediglich ein im Inland gelegenes Grundstück und vermietet dieses steuerpflichtig, wird er allein durch den Grundstücksbesitz grundsätzlich nicht zu einem im Inland ansässigen Unternehmer.

---

⇨ 7. Sicherungsübereignete Gegenstände

§ 13b Abs. 2 Nr. 2 UStG erfasst die Lieferung eines sicherungsübereigneten Gegenstands

- durch den Sicherungsgeber
- an den Sicherungsnehmer
- außerhalb eines Insolvenzverfahrens.

► Wichtig

Die bloße Sicherungsübereignung ist regelmäßig noch keine Lieferung.

Die Lieferung kann insbesondere bei der Verwertung des Sicherungsguts entstehen.

Wird das Sicherungsgut durch den Sicherungsnehmer an einen Dritten weiterverkauft, kann ein Doppelumsatz vorliegen:

1. Lieferung des Sicherungsgebers an den Sicherungsnehmer,
2. Lieferung des Sicherungsnehmers an den Dritten.

Für die erste Lieferung kann § 13b Abs. 2 Nr. 2 UStG gelten.

---

⇨ 8. Grundstücksumsätze

§ 13b Abs. 2 Nr. 3 UStG erfasst steuerpflichtige Umsätze, die unter das Grunderwerbsteuergesetz fallen.

Grundstücksveräußerungen sind grundsätzlich nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Erst wenn wirksam nach § 9 Abs. 1 und Abs. 3 UStG zur Steuerpflicht optiert wurde, kann § 13b Abs. 2 Nr. 3 UStG eingreifen.

► Rechtsfolge

Bei wirksamer Option schuldet grundsätzlich der Erwerber die Umsatzsteuer.

Der Verkäufer stellt regelmäßig eine Nettorechnung aus.

► Merksatz

Grundstücksverkauf:

**§ 4 Nr. 9 Buchst. a → § 9 prüfen → bei Option § 13b prüfen.**

---

⇨ 9. Bauleistungen

§ 13b Abs. 2 Nr. 4 UStG erfasst Bauleistungen.

Bauleistungen sind insbesondere Werklieferungen und sonstige Leistungen, die sich unmittelbar auf die Substanz eines Bauwerks auswirken.

Hierzu gehören insbesondere Leistungen zur

- Herstellung,
- Instandsetzung,
- Instandhaltung,
- Änderung oder
- Beseitigung

eines Bauwerks.

► Regelmäßig keine Bauleistungen

Nicht erfasst werden insbesondere reine

- Planungsleistungen,
- Architektenleistungen,
- Statikerleistungen,
- Bauüberwachungsleistungen,
- Gutachterleistungen.

► Leistungsempfänger

Der Leistungsempfänger schuldet die Steuer nur, wenn er selbst nachhaltig Bauleistungen erbringt.

Als Nachweis dient regelmäßig eine gültige Bescheinigung des Finanzamts nach dem Vordruck USt 1 TG.

► Wichtig

Die konkrete empfangene Bauleistung muss nicht zwingend für einen eigenen Bauauftrag weiterverwendet werden.

Entscheidend ist grundsätzlich die nachhaltige Tätigkeit des Leistungsempfängers als Bauleistender.

---

⇨ 10. Gebäudereinigungsleistungen

§ 13b Abs. 2 Nr. 8 UStG erfasst die Reinigung von Gebäuden und Gebäudeteilen.

Hierzu können gehören:

- Fassadenreinigung,
- Fensterreinigung,
- Reinigung von Büroräumen,
- Reinigung von Treppenhäusern,
- Gebäudereinigung einschließlich des zugehörigen Inventars.

Der Leistungsempfänger schuldet die Steuer nur, wenn er selbst nachhaltig Gebäudereinigungsleistungen erbringt.

Als Nachweis kann ebenfalls eine entsprechende Bescheinigung des Finanzamts verwendet werden.

---

⇨ 11. Weitere Umsätze nach § 13b Abs. 2 UStG

§ 13b Abs. 2 UStG erfasst außerdem insbesondere:

► Nr. 5

Bestimmte Lieferungen von

- Gas,
- Elektrizität,
- Wärme oder
- Kälte.

Die genauen Voraussetzungen hängen insbesondere von der Ansässigkeit und der Wiederverkäufereigenschaft der Beteiligten ab.

► Nr. 6

Übertragung bestimmter Emissionsberechtigungen und Emissionszertifikate.

► Nr. 7

Lieferungen der in Anlage 3 UStG bezeichneten Gegenstände.

Hierzu gehören insbesondere bestimmte

- Abfälle,
- Schrotte,
- Metallabfälle,
- Kunststoffabfälle,
- Glasabfälle.

► Nr. 8

Gebäudereinigungsleistungen an einen nachhaltig tätigen Gebäudereiniger.

► Nr. 9

Bestimmte Lieferungen von Gold.

► Nr. 10

Lieferungen von

- Mobilfunkgeräten,
- Tablet-Computern,
- Spielekonsolen,
- bestimmten integrierten Schaltkreisen,

wenn die gesetzliche Entgeltgrenze von mindestens 5.000 Euro innerhalb eines wirtschaftlichen Vorgangs erreicht wird.

Nachträgliche Entgeltminderungen bleiben für die Prüfung der Grenze grundsätzlich unberücksichtigt.

► Nr. 11

Lieferungen der in Anlage 4 UStG bezeichneten Metalle, wenn die gesetzliche Entgeltgrenze von mindestens 5.000 Euro erreicht wird.

► Nr. 12

Bestimmte Telekommunikationsleistungen, insbesondere wenn der Leistungsempfänger als Wiederverkäufer der Telekommunikationsleistungen anzusehen ist.

---

⇨ 12. Entstehung der Steuer bei § 13b Abs. 2 UStG

In den Fällen des § 13b Abs. 2 UStG entsteht die Steuer grundsätzlich

1. mit Ausstellung der Rechnung,
2. spätestens jedoch mit Ablauf des Kalendermonats, der auf die Ausführung der Leistung folgt.

► Beispiel

Eine Bauleistung wird am 18. März ausgeführt.

⇶  Rechnung am 25. März

Die Steuer entsteht im März.

⇶  Rechnung am 15. April

Die Steuer entsteht im April.

⇶  Rechnung erst im Juni

Die Steuer entsteht spätestens mit Ablauf des Monats April.

► Merksatz

§ 13b Abs. 2 UStG:

**Rechnung, spätestens Folgemonat.**

---

⇨ 13. Teilleistungen und Anzahlungen

Teilleistungen sind auch im Rahmen des § 13b UStG möglich.

Eine Teilleistung setzt grundsätzlich voraus:

- wirtschaftliche Teilbarkeit der Gesamtleistung,
- gesonderte Vereinbarung,
- gesonderte Abrechnung,
- gesonderte Ausführung.

Bei Anzahlungen kann die Steuer bereits bei Vereinnahmung beziehungsweise Zahlung des Entgelts entstehen.

Eine bloße Vorausrechnung ohne Zahlung löst grundsätzlich noch keine Anzahlungsbesteuerung aus.

---

⇨ 14. Rechnung bei Reverse Charge

Die Rechnung muss grundsätzlich die allgemeinen Pflichtangaben der §§ 14 und 14a UStG enthalten.

Anstelle eines gesonderten Umsatzsteuerausweises ist der Hinweis aufzunehmen:

**Steuerschuldnerschaft des Leistungsempfängers**

Alternativ kann im internationalen Geschäftsverkehr beispielsweise angegeben werden:

**Reverse Charge**

► Wichtig

Der Hinweis ist eine Rechnungspflicht.

Das Fehlen des Hinweises verhindert die gesetzlich eintretende Steuerschuldnerschaft des Leistungsempfängers jedoch grundsätzlich nicht.

---

⇨ 15. Unrichtiger Umsatzsteuerausweis

Weist der leistende Unternehmer trotz Anwendung des § 13b UStG Umsatzsteuer gesondert aus, kann er diese nach § 14c UStG schulden.

Der Leistungsempfänger schuldet gleichzeitig weiterhin die Steuer nach § 13b UStG.

Die offen ausgewiesene Steuer ist beim Leistungsempfänger grundsätzlich keine gesetzlich geschuldete Steuer und daher nicht als Vorsteuer abziehbar.

► Erforderliche Korrektur

- Rechnung durch den Aussteller berichtigen,
- zu Unrecht berechnete Umsatzsteuer zurückzahlen,
- § 13b-Umsatz zutreffend erklären.

---

⇨ 16. Kleinunternehmer und § 13b UStG

Auch ein Kleinunternehmer kann als Leistungsempfänger Steuerschuldner nach § 13b UStG werden.

Die Kleinunternehmerregelung schützt nicht vor der Steuerschuld aus empfangenen Reverse-Charge-Leistungen.

Der Kleinunternehmer muss die Umsatzsteuer anmelden und abführen.

Mangels allgemeiner Vorsteuerabzugsberechtigung kann er die Steuer regelmäßig nicht gleichzeitig als Vorsteuer abziehen.

► Leistender Kleinunternehmer

Wird die Leistung vom leistenden Unternehmer wirksam nach der Kleinunternehmerregelung steuerfrei ausgeführt, kommt grundsätzlich keine Steuerschuldumkehr nach § 13b UStG in Betracht.

---

⇨ 17. Bezug für den nichtunternehmerischen Bereich

Die Steuerschuldnerschaft kann unter den gesetzlichen Voraussetzungen auch eintreten, wenn der Unternehmer die Leistung für seinen nichtunternehmerischen oder privaten Bereich bezieht.

► Beispiel

Ein deutscher Einzelunternehmer lässt sein privates Einfamilienhaus durch einen ausländischen Unternehmer renovieren.

Die Bauleistung ist in Deutschland steuerpflichtig.

Der deutsche Unternehmer kann nach § 13b UStG Steuerschuldner werden, obwohl die Leistung sein privates Gebäude betrifft.

Ein Vorsteuerabzug besteht wegen der privaten Verwendung jedoch nicht.

► Besonderheit

Für bestimmte Leistungen und für Leistungen an juristische Personen des öffentlichen Rechts bestehen gesetzliche Sonderregelungen und Ausnahmen.

---

⇨ 18. Vorsteuerabzug aus Reverse-Charge-Umsätzen

Der Leistungsempfänger kann die von ihm nach § 13b UStG geschuldete Steuer nach § 15 Abs. 1 Satz 1 Nr. 4 UStG als Vorsteuer abziehen, wenn

- die Leistung für sein Unternehmen ausgeführt wurde,
- kein Ausschluss nach § 15 Abs. 2 UStG vorliegt,
- kein sonstiges Abzugsverbot eingreift.

Eine Rechnung mit gesondertem Umsatzsteuerausweis ist für diesen Vorsteuerabzug nicht erforderlich.

► Wichtig

Steuerschuld und Vorsteuerabzug sind getrennt zu prüfen.

Ein Unternehmer kann daher

- die Steuer nach § 13b UStG schulden,
- aber nicht zum Vorsteuerabzug berechtigt sein.

---

⇨ 19. Beispiel: Arzt bezieht Beratungsleistung

Ein in Deutschland tätiger Arzt bezieht eine Beratungsleistung von einem französischen Unternehmer.

Der Arzt ist Unternehmer und der Leistungsort liegt nach § 3a Abs. 2 UStG in Deutschland.

Der Arzt schuldet die Umsatzsteuer nach § 13b Abs. 1 und Abs. 5 UStG.

Verwendet er die Beratungsleistung ausschließlich für steuerfreie Heilbehandlungen, ist die Steuer nach § 15 Abs. 2 UStG grundsätzlich nicht als Vorsteuer abziehbar.

---

⇨ Teil B: Steuersätze nach § 12 UStG

⇨ 20. Prüfungsreihenfolge

► Schritt 1

Prüfen, ob ein ermäßigter Steuersatz nach § 12 Abs. 2 oder einer Sondervorschrift anzuwenden ist.

► Schritt 2

Ist keine Ermäßigung einschlägig, gilt der Regelsteuersatz nach § 12 Abs. 1 UStG.

► Merksatz

**Zuerst 7 Prozent prüfen, sonst 19 Prozent.**

---

⇨ 21. Regelsteuersatz

Der Regelsteuersatz beträgt 19 Prozent der Bemessungsgrundlage.

Er gilt für alle steuerpflichtigen Umsätze, für die keine besondere Steuerermäßigung vorgesehen ist.

Typische Beispiele:

- Beratungsleistungen,
- Rechtsanwaltsleistungen,
- Steuerberatungsleistungen,
- Vermietung von Betriebsvorrichtungen,
- Getränke in der Gastronomie,
- Lieferung von technischen Geräten,
- Dienstleistungen ohne besondere Begünstigung.

---

⇨ 22. Ermäßigter Steuersatz

Der ermäßigte Steuersatz beträgt grundsätzlich 7 Prozent.

Er gilt nur für die ausdrücklich im Gesetz genannten Umsätze.

Die Begünstigungen sind grundsätzlich eng auszulegen.

---

⇨ 23. Gegenstände der Anlage 2 UStG

§ 12 Abs. 2 Nr. 1 UStG erfasst insbesondere Lieferungen der in Anlage 2 UStG genannten Gegenstände.

Typische Beispiele sind:

- bestimmte lebende Tiere,
- landwirtschaftliche Nutztiere,
- Blindenhunde,
- Milch,
- bestimmte Milcherzeugnisse,
- Pflanzen und Blumen,
- bestimmte Lebensmittel,
- Kaffee und Tee in der gesetzlich bezeichneten Form,
- Gewürze,
- Leitungswasser,
- Brennholz,
- Bücher und bestimmte Druckerzeugnisse.

► Achtung

Nicht automatisch begünstigt sind beispielsweise:

- abgefülltes Wasser,
- Limonade,
- Cola,
- alkoholische Getränke,
- zubereitete Getränke,
- trinkfertiger Kaffee oder Tee.

Maßgeblich ist die genaue Warenbezeichnung in Anlage 2 UStG.

---

⇨ 24. Vermietung begünstigter Gegenstände

Die Vermietung bestimmter in Anlage 2 UStG genannter Gegenstände kann ebenfalls dem ermäßigten Steuersatz unterliegen.

Es ist jedoch immer zu prüfen, ob die konkrete Vermietung ausdrücklich von § 12 Abs. 2 UStG erfasst wird.

---

⇨ 25. Personenbeförderung

Für bestimmte Personenbeförderungsleistungen gilt der ermäßigte Steuersatz.

► Schienenbahnverkehr

Die Personenbeförderung im Schienenbahnverkehr kann unabhängig von der Länge der Beförderungsstrecke dem ermäßigten Steuersatz unterliegen.

► Andere Beförderungsmittel

Bei Beförderungen insbesondere durch

- Kraftfahrzeuge,
- Taxen,
- Schiffe,
- Drahtseilbahnen

gilt der ermäßigte Steuersatz grundsätzlich, wenn

- die Beförderung innerhalb einer Gemeinde erfolgt oder
- die Beförderungsstrecke nicht mehr als 50 Kilometer beträgt.

Hin- und Rückfahrt sind grundsätzlich jeweils gesondert zu beurteilen.

---

⇨ 26. Kurzfristige Beherbergung

Die kurzfristige Vermietung von Wohn- und Schlafräumen zur Beherbergung von Fremden unterliegt grundsätzlich dem ermäßigten Steuersatz.

Dies betrifft insbesondere:

- Hotels,
- Pensionen,
- Ferienwohnungen,
- kurzfristige Zimmervermietungen.

Auch die kurzfristige Vermietung von Campingflächen kann begünstigt sein.

► Wichtig

Zusatzleistungen sind gesondert zu beurteilen.

Nicht jede Nebenleistung des Hotels unterliegt automatisch dem ermäßigten Steuersatz.

---

⇨ 27. Restaurant- und Verpflegungsdienstleistungen ab 2026

Seit dem 1. Januar 2026 unterliegen Restaurant- und Verpflegungsdienstleistungen hinsichtlich der Abgabe von Speisen grundsätzlich dem ermäßigten Steuersatz von 7 Prozent.

Dies betrifft insbesondere:

- Restaurants,
- Cafés,
- Cateringunternehmen,
- Bäckereien mit Verzehrangebot,
- Metzgereien mit Imbissangebot,
- Kita- und Schulverpflegung,
- Krankenhausverpflegung.

► Getränke

Die Abgabe von Getränken bleibt grundsätzlich vom ermäßigten Steuersatz ausgenommen und unterliegt regelmäßig 19 Prozent.

► Kombiangebote

Enthält ein Gesamtpreis sowohl

- begünstigte Speisen als auch
- regelbesteuerte Getränke,

ist das Entgelt aufzuteilen.

Für bestimmte Pauschal- und Kombiangebote lässt die Finanzverwaltung Vereinfachungsregelungen zur Aufteilung zu.

---

⇨ 28. Beispiel Steuersatz

Ein Restaurant berechnet:

- Speisen: 50 Euro,
- Getränke: 20 Euro.

Seit dem 1. Januar 2026 gelten grundsätzlich:

- Speisen: 7 Prozent,
- Getränke: 19 Prozent.

Die Umsätze müssen nach Steuersätzen getrennt aufgezeichnet und abgerechnet werden.

---

⇨ Teil C: Bemessungsgrundlage nach § 10 UStG

⇨ 29. Grundsatz

Die Umsatzsteuer wird bei Lieferungen und sonstigen Leistungen grundsätzlich nach dem Entgelt bemessen.

Entgelt ist alles, was den Wert der Gegenleistung bildet, die der leistende Unternehmer erhält oder erhalten soll.

Die gesetzlich geschuldete Umsatzsteuer selbst gehört nicht zum Entgelt.

► Formel

Bruttogegenleistung  
./. enthaltene Umsatzsteuer  
= Entgelt beziehungsweise Bemessungsgrundlage

---

⇨ 30. Berechnung aus einem Bruttopreis

► Steuersatz 19 Prozent

Bruttobetrag / 1,19 = Bemessungsgrundlage.

Bruttobetrag - Bemessungsgrundlage = Umsatzsteuer.

► Steuersatz 7 Prozent

Bruttobetrag / 1,07 = Bemessungsgrundlage.

Bruttobetrag - Bemessungsgrundlage = Umsatzsteuer.

► Steuerfreier oder nicht steuerbarer Umsatz

Es wird keine Umsatzsteuer herausgerechnet.

Der Divisor beträgt rechnerisch 1.

---

⇨ 31. Beispiel

Vereinbarter Bruttopreis:

23.800 Euro.

Steuersatz:

19 Prozent.

Berechnung:

23.800 Euro / 1,19 = 20.000 Euro Bemessungsgrundlage.

20.000 Euro × 19 Prozent = 3.800 Euro Umsatzsteuer.

---

⇨ 32. Bedeutung der Rechnung

Für die Ermittlung der gesetzlich richtigen Bemessungsgrundlage ist die Bezeichnung in der Rechnung nicht allein entscheidend.

Auch wenn die Rechnung Umsatzsteuer nicht oder falsch ausweist, ist zu ermitteln:

- welcher Preis tatsächlich vereinbart wurde,
- ob der Preis als Brutto- oder Nettobetrag vereinbart wurde,
- welcher Steuersatz gesetzlich anzuwenden ist.

---

⇨ 33. Bestandteile des Entgelts

Zum Entgelt gehören grundsätzlich:

- Kaufpreis,
- Miete,
- Honorar,
- Werklohn,
- Bearbeitungsgebühren,
- Buchungsgebühren,
- Aufrechnungsbeträge,
- übernommene Verbindlichkeiten,
- Vergütungen für Nebenleistungen,
- Verpackungskosten,
- Transportkosten,
- Versicherungskosten,
- vom Leistungsempfänger erstattete eigene Auslagen,
- Entgelt von dritter Seite,
- freiwillige Zahlungen an den Unternehmer mit Leistungsbezug.

---

⇨ 34. Nebenleistungen

Vergütungen für unselbständige Nebenleistungen teilen grundsätzlich das umsatzsteuerliche Schicksal der Hauptleistung.

Typische Nebenleistungen:

- Transport,
- Verpackung,
- Versicherung,
- Versand,
- Montage,
- übliche Nebenkosten.

Die Vergütung für die Nebenleistung gehört grundsätzlich zur Bemessungsgrundlage der Hauptleistung.

---

⇨ 35. Auslagenersatz

Auslagen, die der Unternehmer im eigenen Namen tätigt und seinem Kunden weiterberechnet, gehören grundsätzlich zum Entgelt.

Dies gilt beispielsweise für:

- Porto,
- Telefonkosten,
- Schreibauslagen,
- Kopierkosten,
- Fahrtkosten,
- Reisekosten,
- Heizkostenumlagen,
- Müllabfuhr.

Eine bloße Bezeichnung als „Auslagenersatz“ ändert daran nichts.

---

⇨ 36. Durchlaufende Posten

Nicht zum Entgelt gehören durchlaufende Posten.

Ein durchlaufender Posten liegt vor, wenn der Unternehmer einen Betrag

- im Namen und
- für Rechnung

eines anderen vereinnahmt oder verausgabt.

Typische Fälle können sein:

- bestimmte Gerichtsgebühren,
- bestimmte behördliche Gebühren,
- Zulassungsgebühren,
- Grundbuchkosten,
- Gebühren, bei denen der Kunde selbst unmittelbarer Schuldner ist.

► Merksatz

Eigener Name oder eigene Schuld:

**Entgelt.**

Fremder Name und fremde Rechnung:

**möglicher durchlaufender Posten.**

---

⇨ 37. Trinkgeld

► Trinkgeld an den Unternehmer

Ein freiwilliges Trinkgeld an den Unternehmer kann zum Entgelt gehören, wenn es im unmittelbaren Zusammenhang mit der Leistung steht.

► Trinkgeld an einen Arbeitnehmer

Ein freiwilliges Trinkgeld, das unmittelbar dem Arbeitnehmer gewährt wird, gehört grundsätzlich nicht zum Entgelt des Unternehmers.

---

⇨ 38. Entgelt von dritter Seite

Die Gegenleistung muss nicht zwingend vom Leistungsempfänger selbst gezahlt werden.

Auch die Zahlung eines Dritten kann Entgelt sein, wenn

- sie für die konkrete Leistung gezahlt wird und
- sie der Förderung oder Vergütung des Leistungsempfängers dient.

► Beispiel

Unternehmer A liefert eine Maschine an B.

B zahlt 2.000 Euro.

Ein Fördergeber zahlt zusätzlich 1.000 Euro unmittelbar an A, um den Erwerb der Maschine durch B zu fördern.

Die Bemessungsgrundlage kann insgesamt 3.000 Euro betragen.

---

⇨ 39. Zahlungen ohne Entgeltcharakter

Nicht zur Bemessungsgrundlage gehören insbesondere:

- echte Preisnachlässe,
- Skonti,
- Rabatte,
- nachträgliche Entgeltminderungen,
- echte Schadensersatzleistungen,
- durchlaufende Posten,
- freiwillige Trinkgelder an Arbeitnehmer.

► Achtung Schadensersatz

Nur echter Schadensersatz ist kein Entgelt.

Besteht zwischen Zahlung und Leistung ein unmittelbarer Zusammenhang, kann sogenannter unechter Schadensersatz und damit Entgelt vorliegen.

---

⇨ 40. Tausch

Beim Tausch besteht die Gegenleistung nicht in Geld, sondern in einer Lieferung.

Jeder Beteiligte erbringt einen eigenen Umsatz.

Der Wert des jeweils anderen Umsatzes bildet grundsätzlich das Entgelt für den eigenen Umsatz.

Die Umsatzsteuer gehört nicht zum Entgelt.

► Prüfung

Für beide Leistungen getrennt prüfen:

1. Art der Leistung,
2. Ort,
3. Zeitpunkt,
4. Steuerbarkeit,
5. Steuerbefreiung,
6. Steuersatz,
7. Bemessungsgrundlage,
8. Steuerschuldner.

---

⇨ 41. Tauschähnlicher Umsatz

Ein tauschähnlicher Umsatz liegt vor, wenn mindestens eine der ausgetauschten Leistungen eine sonstige Leistung ist.

Beispiele:

- Architektenleistung gegen Lieferung von Brennholz,
- Reparaturleistung gegen Überlassung eines Gegenstands,
- Beratungsleistung gegen Werbeleistung.

Auch hier ist jeder Umsatz gesondert zu beurteilen.

---

⇨ 42. Tausch mit Baraufgabe

Erfolgt zusätzlich zu einer Sach- oder Dienstleistung eine Geldzahlung, liegt ein Tausch beziehungsweise tauschähnlicher Umsatz mit Baraufgabe vor.

► Beteiligter, der die Baraufgabe erhält

Wert des anderen Umsatzes  
+ erhaltene Baraufgabe  
= Bruttogegenleistung  
./. Umsatzsteuer  
= Bemessungsgrundlage

► Beteiligter, der die Baraufgabe zahlt

Wert des anderen Umsatzes  
./. geleistete Baraufgabe  
= Bruttogegenleistung  
./. Umsatzsteuer  
= Bemessungsgrundlage

---

⇨ Teil D: Bezug für das Unternehmen und Zuordnung

⇨ 43. Leistungsbezug für das Unternehmen

Eine Leistung wird für das Unternehmen bezogen, wenn sie dazu bestimmt ist, der wirtschaftlichen beziehungsweise unternehmerischen Tätigkeit des Leistungsempfängers zu dienen.

Maßgeblich ist grundsätzlich die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

Eine spätere tatsächliche Nutzungsänderung kann eine Vorsteuerberichtigung nach § 15a UStG auslösen.

---

⇨ 44. Verbrauchbare Gegenstände und sonstige Leistungen

Bei verbrauchbaren Gegenständen und sonstigen Leistungen ist grundsätzlich eine direkte Zuordnung zur beabsichtigten Verwendung vorzunehmen.

Beispiele:

- Büromaterial,
- Treibstoff,
- Beratungsleistungen,
- Mietleistungen,
- Strom,
- Reparaturleistungen.

Bei gemischter Verwendung ist die Vorsteuer entsprechend der tatsächlichen beziehungsweise beabsichtigten Nutzung aufzuteilen.

Ein freies Zuordnungswahlrecht wie bei einem einheitlichen Investitionsgegenstand besteht grundsätzlich nicht.

---

⇨ 45. Einheitlicher Gegenstand

Wird ein einheitlicher Gegenstand sowohl unternehmerisch als auch privat genutzt, ist der Umfang der unternehmerischen Nutzung zu bestimmen.

► Unternehmerische Nutzung unter 10 Prozent

Beträgt die unternehmerische Nutzung weniger als 10 Prozent, gilt der Gegenstand grundsätzlich nicht als für das Unternehmen bezogen.

Folge:

Kein Vorsteuerabzug.

► Unternehmerische Nutzung mindestens 10 Prozent

Bei einer unternehmerischen Nutzung von mindestens 10 Prozent kann grundsätzlich ein Zuordnungswahlrecht bestehen.

Der Unternehmer kann den Gegenstand je nach Sachverhalt

- vollständig dem Unternehmen,
- anteilig dem Unternehmen oder
- vollständig dem Privatvermögen

zuordnen.

---

⇨ 46. Vollständige Zuordnung

Wird der Gegenstand vollständig dem Unternehmen zugeordnet, kann die Vorsteuer unter den weiteren Voraussetzungen grundsätzlich vollständig abziehbar sein.

Die spätere private Nutzung kann dann als unentgeltliche Wertabgabe steuerpflichtig sein.

► Beispiel

Ein Pkw wird zu 70 Prozent unternehmerisch und zu 30 Prozent privat genutzt.

Der Unternehmer ordnet den Pkw vollständig dem Unternehmen zu.

Grundsätzlich kann ein voller Vorsteuerabzug möglich sein.

Die Privatnutzung ist anschließend umsatzsteuerlich als unentgeltliche Wertabgabe zu erfassen.

---

⇨ 47. Teilweise Zuordnung

Der Unternehmer kann einen gemischt genutzten Gegenstand grundsätzlich nur im Umfang der unternehmerischen Nutzung dem Unternehmen zuordnen.

Folgen:

- Vorsteuerabzug nur im zugeordneten Umfang,
- der private Teil bleibt außerhalb des Unternehmens,
- auf den nicht zugeordneten privaten Anteil fällt keine spätere Wertabgabenbesteuerung an.

---

⇨ 48. Nichtwirtschaftliche Tätigkeit im engeren Sinne

Bei einer gemischten Nutzung für

- wirtschaftliche unternehmerische Tätigkeiten und
- nichtwirtschaftliche Tätigkeiten im engeren Sinne

besteht nicht ohne Weiteres ein vollständiges Zuordnungswahlrecht.

Dies betrifft beispielsweise:

- ideelle Tätigkeiten eines Vereins,
- hoheitliche Tätigkeiten,
- Tätigkeiten außerhalb eines Leistungsaustauschs.

Die Eingangsleistung ist grundsätzlich nach ihrer wirtschaftlichen und nichtwirtschaftlichen Verwendung aufzuteilen.

Nur der dem wirtschaftlichen Unternehmensteil zuzurechnende Anteil kann zum Vorsteuerabzug berechtigen.

---

⇨ 49. Gemischt genutzte Grundstücke

Für Grundstücke gilt die Sonderregelung des § 15 Abs. 1b UStG.

Wird ein Grundstück sowohl

- unternehmerisch als auch
- privat oder unternehmensfremd

genutzt, ist die Vorsteuer grundsätzlich nur im Umfang der unternehmerischen Nutzung abziehbar.

Dies gilt auch dann, wenn das Grundstück vollständig dem Unternehmen zugeordnet wurde.

► Folge

Die private Nutzung führt hinsichtlich des bereits vom Vorsteuerabzug ausgeschlossenen Anteils grundsätzlich nicht zusätzlich zu einer Wertabgabenbesteuerung.

---

⇨ Teil E: Voraussetzungen des Vorsteuerabzugs

⇨ 50. Grundschema nach § 15 Abs. 1 Satz 1 Nr. 1 UStG

Für den Vorsteuerabzug aus einer normalen Eingangsleistung sind grundsätzlich fünf Voraussetzungen zu prüfen:

1. Unternehmereigenschaft des Leistungsempfängers,
2. gesetzlich geschuldete Umsatzsteuer,
3. Unternehmereigenschaft des leistenden Unternehmers,
4. Leistungsbezug für das Unternehmen,
5. ordnungsgemäße Rechnung nach §§ 14 und 14a UStG.

Erst wenn diese Voraussetzungen erfüllt sind, ist die Vorsteuer dem Grunde nach abzugsfähig.

Anschließend ist zu prüfen, ob sie tatsächlich abziehbar ist.

---

⇨ 51. Unternehmereigenschaft des Leistungsempfängers

Der Leistungsempfänger muss Unternehmer im Sinne des § 2 UStG sein.

Die Unternehmereigenschaft kann bereits mit nach außen erkennbaren Vorbereitungshandlungen beginnen.

Beispiele:

- Anmietung von Geschäftsräumen,
- Anschaffung von Betriebsmitteln,
- Marktanalysen,
- Beantragung erforderlicher Genehmigungen,
- Beauftragung eines Steuerberaters.

Auch ein erfolgloser Unternehmer kann zum Vorsteuerabzug berechtigt sein, wenn eine ernsthafte unternehmerische Tätigkeit objektiv beabsichtigt war.

Der Sitz des Leistungsempfängers ist für seine Unternehmereigenschaft grundsätzlich unerheblich.

---

⇨ 52. Gesetzlich geschuldete Steuer

Abziehbar ist nur gesetzlich geschuldete Umsatzsteuer.

Die Eingangsleistung muss nach dem deutschen Umsatzsteuerrecht

- steuerbar und
- steuerpflichtig

sein.

► Keine abziehbare Vorsteuer

Keine abziehbare Vorsteuer liegt grundsätzlich vor bei

- zu hoch ausgewiesener Umsatzsteuer,
- unberechtigtem Steuerausweis,
- Umsatzsteuer nach § 14c UStG,
- Umsatzsteuer auf einen steuerfreien Umsatz,
- Umsatzsteuer mit falschem Leistungsort.

► Grundsatz

Vorsteuerabzug höchstens in Höhe

- der gesetzlich geschuldeten Steuer und
- des in der ordnungsgemäßen Rechnung ausgewiesenen Betrags.

Der niedrigere Betrag ist maßgeblich.

---

⇨ 53. Fremdwährungen

Ist die Rechnung in einer fremden Währung ausgestellt, ist die Umsatzsteuer nach den gesetzlichen Vorschriften in Euro umzurechnen.

Maßgeblich sind insbesondere § 16 Abs. 6 UStG und die hierzu ergangenen Verwaltungsregelungen.

---

⇨ 54. Unternehmereigenschaft des Leistenden

Der leistende Unternehmer muss Unternehmer im Sinne des § 2 UStG sein.

Der Leistungsempfänger muss grundsätzlich prüfen, ob die Leistung tatsächlich von einem Unternehmer ausgeführt wurde.

Besteht die Unternehmereigenschaft des Leistenden nicht, entsteht grundsätzlich kein Vorsteuerabzug.

Ein allgemeiner Gutglaubensschutz allein wegen einer formal ordnungsgemäßen Rechnung besteht nicht.

---

⇨ 55. Leistungsbezug für das Unternehmen

Die Leistung muss für das Unternehmen des Leistungsempfängers bestimmt sein.

Maßgeblich ist die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

► Für das Unternehmen

Eine Leistung wird für das Unternehmen bezogen, wenn sie objektiv dazu bestimmt ist, der Erbringung entgeltlicher unternehmerischer Leistungen zu dienen.

► Nicht für das Unternehmen

Kein Vorsteuerabzug besteht bei einem ausschließlichen Leistungsbezug für

- private Zwecke,
- den privaten Bedarf des Personals,
- nichtwirtschaftliche Tätigkeiten,
- andere unternehmensfremde Zwecke.

---

⇨ 56. Zusammenhang mit dem Ausgangsumsatz

Die Eingangsleistung muss einem beabsichtigten Ausgangsumsatz oder der wirtschaftlichen Gesamttätigkeit zugeordnet werden.

Dabei ist vorrangig zu prüfen, ob ein direkter und unmittelbarer Zusammenhang mit einem bestimmten Ausgangsumsatz besteht.

Ist keine direkte Zuordnung möglich, kann die Eingangsleistung zu den allgemeinen Aufwendungen des Unternehmens gehören.

Dann ist die Gesamttätigkeit des Unternehmers maßgeblich.

---

⇨ 57. Ordnungsgemäße Rechnung

Der Leistungsempfänger muss grundsätzlich im Besitz einer Rechnung nach §§ 14 und 14a UStG sein.

Zu den Pflichtangaben gehören insbesondere:

- vollständiger Name und Anschrift des Leistenden,
- vollständiger Name und Anschrift des Leistungsempfängers,
- Steuernummer oder Umsatzsteuer-Identifikationsnummer,
- Ausstellungsdatum,
- fortlaufende Rechnungsnummer,
- Menge und Art der gelieferten Gegenstände,
- Umfang und Art der sonstigen Leistung,
- Leistungszeitpunkt,
- Entgelt,
- Steuersatz,
- Steuerbetrag.

► Besonders wichtig

§ 14 Abs. 4 Nr. 7 und 8 UStG verlangt insbesondere Angaben zum

- Entgelt,
- Steuersatz und
- Steuerbetrag.

Fehlen wesentliche Angaben, ist der Vorsteuerabzug grundsätzlich gefährdet.

---

⇨ 58. Rechnungsberichtigung

Eine fehlerhafte Rechnung kann grundsätzlich berichtigt werden.

Die Berichtigung kann nur durch

- den Rechnungsaussteller oder
- einen von ihm hierzu berechtigten Dritten

erfolgen.

Je nach Art des Fehlers kann die Rechnungsberichtigung auf den ursprünglichen Ausstellungszeitpunkt zurückwirken.

Voraussetzung ist grundsätzlich, dass das ursprüngliche Dokument bereits bestimmte Mindestangaben enthält.

---

⇨ 59. Zeitpunkt des Vorsteuerabzugs

Der Vorsteuerabzug ist grundsätzlich in dem Voranmeldungszeitraum vorzunehmen, in dem

1. die Lieferung oder sonstige Leistung ausgeführt wurde und
2. der Leistungsempfänger im Besitz einer ordnungsgemäßen Rechnung ist.

Der Zeitpunkt der Zahlung ist grundsätzlich unerheblich.

► Merksatz

Normale Eingangsleistung:

**Leistung + Rechnung.**

---

⇨ 60. Vorsteuerabzug bei Anzahlungen

Vor Ausführung der Leistung kann ein Vorsteuerabzug aus einer Anzahlung möglich sein, wenn

1. eine ordnungsgemäße Anzahlungsrechnung vorliegt,
2. die Zahlung tatsächlich geleistet wurde und
3. die spätere Leistung hinreichend bestimmt ist.

► Merksatz

Anzahlung:

**Rechnung + Zahlung.**

Die Leistung ist noch nicht ausgeführt.

---

⇨ 61. Weitere abziehbare Vorsteuerbeträge

Neben der normalen Eingangsrechnung nach § 15 Abs. 1 Satz 1 Nr. 1 UStG können insbesondere abziehbar sein:

► Einfuhrumsatzsteuer

§ 15 Abs. 1 Satz 1 Nr. 2 UStG.

► Steuer auf den innergemeinschaftlichen Erwerb

§ 15 Abs. 1 Satz 1 Nr. 3 UStG.

► Steuer nach § 13b UStG

§ 15 Abs. 1 Satz 1 Nr. 4 UStG.

In diesen Fällen ist eine Rechnung mit gesondertem Umsatzsteuerausweis grundsätzlich nicht Voraussetzung des Vorsteuerabzugs.

Die übrigen Voraussetzungen, insbesondere der Leistungsbezug für das Unternehmen und fehlende Ausschlussumsätze, bleiben jedoch zu prüfen.

---

⇨ Teil F: Ausschluss vom Vorsteuerabzug

⇨ 62. Abzugsfähigkeit und Abziehbarkeit

Es ist zwischen zwei Prüfungsebenen zu unterscheiden:

► Abzugsfähig

Die Voraussetzungen des § 15 Abs. 1 UStG sind erfüllt.

► Tatsächlich abziehbar

Es greift kein Ausschluss nach § 15 Abs. 1a, Abs. 1b oder Abs. 2 UStG beziehungsweise ein Ausschluss wird durch § 15 Abs. 3 UStG aufgehoben.

► Merksatz

Zuerst:

**Ist die Steuer Vorsteuer?**

Danach:

**Darf diese Vorsteuer tatsächlich abgezogen werden?**

---

⇨ 63. Ausschluss nach § 15 Abs. 2 UStG

Der Vorsteuerabzug ist grundsätzlich ausgeschlossen, wenn die Eingangsleistung für Umsätze verwendet wird, die den Vorsteuerabzug ausschließen.

Hierzu gehören insbesondere:

1. steuerfreie Ausgangsumsätze,
2. bestimmte im Ausland ausgeführte Umsätze, die bei Ausführung im Inland steuerfrei wären.

Maßgeblich ist die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

---

⇨ 64. Steuerpflichtige Ausgangsumsätze

Wird die Eingangsleistung für steuerpflichtige Ausgangsumsätze verwendet, besteht grundsätzlich kein Ausschluss nach § 15 Abs. 2 UStG.

Dies gilt auch, wenn ein ursprünglich steuerfreier Umsatz aufgrund einer wirksamen Option nach § 9 UStG steuerpflichtig behandelt wird.

► Beispiel

Ein Vermieter optiert wirksam zur Umsatzsteuer.

Die Renovierungskosten stehen unmittelbar mit der steuerpflichtigen Vermietung in Zusammenhang.

Die Vorsteuer kann grundsätzlich abziehbar sein.

---

⇨ 65. Steuerfreie Ausgangsumsätze

Wird die Eingangsleistung für steuerfreie Umsätze verwendet, ist die Vorsteuer grundsätzlich nicht abziehbar.

Typische Ausschlussumsätze sind:

- steuerfreie Heilbehandlungen,
- steuerfreie Wohnraumvermietung,
- bestimmte Bankumsätze,
- bestimmte Versicherungsumsätze,
- bestimmte Grundstücksverkäufe ohne Option.

---

⇨ 66. Rückausschluss nach § 15 Abs. 3 UStG

§ 15 Abs. 3 UStG hebt den Ausschluss des § 15 Abs. 2 UStG für bestimmte steuerfreie Umsätze wieder auf.

Diese Umsätze sind steuerfrei, berechtigen aber dennoch zum Vorsteuerabzug.

Typische Fälle sind insbesondere:

- Ausfuhrlieferungen,
- innergemeinschaftliche Lieferungen,
- bestimmte grenzüberschreitende Umsätze,
- bestimmte Umsätze für die See- und Luftfahrt,
- bestimmte Finanzumsätze mit Bezug zum Drittlandsgebiet.

► Merksatz

Steuerfrei bedeutet nicht automatisch:

**kein Vorsteuerabzug.**

Es muss immer § 15 Abs. 3 UStG geprüft werden.

---

⇨ 67. Steuerfreie Umsätze nach § 4 Nr. 1 bis 7 UStG

Bei vielen Steuerbefreiungen nach § 4 Nr. 1 bis 7 UStG bleibt der Vorsteuerabzug erhalten.

Hierzu gehören insbesondere typische grenzüberschreitende Befreiungstatbestände.

Die Vorsteuer ist damit

- abzugsfähig und
- trotz Steuerfreiheit des Ausgangsumsatzes abziehbar.

---

⇨ 68. Sonstige Steuerbefreiungen

Bei zahlreichen Steuerbefreiungen nach § 4 Nr. 8 bis 29 UStG ist der Vorsteuerabzug grundsätzlich ausgeschlossen.

Hierzu gehören beispielsweise:

- Bank- und Finanzumsätze,
- Versicherungsumsätze,
- Grundstücksvermietungen,
- Heilbehandlungen,
- Bildungs- und Sozialleistungen.

Es bestehen jedoch einzelne gesetzliche Ausnahmen und Rückausschlusstatbestände.

Die konkrete Steuerbefreiung ist daher stets einzeln zu prüfen.

---

⇨ 69. Umsätze im Ausland

Ein im Ausland ausgeführter Ausgangsumsatz ist in Deutschland nicht steuerbar.

Für den Vorsteuerabzug ist zu prüfen, wie der Umsatz bei einer hypothetischen Ausführung im Inland behandelt würde.

► Hypothetisch steuerpflichtig

Die Vorsteuer kann grundsätzlich abziehbar sein.

► Hypothetisch steuerfrei und vorsteuerschädlich

Die Vorsteuer ist grundsätzlich ausgeschlossen.

► Hypothetisch steuerfrei mit Rückausschluss

Die Vorsteuer kann dennoch abziehbar sein.

---

⇨ 70. Nicht steuerbare Tätigkeiten

Bei einer nicht steuerbaren Tätigkeit ist zu unterscheiden:

► Wirtschaftliche Tätigkeit mit ausländischem Leistungsort

Ein Vorsteuerabzug kann möglich sein, wenn der Umsatz bei Ausführung im Inland zum Vorsteuerabzug berechtigen würde.

► Nichtwirtschaftliche Tätigkeit

Bei einer Tätigkeit außerhalb des umsatzsteuerlichen Unternehmens fehlt grundsätzlich bereits der Leistungsbezug für das Unternehmen.

Die Eingangsleistung ist insoweit nicht abzugsfähig.

---

⇨ Teil G: Aufteilung von Vorsteuerbeträgen

⇨ 71. Direkte Zuordnung

Vorsteuerbeträge sind zunächst unmittelbar den Ausgangsumsätzen zuzuordnen.

► Ausschließlich Abzugsumsätze

Die Vorsteuer ist vollständig abziehbar.

► Ausschließlich Ausschlussumsätze

Die Vorsteuer ist nicht abziehbar.

► Gemischter Zusammenhang

Ist keine direkte Zuordnung möglich, ist eine Aufteilung nach § 15 Abs. 4 UStG vorzunehmen.

---

⇨ 72. Voraussetzung der Vorsteueraufteilung

Eine Aufteilung ist erforderlich, wenn eine Eingangsleistung gleichzeitig verwendet wird für

- Umsätze, die zum Vorsteuerabzug berechtigen, und
- Umsätze, die den Vorsteuerabzug ausschließen.

► Beispiel

Ein Steuerberater erzielt

- steuerpflichtige Beratungsumsätze und
- steuerfreie Grundstücksvermietungsumsätze.

Die Kosten des gesamten Verwaltungsbüros können beiden Bereichen dienen.

Die Vorsteuer ist nach einem sachgerechten Maßstab aufzuteilen.

---

⇨ 73. Sachgerechte Schätzung

Die Aufteilung erfolgt nach einer sachgerechten Schätzung.

Geeignete Aufteilungsmaßstäbe können sein:

- Nutzflächen,
- Wohnflächen,
- Zeitanteile,
- Stückzahlen,
- Personenzahlen,
- tatsächliche Nutzung,
- technische Verbrauchswerte,
- Umsatzverhältnisse.

Der gewählte Schlüssel muss den wirtschaftlichen Zusammenhang möglichst genau abbilden.

---

⇨ 74. Umsatzschlüssel

Eine Aufteilung nach dem Verhältnis der Umsätze ist grundsätzlich nur zulässig, wenn keine andere wirtschaftlich präzisere Zuordnung möglich ist.

Der Umsatzschlüssel ist daher regelmäßig nachrangig.

► Merksatz

Direkte Zuordnung vor Aufteilung.

Präziser wirtschaftlicher Schlüssel vor Umsatzschlüssel.

---

⇨ 75. Gebäude

Bei Gebäuden ist besonders zu unterscheiden:

► Direkte Zuordnung möglich

Betrifft eine Eingangsleistung ausschließlich einen bestimmten Gebäudeteil, erfolgt keine Aufteilung.

Beispiele:

- Renovierung ausschließlich der Arztpraxis,
- Fenster ausschließlich in einer steuerpflichtig vermieteten Einheit,
- Bodenbelag ausschließlich in einer steuerfreien Wohnung.

► Keine direkte Zuordnung möglich

Bei allgemeinen Gebäudeaufwendungen ist regelmäßig ein sachgerechter Aufteilungsschlüssel zu verwenden.

Häufig kommt das Verhältnis der Nutzflächen in Betracht.

---

⇨ 76. Anschaffungs- und Herstellungskosten eines Gebäudes

Vorsteuer aus Anschaffungs- und Herstellungskosten eines gemischt genutzten Gebäudes ist nach einem sachgerechten Maßstab aufzuteilen.

Der geeignete Maßstab richtet sich nach den Umständen des Einzelfalls.

Ein einmal gewählter sachgerechter Aufteilungsmaßstab kann den Unternehmer auch für spätere Berichtigungszeiträume binden.

Ändert sich die Verwendung, ist § 15a UStG zu prüfen.

---

⇨ Teil H: Prüfungsschemata

⇨ 77. Prüfungsschema Reverse Charge

1. Art der Eingangsleistung bestimmen.
2. Leistungsort ermitteln.
3. Inländische Steuerbarkeit prüfen.
4. Steuerbefreiung prüfen.
5. Tatbestand des § 13b Abs. 1 oder Abs. 2 bestimmen.
6. Ansässigkeit des Leistenden prüfen.
7. Voraussetzungen des Leistungsempfängers nach § 13b Abs. 5 prüfen.
8. Zeitpunkt der Steuerentstehung bestimmen.
9. Bemessungsgrundlage bestimmen.
10. Steuersatz bestimmen.
11. Umsatzsteuer berechnen.
12. Rechnung ohne gesonderten Steuerausweis prüfen.
13. Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 4 UStG gesondert prüfen.

---

⇨ 78. Prüfungsschema Steuersatz

1. Liegt ein steuerpflichtiger Umsatz vor?
2. Wird der Umsatz von § 12 Abs. 2 UStG erfasst?
3. Ist Anlage 2 UStG einschlägig?
4. Liegt eine begünstigte Personenbeförderung vor?
5. Liegt eine kurzfristige Beherbergung vor?
6. Liegt eine Restaurant- oder Verpflegungsdienstleistung vor?
7. Handelt es sich um Speisen oder Getränke?
8. Wenn keine Ermäßigung greift: 19 Prozent.

---

⇨ 79. Prüfungsschema Bemessungsgrundlage

1. Gegenleistung feststellen.
2. Brutto- oder Nettopreis bestimmen.
3. Zahlungen Dritter einbeziehen.
4. Nebenleistungen einbeziehen.
5. Preisnachlässe abziehen.
6. Durchlaufende Posten aussondern.
7. Echten Schadensersatz aussondern.
8. Tausch oder Baraufgabe prüfen.
9. Steuersatz bestimmen.
10. Umsatzsteuer herausrechnen.

---

⇨ 80. Prüfungsschema Vorsteuerabzug

► Stufe 1: Abzugsfähigkeit

1. Unternehmereigenschaft des Leistungsempfängers.
2. Gesetzlich geschuldete Umsatzsteuer.
3. Unternehmereigenschaft des Leistenden.
4. Leistungsbezug für das Unternehmen.
5. Ordnungsgemäße Rechnung.

► Stufe 2: Abziehbarkeit

6. Ausschluss nach § 15 Abs. 1a prüfen.
7. Sonderregelung für Grundstücke nach § 15 Abs. 1b prüfen.
8. Ausschlussumsätze nach § 15 Abs. 2 prüfen.
9. Rückausschluss nach § 15 Abs. 3 prüfen.
10. Gegebenenfalls Aufteilung nach § 15 Abs. 4 durchführen.

► Ergebnis

Festzustellen sind:

- Vorsteuer abziehbar oder nicht abziehbar,
- Höhe der abziehbaren Vorsteuer,
- maßgeblicher Voranmeldungszeitraum.

---

⇨ 81. Formulierungshilfe § 13b UStG

Die Leistung ist im Inland steuerbar und steuerpflichtig.

Sie fällt unter § 13b Abs. ... UStG.

Da der Leistungsempfänger die Voraussetzungen des § 13b Abs. 5 UStG erfüllt, schuldet er die Umsatzsteuer.

Die Bemessungsgrundlage beträgt ... Euro.

Bei einem Steuersatz von ... Prozent entsteht Umsatzsteuer in Höhe von ... Euro.

Der leistende Unternehmer darf die Umsatzsteuer nicht gesondert ausweisen und muss auf die Steuerschuldnerschaft des Leistungsempfängers hinweisen.

Der Vorsteuerabzug des Leistungsempfängers ist gesondert nach § 15 UStG zu prüfen.

---

⇨ 82. Formulierungshilfe Vorsteuerabzug möglich

Der Leistungsempfänger ist Unternehmer im Sinne des § 2 UStG.

Die Eingangsleistung wurde von einem anderen Unternehmer für sein Unternehmen ausgeführt.

Die Umsatzsteuer wird gesetzlich geschuldet und ist in einer ordnungsgemäßen Rechnung nach §§ 14 und 14a UStG ausgewiesen.

Die Voraussetzungen des § 15 Abs. 1 Satz 1 Nr. 1 UStG sind erfüllt.

Da die Eingangsleistung für steuerpflichtige Ausgangsumsätze verwendet wird, greift kein Ausschluss nach § 15 Abs. 2 UStG ein.

Die Vorsteuer ist abzugsfähig und abziehbar.

---

⇨ 83. Formulierungshilfe Vorsteuerabzug ausgeschlossen

Die Voraussetzungen des § 15 Abs. 1 UStG sind dem Grunde nach erfüllt.

Die Eingangsleistung wird jedoch für steuerfreie Ausgangsumsätze verwendet, die den Vorsteuerabzug ausschließen.

Der Vorsteuerabzug ist daher nach § 15 Abs. 2 Satz 1 Nr. 1 UStG ausgeschlossen.

Ein Rückausschluss nach § 15 Abs. 3 UStG liegt nicht vor.

Die Vorsteuer ist abzugsfähig, aber nicht abziehbar.

---

⇨ 84. Zentrale Merksätze

- § 13b UStG ändert den Steuerschuldner, nicht die Steuerpflicht des Umsatzes.
- Zuerst müssen Ort, Steuerbarkeit und Steuerpflicht geprüft werden.
- Bei § 13b Abs. 1 entsteht die Steuer grundsätzlich im Zeitraum der Leistungsausführung.
- Bei § 13b Abs. 2 entsteht die Steuer mit Rechnung, spätestens im Folgemonat.
- Der leistende Unternehmer weist bei Reverse Charge keine Umsatzsteuer aus.
- Ein falscher Steuerausweis kann zu einer zusätzlichen Steuerschuld nach § 14c UStG führen.
- Auch Kleinunternehmer können als Leistungsempfänger Steuer nach § 13b UStG schulden.
- Steuerschuld und Vorsteuerabzug sind immer getrennt zu prüfen.
- Der Regelsteuersatz beträgt 19 Prozent.
- Der ermäßigte Steuersatz beträgt 7 Prozent.
- Seit 2026 unterliegen Restaurant-Speisen grundsätzlich 7 Prozent, Getränke regelmäßig 19 Prozent.
- Die Umsatzsteuer gehört nicht zur Bemessungsgrundlage.
- Durchlaufende Posten setzen Handeln im fremden Namen und für fremde Rechnung voraus.
- Beim Tausch ist jeder Umsatz getrennt zu prüfen.
- Für den Vorsteuerabzug ist die Verwendungsabsicht im Zeitpunkt des Leistungsbezugs maßgeblich.
- Bei weniger als 10 Prozent unternehmerischer Nutzung ist eine Zuordnung zum Unternehmen grundsätzlich ausgeschlossen.
- Eine abzugsfähige Vorsteuer ist nicht automatisch tatsächlich abziehbar.
- Steuerfreie Ausgangsumsätze können den Vorsteuerabzug ausschließen.
- Bei Ausfuhrlieferungen und ähnlichen Umsätzen bleibt der Vorsteuerabzug häufig erhalten.
- Vorsteuerbeträge sind zuerst direkt zuzuordnen.
- Nur wenn keine direkte Zuordnung möglich ist, erfolgt eine Aufteilung nach § 15 Abs. 4 UStG.
- Ein präziser wirtschaftlicher Aufteilungsschlüssel geht dem Umsatzschlüssel vor.
`
},
{
  id: "ertragswertverfahren-fallbeispiele-rohertrag-bewirtschaftungskosten",

  title:
    "Ertragswertverfahren: Rohertrag, Bewirtschaftungskosten und vollständige Rechenfälle",

  short:
    "Berechnung des Grundbesitzwerts im Ertragswertverfahren nach §§ 184 bis 188 BewG mit Mietwohngrundstück, gemischt genutztem Grundstück, Rohertrag, 20-Prozent-Grenze, Bewirtschaftungskosten, Bodenwertverzinsung und Vervielfältiger.",

  category: "Erbschaftsteuer / Bewertung",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Lehrgangsfälle zum Ertragswertverfahren, gesetzlich geprüft und berichtigt",

  keywords:
    "ertragswertverfahren|grundbesitzwert|mietwohngrundstück|gemischt genutztes grundstück|§ 181 bewg|§ 182 bewg|§ 184 bewg|§ 185 bewg|§ 186 bewg|§ 187 bewg|§ 188 bewg|anlage 21 bewg|anlage 22 bewg|anlage 23 bewg|bodenwert|bodenrichtwert|rohertrag|jahresrohertrag|sollmiete|übliche miete|20 prozent grenze|bewirtschaftungskosten|verwaltungskosten|instandhaltungskosten|mietausfallwagnis|reinertrag|bodenwertverzinsung|gebäudereinertrag|restnutzungsdauer|gesamtnutzungsdauer|liegenschaftszinssatz|vervielfältiger|gebäudeertragswert|erbfall|schenkung|erbschaftsteuer|schenkungsteuer",

  references: [
    "§ 12 Abs. 3 ErbStG",
    "§ 11 ErbStG",
    "§ 9 ErbStG",
    "§ 151 BewG",
    "§ 179 BewG",
    "§ 181 Abs. 1 Nr. 2 und Abs. 3 BewG",
    "§ 181 Abs. 1 Nr. 5 und Abs. 7 BewG",
    "§ 182 Abs. 3 Nr. 1 BewG",
    "§ 182 Abs. 3 Nr. 2 BewG",
    "§ 184 BewG",
    "§ 185 BewG",
    "§ 186 BewG",
    "§ 187 BewG",
    "§ 188 BewG",
    "Anlage 21 BewG",
    "Anlage 22 BewG",
    "Anlage 23 BewG",
    "Anlage 24 BewG",
    "R B 184 ErbStR",
    "R B 185 ErbStR",
    "R B 186.1 ErbStR",
    "R B 187 ErbStR",
    "R B 188 ErbStR",
    "BMF-Schreiben vom 29.01.2024, BStBl I 2024, 191"
  ],

  body: `
⇨ Ertragswertverfahren: Rechenfälle und vertiefende Prüfung

► 1. Anwendungsbereich

Das Ertragswertverfahren ist anzuwenden bei:

1. Mietwohngrundstücken nach § 181 Abs. 1 Nr. 2 und Abs. 3 BewG,
2. Geschäftsgrundstücken und gemischt genutzten Grundstücken, wenn sich auf dem örtlichen Grundstücksmarkt eine übliche Miete ermitteln lässt.

Rechtsgrundlage:

- Mietwohngrundstücke: § 182 Abs. 3 Nr. 1 BewG,
- Geschäftsgrundstücke und gemischt genutzte Grundstücke: § 182 Abs. 3 Nr. 2 BewG.

Ein Wahlrecht zwischen Ertragswert- und Sachwertverfahren besteht grundsätzlich nicht.

---

⇨ 2. Gesamtschema

► Bodenwert

Grundstücksfläche  
× Bodenrichtwert  
= Bodenwert

► Rohertrag

Jährliche maßgebende Miete  
= Rohertrag des Grundstücks

► Reinertrag

Rohertrag  
./. Bewirtschaftungskosten  
= Reinertrag des Grundstücks

► Bodenwertverzinsung

Bodenwert  
× Liegenschaftszinssatz  
= Bodenwertverzinsung

► Gebäudereinertrag

Reinertrag des Grundstücks  
./. Bodenwertverzinsung  
= Gebäudereinertrag

► Gebäudeertragswert

Gebäudereinertrag  
× Vervielfältiger  
= Gebäudeertragswert

► Grundbesitzwert

Bodenwert  
+ Gebäudeertragswert  
= Grundbesitzwert

---

⇨ 3. Bodenwert

Der Bodenwert wird nach § 184 Abs. 2 BewG in Verbindung mit § 179 BewG ermittelt.

► Formel

Grundstücksgröße in Quadratmetern  
× maßgebender Bodenrichtwert je Quadratmeter  
= Bodenwert

► Beispiel

Grundstücksgröße:

500 Quadratmeter.

Bodenrichtwert:

400 Euro je Quadratmeter.

Berechnung:

500 × 400 Euro = 200.000 Euro.

Der Bodenwert beträgt 200.000 Euro.

---

⇨ 4. Maßgebender Bodenrichtwert

Maßgebend ist grundsätzlich der für den Bewertungsstichtag relevante Bodenrichtwert des zuständigen Gutachterausschusses.

Liegt der Bewertungsstichtag beispielsweise im Jahr 2024 und besteht ein Bodenrichtwert zum 1. Januar 2024, kann dieser nach den gesetzlichen Vorgaben maßgebend sein.

Abweichungen des Bewertungsgrundstücks vom Bodenrichtwertgrundstück sind gegebenenfalls durch Umrechnungskoeffizienten oder andere geeignete Anpassungen zu berücksichtigen.

---

⇨ 5. Rohertrag nach § 186 BewG

Der Rohertrag ist das Entgelt, das nach den am Bewertungsstichtag geltenden vertraglichen Vereinbarungen für die Nutzung des bebauten Grundstücks innerhalb eines Zeitraums von zwölf Monaten zu zahlen ist.

► Grundsatz

Maßgebend ist die Sollmiete nach den vertraglichen Bedingungen am Bewertungsstichtag.

► Formel

Monatliche Nettokaltmiete  
× 12 Monate  
= Jahresrohertrag

► Nicht einzubeziehen

Umlagen zur Deckung der Betriebskosten gehören nicht zum Rohertrag.

Beispiele:

- Heizkostenvorauszahlungen,
- Wasserkosten,
- Müllgebühren,
- Hausmeisterkosten,
- umlagefähige Versicherungen,
- sonstige Betriebskostenvorauszahlungen.

► Merksatz

**Rohertrag bedeutet grundsätzlich Nettokaltmiete ohne Betriebskostenumlagen.**

---

⇨ 6. Veränderungen nach dem Bewertungsstichtag

Maßgebend sind die Verhältnisse am Bewertungsstichtag.

Spätere

- Mietänderungen,
- Mieterwechsel,
- Mietausfälle,
- Neuvermietungen oder
- Kündigungen

sind grundsätzlich nicht zu berücksichtigen, wenn sie am Bewertungsstichtag noch nicht rechtlich wirksam oder bereits verbindlich vereinbart waren.

---

⇨ 7. Ansatz der üblichen Miete

Die übliche Miete ist insbesondere anzusetzen, wenn das Grundstück oder ein Grundstücksteil

1. selbst genutzt wird,
2. ungenutzt ist,
3. unentgeltlich überlassen wird,
4. nur zu vorübergehendem Gebrauch überlassen wird oder
5. zu einer um mehr als 20 Prozent von der üblichen Miete abweichenden tatsächlichen Miete vermietet wird.

Betriebskosten sind auch bei der üblichen Miete nicht einzubeziehen.

---

⇨ 8. Ungenutzte Wohnung am Bewertungsstichtag

Ist eine Wohnung am Bewertungsstichtag leerstehend, ist grundsätzlich die übliche Jahresmiete anzusetzen.

► Beispiel

Eine Wohnung war bis zum 30. September für monatlich 900 Euro vermietet.

Sie steht vom 1. Oktober bis 30. November leer.

Ab 1. Dezember wird sie für monatlich 950 Euro neu vermietet.

Bewertungsstichtag ist der 15. November.

Die übliche Miete beträgt 1.000 Euro monatlich.

Da die Wohnung am Bewertungsstichtag ungenutzt ist, wird angesetzt:

1.000 Euro × 12 Monate = 12.000 Euro.

Die frühere und die spätere tatsächliche Miete sind für den Rohertrag am Bewertungsstichtag nicht maßgebend.

---

⇨ 9. Abweichung von der üblichen Miete

Die übliche Miete ersetzt die tatsächliche Miete nur, wenn die tatsächliche Miete um mehr als 20 Prozent von der üblichen Miete abweicht.

Die Grenze wird auf Grundlage der üblichen Miete berechnet.

► Formel

Übliche Miete  
× 20 Prozent  
= zulässiger Abweichungsbetrag

► Untere Grenze

Übliche Miete  
./. 20 Prozent der üblichen Miete

► Obere Grenze

Übliche Miete  
+ 20 Prozent der üblichen Miete

---

⇨ 10. Genau 20 Prozent Abweichung

Beträgt die Abweichung genau 20 Prozent, ist die vereinbarte Miete anzusetzen.

Das Gesetz verlangt eine Abweichung von mehr als 20 Prozent.

► Beispiel

Übliche Miete:

1.000 Euro monatlich.

20 Prozent:

200 Euro.

Vereinbarte Miete:

800 Euro monatlich.

Abweichung:

200 Euro = genau 20 Prozent.

Ergebnis:

Die vereinbarte Miete ist anzusetzen.

Jahresrohertrag:

800 Euro × 12 = 9.600 Euro.

---

⇨ 11. Mehr als 20 Prozent Abweichung

► Beispiel

Übliche Miete:

1.000 Euro monatlich.

Vereinbarte Miete:

1.300 Euro monatlich.

Abweichung:

300 Euro = 30 Prozent.

Da die Abweichung mehr als 20 Prozent beträgt, ist die übliche Miete anzusetzen.

Jahresrohertrag:

1.000 Euro × 12 = 12.000 Euro.

Die Regel gilt sowohl bei einer zu niedrigen als auch bei einer zu hohen vereinbarten Miete.

---

⇨ 12. Bewirtschaftungskosten nach § 187 BewG

Vom Rohertrag sind die Bewirtschaftungskosten abzuziehen.

Sie bestehen insbesondere aus:

1. Verwaltungskosten,
2. Instandhaltungskosten,
3. Mietausfallwagnis,
4. gegebenenfalls nicht umlagefähigen Betriebskosten.

Für die standardisierte Bewertung werden grundsätzlich die Werte der Anlage 23 BewG verwendet.

---

⇨ 13. Jährliche Anpassung der Bewirtschaftungskosten

Die Basiswerte für Verwaltungskosten und Instandhaltungskosten der Wohnnutzung werden jährlich an die Entwicklung des Verbraucherpreisindex angepasst.

Das Bundesministerium der Finanzen veröffentlicht die maßgebenden Werte für jedes Bewertungsjahr.

► Zwingende Chatbot-Regel

Vor einer konkreten Berechnung muss der Bewertungsstichtag bestimmt werden.

Die Werte eines Jahres dürfen nicht ungeprüft für ein anderes Bewertungsjahr verwendet werden.

Beispiel:

- Bewertungsstichtag 2024: Werte des Jahres 2024,
- Bewertungsstichtag 2025: Werte des Jahres 2025,
- Bewertungsstichtag 2026: Werte des Jahres 2026.

---

⇨ 14. Bewirtschaftungskosten für Wohnnutzung im Jahr 2024

Für Bewertungsstichtage im Kalenderjahr 2024 gelten nach der Indizierung insbesondere folgende Werte:

► Verwaltungskosten

Je Wohnung jährlich:

351 Euro.

Je Garage oder ähnlichem Einstellplatz jährlich:

46 Euro.

► Instandhaltungskosten

Je Quadratmeter Wohnfläche jährlich:

13,80 Euro.

Je Garage oder ähnlichem Einstellplatz jährlich:

104 Euro.

► Mietausfallwagnis

2 Prozent des auf die Wohnnutzung entfallenden jährlichen Rohertrags.

---

⇨ 15. Bewirtschaftungskosten für gewerbliche Nutzung

► Verwaltungskosten

3 Prozent des auf die gewerbliche Nutzung entfallenden jährlichen Rohertrags.

► Instandhaltungskosten

Grundsätzlich je Quadratmeter Nutzfläche:

100 Prozent des für Wohnflächen geltenden Instandhaltungskostenwerts.

Für bestimmte Gebäudearten gelten reduzierte Ansätze:

- Gebäudeart 13 der Anlage 24: 50 Prozent,
- Gebäudearten 15, 16 und 18 der Anlage 24: 30 Prozent.

► Mietausfallwagnis

4 Prozent des auf die gewerbliche Nutzung entfallenden jährlichen Rohertrags.

---

⇨ 16. Gemischte Nutzung

Bei einem gemischt genutzten Grundstück sind die Bewirtschaftungskosten nach Wohn- und Nichtwohnnutzung getrennt zu berechnen.

► Wohnnutzung

- Verwaltungskosten je Wohnung,
- Instandhaltungskosten je Quadratmeter Wohnfläche,
- Mietausfallwagnis 2 Prozent.

► Gewerbliche Nutzung

- Verwaltungskosten 3 Prozent des gewerblichen Rohertrags,
- Instandhaltungskosten je Quadratmeter Nutzfläche,
- Mietausfallwagnis 4 Prozent.

Anschließend werden sämtliche Bewirtschaftungskosten addiert.

---

⇨ 17. Reinertrag des Grundstücks

► Formel

Rohertrag des Grundstücks  
./. Verwaltungskosten  
./. Instandhaltungskosten  
./. Mietausfallwagnis  
./. gegebenenfalls weitere Bewirtschaftungskosten  
= Reinertrag des Grundstücks

---

⇨ 18. Bodenwertverzinsung

Der auf den Grund und Boden entfallende Ertragsanteil ist vom Reinertrag des Grundstücks abzuziehen.

► Formel

Bodenwert  
× Liegenschaftszinssatz  
= Bodenwertverzinsung

---

⇨ 19. Gesetzliche Liegenschaftszinssätze

Soweit kein geeigneter Liegenschaftszinssatz des Gutachterausschusses vorliegt, gelten grundsätzlich die gesetzlichen Zinssätze.

Insbesondere:

- Mietwohngrundstück: 3,5 Prozent,
- gemischt genutztes Grundstück mit gewerblichem Anteil bis zu 50 Prozent: 4,5 Prozent,
- gemischt genutztes Grundstück mit gewerblichem Anteil von mehr als 50 Prozent: 5 Prozent,
- Geschäftsgrundstück: 6 Prozent.

► Merksatz

**Beim gemischt genutzten Grundstück bestimmt der gewerbliche Flächenanteil den gesetzlichen Zinssatz.**

---

⇨ 20. Gebäudereinertrag

► Formel

Reinertrag des Grundstücks  
./. Bodenwertverzinsung  
= Gebäudereinertrag

Nur der Gebäudereinertrag wird mit dem Vervielfältiger kapitalisiert.

Der Bodenwert wird anschließend unverändert hinzugerechnet.

---

⇨ 21. Gesamtnutzungsdauer

Die wirtschaftliche Gesamtnutzungsdauer ergibt sich aus Anlage 22 BewG.

Für die in den Beispielen verwendeten Gebäude beträgt sie 80 Jahre.

► Wichtig

Die Gesamtnutzungsdauer stammt aus Anlage 22 BewG.

Der Vervielfältiger stammt dagegen aus Anlage 21 BewG.

---

⇨ 22. Restnutzungsdauer

► Grundformel

Gesamtnutzungsdauer  
./. Alter des Gebäudes  
= Restnutzungsdauer

Das Gebäudealter ist grundsätzlich nach den Verhältnissen am Bewertungsstichtag zu bestimmen.

► Beispiel

Gesamtnutzungsdauer:

80 Jahre.

Gebäudealter:

28 Jahre.

Restnutzungsdauer:

80 - 28 = 52 Jahre.

---

⇨ 23. Vervielfältiger

Der Vervielfältiger ergibt sich aus Anlage 21 BewG.

Er richtet sich nach:

1. dem Liegenschaftszinssatz und
2. der Restnutzungsdauer.

► Formel

Gebäudereinertrag  
× Vervielfältiger  
= Gebäudeertragswert

---

⇨ 24. Fall 1: Erbfall mit Mietwohngrundstück

► Sachverhalt

Erbfall:

19. November 2024.

Alleinerbin des verstorbenen Vaters ist seine Tochter.

Zum Nachlass gehört ein bebautes Grundstück mit fünf vollständig zu Wohnzwecken vermieteten Wohnungen.

Grundstücksgröße:

500 Quadratmeter.

Bodenrichtwert zum 1. Januar 2024:

400 Euro je Quadratmeter.

Wohnfläche:

450 Quadratmeter.

Aufteilung:

- vier Wohnungen mit jeweils 100 Quadratmetern,
- eine Wohnung mit 50 Quadratmetern.

Monatliche Nettokaltmieten:

- vier Wohnungen mit jeweils 1.000 Euro,
- eine Wohnung mit 500 Euro.

Daneben werden Betriebskostenumlagen gezahlt.

Fertigstellung beziehungsweise Bezugsfertigkeit:

10. November 1996.

---

⇨ 25. Grundstücksart im Fall 1

Das Grundstück dient vollständig Wohnzwecken.

Es enthält fünf Wohnungen und ist daher kein Ein- oder Zweifamilienhaus.

Es handelt sich um ein Mietwohngrundstück nach § 181 Abs. 1 Nr. 2 in Verbindung mit Abs. 3 BewG.

Mietwohngrundstücke sind nach § 182 Abs. 3 Nr. 1 BewG im Ertragswertverfahren zu bewerten.

---

⇨ 26. Bodenwert im Fall 1

Grundstücksgröße:

500 Quadratmeter.

Bodenrichtwert:

400 Euro je Quadratmeter.

Berechnung:

500 × 400 Euro = 200.000 Euro.

Bodenwert:

200.000 Euro.

---

⇨ 27. Rohertrag im Fall 1

Vier Wohnungen:

4 × 1.000 Euro × 12 Monate  
= 48.000 Euro.

Eine Wohnung:

500 Euro × 12 Monate  
= 6.000 Euro.

Rohertrag:

48.000 Euro  
+ 6.000 Euro  
= 54.000 Euro.

Die zusätzlich gezahlten Betriebskostenumlagen gehören nicht zum Rohertrag.

---

⇨ 28. Bewirtschaftungskosten im Fall 1

► Verwaltungskosten

351 Euro je Wohnung  
× 5 Wohnungen  
= 1.755 Euro.

► Instandhaltungskosten

450 Quadratmeter  
× 13,80 Euro  
= 6.210 Euro.

► Mietausfallwagnis

54.000 Euro  
× 2 Prozent  
= 1.080 Euro.

► Gesamte Bewirtschaftungskosten

1.755 Euro  
+ 6.210 Euro  
+ 1.080 Euro  
= 9.045 Euro.

---

⇨ 29. Reinertrag im Fall 1

Rohertrag:

54.000 Euro.

Bewirtschaftungskosten:

9.045 Euro.

Berechnung:

54.000 Euro  
./. 9.045 Euro  
= 44.955 Euro.

Reinertrag des Grundstücks:

44.955 Euro.

---

⇨ 30. Bodenwertverzinsung im Fall 1

Das Grundstück ist ein Mietwohngrundstück.

Gesetzlicher Liegenschaftszinssatz:

3,5 Prozent.

Berechnung:

200.000 Euro  
× 3,5 Prozent  
= 7.000 Euro.

Bodenwertverzinsung:

7.000 Euro.

---

⇨ 31. Gebäudereinertrag im Fall 1

Reinertrag des Grundstücks:

44.955 Euro.

Bodenwertverzinsung:

7.000 Euro.

Berechnung:

44.955 Euro  
./. 7.000 Euro  
= 37.955 Euro.

Gebäudereinertrag:

37.955 Euro.

---

⇨ 32. Restnutzungsdauer im Fall 1

Gesamtnutzungsdauer laut Anlage 22 BewG:

80 Jahre.

Alter am Bewertungsstichtag:

2024 - 1996 = 28 Jahre.

Restnutzungsdauer:

80 - 28 = 52 Jahre.

---

⇨ 33. Gebäudeertragswert im Fall 1

Liegenschaftszinssatz:

3,5 Prozent.

Restnutzungsdauer:

52 Jahre.

Vervielfältiger laut Anlage 21 BewG:

23,80.

Berechnung:

37.955 Euro  
× 23,80  
= 903.329 Euro.

Gebäudeertragswert:

903.329 Euro.

---

⇨ 34. Grundbesitzwert im Fall 1

Bodenwert:

200.000 Euro.

Gebäudeertragswert:

903.329 Euro.

Berechnung:

200.000 Euro  
+ 903.329 Euro  
= 1.103.329 Euro.

► Ergebnis

Der Grundbesitzwert beträgt 1.103.329 Euro.

Der Wert ist nach § 12 Abs. 3 ErbStG als Grundbesitzwert für die Festsetzung der Erbschaftsteuer zu berücksichtigen.

---

⇨ 35. Kompakte Berechnung Fall 1

Bodenwert:

500 Quadratmeter × 400 Euro = 200.000 Euro.

Rohertrag:

54.000 Euro.

Bewirtschaftungskosten:

- Verwaltung: 1.755 Euro,
- Instandhaltung: 6.210 Euro,
- Mietausfallwagnis: 1.080 Euro.

Summe:

9.045 Euro.

Reinertrag:

54.000 - 9.045 = 44.955 Euro.

Bodenwertverzinsung:

200.000 × 3,5 Prozent = 7.000 Euro.

Gebäudereinertrag:

44.955 - 7.000 = 37.955 Euro.

Gebäudeertragswert:

37.955 × 23,80 = 903.329 Euro.

Grundbesitzwert:

200.000 + 903.329 = 1.103.329 Euro.

---

⇨ 36. Fall 2: Schenkung eines gemischt genutzten Grundstücks

► Sachverhalt

Notarieller Vertrag:

12. Dezember 2024.

Der Vater schenkt seiner Tochter ein gemischt genutztes Grundstück.

Das Gebäude enthält:

- zwei Ladenlokale,
- drei vermietete Wohnungen.

Jede Einheit verfügt über 100 Quadratmeter.

Gewerbliche Nutzfläche:

200 Quadratmeter = 40 Prozent.

Wohnfläche:

300 Quadratmeter = 60 Prozent.

Gesamte Wohn- und Nutzfläche:

500 Quadratmeter.

Gebäudealter am Bewertungsstichtag:

20 Jahre.

Gebäudeart laut Anlage 24 BewG:

5.1.

Jährliche vereinbarte und übliche Mieten:

- Ladenlokale: 40.000 Euro,
- Wohnungen: 24.000 Euro.

Grundstücksgröße:

500 Quadratmeter.

Bodenrichtwert:

400 Euro je Quadratmeter.

---

⇨ 37. Grundstücksart im Fall 2

Das Grundstück dient zu

- 60 Prozent Wohnzwecken und
- 40 Prozent gewerblichen Zwecken.

Der Wohnanteil beträgt nicht mehr als 80 Prozent.

Der gewerbliche Anteil beträgt ebenfalls nicht mehr als 80 Prozent.

Das Grundstück fällt auch unter keine speziellere Grundstücksart.

Es handelt sich daher um ein gemischt genutztes Grundstück nach § 181 Abs. 1 Nr. 5 in Verbindung mit Abs. 7 BewG.

Da eine übliche Miete ermittelt werden kann, erfolgt die Bewertung nach § 182 Abs. 3 Nr. 2 BewG im Ertragswertverfahren.

► Korrekturhinweis

Eine Zuordnung zu § 181 Abs. 1 Nr. 2 und Abs. 3 BewG wäre falsch, weil diese Vorschriften Mietwohngrundstücke betreffen.

---

⇨ 38. Bodenwert im Fall 2

500 Quadratmeter  
× 400 Euro  
= 200.000 Euro.

Bodenwert:

200.000 Euro.

---

⇨ 39. Rohertrag im Fall 2

Gewerbliche Nutzung:

40.000 Euro.

Wohnnutzung:

24.000 Euro.

Gesamtrohertrag:

40.000 Euro  
+ 24.000 Euro  
= 64.000 Euro.

---

⇨ 40. Verwaltungskosten im Fall 2

► Wohnnutzung

351 Euro je Wohnung  
× 3 Wohnungen  
= 1.053 Euro.

► Gewerbliche Nutzung

40.000 Euro  
× 3 Prozent  
= 1.200 Euro.

► Gesamte Verwaltungskosten

1.053 Euro  
+ 1.200 Euro  
= 2.253 Euro.

---

⇨ 41. Instandhaltungskosten im Fall 2

► Wohnnutzung

300 Quadratmeter  
× 13,80 Euro  
= 4.140 Euro.

► Gewerbliche Nutzung

Für die Gebäudeart 5.1 wird der volle Wert von 13,80 Euro je Quadratmeter verwendet.

200 Quadratmeter  
× 13,80 Euro  
= 2.760 Euro.

► Gesamte Instandhaltungskosten

4.140 Euro  
+ 2.760 Euro  
= 6.900 Euro.

---

⇨ 42. Mietausfallwagnis im Fall 2

► Wohnnutzung

24.000 Euro  
× 2 Prozent  
= 480 Euro.

► Gewerbliche Nutzung

40.000 Euro  
× 4 Prozent  
= 1.600 Euro.

► Gesamtes Mietausfallwagnis

480 Euro  
+ 1.600 Euro  
= 2.080 Euro.

---

⇨ 43. Gesamte Bewirtschaftungskosten im Fall 2

Verwaltungskosten:

2.253 Euro.

Instandhaltungskosten:

6.900 Euro.

Mietausfallwagnis:

2.080 Euro.

Berechnung:

2.253 Euro  
+ 6.900 Euro  
+ 2.080 Euro  
= 11.233 Euro.

Bewirtschaftungskosten:

11.233 Euro.

---

⇨ 44. Reinertrag im Fall 2

Rohertrag:

64.000 Euro.

Bewirtschaftungskosten:

11.233 Euro.

Berechnung:

64.000 Euro  
./. 11.233 Euro  
= 52.767 Euro.

Reinertrag des Grundstücks:

52.767 Euro.

---

⇨ 45. Bodenwertverzinsung im Fall 2

Das Grundstück ist gemischt genutzt.

Der gewerbliche Anteil beträgt 40 Prozent und damit nicht mehr als 50 Prozent.

Gesetzlicher Liegenschaftszinssatz:

4,5 Prozent.

Berechnung:

200.000 Euro  
× 4,5 Prozent  
= 9.000 Euro.

Bodenwertverzinsung:

9.000 Euro.

---

⇨ 46. Gebäudereinertrag im Fall 2

Reinertrag des Grundstücks:

52.767 Euro.

Bodenwertverzinsung:

9.000 Euro.

Berechnung:

52.767 Euro  
./. 9.000 Euro  
= 43.767 Euro.

Gebäudereinertrag:

43.767 Euro.

---

⇨ 47. Restnutzungsdauer im Fall 2

Gesamtnutzungsdauer:

80 Jahre.

Gebäudealter:

20 Jahre.

Berechnung:

80 - 20 = 60 Jahre.

Restnutzungsdauer:

60 Jahre.

► Korrekturhinweis

Die Angabe von 52 Jahren in der Lehrgangsrechnung ist ein Übertragungsfehler.

Aus einer Gesamtnutzungsdauer von 80 Jahren und einem Gebäudealter von 20 Jahren ergibt sich eine Restnutzungsdauer von 60 Jahren.

---

⇨ 48. Gebäudeertragswert im Fall 2

Liegenschaftszinssatz:

4,5 Prozent.

Restnutzungsdauer:

60 Jahre.

Vervielfältiger laut Anlage 21 BewG:

20,64.

Berechnung:

43.767 Euro  
× 20,64  
= 903.350,88 Euro.

Die Lehrgangslösung führt den Wert mit 903.350 Euro fort.

Gebäudeertragswert nach der Lehrgangsrechnung:

903.350 Euro.

---

⇨ 49. Grundbesitzwert im Fall 2

Bodenwert:

200.000 Euro.

Gebäudeertragswert:

903.350 Euro.

Berechnung:

200.000 Euro  
+ 903.350 Euro  
= 1.103.350 Euro.

► Ergebnis

Der Grundbesitzwert beträgt nach der Lehrgangsrechnung 1.103.350 Euro.

Bei maschineller Berechnung sind zunächst die gesetzlichen Rundungsvorgaben beziehungsweise die Aufgabenstellung zu beachten.

---

⇨ 50. Kompakte Berechnung Fall 2

Bodenwert:

500 Quadratmeter × 400 Euro = 200.000 Euro.

Rohertrag:

40.000 + 24.000 = 64.000 Euro.

Bewirtschaftungskosten Wohnnutzung:

- Verwaltung: 351 × 3 = 1.053 Euro,
- Instandhaltung: 300 × 13,80 = 4.140 Euro,
- Mietausfallwagnis: 24.000 × 2 Prozent = 480 Euro.

Bewirtschaftungskosten Gewerbe:

- Verwaltung: 40.000 × 3 Prozent = 1.200 Euro,
- Instandhaltung: 200 × 13,80 = 2.760 Euro,
- Mietausfallwagnis: 40.000 × 4 Prozent = 1.600 Euro.

Gesamte Bewirtschaftungskosten:

11.233 Euro.

Reinertrag:

64.000 - 11.233 = 52.767 Euro.

Bodenwertverzinsung:

200.000 × 4,5 Prozent = 9.000 Euro.

Gebäudereinertrag:

52.767 - 9.000 = 43.767 Euro.

Restnutzungsdauer:

80 - 20 = 60 Jahre.

Gebäudeertragswert:

43.767 × 20,64 = 903.350,88 Euro.

Grundbesitzwert laut Lehrgangslösung:

200.000 + 903.350 = 1.103.350 Euro.

---

⇨ 51. Vergleich der beiden Fälle

► Fall 1

Grundstücksart:

Mietwohngrundstück.

Wohnanteil:

100 Prozent.

Liegenschaftszinssatz:

3,5 Prozent.

Restnutzungsdauer:

52 Jahre.

Vervielfältiger:

23,80.

Grundbesitzwert:

1.103.329 Euro.

► Fall 2

Grundstücksart:

Gemischt genutztes Grundstück.

Wohnanteil:

60 Prozent.

Gewerblicher Anteil:

40 Prozent.

Liegenschaftszinssatz:

4,5 Prozent.

Restnutzungsdauer:

60 Jahre.

Vervielfältiger:

20,64.

Grundbesitzwert laut Lehrgangslösung:

1.103.350 Euro.

---

⇨ 52. Prüfungsschema für Rechenaufgaben

1. Bewertungsstichtag bestimmen.
2. Grundstücksart nach § 181 BewG bestimmen.
3. Bewertungsverfahren nach § 182 BewG bestimmen.
4. Grundstücksfläche und Bodenrichtwert feststellen.
5. Bodenwert berechnen.
6. Tatsächliche und übliche Mieten feststellen.
7. Prüfen, ob ein Fall des § 186 Abs. 2 BewG vorliegt.
8. Betriebskostenumlagen aus dem Rohertrag entfernen.
9. Jahresrohertrag berechnen.
10. Wohn- und Nichtwohnnutzung trennen.
11. Bewertungsjahr der Bewirtschaftungskosten bestimmen.
12. Verwaltungskosten berechnen.
13. Instandhaltungskosten berechnen.
14. Mietausfallwagnis berechnen.
15. Reinertrag des Grundstücks berechnen.
16. Liegenschaftszinssatz bestimmen.
17. Bodenwertverzinsung berechnen.
18. Gebäudereinertrag berechnen.
19. Gesamtnutzungsdauer aus Anlage 22 bestimmen.
20. Gebäudealter ermitteln.
21. Restnutzungsdauer berechnen.
22. Vervielfältiger aus Anlage 21 ablesen.
23. Gebäudeertragswert berechnen.
24. Bodenwert hinzurechnen.
25. Mindestwert und § 198 BewG prüfen.

---

⇨ 53. Formulierungshilfe Mietwohngrundstück

Das Grundstück dient zu mehr als 80 Prozent Wohnzwecken und ist weder ein Ein- oder Zweifamilienhaus noch Wohnungseigentum.

Es handelt sich daher gemäß § 181 Abs. 1 Nr. 2 in Verbindung mit Abs. 3 BewG um ein Mietwohngrundstück.

Mietwohngrundstücke sind nach § 182 Abs. 3 Nr. 1 BewG im Ertragswertverfahren zu bewerten.

---

⇨ 54. Formulierungshilfe gemischt genutztes Grundstück

Das Grundstück dient zu ... Prozent Wohnzwecken und zu ... Prozent gewerblichen beziehungsweise betrieblichen Zwecken.

Da weder der Wohnanteil noch der gewerbliche Anteil mehr als 80 Prozent beträgt und keine speziellere Grundstücksart vorliegt, handelt es sich gemäß § 181 Abs. 1 Nr. 5 in Verbindung mit Abs. 7 BewG um ein gemischt genutztes Grundstück.

Da sich eine übliche Miete ermitteln lässt, erfolgt die Bewertung gemäß § 182 Abs. 3 Nr. 2 BewG im Ertragswertverfahren.

---

⇨ 55. Formulierungshilfe Rohertrag

Der Rohertrag bestimmt sich nach § 186 Abs. 1 BewG grundsätzlich nach der am Bewertungsstichtag vertraglich vereinbarten Sollmiete für einen Zeitraum von zwölf Monaten.

Die Betriebskostenumlagen sind nicht einzubeziehen.

Der jährliche Rohertrag beträgt daher ... Euro.

---

⇨ 56. Formulierungshilfe 20-Prozent-Regel

Die vereinbarte Miete beträgt ... Euro monatlich.

Die übliche Miete beträgt ... Euro monatlich.

Die Abweichung beträgt ... Euro beziehungsweise ... Prozent der üblichen Miete.

Da die Abweichung nicht mehr als 20 Prozent beträgt, ist die vereinbarte Miete gemäß § 186 Abs. 1 BewG anzusetzen.

Oder:

Da die Abweichung mehr als 20 Prozent beträgt, ist gemäß § 186 Abs. 2 Satz 1 Nr. 2 BewG die übliche Miete anzusetzen.

---

⇨ 57. Formulierungshilfe Bewirtschaftungskosten

Die Bewirtschaftungskosten sind gemäß § 187 BewG in Verbindung mit Anlage 23 BewG zu ermitteln.

Für den Bewertungsstichtag im Jahr ... sind die für dieses Kalenderjahr veröffentlichten indizierten Werte anzuwenden.

Die Bewirtschaftungskosten setzen sich zusammen aus:

- Verwaltungskosten in Höhe von ... Euro,
- Instandhaltungskosten in Höhe von ... Euro,
- Mietausfallwagnis in Höhe von ... Euro.

Die gesamten Bewirtschaftungskosten betragen ... Euro.

---

⇨ 58. Formulierungshilfe Ergebnis

Der Reinertrag des Grundstücks beträgt ... Euro.

Nach Abzug der Bodenwertverzinsung in Höhe von ... Euro verbleibt ein Gebäudereinertrag von ... Euro.

Bei einem Liegenschaftszinssatz von ... Prozent und einer Restnutzungsdauer von ... Jahren beträgt der Vervielfältiger nach Anlage 21 BewG ...

Der Gebäudeertragswert beträgt damit ... Euro.

Zuzüglich des Bodenwerts in Höhe von ... Euro ergibt sich ein Grundbesitzwert von ... Euro.

---

⇨ 59. Typische Fehler

- Betriebskostenumlagen werden fälschlich zum Rohertrag addiert.
- Die tatsächliche Zahlung statt der vertraglichen Sollmiete wird angesetzt.
- Eine am Bewertungsstichtag leerstehende Wohnung wird mit null Euro angesetzt.
- Bei genau 20 Prozent Abweichung wird bereits die übliche Miete verwendet.
- Wohn- und Gewerbenutzung werden bei den Bewirtschaftungskosten nicht getrennt.
- Für Gewerbenutzung wird ebenfalls nur ein Mietausfallwagnis von 2 Prozent angesetzt.
- Die Verwaltungskosten für Gewerbenutzung werden je Einheit statt nach dem Rohertrag berechnet.
- Bewirtschaftungskosten eines falschen Bewertungsjahres werden verwendet.
- Die Bodenwertverzinsung wird nicht abgezogen.
- Der Gebäudereinertrag wird mit dem Bodenwert addiert, bevor der Vervielfältiger angewendet wird.
- Die Gesamtnutzungsdauer und die Restnutzungsdauer werden verwechselt.
- Der Verviältiger wird fälschlich aus Anlage 22 statt aus Anlage 21 entnommen.
- Bei gemischt genutzten Grundstücken wird § 182 Abs. 3 Nr. 1 statt Nr. 2 zitiert.
- Die Grundstücksart wird nicht anhand der Flächenverhältnisse geprüft.
- Der falsche gesetzliche Liegenschaftszinssatz wird verwendet.
- Zwischenergebnisse werden zu früh gerundet.

---

⇨ 60. Zentrale Merksätze

- Der Rohertrag ist grundsätzlich die Jahresnettokaltmiete.
- Betriebskostenumlagen gehören nicht zum Rohertrag.
- Maßgebend sind die Mietverhältnisse am Bewertungsstichtag.
- Bei Selbstnutzung, Leerstand oder unentgeltlicher Überlassung ist die übliche Miete anzusetzen.
- Erst bei einer Abweichung von mehr als 20 Prozent wird die tatsächliche Miete durch die übliche Miete ersetzt.
- Genau 20 Prozent reichen nicht aus.
- Bewirtschaftungskosten müssen zum Bewertungsjahr passen.
- Wohn- und Gewerbenutzung sind getrennt zu berechnen.
- Wohnnutzung hat grundsätzlich 2 Prozent Mietausfallwagnis.
- Gewerbliche Nutzung hat grundsätzlich 4 Prozent Mietausfallwagnis.
- Der Bodenwert wird nicht mit dem Vervielfältiger multipliziert.
- Nur der Gebäudereinertrag wird kapitalisiert.
- Die Gesamtnutzungsdauer ergibt sich aus Anlage 22 BewG.
- Der Vervielfältiger ergibt sich aus Anlage 21 BewG.
- Mietwohngrundstücke haben grundsätzlich einen gesetzlichen Liegenschaftszinssatz von 3,5 Prozent.
- Gemischt genutzte Grundstücke mit bis zu 50 Prozent Gewerbeanteil haben grundsätzlich 4,5 Prozent.
- Der Grundbesitzwert ergibt sich aus Bodenwert plus Gebäudeertragswert.
`
},
{
  id: "erbst-bewertung-bebaute-grundstuecke-181-198-bewg",

  title:
    "Bewertung bebauter Grundstücke nach §§ 181 bis 198 BewG",

  short:
    "Erbschaft- und Schenkungsteuer: Grundstücksarten, Verfahrenszuordnung, Vergleichswertverfahren, Ertragswertverfahren, Feststellung des Grundbesitzwerts und Nachweis eines niedrigeren gemeinen Werts.",

  category: "Erbschaftsteuer / Bewertung",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Bewertung bebauter Grundstücke, Rechtsstand Juli 2026",

  keywords:
    "bewertung bebauter grundstücke|grundbesitzwert|bedarfsbewertung|erbschaftsteuer|schenkungsteuer|§ 151 bewg|§ 176 bewg|§ 177 bewg|§ 179 bewg|§ 180 bewg|§ 181 bewg|§ 182 bewg|§ 183 bewg|§ 184 bewg|§ 185 bewg|§ 186 bewg|§ 187 bewg|§ 188 bewg|§ 198 bewg|grundstücksart|einfamilienhaus|zweifamilienhaus|mietwohngrundstück|wohnungseigentum|teileigentum|geschäftsgrundstück|gemischt genutztes grundstück|sonstiges bebautes grundstück|vergleichswertverfahren|ertragswertverfahren|sachwertverfahren|vergleichspreis|vergleichsfaktor|bodenwert|bodenrichtwert|rohertrag|miete|übliche miete|bewirtschaftungskosten|reinertrag|bodenwertverzinsung|gebäudereinertrag|vervielfältiger|liegenschaftszinssatz|restnutzungsdauer|gebäudeertragswert|mindestwert|niedrigerer gemeiner wert|verkehrswertgutachten|gutachterausschuss|bewertungsstichtag|feststellungsbescheid",

  references: [
    "§ 9 BewG",
    "§ 151 Abs. 1 und 2 BewG",
    "§ 157 BewG",
    "§ 176 BewG",
    "§ 177 BewG",
    "§ 179 BewG",
    "§ 180 BewG",
    "§ 181 BewG",
    "§ 182 BewG",
    "§ 183 BewG",
    "§ 184 BewG",
    "§ 185 BewG",
    "§ 186 BewG",
    "§ 187 BewG",
    "§ 188 BewG",
    "§§ 189 bis 191 BewG",
    "§ 198 BewG",
    "Anlage 21 BewG",
    "Anlage 22 BewG",
    "Anlage 23 BewG",
    "R B 181.1 ErbStR",
    "R B 182 ErbStR",
    "R B 183 ErbStR",
    "R B 184 ErbStR",
    "R B 185 ErbStR",
    "R B 186 ErbStR",
    "R B 187 ErbStR",
    "R B 188 ErbStR",
    "R B 198 ErbStR"
  ],

  body: `
⇨ Bewertung bebauter Grundstücke nach §§ 181 bis 198 BewG

► 1. Ziel der Bedarfsbewertung

Für Zwecke der Erbschaft- und Schenkungsteuer wird der Grundbesitzwert eines Grundstücks gesondert festgestellt.

Ausgangspunkt ist grundsätzlich der gemeine Wert.

Der gemeine Wert entspricht dem Preis, der im gewöhnlichen Geschäftsverkehr bei einer Veräußerung zu erzielen wäre.

Dabei sind

- die Beschaffenheit des Grundstücks,
- die tatsächliche Nutzung,
- die wertbeeinflussenden Merkmale und
- die Verhältnisse am Bewertungsstichtag

zu berücksichtigen.

Ungewöhnliche oder persönliche Verhältnisse bleiben grundsätzlich außer Betracht.

---

⇨ 2. Bewertungsstichtag

Maßgebend sind die tatsächlichen und rechtlichen Verhältnisse am Bewertungsstichtag.

Bei einer Erbschaft ist dies grundsätzlich der Todestag des Erblassers.

Bei einer Schenkung ist grundsätzlich der Zeitpunkt der Ausführung der Schenkung maßgebend.

Insbesondere sind stichtagsbezogen festzustellen:

- Grundstücksart,
- tatsächliche Nutzung,
- Wohnfläche,
- Nutzfläche,
- Vermietungssituation,
- vereinbarte Miete,
- Gebäudealter,
- Restnutzungsdauer,
- Bodenrichtwert,
- Liegenschaftszinssatz.

► Merksatz

**Bewertet wird nicht nach der späteren Nutzung, sondern nach den Verhältnissen am Bewertungsstichtag.**

---

⇨ 3. Gesonderte Feststellung nach § 151 BewG

Der Grundbesitzwert wird grundsätzlich durch einen gesonderten Feststellungsbescheid festgestellt.

Die Feststellung dient als Grundlagenbescheid für die Erbschaft- oder Schenkungsteuer.

Der Feststellungsbescheid enthält insbesondere:

1. den Wert der wirtschaftlichen Einheit,
2. die Art der wirtschaftlichen Einheit beziehungsweise die Grundstücksart,
3. die Zurechnung,
4. bei mehreren Beteiligten die Höhe der jeweiligen Anteile.

► Beispiel

Ein Grundstück gehört dem Erblasser zu 60 Prozent und seiner Ehefrau zu 40 Prozent.

Für den Erwerb von Todes wegen ist grundsätzlich nur der dem Erblasser zuzurechnende Anteil von 60 Prozent festzustellen und dem Erwerber zuzurechnen.

► Wichtig

Einwendungen gegen

- Grundstücksart,
- Bewertungsverfahren,
- Grundbesitzwert oder
- Zurechnung

müssen grundsätzlich gegen den Feststellungsbescheid erhoben werden.

Der spätere Erbschaftsteuerbescheid übernimmt diese Feststellungen als Grundlagen.

---

⇨ 4. Begriff des bebauten Grundstücks

Ein Grundstück gilt grundsätzlich als bebaut, wenn sich darauf benutzbare Gebäude befinden.

Entscheidend ist nicht allein, ob tatsächlich eine Nutzung erfolgt.

Ein leerstehendes, aber weiterhin benutzbares Gebäude kann zu einem bebauten Grundstück gehören.

Ist ein Gebäude auf Dauer nicht mehr benutzbar, kann das Grundstück bewertungsrechtlich als unbebaut gelten.

---

⇨ 5. Grundstücksarten nach § 181 BewG

Bei bebauten Grundstücken sind sechs Grundstücksarten zu unterscheiden:

1. Ein- und Zweifamilienhäuser,
2. Mietwohngrundstücke,
3. Wohnungs- und Teileigentum,
4. Geschäftsgrundstücke,
5. gemischt genutzte Grundstücke,
6. sonstige bebaute Grundstücke.

Die Grundstücksart entscheidet darüber, welches Bewertungsverfahren anzuwenden ist.

---

⇨ 6. Ein- und Zweifamilienhäuser

Ein- und Zweifamilienhäuser sind Wohngrundstücke,

- die bis zu zwei Wohnungen enthalten und
- die kein Wohnungseigentum darstellen.

Eine Mitbenutzung für betriebliche, berufliche oder öffentliche Zwecke ist unschädlich, wenn

- sie weniger als 50 Prozent der Wohn- und Nutzfläche umfasst und
- die Eigenart als Ein- oder Zweifamilienhaus nicht wesentlich beeinträchtigt wird.

► Beispiel

Ein Gebäude enthält

- eine Wohnung mit 140 Quadratmetern und
- eine Steuerberaterkanzlei mit 50 Quadratmetern.

Die betriebliche Nutzung beträgt weniger als 50 Prozent der Gesamtfläche.

Bleibt die Eigenart als Wohnhaus erhalten, kann ein Einfamilienhaus vorliegen.

► Bewertungsverfahren

Ein- und Zweifamilienhäuser werden grundsätzlich im Vergleichswertverfahren bewertet.

Liegt kein geeigneter Vergleichswert oder Vergleichsfaktor vor, erfolgt die Bewertung im Sachwertverfahren.

---

⇨ 7. Mietwohngrundstücke

Mietwohngrundstücke sind Grundstücke,

- die zu mehr als 80 Prozent Wohnzwecken dienen und
- die weder Ein- oder Zweifamilienhäuser noch Wohnungseigentum sind.

Maßgebend ist das Verhältnis der Wohnfläche zur gesamten Wohn- und Nutzfläche.

► Beispiel

Ein Mehrfamilienhaus verfügt über

- 900 Quadratmeter Wohnfläche und
- 100 Quadratmeter gewerbliche Nutzfläche.

Der Wohnanteil beträgt 90 Prozent.

Das Grundstück ist grundsätzlich ein Mietwohngrundstück.

► Bewertungsverfahren

Mietwohngrundstücke werden zwingend im Ertragswertverfahren bewertet.

Auch wenn keine tatsächliche Miete vereinbart ist, bleibt das Ertragswertverfahren grundsätzlich maßgebend.

In diesem Fall muss eine übliche beziehungsweise marktübliche Miete ermittelt oder geschätzt werden.

---

⇨ 8. Wohnungseigentum

Wohnungseigentum ist das Sondereigentum an einer Wohnung in Verbindung mit dem Miteigentumsanteil am gemeinschaftlichen Eigentum.

Hierzu gehören beispielsweise:

- die Eigentumswohnung als Sondereigentum,
- der Miteigentumsanteil am Grundstück,
- gemeinschaftliche Gebäudeteile,
- gemeinschaftliche Anlagen.

► Bewertungsverfahren

Wohnungseigentum wird grundsätzlich im Vergleichswertverfahren bewertet.

Ist mangels geeigneter Daten kein Vergleichswertverfahren möglich, kommt das Sachwertverfahren zur Anwendung.

---

⇨ 9. Teileigentum

Teileigentum ist das Sondereigentum an nicht zu Wohnzwecken dienenden Räumen eines Gebäudes in Verbindung mit dem Miteigentumsanteil am gemeinschaftlichen Eigentum.

Beispiele:

- einzelne Büroeinheit,
- Ladenlokal,
- Praxis,
- gewerblich genutzte Einheit,
- separat gebildetes Teileigentum an sonstigen Räumen.

► Bewertungsverfahren

Teileigentum wird grundsätzlich im Vergleichswertverfahren bewertet.

Liegt kein geeigneter Vergleichswert vor, erfolgt die Bewertung im Sachwertverfahren.

---

⇨ 10. Geschäftsgrundstücke

Geschäftsgrundstücke sind Grundstücke,

- die zu mehr als 80 Prozent eigenen oder fremden betrieblichen oder öffentlichen Zwecken dienen und
- die kein Teileigentum sind.

Beispiele:

- Bürogebäude,
- Ärztehaus,
- Einzelhandelsgebäude,
- Hotelgebäude,
- Verwaltungsgebäude,
- betrieblich vermietete Gewerbeimmobilie.

► Bewertungsverfahren

Kann für das Geschäftsgrundstück eine übliche Miete am örtlichen Grundstücksmarkt ermittelt werden, ist das Ertragswertverfahren anzuwenden.

Kann keine übliche Miete ermittelt werden, ist das Sachwertverfahren anzuwenden.

---

⇨ 11. Gemischt genutzte Grundstücke

Gemischt genutzte Grundstücke dienen

- teilweise Wohnzwecken und
- teilweise betrieblichen, beruflichen oder öffentlichen Zwecken.

Sie dürfen keiner der spezielleren Grundstücksarten zuzuordnen sein.

Insbesondere handelt es sich nicht um ein gemischt genutztes Grundstück, wenn bereits

- ein Ein- oder Zweifamilienhaus,
- ein Mietwohngrundstück,
- Wohnungseigentum,
- Teileigentum oder
- ein Geschäftsgrundstück

vorliegt.

► Bewertungsverfahren

Kann eine übliche Miete ermittelt werden, ist das Ertragswertverfahren anzuwenden.

Kann keine übliche Miete ermittelt werden, ist das Sachwertverfahren anzuwenden.

---

⇨ 12. Sonstige bebaute Grundstücke

Sonstige bebaute Grundstücke sind Grundstücke, die unter keine andere Grundstücksart des § 181 BewG fallen.

Beispiele können sein:

- besondere Industriegebäude,
- Sportanlagen,
- spezielle Veranstaltungsgebäude,
- Schulen,
- besondere öffentliche Gebäude,
- Grundstücke mit ungewöhnlicher Bebauung.

► Bewertungsverfahren

Sonstige bebaute Grundstücke werden im Sachwertverfahren bewertet.

---

⇨ 13. Abgrenzung nach Wohn- und Nutzfläche

Die Abgrenzung der Grundstücksarten erfolgt regelmäßig nach dem Verhältnis von

- Wohnfläche und
- Nutzfläche.

Die Flächen sind nach den jeweils maßgebenden gesetzlichen Grundsätzen zu bestimmen.

► Grundformel

Wohnanteil:

Wohnfläche / gesamte Wohn- und Nutzfläche × 100

Betrieblicher beziehungsweise öffentlicher Anteil:

betriebliche oder öffentliche Nutzfläche / gesamte Wohn- und Nutzfläche × 100

► Beispiel

Wohnfläche:

600 Quadratmeter.

Gewerbliche Nutzfläche:

200 Quadratmeter.

Gesamtfläche:

800 Quadratmeter.

Wohnanteil:

600 / 800 × 100 = 75 Prozent.

Das Grundstück ist damit weder ein Mietwohngrundstück noch ein Geschäftsgrundstück.

Es kann ein gemischt genutztes Grundstück vorliegen.

---

⇨ 14. Verfahrenszuordnung nach § 182 BewG

Das Bewertungsgesetz kennt für bebaute Grundstücke drei Bewertungsverfahren:

1. Vergleichswertverfahren,
2. Ertragswertverfahren,
3. Sachwertverfahren.

Ein freies Wahlrecht des Steuerpflichtigen besteht grundsätzlich nicht.

Das anzuwendende Verfahren ergibt sich aus der Grundstücksart und der Verfügbarkeit der erforderlichen Marktdaten.

---

⇨ 15. Übersicht der Bewertungsverfahren

► Vergleichswertverfahren

Grundsätzlich für:

- Wohnungseigentum,
- Teileigentum,
- Einfamilienhäuser,
- Zweifamilienhäuser.

Voraussetzung:

Es liegen geeignete Vergleichspreise oder Vergleichsfaktoren vor.

► Ertragswertverfahren

Zwingend für:

- Mietwohngrundstücke.

Außerdem für:

- Geschäftsgrundstücke und
- gemischt genutzte Grundstücke,

wenn eine übliche Miete ermittelt werden kann.

► Sachwertverfahren

Anzuwenden für:

- Wohnungseigentum, Teileigentum sowie Ein- und Zweifamilienhäuser, wenn kein Vergleichswert vorliegt,
- Geschäftsgrundstücke und gemischt genutzte Grundstücke, wenn keine übliche Miete ermittelt werden kann,
- sonstige bebaute Grundstücke.

► Merksatz

**Vergleich möglich: Vergleichswert.**

**Ertrag marktüblich bestimmbar: Ertragswert.**

**Weder Vergleich noch übliche Miete: Sachwert.**

---

⇨ 16. Prüfungsschema Grundstücksart

1. Liegt ein bebautes Grundstück vor?
2. Enthält das Grundstück höchstens zwei Wohnungen?
3. Liegt Wohnungseigentum oder Teileigentum vor?
4. Wie hoch ist der Wohnanteil?
5. Wie hoch ist der betriebliche oder öffentliche Anteil?
6. Wird die 80-Prozent-Grenze überschritten?
7. Ist eine speziellere Grundstücksart einschlägig?
8. Welche tatsächliche Nutzung besteht am Bewertungsstichtag?
9. Welches Bewertungsverfahren folgt aus § 182 BewG?

---

⇨ 17. Vergleichswertverfahren nach § 183 BewG

Beim Vergleichswertverfahren wird der Wert des Grundstücks aus tatsächlich beobachteten Grundstücksverkäufen abgeleitet.

Heranzuziehen sind Kaufpreise von Grundstücken, die hinsichtlich ihrer wertbeeinflussenden Merkmale mit dem Bewertungsobjekt hinreichend übereinstimmen.

Wertbeeinflussende Merkmale können insbesondere sein:

- Lage,
- Grundstücksgröße,
- Wohnfläche,
- Nutzfläche,
- Gebäudeart,
- Baujahr,
- Ausstattungsstandard,
- Gebäudezustand,
- Modernisierungsgrad,
- Grundstückszuschnitt,
- rechtliche Belastungen.

---

⇨ 18. Vergleichspreise

Vorrangig sind die von den zuständigen Gutachterausschüssen ermittelten und mitgeteilten Vergleichspreise zu verwenden.

Vergleichsgrundstücke müssen nicht vollständig identisch sein.

Sie müssen jedoch hinsichtlich der wesentlichen wertbeeinflussenden Merkmale hinreichend vergleichbar sein.

Erhebliche Abweichungen können durch geeignete Zu- oder Abschläge berücksichtigt werden, sofern dies nach den Marktdaten zulässig und nachvollziehbar ist.

► Grundformel

Angepasster Vergleichspreis  
× maßgebende Bezugsgröße  
= Vergleichswert des Grundstücks

---

⇨ 19. Vergleichsfaktoren

Anstelle einzelner Vergleichspreise können Vergleichsfaktoren verwendet werden.

Mögliche Bezugseinheiten sind beispielsweise:

- Wohnfläche,
- Nutzfläche,
- Grundstücksfläche
`
},
{
  id: "ust-reverse-charge-steuersatz-bmg-vorsteuerabzug",

  title:
    "Reverse Charge, Steuersatz, Bemessungsgrundlage und Vorsteuerabzug",

  short:
    "Umsatzsteuerliche Prüfung von § 13b UStG, Steuersätzen, Bemessungsgrundlage, Unternehmenszuordnung, Vorsteuerabzug, Ausschlussumsätzen und Vorsteueraufteilung.",

  category: "Umsatzsteuer",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Umsatzsteuer, Rechtsstand Juli 2026",

  keywords:
    "§ 13b ustg|reverse charge|steuerschuldnerschaft leistungsempfänger|ausländischer unternehmer|bauleistung|gebäudereinigung|grundstücksumsatz|sicherungsübereignung|schrott|gold|mobilfunkgeräte|tablet computer|spielekonsole|metalle|telekommunikation|steuersatz|19 prozent|7 prozent|restaurant|verpflegungsdienstleistung|speisen|getränke|anlage 2 ustg|personenbeförderung|beherbergung|bemessungsgrundlage|§ 10 ustg|entgelt|brutto netto|durchlaufender posten|entgelt von dritter seite|tausch|tauschähnlicher umsatz|baraufgabe|vorsteuerabzug|§ 15 ustg|unternehmereigenschaft|gesetzlich geschuldete steuer|leistungsbezug für das unternehmen|ordnungsgemäße rechnung|zuordnung unternehmensvermögen|10 prozent grenze|gemischte nutzung|ausschlussumsätze|rückausschluss|vorsteueraufteilung|umsatzschlüssel|flächenschlüssel|einfuhrumsatzsteuer|innergemeinschaftlicher erwerb",

  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 2 UStG",
    "§ 3 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 3g UStG",
    "§ 4 UStG",
    "§ 9 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13b UStG",
    "§ 14 UStG",
    "§ 14a UStG",
    "§ 14c UStG",
    "§ 15 Abs. 1 UStG",
    "§ 15 Abs. 1a UStG",
    "§ 15 Abs. 1b UStG",
    "§ 15 Abs. 2 UStG",
    "§ 15 Abs. 3 UStG",
    "§ 15 Abs. 4 UStG",
    "§ 15a UStG",
    "§ 16 Abs. 6 UStG",
    "§ 17 UStG",
    "§ 18 Abs. 4a UStG",
    "§ 19 UStG",
    "Anlage 2 UStG",
    "Anlage 3 UStG",
    "Anlage 4 UStG",
    "Abschn. 10.1 UStAE",
    "Abschn. 12 UStAE",
    "Abschn. 13b.1 bis 13b.15 UStAE",
    "Abschn. 15.2 UStAE",
    "Abschn. 15.12 UStAE",
    "Abschn. 15.15 UStAE",
    "Abschn. 15.16 UStAE",
    "Abschn. 15.17 UStAE",
    "Abschn. 15.23 UStAE"
  ],

  body: `
⇨ Reverse Charge, Steuersatz, Bemessungsgrundlage und Vorsteuerabzug

⇨ Teil A: Steuerschuldnerschaft des Leistungsempfängers nach § 13b UStG

► 1. Grundprinzip

Grundsätzlich schuldet der leistende Unternehmer die Umsatzsteuer.

§ 13b UStG durchbricht diesen Grundsatz bei bestimmten steuerpflichtigen Umsätzen.

In diesen Fällen schuldet nicht der leistende Unternehmer, sondern der Leistungsempfänger die Umsatzsteuer.

Dieses Verfahren wird bezeichnet als:

- Reverse Charge,
- Umkehr der Steuerschuldnerschaft,
- Steuerschuldnerschaft des Leistungsempfängers.

► Rechtsfolgen

Der leistende Unternehmer

- stellt grundsätzlich eine Nettorechnung aus,
- weist keine Umsatzsteuer gesondert aus,
- nimmt den Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ auf.

Der Leistungsempfänger

- berechnet die Umsatzsteuer selbst,
- meldet sie in seiner Umsatzsteuer-Voranmeldung an,
- kann sie bei Vorliegen der Voraussetzungen gleichzeitig als Vorsteuer abziehen.

► Merksatz

§ 13b UStG führt nicht zu einer Steuerbefreiung.

Es handelt sich weiterhin um einen steuerpflichtigen Umsatz.

Lediglich die Person des Steuerschuldners ändert sich.

---

⇨ 2. Grundprüfung des § 13b UStG

Vor Anwendung des Reverse-Charge-Verfahrens ist zu prüfen:

1. Liegt eine Lieferung oder sonstige Leistung vor?
2. Ist der Umsatz im Inland steuerbar?
3. Ist der Umsatz steuerpflichtig?
4. Ist der Umsatz in § 13b Abs. 1 oder Abs. 2 UStG genannt?
5. Erfüllt der Leistungsempfänger die Voraussetzungen des § 13b Abs. 5 UStG?
6. Liegt eine gesetzliche Ausnahme vor?
7. Wann entsteht die Steuer?
8. Besteht beim Leistungsempfänger ein Vorsteuerabzug?

► Wichtig

§ 13b UStG greift grundsätzlich nur bei im Inland steuerpflichtigen Umsätzen.

Ist der Umsatz

- nicht im Inland steuerbar oder
- im Inland steuerfrei,

entsteht keine deutsche Umsatzsteuer nach § 13b UStG.

---

⇨ 3. Sonstige Leistungen aus dem übrigen Gemeinschaftsgebiet

Nach § 13b Abs. 1 UStG schuldet der Leistungsempfänger die Steuer für eine sonstige Leistung, wenn

1. der leistende Unternehmer im übrigen Gemeinschaftsgebiet ansässig ist,
2. der Leistungsort nach § 3a Abs. 2 UStG im Inland liegt und
3. die Leistung im Inland steuerpflichtig ist.

► Typische Fälle

- Beratungsleistungen,
- Werbeleistungen,
- Programmierleistungen,
- Softwaredienstleistungen,
- Lizenzleistungen,
- Übersetzungsleistungen,
- Rechts- und Steuerberatung,
- digitale B2B-Dienstleistungen.

► Beispiel

Ein französischer Unternehmer erbringt eine Beratungsleistung an einen deutschen Unternehmer.

Der deutsche Unternehmer bezieht die Leistung für sein Unternehmen.

Der Leistungsort liegt nach § 3a Abs. 2 UStG in Deutschland.

Die Leistung ist in Deutschland steuerpflichtig.

Der deutsche Leistungsempfänger schuldet die Umsatzsteuer nach § 13b Abs. 1 und Abs. 5 UStG.

---

⇨ 4. Entstehung der Steuer nach § 13b Abs. 1 UStG

Bei Leistungen nach § 13b Abs. 1 UStG entsteht die Steuer mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt wurde.

Auf den Zeitpunkt der Rechnungsausstellung kommt es grundsätzlich nicht an.

► Beispiel

Die Beratungsleistung wird am 15. März ausgeführt.

Die Rechnung wird erst am 10. April ausgestellt.

Die Umsatzsteuer entsteht mit Ablauf des Voranmeldungszeitraums März.

► Merksatz

§ 13b Abs. 1 UStG:

**Leistungsausführung bestimmt den Voranmeldungszeitraum.**

---

⇨ 5. Umsätze nach § 13b Abs. 2 Nr. 1 UStG

§ 13b Abs. 2 Nr. 1 UStG erfasst insbesondere

- Werklieferungen und
- sonstige Leistungen,

die von einem im Ausland ansässigen Unternehmer im Inland ausgeführt werden und nicht bereits unter § 13b Abs. 1 UStG fallen.

Nicht erfasst wird grundsätzlich eine reine Lieferung eines Gegenstands, soweit kein anderer Tatbestand des § 13b UStG eingreift.

► Typische Fälle

- Montage einer Anlage durch einen ausländischen Unternehmer,
- Errichtung eines Messestands,
- Reparaturarbeiten an einem inländischen Grundstück,
- Werkleistung an einem im Inland befindlichen Gegenstand,
- Grundstücksleistung eines ausländischen Unternehmers.

---

⇨ 6. Im Ausland ansässiger Unternehmer

Ein Unternehmer ist grundsätzlich im Ausland ansässig, wenn er im Inland weder

- seinen Sitz,
- seine Geschäftsleitung,
- eine an der Leistung beteiligte Betriebsstätte,
- seinen Wohnsitz noch
- seinen gewöhnlichen Aufenthalt

hat.

Eine inländische Betriebsstätte verhindert die Anwendung des § 13b UStG nur, wenn diese Betriebsstätte an der konkreten Leistung beteiligt ist.

► Besonderheit Grundstücksvermietung

Besitzt ein ausländischer Unternehmer lediglich ein im Inland gelegenes Grundstück und vermietet dieses steuerpflichtig, wird er allein durch den Grundstücksbesitz grundsätzlich nicht zu einem im Inland ansässigen Unternehmer.

---

⇨ 7. Sicherungsübereignete Gegenstände

§ 13b Abs. 2 Nr. 2 UStG erfasst die Lieferung eines sicherungsübereigneten Gegenstands

- durch den Sicherungsgeber
- an den Sicherungsnehmer
- außerhalb eines Insolvenzverfahrens.

► Wichtig

Die bloße Sicherungsübereignung ist regelmäßig noch keine Lieferung.

Die Lieferung kann insbesondere bei der Verwertung des Sicherungsguts entstehen.

Wird das Sicherungsgut durch den Sicherungsnehmer an einen Dritten weiterverkauft, kann ein Doppelumsatz vorliegen:

1. Lieferung des Sicherungsgebers an den Sicherungsnehmer,
2. Lieferung des Sicherungsnehmers an den Dritten.

Für die erste Lieferung kann § 13b Abs. 2 Nr. 2 UStG gelten.

---

⇨ 8. Grundstücksumsätze

§ 13b Abs. 2 Nr. 3 UStG erfasst steuerpflichtige Umsätze, die unter das Grunderwerbsteuergesetz fallen.

Grundstücksveräußerungen sind grundsätzlich nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Erst wenn wirksam nach § 9 Abs. 1 und Abs. 3 UStG zur Steuerpflicht optiert wurde, kann § 13b Abs. 2 Nr. 3 UStG eingreifen.

► Rechtsfolge

Bei wirksamer Option schuldet grundsätzlich der Erwerber die Umsatzsteuer.

Der Verkäufer stellt regelmäßig eine Nettorechnung aus.

► Merksatz

Grundstücksverkauf:

**§ 4 Nr. 9 Buchst. a → § 9 prüfen → bei Option § 13b prüfen.**

---

⇨ 9. Bauleistungen

§ 13b Abs. 2 Nr. 4 UStG erfasst Bauleistungen.

Bauleistungen sind insbesondere Werklieferungen und sonstige Leistungen, die sich unmittelbar auf die Substanz eines Bauwerks auswirken.

Hierzu gehören insbesondere Leistungen zur

- Herstellung,
- Instandsetzung,
- Instandhaltung,
- Änderung oder
- Beseitigung

eines Bauwerks.

► Regelmäßig keine Bauleistungen

Nicht erfasst werden insbesondere reine

- Planungsleistungen,
- Architektenleistungen,
- Statikerleistungen,
- Bauüberwachungsleistungen,
- Gutachterleistungen.

► Leistungsempfänger

Der Leistungsempfänger schuldet die Steuer nur, wenn er selbst nachhaltig Bauleistungen erbringt.

Als Nachweis dient regelmäßig eine gültige Bescheinigung des Finanzamts nach dem Vordruck USt 1 TG.

► Wichtig

Die konkrete empfangene Bauleistung muss nicht zwingend für einen eigenen Bauauftrag weiterverwendet werden.

Entscheidend ist grundsätzlich die nachhaltige Tätigkeit des Leistungsempfängers als Bauleistender.

---

⇨ 10. Gebäudereinigungsleistungen

§ 13b Abs. 2 Nr. 8 UStG erfasst die Reinigung von Gebäuden und Gebäudeteilen.

Hierzu können gehören:

- Fassadenreinigung,
- Fensterreinigung,
- Reinigung von Büroräumen,
- Reinigung von Treppenhäusern,
- Gebäudereinigung einschließlich des zugehörigen Inventars.

Der Leistungsempfänger schuldet die Steuer nur, wenn er selbst nachhaltig Gebäudereinigungsleistungen erbringt.

Als Nachweis kann ebenfalls eine entsprechende Bescheinigung des Finanzamts verwendet werden.

---

⇨ 11. Weitere Umsätze nach § 13b Abs. 2 UStG

§ 13b Abs. 2 UStG erfasst außerdem insbesondere:

► Nr. 5

Bestimmte Lieferungen von

- Gas,
- Elektrizität,
- Wärme oder
- Kälte.

Die genauen Voraussetzungen hängen insbesondere von der Ansässigkeit und der Wiederverkäufereigenschaft der Beteiligten ab.

► Nr. 6

Übertragung bestimmter Emissionsberechtigungen und Emissionszertifikate.

► Nr. 7

Lieferungen der in Anlage 3 UStG bezeichneten Gegenstände.

Hierzu gehören insbesondere bestimmte

- Abfälle,
- Schrotte,
- Metallabfälle,
- Kunststoffabfälle,
- Glasabfälle.

► Nr. 8

Gebäudereinigungsleistungen an einen nachhaltig tätigen Gebäudereiniger.

► Nr. 9

Bestimmte Lieferungen von Gold.

► Nr. 10

Lieferungen von

- Mobilfunkgeräten,
- Tablet-Computern,
- Spielekonsolen,
- bestimmten integrierten Schaltkreisen,

wenn die gesetzliche Entgeltgrenze von mindestens 5.000 Euro innerhalb eines wirtschaftlichen Vorgangs erreicht wird.

Nachträgliche Entgeltminderungen bleiben für die Prüfung der Grenze grundsätzlich unberücksichtigt.

► Nr. 11

Lieferungen der in Anlage 4 UStG bezeichneten Metalle, wenn die gesetzliche Entgeltgrenze von mindestens 5.000 Euro erreicht wird.

► Nr. 12

Bestimmte Telekommunikationsleistungen, insbesondere wenn der Leistungsempfänger als Wiederverkäufer der Telekommunikationsleistungen anzusehen ist.

---

⇨ 12. Entstehung der Steuer bei § 13b Abs. 2 UStG

In den Fällen des § 13b Abs. 2 UStG entsteht die Steuer grundsätzlich

1. mit Ausstellung der Rechnung,
2. spätestens jedoch mit Ablauf des Kalendermonats, der auf die Ausführung der Leistung folgt.

► Beispiel

Eine Bauleistung wird am 18. März ausgeführt.

⇶  Rechnung am 25. März

Die Steuer entsteht im März.

⇶  Rechnung am 15. April

Die Steuer entsteht im April.

⇶  Rechnung erst im Juni

Die Steuer entsteht spätestens mit Ablauf des Monats April.

► Merksatz

§ 13b Abs. 2 UStG:

**Rechnung, spätestens Folgemonat.**

---

⇨ 13. Teilleistungen und Anzahlungen

Teilleistungen sind auch im Rahmen des § 13b UStG möglich.

Eine Teilleistung setzt grundsätzlich voraus:

- wirtschaftliche Teilbarkeit der Gesamtleistung,
- gesonderte Vereinbarung,
- gesonderte Abrechnung,
- gesonderte Ausführung.

Bei Anzahlungen kann die Steuer bereits bei Vereinnahmung beziehungsweise Zahlung des Entgelts entstehen.

Eine bloße Vorausrechnung ohne Zahlung löst grundsätzlich noch keine Anzahlungsbesteuerung aus.

---

⇨ 14. Rechnung bei Reverse Charge

Die Rechnung muss grundsätzlich die allgemeinen Pflichtangaben der §§ 14 und 14a UStG enthalten.

Anstelle eines gesonderten Umsatzsteuerausweises ist der Hinweis aufzunehmen:

**Steuerschuldnerschaft des Leistungsempfängers**

Alternativ kann im internationalen Geschäftsverkehr beispielsweise angegeben werden:

**Reverse Charge**

► Wichtig

Der Hinweis ist eine Rechnungspflicht.

Das Fehlen des Hinweises verhindert die gesetzlich eintretende Steuerschuldnerschaft des Leistungsempfängers jedoch grundsätzlich nicht.

---

⇨ 15. Unrichtiger Umsatzsteuerausweis

Weist der leistende Unternehmer trotz Anwendung des § 13b UStG Umsatzsteuer gesondert aus, kann er diese nach § 14c UStG schulden.

Der Leistungsempfänger schuldet gleichzeitig weiterhin die Steuer nach § 13b UStG.

Die offen ausgewiesene Steuer ist beim Leistungsempfänger grundsätzlich keine gesetzlich geschuldete Steuer und daher nicht als Vorsteuer abziehbar.

► Erforderliche Korrektur

- Rechnung durch den Aussteller berichtigen,
- zu Unrecht berechnete Umsatzsteuer zurückzahlen,
- § 13b-Umsatz zutreffend erklären.

---

⇨ 16. Kleinunternehmer und § 13b UStG

Auch ein Kleinunternehmer kann als Leistungsempfänger Steuerschuldner nach § 13b UStG werden.

Die Kleinunternehmerregelung schützt nicht vor der Steuerschuld aus empfangenen Reverse-Charge-Leistungen.

Der Kleinunternehmer muss die Umsatzsteuer anmelden und abführen.

Mangels allgemeiner Vorsteuerabzugsberechtigung kann er die Steuer regelmäßig nicht gleichzeitig als Vorsteuer abziehen.

► Leistender Kleinunternehmer

Wird die Leistung vom leistenden Unternehmer wirksam nach der Kleinunternehmerregelung steuerfrei ausgeführt, kommt grundsätzlich keine Steuerschuldumkehr nach § 13b UStG in Betracht.

---

⇨ 17. Bezug für den nichtunternehmerischen Bereich

Die Steuerschuldnerschaft kann unter den gesetzlichen Voraussetzungen auch eintreten, wenn der Unternehmer die Leistung für seinen nichtunternehmerischen oder privaten Bereich bezieht.

► Beispiel

Ein deutscher Einzelunternehmer lässt sein privates Einfamilienhaus durch einen ausländischen Unternehmer renovieren.

Die Bauleistung ist in Deutschland steuerpflichtig.

Der deutsche Unternehmer kann nach § 13b UStG Steuerschuldner werden, obwohl die Leistung sein privates Gebäude betrifft.

Ein Vorsteuerabzug besteht wegen der privaten Verwendung jedoch nicht.

► Besonderheit

Für bestimmte Leistungen und für Leistungen an juristische Personen des öffentlichen Rechts bestehen gesetzliche Sonderregelungen und Ausnahmen.

---

⇨ 18. Vorsteuerabzug aus Reverse-Charge-Umsätzen

Der Leistungsempfänger kann die von ihm nach § 13b UStG geschuldete Steuer nach § 15 Abs. 1 Satz 1 Nr. 4 UStG als Vorsteuer abziehen, wenn

- die Leistung für sein Unternehmen ausgeführt wurde,
- kein Ausschluss nach § 15 Abs. 2 UStG vorliegt,
- kein sonstiges Abzugsverbot eingreift.

Eine Rechnung mit gesondertem Umsatzsteuerausweis ist für diesen Vorsteuerabzug nicht erforderlich.

► Wichtig

Steuerschuld und Vorsteuerabzug sind getrennt zu prüfen.

Ein Unternehmer kann daher

- die Steuer nach § 13b UStG schulden,
- aber nicht zum Vorsteuerabzug berechtigt sein.

---

⇨ 19. Beispiel: Arzt bezieht Beratungsleistung

Ein in Deutschland tätiger Arzt bezieht eine Beratungsleistung von einem französischen Unternehmer.

Der Arzt ist Unternehmer und der Leistungsort liegt nach § 3a Abs. 2 UStG in Deutschland.

Der Arzt schuldet die Umsatzsteuer nach § 13b Abs. 1 und Abs. 5 UStG.

Verwendet er die Beratungsleistung ausschließlich für steuerfreie Heilbehandlungen, ist die Steuer nach § 15 Abs. 2 UStG grundsätzlich nicht als Vorsteuer abziehbar.

---

⇨ Teil B: Steuersätze nach § 12 UStG

⇨ 20. Prüfungsreihenfolge

► Schritt 1

Prüfen, ob ein ermäßigter Steuersatz nach § 12 Abs. 2 oder einer Sondervorschrift anzuwenden ist.

► Schritt 2

Ist keine Ermäßigung einschlägig, gilt der Regelsteuersatz nach § 12 Abs. 1 UStG.

► Merksatz

**Zuerst 7 Prozent prüfen, sonst 19 Prozent.**

---

⇨ 21. Regelsteuersatz

Der Regelsteuersatz beträgt 19 Prozent der Bemessungsgrundlage.

Er gilt für alle steuerpflichtigen Umsätze, für die keine besondere Steuerermäßigung vorgesehen ist.

Typische Beispiele:

- Beratungsleistungen,
- Rechtsanwaltsleistungen,
- Steuerberatungsleistungen,
- Vermietung von Betriebsvorrichtungen,
- Getränke in der Gastronomie,
- Lieferung von technischen Geräten,
- Dienstleistungen ohne besondere Begünstigung.

---

⇨ 22. Ermäßigter Steuersatz

Der ermäßigte Steuersatz beträgt grundsätzlich 7 Prozent.

Er gilt nur für die ausdrücklich im Gesetz genannten Umsätze.

Die Begünstigungen sind grundsätzlich eng auszulegen.

---

⇨ 23. Gegenstände der Anlage 2 UStG

§ 12 Abs. 2 Nr. 1 UStG erfasst insbesondere Lieferungen der in Anlage 2 UStG genannten Gegenstände.

Typische Beispiele sind:

- bestimmte lebende Tiere,
- landwirtschaftliche Nutztiere,
- Blindenhunde,
- Milch,
- bestimmte Milcherzeugnisse,
- Pflanzen und Blumen,
- bestimmte Lebensmittel,
- Kaffee und Tee in der gesetzlich bezeichneten Form,
- Gewürze,
- Leitungswasser,
- Brennholz,
- Bücher und bestimmte Druckerzeugnisse.

► Achtung

Nicht automatisch begünstigt sind beispielsweise:

- abgefülltes Wasser,
- Limonade,
- Cola,
- alkoholische Getränke,
- zubereitete Getränke,
- trinkfertiger Kaffee oder Tee.

Maßgeblich ist die genaue Warenbezeichnung in Anlage 2 UStG.

---

⇨ 24. Vermietung begünstigter Gegenstände

Die Vermietung bestimmter in Anlage 2 UStG genannter Gegenstände kann ebenfalls dem ermäßigten Steuersatz unterliegen.

Es ist jedoch immer zu prüfen, ob die konkrete Vermietung ausdrücklich von § 12 Abs. 2 UStG erfasst wird.

---

⇨ 25. Personenbeförderung

Für bestimmte Personenbeförderungsleistungen gilt der ermäßigte Steuersatz.

► Schienenbahnverkehr

Die Personenbeförderung im Schienenbahnverkehr kann unabhängig von der Länge der Beförderungsstrecke dem ermäßigten Steuersatz unterliegen.

► Andere Beförderungsmittel

Bei Beförderungen insbesondere durch

- Kraftfahrzeuge,
- Taxen,
- Schiffe,
- Drahtseilbahnen

gilt der ermäßigte Steuersatz grundsätzlich, wenn

- die Beförderung innerhalb einer Gemeinde erfolgt oder
- die Beförderungsstrecke nicht mehr als 50 Kilometer beträgt.

Hin- und Rückfahrt sind grundsätzlich jeweils gesondert zu beurteilen.

---

⇨ 26. Kurzfristige Beherbergung

Die kurzfristige Vermietung von Wohn- und Schlafräumen zur Beherbergung von Fremden unterliegt grundsätzlich dem ermäßigten Steuersatz.

Dies betrifft insbesondere:

- Hotels,
- Pensionen,
- Ferienwohnungen,
- kurzfristige Zimmervermietungen.

Auch die kurzfristige Vermietung von Campingflächen kann begünstigt sein.

► Wichtig

Zusatzleistungen sind gesondert zu beurteilen.

Nicht jede Nebenleistung des Hotels unterliegt automatisch dem ermäßigten Steuersatz.

---

⇨ 27. Restaurant- und Verpflegungsdienstleistungen ab 2026

Seit dem 1. Januar 2026 unterliegen Restaurant- und Verpflegungsdienstleistungen hinsichtlich der Abgabe von Speisen grundsätzlich dem ermäßigten Steuersatz von 7 Prozent.

Dies betrifft insbesondere:

- Restaurants,
- Cafés,
- Cateringunternehmen,
- Bäckereien mit Verzehrangebot,
- Metzgereien mit Imbissangebot,
- Kita- und Schulverpflegung,
- Krankenhausverpflegung.

► Getränke

Die Abgabe von Getränken bleibt grundsätzlich vom ermäßigten Steuersatz ausgenommen und unterliegt regelmäßig 19 Prozent.

► Kombiangebote

Enthält ein Gesamtpreis sowohl

- begünstigte Speisen als auch
- regelbesteuerte Getränke,

ist das Entgelt aufzuteilen.

Für bestimmte Pauschal- und Kombiangebote lässt die Finanzverwaltung Vereinfachungsregelungen zur Aufteilung zu.

---

⇨ 28. Beispiel Steuersatz

Ein Restaurant berechnet:

- Speisen: 50 Euro,
- Getränke: 20 Euro.

Seit dem 1. Januar 2026 gelten grundsätzlich:

- Speisen: 7 Prozent,
- Getränke: 19 Prozent.

Die Umsätze müssen nach Steuersätzen getrennt aufgezeichnet und abgerechnet werden.

---

⇨ Teil C: Bemessungsgrundlage nach § 10 UStG

⇨ 29. Grundsatz

Die Umsatzsteuer wird bei Lieferungen und sonstigen Leistungen grundsätzlich nach dem Entgelt bemessen.

Entgelt ist alles, was den Wert der Gegenleistung bildet, die der leistende Unternehmer erhält oder erhalten soll.

Die gesetzlich geschuldete Umsatzsteuer selbst gehört nicht zum Entgelt.

► Formel

Bruttogegenleistung  
./. enthaltene Umsatzsteuer  
= Entgelt beziehungsweise Bemessungsgrundlage

---

⇨ 30. Berechnung aus einem Bruttopreis

► Steuersatz 19 Prozent

Bruttobetrag / 1,19 = Bemessungsgrundlage.

Bruttobetrag - Bemessungsgrundlage = Umsatzsteuer.

► Steuersatz 7 Prozent

Bruttobetrag / 1,07 = Bemessungsgrundlage.

Bruttobetrag - Bemessungsgrundlage = Umsatzsteuer.

► Steuerfreier oder nicht steuerbarer Umsatz

Es wird keine Umsatzsteuer herausgerechnet.

Der Divisor beträgt rechnerisch 1.

---

⇨ 31. Beispiel

Vereinbarter Bruttopreis:

23.800 Euro.

Steuersatz:

19 Prozent.

Berechnung:

23.800 Euro / 1,19 = 20.000 Euro Bemessungsgrundlage.

20.000 Euro × 19 Prozent = 3.800 Euro Umsatzsteuer.

---

⇨ 32. Bedeutung der Rechnung

Für die Ermittlung der gesetzlich richtigen Bemessungsgrundlage ist die Bezeichnung in der Rechnung nicht allein entscheidend.

Auch wenn die Rechnung Umsatzsteuer nicht oder falsch ausweist, ist zu ermitteln:

- welcher Preis tatsächlich vereinbart wurde,
- ob der Preis als Brutto- oder Nettobetrag vereinbart wurde,
- welcher Steuersatz gesetzlich anzuwenden ist.

---

⇨ 33. Bestandteile des Entgelts

Zum Entgelt gehören grundsätzlich:

- Kaufpreis,
- Miete,
- Honorar,
- Werklohn,
- Bearbeitungsgebühren,
- Buchungsgebühren,
- Aufrechnungsbeträge,
- übernommene Verbindlichkeiten,
- Vergütungen für Nebenleistungen,
- Verpackungskosten,
- Transportkosten,
- Versicherungskosten,
- vom Leistungsempfänger erstattete eigene Auslagen,
- Entgelt von dritter Seite,
- freiwillige Zahlungen an den Unternehmer mit Leistungsbezug.

---

⇨ 34. Nebenleistungen

Vergütungen für unselbständige Nebenleistungen teilen grundsätzlich das umsatzsteuerliche Schicksal der Hauptleistung.

Typische Nebenleistungen:

- Transport,
- Verpackung,
- Versicherung,
- Versand,
- Montage,
- übliche Nebenkosten.

Die Vergütung für die Nebenleistung gehört grundsätzlich zur Bemessungsgrundlage der Hauptleistung.

---

⇨ 35. Auslagenersatz

Auslagen, die der Unternehmer im eigenen Namen tätigt und seinem Kunden weiterberechnet, gehören grundsätzlich zum Entgelt.

Dies gilt beispielsweise für:

- Porto,
- Telefonkosten,
- Schreibauslagen,
- Kopierkosten,
- Fahrtkosten,
- Reisekosten,
- Heizkostenumlagen,
- Müllabfuhr.

Eine bloße Bezeichnung als „Auslagenersatz“ ändert daran nichts.

---

⇨ 36. Durchlaufende Posten

Nicht zum Entgelt gehören durchlaufende Posten.

Ein durchlaufender Posten liegt vor, wenn der Unternehmer einen Betrag

- im Namen und
- für Rechnung

eines anderen vereinnahmt oder verausgabt.

Typische Fälle können sein:

- bestimmte Gerichtsgebühren,
- bestimmte behördliche Gebühren,
- Zulassungsgebühren,
- Grundbuchkosten,
- Gebühren, bei denen der Kunde selbst unmittelbarer Schuldner ist.

► Merksatz

Eigener Name oder eigene Schuld:

**Entgelt.**

Fremder Name und fremde Rechnung:

**möglicher durchlaufender Posten.**

---

⇨ 37. Trinkgeld

► Trinkgeld an den Unternehmer

Ein freiwilliges Trinkgeld an den Unternehmer kann zum Entgelt gehören, wenn es im unmittelbaren Zusammenhang mit der Leistung steht.

► Trinkgeld an einen Arbeitnehmer

Ein freiwilliges Trinkgeld, das unmittelbar dem Arbeitnehmer gewährt wird, gehört grundsätzlich nicht zum Entgelt des Unternehmers.

---

⇨ 38. Entgelt von dritter Seite

Die Gegenleistung muss nicht zwingend vom Leistungsempfänger selbst gezahlt werden.

Auch die Zahlung eines Dritten kann Entgelt sein, wenn

- sie für die konkrete Leistung gezahlt wird und
- sie der Förderung oder Vergütung des Leistungsempfängers dient.

► Beispiel

Unternehmer A liefert eine Maschine an B.

B zahlt 2.000 Euro.

Ein Fördergeber zahlt zusätzlich 1.000 Euro unmittelbar an A, um den Erwerb der Maschine durch B zu fördern.

Die Bemessungsgrundlage kann insgesamt 3.000 Euro betragen.

---

⇨ 39. Zahlungen ohne Entgeltcharakter

Nicht zur Bemessungsgrundlage gehören insbesondere:

- echte Preisnachlässe,
- Skonti,
- Rabatte,
- nachträgliche Entgeltminderungen,
- echte Schadensersatzleistungen,
- durchlaufende Posten,
- freiwillige Trinkgelder an Arbeitnehmer.

► Achtung Schadensersatz

Nur echter Schadensersatz ist kein Entgelt.

Besteht zwischen Zahlung und Leistung ein unmittelbarer Zusammenhang, kann sogenannter unechter Schadensersatz und damit Entgelt vorliegen.

---

⇨ 40. Tausch

Beim Tausch besteht die Gegenleistung nicht in Geld, sondern in einer Lieferung.

Jeder Beteiligte erbringt einen eigenen Umsatz.

Der Wert des jeweils anderen Umsatzes bildet grundsätzlich das Entgelt für den eigenen Umsatz.

Die Umsatzsteuer gehört nicht zum Entgelt.

► Prüfung

Für beide Leistungen getrennt prüfen:

1. Art der Leistung,
2. Ort,
3. Zeitpunkt,
4. Steuerbarkeit,
5. Steuerbefreiung,
6. Steuersatz,
7. Bemessungsgrundlage,
8. Steuerschuldner.

---

⇨ 41. Tauschähnlicher Umsatz

Ein tauschähnlicher Umsatz liegt vor, wenn mindestens eine der ausgetauschten Leistungen eine sonstige Leistung ist.

Beispiele:

- Architektenleistung gegen Lieferung von Brennholz,
- Reparaturleistung gegen Überlassung eines Gegenstands,
- Beratungsleistung gegen Werbeleistung.

Auch hier ist jeder Umsatz gesondert zu beurteilen.

---

⇨ 42. Tausch mit Baraufgabe

Erfolgt zusätzlich zu einer Sach- oder Dienstleistung eine Geldzahlung, liegt ein Tausch beziehungsweise tauschähnlicher Umsatz mit Baraufgabe vor.

► Beteiligter, der die Baraufgabe erhält

Wert des anderen Umsatzes  
+ erhaltene Baraufgabe  
= Bruttogegenleistung  
./. Umsatzsteuer  
= Bemessungsgrundlage

► Beteiligter, der die Baraufgabe zahlt

Wert des anderen Umsatzes  
./. geleistete Baraufgabe  
= Bruttogegenleistung  
./. Umsatzsteuer  
= Bemessungsgrundlage

---

⇨ Teil D: Bezug für das Unternehmen und Zuordnung

⇨ 43. Leistungsbezug für das Unternehmen

Eine Leistung wird für das Unternehmen bezogen, wenn sie dazu bestimmt ist, der wirtschaftlichen beziehungsweise unternehmerischen Tätigkeit des Leistungsempfängers zu dienen.

Maßgeblich ist grundsätzlich die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

Eine spätere tatsächliche Nutzungsänderung kann eine Vorsteuerberichtigung nach § 15a UStG auslösen.

---

⇨ 44. Verbrauchbare Gegenstände und sonstige Leistungen

Bei verbrauchbaren Gegenständen und sonstigen Leistungen ist grundsätzlich eine direkte Zuordnung zur beabsichtigten Verwendung vorzunehmen.

Beispiele:

- Büromaterial,
- Treibstoff,
- Beratungsleistungen,
- Mietleistungen,
- Strom,
- Reparaturleistungen.

Bei gemischter Verwendung ist die Vorsteuer entsprechend der tatsächlichen beziehungsweise beabsichtigten Nutzung aufzuteilen.

Ein freies Zuordnungswahlrecht wie bei einem einheitlichen Investitionsgegenstand besteht grundsätzlich nicht.

---

⇨ 45. Einheitlicher Gegenstand

Wird ein einheitlicher Gegenstand sowohl unternehmerisch als auch privat genutzt, ist der Umfang der unternehmerischen Nutzung zu bestimmen.

► Unternehmerische Nutzung unter 10 Prozent

Beträgt die unternehmerische Nutzung weniger als 10 Prozent, gilt der Gegenstand grundsätzlich nicht als für das Unternehmen bezogen.

Folge:

Kein Vorsteuerabzug.

► Unternehmerische Nutzung mindestens 10 Prozent

Bei einer unternehmerischen Nutzung von mindestens 10 Prozent kann grundsätzlich ein Zuordnungswahlrecht bestehen.

Der Unternehmer kann den Gegenstand je nach Sachverhalt

- vollständig dem Unternehmen,
- anteilig dem Unternehmen oder
- vollständig dem Privatvermögen

zuordnen.

---

⇨ 46. Vollständige Zuordnung

Wird der Gegenstand vollständig dem Unternehmen zugeordnet, kann die Vorsteuer unter den weiteren Voraussetzungen grundsätzlich vollständig abziehbar sein.

Die spätere private Nutzung kann dann als unentgeltliche Wertabgabe steuerpflichtig sein.

► Beispiel

Ein Pkw wird zu 70 Prozent unternehmerisch und zu 30 Prozent privat genutzt.

Der Unternehmer ordnet den Pkw vollständig dem Unternehmen zu.

Grundsätzlich kann ein voller Vorsteuerabzug möglich sein.

Die Privatnutzung ist anschließend umsatzsteuerlich als unentgeltliche Wertabgabe zu erfassen.

---

⇨ 47. Teilweise Zuordnung

Der Unternehmer kann einen gemischt genutzten Gegenstand grundsätzlich nur im Umfang der unternehmerischen Nutzung dem Unternehmen zuordnen.

Folgen:

- Vorsteuerabzug nur im zugeordneten Umfang,
- der private Teil bleibt außerhalb des Unternehmens,
- auf den nicht zugeordneten privaten Anteil fällt keine spätere Wertabgabenbesteuerung an.

---

⇨ 48. Nichtwirtschaftliche Tätigkeit im engeren Sinne

Bei einer gemischten Nutzung für

- wirtschaftliche unternehmerische Tätigkeiten und
- nichtwirtschaftliche Tätigkeiten im engeren Sinne

besteht nicht ohne Weiteres ein vollständiges Zuordnungswahlrecht.

Dies betrifft beispielsweise:

- ideelle Tätigkeiten eines Vereins,
- hoheitliche Tätigkeiten,
- Tätigkeiten außerhalb eines Leistungsaustauschs.

Die Eingangsleistung ist grundsätzlich nach ihrer wirtschaftlichen und nichtwirtschaftlichen Verwendung aufzuteilen.

Nur der dem wirtschaftlichen Unternehmensteil zuzurechnende Anteil kann zum Vorsteuerabzug berechtigen.

---

⇨ 49. Gemischt genutzte Grundstücke

Für Grundstücke gilt die Sonderregelung des § 15 Abs. 1b UStG.

Wird ein Grundstück sowohl

- unternehmerisch als auch
- privat oder unternehmensfremd

genutzt, ist die Vorsteuer grundsätzlich nur im Umfang der unternehmerischen Nutzung abziehbar.

Dies gilt auch dann, wenn das Grundstück vollständig dem Unternehmen zugeordnet wurde.

► Folge

Die private Nutzung führt hinsichtlich des bereits vom Vorsteuerabzug ausgeschlossenen Anteils grundsätzlich nicht zusätzlich zu einer Wertabgabenbesteuerung.

---

⇨ Teil E: Voraussetzungen des Vorsteuerabzugs

⇨ 50. Grundschema nach § 15 Abs. 1 Satz 1 Nr. 1 UStG

Für den Vorsteuerabzug aus einer normalen Eingangsleistung sind grundsätzlich fünf Voraussetzungen zu prüfen:

1. Unternehmereigenschaft des Leistungsempfängers,
2. gesetzlich geschuldete Umsatzsteuer,
3. Unternehmereigenschaft des leistenden Unternehmers,
4. Leistungsbezug für das Unternehmen,
5. ordnungsgemäße Rechnung nach §§ 14 und 14a UStG.

Erst wenn diese Voraussetzungen erfüllt sind, ist die Vorsteuer dem Grunde nach abzugsfähig.

Anschließend ist zu prüfen, ob sie tatsächlich abziehbar ist.

---

⇨ 51. Unternehmereigenschaft des Leistungsempfängers

Der Leistungsempfänger muss Unternehmer im Sinne des § 2 UStG sein.

Die Unternehmereigenschaft kann bereits mit nach außen erkennbaren Vorbereitungshandlungen beginnen.

Beispiele:

- Anmietung von Geschäftsräumen,
- Anschaffung von Betriebsmitteln,
- Marktanalysen,
- Beantragung erforderlicher Genehmigungen,
- Beauftragung eines Steuerberaters.

Auch ein erfolgloser Unternehmer kann zum Vorsteuerabzug berechtigt sein, wenn eine ernsthafte unternehmerische Tätigkeit objektiv beabsichtigt war.

Der Sitz des Leistungsempfängers ist für seine Unternehmereigenschaft grundsätzlich unerheblich.

---

⇨ 52. Gesetzlich geschuldete Steuer

Abziehbar ist nur gesetzlich geschuldete Umsatzsteuer.

Die Eingangsleistung muss nach dem deutschen Umsatzsteuerrecht

- steuerbar und
- steuerpflichtig

sein.

► Keine abziehbare Vorsteuer

Keine abziehbare Vorsteuer liegt grundsätzlich vor bei

- zu hoch ausgewiesener Umsatzsteuer,
- unberechtigtem Steuerausweis,
- Umsatzsteuer nach § 14c UStG,
- Umsatzsteuer auf einen steuerfreien Umsatz,
- Umsatzsteuer mit falschem Leistungsort.

► Grundsatz

Vorsteuerabzug höchstens in Höhe

- der gesetzlich geschuldeten Steuer und
- des in der ordnungsgemäßen Rechnung ausgewiesenen Betrags.

Der niedrigere Betrag ist maßgeblich.

---

⇨ 53. Fremdwährungen

Ist die Rechnung in einer fremden Währung ausgestellt, ist die Umsatzsteuer nach den gesetzlichen Vorschriften in Euro umzurechnen.

Maßgeblich sind insbesondere § 16 Abs. 6 UStG und die hierzu ergangenen Verwaltungsregelungen.

---

⇨ 54. Unternehmereigenschaft des Leistenden

Der leistende Unternehmer muss Unternehmer im Sinne des § 2 UStG sein.

Der Leistungsempfänger muss grundsätzlich prüfen, ob die Leistung tatsächlich von einem Unternehmer ausgeführt wurde.

Besteht die Unternehmereigenschaft des Leistenden nicht, entsteht grundsätzlich kein Vorsteuerabzug.

Ein allgemeiner Gutglaubensschutz allein wegen einer formal ordnungsgemäßen Rechnung besteht nicht.

---

⇨ 55. Leistungsbezug für das Unternehmen

Die Leistung muss für das Unternehmen des Leistungsempfängers bestimmt sein.

Maßgeblich ist die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

► Für das Unternehmen

Eine Leistung wird für das Unternehmen bezogen, wenn sie objektiv dazu bestimmt ist, der Erbringung entgeltlicher unternehmerischer Leistungen zu dienen.

► Nicht für das Unternehmen

Kein Vorsteuerabzug besteht bei einem ausschließlichen Leistungsbezug für

- private Zwecke,
- den privaten Bedarf des Personals,
- nichtwirtschaftliche Tätigkeiten,
- andere unternehmensfremde Zwecke.

---

⇨ 56. Zusammenhang mit dem Ausgangsumsatz

Die Eingangsleistung muss einem beabsichtigten Ausgangsumsatz oder der wirtschaftlichen Gesamttätigkeit zugeordnet werden.

Dabei ist vorrangig zu prüfen, ob ein direkter und unmittelbarer Zusammenhang mit einem bestimmten Ausgangsumsatz besteht.

Ist keine direkte Zuordnung möglich, kann die Eingangsleistung zu den allgemeinen Aufwendungen des Unternehmens gehören.

Dann ist die Gesamttätigkeit des Unternehmers maßgeblich.

---

⇨ 57. Ordnungsgemäße Rechnung

Der Leistungsempfänger muss grundsätzlich im Besitz einer Rechnung nach §§ 14 und 14a UStG sein.

Zu den Pflichtangaben gehören insbesondere:

- vollständiger Name und Anschrift des Leistenden,
- vollständiger Name und Anschrift des Leistungsempfängers,
- Steuernummer oder Umsatzsteuer-Identifikationsnummer,
- Ausstellungsdatum,
- fortlaufende Rechnungsnummer,
- Menge und Art der gelieferten Gegenstände,
- Umfang und Art der sonstigen Leistung,
- Leistungszeitpunkt,
- Entgelt,
- Steuersatz,
- Steuerbetrag.

► Besonders wichtig

§ 14 Abs. 4 Nr. 7 und 8 UStG verlangt insbesondere Angaben zum

- Entgelt,
- Steuersatz und
- Steuerbetrag.

Fehlen wesentliche Angaben, ist der Vorsteuerabzug grundsätzlich gefährdet.

---

⇨ 58. Rechnungsberichtigung

Eine fehlerhafte Rechnung kann grundsätzlich berichtigt werden.

Die Berichtigung kann nur durch

- den Rechnungsaussteller oder
- einen von ihm hierzu berechtigten Dritten

erfolgen.

Je nach Art des Fehlers kann die Rechnungsberichtigung auf den ursprünglichen Ausstellungszeitpunkt zurückwirken.

Voraussetzung ist grundsätzlich, dass das ursprüngliche Dokument bereits bestimmte Mindestangaben enthält.

---

⇨ 59. Zeitpunkt des Vorsteuerabzugs

Der Vorsteuerabzug ist grundsätzlich in dem Voranmeldungszeitraum vorzunehmen, in dem

1. die Lieferung oder sonstige Leistung ausgeführt wurde und
2. der Leistungsempfänger im Besitz einer ordnungsgemäßen Rechnung ist.

Der Zeitpunkt der Zahlung ist grundsätzlich unerheblich.

► Merksatz

Normale Eingangsleistung:

**Leistung + Rechnung.**

---

⇨ 60. Vorsteuerabzug bei Anzahlungen

Vor Ausführung der Leistung kann ein Vorsteuerabzug aus einer Anzahlung möglich sein, wenn

1. eine ordnungsgemäße Anzahlungsrechnung vorliegt,
2. die Zahlung tatsächlich geleistet wurde und
3. die spätere Leistung hinreichend bestimmt ist.

► Merksatz

Anzahlung:

**Rechnung + Zahlung.**

Die Leistung ist noch nicht ausgeführt.

---

⇨ 61. Weitere abziehbare Vorsteuerbeträge

Neben der normalen Eingangsrechnung nach § 15 Abs. 1 Satz 1 Nr. 1 UStG können insbesondere abziehbar sein:

► Einfuhrumsatzsteuer

§ 15 Abs. 1 Satz 1 Nr. 2 UStG.

► Steuer auf den innergemeinschaftlichen Erwerb

§ 15 Abs. 1 Satz 1 Nr. 3 UStG.

► Steuer nach § 13b UStG

§ 15 Abs. 1 Satz 1 Nr. 4 UStG.

In diesen Fällen ist eine Rechnung mit gesondertem Umsatzsteuerausweis grundsätzlich nicht Voraussetzung des Vorsteuerabzugs.

Die übrigen Voraussetzungen, insbesondere der Leistungsbezug für das Unternehmen und fehlende Ausschlussumsätze, bleiben jedoch zu prüfen.

---

⇨ Teil F: Ausschluss vom Vorsteuerabzug

⇨ 62. Abzugsfähigkeit und Abziehbarkeit

Es ist zwischen zwei Prüfungsebenen zu unterscheiden:

► Abzugsfähig

Die Voraussetzungen des § 15 Abs. 1 UStG sind erfüllt.

► Tatsächlich abziehbar

Es greift kein Ausschluss nach § 15 Abs. 1a, Abs. 1b oder Abs. 2 UStG beziehungsweise ein Ausschluss wird durch § 15 Abs. 3 UStG aufgehoben.

► Merksatz

Zuerst:

**Ist die Steuer Vorsteuer?**

Danach:

**Darf diese Vorsteuer tatsächlich abgezogen werden?**

---

⇨ 63. Ausschluss nach § 15 Abs. 2 UStG

Der Vorsteuerabzug ist grundsätzlich ausgeschlossen, wenn die Eingangsleistung für Umsätze verwendet wird, die den Vorsteuerabzug ausschließen.

Hierzu gehören insbesondere:

1. steuerfreie Ausgangsumsätze,
2. bestimmte im Ausland ausgeführte Umsätze, die bei Ausführung im Inland steuerfrei wären.

Maßgeblich ist die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

---

⇨ 64. Steuerpflichtige Ausgangsumsätze

Wird die Eingangsleistung für steuerpflichtige Ausgangsumsätze verwendet, besteht grundsätzlich kein Ausschluss nach § 15 Abs. 2 UStG.

Dies gilt auch, wenn ein ursprünglich steuerfreier Umsatz aufgrund einer wirksamen Option nach § 9 UStG steuerpflichtig behandelt wird.

► Beispiel

Ein Vermieter optiert wirksam zur Umsatzsteuer.

Die Renovierungskosten stehen unmittelbar mit der steuerpflichtigen Vermietung in Zusammenhang.

Die Vorsteuer kann grundsätzlich abziehbar sein.

---

⇨ 65. Steuerfreie Ausgangsumsätze

Wird die Eingangsleistung für steuerfreie Umsätze verwendet, ist die Vorsteuer grundsätzlich nicht abziehbar.

Typische Ausschlussumsätze sind:

- steuerfreie Heilbehandlungen,
- steuerfreie Wohnraumvermietung,
- bestimmte Bankumsätze,
- bestimmte Versicherungsumsätze,
- bestimmte Grundstücksverkäufe ohne Option.

---

⇨ 66. Rückausschluss nach § 15 Abs. 3 UStG

§ 15 Abs. 3 UStG hebt den Ausschluss des § 15 Abs. 2 UStG für bestimmte steuerfreie Umsätze wieder auf.

Diese Umsätze sind steuerfrei, berechtigen aber dennoch zum Vorsteuerabzug.

Typische Fälle sind insbesondere:

- Ausfuhrlieferungen,
- innergemeinschaftliche Lieferungen,
- bestimmte grenzüberschreitende Umsätze,
- bestimmte Umsätze für die See- und Luftfahrt,
- bestimmte Finanzumsätze mit Bezug zum Drittlandsgebiet.

► Merksatz

Steuerfrei bedeutet nicht automatisch:

**kein Vorsteuerabzug.**

Es muss immer § 15 Abs. 3 UStG geprüft werden.

---

⇨ 67. Steuerfreie Umsätze nach § 4 Nr. 1 bis 7 UStG

Bei vielen Steuerbefreiungen nach § 4 Nr. 1 bis 7 UStG bleibt der Vorsteuerabzug erhalten.

Hierzu gehören insbesondere typische grenzüberschreitende Befreiungstatbestände.

Die Vorsteuer ist damit

- abzugsfähig und
- trotz Steuerfreiheit des Ausgangsumsatzes abziehbar.

---

⇨ 68. Sonstige Steuerbefreiungen

Bei zahlreichen Steuerbefreiungen nach § 4 Nr. 8 bis 29 UStG ist der Vorsteuerabzug grundsätzlich ausgeschlossen.

Hierzu gehören beispielsweise:

- Bank- und Finanzumsätze,
- Versicherungsumsätze,
- Grundstücksvermietungen,
- Heilbehandlungen,
- Bildungs- und Sozialleistungen.

Es bestehen jedoch einzelne gesetzliche Ausnahmen und Rückausschlusstatbestände.

Die konkrete Steuerbefreiung ist daher stets einzeln zu prüfen.

---

⇨ 69. Umsätze im Ausland

Ein im Ausland ausgeführter Ausgangsumsatz ist in Deutschland nicht steuerbar.

Für den Vorsteuerabzug ist zu prüfen, wie der Umsatz bei einer hypothetischen Ausführung im Inland behandelt würde.

► Hypothetisch steuerpflichtig

Die Vorsteuer kann grundsätzlich abziehbar sein.

► Hypothetisch steuerfrei und vorsteuerschädlich

Die Vorsteuer ist grundsätzlich ausgeschlossen.

► Hypothetisch steuerfrei mit Rückausschluss

Die Vorsteuer kann dennoch abziehbar sein.

---

⇨ 70. Nicht steuerbare Tätigkeiten

Bei einer nicht steuerbaren Tätigkeit ist zu unterscheiden:

► Wirtschaftliche Tätigkeit mit ausländischem Leistungsort

Ein Vorsteuerabzug kann möglich sein, wenn der Umsatz bei Ausführung im Inland zum Vorsteuerabzug berechtigen würde.

► Nichtwirtschaftliche Tätigkeit

Bei einer Tätigkeit außerhalb des umsatzsteuerlichen Unternehmens fehlt grundsätzlich bereits der Leistungsbezug für das Unternehmen.

Die Eingangsleistung ist insoweit nicht abzugsfähig.

---

⇨ Teil G: Aufteilung von Vorsteuerbeträgen

⇨ 71. Direkte Zuordnung

Vorsteuerbeträge sind zunächst unmittelbar den Ausgangsumsätzen zuzuordnen.

► Ausschließlich Abzugsumsätze

Die Vorsteuer ist vollständig abziehbar.

► Ausschließlich Ausschlussumsätze

Die Vorsteuer ist nicht abziehbar.

► Gemischter Zusammenhang

Ist keine direkte Zuordnung möglich, ist eine Aufteilung nach § 15 Abs. 4 UStG vorzunehmen.

---

⇨ 72. Voraussetzung der Vorsteueraufteilung

Eine Aufteilung ist erforderlich, wenn eine Eingangsleistung gleichzeitig verwendet wird für

- Umsätze, die zum Vorsteuerabzug berechtigen, und
- Umsätze, die den Vorsteuerabzug ausschließen.

► Beispiel

Ein Steuerberater erzielt

- steuerpflichtige Beratungsumsätze und
- steuerfreie Grundstücksvermietungsumsätze.

Die Kosten des gesamten Verwaltungsbüros können beiden Bereichen dienen.

Die Vorsteuer ist nach einem sachgerechten Maßstab aufzuteilen.

---

⇨ 73. Sachgerechte Schätzung

Die Aufteilung erfolgt nach einer sachgerechten Schätzung.

Geeignete Aufteilungsmaßstäbe können sein:

- Nutzflächen,
- Wohnflächen,
- Zeitanteile,
- Stückzahlen,
- Personenzahlen,
- tatsächliche Nutzung,
- technische Verbrauchswerte,
- Umsatzverhältnisse.

Der gewählte Schlüssel muss den wirtschaftlichen Zusammenhang möglichst genau abbilden.

---

⇨ 74. Umsatzschlüssel

Eine Aufteilung nach dem Verhältnis der Umsätze ist grundsätzlich nur zulässig, wenn keine andere wirtschaftlich präzisere Zuordnung möglich ist.

Der Umsatzschlüssel ist daher regelmäßig nachrangig.

► Merksatz

Direkte Zuordnung vor Aufteilung.

Präziser wirtschaftlicher Schlüssel vor Umsatzschlüssel.

---

⇨ 75. Gebäude

Bei Gebäuden ist besonders zu unterscheiden:

► Direkte Zuordnung möglich

Betrifft eine Eingangsleistung ausschließlich einen bestimmten Gebäudeteil, erfolgt keine Aufteilung.

Beispiele:

- Renovierung ausschließlich der Arztpraxis,
- Fenster ausschließlich in einer steuerpflichtig vermieteten Einheit,
- Bodenbelag ausschließlich in einer steuerfreien Wohnung.

► Keine direkte Zuordnung möglich

Bei allgemeinen Gebäudeaufwendungen ist regelmäßig ein sachgerechter Aufteilungsschlüssel zu verwenden.

Häufig kommt das Verhältnis der Nutzflächen in Betracht.

---

⇨ 76. Anschaffungs- und Herstellungskosten eines Gebäudes

Vorsteuer aus Anschaffungs- und Herstellungskosten eines gemischt genutzten Gebäudes ist nach einem sachgerechten Maßstab aufzuteilen.

Der geeignete Maßstab richtet sich nach den Umständen des Einzelfalls.

Ein einmal gewählter sachgerechter Aufteilungsmaßstab kann den Unternehmer auch für spätere Berichtigungszeiträume binden.

Ändert sich die Verwendung, ist § 15a UStG zu prüfen.

---

⇨ Teil H: Prüfungsschemata

⇨ 77. Prüfungsschema Reverse Charge

1. Art der Eingangsleistung bestimmen.
2. Leistungsort ermitteln.
3. Inländische Steuerbarkeit prüfen.
4. Steuerbefreiung prüfen.
5. Tatbestand des § 13b Abs. 1 oder Abs. 2 bestimmen.
6. Ansässigkeit des Leistenden prüfen.
7. Voraussetzungen des Leistungsempfängers nach § 13b Abs. 5 prüfen.
8. Zeitpunkt der Steuerentstehung bestimmen.
9. Bemessungsgrundlage bestimmen.
10. Steuersatz bestimmen.
11. Umsatzsteuer berechnen.
12. Rechnung ohne gesonderten Steuerausweis prüfen.
13. Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 4 UStG gesondert prüfen.

---

⇨ 78. Prüfungsschema Steuersatz

1. Liegt ein steuerpflichtiger Umsatz vor?
2. Wird der Umsatz von § 12 Abs. 2 UStG erfasst?
3. Ist Anlage 2 UStG einschlägig?
4. Liegt eine begünstigte Personenbeförderung vor?
5. Liegt eine kurzfristige Beherbergung vor?
6. Liegt eine Restaurant- oder Verpflegungsdienstleistung vor?
7. Handelt es sich um Speisen oder Getränke?
8. Wenn keine Ermäßigung greift: 19 Prozent.

---

⇨ 79. Prüfungsschema Bemessungsgrundlage

1. Gegenleistung feststellen.
2. Brutto- oder Nettopreis bestimmen.
3. Zahlungen Dritter einbeziehen.
4. Nebenleistungen einbeziehen.
5. Preisnachlässe abziehen.
6. Durchlaufende Posten aussondern.
7. Echten Schadensersatz aussondern.
8. Tausch oder Baraufgabe prüfen.
9. Steuersatz bestimmen.
10. Umsatzsteuer herausrechnen.

---

⇨ 80. Prüfungsschema Vorsteuerabzug

► Stufe 1: Abzugsfähigkeit

1. Unternehmereigenschaft des Leistungsempfängers.
2. Gesetzlich geschuldete Umsatzsteuer.
3. Unternehmereigenschaft des Leistenden.
4. Leistungsbezug für das Unternehmen.
5. Ordnungsgemäße Rechnung.

► Stufe 2: Abziehbarkeit

6. Ausschluss nach § 15 Abs. 1a prüfen.
7. Sonderregelung für Grundstücke nach § 15 Abs. 1b prüfen.
8. Ausschlussumsätze nach § 15 Abs. 2 prüfen.
9. Rückausschluss nach § 15 Abs. 3 prüfen.
10. Gegebenenfalls Aufteilung nach § 15 Abs. 4 durchführen.

► Ergebnis

Festzustellen sind:

- Vorsteuer abziehbar oder nicht abziehbar,
- Höhe der abziehbaren Vorsteuer,
- maßgeblicher Voranmeldungszeitraum.

---

⇨ 81. Formulierungshilfe § 13b UStG

Die Leistung ist im Inland steuerbar und steuerpflichtig.

Sie fällt unter § 13b Abs. ... UStG.

Da der Leistungsempfänger die Voraussetzungen des § 13b Abs. 5 UStG erfüllt, schuldet er die Umsatzsteuer.

Die Bemessungsgrundlage beträgt ... Euro.

Bei einem Steuersatz von ... Prozent entsteht Umsatzsteuer in Höhe von ... Euro.

Der leistende Unternehmer darf die Umsatzsteuer nicht gesondert ausweisen und muss auf die Steuerschuldnerschaft des Leistungsempfängers hinweisen.

Der Vorsteuerabzug des Leistungsempfängers ist gesondert nach § 15 UStG zu prüfen.

---

⇨ 82. Formulierungshilfe Vorsteuerabzug möglich

Der Leistungsempfänger ist Unternehmer im Sinne des § 2 UStG.

Die Eingangsleistung wurde von einem anderen Unternehmer für sein Unternehmen ausgeführt.

Die Umsatzsteuer wird gesetzlich geschuldet und ist in einer ordnungsgemäßen Rechnung nach §§ 14 und 14a UStG ausgewiesen.

Die Voraussetzungen des § 15 Abs. 1 Satz 1 Nr. 1 UStG sind erfüllt.

Da die Eingangsleistung für steuerpflichtige Ausgangsumsätze verwendet wird, greift kein Ausschluss nach § 15 Abs. 2 UStG ein.

Die Vorsteuer ist abzugsfähig und abziehbar.

---

⇨ 83. Formulierungshilfe Vorsteuerabzug ausgeschlossen

Die Voraussetzungen des § 15 Abs. 1 UStG sind dem Grunde nach erfüllt.

Die Eingangsleistung wird jedoch für steuerfreie Ausgangsumsätze verwendet, die den Vorsteuerabzug ausschließen.

Der Vorsteuerabzug ist daher nach § 15 Abs. 2 Satz 1 Nr. 1 UStG ausgeschlossen.

Ein Rückausschluss nach § 15 Abs. 3 UStG liegt nicht vor.

Die Vorsteuer ist abzugsfähig, aber nicht abziehbar.

---

⇨ 84. Zentrale Merksätze

- § 13b UStG ändert den Steuerschuldner, nicht die Steuerpflicht des Umsatzes.
- Zuerst müssen Ort, Steuerbarkeit und Steuerpflicht geprüft werden.
- Bei § 13b Abs. 1 entsteht die Steuer grundsätzlich im Zeitraum der Leistungsausführung.
- Bei § 13b Abs. 2 entsteht die Steuer mit Rechnung, spätestens im Folgemonat.
- Der leistende Unternehmer weist bei Reverse Charge keine Umsatzsteuer aus.
- Ein falscher Steuerausweis kann zu einer zusätzlichen Steuerschuld nach § 14c UStG führen.
- Auch Kleinunternehmer können als Leistungsempfänger Steuer nach § 13b UStG schulden.
- Steuerschuld und Vorsteuerabzug sind immer getrennt zu prüfen.
- Der Regelsteuersatz beträgt 19 Prozent.
- Der ermäßigte Steuersatz beträgt 7 Prozent.
- Seit 2026 unterliegen Restaurant-Speisen grundsätzlich 7 Prozent, Getränke regelmäßig 19 Prozent.
- Die Umsatzsteuer gehört nicht zur Bemessungsgrundlage.
- Durchlaufende Posten setzen Handeln im fremden Namen und für fremde Rechnung voraus.
- Beim Tausch ist jeder Umsatz getrennt zu prüfen.
- Für den Vorsteuerabzug ist die Verwendungsabsicht im Zeitpunkt des Leistungsbezugs maßgeblich.
- Bei weniger als 10 Prozent unternehmerischer Nutzung ist eine Zuordnung zum Unternehmen grundsätzlich ausgeschlossen.
- Eine abzugsfähige Vorsteuer ist nicht automatisch tatsächlich abziehbar.
- Steuerfreie Ausgangsumsätze können den Vorsteuerabzug ausschließen.
- Bei Ausfuhrlieferungen und ähnlichen Umsätzen bleibt der Vorsteuerabzug häufig erhalten.
- Vorsteuerbeträge sind zuerst direkt zuzuordnen.
- Nur wenn keine direkte Zuordnung möglich ist, erfolgt eine Aufteilung nach § 15 Abs. 4 UStG.
- Ein präziser wirtschaftlicher Aufteilungsschlüssel geht dem Umsatzschlüssel vor.
`
},
{
  id: "umsatzsteuer-steuerentstehung-anzahlung-vorsteuerabzug-aufteilung",

  title:
    "Steuerentstehung, Anzahlungen und Vorsteuerabzug nach §§ 13 und 15 UStG",

  short:
    "Sollbesteuerung, Leistungszeitpunkt, Teil- und Anzahlungen, Voraussetzungen und Zeitpunkt des Vorsteuerabzugs sowie Aufteilung und besondere Vorsteuerausschlüsse.",

  category: "Umsatzsteuer",

  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Steuerentstehung und Vorsteuerabzug",

  keywords:
    "§ 13 ustg|steuerentstehung|sollbesteuerung|vereinbarte entgelte|leistungszeitpunkt|teilleistung|anzahlung|teilentgelt|vorauszahlung|vereinnahmung|§ 15 ustg|vorsteuerabzug|rechnung|unternehmereigenschaft|leistungsbezug für das unternehmen|zuordnung unternehmensvermögen|gesetzlich geschuldete steuer|§ 14c ustg|zeitpunkt vorsteuerabzug|vorsteueraufteilung|§ 15 abs. 4 ustg|vorsteuerausschluss|§ 15 abs. 2 ustg|§ 15 abs. 3 ustg|§ 15 abs. 1a ustg|§ 15 abs. 1b ustg|einfuhrumsatzsteuer|innergemeinschaftlicher erwerb|reverse charge|§ 13b ustg",

  references: [
    "§ 2 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3 Abs. 8 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3 Abs. 12 UStG",
    "§ 3d UStG",
    "§ 10 UStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 13b UStG",
    "§ 14 UStG",
    "§ 14a UStG",
    "§ 14c UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 1 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 2 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 3 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    "§ 15 Abs. 1a UStG",
    "§ 15 Abs. 1b UStG",
    "§ 15 Abs. 2 UStG",
    "§ 15 Abs. 3 UStG",
    "§ 15 Abs. 4 UStG",
    "§ 16 Abs. 6 UStG",
    "§ 17 UStG",
    "§ 4 Abs. 5 EStG",
    "UStAE zu §§ 13 und 15 UStG"
  ],

  body: `
⇨ Steuerentstehung, Anzahlungen und Vorsteuerabzug

► 1. Überblick

Bei einem umsatzsteuerlichen Sachverhalt sind Steuerentstehung und Vorsteuerabzug getrennt zu prüfen.

Prüfungsreihenfolge:

1. Welche Leistung liegt vor?
2. Wo wird die Leistung ausgeführt?
3. Wann ist die Leistung ausgeführt?
4. Ist der Umsatz steuerbar?
5. Ist der Umsatz steuerfrei oder steuerpflichtig?
6. Wer schuldet die Umsatzsteuer?
7. Wann entsteht die Umsatzsteuer?
8. Ist der Leistungsempfänger zum Vorsteuerabzug berechtigt?
9. Wann darf die Vorsteuer abgezogen werden?
10. Bestehen Vorsteuerausschlüsse oder ist eine Aufteilung erforderlich?

Merksatz:

**Die Umsatzsteuer entsteht beim Leistenden; der Vorsteuerabzug wird beim Leistungsempfänger gesondert geprüft.**

---

⇨ 2. Sollbesteuerung nach vereinbarten Entgelten

► Grundsatz

Bei der Besteuerung nach vereinbarten Entgelten entsteht die Umsatzsteuer grundsätzlich mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt wurde.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a Satz 1 UStG.

Entscheidend ist grundsätzlich:

- nicht die Rechnungsstellung,
- nicht die Zahlung,
- sondern die Ausführung der Leistung.

Kurzform:

**Leistung ausgeführt = Steuer entsteht mit Ablauf dieses Voranmeldungszeitraums.**

---

⇨ 3. Bedeutung des Leistungszeitpunkts

Der Leistungszeitpunkt richtet sich nach der Art der jeweiligen Leistung.

Zu unterscheiden sind insbesondere:

- bewegte Lieferung,
- unbewegte Lieferung,
- Werklieferung,
- sonstige Leistung,
- Werkleistung,
- Dauerleistung,
- Teilleistung.

Der Zeitpunkt der Leistungsausführung ist bereits im Rahmen der Prüfung der Steuerbarkeit festzustellen.

Merksatz:

**Der für die Steuerbarkeit ermittelte Leistungszeitpunkt bestimmt regelmäßig auch den Voranmeldungszeitraum der Steuerentstehung.**

---

⇨ 4. Bewegte Lieferung

► Grundsatz

Eine bewegte Lieferung wird grundsätzlich mit Beginn der Beförderung oder Versendung ausgeführt.

Dies gilt insbesondere für:

- reine Beförderungslieferungen,
- reine Versendungslieferungen,
- bewegte Werklieferungen.

Beispiel:

Ein Unternehmer übergibt am 28. März eine Ware an einen Frachtführer.

Die Lieferung gilt grundsätzlich mit Beginn der Versendung am 28. März als ausgeführt.

Folge:

Die Steuer entsteht mit Ablauf des Voranmeldungszeitraums März.

---

⇨ 5. Bewegte Lieferung im Reihengeschäft

Auch bei einem Reihengeschäft ist für die bewegte Lieferung grundsätzlich der Beginn der Beförderung oder Versendung maßgeblich.

Zuvor muss jedoch festgestellt werden:

- welche Lieferung die bewegte Lieferung ist und
- welchem Unternehmer die Warenbewegung zugeordnet wird.

Erst danach kann der Leistungszeitpunkt der jeweiligen Lieferung bestimmt werden.

---

⇨ 6. Unbewegte Lieferung

► Grundsatz

Bei einer unbewegten Lieferung ist regelmäßig der Zeitpunkt der Verschaffung der Verfügungsmacht maßgeblich.

Bei Werklieferungen ist häufig auf die Abnahme des fertiggestellten Werks abzustellen.

Beispiel:

Ein Unternehmer errichtet einen fest mit dem Grundstück verbundenen Wintergarten.

Abnahme:

16. September.

Folge:

Die Werklieferung ist am 16. September ausgeführt.

Die Umsatzsteuer entsteht mit Ablauf des Voranmeldungszeitraums September.

---

⇨ 7. Unbewegte Lieferung im Reihengeschäft

Bei unbewegten Lieferungen im Reihengeschäft richtet sich der Leistungszeitpunkt nach der jeweils einschlägigen Ortsvorschrift.

Je nach Fall kann maßgeblich sein:

- der Beginn der Beförderung oder Versendung oder
- die Beendigung der Beförderung oder Versendung.

Die konkrete Zuordnung richtet sich nach § 3 Abs. 7 UStG.

---

⇨ 8. Sonstige Leistung und Werkleistung

► Grundsatz

Eine sonstige Leistung ist grundsätzlich ausgeführt, wenn sie

- vollendet und
- dem Leistungsempfänger vollständig zugewendet

worden ist.

Bei einer Werkleistung ist dies regelmäßig mit Beendigung der vereinbarten Arbeiten der Fall.

Beispiel:

Ein Berater beendet seine Beratungsleistung am 12. Juni.

Folge:

Die Leistung ist im Juni ausgeführt.

Die Steuer entsteht mit Ablauf des Voranmeldungszeitraums Juni.

---

⇨ 9. Teilleistungen

► Begriff

Eine Teilleistung liegt vor, wenn

- eine wirtschaftlich teilbare Gesamtleistung vorliegt,
- Teile der Leistung gesondert vereinbart wurden und
- für diese Teile eine gesonderte Entgeltabrechnung vorgesehen ist.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a Sätze 2 und 3 UStG.

Typische Fälle:

- monatliche Vermietungsleistungen,
- monatliche Wartungsleistungen,
- gesondert abgenommene Bauabschnitte,
- einzelne Leistungsphasen eines Gesamtprojekts.

► Steuerentstehung

Bei Teilleistungen entsteht die Umsatzsteuer mit Ablauf des Voranmeldungszeitraums, in dem die jeweilige Teilleistung ausgeführt wurde.

Beispiel:

Eine Wartungsleistung wird monatlich erbracht und abgerechnet.

Die Umsatzsteuer entsteht monatlich.

► Abgrenzung zur Abschlagszahlung

Eine bloße Abschlagszahlung führt nicht automatisch zu einer Teilleistung.

Entscheidend ist, ob tatsächlich

- ein wirtschaftlich abgrenzbarer Leistungsteil,
- gesondert vereinbart und
- gesondert geschuldet

wird.

---

⇨ 10. Anzahlungen

► Begriff

Eine Anzahlung liegt vor, wenn

- die Leistung oder Teilleistung noch nicht ausgeführt ist,
- aber bereits Entgelt oder Teilentgelt vereinnahmt wird.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a Satz 4 UStG.

► Voraussetzungen

1. Entgelt oder Teilentgelt wird vereinnahmt.
2. Die Vereinnahmung erfolgt vor Ausführung der Leistung oder Teilleistung.
3. Die spätere Leistung ist hinreichend bestimmt.

► Steuerentstehung

Die Umsatzsteuer entsteht insoweit mit Ablauf des Voranmeldungszeitraums der Vereinnahmung.

Formel:

Vereinnahmtes Bruttoentgelt  
÷ 1,19 oder 1,07  
= Bemessungsgrundlage

Bemessungsgrundlage  
× Steuersatz  
= Umsatzsteuer

Merksatz:

**Bei Anzahlungen ist der Zahlungseingang maßgeblich.**

---

⇨ 11. Anzahlungen bei Teilleistungen

Auch vor der Ausführung einer vereinbarten Teilleistung kann eine Anzahlung geleistet werden.

Dann entsteht die Steuer bereits vor Ausführung der Teilleistung mit Vereinnahmung des Teilentgelts.

Später ist bei Ausführung der Teilleistung nur noch der noch nicht versteuerte Restbetrag zu erfassen.

---

⇨ 12. Rechnung bei Anzahlungen

Die Steuerentstehung bei einer Anzahlung hängt grundsätzlich nicht davon ab, ob bereits eine Rechnung ausgestellt wurde.

Entscheidend ist beim Leistenden die Vereinnahmung des Entgelts oder Teilentgelts.

Für den Vorsteuerabzug des Leistungsempfängers ist dagegen eine ordnungsgemäße Rechnung erforderlich.

---

⇨ 13. Anzahlungen in Fremdwährung

Bei Anzahlungen in fremder Währung ist die Umrechnung grundsätzlich nach dem im Monat der Vereinnahmung geltenden Durchschnittskurs vorzunehmen.

Spätere Kursänderungen beeinflussen die bereits entstandene Anzahlungssteuer grundsätzlich nicht.

---

⇨ 14. Nichtausführung der angezahlten Leistung

Wird später festgestellt, dass die angezahlte Leistung nicht ausgeführt wird, sind

- die Umsatzsteuer beim Leistenden und
- die bereits abgezogene Vorsteuer beim Leistungsempfänger

nach § 17 UStG zu berichtigen.

Merksatz:

**Fällt die Leistung endgültig weg, müssen Umsatzsteuer und Vorsteuer korrigiert werden.**

---

⇨ 15. Steuerfreie Leistungen

Auch bei steuerfreien Leistungen ist der Leistungszeitpunkt zu bestimmen.

§ 13 Abs. 1 Nr. 1 Buchst. a UStG wird insoweit sinngemäß bzw. analog für die zeitliche Zuordnung des Umsatzes angewendet.

Es entsteht zwar keine zu zahlende Umsatzsteuer, der Umsatz muss aber dem richtigen Besteuerungszeitraum zugeordnet werden.

---

⇨ 16. Grundvoraussetzungen des Vorsteuerabzugs

Der Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 1 UStG setzt persönliche und sachliche Voraussetzungen voraus.

► Persönliche Voraussetzung

Der Leistungsempfänger muss Unternehmer sein.

► Sachliche Voraussetzungen

Erforderlich sind grundsätzlich:

1. gesetzlich geschuldete Umsatzsteuer,
2. Leistung eines anderen Unternehmers,
3. Leistungsbezug für das Unternehmen,
4. ordnungsgemäße Rechnung nach §§ 14 und 14a UStG.

---

⇨ 17. Unternehmereigenschaft des Leistungsempfängers

Der Leistungsempfänger muss Unternehmer im Sinne des § 2 UStG sein.

Die Unternehmereigenschaft ist grundsätzlich unabhängig davon, wo der Unternehmer seinen Sitz hat.

Auch ein ausländischer Unternehmer kann zum Vorsteuerabzug berechtigt sein.

► Beginn der Unternehmereigenschaft

Die Unternehmereigenschaft kann bereits vor Ausführung der ersten Ausgangsumsätze beginnen.

Beispiele:

- Gründungsaufwendungen,
- Anmietung von Geschäftsräumen,
- Anschaffung von Betriebsvermögen,
- Beratungskosten vor Geschäftseröffnung.

Voraussetzung ist, dass die beabsichtigte unternehmerische Tätigkeit durch objektive Merkmale nachgewiesen wird.

► Erfolgloser Unternehmer

Auch wenn das Unternehmen später keine Umsätze erzielt, kann die Unternehmereigenschaft bestehen, wenn die ernsthafte Absicht zur unternehmerischen Tätigkeit objektiv belegt ist.

---

⇨ 18. Leistung durch einen anderen Unternehmer

Der leistende Unternehmer muss die Leistung im Rahmen seines Unternehmens ausführen.

Ist der Leistende kein Unternehmer, besteht grundsätzlich kein Vorsteuerabzug.

Ein Gutglaubensschutz zugunsten des Leistungsempfängers besteht insoweit nicht ohne Weiteres.

Merksatz:

**Ohne Unternehmer auf der Leistenden-Seite grundsätzlich kein Vorsteuerabzug.**

---

⇨ 19. Gesetzlich geschuldete Steuer

Abziehbar ist grundsätzlich nur die gesetzlich geschuldete Umsatzsteuer.

Nicht abziehbar ist insbesondere:

- unberechtigt ausgewiesene Umsatzsteuer,
- zu hoch ausgewiesene Umsatzsteuer,
- Steuer nach § 14c UStG, soweit sie nicht gesetzlich für den Umsatz geschuldet wird.

► Niedrigerer Wert

Für den Vorsteuerabzug gilt grundsätzlich der niedrigere Betrag aus:

- gesetzlich geschuldeter Umsatzsteuer und
- in der Rechnung ausgewiesener Umsatzsteuer.

Beispiel:

Gesetzlich geschuldete Steuer:

1.900 €.

In der Rechnung ausgewiesen:

2.100 €.

Abziehbar sind höchstens:

1.900 €.

---

⇨ 20. Prüfung des Eingangsumsatzes

Vor dem Vorsteuerabzug muss der Eingangsumsatz auf Seiten des Leistenden geprüft werden.

Zu klären ist:

- Ist der Umsatz steuerbar?
- Ist er steuerpflichtig?
- Welcher Steuersatz gilt?
- Wer schuldet die Steuer?
- Wie hoch ist die gesetzlich geschuldete Steuer?

Merksatz:

**Die Höhe der Vorsteuer kann erst nach vollständiger Prüfung des Ausgangsumsatzes des Leistenden bestimmt werden.**

---

⇨ 21. Fremdwährungsrechnungen

Bei Rechnungen in fremder Währung ist die Umsatzsteuer nach § 16 Abs. 6 UStG in Euro umzurechnen.

Abziehbar ist nur die nach den deutschen umsatzsteuerlichen Vorschriften gesetzlich geschuldete Steuer.

---

⇨ 22. Leistungsbezug für das Unternehmen

Eine Leistung wird für das Unternehmen bezogen, wenn sie dazu bestimmt ist, der unternehmerischen Tätigkeit zu dienen.

Maßgeblich ist grundsätzlich die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs.

Nicht entscheidend ist zunächst eine später abweichende tatsächliche Verwendung.

► Prüfung

1. Welcher Ausgangstätigkeit soll die Eingangsleistung dienen?
2. Sind die geplanten Ausgangsumsätze steuerpflichtig oder steuerfrei?
3. Ist die Leistung dem Unternehmen zuzuordnen?
4. Liegt eine private Mitverwendung vor?

---

⇨ 23. Zusammenhang mit Ausgangsumsätzen

Der Vorsteuerabzug richtet sich nach dem direkten und unmittelbaren Zusammenhang der Eingangsleistung mit den geplanten Ausgangsumsätzen.

► Steuerpflichtige Ausgangsumsätze

Steht die Eingangsleistung ausschließlich mit steuerpflichtigen Ausgangsumsätzen in Zusammenhang, ist die Vorsteuer grundsätzlich abziehbar.

► Steuerfreie Ausschlussumsätze

Steht sie ausschließlich mit steuerfreien Umsätzen in Zusammenhang, die den Vorsteuerabzug nach § 15 Abs. 2 UStG ausschließen, ist die Vorsteuer grundsätzlich nicht abziehbar.

► Gemischte Verwendung

Dient die Eingangsleistung sowohl

- abzugsberechtigenden Umsätzen als auch
- Ausschlussumsätzen,

ist die Vorsteuer nach § 15 Abs. 4 UStG aufzuteilen.

---

⇨ 24. Beabsichtigte Verwendung

Für die erstmalige Beurteilung des Vorsteuerabzugs ist die im Zeitpunkt des Leistungsbezugs nachweisbare Verwendungsabsicht maßgeblich.

Beispiele:

- geplante steuerpflichtige Vermietung,
- geplante steuerfreie Vermietung,
- Nutzung für steuerpflichtige Beratungsumsätze,
- Nutzung für steuerfreie Heilbehandlungen.

Eine spätere Änderung der tatsächlichen Verwendung kann eine Vorsteuerberichtigung nach § 15a UStG auslösen.

---

⇨ 25. Unternehmensvermögen und Betriebsvermögen

Umsatzsteuerliches Unternehmensvermögen und ertragsteuerliches Betriebsvermögen sind nicht identisch.

► Betriebsvermögen

Zum Betriebsvermögen gehören Wirtschaftsgüter, die einem Gewerbebetrieb oder freien Beruf dienen.

► Unternehmensvermögen

Zum Unternehmensvermögen gehören Gegenstände, die dem Unternehmen im Sinne des § 2 UStG dienen.

Dadurch kann ein Gegenstand

- ertragsteuerlich Privatvermögen,
- umsatzsteuerlich aber Unternehmensvermögen

sein.

Beispiel:

Ein vermietetes Mehrfamilienhaus kann ertragsteuerlich Privatvermögen, umsatzsteuerlich jedoch Unternehmensvermögen sein.

---

⇨ 26. Zuordnung gemischt genutzter Gegenstände

Bei gemischt unternehmerisch und privat verwendeten Gegenständen kann ein Zuordnungswahlrecht bestehen.

Je nach Nutzungsanteil kommen in Betracht:

- vollständige Zuordnung zum Unternehmen,
- anteilige Zuordnung,
- vollständige Zuordnung zum Privatvermögen.

Die konkrete Zuordnung muss rechtzeitig und eindeutig dokumentiert werden.

Bei Grundstücken ist zusätzlich § 15 Abs. 1b UStG zu beachten.

---

⇨ 27. Ordnungsgemäße Rechnung

Für den Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 1 UStG muss der Leistungsempfänger grundsätzlich im Besitz einer ordnungsgemäßen Rechnung sein.

Die Rechnung muss den Anforderungen der §§ 14 und 14a UStG entsprechen.

Wesentliche Pflichtangaben sind insbesondere:

- vollständiger Name und Anschrift von Leistendem und Leistungsempfänger,
- Steuernummer oder Umsatzsteuer-Identifikationsnummer,
- Rechnungsdatum,
- fortlaufende Rechnungsnummer,
- Menge und Art der Lieferung oder Umfang und Art der sonstigen Leistung,
- Leistungszeitpunkt,
- nach Steuersätzen aufgeschlüsseltes Entgelt,
- Steuersatz,
- Steuerbetrag,
- ggf. Hinweis auf Steuerbefreiung oder Steuerschuldnerschaft.

---

⇨ 28. Fehlende Rechnungsangaben

Fehlen wesentliche Pflichtangaben nach § 14 Abs. 4 UStG, ist der Vorsteuerabzug grundsätzlich zunächst nicht zulässig.

Eine spätere Rechnungsberichtigung kann den Vorsteuerabzug ermöglichen.

Die Berichtigung muss grundsätzlich durch den Rechnungsaussteller erfolgen.

---

⇨ 29. Zu hoch ausgewiesene Umsatzsteuer

Ist in einer Rechnung mehr Umsatzsteuer ausgewiesen als gesetzlich geschuldet, darf der Leistungsempfänger grundsätzlich nur die gesetzlich geschuldete Steuer als Vorsteuer abziehen.

Der überhöhte Betrag ist keine abziehbare Vorsteuer.

Beispiel:

Gesetzlich geschuldete Umsatzsteuer:

700 €.

In der Rechnung ausgewiesen:

900 €.

Abziehbar:

höchstens 700 €.

---

⇨ 30. Zeitpunkt des Vorsteuerabzugs

► Grundsatz

Der Vorsteuerabzug ist in dem Voranmeldungszeitraum möglich, in dem beide Voraussetzungen erfüllt sind:

1. Die Leistung oder Teilleistung wurde ausgeführt.
2. Der Leistungsempfänger besitzt eine ordnungsgemäße Rechnung.

Der Zahlungszeitpunkt ist grundsätzlich unerheblich.

Merksatz:

**Leistung plus Rechnung entscheidet — nicht die Zahlung.**

---

⇨ 31. Beispiel zum Zeitpunkt des Vorsteuerabzugs

Leistungsausführung:

20. März.

Rechnungseingang:

8. April.

Zahlung:

30. April.

Der Vorsteuerabzug ist grundsätzlich erst im April möglich, weil erst dann

- die Leistung ausgeführt wurde und
- die Rechnung vorlag.

---

⇨ 32. Vorsteuerabzug bei Anzahlungen

Bei Anzahlungen ist der Vorsteuerabzug bereits vor Leistungsausführung möglich.

Voraussetzungen:

1. Der Leistungsempfänger hat die Anzahlung geleistet.
2. Er besitzt eine ordnungsgemäße Anzahlungsrechnung.
3. Die Leistung oder Teilleistung ist noch nicht ausgeführt.
4. Die spätere Leistung ist hinreichend bestimmt.

Rechtsgrundlage:

§ 15 Abs. 1 Satz 1 Nr. 1 Satz 3 UStG.

► Zeitpunkt

Der Vorsteuerabzug erfolgt im Voranmeldungszeitraum der Zahlung, sofern zu diesem Zeitpunkt die ordnungsgemäße Rechnung vorliegt.

Merksatz:

**Bei Anzahlungen ist für die Vorsteuer die Zahlung maßgeblich.**

---

⇨ 33. Gegenüberstellung Steuerentstehung und Vorsteuer bei Anzahlungen

► Leistender Unternehmer

Steuerentstehung mit Vereinnahmung der Anzahlung.

► Leistungsempfänger

Vorsteuerabzug mit Zahlung der Anzahlung und Besitz einer ordnungsgemäßen Rechnung.

Dadurch sollen Umsatzsteuer und Vorsteuer grundsätzlich zeitlich korrespondieren.

---

⇨ 34. Vorsteuerausschluss nach § 15 Abs. 2 UStG

Vorsteuerbeträge sind grundsätzlich nicht abziehbar, soweit die Eingangsleistungen für steuerfreie Ausgangsumsätze verwendet werden.

Typische Ausschlussumsätze:

- steuerfreie Grundstücksvermietung,
- steuerfreie Heilbehandlungen,
- steuerfreie Kreditgewährung,
- bestimmte Versicherungsumsätze,
- bestimmte Grundstücksveräußerungen.

Entscheidend ist der direkte und unmittelbare Zusammenhang zwischen Eingangs- und Ausgangsumsatz.

---

⇨ 35. Rückausnahmen nach § 15 Abs. 3 UStG

Bestimmte steuerfreie Umsätze führen trotz Steuerbefreiung nicht zum Ausschluss des Vorsteuerabzugs.

In diesen Fällen wird der Ausschluss des § 15 Abs. 2 UStG durch § 15 Abs. 3 UStG zurückgenommen.

Typische Fälle können insbesondere sein:

- Ausfuhrlieferungen,
- innergemeinschaftliche Lieferungen,
- bestimmte grenzüberschreitende Umsätze.

Merksatz:

**Steuerfrei bedeutet nicht automatisch: keine Vorsteuer.**

---

⇨ 36. Aufteilung von Vorsteuerbeträgen

► Grundsatz

Eine Aufteilung nach § 15 Abs. 4 UStG ist erforderlich, wenn eine Eingangsleistung sowohl

- für abzugsberechtigende Umsätze als auch
- für vorsteuerschädliche Ausschlussumsätze

verwendet wird.

► Vorrang der direkten Zuordnung

Zunächst ist stets zu prüfen, ob die Vorsteuer direkt einem bestimmten Ausgangsumsatz zugeordnet werden kann.

⇶  Direkter Zusammenhang mit Abzugsumsätzen

Vorsteuer vollständig abziehbar.

⇶  Direkter Zusammenhang mit Ausschlussumsätzen

Vorsteuer grundsätzlich nicht abziehbar, sofern keine Rückausnahme nach § 15 Abs. 3 UStG greift.

⇶  Gemischter Zusammenhang

Aufteilung nach § 15 Abs. 4 UStG.

---

⇨ 37. Prüfungsschema Vorsteueraufteilung

1. Eingangsleistung für das Unternehmen?
2. Direkte Zuordnung möglich?
3. Ausschließliche Verwendung für abzugsberechtigende Umsätze?
   - Vorsteuer vollständig abziehbar.
4. Ausschließliche Verwendung für Ausschlussumsätze?
   - Vorsteuer grundsätzlich nicht abziehbar.
5. Gemischte Verwendung?
   - Aufteilung nach § 15 Abs. 4 UStG.
6. Sachgerechten Aufteilungsmaßstab bestimmen.
7. Rückausnahmen nach § 15 Abs. 3 UStG prüfen.

---

⇨ 38. Aufteilungsmaßstab

Die Aufteilung ist nach einer sachgerechten Schätzung vorzunehmen.

Mögliche Maßstäbe:

- Nutzfläche,
- Wohnfläche,
- Zeitanteile,
- Stückzahlen,
- Personalaufwand,
- tatsächliche Verwendung,
- andere wirtschaftlich nachvollziehbare Kriterien.

Der Umsatzschlüssel ist nur zulässig, wenn keine andere wirtschaftlich präzisere Zuordnung möglich ist.

Merksatz:

**Der Umsatzschlüssel ist regelmäßig nur eine Auffanglösung.**

---

⇨ 39. Aufteilung bei Gebäuden

► Direkte Zuordnung

Kann eine Eingangsleistung einem bestimmten Gebäudeteil direkt zugeordnet werden, ist keine Aufteilung erforderlich.

Beispiel:

Renovierung ausschließlich eines steuerpflichtig vermieteten Ladenlokals.

Folge:

Vorsteuer grundsätzlich vollständig abziehbar.

► Keine direkte Zuordnung

Bei Kosten, die das gesamte Gebäude betreffen, ist eine Aufteilung erforderlich.

Beispiele:

- Herstellungskosten des Gesamtgebäudes,
- Dachsanierung,
- Fassadenerneuerung,
- zentrale Heizungsanlage,
- allgemeine Erhaltungsaufwendungen.

Bei Gebäuden ist häufig das Verhältnis der Nutzflächen ein sachgerechter Aufteilungsmaßstab.

---

⇨ 40. Herstellungskosten eines Gebäudes

Bei Anschaffungs- oder Herstellungskosten eines gemischt genutzten Gebäudes ist regelmäßig eine Gesamtbetrachtung erforderlich.

Ist keine direkte Zuordnung zu einzelnen Bereichen möglich, wird die Vorsteuer häufig nach dem Verhältnis der Nutzflächen aufgeteilt.

Ein einmal gewählter sachgerechter Aufteilungsmaßstab kann für Folgejahre bindende Wirkung haben.

---

⇨ 41. Erhaltungsaufwendungen

Bei Erhaltungsaufwendungen ist vorrangig zu prüfen, ob sie einem konkreten Gebäudeteil zugeordnet werden können.

Beispiel:

Reparatur ausschließlich in einer steuerpflichtig vermieteten Büroeinheit.

Folge:

Vorsteuer vollständig abziehbar.

Beispiel:

Sanierung des gesamten Daches eines gemischt genutzten Gebäudes.

Folge:

Vorsteueraufteilung erforderlich.

---

⇨ 42. Weitere abziehbare Vorsteuerbeträge

Neben § 15 Abs. 1 Satz 1 Nr. 1 UStG bestehen weitere Vorsteuerabzugstatbestände.

► Einfuhrumsatzsteuer

Nach § 15 Abs. 1 Satz 1 Nr. 2 UStG kann die für die Einfuhr eines Gegenstands entrichtete Einfuhrumsatzsteuer als Vorsteuer abziehbar sein.

Voraussetzung:

Einfuhr für das Unternehmen.

► Innergemeinschaftlicher Erwerb

Nach § 15 Abs. 1 Satz 1 Nr. 3 UStG kann die Steuer für einen innergemeinschaftlichen Erwerb als Vorsteuer abziehbar sein.

Voraussetzung ist insbesondere, dass der innergemeinschaftliche Erwerb im Inland steuerbar ist.

► Reverse Charge

Nach § 15 Abs. 1 Satz 1 Nr. 4 UStG kann die vom Leistungsempfänger nach § 13b UStG geschuldete Umsatzsteuer als Vorsteuer abziehbar sein.

Voraussetzung:

Die Leistung wird für das Unternehmen bezogen und es greift kein Vorsteuerausschluss.

► Rechnungserfordernis

In diesen Fällen ist nicht immer eine Rechnung im Sinne des § 14 UStG Voraussetzung für den Vorsteuerabzug, weil der Leistungsempfänger selbst Steuerschuldner ist oder die Steuer bei der Einfuhr entsteht.

---

⇨ 43. Besonderheiten nach § 15 Abs. 1a UStG

► Grundsatz

Vorsteuerbeträge, die mit nicht abziehbaren Betriebsausgaben im Sinne des § 4 Abs. 5 EStG zusammenhängen, können umsatzsteuerlich vom Abzug ausgeschlossen sein.

► Geschenke

Vorsteuer aus nicht abzugsfähigen Geschenken kann vollständig vom Vorsteuerabzug ausgeschlossen sein.

► Bewirtungsaufwendungen

Bei unangemessenen Bewirtungsaufwendungen kann der Vorsteuerabzug insoweit ausgeschlossen sein, wie die Aufwendungen unangemessen sind.

Prüfung:

1. Liegt eine Betriebsausgabe nach § 4 Abs. 5 EStG vor?
2. Ist diese ertragsteuerlich nicht abzugsfähig?
3. Greift § 15 Abs. 1a UStG?
4. Welcher Anteil der Vorsteuer ist nicht abziehbar?

---

⇨ 44. Grundstücke mit privater Mitverwendung

► § 15 Abs. 1b UStG

Wird ein Grundstück sowohl

- unternehmerisch als auch
- für unternehmensfremde Zwecke

verwendet, ist der Vorsteuerabzug auf den unternehmerisch verwendeten Anteil begrenzt.

Dies gilt insbesondere bei privater Nutzung eines Gebäudeteils.

► Beispiel

Ein Unternehmer errichtet ein Gebäude.

Nutzung:

- 60 % betrieblich,
- 40 % privat.

Der Vorsteuerabzug ist grundsätzlich auf den betrieblich verwendeten Anteil begrenzt.

Auch bei vollständiger Zuordnung zum Unternehmen führt § 15 Abs. 1b UStG zu einer Beschränkung auf den unternehmerischen Nutzungsanteil.

---

⇨ 45. Private Nutzung durch Personal

Auch eine Verwendung für den privaten Bedarf des Personals kann zu einer Vorsteuerbeschränkung führen.

Zu prüfen ist, ob die Eingangsleistung

- tatsächlich unternehmerischen Zwecken oder
- privaten bzw. unternehmensfremden Zwecken

dient.

---

⇨ 46. Typische Klausurfallen

► Fehler 1: Steuerentstehung an die Rechnungsstellung knüpfen

Bei der Sollbesteuerung ist grundsätzlich die Leistungsausführung maßgeblich.

---

► Fehler 2: Zahlung bei normaler Leistungsausführung für entscheidend halten

Der Zahlungszeitpunkt ist bei der Sollbesteuerung grundsätzlich unerheblich.

Ausnahme:

Anzahlung vor Leistungsausführung.

---

► Fehler 3: Abschlagszahlung mit Teilleistung verwechseln

Eine Zahlung allein begründet noch keine Teilleistung.

---

► Fehler 4: Anzahlungssteuer erst bei Rechnungsstellung erfassen

Beim Leistenden entsteht die Steuer grundsätzlich mit Vereinnahmung des Entgelts.

---

► Fehler 5: Vorsteuer bei Anzahlung ohne Zahlung abziehen

Für den Anzahlungs-Vorsteuerabzug muss die Anzahlung tatsächlich geleistet worden sein.

---

► Fehler 6: Vorsteuer ohne Rechnung abziehen

Bei § 15 Abs. 1 Satz 1 Nr. 1 UStG ist grundsätzlich eine ordnungsgemäße Rechnung erforderlich.

---

► Fehler 7: Zu hoch ausgewiesene Steuer vollständig abziehen

Abziehbar ist grundsätzlich höchstens die gesetzlich geschuldete Steuer.

---

► Fehler 8: Nur den Eingangsbeleg prüfen

Die gesetzlich geschuldete Steuer kann erst nach Prüfung des Ausgangsumsatzes des Leistenden bestimmt werden.

---

► Fehler 9: Spätere tatsächliche Nutzung für die erstmalige Zuordnung verwenden

Maßgeblich ist grundsätzlich die Verwendungsabsicht im Zeitpunkt des Leistungsbezugs.

---

► Fehler 10: Sofort einen Umsatzschlüssel anwenden

Zunächst ist immer die direkte Zuordnung zu prüfen.

---

► Fehler 11: Gemischte Vorsteuer vollständig abziehen

Bei Verwendung für Abzugs- und Ausschlussumsätze ist § 15 Abs. 4 UStG zu prüfen.

---

► Fehler 12: Steuerfreie Umsätze automatisch als vorsteuerschädlich behandeln

Rückausnahmen nach § 15 Abs. 3 UStG sind zu prüfen.

---

► Fehler 13: Betriebsvermögen und Unternehmensvermögen gleichsetzen

Die Begriffe gehören zu unterschiedlichen Steuerarten und können voneinander abweichen.

---

► Fehler 14: Grundstück vollständig dem Unternehmen zuordnen und volle Vorsteuer abziehen

Bei privater Mitverwendung begrenzt § 15 Abs. 1b UStG den Vorsteuerabzug.

---

⇨ 47. Prüfungsschema Steuerentstehung

1. Art der Leistung bestimmen.
2. Leistungsort bestimmen.
3. Leistungszeitpunkt bestimmen.
4. Steuerbarkeit prüfen.
5. Steuerbefreiung prüfen.
6. Steuersatz bestimmen.
7. Bemessungsgrundlage berechnen.
8. Steuerschuldner bestimmen.
9. Teilleistung vorhanden?
10. Anzahlung vor Leistungsausführung?
11. Voranmeldungszeitraum der Steuerentstehung bestimmen.

---

⇨ 48. Prüfungsschema Vorsteuerabzug

1. Leistungsempfänger ist Unternehmer?
2. Leistung wurde von einem anderen Unternehmer ausgeführt?
3. Gesetzlich geschuldete Umsatzsteuer?
4. Leistung für das Unternehmen bezogen?
5. Verwendungsabsicht feststellen.
6. Ordnungsgemäße Rechnung vorhanden?
7. Zeitpunkt des Vorsteuerabzugs bestimmen.
8. Vorsteuerausschluss nach § 15 Abs. 2 UStG?
9. Rückausnahme nach § 15 Abs. 3 UStG?
10. Gemischte Verwendung und Aufteilung nach § 15 Abs. 4 UStG?
11. Besondere Ausschlüsse nach § 15 Abs. 1a oder Abs. 1b UStG?
12. Gegebenenfalls Vorsteuerberichtigung nach § 15a UStG prüfen.

---

⇨ 49. Merksätze

- Bei der Sollbesteuerung entsteht die Steuer grundsätzlich mit Leistungsausführung.
- Die Rechnung ist für die Steuerentstehung regelmäßig nicht entscheidend.
- Der Zahlungszeitpunkt ist bei normalen Leistungen unerheblich.
- Bei Anzahlungen entsteht die Steuer bereits mit Vereinnahmung.
- Teilleistung und Abschlagszahlung sind nicht dasselbe.
- Für den Vorsteuerabzug braucht der Leistungsempfänger grundsätzlich Leistung und Rechnung.
- Bei Anzahlungen braucht er Zahlung und Anzahlungsrechnung.
- Abziehbar ist nur die gesetzlich geschuldete Umsatzsteuer.
- Zu hoch ausgewiesene Umsatzsteuer ist nicht vollständig als Vorsteuer abziehbar.
- Die beabsichtigte Verwendung im Zeitpunkt des Leistungsbezugs ist entscheidend.
- Direkte Zuordnung geht vor Aufteilung.
- § 15 Abs. 4 UStG greift nur bei gemischter Verwendung.
- Steuerfreie Umsätze können über § 15 Abs. 3 UStG dennoch zum Vorsteuerabzug berechtigen.
- Einfuhrumsatzsteuer, innergemeinschaftlicher Erwerb und § 13b-Steuer besitzen eigene Vorsteuerabzugstatbestände.
- Bei gemischt genutzten Grundstücken begrenzt § 15 Abs. 1b UStG den Vorsteuerabzug.
`
},
{
  id: "umsatzsteuer-option-vermietung-veraeusserung-9-ustg",

  title:
    "Option zur Umsatzsteuer bei Grundstücksvermietung und Grundstücksveräußerung",

  short:
    "Prüfung des Verzichts auf die Steuerbefreiung nach § 9 UStG bei Vermietung und Veräußerung von Grundstücken einschließlich § 9 Abs. 2, Altgebäuderegelung des § 27 Abs. 2, notarieller Option und Reverse Charge nach § 13b UStG.",

  category: "Umsatzsteuer / Grundstücke",

  source:
    "Interne Steuerstoff-Wissensdatenbank – Grundstücksumsätze und Option nach § 9 UStG",

  keywords:
    "§ 9 ustg|option umsatzsteuer|verzicht steuerbefreiung|grundstücksvermietung|vermietung|verpachtung|grundstücksveräußerung|grundstücksverkauf|§ 4 nr. 12 ustg|§ 4 nr. 9a ustg|§ 9 abs. 1 ustg|§ 9 abs. 2 ustg|§ 9 abs. 3 ustg|§ 27 abs. 2 ustg|altgebäude|altfall|vorsteuerunschädliche verwendung|ausschlussumsätze|5 prozent bagatellgrenze|arzt|bank|rechtsanwalt|wohnraumvermietung|zwischenvermietung|notarvertrag|zwangsversteigerung|reverse charge|§ 13b abs. 2 nr. 3 ustg|grundstücksteile|mietvertrag|vorsteuerabzug|vorsteuerberichtigung|§ 15a ustg",

  references: [
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 4 Nr. 12 Satz 1 Buchst. a UStG",
    "§ 9 Abs. 1 UStG",
    "§ 9 Abs. 2 UStG",
    "§ 9 Abs. 3 UStG",
    "§ 13b Abs. 2 Nr. 3 UStG",
    "§ 13b Abs. 5 UStG",
    "§ 14a Abs. 5 UStG",
    "§ 14c UStG",
    "§ 15 Abs. 1 UStG",
    "§ 15 Abs. 2 UStG",
    "§ 15 Abs. 4 UStG",
    "§ 15a UStG",
    "§ 27 Abs. 2 UStG",
    "Abschn. 9.1 UStAE",
    "Abschn. 9.2 UStAE",
    "Abschn. 13b.11 UStAE",
    "Abschn. 13b.12 UStAE",
    "Abschn. 13b.14 UStAE",
    "Abschn. 15a.2 UStAE"
  ],

  body: `
⇨ Option zur Umsatzsteuer bei Grundstücksvermietung und Grundstücksveräußerung

► 1. Grundidee der Option

Bestimmte Umsätze sind nach § 4 UStG grundsätzlich von der Umsatzsteuer befreit.

Die Steuerbefreiung kann für den leistenden Unternehmer nachteilig sein, weil die mit dem Umsatz zusammenhängenden Vorsteuerbeträge regelmäßig nach § 15 Abs. 2 UStG nicht abziehbar sind.

§ 9 UStG ermöglicht deshalb unter bestimmten Voraussetzungen den Verzicht auf die Steuerbefreiung.

Der ursprünglich steuerfreie Umsatz wird dann als steuerpflichtig behandelt.

Folgen der wirksamen Option können sein:

- der Ausgangsumsatz wird steuerpflichtig,
- der Vorsteuerausschluss nach § 15 Abs. 2 UStG entfällt,
- Vorsteuer aus Herstellung, Erwerb, Sanierung oder laufenden Kosten kann abziehbar sein,
- bei einer späteren Nutzungsänderung kann § 15a UStG zu prüfen sein.

Die Option ist kein eigener Umsatz.

Sie verändert lediglich die umsatzsteuerliche Behandlung eines nach § 4 UStG grundsätzlich steuerfreien Umsatzes.

---

⇨ 2. Grundvoraussetzungen des § 9 Abs. 1 UStG

Eine Option ist nur bei den ausdrücklich in § 9 Abs. 1 UStG genannten Steuerbefreiungen möglich.

Hierzu gehören insbesondere:

- Grundstücksveräußerungen nach § 4 Nr. 9 Buchst. a UStG,
- Vermietung und Verpachtung nach § 4 Nr. 12 UStG,
- bestimmte Finanzumsätze nach § 4 Nr. 8 UStG.

Zusätzlich muss der Umsatz

1. an einen anderen Unternehmer und
2. für dessen Unternehmen

ausgeführt werden.

► Nicht ausreichend

Eine Option ist grundsätzlich nicht möglich bei einer Leistung

- an eine Privatperson,
- an einen Unternehmer für dessen privaten Bereich,
- an einen Arbeitnehmer für dessen privaten Bedarf,
- an eine juristische Person für einen ausschließlich nichtunternehmerischen Bereich.

► Merksatz

§ 9 Abs. 1 UStG verlangt immer:

**optionsfähiger Umsatz + Unternehmer als Empfänger + Leistungsbezug für dessen Unternehmen.**

---

⇨ 3. Option ist umsatzbezogen

Der Unternehmer kann grundsätzlich für jeden einzelnen optionsfähigen Umsatz entscheiden, ob er auf die Steuerbefreiung verzichtet.

Die Option kann daher beispielsweise

- auf einzelne Grundstücke,
- auf einzelne Mietverhältnisse,
- auf einzelne Etagen,
- auf einzelne Räume oder
- auf räumlich selbständig nutzbare Grundstücksteile

beschränkt werden.

Eine einheitliche Option für das gesamte Unternehmen ist nicht erforderlich.

---

⇨ 4. Option bei Grundstücksvermietung

Die Vermietung und Verpachtung von Grundstücken ist grundsätzlich nach § 4 Nr. 12 Satz 1 Buchst. a UStG steuerfrei.

Eine Option kann zunächst nach § 9 Abs. 1 UStG in Betracht kommen.

Zusätzlich gilt für Grundstücksvermietungen die besondere Einschränkung des § 9 Abs. 2 UStG.

► Prüfung der Vermietungsoption

1. Liegt eine steuerfreie Grundstücksvermietung nach § 4 Nr. 12 UStG vor?
2. Erfolgt die Vermietung an einen anderen Unternehmer?
3. Bezieht der Mieter das Grundstück für sein Unternehmen?
4. Verwendet der Mieter das Grundstück für Umsätze, die den Vorsteuerabzug nicht ausschließen?
5. Falls nein: Ist § 9 Abs. 2 UStG aufgrund der Altgebäuderegelung des § 27 Abs. 2 UStG nicht anzuwenden?

---

⇨ 5. Erste Stufe: Steuerfreie Grundstücksvermietung

Zunächst muss tatsächlich ein nach § 4 Nr. 12 UStG steuerfreier Vermietungsumsatz vorliegen.

Ist der Umsatz bereits kraft Gesetzes steuerpflichtig, wird § 9 UStG nicht benötigt.

► Bereits steuerpflichtige Vermietungsumsätze

Hierzu können insbesondere gehören:

- kurzfristige Beherbergung von Fremden,
- Vermietung von Betriebsvorrichtungen,
- Vermietung von Fahrzeugabstellplätzen außerhalb einer einheitlichen steuerfreien Grundstücksvermietung,
- bestimmte kurzfristige Campingplatzvermietungen.

► Merksatz

Nur ein steuerfreier Umsatz kann durch Option steuerpflichtig werden.

---

⇨ 6. Zweite Stufe: Vermietung an einen Unternehmer

Der Mieter muss Unternehmer im Sinne des § 2 UStG sein.

Bei einer unmittelbaren Vermietung an eine Privatperson ist die Option nach § 9 Abs. 1 UStG ausgeschlossen.

► Beispiel

V vermietet eine Wohnung unmittelbar an eine Privatperson.

Die Vermietung ist nach § 4 Nr. 12 Satz 1 Buchst. a UStG steuerfrei.

Eine Option ist nicht möglich, weil der Leistungsempfänger kein Unternehmer ist.

---

⇨ 7. Dritte Stufe: Bezug für das Unternehmen des Mieters

Der Mieter muss die Mietleistung für sein Unternehmen beziehen.

Die bloße Unternehmereigenschaft des Mieters reicht nicht aus.

► Beispiel

V vermietet eine Ferienwohnung an einen selbständigen Rechtsanwalt, der sie ausschließlich privat nutzt.

Der Rechtsanwalt ist zwar Unternehmer.

Die Wohnung wird jedoch nicht für sein Unternehmen gemietet.

Eine Option nach § 9 Abs. 1 UStG ist nicht möglich.

---

⇨ 8. Einschränkung nach § 9 Abs. 2 UStG

Bei der Vermietung oder Verpachtung eines Grundstücks ist die Option nur zulässig, soweit der Leistungsempfänger das Grundstück ausschließlich für Umsätze verwendet oder zu verwenden beabsichtigt, die den Vorsteuerabzug nicht ausschließen.

Entscheidend ist die Nutzung durch den Mieter.

► Vorsteuerunschädliche Nutzung

Vorsteuerunschädlich sind insbesondere Nutzungen für

- steuerpflichtige Ausgangsumsätze,
- steuerfreie Ausgangsumsätze mit Vorsteuerabzug,
- Ausfuhrlieferungen,
- innergemeinschaftliche Lieferungen,
- andere Umsätze, die nach § 15 Abs. 3 UStG den Vorsteuerabzug nicht ausschließen.

► Vorsteuerschädliche Nutzung

Vorsteuerschädlich sind insbesondere Nutzungen für

- steuerfreie Heilbehandlungen,
- steuerfreie Bank- und Kreditumsätze,
- steuerfreie Versicherungsumsätze,
- steuerfreie Wohnraumvermietung,
- nichtunternehmerische Tätigkeiten,
- private Wohnzwecke.

---

⇨ 9. Maßgeblich ist die Verwendung des Mieters

Für § 9 Abs. 2 UStG ist nicht entscheidend, welche Umsätze der Vermieter ausführt.

Entscheidend ist, wofür der Mieter das Grundstück tatsächlich verwendet oder nachweisbar zu verwenden beabsichtigt.

► Beispiel

V vermietet Büroräume an einen Rechtsanwalt.

Der Rechtsanwalt verwendet die Räume ausschließlich für seine steuerpflichtige Rechtsberatung.

Die Voraussetzungen des § 9 Abs. 2 UStG sind erfüllt.

V kann die Vermietung steuerpflichtig behandeln.

---

⇨ 10. Vermietung an einen Arzt

V vermietet Praxisräume an einen Arzt.

Der Arzt nutzt die Räume ausschließlich für steuerfreie Heilbehandlungen nach § 4 Nr. 14 UStG.

Die Heilbehandlungsumsätze schließen den Vorsteuerabzug grundsätzlich aus.

Eine Option ist nach § 9 Abs. 2 UStG grundsätzlich nicht möglich.

Eine Ausnahme kann nur in Betracht kommen, wenn die Altgebäuderegelung des § 27 Abs. 2 UStG erfüllt ist.

---

⇨ 11. Vermietung an eine Bank

V vermietet Geschäftsräume an eine Bank.

Die Bank verwendet die Räume für steuerfreie Bank- oder Kreditumsätze, die den Vorsteuerabzug ausschließen.

Die Option ist nach § 9 Abs. 2 UStG grundsätzlich ausgeschlossen.

Auch hier kann eine Altgebäuderegelung gesondert zu prüfen sein.

---

⇨ 12. Vermietung an einen Rechtsanwalt

V vermietet Büroräume an einen Rechtsanwalt.

Der Rechtsanwalt erbringt in den Räumen steuerpflichtige Beratungsleistungen.

Da die Nutzung den Vorsteuerabzug nicht ausschließt, kann V unter den Voraussetzungen des § 9 Abs. 1 und 2 UStG optieren.

---

⇨ 13. Vermietung an eine Behörde

V vermietet Räume unmittelbar an eine Behörde, die diese für hoheitliche beziehungsweise nichtunternehmerische Tätigkeiten nutzt.

Die Leistung wird nicht für eine unternehmerische Tätigkeit des Leistungsempfängers bezogen.

Bereits § 9 Abs. 1 UStG ist grundsätzlich nicht erfüllt.

Eine Option ist daher nicht möglich.

---

⇨ 14. Zwischenvermietung

Besondere Vorsicht ist bei einer Vermietungskette erforderlich.

► Beispiel

V1 vermietet ein Gebäude an V2.

V2 vermietet das Gebäude anschließend an Privatpersonen weiter.

Die Vermietung von V1 an V2 erfolgt zwar an einen Unternehmer für dessen Vermietungsunternehmen.

§ 9 Abs. 1 UStG ist damit grundsätzlich erfüllt.

V2 verwendet das Gebäude jedoch für steuerfreie Wohnraumvermietungen, die den Vorsteuerabzug ausschließen.

Die Option des V1 ist deshalb grundsätzlich nach § 9 Abs. 2 UStG ausgeschlossen.

Eine Ausnahme kann bei einem Altgebäude nach § 27 Abs. 2 UStG bestehen.

---

⇨ 15. Räumliche Aufteilung

Werden verschiedene Grundstücksteile unterschiedlich genutzt, ist die Option grundsätzlich für jeden selbständig nutzbaren Grundstücksteil gesondert zu prüfen.

Selbständig nutzbare Grundstücksteile können sein:

- einzelne Etagen,
- einzelne Wohnungen,
- getrennte Ladengeschäfte,
- Büroräume,
- Praxisräume,
- räumlich abgrenzbare Hallenbereiche.

► Beispiel

Ein Gebäude wird vermietet:

- Erdgeschoss an eine Bank,
- 1. Obergeschoss an einen Arzt,
- 2. Obergeschoss an einen Rechtsanwalt.

Ergebnis:

- Bank: Option grundsätzlich ausgeschlossen,
- Arzt: Option grundsätzlich ausgeschlossen,
- Rechtsanwalt: Option grundsätzlich möglich.

Die Option kann auf das 2. Obergeschoss beschränkt werden.

---

⇨ 16. Zeitlich unterschiedliche Nutzung

Auch zeitlich unterschiedliche Nutzungen können getrennt zu beurteilen sein.

► Beispiel

Eine Halle wird zunächst steuerpflichtig an einen Produktionsbetrieb vermietet.

Später wird sie steuerfrei an einen Arzt vermietet.

Die Änderung der Nutzung kann insbesondere Auswirkungen haben auf

- die weitere Zulässigkeit der Option,
- den Vorsteuerabzug,
- eine Vorsteuerberichtigung nach § 15a UStG.

---

⇨ 17. Gemischte Verwendung

Nutzt der Mieter dieselben Räume sowohl für

- vorsteuerunschädliche als auch
- vorsteuerschädliche Umsätze,

ist § 9 Abs. 2 UStG besonders sorgfältig zu prüfen.

Nach dem Gesetz wird grundsätzlich eine ausschließliche Verwendung für vorsteuerunschädliche Umsätze verlangt.

► Bagatellgrenze der Finanzverwaltung

Nach der Verwaltungsauffassung kann eine geringfügige vorsteuerschädliche Nutzung unschädlich sein.

Dies wird grundsätzlich angenommen, wenn höchstens 5 Prozent der auf den Mietzins entfallenden Umsatzsteuer beim Mieter vom Vorsteuerabzug ausgeschlossen wären.

Diese 5-Prozent-Grenze ist eine Verwaltungs- und Härtefallregelung.

Sie ersetzt nicht die grundsätzliche Prüfung der tatsächlichen Verwendung.

---

⇨ 18. Nachweis der Verwendung

Der Vermieter muss die Voraussetzungen der Option nachweisen können.

Der Nachweis ist grundsätzlich nicht an eine bestimmte Form gebunden.

Geeignete Nachweise können sein:

- Regelung im Mietvertrag,
- schriftliche Bestätigung des Mieters,
- Beschreibung der Tätigkeit des Mieters,
- Umsatzsteuererklärungen oder andere Unterlagen,
- Aufteilung der gemieteten Flächen,
- Angaben zu steuerfreien und steuerpflichtigen Umsätzen,
- jährliche Bestätigung bei unsicherer oder wechselnder Nutzung.

► Empfehlenswerte Mietvertragsklausel

Der Mieter bestätigt, dass er die Mietflächen ausschließlich für Umsätze verwendet, die den Vorsteuerabzug nicht ausschließen.

Der Mieter verpflichtet sich, Änderungen der Nutzung unverzüglich mitzuteilen.

---

⇨ 19. Rechtsfolge einer wirksamen Vermietungsoption

Ist die Option wirksam, wird die Vermietung als steuerpflichtig behandelt.

Der Vermieter muss grundsätzlich

- Umsatzsteuer auf die Miete berechnen,
- die Umsatzsteuer anmelden und abführen,
- eine ordnungsgemäße Rechnung ausstellen.

Regelmäßig gilt der Steuersatz von 19 Prozent.

Der Vermieter kann die mit dem steuerpflichtigen Vermietungsumsatz zusammenhängenden Vorsteuerbeträge nach den allgemeinen Voraussetzungen des § 15 UStG abziehen.

---

⇨ 20. Altgebäuderegelung nach § 27 Abs. 2 UStG

§ 27 Abs. 2 UStG enthält eine Übergangsregelung für bestimmte ältere Gebäude.

Sind die Voraussetzungen erfüllt, ist § 9 Abs. 2 UStG nicht anzuwenden.

Das bedeutet:

Die Nutzung des Mieters für vorsteuerschädliche Umsätze verhindert die Option dann nicht.

► Wichtig

§ 27 Abs. 2 UStG beseitigt nur die Einschränkung des § 9 Abs. 2 UStG.

Die Voraussetzungen des § 9 Abs. 1 UStG müssen weiterhin erfüllt sein.

Der Umsatz muss daher weiterhin

- an einen Unternehmer und
- für dessen Unternehmen

ausgeführt werden.

► Besonders wichtiger Merksatz

§ 27 Abs. 2 UStG ist keine zusätzliche Voraussetzung für eine normale Option.

Die Vorschrift ist nur eine Ausnahme für Altfälle, in denen § 9 Abs. 2 UStG die Option sonst ausschließen würde.

---

⇨ 21. Altfall: Nutzung zu Wohnzwecken

§ 9 Abs. 2 UStG ist nicht anzuwenden, wenn

1. das Gebäude Wohnzwecken dient oder zu dienen bestimmt ist,
2. das Gebäude vor dem 1. April 1985 fertiggestellt wurde und
3. mit seiner Errichtung vor dem 1. Juni 1984 begonnen wurde.

► Beispiel

V1 vermietet ein altes Wohngebäude an den Unternehmer V2.

V2 vermietet die Wohnungen steuerfrei an Privatpersonen weiter.

§ 9 Abs. 1 UStG kann bei der Vermietung von V1 an V2 erfüllt sein.

Grundsätzlich würde § 9 Abs. 2 UStG die Option ausschließen.

Sind die Altgebäudevoraussetzungen erfüllt, ist § 9 Abs. 2 UStG nicht anzuwenden.

V1 kann dann grundsätzlich nach § 9 Abs. 1 UStG optieren.

► Achtung

Die unmittelbare Vermietung durch V2 an die Privatpersonen bleibt nicht optionsfähig, weil die Privatpersonen keine Unternehmer sind.

---

⇨ 22. Altfall: Andere nichtunternehmerische Endnutzung

§ 9 Abs. 2 UStG ist nicht anzuwenden, wenn

1. das Gebäude anderen nichtunternehmerischen Zwecken dient,
2. das Gebäude vor dem 1. Januar 1986 fertiggestellt wurde und
3. mit der Errichtung vor dem 1. Juni 1984 begonnen wurde.

Dies kann insbesondere bei bestimmten Vermietungsketten mit einer nichtunternehmerischen Nutzung auf der Endstufe relevant sein.

---

⇨ 23. Altfall: Andere vorsteuerschädliche Nutzung

Für andere vorsteuerschädliche Nutzungen ist § 9 Abs. 2 UStG nicht anzuwenden, wenn

1. das Gebäude vor dem 1. Januar 1998 fertiggestellt wurde und
2. mit der Errichtung vor dem 11. November 1993 begonnen wurde.

Typische Nutzer können sein:

- Ärzte,
- Banken,
- Versicherungsunternehmen,
- Bausparkassenvertreter,
- andere Unternehmer mit steuerfreien Ausschlussumsätzen.

---

⇨ 24. Übersicht der Altgebäudegrenzen

► Wohnzwecke

Fertigstellung:

vor dem 1. April 1985.

Beginn der Errichtung:

vor dem 1. Juni 1984.

► Andere nichtunternehmerische Zwecke

Fertigstellung:

vor dem 1. Januar 1986.

Beginn der Errichtung:

vor dem 1. Juni 1984.

► Sonstige vorsteuerschädliche Zwecke

Fertigstellung:

vor dem 1. Januar 1998.

Beginn der Errichtung:

vor dem 11. November 1993.

---

⇨ 25. Beginn der Errichtung

Als Beginn der Errichtung kann nach der Verwaltungsauffassung insbesondere der früheste der folgenden Zeitpunkte gelten:

- Beginn der Ausschachtungsarbeiten,
- Erteilung eines hinreichend konkretisierten Bauauftrags,
- Anfuhr nicht unbedeutender Mengen von Baumaterial auf den Bauplatz.

Nicht ausreichend sind grundsätzlich allein:

- Stellung eines Bauantrags,
- Erteilung einer Baugenehmigung,
- bloße Planungsarbeiten,
- Finanzierungsgespräche,
- vorbereitende Abbrucharbeiten ohne unmittelbaren Neubau.

---

⇨ 26. Anbau, Aufstockung und umfassende Sanierung

Wird durch einen Anbau oder eine Aufstockung ertragsteuerlich ein selbständiges Wirtschaftsgut geschaffen, ist für diesen Gebäudeteil die Altgebäuderegelung gesondert zu prüfen.

Dasselbe gilt, wenn ein Gebäude so umfassend saniert oder umgebaut wird, dass ertragsteuerlich ein neues beziehungsweise anderes Wirtschaftsgut entsteht.

Ein altes Stammgebäude kann daher unter die Altfallregelung fallen, während ein später errichteter Anbau den neueren Optionsbeschränkungen unterliegt.

---

⇨ 27. Entscheidungsschema Vermietung

► Schritt 1

Liegt ein steuerfreier Vermietungsumsatz nach § 4 Nr. 12 UStG vor?

- Nein: § 9 UStG wird nicht benötigt.
- Ja: weiter mit Schritt 2.

► Schritt 2

Wird an einen anderen Unternehmer vermietet?

- Nein: Option nach § 9 Abs. 1 UStG nicht möglich.
- Ja: weiter mit Schritt 3.

► Schritt 3

Bezieht der Mieter die Leistung für sein Unternehmen?

- Nein: Option nach § 9 Abs. 1 UStG nicht möglich.
- Ja: weiter mit Schritt 4.

► Schritt 4

Verwendet der Mieter das Grundstück für Umsätze, die den Vorsteuerabzug nicht ausschließen?

- Ja: Option nach § 9 Abs. 1 und 2 UStG möglich.
- Nein: weiter mit Schritt 5.

► Schritt 5

Greift die Altgebäuderegelung nach § 27 Abs. 2 UStG?

- Ja: § 9 Abs. 2 UStG ist nicht anzuwenden; Option nach § 9 Abs. 1 UStG kann möglich sein.
- Nein: Option aufgrund des § 9 Abs. 2 UStG nicht möglich.

---

⇨ 28. Fachlich falscher Prüfungsweg

Nicht richtig wäre folgende Prüfung:

1. Der Mieter verwendet das Grundstück für steuerpflichtige Umsätze.
2. Danach wird zusätzlich verlangt, dass § 27 Abs. 2 UStG erfüllt ist.

§ 27 Abs. 2 UStG ist in diesem Fall nicht erforderlich.

Verwendet der Mieter das Grundstück vorsteuerunschädlich, ist die Option bereits nach § 9 Abs. 1 und 2 UStG möglich.

---

⇨ 29. Option bei Grundstücksveräußerung

Grundstücksveräußerungen, die unter das Grunderwerbsteuergesetz fallen, sind grundsätzlich nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Der Verkäufer kann unter den Voraussetzungen des § 9 Abs. 1 UStG auf die Steuerbefreiung verzichten.

► Grundvoraussetzungen

1. Steuerfreier Grundstücksumsatz nach § 4 Nr. 9 Buchst. a UStG,
2. Veräußerung an einen anderen Unternehmer,
3. Erwerb für dessen Unternehmen,
4. wirksame Ausübung der Option nach § 9 Abs. 3 UStG.

---

⇨ 30. § 9 Abs. 2 UStG gilt nicht für den Grundstücksverkauf

Die zusätzliche Nutzungsvoraussetzung des § 9 Abs. 2 UStG betrifft insbesondere die Vermietung und Verpachtung von Grundstücken.

Bei der Veräußerung eines Grundstücks ist daher grundsätzlich nicht zu prüfen, ob der Erwerber das Grundstück ausschließlich für vorsteuerunschädliche Umsätze verwendet.

► Trotzdem wichtig

Die spätere Verwendung des Grundstücks kann für den Vorsteuerabzug des Erwerbers und für eine mögliche Vorsteuerberichtigung nach § 15a UStG bedeutsam sein.

Sie ist jedoch keine Voraussetzung für die Wirksamkeit der Option des Verkäufers nach § 9 Abs. 1 und 3 UStG.

---

⇨ 31. Option nur an einen Unternehmer

Auch bei einer Grundstücksveräußerung muss der Erwerber Unternehmer sein und das Grundstück für sein Unternehmen erwerben.

► Beispiel

V verkauft ein Grundstück an eine Privatperson.

Der Umsatz ist nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Eine Option ist mangels Unternehmereigenschaft des Erwerbers nicht möglich.

---

⇨ 32. Form der Option bei Grundstücksveräußerungen

Bei einer Grundstücksveräußerung außerhalb eines Zwangsversteigerungsverfahrens kann die Option nur in dem notariell zu beurkundenden Vertrag erklärt werden, der der Grundstückslieferung zugrunde liegt.

Ein erst später erklärter Verzicht ist grundsätzlich unwirksam.

Dies gilt auch dann, wenn die spätere Erklärung erneut notariell beurkundet wird.

► Empfehlenswerte Gestaltung

Der notarielle Vertrag sollte eindeutig bestimmen, dass

- der Verkäufer auf die Steuerbefreiung nach § 4 Nr. 9 Buchst. a UStG verzichtet,
- der Umsatz als steuerpflichtig behandelt wird und
- die Steuerschuldnerschaft des Leistungsempfängers nach § 13b UStG berücksichtigt wird.

---

⇨ 33. Vorsorgliche Option

Die Parteien können einen Grundstücksumsatz beispielsweise zunächst als Geschäftsveräußerung im Ganzen beurteilen.

Für den Fall, dass sich diese Einschätzung später als falsch erweist, kann im notariellen Vertrag vorsorglich und unbedingt zur Umsatzsteuer optiert werden.

Die vorsorgliche Option sollte bereits im ursprünglichen notariellen Vertrag eindeutig erklärt werden.

---

⇨ 34. Keine nachträgliche Option

► Beispiel

Ein Grundstück wird im Januar steuerfrei veräußert.

Der notarielle Vertrag enthält keine Option.

Im September stellen die Parteien fest, dass eine steuerpflichtige Behandlung günstiger gewesen wäre.

Eine erstmalige nachträgliche Option ist grundsätzlich nicht möglich.

Auch eine spätere notarielle Ergänzungsurkunde heilt das Fehlen der Option im ursprünglichen Grundstückskaufvertrag grundsätzlich nicht.

---

⇨ 35. Rücknahme der Option

Auch die Rücknahme einer im notariellen Grundstückskaufvertrag erklärten Option ist formell eingeschränkt.

Sie kann grundsätzlich nicht beliebig nachträglich außerhalb des maßgeblichen notariellen Vertrags erfolgen.

Bei der Vertragsgestaltung sollte deshalb vor Beurkundung geklärt werden:

- Liegt eine Geschäftsveräußerung im Ganzen vor?
- Soll vorsorglich optiert werden?
- Welche Vorsteuerfolgen entstehen?
- Greift § 13b UStG?
- Welche Folgen ergeben sich nach § 15a UStG?

---

⇨ 36. Option im Zwangsversteigerungsverfahren

Bei einer Grundstückslieferung im Zwangsversteigerungsverfahren kann der Vollstreckungsschuldner gegenüber dem Ersteher auf die Steuerbefreiung verzichten.

Der Verzicht ist nur bis zur Aufforderung zur Abgabe von Geboten im Versteigerungstermin zulässig.

Nach diesem Zeitpunkt ist eine Option nicht mehr möglich.

---

⇨ 37. Entscheidungsschema Grundstücksveräußerung

► Schritt 1

Liegt ein nach § 4 Nr. 9 Buchst. a UStG steuerfreier Grundstücksumsatz vor?

- Nein: keine Option nach § 9 erforderlich.
- Ja: weiter mit Schritt 2.

► Schritt 2

Ist der Erwerber Unternehmer?

- Nein: Option nicht möglich.
- Ja: weiter mit Schritt 3.

► Schritt 3

Erwirbt er das Grundstück für sein Unternehmen?

- Nein: Option nicht möglich.
- Ja: weiter mit Schritt 4.

► Schritt 4

Liegt ein Zwangsversteigerungsverfahren vor?

⇶  Nein

Die Option muss im zugrunde liegenden notariellen Vertrag erklärt werden.

⇶  Ja

Die Option muss spätestens bis zur Aufforderung zur Abgabe von Geboten erklärt werden.

► Ergebnis

Sind die Voraussetzungen erfüllt, kann der Verkäufer nach § 9 Abs. 1 und 3 UStG wirksam optieren.

---

⇨ 38. Reverse Charge beim Grundstücksverkauf

Wird ein unter das Grunderwerbsteuergesetz fallender Grundstücksumsatz aufgrund einer Option steuerpflichtig behandelt, schuldet regelmäßig der Leistungsempfänger die Umsatzsteuer.

Rechtsgrundlage ist § 13b Abs. 2 Nr. 3 in Verbindung mit § 13b Abs. 5 UStG.

► Folgen

Der Verkäufer

- stellt grundsätzlich eine Nettorechnung aus,
- weist keine Umsatzsteuer offen aus,
- weist auf die Steuerschuldnerschaft des Leistungsempfängers hin.

Der Erwerber

- berechnet die Umsatzsteuer,
- meldet sie als Umsatzsteuer an,
- kann sie bei Vorliegen der Voraussetzungen zugleich als Vorsteuer abziehen.

---

⇨ 39. Rechnung beim optierten Grundstücksverkauf

Die Rechnung beziehungsweise Abrechnung sollte den Hinweis enthalten:

**Steuerschuldnerschaft des Leistungsempfängers.**

Ein gesonderter Umsatzsteuerausweis durch den Verkäufer ist grundsätzlich zu vermeiden.

► Gefahr des offenen Steuerausweises

Weist der Verkäufer trotz Reverse Charge Umsatzsteuer offen aus, kann er diese Steuer zusätzlich nach § 14c UStG schulden.

Der offene Steuerausweis führt nicht dazu, dass die Steuerschuld des Erwerbers nach § 13b UStG entfällt.

---

⇨ 40. Beispiel: Steuerpflichtiger Grundstücksverkauf

V verkauft ein betriebliches Grundstück für 1.000.000 Euro an den Unternehmer E.

E erwirbt das Grundstück für sein Unternehmen.

Im notariellen Kaufvertrag verzichtet V ausdrücklich auf die Steuerbefreiung nach § 4 Nr. 9 Buchst. a UStG.

► Lösung

Der Verzicht ist nach § 9 Abs. 1 und 3 UStG grundsätzlich wirksam.

Der Grundstücksumsatz wird steuerpflichtig behandelt.

E schuldet die Umsatzsteuer nach § 13b Abs. 2 Nr. 3 und Abs. 5 UStG.

Bemessungsgrundlage:

1.000.000 Euro.

Umsatzsteuer bei 19 Prozent:

190.000 Euro.

V stellt eine Rechnung beziehungsweise Abrechnung ohne gesonderten Umsatzsteuerausweis mit dem Hinweis auf die Steuerschuldnerschaft des Leistungsempfängers aus.

---

⇨ 41. Beispiel: Verkauf an eine Privatperson

V verkauft eine Eigentumswohnung an eine Privatperson.

► Lösung

Die Grundstückslieferung ist grundsätzlich nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Eine Option ist nicht möglich, da die Lieferung nicht an einen Unternehmer für dessen Unternehmen erfolgt.

---

⇨ 42. Grundstückskauf und Vorsteuer des Erwerbers

Die wirksame Option führt nicht automatisch dazu, dass der Erwerber zum Vorsteuerabzug berechtigt ist.

Der Erwerber muss die allgemeinen Voraussetzungen des § 15 UStG erfüllen.

Verwendet der Erwerber das Grundstück für vorsteuerschädliche Umsätze, kann der Vorsteuerabzug ganz oder teilweise ausgeschlossen sein.

► Beispiel

Ein Arzt erwirbt eine Praxisimmobilie aus einem optierten Grundstückskauf.

Er schuldet die Umsatzsteuer nach § 13b UStG.

Verwendet er die Immobilie ausschließlich für steuerfreie Heilbehandlungen, kann die nach § 13b geschuldete Umsatzsteuer grundsätzlich nicht als Vorsteuer abgezogen werden.

Die Option des Verkäufers kann trotzdem wirksam sein.

---

⇨ 43. Unterschied Vermietung und Veräußerung

► Vermietung

Zusätzlich zu § 9 Abs. 1 UStG ist grundsätzlich § 9 Abs. 2 UStG zu prüfen.

Entscheidend ist die Verwendung des Mieters.

► Veräußerung

§ 9 Abs. 2 UStG ist grundsätzlich nicht anzuwenden.

Dafür gelten die besonderen Form- und Zeitvorgaben des § 9 Abs. 3 UStG.

► Merksatz

Vermietung:

**§ 9 Abs. 1 + § 9 Abs. 2.**

Veräußerung:

**§ 9 Abs. 1 + § 9 Abs. 3 + regelmäßig § 13b UStG.**

---

⇨ 44. Vorsteuerberichtigung nach § 15a UStG

Eine Option kann den ursprünglichen Vorsteuerabzug ermöglichen.

Ändern sich später die für den Vorsteuerabzug maßgeblichen Verhältnisse, kann eine Vorsteuerberichtigung erforderlich sein.

Bei Grundstücken beträgt der Berichtigungszeitraum grundsätzlich zehn Jahre.

► Typische Änderungen

- steuerpflichtige Vermietung wird steuerfrei,
- steuerfreie Vermietung wird steuerpflichtig,
- Wechsel des Mieters,
- Änderung der Tätigkeit des Mieters,
- Wechsel zwischen unternehmerischer und privater Nutzung,
- Verkauf des Grundstücks innerhalb des Berichtigungszeitraums.

---

⇨ 45. Wechsel des Mieters

Die Option ist für jedes Mietverhältnis neu zu prüfen.

► Beispiel

Ein Büro wird zunächst steuerpflichtig an einen Rechtsanwalt vermietet.

Später wird dasselbe Büro an einen Arzt vermietet.

Für die Vermietung an den Arzt kann die Option nach § 9 Abs. 2 UStG ausgeschlossen sein.

Der Wechsel kann außerdem eine Vorsteuerberichtigung nach § 15a UStG auslösen.

---

⇨ 46. Änderung der Tätigkeit des Mieters

Auch während eines bestehenden Mietvertrags kann sich die Verwendung ändern.

► Beispiel

Ein Mieter erbringt zunächst ausschließlich steuerpflichtige Beratungsleistungen.

Später erbringt er überwiegend steuerfreie Versicherungsleistungen.

Der Vermieter muss prüfen:

- Ist die Option weiterhin zulässig?
- Muss die Rechnung geändert werden?
- Entsteht eine Vorsteuerberichtigung?
- Hat der Mieter seine vertragliche Mitteilungspflicht verletzt?

---

⇨ 47. Typische Fehler bei der Vermietungsoption

► Fehler 1: Nur die Unternehmereigenschaft prüfen

Es reicht nicht, dass der Mieter Unternehmer ist.

Der Mietgegenstand muss für dessen Unternehmen bezogen werden.

---

► Fehler 2: Verwendung des Mieters nicht prüfen

Bei der Vermietung ist die tatsächliche oder beabsichtigte Nutzung des Mieters entscheidend.

---

► Fehler 3: § 27 Abs. 2 UStG immer verlangen

§ 27 Abs. 2 UStG ist keine allgemeine Optionsvoraussetzung.

Die Vorschrift ist nur eine Altgebäude-Ausnahme.

---

► Fehler 4: Altgebäude macht Vermietung an Privatperson optionsfähig

Auch bei einem Altgebäude muss § 9 Abs. 1 UStG erfüllt sein.

Eine unmittelbare Vermietung an eine Privatperson ist grundsätzlich nicht optionsfähig.

---

► Fehler 5: Gesamtes Gebäude einheitlich beurteilen

Selbständig nutzbare Gebäudeteile müssen getrennt geprüft werden.

---

► Fehler 6: 5-Prozent-Grenze als Gesetz behandeln

Die Bagatellgrenze beruht auf der Verwaltungsauffassung.

Ausgangspunkt des Gesetzes ist die ausschließliche vorsteuerunschädliche Verwendung.

---

► Fehler 7: Nachweise des Mieters nicht einholen

Der Vermieter trägt das Risiko einer unwirksamen Option.

Die Nutzung sollte deshalb dokumentiert werden.

---

⇨ 48. Typische Fehler beim Grundstücksverkauf

► Fehler 1: § 9 Abs. 2 UStG beim Verkauf anwenden

Die besondere Verwendungsvoraussetzung gilt grundsätzlich für Grundstücksvermietungen, nicht für Grundstücksveräußerungen.

---

► Fehler 2: Option erst nach dem Notarvertrag erklären

Die Option muss grundsätzlich bereits im zugrunde liegenden notariellen Vertrag enthalten sein.

---

► Fehler 3: Umsatzsteuer offen ausweisen

Bei einem optierten Grundstücksumsatz schuldet regelmäßig der Erwerber die Steuer nach § 13b UStG.

Ein offener Steuerausweis kann zu einer zusätzlichen Steuerschuld nach § 14c UStG führen.

---

► Fehler 4: Geschäftsveräußerung im Ganzen nicht prüfen

Liegt eine nicht steuerbare Geschäftsveräußerung im Ganzen vor, ist eine Option grundsätzlich nicht erforderlich.

Eine vorsorgliche Option im Notarvertrag kann jedoch sinnvoll sein.

---

► Fehler 5: Vorsteuerabzug des Erwerbers unterstellen

Die wirksame Option des Verkäufers bedeutet nicht automatisch, dass der Erwerber die Steuer als Vorsteuer abziehen darf.

---

⇨ 49. Kompakte Checkliste Vermietung

1. Liegt eine Grundstücksvermietung vor?
2. Ist sie nach § 4 Nr. 12 UStG steuerfrei?
3. Ist der Mieter Unternehmer?
4. Bezieht er die Mietleistung für sein Unternehmen?
5. Wie nutzt er jeden selbständigen Grundstücksteil?
6. Führt er vorsteuerunschädliche Umsätze aus?
7. Liegt höchstens eine geringfügige schädliche Nutzung vor?
8. Greift gegebenenfalls § 27 Abs. 2 UStG?
9. Sind die Altgebäudegrenzen eingehalten?
10. Ist die Nutzung ausreichend dokumentiert?
11. Ist der Mietvertrag umsatzsteuerlich richtig formuliert?
12. Ist eine Vorsteuerberichtigung nach § 15a UStG zu prüfen?

---

⇨ 50. Kompakte Checkliste Grundstücksverkauf

1. Liegt eine Grundstückslieferung vor?
2. Fällt sie unter das Grunderwerbsteuergesetz?
3. Ist sie nach § 4 Nr. 9 Buchst. a UStG steuerfrei?
4. Ist der Erwerber Unternehmer?
5. Erwirbt er für sein Unternehmen?
6. Liegt möglicherweise eine Geschäftsveräußerung im Ganzen vor?
7. Ist die Option im notariellen Vertrag enthalten?
8. Liegt eine Zwangsversteigerung vor?
9. Wurde die dortige Optionsfrist eingehalten?
10. Greift § 13b Abs. 2 Nr. 3 UStG?
11. Enthält die Rechnung keinen offenen Umsatzsteuerausweis?
12. Enthält sie den Hinweis auf die Steuerschuldnerschaft des Leistungsempfängers?
13. Ist beim Erwerber der Vorsteuerabzug möglich?
14. Ist § 15a UStG zu prüfen?

---

⇨ 51. Formulierungshilfe Vermietung – Option möglich

Die Vermietung des Grundstücks ist gemäß § 4 Nr. 12 Satz 1 Buchstabe a UStG grundsätzlich steuerfrei.

Der Vermieter kann nach § 9 Abs. 1 UStG auf die Steuerbefreiung verzichten, da die Vermietung an einen anderen Unternehmer für dessen Unternehmen erfolgt.

Der Leistungsempfänger verwendet das Grundstück ausschließlich für Umsätze, die den Vorsteuerabzug nicht ausschließen.

Die Einschränkung des § 9 Abs. 2 UStG steht der Option daher nicht entgegen.

Der Vermietungsumsatz wird aufgrund der Option steuerpflichtig behandelt.

---

⇨ 52. Formulierungshilfe Vermietung – Option ausgeschlossen

Die Vermietung ist nach § 4 Nr. 12 Satz 1 Buchstabe a UStG steuerfrei.

Zwar wird die Leistung an einen Unternehmer für dessen Unternehmen ausgeführt, sodass § 9 Abs. 1 UStG grundsätzlich erfüllt ist.

Der Mieter verwendet das Grundstück jedoch für steuerfreie Umsätze, die den Vorsteuerabzug ausschließen.

Da auch die Übergangsregelung des § 27 Abs. 2 UStG nicht eingreift, ist die Option nach § 9 Abs. 2 UStG ausgeschlossen.

---

⇨ 53. Formulierungshilfe Altgebäude

Die Vermietung erfolgt an einen Unternehmer für dessen Unternehmen.

Die Nutzung des Mieters würde den Vorsteuerabzug grundsätzlich ausschließen.

Das Gebäude wurde jedoch vor dem maßgeblichen Fertigstellungsstichtag fertiggestellt und mit seiner Errichtung wurde vor dem maßgeblichen Errichtungsstichtag begonnen.

Nach § 27 Abs. 2 UStG ist § 9 Abs. 2 UStG daher nicht anzuwenden.

Die Option ist unter den Voraussetzungen des § 9 Abs. 1 UStG möglich.

---

⇨ 54. Formulierungshilfe Grundstücksveräußerung

Die Grundstückslieferung fällt unter das Grunderwerbsteuergesetz und ist grundsätzlich nach § 4 Nr. 9 Buchstabe a UStG steuerfrei.

Der Erwerber ist Unternehmer und erwirbt das Grundstück für sein Unternehmen.

Der Verkäufer hat im zugrunde liegenden notariellen Vertrag wirksam auf die Steuerbefreiung verzichtet.

Die Voraussetzungen des § 9 Abs. 1 und 3 UStG sind erfüllt.

Der Umsatz wird steuerpflichtig behandelt.

Die Umsatzsteuer wird gemäß § 13b Abs. 2 Nr. 3 und Abs. 5 UStG vom Leistungsempfänger geschuldet.

---

⇨ 55. Zentrale Merksätze

- Nur eine gesetzlich optionsfähige Steuerbefreiung kann nach § 9 UStG abgewählt werden.
- Der Leistungsempfänger muss Unternehmer sein.
- Die Leistung muss für sein Unternehmen bezogen werden.
- Bei Vermietungen ist zusätzlich die Verwendung des Mieters zu prüfen.
- Bei vorsteuerunschädlicher Nutzung ist § 27 Abs. 2 UStG nicht erforderlich.
- § 27 Abs. 2 UStG ist ausschließlich eine Altgebäude-Ausnahme zu § 9 Abs. 2 UStG.
- Auch im Altfall bleibt § 9 Abs. 1 UStG anwendbar.
- Grundstücksteile sind räumlich und gegebenenfalls zeitlich getrennt zu prüfen.
- Bei Grundstücksverkäufen gilt § 9 Abs. 2 UStG grundsätzlich nicht.
- Die Option beim Grundstücksverkauf muss grundsätzlich im notariellen Vertrag erklärt werden.
- Im Zwangsversteigerungsverfahren muss die besondere Optionsfrist eingehalten werden.
- Beim optierten Grundstücksverkauf schuldet regelmäßig der Erwerber die Umsatzsteuer.
- Der Verkäufer darf die Umsatzsteuer bei Reverse Charge grundsätzlich nicht offen ausweisen.
- Nach einer Änderung der Nutzung ist stets § 15a UStG zu prüfen.
`
},
{
  id: "umsatzsteuer-ausgangsumsaetze-lieferort-reihengeschaeft",

  title:
    "Prüfung von Ausgangsumsätzen, Lieferort und Reihengeschäften",

  short:
    "Umfassendes Prüfungsschema für umsatzsteuerliche Ausgangsumsätze: Leistungsart, Leistungsumfang, Ort, Zeitpunkt, Steuerbarkeit, Steuerbefreiung, Steuersatz, Bemessungsgrundlage, Verfügungsmacht sowie bewegte und unbewegte Lieferungen im Reihengeschäft.",

  category: "Umsatzsteuer",

  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Ausgangsumsätze, Lieferungen und Reihengeschäfte",

  keywords:
    "ausgangsumsatz|prüfungsschema umsatzsteuer|lieferung|sonstige leistung|werklieferung|werkleistung|leistungsumfang|nebenleistung|teilleistung|lieferort|bewegte lieferung|unbewegte lieferung|beförderung|versendung|verfügungsmacht|wirtschaftliches eigentum|feststehender abnehmer|reihengeschäft|zwischenhändler|§ 3 abs. 6 ustg|§ 3 abs. 6a ustg|§ 3 abs. 7 ustg|§ 3 abs. 9 ustg|gebiet umsatzsteuer|inland|gemeinschaftsgebiet|drittland|ausland|steuerbarkeit|steuerbefreiung|steuerschuldner|steuersatz|bemessungsgrundlage|entstehung der steuer",

  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 1 Abs. 2 UStG",
    "§ 1 Abs. 2a UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 6a UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3 Abs. 8 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3 Abs. 12 UStG",
    "§ 3a UStG",
    "§ 3c UStG",
    "§ 3d UStG",
    "§ 3g UStG",
    "§ 4 UStG",
    "§ 4 Nr. 1 Buchst. a UStG",
    "§ 4 Nr. 1 Buchst. b UStG",
    "§ 4 Nr. 8 UStG",
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 4 Nr. 10 UStG",
    "§ 4 Nr. 11 UStG",
    "§ 4 Nr. 12 UStG",
    "§ 4 Nr. 14 UStG",
    "§ 6 UStG",
    "§ 6a UStG",
    "§ 9 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 13b UStG",
    "§ 14c UStG",
    "§ 16 Abs. 6 UStG",
    "§ 39 Abs. 2 Nr. 1 AO",
    "§ 868 BGB",
    "§ 873 BGB",
    "§ 925 BGB",
    "§ 929 BGB",
    "§ 930 BGB",
    "§ 931 BGB",
    "§ 449 BGB",
    "Abschn. 1.9 UStAE",
    "Abschn. 1.10 UStAE",
    "Abschn. 3.12 UStAE"
  ],

  body: `
⇨ Prüfung von Ausgangsumsätzen

Ein umsatzsteuerlicher Ausgangsumsatz sollte immer in einer festen Reihenfolge geprüft werden.

Die Prüfung beginnt nicht sofort mit der Steuerbefreiung oder dem Steuersatz.

Zunächst muss geklärt werden:

- Welche Leistung liegt vor?
- Welchen Umfang hat die Leistung?
- Wo wird sie ausgeführt?
- Wann wird sie ausgeführt?
- Liegt ein Leistungsaustausch vor?
- Wird sie im Rahmen des Unternehmens ausgeführt?

Erst danach folgen Steuerbarkeit, Steuerbefreiung, Steuerschuldnerschaft, Steuersatz, Bemessungsgrundlage und Steuerentstehung.

---

⇨ 1. Vollständiges Prüfungsschema für Ausgangsumsätze

► Prüfungsreihenfolge

1. Art der Leistung,
2. Umfang der Leistung,
3. Ort der Leistung,
4. Zeitpunkt der Leistung,
5. Leistungsaustausch,
6. Ausführung im Rahmen des Unternehmens,
7. Steuerbarkeit,
8. Steuerbefreiung oder Steuerpflicht,
9. gegebenenfalls Option nach § 9 UStG,
10. Steuerschuldner,
11. Steuersatz,
12. Bemessungsgrundlage,
13. Entstehung der Umsatzsteuer.

---

⇨ 2. Art der Leistung

Zunächst ist zu bestimmen, welche umsatzsteuerliche Leistung vorliegt.

In Betracht kommen insbesondere:

- Lieferung,
- Werklieferung,
- sonstige Leistung,
- Werkleistung,
- Lieferung innerhalb eines Reihengeschäfts.

---

⇨ 3. Lieferung nach § 3 Abs. 1 UStG

Eine Lieferung liegt vor, wenn der leistende Unternehmer den Leistungsempfänger befähigt, im eigenen Namen über einen Gegenstand zu verfügen.

Entscheidend ist die Verschaffung der Verfügungsmacht.

Es kommt nicht ausschließlich darauf an, wer zivilrechtlicher Eigentümer ist.

Maßgeblich ist, wer wirtschaftlich wie ein Eigentümer über den Gegenstand verfügen kann.

► Typische Lieferungen

- Verkauf einer Ware,
- Verkauf einer Maschine,
- Verkauf eines Fahrzeugs,
- Lieferung von Baumaterial,
- Übertragung eines Grundstücks,
- Lieferung eines Gebäudes.

► Merksatz

Eine Lieferung ist die Verschaffung der wirtschaftlichen Verfügungsmacht an einem Gegenstand.

---

⇨ 4. Werklieferung nach § 3 Abs. 4 UStG

Eine Werklieferung liegt vor, wenn der Unternehmer

- einen fremden Gegenstand bearbeitet oder verarbeitet und
- dabei selbst beschaffte Hauptstoffe verwendet.

Die Werklieferung wird umsatzsteuerlich als Lieferung behandelt.

► Beispiele

- Ein Unternehmer baut mit selbst beschafften Fenstern neue Fenster in ein Gebäude ein.
- Ein Heizungsbauer liefert und montiert eine von ihm beschaffte Heizungsanlage.
- Ein Bauunternehmer errichtet mit eigenen Hauptstoffen ein Bauwerk auf dem Grundstück des Auftraggebers.

► Abgrenzung zur Werkleistung

Werden keine selbst beschafften Hauptstoffe verwendet oder handelt es sich nur um Nebenstoffe, liegt regelmäßig eine Werkleistung vor.

---

⇨ 5. Sonstige Leistung nach § 3 Abs. 9 UStG

Sonstige Leistungen sind Leistungen, die keine Lieferungen sind.

Typische sonstige Leistungen:

- Beratung,
- Vermietung,
- Verpachtung,
- Reparatur ohne Verwendung eigener Hauptstoffe,
- Vermittlung,
- Beförderungsleistung,
- Lizenzüberlassung,
- elektronische Dienstleistung,
- ärztliche oder therapeutische Behandlung.

---

⇨ 6. Werkleistung

Eine Werkleistung ist eine sonstige Leistung.

Sie liegt insbesondere vor, wenn ein Unternehmer einen Gegenstand bearbeitet, ohne selbst beschaffte Hauptstoffe einzusetzen.

► Beispiele

- Reparatur einer Maschine mit nur geringfügigen Hilfsstoffen,
- Wartung eines Fahrzeugs,
- reine Montage beigestellter Bauteile,
- Reinigung eines Gebäudes.

► Merksatz

Werklieferung:

Lieferung unter Verwendung eigener Hauptstoffe.

Werkleistung:

Sonstige Leistung ohne eigene Hauptstoffe.

---

⇨ 7. Umfang der Leistung

Nach der Bestimmung der Leistungsart ist zu prüfen, ob

- eine einheitliche Leistung,
- mehrere selbständige Leistungen,
- eine Hauptleistung mit Nebenleistungen oder
- Teilleistungen

vorliegen.

---

⇨ 8. Hauptleistung und Nebenleistung

Nebenleistungen teilen grundsätzlich das umsatzsteuerliche Schicksal der Hauptleistung.

Eine Nebenleistung liegt typischerweise vor, wenn sie

- für den Leistungsempfänger keinen eigenständigen Zweck darstellt,
- die Hauptleistung wirtschaftlich ergänzt,
- im Vergleich zur Hauptleistung nebensächlich ist und
- üblicherweise zusammen mit der Hauptleistung erbracht wird.

► Typische Nebenleistungen

- Transport,
- Verpackung,
- Versicherung,
- Montage,
- Anschlusskosten,
- Nebenkosten einer Vermietung.

► Beispiel

Ein Unternehmer verkauft eine Maschine und berechnet zusätzlich Transportkosten.

Ist der Transport nur Mittel zur Durchführung der Maschinenlieferung, handelt es sich um eine Nebenleistung.

Der Transport teilt dann insbesondere

- den Lieferort,
- die Steuerbefreiung,
- den Steuersatz und
- den Zeitpunkt

der Maschinenlieferung.

---

⇨ 9. Gemischter Vertrag

Ein Vertrag kann mehrere selbständige Hauptleistungen enthalten.

Dann ist jede Leistung umsatzsteuerlich getrennt zu beurteilen.

► Beispiel

Ein Unternehmer vermietet

- ein Grundstück und
- zusätzlich einen selbständig nutzbaren Baukran.

Die Grundstücksvermietung kann nach § 4 Nr. 12 Buchst. a UStG steuerfrei sein.

Die eigenständige Vermietung des Baukrans ist grundsätzlich steuerpflichtig.

► Abgrenzungsfrage

Ist die weitere Leistung lediglich eine übliche Nebenleistung zur Grundstücksvermietung oder hat sie für den Mieter einen eigenständigen wirtschaftlichen Zweck?

---

⇨ 10. Teilleistungen

Teilleistungen sind wirtschaftlich teilbare Teile einer Gesamtleistung, für die das Entgelt gesondert vereinbart wird.

Voraussetzungen:

- wirtschaftliche Teilbarkeit der Gesamtleistung,
- gesonderte Vereinbarung des Teilentgelts,
- gesonderte Ausführung des Leistungsteils.

► Beispiele

- monatliche Vermietungsleistungen,
- abschnittsweise Bauleistungen,
- laufende Wartungsverträge,
- monatlich abgerechnete Beratungsleistungen.

Die Umsatzsteuer entsteht bei Sollversteuerung grundsätzlich mit Ablauf des Voranmeldungszeitraums, in dem die jeweilige Teilleistung ausgeführt wurde.

---

⇨ 11. Ort der Leistung

Nur Umsätze, deren Leistungsort im Inland liegt, können nach § 1 Abs. 1 Nr. 1 UStG im Inland steuerbar sein.

Der Leistungsort richtet sich danach, ob

- eine bewegte Lieferung,
- eine unbewegte Lieferung oder
- eine sonstige Leistung

vorliegt.

---

⇨ 12. Ort einer bewegten Lieferung

Eine bewegte Lieferung liegt vor, wenn der Gegenstand im Zusammenhang mit der Lieferung befördert oder versendet wird.

Rechtsgrundlage:

§ 3 Abs. 6 UStG.

Der Ort der Lieferung liegt grundsätzlich dort, wo die Beförderung oder Versendung beginnt.

► Merksatz

Bei bewegten Lieferungen gilt:

Ort = Beginn der Warenbewegung.

Zeitpunkt = Beginn der Warenbewegung.

---

⇨ 13. Beförderung

Eine Beförderung liegt vor, wenn der Gegenstand transportiert wird durch

- den Lieferer,
- den Abnehmer,
- einen Arbeitnehmer des Lieferers oder
- einen Arbeitnehmer des Abnehmers.

Der Transport erfolgt damit durch einen unmittelbar am Umsatz beteiligten Unternehmer oder dessen Arbeitnehmer.

► Beispiel

Der Lieferer fährt die Ware mit dem eigenen Fahrzeug zum Kunden.

Es liegt eine Beförderung vor.

---

⇨ 14. Versendung

Eine Versendung liegt vor, wenn der Gegenstand durch einen selbständigen Dritten transportiert wird.

Typische selbständige Transportpersonen:

- Spediteur,
- Frachtführer,
- Paketdienst,
- Deutsche Post,
- Bahnunternehmen,
- selbständiger Kurierdienst.

Der selbständige Dritte kann vom Lieferer oder vom Abnehmer beauftragt werden.

► Beginn der Versendung

Die Versendung beginnt grundsätzlich mit der Übergabe des Gegenstands an den selbständigen Transporteur.

► Wichtig

Ein Arbeitnehmer ist kein selbständiger Dritter.

Der Transport durch einen Arbeitnehmer ist daher eine Beförderung und keine Versendung.

---

⇨ 15. Feststehender Abnehmer

Eine Beförderungs- oder Versendungslieferung setzt voraus, dass der Abnehmer bei Beginn der Beförderung oder Versendung bereits feststeht.

Steht der Abnehmer noch nicht fest, liegt durch den Transport allein noch keine Lieferung an einen bestimmten Abnehmer vor.

Es kann sich zunächst um ein rechtsgeschäftsloses Verbringen handeln.

► Beispiel

Ein Unternehmer transportiert einen Teppich in die Schweiz.

Dort soll ein Interessent den Teppich zunächst ansehen und gegebenenfalls später kaufen.

Bei Beginn des Transports steht noch nicht fest, ob der Interessent den Teppich kaufen wird.

Der Transport ist daher noch nicht zwingend Teil einer Lieferung an diesen Interessenten.

Der Ort der späteren Lieferung ist nach den tatsächlichen Umständen gesondert zu bestimmen.

► Merksatz

Ohne feststehenden Abnehmer keine bewegte Lieferung an diesen Abnehmer.

---

⇨ 16. Ort einer unbewegten Lieferung

Eine unbewegte Lieferung liegt vor, wenn der Gegenstand nicht im Zusammenhang mit der Lieferung befördert oder versendet wird.

Rechtsgrundlage:

§ 3 Abs. 7 Satz 1 UStG.

Der Ort liegt dort, wo sich der Gegenstand im Zeitpunkt der Verschaffung der Verfügungsmacht befindet.

► Merksatz

Unbewegte Lieferung:

Ort = Standort des Gegenstands bei Verschaffung der Verfügungsmacht.

---

⇨ 17. Zeitpunkt der unbewegten Lieferung

Der Zeitpunkt richtet sich nach dem Übergang der wirtschaftlichen Verfügungsmacht.

Bei beweglichen Sachen kann dies regelmäßig mit der zivilrechtlichen Eigentumsübertragung zusammenfallen.

Bei Grundstücken erfolgt der Übergang der wirtschaftlichen Verfügungsmacht häufig bereits mit dem Übergang von Nutzen und Lasten.

---

⇨ 18. Zivilrechtliche Eigentumsübertragung beweglicher Sachen

Die zivilrechtliche Eigentumsübertragung ist nicht mit der umsatzsteuerlichen Lieferung gleichzusetzen, kann aber ein wichtiges Indiz für die Verschaffung der Verfügungsmacht sein.

---

⇨ 19. Einigung und Übergabe nach § 929 Satz 1 BGB

Die Eigentumsübertragung einer beweglichen Sache setzt grundsätzlich voraus:

1. Einigung über den Eigentumsübergang,
2. Übergabe der Sache,
3. Berechtigung des Veräußerers.

Mit der Übergabe wird regelmäßig auch die wirtschaftliche Verfügungsmacht verschafft.

---

⇨ 20. Übergabe kurzer Hand nach § 929 Satz 2 BGB

Befindet sich der Erwerber bereits im Besitz der Sache, ist eine erneute tatsächliche Übergabe nicht erforderlich.

Erforderlich sind:

- Einigung über den Eigentumsübergang,
- bereits bestehender Besitz des Erwerbers,
- Berechtigung des Veräußerers.

► Beispiel

Ein Unternehmer hat ein Fahrzeug zunächst gemietet.

Später kauft er dasselbe Fahrzeug vom Vermieter.

Da sich das Fahrzeug bereits bei ihm befindet, ist keine erneute Übergabe erforderlich.

---

⇨ 21. Besitzkonstitut nach §§ 929, 930 BGB

Beim Besitzkonstitut bleibt der Veräußerer unmittelbarer Besitzer des Gegenstands.

Anstelle der tatsächlichen Übergabe wird ein Besitzmittlungsverhältnis vereinbart.

Der bisherige Eigentümer kann den Gegenstand danach beispielsweise weiter besitzen als

- Mieter,
- Pächter,
- Entleiher oder
- Verwahrer.

Der Erwerber wird mittelbarer Besitzer im Sinne des § 868 BGB.

► Beispiel

Ein Unternehmer verkauft eine Maschine und mietet sie gleichzeitig vom Käufer zurück.

---

⇨ 22. Abtretung des Herausgabeanspruchs nach §§ 929, 931 BGB

Befindet sich der Gegenstand bei einem Dritten, kann die Übergabe durch Abtretung des Herausgabeanspruchs ersetzt werden.

Voraussetzungen:

- Einigung über den Eigentumsübergang,
- Abtretung des Herausgabeanspruchs gegen den Dritten,
- Berechtigung des Veräußerers.

---

⇨ 23. Grundstücksübertragung

Die zivilrechtliche Eigentumsübertragung eines Grundstücks setzt grundsätzlich voraus:

1. Auflassung nach § 925 BGB,
2. Eintragung des Erwerbers in das Grundbuch nach § 873 BGB,
3. Berechtigung des Veräußerers.

Für die Umsatzsteuer ist der Grundbucheintrag jedoch nicht zwingend der maßgebliche Lieferzeitpunkt.

Entscheidend ist der Übergang der wirtschaftlichen Verfügungsmacht.

---

⇨ 24. Wirtschaftliches Eigentum

Wirtschaftliches Eigentum liegt nach § 39 Abs. 2 Nr. 1 AO vor, wenn eine andere Person als der zivilrechtliche Eigentümer

- die tatsächliche Herrschaft über den Gegenstand ausübt und
- den rechtlichen Eigentümer für die gewöhnliche Nutzungsdauer wirtschaftlich ausschließen kann.

Für die umsatzsteuerliche Lieferung ist entscheidend, wann der Erwerber wirtschaftlich wie ein Eigentümer über den Gegenstand verfügen kann.

---

⇨ 25. Übergang von Nutzen und Lasten bei Grundstücken

Bei Grundstücken geht die wirtschaftliche Verfügungsmacht regelmäßig mit dem vertraglich vereinbarten Übergang von Nutzen und Lasten über.

Typische Folgen des Übergangs von Nutzen und Lasten:

- der Erwerber erhält die Mieterträge,
- der Erwerber trägt laufende Kosten,
- der Erwerber trägt die Gefahr des zufälligen Untergangs,
- der Erwerber trägt Grundsteuer und Versicherungen,
- der Erwerber kann das Grundstück wirtschaftlich nutzen.

► Beispiel

Notarieller Kaufvertrag:

15. Dezember 2025.

Übergang von Nutzen und Lasten:

1. Januar 2026.

Grundbucheintragung:

15. Februar 2026.

Die wirtschaftliche Verfügungsmacht geht grundsätzlich bereits am 1. Januar 2026 über.

Die Grundstückslieferung wird daher regelmäßig bereits am 1. Januar 2026 ausgeführt.

---

⇨ 26. Eigentumsvorbehalt

Bei einem Verkauf unter Eigentumsvorbehalt bleibt der Verkäufer bis zur vollständigen Zahlung zivilrechtlicher Eigentümer.

Die wirtschaftliche Verfügungsmacht kann dennoch bereits mit der Übergabe auf den Käufer übergehen.

Der Käufer kann dann wirtschaftlicher Eigentümer sein, obwohl das zivilrechtliche Eigentum noch beim Verkäufer liegt.

► Merksatz

Eigentumsvorbehalt verhindert nicht automatisch eine umsatzsteuerliche Lieferung.

---

⇨ 27. Ort sonstiger Leistungen

Bei sonstigen Leistungen ist folgende Reihenfolge einzuhalten:

1. Zunächst besondere Ortsvorschriften und Ausnahmekataloge prüfen.
2. Erst danach die allgemeinen Regeln für B2B- oder B2C-Leistungen anwenden.

► B2B-Grundregel

Bei Leistungen an einen Unternehmer für dessen Unternehmen liegt der Leistungsort grundsätzlich beim Leistungsempfänger.

► B2C-Grundregel

Bei Leistungen an Nichtunternehmer liegt der Leistungsort grundsätzlich beim leistenden Unternehmer.

► Wichtig

Sonderregelungen können insbesondere bestehen für:

- Grundstücksleistungen,
- Veranstaltungsleistungen,
- Personenbeförderung,
- Restaurant- und Verpflegungsleistungen,
- kurzfristige Vermietung von Beförderungsmitteln,
- elektronische Dienstleistungen,
- Arbeiten an beweglichen Gegenständen.

---

⇨ 28. Zeitpunkt der Leistung

► Bewegte Lieferung

Zeitpunkt der Lieferung ist grundsätzlich der Beginn der Beförderung oder Versendung.

► Unbewegte Lieferung

Zeitpunkt ist die Verschaffung der Verfügungsmacht.

Bei Grundstücken ist regelmäßig der Übergang von Nutzen und Lasten entscheidend.

► Sonstige Leistung

Eine sonstige Leistung wird grundsätzlich ausgeführt mit

- Vollendung der Leistung und
- vollständiger Zuwendung an den Leistungsempfänger.

► Teilleistung

Eine Teilleistung wird mit Ablauf des jeweiligen Teilleistungszeitraums ausgeführt.

---

⇨ 29. Leistungsaustausch

Ein steuerbarer Umsatz setzt grundsätzlich einen Leistungsaustausch voraus.

Erforderlich ist ein unmittelbarer Zusammenhang zwischen

- Leistung und
- Gegenleistung.

Die Gegenleistung kann bestehen aus:

- Kaufpreis,
- Miete,
- Pacht,
- Honorar,
- Provision,
- Sachleistung,
- sonstiger Leistung.

► Wichtig

Die Bezeichnung der Zahlung ist nicht entscheidend.

Auch Zahlungen mit Bezeichnungen wie

- Zuschuss,
- Entschädigung,
- Beitrag oder
- Prämie

können Entgelt sein, wenn ein unmittelbarer Zusammenhang mit einer Leistung besteht.

---

⇨ 30. Tausch und tauschähnlicher Umsatz

► Tausch

Ein Tausch liegt vor, wenn die Gegenleistung für eine Lieferung ebenfalls in einer Lieferung besteht.

► Tauschähnlicher Umsatz

Ein tauschähnlicher Umsatz liegt vor, wenn mindestens eine der ausgetauschten Leistungen eine sonstige Leistung ist.

► Tausch mit Baraufgabe

Zusätzlich zur Sach- oder Dienstleistung kann eine Geldzahlung vereinbart werden.

Diese Zahlung wird als Baraufgabe bezeichnet.

Bei der Bemessungsgrundlage ist die jeweilige Gegenleistung einschließlich einer erhaltenen oder geleisteten Baraufgabe zu berücksichtigen.

---

⇨ 31. Ausführung im Rahmen des Unternehmens

Die Leistung muss im Rahmen des Unternehmens ausgeführt werden.

► Grundgeschäfte

Grundgeschäfte sind die laufenden und nachhaltigen Umsätze der eigentlichen Unternehmenstätigkeit.

► Hilfs- und Nebengeschäfte

Auch Hilfs- und Nebengeschäfte werden im Rahmen des Unternehmens ausgeführt, obwohl sie nicht ständig oder nachhaltig vorkommen.

Voraussetzung ist ein wirtschaftlicher Zusammenhang mit der unternehmerischen Haupttätigkeit.

► Beispiele

- Verkauf einer betrieblichen Maschine,
- Veräußerung eines betrieblichen Fahrzeugs,
- Verkauf von Büroeinrichtung,
- Veräußerung eines betrieblichen Grundstücks.

---

⇨ 32. Steuerbarkeit nach § 1 Abs. 1 Nr. 1 UStG

Ein Umsatz ist steuerbar, wenn

- eine Lieferung oder sonstige Leistung,
- durch einen Unternehmer,
- im Inland,
- gegen Entgelt,
- im Rahmen seines Unternehmens

ausgeführt wird.

Sind alle Voraussetzungen erfüllt, liegt ein steuerbarer Umsatz vor.

Erst danach ist die Steuerbefreiung zu prüfen.

---

⇨ 33. Steuerbefreiung

Nach Feststellung der Steuerbarkeit ist zu prüfen, ob der Umsatz nach § 4 oder § 4b UStG steuerfrei ist.

Typische Steuerbefreiungen:

- Ausfuhrlieferungen,
- innergemeinschaftliche Lieferungen,
- Grundstückslieferungen,
- Kreditgewährung und Kreditvermittlung,
- Versicherungsumsätze,
- Grundstücksvermietung,
- bestimmte Heilbehandlungen.

---

⇨ 34. Ausfuhrlieferung

Eine Ausfuhrlieferung kann nach § 4 Nr. 1 Buchst. a in Verbindung mit § 6 UStG steuerfrei sein.

Voraussetzungen sind insbesondere:

- steuerbare Lieferung,
- Beförderung oder Versendung in das Drittlandsgebiet,
- Vorliegen der Voraussetzungen des § 6 UStG,
- ordnungsgemäßer Buch- und Belegnachweis.

---

⇨ 35. Innergemeinschaftliche Lieferung

Eine innergemeinschaftliche Lieferung kann nach § 4 Nr. 1 Buchst. b in Verbindung mit § 6a UStG steuerfrei sein.

Typische Voraussetzungen:

- Lieferung eines Gegenstands,
- Warenbewegung aus einem EU-Mitgliedstaat in einen anderen Mitgliedstaat,
- Erwerberkreis nach § 6a UStG,
- Erwerbsbesteuerung im Bestimmungsland,
- gültige Umsatzsteuer-Identifikationsnummer,
- ordnungsgemäße Nachweise.

---

⇨ 36. Grundstückslieferung

Umsätze, die unter das Grunderwerbsteuergesetz fallen, sind grundsätzlich nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Dabei kommt es nicht darauf an, ob tatsächlich Grunderwerbsteuer festgesetzt wird.

Entscheidend ist, ob der Umsatz dem Grunde nach unter das Grunderwerbsteuergesetz fällt.

Eine Option zur Steuerpflicht nach § 9 UStG kann unter den gesetzlichen Voraussetzungen möglich sein.

---

⇨ 37. Grundstücksvermietung

Die Vermietung und Verpachtung von Grundstücken ist grundsätzlich nach § 4 Nr. 12 Buchst. a UStG steuerfrei.

Ausnahmen können insbesondere gelten für:

- kurzfristige Beherbergung,
- Vermietung von Abstellplätzen,
- Vermietung von Betriebsvorrichtungen,
- bestimmte Campingplätze,
- kurzfristige Vermietung von Wohn- und Schlafräumen.

---

⇨ 38. Option nach § 9 UStG

Bei einer Steuerbefreiung ist immer zu prüfen, ob auf die Steuerbefreiung verzichtet werden kann.

Der Verzicht führt dazu, dass der Umsatz steuerpflichtig behandelt wird.

Dadurch kann ein ansonsten ausgeschlossener Vorsteuerabzug ermöglicht werden.

► Typische Voraussetzungen

- gesetzlich optionsfähiger Umsatz,
- Leistung an einen anderen Unternehmer,
- Bezug der Leistung für dessen Unternehmen,
- bei Grundstücksvermietung zusätzlich die Voraussetzungen des § 9 Abs. 2 UStG.

► Merksatz

Nach jeder Steuerbefreiung:

Option nach § 9 UStG prüfen.

---

⇨ 39. Steuerschuldner

► Grundsatz

Steuerschuldner ist grundsätzlich der leistende Unternehmer nach § 13a Abs. 1 Nr. 1 UStG.

► Weitere Fälle

Je nach Sachverhalt können insbesondere Steuerschuldner sein:

- Erwerber bei einem innergemeinschaftlichen Erwerb,
- Leistungsempfänger nach § 13b UStG,
- Rechnungsaussteller bei unberechtigtem oder unrichtigem Steuerausweis nach § 14c UStG,
- letzter Abnehmer bei besonderen Dreiecksgeschäften.

► Reverse Charge

Bei § 13b UStG schuldet nicht der leistende Unternehmer, sondern der Leistungsempfänger die Umsatzsteuer.

---

⇨ 40. Steuersatz

► Regelsteuersatz

Der Regelsteuersatz beträgt nach § 12 Abs. 1 UStG grundsätzlich 19 Prozent.

► Ermäßigter Steuersatz

Der ermäßigte Steuersatz beträgt grundsätzlich 7 Prozent.

Er kommt nur zur Anwendung, wenn der Umsatz ausdrücklich unter § 12 Abs. 2 UStG fällt.

Typische Anwendungsfälle:

- bestimmte Gegenstände der Anlage 2,
- bestimmte Lebensmittel,
- Bücher und bestimmte Druckerzeugnisse,
- bestimmte Personenbeförderungen,
- kurzfristige Vermietung von Wohn- und Schlafräumen.

► Prüfungsregel

Zuerst prüfen, ob eine Steuerbefreiung vorliegt.

Nur bei einem steuerpflichtigen Umsatz ist der Steuersatz zu bestimmen.

---

⇨ 41. Bemessungsgrundlage

Die Bemessungsgrundlage richtet sich grundsätzlich nach dem Entgelt.

Entgelt ist alles, was der Leistungsempfänger aufwendet, um die Leistung zu erhalten, abzüglich der gesetzlich geschuldeten Umsatzsteuer.

Rechtsgrundlage:

§ 10 Abs. 1 UStG.

► Geldzahlung

Bei einer Geldzahlung ist die Umsatzsteuer aus dem Bruttobetrag herauszurechnen.

Bei 19 Prozent:

Bruttobetrag ÷ 1,19 = Nettoentgelt.

Bei 7 Prozent:

Bruttobetrag ÷ 1,07 = Nettoentgelt.

---

⇨ 42. Durchlaufende Posten

Durchlaufende Posten gehören nicht zum Entgelt.

Voraussetzung ist insbesondere, dass der Unternehmer

- im Namen und
- für Rechnung

eines anderen Beträge vereinnahmt oder verausgabt.

Eigene Aufwendungen des Unternehmers sind keine durchlaufenden Posten, auch wenn sie dem Kunden weiterberechnet werden.

---

⇨ 43. Entgelt von dritter Seite

Auch die Zahlung eines Dritten kann zum Entgelt gehören.

Voraussetzungen:

- Leistung des Unternehmers an den Leistungsempfänger,
- Zahlung des Dritten an den Unternehmer,
- unmittelbarer Zusammenhang zwischen Zahlung und konkreter Leistung,
- Zahlung dient der Förderung oder Verbilligung der Leistung an den Empfänger.

---

⇨ 44. Fremdwährung

Wird das Entgelt in einer ausländischen Währung vereinbart, ist es nach § 16 Abs. 6 UStG in Euro umzurechnen.

Maßgeblich ist grundsätzlich der Durchschnittskurs für den Zeitraum, in dem die Leistung oder Anzahlung ausgeführt beziehungsweise vereinnahmt wird.

---

⇨ 45. Entstehung der Steuer bei Sollversteuerung

► Grundfall

Bei der Besteuerung nach vereinbarten Entgelten entsteht die Umsatzsteuer grundsätzlich mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt wurde.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a UStG.

► Teilleistung

Bei Teilleistungen entsteht die Steuer mit Ablauf des Voranmeldungszeitraums, in dem die jeweilige Teilleistung ausgeführt wurde.

► Anzahlung

Wird das Entgelt oder ein Teil des Entgelts vor Ausführung der Leistung vereinnahmt, entsteht die Steuer bereits mit Ablauf des Voranmeldungszeitraums der Vereinnahmung.

Voraussetzungen:

- Zahlung vor Ausführung der Leistung oder Teilleistung,
- Vereinnahmung eines Entgelts oder Teilentgelts.

► Wichtig

Eine Anzahlung ist keine Teilleistung.

Bei einer Anzahlung wurde noch keine vollständige Leistung oder Teilleistung ausgeführt.

---

⇨ 46. Steuerfreie Umsätze und Leistungszeitpunkt

Bei einem steuerfreien Umsatz entsteht keine zu zahlende Umsatzsteuer.

Der Zeitpunkt der Leistung muss dennoch bestimmt werden, beispielsweise für

- die Steuerbefreiung,
- Nachweispflichten,
- Vorsteuerberichtigungen,
- Zusammenfassende Meldungen,
- Buchungs- und Erklärungspflichten.

---

⇨ 47. Umsatzsteuerliche Gebietsbegriffe

Für die Beurteilung grenzüberschreitender Umsätze sind die umsatzsteuerlichen Gebietsbegriffe maßgeblich.

Zu unterscheiden sind:

- Inland,
- übriges Gemeinschaftsgebiet,
- Gemeinschaftsgebiet,
- Drittlandsgebiet,
- Ausland.

---

⇨ 48. Inland

Inland ist grundsätzlich das Gebiet der Bundesrepublik Deutschland.

Bestimmte Gebiete gehören umsatzsteuerlich nicht zum Inland.

Dazu gehören insbesondere:

- Büsingen,
- die Insel Helgoland,
- Freizonen des Kontrolltyps I unter den gesetzlichen Voraussetzungen.

Diese Gebiete werden umsatzsteuerlich wie Drittlandsgebiet behandelt.

---

⇨ 49. Übriges Gemeinschaftsgebiet

Das übrige Gemeinschaftsgebiet umfasst die umsatzsteuerlichen Gebiete der anderen Mitgliedstaaten der Europäischen Union.

Vereinfacht:

Übriges Gemeinschaftsgebiet = Gemeinschaftsgebiet ohne deutsches Inland.

Warenbewegungen vom Inland in das übrige Gemeinschaftsgebiet können innergemeinschaftliche Lieferungen darstellen.

Warenbewegungen aus dem übrigen Gemeinschaftsgebiet in das Inland können innergemeinschaftliche Erwerbe auslösen.

---

⇨ 50. Gemeinschaftsgebiet

Das Gemeinschaftsgebiet umfasst das umsatzsteuerliche Inland und das übrige Gemeinschaftsgebiet.

Es ist nicht zwingend mit den politischen Staatsgebieten der EU-Mitgliedstaaten identisch.

Bestimmte Sondergebiete können umsatzsteuerlich ausgenommen sein.

---

⇨ 51. Drittlandsgebiet

Drittlandsgebiet sind grundsätzlich die Gebiete, die nicht zum umsatzsteuerlichen Gemeinschaftsgebiet gehören.

Dazu gehören insbesondere:

- Staaten außerhalb der Europäischen Union,
- Büsingen,
- die Insel Helgoland,
- bestimmte Freizonen.

Warenbewegungen vom Inland in das Drittlandsgebiet können Ausfuhrlieferungen sein.

Warenbewegungen aus dem Drittlandsgebiet in das Inland können Einfuhren darstellen.

---

⇨ 52. Ausland

Ausland sind alle Gebiete, die nicht Inland sind.

Das Ausland umfasst daher:

- das übrige Gemeinschaftsgebiet und
- das Drittlandsgebiet.

► Merksatz

Ausland ist nicht automatisch Drittland.

Auch ein anderer EU-Mitgliedstaat ist aus deutscher Sicht Ausland, aber kein Drittland.

---

⇨ 53. Einfuhrlieferung nach § 3 Abs. 8 UStG

Bei einer Lieferung aus dem Drittlandsgebiet kann sich der Lieferort nach § 3 Abs. 8 UStG in das Inland verlagern.

Voraussetzung ist insbesondere, dass der Lieferer oder sein Beauftragter Schuldner der Einfuhrumsatzsteuer ist.

Die Vorschrift ist bei Einfuhrsachverhalten gesondert zu prüfen.

---

⇨ 54. Reihengeschäft

Ein Reihengeschäft liegt vor, wenn

- mehrere Unternehmer,
- über denselben Gegenstand,
- Umsatzgeschäfte abschließen und
- der Gegenstand unmittelbar vom ersten Unternehmer zum letzten Abnehmer gelangt.

► Beispiel

Unternehmer A verkauft an Unternehmer B.

Unternehmer B verkauft denselben Gegenstand an Unternehmer C.

Die Ware wird unmittelbar von A an C transportiert.

Es liegen zwei Lieferungen vor:

- A an B,
- B an C.

Es gibt aber nur eine Warenbewegung.

---

⇨ 55. Nur eine bewegte Lieferung

Innerhalb eines Reihengeschäfts kann nur eine Lieferung die bewegte Lieferung sein.

Nur diese Lieferung wird nach § 3 Abs. 6 UStG beurteilt.

Alle übrigen Lieferungen sind unbewegte Lieferungen nach § 3 Abs. 7 Satz 2 UStG.

► Merksatz

Mehrere Lieferungen, aber nur eine bewegte Lieferung.

---

⇨ 56. Direkte Warenbewegung

Der Gegenstand muss unmittelbar vom ersten Unternehmer zum letzten Abnehmer gelangen.

Eine technisch oder organisatorisch bedingte Zwischenlagerung oder Übernachtung kann unschädlich sein, wenn der Transport wirtschaftlich einheitlich fortgesetzt wird.

Ein echter Verkauf oder eine freie Verfügung über die Ware während der Unterbrechung kann dagegen gegen ein einheitliches Reihengeschäft sprechen.

---

⇨ 57. Warenbewegung durch den ersten Unternehmer

Wird der Gegenstand durch den ersten Unternehmer in der Reihe befördert oder versendet, ist grundsätzlich dessen Lieferung die bewegte Lieferung.

► Beispiel

A verkauft an B.

B verkauft an C.

A transportiert die Ware unmittelbar zu C.

Bewegte Lieferung:

A an B.

Unbewegte Lieferung:

B an C.

Die Lieferung B an C folgt der bewegten Lieferung.

Ihr Ort liegt grundsätzlich dort, wo die Warenbewegung endet.

---

⇨ 58. Warenbewegung durch den letzten Abnehmer

Wird der Gegenstand durch den letzten Abnehmer befördert oder versendet, ist grundsätzlich die an ihn ausgeführte Lieferung die bewegte Lieferung.

► Beispiel

A verkauft an B.

B verkauft an C.

C holt die Ware bei A ab.

Bewegte Lieferung:

B an C.

Unbewegte Lieferung:

A an B.

Die Lieferung A an B geht der bewegten Lieferung voraus.

Ihr Ort liegt grundsätzlich dort, wo die Warenbewegung beginnt.

---

⇨ 59. Warenbewegung durch einen Zwischenhändler

Ein Zwischenhändler ist ein Unternehmer innerhalb der Reihe, der zugleich

- Abnehmer einer Lieferung und
- Lieferer der folgenden Lieferung

ist.

Transportiert der Zwischenhändler die Ware, ist zu bestimmen, welcher seiner beiden Lieferungen die Warenbewegung zugeordnet wird.

► Grundvermutung

Grundsätzlich wird die Warenbewegung der Lieferung an den Zwischenhändler zugeordnet.

► Abweichende Zuordnung

Unter den gesetzlichen Voraussetzungen kann die Warenbewegung der Lieferung des Zwischenhändlers an seinen Abnehmer zugeordnet werden.

Dabei kann insbesondere die Verwendung einer Umsatzsteuer-Identifikationsnummer des Abgangsstaats von Bedeutung sein.

► Prüfung

1. Wer organisiert den Transport?
2. Handelt diese Person als Lieferer oder Abnehmer?
3. Ist sie Zwischenhändler?
4. Welche Umsatzsteuer-Identifikationsnummer wurde verwendet?
5. Liegt ein Export- oder Einfuhrfall vor?
6. Welche Lieferung ist nach § 3 Abs. 6a UStG die bewegte Lieferung?

---

⇨ 60. Unbewegte Lieferung vor der bewegten Lieferung

Eine unbewegte Lieferung, die der bewegten Lieferung vorausgeht, wird nach § 3 Abs. 7 Satz 2 Nr. 1 UStG dort ausgeführt, wo die Beförderung oder Versendung beginnt.

► Ort

Abgangsort.

► Zeitpunkt

Beginn der Beförderung oder Versendung.

► Beispiel

A verkauft an B.

B verkauft an C.

C holt die Ware bei A ab.

Die bewegte Lieferung ist B an C.

Die Lieferung A an B geht der bewegten Lieferung voraus.

Ort der Lieferung A an B:

Abgangsort der Ware.

---

⇨ 61. Unbewegte Lieferung nach der bewegten Lieferung

Eine unbewegte Lieferung, die der bewegten Lieferung folgt, wird nach § 3 Abs. 7 Satz 2 Nr. 2 UStG dort ausgeführt, wo die Beförderung oder Versendung endet.

► Ort

Ankunftsort.

► Zeitpunkt

Ende der Beförderung oder Versendung.

► Beispiel

A verkauft an B.

B verkauft an C.

A transportiert die Ware unmittelbar zu C.

Die bewegte Lieferung ist A an B.

Die Lieferung B an C folgt der bewegten Lieferung.

Ort der Lieferung B an C:

Ankunftsort der Ware.

---

⇨ 62. Transport als Nebenleistung

Bei einer Warenlieferung gehört der Transport regelmäßig als unselbständige Nebenleistung zur Lieferung.

In einer Sachverhaltsskizze sollte deshalb der Beförderer oder Versender unmittelbar beim Pfeil derjenigen Lieferung eingetragen werden, der die Warenbewegung zugeordnet wird.

► Klausurhinweis

Der Transportpfeil entscheidet häufig darüber, welche Lieferung die bewegte Lieferung ist.

---

⇨ 63. Skizze eines Reihengeschäfts

Ein Reihengeschäft sollte immer grafisch dargestellt werden.

Beispiel:

A → B → C

Zusätzlich eintragen:

- Standorte der Beteiligten,
- Rechnungsbeziehungen,
- tatsächlicher Warenweg,
- Beförderer oder Versender,
- verwendete Umsatzsteuer-Identifikationsnummern,
- Beginn und Ende des Transports.

► Merksatz

Erst Rechnungsweg zeichnen.

Danach Warenweg eintragen.

Dann bewegte Lieferung zuordnen.

---

⇨ 64. Prüfungsschema Reihengeschäft

1. Schließen mehrere Unternehmer Umsatzgeschäfte über denselben Gegenstand ab?
2. Gelangt der Gegenstand unmittelbar vom ersten Unternehmer zum letzten Abnehmer?
3. Wer befördert oder versendet den Gegenstand?
4. Ist der Transporteur der erste Unternehmer?
5. Ist der Transporteur der letzte Abnehmer?
6. Ist der Transporteur ein Zwischenhändler?
7. Welche Umsatzsteuer-Identifikationsnummer wird verwendet?
8. Welche Lieferung ist die bewegte Lieferung?
9. Welche Lieferungen sind unbewegt?
10. Geht die unbewegte Lieferung der bewegten Lieferung voraus?
11. Oder folgt sie der bewegten Lieferung?
12. Ort jeder Lieferung bestimmen.
13. Steuerbarkeit jeder Lieferung gesondert prüfen.
14. Steuerbefreiung jeder Lieferung gesondert prüfen.

---

⇨ 65. Prüfungsschema bewegte Lieferung

1. Lieferung nach § 3 Abs. 1 UStG?
2. Feststehender Abnehmer?
3. Beförderung oder Versendung?
4. Wer führt oder beauftragt den Transport?
5. Beginn der Warenbewegung?
6. Ort nach § 3 Abs. 6 UStG?
7. Zeitpunkt bei Beginn der Warenbewegung?
8. Inland, übriges Gemeinschaftsgebiet oder Drittland?
9. Steuerbarkeit?
10. Steuerbefreiung als Ausfuhr- oder innergemeinschaftliche Lieferung?
11. Nachweise vorhanden?

---

⇨ 66. Prüfungsschema unbewegte Lieferung

1. Lieferung nach § 3 Abs. 1 UStG?
2. Keine der Lieferung zugeordnete Warenbewegung?
3. Zeitpunkt der Verschaffung der Verfügungsmacht?
4. Standort des Gegenstands zu diesem Zeitpunkt?
5. Ort nach § 3 Abs. 7 Satz 1 UStG?
6. Bei Reihengeschäft: § 3 Abs. 7 Satz 2 Nr. 1 oder Nr. 2?
7. Steuerbarkeit?
8. Steuerbefreiung?
9. Steuerschuldner?
10. Steuersatz und Bemessungsgrundlage?

---

⇨ 67. Formulierungshilfe bewegte Lieferung

Es liegt eine Lieferung im Sinne des § 3 Abs. 1 UStG vor, da der leistende Unternehmer dem Leistungsempfänger die Verfügungsmacht an dem Gegenstand verschafft.

Der Gegenstand wird im Zusammenhang mit dieser Lieferung befördert oder versendet.

Der Ort der Lieferung befindet sich nach § 3 Abs. 6 Satz 1 UStG dort, wo die Beförderung oder Versendung beginnt.

Die Lieferung wird mit Beginn der Beförderung oder Versendung ausgeführt.

---

⇨ 68. Formulierungshilfe unbewegte Lieferung

Es liegt eine unbewegte Lieferung im Sinne des § 3 Abs. 1 UStG vor.

Die Verfügungsmacht wird ohne eine dieser Lieferung zugeordnete Beförderung oder Versendung verschafft.

Der Ort der Lieferung befindet sich nach § 3 Abs. 7 UStG dort, wo sich der Gegenstand im Zeitpunkt der Verschaffung der Verfügungsmacht befindet.

---

⇨ 69. Formulierungshilfe Reihengeschäft

Mehrere Unternehmer haben über denselben Gegenstand Umsatzgeschäfte abgeschlossen.

Der Gegenstand gelangt unmittelbar vom ersten Unternehmer zum letzten Abnehmer.

Es liegt daher ein Reihengeschäft nach § 3 Abs. 6a UStG vor.

Da nur eine Lieferung die bewegte Lieferung sein kann, ist die Warenbewegung anhand der Transportverantwortung einer Lieferung zuzuordnen.

Die übrigen Lieferungen sind unbewegte Lieferungen nach § 3 Abs. 7 Satz 2 UStG.

---

⇨ 70. Typische Klausurfallen

► Fehler 1: Sofort mit der Steuerbefreiung beginnen

Zuerst müssen Leistungsart, Ort und Steuerbarkeit bestimmt werden.

Eine Steuerbefreiung kann nur für einen steuerbaren Umsatz geprüft werden.

---

► Fehler 2: Transport automatisch als eigene Leistung behandeln

Transport, Verpackung oder Versicherung sind häufig Nebenleistungen und teilen das Schicksal der Hauptleistung.

---

► Fehler 3: Werklieferung und Werkleistung verwechseln

Eigene Hauptstoffe:

Werklieferung.

Keine eigenen Hauptstoffe:

Werkleistung.

---

► Fehler 4: Zivilrechtliches Eigentum mit Verfügungsmacht gleichsetzen

Für die umsatzsteuerliche Lieferung ist die wirtschaftliche Verfügungsmacht entscheidend.

---

► Fehler 5: Grundstückslieferung erst bei Grundbucheintragung annehmen

Die Verfügungsmacht kann bereits mit Übergang von Nutzen und Lasten übergehen.

---

► Fehler 6: Eigentumsvorbehalt als Hindernis für eine Lieferung ansehen

Trotz Eigentumsvorbehalt kann der Käufer bereits wirtschaftlicher Eigentümer sein.

---

► Fehler 7: Ohne feststehenden Abnehmer eine bewegte Lieferung annehmen

Steht der Abnehmer zu Beginn des Transports noch nicht fest, kann zunächst ein rechtsgeschäftsloses Verbringen vorliegen.

---

► Fehler 8: Bei einem Reihengeschäft mehrere bewegte Lieferungen annehmen

Innerhalb eines Reihengeschäfts gibt es nur eine bewegte Lieferung.

---

► Fehler 9: Rechnungsweg und Warenweg verwechseln

Der Rechnungsweg verläuft zwischen allen Vertragspartnern.

Der Warenweg verläuft unmittelbar vom ersten Unternehmer zum letzten Abnehmer.

---

► Fehler 10: Unbewegte Lieferungen im Reihengeschäft nicht prüfen

Jede Lieferung muss einen eigenen Ort erhalten.

Lieferungen vor der bewegten Lieferung:

Abgangsort.

Lieferungen nach der bewegten Lieferung:

Ankunftsort.

---

► Fehler 11: Jeden EU-Staat als Inland behandeln

Inland ist aus deutscher Sicht grundsätzlich nur das deutsche Umsatzsteuergebiet.

Andere EU-Mitgliedstaaten gehören zum übrigen Gemeinschaftsgebiet.

---

► Fehler 12: Ausland und Drittland gleichsetzen

Das Ausland umfasst sowohl

- das übrige Gemeinschaftsgebiet als auch
- das Drittlandsgebiet.

---

► Fehler 13: Option nach § 9 UStG vergessen

Bei einer grundsätzlich steuerfreien Grundstückslieferung oder Grundstücksvermietung ist immer die Option zu prüfen.

---

► Fehler 14: Anzahlungen wie Teilleistungen behandeln

Eine Anzahlung ist eine Zahlung vor Leistungsausführung.

Eine Teilleistung ist bereits ein ausgeführter wirtschaftlich teilbarer Leistungsteil.

---

⇨ 71. Merksätze

- Erst Leistungsart, dann Leistungsort, dann Steuerbarkeit.
- Eine Lieferung setzt die Verschaffung der Verfügungsmacht voraus.
- Wirtschaftliches Eigentum ist wichtiger als die bloße zivilrechtliche Bezeichnung.
- Bei Grundstücken ist häufig der Übergang von Nutzen und Lasten maßgeblich.
- Bewegte Lieferung: Ort und Zeitpunkt liegen grundsätzlich am Beginn der Warenbewegung.
- Unbewegte Lieferung: Ort ist der Standort bei Verschaffung der Verfügungsmacht.
- Ohne feststehenden Abnehmer liegt noch keine bewegte Lieferung an diesen Abnehmer vor.
- Nebenleistungen teilen das umsatzsteuerliche Schicksal der Hauptleistung.
- Bei sonstigen Leistungen zuerst die Ausnahmen und danach B2B oder B2C prüfen.
- Ausland ist nicht dasselbe wie Drittland.
- In einem Reihengeschäft gibt es mehrere Lieferungen, aber nur eine bewegte Lieferung.
- Befördert der erste Unternehmer, ist grundsätzlich dessen Lieferung bewegt.
- Befördert der letzte Abnehmer, ist grundsätzlich die Lieferung an ihn bewegt.
- Bei Beförderung durch einen Zwischenhändler ist § 3 Abs. 6a UStG genau zu prüfen.
- Unbewegte Lieferungen vor der bewegten Lieferung liegen am Abgangsort.
- Unbewegte Lieferungen nach der bewegten Lieferung liegen am Ankunftsort.
- Nach jeder Steuerbefreiung ist die Option nach § 9 UStG zu prüfen.
- Erst nach der Steuerpflicht werden Steuerschuldner, Steuersatz und Bemessungsgrundlage bestimmt.
`
},
{
  id: "rechnungswesen-buchfuehrung-inventur-jahresabschluss-bilanzierung",

  title:
    "Buchführung, Inventur, Jahresabschluss und Bilanzierung",

  short:
    "Grundlagen zu Geschäftsjahr und Wirtschaftsjahr, Gewinnermittlungsarten, Buchführungspflicht, Inventurverfahren, Handels- und Steuerbilanz, wirtschaftlichem Eigentum sowie Bilanz- und GuV-Gliederung.",

  category: "Rechnungswesen",

  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Rechnungswesen Teil 2",

  keywords:
    "geschäftsjahr|wirtschaftsjahr|abweichendes wirtschaftsjahr|§ 4a estg|§ 240 hgb|§ 238 hgb|§ 140 ao|§ 141 ao|gewinnermittlung|betriebsvermögensvergleich|§ 5 estg|§ 4 abs. 1 estg|eür|§ 4 abs. 3 estg|buchführungspflicht|inventur|inventar|bilanz|stichtagsinventur|permanente inventur|zeitlich verlegte inventur|festwert|jahresabschluss|handelsbilanz|steuerbilanz|maßgeblichkeit|wirtschaftliches eigentum|§ 39 ao|§ 246 hgb|bilanzinhalt|vollständigkeitsgebot|verrechnungsverbot|§ 266 hgb|§ 275 hgb|gesamtkostenverfahren|umsatzkostenverfahren",

  references: [
    "§ 4 Abs. 1 EStG",
    "§ 4 Abs. 3 EStG",
    "§ 4a EStG",
    "§ 5 EStG",
    "§ 39 Abs. 2 Nr. 1 AO",
    "§ 60 EStDV",
    "§ 140 AO",
    "§ 141 AO",
    "§ 238 HGB",
    "§ 240 HGB",
    "§ 241 HGB",
    "§ 242 HGB",
    "§ 246 HGB",
    "§ 247 HGB",
    "§ 252 HGB",
    "§ 266 HGB",
    "§ 275 HGB",
    "§ 8b EStDV",
    "R 4a EStR",
    "R 5.3 EStR",
    "R 5.4 EStR"
  ],

  body: `
⇨ Buchführung, Inventur, Jahresabschluss und Bilanzierung

⇨ 1. Geschäftsjahr und Wirtschaftsjahr

► Handelsrechtliches Geschäftsjahr

Das Geschäftsjahr ist der handelsrechtliche Zeitraum, für den der Jahresabschluss erstellt wird.

Grundsätzlich gilt:

Geschäftsjahr = Kalenderjahr.

Bei Kaufleuten kann der Abschlussstichtag handelsrechtlich grundsätzlich abweichend gewählt werden.

Das Geschäftsjahr darf regelmäßig höchstens zwölf Monate umfassen.

Ein kürzerer Zeitraum ist möglich und wird als Rumpfgeschäftsjahr bezeichnet.

Typische Gründe für ein Rumpfgeschäftsjahr:

- Unternehmensgründung,
- Unternehmenserwerb,
- Betriebsaufgabe,
- Betriebsveräußerung,
- Umstellung des Abschlussstichtags.

---

⇨ 2. Steuerrechtliches Wirtschaftsjahr

Das Wirtschaftsjahr ist der steuerrechtliche Gewinnermittlungszeitraum.

Für Gewerbetreibende ist insbesondere § 4a EStG maßgeblich.

► Grundsatz

Das Wirtschaftsjahr entspricht grundsätzlich dem Kalenderjahr.

► Im Handelsregister eingetragene Gewerbetreibende

Bei im Handelsregister eingetragenen Gewerbetreibenden kann das Wirtschaftsjahr vom Kalenderjahr abweichen.

Ein abweichendes Wirtschaftsjahr kann beispielsweise enden am:

- 31. März,
- 30. Juni,
- 30. September.

► Umstellung des Wirtschaftsjahres

Bei der Umstellung ist zu unterscheiden:

⇶  Umstellung vom Kalenderjahr auf ein abweichendes Wirtschaftsjahr

Diese Umstellung bedarf grundsätzlich der Zustimmung des Finanzamts.

⇶  Umstellung von einem abweichenden Wirtschaftsjahr auf das Kalenderjahr

Hierfür ist grundsätzlich keine Zustimmung des Finanzamts erforderlich.

⇶  Umstellung von einem abweichenden Wirtschaftsjahr auf ein anderes abweichendes Wirtschaftsjahr

Diese Umstellung bedarf grundsätzlich ebenfalls der Zustimmung des Finanzamts.

► Merksatz

Die Rückkehr vom abweichenden Wirtschaftsjahr zum Kalenderjahr ist grundsätzlich ohne Zustimmung möglich.

---

⇨ 3. Gewinnzurechnung bei abweichendem Wirtschaftsjahr

Bei Gewerbebetrieben wird der Gewinn eines abweichenden Wirtschaftsjahres grundsätzlich dem Kalenderjahr zugerechnet, in dem das Wirtschaftsjahr endet.

► Beispiel

Wirtschaftsjahr:

1. Juli 2025 bis 30. Juni 2026.

Der Gewinn wird steuerlich grundsätzlich im Kalenderjahr 2026 erfasst.

Rechtsgrundlage:

§ 4a Abs. 2 Nr. 2 EStG.

► Klausurmerksatz

Nicht den Gewinn zeitanteilig auf zwei Kalenderjahre aufteilen.

Bei Gewerbebetrieben zählt grundsätzlich das Kalenderjahr, in dem das Wirtschaftsjahr endet.

---

⇨ 4. Gewinnermittlungsmethoden bei Gewerbetreibenden

Bei Gewerbetreibenden kommen insbesondere folgende Gewinnermittlungsmethoden in Betracht:

1. besonderer Betriebsvermögensvergleich nach § 5 EStG,
2. Einnahmenüberschussrechnung nach § 4 Abs. 3 EStG,
3. allgemeiner Betriebsvermögensvergleich nach § 4 Abs. 1 EStG,
4. Schätzung nach § 162 AO, wenn die Besteuerungsgrundlagen nicht ordnungsgemäß ermittelt werden können.

---

⇨ 5. Besonderer Betriebsvermögensvergleich nach § 5 EStG

Der Gewinn wird nach § 5 EStG ermittelt, wenn der Steuerpflichtige

- handelsrechtlich buchführungspflichtig ist,
- steuerrechtlich buchführungspflichtig ist oder
- freiwillig Bücher führt und regelmäßig Abschlüsse erstellt.

► Handelsrechtliche Buchführungspflicht

Kaufleute sind nach § 238 HGB grundsätzlich zur Buchführung verpflichtet.

Diese handelsrechtliche Pflicht wird über § 140 AO auch für steuerliche Zwecke übernommen.

► Steuerrechtliche Buchführungspflicht

Eine originär steuerrechtliche Buchführungspflicht kann sich aus § 141 AO ergeben.

► Freiwillige Buchführung

Auch ohne gesetzliche Buchführungspflicht kann ein Gewerbetreibender freiwillig Bücher führen und Abschlüsse erstellen.

In diesem Fall kann die Gewinnermittlung ebenfalls nach § 5 EStG erfolgen.

---

⇨ 6. Einnahmenüberschussrechnung nach § 4 Abs. 3 EStG

Die Einnahmenüberschussrechnung ist zulässig, wenn

- keine gesetzliche Buchführungspflicht besteht und
- nicht freiwillig Bücher geführt und Abschlüsse erstellt werden.

► Grundschema

Betriebseinnahmen

minus

Betriebsausgaben

gleich

Gewinn oder Verlust.

► Grundprinzip

Maßgeblich ist grundsätzlich der tatsächliche Zufluss und Abfluss.

Ausnahmen, insbesondere bei regelmäßig wiederkehrenden Einnahmen und Ausgaben oder bestimmten Wirtschaftsgütern, sind gesondert zu prüfen.

---

⇨ 7. Allgemeiner Betriebsvermögensvergleich nach § 4 Abs. 1 EStG

Der allgemeine Betriebsvermögensvergleich kommt insbesondere zur Anwendung, wenn

- keine Gewinnermittlung nach § 5 EStG vorliegt,
- aber dennoch bilanziert werden muss oder freiwillig bilanziert wird.

Typische Anwendungsfälle können insbesondere bei Land- und Forstwirten oder selbständig Tätigen auftreten.

► Grundschema

Betriebsvermögen am Schluss des Wirtschaftsjahres

minus

Betriebsvermögen am Schluss des vorangegangenen Wirtschaftsjahres

plus

Entnahmen

minus

Einlagen

gleich

Gewinn oder Verlust.

---

⇨ 8. Schätzungsfall

Kann die Finanzbehörde die Besteuerungsgrundlagen nicht ermitteln oder berechnen, sind sie nach § 162 AO zu schätzen.

Typische Gründe:

- fehlende Buchführung,
- formell oder materiell fehlerhafte Buchführung,
- nicht vorgelegte Unterlagen,
- ungeklärte Kassendifferenzen,
- erhebliche Buchführungsmängel,
- fehlende Aufzeichnungen.

► Wichtig

Die Schätzung ist keine eigenständige Gewinnermittlungsart, sondern ein Verfahren zur Ermittlung nicht feststellbarer Besteuerungsgrundlagen.

---

⇨ 9. Zweck der Buchführung

Buchführung bedeutet die planmäßige und lückenlose Erfassung aller Geschäftsvorfälle.

Sie dient insbesondere:

- dem Gläubigerschutz,
- der Eigenkontrolle,
- der Information über Vermögen, Schulden und Erfolg,
- der Gewinnermittlung,
- der Ermittlung steuerlicher Besteuerungsgrundlagen.

► Rechtsgrundlagen

- § 238 HGB,
- § 140 AO,
- § 141 AO.

---

⇨ 10. Handelsrechtliche Buchführungspflicht

Nach § 238 HGB ist grundsätzlich jeder Kaufmann verpflichtet,

- Bücher zu führen und
- seine Handelsgeschäfte sowie die Lage seines Vermögens nach den Grundsätzen ordnungsmäßiger Buchführung ersichtlich zu machen.

Die Buchführung muss so beschaffen sein, dass sich ein sachverständiger Dritter innerhalb angemessener Zeit einen Überblick über

- die Geschäftsvorfälle und
- die Lage des Unternehmens

verschaffen kann.

---

⇨ 11. Abgeleitete steuerliche Buchführungspflicht nach § 140 AO

Wer nach anderen Gesetzen als den Steuergesetzen Bücher und Aufzeichnungen führen muss, hat diese Verpflichtung auch für die Besteuerung zu erfüllen.

Typischer Fall:

Handelsrechtliche Buchführungspflicht nach § 238 HGB

führt über

§ 140 AO

zur steuerlichen Buchführungspflicht.

► Merksatz

Handelsrechtliche Buchführungspflicht zieht regelmäßig die steuerliche Buchführungspflicht nach sich.

---

⇨ 12. Originäre steuerliche Buchführungspflicht nach § 141 AO

§ 141 AO kann für bestimmte gewerbliche Unternehmer sowie Land- und Forstwirte eine eigenständige steuerliche Buchführungspflicht begründen.

Hierfür sind insbesondere gesetzliche Umsatz- oder Gewinngrenzen zu prüfen.

Die Buchführungspflicht beginnt grundsätzlich erst nach entsprechender Mitteilung durch die Finanzbehörde.

► Klausurprüfung

1. Besteht bereits eine Buchführungspflicht nach Handelsrecht?
2. Falls nein: Sind die Voraussetzungen des § 141 AO erfüllt?
3. Liegt eine Mitteilung des Finanzamts vor?
4. Ab wann beginnt die Buchführungspflicht?

---

⇨ 13. Aufstellung des Jahresabschlusses

Der Kaufmann hat zu Beginn seines Handelsgewerbes und für den Schluss jedes Geschäftsjahres einen Abschluss aufzustellen.

Der Jahresabschluss besteht bei Einzelkaufleuten und Personenhandelsgesellschaften grundsätzlich aus:

- Bilanz,
- Gewinn- und Verlustrechnung.

Bei Kapitalgesellschaften können weitere Bestandteile hinzukommen, insbesondere:

- Anhang,
- gegebenenfalls Lagebericht.

---

⇨ 14. Inventur

Die Inventur ist die tatsächliche Bestandsaufnahme aller Vermögensgegenstände und Schulden zu einem bestimmten Zeitpunkt.

Sie bildet die Grundlage für das Inventar und die Bilanz.

► Formen der Bestandsaufnahme

⇶  Körperliche Inventur

Körperliche Vermögensgegenstände werden erfasst durch:

- Zählen,
- Messen,
- Wiegen,
- gegebenenfalls Schätzen.

⇶  Buchinventur

Nicht körperliche Bestände werden anhand von Unterlagen ermittelt.

Beispiele:

- Bankguthaben,
- Forderungen,
- Verbindlichkeiten,
- Darlehen,
- Rückstellungen.

---

⇨ 15. Inventar

Das Inventar ist das schriftliche, mengen- und wertmäßige Verzeichnis aller Vermögensgegenstände und Schulden.

Es enthält regelmäßig:

- genaue Bezeichnung,
- Menge,
- Einzelwert,
- Gesamtwert.

► Abgrenzung

Inventur:

Vorgang der Bestandsaufnahme.

Inventar:

Ergebnis der Bestandsaufnahme in Listenform.

Bilanz:

Verdichtete Gegenüberstellung von Vermögen und Kapital.

---

⇨ 16. Bilanz

Die Bilanz ist die gedrängte Gegenüberstellung von Vermögen und Kapital zu einem bestimmten Stichtag.

► Grundstruktur

⇶  Aktivseite

- Anlagevermögen,
- Umlaufvermögen,
- Rechnungsabgrenzungsposten,
- gegebenenfalls weitere Aktivposten.

⇶  Passivseite

- Eigenkapital,
- Rückstellungen,
- Verbindlichkeiten,
- Rechnungsabgrenzungsposten,
- gegebenenfalls weitere Passivposten.

► Bilanzgleichung

Aktiva = Passiva.

Oder wirtschaftlich:

Vermögen = Eigenkapital + Fremdkapital.

---

⇨ 17. Anlagevermögen

Zum Anlagevermögen gehören Vermögensgegenstände, die dazu bestimmt sind, dem Geschäftsbetrieb dauerhaft zu dienen.

Rechtsgrundlage:

§ 247 Abs. 2 HGB.

Typische Beispiele:

- Grundstücke,
- Gebäude,
- Maschinen,
- Betriebs- und Geschäftsausstattung,
- langfristige Beteiligungen,
- Patente und Lizenzen.

► Abgrenzung

Entscheidend ist nicht allein die tatsächliche Nutzungsdauer.

Maßgeblich ist die Zweckbestimmung am Bilanzstichtag.

---

⇨ 18. Umlaufvermögen

Zum Umlaufvermögen gehören Vermögensgegenstände, die nicht dauerhaft dem Geschäftsbetrieb dienen sollen.

Typische Beispiele:

- Waren,
- Rohstoffe,
- Hilfsstoffe,
- Betriebsstoffe,
- Forderungen,
- kurzfristige Wertpapiere,
- Bankguthaben,
- Kassenbestand.

► Merksatz

Anlagevermögen dient dem Betrieb.

Umlaufvermögen wird im Betrieb umgesetzt, verarbeitet oder kurzfristig verbraucht.

---

⇨ 19. Arten der Inventur

► 19.1 Stichtagsinventur

Die Bestandsaufnahme erfolgt grundsätzlich am Bilanzstichtag.

Rechtsgrundlage:

§ 240 Abs. 2 HGB.

Eine zeitnahe Bestandsaufnahme innerhalb einer kurzen Frist vor oder nach dem Bilanzstichtag kann zulässig sein.

Die Bestandsveränderungen zwischen Aufnahmetag und Bilanzstichtag müssen nachvollziehbar fortgeschrieben oder zurückgerechnet werden.

► Typischer Zeitraum

In der Praxis wird häufig ein Zeitraum von bis zu zehn Tagen vor oder nach dem Bilanzstichtag verwendet.

---

⇨ 20. Permanente Inventur

Bei der permanenten Inventur werden die Bestände fortlaufend durch eine ordnungsgemäße Lagerbuchführung nachgewiesen.

Rechtsgrundlage:

§ 241 Abs. 2 HGB.

► Voraussetzungen

- ordnungsgemäße Bestandsbuchführung,
- jederzeitige Feststellbarkeit des Sollbestands,
- mindestens einmal jährlich körperliche Bestandsaufnahme,
- Abgleich zwischen Buch- und Istbestand.

► Wichtig

Die permanente Inventur ersetzt nicht vollständig die körperliche Bestandsaufnahme.

Diese muss im Laufe des Geschäftsjahres mindestens einmal durchgeführt werden.

---

⇨ 21. Zeitlich verlegte Inventur

Die Inventur kann innerhalb eines erweiterten Zeitraums durchgeführt werden.

Rechtsgrundlage:

§ 241 Abs. 3 HGB.

► Zeitraum

- innerhalb der letzten drei Monate vor dem Bilanzstichtag oder
- innerhalb der ersten zwei Monate nach dem Bilanzstichtag.

► Voraussetzung

Der Inventurwert muss wertmäßig auf den Bilanzstichtag fortgeschrieben oder zurückgerechnet werden.

► Fortschreibung

Inventurwert

plus Zugänge

minus Abgänge

bis zum Bilanzstichtag.

► Rückrechnung

Bestand am späteren Inventurtag

minus Zugänge seit dem Bilanzstichtag

plus Abgänge seit dem Bilanzstichtag.

---

⇨ 22. Festwertverfahren

Bestimmte Vermögensgegenstände können mit einem gleichbleibenden Festwert angesetzt werden.

Rechtsgrundlage:

§ 240 Abs. 3 HGB.

► Voraussetzungen

Die Vermögensgegenstände müssen

- regelmäßig ersetzt werden,
- für das Unternehmen insgesamt von nachrangiger Bedeutung sein und
- in Bestand, Wert und Zusammensetzung nur geringen Veränderungen unterliegen.

► Typische Anwendungsfälle

- Werkzeuge,
- Vorrichtungen,
- Gerüstmaterial,
- Schalungsmaterial,
- Verpackungsmaterial,
- Geschirr,
- Wäsche,
- bestimmte Roh-, Hilfs- und Betriebsstoffe.

► Folge

Der einmal ermittelte Festwert kann grundsätzlich über mehrere Jahre beibehalten werden.

In angemessenen Zeitabständen ist eine körperliche Bestandsaufnahme erforderlich.

---

⇨ 23. Handelsrechtlicher Jahresabschluss

Der handelsrechtliche Jahresabschluss wird nach den Vorschriften des HGB aufgestellt.

Für alle Kaufleute gelten insbesondere die §§ 238 bis 263 HGB.

Für Kapitalgesellschaften gelten ergänzend insbesondere die §§ 264 ff. HGB.

► Bedeutung

Der handelsrechtliche Jahresabschluss dient insbesondere:

- der Erfüllung der Rechnungslegungspflichten,
- dem Gläubigerschutz,
- der Information der Unternehmensleitung,
- der Information von Gesellschaftern,
- der Gewinnverteilung,
- gegebenenfalls der Prüfung und Offenlegung.

---

⇨ 24. Gewinnverteilung und Gewinnverwendung

► Personenhandelsgesellschaften

Bei Personenhandelsgesellschaften bildet der handelsrechtliche Jahresüberschuss regelmäßig die Ausgangsgröße für die gesellschaftsrechtliche Gewinnverteilung.

Die konkrete Verteilung richtet sich nach:

- Gesellschaftsvertrag,
- ergänzend den handelsrechtlichen Vorschriften.

► Kapitalgesellschaften

Bei Kapitalgesellschaften ist der Jahresüberschuss Grundlage für die Gewinnverwendung.

Mögliche Gewinnverwendungen:

- Ausschüttung,
- Einstellung in Gewinnrücklagen,
- Gewinnvortrag,
- Verlustausgleich.

---

⇨ 25. Steuerbilanz

Die Steuerbilanz dient der steuerlichen Gewinnermittlung.

Sie wird grundsätzlich aus der Handelsbilanz abgeleitet.

Rechtsgrundlagen:

- § 5 EStG,
- § 60 EStDV.

► Maßgeblichkeitsgrundsatz

Grundsätzlich sind die handelsrechtlichen Wertansätze auch für die Steuerbilanz maßgeblich, soweit das Steuerrecht keine abweichenden Regelungen vorsieht.

Vereinfacht:

Handelsbilanz

führt grundsätzlich zur

Steuerbilanz.

► Durchbrechungen

Das Steuerrecht kann eigenständige

- Ansatzvorschriften,
- Bewertungsvorschriften,
- Wahlrechte,
- Verbote

enthalten.

Dann können Handelsbilanz und Steuerbilanz voneinander abweichen.

---

⇨ 26. Einheitsbilanz und getrennte Bilanzen

► Einheitsbilanz

Stimmen Handels- und Steuerbilanz vollständig überein, kann eine Einheitsbilanz erstellt werden.

► Getrennte Handels- und Steuerbilanz

Weichen Handels- und Steuerrecht voneinander ab, können erstellt werden:

- eine Handelsbilanz und
- eine eigenständige Steuerbilanz.

► Überleitungsrechnung

Alternativ kann die Handelsbilanz durch eine steuerliche Überleitungsrechnung an die steuerrechtlichen Werte angepasst werden.

---

⇨ 27. Bedeutung der Steuerbilanz

Der steuerbilanzielle Gewinn dient insbesondere als Ausgangsgröße für:

- Einkommensteuer,
- Körperschaftsteuer,
- Gewerbesteuer.

Je nach Steuerart sind weitere außerbilanzielle Korrekturen vorzunehmen.

Typische Korrekturen:

- nicht abziehbare Betriebsausgaben,
- steuerfreie Erträge,
- Hinzurechnungen,
- Kürzungen,
- verdeckte Gewinnausschüttungen,
- Einlagen.

---

⇨ 28. Bilanzierung dem Grunde nach

Bei der Bilanzierung dem Grunde nach wird geprüft, ob ein Vermögensgegenstand, Wirtschaftsgut oder eine Schuld überhaupt in der Bilanz anzusetzen ist.

Kernfragen:

1. Liegt ein bilanzierungsfähiger Vermögensgegenstand oder ein Wirtschaftsgut vor?
2. Liegt eine Schuld oder Rückstellung vor?
3. Wem ist der Posten wirtschaftlich zuzurechnen?
4. Besteht ein Aktivierungsgebot, Aktivierungswahlrecht oder Aktivierungsverbot?
5. Besteht ein Passivierungsgebot, Passivierungswahlrecht oder Passivierungsverbot?

---

⇨ 29. Rechtliches und wirtschaftliches Eigentum

Grundsätzlich wird ein Vermögensgegenstand dem zivilrechtlichen Eigentümer zugerechnet.

Entscheidend kann jedoch das wirtschaftliche Eigentum sein.

Rechtsgrundlage:

§ 39 Abs. 2 Nr. 1 AO.

► Wirtschaftlicher Eigentümer

Wirtschaftlicher Eigentümer ist, wer

- die tatsächliche Herrschaft über das Wirtschaftsgut ausübt und
- den zivilrechtlichen Eigentümer für die gewöhnliche Nutzungsdauer wirtschaftlich von der Einwirkung auf das Wirtschaftsgut ausschließen kann.

Vereinfacht:

Wer über das Wirtschaftsgut wirtschaftlich wie ein Eigentümer verfügen kann, muss es grundsätzlich bilanzieren.

---

⇨ 30. Wirtschaftliches Eigentum in der Handelsbilanz

Auch handelsrechtlich ist die wirtschaftliche Zurechnung maßgeblich.

Rechtsgrundlage:

§ 246 Abs. 1 Satz 2 HGB.

Ein Vermögensgegenstand ist grundsätzlich in der Bilanz des wirtschaftlichen Eigentümers auszuweisen.

► Typische Prüfungsfälle

- Eigentumsvorbehalt,
- Leasing,
- Mietkauf,
- Sicherungsübereignung,
- Kommissionsgeschäfte,
- Treuhandverhältnisse,
- Verkauf mit Rückübertragungsvereinbarung.

---

⇨ 31. Bilanzstichtagsprinzip

Für Ansatz und Zurechnung sind grundsätzlich die Verhältnisse am Bilanzstichtag maßgeblich.

Zu prüfen ist:

- Wer trägt zu diesem Zeitpunkt Chancen und Risiken?
- Wer kann über den Gegenstand wirtschaftlich verfügen?
- Wer trägt das Wertminderungsrisiko?
- Wer erhält die Nutzungen?
- Wer trägt die laufenden Kosten?

► Merksatz

Nicht allein auf den Vertragstitel schauen.

Entscheidend ist die tatsächliche wirtschaftliche Gestaltung.

---

⇨ 32. Inhalt der Handelsbilanz

Die Handelsbilanz enthält insbesondere:

- Vermögensgegenstände,
- Schulden,
- Rechnungsabgrenzungsposten,
- Eigenkapital,
- Rückstellungen,
- Verbindlichkeiten.

Für Kapitalgesellschaften ergeben sich verbindliche Gliederungsvorschriften aus § 266 HGB.

---

⇨ 33. Inhalt der Steuerbilanz

Die Steuerbilanz enthält insbesondere:

- positive und negative Wirtschaftsgüter,
- Rechnungsabgrenzungsposten,
- Eigenkapital,
- Rückstellungen,
- Verbindlichkeiten,
- steuerrechtlich anzusetzende Sonderposten.

Die steuerrechtliche Bezeichnung „Wirtschaftsgut“ ist weiter gefasst als der handelsrechtliche Begriff des Vermögensgegenstands.

---

⇨ 34. Vollständigkeitsgebot

Nach dem Vollständigkeitsgebot müssen sämtliche bilanzierungspflichtigen Vermögensgegenstände, Schulden und Rechnungsabgrenzungsposten erfasst werden.

Rechtsgrundlage:

§ 246 Abs. 1 HGB.

Nicht erfasste Vermögensgegenstände oder Schulden führen zu einer unvollständigen Bilanz.

---

⇨ 35. Verrechnungsverbot

Aktivposten dürfen grundsätzlich nicht mit Passivposten verrechnet werden.

Aufwendungen dürfen grundsätzlich nicht mit Erträgen verrechnet werden.

Rechtsgrundlage:

§ 246 Abs. 2 HGB.

► Beispiel

Eine Forderung gegen einen Lieferanten darf nicht ohne Weiteres mit einer Verbindlichkeit gegenüber demselben Lieferanten saldiert werden.

Beide Posten sind grundsätzlich getrennt auszuweisen.

Gesetzliche Ausnahmen bleiben zu beachten.

---

⇨ 36. Bilanzgliederung bei Kapitalgesellschaften

Kapitalgesellschaften müssen ihre Bilanz grundsätzlich nach § 266 HGB gliedern.

► Aktivseite

Typische Hauptposten:

A. Anlagevermögen

B. Umlaufvermögen

C. Rechnungsabgrenzungsposten

D. aktive latente Steuern

E. aktiver Unterschiedsbetrag aus der Vermögensverrechnung.

► Passivseite

Typische Hauptposten:

A. Eigenkapital

B. Rückstellungen

C. Verbindlichkeiten

D. Rechnungsabgrenzungsposten

E. passive latente Steuern.

Die konkrete Gliederung richtet sich auch nach der Größenklasse der Kapitalgesellschaft.

---

⇨ 37. Kontenform der Bilanz

Die Bilanz wird grundsätzlich in Kontenform aufgestellt.

Das bedeutet:

- Aktiva auf der linken Seite,
- Passiva auf der rechten Seite.

Die Aktivseite zeigt die Mittelverwendung.

Die Passivseite zeigt die Mittelherkunft.

---

⇨ 38. Gewinn- und Verlustrechnung

Die Gewinn- und Verlustrechnung stellt Aufwendungen und Erträge eines Geschäftsjahres gegenüber.

Ergebnis:

- Jahresüberschuss oder
- Jahresfehlbetrag.

Kapitalgesellschaften müssen die GuV nach § 275 HGB gliedern.

---

⇨ 39. Gesamtkostenverfahren

Beim Gesamtkostenverfahren werden die Aufwendungen nach Aufwandsarten gegliedert.

Typische Posten:

- Umsatzerlöse,
- Bestandsveränderungen,
- aktivierte Eigenleistungen,
- sonstige betriebliche Erträge,
- Materialaufwand,
- Personalaufwand,
- Abschreibungen,
- sonstige betriebliche Aufwendungen.

► Grundgedanke

Den gesamten Leistungen einer Periode werden die gesamten Aufwendungen der Periode gegenübergestellt.

---

⇨ 40. Umsatzkostenverfahren

Beim Umsatzkostenverfahren werden die Aufwendungen nach Funktionsbereichen gegliedert.

Typische Posten:

- Umsatzerlöse,
- Herstellungskosten der zur Erzielung der Umsatzerlöse erbrachten Leistungen,
- Bruttoergebnis vom Umsatz,
- Vertriebskosten,
- allgemeine Verwaltungskosten,
- sonstige betriebliche Erträge und Aufwendungen.

► Grundgedanke

Den Umsatzerlösen werden die Herstellungskosten der tatsächlich abgesetzten Leistungen gegenübergestellt.

---

⇨ 41. Vergleich Gesamtkosten- und Umsatzkostenverfahren

► Gesamtkostenverfahren

Gliederung nach Aufwandsarten.

Beispiele:

- Material,
- Personal,
- Abschreibungen.

► Umsatzkostenverfahren

Gliederung nach Funktionsbereichen.

Beispiele:

- Herstellung,
- Vertrieb,
- Verwaltung.

► Ergebnis

Beide Verfahren müssen bei zutreffender Anwendung zum gleichen Jahresergebnis führen.

---

⇨ 42. Prüfungsschema Gewinnermittlung

1. Welche Einkunftsart liegt vor?
2. Besteht handelsrechtliche Buchführungspflicht?
3. Besteht steuerrechtliche Buchführungspflicht?
4. Werden freiwillig Bücher geführt?
5. Gewinnermittlung nach § 5 EStG?
6. Falls nein: EÜR nach § 4 Abs. 3 EStG zulässig?
7. Falls nein: Betriebsvermögensvergleich nach § 4 Abs. 1 EStG?
8. Wirtschaftsjahr bestimmen.
9. Gewinn dem richtigen Kalenderjahr zuordnen.
10. Außerbilanzielle Korrekturen vornehmen.

---

⇨ 43. Prüfungsschema Inventur

1. Bilanzstichtag feststellen.
2. Welche Vermögensgegenstände sind körperlich aufzunehmen?
3. Welche Posten werden buchmäßig ermittelt?
4. Welche Inventurart wird verwendet?
5. Liegt eine zulässige zeitliche Verlegung vor?
6. Ist eine Fortschreibung oder Rückrechnung erforderlich?
7. Ist ein Festwert zulässig?
8. Stimmen Buch- und Istbestand überein?
9. Inventurdifferenzen dokumentieren und buchen.

---

⇨ 44. Prüfungsschema Bilanzierung

1. Liegt ein Vermögensgegenstand oder Wirtschaftsgut vor?
2. Liegt eine Schuld oder Rückstellung vor?
3. Wer ist rechtlicher Eigentümer?
4. Wer ist wirtschaftlicher Eigentümer?
5. Wem ist der Posten am Bilanzstichtag zuzurechnen?
6. Aktivierungs- oder Passivierungspflicht?
7. Handelsrechtlicher Ansatz?
8. Steuerrechtlicher Ansatz?
9. Bestehen Abweichungen zwischen HB und StB?
10. Ist eine Überleitungsrechnung erforderlich?

---

⇨ 45. Typische Klausurfallen

► Fehler 1: Geschäftsjahr und Wirtschaftsjahr gleichsetzen

Das Geschäftsjahr ist handelsrechtlich.

Das Wirtschaftsjahr ist steuerrechtlich.

Die Zeiträume stimmen häufig überein, müssen aber nicht identisch sein.

---

► Fehler 2: Zustimmungspflicht falsch beurteilen

Die Umstellung vom abweichenden Wirtschaftsjahr zurück auf das Kalenderjahr ist grundsätzlich ohne Zustimmung möglich.

Die Umstellung auf ein abweichendes Wirtschaftsjahr bedarf grundsätzlich der Zustimmung.

---

► Fehler 3: Gewinn bei abweichendem Wirtschaftsjahr zeitanteilig verteilen

Bei Gewerbebetrieben wird der Gewinn grundsätzlich vollständig im Kalenderjahr erfasst, in dem das Wirtschaftsjahr endet.

---

► Fehler 4: EÜR trotz Buchführungspflicht anwenden

Wer buchführungspflichtig ist oder freiwillig Bücher führt und Abschlüsse erstellt, kann grundsätzlich nicht nach § 4 Abs. 3 EStG ermitteln.

---

► Fehler 5: Inventur und Inventar verwechseln

Inventur ist der Vorgang.

Inventar ist das Ergebnis.

---

► Fehler 6: Permanente Inventur als vollständigen Ersatz der körperlichen Inventur behandeln

Auch bei permanenter Inventur muss grundsätzlich mindestens einmal jährlich eine körperliche Bestandsaufnahme erfolgen.

---

► Fehler 7: Zeitlich verlegte Inventur ohne Fortschreibung

Der Inventurwert muss auf den Bilanzstichtag fortgeschrieben oder zurückgerechnet werden.

---

► Fehler 8: Festwert ohne Voraussetzungen anwenden

Der Festwert ist nur zulässig, wenn Bestand, Wert und Zusammensetzung nur geringen Schwankungen unterliegen und der Gesamtwert von nachrangiger Bedeutung ist.

---

► Fehler 9: Rechtliches Eigentum automatisch als Bilanzierungsgrund ansehen

Bilanzieren muss grundsätzlich der wirtschaftliche Eigentümer.

---

► Fehler 10: Handelsbilanz ungeprüft als Steuerbilanz übernehmen

Steuerrechtliche Ansatz- und Bewertungsvorschriften können von der Handelsbilanz abweichen.

---

► Fehler 11: Vermögen und Schulden saldieren

Das Verrechnungsverbot verlangt grundsätzlich einen getrennten Ausweis.

---

► Fehler 12: GuV-Verfahren vermischen

Beim Gesamtkostenverfahren erfolgt die Gliederung nach Aufwandsarten.

Beim Umsatzkostenverfahren erfolgt die Gliederung nach Funktionsbereichen.

---

⇨ 46. Merksätze

- Das Geschäftsjahr ist handelsrechtlich, das Wirtschaftsjahr steuerrechtlich.
- Ein Wirtschaftsjahr darf grundsätzlich höchstens zwölf Monate umfassen.
- Die Rückkehr vom abweichenden Wirtschaftsjahr zum Kalenderjahr ist grundsätzlich ohne Zustimmung möglich.
- Der Gewinn eines gewerblichen abweichenden Wirtschaftsjahres gehört in das Kalenderjahr, in dem das Wirtschaftsjahr endet.
- § 5 EStG gilt bei Buchführungspflicht oder freiwilliger Buchführung.
- Die EÜR ist nur zulässig, wenn keine Buchführungspflicht besteht und keine freiwillige Bilanzierung erfolgt.
- Handelsrechtliche Buchführungspflichten wirken über § 140 AO auch steuerlich.
- Inventur ist die Bestandsaufnahme, Inventar das Verzeichnis und Bilanz die verdichtete Gegenüberstellung.
- Anlagevermögen ist dazu bestimmt, dem Betrieb dauerhaft zu dienen.
- Bei permanenter Inventur bleibt eine jährliche körperliche Aufnahme erforderlich.
- Die zeitlich verlegte Inventur liegt innerhalb der letzten drei Monate vor oder ersten zwei Monate nach dem Bilanzstichtag.
- Wirtschaftliches Eigentum ist für die Bilanzierung maßgeblich.
- Die Handelsbilanz ist grundsätzlich Ausgangspunkt der Steuerbilanz.
- Steuerrechtliche Vorschriften können die Maßgeblichkeit durchbrechen.
- Das Vollständigkeitsgebot verlangt die Erfassung aller bilanzierungspflichtigen Posten.
- Aktiva und Passiva dürfen grundsätzlich nicht miteinander verrechnet werden.
- Kapitalgesellschaften gliedern die Bilanz nach § 266 HGB.
- Die GuV kann nach dem Gesamtkosten- oder Umsatzkostenverfahren aufgestellt werden.
`
},
{
  id: "rechnungswesen-einkuenfte-betriebsausgaben-pkw-wirtschaftsjahr",

  title:
    "Einkünfteermittlung, Betriebsausgaben, Pkw-Privatnutzung und Wirtschaftsjahr",

  short:
    "Grundlagen der Einkünfteermittlung, Abgrenzung von Betriebsausgaben, Geschenke an Geschäftsfreunde, private Nutzung betrieblicher Pkw einschließlich Elektrofahrzeugen sowie Regeln zum Wirtschaftsjahr.",

  category: "Rechnungswesen / Einkommensteuer",

  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Rechnungswesen Teil 2, aktualisiert nach geltendem Recht",

  keywords:
    "einkünfteermittlung|gewinnermittlung|gewinneinkünfte|überschusseinkünfte|betriebsvermögensvergleich|eür|einnahmenüberschussrechnung|betriebseinnahmen|betriebsausgaben|werbungskosten|§ 4 estg|§ 5 estg|nicht abziehbare betriebsausgaben|geschenke geschäftsfreunde|50 euro grenze|§ 4 abs. 5 estg|§ 4 abs. 7 estg|gewerbesteuer|privatnutzung pkw|1 prozent regelung|0,03 prozent regelung|fahrtenbuch|bruttolistenpreis|elektrofahrzeug|hybridelektrofahrzeug|viertelansatz|hälftiger ansatz|wirtschaftsjahr|rumpfwirtschaftsjahr|abweichendes wirtschaftsjahr|§ 4a estg",

  references: [
    "§ 2 Abs. 1 EStG",
    "§ 2 Abs. 2 EStG",
    "§ 4 Abs. 1 EStG",
    "§ 4 Abs. 3 EStG",
    "§ 4 Abs. 4 EStG",
    "§ 4 Abs. 5 Satz 1 Nr. 1 EStG",
    "§ 4 Abs. 5 Satz 1 Nr. 6 EStG",
    "§ 4 Abs. 5b EStG",
    "§ 4 Abs. 6 EStG",
    "§ 4 Abs. 7 EStG",
    "§ 4a EStG",
    "§ 5 EStG",
    "§ 6 Abs. 1 Nr. 4 EStG",
    "§ 8 EStG",
    "§ 8b EStDV",
    "§ 9 EStG",
    "§ 9a EStG",
    "§ 12 Nr. 1 EStG",
    "§ 13 EStG",
    "§ 15 EStG",
    "§ 18 EStG",
    "§§ 19 bis 22 EStG",
    "§ 15 Abs. 1a UStG",
    "§ 3 Abs. 9a UStG",
    "R 4.10 EStR",
    "R 4a EStR",
    "R 5.7 EStR"
  ],

  body: `
⇨ Einkünfteermittlung, Betriebsausgaben, Pkw-Privatnutzung und Wirtschaftsjahr

⇨ 1. Ermittlung der Einkünfte

► Grundsatz der getrennten Ermittlung

Die Einkünfte sind für jede Einkunftsart getrennt zu ermitteln.

Das Einkommensteuergesetz unterscheidet sieben Einkunftsarten:

1. Einkünfte aus Land- und Forstwirtschaft,
2. Einkünfte aus Gewerbebetrieb,
3. Einkünfte aus selbständiger Arbeit,
4. Einkünfte aus nichtselbständiger Arbeit,
5. Einkünfte aus Kapitalvermögen,
6. Einkünfte aus Vermietung und Verpachtung,
7. sonstige Einkünfte im Sinne des § 22 EStG.

Die ersten drei Einkunftsarten sind Gewinneinkünfte.

Die übrigen vier Einkunftsarten sind Überschusseinkünfte.

---

⇨ 2. Gewinneinkünfte

► Betroffene Einkunftsarten

Zu den Gewinneinkünften gehören:

- Land- und Forstwirtschaft nach § 13 EStG,
- Gewerbebetrieb nach § 15 EStG,
- selbständige Arbeit nach § 18 EStG.

Einkünfte sind bei diesen Einkunftsarten der Gewinn.

► Mögliche Gewinnermittlungsarten

Der Gewinn kann insbesondere ermittelt werden durch:

1. Betriebsvermögensvergleich nach § 4 Abs. 1 EStG,
2. Betriebsvermögensvergleich nach § 5 EStG,
3. Einnahmenüberschussrechnung nach § 4 Abs. 3 EStG.

---

⇨ 3. Betriebsvermögensvergleich

► Grundgedanke

Beim Betriebsvermögensvergleich wird die Veränderung des Betriebsvermögens zwischen zwei Bilanzstichtagen ermittelt.

Vereinfachtes Grundschema:

Betriebsvermögen am Schluss des Wirtschaftsjahres

minus

Betriebsvermögen am Schluss des vorangegangenen Wirtschaftsjahres

plus

Entnahmen

minus

Einlagen

gleich

Gewinn oder Verlust.

► § 4 Abs. 1 EStG

§ 4 Abs. 1 EStG enthält die steuerliche Grunddefinition des Gewinns durch Betriebsvermögensvergleich.

► § 5 EStG

§ 5 EStG betrifft insbesondere Gewerbetreibende, die

- aufgrund gesetzlicher Vorschriften Bücher führen und Abschlüsse erstellen müssen oder
- freiwillig Bücher führen und regelmäßig Abschlüsse erstellen.

Ausgangspunkt ist grundsätzlich die Handelsbilanz, die unter Beachtung steuerlicher Vorschriften zur Steuerbilanz übergeleitet wird.

► Merksatz

Beim Betriebsvermögensvergleich wird nicht lediglich der Zahlungsfluss betrachtet, sondern die wirtschaftliche Vermögensentwicklung des Betriebs.

---

⇨ 4. Einnahmenüberschussrechnung nach § 4 Abs. 3 EStG

► Grundschema

Betriebseinnahmen

minus

Betriebsausgaben

gleich

Gewinn oder Verlust.

Die Einnahmenüberschussrechnung wird auch bezeichnet als:

- EÜR,
- Überschussrechnung,
- Gewinnermittlung nach § 4 Abs. 3 EStG.

► Grundprinzip

Grundsätzlich ist auf den tatsächlichen Zufluss und Abfluss von Einnahmen und Ausgaben abzustellen.

Besondere gesetzliche Ausnahmen bleiben zu beachten.

► Abgrenzung zur Bilanz

Bei der Bilanzierung wird die wirtschaftliche Entstehung berücksichtigt.

Bei der EÜR ist grundsätzlich der Zahlungszeitpunkt entscheidend.

---

⇨ 5. Überschusseinkünfte

► Betroffene Einkunftsarten

Zu den Überschusseinkünften gehören:

- nichtselbständige Arbeit,
- Kapitalvermögen,
- Vermietung und Verpachtung,
- sonstige Einkünfte.

► Grundschema

Einnahmen nach § 8 EStG

minus

Werbungskosten nach §§ 9 und 9a EStG

gleich

Überschuss der Einnahmen über die Werbungskosten oder Verlust.

► Abgrenzung

Bei Gewinneinkünften spricht man von:

- Betriebseinnahmen,
- Betriebsausgaben,
- Gewinn.

Bei Überschusseinkünften spricht man von:

- Einnahmen,
- Werbungskosten,
- Überschuss.

► Merksatz

Betriebsausgaben gehören zu Gewinneinkünften.

Werbungskosten gehören zu Überschusseinkünften.

---

⇨ 6. Betriebsausgaben nach § 4 Abs. 4 EStG

► Definition

Betriebsausgaben sind Aufwendungen, die durch den Betrieb veranlasst sind.

Die betriebliche Veranlassung liegt vor, wenn ein objektiver wirtschaftlicher Zusammenhang mit dem Betrieb besteht.

Typische Betriebsausgaben:

- Wareneinkauf,
- Löhne und Gehälter,
- Miete für Geschäftsräume,
- betriebliche Versicherungen,
- Beratungskosten,
- Fahrzeugkosten,
- Abschreibungen,
- Büromaterial,
- Telefon- und Internetkosten.

► Rechtsfolge

Betriebsausgaben mindern grundsätzlich den steuerlichen Gewinn.

► Prüfungsschema

1. Liegt ein Aufwand vor?
2. Besteht ein wirtschaftlicher Zusammenhang mit dem Betrieb?
3. Liegt eine private Mitveranlassung vor?
4. Greift ein Abzugsverbot?
5. Bestehen besondere Aufzeichnungs- oder Nachweispflichten?
6. In welchem Wirtschaftsjahr ist der Aufwand zu berücksichtigen?

---

⇨ 7. Abgrenzung zu privaten Aufwendungen

Aufwendungen für die private Lebensführung sind grundsätzlich keine Betriebsausgaben.

Dies gilt auch dann, wenn die Aufwendungen mittelbar die berufliche oder betriebliche Tätigkeit fördern können.

Typische private Aufwendungen:

- private Wohnung,
- private Lebensmittel,
- gewöhnliche Kleidung,
- private Urlaubsreisen,
- private Freizeitgestaltung.

Bei gemischt veranlassten Aufwendungen ist zu prüfen, ob eine sachgerechte Aufteilung möglich ist.

Ist der private und betriebliche Anteil nicht trennbar und prägt die private Veranlassung den Aufwand, kann der Abzug insgesamt ausgeschlossen sein.

---

⇨ 8. Nicht abziehbare Betriebsausgaben

Nicht jede betrieblich veranlasste Ausgabe darf den steuerlichen Gewinn mindern.

§ 4 Abs. 5 EStG enthält besondere Abzugsverbote und Abzugsbeschränkungen.

Typische Fälle:

- bestimmte Geschenke,
- bestimmte Bewirtungsaufwendungen,
- Aufwendungen für Jagd, Fischerei, Segel- oder Motorjachten und ähnliche Zwecke,
- bestimmte Gästehäuser,
- Mehraufwendungen für Fahrten zwischen Wohnung und Betriebsstätte,
- Geldbußen und Ordnungsgelder,
- unangemessene Aufwendungen.

► Bedeutung

Der Aufwand kann handelsrechtlich oder buchhalterisch erfasst sein.

Für die steuerliche Gewinnermittlung muss er jedoch außerbilanziell hinzugerechnet oder als nicht abziehbar behandelt werden.

---

⇨ 9. Gewerbesteuer als nicht abziehbare Betriebsausgabe

Die Gewerbesteuer und die darauf entfallenden steuerlichen Nebenleistungen dürfen den einkommensteuerlichen Gewinn nicht mindern.

Rechtsgrundlage:

§ 4 Abs. 5b EStG.

► Buchhalterische Behandlung

Wurde Gewerbesteuer als Aufwand gebucht, muss sie bei der steuerlichen Gewinnermittlung wieder hinzugerechnet werden.

► Beispiel

Handelsrechtlicher Gewinn:

120.000 €.

Enthaltener Gewerbesteueraufwand:

15.000 €.

Steuerlicher Gewinn vor weiteren Korrekturen:

120.000 € + 15.000 €

= 135.000 €.

► Merksatz

Die Gewerbesteuer wird zwar als Aufwand gebucht, ist steuerlich aber nicht gewinnmindernd abzugsfähig.

---

⇨ 10. Aufwendungen zur Förderung staatspolitischer Zwecke

Aufwendungen zur Förderung staatspolitischer Zwecke sind nach § 4 Abs. 6 EStG grundsätzlich keine Betriebsausgaben.

Eine Berücksichtigung kann gegebenenfalls nach anderen Vorschriften, beispielsweise im Bereich des Spendenabzugs, zu prüfen sein.

---

⇨ 11. Geschenke an Geschäftsfreunde

► Anwendungsbereich

§ 4 Abs. 5 Satz 1 Nr. 1 EStG betrifft betrieblich veranlasste Geschenke an Personen, die nicht Arbeitnehmer des Steuerpflichtigen sind.

Typische Empfänger:

- Kunden,
- Lieferanten,
- Geschäftspartner,
- Berater,
- Vermittler,
- sonstige Geschäftsfreunde.

► Begriff des Geschenks

Ein Geschenk setzt grundsätzlich eine unentgeltliche Zuwendung voraus.

Der Empfänger erhält den Gegenstand, ohne hierfür eine konkrete Gegenleistung erbringen zu müssen.

Keine Geschenke sind insbesondere:

- Preisnachlässe,
- Warenproben,
- Zugaben im unmittelbaren Leistungsaustausch,
- ausschließlich betrieblich nutzbare Gegenstände, wenn die Voraussetzungen einer anderen Einordnung erfüllt sind.

---

⇨ 12. Geschenkgrenze von 50 €

► Grundsatz

Die Anschaffungs- oder Herstellungskosten der im Wirtschaftsjahr an einen Empfänger zugewendeten Geschenke dürfen insgesamt 50 € nicht übersteigen.

Maßgeblich ist:

- die Summe pro Empfänger,
- innerhalb eines Wirtschaftsjahres.

► Freigrenze

Die Grenze von 50 € ist eine Freigrenze und kein Freibetrag.

Das bedeutet:

Geschenke bis einschließlich 50 €:

grundsätzlich abzugsfähig.

Geschenke von insgesamt mehr als 50 €:

vollständig nicht abzugsfähig.

► Beispiel 1

Ein Geschäftspartner erhält im Jahr:

- Geschenk im März: 20 €,
- Geschenk im Dezember: 25 €.

Gesamtkosten:

45 €.

Folge:

Grundsätzlich abzugsfähige Betriebsausgabe.

► Beispiel 2

Ein Geschäftspartner erhält im Jahr:

- Geschenk im März: 30 €,
- Geschenk im Dezember: 25 €.

Gesamtkosten:

55 €.

Folge:

Die gesamten 55 € sind nicht als Betriebsausgabe abziehbar.

Nicht nur der die Grenze übersteigende Betrag von 5 € ist ausgeschlossen.

---

⇨ 13. Netto- oder Bruttogrenze bei Geschenken

Ob für die 50-€-Grenze der Netto- oder Bruttobetrag maßgeblich ist, hängt vom Vorsteuerabzug ab.

► Vorsteuerabzug möglich

Ist der Unternehmer zum Vorsteuerabzug berechtigt, sind grundsätzlich die Nettokosten maßgeblich.

► Kein Vorsteuerabzug

Ist der Unternehmer nicht zum Vorsteuerabzug berechtigt, gehört die Umsatzsteuer zu den Anschaffungskosten.

Dann ist grundsätzlich der Bruttobetrag maßgeblich.

► Merksatz

Vorsteuerabzugsberechtigter Unternehmer:

Nettowert prüfen.

Nicht vorsteuerabzugsberechtigter Unternehmer:

Bruttowert prüfen.

---

⇨ 14. Besondere Aufzeichnungspflichten für Geschenke

Die Abziehbarkeit setzt zusätzlich voraus, dass die besonderen Aufzeichnungspflichten nach § 4 Abs. 7 EStG eingehalten werden.

Die Aufwendungen müssen

- einzeln,
- getrennt von den sonstigen Betriebsausgaben und
- eindeutig nachprüfbar

aufgezeichnet werden.

Erforderlich ist insbesondere die Zuordnung zum jeweiligen Empfänger.

► Folge einer fehlenden Aufzeichnung

Auch ein Geschenk unterhalb der 50-€-Grenze kann nicht abziehbar sein, wenn die besonderen Aufzeichnungspflichten nicht erfüllt werden.

---

⇨ 15. Umsatzsteuer bei Geschenken

Bei einkommensteuerlich nicht abziehbaren Geschenken kann auch der Vorsteuerabzug ausgeschlossen sein.

Rechtsgrundlage:

§ 15 Abs. 1a UStG in Verbindung mit § 4 Abs. 5 EStG.

Daher sind getrennt zu prüfen:

1. Betriebsausgabenabzug nach dem EStG,
2. Vorsteuerabzug nach dem UStG,
3. gegebenenfalls Umsatzbesteuerung der unentgeltlichen Zuwendung.

---

⇨ 16. Private Nutzung eines betrieblichen Pkw

Wird ein betrieblicher Pkw auch privat genutzt, muss der private Nutzungsanteil gewinnerhöhend erfasst werden.

Bei Einzelunternehmen und Mitunternehmerschaften erfolgt dies grundsätzlich als Nutzungsentnahme.

Rechtsgrundlage:

§ 6 Abs. 1 Nr. 4 EStG.

Bei Kapitalgesellschaften liegt demgegenüber regelmäßig keine Privatentnahme der Gesellschaft vor.

Die Fahrzeugüberlassung an einen Gesellschafter oder Arbeitnehmer ist dort gesondert zu beurteilen.

---

⇨ 17. Voraussetzungen der 1-%-Regelung

Die pauschale 1-%-Regelung setzt grundsätzlich voraus, dass

- der Pkw zum notwendigen Betriebsvermögen gehört und
- zu mehr als 50 % betrieblich genutzt wird.

Zu den betrieblichen Fahrten zählen grundsätzlich auch Fahrten zwischen Wohnung und Betriebsstätte.

Liegt die betriebliche Nutzung nicht über 50 %, ist die 1-%-Regelung für die Bewertung der Nutzungsentnahme grundsätzlich nicht anwendbar.

---

⇨ 18. Berechnung der 1-%-Regelung

► Bemessungsgrundlage

Maßgeblich ist der inländische Bruttolistenpreis im Zeitpunkt der Erstzulassung.

Einzubeziehen sind:

- Umsatzsteuer,
- werkseitige Sonderausstattung.

Nicht maßgeblich sind:

- tatsächlicher Kaufpreis,
- Gebrauchtwagenpreis,
- Buchwert,
- aktuelle Marktwertentwicklung,
- tatsächlich gewährte Rabatte.

► Abrundung

Der Bruttolistenpreis wird auf volle 100 € nach unten abgerundet.

► Monatliche Privatnutzung

Monatlicher Privatanteil:

1 % des abgerundeten Bruttolistenpreises.

► Jahreswert

Monatlicher Privatanteil

× Anzahl der Nutzungsmonate.

---

⇨ 19. Beispiel zur 1-%-Regelung

Bruttolistenpreis bei Erstzulassung:

45.850 €.

Abrundung auf volle 100 €:

45.800 €.

Monatlicher Privatanteil:

45.800 € × 1 %

= 458 €.

Bei ganzjähriger Nutzung:

458 € × 12 Monate

= 5.496 €.

Dieser Betrag erhöht grundsätzlich den Gewinn.

---

⇨ 20. Kostendeckelung

Der nach der 1-%-Regelung und gegebenenfalls der Entfernungspauschalregelung ermittelte Nutzungswert soll die tatsächlich angefallenen Gesamtkosten des Fahrzeugs grundsätzlich nicht überschreiten.

Sind die pauschal ermittelten Werte höher als die tatsächlichen Gesamtkosten, ist die sogenannte Kostendeckelung zu prüfen.

Zu den Gesamtkosten gehören insbesondere:

- Abschreibung,
- Leasingraten,
- Kraftstoff,
- Strom,
- Versicherung,
- Reparaturen,
- Wartung,
- Kfz-Steuer.

---

⇨ 21. Fahrten zwischen Wohnung und Betriebsstätte

Neben der privaten Nutzung ist die Nutzung für Fahrten zwischen Wohnung und Betriebsstätte gesondert zu berücksichtigen.

Bei Anwendung der pauschalen Methode ist regelmäßig ein Wert von

0,03 % des Bruttolistenpreises

je Entfernungskilometer

und Monat

anzusetzen.

Rechtsgrundlage:

§ 4 Abs. 5 Satz 1 Nr. 6 EStG in Verbindung mit § 6 Abs. 1 Nr. 4 EStG.

► Formel

Abgerundeter Bruttolistenpreis

× 0,03 %

× einfache Entfernung in Kilometern

× Nutzungsmonate.

Die einfache Entfernung ist maßgeblich, nicht die Hin- und Rückfahrt.

---

⇨ 22. Beispiel: Wohnung und Betriebsstätte

Abgerundeter Bruttolistenpreis:

45.800 €.

Einfache Entfernung:

20 km.

Monatlicher Wert:

45.800 € × 0,03 % × 20

= 274,80 €.

Jahreswert:

274,80 € × 12

= 3.297,60 €.

Die konkrete steuerliche Auswirkung ist unter Berücksichtigung der Entfernungspauschale und des Betriebsausgabenabzugs zu ermitteln.

---

⇨ 23. Fahrtenbuchmethode

Statt der pauschalen Bewertung kann der private Nutzungsanteil anhand der tatsächlichen Kosten und der tatsächlich gefahrenen Kilometer ermittelt werden.

Voraussetzung ist ein ordnungsgemäßes Fahrtenbuch.

► Grundformel

Gesamte Fahrzeugkosten

× private Kilometer

÷ Gesamtkilometer

= privater Nutzungsanteil.

Fahrten zwischen Wohnung und Betriebsstätte sind gesondert zu berücksichtigen.

► Anforderungen an das Fahrtenbuch

Ein ordnungsgemäßes Fahrtenbuch muss insbesondere

- zeitnah,
- fortlaufend,
- vollständig,
- in geschlossener Form und
- manipulationssicher

geführt werden.

Für betriebliche Fahrten sind regelmäßig aufzuzeichnen:

- Datum,
- Kilometerstand zu Beginn und Ende,
- Reiseziel,
- Reisezweck,
- aufgesuchte Geschäftspartner,
- gegebenenfalls Umwege.

---

⇨ 24. Vergleich der Methoden

► 1-%-Regelung

Vorteile:

- einfache Berechnung,
- kein detailliertes Fahrtenbuch.

Nachteile:

- tatsächliche Privatnutzung unerheblich,
- bei hohem Listenpreis möglicherweise hoher Ansatz,
- auch bei günstig erworbenen Gebrauchtwagen gilt grundsätzlich der ursprüngliche Listenpreis.

► Fahrtenbuchmethode

Vorteile:

- tatsächliche Nutzung wird berücksichtigt,
- kann bei geringer Privatnutzung günstiger sein.

Nachteile:

- hohe formelle Anforderungen,
- vollständige Dokumentation notwendig,
- Fehler können zur Verwerfung des gesamten Fahrtenbuchs führen.

---

⇨ 25. Umsatzsteuerliche Privatnutzung

Die private Verwendung eines dem Unternehmen zugeordneten Pkw kann umsatzsteuerlich eine unentgeltliche Wertabgabe darstellen.

Rechtsgrundlage:

§ 3 Abs. 9a UStG.

Die einkommensteuerliche Bewertung nach der 1-%-Regelung darf nicht ungeprüft mit der umsatzsteuerlichen Bemessungsgrundlage gleichgesetzt werden.

Einkommensteuer und Umsatzsteuer sind getrennt zu beurteilen.

---

⇨ 26. Elektrofahrzeuge und extern aufladbare Hybridfahrzeuge

Für bestimmte Elektrofahrzeuge und extern aufladbare Hybridelektrofahrzeuge gelten Vergünstigungen bei der Bewertung der privaten Nutzung.

Je nach Fahrzeug, Anschaffungszeitpunkt und gesetzlichen Voraussetzungen wird angesetzt:

- ein Viertel des Bruttolistenpreises oder
- die Hälfte des Bruttolistenpreises.

Bei der Fahrtenbuchmethode werden entsprechend bestimmte Fahrzeugkosten, insbesondere Abschreibung oder Leasingaufwand, nur anteilig berücksichtigt.

---

⇨ 27. Reine Elektrofahrzeuge – Viertelansatz

► Grundprinzip

Bei begünstigten reinen Elektrofahrzeugen wird für die pauschale Bewertung nur ein Viertel des Bruttolistenpreises angesetzt.

Aus der üblichen 1-%-Regelung wird wirtschaftlich eine sogenannte 0,25-%-Regelung.

► Berechnung

Bruttolistenpreis

× 1/4

anschließend Abrundung auf volle 100 €

× 1 % monatlich.

Alternativ kann zunächst entsprechend der gesetzlichen Berechnungsreihenfolge der maßgebliche Viertelwert ermittelt und abgerundet werden.

► Beispiel

Bruttolistenpreis:

80.000 €.

Viertelansatz:

20.000 €.

Monatlicher Privatanteil:

20.000 € × 1 %

= 200 €.

Wirtschaftlich entspricht dies:

0,25 % von 80.000 €.

---

⇨ 28. Aktuelle Preisgrenze bei reinen Elektrofahrzeugen

Für nach dem 30. Juni 2025 angeschaffte reine Elektrofahrzeuge ist der Viertelansatz grundsätzlich möglich, wenn der Bruttolistenpreis die gesetzliche Grenze von 100.000 € nicht übersteigt.

Bei älteren Anschaffungs- oder Überlassungszeiträumen galten andere Grenzen, insbesondere:

- 60.000 €,
- später 70.000 €,
- für nach dem 30. Juni 2025 angeschaffte Fahrzeuge 100.000 €.

Der konkrete Anschaffungs- oder Überlassungszeitpunkt ist deshalb zwingend festzustellen.

► Merksatz

Bei Elektrofahrzeugen niemals nur den Fahrzeugtyp prüfen.

Immer zusätzlich prüfen:

1. Anschaffungs- oder Überlassungsdatum,
2. Bruttolistenpreis,
3. reinelektrischer Antrieb oder Hybrid,
4. Pauschalmethode oder Fahrtenbuchmethode.

---

⇨ 29. Hälftiger Ansatz

Sind die Voraussetzungen des Viertelansatzes nicht erfüllt, kann bei begünstigten Elektro- oder extern aufladbaren Hybridfahrzeugen ein hälftiger Ansatz in Betracht kommen.

► Pauschalmethode

Es wird grundsätzlich die Hälfte des Bruttolistenpreises angesetzt.

Wirtschaftlich ergibt sich eine sogenannte 0,5-%-Regelung.

► Fahrtenbuchmethode

Bei der Ermittlung der Gesamtkosten werden insbesondere

- Abschreibung oder
- Leasingkosten

nur mit dem gesetzlich vorgesehenen Anteil berücksichtigt.

---

⇨ 30. Extern aufladbare Hybridfahrzeuge

Bei extern aufladbaren Hybridelektrofahrzeugen ist zu prüfen, ob die gesetzlichen Umweltvoraussetzungen erfüllt sind.

Maßgeblich können insbesondere sein:

- maximaler Kohlendioxidausstoß oder
- elektrische Mindestreichweite.

Die technischen Werte sind grundsätzlich anhand geeigneter Fahrzeugunterlagen, insbesondere der Übereinstimmungsbescheinigung, festzustellen.

Die Voraussetzungen und Reichweitengrenzen hängen vom Anschaffungs- oder Überlassungszeitpunkt ab.

---

⇨ 31. Elektrofahrzeug und Fahrten Wohnung–Betriebsstätte

Der reduzierte Bruttolistenpreis gilt grundsätzlich auch für die Berechnung des Zuschlags für Fahrten zwischen Wohnung und Betriebsstätte.

Beispiel:

Bruttolistenpreis:

80.000 €.

Begünstigter Viertelwert:

20.000 €.

Entfernung:

20 km.

Monatlicher Wert:

20.000 € × 0,03 % × 20

= 120 €.

---

⇨ 32. Prüfungsschema private Pkw-Nutzung

1. Wem ist das Fahrzeug steuerlich zuzurechnen?
2. Einzelunternehmen, Mitunternehmerschaft oder Kapitalgesellschaft?
3. Gehört das Fahrzeug zum Betriebsvermögen?
4. Wie hoch ist die betriebliche Nutzung?
5. Betriebliche Nutzung über 50 %?
6. Ordnungsgemäßes Fahrtenbuch vorhanden?
7. 1-%-Regelung oder Fahrtenbuchmethode?
8. Bruttolistenpreis bei Erstzulassung feststellen.
9. Sonderausstattung einbeziehen.
10. Auf volle 100 € abrunden.
11. Elektro- oder Hybridbegünstigung prüfen.
12. Privatnutzung berechnen.
13. Fahrten Wohnung–Betriebsstätte gesondert prüfen.
14. Kostendeckelung prüfen.
15. Umsatzsteuerliche Privatnutzung gesondert beurteilen.

---

⇨ 33. Wirtschaftsjahr als Ermittlungszeitraum

Das Wirtschaftsjahr ist der Zeitraum, für den der Gewinn bei bestimmten Gewinneinkünften ermittelt wird.

Es betrifft insbesondere:

- Land- und Forstwirtschaft,
- Gewerbebetrieb.

Bei den übrigen Einkunftsarten ist grundsätzlich das Kalenderjahr maßgeblich.

---

⇨ 34. Kalenderjahr und Wirtschaftsjahr

► Land- und Forstwirtschaft

Für Land- und Forstwirte gelten besondere Wirtschaftsjahresregelungen.

Das Wirtschaftsjahr kann vom Kalenderjahr abweichen.

► Gewerbebetrieb

Bei Gewerbetreibenden ist zu unterscheiden zwischen:

- im Handelsregister eingetragenen Gewerbetreibenden,
- nicht im Handelsregister eingetragenen Gewerbetreibenden.

► Übrige Einkunftsarten

Bei den übrigen Einkunftsarten erfolgt die Einkünfteermittlung grundsätzlich für das Kalenderjahr.

---

⇨ 35. Dauer des Wirtschaftsjahres

► Grundsatz

Ein Wirtschaftsjahr umfasst grundsätzlich zwölf Monate.

Ein längerer Zeitraum als zwölf Monate ist grundsätzlich nicht zulässig.

► Rumpfwirtschaftsjahr

Ein kürzerer Zeitraum wird als Rumpfwirtschaftsjahr bezeichnet.

Ein Rumpfwirtschaftsjahr kann insbesondere entstehen bei:

1. Betriebseröffnung,
2. Betriebserwerb,
3. Betriebsaufgabe,
4. Betriebsveräußerung,
5. Umstellung des Wirtschaftsjahres.

---

⇨ 36. Nicht im Handelsregister eingetragene Gewerbetreibende

Bei Gewerbetreibenden, deren Firma nicht im Handelsregister eingetragen ist, entspricht das Wirtschaftsjahr grundsätzlich dem Kalenderjahr.

Rechtsgrundlage:

§ 4a Abs. 1 Nr. 3 EStG.

Der Gewinnermittlungszeitraum läuft damit regelmäßig vom

1. Januar bis 31. Dezember.

---

⇨ 37. Im Handelsregister eingetragene Gewerbetreibende

Bei im Handelsregister eingetragenen Gewerbetreibenden kann das Wirtschaftsjahr grundsätzlich dem Kalenderjahr entsprechen oder davon abweichen.

Rechtsgrundlage:

§ 4a Abs. 1 Nr. 2 EStG.

Ein abweichendes Wirtschaftsjahr kann beispielsweise enden am:

- 30. Juni,
- 30. September,
- 31. März.

Die steuerlichen Voraussetzungen für Wahl oder Umstellung sind gesondert zu prüfen.

---

⇨ 38. Gewinnbezug bei Gewerbebetrieb

Bei Gewerbebetrieben ist der Gewinn eines abweichenden Wirtschaftsjahres grundsätzlich in dem Kalenderjahr zu erfassen, in dem das Wirtschaftsjahr endet.

Beispiel:

Wirtschaftsjahr:

1. Juli 2025 bis 30. Juni 2026.

Der Gewinn wird grundsätzlich im Veranlagungszeitraum 2026 berücksichtigt.

Rechtsgrundlage:

§ 4a Abs. 2 Nr. 2 EStG.

---

⇨ 39. Gewinnbezug bei Land- und Forstwirtschaft

Bei Land- und Forstwirten mit abweichendem Wirtschaftsjahr wird der laufende Gewinn grundsätzlich zeitanteilig auf die betroffenen Kalenderjahre aufgeteilt.

Ein Veräußerungsgewinn wird dagegen grundsätzlich dem Kalenderjahr der Veräußerung zugeordnet.

► Beispiel

Wirtschaftsjahr:

1. Juli 2025 bis 30. Juni 2026.

Der laufende Gewinn betrifft anteilig:

- sechs Monate des Kalenderjahres 2025,
- sechs Monate des Kalenderjahres 2026.

Der laufende Gewinn wird entsprechend aufgeteilt.

---

⇨ 40. Veräußerungsgewinn bei Land- und Forstwirtschaft

Ein Gewinn aus der Veräußerung oder Aufgabe des land- und forstwirtschaftlichen Betriebs wird nicht zeitanteilig aufgeteilt.

Er ist grundsätzlich in dem Kalenderjahr zu berücksichtigen, in dem die Veräußerung oder Aufgabe stattfindet.

---

⇨ 41. Umstellung des Wirtschaftsjahres

Die Umstellung eines Wirtschaftsjahres kann steuerlich nicht beliebig vorgenommen werden.

Zu prüfen sind insbesondere:

- handelsrechtliche Voraussetzungen,
- einkommensteuerliche Voraussetzungen,
- Zustimmungserfordernisse,
- Entstehung eines Rumpfwirtschaftsjahres,
- zeitliche Zuordnung des Gewinns.

► Typische Folge

Durch die Umstellung entsteht regelmäßig ein verkürztes Wirtschaftsjahr, das die Lücke zwischen altem und neuem Bilanzstichtag schließt.

---

⇨ 42. Prüfungsschema Wirtschaftsjahr

1. Welche Einkunftsart liegt vor?
2. Gewinneinkünfte oder Überschusseinkünfte?
3. Land- und Forstwirtschaft oder Gewerbebetrieb?
4. Handelsregistereintragung vorhanden?
5. Kalenderjahr oder abweichendes Wirtschaftsjahr?
6. Beginn und Ende des Wirtschaftsjahres bestimmen.
7. Liegt ein Rumpfwirtschaftsjahr vor?
8. Welchem Kalenderjahr ist der Gewinn zuzurechnen?
9. Bei Land- und Forstwirtschaft:
   - laufender Gewinn oder Veräußerungsgewinn?
10. Gegebenenfalls Genehmigung der Umstellung prüfen.

---

⇨ 43. Typische Klausurfallen

► Fehler 1: Gewinn und Überschuss gleich behandeln

Bei Gewinneinkünften werden Betriebseinnahmen und Betriebsausgaben berücksichtigt.

Bei Überschusseinkünften werden Einnahmen und Werbungskosten berücksichtigt.

---

► Fehler 2: Jede betriebliche Ausgabe vollständig abziehen

Auch betrieblich veranlasste Aufwendungen können unter ein gesetzliches Abzugsverbot fallen.

---

► Fehler 3: Gewerbesteuer als abzugsfähig behandeln

Die Gewerbesteuer ist nach § 4 Abs. 5b EStG nicht gewinnmindernd abziehbar.

---

► Fehler 4: Geschenkgrenze als Freibetrag behandeln

Die 50-€-Grenze ist eine Freigrenze.

Wird sie überschritten, ist das gesamte Geschenkvolumen an diesen Empfänger nicht abziehbar.

---

► Fehler 5: Geschenke einzeln statt pro Empfänger addieren

Entscheidend sind die gesamten Zuwendungen an einen Empfänger im Wirtschaftsjahr.

---

► Fehler 6: Aufzeichnungspflichten vergessen

Ein Geschenk kann trotz Einhaltung der Wertgrenze nicht abziehbar sein, wenn es nicht ordnungsgemäß getrennt aufgezeichnet wurde.

---

► Fehler 7: Kaufpreis statt Bruttolistenpreis verwenden

Für die 1-%-Regelung ist grundsätzlich der Bruttolistenpreis bei Erstzulassung maßgeblich.

---

► Fehler 8: Sonderausstattung vergessen

Werkseitige Sonderausstattung gehört grundsätzlich zum Bruttolistenpreis.

---

► Fehler 9: Bruttolistenpreis aufrunden

Der Listenpreis wird auf volle 100 € nach unten abgerundet.

---

► Fehler 10: 1-%-Regelung bei geringer betrieblicher Nutzung anwenden

Die pauschale Methode setzt grundsätzlich eine betriebliche Nutzung von mehr als 50 % voraus.

---

► Fehler 11: Fahrten zur Betriebsstätte als Privatfahrten behandeln

Sie sind gesondert nach § 4 Abs. 5 Satz 1 Nr. 6 EStG zu berücksichtigen.

---

► Fehler 12: Elektrofahrzeug automatisch mit 0,25 % bewerten

Der Viertelansatz hängt insbesondere von

- Fahrzeugart,
- Anschaffungs- oder Überlassungszeitpunkt und
- Bruttolistenpreis

ab.

---

► Fehler 13: Veraltete Elektrofahrzeuggrenzen verwenden

Die maßgebliche Preisgrenze hat sich mehrfach geändert.

Für nach dem 30. Juni 2025 angeschaffte reine Elektrofahrzeuge ist insbesondere die Grenze von 100.000 € zu prüfen.

---

► Fehler 14: Jedes Wirtschaftsjahr dem Kalenderjahr gleichsetzen

Bei bestimmten Gewerbetreibenden und Land- und Forstwirten kann ein abweichendes Wirtschaftsjahr vorliegen.

---

► Fehler 15: Gewinn eines Gewerbebetriebs zeitanteilig aufteilen

Der Gewinn eines abweichenden Wirtschaftsjahres eines Gewerbebetriebs wird grundsätzlich vollständig in dem Kalenderjahr erfasst, in dem das Wirtschaftsjahr endet.

---

► Fehler 16: Veräußerungsgewinn eines Landwirts zeitanteilig aufteilen

Der Veräußerungsgewinn ist grundsätzlich im Kalenderjahr der Veräußerung anzusetzen.

---

⇨ 44. Gesamtprüfungsschema

► Einkünfteermittlung

1. Einkunftsart bestimmen.
2. Gewinneinkünfte oder Überschusseinkünfte?
3. Gewinnermittlungsart bestimmen.
4. Ermittlungszeitraum feststellen.
5. Einnahmen und Ausgaben erfassen.
6. Abzugsverbote prüfen.
7. Private Nutzungen und Entnahmen korrigieren.
8. Steuerlichen Gewinn oder Überschuss ermitteln.

► Betriebsausgaben

1. Betriebliche Veranlassung?
2. Private Mitveranlassung?
3. Abzugsverbot nach § 4 Abs. 5 EStG?
4. Besondere Aufzeichnungspflicht?
5. Umsatzsteuerliche Folge?
6. Richtige zeitliche Zuordnung?

► Betrieblicher Pkw

1. Betriebsvermögen?
2. Betriebliche Nutzung über 50 %?
3. Fahrtenbuch vorhanden?
4. Listenpreismethode oder Fahrtenbuch?
5. Elektrofahrzeugbegünstigung?
6. Privatnutzung?
7. Wohnung–Betriebsstätte?
8. Kostendeckelung?
9. Umsatzsteuerliche Wertabgabe?

---

⇨ 45. Merksätze

- Einkünfte werden für jede Einkunftsart getrennt ermittelt.
- Gewinneinkünfte ergeben sich als Gewinn.
- Überschusseinkünfte ergeben sich aus Einnahmen minus Werbungskosten.
- Betriebsausgaben sind betrieblich veranlasste Aufwendungen.
- Betriebliche Veranlassung bedeutet nicht automatisch steuerliche Abziehbarkeit.
- Die Gewerbesteuer darf den Gewinn nicht mindern.
- Die Geschenkgrenze beträgt 50 € je Empfänger und Wirtschaftsjahr.
- Die Geschenkgrenze ist eine Freigrenze.
- Geschenke müssen besonders und getrennt aufgezeichnet werden.
- Die 1-%-Regelung setzt grundsätzlich mehr als 50 % betriebliche Nutzung voraus.
- Maßgeblich ist der Bruttolistenpreis bei Erstzulassung einschließlich Sonderausstattung.
- Der Bruttolistenpreis wird auf volle 100 € abgerundet.
- Fahrten zwischen Wohnung und Betriebsstätte werden zusätzlich berücksichtigt.
- Ein ordnungsgemäßes Fahrtenbuch muss zeitnah, vollständig und manipulationssicher sein.
- Elektrofahrzeugbegünstigungen hängen vom Anschaffungsdatum und Bruttolistenpreis ab.
- Für nach dem 30. Juni 2025 angeschaffte reine Elektrofahrzeuge kann der Viertelansatz bis zu einem Bruttolistenpreis von 100.000 € greifen.
- Ein Wirtschaftsjahr umfasst grundsätzlich zwölf Monate.
- Ein kürzerer Zeitraum ist ein Rumpfwirtschaftsjahr.
- Der Gewinn eines gewerblichen abweichenden Wirtschaftsjahres gehört grundsätzlich in das Kalenderjahr, in dem das Wirtschaftsjahr endet.
`
},
{
  id: "umsatzsteuer-steuerbefreiungen-ausfuhrlieferung-reihengeschaeft-grundstueck",

  title:
    "Steuerbefreiungen: Ausfuhrlieferungen, Reihengeschäfte und Grundstücksumsätze",

  short:
    "Systematik der Umsatzsteuerbefreiungen, Ausfuhrlieferungen nach §§ 4 Nr. 1 Buchst. a, 6 UStG, Zuordnung der Beförderung im Reihengeschäft und Grundstücksumsätze nach § 4 Nr. 9 Buchst. a UStG.",

  category: "Umsatzsteuer",

  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Steuerbefreiungen und Ausfuhrlieferungen",

  keywords:
    "steuerbefreiung|§ 4 ustg|ausfuhrlieferung|§ 4 nr. 1 a ustg|§ 6 ustg|drittland|reihengeschäft|bewegte lieferung|ruhende lieferung|beförderung|versendung|ausländischer abnehmer|ausfuhrnachweis|buchnachweis|§ 6 abs. 4 ustg|§ 3 abs. 6a ustg|grundstück|grunderwerbsteuer|§ 4 nr. 9 a ustg|option|§ 9 ustg|vorsteuerabzug|§ 15 ustg",

  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 6a UStG",
    "§ 3 Abs. 7 UStG",
    "§ 4 Nr. 1 Buchst. a UStG",
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 4 Nr. 12 Buchst. a UStG",
    "§ 6 Abs. 1 Nr. 1 UStG",
    "§ 6 Abs. 1 Nr. 2 UStG",
    "§ 6 Abs. 2 Nr. 1 UStG",
    "§ 6 Abs. 4 UStG",
    "§ 9 UStG",
    "§ 15 Abs. 2 UStG",
    "§ 15 Abs. 3 UStG",
    "§ 2 GrEStG",
    "UStDV – Nachweisvorschriften für Ausfuhrlieferungen",
    "UStAE zu §§ 3, 4 und 6 UStG"
  ],

  body: `
⇨ Steuerbefreiungen im Umsatzsteuerrecht

► 1. Ausgangspunkt

Eine Steuerbefreiung wird erst geprüft, wenn zuvor ein steuerbarer Umsatz festgestellt wurde.

Grundschema:

1. Lieferung oder sonstige Leistung?
2. Leistung durch einen Unternehmer?
3. Im Rahmen seines Unternehmens?
4. Gegen Entgelt?
5. Ort der Leistung im Inland?
6. Steuerbefreiung?
7. Steuersatz?
8. Steuerschuldner?
9. Entstehung der Steuer?
10. Vorsteuerabzug?

Merksatz:

**Nur ein steuerbarer Umsatz kann steuerfrei oder steuerpflichtig sein.**

---

⇨ 2. Einteilung der Steuerbefreiungen

Steuerbefreiungen lassen sich insbesondere danach unterscheiden, ob der Vorsteuerabzug erhalten bleibt.

► Steuerbefreiungen mit Vorsteuerabzug

Bei bestimmten steuerfreien Umsätzen bleibt der Vorsteuerabzug erhalten.

Wichtige Beispiele:

- Ausfuhrlieferungen,
- innergemeinschaftliche Lieferungen,
- bestimmte grenzüberschreitende Leistungen.

Die Steuerbefreiung des Ausgangsumsatzes führt hier nicht zum Vorsteuerausschluss.

► Steuerbefreiungen ohne Vorsteuerabzug

Bei zahlreichen Steuerbefreiungen führt § 15 Abs. 2 UStG zum Ausschluss des Vorsteuerabzugs.

Typische Beispiele:

- bestimmte Grundstücksumsätze,
- Vermietung und Verpachtung,
- Heilbehandlungen,
- Versicherungs- und Finanzumsätze.

► Rückausnahme nach § 15 Abs. 3 UStG

Bei bestimmten steuerfreien Umsätzen bleibt der Vorsteuerabzug ausnahmsweise erhalten.

Deshalb muss nach Feststellung einer Steuerbefreiung immer zusätzlich geprüft werden:

- Vorsteuerausschluss nach § 15 Abs. 2 UStG?
- Rückausnahme nach § 15 Abs. 3 UStG?

---

⇨ 3. Option zur Steuerpflicht nach § 9 UStG

Bei bestimmten Steuerbefreiungen kann der Unternehmer auf die Steuerbefreiung verzichten.

Typische Anwendungsfälle:

- Grundstücksumsätze,
- Vermietungsumsätze.

Voraussetzungen sind unter anderem:

- der Leistungsempfänger ist Unternehmer,
- der Umsatz wird für dessen Unternehmen ausgeführt,
- die besonderen Einschränkungen des § 9 Abs. 2 UStG werden beachtet.

Rechtsfolge:

Wird wirksam zur Steuerpflicht optiert, ist der Ausgangsumsatz steuerpflichtig.

Damit kann grundsätzlich auch der Vorsteuerabzug eröffnet werden.

Merksatz:

**Option zur Steuerpflicht kann Vorsteuer retten.**

---

⇨ 4. Ausfuhrlieferungen

► Rechtsgrundlage

Ausfuhrlieferungen sind nach

§ 4 Nr. 1 Buchst. a UStG in Verbindung mit § 6 UStG

steuerfrei.

Die Prüfung erfolgt in zwei Stufen:

1. steuerbare Lieferung nach § 1 Abs. 1 Nr. 1 UStG,
2. Ausfuhrlieferung nach § 6 UStG.

---

⇨ 5. Allgemeine Voraussetzungen einer Ausfuhrlieferung

Eine Ausfuhrlieferung setzt grundsätzlich voraus:

- eine Lieferung,
- einen Gegenstand,
- eine Beförderung oder Versendung,
- eine tatsächliche Warenbewegung aus dem Inland in das Drittlandsgebiet,
- die Erfüllung der Voraussetzungen des § 6 UStG,
- einen ordnungsgemäßen Ausfuhrnachweis.

► Drittlandsgebiet

Drittlandsgebiet ist das Gebiet, das nicht zum umsatzsteuerrechtlichen Gemeinschaftsgebiet gehört.

Beispiele:

- Türkei,
- Schweiz,
- USA,
- Vereinigtes Königreich, soweit keine Sonderregelung eingreift.

► Bewegte Lieferung

Die Steuerbefreiung kann grundsätzlich nur die Lieferung erfassen, der die Beförderung oder Versendung zugeordnet wird.

Eine unbewegte bzw. ruhende Lieferung ist nicht als Ausfuhrlieferung steuerfrei.

---

⇨ 6. Ausfuhrlieferung nach § 6 Abs. 1 Nr. 1 UStG

► Grundfall

§ 6 Abs. 1 Nr. 1 UStG betrifft insbesondere den Fall, dass der liefernde Unternehmer den Gegenstand selbst in das Drittlandsgebiet befördert oder versendet.

Voraussetzungen:

1. steuerbare Lieferung,
2. Lieferer befördert oder versendet,
3. Gegenstand gelangt tatsächlich in das Drittlandsgebiet,
4. Ausfuhrnachweis liegt vor.

► Sitz des Abnehmers

Bei § 6 Abs. 1 Nr. 1 UStG ist es grundsätzlich nicht erforderlich, dass der Abnehmer seinen Sitz im Ausland hat.

Entscheidend ist vor allem:

Der Liefergegenstand gelangt tatsächlich in das Drittlandsgebiet.

► Prüfungssatz

Der Unternehmer befördert oder versendet den Liefergegenstand im Rahmen einer bewegten Lieferung in das Drittlandsgebiet. Damit liegt bei ordnungsgemäßem Nachweis eine steuerfreie Ausfuhrlieferung nach § 4 Nr. 1 Buchst. a UStG in Verbindung mit § 6 Abs. 1 Nr. 1 UStG vor.

---

⇨ 7. Ausfuhrlieferung nach § 6 Abs. 1 Nr. 2 UStG

► Grundfall

§ 6 Abs. 1 Nr. 2 UStG betrifft insbesondere den Fall, dass der Abnehmer den Gegenstand in das Drittlandsgebiet befördert oder versendet.

Voraussetzungen:

1. steuerbare Lieferung,
2. Abnehmer befördert oder versendet,
3. Gegenstand gelangt tatsächlich in das Drittlandsgebiet,
4. Abnehmer ist ausländischer Abnehmer,
5. Ausfuhrnachweis liegt vor.

► Ausländischer Abnehmer

Der Abnehmer muss die Voraussetzungen des § 6 Abs. 2 UStG erfüllen.

Typischerweise handelt es sich um einen Abnehmer mit Sitz oder Wohnsitz im Ausland.

► Prüfungssatz

Der Abnehmer befördert oder versendet den Liefergegenstand in das Drittlandsgebiet und ist ausländischer Abnehmer im Sinne des § 6 Abs. 2 UStG. Bei ordnungsgemäßem Nachweis ist die Lieferung nach § 4 Nr. 1 Buchst. a UStG in Verbindung mit § 6 Abs. 1 Nr. 2 UStG steuerfrei.

---

⇨ 8. Unterschied zwischen § 6 Abs. 1 Nr. 1 und Nr. 2 UStG

► § 6 Abs. 1 Nr. 1 UStG

Der Lieferer befördert oder versendet.

Ein ausländischer Abnehmer ist grundsätzlich nicht erforderlich.

► § 6 Abs. 1 Nr. 2 UStG

Der Abnehmer befördert oder versendet.

Der Abnehmer muss grundsätzlich ausländischer Abnehmer sein.

► Merksatz

- Lieferer transportiert → Nr. 1
- Abnehmer transportiert → Nr. 2
- Bei Nr. 2 zusätzlich ausländischen Abnehmer prüfen

---

⇨ 9. Nachweis der Ausfuhr

Die Steuerbefreiung setzt einen ordnungsgemäßen Nachweis voraus.

Der Unternehmer muss nachweisen können:

- welcher Gegenstand geliefert wurde,
- wer Lieferer und Abnehmer waren,
- wohin der Gegenstand gelangt ist,
- dass der Gegenstand das Gemeinschaftsgebiet tatsächlich verlassen hat,
- welcher Lieferung die Warenbewegung zuzuordnen ist.

Typische Nachweise:

- Ausgangsvermerk der Zollverwaltung,
- Beförderungs- oder Versendungsbelege,
- Frachtbrief,
- Spediteursbescheinigung,
- Buchnachweis,
- Rechnungsunterlagen,
- Auftrags- und Versanddokumentation.

Merksatz:

**Ohne Ausfuhrnachweis keine Steuerbefreiung.**

---

⇨ 10. Ausfuhrlieferung im Reihengeschäft

► Begriff des Reihengeschäfts

Ein Reihengeschäft liegt vor, wenn

- mehrere Unternehmer über denselben Gegenstand Umsatzgeschäfte abschließen und
- der Gegenstand unmittelbar vom ersten Unternehmer an den letzten Abnehmer gelangt.

Beispiel:

Unternehmer A in Dortmund

verkauft an

Unternehmer B in Nordkirchen.

Unternehmer B verkauft weiter an

Abnehmer C in Istanbul.

Der Gegenstand wird unmittelbar von A nach C transportiert.

Obwohl nur eine Warenbewegung stattfindet, liegen zwei Lieferungen vor:

1. A an B
2. B an C

---

⇨ 11. Nur eine bewegte Lieferung

In einem Reihengeschäft gibt es nur eine Warenbewegung.

Daher kann auch nur eine Lieferung die bewegte Lieferung sein.

Nur diese Lieferung kommt als steuerfreie Ausfuhrlieferung in Betracht.

Die andere Lieferung ist eine ruhende Lieferung.

Merksatz:

**Eine Warenbewegung = eine bewegte Lieferung = höchstens eine Ausfuhrlieferung.**

---

⇨ 12. Zuordnung der Beförderung oder Versendung

Die entscheidende Frage lautet:

**Wer übernimmt die Beförderung oder Versendung?**

► Beförderung durch den ersten Unternehmer

Befördert oder versendet A den Gegenstand, wird die Warenbewegung regelmäßig der Lieferung A an B zugeordnet.

Dann kann die Lieferung A an B die steuerfreie Ausfuhrlieferung sein.

Die Lieferung B an C ist anschließend als ruhende Lieferung gesondert zu beurteilen.

► Beförderung durch den letzten Abnehmer

Befördert oder versendet C den Gegenstand, wird die Warenbewegung regelmäßig der Lieferung B an C zugeordnet.

Dann kann die Lieferung B an C die steuerfreie Ausfuhrlieferung sein.

Die Lieferung A an B ist eine ruhende Lieferung.

► Beförderung durch den Zwischenhändler

Befördert oder versendet B den Gegenstand, muss § 3 Abs. 6a UStG besonders sorgfältig geprüft werden.

Grundsätzlich wird die Beförderung der Lieferung an den Zwischenhändler zugeordnet.

Unter den gesetzlichen Voraussetzungen kann eine abweichende Zuordnung zur Lieferung des Zwischenhändlers erfolgen.

Entscheidend können sein:

- Auftreten des Zwischenhändlers,
- verwendete Umsatzsteuer-Identifikationsnummer,
- Beginn der Beförderung oder Versendung,
- eindeutige Zuordnung der Transportverantwortung.

---

⇨ 13. Drittlandsfall und Umsatzsteuer-Identifikationsnummer

Auch in einem Reihengeschäft mit Drittlandsbezug ist die Zuordnung der bewegten Lieferung genau zu prüfen.

Verwendet der Zwischenhändler gegenüber seinem Lieferer bis zum Beginn der Beförderung oder Versendung eine ihm vom Abgangsstaat erteilte Umsatzsteuer-Identifikationsnummer, kann dies für die Zuordnung nach § 3 Abs. 6a UStG bedeutsam sein.

Klausurhinweis:

§ 3 Abs. 6a UStG im Reihengeschäft immer ausdrücklich prüfen und zitieren.

---

⇨ 14. Prüfungsschema Ausfuhrlieferung im Reihengeschäft

► Schritt 1: Reihengeschäft feststellen

- mehrere Umsatzgeschäfte,
- derselbe Gegenstand,
- unmittelbare Beförderung vom ersten Lieferer zum letzten Abnehmer.

► Schritt 2: Lieferbeziehungen auflisten

Beispiel:

- Lieferung A an B
- Lieferung B an C

► Schritt 3: Warenbewegung bestimmen

Wer befördert oder versendet?

- A?
- B?
- C?

► Schritt 4: Bewegte Lieferung zuordnen

§ 3 Abs. 6a UStG prüfen.

► Schritt 5: Ort der bewegten Lieferung bestimmen

Ort ist grundsätzlich dort, wo die Beförderung oder Versendung beginnt.

► Schritt 6: Steuerbarkeit prüfen

§ 1 Abs. 1 Nr. 1 UStG.

► Schritt 7: Ausfuhrlieferung prüfen

- § 6 Abs. 1 Nr. 1 UStG oder
- § 6 Abs. 1 Nr. 2 UStG.

► Schritt 8: Ausfuhrnachweis prüfen

§ 6 Abs. 4 UStG und Nachweisvorschriften.

► Schritt 9: Ruhende Lieferung beurteilen

Ort nach § 3 Abs. 7 UStG bestimmen und Steuerpflicht gesondert prüfen.

---

⇨ 15. Beispiel: Reihengeschäft Deutschland – Türkei

A aus Dortmund verkauft eine Ware an B aus Nordkirchen.

B verkauft dieselbe Ware an C in Istanbul weiter.

Die Ware wird unmittelbar von Dortmund nach Istanbul transportiert.

► Variante 1: A transportiert

Die Warenbewegung wird regelmäßig der Lieferung A an B zugeordnet.

Diese Lieferung kann als Ausfuhrlieferung steuerfrei sein.

Die Lieferung B an C ist eine ruhende Lieferung.

► Variante 2: C transportiert

Die Warenbewegung wird regelmäßig der Lieferung B an C zugeordnet.

Diese Lieferung kann als Ausfuhrlieferung steuerfrei sein.

Die Lieferung A an B ist eine ruhende Lieferung.

► Variante 3: B transportiert

B ist Zwischenhändler.

Die Zuordnung richtet sich nach § 3 Abs. 6a UStG.

Es ist insbesondere zu prüfen, ob die Warenbewegung

- der Lieferung A an B oder
- der Lieferung B an C

zuzuordnen ist.

Nur die zugeordnete bewegte Lieferung kann als Ausfuhrlieferung steuerfrei sein.

---

⇨ 16. Grundstücksumsätze nach § 4 Nr. 9 Buchst. a UStG

► Grundsatz

Umsätze, die unter das Grunderwerbsteuergesetz fallen, sind nach

§ 4 Nr. 9 Buchst. a UStG

von der Umsatzsteuer befreit.

Der Zweck besteht insbesondere darin, eine Doppelbelastung durch

- Umsatzsteuer und
- Grunderwerbsteuer

zu vermeiden.

Es ist nicht entscheidend, ob im konkreten Fall tatsächlich Grunderwerbsteuer festgesetzt wird.

Maßgeblich ist, ob der Umsatz seinem Typ nach unter das Grunderwerbsteuergesetz fällt.

---

⇨ 17. Begünstigte Grundstücksumsätze

Begünstigt sind insbesondere Lieferungen von

- bebauten Grundstücken,
- unbebauten Grundstücken,
- grundstücksgleichen Rechten,
- bestimmten Miteigentumsanteilen.

Voraussetzung ist zunächst eine steuerbare Lieferung nach § 1 Abs. 1 Nr. 1 UStG.

Anschließend wird geprüft, ob der Umsatz unter das Grunderwerbsteuergesetz fällt.

Ergebnis:

Die Lieferung ist grundsätzlich nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

---

⇨ 18. Grundstücksbegriff und Betriebsvorrichtungen

Der Grundstücksbegriff richtet sich nach den einschlägigen gesetzlichen Vorschriften.

Nicht jede mit einem Grundstück verbundene Sache wird umsatzsteuerlich zwingend von der Grundstücksbefreiung erfasst.

Insbesondere Betriebsvorrichtungen können gesondert zu beurteilen sein.

Typische Klausurfrage:

Werden

- Grundstück und Gebäude sowie
- Betriebsvorrichtungen

gemeinsam veräußert, muss geprüft werden, ob mehrere selbständige Leistungen vorliegen.

Die Veräußerung einer Betriebsvorrichtung kann umsatzsteuerpflichtig sein, obwohl die Grundstückslieferung steuerfrei ist.

---

⇨ 19. Keine Steuerbefreiung für reine Bauleistungen

Die Errichtung eines Bauwerks auf einem fremden Grundstück ist grundsätzlich keine Grundstückslieferung, die unter das Grunderwerbsteuergesetz fällt.

Eine reine Bau- oder Werklieferung ist deshalb nicht bereits nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

Merksatz:

**Grundstück verkaufen ist etwas anderes als auf einem fremden Grundstück bauen.**

---

⇨ 20. Option bei Grundstücksumsätzen

Bei einem nach § 4 Nr. 9 Buchst. a UStG steuerfreien Grundstücksumsatz kann unter den Voraussetzungen des § 9 UStG zur Steuerpflicht optiert werden.

Voraussetzungen:

- Umsatz an einen Unternehmer,
- Erwerb für dessen Unternehmen,
- wirksame Ausübung der Option,
- Beachtung der formellen Anforderungen.

Die Option ist insbesondere relevant, wenn der Veräußerer Vorsteuerbelastungen vermeiden oder eine Vorsteuerberichtigung verhindern möchte.

Bei Veräußerung an Privatpersonen ist eine Option regelmäßig nicht möglich.

---

⇨ 21. Vorsteuerfolgen

► Steuerfreie Grundstückslieferung

Steht eine Eingangsleistung unmittelbar mit einer steuerfreien Grundstückslieferung in Zusammenhang, ist der Vorsteuerabzug grundsätzlich nach § 15 Abs. 2 UStG ausgeschlossen.

► Steuerfreie Ausfuhrlieferung

Bei einer steuerfreien Ausfuhrlieferung bleibt der Vorsteuerabzug grundsätzlich erhalten.

Darin liegt ein wesentlicher Unterschied:

- Ausfuhrlieferung: steuerfrei mit Vorsteuerabzug
- Grundstückslieferung: regelmäßig steuerfrei ohne Vorsteuerabzug

---

⇨ 22. Prüfungsübersicht

► Ausfuhrlieferung

1. Lieferung?
2. Ort im Inland?
3. Bewegte Lieferung?
4. Wer befördert oder versendet?
5. Drittlandsgebiet erreicht?
6. § 6 Abs. 1 Nr. 1 oder Nr. 2 UStG?
7. Ausländischer Abnehmer erforderlich?
8. Ausfuhrnachweis vorhanden?
9. Steuerbefreiung nach § 4 Nr. 1 Buchst. a UStG?
10. Vorsteuerabzug erhalten?

► Grundstückslieferung

1. Lieferung?
2. Grundstück oder grundstücksgleiches Recht?
3. Umsatz fällt unter das Grunderwerbsteuergesetz?
4. Steuerbefreiung nach § 4 Nr. 9 Buchst. a UStG?
5. Betriebsvorrichtungen gesondert prüfen?
6. Option nach § 9 UStG möglich?
7. Vorsteuerabzug oder Vorsteuerberichtigung prüfen?

---

⇨ 23. Typische Klausurfallen

► Fehler 1: Steuerbefreiung vor der Steuerbarkeit prüfen

Falsch:

Sofort mit § 4 UStG beginnen.

Richtig:

Zunächst prüfen, ob überhaupt ein steuerbarer Umsatz nach § 1 Abs. 1 Nr. 1 UStG vorliegt.

---

► Fehler 2: Jede Lieferung ins Ausland als Ausfuhrlieferung behandeln

Falsch:

Die Rechnung geht an einen ausländischen Kunden, also steuerfrei.

Richtig:

Der Gegenstand muss tatsächlich in das Drittlandsgebiet gelangen.

---

► Fehler 3: Ausländischen Abnehmer immer verlangen

Ein ausländischer Abnehmer ist nicht in jedem Ausfuhrfall zwingend erforderlich.

Er ist insbesondere bei § 6 Abs. 1 Nr. 2 UStG zu prüfen.

---

► Fehler 4: Im Reihengeschäft mehrere Ausfuhrlieferungen annehmen

Nur eine Lieferung kann die bewegte Lieferung sein.

Daher kann grundsätzlich auch nur eine Lieferung als Ausfuhrlieferung steuerfrei sein.

---

► Fehler 5: Ruhende Lieferung vergessen

Nach Zuordnung der Warenbewegung muss die andere Lieferung als ruhende Lieferung gesondert beurteilt werden.

---

► Fehler 6: Ausfuhrnachweis übersehen

Selbst wenn die Ware tatsächlich ausgeführt wurde, muss der Unternehmer die Voraussetzungen nachweisen.

---

► Fehler 7: Bauleistung und Grundstückslieferung verwechseln

Die Errichtung eines Gebäudes auf fremdem Grund ist nicht automatisch nach § 4 Nr. 9 Buchst. a UStG steuerfrei.

---

► Fehler 8: Betriebsvorrichtungen mit dem Grundstück gleichbehandeln

Betriebsvorrichtungen können einen eigenständig steuerpflichtigen Umsatz darstellen.

---

► Fehler 9: Vorsteuerfolge nicht prüfen

Nach jeder Steuerbefreiung muss geprüft werden:

- § 15 Abs. 2 UStG?
- § 15 Abs. 3 UStG?
- Option nach § 9 UStG?

---

⇨ 24. Merksätze

- Erst Steuerbarkeit, dann Steuerbefreiung.
- Ausfuhrlieferungen sind steuerfrei, der Vorsteuerabzug bleibt grundsätzlich erhalten.
- Nur bewegte Lieferungen können Ausfuhrlieferungen sein.
- Der Gegenstand muss tatsächlich in das Drittlandsgebiet gelangen.
- Transportiert der Lieferer, ist regelmäßig § 6 Abs. 1 Nr. 1 UStG zu prüfen.
- Transportiert der Abnehmer, ist regelmäßig § 6 Abs. 1 Nr. 2 UStG zu prüfen.
- Bei § 6 Abs. 1 Nr. 2 UStG ist der ausländische Abnehmer besonders wichtig.
- Ohne Ausfuhrnachweis keine Steuerbefreiung.
- Im Reihengeschäft existiert nur eine bewegte Lieferung.
- Wer die Beförderung übernimmt, entscheidet häufig über die Zuordnung.
- Grundstücksumsätze, die unter das Grunderwerbsteuergesetz fallen, sind grundsätzlich steuerfrei.
- Reine Bauleistungen sind keine steuerfreien Grundstückslieferungen.
- Betriebsvorrichtungen sind gesondert zu prüfen.
- Steuerfreie Grundstücksumsätze schließen den Vorsteuerabzug regelmäßig aus.
- Eine wirksame Option nach § 9 UStG kann den Vorsteuerabzug ermöglichen.
`
},
{
  id: "estg-002-umfang-besteuerung-begriffsbestimmungen",

  title: "§ 2 EStG – Umfang der Besteuerung und Begriffsbestimmungen",

  short:
    "Definiert die sieben Einkunftsarten, die Gewinn- und Überschusseinkünfte sowie die Berechnung vom Gesamtbetrag der Einkünfte bis zur festzusetzenden Einkommensteuer.",

  category: "Gesetze / Einkommensteuer",

  source:
    "Gesetze im Internet – Einkommensteuergesetz, § 2 EStG",

  keywords:
    "estg|§ 2 estg|§2|umfang der besteuerung|begriffsbestimmungen|sieben einkunftsarten|einkünfte|gewinn|überschuss|summe der einkünfte|gesamtbetrag der einkünfte|einkommen|zu versteuerndes einkommen|zvE|festzusetzende einkommensteuer|jahressteuer|land und forstwirtschaft|gewerbebetrieb|selbständige arbeit|nichtselbständige arbeit|kapitalvermögen|vermietung und verpachtung|sonstige einkünfte|sonderausgaben|außergewöhnliche belastungen|freibeträge|altersentlastungsbetrag|alleinerziehende|lebenspartner",

  references: [
    "§ 2 EStG",
    "§§ 4 bis 7k EStG",
    "§ 8 EStG",
    "§ 9 EStG",
    "§ 9a EStG",
    "§ 10 EStG",
    "§ 10a EStG",
    "§ 13 Abs. 3 EStG",
    "§§ 13 bis 24 EStG",
    "§ 20 Abs. 9 EStG",
    "§ 22 EStG",
    "§ 31 EStG",
    "§ 32 Abs. 6 EStG",
    "§ 32a EStG",
    "§ 32c EStG",
    "§ 32d EStG",
    "§ 34c EStG",
    "§ 43 Abs. 5 EStG",
    "§ 84 EStG"
  ],

  taxType: "einkommensteuer",

  law: "EStG",

  paragraph: "§ 2 EStG",

  paragraphNumber: 2,

  type: "gesetz",

  importance: 10,

  testPrompt:
    "Erläutere anhand des § 2 EStG den Aufbau der Einkommensteuer von den einzelnen Einkunftsarten bis zur festzusetzenden Einkommensteuer.",

  expect: {
    steuerart: "einkommensteuer",
    paragraphen: [
      "§ 2 EStG"
    ],
    mustNotAskFollowup: true
  },

  body: `
⇨ § 2 EStG – Umfang der Besteuerung und Begriffsbestimmungen

► Gesetz

§ 2 EStG ist die zentrale Grundnorm für den Aufbau der Einkommensteuer.

Die Vorschrift regelt insbesondere:

- welche Einkünfte der Einkommensteuer unterliegen,
- wie Einkünfte ermittelt werden,
- wie aus den Einkünften das zu versteuernde Einkommen entsteht,
- wie die festzusetzende Einkommensteuer ermittelt wird und
- dass die Einkommensteuer eine Jahressteuer ist.

§ 2 EStG bildet damit das Grundgerüst der Einkommensteuerberechnung.

---

⇨ 1. Die sieben Einkunftsarten

Nach § 2 Abs. 1 EStG unterliegen sieben Einkunftsarten der Einkommensteuer.

► Gewinneinkunftsarten

1. Einkünfte aus Land- und Forstwirtschaft,
2. Einkünfte aus Gewerbebetrieb,
3. Einkünfte aus selbständiger Arbeit.

► Überschusseinkunftsarten

4. Einkünfte aus nichtselbständiger Arbeit,
5. Einkünfte aus Kapitalvermögen,
6. Einkünfte aus Vermietung und Verpachtung,
7. sonstige Einkünfte im Sinne des § 22 EStG.

► Bedeutung

Nur Einkünfte, die einer der sieben Einkunftsarten zugeordnet werden können, unterliegen grundsätzlich der Einkommensteuer.

Reine Vermögensmehrungen außerhalb der gesetzlichen Einkunftsarten sind grundsätzlich nicht steuerbar, soweit keine besondere Vorschrift eingreift.

► Zuordnung

Die konkrete Zuordnung zu einer Einkunftsart richtet sich nach den §§ 13 bis 24 EStG.

---

⇨ 2. Einkünfte bei unbeschränkter und beschränkter Steuerpflicht

► Unbeschränkte Steuerpflicht

Bei unbeschränkter Einkommensteuerpflicht werden grundsätzlich sämtliche inländischen und ausländischen Einkünfte erfasst.

Dies entspricht dem sogenannten Welteinkommensprinzip.

► Beschränkte Steuerpflicht

Bei beschränkter Einkommensteuerpflicht werden grundsätzlich nur die inländischen Einkünfte erfasst.

Welche Einkünfte als inländische Einkünfte gelten, bestimmt sich insbesondere nach § 49 EStG.

---

⇨ 3. Gewinn- und Überschusseinkünfte

§ 2 Abs. 2 EStG unterscheidet zwei Arten der Einkünfteermittlung.

► Gewinneinkünfte

Bei

- Land- und Forstwirtschaft,
- Gewerbebetrieb und
- selbständiger Arbeit

sind die Einkünfte der Gewinn.

Der Gewinn wird insbesondere nach den §§ 4 bis 7k und § 13a EStG ermittelt.

► Grundformel

Gewinn:

Betriebseinnahmen  
minus Betriebsausgaben  
gleich Gewinn oder Verlust.

► Typische Gewinnermittlungsarten

- Betriebsvermögensvergleich,
- Einnahmenüberschussrechnung,
- Gewinnermittlung nach Durchschnittssätzen.

---

► Überschusseinkünfte

Bei den übrigen Einkunftsarten sind die Einkünfte grundsätzlich der Überschuss der Einnahmen über die Werbungskosten.

► Grundformel

Einnahmen  
minus Werbungskosten  
gleich Überschuss oder Verlust.

Dies betrifft insbesondere:

- Arbeitslohn,
- Vermietungseinnahmen,
- bestimmte sonstige Einkünfte.

---

⇨ 4. Besonderheit bei Einkünften aus Kapitalvermögen

Bei Einkünften aus Kapitalvermögen tritt grundsätzlich der Sparer-Pauschbetrag nach § 20 Abs. 9 EStG an die Stelle des tatsächlichen Werbungskostenabzugs.

Die allgemeinen Vorschriften der §§ 9 und 9a EStG sind insoweit grundsätzlich nicht anzuwenden.

Eine Ausnahme kann sich insbesondere aus § 32d Abs. 2 EStG ergeben.

► Merksatz

Bei Kapitaleinkünften gilt grundsätzlich:

Kein Abzug tatsächlicher Werbungskosten, sondern Sparer-Pauschbetrag.

---

⇨ 5. Berechnungsschema der Einkommensteuer

§ 2 Abs. 3 bis 6 EStG enthält die zentrale Berechnungskette der Einkommensteuer.

---

► Stufe 1: Einkünfte

Zunächst werden die Einkünfte aus jeder einzelnen Einkunftsart ermittelt.

Beispiel:

- Gewerbebetrieb: 60.000 €
- nichtselbständige Arbeit: 40.000 €
- Vermietung und Verpachtung: minus 5.000 €

---

► Stufe 2: Summe der Einkünfte

Die positiven und negativen Einkünfte werden zusammengerechnet.

Im Beispiel:

60.000 €  
plus 40.000 €  
minus 5.000 €  
gleich 95.000 € Summe der Einkünfte.

---

► Stufe 3: Gesamtbetrag der Einkünfte

Von der Summe der Einkünfte werden abgezogen:

- Altersentlastungsbetrag,
- Entlastungsbetrag für Alleinerziehende,
- Freibetrag nach § 13 Abs. 3 EStG.

► Formel

Summe der Einkünfte  
minus Altersentlastungsbetrag  
minus Entlastungsbetrag für Alleinerziehende  
minus Abzug nach § 13 Abs. 3 EStG  
gleich Gesamtbetrag der Einkünfte.

---

► Stufe 4: Einkommen

Vom Gesamtbetrag der Einkünfte werden insbesondere abgezogen:

- Sonderausgaben und
- außergewöhnliche Belastungen.

► Formel

Gesamtbetrag der Einkünfte  
minus Sonderausgaben  
minus außergewöhnliche Belastungen  
gleich Einkommen.

---

► Stufe 5: Zu versteuerndes Einkommen

Vom Einkommen werden insbesondere abgezogen:

- Freibeträge nach § 32 Abs. 6 EStG und
- sonstige vom Einkommen abzuziehende Beträge.

► Formel

Einkommen  
minus Kinderfreibetrag und Betreuungsfreibetrag  
minus sonstige Abzugsbeträge  
gleich zu versteuerndes Einkommen.

Das zu versteuernde Einkommen ist die Bemessungsgrundlage für die tarifliche Einkommensteuer.

---

► Stufe 6: Tarifliche Einkommensteuer

Auf das zu versteuernde Einkommen wird der Einkommensteuertarif angewendet.

Die tarifliche Einkommensteuer ergibt sich grundsätzlich nach § 32a EStG.

---

► Stufe 7: Festzusetzende Einkommensteuer

Die tarifliche Einkommensteuer wird anschließend korrigiert.

Zu berücksichtigen sind insbesondere:

- anzurechnende ausländische Steuern,
- Steuerermäßigungen,
- besondere Steuern nach § 32d EStG,
- Hinzurechnung von Kindergeld in den Fällen des § 31 EStG,
- Hinzurechnung bestimmter Zulagen nach § 10a EStG.

► Vereinfachte Formel

Tarifliche Einkommensteuer  
minus Steuerermäßigungen  
minus anrechenbare Steuern  
plus gesetzliche Hinzurechnungen  
gleich festzusetzende Einkommensteuer.

---

⇨ 6. Vollständiges Berechnungsschema

► Einkommensteuerliche Ermittlung

1. Einkünfte aus Land- und Forstwirtschaft
2. plus Einkünfte aus Gewerbebetrieb
3. plus Einkünfte aus selbständiger Arbeit
4. plus Einkünfte aus nichtselbständiger Arbeit
5. plus Einkünfte aus Kapitalvermögen
6. plus Einkünfte aus Vermietung und Verpachtung
7. plus sonstige Einkünfte

gleich Summe der Einkünfte

minus Altersentlastungsbetrag  
minus Entlastungsbetrag für Alleinerziehende  
minus Abzug nach § 13 Abs. 3 EStG

gleich Gesamtbetrag der Einkünfte

minus Sonderausgaben  
minus außergewöhnliche Belastungen

gleich Einkommen

minus Freibeträge nach § 32 Abs. 6 EStG  
minus sonstige Abzugsbeträge

gleich zu versteuerndes Einkommen

Anwendung des Einkommensteuertarifs

gleich tarifliche Einkommensteuer

minus Steuerermäßigungen und Anrechnungsbeträge  
plus gesetzliche Hinzurechnungen

gleich festzusetzende Einkommensteuer.

---

⇨ 7. Zahlenbeispiel

Ein Steuerpflichtiger erzielt:

- Gewinn aus Gewerbebetrieb: 80.000 €
- Einkünfte aus nichtselbständiger Arbeit: 30.000 €
- Verlust aus Vermietung und Verpachtung: 10.000 €

► Summe der Einkünfte

80.000 €  
plus 30.000 €  
minus 10.000 €  
gleich 100.000 €.

Der Steuerpflichtige erhält einen Entlastungsbetrag für Alleinerziehende von beispielhaft 4.260 €.

► Gesamtbetrag der Einkünfte

100.000 €  
minus 4.260 €  
gleich 95.740 €.

Sonderausgaben:

8.000 €.

Außergewöhnliche Belastungen:

2.000 €.

► Einkommen

95.740 €  
minus 8.000 €  
minus 2.000 €  
gleich 85.740 €.

Kinderfreibeträge und weitere Abzüge bleiben im Beispiel unberücksichtigt.

► Zu versteuerndes Einkommen

85.740 €.

Auf diesen Betrag ist der Einkommensteuertarif anzuwenden.

---

⇨ 8. Außersteuerliche Rechtsnormen

§ 2 Abs. 5a EStG enthält besondere Regeln für außersteuerliche Gesetze, die an Begriffe wie

- Einkünfte,
- Summe der Einkünfte,
- Gesamtbetrag der Einkünfte,
- Einkommen oder
- zu versteuerndes Einkommen

anknüpfen.

► Hinzurechnungen

Für außersteuerliche Zwecke können insbesondere hinzuzurechnen sein:

- bestimmte Kapitalerträge nach § 32d Abs. 1 EStG,
- bestimmte Kapitalerträge nach § 43 Abs. 5 EStG,
- steuerfreie Teileinkünfte nach § 3 Nr. 40 EStG.

► Kürzungen

Abzuziehen sind gegebenenfalls:

- nicht abziehbare Beträge nach § 3c Abs. 2 EStG,
- Kinderbetreuungskosten nach § 10 Abs. 1 Nr. 5 EStG.

► Hintergrund

Außersteuerliche Leistungen sollen nicht allein dadurch beeinflusst werden, dass bestimmte Einkünfte steuerlich pauschal oder teilweise steuerfrei behandelt werden.

---

⇨ 9. Innersteuerliche Anknüpfung nach § 2 Abs. 5b EStG

Soweit Vorschriften des Einkommensteuergesetzes selbst an die Begriffe

- Einkünfte,
- Summe der Einkünfte,
- Gesamtbetrag der Einkünfte,
- Einkommen oder
- zu versteuerndes Einkommen

anknüpfen, sind bestimmte Kapitalerträge nach § 32d Abs. 1 und § 43 Abs. 5 EStG grundsätzlich nicht einzubeziehen.

► Merksatz

§ 2 Abs. 5a EStG betrifft außersteuerliche Rechtsnormen.

§ 2 Abs. 5b EStG betrifft Vorschriften innerhalb des Einkommensteuergesetzes.

---

⇨ 10. Festzusetzende Einkommensteuer nach § 2 Abs. 6 EStG

Die festzusetzende Einkommensteuer entspricht nicht zwingend der tariflichen Einkommensteuer.

Die tarifliche Steuer wird unter anderem verändert durch:

► Minderungen

- Unterschiedsbetrag nach § 32c EStG,
- anrechenbare ausländische Steuern,
- Steuerermäßigungen.

► Erhöhungen

- Steuer nach § 32d Abs. 3 und 4 EStG,
- Steuer nach § 34c Abs. 5 EStG,
- bestimmte Zuschläge,
- Zulage nach Abschnitt XI,
- Kindergeld in den Fällen des Familienleistungsausgleichs.

► Bedeutung

Erst die festzusetzende Einkommensteuer ist der Betrag, der im Steuerbescheid festgesetzt wird.

Davon zu unterscheiden sind noch:

- Steuerabzugsbeträge,
- Vorauszahlungen,
- Abschlusszahlung oder Erstattung.

---

⇨ 11. Einkommensteuer als Jahressteuer

Nach § 2 Abs. 7 EStG ist die Einkommensteuer eine Jahressteuer.

► Rechtsfolge

Die Besteuerungsgrundlagen werden grundsätzlich für jedes Kalenderjahr gesondert ermittelt.

Der Veranlagungszeitraum entspricht regelmäßig dem Kalenderjahr.

► Wechsel der Steuerpflicht

Besteht innerhalb eines Kalenderjahres zunächst beschränkte und später unbeschränkte Steuerpflicht oder umgekehrt, werden die während der beschränkten Steuerpflicht erzielten inländischen Einkünfte in die Veranlagung zur unbeschränkten Steuerpflicht einbezogen.

Es erfolgt grundsätzlich keine Trennung in zwei eigenständige Jahresveranlagungen.

---

⇨ 12. Ehegatten und Lebenspartner

Nach § 2 Abs. 8 EStG gelten die Regelungen des Einkommensteuergesetzes über

- Ehegatten und
- Ehen

entsprechend für

- Lebenspartner und
- Lebenspartnerschaften.

► Rechtsfolge

Steuerliche Regelungen wie insbesondere die Zusammenveranlagung können unter den gesetzlichen Voraussetzungen auch für Lebenspartnerschaften gelten.

---

⇨ 13. Prüfungsschema zu § 2 EStG

► Schritt 1: Steuerpflicht prüfen

Liegt

- unbeschränkte oder
- beschränkte Einkommensteuerpflicht

vor?

► Schritt 2: Einkunftsart bestimmen

Ist der Sachverhalt einer der sieben Einkunftsarten zuzuordnen?

► Schritt 3: Art der Einkünfteermittlung bestimmen

Handelt es sich um

- Gewinneinkünfte oder
- Überschusseinkünfte?

► Schritt 4: Einkünfte je Einkunftsart ermitteln

- Betriebseinnahmen minus Betriebsausgaben oder
- Einnahmen minus Werbungskosten.

► Schritt 5: Summe der Einkünfte bilden

Positive und negative Einkünfte zusammenrechnen.

► Schritt 6: Gesamtbetrag der Einkünfte ermitteln

Abzugsbeträge nach § 2 Abs. 3 EStG berücksichtigen.

► Schritt 7: Einkommen ermitteln

Sonderausgaben und außergewöhnliche Belastungen abziehen.

► Schritt 8: Zu versteuerndes Einkommen ermitteln

Freibeträge und weitere gesetzliche Abzüge berücksichtigen.

► Schritt 9: Tarifliche Einkommensteuer berechnen

Tarif nach § 32a EStG anwenden.

► Schritt 10: Festzusetzende Einkommensteuer ermitteln

Steuerermäßigungen, Anrechnungen und Hinzurechnungen berücksichtigen.

---

⇨ 14. Typische Klausurfallen

► Fehler 1: Einkünfte und Einnahmen gleichsetzen

Falsch:

Einnahmen sind automatisch die steuerpflichtigen Einkünfte.

Richtig:

Einkünfte ergeben sich erst nach Abzug von Betriebsausgaben oder Werbungskosten.

---

► Fehler 2: Gewinneinkünfte und Überschusseinkünfte verwechseln

Falsch:

Bei Gewerbebetrieb werden Einnahmen minus Werbungskosten berechnet.

Richtig:

Bei Gewerbebetrieb wird der Gewinn als Betriebseinnahmen minus Betriebsausgaben ermittelt.

---

► Fehler 3: Gesamtbetrag der Einkünfte mit dem Einkommen verwechseln

Falsch:

Der Gesamtbetrag der Einkünfte ist bereits das Einkommen.

Richtig:

Vom Gesamtbetrag der Einkünfte sind insbesondere Sonderausgaben und außergewöhnliche Belastungen abzuziehen.

---

► Fehler 4: Einkommen und zu versteuerndes Einkommen gleichsetzen

Falsch:

Das Einkommen ist unmittelbar die tarifliche Bemessungsgrundlage.

Richtig:

Vom Einkommen sind noch Freibeträge und weitere gesetzliche Abzüge vorzunehmen.

---

► Fehler 5: Tarifliche und festzusetzende Einkommensteuer gleichsetzen

Falsch:

Die tarifliche Einkommensteuer ist automatisch der im Steuerbescheid festzusetzende Betrag.

Richtig:

Die tarifliche Einkommensteuer wird noch um Steuerermäßigungen, Anrechnungen und Hinzurechnungen verändert.

---

► Fehler 6: Kapitalerträge immer in sämtliche Berechnungsgrößen einbeziehen

Falsch:

Abgeltend besteuerte Kapitalerträge sind stets in alle einkommensteuerlichen Größen einzubeziehen.

Richtig:

§ 2 Abs. 5a und 5b EStG enthalten besondere Regeln für die Einbeziehung oder Nichteinbeziehung.

---

► Fehler 7: Zwei getrennte Veranlagungen bei Wechsel der Steuerpflicht

Falsch:

Bei einem Wechsel zwischen beschränkter und unbeschränkter Steuerpflicht entstehen zwei getrennte Veranlagungen.

Richtig:

Die inländischen Einkünfte aus dem Zeitraum der beschränkten Steuerpflicht werden in die Veranlagung zur unbeschränkten Steuerpflicht einbezogen.

---

⇨ 15. Merksätze

- § 2 EStG ist das Grundgerüst der Einkommensteuerberechnung.

- Es gibt genau sieben Einkunftsarten.

- Land- und Forstwirtschaft, Gewerbebetrieb und selbständige Arbeit sind Gewinneinkünfte.

- Die übrigen Einkunftsarten sind grundsätzlich Überschusseinkünfte.

- Summe der Einkünfte und Gesamtbetrag der Einkünfte sind nicht identisch.

- Sonderausgaben und außergewöhnliche Belastungen werden erst vom Gesamtbetrag der Einkünfte abgezogen.

- Das zu versteuernde Einkommen ist die Bemessungsgrundlage für die tarifliche Einkommensteuer.

- Die tarifliche Einkommensteuer ist nicht automatisch die festzusetzende Einkommensteuer.

- Die Einkommensteuer ist eine Jahressteuer.

- Die Vorschriften für Ehegatten gelten grundsätzlich auch für Lebenspartner.
`
},
{
  id: "umsatzsteuer-vermietung-option-steuersatz-bmg-tausch",

  title:
    "Vermietung, Option zur Steuerpflicht, Steuersatz, Bemessungsgrundlage und Tausch",

  short:
    "Umsatzsteuerliche Behandlung der Grundstücksvermietung nach § 4 Nr. 12 UStG, Ausnahmen, Option nach § 9 UStG, ermäßigte Steuersätze, Entgelt sowie Tausch und tauschähnliche Umsätze.",

  category: "Umsatzsteuer",

  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Steuerbefreiungen, Option, Steuersatz und Bemessungsgrundlage",

  keywords:
    "§ 4 nr. 12 ustg|grundstücksvermietung|verpachtung|mietvertrag|pachtvertrag|nebenleistung|gemischter vertrag|garage|umlage|heizung|betriebsvorrichtung|baukran|kurzfristige vermietung|hotel|ferienwohnung|parkplatz|abstellplatz|campingplatz|option|§ 9 ustg|verzicht steuerbefreiung|§ 9 abs. 2 ustg|§ 9 abs. 3 ustg|vorsteuerabzug|§ 15 ustg|§ 27 ustg|ermäßigter steuersatz|§ 12 ustg|anlage 2 ustg|personenbeförderung|bemessungsgrundlage|§ 10 ustg|entgelt|entgelt von dritter seite|tausch|tauschähnlicher umsatz|baraufgabe|§ 3 abs. 12 ustg",

  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3 Abs. 12 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 3a Abs. 3 Nr. 1 UStG",
    "§ 4 Nr. 8 Buchst. a UStG",
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 4 Nr. 12 Buchst. a UStG",
    "§ 4 Nr. 12 Satz 2 UStG",
    "§ 9 Abs. 1 UStG",
    "§ 9 Abs. 2 UStG",
    "§ 9 Abs. 3 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 10 Abs. 2 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 12 Abs. 2 UStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 13a Abs. 1 Nr. 1 UStG",
    "§ 13b Abs. 2 Nr. 3 UStG",
    "§ 15 Abs. 1 Nr. 1 UStG",
    "§ 15 Abs. 2 UStG",
    "§ 15 Abs. 3 UStG",
    "§ 27 UStG",
    "Anlage 2 zum UStG",
    "UStAE zu §§ 4, 9, 10 und 12 UStG"
  ],

  body: `
⇨ Grundstücksvermietung, Option, Steuersatz, Bemessungsgrundlage und Tausch

► 1. Überblick

Bei der umsatzsteuerlichen Prüfung von Vermietungs- und Grundstückssachverhalten ist regelmäßig folgende Reihenfolge einzuhalten:

1. Liegt eine Lieferung oder sonstige Leistung vor?
2. Wird die Leistung im Inland ausgeführt?
3. Ist sie nach § 1 Abs. 1 Nr. 1 UStG steuerbar?
4. Greift eine Steuerbefreiung?
5. Liegt eine Ausnahme von der Steuerbefreiung vor?
6. Kann nach § 9 UStG zur Steuerpflicht optiert werden?
7. Welcher Steuersatz gilt?
8. Wie hoch ist die Bemessungsgrundlage?
9. Wer schuldet die Steuer?
10. Ist der Vorsteuerabzug zulässig?

Merksatz:

**Erst Steuerbarkeit, dann Steuerbefreiung, anschließend Option, Steuersatz und Vorsteuerabzug.**

---

⇨ 2. Steuerbefreiung der Grundstücksvermietung

► Rechtsgrundlage

Nach § 4 Nr. 12 Buchst. a UStG sind grundsätzlich steuerfrei:

- die Vermietung von Grundstücken,
- die Verpachtung von Grundstücken,
- die Vermietung und Verpachtung von Grundstücksteilen.

Zum unionsrechtlichen Grundstücksbegriff gehören insbesondere:

- Grund und Boden,
- fest mit dem Boden verbundene Gebäude,
- Gebäudeteile,
- Wohnungen,
- einzelne Räume,
- bestimmte Grundstückseinrichtungen.

► Art der Leistung

Die Vermietung oder Verpachtung ist regelmäßig eine sonstige Leistung nach § 3 Abs. 9 UStG.

Der Vermieter räumt dem Mieter gegen Entgelt insbesondere das Recht ein,

- das Grundstück oder den Raum zu benutzen und
- andere Personen von der Nutzung auszuschließen.

► Ort der Leistung

Bei Leistungen im Zusammenhang mit einem Grundstück bestimmt sich der Leistungsort grundsätzlich nach der Belegenheit des Grundstücks.

Rechtsgrundlage:

§ 3a Abs. 3 Nr. 1 UStG.

Beispiel:

Ein in Köln ansässiger Unternehmer vermietet ein Gebäude in Düsseldorf.

Ort der Vermietungsleistung:

Düsseldorf.

---

⇨ 3. Einheitliche Vermietungsleistung mit Nebenleistungen

► Grundsatz

Übliche Nebenleistungen teilen regelmäßig das umsatzsteuerliche Schicksal der Grundstücksvermietung.

Es liegt insgesamt eine einheitliche sonstige Leistung vor.

Typische Nebenleistungen:

- Heizung,
- Wasserversorgung,
- Reinigung gemeinschaftlicher Flächen,
- Hausmeisterleistungen,
- allgemeine Betriebskosten,
- Umlagen,
- Überlassung einer zugehörigen Garage,
- Nutzung gemeinschaftlicher Einrichtungen.

► Beispiel

Monatliche Entgelte:

- Gebäudemiete: 10.000 €
- Heizkosten: 500 €

Die Beheizung dient unmittelbar der Nutzung des vermieteten Gebäudes.

Sie ist regelmäßig Nebenleistung zur Grundstücksvermietung.

Gesamtleistung:

Vermietung einschließlich Beheizung.

Folge:

Grundsätzlich steuerfrei nach § 4 Nr. 12 Buchst. a UStG.

► Merksatz

**Übliche Nebenleistungen folgen der Hauptleistung.**

---

⇨ 4. Gemischter Vertrag

► Begriff

Ein gemischter Vertrag liegt vor, wenn neben der Grundstücksüberlassung eine weitere selbständige Leistung erbracht wird.

Dann sind umsatzsteuerlich zwei Leistungen getrennt zu beurteilen.

Beispiel:

Ein Unternehmer vermietet

- ein Betriebsgebäude und
- zusätzlich einen eigenständig nutzbaren Baukran.

► Grundstücksvermietung

Die Vermietung des Gebäudes ist grundsätzlich nach § 4 Nr. 12 Buchst. a UStG steuerfrei.

► Baukran

Die Überlassung des Baukrans ist eine eigenständige sonstige Leistung nach § 3 Abs. 9 UStG.

Sie ist nicht bereits deshalb steuerfrei, weil sie zusammen mit dem Grundstück vereinbart wurde.

Folge:

Die Vermietung des Baukrans ist grundsätzlich steuerpflichtig.

► Klausurfrage

Ist die zusätzliche Leistung

- lediglich unselbständige Nebenleistung oder
- eine eigenständige Hauptleistung?

Entscheidend sind insbesondere:

- eigenständiger wirtschaftlicher Nutzen,
- gesonderte Vereinbarung,
- gesondertes Entgelt,
- getrennte Nutzbarkeit,
- eigenständiges Interesse des Leistungsempfängers.

---

⇨ 5. Beispiel: Gebäude, Heizung und Baukran

Ein Unternehmer vermietet:

- Gebäude: 10.000 €
- Heizung: 500 €
- Baukran: 2.000 €

► Gebäude und Heizung

Gebäude und Heizung bilden regelmäßig eine einheitliche Vermietungsleistung.

Bemessungsgrundlage:

10.500 €

Grundsätzlich steuerfrei nach § 4 Nr. 12 Buchst. a UStG.

► Baukran

Der Baukran ist eine selbständig nutzbare Betriebsvorrichtung bzw. ein beweglicher Gegenstand.

Bemessungsgrundlage:

2.000 €

Grundsätzlich steuerpflichtig.

► Ergebnis

Es liegen zwei getrennte Umsätze vor:

1. Grundstücksvermietung einschließlich Heizung,
2. steuerpflichtige Vermietung des Baukrans.

---

⇨ 6. Ausnahmen von der Steuerbefreiung

§ 4 Nr. 12 Satz 2 UStG nimmt bestimmte Vermietungsleistungen von der Steuerbefreiung aus.

Diese Umsätze sind daher steuerpflichtig.

---

⇨ 7. Kurzfristige Beherbergung von Fremden

Nicht steuerfrei ist die Vermietung von Wohn- und Schlafräumen, die ein Unternehmer zur kurzfristigen Beherbergung von Fremden bereithält.

Typische Fälle:

- Hotel,
- Pension,
- Ferienwohnung,
- Gästezimmer,
- kurzfristig vermietete Apartments.

Entscheidend ist die tatsächliche Art und Dauer der Überlassung.

In Prüfungssachverhalten wird eine tatsächliche Mietdauer von bis zu sechs Monaten regelmäßig als Hinweis auf eine kurzfristige Beherbergung behandelt.

► Folge

Die Leistung ist nicht nach § 4 Nr. 12 Buchst. a UStG steuerfrei.

Sie ist grundsätzlich steuerpflichtig.

Für die reine kurzfristige Beherbergungsleistung ist zusätzlich der ermäßigte Steuersatz nach § 12 Abs. 2 Nr. 11 UStG zu prüfen.

---

⇨ 8. Abstellplätze für Fahrzeuge

Nicht steuerfrei ist grundsätzlich die Vermietung von Plätzen für das Abstellen von Fahrzeugen.

Typische Fälle:

- Parkplatz,
- Tiefgaragenstellplatz,
- Einzelgarage,
- Bootsliegeplatz,
- Stellplatz für Anhänger,
- Stellplatz für Bagger oder Kran.

Der Fahrzeugbegriff wird weit verstanden.

► Gesondert vermieteter Stellplatz

Wird ein Parkplatz oder eine Garage eigenständig vermietet, ist die Leistung grundsätzlich steuerpflichtig.

► Stellplatz als Nebenleistung zur Wohnungsvermietung

Wird der Stellplatz zusammen mit einer steuerfreien Grundstücks- oder Wohnungsvermietung überlassen und bildet er eine unselbständige Nebenleistung, kann er das steuerliche Schicksal der steuerfreien Hauptleistung teilen.

Prüfungspunkte:

- gleicher Vermieter,
- gleicher Mieter,
- räumlicher Zusammenhang,
- wirtschaftlicher Zusammenhang,
- einheitlicher Mietvertrag oder erkennbar einheitliche Leistung.

Merksatz:

**Separater Parkplatz steuerpflichtig – zugehöriger Stellplatz kann Nebenleistung zur steuerfreien Vermietung sein.**

---

⇨ 9. Campingplätze

Nicht steuerfrei ist die kurzfristige Vermietung von Plätzen auf Campingplätzen.

Typische Fälle:

- Zeltplatz,
- Wohnmobilplatz,
- Wohnwagenstellplatz.

Maßgeblich ist grundsätzlich die tatsächliche Mietdauer.

---

⇨ 10. Verzicht auf die Steuerbefreiung

► Zweck der Option

Steuerfreie Umsätze führen häufig nach § 15 Abs. 2 UStG zum Ausschluss des Vorsteuerabzugs.

Dies kann innerhalb einer Unternehmerkette zu einer wirtschaftlichen Belastung führen.

Durch die Option nach § 9 UStG kann der Unternehmer unter den gesetzlichen Voraussetzungen auf die Steuerbefreiung verzichten.

Rechtsfolge:

- der Ausgangsumsatz wird steuerpflichtig,
- § 15 Abs. 2 UStG greift für diesen Umsatz nicht,
- der Vorsteuerabzug kann grundsätzlich eröffnet werden.

► Beschränkung auf einzelne Umsätze

Der Unternehmer kann die Option grundsätzlich auf einzelne Umsätze beschränken.

Bei einem Gebäude kann daher gegebenenfalls für einzelne selbständige Gebäudeteile unterschiedlich optiert werden.

---

⇨ 11. Grundvoraussetzungen der Option nach § 9 Abs. 1 UStG

Die Option betrifft insbesondere bestimmte steuerfreie Umsätze nach:

- § 4 Nr. 8 Buchst. a UStG,
- § 4 Nr. 9 Buchst. a UStG,
- § 4 Nr. 12 UStG.

Weitere Voraussetzung:

Der Umsatz muss an einen anderen Unternehmer für dessen Unternehmen ausgeführt werden.

► Leistungsempfänger

Der Leistungsempfänger muss Unternehmer im Sinne des § 2 UStG sein.

Nicht ausreichend ist grundsätzlich eine Leistung an:

- eine Privatperson,
- einen Nichtunternehmer,
- eine juristische Person des öffentlichen Rechts außerhalb ihres Unternehmens.

► Unternehmensbezug

Der Leistungsempfänger muss die Leistung für sein Unternehmen beziehen.

► Rechtsfolge

Sind die Voraussetzungen erfüllt, kann der leistende Unternehmer auf die Steuerbefreiung verzichten.

Der Umsatz wird steuerpflichtig.

---

⇨ 12. Ausübung der Option

Die Option kann grundsätzlich durch eindeutiges Verhalten ausgeübt werden.

Typische Fälle:

- offener Umsatzsteuerausweis,
- Behandlung des Umsatzes als steuerpflichtig in der Umsatzsteuer-Voranmeldung,
- Behandlung als steuerpflichtig in der Umsatzsteuererklärung,
- ausdrückliche Erklärung gegenüber dem Finanzamt.

Der Verzicht ist grundsätzlich bis zur materiellen Bestandskraft der Steuerfestsetzung möglich.

Bei Grundstücksveräußerungen gelten jedoch die besonderen Formvorschriften des § 9 Abs. 3 UStG.

---

⇨ 13. Einschränkung bei der Vermietung nach § 9 Abs. 2 UStG

► Grundsatz

Bei Grundstücksvermietungen genügt es nicht, dass der Mieter Unternehmer ist.

Die Option ist nur zulässig, soweit der Leistungsempfänger das Grundstück ausschließlich für Umsätze verwendet oder zu verwenden beabsichtigt, die den Vorsteuerabzug nicht ausschließen.

► Prüfung aus Sicht des Mieters

Zu untersuchen ist, welche Ausgangsumsätze der Mieter in den gemieteten Räumen ausführt.

⇶  Fall 1: Steuerpflichtige Ausgangsumsätze

Der Mieter führt steuerpflichtige Umsätze aus.

Folge:

Kein Vorsteuerausschluss nach § 15 Abs. 2 UStG.

Die Option ist grundsätzlich zulässig.

⇶  Fall 2: Steuerfreie Umsätze mit Rückausnahme

Der Mieter führt steuerfreie Umsätze aus, bei denen der Vorsteuerabzug aufgrund einer Rückausnahme nach § 15 Abs. 3 UStG erhalten bleibt.

Folge:

Die Option kann grundsätzlich zulässig sein.

Beispiel:

Bestimmte Ausfuhrumsätze.

⇶  Fall 3: Steuerfreie Umsätze ohne Vorsteuerabzug

Der Mieter führt steuerfreie Umsätze aus, die nach § 15 Abs. 2 UStG zum Vorsteuerausschluss führen und für die keine Rückausnahme nach § 15 Abs. 3 UStG gilt.

Folge:

Die Option ist grundsätzlich nicht zulässig.

Beispiel:

Heilbehandlungen nach § 4 Nr. 14 UStG.

---

⇨ 14. Bagatellgrenze bei § 9 Abs. 2 UStG

Nach der Verwaltungspraxis wird die ausschließliche Verwendung für vorsteuerunschädliche Umsätze regelmäßig noch angenommen, wenn die vorsteuerschädliche Verwendung nur geringfügig ist.

Als praktische Toleranzgrenze wird regelmäßig ein Anteil von höchstens 5 % vorsteuerschädlicher Umsätze berücksichtigt.

Prüfung:

1. Option nach § 9 Abs. 1 UStG grundsätzlich möglich?
2. Einschränkung nach § 9 Abs. 2 UStG?
3. Verwendet der Mieter das Grundstück für vorsteuerunschädliche Umsätze?
4. Liegt nur eine geringfügige vorsteuerschädliche Verwendung vor?

---

⇨ 15. Beispiel zur Option bei Vermietung

Ein Vermieter überlässt Praxisräume an einen Arzt.

Der Arzt verwendet die Räume ausschließlich für umsatzsteuerfreie Heilbehandlungen nach § 4 Nr. 14 UStG.

Die Heilbehandlungen schließen den Vorsteuerabzug aus.

Folge:

Eine Option des Vermieters nach § 9 UStG ist grundsätzlich nicht zulässig.

---

Ein Vermieter überlässt Büroräume an eine Unternehmensberatung.

Die Unternehmensberatung führt ausschließlich steuerpflichtige Beratungsumsätze aus.

Folge:

Die Option ist grundsätzlich zulässig.

Die Miete wird mit Umsatzsteuer abgerechnet.

---

⇨ 16. Übergangsregelungen nach § 27 UStG

Bei älteren Gebäuden oder Altverträgen können Übergangsregelungen zu beachten sein.

Deshalb ist bei entsprechenden Sachverhalten zusätzlich zu prüfen:

- Zeitpunkt der Errichtung,
- Zeitpunkt des Baubeginns,
- Zeitpunkt des Vertragsabschlusses,
- erstmalige Verwendung,
- anwendbare Übergangsvorschriften des § 27 UStG.

Merksatz:

**Bei Altgebäuden § 27 UStG nicht vergessen.**

---

⇨ 17. Option bei Grundstücksveräußerungen

► Grundsatz

Auch bei nach § 4 Nr. 9 Buchst. a UStG steuerfreien Grundstücksveräußerungen kann grundsätzlich nach § 9 Abs. 1 UStG zur Steuerpflicht optiert werden.

Voraussetzung:

Veräußerung an einen anderen Unternehmer für dessen Unternehmen.

► Besonderheit nach § 9 Abs. 3 UStG

Bei Grundstücksumsätzen gelten besondere Form- und Zeitpunktanforderungen.

⇶  Zwangsversteigerung

Bei einer Lieferung im Zwangsversteigerungsverfahren gelten die besonderen Regelungen des § 9 Abs. 3 Satz 1 UStG.

⇶  Notarieller Vertrag

Außerhalb der Zwangsversteigerung muss der Verzicht auf die Steuerbefreiung grundsätzlich im notariell zu beurkundenden Vertrag erklärt werden.

Eine spätere Option außerhalb des notariellen Vertrags ist regelmäßig nicht ausreichend.

► Rechtsfolge der wirksamen Option

- Grundstücksumsatz wird steuerpflichtig,
- Vorsteuerausschluss nach § 15 Abs. 2 UStG entfällt grundsätzlich,
- bei Grundstückslieferungen ist zusätzlich § 13b Abs. 2 Nr. 3 UStG zu prüfen.

---

⇨ 18. Prüfungsschema Option bei Vermietung

1. Liegt ein steuerfreier Vermietungsumsatz nach § 4 Nr. 12 UStG vor?
2. Ist eine Ausnahme nach § 4 Nr. 12 Satz 2 UStG einschlägig?
3. Ist der Leistungsempfänger Unternehmer?
4. Bezieht er die Leistung für sein Unternehmen?
5. Ist die Option nach § 9 Abs. 1 UStG grundsätzlich möglich?
6. Verwendet der Mieter das Grundstück für vorsteuerunschädliche Umsätze?
7. Ist § 9 Abs. 2 UStG erfüllt?
8. Sind Übergangsregelungen nach § 27 UStG zu beachten?
9. Wurde die Option wirksam ausgeübt?
10. Vorsteuerabzug des Vermieters prüfen.

---

⇨ 19. Prüfungsschema Option bei Grundstücksveräußerung

1. Steuerbare Grundstückslieferung?
2. Steuerbefreiung nach § 4 Nr. 9 Buchst. a UStG?
3. Erwerber ist Unternehmer?
4. Erwerb für dessen Unternehmen?
5. Option nach § 9 Abs. 1 UStG zulässig?
6. Formvoraussetzungen nach § 9 Abs. 3 UStG erfüllt?
7. Option im notariellen Vertrag erklärt?
8. Umsatz steuerpflichtig?
9. § 13b Abs. 2 Nr. 3 UStG prüfen.
10. Vorsteuerfolgen prüfen.

---

⇨ 20. Ermäßigter Steuersatz

► Grundsatz

Der Regelsteuersatz beträgt nach § 12 Abs. 1 UStG grundsätzlich 19 %.

Für bestimmte gesetzlich bezeichnete Umsätze gilt nach § 12 Abs. 2 UStG der ermäßigte Steuersatz von 7 %.

Die Begünstigung ist eng auszulegen.

Merksatz:

**Erst den Steuersatz bestimmen, danach die Bemessungsgrundlage aus einem Bruttobetrag herausrechnen.**

---

⇨ 21. Gegenstände der Anlage 2

Der ermäßigte Steuersatz gilt insbesondere für Lieferungen bestimmter in Anlage 2 zum UStG bezeichneter Gegenstände.

Typische Gruppen:

- bestimmte Tiere,
- landwirtschaftliche Nutztiere,
- Blindenführhunde,
- Milch und bestimmte Milcherzeugnisse,
- Pflanzen und Blumen,
- bestimmte Lebensmittel,
- Kaffee, Tee und Gewürze in den gesetzlich bezeichneten Formen,
- Leitungswasser,
- bestimmte forstwirtschaftliche Erzeugnisse,
- bestimmte Waren des Buchhandels.

► Abgrenzungen

Nicht jedes Getränk ist begünstigt.

Typischerweise nicht begünstigt:

- abgefülltes Trinkwasser,
- alkoholische Getränke,
- Kaffeegetränke,
- sonstige verarbeitete Getränke.

Bei Kaffee, Tee, Mate und Gewürzen ist genau auf die jeweilige Position der Anlage 2 zu achten.

---

⇨ 22. Personenbeförderung

Nach § 12 Abs. 2 Nr. 10 UStG kann der ermäßigte Steuersatz insbesondere für bestimmte Personenbeförderungen gelten.

► Schienenbahnverkehr

Die Personenbeförderung im Schienenbahnverkehr kann nach den gesetzlichen Voraussetzungen ermäßigt besteuert werden.

► Andere Verkehrsmittel

Bei Beförderung mit

- Kraftfahrzeugen,
- Taxen,
- Schiffen,
- Drahtseilbahnen

ist insbesondere zu prüfen, ob

- die Beförderung innerhalb einer Gemeinde erfolgt oder
- die Beförderungsstrecke höchstens 50 Kilometer beträgt.

► Hin- und Rückfahrt

Hin- und Rückfahrt sind grundsätzlich getrennt zu beurteilen.

Ausnahme:

Die Rückfahrt wurde bereits vorab vereinbart und erfolgt ohne wesentliche zeitliche Unterbrechung.

Bei grenzüberschreitenden Beförderungen ist grundsätzlich auf den inländischen Streckenanteil abzustellen.

---

⇨ 23. Kurzfristige Beherbergung und Steuersatz

Die kurzfristige Vermietung von Wohn- und Schlafräumen zur Beherbergung von Fremden ist nach § 4 Nr. 12 Satz 2 UStG nicht steuerfrei.

Für die reine Beherbergungsleistung gilt grundsätzlich der ermäßigte Steuersatz nach § 12 Abs. 2 Nr. 11 UStG.

Nicht automatisch ermäßigt sind eigenständige Zusatzleistungen.

Typische gesondert zu prüfende Leistungen:

- Frühstück,
- Parkplatz,
- Wellness,
- Minibar,
- Telefon,
- Tagungsleistungen.

---

⇨ 24. Bemessungsgrundlage nach § 10 UStG

► Grundsatz

Nach § 10 Abs. 1 UStG wird der Umsatz grundsätzlich nach dem Entgelt bemessen.

Entgelt ist alles, was den Wert der Gegenleistung bildet, die der leistende Unternehmer vom Leistungsempfänger oder von einem Dritten erhält oder erhalten soll.

Nicht zum Entgelt gehört die gesetzlich geschuldete Umsatzsteuer.

Formel:

Gegenleistung brutto  
− enthaltene Umsatzsteuer  
= Entgelt  
= Bemessungsgrundlage

---

⇨ 25. Herausrechnung der Umsatzsteuer

► Regelsteuersatz 19 %

Bruttobetrag ÷ 1,19  
= Nettoentgelt

Nettoentgelt × 19 %  
= Umsatzsteuer

► Ermäßigter Steuersatz 7 %

Bruttobetrag ÷ 1,07  
= Nettoentgelt

Nettoentgelt × 7 %  
= Umsatzsteuer

► Steuerfreier Umsatz

Bei einem steuerfreien Umsatz ist keine Umsatzsteuer aus dem Entgelt herauszurechnen.

Divisor:

1.

---

⇨ 26. Beispiel zur Bemessungsgrundlage

Ein Unternehmer erhält für eine steuerpflichtige Leistung insgesamt:

2.380 €.

Steuersatz:

19 %.

Berechnung:

2.380 € ÷ 1,19  
= 2.000 € Entgelt.

Umsatzsteuer:

2.000 € × 19 %  
= 380 €.

Bemessungsgrundlage:

2.000 €.

Wichtig:

Ein unzutreffender oder fehlender Steuerausweis in der Rechnung ändert grundsätzlich nicht die gesetzliche Bemessungsgrundlage.

---

⇨ 27. Bezeichnung der Zahlung

Die Bezeichnung einer Zahlung ist nicht entscheidend.

Auch folgende Zahlungen können Entgelt sein:

- Zuschuss,
- Beitrag,
- Prämie,
- Entschädigung,
- Kostenersatz,
- Aufwendungsersatz,
- freiwillige Zahlung,
- versehentliche Mehrzahlung.

Entscheidend ist der wirtschaftliche Zusammenhang mit der Leistung.

Merksatz:

**Nicht die Bezeichnung, sondern der Leistungszusammenhang entscheidet.**

---

⇨ 28. Entgelt von dritter Seite

Zum Entgelt können auch Zahlungen eines Dritten gehören.

Voraussetzungen:

1. Der Unternehmer erbringt eine Leistung an den Leistungsempfänger.
2. Ein Dritter zahlt an den Unternehmer.
3. Die Zahlung erfolgt für genau diese Leistung.
4. Die Zahlung dient wirtschaftlich der Förderung oder Entlastung des Leistungsempfängers.

► Beispiel

Unternehmer A liefert eine Maschine an Unternehmer B.

B zahlt:

2.000 €.

Ein Fördergeber zahlt zusätzlich für diese Maschinenlieferung:

1.000 € an A.

Gesamte Gegenleistung:

3.000 € brutto.

Die Drittzahlung kann Teil des Entgelts sein.

---

⇨ 29. Abgekürzter Zahlungsweg

Auch eine Zahlung, die nicht unmittelbar an den leistenden Unternehmer erfolgt, kann Entgelt darstellen.

Entscheidend ist, ob sie wirtschaftlich auf Rechnung des Leistungsempfängers zur Erfüllung der Gegenleistung erfolgt.

---

⇨ 30. Tausch

► Begriff

Ein Tausch liegt vor, wenn die Gegenleistung für eine Lieferung ebenfalls in einer Lieferung besteht.

Rechtsgrundlage:

§ 3 Abs. 12 Satz 1 UStG.

Beispiel:

Unternehmer A liefert eine Maschine an Unternehmer B.

B liefert dafür einen anderen Gegenstand an A.

Es liegen zwei getrennt zu prüfende Lieferungen vor.

---

⇨ 31. Tauschähnlicher Umsatz

Ein tauschähnlicher Umsatz liegt vor, wenn die Gegenleistung für eine Leistung in einer Lieferung oder sonstigen Leistung besteht und mindestens eine Seite eine sonstige Leistung erbringt.

Rechtsgrundlage:

§ 3 Abs. 12 Satz 2 UStG.

Beispiele:

- Beratungsleistung gegen Warenlieferung,
- Architektenleistung gegen Brennholz,
- Reparaturleistung gegen Überlassung eines Gegenstands,
- Werkleistung gegen Lieferung von Material.

Es liegen auf beiden Seiten eigenständige Umsätze vor.

Jeder Umsatz ist getrennt zu prüfen hinsichtlich:

- Leistungsart,
- Leistungsort,
- Steuerbarkeit,
- Steuerbefreiung,
- Steuersatz,
- Steuerschuldner,
- Bemessungsgrundlage,
- Steuerentstehung.

---

⇨ 32. Bemessungsgrundlage beim Tausch

Beim Tausch gilt der Wert jedes Umsatzes als Entgelt für den jeweils anderen Umsatz.

Die Umsatzsteuer gehört nicht zum Entgelt.

Grundformel:

Wert des anderen Umsatzes  
− enthaltene Umsatzsteuer  
= Bemessungsgrundlage

Der Wert des anderen Umsatzes ist grundsätzlich der subjektive Wert der empfangenen Gegenleistung.

Maßgeblich ist regelmäßig der Betrag, den der Leistungsempfänger für den Erhalt dieser Gegenleistung aufzuwenden bereit ist.

---

⇨ 33. Tausch mit Baraufgabe

Wird zusätzlich zur Sach- oder Dienstleistung eine Geldzahlung erbracht, liegt ein Tausch oder tauschähnlicher Umsatz mit Baraufgabe vor.

► Beteiligter erhält die Baraufgabe

Berechnung:

Wert des anderen Umsatzes  
+ erhaltene Baraufgabe  
= Bruttogegenleistung  
− enthaltene Umsatzsteuer  
= Bemessungsgrundlage

► Beteiligter zahlt die Baraufgabe

Berechnung:

Wert des anderen Umsatzes  
− geleistete Baraufgabe  
= Bruttogegenleistung  
− enthaltene Umsatzsteuer  
= Bemessungsgrundlage

---

⇨ 34. Beispiel: Architektenleistung gegen Brennholz

Unternehmer A erbringt an Unternehmer B eine Architektenleistung.

Vereinbarter Wert:

1.000 €.

B liefert an A Brennholz im Wert von:

1.200 €.

► Leistung des A

A erbringt eine sonstige Leistung nach § 3 Abs. 9 UStG.

Die Gegenleistung besteht in der Lieferung des Brennholzes.

Es liegt ein tauschähnlicher Umsatz nach § 3 Abs. 12 Satz 2 UStG vor.

Zu prüfen sind:

- Ort der Architektenleistung,
- Steuerbarkeit,
- Steuerbefreiung,
- Steuersatz,
- Bemessungsgrundlage,
- Steuerentstehung.

► Leistung des B

B erbringt eine Lieferung des Brennholzes nach § 3 Abs. 1 UStG.

Die Gegenleistung besteht in der Architektenleistung.

Auch dieser Umsatz ist eigenständig zu prüfen.

► Wichtiger Grundsatz

Der auf einer Seite angegebene Listen- oder Marktwert ist nicht automatisch die Bemessungsgrundlage beider Umsätze.

Entscheidend ist jeweils der Wert der erhaltenen Gegenleistung.

---

⇨ 35. Prüfungsschema Tausch und tauschähnlicher Umsatz

1. Welche Leistungen werden ausgetauscht?
2. Lieferung gegen Lieferung?
   - Tausch nach § 3 Abs. 12 Satz 1 UStG.
3. Mindestens eine sonstige Leistung?
   - tauschähnlicher Umsatz nach § 3 Abs. 12 Satz 2 UStG.
4. Liegt zusätzlich eine Baraufgabe vor?
5. Jeden Umsatz getrennt prüfen.
6. Wert der jeweils empfangenen Gegenleistung bestimmen.
7. Baraufgabe hinzurechnen oder abziehen.
8. Umsatzsteuer herausrechnen.
9. Bemessungsgrundlage bestimmen.
10. Zeitpunkt der Steuerentstehung prüfen.

---

⇨ 36. Typische Klausurfallen

► Fehler 1: Jede Nebenleistung getrennt besteuern

Heizung und übliche Umlagen können Nebenleistungen zur steuerfreien Grundstücksvermietung sein.

---

► Fehler 2: Jede mitvermietete Sache als steuerfreie Grundstücksvermietung behandeln

Ein selbständig nutzbarer Baukran oder eine Betriebsvorrichtung kann eine eigenständige steuerpflichtige Leistung darstellen.

---

► Fehler 3: Kurzfristige Beherbergung als steuerfrei behandeln

Die kurzfristige Beherbergung von Fremden ist von der Steuerbefreiung ausgenommen.

---

► Fehler 4: Separaten Parkplatz als steuerfrei behandeln

Die eigenständige Vermietung eines Stellplatzes ist grundsätzlich steuerpflichtig.

---

► Fehler 5: Option allein wegen Unternehmereigenschaft des Mieters zulassen

Bei der Vermietung muss zusätzlich § 9 Abs. 2 UStG geprüft werden.

---

► Fehler 6: Ausgangsumsätze des Mieters nicht prüfen

Entscheidend ist, ob der Mieter in den Räumen vorsteuerunschädliche Umsätze ausführt.

---

► Fehler 7: Option bei Grundstücksverkauf außerhalb des Notarvertrags erklären

Bei Grundstücksveräußerungen ist § 9 Abs. 3 UStG zu beachten.

---

► Fehler 8: Sofort mit 19 % rechnen

Zunächst muss geprüft werden:

- steuerfrei,
- 7 % oder
- 19 %.

Erst danach darf die Umsatzsteuer aus einem Bruttobetrag herausgerechnet werden.

---

► Fehler 9: Drittzahlungen übersehen

Auch Zahlungen eines Dritten können Entgelt sein.

---

► Fehler 10: Beim Tausch nur einen Umsatz prüfen

Beim Tausch oder tauschähnlichen Umsatz liegen grundsätzlich zwei getrennte Umsätze vor.

---

► Fehler 11: Marktwert ungeprüft als Bemessungsgrundlage übernehmen

Maßgeblich ist grundsätzlich der Wert der jeweils empfangenen Gegenleistung.

---

► Fehler 12: Baraufgabe falsch behandeln

- erhaltene Baraufgabe: hinzurechnen,
- geleistete Baraufgabe: abziehen.

---

⇨ 37. Merksätze

- Grundstücksvermietungen sind grundsätzlich steuerfrei.
- Übliche Nebenleistungen teilen regelmäßig das Schicksal der Vermietung.
- Selbständige Zusatzleistungen sind getrennt zu beurteilen.
- Kurzfristige Beherbergung ist steuerpflichtig.
- Separat vermietete Stellplätze sind grundsätzlich steuerpflichtig.
- Die Option nach § 9 UStG setzt einen unternehmerischen Leistungsempfänger voraus.
- Bei Vermietungen ist zusätzlich § 9 Abs. 2 UStG zu prüfen.
- Vorsteuerunschädliche Verwendung des Mieters entscheidet über die Option.
- Bei Grundstücksverkäufen muss die Option grundsätzlich im Notarvertrag erklärt werden.
- Erst den Steuersatz bestimmen, dann die Umsatzsteuer herausrechnen.
- Entgelt ist alles, was der Unternehmer für die Leistung erhält.
- Auch Drittzahlungen können Entgelt sein.
- Beim Tausch liegen zwei Leistungen vor.
- Beim tauschähnlichen Umsatz erbringt mindestens eine Seite eine sonstige Leistung.
- Der Wert des jeweils anderen Umsatzes bildet grundsätzlich die Gegenleistung.
- Die Umsatzsteuer gehört nicht zur Bemessungsgrundlage.
`
},
{
  id: "umsatzsteuer-gebaeude-verwendungsabsicht-vorsteueraufteilung-15a",
  title:
    "Gebäude: Vorsteuerabzug nach Verwendungsabsicht und Berichtigung nach § 15a UStG",
  short:
    "Vorsteueraufteilung bei gemischt geplanter Gebäudevermietung und spätere Vorsteuerberichtigung bei abweichender tatsächlicher Erstverwendung.",
  category: "Umsatzsteuer",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Grundstücke, Vorsteuerabzug und Vorsteuerberichtigung",
  keywords:
    "gebäude|anbau|herstellungskosten|vorsteuerabzug|verwendungsabsicht|erstmalige verwendung|§ 15 ustg|§ 15a ustg|vorsteuerberichtigung|vorsteueraufteilung|flächenschlüssel|vermietung|podologe|heilbehandlung|kosmetische leistungen|messehostel|kurzfristige vermietung|spedition|option § 9 ustg|steuerfreie vermietung|steuerpflichtige vermietung|berichtigungszeitraum",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 3 Nr. 1 UStG",
    "§ 4 Nr. 12 Satz 1 Buchst. a UStG",
    "§ 4 Nr. 12 Satz 2 UStG",
    "§ 4 Nr. 14 Buchst. a UStG",
    "§ 4 Nr. 3 Buchst. a UStG",
    "§ 9 Abs. 1 UStG",
    "§ 9 Abs. 2 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 13a Abs. 1 Nr. 1 UStG",
    "§ 15 Abs. 1 Satz 1 Nr. 1 UStG",
    "§ 15 Abs. 2 Satz 1 Nr. 1 UStG",
    "§ 15 Abs. 3 Nr. 1 Buchst. a UStG",
    "§ 15 Abs. 4 UStG",
    "§ 15a Abs. 1 UStG",
    "§ 15a Abs. 5 UStG",
    "§ 15a Abs. 6 UStG",
    "§ 44 UStDV",
    "Abschn. 15.12 UStAE",
    "Abschn. 15.17 UStAE",
    "Abschn. 15a.3 UStAE",
    "Abschn. 15a.11 UStAE"
  ],
  body: `
⇨ Gebäude – Vorsteuerabzug nach Verwendungsabsicht und § 15a UStG

► 1. Ausgangssachverhalt

Eine KG errichtet im Jahr 2025 einen zweigeschossigen Anbau.

Beide Geschosse sind gleich groß.

Baukosten:

400.000 € netto

zuzüglich

76.000 € Umsatzsteuer.

Der Bauunternehmer stellt nach Abnahme am 30.10.2025 eine ordnungsgemäße Rechnung aus.

Die KG beabsichtigt zu diesem Zeitpunkt nachweislich:

- das Erdgeschoss an einen Podologen zu vermieten,
- das Obergeschoss kurzfristig an Messegäste zu vermieten.

Von den Herstellungskosten entfallen technisch betrachtet

- 80 % auf das Erdgeschoss,
- 20 % auf das Obergeschoss.

Die Geschossflächen sind jedoch gleich groß.

---

⇨ 2. Eingangsleistung des Bauunternehmers

► Art der Leistung

Der Bauunternehmer errichtet den Anbau unter Verwendung eigener Hauptstoffe.

Es liegt eine Werklieferung nach § 3 Abs. 4 UStG vor.

► Zeitpunkt der Leistung

Die Werklieferung ist mit der Abnahme des fertiggestellten Bauwerks ausgeführt.

Zeitpunkt:

30.10.2025.

► Ort der Leistung

Der Anbau wird fest mit dem Grundstück verbunden.

Ort der unbewegten Werklieferung ist der Belegenheitsort des Grundstücks.

Im Beispiel:

Düsseldorf.

► Steuerbarkeit und Steuerpflicht

Die Werklieferung wird im Inland gegen Entgelt ausgeführt.

Sie ist nach § 1 Abs. 1 Nr. 1 UStG steuerbar und mangels Steuerbefreiung mit 19 % steuerpflichtig.

Umsatzsteuer:

400.000 € × 19 %

= 76.000 €.

---

⇨ 3. Grundvoraussetzungen des Vorsteuerabzugs

Die KG kann die gesetzlich geschuldete Umsatzsteuer grundsätzlich nach

§ 15 Abs. 1 Satz 1 Nr. 1 UStG

als Vorsteuer abziehen.

Voraussetzungen:

- Leistung eines anderen Unternehmers,
- Bezug für das Unternehmen,
- ordnungsgemäße Rechnung,
- gesonderter Umsatzsteuerausweis.

Diese Voraussetzungen sind erfüllt.

Der Anbau wird vollständig für die unternehmerische Vermietungstätigkeit der KG errichtet.

---

⇨ 4. Maßgebliche Verwendungsabsicht

Ist das Gebäude beim Leistungsbezug noch nicht tatsächlich verwendet worden,

richtet sich der Vorsteuerabzug zunächst nach der nachgewiesenen Verwendungsabsicht.

Maßgeblicher Zeitpunkt:

Zeitpunkt des Leistungsbezugs.

Im Beispiel:

30.10.2025.

Die KG muss ihre Verwendungsabsicht durch objektive Anhaltspunkte belegen können.

Mögliche Nachweise:

- Gesellschafterbeschlüsse,
- Mietvertragsentwürfe,
- Makleraufträge,
- Inserate,
- Korrespondenz mit Mietinteressenten,
- Bau- und Nutzungskonzepte.

Eine bloß behauptete, nicht belegte Absicht genügt nicht.

---

⇨ 5. Beabsichtigte Nutzung des Erdgeschosses

► Vermietung an einen Podologen

Die Vermietung von Grundstücken und Gebäudeteilen ist grundsätzlich nach

§ 4 Nr. 12 Satz 1 Buchst. a UStG

steuerfrei.

► Grundsätzliche Option nach § 9 Abs. 1 UStG

Eine Option zur Steuerpflicht setzt zunächst voraus,

dass der Mieter Unternehmer ist und die Räume für sein Unternehmen verwendet.

Der Podologe verwendet die Räume für seine berufliche Tätigkeit.

Damit ist § 9 Abs. 1 UStG grundsätzlich erfüllt.

► Einschränkung nach § 9 Abs. 2 UStG

Bei Grundstücksvermietungen ist die Option jedoch nur zulässig,

wenn der Mieter das Grundstück ausschließlich für Umsätze verwendet,

die den Vorsteuerabzug nicht ausschließen.

Der Podologe erbringt in den Räumen sowohl

- steuerfreie Heilbehandlungen nach § 4 Nr. 14 Buchst. a UStG
- als auch steuerpflichtige kosmetische Leistungen.

Damit nutzt er die Räume nicht ausschließlich für vorsteuerunschädliche Umsätze.

► Ergebnis Erdgeschoss

Die Option zur Steuerpflicht ist nach § 9 Abs. 2 UStG ausgeschlossen.

Die Vermietung des Erdgeschosses wäre steuerfrei.

Die hierfür bezogenen Eingangsleistungen sind damit vorsteuerschädlich.

---

⇨ 6. Beabsichtigte Nutzung des Obergeschosses

► Kurzfristige Unterbringung von Messegästen

Die kurzfristige Beherbergung von Gästen fällt nicht unter die Steuerbefreiung des

§ 4 Nr. 12 Satz 1 Buchst. a UStG.

Sie ist nach § 4 Nr. 12 Satz 2 UStG von der Steuerbefreiung ausgenommen.

► Ergebnis Obergeschoss

Die kurzfristige Vermietung an Messegäste ist steuerpflichtig.

Die hierfür verwendeten Eingangsleistungen sind vorsteuerunschädlich.

---

⇨ 7. Gemischte Verwendung des Gebäudes

Der Anbau soll damit teilweise für

- steuerfreie, vorsteuerschädliche Vermietungsumsätze und
- steuerpflichtige, vorsteuerunschädliche Vermietungsumsätze

verwendet werden.

Folge:

Die Vorsteuer ist nach § 15 Abs. 4 UStG aufzuteilen.

---

⇨ 8. Aufteilungsmaßstab

► Keine direkte Zuordnung der Herstellungskosten

Die gesamten Baukosten betreffen die Errichtung eines einheitlichen Gebäudes.

Eine unmittelbare Einzelzuordnung der Vorsteuerbeträge zu Erdgeschoss und Obergeschoss ist im Beispielsfall nicht möglich.

► Wirtschaftliche Zuordnung

Die Vorsteuer ist nach einem sachgerechten Maßstab aufzuteilen.

Bei Gebäuden ist regelmäßig der Flächenschlüssel sachgerecht,

wenn die unterschiedlich genutzten Räume vergleichbar sind.

Die beiden Geschosse sind gleich groß.

Aufteilung:

- Erdgeschoss: 50 %
- Obergeschoss: 50 %.

► Bedeutung der Kostenverteilung

Obwohl 80 % der Herstellungskosten auf das Erdgeschoss und 20 % auf das Obergeschoss entfallen,

wird die gemeinsame Vorsteuer im vorliegenden Fall nach der Fläche aufgeteilt.

Entscheidend ist der sachgerechte wirtschaftliche Zuordnungsmaßstab,

nicht automatisch die interne Kostenverteilung.

---

⇨ 9. Vorsteuerabzug im Jahr 2025

Gesamte Vorsteuer:

76.000 €.

Vorsteuerunschädliche beabsichtigte Verwendung:

50 %.

Abziehbare Vorsteuer:

76.000 € × 50 %

= 38.000 €.

Nicht abziehbare Vorsteuer:

76.000 € × 50 %

= 38.000 €.

► Ergebnis

Die KG darf im Voranmeldungszeitraum Oktober 2025

38.000 € Vorsteuer

abziehen.

---

⇨ 10. Leerstand nach Fertigstellung

Entgegen der ursprünglichen Absicht findet die KG zunächst keine Mieter.

Der Anbau steht nach Fertigstellung leer.

► Grundsatz

Ein vorübergehender Leerstand ist noch keine tatsächliche Verwendung.

Solange keine tatsächliche Nutzung beginnt,

bleibt für den ursprünglichen Vorsteuerabzug zunächst die nachgewiesene Verwendungsabsicht maßgeblich.

Der Leerstand allein führt daher noch nicht zu einer Vorsteuerberichtigung.

---

⇨ 11. Tatsächliche erstmalige Verwendung ab Juli 2026

Am 01.07.2026 vermietet die KG den gesamten Anbau an eine Spedition.

Monatliche Miete:

5.000 € netto

zuzüglich

950 € Umsatzsteuer.

Die Spedition nutzt das Gebäude für Gütertransporte nach Ostasien.

---

⇨ 12. Umsatzsteuerliche Behandlung der Vermietung an die Spedition

► Sonstige Leistung

Die Vermietung ist eine sonstige Leistung nach § 3 Abs. 9 UStG.

► Teilleistungen

Die monatlichen Vermietungszeiträume stellen regelmäßig Teilleistungen dar.

Die jeweilige Leistung ist mit Ablauf des Monats ausgeführt.

► Leistungsort

Der Ort einer Grundstücksvermietung liegt am Belegenheitsort des Grundstücks.

Im Beispiel:

Düsseldorf.

► Grundsätzliche Steuerbefreiung

Die Vermietung ist grundsätzlich nach

§ 4 Nr. 12 Satz 1 Buchst. a UStG

steuerfrei.

---

⇨ 13. Option zur Steuerpflicht

► Unternehmerischer Mieter

Die Spedition ist Unternehmer und verwendet das Gebäude für ihr Unternehmen.

Die Voraussetzung des § 9 Abs. 1 UStG ist erfüllt.

► Keine Sperre nach § 9 Abs. 2 UStG

Die Spedition erbringt Beförderungsleistungen.

Soweit bestimmte grenzüberschreitende Beförderungsleistungen steuerfrei sind,

können sie unter den Voraussetzungen des § 15 Abs. 3 UStG dennoch zum Vorsteuerabzug berechtigen.

Die Spedition verwendet die Räume daher für Umsätze,

die den Vorsteuerabzug nicht ausschließen.

Die Option ist zulässig.

► Ausübung der Option

Die KG behandelt die Vermietungsumsätze im Mietvertrag unter gesondertem Ausweis der Umsatzsteuer als steuerpflichtig.

Dadurch verzichtet sie wirksam auf die Steuerbefreiung.

► Ergebnis

Die Vermietung ist mit 19 % steuerpflichtig.

Monatliche Bemessungsgrundlage:

5.000 €.

Monatliche Umsatzsteuer:

950 €.

Steuerschuldner:

KG nach § 13a Abs. 1 Nr. 1 UStG.

---

⇨ 14. Berichtigungsobjekt nach § 15a UStG

Der Anbau ist ein Wirtschaftsgut im Sinne des § 15a Abs. 1 UStG.

Bei Grundstücken und Gebäuden beträgt der Berichtigungszeitraum:

10 Jahre.

Der Berichtigungszeitraum beginnt mit der tatsächlichen erstmaligen Verwendung.

Im Beispiel:

01.07.2026.

---

⇨ 15. Änderung der Verhältnisse

► Ursprünglicher Vorsteuerabzug

Aufgrund der Verwendungsabsicht war die KG zunächst nur zu

50 %

zum Vorsteuerabzug berechtigt.

Abgezogene Vorsteuer:

38.000 €.

► Tatsächliche erstmalige Verwendung

Ab dem 01.07.2026 wird das gesamte Gebäude steuerpflichtig vermietet.

Vorsteuerunschädliche tatsächliche Verwendung:

100 %.

► Änderung

Ursprüngliche Beurteilung:

50 % vorsteuerunschädlich.

Tatsächliche erstmalige Verwendung:

100 % vorsteuerunschädlich.

Änderung zugunsten der KG:

50 Prozentpunkte.

Damit ist eine Vorsteuerberichtigung nach § 15a UStG vorzunehmen.

---

⇨ 16. Berechnung der Vorsteuerberichtigung 2026

Gesamte Vorsteuer:

76.000 €.

Berichtigungszeitraum:

10 Jahre.

Tatsächliche Verwendung im Jahr 2026:

6 Monate von Juli bis Dezember.

Änderung der Verhältnisse:

50 %.

Berechnung:

76.000 €

÷ 10 Jahre

× 6/12

× 50 %

= 1.900 €.

► Ergebnis

Die KG erhält für das Kalenderjahr 2026 eine Vorsteuerberichtigung zu ihren Gunsten in Höhe von

1.900 €.

---

⇨ 17. Zeitpunkt der Berichtigung

Der Berichtigungsbetrag für 2026 überschreitet 6.000 € nicht.

Nach § 44 Abs. 3 UStDV wird die Berichtigung deshalb nicht laufend in einer Voranmeldung vorgenommen,

sondern erst im Rahmen der Umsatzsteuer-Jahresfestsetzung 2026.

Berichtigungsbetrag:

1.900 €.

---

⇨ 18. Bagatellgrenzen nach § 44 UStDV

► Vorsteuerbetrag des Berichtigungsobjekts

Die auf das Gebäude entfallende Vorsteuer beträgt

76.000 €.

Damit ist die maßgebliche Mindestgrenze deutlich überschritten.

► Änderung der Verhältnisse

Die Änderung beträgt im anteiligen Kalenderjahr

50 % × 6/12

= 25 Prozentpunkte.

Die Änderung ist damit nicht geringfügig.

Eine Berichtigung wird nicht durch die Bagatellregelungen ausgeschlossen.

---

⇨ Prüfungsschema: Vorsteuerabzug und spätere Berichtigung

► Phase 1: Ursprünglicher Vorsteuerabzug

1. Liegt eine Leistung eines anderen Unternehmers vor?

2. Wird die Leistung für das Unternehmen bezogen?

3. Liegt eine ordnungsgemäße Rechnung vor?

4. Wie soll das Gebäude verwendet werden?

5. Ist die Verwendungsabsicht objektiv nachgewiesen?

6. Steuerpflichtige oder steuerfreie Ausgangsumsätze?

7. Kann nach § 9 UStG optiert werden?

8. Greift die Einschränkung des § 9 Abs. 2 UStG?

9. Gemischte Verwendung?

10. Vorsteuer nach § 15 Abs. 4 UStG aufteilen.

► Phase 2: Tatsächliche Verwendung

1. Wann beginnt die tatsächliche erstmalige Verwendung?

2. Entspricht sie der ursprünglichen Verwendungsabsicht?

3. Liegt ein Berichtigungsobjekt nach § 15a UStG vor?

4. Wie lang ist der Berichtigungszeitraum?

5. Wie viele Monate wurde das Wirtschaftsgut im Kalenderjahr verwendet?

6. Um wie viele Prozentpunkte haben sich die Verhältnisse geändert?

7. Berichtigungsbetrag berechnen.

8. Bagatellgrenzen nach § 44 UStDV prüfen.

9. Voranmeldung oder Jahreserklärung?

---

⇨ Typische Klausurfallen

► Fehler 1: Erst auf den abgeschlossenen Mietvertrag abstellen

Der ursprüngliche Vorsteuerabzug richtet sich bei noch nicht erfolgter Verwendung nach der nachgewiesenen Absicht im Zeitpunkt des Leistungsbezugs.

---

► Fehler 2: Jede Vermietung an einen Unternehmer als optionsfähig behandeln

Die Option nach § 9 Abs. 1 UStG genügt nicht.

Zusätzlich muss bei Grundstücksvermietungen § 9 Abs. 2 UStG erfüllt sein.

Der Mieter muss die Räume grundsätzlich ausschließlich für Umsätze verwenden,

die den Vorsteuerabzug nicht ausschließen.

---

► Fehler 3: Kosmetische und medizinische Nutzung nicht unterscheiden

Heilbehandlungen können steuerfrei sein.

Kosmetische Leistungen ohne therapeutischen Zweck sind grundsätzlich steuerpflichtig.

Die gemischte Nutzung kann die Option nach § 9 Abs. 2 UStG ausschließen.

---

► Fehler 4: Kurzfristige Vermietung als steuerfrei behandeln

Die kurzfristige Beherbergung von Fremden ist von der Grundstückssteuerbefreiung ausgenommen.

Sie ist grundsätzlich steuerpflichtig.

---

► Fehler 5: Herstellungskostenverteilung automatisch als Vorsteuerschlüssel verwenden

Die Aufteilung richtet sich nach der wirtschaftlichen Zuordnung.

Bei gleich großen und vergleichbaren Geschossen kann der Flächenschlüssel sachgerecht sein,

auch wenn die Herstellungskosten unterschiedlich verteilt sind.

---

► Fehler 6: Leerstand als erstmalige Verwendung behandeln

Ein bloßer Leerstand ist grundsätzlich noch keine tatsächliche Verwendung.

---

► Fehler 7: Berichtigungszeitraum ab Fertigstellung beginnen lassen

Der Berichtigungszeitraum beginnt grundsätzlich mit der tatsächlichen erstmaligen Verwendung.

---

► Fehler 8: Vollständige Jahreskorrektur berechnen

Beginnt die Verwendung erst im Laufe des Jahres,

ist der Jahresbetrag zeitanteilig nach Monaten zu berechnen.

---

► Fehler 9: Berichtigung sofort in der Voranmeldung erfassen

Beträgt die Jahresberichtigung höchstens 6.000 €,

erfolgt sie nach § 44 Abs. 3 UStDV grundsätzlich erst in der Jahressteuerfestsetzung.

---

⇨ Merksätze

- Vor der tatsächlichen Nutzung entscheidet die objektiv nachgewiesene Verwendungsabsicht.
- Steuerfreie Vermietung schließt den Vorsteuerabzug grundsätzlich aus.
- Eine Option zur Steuerpflicht setzt bei Grundstücken auch § 9 Abs. 2 UStG voraus.
- Kurzfristige Beherbergung ist grundsätzlich steuerpflichtig.
- Gemischte Gebäudenutzung führt zur Vorsteueraufteilung nach § 15 Abs. 4 UStG.
- Bei Gebäuden ist häufig der Flächenschlüssel sachgerecht.
- Ein leerstehendes Gebäude ist noch nicht tatsächlich verwendet.
- Der Berichtigungszeitraum eines Gebäudes beträgt zehn Jahre.
- Der Zeitraum beginnt mit der tatsächlichen erstmaligen Verwendung.
- Eine verbesserte vorsteuerunschädliche Nutzung führt zu einer Berichtigung zugunsten des Unternehmers.
- Bei unterjähriger Nutzung ist monatsgenau zu rechnen.
- Berichtigungen bis 6.000 € werden grundsätzlich in der Jahressteuerfestsetzung vorgenommen.
`
},
{
  id: "npo-ruecklagen-vermoegensbildung-62-ao",

  title: "Rücklagen und Vermögensbildung nach § 62 AO",

  short:
    "Zulässige Rücklagen und Vermögenszuführungen bei steuerbegünstigten Körperschaften nach § 62 AO.",

  category: "NPO / Gemeinnützigkeit",

  source:
    "Interne Steuerstoff-Wissensdatenbank – § 62 AO Rücklagen und Vermögensbildung",

  keywords:
    "§62 ao|rücklagen|vermögensbildung|gemeinnützigkeit|zweckgebundene rücklage|projektrücklage|freie rücklage|wiederbeschaffungsrücklage|gesellschaftsrechte|vermögensstock|zeitnahe mittelverwendung|nachholung|10 prozent|ein drittel|erbschaft|vermächtnis|sachzuwendung|spendenaufruf|§55 ao",

  references: [
    "§ 55 Abs. 1 Nr. 5 AO",
    "§ 62 AO",
    "AEAO zu § 62 AO"
  ],

  body: `
⇨ Rücklagen und Vermögensbildung (§ 62 AO)

► Grundsatz

Steuerbegünstigte Körperschaften müssen ihre Mittel grundsätzlich zeitnah verwenden (§ 55 Abs.1 Nr.5 AO).

§ 62 AO enthält die gesetzlichen Ausnahmen.

Danach dürfen Mittel

- in bestimmten Rücklagen angesammelt oder
- dauerhaft dem Vermögen zugeführt werden.

---

⇨ I. Zulässige Rücklagen (§ 62 Abs.1 AO)

Es existieren vier gesetzliche Rücklagenarten.

---

► 1. Zweckgebundene Rücklage (§ 62 Abs.1 Nr.1 AO)

Zulässig, soweit erforderlich, um die steuerbegünstigten satzungsmäßigen Zwecke nachhaltig zu erfüllen.

Voraussetzungen:

- konkreter Zweck
- nachvollziehbare Planung
- Finanzierungsbedarf
- Dokumentation
- Erforderlichkeit

Typische Beispiele:

- Neubau Vereinsheim
- Dachsanierung
- Forschungsprojekt
- größere Investition
- mehrjährige Bildungsmaßnahme

Merksatz:

Keine konkrete Planung → keine zweckgebundene Rücklage.

---

► 2. Wiederbeschaffungsrücklage (§ 62 Abs.1 Nr.2 AO)

Dient der späteren Ersatzbeschaffung notwendiger Wirtschaftsgüter.

Beispiele:

- Vereinsbus
- medizinisches Gerät
- Maschinen
- EDV
- Ausstattung

Grundsatz:

Die jährliche Zuführung richtet sich grundsätzlich nach der regulären AfA des zu ersetzenden Wirtschaftsgutes.

Eine höhere Zuführung ist zulässig, wenn sie sachlich nachgewiesen werden kann.

---

► 3. Freie Rücklage (§ 62 Abs.1 Nr.3 AO)

Maximal zulässig:

• 1/3 des Überschusses aus der Vermögensverwaltung

UND

• zusätzlich höchstens 10 % der sonstigen zeitnah zu verwendenden Mittel.

Nicht ausgeschöpfte Beträge dürfen innerhalb der folgenden zwei Jahre nachgeholt werden.

Merksatz:

1/3 Vermögensverwaltung + 10 % übrige Mittel.

---

► 4. Rücklage zum Erwerb von Gesellschaftsrechten (§ 62 Abs.1 Nr.4 AO)

Zulässig zum Erhalt einer bestehenden prozentualen Beteiligung an Kapitalgesellschaften.

Die hierfür gebildete Rücklage vermindert den Höchstbetrag der freien Rücklage.

---

⇨ II. Auflösung der Rücklagen (§ 62 Abs.2 AO)

Die Rücklagenbildung muss innerhalb der Frist der zeitnahen Mittelverwendung erfolgen.

Rücklagen nach

- Nr.1
- Nr.2
- Nr.4

sind unverzüglich aufzulösen, sobald der Rücklagenzweck entfällt.

Die dadurch frei werdenden Mittel sind anschließend innerhalb der gesetzlichen Fristen zeitnah zu verwenden.

---

⇨ III. Vermögenszuführungen (§ 62 Abs.3 AO)

Folgende Mittel unterliegen nicht der Pflicht zur zeitnahen Mittelverwendung und dürfen unmittelbar dem Vermögen zugeführt werden.

► 1.

Zuwendungen von Todes wegen

(Vermächtnisse, Erbschaften),

soweit der Erblasser keine Verwendung für den laufenden Aufwand vorgeschrieben hat.

---

► 2.

Zuwendungen,

bei denen der Zuwendende ausdrücklich bestimmt,

dass sie

- zur Vermögensausstattung oder
- zur Vermögenserhöhung

bestimmt sind.

---

► 3.

Spenden aufgrund eines Spendenaufrufs,

wenn bereits aus dem Spendenaufruf eindeutig hervorgeht,

dass die Mittel zur Vermögensbildung bestimmt sind.

---

► 4.

Sachzuwendungen,

die ihrer Natur nach dauerhaft zum Vermögen gehören.

Beispiele:

- Grundstücke
- Gebäude
- Kunstwerke
- langfristig bestimmtes Anlagevermögen

---

⇨ Prüfungsschema

1. Liegt grundsätzlich zeitnah zu verwendendes Vermögen vor?

↓

2. Greift § 62 AO?

↓

3. Welche Rücklagenart?

- Zweckgebunden
- Wiederbeschaffung
- Freie Rücklage
- Beteiligungsrücklage

↓

4. Voraussetzungen erfüllt?

↓

5. Höhe der Rücklage zulässig?

↓

6. Dokumentation vorhanden?

↓

7. Spätere Auflösung erforderlich?

---

⇨ Klausurhinweise

Immer prüfen:

✓ konkrete Planung vorhanden?

✓ Erforderlichkeit nachgewiesen?

✓ Höchstgrenzen der freien Rücklage eingehalten?

✓ Nachholung innerhalb von zwei Jahren möglich?

✓ Zweck später weggefallen?

✓ Auflösung erforderlich?

✓ Vermögenszuführung statt Rücklage möglich?

---

⇨ Merksätze

• Rücklagen sind die Ausnahme vom Grundsatz der zeitnahen Mittelverwendung.

• Ohne konkrete Planung keine zweckgebundene Rücklage.

• Wiederbeschaffungsrücklage orientiert sich grundsätzlich an der AfA.

• Freie Rücklage:
1/3 Vermögensverwaltung + 10 % der übrigen zeitnah zu verwendenden Mittel.

• Nicht ausgeschöpfte freie Rücklage kann zwei Jahre nachgeholt werden.

• Erbschaften, Vermögensspenden und bestimmte Sachzuwendungen dürfen unmittelbar dem Vermögen zugeführt werden.

• Fällt der Rücklagenzweck weg, ist die Rücklage unverzüglich aufzulösen.
`
},
{
  id: "ao-feststellungsverjaehrung-181-169-170-171",

  title: "Feststellungsverjährung bei gesonderten Feststellungen (§§ 181, 169–171 AO)",

  short:
    "Prüfung der Feststellungsverjährung, Beginn, Ablaufhemmung, Außenprüfung und Erlass von Feststellungs- oder Aufhebungsbescheiden.",

  category: "Verfahrensrecht",

  source:
    "Steuer-Repetitor Verfahrensrecht – Feststellungsverjährung",

  keywords:
    "feststellungsverjährung|§181 ao|§169 ao|§170 ao|§171 ao|außenprüfung|ablaufhemmung|feststellungsbescheid|aufhebungsbescheid|grundlagenbescheid|bindungswirkung",

  references: [
    "§ 169 AO",
    "§ 170 AO",
    "§ 171 AO",
    "§ 181 AO",
    "§ 182 AO",
    "§ 124 AO",
    "§ 125 AO",
    "§ 175 AO",
    "AEAO zu §§ 169–171 AO"
  ],

  body: `

⇨ Feststellungsverjährung

► Zweck

Die gesonderte Feststellung von Besteuerungsgrundlagen unterliegt eigenen Verjährungsvorschriften.

Sie bestimmen,

- ob noch ein Feststellungsbescheid erlassen werden darf,
- ob ein Aufhebungsbescheid zulässig ist,
- ob Grundlagenbescheide noch Bindungswirkung entfalten.

---

⇨ 1. Rechtsgrundlage

Für die gesonderte Feststellung gelten

§ 181 AO

i.V.m.

§§ 169 bis 171 AO.

---

⇨ 2. Regelmäßige Feststellungsfrist

Grundsätzlich beträgt die Feststellungsfrist

vier Jahre.

Sie beginnt grundsätzlich

mit Ablauf des Kalenderjahres,

in dem die Feststellungserklärung eingereicht wurde,

spätestens jedoch nach den gesetzlichen Höchstgrenzen des § 170 AO.

---

⇨ 3. Ablaufhemmung (§ 171 AO)

Die Feststellungsfrist kann sich verlängern.

Wichtige Fälle:

- Vorläufige Feststellung
- Außenprüfung
- Rechtsbehelfsverfahren
- sonstige gesetzliche Ablaufhemmungen

---

⇨ 4. Außenprüfung

Eine Außenprüfung hemmt den Ablauf der Feststellungsfrist,

wenn

- die Prüfung vor Ablauf der Feststellungsfrist begonnen hat oder
- rechtzeitig hinausgeschoben wurde.

Hat die Feststellungsfrist bereits vor Prüfungsbeginn geendet,

tritt keine Ablaufhemmung mehr ein.

---

⇨ 5. Aufhebungsbescheid nach Eintritt der Feststellungsverjährung

Ein Aufhebungsbescheid,

der erst nach Ablauf der Feststellungsfrist ergeht,

ist grundsätzlich wirksam.

Er ist nicht nichtig,

sondern lediglich anfechtbar.

Wird kein Rechtsbehelf eingelegt,

tritt Bestandskraft ein.

---

⇨ 6. Bindungswirkung

Feststellungsbescheide sind Grundlagenbescheide.

Sie binden die Folgebescheide,

insbesondere Einkommensteuerbescheide,

solange sie wirksam sind.

Dies gilt ebenso für wirksame Aufhebungsbescheide.

---

⇨ 7. Hinweis nach § 181 Abs. 5 AO

Eine Feststellung nach Ablauf der Feststellungsfrist

ist nur zulässig,

wenn die Voraussetzungen des § 181 Abs. 5 AO vorliegen.

Hierauf muss ausdrücklich hingewiesen werden.

Fehlt dieser Hinweis,

ist der Feststellungsbescheid rechtswidrig.

---

⇨ Prüfungsschema

1. Gesonderte Feststellung?
2. Feststellungsfrist bestimmen.
3. Beginn der Frist (§ 170 AO).
4. Ende der Frist (§ 169 AO).
5. Ablaufhemmung (§ 171 AO)?
6. Außenprüfung rechtzeitig begonnen?
7. Feststellungsbescheid noch zulässig?
8. Hinweis nach § 181 Abs. 5 AO erforderlich?
9. Auswirkungen auf Folgebescheide.

---

⇨ Klausurfallen

► Fehler 1

Festsetzungsverjährung und Feststellungsverjährung verwechseln.

---

► Fehler 2

Außenprüfung hemmt immer.

Falsch.

Sie muss vor Fristablauf begonnen haben.

---

► Fehler 3

Nach Eintritt der Verjährung sei jeder Bescheid nichtig.

Falsch.

Regelmäßig ist er lediglich anfechtbar.

---

► Fehler 4

Bindungswirkung endet automatisch mit Eintritt der Verjährung.

Falsch.

Bestandskräftige Grundlagenbescheide entfalten weiterhin Bindungswirkung.

---

► Fehler 5

§ 181 Abs. 5 AO übersehen.

Bei einer Feststellung nach Fristablauf ist der Hinweis zwingend.

---

⇨ Merksätze

- Feststellungsverjährung richtet sich nach § 181 AO.
- §§ 169–171 AO gelten entsprechend.
- Außenprüfung hemmt nur rechtzeitig.
- Aufhebungsbescheide können trotz Verjährung wirksam sein.
- Grundlagenbescheide entfalten Bindungswirkung.
- § 181 Abs. 5 AO ist eine typische Klausurfalle.

`

},
{
  id: "ao-fristsetzung-364b-wiedereinsetzung-einspruch",

  title: "Fristsetzung nach § 364b AO, Einspruch und Wiedereinsetzung",

  short:
    "Prüfung der Rechtmäßigkeit einer Fristsetzung nach § 364b AO sowie der Auswirkungen auf Einspruchsverfahren, Präklusion, Wiedereinsetzung und schlichte Änderung.",

  category: "Verfahrensrecht",

  source:
    "Steuer-Repetitor Verfahrensrecht – Übungsklausur August 2025",

  keywords:
    "§364b ao|fristsetzung|präklusion|einspruch|wiedereinsetzung|§110 ao|schlichte änderung|§172 ao|schätzung|einspruchsentscheidung|verwaltungsakt|verfahrensrecht",

  references: [
    "§ 118 AO",
    "§ 122 AO",
    "§ 124 AO",
    "§ 125 AO",
    "§ 162 AO",
    "§ 172 AO",
    "§ 347 AO",
    "§ 355 AO",
    "§ 357 AO",
    "§ 358 AO",
    "§ 364b AO",
    "§ 110 AO",
    "AEAO zu § 364b AO"
  ],

  body: `

⇨ Fristsetzung nach § 364b AO

► Zweck

§ 364b AO ermöglicht dem Finanzamt, den Steuerpflichtigen aufzufordern,

- Steuererklärungen,
- Tatsachen,
- Beweismittel oder
- sonstige Unterlagen

innerhalb einer bestimmten Frist vorzulegen.

Nach Ablauf dieser Frist können verspätete Angaben im Einspruchsverfahren ausgeschlossen werden.

---

⇨ Prüfung der Fristsetzung

► 1. Liegt ein Verwaltungsakt vor?

Die Fristsetzung ist ein Verwaltungsakt (§ 118 AO), wenn

- eine verbindliche Frist gesetzt wird,
- Rechtsfolgen angeordnet werden,
- insbesondere eine Präklusion nach § 364b AO eintreten kann.

---

► 2. Einspruch gegen die Fristsetzung

Zu prüfen sind:

- Statthaftigkeit (§ 347 AO)
- Frist (§ 355 AO)
- Form (§ 357 AO)
- Beschwer (§ 350 AO)
- Rechtsschutzbedürfnis

⇶  Besonderheit

Nach der BFH-Rechtsprechung fehlt regelmäßig das Rechtsschutzbedürfnis.

Die Rechtmäßigkeit der Fristsetzung wird grundsätzlich erst

- im Einspruch gegen den Steuerbescheid oder
- im Klageverfahren

überprüft.

Ein isolierter Einspruch gegen die Fristsetzung bleibt daher regelmäßig erfolglos.

---

⇨ Voraussetzungen des § 364b AO

Das Finanzamt muss

- ein Einspruchsverfahren führen,
- die Frist schriftlich setzen,
- angemessene Frist gewähren,
- über die Rechtsfolgen belehren,
- Ermessen ordnungsgemäß ausüben.

---

⇨ Rechtsfolge

Werden Tatsachen oder Beweismittel verspätet eingereicht,

können diese unberücksichtigt bleiben.

Dies betrifft insbesondere

- Steuererklärungen,
- Gewinnermittlungen,
- Belege.

---

⇨ Wiedereinsetzung (§ 110 AO)

► Voraussetzungen

Es muss

- eine gesetzliche Frist,
- Fristversäumnis,
- fehlendes Verschulden,
- fristgerechter Antrag

vorliegen.

⇶  Kein fehlendes Verschulden

Nicht ausreichend sind insbesondere

- Urlaub,
- Arbeitsüberlastung,
- Organisationsmängel,
- bloßes Vergessen.

Diese Umstände stellen regelmäßig einfache Fahrlässigkeit dar.

---

⇨ Auswirkungen im Einspruchsverfahren

Gehen Steuererklärung oder Beweismittel erst nach Ablauf der Frist ein,

dürfen sie nach § 364b AO grundsätzlich ausgeschlossen werden.

Das Finanzamt entscheidet hierüber nach pflichtgemäßem Ermessen.

---

⇨ Schlichte Änderung (§ 172 AO)

Auch durch einen Antrag auf schlichte Änderung können Tatsachen,

die wegen § 364b AO präkludiert sind,

nicht wieder berücksichtigt werden.

Die Präklusionswirkung bleibt bestehen.

---

⇨ Schätzung (§ 162 AO)

Wird keine Steuererklärung abgegeben,

ist das Finanzamt zur Schätzung berechtigt.

Die Schätzung muss

- schlüssig,
- wirtschaftlich möglich,
- nachvollziehbar

sein.

---

⇨ Prüfungsschema

1. Einspruchsverfahren anhängig?
2. Fristsetzung nach § 364b AO?
3. Verwaltungsakt?
4. Formelle Rechtmäßigkeit
5. Materielle Rechtmäßigkeit
6. Präklusionswirkung
7. Wiedereinsetzung prüfen
8. Schätzung rechtmäßig?
9. Schlichte Änderung möglich?

---

⇨ Klausurfallen

► Fehler 1

Annahme, dass gegen jede Fristsetzung erfolgreich Einspruch eingelegt werden kann.

Richtig:

Regelmäßig fehlt das Rechtsschutzbedürfnis.

---

► Fehler 2

Urlaub genügt für Wiedereinsetzung.

Falsch.

Urlaub schließt eigenes Verschulden regelmäßig nicht aus.

---

► Fehler 3

Verspätete Steuererklärung muss immer berücksichtigt werden.

Falsch.

§ 364b AO erlaubt den Ausschluss.

---

► Fehler 4

Schlichte Änderung beseitigt die Präklusion.

Falsch.

§ 364b AO wirkt fort.

---

⇨ Merksätze

- § 364b AO dient der Verfahrensbeschleunigung.
- Präklusion setzt eine wirksame Fristsetzung voraus.
- Wiedereinsetzung nur ohne Verschulden.
- Urlaub genügt regelmäßig nicht.
- Verspätete Unterlagen können ausgeschlossen werden.
- Auch die schlichte Änderung hebt die Präklusionswirkung nicht auf.

`
},
{
  id: "personengesellschaft-gewinnverteilung-sonderverguetungen-sonderbereich",
  title:
    "Personengesellschaften: Gewinnverteilung, Sondervergütungen und Sonderbereich",
  short:
    "Ermittlung der steuerlichen Gewinnanteile bei Mitunternehmerschaften: Vorabgewinn, Restgewinn, Sondervergütungen, Sonderbetriebseinnahmen und Sonderbetriebsausgaben.",
  category: "Rechnungswesen",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Einkünfte aus gewerblichen Personengesellschaften",
  keywords:
    "personengesellschaft|mitunternehmerschaft|gewinnverteilung|sondervergütung|sonderbetriebseinnahmen|sonderbetriebsausgaben|sonderbereich|vorabgewinn|mehrkapitalverzinsung|geschäftsführervergütung|gesellschafterdarlehen|grundstücksvermietung|beraterhonorar|§ 15 abs. 1 nr. 2 estg|kg|ohg|gbr|steuerlicher gewinnanteil|gesamthandsgewinn",
  references: [
    "§ 15 Abs. 1 Satz 1 Nr. 2 EStG",
    "§ 4 Abs. 4 EStG",
    "§ 4 Abs. 5 EStG",
    "§ 5 EStG"
  ],
  body: `
⇨ Gewinnermittlung bei gewerblichen Personengesellschaften

► 1. Grundprinzip

Bei einer gewerblichen Personengesellschaft wird der steuerliche Gewinn in mehreren Stufen ermittelt.

Zum Gesamtgewinn der Mitunternehmerschaft gehören:

1. der Gewinn der Gesamthand,
2. die Gewinnanteile der Gesellschafter,
3. Sondervergütungen,
4. Sonderbetriebseinnahmen,
5. abzüglich Sonderbetriebsausgaben.

Rechtsgrundlage:

§ 15 Abs. 1 Satz 1 Nr. 2 EStG.

---

⇨ 2. Zwei Ebenen der Gewinnermittlung

► Ebene 1: Gesamthandsbereich

Hier wird der Gewinn der Personengesellschaft ermittelt.

Typische Bestandteile:

- laufender Unternehmensgewinn,
- außerbilanzielle Korrekturen,
- gesellschaftsvertragliche Gewinnverteilung,
- Vorabgewinne,
- Restgewinnverteilung.

► Ebene 2: Sonderbereich der Gesellschafter

Hier werden Leistungen zwischen einem Gesellschafter und seiner Personengesellschaft erfasst.

Typische Sondervergütungen:

- Mieten für ein Grundstück,
- Darlehenszinsen,
- Tätigkeitsvergütungen,
- Beraterhonorare,
- Geschäftsführungsvergütungen.

Dazugehörige Aufwendungen des Gesellschafters sind Sonderbetriebsausgaben.

---

⇨ 3. Gesellschaftsrechtliche Gewinnverteilung

Die Gewinnverteilung richtet sich zunächst nach dem Gesellschaftsvertrag.

Typischer Aufbau:

1. Ausgangsgewinn der Gesellschaft,
2. Vorabgewinn oder Mehrkapitalverzinsung,
3. gegebenenfalls weitere Vorwegvergütungen,
4. Verteilung des verbleibenden Restgewinns.

► Formel

Gesellschaftsgewinn

− Vorabgewinne

− weitere gesellschaftsvertragliche Vorwegvergütungen

= Restgewinn.

Der Restgewinn wird anschließend nach dem vereinbarten Schlüssel verteilt.

---

⇨ 4. Vorabgewinn und Sondervergütung unterscheiden

Diese Unterscheidung ist besonders wichtig.

► Vorabgewinn

Ein Vorabgewinn ist Bestandteil der gesellschaftsrechtlichen Gewinnverteilung.

Beispiele:

- Mehrkapitalverzinsung,
- Gewinnvorab für Geschäftsführung,
- garantierter Gewinnanteil laut Gesellschaftsvertrag.

Der Vorabgewinn wird innerhalb der Gewinnverteilung berücksichtigt.

► Sondervergütung

Eine Sondervergütung beruht auf einem schuldrechtlichen Leistungsaustausch zwischen Gesellschafter und Gesellschaft.

Beispiele:

- Miete,
- Darlehenszinsen,
- Beraterhonorar,
- Tätigkeitsvergütung außerhalb der gesellschaftsrechtlichen Gewinnverteilung.

Die Sondervergütung wird im Sonderbereich des Gesellschafters erfasst.

► Merksatz

Gesellschaftsvertragliche Gewinnverteilung

= Vorabgewinn.

Schuldrechtlicher Vertrag mit dem Gesellschafter

= Sondervergütung.

---

⇨ 5. Sonderbetriebseinnahmen

Sonderbetriebseinnahmen sind Einnahmen, die ein Gesellschafter von seiner Personengesellschaft erhält.

Typische Fälle:

- Mietzahlungen der Gesellschaft an den Gesellschafter,
- Zinsen für ein Gesellschafterdarlehen,
- Beraterhonorare,
- Geschäftsführungsvergütungen,
- Lizenzzahlungen.

Diese Einnahmen gehören nicht zu einer anderen Einkunftsart.

Sie werden als gewerbliche Einkünfte nach

§ 15 Abs. 1 Satz 1 Nr. 2 EStG

erfasst.

---

⇨ 6. Sonderbetriebsausgaben

Aufwendungen des Gesellschafters, die mit seinen Sonderbetriebseinnahmen oder seiner Beteiligung zusammenhängen, sind Sonderbetriebsausgaben.

Beispiele:

- Reparaturen am vermieteten Grundstück,
- Abschreibungen auf Sonderbetriebsvermögen,
- Finanzierungskosten,
- Beratungskosten,
- laufende Grundstückskosten.

► Formel

Sonderbetriebseinnahmen

− Sonderbetriebsausgaben

= Ergebnis des Sonderbereichs.

---

⇨ 7. Außerbilanzielle Korrekturen

Der handelsrechtliche oder steuerbilanzielle Gewinn kann steuerlich zu korrigieren sein.

► Nicht abzugsfähige Betriebsausgaben

Nicht abzugsfähige Betriebsausgaben nach § 4 Abs. 5 EStG werden hinzugerechnet.

Beispiel:

6.000 € nicht abzugsfähige Betriebsausgaben.

► Steuerfreie Erträge

Steuerfreie Erträge, die im bilanziellen Gewinn enthalten sind, werden abgezogen.

Beispiel:

15.000 € steuerfreie Einnahmen.

► Verteilung

Die Korrekturen werden regelmäßig entsprechend dem allgemeinen Gewinnverteilungsschlüssel auf die Gesellschafter verteilt,

soweit keine besondere individuelle Zuordnung erforderlich ist.

---

⇨ 8. Allgemeines Berechnungsschema

► Schritt 1: Ausgangsgewinn

Handelsrechtlicher beziehungsweise steuerbilanzieller Gewinn der Gesellschaft.

► Schritt 2: Gesellschaftsvertragliche Vorabgewinne

Zum Beispiel:

- Mehrkapitalverzinsung,
- Tätigkeitsvorab,
- Geschäftsführungsvorab.

► Schritt 3: Restgewinn

Ausgangsgewinn

− Vorabgewinne

= Restgewinn.

► Schritt 4: Restgewinn verteilen

Verteilung beispielsweise

- nach Köpfen,
- nach Beteiligungsquote,
- oder nach einem besonderen vertraglichen Schlüssel.

► Schritt 5: Bilanzielle Gewinnanteile

Vorabgewinn

+ Anteil am Restgewinn

= bilanzieller Gewinnanteil.

► Schritt 6: Steuerliche Korrekturen

- nicht abzugsfähige Betriebsausgaben hinzurechnen,
- steuerfreie Erträge abziehen.

► Schritt 7: Sonderbereiche

Je Gesellschafter:

Sonderbetriebseinnahmen

− Sonderbetriebsausgaben.

► Schritt 8: Steuerlicher Gewinnanteil

Korrigierter Gewinnanteil

+ Ergebnis des Sonderbereichs

= steuerlicher Gewinnanteil.

---

⇨ 9. Beispiel 1 – KG mit drei Gesellschaftern

► Sachverhalt

Die KG erzielt einen Gewinn von

420.000 €.

Der Restgewinn wird nach Köpfen verteilt.

Mehrkapitalverzinsung:

- A: 12.000 €
- B: 16.000 €
- C: 8.000 €

Gesamter Vorabgewinn:

36.000 €.

Weitere Sachverhalte:

- A vermietet der KG ein Grundstück für 48.000 €.
- A entstehen hierfür Aufwendungen von 15.000 €.
- B erhält ein Beraterhonorar von 80.000 €.
- C erhält Darlehenszinsen von 12.000 €.
- Nicht abzugsfähige Betriebsausgaben: 6.000 €.
- Steuerfreie Erträge: 15.000 €.

---

► Schritt 1: Restgewinn

Gewinn:

420.000 €

abzüglich Vorabgewinne:

36.000 €

Restgewinn:

384.000 €.

Verteilung nach Köpfen:

384.000 € ÷ 3

= 128.000 € je Gesellschafter.

---

► Schritt 2: Bilanzielle Gewinnanteile

⇶  A

128.000 €

+ 12.000 €

= 140.000 €.

⇶  B

128.000 €

+ 16.000 €

= 144.000 €.

⇶  C

128.000 €

+ 8.000 €

= 136.000 €.

Gesamt:

420.000 €.

---

► Schritt 3: Steuerliche Korrekturen

Nicht abzugsfähige Betriebsausgaben:

6.000 €.

Bei Verteilung nach Köpfen:

2.000 € je Gesellschafter.

Steuerfreie Erträge:

15.000 €.

Bei Verteilung nach Köpfen:

5.000 € je Gesellschafter.

⇶  Korrigierte Gewinnanteile

A:

140.000 €

+ 2.000 €

− 5.000 €

= 137.000 €.

B:

144.000 €

+ 2.000 €

− 5.000 €

= 141.000 €.

C:

136.000 €

+ 2.000 €

− 5.000 €

= 133.000 €.

---

► Schritt 4: Sonderbereiche

⇶  Sonderbereich A

Mieteinnahmen:

48.000 €.

Sonderbetriebsausgaben:

15.000 €.

Ergebnis:

33.000 €.

⇶  Sonderbereich B

Beraterhonorar:

80.000 €.

⇶  Sonderbereich C

Darlehenszinsen:

12.000 €.

---

► Schritt 5: Steuerliche Gewinnanteile

⇶  A

137.000 €

+ 33.000 €

= 170.000 €.

⇶  B

141.000 €

+ 80.000 €

= 221.000 €.

⇶  C

133.000 €

+ 12.000 €

= 145.000 €.

Gesamtgewinn der Mitunternehmerschaft:

536.000 €.

---

⇨ 10. Beispiel 2 – OHG mit Geschäftsführungsvorab

► Sachverhalt

Gewinn der OHG:

800.000 €.

Gewinnverteilung:

- A: 80 %
- B: 20 %.

Mehrkapitalverzinsung:

- A: 16.000 €
- B: 4.000 €.

A erhält zusätzlich gesellschaftsvertraglich vorweg eine Vergütung für seine Geschäftsführertätigkeit von

20.000 € monatlich.

Jahresbetrag:

240.000 €.

Weitere Sachverhalte:

- A erhält Darlehenszinsen von 10.000 €.
- B erhält Grundstücksmiete von 12.000 €.
- B entstehen Grundstücksaufwendungen von 15.000 €.

---

► Schritt 1: Vorabgewinne

Mehrkapitalverzinsung:

20.000 €.

Geschäftsführungsvorab A:

240.000 €.

Gesamte Vorabgewinne:

260.000 €.

---

► Schritt 2: Restgewinn

800.000 €

− 260.000 €

= 540.000 €.

Verteilung:

⇶  A: 80 %

540.000 € × 80 %

= 432.000 €.

⇶  B: 20 %

540.000 € × 20 %

= 108.000 €.

---

► Schritt 3: Bilanzielle Gewinnanteile

⇶  A

Mehrkapitalverzinsung:

16.000 €.

Geschäftsführungsvorab:

240.000 €.

Restgewinn:

432.000 €.

Gesamt:

688.000 €.

⇶  B

Mehrkapitalverzinsung:

4.000 €.

Restgewinn:

108.000 €.

Gesamt:

112.000 €.

---

► Schritt 4: Sonderbereiche

⇶  A

Darlehenszinsen:

10.000 €.

⇶  B

Mieteinnahmen:

12.000 €.

abzüglich Sonderbetriebsausgaben:

15.000 €.

Ergebnis:

−3.000 €.

---

► Schritt 5: Steuerliche Gewinnanteile

⇶  A

688.000 €

+ 10.000 €

= 698.000 €.

⇶  B

112.000 €

− 3.000 €

= 109.000 €.

Gesamt:

807.000 €.

---

⇨ 11. Besonderheit der Geschäftsführungsvergütung

Die Vergütung für A ist ausdrücklich als gesellschaftsvertragliche Vorweggewinnverteilung vereinbart.

Deshalb wird sie innerhalb der bilanziellen Gewinnverteilung berücksichtigt.

Sie ist in diesem Fall kein zusätzlicher Sonderbereich.

► Klausurhinweis

Nicht jede Geschäftsführungsvergütung ist automatisch gleich zu behandeln.

Es ist zu prüfen:

- gesellschaftsvertraglicher Gewinnvorab oder
- schuldrechtliche Tätigkeitsvergütung?

Die Formulierung des Sachverhalts ist entscheidend.

---

⇨ 12. Beispiel 3 – GbR und erfolgsneutral gebuchtes Beraterhonorar

► Sachverhalt

Die GbR weist zunächst einen Gewinn von

350.000 €

aus.

Der Restgewinn wird nach Köpfen verteilt.

Mehrkapitalverzinsung:

- A: 3.000 €
- B: 7.000 €
- C: 5.000 €.

A vermietet der GbR ein Grundstück:

- Miete: 20.000 €
- Aufwendungen: 35.000 €.

B erhält ein Beraterhonorar:

80.000 €.

Das Beraterhonorar wurde von der GbR nicht als Aufwand,

sondern erfolgsneutral als Entnahme des B gebucht.

C erhält Darlehenszinsen:

20.000 €.

---

⇨ 13. Erfolgsneutrale Buchung des Beraterhonorars

Obwohl das Beraterhonorar nicht als Aufwand gebucht wurde,

muss es für die richtige gesellschaftsrechtliche Gewinnverteilung berücksichtigt werden.

Der ausgewiesene Gewinn von 350.000 € enthält wirtschaftlich noch den Betrag von 80.000 €,

der B als Vergütung zugerechnet wird.

Für die Verteilung des verbleibenden Gewinns ist daher zunächst zu rechnen:

350.000 €

− 80.000 €

= 270.000 €.

Das Honorar wird anschließend im Sonderbereich des B erfasst.

Dadurch wird eine doppelte Zurechnung vermieden.

---

⇨ 14. Gewinnverteilung Beispiel 3

► Vorabgewinne

Gesamte Mehrkapitalverzinsung:

3.000 €

+ 7.000 €

+ 5.000 €

= 15.000 €.

► Restgewinn

270.000 €

− 15.000 €

= 255.000 €.

Verteilung nach Köpfen:

255.000 € ÷ 3

= 85.000 € je Gesellschafter.

---

► Bilanzielle Gewinnanteile

⇶  A

85.000 €

+ 3.000 €

= 88.000 €.

⇶  B

85.000 €

+ 7.000 €

= 92.000 €.

⇶  C

85.000 €

+ 5.000 €

= 90.000 €.

Gesamt:

270.000 €.

---

⇨ 15. Sonderbereiche Beispiel 3

► Sonderbereich A

Mieteinnahmen:

20.000 €.

Sonderbetriebsausgaben:

35.000 €.

Ergebnis:

−15.000 €.

► Sonderbereich B

Beraterhonorar:

80.000 €.

► Sonderbereich C

Darlehenszinsen:

20.000 €.

---

⇨ 16. Steuerliche Gewinnanteile Beispiel 3

⇶  A

88.000 €

− 15.000 €

= 73.000 €.

⇶  B

92.000 €

+ 80.000 €

= 172.000 €.

⇶  C

90.000 €

+ 20.000 €

= 110.000 €.

Gesamt:

355.000 €.

---

⇨ 17. Warum beträgt der steuerliche Gesamtgewinn 355.000 €?

Ausgangsgewinn:

350.000 €.

Zusätzliche steuerliche Auswirkung der Sonderbereiche:

- Vermietung A: 20.000 € Einnahmen waren bei der Gesellschaft als Aufwand erfasst; nach Abzug von 35.000 € Sonderbetriebsausgaben ergibt sich insgesamt eine Mehrminderung von 15.000 €.
- Darlehenszinsen C: 20.000 € wurden bei der Gesellschaft als Aufwand erfasst und im Sonderbereich wieder zugerechnet.
- Beraterhonorar B: 80.000 € wurde erfolgsneutral gebucht und darf deshalb nicht zusätzlich den Gesamtgewinn erhöhen, sondern wird nur von der allgemeinen Verteilungsmasse in den Sonderbereich des B verschoben.

Gesamtwirkung:

350.000 €

− 15.000 €

+ 20.000 €

= 355.000 €.

---

⇨ 18. Typische Buchungs- und Prüfungslogik

► Zahlung an Gesellschafter wurde als Aufwand gebucht

Beispiele:

- Miete,
- Zinsen,
- Beraterhonorar.

Folge:

Der Gesamthandsgewinn ist bereits gemindert.

Die Zahlung wird im Sonderbereich des Gesellschafters wieder als Sonderbetriebseinnahme erfasst.

► Zahlung wurde erfolgsneutral als Entnahme gebucht

Folge:

Der Gesamthandsgewinn wurde nicht gemindert.

Damit der Betrag nicht doppelt verteilt wird,

ist er vor der allgemeinen Gewinnverteilung aus der Verteilungsmasse herauszurechnen

und im Sonderbereich des betreffenden Gesellschafters zu erfassen.

---

⇨ Prüfungsschema

1. Welche Rechtsform liegt vor?

2. Wie hoch ist der Ausgangsgewinn?

3. Wurde eine Zahlung als Aufwand oder erfolgsneutral gebucht?

4. Welche Gewinnverteilung enthält der Gesellschaftsvertrag?

5. Gibt es Mehrkapitalverzinsungen?

6. Gibt es gesellschaftsvertragliche Vorabgewinne?

7. Restgewinn ermitteln.

8. Restgewinn nach dem vereinbarten Schlüssel verteilen.

9. Nicht abzugsfähige Betriebsausgaben hinzurechnen.

10. Steuerfreie Erträge abziehen.

11. Sondervergütungen je Gesellschafter bestimmen.

12. Sonderbetriebsausgaben abziehen.

13. Steuerlichen Gewinnanteil jedes Gesellschafters berechnen.

14. Kontrollsumme des Gesamtgewinns bilden.

---

⇨ Typische Klausurfallen

► Fehler 1: Sondervergütung als andere Einkunftsart behandeln

Miete, Zinsen oder Tätigkeitsvergütungen eines Mitunternehmers gehören grundsätzlich zu den gewerblichen Einkünften nach § 15 Abs. 1 Satz 1 Nr. 2 EStG.

---

► Fehler 2: Vorabgewinn und Sondervergütung verwechseln

Ein gesellschaftsvertraglicher Gewinnvorab wird innerhalb der Gewinnverteilung berücksichtigt.

Eine schuldrechtliche Vergütung wird im Sonderbereich erfasst.

---

► Fehler 3: Sonderbetriebsausgaben vergessen

Von den Sonderbetriebseinnahmen sind die dazugehörigen Aufwendungen abzuziehen.

Beispiel:

48.000 € Miete

− 15.000 € Aufwendungen

= 33.000 € Sonderbereich.

---

► Fehler 4: Nicht abzugsfähige Betriebsausgaben nicht korrigieren

Wurden nicht abzugsfähige Betriebsausgaben als Aufwand erfasst,

müssen sie außerbilanziell hinzugerechnet werden.

---

► Fehler 5: Steuerfreie Erträge im Gewinn belassen

Steuerfreie Erträge werden außerbilanziell abgezogen.

---

► Fehler 6: Erfolgsneutral gebuchte Vergütung doppelt zurechnen

Wurde eine Gesellschaftervergütung als Entnahme gebucht,

hat sie den Gewinn nicht gemindert.

Sie muss für die Gewinnverteilung aus der allgemeinen Verteilungsmasse herausgerechnet und dem betreffenden Gesellschafter im Sonderbereich zugeordnet werden.

---

► Fehler 7: Kontrollrechnung unterlassen

Die Summe der steuerlichen Gewinnanteile muss dem steuerlichen Gesamtgewinn der Mitunternehmerschaft entsprechen.

---

⇨ Merksätze

- Der Gesamtgewinn einer Mitunternehmerschaft besteht aus Gesamthandsgewinn und Sonderbereichen.
- Gesellschaftsvertragliche Vorabgewinne gehören zur Gewinnverteilung.
- Mieten, Zinsen und Tätigkeitsvergütungen an Gesellschafter sind regelmäßig Sondervergütungen.
- Sonderbetriebseinnahmen und Sonderbetriebsausgaben sind je Gesellschafter getrennt zu erfassen.
- Nicht abzugsfähige Betriebsausgaben werden hinzugerechnet.
- Steuerfreie Erträge werden abgezogen.
- Als Aufwand gebuchte Sondervergütungen sind im Gesamthandsgewinn bereits berücksichtigt.
- Erfolgsneutral gebuchte Vergütungen müssen vor der Restgewinnverteilung aus der Verteilungsmasse entfernt werden.
- Am Ende ist immer eine Kontrollsumme zu bilden.
`
},
{
  id: "personengesellschaft-gewinnverteilung-sonderverguetungen-sonderbereich",
  title:
    "Personengesellschaften: Gewinnverteilung, Sondervergütungen und Sonderbereich",
  short:
    "Ermittlung der steuerlichen Gewinnanteile bei Mitunternehmerschaften: Vorabgewinn, Restgewinn, Sondervergütungen, Sonderbetriebseinnahmen und Sonderbetriebsausgaben.",
  category: "Rechnungswesen",
  source:
    "Interne Steuerstoff-Prüfungsvorbereitung – Einkünfte aus gewerblichen Personengesellschaften",
  keywords:
    "personengesellschaft|mitunternehmerschaft|gewinnverteilung|sondervergütung|sonderbetriebseinnahmen|sonderbetriebsausgaben|sonderbereich|vorabgewinn|mehrkapitalverzinsung|geschäftsführervergütung|gesellschafterdarlehen|grundstücksvermietung|beraterhonorar|§ 15 abs. 1 nr. 2 estg|kg|ohg|gbr|steuerlicher gewinnanteil|gesamthandsgewinn",
  references: [
    "§ 15 Abs. 1 Satz 1 Nr. 2 EStG",
    "§ 4 Abs. 4 EStG",
    "§ 4 Abs. 5 EStG",
    "§ 5 EStG"
  ],
  body: `
⇨ Gewinnermittlung bei gewerblichen Personengesellschaften

► 1. Grundprinzip

Bei einer gewerblichen Personengesellschaft wird der steuerliche Gewinn in mehreren Stufen ermittelt.

Zum Gesamtgewinn der Mitunternehmerschaft gehören:

1. der Gewinn der Gesamthand,
2. die Gewinnanteile der Gesellschafter,
3. Sondervergütungen,
4. Sonderbetriebseinnahmen,
5. abzüglich Sonderbetriebsausgaben.

Rechtsgrundlage:

§ 15 Abs. 1 Satz 1 Nr. 2 EStG.

---

⇨ 2. Zwei Ebenen der Gewinnermittlung

► Ebene 1: Gesamthandsbereich

Hier wird der Gewinn der Personengesellschaft ermittelt.

Typische Bestandteile:

- laufender Unternehmensgewinn,
- außerbilanzielle Korrekturen,
- gesellschaftsvertragliche Gewinnverteilung,
- Vorabgewinne,
- Restgewinnverteilung.

► Ebene 2: Sonderbereich der Gesellschafter

Hier werden Leistungen zwischen einem Gesellschafter und seiner Personengesellschaft erfasst.

Typische Sondervergütungen:

- Mieten für ein Grundstück,
- Darlehenszinsen,
- Tätigkeitsvergütungen,
- Beraterhonorare,
- Geschäftsführungsvergütungen.

Dazugehörige Aufwendungen des Gesellschafters sind Sonderbetriebsausgaben.

---

⇨ 3. Gesellschaftsrechtliche Gewinnverteilung

Die Gewinnverteilung richtet sich zunächst nach dem Gesellschaftsvertrag.

Typischer Aufbau:

1. Ausgangsgewinn der Gesellschaft,
2. Vorabgewinn oder Mehrkapitalverzinsung,
3. gegebenenfalls weitere Vorwegvergütungen,
4. Verteilung des verbleibenden Restgewinns.

► Formel

Gesellschaftsgewinn

− Vorabgewinne

− weitere gesellschaftsvertragliche Vorwegvergütungen

= Restgewinn.

Der Restgewinn wird anschließend nach dem vereinbarten Schlüssel verteilt.

---

⇨ 4. Vorabgewinn und Sondervergütung unterscheiden

Diese Unterscheidung ist besonders wichtig.

► Vorabgewinn

Ein Vorabgewinn ist Bestandteil der gesellschaftsrechtlichen Gewinnverteilung.

Beispiele:

- Mehrkapitalverzinsung,
- Gewinnvorab für Geschäftsführung,
- garantierter Gewinnanteil laut Gesellschaftsvertrag.

Der Vorabgewinn wird innerhalb der Gewinnverteilung berücksichtigt.

► Sondervergütung

Eine Sondervergütung beruht auf einem schuldrechtlichen Leistungsaustausch zwischen Gesellschafter und Gesellschaft.

Beispiele:

- Miete,
- Darlehenszinsen,
- Beraterhonorar,
- Tätigkeitsvergütung außerhalb der gesellschaftsrechtlichen Gewinnverteilung.

Die Sondervergütung wird im Sonderbereich des Gesellschafters erfasst.

► Merksatz

Gesellschaftsvertragliche Gewinnverteilung

= Vorabgewinn.

Schuldrechtlicher Vertrag mit dem Gesellschafter

= Sondervergütung.

---

⇨ 5. Sonderbetriebseinnahmen

Sonderbetriebseinnahmen sind Einnahmen, die ein Gesellschafter von seiner Personengesellschaft erhält.

Typische Fälle:

- Mietzahlungen der Gesellschaft an den Gesellschafter,
- Zinsen für ein Gesellschafterdarlehen,
- Beraterhonorare,
- Geschäftsführungsvergütungen,
- Lizenzzahlungen.

Diese Einnahmen gehören nicht zu einer anderen Einkunftsart.

Sie werden als gewerbliche Einkünfte nach

§ 15 Abs. 1 Satz 1 Nr. 2 EStG

erfasst.

---

⇨ 6. Sonderbetriebsausgaben

Aufwendungen des Gesellschafters, die mit seinen Sonderbetriebseinnahmen oder seiner Beteiligung zusammenhängen, sind Sonderbetriebsausgaben.

Beispiele:

- Reparaturen am vermieteten Grundstück,
- Abschreibungen auf Sonderbetriebsvermögen,
- Finanzierungskosten,
- Beratungskosten,
- laufende Grundstückskosten.

► Formel

Sonderbetriebseinnahmen

− Sonderbetriebsausgaben

= Ergebnis des Sonderbereichs.

---

⇨ 7. Außerbilanzielle Korrekturen

Der handelsrechtliche oder steuerbilanzielle Gewinn kann steuerlich zu korrigieren sein.

► Nicht abzugsfähige Betriebsausgaben

Nicht abzugsfähige Betriebsausgaben nach § 4 Abs. 5 EStG werden hinzugerechnet.

Beispiel:

6.000 € nicht abzugsfähige Betriebsausgaben.

► Steuerfreie Erträge

Steuerfreie Erträge, die im bilanziellen Gewinn enthalten sind, werden abgezogen.

Beispiel:

15.000 € steuerfreie Einnahmen.

► Verteilung

Die Korrekturen werden regelmäßig entsprechend dem allgemeinen Gewinnverteilungsschlüssel auf die Gesellschafter verteilt,

soweit keine besondere individuelle Zuordnung erforderlich ist.

---

⇨ 8. Allgemeines Berechnungsschema

► Schritt 1: Ausgangsgewinn

Handelsrechtlicher beziehungsweise steuerbilanzieller Gewinn der Gesellschaft.

► Schritt 2: Gesellschaftsvertragliche Vorabgewinne

Zum Beispiel:

- Mehrkapitalverzinsung,
- Tätigkeitsvorab,
- Geschäftsführungsvorab.

► Schritt 3: Restgewinn

Ausgangsgewinn

− Vorabgewinne

= Restgewinn.

► Schritt 4: Restgewinn verteilen

Verteilung beispielsweise

- nach Köpfen,
- nach Beteiligungsquote,
- oder nach einem besonderen vertraglichen Schlüssel.

► Schritt 5: Bilanzielle Gewinnanteile

Vorabgewinn

+ Anteil am Restgewinn

= bilanzieller Gewinnanteil.

► Schritt 6: Steuerliche Korrekturen

- nicht abzugsfähige Betriebsausgaben hinzurechnen,
- steuerfreie Erträge abziehen.

► Schritt 7: Sonderbereiche

Je Gesellschafter:

Sonderbetriebseinnahmen

− Sonderbetriebsausgaben.

► Schritt 8: Steuerlicher Gewinnanteil

Korrigierter Gewinnanteil

+ Ergebnis des Sonderbereichs

= steuerlicher Gewinnanteil.

---

⇨ 9. Beispiel 1 – KG mit drei Gesellschaftern

► Sachverhalt

Die KG erzielt einen Gewinn von

420.000 €.

Der Restgewinn wird nach Köpfen verteilt.

Mehrkapitalverzinsung:

- A: 12.000 €
- B: 16.000 €
- C: 8.000 €

Gesamter Vorabgewinn:

36.000 €.

Weitere Sachverhalte:

- A vermietet der KG ein Grundstück für 48.000 €.
- A entstehen hierfür Aufwendungen von 15.000 €.
- B erhält ein Beraterhonorar von 80.000 €.
- C erhält Darlehenszinsen von 12.000 €.
- Nicht abzugsfähige Betriebsausgaben: 6.000 €.
- Steuerfreie Erträge: 15.000 €.

---

► Schritt 1: Restgewinn

Gewinn:

420.000 €

abzüglich Vorabgewinne:

36.000 €

Restgewinn:

384.000 €.

Verteilung nach Köpfen:

384.000 € ÷ 3

= 128.000 € je Gesellschafter.

---

► Schritt 2: Bilanzielle Gewinnanteile

⇶  A

128.000 €

+ 12.000 €

= 140.000 €.

⇶  B

128.000 €

+ 16.000 €

= 144.000 €.

⇶  C

128.000 €

+ 8.000 €

= 136.000 €.

Gesamt:

420.000 €.

---

► Schritt 3: Steuerliche Korrekturen

Nicht abzugsfähige Betriebsausgaben:

6.000 €.

Bei Verteilung nach Köpfen:

2.000 € je Gesellschafter.

Steuerfreie Erträge:

15.000 €.

Bei Verteilung nach Köpfen:

5.000 € je Gesellschafter.

⇶  Korrigierte Gewinnanteile

A:

140.000 €

+ 2.000 €

− 5.000 €

= 137.000 €.

B:

144.000 €

+ 2.000 €

− 5.000 €

= 141.000 €.

C:

136.000 €

+ 2.000 €

− 5.000 €

= 133.000 €.

---

► Schritt 4: Sonderbereiche

⇶  Sonderbereich A

Mieteinnahmen:

48.000 €.

Sonderbetriebsausgaben:

15.000 €.

Ergebnis:

33.000 €.

⇶  Sonderbereich B

Beraterhonorar:

80.000 €.

⇶  Sonderbereich C

Darlehenszinsen:

12.000 €.

---

► Schritt 5: Steuerliche Gewinnanteile

⇶  A

137.000 €

+ 33.000 €

= 170.000 €.

⇶  B

141.000 €

+ 80.000 €

= 221.000 €.

⇶  C

133.000 €

+ 12.000 €

= 145.000 €.

Gesamtgewinn der Mitunternehmerschaft:

536.000 €.

---

⇨ 10. Beispiel 2 – OHG mit Geschäftsführungsvorab

► Sachverhalt

Gewinn der OHG:

800.000 €.

Gewinnverteilung:

- A: 80 %
- B: 20 %.

Mehrkapitalverzinsung:

- A: 16.000 €
- B: 4.000 €.

A erhält zusätzlich gesellschaftsvertraglich vorweg eine Vergütung für seine Geschäftsführertätigkeit von

20.000 € monatlich.

Jahresbetrag:

240.000 €.

Weitere Sachverhalte:

- A erhält Darlehenszinsen von 10.000 €.
- B erhält Grundstücksmiete von 12.000 €.
- B entstehen Grundstücksaufwendungen von 15.000 €.

---

► Schritt 1: Vorabgewinne

Mehrkapitalverzinsung:

20.000 €.

Geschäftsführungsvorab A:

240.000 €.

Gesamte Vorabgewinne:

260.000 €.

---

► Schritt 2: Restgewinn

800.000 €

− 260.000 €

= 540.000 €.

Verteilung:

⇶  A: 80 %

540.000 € × 80 %

= 432.000 €.

⇶  B: 20 %

540.000 € × 20 %

= 108.000 €.

---

► Schritt 3: Bilanzielle Gewinnanteile

⇶  A

Mehrkapitalverzinsung:

16.000 €.

Geschäftsführungsvorab:

240.000 €.

Restgewinn:

432.000 €.

Gesamt:

688.000 €.

⇶  B

Mehrkapitalverzinsung:

4.000 €.

Restgewinn:

108.000 €.

Gesamt:

112.000 €.

---

► Schritt 4: Sonderbereiche

⇶  A

Darlehenszinsen:

10.000 €.

⇶  B

Mieteinnahmen:

12.000 €.

abzüglich Sonderbetriebsausgaben:

15.000 €.

Ergebnis:

−3.000 €.

---

► Schritt 5: Steuerliche Gewinnanteile

⇶  A

688.000 €

+ 10.000 €

= 698.000 €.

⇶  B

112.000 €

− 3.000 €

= 109.000 €.

Gesamt:

807.000 €.

---

⇨ 11. Besonderheit der Geschäftsführungsvergütung

Die Vergütung für A ist ausdrücklich als gesellschaftsvertragliche Vorweggewinnverteilung vereinbart.

Deshalb wird sie innerhalb der bilanziellen Gewinnverteilung berücksichtigt.

Sie ist in diesem Fall kein zusätzlicher Sonderbereich.

► Klausurhinweis

Nicht jede Geschäftsführungsvergütung ist automatisch gleich zu behandeln.

Es ist zu prüfen:

- gesellschaftsvertraglicher Gewinnvorab oder
- schuldrechtliche Tätigkeitsvergütung?

Die Formulierung des Sachverhalts ist entscheidend.

---

⇨ 12. Beispiel 3 – GbR und erfolgsneutral gebuchtes Beraterhonorar

► Sachverhalt

Die GbR weist zunächst einen Gewinn von

350.000 €

aus.

Der Restgewinn wird nach Köpfen verteilt.

Mehrkapitalverzinsung:

- A: 3.000 €
- B: 7.000 €
- C: 5.000 €.

A vermietet der GbR ein Grundstück:

- Miete: 20.000 €
- Aufwendungen: 35.000 €.

B erhält ein Beraterhonorar:

80.000 €.

Das Beraterhonorar wurde von der GbR nicht als Aufwand,

sondern erfolgsneutral als Entnahme des B gebucht.

C erhält Darlehenszinsen:

20.000 €.

---

⇨ 13. Erfolgsneutrale Buchung des Beraterhonorars

Obwohl das Beraterhonorar nicht als Aufwand gebucht wurde,

muss es für die richtige gesellschaftsrechtliche Gewinnverteilung berücksichtigt werden.

Der ausgewiesene Gewinn von 350.000 € enthält wirtschaftlich noch den Betrag von 80.000 €,

der B als Vergütung zugerechnet wird.

Für die Verteilung des verbleibenden Gewinns ist daher zunächst zu rechnen:

350.000 €

− 80.000 €

= 270.000 €.

Das Honorar wird anschließend im Sonderbereich des B erfasst.

Dadurch wird eine doppelte Zurechnung vermieden.

---

⇨ 14. Gewinnverteilung Beispiel 3

► Vorabgewinne

Gesamte Mehrkapitalverzinsung:

3.000 €

+ 7.000 €

+ 5.000 €

= 15.000 €.

► Restgewinn

270.000 €

− 15.000 €

= 255.000 €.

Verteilung nach Köpfen:

255.000 € ÷ 3

= 85.000 € je Gesellschafter.

---

► Bilanzielle Gewinnanteile

⇶  A

85.000 €

+ 3.000 €

= 88.000 €.

⇶  B

85.000 €

+ 7.000 €

= 92.000 €.

⇶  C

85.000 €

+ 5.000 €

= 90.000 €.

Gesamt:

270.000 €.

---

⇨ 15. Sonderbereiche Beispiel 3

► Sonderbereich A

Mieteinnahmen:

20.000 €.

Sonderbetriebsausgaben:

35.000 €.

Ergebnis:

−15.000 €.

► Sonderbereich B

Beraterhonorar:

80.000 €.

► Sonderbereich C

Darlehenszinsen:

20.000 €.

---

⇨ 16. Steuerliche Gewinnanteile Beispiel 3

⇶  A

88.000 €

− 15.000 €

= 73.000 €.

⇶  B

92.000 €

+ 80.000 €

= 172.000 €.

⇶  C

90.000 €

+ 20.000 €

= 110.000 €.

Gesamt:

355.000 €.

---

⇨ 17. Warum beträgt der steuerliche Gesamtgewinn 355.000 €?

Ausgangsgewinn:

350.000 €.

Zusätzliche steuerliche Auswirkung der Sonderbereiche:

- Vermietung A: 20.000 € Einnahmen waren bei der Gesellschaft als Aufwand erfasst; nach Abzug von 35.000 € Sonderbetriebsausgaben ergibt sich insgesamt eine Mehrminderung von 15.000 €.
- Darlehenszinsen C: 20.000 € wurden bei der Gesellschaft als Aufwand erfasst und im Sonderbereich wieder zugerechnet.
- Beraterhonorar B: 80.000 € wurde erfolgsneutral gebucht und darf deshalb nicht zusätzlich den Gesamtgewinn erhöhen, sondern wird nur von der allgemeinen Verteilungsmasse in den Sonderbereich des B verschoben.

Gesamtwirkung:

350.000 €

− 15.000 €

+ 20.000 €

= 355.000 €.

---

⇨ 18. Typische Buchungs- und Prüfungslogik

► Zahlung an Gesellschafter wurde als Aufwand gebucht

Beispiele:

- Miete,
- Zinsen,
- Beraterhonorar.

Folge:

Der Gesamthandsgewinn ist bereits gemindert.

Die Zahlung wird im Sonderbereich des Gesellschafters wieder als Sonderbetriebseinnahme erfasst.

► Zahlung wurde erfolgsneutral als Entnahme gebucht

Folge:

Der Gesamthandsgewinn wurde nicht gemindert.

Damit der Betrag nicht doppelt verteilt wird,

ist er vor der allgemeinen Gewinnverteilung aus der Verteilungsmasse herauszurechnen

und im Sonderbereich des betreffenden Gesellschafters zu erfassen.

---

⇨ Prüfungsschema

1. Welche Rechtsform liegt vor?

2. Wie hoch ist der Ausgangsgewinn?

3. Wurde eine Zahlung als Aufwand oder erfolgsneutral gebucht?

4. Welche Gewinnverteilung enthält der Gesellschaftsvertrag?

5. Gibt es Mehrkapitalverzinsungen?

6. Gibt es gesellschaftsvertragliche Vorabgewinne?

7. Restgewinn ermitteln.

8. Restgewinn nach dem vereinbarten Schlüssel verteilen.

9. Nicht abzugsfähige Betriebsausgaben hinzurechnen.

10. Steuerfreie Erträge abziehen.

11. Sondervergütungen je Gesellschafter bestimmen.

12. Sonderbetriebsausgaben abziehen.

13. Steuerlichen Gewinnanteil jedes Gesellschafters berechnen.

14. Kontrollsumme des Gesamtgewinns bilden.

---

⇨ Typische Klausurfallen

► Fehler 1: Sondervergütung als andere Einkunftsart behandeln

Miete, Zinsen oder Tätigkeitsvergütungen eines Mitunternehmers gehören grundsätzlich zu den gewerblichen Einkünften nach § 15 Abs. 1 Satz 1 Nr. 2 EStG.

---

► Fehler 2: Vorabgewinn und Sondervergütung verwechseln

Ein gesellschaftsvertraglicher Gewinnvorab wird innerhalb der Gewinnverteilung berücksichtigt.

Eine schuldrechtliche Vergütung wird im Sonderbereich erfasst.

---

► Fehler 3: Sonderbetriebsausgaben vergessen

Von den Sonderbetriebseinnahmen sind die dazugehörigen Aufwendungen abzuziehen.

Beispiel:

48.000 € Miete

− 15.000 € Aufwendungen

= 33.000 € Sonderbereich.

---

► Fehler 4: Nicht abzugsfähige Betriebsausgaben nicht korrigieren

Wurden nicht abzugsfähige Betriebsausgaben als Aufwand erfasst,

müssen sie außerbilanziell hinzugerechnet werden.

---

► Fehler 5: Steuerfreie Erträge im Gewinn belassen

Steuerfreie Erträge werden außerbilanziell abgezogen.

---

► Fehler 6: Erfolgsneutral gebuchte Vergütung doppelt zurechnen

Wurde eine Gesellschaftervergütung als Entnahme gebucht,

hat sie den Gewinn nicht gemindert.

Sie muss für die Gewinnverteilung aus der allgemeinen Verteilungsmasse herausgerechnet und dem betreffenden Gesellschafter im Sonderbereich zugeordnet werden.

---

► Fehler 7: Kontrollrechnung unterlassen

Die Summe der steuerlichen Gewinnanteile muss dem steuerlichen Gesamtgewinn der Mitunternehmerschaft entsprechen.

---

⇨ Merksätze

- Der Gesamtgewinn einer Mitunternehmerschaft besteht aus Gesamthandsgewinn und Sonderbereichen.
- Gesellschaftsvertragliche Vorabgewinne gehören zur Gewinnverteilung.
- Mieten, Zinsen und Tätigkeitsvergütungen an Gesellschafter sind regelmäßig Sondervergütungen.
- Sonderbetriebseinnahmen und Sonderbetriebsausgaben sind je Gesellschafter getrennt zu erfassen.
- Nicht abzugsfähige Betriebsausgaben werden hinzugerechnet.
- Steuerfreie Erträge werden abgezogen.
- Als Aufwand gebuchte Sondervergütungen sind im Gesamthandsgewinn bereits berücksichtigt.
- Erfolgsneutral gebuchte Vergütungen müssen vor der Restgewinnverteilung aus der Verteilungsmasse entfernt werden.
- Am Ende ist immer eine Kontrollsumme zu bilden.
`
},
{
  id: "ust-dienstleistungen-eu-drittland-13b-grundfall-werkleistung",
  title: "§ 13b UStG – Werkleistung eines EU-Unternehmers",
  short:
    "Werkleistung eines Unternehmers aus dem EU-Ausland an einen deutschen Unternehmer (Reverse Charge).",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "13b|reverse charge|werkleistung|dienstleistung|österreich|eu|wartung|lkw|ort der leistung",
  references: [
    "§ 3a UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13b UStG",
    "§ 15 UStG"
  ],
  body: `
⇨ Werkleistung eines EU-Unternehmers (§ 13b UStG)

► Sachverhalt

Ein Unternehmer aus Österreich wartet den betrieblich genutzten LKW eines deutschen Unternehmers.

Die Rechnung beträgt 1.000 € ohne deutsche Umsatzsteuer.

---

► Prüfung

⇶  1. Art der Leistung

Es handelt sich um eine

**sonstige Leistung (Werkleistung).**

---

⇶  2. Ort der Leistung

B2B-Regel

§ 3a Abs. 2 UStG

Der Leistungsort liegt dort,

wo der Leistungsempfänger sein Unternehmen betreibt.

→ Deutschland

---

⇶  3. Steuerbarkeit

Die Leistung wird im Inland ausgeführt.

→ steuerbar (§ 1 Abs.1 Nr.1 UStG)

---

⇶  4. Steuerbefreiung

Keine Steuerbefreiung nach § 4 UStG.

---

⇶  5. Reverse Charge (§ 13b)

Da der leistende Unternehmer im EU-Ausland ansässig ist,

geht die Steuerschuld auf den deutschen Unternehmer über.

Steuerschuldner:

Leistungsempfänger

gemäß § 13b UStG.

---

⇶  6. Bemessungsgrundlage

Nettoentgelt:

1.000 €

Umsatzsteuer:

19 %

= 190 €

---

⇶  7. Vorsteuer

Da die Leistung für das Unternehmen bezogen wurde,

kann die nach § 13b geschuldete Umsatzsteuer

im selben Voranmeldungszeitraum

als Vorsteuer abgezogen werden.

Vorsteuer:

190 €

---

⇨ Abwandlung (Schweiz)

Der Unternehmer stammt aus der Schweiz.

Die Arbeiten werden dort ausgeführt.

Die Leistung wird

nach § 3a Abs. 8 UStG

im Inland nicht besteuert,

da die Arbeiten an beweglichen körperlichen Gegenständen

im Drittland tatsächlich genutzt bzw. ausgeführt werden.

Ergebnis:

→ im Inland nicht steuerbar.

---

⇨ Merksätze

• B2B-Dienstleistungen → grundsätzlich § 3a Abs.2 UStG.

• EU-Unternehmer → Reverse Charge nach § 13b.

• Die Umsatzsteuer schuldet regelmäßig der Leistungsempfänger.

• Gleichzeitig besteht regelmäßig voller Vorsteuerabzug.

• Bei bestimmten Arbeiten im Drittland kann § 3a Abs.8 UStG den Leistungsort verlagern.

---

⇨ Klausurfallen

Prüfungsfalle Nr.1

Werkleistung ≠ Werklieferung.

Prüfungsfalle Nr.2

Nicht jede Auslandsleistung unterliegt § 13b.

Zunächst immer den Leistungsort bestimmen.

Prüfungsfalle Nr.3

§ 3a Abs.8 UStG wird häufig vergessen.

Prüfungsfalle Nr.4

Reverse Charge bedeutet nicht Steuerfreiheit.

Die Umsatzsteuer entsteht weiterhin – sie wird nur vom Leistungsempfänger geschuldet.
`
},
{
  id: "ust-13b-grundstueckslieferung-option-steuerpflicht",
  title: "§ 13b UStG – Grundstückslieferung mit Option zur Steuerpflicht",
  short:
    "Verkauf eines Grundstücks mit Verzicht auf die Steuerbefreiung (§ 9 UStG) und Steuerschuld des Leistungsempfängers.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "13b|grundstück|grundstückslieferung|option|§9|steuerbefreiung|reverse charge|4 nr 9a",
  references: [
    "§ 3 UStG",
    "§ 4 Nr. 9a UStG",
    "§ 9 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13b Abs.2 Nr.3 UStG",
    "§ 15 UStG"
  ],
  body: `
⇨ Grundstückslieferung mit Option zur Steuerpflicht (§ 13b Abs.2 Nr.3 UStG)

► Sachverhalt

Eine Unternehmerin verkauft ein betrieblich genutztes Grundstück.

Im Kaufvertrag verzichtet sie nach § 9 UStG auf die Steuerbefreiung.

Der Käufer verwendet das Grundstück ausschließlich für sein Unternehmen.

Kaufpreis:

400.000 €

---

► Prüfung

⇶  1. Art der Leistung

Lieferung eines Grundstücks.

---

⇶  2. Ort der Lieferung

Unbewegter Gegenstand.

Ort der Lieferung:

Ort des Grundstücks

(§ 3 Abs.7 UStG).

→ Inland.

---

⇶  3. Steuerbarkeit

Lieferung gegen Entgelt.

→ steuerbar (§ 1 Abs.1 Nr.1 UStG)

---

⇶  4. Steuerbefreiung

Grundsätzlich

§ 4 Nr.9a UStG

(Grundstückslieferung).

Hier:

Verzicht nach § 9 UStG.

Damit:

steuerpflichtig.

---

⇶  5. Steuerschuld

Da § 13b Abs.2 Nr.3 UStG greift,

schuldet

der Leistungsempfänger

die Umsatzsteuer.

Reverse Charge.

---

⇶  6. Bemessungsgrundlage

400.000 €

Umsatzsteuer 19 %

=

76.000 €

---

⇶  7. Vorsteuer

Der Käufer kann

die nach § 13b geschuldete Umsatzsteuer

im selben Voranmeldungszeitraum

als Vorsteuer abziehen,

wenn das Grundstück ausschließlich

für steuerpflichtige Umsätze verwendet wird.

---

⇨ Merksätze

• Grundstückslieferungen sind grundsätzlich steuerfrei (§ 4 Nr.9a UStG).

• Durch Option (§ 9 UStG) werden sie steuerpflichtig.

• Bei Unternehmern geht die Steuerschuld regelmäßig nach § 13b auf den Käufer über.

• Vorsteuerabzug nur bei unternehmerischer Verwendung.

---

⇨ Klausurfallen

Prüfungsfalle Nr.1

Immer zuerst prüfen,

ob überhaupt auf die Steuerbefreiung verzichtet wurde.

Prüfungsfalle Nr.2

§ 13b greift nur,

wenn die Voraussetzungen erfüllt sind.

Prüfungsfalle Nr.3

Vorsteuerabzug setzt steuerpflichtige Ausgangsumsätze voraus.

Prüfungsfalle Nr.4

Option nach § 9 UStG und Reverse Charge sind zwei getrennte Prüfungsschritte.
`
},
{
  id: "ust-binnenmarkt-holzanbau-ige-werkleistung",
  title: "Binnenmarkt: Holzanbau, innergemeinschaftlicher Erwerb und Werklieferung",
  short:
    "Prüfung einer Werklieferung im Inland mit Anzahlung sowie innergemeinschaftlichem Erwerb von Material aus Belgien.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "binnenmarkt|innergemeinschaftlicher erwerb|i.g.e.|werklieferung|holzbau|anzahlung|§3 abs4 ustg|§3d ustg|§13 ustg|§15 ustg|transportleistung|rechnung",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 1 Abs. 1 Nr. 5 UStG",
    "§ 1a UStG",
    "§ 3 Abs. 4 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3d UStG",
    "§ 4 UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 15 UStG"
  ],
  body: `
⇨ Binnenmarkt: Holzanbau und innergemeinschaftlicher Erwerb

► Ausgangssachverhalt

Ein deutscher Unternehmer Rens errichtet für einen deutschen Auftraggeber Thiesen einen Holzanbau.

Für den Holzanbau benötigt Rens Holzverstrebungen, die er bei Huise aus Belgien bestellt.

Huise liefert die Holzverstrebungen direkt an den Frachtführer Rabens, der sie nach Deutschland transportiert.

Alle Unternehmer verwenden die USt-IdNr. ihres Heimatlandes.

---

⇨ 1. Ausgangsleistung Rens an Thiesen

► Art der Leistung

Rens errichtet einen Holzanbau.

Da Rens nicht nur Material liefert, sondern einen Gegenstand herstellt und einbaut, liegt eine Werklieferung vor.

Rechtsgrundlage:

§ 3 Abs. 4 UStG

Zur Werklieferung gehören insbesondere:

- Gestellung des Materials
- Aufbau
- Anlieferung
- Montage

---

► Ort der Werklieferung

Bei einer unbewegten Werklieferung bestimmt sich der Ort nach § 3 Abs. 7 UStG.

Der Ort liegt dort, wo sich der Gegenstand im Zeitpunkt der Verschaffung der Verfügungsmacht befindet.

Hier:

Hünxe / Inland

---

► Steuerbarkeit und Steuerpflicht

Die Werklieferung ist steuerbar nach § 1 Abs. 1 Nr. 1 UStG.

Eine Steuerbefreiung nach § 4 UStG greift nicht.

Damit ist der Umsatz steuerpflichtig zum Regelsteuersatz von 19 %.

---

► Bemessungsgrundlage

Gesamtpreis brutto:

11.900 €

Bemessungsgrundlage netto:

11.900 € / 1,19

=

10.000 €

Umsatzsteuer:

1.900 €

Steuerschuldner:

Rens

Rechtsgrundlage:

§ 13a Abs. 1 Nr. 1 UStG

---

⇨ 2. Steuerentstehung bei Anzahlung

Thiesen leistet am 21.01. eine Anzahlung von 1.000 € brutto.

Bei Anzahlungen entsteht die Umsatzsteuer bereits mit Ablauf des Voranmeldungszeitraums der Vereinnahmung.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a Satz 4 UStG

► Berechnung Anzahlung

Anzahlung brutto:

1.000 €

Umsatzsteuer:

1.000 € / 1,19 × 19 %

=

159,66 €

Die Umsatzsteuer entsteht mit Ablauf des VAZ 01.

---

⇨ 3. Reststeuer bei Leistungsausführung

Die Abnahme des Holzanbaus erfolgt am 20.03.

Damit wird die Werklieferung ausgeführt.

Restbetrag brutto:

11.900 € - 1.000 €

=

10.900 €

Umsatzsteuer aus Restbetrag:

10.900 € / 1,19 × 19 %

=

1.740,34 €

Die Umsatzsteuer entsteht mit Ablauf des VAZ 03.

---

⇨ 4. Transportleistung Rabens

Rabens transportiert die Holzverstrebungen von Brüssel nach Schermbeck.

Die Rechnung wird jedoch nicht an Rens, sondern an Huise gestellt.

► Folge für Rens

Für Rens ist die Transportleistung umsatzsteuerlich unbeachtlich.

Insbesondere:

- keine Eingangsleistung an Rens
- keine Rechnung auf den Namen des Rens
- kein offener Steuerausweis gegenüber Rens
- kein Vorsteuerabzug

Merksatz:

Vorsteuerabzug nur, wenn die Leistung an den Unternehmer ausgeführt wurde und eine ordnungsgemäße Rechnung vorliegt.

---

⇨ 5. Eingangsleistung Huise an Rens

Huise liefert Holzverstrebungen aus Belgien nach Deutschland.

Die Holzverstrebungen gelangen aus dem übrigen Gemeinschaftsgebiet in das Inland.

Damit liegt bei Rens ein innergemeinschaftlicher Erwerb vor.

Rechtsgrundlage:

§ 1a UStG

---

► Voraussetzungen des innergemeinschaftlichen Erwerbs

Ein innergemeinschaftlicher Erwerb liegt vor, wenn

1. ein Gegenstand aus einem EU-Mitgliedstaat in einen anderen EU-Mitgliedstaat gelangt,

2. der Erwerber Unternehmer ist,

3. der Erwerb für das Unternehmen erfolgt,

4. der Lieferer Unternehmer ist,

5. der Lieferer im Rahmen seines Unternehmens liefert,

6. die Lieferung gegen Entgelt erfolgt.

Diese Voraussetzungen sind hier erfüllt.

---

► Ort des innergemeinschaftlichen Erwerbs

Der Ort des innergemeinschaftlichen Erwerbs bestimmt sich nach § 3d Satz 1 UStG.

Der Erwerb wird dort bewirkt, wo sich der Gegenstand am Ende der Beförderung oder Versendung befindet.

Hier:

Schermbeck / Inland

§ 3d Satz 2 UStG greift nicht, weil Rens seine deutsche USt-IdNr. verwendet.

---

► Steuerbarkeit

Der innergemeinschaftliche Erwerb ist steuerbar nach § 1 Abs. 1 Nr. 5 UStG.

Eine Steuerbefreiung nach § 4b UStG greift nicht.

---

► Steuersatz

Der Regelsteuersatz beträgt 19 %.

Der ermäßigte Steuersatz greift nicht.

---

► Steuerschuldner

Steuerschuldner des innergemeinschaftlichen Erwerbs ist Rens.

Rechtsgrundlage:

§ 13a Abs. 1 Nr. 2 UStG

---

► Bemessungsgrundlage des innergemeinschaftlichen Erwerbs

Nettoentgelt:

5.000 €

Umsatzsteuer:

5.000 € × 19 %

=

950 €

---

► Steuerentstehung beim innergemeinschaftlichen Erwerb

Die Steuer entsteht mit Ausstellung der Rechnung am 05.03.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 6 UStG

VAZ:

03

---

⇨ 6. Vorsteuerabzug aus dem innergemeinschaftlichen Erwerb

Rens verwendet die Holzverstrebungen für seine steuerpflichtige Werklieferung an Thiesen.

Daher ist Rens zum Vorsteuerabzug aus dem innergemeinschaftlichen Erwerb berechtigt.

Rechtsgrundlage:

§ 15 Abs. 1 Nr. 3 UStG

Vorsteuer:

950 €

---

⇨ 7. Zusammenfassung der Beträge

► Ausgangsumsatz Rens an Thiesen

Netto:

10.000 €

Umsatzsteuer:

1.900 €

Davon:

- VAZ 01: 159,66 € aus Anzahlung
- VAZ 03: 1.740,34 € aus Restbetrag

---

► Innergemeinschaftlicher Erwerb Rens von Huise

Bemessungsgrundlage:

5.000 €

Umsatzsteuer:

950 €

Vorsteuer:

950 €

VAZ:

03

---

⇨ Prüfungsschema Werklieferung

1. Liegt eine Lieferung oder sonstige Leistung vor?

2. Wird ein fremder oder eigener Stoff bearbeitet?

3. Wird ein fertiger Gegenstand hergestellt oder eingebaut?

4. Werklieferung nach § 3 Abs. 4 UStG prüfen.

5. Ort der Werklieferung bestimmen.

6. Steuerbarkeit prüfen.

7. Steuerbefreiung prüfen.

8. Bemessungsgrundlage und Umsatzsteuer berechnen.

9. Anzahlung gesondert prüfen.

---

⇨ Prüfungsschema innergemeinschaftlicher Erwerb

1. Gegenstand gelangt aus EU-Ausland ins Inland.

2. Erwerber ist Unternehmer.

3. Erwerb erfolgt für das Unternehmen.

4. Lieferer ist Unternehmer.

5. Lieferung erfolgt gegen Entgelt.

6. Ort nach § 3d UStG bestimmen.

7. Steuerbarkeit nach § 1 Abs. 1 Nr. 5 UStG.

8. Steuerbefreiung prüfen.

9. Steuer berechnen.

10. Vorsteuerabzug prüfen.

---

⇨ Merksätze

Werklieferung:

Material + Einbau + Herstellung eines Gegenstands.

Anzahlung:

Umsatzsteuer entsteht bereits bei Vereinnahmung.

Innergemeinschaftlicher Erwerb:

Ware kommt aus EU-Ausland nach Deutschland.

Die Erwerbsteuer und die Vorsteuer können sich bei voller Berechtigung neutralisieren.

Transportrechnung:

Nur Vorsteuerabzug, wenn die Rechnung auf den Unternehmer lautet und die Leistung an ihn erbracht wurde.

---

⇨ Klausurfallen

Prüfungsfalle Nr. 1:

Die Anzahlung nicht gesondert besteuern.

Bei Anzahlungen entsteht die Umsatzsteuer bereits im Zeitpunkt der Vereinnahmung.

Prüfungsfalle Nr. 2:

Transportleistung automatisch dem deutschen Unternehmer zuordnen.

Entscheidend ist, wer Auftraggeber und Rechnungsempfänger ist.

Prüfungsfalle Nr. 3:

Innergemeinschaftliche Lieferung beim deutschen Erwerber prüfen.

Beim deutschen Erwerber liegt kein igL, sondern ein innergemeinschaftlicher Erwerb vor.

Prüfungsfalle Nr. 4:

Erwerbsteuer vergessen.

Beim innergemeinschaftlichen Erwerb entsteht Erwerbsteuer beim Erwerber.

Prüfungsfalle Nr. 5:

Vorsteuer aus innergemeinschaftlichem Erwerb vergessen.

Bei Verwendung für steuerpflichtige Ausgangsumsätze ist der Vorsteuerabzug möglich.
`
},
{
  id: "ust-binnenmarkt-tueren-innergemeinschaftlicher-erwerb-vorsteuer",
  title: "Binnenmarkt: Innergemeinschaftlicher Erwerb von Türen und Vorsteueraufteilung",
  short:
    "Innergemeinschaftlicher Erwerb mit teilweisem Vorsteuerabzug bei gemischt verwendeten Wirtschaftsgütern.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "binnenmarkt|innergemeinschaftlicher erwerb|türen|vorsteuer|steuerfreie vermietung|§1a ustg|§15 ustg|§4b ustg|vermietung|aufteilung vorsteuer",
  references: [
    "§ 1 Abs. 1 Nr. 5 UStG",
    "§ 1a UStG",
    "§ 3 UStG",
    "§ 3d UStG",
    "§ 4b UStG",
    "§ 10 UStG",
    "§ 12 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 15 UStG"
  ],
  body: `
⇨ Innergemeinschaftlicher Erwerb von Türen

► Ausgangssachverhalt

Der Unternehmer Becker aus Deutschland kauft zehn Türen von einem Unternehmer aus den Niederlanden.

Die Türen werden unmittelbar von Amsterdam nach Borken geliefert.

Gesamtpreis:

10.000 €

Die Rechnung wird am 03.05. ausgestellt.

Von den zehn Türen werden

- drei Türen steuerpflichtig verkauft,
- sieben Türen in ein steuerfrei vermietetes Mehrfamilienhaus eingebaut.

---

⇨ 1. Innergemeinschaftlicher Erwerb

Die Türen gelangen aus den Niederlanden nach Deutschland.

Damit liegt ein innergemeinschaftlicher Erwerb nach § 1a UStG vor.

Voraussetzungen:

- Gegenstand gelangt aus einem EU-Mitgliedstaat ins Inland
- Erwerber ist Unternehmer
- Erwerb erfolgt für das Unternehmen
- Lieferer ist Unternehmer
- Lieferung erfolgt gegen Entgelt

Alle Voraussetzungen sind erfüllt.

---

⇨ 2. Ort des innergemeinschaftlichen Erwerbs

Der Ort bestimmt sich nach § 3d Satz 1 UStG.

Der Erwerb wird dort ausgeführt, wo die Beförderung endet.

Hier:

Borken (Deutschland)

§ 3d Satz 2 UStG greift nicht, da Becker seine deutsche USt-IdNr. verwendet.

---

⇨ 3. Steuerbarkeit

Der innergemeinschaftliche Erwerb ist steuerbar nach

§ 1 Abs. 1 Nr. 5 UStG.

---

⇨ 4. Steuerbefreiung

Eine Steuerbefreiung nach § 4b UStG greift nicht.

Die Erwerbe sind daher steuerpflichtig.

Steuersatz:

19 %

---

⇨ 5. Bemessungsgrundlage

Nettoentgelt:

10.000 €

Umsatzsteuer:

10.000 €

× 19 %

=

1.900 €

Steuerschuldner:

Becker

gemäß § 13a Abs. 1 Nr. 2 UStG.

---

⇨ 6. Steuerentstehung

Die Rechnung wird am 03.05. ausgestellt.

Die Erwerbsteuer entsteht nach

§ 13 Abs. 1 Nr. 6 UStG

mit Ausstellung der Rechnung.

Voranmeldungszeitraum:

Mai

---

⇨ 7. Vorsteuerabzug

Grundsätzlich steht Becker der Vorsteuerabzug aus dem innergemeinschaftlichen Erwerb nach

§ 15 Abs. 1 Satz 1 Nr. 3 UStG

zu.

Allerdings werden die Türen unterschiedlich verwendet.

---

► Drei Türen

Die drei Türen werden für steuerpflichtige Umsätze verwendet.

Hier besteht voller Vorsteuerabzug.

Vorsteuer:

3 × 1.000 €

=

3.000 €

Umsatzsteuer:

570 €

Vorsteuerabzug:

570 €

---

► Sieben Türen

Sieben Türen werden in ein steuerfrei vermietetes Mehrfamilienhaus eingebaut.

Die Vermietung ist nach § 4 Nr. 12 Buchst. a UStG steuerfrei.

Da diese Umsätze den Vorsteuerabzug ausschließen, besteht insoweit kein Vorsteuerabzug.

Vorsteuer:

0 €

---

⇨ 8. Ergebnis

Erwerbsteuer:

1.900 €

Vorsteuer:

570 €

Nicht abzugsfähige Vorsteuer:

1.330 €

---

⇨ Prüfungsschema

1. Gelangt ein Gegenstand aus einem EU-Mitgliedstaat nach Deutschland?

2. Unternehmer als Erwerber?

3. Erwerb für das Unternehmen?

4. Ort des Erwerbs (§ 3d UStG)

5. Steuerbarkeit (§ 1 Abs. 1 Nr. 5 UStG)

6. Steuerbefreiung prüfen

7. Bemessungsgrundlage bestimmen

8. Erwerbsteuer berechnen

9. Vorsteuerabzug nach § 15 UStG prüfen

10. Ausschluss des Vorsteuerabzugs beachten

---

⇨ Merksätze

Der innergemeinschaftliche Erwerb löst grundsätzlich Erwerbsteuer aus.

Vorsteuer erhält der Unternehmer jedoch nur, soweit die erworbenen Gegenstände für Umsätze verwendet werden, die zum Vorsteuerabzug berechtigen.

Steuerfreie Vermietungsumsätze (§ 4 Nr. 12 UStG) schließen den Vorsteuerabzug regelmäßig aus.

Beim gemischten Verwendungszweck ist die Vorsteuer aufzuteilen.

---

⇨ Klausurfallen

Prüfungsfalle Nr. 1:

Erwerbsteuer und Vorsteuer werden häufig gleichgesetzt.

Das ist falsch.

Erwerbsteuer entsteht immer.

Der Vorsteuerabzug ist gesondert zu prüfen.

Prüfungsfalle Nr. 2:

Steuerfreie Vermietung berechtigt grundsätzlich nicht zum Vorsteuerabzug.

Prüfungsfalle Nr. 3:

Bei gemischter Verwendung ist die Vorsteuer aufzuteilen.

Prüfungsfalle Nr. 4:

§ 4b UStG betrifft nur bestimmte innergemeinschaftliche Erwerbe.

Im Regelfall ist der Erwerb steuerpflichtig.
`
},
{
  id: "ust-binnenmarkt-reihengeschaeft-beistelltische-ausfuhrlieferung",
  title: "Binnenmarkt: Reihengeschäft mit Beistelltischen und Ausfuhrlieferung",
  short:
    "Reihengeschäft mit Ausfuhrlieferung nach Norwegen, Zuordnung der Warenbewegung, Lieferort, § 14c UStG und Vorsteuerabzug.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "reihengeschäft|beistelltische|ausfuhrlieferung|norwegen|lieferort|§3 abs6|§3 abs7|§4 nr1a|§6 ustg|§14c|vorsteuer",
  references: [
    "§ 1 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 4 Nr. 1a UStG",
    "§ 6 UStG",
    "§ 10 UStG",
    "§ 13 UStG",
    "§ 14c UStG",
    "§ 15 UStG"
  ],
  body: `
⇨ Reihengeschäft – Beistelltische

► Ausgangssachverhalt

Der Möbelhändler G verkauft drei Beistelltische an den norwegischen Händler K.

Da G keine passenden Tische mehr auf Lager hat, bestellt er diese beim Zwischenhändler F.

F versendet die Tische unmittelbar an K nach Oslo.

Es liegt damit ein Reihengeschäft mit drei Unternehmern vor:

F → G → K

---

⇨ 1. Vorüberlegung – Reihengeschäft

Mehrere Unternehmer schließen Kaufverträge über denselben Gegenstand.

Der Gegenstand gelangt unmittelbar vom ersten Lieferer an den letzten Abnehmer.

Somit liegt ein Reihengeschäft nach § 3 Abs. 6a UStG vor.

---

⇨ 2. Zuordnung der Warenbewegung

Der Transport wird durch F veranlasst.

Deshalb ist die Warenbewegung der Lieferung

F → G

zuzuordnen.

Diese Lieferung ist die bewegte Lieferung.

Lieferort:

Beginn der Beförderung

=

Köln

gemäß § 3 Abs. 6 UStG.

Die Lieferung

G → K

ist die unbewegte Lieferung.

Lieferort:

Ende der Beförderung

=

Oslo

gemäß § 3 Abs. 7 Satz 2 Nr. 2 UStG.

---

⇨ 3. Lieferung des F an G

F liefert die Tische an G.

Der Transport ist Nebenleistung und teilt das Schicksal der Hauptleistung.

Da F die Gegenstände als Lieferer unmittelbar ins Drittland versendet, handelt es sich um eine Ausfuhrlieferung.

Rechtsgrundlagen:

§ 4 Nr. 1a UStG

i.V.m.

§ 6 UStG

Ergebnis:

- steuerbar
- steuerfrei

Bemessungsgrundlage:

9.000 €

Der Umsatz ist im Voranmeldungszeitraum Februar zu erklären.

---

⇨ 4. Fehlerhafte Rechnung des F

F weist in seiner Rechnung

1.710 €

Umsatzsteuer aus.

Da die Lieferung steuerfrei ist, handelt es sich um einen unrichtigen Steuerausweis.

Rechtsgrundlage:

§ 14c Abs. 1 UStG

Folgen:

- F schuldet die ausgewiesene Umsatzsteuer.
- Eine Rechnungsberichtigung ist möglich.

---

⇨ 5. Lieferung des G an K

Diese Lieferung ist die unbewegte Lieferung.

Der Lieferort liegt in

Oslo.

Damit wird die Lieferung nicht im Inland ausgeführt.

Ergebnis:

- nicht steuerbar in Deutschland

Bemessungsgrundlage:

12.000 €

---

⇨ 6. Vorsteuerabzug des G

Grundsätzlich setzt der Vorsteuerabzug voraus,

dass gesetzlich geschuldete Umsatzsteuer vorliegt.

Die Lieferung des F ist jedoch steuerfrei.

Die ausgewiesene Umsatzsteuer beruht lediglich auf § 14c UStG.

Eine nach § 14c geschuldete Steuer berechtigt nicht zum Vorsteuerabzug.

Ergebnis:

Kein Vorsteuerabzug für G.

---

⇨ Prüfungsschema

1. Liegt ein Reihengeschäft vor?

2. Wer veranlasst den Transport?

3. Welche Lieferung ist die bewegte Lieferung?

4. Lieferort der bewegten Lieferung bestimmen.

5. Lieferort der unbewegten Lieferung bestimmen.

6. Steuerfreiheit (Ausfuhrlieferung) prüfen.

7. Fehlerhaften Steuerausweis (§ 14c UStG) prüfen.

8. Vorsteuerabzug prüfen.

---

⇨ Merksätze

Bei einem Reihengeschäft kann die Warenbewegung nur einer Lieferung zugeordnet werden.

Die bewegte Lieferung richtet sich grundsätzlich nach § 3 Abs. 6 UStG.

Die nachfolgende Lieferung ist regelmäßig die unbewegte Lieferung (§ 3 Abs. 7 UStG).

Eine Ausfuhrlieferung ist steuerfrei.

Ein unrichtiger Steuerausweis nach § 14c UStG begründet zwar eine Steuerschuld,

berechtigt den Leistungsempfänger jedoch nicht zum Vorsteuerabzug.

---

⇨ Klausurfallen

Prüfungsfalle Nr. 1:

Nicht jede Rechnung mit Umsatzsteuer berechtigt zum Vorsteuerabzug.

Prüfungsfalle Nr. 2:

§ 14c UStG erzeugt lediglich eine Steuerschuld des Rechnungsausstellers.

Prüfungsfalle Nr. 3:

Bei Reihengeschäften darf die Warenbewegung nur einer Lieferung zugeordnet werden.

Prüfungsfalle Nr. 4:

Die unbewegte Lieferung richtet sich nach § 3 Abs. 7 UStG und kann im Ausland ausgeführt werden.
`
},
{
  id: "ust-vorsteuerberichtigung-billigkeitsgruende",
  title: "Vorsteuerberichtigung aus Billigkeitsgründen (§ 15a UStG)",
  short:
    "Vorsteuerberichtigung aus Billigkeitsgründen bei teilunternehmerischer Nutzung eines Wirtschaftsguts und späterer Nutzungsänderung bzw. Veräußerung.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "vorsteuerberichtigung|billigkeitsgruende|§15a|§44ustdv|teilunternehmerisch|pkw|vereine|veraeusserung|vorsteuer",
  references: [
    "§ 15 Abs. 1 UStG",
    "§ 15a UStG",
    "§ 44 UStDV",
    "Abschn. 15.2c UStAE",
    "Abschn. 15a.1 UStAE"
  ],
  body: `
⇨ Vorsteuerberichtigung aus Billigkeitsgründen

► Grundsatz

Wird ein Wirtschaftsgut nur teilweise unternehmerisch genutzt, ist grundsätzlich nur der unternehmerisch genutzte Anteil zum Vorsteuerabzug berechtigt.

Verändert sich die unternehmerische Nutzung innerhalb des Berichtigungszeitraums, kann aus Billigkeitsgründen eine Vorsteuerberichtigung nach § 15a UStG erfolgen.

Die Bagatellgrenzen des § 44 UStDV müssen überschritten sein.

---

► Ausgangsfall

PKW-Anschaffung

Kaufpreis:
30.000 €

Umsatzsteuer:
5.700 €

Unternehmerische Nutzung:

50 %

Ideeller Bereich:

50 %

Vorsteuerabzug:

5.700 € × 50 %

=
2.850 €

---

► Jahr 03 – Erhöhung der unternehmerischen Nutzung

Die unternehmerische Nutzung steigt von

50 %

auf

70 %.

Da sich die zum Vorsteuerabzug berechtigende Verwendung erhöht, liegt eine Änderung der Verhältnisse nach § 15a UStG vor.

Berichtigungszeitraum:

5 Jahre

Vorsteuer insgesamt:

5.700 €

Änderung:

20 Prozentpunkte

Berechnung:

5.700 € ÷ 5

=
1.140 €

1.140 € × 20 %

=
228 €

Ergebnis:

Vorsteuerberichtigung

228 €

zugunsten des Unternehmers.

---

► Jahr 04 – Verkauf des PKW

Der PKW wird für

10.000 € netto

veräußert.

Da der PKW zuletzt zu

70 %

unternehmerisch genutzt wurde,

ist dieser Anteil steuerpflichtig.

Umsatzsteuer:

10.000 €

× 70 %

× 19 %

=
1.330 €

---

► Weitere Vorsteuerberichtigung

Auch die Veräußerung stellt eine Änderung der Verhältnisse dar.

Es erfolgt erneut eine Vorsteuerberichtigung nach § 15a UStG.

Vorsteuer insgesamt:

5.700 €

Berichtigungszeitraum:

5 Jahre

Änderung:

20 Prozentpunkte

Jährlicher Berichtigungsbetrag:

5.700 € ÷ 5 × 20 %

=
228 €

Restlaufzeit:

2 Jahre

Gesamtberichtigung:

228 €

× 2

=
456 €

Diese Berichtigung erfolgt zugunsten des Unternehmers.

---

► Prüfungsschema

1. Wirtschaftsgut mit Berichtigungszeitraum vorhanden?

2. Ursprünglicher Vorsteuerabzug ermitteln.

3. Änderung der Nutzung innerhalb des Berichtigungszeitraums?

4. Bagatellgrenzen (§ 44 UStDV) überschritten?

5. Neue Vorsteuerquote bestimmen.

6. Differenz der Nutzungsquote berechnen.

7. Vorsteuerberichtigung je Restjahr durchführen.

---

► Berechnungsformel

Vorsteuer insgesamt

÷ Berichtigungsjahre

× Nutzungsänderung

× verbleibende Jahre

=

Vorsteuerberichtigung

---

► Merksätze

Eine Erhöhung der unternehmerischen Nutzung führt regelmäßig zu einer Vorsteuerberichtigung zugunsten des Unternehmers.

Eine Verringerung der unternehmerischen Nutzung führt regelmäßig zu einer Vorsteuerberichtigung zulasten des Unternehmers.

Auch eine Veräußerung innerhalb des Berichtigungszeitraums kann eine Vorsteuerberichtigung auslösen.

Die Berichtigung erfolgt nur, wenn die Bagatellgrenzen des § 44 UStDV überschritten werden.

---

► Klausurtipp

Immer zuerst feststellen:

- ursprünglicher Vorsteuerabzug
- Berichtigungszeitraum (5 oder 10 Jahre)
- alte Nutzungsquote
- neue Nutzungsquote
- verbleibende Berichtigungsjahre

Erst danach wird der Berichtigungsbetrag berechnet.
`
},
{
  id: "ust-unternehmer-rahmen-des-unternehmens",
  title: "Unternehmer und Rahmen des Unternehmens (§ 2 UStG)",
  short:
    "Bestimmung der Unternehmereigenschaft, des Unternehmensumfangs sowie der Abgrenzung zwischen selbständiger und nichtselbständiger Tätigkeit.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "unternehmer|§2 ustg|selbständig|nichtselbständig|vorbereitungshandlungen|hilfsgeschäft|vermietung|grundgeschäft|geschäftsführer|ohg|gmbh",
  references: [
    "§ 2 Abs. 1 UStG",
    "§ 2 Abs. 2 Nr. 1 UStG",
    "Abschn. 2.1 UStAE",
    "Abschn. 2.6 UStAE",
    "Abschn. 2.7 UStAE"
  ],
  body: `

⇨ Unternehmer (§ 2 UStG)

Unternehmer ist, wer

- eine gewerbliche oder berufliche Tätigkeit
- selbständig
- nachhaltig
- zur Erzielung von Einnahmen

ausübt.

Dabei umfasst das Unternehmen grundsätzlich die gesamte gewerbliche oder berufliche Tätigkeit.

---

⇨ Fall 1 – Finanzbeamter als Dozent

► Sachverhalt

Ein Finanzbeamter unterrichtet samstags an der Steuerberaterakademie.

Seine Tätigkeit beim Finanzamt erfolgt weisungsgebunden.

► Lösung

⇶  Tätigkeit beim Finanzamt

Keine Selbständigkeit.

→ kein Unternehmer

Rechtsgrundlage:

§ 2 Abs. 2 Nr. 1 UStG

⇶  Unterricht an der Steuerberaterakademie

Die Unterrichtstätigkeit erfolgt eigenverantwortlich.

Sie stellt eine selbständige Tätigkeit dar.

Ergebnis:

- Unternehmer
- selbständige Tätigkeit
- eigenes Unternehmen

Merksatz:

Eine Person kann gleichzeitig Arbeitnehmer und Unternehmer sein.

---

⇨ Fall 2 – Arbeitnehmer stellt Rechnungen an seinen Arbeitgeber

► Sachverhalt

Ein Arbeitnehmer arbeitet sonntags zusätzlich für seinen Arbeitgeber und schreibt hierfür Rechnungen.

► Lösung

Entscheidend ist nicht die Rechnung,

sondern die tatsächlichen Verhältnisse.

Da die Tätigkeit weiterhin

- weisungsgebunden
- organisatorisch eingegliedert

ist,

liegt insgesamt keine Selbständigkeit vor.

Ergebnis:

- kein Unternehmer
- keine Umsatzsteuer
- Arbeitslohn

Merksatz:

Lohnsteuer und Umsatzsteuer schließen sich für dieselbe Tätigkeit aus.

---

⇨ Fall 3 – Sportgeschäft, Sonnenstudio und Vermietung

► Sachverhalt

Benno Ohm betreibt

- Sportgeschäft
- Sonnenstudio
- Vermietung eines unbebauten Grundstücks

Zusätzlich besitzt er ein selbst bewohntes Einfamilienhaus.

► Lösung

Unternehmer ist Ohm hinsichtlich

- Sporthandel
- Sonnenstudio
- Grundstücksvermietung

Alle Tätigkeiten bilden zusammen

ein Unternehmen.

Rechtsgrundlage:

§ 2 Abs. 1 UStG

Jede Tätigkeit stellt zwar ein eigenes Grundgeschäft dar,

gehört jedoch zum selben Unternehmen.

⇶  Nicht zum Unternehmen

Das privat genutzte Einfamilienhaus.

Es dient nicht der Erzielung von Einnahmen.

Deshalb gehört es nicht zum Unternehmen.

---

⇨ Fall 4 – Möbelhändler mit mehreren Tätigkeiten

► Sachverhalt

Jab betreibt

- Möbelhandel
- Vermietung
- Vorträge über Vogelkunde
- Veröffentlichung von Büchern

Außerdem

- verkauft er einen früher betrieblich genutzten Porsche,
- ist Gesellschafter einer OHG,
- ist Geschäftsführer einer GmbH.

► Lösung

⇶  Unternehmerische Tätigkeiten

Zum Unternehmen gehören

- Möbelhandel
- Vermietung
- Vogelkunde

Vorträge und Bücher bilden gemeinsam das Grundgeschäft "Vogelkunde".

---

⇶  Verkauf des Porsche

Der Verkauf eines früher betrieblich genutzten Wirtschaftsgutes stellt

ein Hilfsgeschäft

dar.

Auch Hilfsgeschäfte gehören zum Unternehmen.

Eine Nachhaltigkeit ist hierfür nicht erforderlich.

---

⇶  Beteiligung an der OHG

Die OHG

ist selbst Unternehmer.

Die Beteiligung allein begründet keine eigene Unternehmereigenschaft.

---

⇶  Geschäftsführer der GmbH

Als Geschäftsführer handelt Jab

weisungsgebunden.

Deshalb liegt gegenüber der GmbH

keine selbständige Tätigkeit vor.

Ergebnis:

- kein Unternehmer gegenüber der GmbH

Rechtsgrundlage:

§ 2 Abs. 2 Nr. 1 UStG

---

⇨ Fall 5 – Vorbereitungshandlungen

► Sachverhalt

Ein angestellter Rechtsanwalt möchte sich selbständig machen.

Er

- mietet Büroräume,
- bestellt einen Computer,

gibt die Gründungsabsicht jedoch vor Aufnahme der Tätigkeit wieder auf.

► Lösung

Bereits ernsthafte Vorbereitungshandlungen können

die Unternehmereigenschaft begründen.

Tatsächlich ausgeführte Umsätze

sind hierfür nicht erforderlich.

Voraussetzung ist,

dass die bezogenen Leistungen

objektiv

für eine spätere unternehmerische Tätigkeit bestimmt waren.

Ergebnis:

Der Unternehmerstatus entsteht bereits während der Vorbereitungsphase.

---

⇨ Prüfungsschema Unternehmereigenschaft

1. Liegt eine Tätigkeit vor?

2. Erfolgt sie selbständig?

3. Erfolgt sie nachhaltig?

4. Dient sie der Einnahmeerzielung?

5. Gehört sie zum bestehenden Unternehmen?

6. Handelt es sich lediglich um ein Hilfsgeschäft?

---

⇨ Merksätze

Das Unternehmen umfasst grundsätzlich die gesamte gewerbliche und berufliche Tätigkeit.

Mehrere unterschiedliche Tätigkeiten können zu einem Unternehmen gehören.

Hilfsgeschäfte gehören ebenfalls zum Unternehmen.

Weisungsgebundene Arbeitnehmer sind keine Unternehmer.

Vorbereitungshandlungen können bereits die Unternehmereigenschaft begründen.

Gesellschafter einer Personengesellschaft werden nicht allein durch ihre Beteiligung Unternehmer.

Geschäftsführer einer GmbH handeln regelmäßig nicht selbständig.

---

⇨ Klausurtipps

Prüfungsfalle Nr. 1:

Rechnungen machen einen Arbeitnehmer nicht automatisch zum Unternehmer.

Prüfungsfalle Nr. 2:

Hilfsgeschäfte (z.B. Verkauf von Anlagevermögen) gehören stets zum Unternehmen.

Prüfungsfalle Nr. 3:

Mehrere völlig unterschiedliche Tätigkeiten können umsatzsteuerlich ein einziges Unternehmen bilden.

Prüfungsfalle Nr. 4:

Bereits Vorbereitungshandlungen können den Unternehmerstatus begründen, auch wenn niemals Umsätze ausgeführt werden.
`
},
{
  id: "ust-unentgeltliche-wertabgabe-grundfaelle",
  title: "Unentgeltliche Wertabgaben – Grundfälle (§ 3 Abs. 1b und 3 Abs. 9a UStG)",
  short:
    "Systematische Prüfung der unentgeltlichen Wertabgabe bei Entnahmen, Schenkungen, Privatverwendungen und unentgeltlichen Dienstleistungen.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "unentgeltliche wertabgabe|entnahme|privatentnahme|schenkung|eigenverbrauch|§3 abs1b|§3 abs9a|dienstleistung|werkleistung|iPad|Armband|Garten|Mietwohnung",
  references: [
    "§ 3 Abs. 1b UStG",
    "§ 3 Abs. 9a UStG",
    "§ 1 Abs. 1 UStG",
    "§ 3a UStG",
    "§ 10 Abs. 4 UStG",
    "§ 12 UStG",
    "§ 13a UStG"
  ],
  body: `
⇨ Unentgeltliche Wertabgaben

Die unentgeltliche Wertabgabe dient dazu, einen zuvor gewährten Vorsteuerabzug auszugleichen, wenn Gegenstände oder Leistungen anschließend privat oder außerunternehmerisch verwendet werden.

Es wird unterschieden zwischen:

- unentgeltlicher Lieferung (§ 3 Abs. 1b UStG)
- unentgeltiger sonstiger Leistung (§ 3 Abs. 9a UStG)

---

⇨ Fall 1a – Material für eigenes Mietobjekt

Ein Elektriker entnimmt Kabel und Stecker aus seinem Lager und verwendet sie für ein ertragsteuerliches Privatvermögen zugeordnetes Mietwohnhaus.

► Lösung

Das Mietwohnhaus gehört umsatzsteuerlich weiterhin zum Unternehmen (§ 2 UStG), da es der Erzielung von Einnahmen dient.

Die Materialien werden somit weiterhin unternehmerisch verwendet.

Ergebnis:

- keine Entnahme
- keine unentgeltliche Wertabgabe
- keine Umsatzsteuer

Merksatz:

Privatvermögen im Ertragsteuerrecht bedeutet nicht automatisch Privatvermögen im Umsatzsteuerrecht.

---

⇨ Fall 1b – iPad für private Nutzung

Ein zu 100 % dem Unternehmen zugeordnetes iPad wird

80 %

unternehmerisch

20 %

privat genutzt.

Beim Kauf wurde die gesamte Vorsteuer abgezogen.

► Lösung

Die private Nutzung stellt eine unentgeltliche Wertabgabe nach

§ 3 Abs. 9a Nr. 1 UStG

dar.

Voraussetzungen:

- Gegenstand gehört zum Unternehmen
- Vorsteuerabzug wurde vorgenommen
- private Verwendung

Ergebnis:

- steuerbar
- steuerpflichtig
- Regelsteuersatz 19 %

---

⇨ Fall 1c – Gartenplanung durch Arbeitnehmer

Arbeitnehmer planen unentgeltlich den Garten des privaten Einfamilienhauses ihres Arbeitgebers.

► Lösung

Es handelt sich um eine unentgeltliche sonstige Leistung.

Rechtsgrundlage:

§ 3 Abs. 9a Nr. 2 UStG

Ein Vorsteuerabzug ist hierfür nicht erforderlich.

Ergebnis:

- steuerbar
- steuerpflichtig
- 19 %

---

⇨ Fall 1d – Geschenk eines Goldarmbands

Ein Juwelier schenkt seiner Tochter ein Goldarmband.

► Lösung

Die Schenkung stellt eine unentgeltliche Lieferung dar.

Rechtsgrundlage:

§ 3 Abs. 1b Nr. 1 UStG

Ort der Lieferung richtet sich nach § 3 Abs. 6 UStG.

Ergebnis:

- steuerbar
- steuerpflichtig
- 19 %

---

⇨ Fall 2 – Unentgeltliche Dacheindeckung

Ein Dachdecker deckt unentgeltlich das Mietwohnhaus seiner Ehefrau.

Material wird von der Ehefrau gestellt.

Das Unternehmen trägt lediglich:

- Löhne
- Sozialabgaben
- Fertigungsgemeinkosten

Gesamtkosten:

6.500 €

► Lösung

Es handelt sich um eine unentgeltliche Werkleistung.

Rechtsgrundlage:

§ 3 Abs. 9a Nr. 2 UStG

Bemessungsgrundlage:

§ 10 Abs. 4 UStG

=

entstandene Kosten

=

6.500 €

Umsatzsteuer:

6.500 €

× 19 %

=

1.235 €

---

⇨ Fall 3 – Dienstjubiläum

Ein Arbeitnehmer erhält

- einen Neuwagen
- zusätzlich 600 € Bargeld.

► Neuwagen

Der Wagen wird ausschließlich verschenkt.

Deshalb bestand bereits beim Einkauf keine Absicht, steuerpflichtige Ausgangsumsätze auszuführen.

Ergebnis:

- kein Vorsteuerabzug
- keine Wertabgabenbesteuerung

► Bargeld

Die Hingabe von Geld stellt keine Lieferung und keine sonstige Leistung dar.

Ergebnis:

- keine Umsatzsteuer

---

⇨ Prüfungsschema

1. Lieferung oder sonstige Leistung?

2. Unentgeltlich?

3. Privat oder außerunternehmerisch?

4. Vorsteuerabzug vorhanden bzw. erforderlich?

5. § 3 Abs. 1b oder § 3 Abs. 9a UStG einschlägig?

6. Bemessungsgrundlage (§ 10 Abs. 4 UStG)

7. Steuersatz bestimmen.

---

⇨ Merksätze

§ 3 Abs. 1b UStG

→ Gegenstände

§ 3 Abs. 9a UStG

→ Dienstleistungen und Nutzungen

Unentgeltliche Dienstleistungen benötigen regelmäßig keinen vorherigen Vorsteuerabzug.

Bei Gegenständen ist der Vorsteuerabzug häufig entscheidend.

Die Bemessungsgrundlage sind regelmäßig die Selbstkosten bzw. entstandenen Ausgaben.

---

⇨ Klausurtipps

Prüfungsfalle Nr. 1:

Ertragsteuerliches Privatvermögen ist nicht automatisch umsatzsteuerliches Privatvermögen.

Prüfungsfalle Nr. 2:

Bargeld unterliegt niemals der Umsatzsteuer.

Prüfungsfalle Nr. 3:

Bei Dienstleistungen (§ 3 Abs. 9a UStG) ist ein Vorsteuerabzug häufig keine Voraussetzung.

Prüfungsfalle Nr. 4:

Bei Werkleistungen ist regelmäßig § 10 Abs. 4 UStG für die Bemessungsgrundlage maßgeblich.
`
},
{
  id: "ust-kommission-vermittlung-rahmen-des-unternehmens",
  title: "Kommission, Vermittlung und Hilfsgeschäfte im Rahmen des Unternehmens",
  short:
    "Umsatzsteuerliche Behandlung von Kommissionsgeschäften, Vermittlungsleistungen, Lieferungen, Gutschriften und Vorsteuerabzug.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "kommission|vermittlung|kommissionär|kommittent|§3 abs3 ustg|§3 abs6 ustg|§3 abs7 ustg|gutschrift|vorsteuerabzug|bemessungsgrundlage|provision|rahmen des unternehmens",
  references: [
    "§ 1 Abs. 1 Nr. 1 UStG",
    "§ 3 Abs. 1 UStG",
    "§ 3 Abs. 3 UStG",
    "§ 3 Abs. 6 UStG",
    "§ 3 Abs. 7 UStG",
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 2 UStG",
    "§ 10 Abs. 1 UStG",
    "§ 12 Abs. 1 UStG",
    "§ 13 UStG",
    "§ 13a UStG",
    "§ 14 UStG",
    "§ 15 UStG"
  ],
  body: `
⇨ Kommission und Vermittlung

Bei Kommission und Vermittlung ist zuerst zu unterscheiden:

- echte Lieferung
- Kommissionsgeschäft
- Vermittlungsleistung
- Eigengeschäft
- Hilfsgeschäft

---

⇨ Fall 6 – Handelsvertreter vermittelt Maschine

► Sachverhalt

Handelsvertreter Ferter vermittelt eine Baumaschine.

Dast erwirbt die Maschine von Fastu.

Kaufpreis Maschine:

100.000 € netto

Dast kann keine Rechnung über den Einkauf vorlegen.

Ferter erhält eine Provision von 10 % des Nettoverkaufspreises.

Abrechnung erfolgt per Gutschrift.

► Ausgangsseite – Lieferung der Maschine von Dast an Fastu

Dast liefert die Maschine an Fastu.

Die Lieferung ist steuerbar und steuerpflichtig.

Ort der Lieferung:

Duisburg

Rechtsgrundlage:

§ 3 Abs. 6 UStG

Bemessungsgrundlage:

100.000 €

Umsatzsteuer:

19.000 €

Steuerschuldner:

Dast

► Eingangsseite – Einkauf der Maschine

Da Dast keine ordnungsgemäße Rechnung nach § 14 UStG vorlegen kann,

ist kein Vorsteuerabzug möglich.

Rechtsgrundlage:

§ 15 Abs. 1 Nr. 1 UStG

Merksatz:

Ohne ordnungsgemäße Rechnung kein Vorsteuerabzug.

► Vermittlungsleistung des Ferter

Ferter erbringt gegenüber Dast eine sonstige Leistung.

Es handelt sich um eine Vermittlungsleistung.

Ort der Leistung:

Duisburg

Rechtsgrundlage:

§ 3a Abs. 2 UStG

Die Leistung ist steuerbar und steuerpflichtig.

Provision:

10.000 € brutto

Bemessungsgrundlage:

10.000 € / 1,19

=
8.403,36 €

Umsatzsteuer:

1.596,64 €

► Vorsteuerabzug aus der Gutschrift

Liegt eine ordnungsgemäße Gutschrift vor,

kann Dast die Umsatzsteuer aus der Vermittlungsleistung als Vorsteuer abziehen.

Voraussetzungen:

- Leistung für das Unternehmen
- ordnungsgemäße Gutschrift
- kein Ausschluss nach § 15 Abs. 2 UStG

Ergebnis:

Vorsteuerabzug:

1.596,64 €

---

⇨ Fall 7 – Verkaufskommission Wein

► Sachverhalt

Kleber übernimmt von Winzer Pander 10.000 Liter Wein.

Er verkauft den Wein im eigenen Namen für Rechnung des Pander.

Provision:

15 % vom Verkaufspreis

Verkauf:

15.06. = 8.000 Liter

17.06. = 2.000 Liter

► Vorüberlegung

Es liegt eine Verkaufskommission vor.

Pander ist Kommittent.

Kleber ist Kommissionär.

Bei einem Kommissionsgeschäft werden umsatzsteuerlich Lieferungen fingiert.

Rechtsgrundlage:

§ 3 Abs. 3 UStG

Es liegen gleichzeitig Lieferungen vor:

1. Lieferung vom Kommittenten an den Kommissionär
2. Lieferung vom Kommissionär an den Abnehmer

Das bloße Verbringen des Weins in das Lager ist noch nicht entscheidend.

► Lieferung des Kleber an die Großhändler

Kleber liefert an die Großhändler.

Ort:

Koblenz

Die Lieferungen sind steuerbar und steuerpflichtig.

Bemessungsgrundlage:

20.000 € / 1,19

=
16.806,72 €

Umsatzsteuer:

3.193,28 €

Steuerschuldner:

Kleber

► Lieferung des Pander an Kleber

Pander liefert umsatzsteuerlich an Kleber.

Bemessungsgrundlage:

17.000 € / 1,19

=
14.285,71 €

Umsatzsteuer:

2.714,29 €

Steuerschuldner:

Pander

► Vorsteuerabzug Kleber

Aus der ordnungsgemäßen Rechnung des Pander kann Kleber die Vorsteuer abziehen.

Vorsteuer:

2.714,29 €

Voraussetzungen:

- Leistung für das Unternehmen
- ordnungsgemäße Rechnung
- kein Ausschluss nach § 15 Abs. 2 UStG

► Merksatz

Bei der Verkaufskommission gibt es umsatzsteuerlich zwei Lieferungen.

Kommittent an Kommissionär.

Kommissionär an Abnehmer.

---

⇨ Fall 8 – Kommission Messgeräte

► Sachverhalt

Klein verkauft als Kommissionär für die Jung-OHG Messgeräte.

Die OHG bringt die Geräte im Februar zu Klein.

Klein verkauft im März 11 Geräte an verschiedene Kunden.

Abrechnung:

Lieferungen an Kunden:

12.000 €

./. Provision:

1.800 €

An die OHG zu überweisen:

10.200 €

► Lösung

Zwischen OHG und Klein liegt ein Kommissionsgeschäft vor.

Die OHG ist Kommittentin.

Klein ist Kommissionär.

Rechtsgrundlage:

§ 3 Abs. 3 UStG

Umsatzsteuerlich werden Lieferungen fingiert.

► Lieferung der OHG an Klein

Die OHG liefert an Klein.

Ort der Lieferung:

Solingen

Die Lieferung ist steuerbar und steuerpflichtig.

Bemessungsgrundlage:

10.200 € / 1,19

=
8.571,43 €

Umsatzsteuer:

1.628,57 €

Steuerschuldner:

OHG

► Lieferung des Klein an die Kunden

Klein liefert an die Kunden.

Diese Lieferungen sind eigenständig zu beurteilen.

► Gutschrift

Damit Klein den Vorsteuerabzug erhält,

kann die Abrechnung wie folgt aufgebaut sein:

Lieferungen an Kunden:

12.000 €

./. Provision:

1.800 €

= Überweisung an OHG:

10.200 €

Enthaltene Lieferung der OHG an Klein:

8.571,43 €

zzgl. 19 % USt:

1.628,57 €

gesamt:

10.200 €

► Merksatz

Bei Kommission ist die Abrechnung wirtschaftlich oft nur eine Provisionsabrechnung.

Umsatzsteuerlich liegt trotzdem eine Lieferung des Kommittenten an den Kommissionär vor.

---

⇨ Fall 9 – Vermittlung eines Minibaggers

► Sachverhalt

Jabes vermittelt den Verkauf eines Minibaggers.

Rosen verkauft an Greifen.

Jabes erhält von Rosen eine Provision von brutto 500 €.

Abrechnung erfolgt per Gutschrift.

► Lösung

Jabes erbringt gegenüber Rosen eine Vermittlungsleistung.

Es handelt sich um eine sonstige Leistung.

Rechtsgrundlage:

§ 3 Abs. 9 UStG

Ort der Leistung:

Wuppertal

Rechtsgrundlage:

§ 3a Abs. 2 UStG

Die Leistung ist steuerbar und steuerpflichtig.

► Bemessungsgrundlage

Provision brutto:

500 €

Bemessungsgrundlage:

500 € / 1,19

=
420,17 €

Umsatzsteuer:

79,83 €

Steuerschuldner:

Jabes

► Gutschrift

Die Gutschrift durch Rosen führt bei Jabes zu keinen weiteren umsatzsteuerlichen Folgen,

wenn sie ordnungsgemäß erfolgt.

► Merksatz

Vermittlung ist keine Lieferung.

Vermittlung ist eine sonstige Leistung.

Die Provision ist das Entgelt.

---

⇨ Prüfungsschema Kommission

1. Handelt jemand im eigenen Namen?

2. Handelt er für fremde Rechnung?

3. Liegt ein Kommissionsgeschäft vor?

4. § 3 Abs. 3 UStG anwenden.

5. Fiktive Lieferung Kommittent an Kommissionär prüfen.

6. Lieferung Kommissionär an Abnehmer prüfen.

7. Bemessungsgrundlage und Umsatzsteuer berechnen.

8. Gutschrift / Rechnung prüfen.

9. Vorsteuerabzug prüfen.

---

⇨ Prüfungsschema Vermittlung

1. Vermittler bringt einen Vertrag zustande.

2. Vermittler liefert den Gegenstand nicht selbst.

3. Es liegt eine sonstige Leistung vor.

4. Ort nach § 3a UStG bestimmen.

5. Provision als Entgelt prüfen.

6. Umsatzsteuer aus Provision herausrechnen.

7. Rechnung oder Gutschrift prüfen.

8. Vorsteuerabzug beim Leistungsempfänger prüfen.

---

⇨ Merksätze

Kommission:

eigener Name

fremde Rechnung

= zwei Lieferungen

Vermittlung:

fremder Vertrag

Provision

= sonstige Leistung

Bei Kommission ist § 3 Abs. 3 UStG zentral.

Bei Vermittlung ist § 3 Abs. 9 UStG zentral.

Eine Gutschrift kann eine Rechnung ersetzen.

Ohne ordnungsgemäße Rechnung kein Vorsteuerabzug.

---

⇨ Klausurtipps

Prüfungsfalle Nr. 1:

Kommission und Vermittlung verwechseln.

Bei Kommission verkauft der Kommissionär im eigenen Namen.

Bei Vermittlung vermittelt er nur den Vertrag.

Prüfungsfalle Nr. 2:

Bei Kommission nur die Provision besteuern.

Das ist falsch.

Es liegen umsatzsteuerlich Lieferungen vor.

Prüfungsfalle Nr. 3:

Bruttobeträge nicht herausrechnen.

Bei Bruttopreisen:

BMG = Bruttobetrag / 1,19.

Prüfungsfalle Nr. 4:

Vorsteuerabzug ohne Rechnung annehmen.

Eine ordnungsgemäße Rechnung oder Gutschrift ist zwingend erforderlich.

`
},
{
  id: "ust-preisausschreiben-verlosung-werbegeschenke",
  title: "Preisausschreiben und Verlosung: Vorsteuer und unentgeltliche Wertabgabe",
  short:
    "Umsatzsteuerliche Behandlung von Preisen aus Werbeaktionen: Vorsteuerabzug, Geschenke geringen Werts und unentgeltliche Wertabgabe.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "preisausschreiben|verlosung|werbegeschenk|geschenk geringen werts|unentgeltliche wertabgabe|§ 3 abs. 1b ustg|§ 15 ustg|§ 15 abs. 1a ustg|vorsteuerabzug|werbemaßnahme|roller|bücher|7 prozent",
  references: [
    "§ 3 Abs. 1b UStG",
    "§ 15 Abs. 1 UStG",
    "§ 15 Abs. 1a UStG",
    "§ 4 Abs. 5 Nr. 1 EStG",
    "§ 12 Abs. 2 Nr. 1 UStG",
    "Anlage 2 zum UStG",
    "Abschn. 15.15 UStAE"
  ],
  body: `
⇨ Preisausschreiben und Verlosung

► Grundsatz

Bei einem Preisausschreiben oder einer Verlosung im Rahmen einer Werbemaßnahme ist umsatzsteuerlich zu prüfen:

1. Ist der Einkauf der Preise zum Vorsteuerabzug berechtigt?
2. Führt die spätere Hingabe an die Gewinner zu einer unentgeltlichen Wertabgabe?

► Werbemaßnahme

Ein Preisausschreiben kann eine unternehmerisch veranlasste Werbemaßnahme sein.

Die Zuwendung der Preise fällt dann grundsätzlich nicht unter das ertragsteuerliche Abzugsverbot für Geschenke nach § 4 Abs. 5 Nr. 1 EStG.

Ein Vorsteuerausschluss nach § 15 Abs. 1a UStG liegt dann grundsätzlich nicht vor.

► 1. Preis: Hochwertiger Gewinn

Beispiel:

Elektro-City-Roller

Einkauf:

3.000 Euro zzgl. 570 Euro Umsatzsteuer

Der Roller wird von Anfang an mit der Absicht erworben, ihn im Rahmen der Werbeaktion zu verlosen.

► Vorsteuerabzug beim hochwertigen Preis

Steht bereits beim Leistungsbezug fest, dass der Gegenstand verlost werden soll, berechtigt der Einkauf grundsätzlich nicht zum Vorsteuerabzug, wenn die Voraussetzungen für eine spätere Wertabgabenbesteuerung nicht erfüllt sind.

Der Gegenstand wird nicht für zum Vorsteuerabzug berechtigende Ausgangsumsätze verwendet, sondern zur unentgeltlichen Weitergabe an den Gewinner.

► Unentgeltliche Wertabgabe beim hochwertigen Preis

Die Hingabe des Rollers erfolgt aus unternehmerischen Gründen.

Der Vorgang fällt der Art nach unter § 3 Abs. 1b Nr. 3 UStG.

Da jedoch kein Vorsteuerabzug aus dem Erwerb möglich war, unterbleibt die Besteuerung einer unentgeltlichen Wertabgabe.

Merksatz:

Keine Vorsteuer beim Einkauf

=
keine Wertabgabenbesteuerung bei der Hingabe.

► Geschenke von geringem Wert

Bei Geschenken von geringem Wert liegt keine steuerbare unentgeltliche Wertabgabe nach § 3 Abs. 1b Nr. 3 UStG vor.

► 2. bis 10. Preis: Bücher

Beispiel:

Bildbände

Einkauf je Buch:

30 Euro zzgl. 2,10 Euro Umsatzsteuer

Die Bücher stellen Geschenke von geringem Wert dar.

Die Hingabe an die Gewinner ist daher nicht steuerbar nach § 3 Abs. 1b Nr. 3 UStG.

► Vorsteuerabzug bei Büchern

Da die Bücher im Rahmen einer Werbemaßnahme eingesetzt werden und den unternehmerischen Umsätzen dienen, ist der Vorsteuerabzug grundsätzlich möglich.

Die Vorsteuer richtet sich nach der ordnungsgemäßen Rechnung.

Bücher unterliegen dem ermäßigten Steuersatz von 7 %.

Beispiel:

30 Euro x 7 %

=
2,10 Euro Vorsteuer je Buch

Die Vorsteuer ist im Voranmeldungszeitraum des Leistungsbezugs abziehbar.

► Prüfungsschema

1. Liegt eine Werbemaßnahme vor?

2. Wurde der Gegenstand für unternehmerische Zwecke erworben?

3. Ist der Gegenstand ein Geschenk von geringem Wert?

4. Ist die Eingangsleistung direkt und unmittelbar den Ausgangsumsätzen zuordenbar?

5. Besteht ein Vorsteuerausschluss nach § 15 Abs. 1a UStG?

6. Wurde beim Erwerb Vorsteuer abgezogen?

7. Liegt bei Hingabe eine unentgeltliche Wertabgabe nach § 3 Abs. 1b UStG vor?

► Rechtsfolgen

Hochwertiger Preis:

- keine Vorsteuer, wenn von Anfang an die Verlosung beabsichtigt war und keine steuerbare Wertabgabe folgt
- keine Wertabgabenbesteuerung bei Hingabe, wenn kein Vorsteuerabzug möglich war

Geschenk von geringem Wert:

- Vorsteuerabzug grundsätzlich möglich
- Hingabe nicht steuerbar nach § 3 Abs. 1b Nr. 3 UStG

► Prüfungsmerksätze

Preisausschreiben ist regelmäßig eine Werbemaßnahme.

Geschenke von geringem Wert führen nicht zur unentgeltlichen Wertabgabe.

Bei hochwertigen Preisen ist der Vorsteuerabzug kritisch.

Eine unentgeltliche Wertabgabe setzt regelmäßig voraus, dass der Gegenstand oder seine Bestandteile zum Vorsteuerabzug berechtigt haben.

► Klausurtipp

Typische Prüfungsfalle:

Viele ziehen beim hochwertigen Verlosungsgewinn automatisch die Vorsteuer ab.

Das ist falsch, wenn bereits beim Einkauf feststeht, dass der Gegenstand unentgeltlich verlost wird und kein steuerbarer Ausgangsumsatz entsteht.

Bei geringwertigen Werbegeschenken ist der Vorsteuerabzug dagegen regelmäßig möglich.

Merksatz:

Hochwertiger Verlosungsgewinn:

Vorsteuer prüfen.

Geringwertiges Werbegeschenk:

Vorsteuer meist möglich, keine Wertabgabe.
`
},
{
  id: "ust-vorsteuerberichtigung-gemischt-genutztes-gebaeude",
  title: "Vorsteuerberichtigung bei gemischt genutzten Gebäuden (§ 15a UStG)",
  short:
    "Vorsteuerberichtigung bei Änderung der unternehmerischen oder privaten Nutzung sowie bei späterer Grundstücksveräußerung.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "§ 15a ustg|vorsteuerberichtigung|gemischt genutztes gebäude|privatnutzung|unternehmerische nutzung|§ 44 ustdv|grundstücksveräußerung|steuerfreie veräußerung|steuerpflichtige veräußerung|berichtigungszeitraum",
  references: [
    "§ 15a UStG",
    "§ 15a Abs. 6a UStG",
    "§ 15a Abs. 8 UStG",
    "§ 15 Abs. 1b UStG",
    "§ 44 UStDV",
    "§ 4 Nr. 9 Buchst. a UStG",
    "§ 9 UStG",
    "§ 13b Abs. 2 Nr. 3 UStG"
  ],
  body: `
⇨ Vorsteuerberichtigung bei gemischt genutzten Gebäuden

► Grundsatz

Wird ein Gebäude sowohl unternehmerisch als auch privat genutzt, ist für den Vorsteuerabzug entscheidend, in welchem Umfang das Gebäude dem Unternehmen zugeordnet wurde und in welchem Umfang die Nutzung zum Vorsteuerabzug berechtigt.

Ändert sich später die tatsächliche Verwendung, kann eine Vorsteuerberichtigung nach § 15a UStG erforderlich sein.

► Berichtigungszeitraum

Bei Grundstücken und Gebäuden beträgt der Berichtigungszeitraum 10 Jahre.

Der Zeitraum beginnt mit der erstmaligen Verwendung des Gebäudes.

Beispiel:

Erstmalige Verwendung:
01.01.02

Berichtigungszeitraum:
01.01.02 bis 31.12.11

► Änderung der Verhältnisse

Eine Änderung der Verhältnisse liegt vor, wenn sich der Umfang der zum Vorsteuerabzug berechtigenden Verwendung ändert.

Beispiele:

- unternehmerische Nutzung steigt
- unternehmerische Nutzung sinkt
- private Nutzung steigt
- steuerpflichtige Nutzung wird steuerfrei
- steuerfreie Veräußerung
- steuerpflichtige Veräußerung

► Erhöhung der unternehmerischen Nutzung

Erhöht sich die unternehmerische Nutzung, kann eine Berichtigung zugunsten des Unternehmers erfolgen.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Tatsächliche zum Vorsteuerabzug berechtigende Verwendung:
52 %

Änderung:
+12 Prozentpunkte

Berechnung:

57.000 Euro Vorsteuer
x 1/10
x 12 %

=
684 Euro

Ergebnis:

684 Euro sind zugunsten des Unternehmers zu korrigieren.

► Erhöhung der privaten Nutzung

Erhöht sich die private Nutzung, sinkt die unternehmerische Verwendung.

Dann ist eine Berichtigung zu Ungunsten des Unternehmers vorzunehmen.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Neue zum Vorsteuerabzug berechtigende Verwendung:
25 %

Änderung:
-15 Prozentpunkte

Berechnung:

57.000 Euro Vorsteuer
x 1/10
x 15 %

=
855 Euro

Ergebnis:

855 Euro sind zu Ungunsten des Unternehmers zu korrigieren.

► Veräußerung des Gebäudes

Wird ein Gebäude innerhalb des Berichtigungszeitraums veräußert, ist ebenfalls § 15a UStG zu prüfen.

Dabei kommt es darauf an, ob die Veräußerung steuerfrei oder steuerpflichtig erfolgt.

► Steuerfreie Grundstücksveräußerung

Eine steuerfreie Veräußerung nach § 4 Nr. 9 Buchst. a UStG führt für den verbleibenden Berichtigungszeitraum zu einer Nutzung von 0 % zum Vorsteuerabzug.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Ab Veräußerung:
0 %

Änderung:
40 Prozentpunkte

Jahresbetrag:

57.000 Euro / 10 Jahre = 5.700 Euro

Berichtigung pro Jahr:

5.700 Euro x 40 %

=
2.280 Euro

Wenn noch die Jahre 09 bis 11 betroffen sind:

3 Jahre x 2.280 Euro

=
6.840 Euro

Die Berichtigung erfolgt zu Ungunsten des Unternehmers.

► Steuerpflichtige Grundstücksveräußerung

Wird zur Steuerpflicht optiert, gilt die Veräußerung für den verbleibenden Berichtigungszeitraum als Verwendung zu 100 % für vorsteuerunschädliche Umsätze.

Beispiel:

Ursprünglicher Vorsteuerabzug:
40 %

Ab Veräußerung:
100 %

Änderung:
60 Prozentpunkte

Jahresbetrag:

57.000 Euro / 10 Jahre = 5.700 Euro

Berichtigung pro Jahr:

5.700 Euro x 60 %

=
3.420 Euro

Wenn noch die Jahre 09 bis 11 betroffen sind:

3 Jahre x 3.420 Euro

=
10.260 Euro

Die Berichtigung erfolgt zugunsten des Unternehmers.

► Zusammenfassung der Beispiele

Fall 1:

Unternehmerische Nutzung steigt von 40 % auf 52 %.

Berichtigung:

57.000 Euro x 1/10 x 12 %

=
684 Euro zugunsten des Unternehmers.

Fall 2:

Unternehmerische Nutzung sinkt von 40 % auf 25 %.

Berichtigung:

57.000 Euro x 1/10 x 15 %

=
855 Euro zu Ungunsten des Unternehmers.

Fall 3:

Steuerfreie Veräußerung:

0 % statt 40 %

=
40 Prozentpunkte Änderung zu Ungunsten.

Fall 4:

Steuerpflichtige Veräußerung:

100 % statt 40 %

=
60 Prozentpunkte Änderung zugunsten.

► Bagatellgrenzen nach § 44 UStDV

Die Bagatellgrenzen des § 44 UStDV sind zu prüfen.

Wird die Grenze überschritten, ist die Vorsteuerberichtigung durchzuführen.

Bei Grundstücksveräußerungen werden die Berichtigungsbeträge für die verbleibenden Jahre zusammengefasst.

► Prüfungsschema

1. Wurde ursprünglich Vorsteuer abgezogen?

2. Liegt ein Berichtigungsobjekt vor?

3. Grundstück oder Gebäude?

4. Berichtigungszeitraum 10 Jahre bestimmen.

5. Ursprüngliche zum Vorsteuerabzug berechtigende Verwendung feststellen.

6. Tatsächliche spätere Verwendung feststellen.

7. Änderung in Prozentpunkten berechnen.

8. Jahresbetrag bestimmen:

Vorsteuer / 10

9. Jahresbetrag x Änderungsquote.

10. Bei Veräußerung:

Restzeitraum zusammenfassen.

► Prüfungsmerksätze

Gebäude haben einen Berichtigungszeitraum von 10 Jahren.

Maßgeblich ist der Unterschied zwischen ursprünglichem Vorsteuerabzug und späterer tatsächlicher Verwendung.

Mehr unternehmerische Nutzung:

Berichtigung zugunsten.

Mehr private oder steuerfreie Nutzung:

Berichtigung zu Ungunsten.

Steuerfreie Veräußerung:

0 % Vorsteuerverwendung.

Steuerpflichtige Veräußerung:

100 % Vorsteuerverwendung.

► Klausurtipp

Typische Prüfungsfalle:

Bei einer steuerpflichtigen Grundstücksveräußerung wird oft vergessen, dass diese für § 15a UStG als 100-%-Verwendung für zum Vorsteuerabzug berechtigende Umsätze gilt.

Merksatz:

Steuerfrei verkauft = 0 %.

Steuerpflichtig verkauft = 100 %.
`
},
{
id:"ust-reverse-charge-grundstueck",
title:"Reverse-Charge bei Grundstückslieferungen",
category:"Umsatzsteuer",

references:[
"§13b Abs.2 Nr.3 UStG",
"§13b Abs.5 UStG"
],

body:`

⇨ Reverse Charge

Bei bestimmten Grundstückslieferungen schuldet nicht der Verkäufer,

sondern der Leistungsempfänger die Umsatzsteuer.

---

► Bemessungsgrundlage

Kaufpreis

ohne Umsatzsteuer.

Die Grunderwerbsteuer gehört nicht zum Entgelt.

---

► Klausurhinweis

Immer prüfen,

ob §13b UStG einschlägig ist.

`
},
{
id:"ust-uneinbringliche-forderung",
title:"Uneinbringliche Forderungen (§17 UStG)",
category:"Umsatzsteuer",

keywords:"17 ustg|insolvenz|uneinbringlich|berichtigung",

references:[
"§17 UStG"
],

body:`

⇨ Uneinbringliche Forderungen

Wird eine Forderung uneinbringlich,

ist die Bemessungsgrundlage nach §17 UStG zu berichtigen.

---

► Typischer Fall

Eröffnung des Insolvenzverfahrens.

Ab diesem Zeitpunkt gelten offene Forderungen regelmäßig als uneinbringlich.

---

► Folge

Die Umsatzsteuer wird berichtigt.

Bereits erklärte Umsatzsteuer

→ Korrektur auf 0,

soweit die Forderung uneinbringlich geworden ist.

---

► Prüfung

1. Forderung entstanden?

2. Uneinbringlichkeit?

3. Berichtigung nach §17 UStG.

`
},
{
id:"ust-vollzuordnung-gebaeude",
title:"Vollständige Zuordnung eines gemischt genutzten Gebäudes",
category:"Umsatzsteuer",

references:[
"§15 Abs.1b UStG"
],

body:`

⇨ Vollzuordnung

Ordnet der Unternehmer das gesamte Gebäude seinem Unternehmen zu,

ist der Vorsteuerabzug dennoch nur insoweit zulässig,

wie das Gebäude für unternehmerische Umsätze verwendet wird.

---

► Laufende Kosten

Sind die Aufwendungen nicht eindeutig zuordenbar,

erfolgt die Aufteilung regelmäßig nach dem Verhältnis der Nutzflächen.

---

► Merksatz

Vollständige Zuordnung

≠

vollständiger Vorsteuerabzug.

`
},
{
id:"ust-vorsteuer-grundstueckserwerb",
title:"Vorsteuerabzug beim Grundstückserwerb",
category:"Umsatzsteuer",

references:[
"§15 Abs.1 Nr.4 UStG"
],

body:`

⇨ Vorsteuerabzug

Der Leistungsempfänger kann die nach §13b geschuldete Umsatzsteuer gleichzeitig als Vorsteuer abziehen,

wenn

- das Grundstück für steuerpflichtige Umsätze verwendet wird,

und

- kein Ausschlusstatbestand nach §15 Abs.2 UStG vorliegt.

---

► Folge

Vorsteuerabzug in voller Höhe möglich.

`
},
{
  id: "ust-grundstuecksveraeusserung-gi",
  title: "Geschäftsveräußerung im Ganzen bei Grundstücken",
  category: "Umsatzsteuer",

  references:[
    "§1 Abs.1a UStG"
  ],

  body:`

⇨ Prüfung

Eine nicht steuerbare Geschäftsveräußerung liegt nur vor, wenn

- ein Unternehmen oder Teilbetrieb übertragen wird

und

- der Erwerber die bisherige Tätigkeit fortführt.

---

► Keine Geschäftsveräußerung

Verwendet der Erwerber das Grundstück künftig für einen anderen Zweck,

liegt keine Geschäftsveräußerung im Ganzen vor.

---

► Merksatz

Andere Nutzung

=

keine Geschäftsveräußerung.

`
},
{
  id: "ust-grundstuecksveraeusserung-option",
  title: "Veräußerung eines unbebauten Grundstücks mit Option zur Steuerpflicht",
  short: "Umsatzsteuerliche Behandlung einer Grundstückslieferung mit Verzicht auf die Steuerbefreiung.",
  category: "Umsatzsteuer",
  keywords: [
    "Grundstück",
    "§4 Nr9a",
    "§9 UStG",
    "Option",
    "Steuerbefreiung"
  ],

  references: [
    "§3 Abs.1 UStG",
    "§4 Nr.9 Buchst. a UStG",
    "§9 Abs.1 UStG",
    "§9 Abs.3 UStG"
  ],

  body: `
⇨ Grundsatz

Die Lieferung eines unbebauten Grundstücks ist grundsätzlich nach §4 Nr.9 Buchst. a UStG steuerfrei.

---

⇨ Option zur Steuerpflicht

Verkauft der Unternehmer an einen anderen Unternehmer für dessen Unternehmen, kann auf die Steuerbefreiung verzichtet werden (§9 UStG).

Voraussetzungen:

- Lieferung an Unternehmer
- Verwendung für dessen Unternehmen
- Verzicht im notariellen Kaufvertrag erklärt

---

⇨ Folge

Die Grundstückslieferung wird steuerpflichtig.

Regelsteuersatz: 19 %

`
},
{
id:"ust-nebenleistung-betriebsvorrichtung",
title:"Nebenleistung oder eigenständige Betriebsvorrichtung?",
category:"Umsatzsteuer",

body:`

⇨ Prüfung

► Endverbraucher

Betriebsvorrichtungen

teilen regelmäßig das Schicksal der Hauptleistung.

→ Nebenleistung

---

► Unternehmer (Zwischenvermietung)

Betriebsvorrichtungen können eigenständig steuerpflichtig sein.

Eine Aufteilung der Leistungen ist zu prüfen.

---

► Typische Klausurfalle

Nicht jede Lichtanlage ist automatisch Nebenleistung.

Entscheidend ist,

wer Leistungsempfänger ist.

`
},
{
id:"ust-tennishalle-zwischenvermietung",
title:"Zwischenvermietung einer Tennishalle an Unternehmer",
category:"Umsatzsteuer",

keywords:"zwischenvermietung|betriebsvorrichtung|sportanlage|4 nr 12 ustg",

references:[
"§4 Nr.12 UStG",
"Abschn. 4.12.11 UStAE"
],

body:`

⇨ Vermietung an Betreiber

Wird die Tennishalle an einen Unternehmer vermietet,

der sie seinerseits weitervermietet,

liegt eine Zwischenvermietung vor.

---

► Aufteilung

Die Leistung ist aufzuteilen in

✓ steuerfreie Grundstücksvermietung (§4 Nr.12 UStG)

und

✓ steuerpflichtige Vermietung der Betriebsvorrichtungen.

---

► Betriebsvorrichtungen

Beispiele

- Lichtanlage

- technische Einrichtungen

- Sporteinrichtungen

---

► Klausurhinweis

Zwischenvermietung

≠

Endverbraucher.

Hier erfolgt regelmäßig eine Aufteilung.

`
},
{
  id: "ust-tennishalle-endverbraucher",
  title: "Vermietung einer Tennishalle an Endverbraucher",
  short: "Umsatzsteuerliche Behandlung der kurzfristigen Vermietung einer Sportanlage an Privatpersonen.",
  category: "Umsatzsteuer",
  keywords: "tennishalle|sportanlage|endverbraucher|grundstück|betriebsvorrichtung|19%",

  references: [
    "§ 3 Abs. 9 UStG",
    "§ 3a Abs. 3 Nr. 1 UStG",
    "§ 12 Abs. 1 UStG"
  ],

  body: `

⇨ Kurzfristige Hallenvermietung

Die Vermietung einer Tennishalle an Endverbraucher stellt eine sonstige Leistung (§3 Abs.9 UStG) dar.

---

► Leistungsort

Grundstücksbezogene Leistung

→ Ort des Grundstücks (§3a Abs.3 Nr.1 UStG)

---

► Lichtanlage

Die Überlassung der Beleuchtung ist eine unselbständige Nebenleistung.

Sie teilt das steuerliche Schicksal der Hallenvermietung.

Keine getrennte Beurteilung.

---

► Umsatzsteuer

Die gesamte Leistung unterliegt dem Regelsteuersatz von 19 %.

Eine Aufteilung in

- steuerfreie Grundstücksvermietung
- steuerpflichtige Betriebsvorrichtung

erfolgt bei Vermietung an Endverbraucher nicht.

---

► Merksatz

Endverbraucher

→ einheitliche steuerpflichtige Leistung.

`
},
{
  id: "ust-vorsteuerberichtigung-gebaeude-15a",
  title: "Vorsteuerberichtigung bei Gebäuden (§ 15a UStG)",
  short:
    "Prüfung einer Vorsteuerberichtigung bei Änderung der Verwendung eines Gebäudes oder Gebäudebestandteils.",
  category: "Umsatzsteuer",
  keywords:
    "§15a ustg|vorsteuerberichtigung|gebäude|fenster|änderung der verhältnisse",
  references: [
    "§ 15a UStG",
    "§ 15 UStG",
    "§ 44 UStDV"
  ],
  body: `

⇨ Prüfungsschema §15a UStG

► 1. Ursprünglicher Vorsteuerabzug

- ordnungsgemäße Rechnung (§15 UStG)
- ursprünglicher Vorsteuerabzug zulässig

---

► 2. Änderung der Verhältnisse

Prüfen:

Hat sich die tatsächliche Verwendung gegenüber der ursprünglichen Verwendung geändert?

Beispiele

- steuerpflichtig → steuerfrei
- privat → unternehmerisch
- gemischte Nutzung

---

► 3. Berichtigungsobjekt

Bei Gebäuden gehören eingebaute Bestandteile (Fenster, Türen, Heizungen usw.) nach Einbau regelmäßig zum Gebäude.

Eigenständiger Berichtigungszeitraum:

10 Jahre (§15a Abs.1 UStG)

---

► 4. Berichtigung

Berichtigung jährlich

Vorsteuer × Nutzungsänderung × 1/10

anteilige Monate berücksichtigen.

---

► Merksatz

Entscheidend ist nicht die geplante,

sondern die tatsächliche Verwendung.

`
},
{
  id: "umwstg-anteilstausch-21",
  title: "Anteilstausch nach § 21 UmwStG",
  short:
    "Prüfung des Anteilstauschs und Voraussetzungen für den Buchwertansatz.",
  category: "Umwandlungssteuer",
  keywords:
    "§21 umwstg|anteilstausch|buchwert|gemeiner wert|holding|mehrheit stimmrechte",
  references: [
    "§ 21 UmwStG",
    "§ 22 UmwStG",
    "§ 1 UmwStG"
  ],
  body: `

⇨ Anteilstausch

► Sachlicher Anwendungsbereich

Ein Anteilstausch liegt vor, wenn

- Anteile an einer Kapitalgesellschaft
- auf eine andere Kapitalgesellschaft übertragen werden
- und der Einbringende als Gegenleistung neue Anteile erhält.

---

► Persönlicher Anwendungsbereich

Der übernehmende Rechtsträger muss unter den persönlichen Anwendungsbereich des UmwStG fallen (§1 Abs.4 UmwStG).

---

► Steuerliche Wirkung

Die steuerliche Wirkung tritt mit Übergang von Nutzen und Lasten ein.

Eine steuerliche Rückwirkung (§§2,20 UmwStG) ist beim Anteilstausch ausgeschlossen.

---

► Buchwertansatz (§21 Abs.1 S.2 UmwStG)

Voraussetzungen:

✓ Mehrheit der Stimmrechte nach Einbringung

✓ keine weitere Gegenleistung außer neuen Anteilen

---

► Folgen

Erfüllt:

→ Buchwertansatz möglich

Nicht erfüllt:

→ Ansatz zum gemeinen Wert

---

► Merksatz

Anteilstausch = steuerneutral nur über den Buchwertansatz des §21 UmwStG.

`
},
{
  id: "umwstg-einbringungsgewinn-ii-sperrfrist",
  title: "Umwandlungssteuer: Sperrfrist und Einbringungsgewinn II",
  short:
    "Prüfungsschema zum Sperrfristverstoß nach § 22 UmwStG und den steuerlichen Folgen für Einbringenden und übernehmende Kapitalgesellschaft.",
  category: "Umwandlungssteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "umwstg|einbringungsgewinn ii|sperrfrist|§ 22 umwstg|§ 23 umwstg|einbringung|holding|anteilsveräußerung|anschaffungskosten",
  references: [
    "§ 21 UmwStG",
    "§ 22 UmwStG",
    "§ 23 UmwStG",
    "§ 17 EStG",
    "§ 3 Nr. 40 EStG",
    "§ 3c Abs. 2 EStG",
    "§ 8b KStG"
  ],
  body: `

⇨ Sperrfrist nach § 22 UmwStG

► Wann liegt ein Sperrfristverstoß vor?

Ein Sperrfristverstoß liegt vor, wenn

- Anteile unter dem gemeinen Wert eingebracht wurden,
- die erhaltenen Anteile innerhalb der siebenjährigen Sperrfrist veräußert werden,
- die Veräußerung beim Einbringenden steuerpflichtig gewesen wäre.

Rechtsfolge:

Einbringungsgewinn II nach § 22 Abs. 2 UmwStG.

---

► Berechnung

Gemeiner Wert der eingebrachten Anteile

./. angesetzter Einbringungswert

= stille Reserven

./. bereits abgelaufene Siebtel

= Einbringungsgewinn II

---

► Folgen bei der übernehmenden GmbH (§ 23 UmwStG)

Der Einbringungsgewinn II

- erhöht die Anschaffungskosten der Beteiligung,
- führt handelsrechtlich zu einem Ertrag,
- dieser Ertrag ist außerbilanziell wieder zu kürzen.

Merksatz:

Keine Doppelbesteuerung.

---

► Folgen beim Einbringenden

Der Einbringungsgewinn II gilt als nachträgliche Anschaffungskosten der neuen Beteiligung.

Dadurch erhöhen sich die Anschaffungskosten der Holding-Anteile.

Bei einer späteren Veräußerung vermindert sich dadurch der steuerpflichtige Veräußerungsgewinn.

---

► Prüfungsschema

1. Einbringung nach § 21 UmwStG?
2. Buchwert oder Zwischenwert?
3. Sperrfrist von sieben Jahren?
4. Veräußerung innerhalb der Frist?
5. Steuerpflicht beim Einbringenden?
6. Einbringungsgewinn II berechnen.
7. Anschaffungskosten nach § 23 UmwStG erhöhen.

---

► Klausurklassiker

❌ Sperrfrist vergessen.

❌ Anschaffungskosten nicht erhöhen.

❌ Außerbilanzielle Kürzung bei der GmbH vergessen.

---

► Merksatz

Einbringungsgewinn II besteuert nachträglich die bei der Einbringung zunächst aufgeschobenen stillen Reserven.

`
},
{
  id: "npo-wgb-freigrenze-gewinnermittlung-pauschalierung",
  title: "Wirtschaftlicher Geschäftsbetrieb: Freigrenze, Gewinnermittlung und Pauschalierung",
  short:
    "§ 64 AO: 50.000-€-Freigrenze, Gewinnermittlung, 15-%-Pauschalierung und Freibetrag nach § 24 KStG.",
  category: "NPO / Gemeinnützigkeit",
  source: "Interne Steuerstoff-Wissensdatenbank – Gemeinnützigkeit",
  keywords:
    "wirtschaftlicher geschäftsbetrieb|wgb|§ 64 ao|50.000 euro|freigrenze|bruttoeinnahmen|gewinnermittlung|pauschalierung|15 %|sponsoring|werbung|§ 64 abs. 6 ao|§ 24 kstg|freibetrag|körperschaftsteuer",
  references: [
    "§ 64 AO",
    "§ 64 Abs. 3 AO",
    "§ 64 Abs. 6 AO",
    "§ 24 KStG",
    "§ 8 KStG",
    "§ 4 Abs. 4 EStG"
  ],
  body: `

⇨ Wirtschaftlicher Geschäftsbetrieb – Freigrenze, Gewinnermittlung und Pauschalierung

► 1. Freigrenze nach § 64 Abs. 3 AO

Die Vereinfachungsregelung des § 64 Abs. 3 AO stellt ausschließlich auf die **Bruttoeinnahmen** sämtlicher wirtschaftlicher Geschäftsbetriebe ab.

Maßgeblich sind:

- sämtliche Einnahmen
- einschließlich Umsatzsteuer
- unabhängig vom Gewinn

Aktuelle Freigrenze:

**50.000 € Bruttoeinnahmen pro Jahr**

---

⇶  Prüfungsschema

1. Alle Einnahmen sämtlicher wirtschaftlicher Geschäftsbetriebe addieren.
2. Einnahmen ≤ 50.000 €?
   - Ja → keine Körperschaftsteuer und Gewerbesteuer auf den wGB.
   - Nein → Gewinn nach allgemeinen Grundsätzen ermitteln.
3. Anschließend Körperschaftsteuer und ggf. Gewerbesteuer prüfen.

Merksatz:

**Nicht der Gewinn entscheidet, sondern ausschließlich die Bruttoeinnahmen.**

---

► 2. Beispiel

Einnahmen:

- Werbung Homepage: 280 €
- Infostände: 18.300 €
- Verpflegung: 165 €
- Sponsoring: 42.000 €

Gesamteinnahmen:

60.745 €

Ergebnis:

Die Freigrenze von 50.000 € wird überschritten.

Folge:

Die Vereinfachungsregelung greift nicht.

Der Gewinn des wirtschaftlichen Geschäftsbetriebs ist vollständig nach allgemeinen Grundsätzen zu ermitteln.

---

► 3. Gewinnermittlung nach tatsächlichen Kosten

Grundsatz:

Gewinn = Einnahmen − Betriebsausgaben

Beispiel:

Einnahmen:

60.745 €

Ausgaben:

- Löhne: 21.000 €
- Verwaltungskosten: 1.705 €
- Umsatzsteuerzahlungen: 1.800 €

Gewinn:

36.240 €

Abziehbar sind ausschließlich Aufwendungen, die dem wirtschaftlichen Geschäftsbetrieb zugeordnet werden können.

Gemischt veranlasste Kosten sind sachgerecht aufzuteilen.

---

► 4. Gewinnpauschalierung nach § 64 Abs. 6 AO

Für bestimmte Tätigkeiten darf anstelle der tatsächlichen Gewinnermittlung eine Pauschale angewendet werden.

Typische Fälle:

- Sponsoring
- Werbeeinnahmen
- Bandenwerbung
- Anzeigenwerbung
- bestimmte Standflächenüberlassungen

Pauschalgewinn:

15 % der begünstigten Einnahmen

Beispiel:

Werbung:

280 €

Sponsoring:

42.000 €

Pauschalgewinn:

42.280 € × 15 %

= 6.342 €

Wichtig:

Bei Anwendung der Pauschalierung dürfen die tatsächlichen Betriebsausgaben hierfür nicht zusätzlich abgezogen werden.

---

► 5. Freibetrag nach § 24 KStG

Nach der Gewinnermittlung wird der Freibetrag geprüft.

Freibetrag:

5.000 €

Der Freibetrag wird

- pro Körperschaft
- pro Veranlagungszeitraum

gewährt.

Nicht pro wirtschaftlichem Geschäftsbetrieb.

Steuerpflichtiger Gewinn:

Gewinn

− Freibetrag 5.000 €

= steuerpflichtiger Gewinn

---

► Typische Prüfungsreihenfolge

1. Liegt ein wirtschaftlicher Geschäftsbetrieb vor?
2. Bruttoeinnahmen aller wGB addieren.
3. Freigrenze 50.000 € überschritten?
4. Gewinn ermitteln.
5. Tatsächliche Gewinnermittlung oder § 64 Abs. 6 AO prüfen.
6. Freibetrag nach § 24 KStG abziehen.
7. Körperschaftsteuer berechnen.

---

► Klausurklassiker

❌ Freigrenze auf den Gewinn anwenden.

Richtig:

Die 50.000-€-Grenze bezieht sich ausschließlich auf die Bruttoeinnahmen.

---

❌ Tatsächliche Kosten zusätzlich zur 15-%-Pauschale abziehen.

Richtig:

Bei Anwendung des § 64 Abs. 6 AO sind die tatsächlichen Betriebsausgaben für diese Einnahmen bereits abgegolten.

---

► Merksätze

- 50.000 € = Bruttoeinnahmen, nicht Gewinn.
- Erst nach Überschreiten der Freigrenze wird der Gewinn ermittelt.
- § 64 Abs. 6 AO erlaubt für bestimmte Tätigkeiten einen Pauschalgewinn von 15 %.
- Nach der Gewinnermittlung ist der Freibetrag nach § 24 KStG abzuziehen.
- Der Freibetrag gilt je Körperschaft und Veranlagungszeitraum.

`
},
{
  id: "gemeinnuetzige-stiftung-kapitalertragsteuer-vermoegensverwaltung",
  title: "Kapitalertragsteuer bei gemeinnützigen Stiftungen (Vermögensverwaltung)",
  short:
    "Behandlung der Kapitalertragsteuer (KESt) bei steuerfreien gemeinnützigen Stiftungen ohne wirtschaftlichen Geschäftsbetrieb.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "kapitalertragsteuer|kest|gemeinnützige stiftung|vermögensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|§ 44a estg|§ 44b estg|§ 36a estg|körperschaftsteuerbefreiung|eür|steuerfreie vermögensverwaltung",
  references: [
    "§ 5 Abs. 1 Nr. 9 KStG",
    "§ 3 Nr. 6 GewStG",
    "§ 44a EStG",
    "§ 44b EStG",
    "§ 36a EStG"
  ],
  body: `
⇨ Kapitalertragsteuer bei gemeinnützigen Stiftungen

► Grundsatz

Gemeinnützige Stiftungen sind für den ideellen Bereich und die steuerfreie Vermögensverwaltung grundsätzlich von der Körperschaftsteuer und Gewerbesteuer befreit.

Rechtsgrundlagen:

- § 5 Abs. 1 Nr. 9 KStG
- § 3 Nr. 6 GewStG

► Kapitalertragsteuer

Auf Kapitalerträge wird häufig zunächst Kapitalertragsteuer einbehalten.

Dies geschieht insbesondere,

wenn der Bank oder Depotbank die Gemeinnützigkeit nicht rechtzeitig nachgewiesen wurde.

Der Steuerabzug erfolgt nach § 44a EStG.

► Erstattung

Die Stiftung kann die einbehaltene Kapitalertragsteuer auf Antrag zurückerhalten.

Voraussetzungen:

- Nachweis der Gemeinnützigkeit
- Antrag beim zuständigen Finanzamt
- Voraussetzungen der §§ 36a und 44b EStG erfüllt

► Behandlung in der Vermögensverwaltung

Im steuerfreien Bereich der Vermögensverwaltung gilt:

Die einbehaltene Kapitalertragsteuer stellt keine Betriebsausgabe dar.

Ebenso stellt die spätere Erstattung keine steuerpflichtige Einnahme dar.

Die Kapitalertragsteuer beeinflusst deshalb die steuerliche Gewinnermittlung nicht.

► Behandlung in der EÜR

In der Einnahmenüberschussrechnung werden weder

- die Zahlung der Kapitalertragsteuer

noch

- die spätere Erstattung

als Betriebsausgabe oder Betriebseinnahme erfasst.

Es handelt sich lediglich um Vermögensbewegungen.

► Buchungslogik

Steuerfreie Vermögensverwaltung:

Bei Einbehalt der Kapitalertragsteuer:

Sonstige Forderungen
an
Bank

Bei Erstattung:

Bank
an
Sonstige Forderungen

Diese Buchungen betreffen ausschließlich die Vermögensrechnung.

Eine Auswirkung auf die EÜR erfolgt nicht.

► Wirtschaftlicher Geschäftsbetrieb

Anders ist die Behandlung,

wenn Kapitalerträge dem steuerpflichtigen wirtschaftlichen Geschäftsbetrieb zuzurechnen sind.

Dann sind die allgemeinen steuerlichen Vorschriften zu beachten und die Kapitalertragsteuer kann im Rahmen der steuerlichen Gewinnermittlung Bedeutung erlangen.

► Prüfungsschema

1. Liegt eine gemeinnützige Körperschaft vor?

2. Welcher Bereich ist betroffen?

- Ideeller Bereich
- Vermögensverwaltung
- Zweckbetrieb
- Wirtschaftlicher Geschäftsbetrieb

3. Wurde Kapitalertragsteuer einbehalten?

4. Liegt eine Steuerbefreiung nach § 5 Abs. 1 Nr. 9 KStG vor?

5. Kann die Kapitalertragsteuer erstattet werden?

6. Hat die Zahlung Auswirkungen auf die EÜR?

► Rechtsfolgen

Ideeller Bereich:

Keine Betriebsausgabe.

Keine Betriebseinnahme.

Steuerfreie Vermögensverwaltung:

Keine Betriebsausgabe.

Keine Betriebseinnahme.

Nur Vermögensbewegung.

Steuerpflichtiger wirtschaftlicher Geschäftsbetrieb:

Gesonderte steuerliche Prüfung erforderlich.

► Prüfungsmerksätze

Gemeinnützige Stiftung + steuerfreie Vermögensverwaltung

=

KESt ist grundsätzlich erstattungsfähig.

Einbehaltene KESt

=

keine Betriebsausgabe.

Erstattete KESt

=

keine Betriebseinnahme.

Die EÜR bleibt unberührt.

► Klausurtipp

Typische Prüfungsfalle:

Viele buchen die einbehaltene Kapitalertragsteuer als Aufwand.

Das ist im steuerfreien Bereich der Vermögensverwaltung falsch.

Die Kapitalertragsteuer ist lediglich eine Forderung gegenüber dem Finanzamt und wird nach Erstattung wieder ausgeglichen.

Merksatz:

Steuerfreie Vermögensverwaltung

→ KESt nur Vermögensbewegung.

Keine Auswirkung auf den steuerlichen Gewinn.
`
},
{
  id: "abschlagsrechnungen-anzahlungen-unfertige-leistungen",
  title: "Abschlagsrechnungen, Anzahlungen und unfertige Leistungen",
  short:
    "Umsatzsteuerliche und bilanzielle Behandlung von Anzahlungen, Abschlagsrechnungen, Schlussrechnungen und unfertigen Leistungen.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "abschlagsrechnung|teilrechnung|anzahlung|schlussrechnung|unfertige leistungen|unfertige erzeugnisse|herstellungskosten|§ 13 ustg|§ 14 ustg|§ 14c ustg|§ 17 ustg|§ 255 hgb|bestandsveränderungen|gewinnrealisierung|anzahlungen",
  references: [
    "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    "§ 14 Abs. 5 UStG",
    "§ 14c UStG",
    "§ 17 UStG",
    "§ 255 Abs. 2 HGB"
  ],
  body: `
⇨ Abschlagsrechnungen, Anzahlungen und unfertige Leistungen

► Grundsatz

Bei Anzahlungen, Abschlagszahlungen und Teilzahlungen ist zwischen

- Umsatzsteuer,
- Bilanzierung und
- Gewinnrealisierung

zu unterscheiden.

Diese Bereiche folgen unterschiedlichen steuerlichen Grundsätzen.

► Umsatzsteuer bei Anzahlungen

Die Umsatzsteuer entsteht bereits,

wenn

- eine Anzahlung,
- eine Abschlagszahlung oder
- ein Teilentgelt

vereinnahmt wird.

Voraussetzung:

Die zukünftige Leistung muss bereits ausreichend bestimmt sein.

Das bedeutet insbesondere,

- Art der Leistung,
- Umfang der Leistung
- und Leistungsgegenstand

müssen feststehen.

Rechtsgrundlage:

§ 13 Abs. 1 Nr. 1 Buchst. a UStG.

► Abschlagsrechnung

Eine Abschlagsrechnung wird vor vollständiger Leistungserbringung erstellt.

Sie muss eindeutig als

- Abschlagsrechnung,
- Anzahlungsrechnung oder
- Teilrechnung

gekennzeichnet sein.

Außerdem muss die zukünftige Leistung eindeutig beschrieben werden.

Mehrere Abschlagszahlungen dürfen in einer Rechnung zusammengefasst werden.

► Schlussrechnung

Nach vollständiger Leistung wird die Schlussrechnung erstellt.

Dabei müssen

- sämtliche bereits vereinnahmten Anzahlungen,
- Abschlagszahlungen,
- Teilzahlungen
- sowie die darauf entfallende Umsatzsteuer

vom Gesamtbetrag abgesetzt werden.

Dadurch wird verhindert,

dass die Umsatzsteuer doppelt ausgewiesen wird.

Rechtsgrundlage:

§ 14 Abs. 5 UStG.

► Fehlerhafte Schlussrechnung

Werden erhaltene Anzahlungen nicht abgezogen,

kann eine unrichtige Steuer nach § 14c UStG entstehen.

Der Unternehmer schuldet dann den zu hoch ausgewiesenen Steuerbetrag.

► Nicht ausgeführte Leistung

Wird die Leistung später nicht erbracht,

ist die bereits entstandene Umsatzsteuer zu berichtigen.

Rechtsgrundlage:

§ 17 UStG.

► Bilanzierung von Anzahlungen

Bilanzsteuerlich gilt:

Erhaltene Anzahlungen stellen zunächst eine Verbindlichkeit dar.

Sie werden passiviert.

Eine Gewinnrealisierung erfolgt dadurch noch nicht.

► Unfertige Leistungen

Unfertige Leistungen sind zum Bilanzstichtag mit ihren Herstellungskosten zu aktivieren.

Rechtsgrundlage:

§ 255 Abs. 2 HGB.

Zu den Herstellungskosten gehören sämtliche Aufwendungen,

die unmittelbar oder mittelbar für die Herstellung entstanden sind.

► Keine Saldierung

Erhaltene Anzahlungen dürfen nicht mit den unfertigen Leistungen verrechnet werden.

Richtig ist:

Aktivseite:

Unfertige Leistungen

Passivseite:

Erhaltene Anzahlungen

Eine Saldierung ist nach herrschender Meinung unzulässig.

► Bestandsveränderungen

Im Gesamtkostenverfahren werden Bestandsveränderungen der unfertigen Leistungen gesondert ausgewiesen.

Erhaltene Anzahlungen beeinflussen die Bestandsveränderungen nicht.

Sie bleiben erfolgsneutral,

bis die Leistung tatsächlich erbracht wird.

► Gewinnrealisierung

Die Gewinnrealisierung erfolgt grundsätzlich erst,

wenn

- die Leistung erbracht und
- ordnungsgemäß abgerechnet

wurde.

Eine Teilgewinnrealisierung kommt nur bei entsprechender Teilleistung und Abrechnung in Betracht.

► Prüfungsschema

1. Liegt eine Anzahlung oder Abschlagszahlung vor?

2. Ist die zukünftige Leistung bereits eindeutig bestimmt?

3. Wurde das Entgelt bereits vereinnahmt?

→ Umsatzsteuer entsteht.

4. Liegt eine Schlussrechnung vor?

→ Anzahlungen und Umsatzsteuer absetzen.

5. Bilanzstichtag prüfen:

Unfertige Leistungen aktivieren.

Erhaltene Anzahlungen passivieren.

Keine Saldierung.

6. Leistung noch nicht ausgeführt?

→ Keine Gewinnrealisierung.

► Rechtsfolgen

Umsatzsteuer:

Entsteht bereits bei Vereinnahmung der Anzahlung.

Bilanz:

Unfertige Leistungen werden aktiviert.

Anzahlungen werden passiviert.

Gewinn:

Erst mit Leistungserbringung und Abrechnung.

► Prüfungsmerksätze

Anzahlung

≠ Gewinn.

Anzahlung

= Umsatzsteuer entsteht.

Unfertige Leistungen

= Aktivposten.

Erhaltene Anzahlungen

= Passivposten.

Keine Saldierung.

Schlussrechnung:

Anzahlungen und Umsatzsteuer müssen abgesetzt werden.

► Klausurtipp

Typische Prüfungsfallen:

- Umsatzsteuer mit Gewinnrealisierung verwechseln.
- Anzahlungen von den Herstellungskosten abziehen.
- Unfertige Leistungen und Anzahlungen saldieren.
- Anzahlungen in der Schlussrechnung vergessen.

Merksatz:

Umsatzsteuer folgt dem Geldfluss.

Gewinn folgt der Leistung.

Bilanz:

Unfertige Leistungen aktiv,

Anzahlungen passiv.
`
},
{
  id: "vereinsfahrzeug-fahrtenbuch-gemeinnuetzigkeit",
  title: "Vereinsfahrzeug: Fahrtenbuch und Nachweispflichten",
  short:
    "Nachweis der gemeinnützigen Nutzung eines Vereinsfahrzeugs, Alternativen zum Fahrtenbuch und steuerliche Folgen fehlender Dokumentation.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "vereinsfahrzeug|fahrtenbuch|gemeinnützigkeit|pkw|ehrenamt|mittelverwendung|fahrzeug|nutzung|schätzung|bfh|verdeckte gewinnausschüttung|privatnutzung|fahrten",
  references: [
    "§§ 51 ff. AO",
    "§ 55 AO",
    "BFH-Rechtsprechung zur Nachweispflicht bei Fahrzeugnutzung"
  ],
  body: `
⇨ Vereinsfahrzeug und Fahrtenbuch

► Grundsatz

Besitzt ein gemeinnütziger Verein einen PKW,

muss der Verein die ordnungsgemäße und satzungsgemäße Mittelverwendung nachweisen.

Hierzu gehört insbesondere der Nachweis,

dass das Fahrzeug überwiegend oder ausschließlich für gemeinnützige Zwecke genutzt wird.

► Fahrtenbuch

Ein Fahrtenbuch ist das klassische Nachweismittel.

Es wird von der Finanzverwaltung bevorzugt.

Ein Fahrtenbuch ist jedoch gesetzlich nicht zwingend vorgeschrieben.

► Alternative Nachweise

Der Nachweis kann auch durch andere geeignete Unterlagen geführt werden.

Beispiele:

- repräsentative Fahrtenaufzeichnungen
- Einsatzpläne
- Terminlisten
- Vereinskalender
- schriftliche Anweisungen
- Dokumentation der Nutzer
- Protokolle über Vereinsveranstaltungen

Entscheidend ist,

dass die tatsächliche Nutzung nachvollziehbar dokumentiert werden kann.

► Dokumentationspflicht

Aus den Unterlagen sollte insbesondere hervorgehen:

- Fahrer
- Fahrtzweck
- Ziel
- Datum
- gefahrene Strecke
- Zusammenhang mit dem Satzungszweck

Je vollständiger die Dokumentation,

desto geringer ist das Risiko steuerlicher Beanstandungen.

► Ehrenamtliche Nutzung

Wird das Fahrzeug ausschließlich von ehrenamtlich Tätigen genutzt,

empfiehlt sich ebenfalls eine schriftliche Dokumentation.

Auch hierbei genügt grundsätzlich eine nachvollziehbare Aufzeichnung,

wenn sie die tatsächliche Nutzung ausreichend belegt.

► Fehlende Nachweise

Kann der Verein die Nutzung nicht nachweisen,

ist die Finanzverwaltung berechtigt,

den privaten Nutzungsanteil zu schätzen.

Ohne geeignete Nachweise wird häufig mindestens ein privater Nutzungsanteil von 50 % angenommen,

soweit sich aus den Umständen nichts anderes ergibt.

► Steuerliche Folgen

Eine fehlerhafte oder fehlende Dokumentation kann insbesondere folgende Folgen haben:

- Schätzung der Privatnutzung
- verdeckte Gewinnausschüttung bei Vorteilen zugunsten von Mitgliedern
- unzulässige Mittelverwendung
- Gefährdung der Gemeinnützigkeit
- steuerliche Mehrbelastungen

► Prüfungsschema

1. Gehört der PKW zum Vereinsvermögen?

2. Erfolgt die Nutzung ausschließlich oder überwiegend für gemeinnützige Zwecke?

3. Liegt ein Fahrtenbuch vor?

4. Falls nein:

Gibt es andere geeignete Nachweise?

5. Ist die Nutzung ausreichend dokumentiert?

6. Kann eine private Nutzung ausgeschlossen oder nachvollziehbar abgegrenzt werden?

► Rechtsfolgen

Ordnungsgemäße Dokumentation:

Keine Beanstandung.

Unzureichende Dokumentation:

Schätzung der Privatnutzung möglich.

Dadurch können steuerliche Nachteile entstehen.

► Prüfungsmerksätze

Ein Fahrtenbuch ist nicht zwingend vorgeschrieben.

Andere geeignete Nachweise sind zulässig.

Entscheidend ist die Nachvollziehbarkeit der Fahrzeugnutzung.

Ohne Nachweise darf die Finanzverwaltung schätzen.

Die Dokumentation dient dem Nachweis der ordnungsgemäßen Mittelverwendung.

► Klausurtipp

Typische Prüfungsfalle:

Viele glauben,

dass ausschließlich ein Fahrtenbuch zulässig ist.

Das ist falsch.

Der BFH akzeptiert auch andere geeignete Nachweise,

wenn die Fahrzeugnutzung vollständig und nachvollziehbar dokumentiert wird.

Merksatz:

Nicht das Fahrtenbuch ist entscheidend,

sondern der lückenlose Nachweis der gemeinnützigen Nutzung.
`
},
{
  id: "tagesmuetter-gewinnermittlung-pauschalen",
  title: "Tagesmütter: Gewinnermittlung, Betriebsausgabenpauschale und Kleinunternehmerregelung",
  short:
    "Steuerliche Behandlung von Tagesmüttern: Betriebsausgabenpauschalen, Freihalteplätze und umsatzsteuerliche Kleinunternehmerregelung.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "tagesmutter|kindertagespflege|betriebsausgabenpauschale|freihalteplatz|kleinunternehmer|§ 19 ustg|§ 18 estg|gewinnermittlung|eür|umsatzsteuer|bmf 2023",
  references: [
    "§ 18 EStG",
    "§ 19 UStG",
    "BMF-Schreiben vom 06.04.2023 (BStBl. I 2023, 669)"
  ],
  body: `
⇨ Tagesmütter – Einkommensteuer und Umsatzsteuer

► Grundsatz

Tagesmütter erzielen ihre Einkünfte regelmäßig aus selbständiger Arbeit (§ 18 EStG).

Der Gewinn wird grundsätzlich durch Einnahmenüberschussrechnung (EÜR) ermittelt.

Für typische Aufwendungen kann die Betriebsausgabenpauschale der Finanzverwaltung genutzt werden.

► Betriebsausgabenpauschale

Für tatsächlich belegte Betreuungsplätze gilt grundsätzlich:

400 Euro Betriebsausgaben je betreutem Kind und Monat

bei einer Betreuungszeit von 40 Stunden pro Woche.

Bei geringerer Betreuungszeit ist die Pauschale zeitanteilig zu kürzen.

Die Pauschale ersetzt den Einzelnachweis der gewöhnlichen Betriebsausgaben.

Der Nachweis höherer tatsächlicher Betriebsausgaben bleibt möglich.

► Freihalteplätze

Freihalteplätze sind Plätze,

die für Kinder reserviert werden,

vorübergehend jedoch nicht belegt sind.

Erhält die Tagesmutter hierfür Zahlungen,

kann aus Vereinfachungsgründen eine Betriebsausgabenpauschale angesetzt werden.

Pauschale:

50 Euro je Freihalteplatz und Monat.

Diese Pauschale kann jedoch höchstens bis zur Höhe der hierfür erhaltenen Einnahmen berücksichtigt werden.

Sind die tatsächlichen Aufwendungen höher,

können diese durch Einzelnachweis geltend gemacht werden.

► Nachweis tatsächlicher Betriebsausgaben

Die Betriebsausgabenpauschale ist nicht verpflichtend.

Stattdessen können sämtliche tatsächlichen Betriebsausgaben angesetzt werden,

wenn diese vollständig nachgewiesen werden.

Dies kann insbesondere sinnvoll sein,

wenn außergewöhnlich hohe Aufwendungen entstanden sind.

► Umsatzsteuer

Für Tagesmütter gelten grundsätzlich die allgemeinen Vorschriften des Umsatzsteuergesetzes.

Seit 2025 gilt:

Im Gründungsjahr erfolgt keine Hochrechnung des Jahresumsatzes mehr.

Maßgeblich ist ausschließlich der tatsächlich erzielte Umsatz.

Die Kleinunternehmerregelung nach § 19 UStG kann angewendet werden,

wenn die gesetzlichen Umsatzgrenzen eingehalten werden.

Nach aktuellem Gesetzesstand beträgt die maßgebliche Umsatzgrenze:

100.000 Euro.

Wird diese Grenze im laufenden Kalenderjahr überschritten,

unterliegen die Umsätze ab diesem Zeitpunkt der Regelbesteuerung.

► Prüfungsschema

1. Liegt eine selbständige Kindertagespflege vor?

2. Gewinnermittlung nach § 18 EStG?

3. Betriebsausgabenpauschale oder Einzelnachweis?

4. Tatsächlich belegte Plätze oder Freihalteplätze?

5. Kleinunternehmerregelung nach § 19 UStG prüfen.

6. Umsatzgrenze eingehalten?

► Rechtsfolgen

Belegte Plätze:

400 Euro Betriebsausgabenpauschale je Kind und Monat
(bei 40 Wochenstunden).

Freihalteplätze:

50 Euro Betriebsausgabenpauschale je Platz und Monat,

höchstens bis zur Höhe der hierfür gezahlten Einnahmen.

Alternativ:

Einzelnachweis der tatsächlichen Betriebsausgaben.

► Prüfungsmerksätze

Tagesmütter erzielen regelmäßig Einkünfte nach § 18 EStG.

Die Betriebsausgabenpauschale ist ein Wahlrecht.

Für belegte Plätze gilt grundsätzlich die höhere Pauschale.

Für Freihalteplätze gilt eine gesonderte Pauschale von 50 Euro je Monat.

Die tatsächlichen Betriebsausgaben können jederzeit durch Einzelnachweis geltend gemacht werden.

► Klausurtipp

Typische Prüfungsfallen:

- Freihalteplätze werden häufig mit belegten Plätzen verwechselt.
- Die 400-Euro-Pauschale gilt grundsätzlich nur für tatsächlich belegte Betreuungsplätze.
- Für Freihalteplätze gilt lediglich die 50-Euro-Pauschale und auch nur, soweit hierfür Einnahmen erzielt werden.
- Die Betriebsausgabenpauschale ist kein Zwang – der Einzelnachweis bleibt immer möglich.

Merksatz:

Belegter Platz = 400 Euro.

Freihalteplatz = 50 Euro.

Höhere tatsächliche Kosten = Einzelnachweis.
`
},
{
  id: "altersvorsorgedepot-ab-2027",
  title: "Altersvorsorgedepot ab 2027",
  short:
    "Geplantes steuerlich gefördertes Altersvorsorgedepot als Nachfolgemodell der Riester-Rente.",
  category: "Aktuelles Steuerrecht",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "altersvorsorgedepot|riester|sonderausgaben|zulagen|wertpapierdepot|nachgelagerte besteuerung|altersvorsorgereform",
  references: [
    "Altersvorsorgereformgesetz 2026"
  ],
  body: `
⇨ Altersvorsorgedepot

► Hinweis

Dieser Eintrag gibt den derzeitigen Gesetzesstand wieder.

Vor Anwendung in der Praxis sind stets aktuelle Gesetzesänderungen und BMF-Schreiben zu prüfen.

► Grundidee

Ab 2027 soll ein steuerlich gefördertes Altersvorsorgedepot eingeführt werden.

Es soll langfristige Wertpapieranlagen fördern und die bisherige Riester-Förderung ersetzen.

► Förderung

Geplant sind insbesondere:

- Sonderausgabenabzug
- staatliche Zulagen
- nachgelagerte Besteuerung

► Voraussetzungen

- zertifiziertes Altersvorsorgedepot
- Eigenbeiträge
- förderberechtigter Personenkreis
- gesetzliche Anforderungen an das Produkt

► Besteuerung

Während der Ansparphase:

steuerliche Förderung.

Während der Auszahlungsphase:

nachgelagerte Besteuerung.

► Prüfungsmerksatz

Aktuelles Steuerrecht.

Vor jeder steuerlichen Beratung den neuesten Gesetzesstand prüfen.
`
},
{
  id: "familienstiftung-freibetrag-24-kstg",
  title: "Familienstiftung und Freibetrag nach § 24 KStG",
  short:
    "Voraussetzungen und Ausschluss des Freibetrags nach § 24 KStG bei Familienstiftungen sowie Abgrenzung zu § 20 Abs. 1 Nr. 1 und 2 EStG.",
  category: "Körperschaftsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "familienstiftung|§ 24 kstg|freibetrag|§ 20 estg|kapitalvermögen|gewinnausschüttung|vermögensverwaltung|stiftung|kapitalgesellschaft|verdeckte gewinnausschüttung|liquidation|steuerliches einlagekonto",
  references: [
    "§ 24 KStG",
    "§ 20 Abs. 1 Nr. 1 EStG",
    "§ 20 Abs. 1 Nr. 2 EStG",
    "§ 27 KStG"
  ],
  body: `
⇨ Freibetrag nach § 24 KStG bei Familienstiftungen

► Grundsatz

Körperschaften können unter den Voraussetzungen des § 24 KStG einen Freibetrag erhalten.

Für Familienstiftungen gilt jedoch eine wichtige Ausnahme.

Der Freibetrag wird nicht gewährt,

wenn die Leistungen der Stiftung ihrer Art nach beim Empfänger zu Einnahmen nach § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG führen können.

Dabei ist unerheblich,

ob tatsächlich Ausschüttungen vorgenommen wurden.

Entscheidend ist allein,

dass die Stiftung solche Leistungen nach ihrer Satzung oder ihrer Rechtsnatur grundsätzlich erbringen kann.

► Ausschluss des Freibetrags

Der Freibetrag ist ausgeschlossen,

wenn die Stiftung Leistungen erbringen kann,

die beim Empfänger als Einkünfte aus Kapitalvermögen gelten würden.

Nicht erforderlich ist,

dass im betreffenden Wirtschaftsjahr tatsächlich Ausschüttungen erfolgen.

Auch eine satzungsmäßige Ausschüttungssperre oder die bloße Nichtausschüttung ändern daran grundsätzlich nichts.

► Prüfungsschema

1. Liegt eine Körperschaft vor?

2. Handelt es sich um eine Familienstiftung?

3. Können Leistungen an Begünstigte erfolgen?

4. Würden diese Leistungen beim Empfänger unter § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG fallen?

5. Wenn ja:

=> Freibetrag nach § 24 KStG ausgeschlossen.

► Einnahmen nach § 20 Abs. 1 Nr. 1 EStG

Hierzu gehören insbesondere:

- Dividenden einer GmbH
- Dividenden einer AG
- Ausschüttungen von Genossenschaften
- verdeckte Gewinnausschüttungen
- wirtschaftlich vergleichbare Ausschüttungen

► Einnahmen nach § 20 Abs. 1 Nr. 2 EStG

Hierzu gehören insbesondere:

- Auflösungsgewinne nach Liquidation einer Kapitalgesellschaft
- Leistungen im Zusammenhang mit Kapitalherabsetzungen

Soweit keine Rückzahlung von

- Nennkapital oder
- steuerlichem Einlagekonto (§ 27 KStG)

vorliegt.

► Nicht unter § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG fallen

- Rückzahlung des Stammkapitals
- Rückzahlung des Grundkapitals
- Rückzahlung aus dem steuerlichen Einlagekonto (§ 27 KStG)
- Leistungen ohne kapitalmäßige Beteiligung
- Leistungen bestimmter steuerbefreiter Körperschaften ohne Ausschüttungsmöglichkeit

► Meinungsstand

Finanzverwaltung,

Literatur

und

Rechtsprechung

vertreten übereinstimmend,

dass § 24 Satz 2 KStG generalisierend auszulegen ist.

Maßgeblich ist nicht,

ob tatsächlich ausgeschüttet wird,

sondern

ob Ausschüttungen ihrer Art nach zu Einnahmen nach § 20 EStG führen können.

► Rechtsfolge

Sind Leistungen grundsätzlich geeignet,

Einnahmen nach § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG auszulösen,

steht der Freibetrag nach § 24 KStG nicht zu.

Dies gilt auch,

wenn

- keine Ausschüttungen erfolgen,
- Ausschüttungen dauerhaft unterbleiben,
- die Stiftung ausschließlich Vermögensverwaltung betreibt.

► Prüfungsmerksätze

Nicht die tatsächliche Ausschüttung ist entscheidend.

Entscheidend ist die grundsätzliche Möglichkeit einer Ausschüttung.

§ 24 KStG knüpft an die Art der möglichen Leistungen an.

► Klausurtipp

Typische Prüfungsfalle:

Viele prüfen nur,

ob tatsächlich Ausschüttungen erfolgt sind.

Das genügt nicht.

In der Klausur ist immer zu prüfen,

ob die Stiftung ihrer Rechtsform und Satzung nach überhaupt Leistungen erbringen kann,

die beim Empfänger unter § 20 Abs. 1 Nr. 1 oder Nr. 2 EStG fallen würden.

Merksatz:

Möglichkeit der Ausschüttung genügt.

Die tatsächliche Ausschüttung ist nicht erforderlich.
`
},
{
  id: "vga-gemeinnuetziger-verein",
  title: "Verdeckte Gewinnausschüttung (vGA) bei gemeinnützigen Vereinen",
  short:
    "Voraussetzungen, Fremdvergleich und typische Fälle verdeckter Gewinnausschüttungen bei gemeinnützigen Vereinen.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "vga|verdeckte gewinnausschüttung|gemeinnütziger verein|§ 8 abs. 3 kstg|fremdvergleich|unangemessene vergütung|aufwandsentschädigung|mitglied|vorstand|nahestehende person|gemeinnützigkeit",
  references: [
    "§ 8 Abs. 3 Satz 2 KStG",
    "§§ 51 ff. AO"
  ],
  body: `
⇨ Verdeckte Gewinnausschüttung (vGA) bei gemeinnützigen Vereinen

► Grundsatz

Auch bei gemeinnützigen Vereinen können verdeckte Gewinnausschüttungen (vGA) vorliegen.

Dabei ist unerheblich,

dass ein Verein keine klassischen Gewinnausschüttungen wie eine Kapitalgesellschaft vornimmt.

Entscheidend ist,

ob Vereinsvermögen einem Mitglied oder einer nahestehenden Person ohne angemessene Gegenleistung zugewendet wird.

► Gesetzliche Grundlage

Rechtsgrundlage:

§ 8 Abs. 3 Satz 2 KStG

Eine verdeckte Gewinnausschüttung liegt vor,

wenn

- das Vermögen der Körperschaft gemindert wird oder
- eine Vermögensmehrung verhindert wird,

und

diese Vermögensminderung durch das Mitgliedschaftsverhältnis veranlasst ist.

► Keine Vereinbarung erforderlich

Für die Annahme einer vGA ist keine schriftliche oder mündliche Vereinbarung erforderlich.

Auch ohne Vertrag kann eine verdeckte Gewinnausschüttung vorliegen.

Maßgeblich ist allein,

ob der Vorteil aufgrund des Mitgliedschaftsverhältnisses gewährt wurde.

► Fremdvergleich

Entscheidend ist der Fremdvergleich.

Frage:

Hätte ein ordentlicher und gewissenhafter Geschäftsleiter denselben Vorteil auch einem fremden Dritten eingeräumt?

Wenn nein,

spricht dies für eine verdeckte Gewinnausschüttung.

► Typische Fälle

Eine vGA kann insbesondere vorliegen bei

- unangemessen hohen Tätigkeitsvergütungen,
- überhöhten Aufwandsentschädigungen,
- unentgeltlicher Überlassung von Vereinsvermögen,
- verbilligten Darlehen,
- Erlass von Forderungen gegenüber Mitgliedern,
- sonstigen Vermögensvorteilen zugunsten von Mitgliedern oder nahestehenden Personen.

► Gemeinnützigkeitsrecht

Neben den körperschaftsteuerlichen Folgen kann eine vGA auch gegen das Gemeinnützigkeitsrecht verstoßen.

Unzulässige Begünstigungen von Mitgliedern widersprechen dem Grundsatz der Selbstlosigkeit (§ 55 AO).

Dadurch kann die Gemeinnützigkeit gefährdet werden.

► Prüfungsschema

1. Liegt eine Vermögensminderung oder verhinderte Vermögensmehrung vor?

2. Erhält ein Mitglied oder eine nahestehende Person einen Vorteil?

3. Ist der Vorteil gesellschafts- bzw. mitgliedschaftlich veranlasst?

4. Hält der Vorteil dem Fremdvergleich stand?

5. Liegt eine angemessene Gegenleistung vor?

6. Ergebnis:

Verdeckte Gewinnausschüttung ja oder nein.

► Rechtsfolgen

Liegt eine vGA vor,

ist der Aufwand steuerlich nicht abzugsfähig.

Außerdem können

- Körperschaftsteuer,
- Gemeinnützigkeitsrecht
- und gegebenenfalls Haftungsfragen

betroffen sein.

► Prüfungsmerksätze

Eine schriftliche Vereinbarung ist nicht erforderlich.

Entscheidend ist der Fremdvergleich.

Nicht jede Zahlung an ein Mitglied ist eine vGA.

Unangemessene Vorteile können jedoch eine vGA darstellen.

Auch gemeinnützige Vereine können verdeckte Gewinnausschüttungen vornehmen.

► Klausurtipp

Typische Prüfungsfalle:

Viele gehen davon aus,

dass Vereine keine verdeckten Gewinnausschüttungen haben können,

weil sie keine Gewinne ausschütten.

Das ist falsch.

Auch bei gemeinnützigen Vereinen kann eine vGA vorliegen,

wenn Mitglieder oder nahestehende Personen unangemessene Vermögensvorteile erhalten.

Merksatz:

Nicht die Rechtsform entscheidet,

sondern die unangemessene Begünstigung eines Mitglieds.
`
},
{
  id: "zweitwohnsitz-doppelte-haushaltsfuehrung",
  title: "Zweitwohnsitz und doppelte Haushaltsführung",
  short:
    "Steuerliche Folgen eines Zweitwohnsitzes bei Einkommensteuer, Erbschaftsteuer und Zweitwohnungsteuer.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "zweitwohnsitz|doppelte haushaltsführung|betriebsausgaben|werbungskosten|betriebsstätte|erbschaftsteuer|zweitwohnungsteuer",
  references: [
    "§ 4 EStG",
    "§ 9 EStG",
    "§ 2 ErbStG"
  ],
  body: `
⇨ Zweitwohnsitz

► Einkommensteuer

Eine doppelte Haushaltsführung setzt voraus:

- Hauptwohnsitz bleibt bestehen.
- Zweitwohnung wird beruflich genutzt.
- berufliche Veranlassung liegt vor.

Dann können Aufwendungen steuerlich abzugsfähig sein.

► Private Gründe

Wird der Zweitwohnsitz ausschließlich aus privaten Gründen (z. B. bei einer Tante) begründet,

liegt keine doppelte Haushaltsführung vor.

Die Kosten sind dann grundsätzlich nicht abzugsfähig.

► Betriebsstätte

Besteht am Zweitwohnsitz eine weitere Betriebsstätte,

können Fahrten zwischen den Betriebsstätten Betriebsausgaben sein.

► Erbschaftsteuer

Der Wohnsitz beeinflusst die Steuerpflicht.

Unbeschränkte Steuerpflicht:

Wohnsitz im Inland.

Beschränkte Steuerpflicht:

kein Wohnsitz im Inland.

► Zweitwohnungsteuer

Kommunale Aufwandsteuer.

Unabhängig vom Verwandtschaftsverhältnis.

► Prüfungsmerksatz

Beruflicher Zweitwohnsitz:

mögliche doppelte Haushaltsführung.

Privater Zweitwohnsitz:

regelmäßig kein Werbungskosten- oder Betriebsausgabenabzug.
`
},
{
  id: "erwachsenenadoption-erbschaftsteuer",
  title: "Erwachsenenadoption und Erbschaftsteuer",
  short:
    "Steuerliche Folgen der schwachen Erwachsenenadoption bei der Erbschaft- und Schenkungsteuer.",
  category: "Erbschaftsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "erwachsenenadoption|schwache adoption|§ 1772 bgb|erbStG|§ 15 erbStG|steuerklasse I|adoptivkind|freibetrag|schenkungsteuer|erbschaftsteuer",
  references: [
    "§ 1772 BGB",
    "§ 15 Abs. 1 ErbStG",
    "§ 15 Abs. 1a ErbStG",
    "BFH II R 46/08"
  ],
  body: `
⇨ Schwache Erwachsenenadoption

► Grundsatz

Bei der schwachen Erwachsenenadoption bleibt das Verwandtschaftsverhältnis zu den leiblichen Eltern bestehen.

Steuerlich wird der Adoptierte dennoch gegenüber dem Adoptierenden wie ein leibliches Kind behandelt.

► Erbschaftsteuer

Der Adoptierte gehört gegenüber dem Adoptierenden zur Steuerklasse I.

Dies gilt auch bei einer Erwachsenenadoption.

Folgen:

- Steuerklasse I
- Freibetrag wie Kind
- günstigere Steuersätze

► Leibliche Eltern

Auch gegenüber den leiblichen Eltern bleibt die Steuerklasse I bestehen.

Die Adoption führt insoweit zu keinem Verlust der steuerlichen Begünstigungen.

► Einkommensteuer

Die Erwachsenenadoption hat grundsätzlich keine unmittelbaren Auswirkungen auf die Einkommensteuer.

► Prüfungsschema

1. Liegt eine Erwachsenenadoption vor?

2. Schwache oder starke Adoption?

3. Erb- oder Schenkungsfall?

4. Steuerklasse nach § 15 ErbStG bestimmen.

► Prüfungsmerksatz

Erwachsenenadoption:

Erbschaftsteuerlich Kind.

Ertragsteuerlich grundsätzlich ohne Bedeutung.
`
},
{
  id: "zinsloses-darlehen-gemeinnuetziger-verein",
  title: "Zinsloses Darlehen an einen gemeinnützigen Verein",
  short:
    "Zivilrechtliche und steuerliche Behandlung zinsloser Darlehen, Rückzahlung, Darlehensverzicht und Gemeinnützigkeitsrecht.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "zinsloses darlehen|gemeinnütziger verein|verein|gemeinnützigkeit|§ 488 bgb|§ 51 ao|darlehensverzicht|spende|freigebige zuwendung|fremdvergleich|verbindlichkeit|ausland|thailand|darlehensgeber|schenkungsteuer",
  references: [
    "§ 488 BGB",
    "§ 51 AO",
    "§§ 52 ff. AO"
  ],
  body: `
⇨ Zinsloses Darlehen an einen gemeinnützigen Verein

► Grundsatz

Ein Darlehen kann auch ohne Verzinsung wirksam vereinbart werden.

Die fehlende Verzinsung berührt die Wirksamkeit des Darlehensvertrages nach § 488 BGB nicht.

Die Rückzahlungsverpflichtung bleibt bestehen.

► Zivilrecht

Nach § 488 BGB verpflichtet sich der Darlehensnehmer,

- den Darlehensbetrag zurückzuzahlen,
- unabhängig davon, ob Zinsen vereinbart wurden.

Ein zinsloses Darlehen ist zivilrechtlich zulässig.

► Steuerliche Prüfung

Bei gemeinnützigen Vereinen ist zusätzlich zu prüfen,

- ob der Fremdvergleich eingehalten wird,
- ob eine unzulässige Begünstigung vorliegt,
- ob die Mittelverwendung weiterhin gemeinnützig ist.

Die Vereinbarung sollte schriftlich erfolgen und tatsächlich durchgeführt werden.

► Rückzahlung ins Ausland

Die Rückzahlung eines Darlehens an einen Darlehensgeber im Ausland ist grundsätzlich zulässig.

Beispiel:

Rückzahlung nach Thailand.

Voraussetzung:

Die Auszahlung darf die Gemeinnützigkeit nicht gefährden.

Nach § 51 Abs. 2 AO können Mittel auch ins Ausland fließen, wenn die gemeinnützigkeitsrechtlichen Voraussetzungen erfüllt werden.

► Darlehensverzicht

Verzichtet der Darlehensgeber auf die Rückzahlung,

bleibt der Betrag nicht einfach steuerfrei.

Je nach Sachverhalt kann vorliegen:

- freigebige Zuwendung,
- Spende,
- schenkungsteuerlicher Vorgang.

Außerdem ist zu prüfen,

ob eine unzulässige Begünstigung vorliegt.

Besonders kritisch sind Darlehen von

- Vereinsmitgliedern,
- Vorständen,
- nahestehenden Personen.

► Fremdvergleich

Bei Darlehen zwischen Verein und nahestehenden Personen gilt der Fremdvergleich.

Zu prüfen ist insbesondere:

- schriftlicher Vertrag,
- klare Rückzahlungsvereinbarung,
- tatsächliche Durchführung,
- angemessene Vertragsbedingungen.

Nur fremdübliche Vereinbarungen werden steuerlich anerkannt.

► Kein Kontakt zum Darlehensgeber

Ist der Darlehensgeber nicht mehr erreichbar,

bleibt die Rückzahlungsverpflichtung grundsätzlich bestehen.

Das Darlehen ist weiterhin als Verbindlichkeit auszuweisen.

Eine Ausbuchung ist erst zulässig,

wenn ausreichend nachgewiesen werden kann,

dass die Forderung endgültig nicht mehr besteht oder uneinbringlich geworden ist.

Eine bloße Nichterreichbarkeit genügt hierfür regelmäßig nicht.

► Bilanzielle Behandlung

Bis zur endgültigen Klärung:

Passivierung der Verbindlichkeit.

Erst bei Wegfall der Verpflichtung:

Prüfung einer gewinnerhöhenden Auflösung der Verbindlichkeit.

Dabei sind zusätzlich die gemeinnützigkeitsrechtlichen Folgen zu prüfen.

► Prüfungsschema

1. Liegt ein wirksamer Darlehensvertrag nach § 488 BGB vor?

2. Ist das Darlehen verzinslich oder zinslos?

3. Wurde ein schriftlicher Vertrag abgeschlossen?

4. Entspricht die Vereinbarung dem Fremdvergleich?

5. Liegt eine Rückzahlung, ein Darlehensverzicht oder eine Ausbuchung vor?

6. Werden die Gemeinnützigkeitsvorschriften (§§ 51 ff. AO) eingehalten?

7. Sind steuerliche Folgen (Spende, Schenkungsteuer oder Gewinnrealisierung) zu prüfen?

► Rechtsfolgen

Zinsloses Darlehen:
Zivilrechtlich wirksam.

Rückzahlung:
Grundsätzlich jederzeit möglich, auch ins Ausland.

Verzicht:
Steuerlich gesondert zu würdigen.

Kein Kontakt:
Verbindlichkeit bleibt bestehen.

Ausbuchung:
Erst bei endgültigem Wegfall der Rückzahlungsverpflichtung zulässig.

► Prüfungsmerksätze

Ein zinsloses Darlehen ist zivilrechtlich wirksam.

Die Rückzahlungsverpflichtung entfällt nicht wegen fehlender Verzinsung.

Bei gemeinnützigen Vereinen ist immer der Fremdvergleich zu prüfen.

Darlehensverzicht kann steuerliche Folgen auslösen.

Eine bloße Nichterreichbarkeit des Darlehensgebers berechtigt nicht zur Ausbuchung.

► Klausurtipp

Typische Prüfungsfalle:

Viele gehen davon aus, dass ein zinsloses Darlehen automatisch eine Spende oder verdeckte Einlage darstellt.

Das ist falsch.

Zunächst bleibt ein zinsloses Darlehen ein ganz normales Darlehen mit Rückzahlungsverpflichtung.

Steuerliche Folgen entstehen erst durch besondere Umstände, z. B. einen Darlehensverzicht, eine unangemessene Gestaltung oder eine unzulässige Begünstigung.
`
},
{
  id: "reisekosten-dienstreise-steuerfreie-erstattung-verpflegungspauschalen",
  title: "Reisekosten: steuerfreie Erstattung und Verpflegungspauschalen",
  short:
    "Steuerfreie Reisekostenerstattung nach § 3 Nr. 16 EStG, Belegpflichten, Buchungslogik und Verpflegungsmehraufwand bei Auswärtstätigkeiten.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "reisekosten|dienstreise|auswärtstätigkeit|verpflegungsmehraufwand|verpflegungspauschale|reisekostenerstattung|steuerfreie erstattung|§ 3 nr. 16 estg|§ 9 estg|werbungskosten|lohnkonto|belege|arbeitgebererstattung|übernachtungskosten|fahrtkosten|reisenebenkosten|brüssel|belgien|mahlzeitenkürzung",
  references: [
    "§ 3 Nr. 16 EStG",
    "§ 9 EStG",
    "LStR / LStH Reisekosten",
    "BMF-Schreiben zu Auslandsreisekosten"
  ],
  body: `
⇨ Reisekosten: steuerfreie Erstattung und Verpflegungspauschalen

► 1. Steuerfreie Reisekostenerstattung durch den Arbeitgeber

Erstattet der Arbeitgeber seinem Arbeitnehmer anlässlich einer beruflich veranlassten Auswärtstätigkeit die tatsächlichen Reisekosten, kann diese Erstattung nach § 3 Nr. 16 EStG steuerfrei sein.

Steuerfrei erstattungsfähig sind insbesondere:
- Fahrtkosten
- Übernachtungskosten
- Reisenebenkosten
- Verpflegungsmehraufwendungen im Rahmen der gesetzlichen Pauschalen

Die Steuerfreiheit gilt nur, soweit die Erstattung die nach § 9 EStG als Werbungskosten abziehbaren Aufwendungen nicht übersteigt.

► 2. Voraussetzungen für die Steuerfreiheit

Die Erstattung bleibt steuerfrei, wenn:

1. eine beruflich veranlasste Auswärtstätigkeit vorliegt,
2. der Arbeitnehmer die tatsächlichen Aufwendungen nachweist,
3. die Erstattung die tatsächlichen Kosten bzw. gesetzlichen Pauschalen nicht übersteigt,
4. der Arbeitgeber die Belege zum Lohnkonto nimmt.

Wichtig:
Ohne ausreichende Nachweise besteht das Risiko, dass die Erstattung als steuerpflichtiger Arbeitslohn behandelt wird.

► 3. Buchhalterische Behandlung

Die steuerfreie Erstattung ist als Reisekostenerstattung zu buchen.

Sie ist nicht als steuerpflichtiger Arbeitslohn zu behandeln, solange:
- die Kosten beruflich veranlasst sind,
- die Belege vorliegen,
- die Erstattung nicht höher ist als die tatsächlichen Kosten bzw. zulässigen Pauschalen.

Eine Lohnversteuerung entfällt in diesem Fall.

Übersteigt die Erstattung die tatsächlichen Kosten oder die zulässigen Pauschalen, ist der übersteigende Betrag steuerpflichtiger Arbeitslohn.

► 4. Werbungskostenabzug beim Arbeitnehmer

Soweit der Arbeitgeber Reisekosten steuerfrei erstattet, ist ein Werbungskostenabzug beim Arbeitnehmer ausgeschlossen.

Merksatz:
Steuerfrei erstattet = kein Werbungskostenabzug.

Nur nicht erstattete oder nicht vollständig erstattete berufliche Reisekosten können beim Arbeitnehmer noch als Werbungskosten berücksichtigt werden.

► 5. Verpflegungsmehraufwendungen bei Auswärtstätigkeit

Für Verpflegungsmehraufwendungen werden keine tatsächlichen Kosten angesetzt, sondern gesetzliche Pauschbeträge.

Bei Auslandsreisen gelten länderspezifische Pauschalen, die regelmäßig durch das BMF veröffentlicht werden.

► 6. Zweitägige Dienstreise nach Brüssel

Sachverhalt:
- Hinreise: 04.02.
- Rückreise: 05.02.
- Reiseziel: Brüssel / Belgien
- mehrtägige Auswärtstätigkeit mit Übernachtung

Für Belgien / Brüssel beträgt die angenommene Tagespauschale im Beispiel 64,00 Euro.

Für An- und Abreisetage sind jeweils 80 % der Tagespauschale anzusetzen.

Berechnung:
64,00 Euro x 80 % = 51,20 Euro

Anreisetag 04.02.:
51,20 Euro

Abreisetag 05.02.:
51,20 Euro

Insgesamt:
51,20 Euro + 51,20 Euro = 102,40 Euro

Da die Reise nur zwei Tage dauert, gibt es keinen vollen Zwischentag.

► 7. Kürzung bei gestellten Mahlzeiten

Werden Mahlzeiten vom Arbeitgeber oder auf dessen Veranlassung gestellt, sind die Verpflegungspauschalen zu kürzen.

Kürzung:
- Frühstück: 20 % der vollen Tagespauschale
- Mittagessen: 40 % der vollen Tagespauschale
- Abendessen: 40 % der vollen Tagespauschale

Bei einer Tagespauschale von 64,00 Euro:

Frühstück:
64,00 Euro x 20 % = 12,80 Euro

Mittagessen:
64,00 Euro x 40 % = 25,60 Euro

Abendessen:
64,00 Euro x 40 % = 25,60 Euro

Die Kürzung erfolgt auch an An- und Abreisetagen grundsätzlich anhand der vollen Tagespauschale.

► 8. Steuerfreie Erstattung der Verpflegungspauschalen

Erstattet der Arbeitgeber die Verpflegungspauschalen steuerfrei, ist ein Werbungskostenabzug beim Arbeitnehmer insoweit ausgeschlossen.

Beispiel:
Zulässige Pauschale für Brüssel-Reise:
102,40 Euro

Steuerfreie Erstattung durch Arbeitgeber:
102,40 Euro

Folge:
Kein zusätzlicher Werbungskostenabzug beim Arbeitnehmer.

► 9. Prüfungs-Merksätze

Reisekostenerstattung:
Nach § 3 Nr. 16 EStG steuerfrei, soweit die Erstattung die nach § 9 EStG abziehbaren Werbungskosten nicht übersteigt.

Belegpflicht:
Tatsächliche Kosten müssen nachgewiesen und die Belege zum Lohnkonto genommen werden.

Überzahlung:
Übersteigt die Erstattung die tatsächlichen Kosten oder zulässigen Pauschalen, ist der übersteigende Betrag steuerpflichtiger Arbeitslohn.

Verpflegung:
Für Verpflegung werden Pauschalen angesetzt, keine tatsächlichen Kosten.

Ausland:
Bei Auslandsreisen gelten länderspezifische Pauschbeträge.

Anreise / Abreise:
Bei mehrtägiger Auswärtstätigkeit mit Übernachtung werden An- und Abreisetag jeweils mit 80 % der Tagespauschale angesetzt.

Mahlzeiten:
Gestellte Mahlzeiten kürzen die Pauschale:
Frühstück 20 %, Mittagessen 40 %, Abendessen 40 %.

Werbungskosten:
Steuerfrei vom Arbeitgeber ersetzt = kein Werbungskostenabzug beim Arbeitnehmer.
`
},
{
  id: "betriebsveraeusserung-erbe-16-34-estg",
  title: "Betriebsveräußerung durch Erben (§ 16 Abs. 4 und § 34 Abs. 3 EStG)",
  short:
    "Steuerliche Begünstigungen bei der Veräußerung eines geerbten Betriebs oder Mitunternehmeranteils durch den Erben.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "§ 16 estg|§ 34 estg|betriebsveräußerung|mitunternehmer|erbfall|erbe|freibetrag|tarifermäßigung|außerordentliche einkünfte|praxisverkauf|mitunternehmeranteil",
  references: [
    "§ 16 Abs. 4 EStG",
    "§ 34 Abs. 3 EStG",
    "§ 16 EStG",
    "§ 34 EStG"
  ],
  body: `
⇨ Betriebsveräußerung durch Erben

► Grundsatz

Erwirbt ein Erbe durch Erbfall einen Betrieb oder einen Mitunternehmeranteil und veräußert diesen anschließend, kann er die steuerlichen Begünstigungen nach § 16 Abs. 4 EStG und § 34 Abs. 3 EStG in Anspruch nehmen.

Eine vorherige Mitunternehmerstellung ist nicht erforderlich.

Entscheidend ist, dass der Erbe durch den Erbfall selbst Mitunternehmer wird.

► Freibetrag nach § 16 Abs. 4 EStG

Der Freibetrag kann auch einem Erben zustehen.

Voraussetzungen:

- Erwerb des Betriebs oder Mitunternehmeranteils durch Erbanfall.
- Veräußerung des gesamten Betriebs oder Mitunternehmeranteils.
- Persönliche Voraussetzungen des § 16 Abs. 4 EStG sind erfüllt (z. B. Vollendung des maßgeblichen Lebensalters oder dauernde Berufsunfähigkeit).

Eine frühere Beteiligung am Betrieb ist nicht erforderlich.

► Tarifermäßigung nach § 34 Abs. 3 EStG

Auch die Tarifermäßigung kann vom Erben beansprucht werden.

Voraussetzungen:

- Außerordentliche Einkünfte liegen vor.
- Der Betrieb oder Mitunternehmeranteil wird im Ganzen veräußert.
- Die persönlichen Voraussetzungen des § 34 Abs. 3 EStG sind erfüllt.

Der Erbe wird steuerlich so behandelt, als hätte er den Betrieb selbst veräußert.

► Mitunternehmerstellung des Erben

Mitunternehmer muss der Erbe erst zum Zeitpunkt der Veräußerung sein.

Es ist nicht erforderlich, dass er bereits vor dem Erbfall Mitunternehmer war.

Der Eintritt in die Mitunternehmerstellung erfolgt durch den Erbfall.

► Meinungsstand

Rechtsprechung, Literatur und Finanzverwaltung vertreten übereinstimmend die Auffassung, dass die Begünstigungen auch Erben zustehen.

Eine Beschränkung auf bereits vor dem Erbfall beteiligte Mitunternehmer besteht nicht.

► Prüfungsschema

1. Liegt ein Erbfall vor?

2. Hat der Erbe dadurch einen Betrieb oder Mitunternehmeranteil erworben?

3. Wird der Betrieb oder Mitunternehmeranteil im Ganzen veräußert?

4. Liegen die persönlichen Voraussetzungen des § 16 Abs. 4 EStG vor?

5. Liegen außerordentliche Einkünfte nach § 34 Abs. 3 EStG vor?

6. Freibetrag und Tarifermäßigung prüfen.

► Rechtsfolge

Sind sämtliche Voraussetzungen erfüllt,

kann der Erbe

- den Freibetrag nach § 16 Abs. 4 EStG und
- die Tarifermäßigung nach § 34 Abs. 3 EStG

beanspruchen.

► Prüfungsmerksätze

Eine vorherige Mitunternehmerstellung ist nicht erforderlich.

Der Erbe wird durch den Erbfall Mitunternehmer.

Die steuerlichen Begünstigungen gelten auch für Erben.

Maßgeblich ist die Veräußerung des gesamten Betriebs oder Mitunternehmeranteils.

► Klausurtipp

Typische Prüfungsfalle:

Viele gehen davon aus, dass der Erbe bereits vor dem Erbfall Mitunternehmer gewesen sein muss.

Das ist falsch.

Entscheidend ist allein, dass der Erbe durch den Erbfall Mitunternehmer wird und anschließend den Betrieb oder Mitunternehmeranteil im Ganzen veräußert.
`
},
{
  id: "heilberufe-umsatzsteuer-freiberuflichkeit",
  title: "Ärzte und Psychotherapeuten: Umsatzsteuer und Freiberuflichkeit",
  short:
    "Aktuelle Rechtsprechung zur Umsatzsteuerbefreiung, § 18 EStG und Abgrenzung freiberuflicher Tätigkeiten.",
  category: "Umsatzsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "arzt|ärzte|psychotherapeut|heilberufe|heilbehandlung|§ 4 nr. 14 ustg|§ 18 estg|gemeinschaftspraxis|freiberuflich|gewerblich|umsatzsteuerbefreiung|heilberuf",
  references: [
    "§ 4 Nr. 14 UStG",
    "§ 18 EStG",
    "§ 73b SGB V",
    "§ 73c SGB V"
  ],
  body: `
⇨ Ärzte und Psychotherapeuten

► Umsatzsteuerbefreiung

Heilberufliche Leistungen sind nach § 4 Nr. 14 UStG steuerfrei,

wenn

- ein therapeutischer Zweck vorliegt,
- die Leistung der Diagnose, Behandlung oder Vorbeugung dient,
- sie durch entsprechend qualifizierte Personen erbracht wird.

Die Rechtsform spielt keine Rolle.

Die Steuerbefreiung gilt daher auch für:

- Gemeinschaftspraxen
- Berufsausübungsgemeinschaften
- GmbH & Co. KG

► Nicht steuerfrei

Keine Steuerbefreiung besteht insbesondere bei

- Verkauf von Praxisinventar
- rein organisatorischen Leistungen
- Leistungen ohne therapeutischen Zweck

► Medikamente

Die Abgabe von Medikamenten kann eine unselbständige Nebenleistung sein,

wenn sie für die Heilbehandlung notwendig ist.

► Hausarztverträge

Auch Leistungen nach

- § 73b SGB V
- § 73c SGB V

können unter die Umsatzsteuerbefreiung fallen.

► Einkommensteuer

Ärzte und Psychotherapeuten erzielen grundsätzlich Einkünfte aus selbständiger Arbeit (§ 18 EStG).

Voraussetzung:

Die Tätigkeit wird

- eigenverantwortlich,
- persönlich,
- fachlich unabhängig

ausgeübt.

► Aktuelle Prüfungsschwerpunkte

- Abgrenzung freiberuflich / gewerblich
- Mitunternehmerschaft in Gemeinschaftspraxen
- Delegation ärztlicher Tätigkeiten
- Einsatz fachlich qualifizierter Mitarbeiter

► Prüfungsmerksätze

Heilbehandlung + therapeutischer Zweck + Qualifikation
=
Steuerfrei nach § 4 Nr. 14 UStG.

Rechtsform ist unbeachtlich.

Kein therapeutischer Zweck
=
Umsatzsteuerpflicht.

Eigenverantwortliche Berufsausübung
=
Freiberufliche Einkünfte nach § 18 EStG.
`
},
{
  id: "praxisveraeusserung-freibetrag-tarifermaessigung",
  title: "Praxisveräußerung: Freibetrag (§ 16 Abs. 4 EStG) und Tarifermäßigung (§ 34 Abs. 3 EStG)",
  short:
    "Steuerliche Begünstigungen bei der Veräußerung einer freiberuflichen Praxis: Freibetrag, Tarifermäßigung und Prüfungsschema.",
  category: "Einkommensteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "§ 16 abs. 4 estg|§ 34 abs. 3 estg|praxisverkauf|praxisveräußerung|veräußerungsgewinn|freibetrag|tarifermäßigung|außerordentliche einkünfte|freiberufler|§ 18 estg|56 prozent|14 prozent|55 lebensjahr",
  references: [
    "§ 16 Abs. 4 EStG",
    "§ 18 Abs. 3 EStG",
    "§ 34 Abs. 2 Nr. 1 EStG",
    "§ 34 Abs. 3 EStG"
  ],
  body: `
⇨ Praxisveräußerung: Freibetrag und Tarifermäßigung

► Grundsatz

Veräußert ein Freiberufler seine gesamte Praxis, können unter bestimmten Voraussetzungen zwei steuerliche Begünstigungen in Anspruch genommen werden:

- Freibetrag nach § 16 Abs. 4 EStG
- Tarifermäßigung nach § 34 Abs. 3 EStG

Beide Begünstigungen dienen dazu, die steuerliche Belastung des einmaligen Veräußerungsgewinns zu reduzieren.

► Freibetrag nach § 16 Abs. 4 EStG

Der Freibetrag beträgt grundsätzlich:

45.000 Euro.

Voraussetzungen:

- Veräußerung oder Aufgabe des gesamten Betriebs oder Mitunternehmeranteils,
- Vollendung des 55. Lebensjahres oder dauernde Berufsunfähigkeit,
- personenbezogene Inanspruchnahme (nur einmal im Leben).

Der Freibetrag gilt auch bei der Veräußerung einer freiberuflichen Praxis (§ 18 Abs. 3 EStG).

► Kürzung des Freibetrags

Der Freibetrag wird gekürzt,

wenn der Veräußerungsgewinn

136.000 Euro übersteigt.

Kürzungsformel:

45.000 Euro
minus

(Veräußerungsgewinn
minus
136.000 Euro)

Beispiel:

Veräußerungsgewinn:
150.000 Euro

Übersteigender Betrag:

150.000
-
136.000
=
14.000 Euro

Freibetrag:

45.000
-
14.000
=
31.000 Euro

Ab einem Veräußerungsgewinn von 181.000 Euro entfällt der Freibetrag vollständig.

► Tarifermäßigung nach § 34 Abs. 3 EStG

Zusätzlich kann auf Antrag die Tarifermäßigung nach § 34 Abs. 3 EStG beansprucht werden.

Voraussetzungen:

- Vollendung des 55. Lebensjahres oder dauernde Berufsunfähigkeit,
- außerordentliche Einkünfte nach § 34 Abs. 2 Nr. 1 EStG,
- Veräußerung eines gesamten Betriebs oder einer gesamten freiberuflichen Praxis,
- Antrag des Steuerpflichtigen.

Die Tarifermäßigung kann nur einmal im Leben beansprucht werden.

► Berechnung

Zunächst:

Veräußerungsgewinn

minus

Freibetrag nach § 16 Abs. 4 EStG.

Der verbleibende Gewinn wird anschließend mit einem ermäßigten Steuersatz besteuert.

Ermäßigter Steuersatz:

56 % des durchschnittlichen Steuersatzes,

mindestens jedoch

14 %.

► Zweck der Tarifermäßigung

Die Tarifermäßigung soll die Progressionswirkung vermeiden,

die entsteht,

wenn ein hoher Veräußerungsgewinn in einem einzigen Veranlagungszeitraum zufließt.

► Prüfungsschema

1. Liegt eine Betriebs- oder Praxisveräußerung vor?

2. Handelt es sich um außerordentliche Einkünfte (§ 34 Abs. 2 Nr. 1 EStG)?

3. Ist der Steuerpflichtige mindestens 55 Jahre alt oder dauernd berufsunfähig?

4. Freibetrag nach § 16 Abs. 4 EStG prüfen.

5. Freibetrag ggf. wegen Überschreitens von 136.000 Euro kürzen.

6. Tarifermäßigung nach § 34 Abs. 3 EStG beantragt?

7. Ermäßigten Steuersatz anwenden.

► Beispiel

Praxisverkauf:

Veräußerungsgewinn:
150.000 Euro

Freibetrag:

31.000 Euro

Steuerlich begünstigter Gewinn:

119.000 Euro

Dieser Gewinn wird anschließend nach § 34 Abs. 3 EStG mit dem ermäßigten Steuersatz besteuert.

► Rechtsfolgen

Freibetrag:

45.000 Euro,
ggf. gekürzt.

Tarifermäßigung:

56 % des durchschnittlichen Steuersatzes,

mindestens 14 %.

Beide Begünstigungen können grundsätzlich miteinander kombiniert werden.

► Prüfungsmerksätze

Der Freibetrag beträgt grundsätzlich 45.000 Euro.

Ab 136.000 Euro Veräußerungsgewinn erfolgt eine Kürzung.

Ab 181.000 Euro entfällt der Freibetrag vollständig.

Die Tarifermäßigung beträgt 56 % des durchschnittlichen Steuersatzes,

mindestens jedoch 14 %.

Beide Vergünstigungen können nur einmal im Leben beansprucht werden.

► Klausurtipp

Typische Prüfungsfalle:

Viele wenden die Tarifermäßigung unmittelbar auf den gesamten Veräußerungsgewinn an.

Richtig ist:

1. Veräußerungsgewinn ermitteln.

2. Freibetrag nach § 16 Abs. 4 EStG abziehen.

3. Erst den verbleibenden Gewinn nach § 34 Abs. 3 EStG tarifbegünstigt versteuern.

Merksatz:

Erst Freibetrag – dann Tarifermäßigung.
`
},
{
  id: "haeusliches-arbeitszimmer-aufzeichnungspflicht-bfh-2026",
  title: "Häusliches Arbeitszimmer: Aufzeichnungspflicht nach § 4 Abs. 7 EStG",
  short:
    "BFH VIII R 6/24: Zeitnahe Aufzeichnungspflicht für Selbständige, Unterschiede zu Arbeitnehmern und Prüfungsschema.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "häusliches arbeitszimmer|§ 4 abs. 7 estg|§ 4 abs. 5 nr. 6b estg|jahrespauschale|bfh viii r 6/24|aufzeichnungspflicht|betriebsausgaben|werbungskosten|arbeitnehmer|selbständige",
  references: [
    "§ 4 Abs. 7 EStG",
    "§ 4 Abs. 5 Nr. 6b EStG",
    "§ 9 EStG",
    "§ 129 AO",
    "BFH VIII R 6/24"
  ],
  body: `
⇨ Häusliches Arbeitszimmer

► Grundsatz

Die besondere Aufzeichnungspflicht des § 4 Abs. 7 EStG gilt ausschließlich für Steuerpflichtige mit Gewinneinkünften.

Sie betrifft insbesondere:

- Einzelunternehmer
- Freiberufler
- Selbständige

Nicht betroffen sind Arbeitnehmer, die Aufwendungen als Werbungskosten nach § 9 EStG geltend machen.

► Arbeitnehmer

Arbeitnehmer müssen keine zeitnahen Einzelaufzeichnungen führen.

Erforderlich sind lediglich:

- geeignete Belege
- nachvollziehbare Berechnung
- Nachweis der beruflichen Nutzung

Die BFH-Rechtsprechung zur Aufzeichnungspflicht ist auf Arbeitnehmer nicht übertragbar.

► Selbständige

Nach dem BFH-Urteil VIII R 6/24 gilt:

Aufwendungen sind nur abzugsfähig, wenn sie

- einzeln,
- getrennt,
- und zeitnah

aufgezeichnet werden.

Die Dokumentation muss

- in einer gesonderten Spalte der Buchführung oder
- in einem gesonderten digitalen oder schriftlichen Dokument

erfolgen.

Nicht ausreichend sind:

- bloße Belegsammlungen
- nachträgliche Excel-Listen
- erst bei Erstellung der Steuererklärung erstellte Übersichten

► Jahrespauschale

Wird ab VZ 2023 die Jahrespauschale genutzt,

entfällt die besondere Aufzeichnungspflicht nach § 4 Abs. 7 EStG.

► Prüfungsschema

1. Liegt ein häusliches Arbeitszimmer nach § 4 Abs. 5 Nr. 6b EStG vor?

2. Erfolgt die Nutzung nahezu ausschließlich beruflich?

3. Werden sämtliche Aufwendungen einzeln, getrennt und zeitnah dokumentiert?

4. Erfolgt die Dokumentation in einer gesonderten Aufzeichnung?

5. Wird stattdessen die Jahrespauschale genutzt?

► Rechtsfolge

Verstoß gegen § 4 Abs. 7 EStG:

=> Betriebsausgabenabzug ausgeschlossen.

Ausnahme:

Eine offenbare Unrichtigkeit kann ggf. nach § 129 AO berichtigt werden.

► Prüfungsmerksätze

Selbständige:
Zeitnahe Einzelaufzeichnung zwingend.

Arbeitnehmer:
Keine besondere Aufzeichnungspflicht.

Jahrespauschale:
Aufzeichnungspflicht entfällt.

BFH VIII R 6/24:
Bloße Belegsammlung genügt nicht.
`
},
{
  id: "sachbezug-gutscheinkarten-50-euro-freigrenze",
  title: "Sachbezüge: Gutscheinkarten bis 50 €",
  short:
    "Steuerfreie Gutscheinkarten nach § 8 Abs. 2 Satz 11 EStG: Voraussetzungen, 50-Euro-Freigrenze und ZAG-Kriterien.",
  category: "Lohnsteuer",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "gutschein|gutscheinkarte|amazon|ikea|dm|netflix|sachbezug|50 euro|50€|freigrenze|§ 8 abs. 2 estg|zag|zusätzlichkeitsvoraussetzung|geburtstag|mitarbeiter|geldkarte|lohnsteuer",
  references: [
    "§ 8 Abs. 2 Satz 11 EStG",
    "§ 2 Abs. 1 Nr. 10 ZAG",
    "BMF-Schreiben Sachbezüge",
    "BFH Sachbezüge"
  ],
  body: `
⇨ Gutscheinkarten als Sachbezug

► Grundsatz

Gutscheinkarten können steuerfrei an Arbeitnehmer ausgegeben werden, wenn sie die Voraussetzungen eines begünstigten Sachbezugs erfüllen.

Die Steuerfreiheit richtet sich nach § 8 Abs. 2 Satz 11 EStG.

Typische Anlässe:
- Geburtstag
- Jubiläum
- Anerkennung besonderer Leistungen

► Begünstigte Gutscheinkarten

Grundsätzlich können begünstigt sein:

- DM
- Ikea
- Netflix
- Amazon (nur unter bestimmten Voraussetzungen)

Voraussetzung ist, dass die Gutscheinkarte ausschließlich zum Bezug von Waren oder Dienstleistungen berechtigt.

► Voraussetzungen

Die Gutscheinkarte muss die Voraussetzungen des § 2 Abs. 1 Nr. 10 ZAG erfüllen.

Begünstigt sind insbesondere:

⇶  Closed-Loop-Karten

Einlösbar ausschließlich bei einem Händler.

Beispiele:
- DM
- Ikea

Diese sind grundsätzlich begünstigt.

⇶  Controlled-Loop-Karten

Einlösbar bei einem begrenzten Kreis von Akzeptanzstellen im Inland.

Auch diese können steuerlich begünstigt sein.

⇶  Amazon

Amazon-Gutscheine sind nur begünstigt, wenn sie ausschließlich für Eigenprodukte von Amazon verwendet werden können.

Sind sie auch für Marketplace-Händler bzw. Fremdanbieter verwendbar, liegt regelmäßig keine begünstigte Sachzuwendung vor.

⇶  Netflix

Netflix-Gutscheine sind grundsätzlich begünstigt, wenn sie ausschließlich für Streaming-Leistungen von Netflix eingesetzt werden können.

► Weitere Voraussetzungen

Die Gutscheinkarte muss:

- zusätzlich zum ohnehin geschuldeten Arbeitslohn gewährt werden,
- unmittelbar als Sachzuwendung ausgegeben werden,
- keine Gehaltsumwandlung darstellen.

Nicht zulässig sind insbesondere:

- Barauszahlung
- Auszahlung auf ein Konto
- Überweisungsfunktion
- IBAN
- Kauf von Kryptowährungen
- Devisengeschäfte
- allgemeine Zahlungsfunktion

► 50-Euro-Freigrenze

Die Freigrenze beträgt:

50 Euro pro Kalendermonat.

Alle Sachbezüge eines Monats werden zusammengerechnet.

Wichtig:

Wird die Freigrenze überschritten,

ist nicht nur der Mehrbetrag,

sondern der gesamte Sachbezug steuerpflichtig.

Es handelt sich um eine Freigrenze und nicht um einen Freibetrag.

► Werbungskosten oder Lohn?

Die Gutscheinkarte stellt keinen steuerpflichtigen Arbeitslohn dar,

wenn

- sämtliche Voraussetzungen erfüllt sind,
- die Freigrenze eingehalten wird,
- die Zusätzlichkeitsvoraussetzung erfüllt ist.

► Prüfungsschema

1. Liegt eine Gutscheinkarte oder Geldkarte vor?

2. Erfüllt sie § 2 Abs. 1 Nr. 10 ZAG?

3. Ausschließlich Waren oder Dienstleistungen?

4. Closed-Loop oder Controlled-Loop?

5. Keine Geldersatzfunktion?

6. Zusätzlich zum ohnehin geschuldeten Arbeitslohn?

7. Freigrenze von 50 Euro eingehalten?

► Amazon-Gutscheine

Besondere Vorsicht:

Begünstigt:
- ausschließlich Amazon-Eigenprodukte

Nicht begünstigt:
- Marketplace
- Fremdanbieter
- allgemeine Zahlungsfunktion

► Prüfungsmerksätze

50 Euro sind eine Freigrenze.

Bei Überschreiten ist der gesamte Sachbezug steuerpflichtig.

Keine Gehaltsumwandlung.

Keine Barauszahlung.

Keine Geldersatzfunktion.

Closed-Loop und Controlled-Loop können begünstigt sein.

Amazon-Gutscheine immer besonders prüfen.

► Klausurtipp

Bei Gutscheinen immer folgende Reihenfolge prüfen:

1. Zusätzlichkeitsvoraussetzung
2. § 2 Abs. 1 Nr. 10 ZAG
3. Geldleistung oder Sachbezug?
4. 50-Euro-Freigrenze
5. Rechtsfolge (steuerfrei oder steuerpflichtig)

Merksatz:

"50 Euro + Sachbezug + zusätzlich zum Lohn + keine Geldfunktion = steuerfrei."
`
},
{
  id: "wissenschaftliche-veranstaltungen-zweckbetrieb",
  title: "Wissenschaftliche Veranstaltungen: Zweckbetrieb oder ideelle Sphäre?",
  short:
    "Zuordnung wissenschaftlicher Veranstaltungen eines gemeinnützigen Vereins zum Zweckbetrieb, Abgrenzung zur ideellen Sphäre und Folgen fehlerhafter Zuordnungen.",
  category: "Vereine",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "zweckbetrieb|ideelle sphäre|wissenschaft|forschung|veranstaltung|teilnehmerbeiträge|gemeinnützigkeit|§ 65 ao|§ 68 nr. 9 ao|leistungsaustausch|wirtschaftlicher geschäftsbetrieb|aeao|fördermittel",
  references: [
    "§§ 51 ff. AO",
    "§ 55 AO",
    "§ 64 AO",
    "§ 65 AO",
    "§ 68 Nr. 9 AO",
    "§ 21 BGB",
    "§§ 69, 71 AO",
    "§ 130 OWiG",
    "AEAO zu §§ 55, 64 und 65 AO"
  ],
  body: `
⇨ Wissenschaftliche Veranstaltungen eines gemeinnützigen Vereins

► Grundsatz

Organisiert ein gemeinnütziger Verein wissenschaftliche Veranstaltungen und erhebt hierfür Teilnehmerbeiträge, sind die Einnahmen und Ausgaben grundsätzlich dem Zweckbetrieb zuzuordnen.

Voraussetzung ist,

- dass die Förderung von Wissenschaft und Forschung Satzungszweck ist,
- die Veranstaltung unmittelbar diesem Satzungszweck dient,
- und ein Leistungsaustausch zwischen Verein und Teilnehmern vorliegt.

Rechtsgrundlagen:
- § 65 AO
- § 68 Nr. 9 AO

► Zweckbetrieb

Ein Zweckbetrieb liegt vor, wenn

- die Veranstaltung überwiegend wissenschaftlicher oder belehrender Art ist,
- sie unmittelbar der Verwirklichung des gemeinnützigen Zwecks dient,
- die Teilnehmerbeiträge zur Finanzierung der Veranstaltung verwendet werden.

Typische Einnahmen:

- Teilnehmergebühren
- Kongressgebühren
- Seminargebühren
- Tagungsbeiträge

Typische Ausgaben:

- Raummiete
- Referentenhonorare
- Technik
- Catering
- Druckkosten
- Reisekosten

Alle diese Einnahmen und Aufwendungen gehören zum Zweckbetrieb.

► Ideelle Sphäre

Eine Zuordnung zur ideellen Sphäre kommt nur in Betracht,

wenn kein Leistungsaustausch vorliegt.

Beispiele:

- echte Spenden
- Mitgliedsbeiträge
- Zuschüsse ohne Gegenleistung

Sobald Teilnehmer für eine konkrete Leistung bezahlen,

liegt regelmäßig keine ideelle Tätigkeit mehr vor.

► Leistungsaustausch

Leistungsaustausch bedeutet:

Der Teilnehmer erhält eine konkrete Gegenleistung für seine Zahlung.

Beispiele:

- Teilnahme an einem Kongress
- wissenschaftliche Vorträge
- Workshops
- Fortbildungsveranstaltungen

Dann gehören Einnahmen und Ausgaben grundsätzlich zum Zweckbetrieb.

► Prüfungsschema

1. Ist der Verein gemeinnützig?

2. Gehört die Förderung von Wissenschaft und Forschung zum Satzungszweck?

3. Dient die Veranstaltung unmittelbar diesem Zweck?

4. Liegt ein Leistungsaustausch vor?

5. Werden Teilnehmerbeiträge erhoben?

6. Werden die Einnahmen überwiegend zur Kostendeckung verwendet?

7. Ergebnis:

=> Zweckbetrieb nach §§ 65, 68 AO.

► Folgen einer falschen Zuordnung

Eine fehlerhafte Zuordnung kann erhebliche Folgen haben.

⇶  Steuerrechtliche Folgen

Wird eine Tätigkeit fälschlich der ideellen Sphäre zugeordnet,

obwohl tatsächlich

- ein Zweckbetrieb oder
- ein wirtschaftlicher Geschäftsbetrieb

vorliegt,

drohen insbesondere:

- Körperschaftsteuer
- Gewerbesteuer
- Verlust steuerlicher Vergünstigungen
- Aberkennung der Gemeinnützigkeit

Besonders kritisch ist eine unzulässige Mittelverwendung nach § 55 AO.

► Wirtschaftlicher Geschäftsbetrieb

Liegt keine unmittelbare Zweckverwirklichung mehr vor,

kann stattdessen ein steuerpflichtiger wirtschaftlicher Geschäftsbetrieb entstehen.

Dann gelten die Vorschriften des § 64 AO.

► Gemeinnützigkeit

Eine dauerhafte Finanzierung steuerpflichtiger wirtschaftlicher Tätigkeiten aus Mitteln der ideellen Sphäre kann gegen § 55 AO verstoßen.

Dadurch kann die Gemeinnützigkeit gefährdet werden.

Nach dem AEAO bestehen lediglich eng begrenzte Ausnahmen,

beispielsweise:

- Fehlkalkulation
- kurzfristige Verlustübernahme
- Rückführung der Mittel innerhalb von zwölf Monaten

► Zivilrechtliche Folgen

Ein eingetragener Verein nach § 21 BGB muss überwiegend ideelle Zwecke verfolgen.

Eine dauerhafte wirtschaftliche Tätigkeit kann den Vereinsstatus gefährden.

► Haftungsrisiken

Fehlerhafte Zuordnungen können zu einer persönlichen Haftung der Vorstandsmitglieder führen.

Mögliche Rechtsgrundlagen:

- § 69 AO
- § 71 AO
- § 130 OWiG

Bei vorsätzlichen oder leichtfertigen Pflichtverletzungen können zusätzlich steuerstrafrechtliche Folgen eintreten.

► Zuschüsse und Fördermittel

Auch öffentliche Zuschüsse sind zutreffend zuzuordnen.

Besteht ein Leistungsaustausch,

kann

- Umsatzsteuer,
- Körperschaftsteuer oder
- Gewerbesteuer

ausgelöst werden.

Außerdem können Verstöße gegen Förderbedingungen zu Rückforderungen führen.

► Meinungsstand

Finanzverwaltung, Literatur und Rechtsprechung vertreten übereinstimmend,

dass wissenschaftliche Veranstaltungen mit Teilnehmerbeiträgen grundsätzlich dem Zweckbetrieb zuzuordnen sind,

wenn

- die Satzungszwecke verwirklicht werden,
- ein unmittelbarer Zusammenhang zur Gemeinnützigkeit besteht,
- und die Veranstaltungen nicht überwiegend der Gewinnerzielung dienen.

Gemischt veranlasste Aufwendungen sind sachgerecht aufzuteilen.

► Prüfungsmerksätze

Leistungsaustausch

= grundsätzlich Zweckbetrieb.

Keine Gegenleistung

= ideelle Sphäre.

Teilnehmerbeiträge für wissenschaftliche Veranstaltungen

= regelmäßig Zweckbetrieb.

Spenden und echte Mitgliedsbeiträge

= ideelle Sphäre.

► Klausurtipp

Typische Prüfungsfalle:

Viele ordnen Teilnehmerbeiträge automatisch der ideellen Sphäre zu.

Das ist falsch.

Sobald der Teilnehmer für eine konkrete Leistung zahlt,

liegt regelmäßig ein Leistungsaustausch vor.

Damit gehören sowohl die Einnahmen als auch die dazugehörigen Aufwendungen grundsätzlich in den Zweckbetrieb.
`
},
{
  id: "jahresabschlussanalyse-gkv-ebit-kennzahlen-kst",
  title: "Jahresabschlussanalyse: GuV, EBIT, Kennzahlen und KSt-Korrekturen",
  short:
    "Prüfungswissen zu GuV nach § 275 Abs. 2 HGB, ordentlichem Betriebsergebnis, Rentabilitätskennzahlen, Lagerkennzahlen, Leverage-Effekt sowie vGA/vE in der Körperschaftsteuer.",
  category: "Jahresabschluss",
  source: "Interne Steuerstoff-Prüfungsvorbereitung",
  keywords:
    "guv|gesamtkostenverfahren|gkv|§ 275 hgb|betriebsergebnis|ebit|ordentliches betriebsergebnis|neutrale erträge|neutrale aufwendungen|eigenkapitalquote|eigenkapitalrentabilität|gesamtkapitalrentabilität|fremdkapitalzinssatz|leverage effekt|lagerdauer|umschlagshäufigkeit|vorräte|forderung|verbindlichkeiten|dso|dpo|körperschaftsteuer|vga|verdeckte gewinnausschüttung|ve|verdeckte einlage|§ 8 kstg|§ 8b kstg|§ 27 kstg",
  references: [
    "§ 275 Abs. 2 HGB",
    "§ 8 Abs. 3 Satz 2 KStG",
    "§ 8 Abs. 3 Satz 3 KStG",
    "§ 8b KStG",
    "§ 27 KStG"
  ],
  body: `
⇨ Jahresabschlussanalyse: GuV, EBIT, Kennzahlen und KSt-Korrekturen

► 1. GuV nach § 275 Abs. 2 HGB – Gesamtkostenverfahren

Bei der Gewinn- und Verlustrechnung nach dem Gesamtkostenverfahren werden Erträge und Aufwendungen nach dem Schema des § 275 Abs. 2 HGB geordnet.

Typisches Schema:

1. Umsatzerlöse  
2. +/- Bestandsveränderungen  
3. andere aktivierte Eigenleistungen  
4. sonstige betriebliche Erträge  
5. Materialaufwand  
6. Personalaufwand  
7. Abschreibungen  
8. sonstige betriebliche Aufwendungen einschließlich sonstiger Steuern  
9./10. Betriebsergebnis  
11. Finanzerträge  
12. Finanzaufwendungen  
13. Finanzergebnis  
14. Steuern vom Einkommen und Ertrag  
15. Jahresüberschuss / Jahresfehlbetrag  

Wichtig:
Sonstige Steuern werden regelmäßig den betrieblichen Aufwendungen zugeordnet.

Beispiel:
Sonstige betriebliche Aufwendungen: 162.840  
+ sonstige Steuern: 680  
= sonstige betriebliche Aufwendungen einschließlich sonstiger Steuern: 163.520

Betriebsergebnis:
Gesamterträge des Betriebs minus Gesamtaufwendungen des Betriebs.

Beispiel:
Umsatzerlöse 678.130  
+ Bestandsveränderungen 16.070  
+ sonstige betriebliche Erträge 51.750  
= Gesamterträge 745.950

Materialaufwand 128.580  
+ Personalaufwand 240.370  
+ Abschreibungen 109.090  
+ sonstige betriebliche Aufwendungen inkl. sonstiger Steuern 163.520  
= Gesamtaufwand 641.560

Betriebsergebnis:
745.950 - 641.560 = 104.390

Finanzergebnis:
Zinserträge 2.500  
- Zinsaufwendungen 23.500  
= -21.000

Ergebnis vor Steuern:
104.390 - 21.000 = 83.390

Nach Steuern vom Einkommen und Ertrag:
83.390 - 4.270 = 79.120 Jahresüberschuss


► 2. Ordentliches Betriebsergebnis / EBIT

Das ordentliche Betriebsergebnis zeigt den Erfolg des eigentlichen Kerngeschäfts.

Nicht zum Kerngeschäft gehören neutrale Erträge und neutrale Aufwendungen.

Betriebliche Posten:
- Umsatzerlöse
- Bestandsveränderungen
- Materialaufwand
- Personalaufwand
- Abschreibungen
- sonstige betriebliche Aufwendungen i. e. S.
- sonstige Steuern

Neutrale Erträge:
- Erträge aus Auflösung von Rückstellungen
- Mieterträge, wenn sie nicht zum Kerngeschäft gehören
- Zinserträge

Neutrale Aufwendungen:
- periodenfremde Aufwendungen
- Aufwendungen für Fremdvermietung
- Einzelwertberichtigungen, wenn in der Aufgabe neutral vorgegeben
- außerordentliche Aufwendungen
- Zinsaufwendungen

Beispiel neutrale Erträge:
Auflösung Rückstellungen 11.260  
+ Mieterträge 27.040  
= neutrale Erträge 38.300

Beispiel neutrale Aufwendungen:
periodenfremde Aufwendungen 6.250  
+ Fremdvermietung 420  
+ Einzelwertberichtigung 8.190  
+ außerordentliche Aufwendungen 23.340  
+ Zinsen 23.500  
= neutrale Aufwendungen 61.700

Ordentliches Betriebsergebnis:
Betriebliche Erträge minus betriebliche Aufwendungen.

Merksatz:
Das ordentliche Betriebsergebnis zeigt die wirtschaftliche Leistung aus dem Kerngeschäft. Neutrale, außerordentliche und periodenfremde Vorgänge sowie das Zinsergebnis werden herausgerechnet.


► 3. Kapitalstruktur- und Rentabilitätskennzahlen

Gegeben:
Durchschnittliches Eigenkapital: 1.400.000  
Durchschnittliches Gesamtkapital: 3.625.000  
Zinsaufwendungen: 157.500  
Sonstige Aufwendungen: 3.000.000  
Erträge: 3.350.000

Fremdkapital:
Gesamtkapital - Eigenkapital  
3.625.000 - 1.400.000 = 2.225.000

Jahresüberschuss:
Erträge - sonstige Aufwendungen - Zinsaufwendungen  
3.350.000 - 3.000.000 - 157.500 = 192.500

Eigenkapitalquote:
Eigenkapital / Gesamtkapital x 100  
1.400.000 / 3.625.000 x 100 = 38,62 %

Eigenkapitalrentabilität:
Jahresüberschuss / Eigenkapital x 100  
192.500 / 1.400.000 x 100 = 13,75 %

Durchschnittlicher Fremdkapitalzinssatz:
Zinsaufwendungen / Fremdkapital x 100  
157.500 / 2.225.000 x 100 = 7,08 %

Gesamtkapitalrentabilität:
(Jahresüberschuss + Fremdkapitalzinsen) / Gesamtkapital x 100  
(192.500 + 157.500) / 3.625.000 x 100 = 9,66 %


► 4. Investition und Leverage-Effekt

Investition:
Anschaffungskosten 1.125.000  
80 % Fremdkapital = 900.000  
20 % Eigenkapital = 225.000

Neue Kapitalwerte:
Eigenkapital: 1.400.000 + 225.000 = 1.625.000  
Fremdkapital: 2.225.000 + 900.000 = 3.125.000  
Gesamtkapital: 3.625.000 + 1.125.000 = 4.750.000

Zusätzlicher Ertrag vor FK-Zinsen:
1.125.000 x 15 % = 168.750

Zusätzliche Zinsen:
900.000 x 9 % = 81.000

Zusätzlicher Jahresüberschuss:
168.750 - 81.000 = 87.750

Neuer Jahresüberschuss:
192.500 + 87.750 = 280.250

Neue Zinsaufwendungen:
157.500 + 81.000 = 238.500

Neue Eigenkapitalquote:
1.625.000 / 4.750.000 x 100 = 34,21 %

Neue Eigenkapitalrentabilität:
280.250 / 1.625.000 x 100 = 17,25 %

Neuer durchschnittlicher FK-Zinssatz:
238.500 / 3.125.000 x 100 = 7,63 %

Neue Gesamtkapitalrentabilität:
(280.250 + 238.500) / 4.750.000 x 100 = 10,92 %

Leverage-Effekt:
Ein positiver Leverage-Effekt liegt vor, wenn die Gesamtkapitalrendite bzw. Investitionsrendite höher ist als der Fremdkapitalzinssatz.

Im Beispiel:
Investitionsrendite 15 %  
FK-Zinssatz 9 %

Die Eigenkapitalrentabilität steigt von 13,75 % auf 17,25 %. Gleichzeitig sinkt die Eigenkapitalquote von 38,62 % auf 34,21 %. Das bedeutet: höhere Rendite, aber auch höhere Verschuldung.


► 5. Vorratskennzahlen

Umschlagshäufigkeit der Vorräte:
Materialaufwand / durchschnittlicher Vorratsbestand

Beispiel:
Materialaufwand 600.000  
durchschnittlicher Vorratsbestand 30.000

600.000 / 30.000 = 20

Bedeutung:
Der durchschnittliche Vorratsbestand wird 20-mal im Jahr umgeschlagen.

Durchschnittliche Lagerdauer:
360 / Umschlagshäufigkeit

360 / 20 = 18 Tage

Bedeutung:
Die Waren liegen durchschnittlich 18 Tage im Lager.

Merksatz:
Hohe Umschlagshäufigkeit = kurze Lagerdauer.  
Niedrige Umschlagshäufigkeit = lange Lagerdauer.


► 6. Forderungen und Verbindlichkeiten

Umschlagshäufigkeit Forderungen:
Umsatzerlöse / durchschnittlicher Forderungsbestand

Durchschnittliches Kundenziel / DSO:
360 / Umschlagshäufigkeit Forderungen

Umschlagshäufigkeit Verbindlichkeiten:
Materialaufwand / durchschnittlicher Verbindlichkeitenbestand

Durchschnittliches Lieferantenziel / DPO:
360 / Umschlagshäufigkeit Verbindlichkeiten

Wichtig:
Wenn Forderungen und Verbindlichkeiten brutto angegeben sind und die Umsatzerlöse oder Materialaufwendungen netto sind, muss auf vergleichbare Werte geachtet werden.

Bei 19 % Umsatzsteuer:
Netto = Brutto / 1,19


► 7. Körperschaftsteuer: vGA und verdeckte Einlage

Prüfungsschema:
1. Liegt eine vGA, eine verdeckte Einlage oder kein steuerlicher Korrekturfall vor?
2. Ist der Vorgang gesellschaftlich veranlasst?
3. Ist der Vorgang fremdüblich?
4. Welche außerbilanzielle Korrektur ist vorzunehmen?

► Verdeckte Gewinnausschüttung

Rechtsgrundlage:
§ 8 Abs. 3 Satz 2 KStG

Eine vGA liegt vor, wenn eine Kapitalgesellschaft ihrem Gesellschafter einen Vorteil zuwendet, der durch das Gesellschaftsverhältnis veranlasst ist und einem fremden Dritten nicht gewährt worden wäre.

Typischer Fall:
Rückwirkende Gehaltserhöhung an beherrschenden Gesellschafter-Geschäftsführer.

Warum vGA?
- Gesellschafterstellung liegt vor
- Vereinbarung ist nicht fremdüblich
- bei beherrschenden Gesellschaftern müssen Vereinbarungen klar, eindeutig und im Voraus getroffen werden
- rückwirkende Gehaltserhöhungen sind steuerlich kritisch

Rechtsfolge:
Der Aufwand wurde handelsrechtlich gebucht, ist steuerlich aber nicht abzugsfähig.

Folge:
Außerbilanzielle Hinzurechnung.

Beispiel:
Rückwirkende Gehaltserhöhung 9.000  
=> + 9.000 außerbilanziell hinzurechnen


► Verdeckte Einlage

Rechtsgrundlage:
§ 8 Abs. 3 Satz 3 KStG

Eine verdeckte Einlage liegt vor, wenn ein Gesellschafter der Kapitalgesellschaft außerhalb einer offenen Einlage einen einlagefähigen Vermögensvorteil zuwendet und dies durch das Gesellschaftsverhältnis veranlasst ist.

Wichtig:
Ein bloßer Nutzungsvorteil ist keine verdeckte Einlage.

Beispiel 1:
Verbilligtes Darlehen des Gesellschafters an die GmbH:
Keine verdeckte Einlage, weil nur ein Nutzungsvorteil vorliegt.

Beispiel 2:
Gesellschafter verzichtet auf voll werthaltige Darlehensforderung:
Verdeckte Einlage.

Warum?
Die GmbH muss die Verbindlichkeit nicht mehr zahlen. Dadurch entfällt ein Passivposten. Ein fremder Dritter hätte auf die Forderung nicht verzichtet.

Bewertung:
Teilwert der Forderung.

Beispiel:
Forderungsverzicht 200.000  
=> verdeckte Einlage 200.000

Steuerliche Folge:
Der handelsrechtlich erfasste Ertrag aus der Ausbuchung der Verbindlichkeit ist außerbilanziell abzuziehen.

Außerdem:
Zugang zum steuerlichen Einlagekonto nach § 27 KStG.


► 8. Grundstücksübertragung als verdeckte Einlage

Überträgt ein Gesellschafter ein Grundstück unentgeltlich auf eine GmbH, liegt regelmäßig eine verdeckte Einlage vor.

Warum?
Die GmbH erhält einen einlagefähigen Vermögensvorteil in Form eines Aktivpostens. Ein fremder Dritter würde ein Grundstück nicht unentgeltlich übertragen.

Bewertung:
Teilwert.

Beispiel:
Teilwert Grundstück 250.000

Steuerliche Folge:
Bei der empfangenden Kapitalgesellschaft entsteht ein Zugang. Je nach Aufgabenstellung kann dies innerbilanziell als Ertrag erfasst werden. Steuerlich ist zu prüfen, ob und in welcher Höhe eine außerbilanzielle Korrektur vorzunehmen ist.

Typischer Prüfungssatz:
Die Grundstücksübertragung stellt eine verdeckte Einlage nach § 8 Abs. 3 Satz 3 KStG dar, da ein einlagefähiger Vermögensvorteil gesellschaftlich veranlasst zugewendet wird.


► 9. Ermittlung des zu versteuernden Einkommens einer GmbH

Ausgangspunkt:
Handelsrechtlicher Jahresüberschuss

Dann steuerliche Korrekturen:

Hinzurechnungen:
- Körperschaftsteuer als nicht abziehbare Steuer
- Solidaritätszuschlag, soweit einschlägig
- Gewerbesteuer nach § 4 Abs. 5b EStG i. V. m. § 8 Abs. 1 KStG
- Geldbußen nach § 4 Abs. 5 Nr. 8 EStG
- verdeckte Gewinnausschüttungen nach § 8 Abs. 3 Satz 2 KStG
- nicht abziehbare Betriebsausgaben nach § 8b Abs. 5 KStG

Abzüge:
- steuerfreie Beteiligungserträge nach § 8b Abs. 1 KStG
- verdeckte Einlagen nach § 8 Abs. 3 Satz 3 KStG
- bereits innerbilanziell erfasste Erträge, die steuerlich neutral bleiben müssen

KSt:
Zu versteuerndes Einkommen x 15 %

Danach:
Anrechnung von Kapitalertragsteuer und Körperschaftsteuervorauszahlungen.

Wenn die Vorauszahlungen und Steuerabzüge höher sind als die festgesetzte KSt, ergibt sich eine Erstattung.


► 10. Prüfungs-Merksätze

vGA:
Aufwand bei der GmbH wegen Vorteil an Gesellschafter.
=> außerbilanziell hinzurechnen.

Verdeckte Einlage:
Vorteil durch Gesellschafter an GmbH.
=> Ertrag steuerlich neutralisieren, regelmäßig außerbilanziell abziehen.

§ 8b KStG:
Beteiligungserträge sind grundsätzlich steuerfrei, aber 5 % gelten als nicht abziehbare Betriebsausgaben.

Leverage:
Wenn Rendite des eingesetzten Kapitals größer ist als der Fremdkapitalzins, steigt die Eigenkapitalrentabilität.

Lagerkennzahlen:
Umschlagshäufigkeit sagt: Wie oft?
Lagerdauer sagt: Wie lange?
`
},
  {
    id: "npo-sphaeren",
    title: "Die vier Sphären gemeinnütziger Körperschaften",
    short:
      "Ideeller Bereich, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb — Wirkung und Abgrenzung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Handout — Sphären, Risiken, Abschlusslogik (NPO).",
    keywords: /sphär|ideeller bereich|vermögensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|wgb\b/i,
    references: ["§§ 14, 64–68 AO", "§ 12 Abs. 2 Nr. 8a UStG"],
    body: `Gemeinnützige Körperschaften werden steuerlich in vier Sphären gegliedert:

1) Ideeller Bereich — unmittelbare Verfolgung des Satzungszwecks ohne Gegenleistung (Spenden, Mitgliedsbeiträge). KSt- und GewSt-frei, mangels Leistungsaustausch grundsätzlich keine USt.

2) Vermögensverwaltung — passive Nutzung vorhandenen Vermögens (Zinsen, Mieten, Wertpapiere). KSt-/GewSt-frei; USt im Einzelfall, z. B. bei Vermietung.

3) Zweckbetrieb (§§ 65–68 AO) — wirtschaftliche Tätigkeit, die eng und notwendig mit dem Satzungszweck verbunden ist. KSt-/GewSt-frei, USt regelmäßig 7 % (§ 12 Abs. 2 Nr. 8a UStG).

4) Wirtschaftlicher Geschäftsbetrieb — marktbezogene Tätigkeit ohne unmittelbaren Zweckbezug (Verkauf, Sponsoring, Werbung, Gaststätte). USt 19 %, KSt/GewSt grundsätzlich pflichtig (Freigrenze 45.000 € Einnahmen, § 64 Abs. 3 AO).

Merksätze:
- Kein Leistungsaustausch = kein Umsatz.
- Wettbewerb ist ein starkes Indiz für Steuerpflicht.
- Die Sphäre ergibt sich aus dem Sachverhalt, nicht aus der Kontobezeichnung.`,
  },
{
  id: "mvr-ruecklagen-und-verwendungsueberhang",
  title: "Mittelverwendungsrechnung, Rücklagen und Verwendungsüberhang",
  short:
    "Prüfung der zeitnahen Mittelverwendung, zulässiger Rücklagen, Rücklagenspiegel und Verwendungsüberhang bei gemeinnützigen Körperschaften.",
  category: "NPO / Gemeinnützigkeit",
  source: "Internes Arbeitspapier – Mittelverwendungsrechnung / Rücklagen",
  keywords:
    /(mittelverwendungsrechnung|zeitnahe mittelverwendung|verwendungsüberhang|rücklagenspiegel|freie rücklage|betriebsmittelrücklage|wiederbeschaffungsrücklage|§\s*55\s*ao|§\s*62\s*ao|§\s*63\s*ao)/i,
  references: ["§ 55 AO", "§ 62 AO", "§ 63 AO"],
  body: `Die Mittelverwendungsrechnung dient dem Nachweis, dass eine gemeinnützige Körperschaft ihre Mittel zeitnah und satzungsgemäß verwendet hat.

Grundsatz:
Gemeinnützige Körperschaften müssen ihre Mittel selbstlos, zeitnah und für die steuerbegünstigten satzungsmäßigen Zwecke verwenden. Das Gebot der zeitnahen Mittelverwendung nach § 55 Abs. 1 Nr. 5 AO soll verhindern, dass steuerbegünstigt erworbene Mittel grundlos angesammelt oder gehortet werden.

Zeitlicher Rahmen:
Eine zeitnahe Mittelverwendung liegt grundsätzlich vor, wenn die Mittel spätestens in den beiden auf das Jahr des Zuflusses folgenden Kalender- oder Wirtschaftsjahren für steuerbegünstigte Zwecke verwendet werden.

45.000-Euro-Grenze:
Für kleine Körperschaften mit Einnahmen bis 45.000 Euro kann die Pflicht zur zeitnahen Mittelverwendung entfallen. Dennoch sollte dokumentiert werden, aus welchen Jahren vorhandene Mittel stammen.

Rücklagen nach § 62 AO:
Zulässige Rücklagen gelten als Ausnahme vom Gebot der zeitnahen Mittelverwendung. Dazu gehören insbesondere zweckgebundene Rücklagen, Betriebsmittelrücklagen, Wiederbeschaffungsrücklagen und freie Rücklagen.

Rücklagenspiegel:
Ein Rücklagenspiegel sollte Art, Zweck, Höhe, Zuführung, Verwendung und Auflösung der Rücklagen nachvollziehbar dokumentieren.

Verwendungsüberhang:
Ein positiver Verwendungsüberhang kann auf eine nicht zeitnahe Mittelverwendung hinweisen. Ein negativer Verwendungsüberhang bedeutet, dass mehr Mittel für steuerbegünstigte Zwecke verwendet wurden, als nach § 55 Abs. 1 Nr. 5 AO erforderlich gewesen wäre.

Review-Hinweise:
- Mittelzuflüsse nach Jahren dokumentieren
- 45.000-Euro-Grenze prüfen
- Rücklagen nach § 62 AO einzeln dokumentieren
- Vorstandsbeschlüsse zur Rücklagenbildung prüfen
- Rücklagenspiegel mit Jahresabschluss abstimmen
- Verwendungsüberhang berechnen und erläutern
- offene Punkte im Review dokumentieren`
},
{
  id: "npo-kanzlei-review-gemeinnuetziger-verein",
  title: "Kanzlei-Review: gemeinnütziger Verein mit Spenden, Beiträgen, Sommerfest, Zuschüssen und Rücklagen",
  short:
    "Strukturierte Review-Vorlage für gemeinnützige Vereine mit Sphärenprüfung, Gemeinnützigkeitsrisiken, Spendenbescheinigungen, Rückfragen und Buchungshinweisen.",
  category: "NPO / Gemeinnützigkeit",
  source: "Interne Steuerstoff-Review-Vorlage – Gemeinnütziger Verein",
  keywords:
    /kanzlei.review|review|gemeinnütziger verein|gemeinnuetziger verein|jugendhilfe|spenden|spendenbescheinigung|zuwendungsbestätigung|zuwendungsbestaetigung|mitgliedsbeiträge|mitgliedsbeitraege|sommerfest|zinserträge|zinsertraege|zuschüsse|zuschuesse|rücklagen|ruecklagen|sphären|sphaeren|mittelverwendung|buchungshinweise|review-hinweise/i,
  references: [
    "§§ 51–68 AO",
    "§ 52 AO",
    "§ 55 AO",
    "§ 60 AO",
    "§ 60a AO",
    "§ 62 AO",
    "§ 63 AO",
    "§ 64 AO",
    "§ 10b EStG",
    "§ 50 EStDV"
  ],
  body: `Kanzlei-Review für einen gemeinnützigen Verein:

Ausgangslage:
Ein gemeinnütziger Verein, z. B. im Bereich Jugendhilfe, erzielt Spenden, Mitgliedsbeiträge, Einnahmen aus Veranstaltungen, Zinserträge und Zuschüsse. Zusätzlich werden Rücklagen gebildet und der Verein möchte Zuwendungsbestätigungen bzw. Spendenbescheinigungen ausstellen.

1. Steuerliche Sphären

Die Einnahmen und Ausgaben sind den steuerlichen Sphären zuzuordnen:

a) Ideeller Bereich:
- echte Mitgliedsbeiträge ohne konkrete Gegenleistung
- Spenden
- Zuschüsse für satzungsmäßige gemeinnützige Zwecke
- Ausgaben für unmittelbare Zweckverwirklichung, z. B. Jugendhilfeprojekte

b) Vermögensverwaltung:
- Zinserträge
- Kapitalerträge
- ggf. Miet- oder Pachterträge aus langfristiger Vermögensnutzung

c) Zweckbetrieb:
- Tätigkeiten, die unmittelbar dem gemeinnützigen Zweck dienen und die Voraussetzungen der §§ 65–68 AO erfüllen
- z. B. konkrete Jugendhilfemaßnahmen, wenn sie wirtschaftlich auftreten, aber dem begünstigten Zweck dienen

d) Wirtschaftlicher Geschäftsbetrieb:
- Sommerfest, Verkauf von Speisen und Getränken, Tombola, Basar oder ähnliche Veranstaltungen mit Marktbezug
- Einnahmen mit konkreter Gegenleistung
- Tätigkeiten außerhalb der unmittelbaren gemeinnützigen Zweckverfolgung

2. Risiken für die Gemeinnützigkeit

Typische Risiken:
- unklare Zuordnung der Einnahmen zu den steuerlichen Sphären
- Spendenbescheinigungen für Zahlungen mit Gegenleistung
- Mittelverwendung außerhalb der Satzungszwecke
- nicht zeitnahe Mittelverwendung
- unzulässige oder nicht dokumentierte Rücklagenbildung
- fehlende Trennung zwischen ideellem Bereich, Zweckbetrieb, Vermögensverwaltung und wirtschaftlichem Geschäftsbetrieb
- private Vorteile oder unangemessene Vergütungen
- fehlende Nachweise über die tatsächliche Geschäftsführung
- Satzung passt nicht mehr zur tatsächlichen Tätigkeit

Ein Verstoß führt nicht automatisch sofort zum Verlust der Gemeinnützigkeit. Er kann aber zu Nachfragen, Auflagen, Korrekturen oder im schweren Fall zum Verlust der Steuerbegünstigung führen.

3. Voraussetzungen für Spendenbescheinigungen

Zuwendungsbestätigungen dürfen nur ausgestellt werden, wenn:
- der Verein steuerbegünstigt anerkannt ist
- ein aktueller Freistellungsbescheid oder Feststellungsbescheid nach § 60a AO vorliegt
- die Satzung gemeinnützigkeitsrechtlich ordnungsgemäß ist
- die tatsächliche Geschäftsführung den Satzungszwecken entspricht
- die Zahlung freiwillig und ohne konkrete Gegenleistung erfolgt
- die Mittel für steuerbegünstigte Zwecke verwendet werden
- das amtliche Muster für Zuwendungsbestätigungen verwendet wird

Keine Spendenbescheinigung bei:
- Eintrittsgeldern
- Verkauf von Speisen oder Getränken
- Sponsoring mit Werbeleistung
- Zahlungen für konkrete Gegenleistungen
- Zahlungen an den wirtschaftlichen Geschäftsbetrieb
- Zahlungen an die Vermögensverwaltung

Bei Kleinspenden bis 300 EUR kann regelmäßig ein vereinfachter Nachweis genügen, z. B. Kontoauszug oder Buchungsbestätigung.

4. Rückfragen an den Mandanten

Für die Prüfung sollten folgende Rückfragen gestellt werden:

Allgemeine Gemeinnützigkeit:
- Liegt ein aktueller Freistellungsbescheid vor?
- Liegt ein Feststellungsbescheid nach § 60a AO vor?
- Welche Satzungszwecke sind aktuell eingetragen?
- Gab es Satzungsänderungen?
- Welche tatsächlichen Tätigkeiten wurden im Jahr durchgeführt?

Spenden und Zuwendungsbestätigungen:
- Für welche Zahlungen sollen Spendenbescheinigungen ausgestellt werden?
- Gab es für einzelne Zahlungen eine Gegenleistung?
- Wurden Spenden zweckgebunden vereinnahmt?
- Sind die Zahlungseingänge vollständig nachweisbar?
- Wurde das amtliche Muster verwendet?
- Wer ist zur Ausstellung berechtigt?

Mitgliedsbeiträge:
- Gibt es eine Beitragsordnung?
- Erhalten Mitglieder konkrete Leistungen für ihren Beitrag?
- Gibt es Sonderbeiträge, Kursgebühren oder Nutzungsentgelte?
- Sind echte und unechte Mitgliedsbeiträge getrennt erfasst?

Sommerfest / Veranstaltung:
- Welche Einnahmen wurden erzielt?
- Wurden Speisen, Getränke, Waren oder Eintritt verkauft?
- Gab es Sponsoring oder Werbung?
- Welche Ausgaben sind angefallen?
- Wurde die Veranstaltung als wirtschaftlicher Geschäftsbetrieb erfasst?

Rücklagen:
- Welche Rücklagen wurden gebildet?
- Gibt es Vorstandsbeschlüsse zur Rücklagenbildung?
- Ist der Zweck der Rücklage dokumentiert?
- Gibt es eine Berechnung der freien Rücklage?
- Gibt es einen Rücklagenspiegel?
- Wurden Mittel zeitnah verwendet?

5. Review-Hinweise für die Akte

In der Arbeitspapierakte sollten dokumentiert werden:
- aktueller Freistellungsbescheid / Feststellungsbescheid
- Satzung und ggf. Satzungsänderungen
- Zuordnung der Einnahmen und Ausgaben zu den Sphären
- Übersicht der ausgestellten Zuwendungsbestätigungen
- Prüfung, ob Zahlungen ohne Gegenleistung erfolgten
- Mittelverwendungsrechnung
- Rücklagenspiegel
- Vorstandsbeschlüsse zu Rücklagen
- Abstimmung der Bankkonten und Zahlungseingänge
- Nachweis über zweckentsprechende Mittelverwendung
- offene Punkte und Rückfragen an den Mandanten

Besonders kritisch zu dokumentieren:
- Zahlungen mit möglicher Gegenleistung
- Einnahmen aus Sommerfest oder Verkauf
- Sponsoring
- zweckgebundene Spenden
- hohe liquide Mittel am Jahresende
- Rücklagen ohne klaren Zweck

6. Mögliche Buchungshinweise

Typische Buchungslogik:

Spenden:
- Zahlungseingang auf Bank gegen Spendenkonto im ideellen Bereich
- Buchungstext mit Spendername und Zweck
- keine Umsatzsteuer, wenn keine Gegenleistung vorliegt

Echte Mitgliedsbeiträge:
- Bank an Mitgliedsbeiträge ideeller Bereich
- keine Umsatzsteuer bei fehlendem Leistungsaustausch

Unechte Mitgliedsbeiträge / Leistungsentgelte:
- Prüfung Umsatzsteuer und steuerliche Sphäre erforderlich
- ggf. wirtschaftlicher Geschäftsbetrieb oder Zweckbetrieb

Zuschüsse:
- Zuordnung nach Zweckbindung
- Zuschüsse für gemeinnützige Tätigkeit regelmäßig ideeller Bereich oder Zweckbetrieb
- Zweckbindung dokumentieren

Zinserträge:
- Bank an Zinserträge Vermögensverwaltung
- Kapitalertragsteuer und Bescheinigungen prüfen

Sommerfest:
- Einnahmen und Ausgaben gesondert erfassen
- regelmäßig wirtschaftlicher Geschäftsbetrieb prüfen
- Umsatzsteuerliche Behandlung prüfen
- Wareneinsatz, Bewirtung, Gagen, Miete und sonstige Kosten getrennt erfassen

Rücklagen:
- Rücklagenbildung nicht nur buchen, sondern auch dokumentieren
- Rücklagenzweck, Höhe und Vorstandsbeschluss festhalten
- Rücklagenspiegel mit Jahresabschluss abstimmen

Kurzfazit:
Der Fall ist nicht pauschal gemeinnützigkeitsrechtlich unproblematisch. Entscheidend sind die saubere Sphärenzuordnung, die Prüfung von Gegenleistungen, die ordnungsgemäße Mittelverwendung, die Dokumentation der Rücklagen und die Berechtigung zur Ausstellung von Zuwendungsbestätigungen.`,
},
{
  id: "npo-satzung-tatsaechliche-geschaeftsfuehrung",
  title: "Gemeinnützigkeit: Satzung und tatsächliche Geschäftsführung",
  short:
    "Prüfung, ob Satzung und tatsächliche Geschäftsführung die Voraussetzungen der Gemeinnützigkeit erfüllen.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Gemeinnützigkeit und Satzung",
  keywords:
    /gemeinnützigkeit|gemeinnuetzigkeit|satzung|mustersatzung|tatsächliche geschäftsführung|tatsaechliche geschaeftsfuehrung|steuerbegünstigung|steuerbeguenstigung|§ 60a|feststellungsbescheid|freistellungsbescheid/i,
  references: ["§§ 51–68 AO", "§ 60 AO", "§ 60a AO", "§ 63 AO"],
  body: `Die Gemeinnützigkeit setzt voraus, dass Satzung und tatsächliche Geschäftsführung auf steuerbegünstigte Zwecke ausgerichtet sind.

Satzungsmäßige Voraussetzungen:
Die Satzung muss die gemeinnützigen Zwecke genau bestimmen. Sie muss erkennen lassen, dass die Körperschaft ausschließlich und unmittelbar steuerbegünstigte Zwecke verfolgt. Die Mustersatzung nach Anlage 1 zu § 60 AO ist verbindlich. Abweichungen oder unklare Formulierungen können die Anerkennung gefährden.

Tatsächliche Geschäftsführung:
Die tatsächliche Geschäftsführung muss der Satzung entsprechen. Entscheidend ist nicht nur der Satzungstext, sondern auch die tatsächliche Mittelverwendung, Dokumentation und organisatorische Umsetzung.

Typische Prüfpunkte:
- Sind die steuerbegünstigten Zwecke in der Satzung klar benannt?
- Entspricht die Satzung der Mustersatzung?
- Liegt ein Feststellungsbescheid nach § 60a AO vor?
- Liegt ein aktueller Freistellungsbescheid oder eine vergleichbare steuerliche Anerkennung vor?
- Stimmen Einnahmen, Ausgaben und Tätigkeiten mit Satzung und Zweckverfolgung überein?
- Werden Mittel zeitnah und zweckentsprechend verwendet?
- Sind wirtschaftliche Tätigkeiten sauber von ideellem Bereich, Zweckbetrieb und Vermögensverwaltung abgegrenzt?

Review-Hinweise:
- Satzung mit aktuellem Bescheid abgleichen
- Satzungszwecke mit tatsächlichen Tätigkeiten vergleichen
- Mittelverwendung anhand Buchführung und Belegen prüfen
- Abweichungen dokumentieren
- Bei unklarer Zweckverfolgung steuerliche Anerkennung kritisch prüfen`,
},
{
  id: "npo-zuwendungsbestaetigungen-spendenbescheinigungen",
  title: "Zuwendungsbestätigungen und Spendenbescheinigungen",
  short:
    "Voraussetzungen, Pflichtangaben und Risiken bei der Ausstellung von Zuwendungsbestätigungen.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Zuwendungsbestätigungen",
  keywords:
    /zuwendungsbestätigung|zuwendungsbestaetigung|spendenbescheinigung|spende|spendenabzug|amtliches muster|vereinfachter nachweis|300 euro|haftung|mittelverwendung|§ 10b|§ 50 estdv/i,
  references: ["§ 10b EStG", "§ 50 EStDV", "§ 63 AO", "§ 60a AO"],
  body: `Zuwendungsbestätigungen dürfen nur ausgestellt werden, wenn der Verein bzw. die Körperschaft zur Ausstellung berechtigt ist und die Zuwendung steuerbegünstigten Zwecken dient.

Grundvoraussetzungen:
- Die Körperschaft muss steuerbegünstigt anerkannt sein.
- Die Satzung muss gemeinnützige Zwecke korrekt abbilden.
- Die tatsächliche Geschäftsführung muss den steuerbegünstigten Zwecken entsprechen.
- Die Zuwendung muss dem ideellen Bereich oder einem steuerbegünstigten Zweckbetrieb zugutekommen.
- Für Zuwendungen an Vermögensverwaltung oder wirtschaftlichen Geschäftsbetrieb dürfen grundsätzlich keine Spendenbescheinigungen ausgestellt werden.

Formelle Anforderungen:
Es ist das amtliche Muster zu verwenden. Die Bestätigung muss insbesondere Angaben enthalten zu:
- Name und Anschrift des Zuwendenden
- Betrag oder Art der Zuwendung
- Datum der Zuwendung
- steuerbegünstigtem Zweck
- Bestätigung der ausschließlichen und unmittelbaren Verwendung
- Unterschrift einer berechtigten Person oder maschineller Bestätigung nach den Vorgaben

Vereinfachter Nachweis:
Bei Zuwendungen bis 300 EUR kann regelmäßig ein vereinfachter Nachweis durch Bareinzahlungsbeleg oder Buchungsbestätigung genügen.

Haftung und Risiken:
Bei vorsätzlich oder grob fahrlässig falsch ausgestellten Zuwendungsbestätigungen kann eine Haftung für entgangene Steuer entstehen. Zusätzlich können bei schwerwiegenden Fehlern gemeinnützigkeitsrechtliche Risiken entstehen.

Typische Fehler:
- Ausstellung ohne gültigen steuerlichen Anerkennungsnachweis
- falscher oder unvollständiger Spendenzweck
- Bescheinigung für nicht begünstigte Tätigkeiten
- fehlende tatsächliche Mittelverwendung
- unklare Zuordnung zwischen ideellem Bereich, Zweckbetrieb, Vermögensverwaltung und wirtschaftlichem Geschäftsbetrieb
- Bescheinigung für Leistungen mit Gegenleistung

Review-Hinweise:
- Aktuellen Freistellungs- oder Feststellungsbescheid prüfen
- Spendenzweck mit Satzung abgleichen
- Zahlungseingang und Betrag nachweisen
- Mittelverwendung dokumentieren
- Keine Bescheinigung bei Gegenleistung oder nicht begünstigtem Bereich ausstellen`,
},
{
  id: "npo-sphaeren-umsatzzuordnung-review",
  title: "Zuordnung von Einnahmen und Ausgaben zu NPO-Sphären",
  short:
    "Einordnung von Einnahmen, Ausgaben und Mittelverwendung in ideellen Bereich, Vermögensverwaltung, Zweckbetrieb und wirtschaftlichen Geschäftsbetrieb.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Sphären und Mittelverwendung",
  keywords:
    /sphäre|sphaere|ideeller bereich|vermögensverwaltung|vermoegensverwaltung|zweckbetrieb|wirtschaftlicher geschäftsbetrieb|wirtschaftlicher geschaeftsbetrieb|mittelverwendung|einnahmen|ausgaben|rücklagen|ruecklagen/i,
  references: ["§ 14 AO", "§§ 64–68 AO", "§ 62 AO"],
  body: `Gemeinnützige Körperschaften müssen Einnahmen und Ausgaben den steuerlichen Sphären zutreffend zuordnen.

Die vier Sphären:
1) Ideeller Bereich:
Unmittelbare Verfolgung der gemeinnützigen Satzungszwecke ohne wirtschaftliche Tätigkeit. Beispiele können Mitgliedsbeiträge ohne konkrete Gegenleistung, Spenden und Zuschüsse für gemeinnützige Zwecke sein.

2) Vermögensverwaltung:
Verwaltung eigenen Vermögens, z. B. Zinsen, Dividenden, Miet- oder Pachteinnahmen, soweit keine aktive gewerbliche Tätigkeit vorliegt.

3) Zweckbetrieb:
Wirtschaftliche Tätigkeit, die dem gemeinnützigen Zweck dient und die Voraussetzungen der §§ 65–68 AO erfüllt.

4) Wirtschaftlicher Geschäftsbetrieb:
Marktbezogene wirtschaftliche Tätigkeiten außerhalb der steuerbegünstigten Zweckverfolgung. Diese können steuerpflichtig sein.

Grundsatz:
Die Zuordnung richtet sich nach dem konkreten Sachverhalt, nicht nur nach der Bezeichnung in der Buchhaltung. Entscheidend sind Zweck, Gegenleistung, Marktbezug, tatsächliche Durchführung und Verwendung der Mittel.

Mittelverwendung:
Mittel des Vereins dürfen grundsätzlich nur für satzungsmäßige steuerbegünstigte Zwecke verwendet werden. Ausgaben müssen der passenden Sphäre zugeordnet und dokumentiert werden.

Rücklagen:
Rücklagen sind nur zulässig, wenn sie gesetzlich erlaubt, wirtschaftlich begründet oder für konkrete steuerbegünstigte Vorhaben vorgesehen sind. Die Bildung und Verwendung sollte dokumentiert werden.

Review-Hinweise:
- Einnahmen nach Herkunft und Gegenleistung prüfen
- Ausgaben nach Zweck und Veranlassung zuordnen
- Zweckbetrieb von wirtschaftlichem Geschäftsbetrieb abgrenzen
- Vermögensverwaltung von aktiver gewerblicher Tätigkeit abgrenzen
- Mittelverwendung mit Satzung und Bescheiden abstimmen
- Rücklagenzweck und Rücklagenhöhe dokumentieren
- Unklare Fälle im Review festhalten`,
},
{
  id: "verein-mitgliedsbeitraege-echt-unecht",
  title: "Echte und unechte Mitgliedsbeiträge",
  short:
    "Abgrenzung von echten Mitgliedsbeiträgen ohne Gegenleistung und unechten Beiträgen mit Leistungsbezug.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Mitgliedsbeiträge",
  keywords:
    /mitgliedsbeitrag|mitgliedsbeiträge|echter mitgliedsbeitrag|unechter mitgliedsbeitrag|grundbeitrag|beitrag|leistungsaustausch|gegenleistung|umsatzsteuer|verein/i,
  references: ["UStG", "AO", "Vereinsbesteuerung"],
  body: `Mitgliedsbeiträge sind steuerlich danach zu prüfen, ob ein echter Beitrag ohne konkrete Gegenleistung oder ein unechter Beitrag mit Leistungsbezug vorliegt.

Echter Mitgliedsbeitrag:
Ein echter Mitgliedsbeitrag dient allgemein der Mitgliedschaft und Finanzierung des Vereins. Es besteht kein unmittelbarer Zusammenhang mit einer konkreten Leistung an das einzelne Mitglied. In diesem Fall liegt regelmäßig kein Leistungsaustausch vor.

Unechter Mitgliedsbeitrag:
Ein unechter Mitgliedsbeitrag liegt vor, wenn das Mitglied für den Beitrag eine konkrete, individualisierbare Leistung erhält. Dann kann ein steuerbarer Leistungsaustausch vorliegen.

Prüfkriterien:
- Gibt es eine konkrete Gegenleistung für den Beitrag?
- Ist der Beitrag pauschal für die Mitgliedschaft geschuldet?
- Erhält das Mitglied besondere Vorteile, Nutzungsrechte oder Leistungen?
- Werden Leistungen gesondert abgerechnet?
- Gibt es unterschiedliche Beitragshöhen wegen konkreter Leistungsnutzung?

Beispiele:
- Allgemeiner Grundbeitrag ohne Sonderleistung: eher echter Mitgliedsbeitrag.
- Beitrag für konkrete Veranstaltungsteilnahme, Nutzung einer Einrichtung oder Sonderleistung: kritisch prüfen.
- Kombinierte Beiträge müssen gegebenenfalls aufgeteilt werden.

Review-Hinweise:
- Satzung und Beitragsordnung prüfen
- Beitragstatbestand mit tatsächlicher Leistung vergleichen
- Sonderleistungen gesondert erfassen
- Umsatzsteuerliche Folgen bei Leistungsaustausch prüfen
- Dokumentieren, warum ein Beitrag als echt oder unecht eingeordnet wird`,
},
{
  id: "bilanzierung-anzahlungen-herstellungskosten",
  title: "Bilanzierung: Erhaltene Anzahlungen und Herstellungskosten",
  short:
    "Erhaltene Anzahlungen werden nicht von aktivierten Herstellungskosten abgezogen, sondern grundsätzlich passiviert.",
  category: "Jahresabschluss",
  source: "beck-chat Arbeitsnotiz – Anzahlungen und Herstellungskosten",
  keywords:
    /anzahlung|anzahlungen|erhaltene anzahlung|herstellungskosten|aktivierte herstellungskosten|bilanzierung|passivierung|verbindlichkeit|bestandsveränderung|bestandsveraenderung/i,
  references: ["HGB", "Bilanzierung", "Jahresabschluss"],
  body: `Erhaltene Anzahlungen und aktivierte Herstellungskosten sind bilanziell getrennt zu beurteilen.

Aktivierte Herstellungskosten:
Herstellungskosten werden aktiviert, wenn die Voraussetzungen für die Aktivierung erfüllt sind. Maßgeblich sind die angefallenen Aufwendungen für die Herstellung des Vermögensgegenstands.

Erhaltene Anzahlungen:
Erhaltene Anzahlungen sind grundsätzlich als Verbindlichkeit bzw. Passivposten zu erfassen. Sie mindern nicht automatisch die aktivierten Herstellungskosten.

Keine Saldierung:
Die erhaltene Anzahlung wird nicht einfach von den Herstellungskosten abgezogen. Herstellungskosten und erhaltene Anzahlungen werden getrennt ausgewiesen, soweit keine besonderen Saldierungsvorschriften greifen.

Praktische Folge:
- Herstellungskosten erhöhen den Aktivposten.
- Erhaltene Anzahlungen werden passiviert.
- Die Gewinnwirkung ergibt sich erst nach den einschlägigen Bilanzierungs- und Realisationsgrundsätzen.

Review-Hinweise:
- Vertragliche Grundlage der Anzahlung prüfen
- Zeitpunkt des Zahlungseingangs dokumentieren
- Aktivierungsfähigkeit der Herstellungskosten prüfen
- Keine ungeprüfte Verrechnung mit Herstellungskosten vornehmen
- Ausweis im Jahresabschluss abstimmen`,
},
{
  id: "npo-demokratisches-staatswesen-foerderung",
  title: "Förderung des demokratischen Staatswesens nach § 52 Abs. 2 Nr. 24 AO",
  short:
    "Einordnung förderfähiger und nicht förderfähiger Aktivitäten im Bereich demokratisches Staatswesen.",
  category: "NPO / Gemeinnützigkeit",
  source: "beck-chat Arbeitsnotiz – Demokratisches Staatswesen",
  keywords:
    /demokratisches staatswesen|demokratie|§ 52 abs. 2 nr. 24 ao|politische bildung|rechtsstaatlichkeit|meinungsfreiheit|pluralismus|parteipolitisch|kommunalpolitisch/i,
  references: ["§ 52 Abs. 2 Nr. 24 AO"],
  body: `Die allgemeine Förderung des demokratischen Staatswesens kann nach § 52 Abs. 2 Nr. 24 AO gemeinnützig sein.

Begünstigt sind Tätigkeiten, die sich objektiv und neutral mit demokratischen Grundprinzipien befassen. Dazu können insbesondere die Vermittlung von Gewaltenteilung, Meinungsfreiheit, Rechtsstaatlichkeit, Toleranz und Pluralismus gehören.

Förderfähige Maßnahmen:
- Seminare, Tagungen, Kolloquien und Diskussionsveranstaltungen
- politische Bildungsarbeit mit neutralem und überparteilichem Charakter
- Vermittlung demokratischer Grundwerte
- Aufklärung über rechtsstaatliche und demokratische Strukturen
- Bildungsangebote ohne parteipolitische Zielrichtung

Nicht förderfähig:
Nicht begünstigt sind Tätigkeiten, die nur bestimmte Einzelinteressen staatsbürgerlicher Art verfolgen oder auf den kommunalpolitischen Bereich beschränkt sind. Ebenfalls kritisch sind parteipolitische Ziele, Wahlwerbung oder einseitige politische Einflussnahme.

Abgrenzung:
Die Tätigkeit muss allgemein auf demokratische Bildung und das demokratische Staatswesen gerichtet sein. Sie darf nicht primär der Durchsetzung einzelner politischer Forderungen, Parteiziele oder kommunaler Einzelinteressen dienen.

Review-Hinweise:
- Satzungszweck mit § 52 Abs. 2 Nr. 24 AO abgleichen
- Neutralität und Überparteilichkeit prüfen
- Inhalte der Veranstaltungen dokumentieren
- Keine Wahlwerbung oder Parteiförderung
- Kommunalpolitische Einzelinteressen abgrenzen
- Bildungscharakter hervorheben`,
},
  {
    id: "zeitnahe-mittelverwendung",
    title: "Zeitnahe Mittelverwendung (§ 55 Abs. 1 Nr. 5 AO)",
    short:
      "Verwendungspflicht innerhalb von zwei Folgejahren, 45.000-€-Ausnahme, Nachweis über Mittelverwendungsrechnung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Zeitnahe Mittelverwendung und Mittelverwendungsrechnung.",
    keywords: /zeitnahe? mittelverwendung|mittelverwendungsrechnung|§\s*55\s*ao|45\.?000\s*€/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO", "§ 62 AO", "§ 63 Abs. 4 AO"],
    body: `Gemeinnützige Körperschaften müssen ihre Mittel zeitnah für die satzungsmäßigen Zwecke verwenden. Maßgeblich ist § 55 Abs. 1 Nr. 5 AO.

Fristen:
- Verwendung spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren (seit Ehrenamtsstärkungsgesetz, gilt für Zuflüsse nach dem 31.12.2011).
- Ausnahme für kleine Körperschaften: kumulierte Einnahmen aller Sphären ≤ 45.000 € — keine Pflicht zur zeitnahen Mittelverwendung; trotzdem Nachweis erforderlich, dass Altmittel aus Jahren ≤ 45.000 € stammen.

Was sind „Mittel“:
- Spenden, Mitgliedsbeiträge, Zuschüsse, Bruttoeinnahmen des ideellen Bereichs.
- Gewinne aus Zweckbetrieb und wirtschaftlichem Geschäftsbetrieb.
- Überschüsse der Vermögensverwaltung.
- Nicht: Grundstockvermögen / Einlagen der Stifter bei Stiftungen.

Nachweis: Mittelverwendungsrechnung (MVR) als Nebenrechnung zum Jahresabschluss; freie Gestaltung, aber Saldo-/Globalbetrachtung über alle zeitnah zu verwendenden Mittel. Pflichtbestandteile: Mittelvortrag aus den zwei Vorjahren, Rücklagenspiegel, Verwendungsüberhang.

Verstoß: keine sofortige Aberkennung der Gemeinnützigkeit. Das Finanzamt kann nach § 63 Abs. 4 AO eine angemessene Verwendungsfrist (oft bis zu drei Jahren) setzen. Erst wiederholte oder schwere Verstöße gefährden die Gemeinnützigkeit.`,
  },
  {
    id: "freie-ruecklage",
    title: "Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO)",
    short:
      "Bis zu 1/3 des VV-Überschusses + 10 % der sonstigen zeitnah zu verwendenden Mittel; Nachholung in zwei Folgejahren.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Zusatzarbeitspapier — Freie Rücklage gUG → gGmbH.",
    keywords: /freie? rücklage|§\s*62\s*abs\.?\s*1\s*nr\.?\s*3|§\s*62\s*ao/i,
    references: ["§ 62 Abs. 1 Nr. 3 AO", "§ 55 AO", "§ 5a Abs. 3 GmbHG"],
    body: `Die freie Rücklage nach § 62 Abs. 1 Nr. 3 AO ist die flexibelste Rücklagenart. Ihre Bildung gilt als zulässige Mittelverwendung; die zugeführten Mittel sind dem Gebot der zeitnahen Mittelverwendung entzogen.

Jährliche Höchstzuführung:
- Bis zu einem Drittel des Überschusses aus der Vermögensverwaltung.
- Zusätzlich bis zu 10 % der sonstigen zeitnah zu verwendenden Mittel (ideeller Bereich, Zweckbetrieb, wGB).
- Nicht ausgeschöpfte Höchstbeträge können in den zwei Folgejahren nachgeholt werden.

Gesamthöhe der freien Rücklage ist unbegrenzt; sie kann dauerhaft erhalten bleiben und z. B. für Darlehen, Beteiligungen, Investitionen oder Kapitalerhöhungen aus Gesellschaftsmitteln verwendet werden.

Nicht zulässig: Verlustabdeckung in Vermögensverwaltung oder wGB aus der freien Rücklage.

Sonderfall gUG → gGmbH: Die gesetzliche Rücklage nach § 5a Abs. 3 GmbHG (25 % des Jahresüberschusses bis 25.000 €) verstößt nach Auffassung der Finanzverwaltung nicht gegen § 55 AO. Für die Kapitalerhöhung aus Gesellschaftsmitteln müssen die Mittel zuvor zulässig in eine § 62 AO-Rücklage (insbesondere die freie Rücklage) eingestellt sein. Beschluss und Zuführung lückenlos dokumentieren.`,
  },
  {
    id: "ruecklagen-katalog",
    title: "Rücklagen nach § 62 AO — Überblick",
    short:
      "Zweckgebundene, Wiederbeschaffungs-, freie und Beteiligungs­rücklage — Voraussetzungen, Nachweise, Auflösung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Interne NPO-Checkliste (Rücklagen) und Arbeitspapier Mittelverwendung.",
    keywords: /rücklage|zweckgebunden|wiederbeschaffung|betriebsmittelrücklage|§\s*62/i,
    references: ["§ 62 AO", "§ 63 Abs. 4 AO"],
    body: `§ 62 AO kennt vier Rücklagenarten:

1) Zweckgebundene Rücklage (Abs. 1 Nr. 1) — für ein konkret geplantes, definiertes Vorhaben. Voraussetzungen: konkrete Zeit- und Finanzierungs­vorstellungen, dokumentierter Beschluss. Auflösungspflicht, sobald das Projekt aufgegeben oder abgeschlossen ist; frei werdende Mittel unterliegen wieder der zeitnahen Verwendung.

2) Betriebsmittelrücklage (Unterfall Nr. 1) — Liquiditätssicherung für periodisch wiederkehrende Ausgaben (Gehälter, Miete, Energie). Höhe orientiert sich am Bedarf eines angemessenen Zeitraums (i. d. R. 3–12 Monate).

3) Wiederbeschaffungsrücklage (Abs. 1 Nr. 2) — für die Ersatzbeschaffung von Wirtschaftsgütern. Höhe regelmäßig an der jährlichen AfA orientiert; höhere Beträge nur mit nachvollziehbarem Mehrbedarf.

4) Freie Rücklage (Abs. 1 Nr. 3) — siehe eigener Eintrag.

5) Rücklage zum Erwerb von Gesellschaftsrechten (Abs. 1 Nr. 4) — zur Erhaltung der prozentualen Beteiligungs­quote bei Kapitalerhöhungen.

Formales:
- Beschluss des zuständigen Organs.
- Bildung und Verwendung in der MVR und im Rücklagenspiegel transparent abbilden.
- Bei Wegfall des Rücklagengrundes: unverzügliche Auflösung.

Audit-Risiken: dauerhaft hohe Mittelbestände ohne erkennbares Projekt, langjährig unveränderte Rücklagen, pauschal angesetzte Audit-/Rückforderungs­rücklagen ohne Vertragsgrundlage.`,
  },
  {
    id: "darlehen-npo",
    title: "Darlehensvergabe durch gemeinnützige Organisationen",
    short:
      "Aus zeitnah zu verwendenden Mitteln nur zur unmittelbaren Zweckverwirklichung; sonst aus freier Rücklage zu marktüblichen Konditionen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Darlehensvergabe durch gemeinnützige Organisationen.",
    keywords: /darlehen|kredit\s+(an|von)\s+(verein|stiftung|tochter|ggmbh|gug)/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO", "§ 58 Nr. 1 AO", "§ 62 Abs. 1 Nr. 3 AO"],
    body: `Die Vergabe von Darlehen ist kein gemeinnütziger Zweck. Zulässigkeit hängt entscheidend von der Herkunft der Mittel ab.

Aus zeitnah zu verwendenden Mitteln nur zulässig, wenn:
- das Darlehen unmittelbar einen Satzungszweck verwirklicht (Schuldnerberatung, Stipendien, Instrumente für Nachwuchskünstler) und zinslos/zinsverbilligt vergeben wird, oder
- es an eine andere steuerbegünstigte Körperschaft im Rahmen des § 58 Nr. 1 AO geht und diese die Mittel ihrerseits zeitnah satzungsgemäß verwendet.

Aus nicht zeitnah zu verwendenden Mitteln (insb. freie Rücklage, Vermögens­zuführungen):
- für Vermögensanlage, Kapitalausstattung von Tochtergesellschaften, Liquiditätshilfen.
- An nicht-gemeinnützige Empfänger zwingend marktüblich verzinst — sonst verdeckte Gewinnausschüttung oder Mittel­fehlverwendung.

Rückflüsse: Tilgungen und Zinsen müssen, sobald sie der Körperschaft zufließen, wieder zeitnah für satzungsgemäße Zwecke verwendet werden.

Dokumentation: schriftlicher Vertrag mit Laufzeit, Tilgung, Verzinsung; Beschluss des Organs; Eintrag in MVR/Rücklagenspiegel.`,
  },
  {
    id: "reverse-charge-npo",
    title: "Reverse Charge bei gemeinnützigen Körperschaften (§ 13b UStG)",
    short:
      "Auch ideeller Bereich, Kleinunternehmer und ausschließlich steuerfreie NPOs schulden die USt — Vorsteuerabzug meist ausgeschlossen.",
    category: "Umsatzsteuer",
    source: "Beitrag von Maydell, npoR 2022, 190 — interne Verarbeitung.",
    keywords: /reverse[\s-]?charge|§\s*13b|ausländische[rn]?\s+(dienstleister|unternehmer|leistung)|leistung\s+aus\s+dem\s+ausland/i,
    references: ["§ 13b UStG", "§ 3a Abs. 2 UStG", "§ 15 Abs. 2 UStG", "§ 19 UStG"],
    body: `Reverse Charge ist für gemeinnützige Körperschaften eine besondere Falle, weil:

1) Seit 2011 ist die Ortsbestimmung des § 3a Abs. 2 UStG auch dann anwendbar, wenn die Leistung ausschließlich für den nichtunternehmerischen / ideellen Bereich bezogen wird. Eine sonstige Leistung eines ausländischen Unternehmers an eine NPO mit USt-IdNr. oder eine NPO, die im Übrigen Unternehmerin ist, ist regelmäßig im Inland steuerbar.

2) Auch Kleinunternehmer (§ 19 UStG) und ausschließlich steuerfrei tätige NPOs schulden die USt nach § 13b UStG. Die Kleinunternehmer­regelung gilt nicht für ausländische Leistende.

3) Eine bereits in Rechnung gestellte ausländische USt mindert die Bemessungs­grundlage nicht — sie erhöht sie nach h. M., weil sie Teil der Gegenleistung ist.

4) Der Vorsteuerabzug ist regelmäßig ausgeschlossen, weil die Eingangsleistungen für den ideellen Bereich, steuerfreie Umsätze oder den unentgeltlichen Zweckbetrieb verwendet werden (§ 15 Abs. 2 UStG). Daher wird Reverse Charge bei NPOs faktisch zur echten Kostenbelastung.

Typische Risikofälle: Werbeleistungen großer Tech-Anbieter mit Sitz in Irland/USA, Freelancer im Ausland, Webentwicklung, SaaS, Beratungsleistungen, Hilfspersonen bei Auslands­projekten (§ 57 Abs. 1 S. 2 AO). Achtung: Eine USt-IdNr. löst auch bei nichtunternehmerisch tätigen Körperschaften die Ortsverlagerung ins Inland aus (§ 3a Abs. 2 S. 3 UStG) — daher nicht unüberlegt beantragen.

Ausnahmen vom Empfängerort: grundstücksbezogene Leistungen (§ 3a Abs. 3 Nr. 1 UStG) — Ort liegt dort, wo das Grundstück liegt; ausländische Bauleistung am inländischen Grundstück löst stets deutsche USt aus.`,
  },
  {
    id: "vermietung-vv-wgb",
    title: "Vermietung: Vermögensverwaltung vs. wirtschaftlicher Geschäftsbetrieb",
    short:
      "Langfristige Raumvermietung = VV; Kurzfristigkeit, Sonderleistungen oder Inventardominanz kippen in den wGB.",
    category: "Umsatzsteuer",
    source: "Internes Arbeitspapier — Vermietung von Immobilien und Mobilien.",
    keywords: /vermiet|verpacht|co[-\s]?working|betriebsvorrichtung|§\s*4\s*nr\.?\s*12|§\s*9\s*ustg/i,
    references: ["§ 14 AO", "§ 4 Nr. 12 UStG", "§ 9 UStG", "§ 12 Abs. 2 Nr. 8a UStG", "§ 15a UStG"],
    body: `Ertragsteuerliche Einordnung:
- Vermögensverwaltung (§ 14 S. 3 AO): langfristige Vermietung unbeweglichen Vermögens ohne wesentliche Nebenleistungen.
- Wirtschaftlicher Geschäftsbetrieb (§ 14 S. 1 AO): Kurzfristigkeit, ständiger Mieterwechsel, Sonderleistungen (Reinigung während Mietzeit, Personalgestellung, Bewirtung), oder Einzel­vermietung beweglicher Wirtschaftsgüter.
- Sachinbegriff (möblierte Räume / vollausgestattetes Büro) bleibt VV, solange keine aktiven Zusatzleistungen erbracht werden.

Co-Working:
- Service-Pakete, Empfang, IT, Community → wGB (19 % USt).
- Reine Langfristüberlassung möblierter Räume mit Nebenkosten kann VV sein.

Umsatzsteuer:
- Grundsatz: steuerfrei nach § 4 Nr. 12 Buchst. a UStG.
- Zwingend steuerpflichtig: kurzfristige Beherbergung, Fahrzeug­abstellplätze, Betriebsvorrichtungen.
- Option nach § 9 UStG nur, wenn Mieter Unternehmer ist und das Grundstück (mindestens 95 %, Bagatellgrenze) für vorsteuer­abzugs­berechtigte Umsätze nutzt. Teiloption auf abgrenzbare Gebäudeteile zulässig.
- Altfallregelung § 27 Abs. 2 UStG: bei Baubeginn vor 11.11.1993 entfällt die Einschränkung des § 9 Abs. 2 UStG — Option auch bei Vermietung an Ärzte/NPOs möglich. Entfällt bei sanierungsbedingtem „Neubau“.

Steuersatz bei NPOs:
- VV und Zweckbetrieb: ermäßigt 7 % (§ 12 Abs. 2 Nr. 8a UStG).
- wGB: regulär 19 %.

Betriebsvorrichtungen: nach neuer Rechtsprechung kann die Überlassung gemeinsam mit dem Gebäude als einheitliche Nebenleistung steuerfrei werden — mit Folge, dass die Vorsteuer aus deren Anschaffung verloren geht. Bei Inventar­dominanz: sonstige Leistung eigener Art, 19 %.

§ 15a UStG: Nutzungsänderung (z. B. Wechsel zu steuerfreiem Mieter) löst Vorsteuer­berichtigung über 10 Jahre aus.`,
  },
  {
    id: "57-abs-3-ao",
    title: "§ 57 Abs. 3 AO — Servicegesellschaften und EuGH-Vorlage",
    short:
      "Doppeltes Satzungserfordernis abgelehnt; BFH hat 2025 die Europarechts­konformität der Norm dem EuGH vorgelegt.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rechtsentwicklung Servicegesellschaften § 57 Abs. 3 AO (BFH V R 22/23).",
    keywords: /§\s*57\s*abs\.?\s*3|servicegesellschaft|planmäßiges zusammenwirken|kostenteilungsgemeinschaft|§\s*4\s*nr\.?\s*29/i,
    references: ["§ 57 Abs. 3 AO", "§ 4 Nr. 29 UStG", "BFH 22.05.2025 – V R 22/23"],
    body: `§ 57 Abs. 3 AO erlaubt seit dem JStG 2020 das „planmäßige Zusammenwirken“ mehrerer steuerbegünstigter Körperschaften. Eine Servicegesellschaft (z. B. gGmbH für Buchhaltung, IT, Personal) kann selbst gemeinnützig sein, wenn die Kooperation in ihrer Satzung verankert ist.

Doppeltes Satzungserfordernis: Die Finanzverwaltung hatte gefordert, dass die Kooperation auch in den Satzungen der Leistungs­empfänger steht. FG Hamburg (26.09.2023 – 5 K 11/23) und tendenziell auch der BFH lehnen dies ab — die Satzung der leistenden Körperschaft genügt.

EuGH-Vorlage (BFH 22.05.2025 – V R 22/23): Der BFH zweifelt, ob § 57 Abs. 3 AO mit dem EU-Beihilferecht (Art. 107, 108 AEUV) vereinbar ist. Die Norm wurde ohne Notifizierung bei der Kommission eingeführt. Vorlagefragen: (1) Beihilfe? (2) Neutralisieren die gemeinnützigkeits­rechtlichen Beschränkungen den selektiven Vorteil? (3) Notifizierungs­pflichtige Neu- oder Umgestaltung?

Praxis bis zur EuGH-Entscheidung:
- Bestehende Strukturen: Verrechnungspreise nach Fremdvergleich dokumentieren, ggf. Rückstellungen für Steuernach­zahlungen bilden, hilfsweise Kriterien einer Kostenteilungs­gemeinschaft nach § 4 Nr. 29 UStG prüfen.
- Neugründungen: Vorrangig Kostenteilungs­gemeinschaft nach § 4 Nr. 29 UStG strukturieren — sie beruht direkt auf EU-Recht (Art. 132 Abs. 1 Buchst. f MwStSystRL) und ist nicht vom Beihilferisiko betroffen (BFH 04.09.2024 – XI R 37/21).
- Hybridmodelle: Servicegesellschaft, deren Geschäftsmodell zugleich § 4 Nr. 29 UStG erfüllt.
- USt-Härtefallklauseln in Verträgen aufnehmen.`,
  },
  {
    id: "tatigkeitsbericht",
    title: "Tätigkeitsbericht und tatsächliche Geschäftsführung",
    short:
      "Pflicht­nachweis der satzungs­gemäßen Mittelverwendung; Abgleich mit Buchhaltung und Sphären­zuordnung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes NPO-Handout (Abschnitt 5).",
    keywords: /tätigkeitsbericht|tatsächliche geschäftsführung/i,
    references: ["§ 63 AO"],
    body: `Der Tätigkeitsbericht weist die tatsächliche Geschäftsführung nach (§ 63 AO). Er muss zur Buchhaltung, zur Mittelverwendung und zur Sphären­zuordnung passen.

Im Mandat prüfen:
- Liegt für das Geschäftsjahr ein Tätigkeitsbericht vor?
- Sind die wesentlichen Tätigkeiten beschrieben und einer Sphäre zuzuordnen?
- Werden Investitionen, Rücklagenbildung und größere Mittel­bewegungen erläutert?

Risiken: Fehlt der Bericht oder weicht er von der Buchhaltung ab, drohen Rückfragen des Finanzamts, im Wiederholungsfall Aberkennung der Gemeinnützigkeit.`,
  },
  // ===== NPO / Mittelverwendungsrechnung — vertiefende Wissenskarten =====
  {
    id: "mvr-zeitnahe-mittelverwendung",
    title: "Zeitnahe Mittelverwendung",
    short:
      "Mittel gemeinnütziger Körperschaften müssen grundsätzlich zeitnah für steuerbegünstigte satzungsmäßige Zwecke verwendet werden.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Mittelverwendung (Kapitel 1).",
    keywords: /zeitnahe?\s+mittelverwendung|selbstlosigkeit|zwei[-\s]?jahres[-\s]?frist/i,
    references: ["§ 55 Abs. 1 Nr. 5 AO"],
    body: `Grundsatz der Selbstlosigkeit (§ 55 AO): Eine gemeinnützige Körperschaft darf in erster Linie keine eigenwirtschaftlichen Zwecke verfolgen. Daraus folgt die Pflicht, die ihr zufließenden Mittel zeitnah für die steuerbegünstigten satzungsmäßigen Zwecke einzusetzen.

Zwei-Jahres-Frist: Mittel müssen spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren verwendet werden (§ 55 Abs. 1 Nr. 5 S. 3 AO). Beispiel: Zufluss 2024 → Verwendung bis Ende 2026.

Zweck der Regelung: Vermeidung unzulässiger Mittelhortung. Die Mittel sollen tatsächlich dem geförderten Zweck zugutekommen und nicht dauerhaft im Vermögen der Körperschaft verbleiben.

Review-Hinweis: Die zeitnahe Mittelverwendung ist über eine Mittelverwendungsrechnung (MVR) nachzuweisen. Ein positiver Verwendungsüberhang führt nicht automatisch zum Verlust der Gemeinnützigkeit, kann aber Anlass für eine Verwendungsauflage des Finanzamts (§ 63 Abs. 4 AO) sein.`,
  },
  {
    id: "mvr-45000-grenze",
    title: "45.000-€-Grenze",
    short:
      "Kleine Körperschaften mit Einnahmen bis 45.000 € sind nach der hinterlegten Logik von der Pflicht zur zeitnahen Mittelverwendung ausgenommen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Mittelverwendung, Schwellenprüfung.",
    keywords: /45\.?000|kleine körperschaft|bagatellgrenze\s+mittelverwendung/i,
    references: ["§ 55 Abs. 1 Nr. 5 S. 4 AO"],
    body: `Liegen die jährlichen Einnahmen einer Körperschaft insgesamt bei höchstens 45.000 €, entfällt die Pflicht zur zeitnahen Mittelverwendung.

Kumulierte Betrachtung — einzubeziehen sind die Einnahmen aller vier Sphären:
- ideeller Bereich (Spenden, Beiträge, Zuschüsse, Bruttoeinnahmen),
- Zweckbetrieb,
- Vermögensverwaltung,
- steuerpflichtiger wirtschaftlicher Geschäftsbetrieb.

Praxis: Die Befreiung greift jahresbezogen. Wer einmal die Schwelle überschreitet, fällt für dieses Jahr aus der Befreiung. Eine freiwillige Mittelverwendungsrechnung ist auch unterhalb der Grenze sinnvoll, weil sie bei späterem Wachstum nahtlos fortgeführt werden kann und Mittelherkunftsnachweise erleichtert.

Review-Hinweis: Befreiung nicht mit Aufzeichnungspflichten verwechseln. Tätigkeitsbericht, ordnungsgemäße Buchführung und Sphärenabgrenzung sind weiterhin erforderlich.`,
  },
  {
    id: "mvr-mittelbegriff",
    title: "Mittelbegriff",
    short:
      "Mittel umfassen grundsätzlich sämtliche Vermögenswerte der Körperschaft.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Definition Mittel.",
    keywords: /mittelbegriff|was sind mittel|grundstockvermögen/i,
    references: ["§ 55 Abs. 1 AO", "§ 62 Abs. 3 AO"],
    body: `„Mittel" im Sinne des § 55 AO sind grundsätzlich sämtliche Vermögenswerte der Körperschaft, insbesondere:

- Spenden,
- Mitgliedsbeiträge,
- Zuschüsse,
- Gewinne aus Zweckbetrieb,
- Gewinne aus steuerpflichtigem wirtschaftlichem Geschäftsbetrieb,
- Überschüsse aus Vermögensverwaltung,
- Bruttoeinnahmen des ideellen Bereichs.

Ausnahme: Das Grundstockvermögen einer Stiftung sowie Stiftungseinlagen und ausdrücklich der Vermögensausstattung gewidmete Zuwendungen unterliegen nicht der zeitnahen Mittelverwendung (§ 62 Abs. 3 AO). Sie sind in der MVR getrennt auszuweisen.

Review-Hinweis: Bei Sachzuwendungen ist der gemeine Wert maßgeblich. Die Zweckbindung muss aus Spendenaufruf, Zuwendungsvereinbarung oder Stiftungsgeschäft eindeutig hervorgehen.`,
  },
  {
    id: "mvr-zulaessige-verwendung",
    title: "Zulässige Mittelverwendung",
    short:
      "Mittelverwendung ist zulässig, wenn sie satzungsmäßigen steuerbegünstigten Zwecken dient.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Zulässige Verwendung.",
    keywords: /zulässige? mittelverwendung|mittelweitergabe|§\s*58\s*nr\.?\s*1/i,
    references: ["§ 55 AO", "§ 58 Nr. 1 AO"],
    body: `Eine Mittelverwendung gilt als zulässig (= zweckentsprechend), wenn sie unmittelbar oder mittelbar die satzungsmäßigen steuerbegünstigten Zwecke fördert.

Typische zulässige Verwendungen:
- Ausgaben im ideellen Bereich (Projektkosten, ehrenamtliche Aufwandsentschädigungen, Öffentlichkeitsarbeit für den Zweck),
- Ausgaben im Zweckbetrieb (§§ 65–68 AO),
- nutzungsgebundenes Anlagevermögen im ideellen Bereich / Zweckbetrieb (z. B. Therapieräume, Lehrmittel),
- Mittelweitergabe an andere steuerbegünstigte Körperschaften nach § 58 Nr. 1 AO,
- Darlehensvergabe nur in engen Fällen, wenn die Darlehensvergabe selbst der unmittelbaren Zweckverwirklichung dient (z. B. Schuldnerberatung, Stipendiendarlehen).

Nicht zweckentsprechend: Ausgaben in Vermögensverwaltung und steuerpflichtigem wGB, sonstiges (nicht nutzungsgebundenes) Anlagevermögen, kommerzielle Darlehen aus zeitnah zu verwendenden Mitteln.

Review-Hinweis: Bei Mittelweitergabe Freistellungsbescheid bzw. Anlage zum KSt-Bescheid des Empfängers in Akte halten.`,
  },
  {
    id: "mvr-ruecklagen-62-uebersicht",
    title: "Rücklagen nach § 62 AO",
    short:
      "Zulässige Rücklagen entziehen Mittel der zeitnahen Mittelverwendungspflicht.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rücklagenarten § 62 AO.",
    keywords: /§\s*62\s*ao|rücklagen?\s*nach\s*§\s*62|betriebsmittelrücklage|wiederbeschaffungsrücklage/i,
    references: ["§ 62 Abs. 1 AO", "§ 62 Abs. 3 AO"],
    body: `Mittel, die in eine zulässige Rücklage nach § 62 AO eingestellt werden, gelten als verwendet und unterliegen für die Dauer der Rücklagenbildung nicht mehr der zeitnahen Mittelverwendung.

Übersicht der Rücklagenarten:
1) Zweckgebundene Rücklage (§ 62 Abs. 1 Nr. 1 AO) — für konkret geplante Projekte.
2) Betriebsmittelrücklage (Unterfall Nr. 1) — Liquiditätssicherung für periodisch wiederkehrende Ausgaben (i. d. R. 3–12 Monate).
3) Wiederbeschaffungsrücklage (§ 62 Abs. 1 Nr. 2 AO) — Ersatzbeschaffung von Wirtschaftsgütern, regelmäßig in Höhe der AfA.
4) Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO) — siehe eigener Eintrag.
5) Rücklage zum Erwerb von Gesellschaftsrechten (§ 62 Abs. 1 Nr. 4 AO) — zur Erhaltung der Beteiligungsquote.

Daneben: Vermögenszuführungen nach § 62 Abs. 3 AO (Erbschaft, ausdrückliche Vermögensausstattung, Spendenaufruf zur Vermögensaufstockung, Sachzuwendung zur Vermögensbildung).

Review-Hinweis: Jede Rücklage benötigt Beschluss, Zweck, Dokumentation und Auflösung bei Wegfall des Grundes.`,
  },
  {
    id: "mvr-freie-ruecklage",
    title: "Freie Rücklage",
    short:
      "Die freie Rücklage ist flexibel, aber die jährliche Zuführung ist begrenzt.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Freie Rücklage (Bemessungsgrundlagen).",
    keywords: /freie? rücklage|§\s*62\s*abs\.?\s*1\s*nr\.?\s*3|nachholung\s+freie\s+rücklage/i,
    references: ["§ 62 Abs. 1 Nr. 3 AO"],
    body: `Bemessung der jährlichen Höchstzuführung:
- bis zu 1/3 des Überschusses der Vermögensverwaltung,
- zuzüglich bis zu 10 % der sonstigen zeitnah zu verwendenden Mittel (ideeller Bereich, Zweckbetrieb, wGB).

Wichtige Regeln:
- Keine Doppelberücksichtigung: Mittel der Vermögensverwaltung dürfen nicht zusätzlich in die Bemessungsgrundlage der 10 %-Rücklage einbezogen werden.
- Nachholung: Nicht ausgeschöpfte Höchstbeträge können in den zwei folgenden Jahren nachgeholt werden.
- Unterdeckungen der Vermögensverwaltung sind in spätere Jahre vortragbar und mindern dort die Bemessungsgrundlage.

Gesamthöhe ist unbegrenzt. Verwendung später z. B. für Darlehen, Beteiligungen, Investitionen, Kapitalerhöhungen aus Gesellschaftsmitteln.

Review-Hinweis: Zuführung und Berechnungsgrundlage in der MVR transparent dokumentieren. Eine unterlassene Zuführung kann nur innerhalb der 2-Jahres-Nachholung aufgeholt werden.`,
  },
  {
    id: "mvr-mittelverwendungsrechnung",
    title: "Mittelverwendungsrechnung",
    short:
      "Die MVR dokumentiert die zeitnahe und satzungsgemäße Mittelverwendung.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Aufbau MVR.",
    keywords: /mittelverwendungsrechnung|mvr\b|nebenrechnung\s+jahresabschluss/i,
    references: ["§ 55 AO", "§ 63 AO"],
    body: `Die Mittelverwendungsrechnung (MVR) ist Nebenrechnung zum Jahresabschluss und dient dem Nachweis, dass die Körperschaft ihre Mittel zeitnah und satzungsgemäß verwendet hat.

Format: Es gibt kein gesetzlich vorgeschriebenes Schema. In der Praxis verbreitet sind:
- bilanzorientierte Darstellung (Vermögensvergleich; Gegenüberstellung der zeitnah zu verwendenden Mittel und ihrer Verwendung),
- kapitalflussorientierte Darstellung (Mittelzu- und -abflüsse im Jahr).

Pflichtbestandteile in der Praxis:
- Saldobetrachtung / Globalbetrachtung über alle zeitnah zu verwendenden Mittel,
- Abstimmung mit dem Rücklagenspiegel,
- Ausweis offener Mittelvorträge mit Fristen,
- Verwendungsüberhang als Ergebniskennzahl.

Review-Hinweis: Die MVR ist Teil der Akte und sollte beim Finanzamt auf Anforderung kurzfristig vorgelegt werden können.`,
  },
  {
    id: "mvr-ruecklagenspiegel",
    title: "Rücklagenspiegel",
    short:
      "Der Rücklagenspiegel zeigt Bildung, Entwicklung und Auflösung gemeinnützigkeitsrechtlicher Rücklagen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Rücklagenspiegel.",
    keywords: /rücklagenspiegel/i,
    references: ["§ 62 AO"],
    body: `Der Rücklagenspiegel stellt für jede Rücklage je Geschäftsjahr dar:
- Anfangsbestand,
- Zuführung,
- Entnahme / Auflösung,
- Endbestand,
- Zweck,
- Vorstands- bzw. Geschäftsführungsbeschluss (Datum),
- Nachweise (Projektplan, Finanzierungsplan, Belege).

Er ergänzt die Mittelverwendungsrechnung und macht die Rücklagenentwicklung über mehrere Jahre nachvollziehbar.

Review-Hinweis: Auflösungen sind zwingend zu dokumentieren — frei werdende Mittel unterliegen wieder der zeitnahen Mittelverwendung. Dauerhaft unveränderte Rücklagen oder pauschale Sammelpositionen ohne Zweck sind Audit-Risiko.`,
  },
  {
    id: "mvr-verwendungsueberhang",
    title: "Verwendungsüberhang",
    short:
      "Ein positiver Verwendungsüberhang kann auf nicht zeitnah verwendete Mittel hinweisen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Auswertung MVR.",
    keywords: /verwendungsüberhang|nicht\s+zeitnah\s+verwendete\s+mittel/i,
    references: ["§ 55 AO", "§ 63 Abs. 4 AO"],
    body: `Der Verwendungsüberhang ist eine rechnerische Kennzahl der MVR:
Zeitnah zu verwendende Mittel − zweckentsprechende Verwendung − zulässige Rücklagen − Vermögenszuführungen § 62 Abs. 3 AO − offener Mittelvortrag (innerhalb Frist).

Interpretation:
- Positiver Überhang: Hinweis auf nicht zeitnah verwendete Mittel → Prüfbedarf.
- Negativer Überhang: Es wurden mehr Mittel zweckentsprechend verwendet als rechnerisch erforderlich (z. B. Auflösung von Vorjahresmitteln).

Folgen: Ein positiver Überhang führt nicht automatisch zur Aberkennung der Gemeinnützigkeit. Das Finanzamt kann nach § 63 Abs. 4 AO eine angemessene Verwendungsauflage (oft bis zu drei Jahren) erteilen. Erst wiederholte oder schwere Verstöße gefährden die Gemeinnützigkeit.

Review-Hinweis: Der Überhang ist Arbeitswert und ersetzt keine fachliche Würdigung — insbesondere Mittelherkunft, Sphärenzuordnung und Rücklagengründe sind zu prüfen.`,
  },
  {
    id: "mvr-vorstandsbeschluesse",
    title: "Vorstandsbeschlüsse und Dokumentation",
    short:
      "Rücklagen sollten durch Beschlüsse und Nachweise dokumentiert werden.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Dokumentationsstandards Rücklagen.",
    keywords: /vorstandsbeschluss|rücklagenbeschluss|dokumentation\s+rücklage/i,
    references: ["§ 62 AO", "§ 63 AO"],
    body: `Jede Rücklagenbildung sollte durch das zuständige Organ (Vorstand, Geschäftsführung) formal beschlossen und dokumentiert werden.

Mindestbestandteile der Dokumentation:
- Rücklagenbeschluss mit Datum,
- Projektbeschreibung (Zweck, Inhalt),
- Finanzierungsplan (geplante Kosten, Mittelherkunft),
- Zeitplan (geplanter Verwendungs- bzw. Ersatzzeitpunkt),
- Auflösungsdokumentation bei Wegfall des Rücklagengrundes,
- Review durch Steuerberater / Wirtschaftsprüfer.

Praxisempfehlung: Beschlussvorlage als wiederverwendbares Template in der Mandatsakte führen. Im Rücklagenspiegel jede Position mit Beschlussdatum verknüpfen — fehlt das Datum, ist die Position fachlich nicht belastbar.`,
  },
  // ===== Spenden-Crowdfunding / Förderkörperschaften =====
  {
    id: "spenden-crowdfunding-gegenleistung",
    title: "Spenden-Crowdfunding: Gegenleistungen Dritter",
    short:
      "Gegenleistung durch den Projektträger zerstört die Unentgeltlichkeit der Spende — Haftung der Plattform nach § 10b Abs. 4 EStG.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Steuerliche Risiken bei Gegenleistungen im Spenden-Crowdfunding.",
    keywords: /crowdfunding|reward|förderkörperschaft|gegenleistung.*spende|plattform.*spende|zuwendungsbestätigung.*haftung/i,
    references: ["§ 10b Abs. 4 EStG", "§ 55 AO", "§ 58 Nr. 1 AO"],
    body: `Plattformen, die als gemeinnützige Förderkörperschaft Spenden für steuerbegünstigte Projektträger sammeln, müssen die Unentgeltlichkeit jeder einzelnen Zuwendung sicherstellen.

Verlust des Spendencharakters:
- Erhält der Spender (C) vom Projektträger (B) eine Gegenleistung (Produkt, Merchandise, exklusive Vorteile, „Reward"), fehlt die Unentgeltlichkeit — auch wenn die Plattform selbst nichts leistet.
- Keine Teilentgeltlichkeit: Die Gegenleistung „infiziert" den gesamten Betrag, nicht nur den Mehrwert.
- Buchung im ideellen Bereich ist dann sachlich unzutreffend; Erfassung als „sonstige Zuwendung" bzw. durchlaufender Posten.

Sphärenwirkung Plattform:
- Solange die Plattform keine Provision/Gegenleistung erbringt, entsteht bei ihr kein eigener wirtschaftlicher Geschäftsbetrieb.
- Werden Mittel für die Herstellung von Rewards verwendet, liegt Mittelfehlverwendung vor.

Haftung nach § 10b Abs. 4 EStG:
- Ausstellerhaftung: 30 % des zugewendeten Betrags (zzgl. 15 % bei GewSt-Pflicht) bei objektiv unrichtiger Zuwendungsbestätigung, sofern Vorsatz oder grobe Fahrlässigkeit (z. B. ignorierte Reward-Hinweise, fehlende vertragliche Vorkehrungen).
- Veranlasserhaftung: bei Verwendung der Gelder für einen steuerpflichtigen wGB statt für den ideellen Zweck.
- Entlastung bei nachweislicher Unkenntnis (heimliche Absprache B/C), wenn die Unkenntnis nicht auf Organisationsmängeln beruht.

Handlungsempfehlungen:
- Strikte Kontentrennung zwischen bescheinigungsfähigen Spenden und Crowdfunding-Geldern ohne Spendencharakter.
- Technische Sperre gegen automatisierte Quittungen bei Reward-Projekten; sofortige Umbuchung bei Bekanntwerden einer Gegenleistung.
- Keine Bescheinigung bei Gegenleistung — auch nicht über Teilbeträge. Bei nachträglichem Bekanntwerden: Widerruf, Korrekturdatensatz, Haftungsanzeige ans Finanzamt.
- Vertragliche Absicherung: Verpflichtungserklärung des Projektträgers (keine Gegenleistung), Freistellungsklausel, dokumentierte Belehrung.

Fazit: Mischformen zwischen Spenden-Crowdfunding und Reward-Crowdfunding beherrschen nur klare Vertragsvorgaben und interne Kontrollmechanismen (Reward-Indikator-Sperre).`,
  },
  // ===== GoBD =====
  {
    id: "gobd-grundsaetze",
    title: "GoBD — Grundsätze ordnungsgemäßer Buchführung",
    short:
      "Nachvollziehbarkeit, Vollständigkeit, Richtigkeit, Zeitgerechtheit, Ordnung und Unveränderbarkeit als Kernpflichten jeder Buchhaltung.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil I) — Gärtner / Rühmann.",
    keywords: /gobd|grundsätze ordnungsgemäßer buchführung|nachvollziehbar|unveränderbar|zeitgerecht/i,
    references: [
      "§ 145 Abs. 1 AO",
      "§ 146 Abs. 1 und 4 AO",
      "§ 238 Abs. 1 HGB",
      "§ 239 Abs. 2 und 3 HGB",
      "BMF-Schreiben GoBD",
    ],
    body: `Die GoBD konkretisieren die Grundsätze ordnungsgemäßer Buchführung für DV-gestützte Systeme. Sechs Kernanforderungen:

1) Nachvollziehbarkeit / Nachprüfbarkeit (§ 145 Abs. 1 AO, § 238 Abs. 1 HGB, GoBD Rn. 30–35 und 145–150)
   - Ein sachverständiger Dritter muss sich in angemessener Zeit einen Überblick über Geschäftsvorfälle und Lage des Unternehmens verschaffen können.
   - Geschäftsvorfälle in Entstehung und Abwicklung verfolgbar (progressiv vom Beleg zur Bilanz, retrograd zurück).

2) Vollständigkeit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 36–43)
   - Alle buchungspflichtigen Geschäftsvorfälle lückenlos erfassen — keine Unterdrückung, keine Auswahl.

3) Richtigkeit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 44)
   - Aufzeichnungen müssen den tatsächlichen Verhältnissen entsprechen (richtige Konten, Beträge, Zeiträume, USt-Sätze, Währungen).

4) Zeitgerechtheit (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 45–52)
   - Unbare Geschäftsvorfälle: Erfassung innerhalb von 10 Tagen unkritisch; periodengerechte Buchung bis zum Ablauf des Folgemonats.
   - Kassenbewegungen: täglich.
   - Belegsicherung (laufende Nummerierung, Ablage) muss zeitnah erfolgen, auch wenn die Verbuchung später nachgeholt wird.

5) Ordnung (§ 146 Abs. 1 AO, § 239 Abs. 2 HGB, Rn. 53–57)
   - Systematische, übersichtliche Ablage von Daten und Belegen; klare Trennung von baren und unbaren Vorgängen, sachliche und chronologische Ordnung.

6) Unveränderbarkeit (§ 146 Abs. 4 AO, § 239 Abs. 3 HGB, Rn. 58–60 und 107–112)
   - Festgeschriebene Daten dürfen nicht unbemerkt geändert oder gelöscht werden.
   - Änderungen müssen protokolliert sein, der ursprüngliche Inhalt bleibt erkennbar.
   - Excel-Tabellen ohne Änderungsprotokoll erfüllen diese Anforderung typischerweise nicht.

Verstöße können zur formellen Ordnungswidrigkeit der Buchführung führen — Folge: Schätzungsbefugnis der Finanzverwaltung (§ 162 AO), Hinzuschätzungen, Verwerfen der Buchführung.`,
  },
  {
    id: "gobd-belegfunktion-verfahrensdoku",
    title: "GoBD — Belegfunktion und Verfahrensdokumentation",
    short:
      "Keine Buchung ohne Beleg, Grund-/Journal-/Kontenfunktion sichern, Verfahrensdokumentation als Pflichtbestandteil.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil I) — Belegwesen, IKS, Verfahrensdokumentation.",
    keywords: /belegfunktion|verfahrensdokumentation|journalfunktion|kontenfunktion|grundaufzeichnung|iks|internes kontrollsystem/i,
    references: ["§ 146 AO", "§ 257 HGB", "GoBD Rn. 61 ff., 151 ff."],
    body: `Belegfunktion (Grundsatz „Keine Buchung ohne Beleg")
- Jeder Geschäftsvorfall ist durch einen Originalbeleg oder einen geeigneten Eigenbeleg nachzuweisen.
- Pflichtinhalte des Belegs: eindeutige Belegnummer, Belegdatum, Geschäftspartner, Betrag und Währung, ggf. Fremdwährungskurs, USt-Satz, hinreichende Erläuterung des Geschäftsvorfalls.
- Mitgeltende Unterlagen (Verträge, Lieferscheine, Bestellungen) sind über eindeutige Verknüpfungen (Index, Barcode, Referenznummer) auffindbar zu machen.

Grund-/Journal-/Kontenfunktion
- Grundaufzeichnungsfunktion: vollständige und unveränderbare Erfassung jedes Geschäftsvorfalls zeitnah nach Entstehung.
- Journalfunktion: chronologische Darstellung aller gebuchten Geschäftsvorfälle (Buchungsprotokoll).
- Kontenfunktion: systematische, sachliche Ordnung auf Bestands- und Ertragskonten — Verdichtung nur zulässig, wenn die Einzelposten jederzeit reproduzierbar bleiben.

Bearbeitung von Belegen
- Belegsicherung sofort (laufende Nummerierung, Eingangsstempel, geordnete Ablage).
- Konvertierung von Papier in digitale Form ist zulässig, wenn bildliche und inhaltliche Übereinstimmung gewährleistet und die ursprüngliche Form vernichtet werden darf (Verfahrensdokumentation zur ersetzenden Erfassung notwendig).
- Eigenbelege nur in Ausnahmefällen, mit klarer Begründung und Unterschrift.

Internes Kontrollsystem (IKS)
- Maßnahmen, die Vollständigkeit, Richtigkeit und Unveränderbarkeit der Aufzeichnungen sicherstellen: Funktionstrennung, Vier-Augen-Prinzip, Zugriffsschutz, Abstimm- und Kontrollroutinen, Protokollierung.
- IKS ist Teil der Buchführungspflicht — fehlt es, ist die formelle Ordnungsmäßigkeit gefährdet.

Verfahrensdokumentation (GoBD Rn. 151 ff.)
- Pflichtbestandteil jeder DV-gestützten Buchführung; muss Aufbau, Inhalt und Ablauf des Verfahrens vollständig und schlüssig erläutern.
- Mindestbestandteile: allgemeine Beschreibung, Anwender- und technische Dokumentation, Betriebsdokumentation, Beschreibung des IKS.
- Änderungen der Verfahren sind mit Versionsstand und Geltungszeitraum zu dokumentieren (historisierte Dokumentation).
- Typische Prüfungsschwerpunkte: ersetzendes Scannen, E-Mail-Eingang, Kassensysteme, Schnittstellen zwischen Vor- und Hauptsystemen, Archivierung.

Konsequenz: Fehlt oder ist die Verfahrensdokumentation unzureichend, kann dies allein die Ordnungsmäßigkeit der Buchführung in Frage stellen, sofern dadurch die Nachvollziehbarkeit und Nachprüfbarkeit der Geschäftsvorfälle beeinträchtigt ist (BMF: nicht jede Lücke ist automatisch ein Mangel).`,
  },
  {
    id: "gobd-datenanalyse-kassen",
    title: "GoBD — Datenanalyse und Kassendaten",
    short:
      "Quantitative Prüfungsmethoden (Ziffern-, Zeitreihen-, Strukturanalyse) und Anforderungen an die Auswertung digitaler Kassendaten.",
    category: "Buchhaltung",
    source: "Internes Schulungspapier GoBD (Teil III) — Datenanalyse und Kassendaten.",
    keywords: /datenanalyse|ziffernanalyse|benford|kassendaten|tse|zeitreihenanalyse|power\s*bi|prüfungsmethode/i,
    references: ["§ 146a AO", "§ 147 Abs. 6 AO", "KassenSichV", "GoBD Rn. 81–89"],
    body: `Datenanalyse durch quantitative Prüfungsmethoden
- Phasen: Zieldefinition → Datenbeschaffung & -qualitätsprüfung → Analyse → Visualisierung → Bericht und Archivierung.
- Datenqualität ist Voraussetzung: Vollständigkeit, Formatkonsistenz, eindeutige Schlüssel, Nachvollziehbarkeit der Herkunft.
- Klassische Verfahren: Ziffernanalyse (z. B. Benford-Verteilung der führenden Ziffern), Zeitreihenanalyse (Trends, Saisonalitäten, Ausreißer), Lagemaße (Mittelwert, Median, Quantil), Konfidenzniveau zur Beurteilung von Auffälligkeiten.
- Visualisierung: Balken-/Säulen-, Linien-, Kreis-, Wasserfalldiagramme; Dashboards (z. B. Power BI) zur kontinuierlichen Überwachung.
- Nutzen in der Steuerberatung: frühzeitige Identifikation von Buchungsanomalien, Kassendifferenzen, manipulationsverdächtigen Mustern, Vorbereitung auf Betriebsprüfung.

Kassendaten (§ 146a AO, KassenSichV)
- Elektronische Aufzeichnungssysteme benötigen eine zertifizierte technische Sicherheitseinrichtung (TSE): Sicherheitsmodul, Speichermedium, einheitliche digitale Schnittstelle (DSFinV-K).
- Jede Einzelaufzeichnung muss vollständig, richtig, zeitgerecht und unveränderbar sein; nachträgliche Stornos sind als solche zu kennzeichnen.
- Belegausgabepflicht: bei jedem Geschäftsvorfall muss ein Beleg zur Verfügung stehen (auch elektronisch).
- Mitteilungspflicht nach § 146a Abs. 4 AO über eingesetzte/abgeschaffte Kassensysteme (ELSTER-Meldung).
- Prüfungsschwerpunkte: Signaturvalidierung, Belegabbrüche, Lücken in der Transaktionsnummer, Z-Bon-Vollständigkeit, Stornoquote, Trinkgeldverbuchung.
- Risiko: nicht ordnungsgemäße Kassenführung → Schätzungsbefugnis nach § 162 AO; Hinzuschätzungen oft auf Basis quantitativer Analysen (Chi-Quadrat-Test, Strukturvergleich).

Praxisempfehlung
- Vor Betriebsprüfung eigene Datenanalyse fahren (Z3-Zugriff simulieren), Auffälligkeiten dokumentieren und im Vorfeld erläutern.
- Datenanalyse-Routinen in der Kanzlei standardisieren und in die Verfahrensdokumentation aufnehmen.`,
  },
  {
    id: "ki-agenten-langdock",
    title: "KI-Agenten in Langdock — Aufbau und Einsatz im Kanzleialltag",
    short:
      "Spezialisierte Chatbots mit Anweisungen, Skills und Wissensquellen — stark bei Konvertierung, Importvorbereitung und Vorprüfung.",
    category: "DATEV",
    source: "Internes Team-Handout — KI-Agenten in Langdock.",
    keywords: /langdock|ki[- ]?agent|qm[- ]?chatbot|kontoauszug[- ]?converter|buchungsvorlauf[- ]?converter|mt940|camt\.?053/i,
    body: `Ein KI-Agent in Langdock ist ein vorkonfigurierter Chatbot mit hinterlegten Anweisungen, Skills und Wissensordnern. Vorteil gegenüber freiem Prompten: einheitliche Ergebnisse, geringere Einstiegshürde, formularbasierte Eingaben.

Arbeitslogik
- Pflichtfelder (Berater-/Mandantennummer, Vorgangsart, Zielformat) füllen.
- Anhänge entscheiden über die Qualität: PDFs, CSV, Excel, Exportdaten, idealerweise GDPdU-Daten.
- Optionale Hinweise im Freitext für Fallbesonderheiten ergänzen.
- Ergebnis lesen, fachlich prüfen, Folgeschritte ableiten.

Typische Agenten
- QM-Chatbot: interne QM- und Wissenssuche in natürlicher Sprache.
- Dokumentenübersetzer: Verträge, Belege, PDFs übersetzen.
- Kontoauszug-Converter: PDF/CSV → MT940 oder CAMT.053 (PayPal/Stripe oft mit Pseudo-IBAN; bei Stripe Datumsformat beachten).
- Buchungsvorlauf-Converter: Fremddaten → DATEV-Buchungsvorlauf; Matching mit Debitorenliste.
- Anlagevermögens-Converter: Anlagenverzeichnis aus Fremdsystemen für DATEV-Import vorbereiten.
- Fachagenten: Anhang, WP-Anfragen, Jahresabschluss, Fremdwährung, Einkommensteuer, Gesellschafterdarlehen, Tax-Compliance/NPO.
- Organigramm-Agent laut Hinweis derzeit nicht zuverlässig — nicht nutzen.

Ergebnislogik
- Risikoeinstufung, Folgeprompts, Hinweise auf fehlende Unterlagen, Arbeitspapier-Struktur für die Akte.
- Subagenten delegieren Spezialprüfungen im Hintergrund.

Qualitätsregeln
- Fachliche Endkontrolle bleibt immer beim Menschen.
- Saubere Eingaben → kritische Prüfung → Rückmeldung von Fehlern an die Agenten-Pflege.`,
  },
  {
    id: "datev-prochecklisten",
    title: "DATEV ProChecklisten — laufende Nutzung und Mandatswissen",
    short:
      "Checkliste während der Arbeit nutzen, nicht erst am Ende abhaken. Standardprozess + Mandatswissen + Vertretungssicherheit.",
    category: "DATEV",
    source: "Internes Team-Handout — DATEV ProChecklisten.",
    keywords: /procheck|prochecklist|checkliste.*datev|datev.*checkliste|vorgangsmappe.*check/i,
    body: `ProCheck ist ein laufendes Arbeitswerkzeug, kein Pflicht-Häkchen am Ende. Ideal: Checkliste während der Bearbeitung geöffnet halten und Punkte direkt abhaken.

Zugang
- Direkt über ProCheck, über Schnellinfos beim Mandanten, über Karteikarten/Leistungsbereiche oder aus Fachanwendungen (z. B. Kanzlei-Rechnungswesen).
- Darstellungen: Baumstruktur (hierarchisch) oder Prozesslandschaft/Kacheln (visuell).

Prozessaufbau
- Prozessinformation, Prozesspunkte, Rollen, Teilinformationen, Ziel/Nutzen, Verknüpfungen (DMS, Vorlagen, Leitfäden), Historie.
- Verknüpfungen direkt aus dem Prozess öffnen — System kennt oft schon Mandant, Leistung, Zeitraum.

Wissens- und QM-Plattform
- Bildet auch Strategie-, Abrechnungs-, Datenschutz- und Unterstützungsprozesse ab.
- Suche: Volltext, letzte Änderungen, Verknüpfungen, Zuständigkeiten.
- QM-Chatbot in Langdock ergänzt die klassische Suche, aber nur so aktuell wie die letzte QM-Datenbasis.

Mandatswissen ergänzen
- Prozessgrundlage und Checklistenbasis sind standardisiert und nicht beliebig veränderbar.
- Mandantenhinweise, Notizen, fallbezogene Besonderheiten, Zuständigkeiten sind ergänzbar.
- Wiederholungen: monatlich/jährlich direkt möglich; quartalsweise/halbjährlich über gezielte Monate lösen.

Notiz vs. Detailinformation
- Notiz: gilt nur für die konkrete Checkliste/diesen Zeitraum, situativ.
- Detailinformation: dauerhaft, läuft in Folge-Checklisten mit.
- Faustregel: einmalig = Notiz, dauerhaft = Detailinformation.

Qualitätsmaßstab
- Eine gute Checkliste enthält Datenherkunft, Vorsysteme, Importlogik, Bearbeitungsbesonderheiten, dauerhafte Hinweise, Verknüpfungen, Zuständigkeiten und Vertretungswissen.
- Test: Eine Vertretung kann das Mandat damit sicher und nachvollziehbar bearbeiten.`,
  },
  {
    id: "kassen-datenanalyse",
    title: "Kassenprozesse, Datenanalyse und prüfbare Kassendaten",
    short:
      "IKS, Risikoanalyse, Statistik, Benford/Chi-Quadrat, Visualisierung sowie DSFinV-K- und TSE-Datenexport.",
    category: "Buchhaltung",
    source: "Internes Team-Handout — Kassenprozesse, Datenanalyse und prüfbare Kassendaten.",
    keywords: /dsfinv|tse[- ]?archiv|kassennachschau|benford|chi[- ]?quadrat|kassendaten|kassenrisik|stornoquote|z[- ]?bon/i,
    references: ["§ 146a AO", "§ 147 Abs. 6 AO", "KassenSichV", "DSFinV-K"],
    body: `Leitgedanke: Erst Prozessqualität, dann Datenanalyse. Schlechte Daten werden durch Analyse nicht gut.

IKS und Risikoanalyse
- Gesamtrisiko ist mandatsindividuell: Kneipe, Kiosk, Restaurant und Filialbetrieb haben andere Risiken.
- Vorgehen: Risiko identifizieren → Folge beschreiben → Eintrittswahrscheinlichkeit → Auswirkung → Gesamtrisiko → Maßnahme/Kontrolle.
- Typische Risikofelder: unberechtigter Zugriff, fehlende Funktionstrennung, fehlerhafte/unvollständige Erfassung, Stornos, Kassendifferenzen, TSE-/Meldepflichten.

Kontrollen und Verantwortlichkeiten
- Rollen, Rechte, Prüfintervalle, klare Zuständigkeiten.
- Datenexport vor Außenprüfung organisieren — nicht erst dann.
- TSE-Ausfälle/Offline-Status wahrnehmen, dokumentieren, nachverfolgen.

Statistik-Grundlagen
- Mittelwert ist anfällig für Ausreißer; Median und Quantile sind oft aussagekräftiger.
- Verteilung schlägt eine einzelne Kennzahl.
- Boxplot: Lage, Quartile, Streuung, Ausreißer für Vergleiche von Monaten, Filialen, Kassen.

Ziffernanalysen
- Benford-Verteilung der führenden Ziffer ist ein starkes Indiz — aber nur bei geeigneten, sauberen Datensätzen.
- Chi-Quadrat vergleicht Erwartung mit Beobachtung; Freiheitsgrade und Signifikanzniveau einordnen.
- Merksatz: statistische Auffälligkeit + weitere Sachverhaltsfeststellungen = belastbarer Prüfungsansatz.

DSFinV-K, TSE und Datenexport
- Fachliche Exportdaten (DSFinV-K), technische Archivdaten (TSE) und organisatorische Aufbewahrung müssen zusammenpassen.
- Lücken in fortlaufenden Nummern oder Signaturfolgen sind regelmäßig erklärungsbedürftig.

Minimalstandard für die Kanzlei
- Mandat risikoorientiert einordnen, Datenverfügbarkeit und Exportfähigkeit sicherstellen, Grundprüfung auf Lücken und Plausibilität, Auffälligkeiten dokumentieren.`,
  },
  {
    id: "dms-dokumentenmanagement",
    title: "DMS — Dokumentenmanagement in der Kanzlei",
    short:
      "Revisionssicherheit, Ablageknigge, Status, Suche, Vorgangsmappen, Ein-/Auschecken.",
    category: "DATEV",
    source: "Internes Meeting-Handout — DMS Dokumentenmanagementsystem.",
    keywords: /\bdms\b|dokumentenmanagement|ablagekn|vorgangsmappe|einchecken|auschecken|zur erledigung/i,
    body: `Grundprinzipien
- Revisionssicherheit: alle Änderungen nachvollziehbar, jede Version bleibt abrufbar, frühere Fassungen werden nicht überschrieben.
- Nur fachlich und rechtlich zulässige Inhalte ablegen. Sensible/belastende Informationen gehören nicht in Aktennotizen.

Zugriff
- Mandantenbezogen: Schnellinfo zeigt alle Dokumente mit Betreff, Veranlagungsjahr, Status, Bearbeitung.
- Mandantenübergreifend: „Zur Erledigung“ ist die zentrale Arbeitsliste — mehrmals täglich prüfen und schlank halten.

Bearbeitung
- Status über kontextbezogene Links rechts effizient setzen; nicht benötigte Status ausblenden.
- Falsch zugeordnete Dokumente an den zuständigen Mitarbeiter weiterleiten.
- Notizen und Aufgaben direkt am Dokument anlegen; Aufgaben sind mandatsbezogen sichtbar.
- Öffnen per Viewer (Auge) für Sichtprüfung — geöffnete Dokumente werden ausgecheckt. Vor Arbeitsende kontrollieren, dass alles wieder eingecheckt ist.

Suche und Ablage
- Schnellsuche: Beschreibung und Attribute. Volltextsuche: zusätzlich Dokumentinhalt.
- Ablagestruktur nicht als primären Suchweg nutzen.
- Ablageknigge konsequent wählen; „Sonstiges“ nur mit aussagekräftiger Beschreibung.
- Attribute pflegen: Auftrag, Jahr, Monat, Bearbeiter, Status, Stichworte; bei mehrjährigem Bezug weitere Jahre ergänzen.

Weitere Funktionen
- Anpinnen, Kopieren (unabhängig vs. verknüpft), Löschen erfolgt zunächst in einen Zwischenstatus.
- Übergabe an andere DATEV-Anwendungen oder Export zur lokalen Speicherung.

Neue Dokumente, Dummys, Vorgangsmappen
- Nur vorgesehene Kanzlei-Vorlagen verwenden; Absenderangaben korrekt wählen.
- Dummy-Dokument anlegen, wenn Unterlagen ohne E-Mail-Trägerdokument eingehen — sonst fehlen sie in „Zur Erledigung“.
- Vorgangsmappen für Jahresabschlüsse: vordefinierte Struktur; nicht benötigte Unterordner erst nach Prüfung entfernen.`,
  },
  {
    id: "datev-rewe-tipps",
    title: "DATEV Kanzlei-Rechnungswesen — Tipps und Tricks",
    short:
      "Arbeitsplatz und Rechnungswesen-Programm an eigene Arbeitsweise anpassen, schneller buchen, Forderungen im Blick.",
    category: "DATEV",
    source: "Internes Lernvideo-Handout — DATEV Kanzlei-Rechnungswesen Tipps und Tricks.",
    keywords: /kanzlei[- ]?rechnungswesen|datev arbeitsplatz|musterbest|buchungsperiode|festschreibung|gebucht[- ]?bis/i,
    body: `Ihre Arbeitsweise ist Programm
- DATEV Arbeitsplatz: Mandanten suchen, sortieren, gruppieren und filtern. Spalten konfigurieren — z. B. Festschreibungsanzeige (grün/gelb), UStVA-Rhythmus (M/Q), Gebucht-bis-Datum, zuletzt übermittelte Zeiträume.
- Arbeitsblatt „Heute“ zeigt zuletzt bearbeitete Leistungen und ist anpassbar.
- Kanzlei-Rechnungswesen: Navigationsbereich um häufig genutzte Funktionen/Auswertungen erweitern (z. B. konsolidierte UStVA, Kreditor anlegen). Anpassung ist benutzerbezogen.

Buchen
- Buchungen ändern/berichtigen: schnelle Korrekturwege statt Stornieren-und-Neubuchen; Buchungen ausschneiden und einfügen.
- Einstellungen Buchungszeile: Tastenkürzel und Spaltenlogik nutzen.
- Buchungstexte und Konto-Notizen: Kontenbeschriftung mit „k÷“ (Ziffernblock) in den Buchungstext übernehmen.

Forderungen im Blick
- OPOS-Auswertungen und Mahnwesen aus dem Rechnungswesen heraus steuern; Altersstruktur regelmäßig prüfen.

Helfer für den Alltag
- Tastenkürzel, individuelle Listenfilter, persönliche Favoriten — viele kleine Schritte sparen täglich Zeit.

Musterbestände nutzen
- DATEV-Musterkanzlei (Muster GmbH) zum Üben neuer Funktionen, ohne Echtdaten zu gefährden.

Buchungsperiode abschließen
- Festschreibung sauber durchführen, Stand der Buchführung dokumentieren, vor Abgabe der UStVA prüfen.`,
  },
  {
    id: "automatisierungsservice-rechnungen",
    title: "Automatisierungsservice Rechnungen — Voraussetzungen und AS1",
    short:
      "Voraussetzungen, Aktivierung, Symbolik (grün/gelb/rot), echte Automatisierung über die Spalte AS1 messen.",
    category: "DATEV",
    source: "Internes Team-Handout — Automatisierungsservice Rechnungen (Kanzlei-Rechnungswesen).",
    keywords: /automatisierungsservice|as1[- ]?spalte|robotersymbol|e[- ]?rechnung.*automatik|automatisierungsgrad/i,
    body: `Zielbild
- Der Automatisierungsservice unterstützt die Verarbeitung von Eingangs- und Ausgangsrechnungen im DATEV-Rechnungswesen.
- Er lebt von Datenhistorie, wiederkehrenden Mustern und einer sauberen digitalen Prozesskette.

Voraussetzungen
- Regelmäßige Sendung ins Rechenzentrum (aktuelle Datenbasis).
- Ausreichende Dokumentenhistorie (offiziell mind. zwei Jahre, praktisch zählt Wiederkehr und Menge).
- OPOS aktiviert und tatsächlich genutzt.
- Behandlungsform „Standard“ (ggf. vor Aktivierung von „Erweitert“ umstellen).
- SKR03 oder SKR04, keine Branchenpakete, kein selbstbuchender Mandant.
- Digitale Belege werden bereits gebucht.

Stammdaten und E-Rechnungen
- System schlägt bei neuen Geschäftspartnern vorbefüllte Stammdaten vor.
- Bei E-Rechnungen können neue Geschäftspartner im Hintergrund automatisch angelegt werden (Einstellung in „Eigenschaften → Digitale Belege“).
- Sonderfälle wie Tankstellen-Filialen sind Prozessentscheidungen — nicht jeder Lieferant muss perfekt zusammengeführt werden.

Aktivierung
- In Kanzlei-Rechnungswesen über „Bestand → Automatisierungsservices“; System prüft Voraussetzungen.
- Robotersymbol in der Statuszeile zeigt nur an, dass mindestens ein Service aktiv ist.
- Pragmatisch testen und beobachten statt theoretisch zerdenken; bei fehlendem Mehrwert wieder deaktivieren.

Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung erforderlich.
- Rot: kein Vorschlag bzw. Fehler → Sachverhalt klären.

AS1-Spalte und echter Automatisierungsgrad
- Spalte AS1 ist standardmäßig nicht sichtbar; je Bestand über Rechtsklick → „Einstellungen Liste“ aktivieren.
- Zeigt, welche Buchungen wirklich vollautomatisch verarbeitet wurden (kein menschlicher Eingriff).
- Sobald ein Buchungssatz erneut geöffnet, bestätigt oder verändert wird, verschwindet die Kennzeichnung für Vollautomatik.
- AS1 ist sichtbar in Primanota/passender Ansicht, nicht im Grundblatt.

Team-Empfehlung
- Systemvorschläge nicht aus Gewohnheit bekämpfen — Prozesse so aufsetzen, dass das System möglichst oft recht hat.
- Manuelle Eingriffe reduzieren, AS1 regelmäßig auswerten, Mehrwert pro Bestand kritisch bewerten.`,
  },
  {
    id: "steuern-grundlagen",
    title: "Steuern — Grundlagen und Systematik",
    short:
      "Was Steuern sind, Abgrenzung zu Gebühren/Beiträgen, Steuerarten im deutschen Steuersystem.",
    category: "Buchhaltung",
    source: "Allgemeines Grundlagenwissen (interne Aufbereitung).",
    keywords: /(was\s+(ist|sind)\s+(eine\s+)?steuer)|steuerarten|steuersystem|steuerrecht\s+grundlagen|abgabenarten|grundbegriffe\s+steuer/i,
    references: ["§ 3 AO"],
    body: `Steuern sind Geldleistungen, die ein öffentlich-rechtliches Gemeinwesen (Bund, Länder, Gemeinden) zur Erzielung von Einnahmen allen auferlegt, bei denen der gesetzliche Tatbestand zutrifft — ohne Anspruch auf eine konkrete Gegenleistung (Legaldefinition § 3 Abs. 1 AO).

Abgrenzung zu anderen Abgaben:
- Gebühr: Entgelt für eine konkrete Amtshandlung (z. B. Passgebühr).
- Beitrag: Entgelt für die Möglichkeit der Inanspruchnahme einer Leistung (z. B. IHK-Beitrag).
- Sonderabgabe: Finanzierung gruppennütziger Zwecke.

Einteilung der Steuern:
1) Nach Bemessungsgrundlage
   - Ertragsteuern: Einkommensteuer, Körperschaftsteuer, Gewerbesteuer.
   - Verkehrsteuern: Umsatzsteuer, Grunderwerbsteuer, Versicherungsteuer.
   - Substanzsteuern: Grundsteuer, Erbschaft-/Schenkungsteuer.
   - Verbrauchsteuern: Energiesteuer, Tabaksteuer, Kaffeesteuer.

2) Nach Steuergläubiger
   - Bundessteuern (z. B. Energiesteuer, Versicherungsteuer).
   - Landessteuern (z. B. Erbschaftsteuer, Grunderwerbsteuer).
   - Gemeindesteuern (z. B. Grundsteuer, Gewerbesteuer).
   - Gemeinschaftsteuern (USt, ESt, KSt — Ertrag wird aufgeteilt).

3) Nach Überwälzbarkeit
   - Direkte Steuern: Steuerschuldner = Steuerträger (ESt, KSt).
   - Indirekte Steuern: werden überwälzt (USt, Verbrauchsteuern).

Wichtige Steuerarten in der Praxis:
- Einkommensteuer (EStG) — natürliche Personen.
- Körperschaftsteuer (KStG) — juristische Personen, 15 % + SolZ.
- Gewerbesteuer (GewStG) — Gewerbebetriebe, Hebesatz der Gemeinde.
- Umsatzsteuer (UStG) — 19 %/7 %, indirekt, EU-harmonisiert.
- Lohnsteuer — Erhebungsform der ESt, Arbeitgeber haftet.
- Erbschaft-/Schenkungsteuer (ErbStG) — siehe eigener Eintrag.
- Grunderwerbsteuer, Grundsteuer, Kfz-Steuer, Kapitalertragsteuer.

Grundprinzipien:
- Gesetzmäßigkeit der Besteuerung (Art. 20 Abs. 3 GG, § 3 Abs. 1 AO).
- Gleichmäßigkeit (Art. 3 GG).
- Leistungsfähigkeitsprinzip.
- Bestimmtheitsgrundsatz.

Verfahrensrechtlicher Rahmen: Abgabenordnung (AO) — Mantelgesetz für alle Steuerarten (Festsetzung, Erhebung, Vollstreckung, Rechtsbehelfe).`,
  },
  {
    id: "erbschaftsteuer-grundlagen",
    title: "Erbschaft- und Schenkungsteuer — Grundlagen",
    short:
      "Steuerpflicht, Steuerklassen, Freibeträge, Bewertung und Tarif nach ErbStG.",
    category: "Buchhaltung",
    source: "Interne Musterlösung Übungsklausur ErbSt/Bewertung (Rechtsstand 2024).",
    keywords: /erbschaftsteuer|erbst\b|schenkungsteuer|erbstg|nachlass|erbanfall|§\s*15\s*erbstg|§\s*16\s*erbstg|freibetrag\s+erbe/i,
    references: ["§§ 1, 3, 9, 10, 15, 16, 19 ErbStG", "§§ 11, 151, 182 ff. BewG", "§ 1922 BGB"],
    body: `Die Erbschaft- und Schenkungsteuer erfasst den unentgeltlichen Vermögensübergang von Todes wegen (§ 3 ErbStG) bzw. unter Lebenden (§ 7 ErbStG).

Steuerpflicht:
- Unbeschränkt steuerpflichtig (§ 2 Abs. 1 Nr. 1 ErbStG), wenn Erblasser/Schenker oder Erwerber zum Zeitpunkt der Steuerentstehung Inländer ist (Wohnsitz/gewöhnlicher Aufenthalt im Inland, § 8/§ 9 AO).
- Beschränkt steuerpflichtig: nur Inlandsvermögen.
- Steuer entsteht mit dem Tod des Erblassers bzw. Ausführung der Schenkung (§ 9 ErbStG). Dieser Tag ist Bewertungsstichtag (§ 11 ErbStG).

Steuerklassen (§ 15 ErbStG):
- StKl I: Ehegatten, Lebenspartner, Kinder, Stiefkinder, Enkel, bei Erbfall auch Eltern/Großeltern.
- StKl II: Geschwister, Nichten/Neffen, Stiefeltern, Schwiegerkinder, geschiedene Ehegatten.
- StKl III: alle übrigen Erwerber.

Persönliche Freibeträge (§ 16 ErbStG):
- Ehegatte/Lebenspartner: 500.000 €.
- Kinder/Stiefkinder: 400.000 €.
- Enkel: 200.000 € (400.000 €, wenn Elternteil verstorben).
- Eltern bei Erbfall: 100.000 €.
- StKl II/III: 20.000 €.
Zusätzlich: Versorgungsfreibetrag (§ 17 ErbStG), Hausrat-/Pkw-Freibetrag (§ 13 Abs. 1 Nr. 1 ErbStG: 41.000 € Hausrat / 12.000 € andere bewegliche Gegenstände in StKl I).

Steuertarif (§ 19 ErbStG): progressiv nach Erwerb und StKl, z. B. StKl I bis 600.000 € = 15 %, bis 6 Mio. € = 19 %, bis 13 Mio. € = 23 %.

Bewertung (BewG):
- Anteile an nicht notierten Kapitalgesellschaften: gemeiner Wert; vorrangig IDW-S1/vereinfachtes Ertragswertverfahren; Substanzwert als Mindestwert (§ 11 Abs. 2 BewG). Gesonderte Feststellung nach § 151 Abs. 1 Nr. 3 BewG.
- Grundbesitz: gesonderte Feststellung nach § 151 Abs. 1 Nr. 1 BewG; je nach Grundstücksart Vergleichs-, Ertrags- oder Sachwertverfahren (§§ 182 ff. BewG).
- Niedrigerer gemeiner Wert kann nach § 198 BewG durch Gutachten nachgewiesen werden.

Begünstigungen:
- §§ 13a/13b ErbStG: Begünstigung von Betriebsvermögen, qualifizierten Kapitalgesellschafts­anteilen (Mindestbeteiligung > 25 %) und land-/forstwirtschaftlichem Vermögen; Verschonungsabschlag 85 % oder 100 %, Lohnsummenregelung, Behaltensfrist.
- § 13d ErbStG: 10 %-Abschlag für zu Wohnzwecken vermietete Grundstücke.
- § 13 Abs. 1 Nr. 4b/c ErbStG: Familienheim für Ehegatten/Kinder.

Nachlassverbindlichkeiten (§ 10 Abs. 5 ErbStG):
- Erblasserschulden (z. B. Hypotheken).
- Erbfallschulden (Pflichtteile, Vermächtnisse, Beerdigungs- und Nachlassregelungskosten; Pauschbetrag 10.300 €).

Berechnungsschema:
Wert des Vermögensanfalls (Aktiva, jeweils gesondert bewertet)
./. sachliche Befreiungen (§ 13 ErbStG)
./. Nachlassverbindlichkeiten (§ 10 Abs. 5 ErbStG)
= Bereicherung (§ 10 Abs. 1 ErbStG)
./. persönlicher Freibetrag (§ 16 ErbStG)
./. Versorgungsfreibetrag (§ 17 ErbStG)
= steuerpflichtiger Erwerb (abgerundet auf volle 100 €, § 10 Abs. 1 S. 6 ErbStG)
× Steuersatz § 19 ErbStG
= festzusetzende Erbschaftsteuer

Praxisbeispiel (Auszug Musterlösung 2024): Enkel erbt nach verstorbenem Vater Vermögen mit GmbH-Anteil 22 %, gemischt genutztem Grundstück, EFH, Hausrat, Pkw, Bankguthaben. Bereicherung 3.421.081 € ./. Freibetrag 400.000 € = stpfl. Erwerb 3.021.000 € × 19 % = 573.990 € ErbSt.

Vorerwerbe (§ 14 ErbStG): Erwerbe innerhalb von 10 Jahren von derselben Person werden zusammengerechnet.`,
  },
  {
    id: "datev-esteuern-prozess",
    title: "DATEV eSteuern — digitaler Einkommensteuerprozess",
    short:
      "Vollmacht, vorausgefüllte Steuererklärung, Steuerkonto online, Bescheiddatenabgleich und DIVA 2 im Überblick.",
    category: "DATEV",
    source: "Internes Handout NPO-Team — DATEV eSteuern.",
    keywords: /esteuern|vorausgefüllte? steuererklärung|steuerkonto\s+online|bescheiddaten|diva\s*2|vollmachtsdatenbank/i,
    body: `Der DATEV eSteuern-Einkommensteuerprozess ermöglicht eine weitgehend papierlose Bearbeitung von der Vorbereitung bis zum Bescheid.

Bausteine
- Vollmacht / Vollmachtsdatenbank: Grundlage für alle digitalen Abrufe.
- Vorausgefüllte Steuererklärung (VaSt): Lohnsteuerbescheinigungen, Rentenbezüge, Vorsorgeaufwendungen elektronisch übernehmen.
- Steuerkonto online: offene Beträge, geleistete Zahlungen, Sollstellungen / Vorauszahlungen abrufen.
- Post, Fristen und Bescheide: Bescheiddatenabgleich; automatische Anzeige von Abweichungen Erklärung ↔ Bescheid.
- DIVA 2: digitale Zustellung von Bescheiden und Finanzamtsdokumenten ins DMS.

Voraussetzungen
- Hinterlegte Vollmacht, gesetztes Vollmachtszeichen.
- Abruffreigabe für VaSt und Steuerkonto online.
- Mandant beim Finanzamt registriert.
- Bei Abruffehlern zuerst Registrierung, Vollmacht und Freigaben prüfen — nicht nur Warnhinweise.

Steuerkonto online — Abrufweg
Mandant auswählen → Rechtsklick „Abfrage ausgewählter Mandant“ → offene Beträge / geleistete Zahlungen / Sollstellungen wählen.

Bescheiddatenabgleich
- Bescheiddaten früh prüfen.
- Abweichungen zur abgegebenen Erklärung werden markiert; Einspruchsfristen im Auge behalten.

DIVA 2
- Digitaler Eingang von Finanzamtsdokumenten.
- Ablage automatisiert in DMS, Verknüpfung zum Mandantenakt.

Team-Workflow
1) Vorbereitung: Vollmacht/Freigaben prüfen, VaSt + Steuerkonto online ziehen.
2) Bearbeitung: Erklärung erstellen, digitale Optionen aktiv mitdenken.
3) Nachgelagert: Bescheiddatenabgleich, DIVA 2-Eingang prüfen, Fristen sichern.`,
  },
  {
    id: "datev-lerndateien",
    title: "DATEV Lerndateien & Buchungsvorschläge",
    short:
      "Kriterien richtig wählen, Sternchen-Platzhalter, automatisiertes Buchen, AS1-Spalte und Aufräumen bestehender Bestände.",
    category: "DATEV",
    source: "Internes Handout — Lerndateien, Buchungsvorschläge & Automatisierung.",
    keywords: /lerndatei|buchungsvorschlag|automatisches buchen|sternchen.*platzhalter|alt\s*\+\s*-|strg\s*\+\s*l/i,
    body: `Grundsatz: So wenig Kriterien wie möglich, so viel wie nötig. Eine Lerndatei soll den wiederkehrenden Sachverhalt präzise treffen.

Anlegen
- Wege: Funktion oben im Programm, Shortcut Alt + -, oder STRG + L.
- Oben: Was soll gebucht werden (Konto, Personenkonto, Aufteilung).
- Unten: Wann soll die Lerndatei greifen (Kriterien je Rechnungskreis).

Geeignete Kriterien
- Wiederkehrende Begriffe im Verwendungszweck.
- Stabile Auftraggeber/Geschäftspartner kombiniert mit weiteren Kriterien.
- Transaktionstypen bei PayPal/Amazon.
- Ware/Leistung bei Eingangs- und Ausgangsrechnungen.

Riskante Kriterien
- Datum, Monat, Zeitraum (z. B. 06/23).
- Rechnungsnummern, laufende Referenzen.
- Wechselnde Beträge, zufällige Zeichenketten.
- Zu kurze Stichwörter (z. B. nur „AAG“).
- Nur der Auftraggeber, wenn unterschiedliche Sachverhalte möglich sind.

Sternchen-Platzhalter
- *Einzahlung* — beliebiger Text vor/nach „Einzahlung“.
- *Erstattung*AAG* — beide Stichwörter müssen vorkommen.
- *Beitr*ge* — deckt „Beiträge“ und „Beitraege“ ab.
- Zu viele Sternchen oder zu kurze Textteile machen die Lerndatei gefährlich breit.

Lerndateien testen: Transaktionen reimportieren und Vorschläge prüfen.

Buchungsvorschläge — Symbolik
- Grün: ausreichend sicher → automatische Verbuchung möglich.
- Gelb: unsicher → manuelle Prüfung.
- Rot: kein Vorschlag/Fehler → Sachverhalt klären.

Automatisiertes Buchen
- Erst aktivieren, wenn Vorschläge stabil greifen und erste Zeiträume plausibel geprüft sind.
- AS1-Spalte zeigt den tatsächlichen Vollautomatisierungsgrad; standardmäßig ausgeblendet, über Listen-Einstellungen aktivieren.
- Sobald ein Buchungssatz erneut geöffnet oder verändert wird, entfällt die AS1-Kennzeichnung.

Pflege bestehender Bestände
- Übernommene Bestände kritisch prüfen: leere, redundante oder zu allgemeine Lerndateien aufräumen.
- Lerndateien, die nur einmal greifen, verschwenden Pflegeaufwand.

Neue Prüfungslogik
- Weg von der Einzelfallkontrolle jedes Belegs, hin zu risikoorientierter Stichprobe und gezielter Kontrolle der gelben/roten Fälle.`,
  },
  {
    id: "kfz-wertabgabe-1prozent",
    title: "Kfz-Wertabgabe nach 1-%-Methode",
    short:
      "Berechnung der privaten Kfz-Nutzung, USt-Aufteilung ⇨ 8921 0 / ⇨ 8924 0 und Kostendeckelung.",
    category: "DATEV",
    source: "Internes Arbeitspapier — JA Vorlage Unentgeltliche Wertabgaben Kfz.",
    keywords:
      /(1\s*%|1-%|ein\s*prozent)[-\s]*methode|kfz.?wertabgabe|private\s+kfz.?nutzung|bruttolistenpreis|kostendeckelung|8921|8924|fahrten\s+wohnung.?betrieb|firmenwagen/i,
    references: ["⇨ 8921 0", "⇨ 8924 0", "⇨ 4679 0", "⇨ 4680 0", "§ 6 Abs. 1 Nr. 4 EStG"],
    body: `Die 1-%-Methode pauschaliert den privaten Nutzungsanteil eines betrieblichen Fahrzeugs. Voraussetzung ist regelmäßig eine betriebliche Nutzung von mehr als 50 %.

1) 1-%-Wert (Privatfahrten)
- Bruttolistenpreis auf volle 100 € abgerundet × 1 % × Nutzungsmonate.
- 20-%-Abschlag für nicht vorsteuerbelastete Kosten kürzt die Bemessungsgrundlage USt.
- USt 19 % auf die verbleibende BMG vor Kostendeckelung.

2) Fahrten Wohnung / Betrieb (0,03 %)
- 0,03 % vom Bruttolistenpreis × Entfernungskilometer × Nutzungsmonate.
- Abzüglich Arbeitstage × Entfernung × 0,30 € (Entfernungspauschale).
- Differenz = nicht abzugsfähige Betriebsausgaben → außerbilanzielle Korrektur
  per ⇨ 4679 0 an ⇨ 4680 0.

3) Kostendeckelung
- Mit Vorsteuer belastete Fahrzeugkosten netto = Gesamtfahrzeugkosten netto
  abzüglich nicht mit Vorsteuer belastete Kosten.
- Maximalwert für die USt-Bemessungsgrundlage = 50 % der mit Vorsteuer belasteten
  Fahrzeugkosten netto.
- Tatsächliche BMG ⇨ 8921 0 = Minimum aus 1-%-BMG und 50-%-Deckel.

4) DATEV-Konten
- ⇨ 8921 0 Unentgeltliche Wertabgaben Kfz 19 % USt.
- ⇨ 8924 0 Unentgeltliche Wertabgaben Kfz ohne USt.
- Differenz zwischen 1-%-Wert + Fahrten W/B und BMG ⇨ 8921 0 wird auf ⇨ 8924 0
  ausgewiesen.

5) Typische Vorsteuer-Einordnung
- Ohne Vorsteuer: Kfz-Steuer, Kfz-Versicherung, Schuldzinsen (regelmäßig).
- Mit Vorsteuer: Kraftstoff, Reparaturen, Wagenpflege (ordnungsgemäße Rechnung).
- Versicherungsentschädigungen als negativer Betrag erfassen.

Hinweis: Berechnung ist Arbeitshilfe — Bruttolistenpreis, Nutzungsmonate,
Vorsteueranteile und DATEV-Buchungen fachlich prüfen.`,
  },
  {
    id: "gobd",
    title: "GoBD – digitale Buchführung und Aufbewahrung",
    short:
      "Grundsätze für elektronische Buchführung, digitale Belege, Aufbewahrung, Verfahrensdokumentation und Datenzugriff.",
    category: "DATEV",
    source: "BMF-Schreiben zu den GoBD; kanzleiinterne Arbeitshinweise.",
    keywords: /gobd|verfahrensdokumentation|belegprinzip|unveränderbarkeit|datenzugriff|z1\s|z2\s|z3\s/i,
    references: ["BMF-Schreiben GoBD", "§ 145 ff. AO", "§ 147 Abs. 6 AO", "§ 238 ff. HGB"],
    body: `Die GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff) sind ein BMF-Schreiben. Sie konkretisieren, wie elektronische Buchführung und digitale Belegverarbeitung aus Sicht der Finanzverwaltung ordnungsgemäß und prüfbar sein müssen.

1) Für wen relevant
- Alle Buchführungs- und Aufzeichnungspflichtigen (HGB, AO, EStG).
- Auch EÜR-Fälle, wenn Aufzeichnungen elektronisch geführt werden.
- Praktisch: jede Kanzlei, jeder Mandant mit DATEV Unternehmen online, jede Kasse, jedes Vorsystem.

2) Kernanforderungen
- Nachvollziehbarkeit und Nachprüfbarkeit
- Vollständigkeit
- Richtigkeit
- zeitgerechte Erfassung
- Ordnung
- Unveränderbarkeit
- Belegfunktion ("keine Buchung ohne Beleg")

3) Verfahrensdokumentation
- Pflicht: schriftliche Beschreibung aller IT-gestützten Prozesse rund um steuerrelevante Daten.
- Inhalte: allgemeine Beschreibung, Anwender-/Technik-Dokumentation, Betriebsdokumentation, internes Kontrollsystem.
- Muss jederzeit prüfbar sein und mit der gelebten Praxis übereinstimmen.

4) Unveränderbarkeit / Belegprinzip
- Einmal erfasste Buchungen und archivierte Belege dürfen nicht unbemerkt geändert werden.
- Änderungen sind protokolliert und nachvollziehbar (Journal, Versionierung).
- Belege sind im Ursprungsformat revisionssicher zu archivieren.

5) Datenzugriff (§ 147 Abs. 6 AO)
- Z1: unmittelbarer Zugriff der Finanzverwaltung auf das System (read-only).
- Z2: mittelbarer Zugriff – Auswertung durch das Unternehmen.
- Z3: Datenträgerüberlassung (z. B. GDPdU-/IDEA-Export).

6) Typische Kanzlei-Prüfpunkte
- Liegt eine aktuelle Verfahrensdokumentation vor?
- Werden digitale Belege unveränderbar archiviert (z. B. DATEV Unternehmen online, DMS)?
- Gibt es ein Kassensystem oder Vorsystem? TSE vorhanden?
- Werden Belege zeitnah erfasst (Belegdatum vs. Buchungsdatum)?
- Ist der Datenzugriff für eine Betriebsprüfung möglich (Export, Berechtigungen)?
- Aufbewahrungsfristen (i. d. R. 10 Jahre Buchungsbelege, 6 Jahre Handels-/Geschäftsbriefe) eingehalten?

Hinweis: GoBD-Verstöße können zur Verwerfung der Buchführung und zu Hinzuschätzungen führen (§ 162 AO). Frühzeitige Dokumentation und revisionssichere Archivierung sind die wichtigste Prävention.`,
  },
  {
    id: "erbschaftsteuer-merksaetze",
    title: "Erbschaftsteuer & Bewertung — Merksätze",
    short:
      "Erbanfall, Vor-/Nacherbschaft, Nachlassverbindlichkeiten, Familienheim, nicht notierte Anteile und Grundbesitzbewertung.",
    category: "Jahresabschluss",
    source: "Internes Handout — ErbSt / EStG / Bilanzierung / UmwStG.",
    keywords: /erbanfall|vorerbe|nacherbe|nachlassverbindlich|familienheim|gemischte schenkung|erbfallkostenpauschale|gemeiner wert|substanzwert|grundbesitzwert|ertragswertverfahren|bodenrichtwert|denkmalgeschützt/i,
    references: [
      "§§ 1, 3, 6, 7, 9, 10, 11, 12, 13, 20 ErbStG",
      "§§ 11, 151, 182–198 BewG",
      "§ 1922 BGB",
    ],
    body: `1) Erwerb von Todes wegen
- Erbanfall durch Gesamtrechtsnachfolge (§§ 1922 BGB, 1 Abs. 1 Nr. 1, 3 Abs. 1 Nr. 1 ErbStG).
- ErbSt entsteht mit dem Tod des Erblassers (§ 9 Abs. 1 Nr. 1 ErbStG); Bewertungsstichtag ist der Todestag (§ 11 ErbStG).
- Unbeschränkte Steuerpflicht bei Inländer­eigenschaft (§ 2 Abs. 1 ErbStG).
- Steuerschuldner ist der Erwerber (§ 20 Abs. 1 ErbStG).
- Steuerpflichtiger Erwerb = Bereicherung (Vermögensanfall ./. abzugsfähige Nachlassverbindlichkeiten, § 10 Abs. 1 ErbStG).

2) Vor-/Nacherbe & Nachlassverbindlichkeiten
- Steuerlich gilt nur der Vorerbe als Erbe (§ 6 Abs. 1 ErbStG); der Nacherbe erwirbt steuerlich vom Vorerben (§ 6 Abs. 2 S. 1 ErbStG).
- Abzugsfähig nur Schulden, die vom Erblasser herrühren und ihn wirtschaftlich belastet haben (§ 10 Abs. 5 Nr. 1 ErbStG).
- Betagte Vermächtnisse (fällig erst mit Tod des Beschwerten) wie Nacherbschaft behandelt (§ 6 Abs. 4 ErbStG); beim ersten Erbfall keine wirtschaftliche Belastung.
- Erbfallkostenpauschale 10.300 € ohne Nachweis (§ 10 Abs. 5 Nr. 3 S. 2 ErbStG).

3) Schenkung & Familienheim
- Freigebige Zuwendung = Vermögensmehrung beim Bedachten + Vermögens­minderung beim Zuwendenden (§ 7 Abs. 1 Nr. 1 ErbStG).
- Gemischte Schenkung wird bei Wertabweichung > ca. 20–25 % zur Gegenleistung vermutet.
- Familienheim­begünstigung setzt Eigentum oder Miteigentum (auch Gesamthand in GbR) voraus (§ 13 Abs. 1 Nr. 4a–c ErbStG).

4) Nicht notierte Anteile & Grundbesitz
- Nicht notierte Anteile: gemeiner Wert (§ 11 Abs. 2 BewG); Substanzwert als Mindestwert (§ 11 Abs. 2 S. 3 BewG).
- Gesonderte Feststellung nach § 151 Abs. 1 S. 1 Nr. 3 BewG.
- Betriebsgrundstücke: gesondert festgestellte Grundbesitzwerte (§ 12 Abs. 3 ErbStG).
- Gemischt genutzte Grundstücke (weder Wohn- noch Gewerbe > 80 %): Ertragswertverfahren (§ 182 Abs. 3 Nr. 2 BewG).
- Bodenwert = Fläche × angepasster Bodenrichtwert (§ 184 Abs. 2 BewG).
- Mietabweichung > 20 %: übliche Miete zwingend (§ 186 Abs. 2 BewG); Leerstand → übliche Miete ansetzen.
- Umlagefähige Betriebskosten nicht im Rohertrag (§ 186 Abs. 1 S. 2 BewG).
- Reinertrag = Rohertrag ./. pauschale Bewirtschaftungskosten (§ 187 BewG); Gebäudereinertrag = Reinertrag ./. Bodenwertverzinsung (§ 185 Abs. 2 BewG); Gebäudeertragswert = Gebäudereinertrag × Vervielfältiger (§ 185 Abs. 3 BewG).
- Ertragswert = Boden + Gebäudeertragswert (§ 184 Abs. 3 BewG); Bodenwert als Mindestwert, niedrigerer gemeiner Wert nur mit Nachweis (§ 198 BewG).
- 85 % steuerfrei: denkmalgeschützt, unrentierlich, der Allgemeinheit zugänglich (§ 13 Abs. 1 Nr. 2 ErbStG).`,
  },
  {
    id: "betriebsaufgabe-euer",
    title: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    short:
      "Aufgabeerklärung (§ 16 Abs. 3b EStG), Übergang zur Bilanzierung, Fünftelregelung und Behandlung der stillen Reserven.",
    category: "Jahresabschluss",
    source: "Internes Handout — EStG / Betriebsaufgabe.",
    keywords: /betriebsaufgabe|aufgabeerklärung|aufgabegewinn|übergangsgewinn|fünftelregel|teilwert|einlage aus privatvermögen|§\s*16\s*estg|§\s*18\s*abs\.?\s*3\s*estg|§\s*34\s*estg/i,
    references: [
      "§ 4 Abs. 1, 3 EStG",
      "§ 6 Abs. 1 Nr. 5 EStG",
      "§ 11 EStG",
      "§ 15 Abs. 1 EStG",
      "§ 16 Abs. 3, 3b EStG",
      "§ 18 Abs. 3 EStG",
      "§ 34 Abs. 1, 2 Nr. 1 EStG",
      "§§ 7, 8, 9 GewStG",
    ],
    body: `1) Gewerbebetrieb & EÜR
- Einzelhandel ist regelmäßig Gewerbebetrieb (§ 15 Abs. 1 S. 1 Nr. 1 EStG); EÜR nach § 4 Abs. 3 EStG mit Zu-/Abflussprinzip (§ 11 EStG).
- Gewerbeertrag = Gewinn (§ 7 GewStG) zzgl. Hinzurechnungen (§ 8 GewStG), abzgl. Kürzungen (§ 9 GewStG).

2) Aufgabeerklärung
- Aufgabeerklärung wirkt nur bei rechtzeitigem Eingang beim Finanzamt (§ 16 Abs. 3b EStG); Rückwirkung scheitert bei Überschreiten der 3-Monatsfrist.

3) Übergang EÜR → Bilanzierung
- Forderungen erhöhen den Übergangsgewinn (kein Zufluss in EÜR, in der Bilanz zu aktivieren).
- Verbindlichkeiten mindern den Übergangsgewinn (kein Abfluss in EÜR, in der Bilanz zu passivieren).
- Bei Betriebsaufgabe zwingend Übergang zum Betriebsvermögensvergleich (§ 18 Abs. 3 S. 2 EStG) — Ziel: vollständige Erfassung stiller Reserven.

4) Aufgabegewinn
- Außerordentliche Einkünfte (§ 34 Abs. 2 Nr. 1 EStG), Fünftelregelung (§ 34 Abs. 1 EStG).
- Aufgabe = Veräußerung/Entnahme aller wesentlichen Betriebsgrundlagen (§ 16 Abs. 3 EStG); bei Freiberuflern über § 18 Abs. 3 EStG.
- Auch zeitnah entnommene Wirtschaftsgüter einbeziehen (§ 16 Abs. 3 S. 8 EStG).

5) Einlage & Teilwert
- Zuführung aus Privatvermögen = Einlage (§ 4 Abs. 1 S. 8 EStG).
- Mehr als 3 Jahre zwischen Anschaffung und Einlage → Teilwert zwingend (§ 6 Abs. 1 Nr. 5 S. 1 EStG); Teilwert ist neue AfA-Bemessungsgrundlage.

6) Arzt / Freiberufler
- Einkünfte aus selbständiger Arbeit (§ 18 Abs. 1 Nr. 1 EStG); keine Buchführungspflicht nach HGB (§§ 1, 238 HGB), EÜR zulässig.
- Steuerfreie Heilbehandlungen (§ 4 Nr. 14 UStG) führen zu Netto-Einnahmen.

7) GmbH-Anteile im Betriebsvermögen
- Subsidiarität (§ 20 Abs. 8 EStG): Dividenden sind Betriebseinnahmen, keine Kapitaleinkünfte.
- KapESt entfaltet im BV keine Abgeltungswirkung (§ 43 Abs. 5 S. 2 EStG).
- Teileinkünfteverfahren (§ 3 Nr. 40 EStG) bei Beteiligungen im BV.`,
  },
  {
    id: "bilanzierung-immaterielle-rueckstellungen",
    title: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    short:
      "Aktivierungs(verbot/wahlrecht), Herstellungskosten, FIFO/LIFO, drohende Verluste, latente Steuern, IAB, Sammelposten, Krypto.",
    category: "Jahresabschluss",
    source: "Internes Handout — Bilanzierung / IAB / Krypto / latente Steuern.",
    keywords: /immateriell|herstellungskosten|fifo|lifo|teilwertabschreibung|drohverlust|latente steuer|iab|investitionsabzugsbetrag|§\s*7g|sammelposten|krypto|§\s*274|§\s*248|§\s*249|§\s*255/i,
    references: [
      "§§ 246, 247, 248 Abs. 2, 249, 252, 255, 266, 274 HGB",
      "§ 5 Abs. 1, 2, 4a EStG",
      "§ 6 Abs. 1 Nr. 2, 2a, 5, 6 EStG",
      "§ 7 Abs. 1, 4 EStG",
      "§ 7g EStG",
      "§ 15 UStG",
      "BMF 10.05.2022 (Kryptowerte)",
    ],
    body: `1) Immaterielle WG / Herstellungskosten
- Aktivierungswahlrecht für selbst geschaffene immaterielle WG des AV handelsrechtlich (§ 248 Abs. 2 HGB); steuerlich Aktivierungsverbot (§ 5 Abs. 2 EStG) → passive latente Steuern (§ 274 HGB).
- Forschung nicht aktivierbar, Entwicklung aktivierbar (§ 255 Abs. 2a HGB).
- Vertriebskosten nie Teil der HK (§ 255 Abs. 2 S. 4 HGB); MEK/MGK/FEK/FGK Pflicht (§ 255 Abs. 2 HGB).

2) Vorräte
- FIFO steuerlich unzulässig, LIFO zulässig (§ 6 Abs. 1 Nr. 2a EStG); UV-Teilwertabschreibung als Wahlrecht (§ 6 Abs. 1 Nr. 2 S. 2 EStG).

3) Rückstellungen & schwebende Geschäfte
- Drohverluste handelsrechtlich Rückstellung (§ 249 Abs. 1 S. 1 HGB), steuerlich unzulässig (§ 5 Abs. 4a EStG).
- Schwebende Geschäfte werden nicht bilanziert, solange Leistung und Gegenleistung gleichwertig sind (Realisationsprinzip, § 252 Abs. 1 Nr. 4 HGB).

4) Latente Steuern (§ 274 HGB)
- Temporäre Differenz zwischen Handels- und Steuerbilanz × Steuersatz.
- Passive latente Steuern: Ansatzpflicht.
- Aktive latente Steuern: Ansatzwahlrecht.

5) IAB (§ 7g EStG)
- Rein steuerlich; Auflösung/Hinzurechnung fristgerecht, sonst Rückgängigmachung.
- Hinzurechnung/Übertragung max. 50 % der tatsächlichen Anschaffungskosten (netto).
- Geplante kürzere Nutzungsdauer ändert die AfA nicht (§ 7 Abs. 1, Abs. 4 EStG).

6) Sammelposten (§ 6 Abs. 2a EStG)
- Kein Einzelabgang; AfA stur 1/5 p. a. unabhängig von Schaden/Verkauf einzelner WG.

7) Vorsteuer & Anlagevermögen
- Aktivierung des AV und Passivierung der Verbindlichkeit bereits bei Erwerb (§ 246 HGB; § 5 EStG).
- Vorsteuerabzug bei ordnungsgemäßer Rechnung im Leistungs-/Rechnungszeitraum (§ 15 UStG), unabhängig von Zahlung.

8) Kryptowährungen
- Wirtschaftsgüter; Ansatz mit Anschaffungskosten (§§ 246 HGB, 5/6 EStG).
- Krypto-Zahlung oder Krypto-zu-Krypto = Tausch; Erlös = Marktwert der erhaltenen Gegenleistung (§ 6 Abs. 6 EStG; BMF 10.05.2022).`,
  },
  {
    id: "anteilstausch-umwstg",
    title: "Anteilstausch nach § 21 UmwStG",
    short:
      "Kein Rückwirkungszeitraum; Wertansatz gemeiner Wert vs. Buchwert; Voraussetzungen für Buchwertansatz.",
    category: "Jahresabschluss",
    source: "Internes Handout — UmwStG / Anteilstausch.",
    keywords: /anteilstausch|umwstg|§\s*21\s*umwstg|einbringung\s+(von\s+)?anteilen|buchwertansatz/i,
    references: ["§ 21 UmwStG", "§§ 2, 20 Abs. 5/6 UmwStG"],
    body: `1) Zeitpunkt / Rückwirkung
- Steuerlich wirkt der Anteilstausch ab Übergang Nutzen und Lasten — keine Rückwirkung wie bei Verschmelzungen (§§ 2, 20 Abs. 5/6 UmwStG gelten nicht).

2) Wertansatz
- Grundsatz: gemeiner Wert bei der übernehmenden GmbH → beim Einbringenden Veräußerungsgewinn.
- Buchwertansatz auf Antrag möglich (§ 21 Abs. 1 S. 2 UmwStG), wenn die gesetzlichen Voraussetzungen nach Einbringung erfüllt sind (insb. mehrheitsvermittelnde Beteiligung, qualifizierter Anteilstausch).

3) Praxisfolgen
- Buchwertansatz = steuerneutral; gemeiner Wert = Veräußerungsgewinn mit Folgen für KSt/GewSt/ESt.
- 7-jährige Sperrfristen nach § 22 UmwStG bei nachfolgender Anteilsveräußerung beachten.`,
  },
  {
    id: "reverse-charge-grundschema",
    title: "Reverse Charge (§ 13b UStG) — Grundschema & Anwendungsfälle",
    short:
      "Leistender stellt netto, Empfänger schuldet die USt; Vorsteuerabzug gleichzeitig möglich.",
    category: "Umsatzsteuer",
    source: "Internes Handout — Rückstellungen / USt / Mitunternehmerschaft.",
    keywords: /§\s*13b|reverse[\s-]?charge|bauleistung\b|werklieferung\s+ausland|schrott|altgold|co2[\s-]?zertifikat|§\s*25b/i,
    references: [
      "§ 13b Abs. 1, 2 UStG",
      "§ 15 UStG",
      "§ 25b UStG",
      "UStAE 13b.1 ff.",
    ],
    body: `1) Grundschema
- Leistender Unternehmer stellt Netto-Rechnung mit Hinweis "Steuerschuldnerschaft des Leistungsempfängers".
- Leistungsempfänger schuldet die USt und kann sie bei Vorsteuerabzugsberechtigung zeitgleich abziehen (§ 15 UStG) → grundsätzlich liquiditätsneutral.

2) Anwendungsfälle (§ 13b Abs. 2 UStG)
- Nr. 1: Werklieferungen / sonstige Leistungen eines im Ausland ansässigen Unternehmers (i. V. m. § 13b Abs. 1 UStG für ig. sonstige Leistungen nach § 3a Abs. 2 UStG).
- Nr. 4: Bauleistungen, wenn der Empfänger selbst nachhaltig Bauleistungen erbringt.
- Nr. 5: Gas, Elektrizität, Wärme/Kälte unter besonderen Voraussetzungen.
- Nr. 7–11: Schrott, bestimmte Metalle, Altgold, Mobilfunkgeräte/Tablets ab Schwelle, CO₂-Zertifikate.
- Dreiecksgeschäfte: Vereinfachung nach § 25b UStG prüfen.

3) Beispiel Bauleistung
- Subunternehmer (Ausland) berechnet 50.000 € netto an deutschen Generalunternehmer (Bauleistender).
- Empfänger schuldet 9.500 € USt (§ 13b UStG) und zieht sie als Vorsteuer (§ 15 UStG) → liquiditätsneutral.`,
  },
  {
    id: "reihengeschaeft",
    title: "Reihengeschäft (§ 3 Abs. 6, 7 UStG)",
    short:
      "Mehrere Umsatzgeschäfte, eine Warenbewegung; nur eine Lieferung ist die bewegte, alle anderen ruhen.",
    category: "Umsatzsteuer",
    source: "Internes Handout — Reihengeschäft (UStAE 3.14).",
    keywords: /reihengeschäft|bewegte lieferung|ruhende lieferung|ustae 3\.14|§\s*3\s*abs\.?\s*6|§\s*3\s*abs\.?\s*7/i,
    references: [
      "§ 3 Abs. 6, 7 UStG",
      "§ 6a UStG",
      "UStAE 3.14 Abs. 3–11",
    ],
    body: `1) Voraussetzung
- Mehrere Unternehmer schließen Umsatzgeschäfte über denselben Gegenstand ab; nur eine Warenbewegung.

2) Zuordnung der bewegten Lieferung (UStAE 3.14)
- Nur eine Lieferung ist die bewegte (§ 3 Abs. 6 UStG); alle anderen sind ruhende Lieferungen (§ 3 Abs. 7 UStG).
- Maßgeblich, wer den Transport veranlasst:
  • Transport durch ersten Lieferer (A) → A→B bewegt.
  • Transport durch Zwischenhändler (B) → grundsätzlich A→B bewegt (Vermutung); B kann mit USt-IdNr. seines Abgangslandes die bewegte Lieferung auf B→C verlagern.
  • Transport durch letzten Abnehmer (C) → B→C bewegt.

3) Ortsbestimmung
- Bewegte Lieferung: Beginn der Beförderung/Versendung.
- Ruhende Lieferung: Ort der Verschaffung der Verfügungsmacht.

4) Steuerbefreiung
- Bewegte Lieferung kann als innergemeinschaftliche Lieferung (§ 6a UStG) steuerfrei sein, wenn die Voraussetzungen (USt-IdNr., belegmäßige Nachweise, ZM) erfüllt sind.
- Ruhende Lieferung regelmäßig im jeweiligen Belegenheitsstaat steuerbar.

5) Beispiel A → B → C, Transport durch B ins EU-Ausland
- A → B: bewegte Lieferung, Ort DE, ig. Lieferung (§ 6a UStG).
- B → C: ruhende Lieferung, Ort im EU-Bestimmungsland, dort steuerbar.`,
  },
  {
    id: "mitunternehmerschaft",
    title: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    short:
      "Initiative + Risiko; gesonderte und einheitliche Feststellung; Sonder- und Ergänzungsbilanzen.",
    category: "Jahresabschluss",
    source: "Internes Handout — Mitunternehmerschaft.",
    keywords: /mitunternehmer|mitunternehmerschaft|sonderbilanz|ergänzungsbilanz|gesamthandsbilanz|§\s*15\s*abs\.?\s*1\s*nr\.?\s*2|atypisch still|kommanditist|komplementär/i,
    references: [
      "§ 15 Abs. 1 Nr. 2 EStG",
      "§ 180 AO",
      "§§ 118, 166 HGB",
    ],
    body: `1) Voraussetzungen
- Mitunternehmerinitiative (Geschäftsführung / Kontrollrechte, §§ 118, 166 HGB) und
- Mitunternehmerrisiko (Beteiligung an Gewinn, Verlust und stillen Reserven incl. Firmenwert).
- Beides muss grundsätzlich kumulativ erfüllt sein.

2) Typische Fälle
- OHG, KG, GbR, atypisch stille Gesellschaft.
- Komplementär: Initiative (+), Risiko (+).
- Kommanditist: Initiative über Kontrollrechte (§ 166 HGB), Risiko über Gewinn-/Verlustbeteiligung; kann Mitunternehmer sein.
- Typisch stiller Gesellschafter: regelmäßig kein Mitunternehmer.

3) Rechtsfolgen
- Einkünfte aus Gewerbebetrieb (§ 15 Abs. 1 Nr. 2 EStG).
- Gesonderte und einheitliche Feststellung (§ 180 AO).
- Steuerliches Gesamtergebnis = Gesamthandsbilanz + Sonderbilanzen + Ergänzungsbilanzen.

4) Sonder- vs. Ergänzungsbilanz
- Sonderbilanz: Wirtschaftsgüter im Sonderbetriebsvermögen (z. B. an die Gesellschaft überlassenes Grundstück, Gesellschafterdarlehen). Sonderbetriebseinnahmen/-ausgaben (Miete, AfA, Zinsen) erhöhen/mindern den Gewinnanteil des jeweiligen Gesellschafters.
- Ergänzungsbilanz: individuelle Korrektur der Wertansätze in der Gesamthandsbilanz für einzelne Gesellschafter (z. B. Mehr-/Minderzahlung beim Eintritt) → spezielle AfA nur bei diesem Gesellschafter.`,
  },
  {
    id: "npo-ruecklagen-pruefhinweise",
    title: "NPO — Rücklagen, Audit-Risiken und offene Punkte",
    short:
      "Konkrete Planung, projektbezogene/Investitions-/Infrastruktur-/Audit-Rücklagen, Darlegungslast, Nachforderungen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes NPO-Arbeitspapier — Rücklagen, offene Punkte, Nachweise.",
    keywords: /projektbezogene rücklage|investitionsrücklage|ersatzbeschaffungsrücklage|infrastrukturrücklage|audit[-\s]?rücklage|rückforderung|darlegungslast|rücklagenspiegel|offene punkte|nachforderung|krankenversicherung\s+verein|fahrtenbuch\s+verein/i,
    references: [
      "§ 55 Abs. 1 Nr. 5 AO",
      "§ 62 Abs. 1 Nr. 1–4 AO",
      "§ 63 Abs. 4 AO",
    ],
    body: `1) Grundsatz / Darlegungslast
- Die Körperschaft trägt die Darlegungslast für die Voraussetzungen jeder Rücklagenbildung.
- Mit Ausnahme der freien Rücklage (§ 62 Abs. 1 Nr. 3 AO) müssen Rücklagen auf konkrete, geplante und satzungsgemäße Zwecke bezogen sein.
- Erforderlich: Beschluss, konkreter Zweck, Zeitplan, Kostenrahmen, Umsetzungsstand, transparente Abbildung in Rücklagenspiegel und MVR.

2) Projektbezogene Rücklage
- Zulässig für konkrete satzungsgemäße Projekte — auch wenn Erstattung (z. B. Fördermittel) beantragt ist, sofern Durchführung glaubhaft und Mittel in angemessenem Zeitraum benötigt werden.
- Auflösung, sobald Grund entfällt oder Erstattung erfolgt.

3) Investitions-/Ersatzbeschaffungsrücklage (§ 62 Abs. 1 Nr. 2 AO)
- Höhe grundsätzlich an der regulären AfA des zu ersetzenden WG orientiert.
- Höherer Bedarf nur mit Nachweis (Angebote, Kostenvoranschläge, Preissteigerungen, technische Anforderungen).

4) Infrastruktur-/Plattformrücklage
- Laufende Plattform-/Hosting-/Personalkosten → eher Betriebsmittelrücklage (§ 62 Abs. 1 Nr. 1 AO).
- Geplante technische Erneuerung / Systemumstellung → Investitions-/Ersatzbeschaffungsrücklage.
- Keine pauschale "Sicherheitsreserve" — konkret begründen.

5) Rücklage für Audit-/Rückforderungsrisiken
- Möglich als Betriebsmittelrücklage bei tatsächlicher Unsicherheit über Rückforderungen.
- Risikobetrag aus konkretem Fördervertrag, Erfahrungswerten und risikobehafteten Positionen herleiten — pauschale Prozentsätze sind kritisch.
- Bei hinreichend konkreter Verpflichtung Abgrenzung zur bilanziellen Rückstellung (§ 249 HGB) prüfen.

6) Offene Punkte / Nachforderungen
- Bei Zeitdruck dokumentierte Zwischenfreigabe mit klar benannten offenen Punkten besser als Stillstand.
- Typische Nachforderungen: Versicherungsbeleg/Beitragshöhe, Beschluss/Vertrag, Funktion der Person im Verein, Fahrzeug-Nutzungsvereinbarung & Fahrtenbuch, Darlehensvertrag, konkrete Investitions-/Erweiterungsplanung.

7) Merksätze
- Rücklage nur stehen lassen, wenn Zweck, Planung, Beschluss und Dokumentation belastbar sind.
- Nicht auf die Bezeichnung des Belegs schauen, sondern auf den wirtschaftlichen Charakter der Zahlung.
- Übernahme personenbezogener Kosten (z. B. KV-Beiträge) ohne klare Grundlage = Risiko für Mittelverwendung, Vergütung, Lohnsteuer und SV.`,
  },
  {
    id: "reverse-charge-npo",
    title: "Reverse Charge bei gemeinnützigen Körperschaften (§ 13b UStG)",
    short:
      "Steuerfalle für NPOs bei Leistungsbezug aus dem Ausland — Zusammenspiel §§ 2, 3a, 13b UStG; auch ideeller Bereich betroffen.",
    category: "Umsatzsteuer",
    source: "von Maydell, npoR 2022, 190 — kanzleiintern aufbereitet.",
    keywords: /reverse[-\s]?charge.*(verein|gemeinn|npo|ggmbh|stiftung)|gemeinn.*reverse|§\s*13b.*(verein|gemeinn|ideell)|ust[-\s]?idnr.*verein|leistung.*ausland.*verein/i,
    references: [
      "§ 13b UStG",
      "§ 3a Abs. 1, 2 UStG",
      "§ 2 UStG",
      "§ 19 UStG",
      "§ 15 Abs. 2 S. 1 Nr. 1 UStG",
      "Abschn. 13b.1 Abs. 1 UStAE",
    ],
    body: `1) Kerngedanke
- Bei sonstigen Leistungen eines im Ausland ansässigen Unternehmers an einen inländischen Unternehmer verlagert § 3a Abs. 2 UStG den Leistungsort ins Inland; § 13b UStG verlagert die Steuerschuld auf den Leistungsempfänger (Reverse Charge).
- Gilt seit 2011 ausdrücklich auch dann, wenn die Leistung für den nichtunternehmerischen / ideellen Bereich einer gemeinnützigen Körperschaft bezogen wird, sofern die Körperschaft im Übrigen Unternehmerin ist oder eine USt-IdNr. verwendet (§ 3a Abs. 2 S. 3 UStG).

2) Unternehmereigenschaft der NPO (§ 2 UStG)
- Unternehmerisch tätig regelmäßig im steuerpflichtigen wirtschaftlichen Geschäftsbetrieb, im Zweckbetrieb und in Teilen der Vermögensverwaltung.
- Schon eine geringe unternehmerische Tätigkeit reicht für die Eigenschaft als Unternehmer und damit für § 3a Abs. 2 UStG.

3) Häufige Fehleinschätzungen
- "Wir sind gemeinnützig, also keine USt" — falsch. § 13b greift auch bei steuerfreien Umsätzen und bei Kleinunternehmern (§ 19 UStG) der inländischen NPO.
- Die Kleinunternehmerregelung gilt nicht für im Ausland ansässige Leistende (§ 13b Abs. 5 S. 8 UStG bezieht sich nur auf Inländer).
- Hat der ausländische Unternehmer fälschlich ausländische USt aufgeschlagen, bleibt die deutsche Steuerschuld bestehen; die ausländische USt erhöht nach h. M. sogar die Bemessungsgrundlage.

4) Vorsteuerproblem
- Vorsteuerabzug nach § 15 UStG nur, soweit die Eingangsleistung für steuerpflichtige Umsätze verwendet wird.
- Bei NPOs typischerweise (teilweiser) Ausschluss → die nach § 13b geschuldete USt wird zur echten Zusatzbelastung.

5) Typische Risikofälle
- Werbeleistungen großer Tech-Konzerne (z. B. Irland), Webseiten-/Agenturleistungen aus Drittstaaten, Cloud-/SaaS-Leistungen, Freelancer im Ausland.
- Bauleistungen ausländischer Unternehmer an inländischem Grundstück (§ 3a Abs. 3 Nr. 1 UStG) — immer USt im Inland.
- Projektpartner / Hilfsperson im Ausland (§ 57 Abs. 1 S. 2 AO) — Leistungsaustausch kann Reverse Charge auslösen.

6) USt-IdNr. nicht leichtfertig beantragen
- Bei nicht-unternehmerischen Körperschaften löst die bloße Verwendung der USt-IdNr. die Ortsverlagerung ins Inland und damit § 13b aus (§ 3a Abs. 2 S. 3 Hs. 1 UStG).

Merksatz: Gemeinnützigkeit schützt nicht vor § 13b UStG. Bei jedem Leistungsbezug aus dem Ausland prüfen: Wer ist Leistender? Ist die NPO Unternehmer / hat sie USt-IdNr.? Greift Reverse Charge? Vorsteuer möglich?`,
  },
  {
    id: "kooperation-57-abs-3-ao",
    title: "Servicegesellschaften & Kooperationen — § 57 Abs. 3 AO",
    short:
      "Planmäßiges Zusammenwirken gemeinnütziger Körperschaften, doppeltes Satzungserfordernis, EuGH-Vorlage des BFH (V R 22/23) und Alternativen (§ 4 Nr. 29 UStG).",
    category: "NPO / Gemeinnützigkeit",
    source: "Kanzleinotizen zu BFH-Beschluss vom 22.05.2025, V R 22/23.",
    keywords: /§\s*57\s*abs\.?\s*3|servicegesell|planmäßiges zusammenwirken|kostenteilungsgemeinschaft|§\s*4\s*nr\.?\s*29|arbeitsteilige gemeinn/i,
    references: [
      "§ 57 Abs. 1, 3 AO",
      "§§ 51–68 AO",
      "§ 4 Nr. 29 UStG",
      "Art. 132 Abs. 1 lit. f MwStSystRL",
      "Art. 107, 108 AEUV",
      "BFH 22.05.2025, V R 22/23",
      "FG Hamburg 26.09.2023, 5 K 11/23",
      "BFH 04.09.2024, XI R 37/21",
    ],
    body: `1) Grundsatz Unmittelbarkeit (§ 57 Abs. 1 AO)
- Steuerbegünstigte Zwecke sind grundsätzlich unmittelbar selbst zu verwirklichen.
- Ausnahmen: Hilfsperson (§ 57 Abs. 1 S. 2 AO) und seit JStG 2020 das planmäßige Zusammenwirken (§ 57 Abs. 3 AO).

2) § 57 Abs. 3 AO — planmäßiges Zusammenwirken
- Eine Körperschaft verfolgt steuerbegünstigte Zwecke auch dann unmittelbar, wenn sie satzungsgemäß durch planmäßiges Zusammenwirken mit mindestens einer weiteren steuerbegünstigten Körperschaft einen steuerbegünstigten Zweck verwirklicht.
- Eröffnet die Steuerbegünstigung reiner Servicegesellschaften (IT, Buchhaltung, Personal, Beschaffung, Reinigung).

3) "Doppeltes Satzungserfordernis"
- Finanzverwaltung (AEAO Nr. 8 zu § 57 Abs. 3 AO) verlangte die Verankerung sowohl in der Satzung der leistenden Servicegesellschaft als auch in den Satzungen der empfangenden Körperschaften.
- FG Hamburg (26.09.2023, 5 K 11/23) verwarf diese doppelte Satzungspflicht; nur die Satzung der leistenden Körperschaft muss die Kooperation aufnehmen.
- BFH hat die Frage im Beschluss vom 22.05.2025 (V R 22/23) nicht entschieden, tendiert aber der FG-Hamburg-Auffassung zu.

4) EuGH-Vorlage (BFH V R 22/23) — beihilferechtliches Risiko
- BFH zweifelt an der Vereinbarkeit von § 57 Abs. 3 AO mit Art. 107 AEUV; Bundesregierung hat keine Notifizierung nach Art. 108 Abs. 3 AEUV vorgenommen.
- Vorlagefragen: (1) staatliche Beihilfe? (2) neutralisieren §§ 55, 61 AO den selektiven Vorteil? (3) notifizierungspflichtige Neu-/Umgestaltungsbeihilfe?
- Bei Einstufung als unzulässige Beihilfe droht Durchführungsverbot und Rückforderung gewährter Steuervergünstigungen.

5) Handlungsempfehlungen
- Bestehende Strukturen: Risikoaudit, lückenlose Verrechnungspreis-Dokumentation (Fremdvergleich), ggf. Rückstellungen für mögliche Steuernachzahlungen, USt-Härtefallklauseln in Verträge.
- Neugründungen: vorrangig Kostenteilungsgemeinschaft nach § 4 Nr. 29 UStG (basiert auf Art. 132 Abs. 1 lit. f MwStSystRL; BFH 04.09.2024, XI R 37/21 bestätigt). Hybride Gestaltungen möglich (gGmbH, deren Satzung sowohl § 57 Abs. 3 AO als auch § 4 Nr. 29 UStG erfüllt).
- Allgemein: schriftliche Verträge, Kostenverteilungsschlüssel, Dokumentation der Selbstkosten.`,
  },
  {
    id: "darlehen-npo",
    title: "Darlehensvergabe durch gemeinnützige Organisationen",
    short:
      "Mittelherkunft entscheidend — zeitnah zu verwendende Mittel nur zur unmittelbaren Zweckverwirklichung; sonst nur aus freier Rücklage / Vermögen.",
    category: "NPO / Gemeinnützigkeit",
    source: "Internes Arbeitspapier — Darlehensvergabe NPO.",
    keywords: /darlehen.*(verein|gemeinn|npo|ggmbh|stiftung)|darlehensvergabe|kreditvergabe.*gemeinn|zinslos.*verein/i,
    references: [
      "§ 55 Abs. 1 Nr. 1, 5 AO",
      "§ 58 Nr. 1 AO",
      "§ 62 Abs. 1 Nr. 3 AO",
    ],
    body: `1) Grundsatz
- Darlehensvergabe ist als solche kein gemeinnütziger Zweck und darf nicht Hauptzweck der Satzung sein, kann aber als Mittel zur Zweckverwirklichung satzungsgemäß vorgesehen werden.
- Maßgeblich ist die Herkunft der eingesetzten Mittel.

2) Aus zeitnah zu verwendenden Mitteln (Spenden, Beiträge, Überschüsse aus Zweck-/wirtschaftlichen Geschäftsbetrieben)
- Grundsätzlich gemeinnützigkeitsschädlich, weil Mittel nicht endgültig verbraucht, sondern nur in eine Forderung umgewandelt werden.
- Ausnahmsweise unschädlich, wenn das Darlehen unmittelbar der Verwirklichung satzungsmäßiger Zwecke dient (z. B. Schuldnerberatung mit Ablösung von Bankschulden, Studienstipendien als Darlehen, Instrumentendarlehen an Nachwuchskünstler). Voraussetzung: zinslos oder zinsverbilligt (Unterscheidung zur gewerblichen Kreditvergabe) und Rückflüsse werden wieder zeitnah verwendet.
- An andere steuerbegünstigte Körperschaften: zulässig nach § 58 Nr. 1 AO, wenn die Empfänger-Körperschaft die Mittel ihrerseits zeitnah satzungsgemäß verwendet.

3) Aus nicht zeitnah zu verwendenden Mitteln (insb. freie Rücklage § 62 Abs. 1 Nr. 3 AO, sonstige Vermögenszuführungen)
- Darlehen als Vermögensanlage/-umschichtung sind zulässig.
- An nicht-gemeinnützige Empfänger (Mitarbeiter, gewerbliche Tochter): zwingend marktübliche Konditionen, insb. angemessene Verzinsung. Zinslose/begünstigte Darlehen wären unzulässige Mittelverwendung oder vGA und gefährden die Gemeinnützigkeit.
- Rückflüsse (Tilgung + Zinsen) müssen wieder zeitnah satzungsgemäß verwendet werden.

4) Freie Rücklage als Finanzierungsquelle
- Bildung ohne konkreten Zweck zulässig (§ 62 Abs. 1 Nr. 3 AO).
- Höchstens 1/3 des Überschusses der Vermögensverwaltung + 10 % der sonstigen zeitnah zu verwendenden Mittel pro Jahr; Nachholung in zwei Folgejahren möglich.
- Gesamthöhe unbegrenzt; keine zeitliche Verwendungspflicht.
- Bildung durch Beschluss des zuständigen Gremiums, dokumentiert im Jahresabschluss / Rücklagenspiegel.

Merksatz: Darlehen zur unmittelbaren Zweckverwirklichung → zinsgünstig/zinslos aus allen Mitteln; Darlehen als Vermögensanlage → nur aus freier Rücklage / Vermögen und zu marktüblichen Konditionen.`,
  },
  {
    id: "ust-grundpruefung",
    title: "Umsatzsteuer — Grundprüfung (Steuerbarkeit, Ort, Steuerschuldner)",
    short:
      "Prüffolge: Leistungsaustausch → Leistungsort → Steuerbefreiung → Bemessungsgrundlage → Steuersatz → Steuerschuldner → Entstehungszeitpunkt.",
    category: "Umsatzsteuer",
    source: "Internes Handout — USt-Grundprüfung.",
    keywords: /ust[-\s]?grundpr|umsatzsteuer.*pr(üfung|uefung)|steuerbarkeit|leistungsort|sollversteuerung|ort der lieferung/i,
    references: [
      "§ 1 Abs. 1 Nr. 1 UStG",
      "§ 3 Abs. 6, 7 UStG",
      "§ 3a UStG",
      "§ 4 UStG",
      "§ 10 Abs. 1 UStG",
      "§ 12 UStG",
      "§ 13 Abs. 1 Nr. 1 a UStG",
      "§ 13a Abs. 1 Nr. 1 UStG",
      "§ 13b UStG",
    ],
    body: `Prüffolge:
1) Leistungsaustausch — Leistung und Gegenleistung sind innerlich verknüpft (§ 1 Abs. 1 Nr. 1 UStG).
2) Leistungsort Inland — bewegte Lieferung: Beginn der Beförderung/Versendung (§ 3 Abs. 6 S. 1 UStG); ruhende Lieferung: Ort der Verschaffung der Verfügungsmacht (§ 3 Abs. 7 S. 1 UStG); sonstige Leistungen: § 3a UStG.
3) Steuerbefreiung — § 4 UStG (z. B. ig. Lieferung, Heilbehandlungen, Bankumsätze).
4) Bemessungsgrundlage — Entgelt (§ 10 Abs. 1 UStG).
5) Steuersatz — 19 % Regelsatz (§ 12 Abs. 1 UStG); 7 % ermäßigt (§ 12 Abs. 2 UStG).
6) Steuerschuldner — grundsätzlich der leistende Unternehmer (§ 13a Abs. 1 Nr. 1 UStG); Übergang bei § 13b UStG.
7) Entstehungszeitpunkt — bei Sollversteuerung: Ablauf des Voranmeldungszeitraums der Leistungsausführung (§ 13 Abs. 1 Nr. 1 a S. 1 UStG).`,
  },
  {
    id: "forderungen-ewb-pwb",
    title: "Kundenforderungen — Bewertung, EWB, PWB, USt-Korrektur",
    short:
      "Forderungen mit Nennwert; Einzelbewertung vor Pauschalwertberichtigung; bei PWB USt herausrechnen (§ 17 Abs. 2 UStG); Wertaufhellung beachten.",
    category: "Jahresabschluss",
    source: "Internes Handout — Forderungsbewertung und Wertaufhellung.",
    keywords: /einzelwertberichtigung|pauschalwertberichtigung|\bewb\b|\bpwb\b|delkredere|wertaufhellung|forderungsbewertung|§\s*17\s*abs\.?\s*2/i,
    references: [
      "§ 6 Abs. 1 Nr. 2 EStG",
      "§ 247 Abs. 2 HGB",
      "§ 252 Abs. 1 Nr. 3, 4 HGB",
      "§ 253 Abs. 1 S. 1 HGB",
      "§ 17 Abs. 2 Nr. 1 UStG",
      "R 6.1 Abs. 2 EStR",
    ],
    body: `1) Ansatz & Bewertung
- Kundenforderungen = Umlaufvermögen (R 6.1 Abs. 2 EStR i. V. m. § 247 Abs. 2 HGB).
- Ansatz mit Anschaffungskosten / Nennwert (§ 6 Abs. 1 Nr. 2 S. 1 EStG i. V. m. § 253 Abs. 1 S. 1 HGB).
- Kombination EWB + PWB zulässig (§ 252 Abs. 1 Nr. 3 HGB — Einzelbewertungsprinzip; zuerst einzeln, dann pauschal auf den Restbestand).

2) Einzelwertberichtigung (EWB)
- Konkret erkennbares Ausfallrisiko bei einzelnem Debitor (Insolvenz, Mahnverfahren, Bestreiten).
- USt-Korrektur erst bei tatsächlicher Uneinbringlichkeit (§ 17 Abs. 2 Nr. 1 UStG) — Reduktion auf Nettowert.

3) Pauschalwertberichtigung (PWB)
- Allgemeines Ausfallrisiko auf Basis eines nachgewiesenen Erfahrungssatzes (§ 252 Abs. 1 Nr. 4 HGB).
- USt ist herauszurechnen (insoweit ist bei späterem Ausfall ein USt-Erstattungsanspruch zu erwarten, § 17 Abs. 2 Nr. 1 UStG).

4) Wertaufhellung
- Bis zur Bilanzaufstellung bekannt gewordene werterhellende Tatsachen sind zu berücksichtigen (§ 252 Abs. 1 Nr. 4 HGB).
- PWB ist auf den Betrag zu begrenzen, für den am Bilanzstichtag tatsächlich noch ein Ausfallrisiko besteht.

Prüfpunkte: Forderungsbestand abgestimmt? Konkrete Risiken einzelner Debitoren? Erfahrungssatz nachweisbar und plausibel? USt bei PWB herausgerechnet? Werterhellende Tatsachen bis zur Bilanzerstellung berücksichtigt?`,
  },
  {
    id: "rhb-vorratsbewertung",
    title: "Roh-, Hilfs- und Betriebsstoffe — Bewertung & Verbrauchsfolgen",
    short:
      "Umlaufvermögen; Anschaffungskosten; gewogener Durchschnitt zulässig; LIFO steuerlich anerkannt, FIFO nur handelsrechtlich.",
    category: "Jahresabschluss",
    source: "Internes Handout — RHB / Vorratsbewertung.",
    keywords: /roh-,?\s?hilfs-?\s?(und|&)?\s?betriebsstoffe|\brhb\b|vorratsbewertung|gewogener durchschnitt|verbrauchsfolge|§\s*256\s*hgb/i,
    references: [
      "§ 240 Abs. 1, 4 HGB",
      "§ 247 Abs. 2 HGB",
      "§ 253 Abs. 1 S. 1 HGB",
      "§ 256 HGB",
      "§ 5 Abs. 1 S. 1 EStG",
      "§ 6 Abs. 1 Nr. 2 EStG",
      "§ 6 Abs. 1 Nr. 2a EStG",
    ],
    body: `1) Ansatz
- RHB sind Umlaufvermögen (R 6.1 Abs. 2 EStR i. V. m. § 247 Abs. 2 HGB).
- Bewertung mit Anschaffungskosten (§ 6 Abs. 1 Nr. 2 S. 1 EStG i. V. m. § 253 Abs. 1 S. 1 HGB).
- Mangels spezieller steuerlicher Bewertungsregel: handelsrechtlicher Wertansatz wird grundsätzlich in die Steuerbilanz übernommen (§ 5 Abs. 1 S. 1 EStG).

2) Vereinfachungsverfahren
- Bestand zum Bilanzstichtag aus Inventur + Zugängen − Entnahmen (§ 240 Abs. 1 HGB).
- Gewogener Durchschnitt zulässig (§ 240 Abs. 4 HGB i. V. m. § 256 S. 2 HGB) — handels- und steuerrechtlich.

3) Verbrauchsfolge
- Handelsrechtlich: FIFO oder LIFO (§ 256 S. 1 HGB).
- Steuerlich: nur LIFO (§ 6 Abs. 1 Nr. 2a EStG); FIFO nicht zulässig.

Merksatz: RHB = Umlaufvermögen, Bewertung regelmäßig mit Anschaffungskosten, Durchschnittsbewertung als sachgerechte Vereinfachung.`,
  },
  {
    id: "aenderung-173a-ao",
    title: "Änderung nach § 173a AO — Schreib- und Rechenfehler",
    short:
      "Zwingende Änderung von Steuerbescheiden bei rechtserheblichen Schreib-/Rechenfehlern des Steuerpflichtigen — nur innerhalb der Festsetzungsfrist.",
    category: "Buchhaltung",
    source: "Internes Handout — AO § 173a / Festsetzungsfrist.",
    keywords: /§\s*173a|schreibfehler|rechenfehler|festsetzungsfrist|§\s*169|§\s*170/i,
    references: [
      "§ 173a AO",
      "§ 169 Abs. 1, Abs. 2 S. 1 Nr. 2 AO",
      "§ 170 Abs. 2 Nr. 1 AO",
    ],
    body: `1) Voraussetzungen § 173a AO
- Schreib- oder Rechenfehler des Steuerpflichtigen bei Erstellung der Steuererklärung.
- Dadurch unzutreffende Mitteilung rechtserheblicher Tatsachen.
- Rechtserheblich, wenn das FA bei Kenntnis mit an Sicherheit grenzender Wahrscheinlichkeit anders festgesetzt hätte.
- Rechtsfolge: zwingende Änderung (kein Ermessen).

2) Festsetzungsfrist
- Reguläre Frist ESt: 4 Jahre (§ 169 Abs. 2 S. 1 Nr. 2 AO).
- Anlaufhemmung bei Abgabe einer Erklärung: Beginn mit Ablauf des Kalenderjahres der Abgabe (§ 170 Abs. 2 Nr. 1 AO).
- Beispiel ESt 2017, abgegeben 2018: Beginn 31.12.2018, Ende regulär 31.12.2022.

Merksatz: § 173a AO korrigiert Schreib-/Rechenfehler — aber nur, wenn rechtserheblich und die Festsetzungsfrist noch läuft.`,
  },
{
  id: "fristen-berechnung-ao",
  title: "Fristen im Steuerrecht: Arten, Berechnung und Wiedereinsetzung",
  short:
    "Überblick über Fristen und Termine im Besteuerungsverfahren, behördliche und gesetzliche Fristen, Fristbeginn, Fristdauer, Fristende, Bekanntgabefiktion, Zahlungsschonfrist und Wiedereinsetzung in den vorigen Stand.",
  category: "Abgabenordnung",
  source:
    "Abgabenordnung und Bürgerliches Gesetzbuch sowie Lehrbuchauszug „Fristen“, S. 54–58; Rechtsstand 2026",
  keywords:
    /fristen?|fristberechnung|fristbeginn|fristdauer|fristende|termin|ereignisfrist|beginnfrist|einspruchsfrist|monatsfrist|bekanntgabe|bekanntgabefiktion|vier.?tages.?fiktion|zahlungsschonfrist|säumniszuschlag|wiedereinsetzung|ausschlussfrist|wochenende|feiertag/i,
  references: [
    "§ 108 AO",
    "§ 109 AO",
    "§ 110 AO",
    "§ 122 Abs. 2 und 2a AO",
    "§ 149 AO",
    "§ 169 AO",
    "§ 193 BGB",
    "§§ 187–188 BGB",
    "§ 224 AO",
    "§ 240 Abs. 3 AO",
    "§ 355 AO"
  ],
  body: `
## 1. Begriff der Frist

Eine **Frist** ist ein abgegrenzter, bestimmter oder zumindest bestimmbarer Zeitraum, innerhalb dessen eine Handlung vorgenommen werden muss oder eine Rechtswirkung eintreten kann.

Beispiele:

- Einspruchsfrist von einem Monat
- Steuererklärungsfrist
- Zahlungsfrist
- Festsetzungsfrist
- Zahlungsverjährungsfrist
- Aufbewahrungsfrist

Ein **Termin** ist dagegen ein bestimmter Zeitpunkt, an dem eine Handlung vorzunehmen ist oder eine Rechtswirkung eintritt.

### Unterschied

| Frist | Termin |
|---|---|
| Zeitraum | bestimmter Zeitpunkt |
| Beispiel: ein Monat nach Bekanntgabe | Beispiel: Abgabe bis zum 31. Juli |
| Das Fristende kann sich unter den Voraussetzungen des § 108 Abs. 3 AO verschieben | Ein ausdrücklich von der Behörde gesetzter Termin ist grundsätzlich auch dann einzuhalten, wenn er auf einen Samstag, Sonntag oder Feiertag fällt |

Für die Berechnung steuerlicher Fristen verweist § 108 Abs. 1 AO grundsätzlich auf die §§ 187 bis 193 BGB.

---

## 2. Arten von Fristen

Die Abgabenordnung unterscheidet insbesondere zwischen **behördlichen Fristen** und **gesetzlichen Fristen**.

### 2.1 Behördliche Fristen

Behördliche Fristen werden im Einzelfall durch die Finanzbehörde festgelegt.

Beispiele:

- Frist zur Beantwortung eines Auskunftsersuchens
- Frist zur Einreichung bestimmter Unterlagen
- Frist zur Erfüllung einer behördlichen Aufforderung

Behördliche Fristen können nach § 109 AO grundsätzlich verlängert werden. Unter bestimmten Voraussetzungen ist auch eine rückwirkende Verlängerung einer bereits abgelaufenen Frist möglich.

Die Verlängerung sollte rechtzeitig und unter Angabe nachvollziehbarer Gründe beantragt werden.

---

### 2.2 Gesetzliche Fristen

Gesetzliche Fristen werden unmittelbar durch den Gesetzgeber bestimmt.

Beispiele:

- Einspruchsfrist nach § 355 AO
- Steuererklärungsfristen nach § 149 AO
- Festsetzungsfristen nach § 169 AO
- Zahlungsverjährungsfristen nach § 228 AO
- Zahlungsschonfrist nach § 240 Abs. 3 AO

Gesetzliche Fristen können grundsätzlich nur verlängert werden, wenn das Gesetz dies ausdrücklich zulässt.

### Verlängerbare gesetzliche Fristen

Bestimmte gesetzliche Fristen können aufgrund einer gesetzlichen Ermächtigung verlängert werden. Hierzu können insbesondere Fristen zur Einreichung von Steuererklärungen gehören.

### Nicht verlängerbare Fristen

Bestimmte gesetzliche Fristen sind nicht verlängerbar. Dazu gehören insbesondere:

- Einspruchsfrist nach § 355 AO
- Festsetzungsfrist nach § 169 AO
- Zahlungsschonfrist nach § 240 Abs. 3 AO

Eine versäumte Einspruchsfrist kann daher nicht einfach durch einen Fristverlängerungsantrag verlängert werden.

Kommt jedoch eine unverschuldete Fristversäumnis in Betracht, ist die Wiedereinsetzung in den vorigen Stand nach § 110 AO zu prüfen.

---

## 3. Grundschema der Fristberechnung

Bei jeder Fristberechnung sind drei Fragen zu beantworten:

1. **Wann beginnt die Frist?**
2. **Wie lange dauert die Frist?**
3. **Wann endet die Frist?**

Das Prüfungsschema lautet:

**Beginn der Frist**

**+ Dauer der Frist**

**= Ende der Frist**

Anschließend ist zu prüfen, ob das errechnete Fristende auf einen Samstag, Sonntag oder gesetzlichen Feiertag fällt.

---

## 4. Beginn der Frist

Das BGB unterscheidet zwischen **Ereignisfristen** und **Beginnfristen**.

### 4.1 Ereignisfrist

Bei einer Ereignisfrist wird die Frist durch ein bestimmtes Ereignis ausgelöst.

Beispiele:

- Bekanntgabe eines Steuerbescheids
- Zugang einer Mahnung
- Zustellung einer Entscheidung

Der Tag des Ereignisses wird bei der Berechnung nicht mitgerechnet.

Die Frist beginnt mit Ablauf des Tages, an dem das Ereignis eingetreten ist.

Rechtsgrundlage: § 187 Abs. 1 BGB.

### Beispiel

Ein Steuerbescheid wird am 10. März bekannt gegeben.

Der 10. März ist der Ereignistag und wird nicht mitgerechnet.

Die Frist beginnt mit Ablauf des 10. März. Der erste volle Tag der Frist ist der 11. März.

Die Einspruchsfrist nach § 355 AO ist eine Ereignisfrist.

---

### 4.2 Beginnfrist

Bei einer Beginnfrist ist der Beginn eines bestimmten Tages für den Fristlauf maßgebend.

Der Anfangstag wird bei der Berechnung mitgerechnet.

Rechtsgrundlage: § 187 Abs. 2 BGB.

Beispiele:

- Fristberechnung für Vorauszahlungen
- Berechnung des Lebensalters
- Fristen, die ausdrücklich mit Beginn eines bestimmten Tages laufen

---

## 5. Dauer der Frist

Fristen können nach unterschiedlichen Zeiteinheiten bestimmt sein.

### Tagesfristen

Beispiele:

- Zahlungsschonfrist nach § 240 Abs. 3 AO
- bestimmte behördliche Bearbeitungsfristen

### Wochenfristen

Beispiele:

- behördlich gesetzte Zahlungs- oder Vorlagefristen
- Mahnfristen
- Vollstreckungsschutzfristen

### Monatsfristen

Beispiele:

- Einspruchsfrist nach § 355 AO
- Wiedereinsetzungsfrist nach § 110 Abs. 2 AO

### Jahresfristen

Beispiele:

- Festsetzungsfristen nach §§ 169 ff. AO
- Zahlungsverjährungsfristen nach §§ 228 ff. AO
- Aufbewahrungsfristen

---

## 6. Ende der Frist

Das Fristende richtet sich nach der Dauer der jeweiligen Frist.

### 6.1 Tagesfristen

Eine nach Tagen bestimmte Frist endet mit Ablauf des letzten Tages der Frist um 24:00 Uhr.

Rechtsgrundlage: § 188 Abs. 1 BGB.

### Beispiel

Eine dreitägige Frist beginnt mit Ablauf des 10. September.

Die drei Fristtage sind:

1. 11. September  
2. 12. September  
3. 13. September  

Die Frist endet mit Ablauf des 13. September um 24:00 Uhr.

---

### 6.2 Wochenfristen

Eine nach Wochen bestimmte Ereignisfrist endet mit Ablauf des Tages der letzten Woche, der dieselbe Bezeichnung trägt wie der Ereignistag.

### Beispiel

Eine Mahnung wird am Freitag bekannt gegeben. Die Zahlungsfrist beträgt eine Woche.

Die Wochenfrist endet grundsätzlich am Freitag der folgenden Woche um 24:00 Uhr.

---

### 6.3 Monatsfristen

Eine nach Monaten bestimmte Ereignisfrist endet mit Ablauf des Tages des letzten Monats, der dieselbe Zahl trägt wie der Ereignistag.

### Beispiel

Ein Steuerbescheid wird am 11. Juni bekannt gegeben.

Die einmonatige Einspruchsfrist endet grundsätzlich mit Ablauf des 11. Juli um 24:00 Uhr.

Der Tag der Bekanntgabe wird dabei nicht als erster Fristtag mitgezählt. Für die Bestimmung des Fristendes bleibt seine Datumszahl jedoch maßgebend.

---

### 6.4 Fehlender entsprechender Kalendertag

Fehlt im letzten Monat der für das Fristende maßgebende Kalendertag, endet die Frist mit Ablauf des letzten Tages dieses Monats.

Rechtsgrundlage: § 188 Abs. 3 BGB.

### Beispiel

Ein Bescheid wird am 31. Januar bekannt gegeben.

Eine einmonatige Frist endet grundsätzlich am letzten Tag des Februars:

- in einem gewöhnlichen Jahr am 28. Februar,
- in einem Schaltjahr am 29. Februar.

---

## 7. Samstag, Sonntag und gesetzliche Feiertage

Fällt das Ende einer Frist auf einen:

- Samstag,
- Sonntag oder
- gesetzlichen Feiertag,

endet die Frist mit Ablauf des nächstfolgenden Werktags.

Rechtsgrundlage: § 108 Abs. 3 AO in Verbindung mit § 193 BGB.

### Beispiel

Das errechnete Ende einer Einspruchsfrist fällt auf einen Sonntag.

Die Einspruchsfrist endet daher erst mit Ablauf des folgenden Montags um 24:00 Uhr, sofern dieser Montag kein gesetzlicher Feiertag ist.

Bei Feiertagen ist auf den Ort abzustellen, an dem die Handlung vorzunehmen ist. Deshalb können auch landesspezifische Feiertage von Bedeutung sein.

### Achtung: Frist und behördlicher Termin unterscheiden

Die Verschiebungsregel gilt für das **Ende einer Frist**.

Ein ausdrücklich von einer Behörde gesetzter **Termin** ist nach § 108 Abs. 5 AO grundsätzlich auch dann einzuhalten, wenn er auf einen Samstag, Sonntag oder gesetzlichen Feiertag fällt.

---

## 8. Bekanntgabefiktion bei Steuerbescheiden

Ein schriftlicher Verwaltungsakt, der im Inland durch die Post übermittelt wird, gilt grundsätzlich am **vierten Tag nach der Aufgabe zur Post** als bekannt gegeben.

Auch ein elektronisch übermittelter Verwaltungsakt gilt grundsätzlich am **vierten Tag nach der Absendung** als bekannt gegeben.

Rechtsgrundlage: § 122 Abs. 2 und 2a AO.

> Ältere Lehrbücher und ältere Prüfungsfälle verwenden häufig noch eine Drei-Tages-Fiktion. Seit dem 1. Januar 2025 gilt grundsätzlich die Vier-Tages-Fiktion.

Der Tag der Aufgabe zur Post oder der elektronischen Absendung wird nicht mitgerechnet.

Fällt der vierte Tag auf einen Samstag, Sonntag oder gesetzlichen Feiertag, verschiebt sich der fingierte Bekanntgabetag nach § 108 Abs. 3 AO auf den nächstfolgenden Werktag.

### Beispiel

Ein Steuerbescheid wird am Dienstag, dem 01.09.2026, zur Post gegeben.

Berechnung:

- Aufgabe zur Post: Dienstag, 01.09.2026
- vierter Tag nach Aufgabe zur Post: Samstag, 05.09.2026
- Samstag: Verschiebung auf den nächsten Werktag
- Bekanntgabetag: Montag, 07.09.2026

Die Einspruchsfrist beginnt mit Ablauf des 07.09.2026.

Sie endet grundsätzlich mit Ablauf des 07.10.2026 um 24:00 Uhr.

Geht der Verwaltungsakt tatsächlich erst später zu, gilt der spätere Zugangstag. Im Zweifel muss die Finanzbehörde den Zugang und den Zeitpunkt des Zugangs nachweisen.

---

## 9. Einspruchsfrist

Der Einspruch ist nach § 355 Abs. 1 AO grundsätzlich innerhalb eines Monats nach Bekanntgabe des Verwaltungsakts einzulegen.

Die Einspruchsfrist ist eine:

- gesetzliche Frist,
- Monatsfrist,
- Ereignisfrist und
- grundsätzlich nicht verlängerbare Frist.

### Prüfungsschema

1. Datum der Aufgabe zur Post oder elektronischen Absendung feststellen.
2. Bekanntgabetag nach § 122 AO ermitteln.
3. Wochenende und Feiertage prüfen.
4. Fristbeginn mit Ablauf des Bekanntgabetages bestimmen.
5. Dauer von einem Monat berücksichtigen.
6. Fristende nach § 188 BGB bestimmen.
7. Erneut prüfen, ob das Fristende auf Samstag, Sonntag oder Feiertag fällt.

Der Einspruch muss spätestens bis 24:00 Uhr des letzten Tages bei der zuständigen Finanzbehörde eingegangen sein.

---

## 10. Zahlungsschonfrist

Nach § 240 Abs. 3 AO wird bei einer Säumnis von bis zu drei Tagen grundsätzlich kein Säumniszuschlag erhoben.

Diese drei Tage werden als **Zahlungsschonfrist** bezeichnet.

Die Zahlungsschonfrist beginnt erst nach Eintritt der Fälligkeit.

### Berechnung

1. Zunächst den Fälligkeitstag bestimmen.
2. Fällt die gesetzliche Fälligkeit auf einen Samstag, Sonntag oder Feiertag, ist zunächst die Verschiebung auf den nächsten Werktag zu prüfen.
3. Erst danach werden die drei Tage der Zahlungsschonfrist berechnet.
4. Fällt der letzte Tag der Zahlungsschonfrist auf einen Samstag, Sonntag oder Feiertag, verschiebt sich auch dieses Fristende auf den nächsten Werktag.

### Beispiel

Eine Steuerzahlung wird am Mittwoch, dem 19. Juni, fällig.

Berechnung:

- Fälligkeit: Mittwoch, 19. Juni
- plus drei Tage Zahlungsschonfrist
- rechnerisches Ende: Samstag, 22. Juni
- Verschiebung auf den nächsten Werktag
- Ende der Zahlungsschonfrist: Montag, 24. Juni

Damit kein Säumniszuschlag entsteht, muss der Betrag bei einer Überweisung spätestens am letzten Tag der Zahlungsschonfrist auf dem Konto der Finanzbehörde gutgeschrieben sein.

Maßgeblich ist grundsätzlich nicht der Tag, an dem die Überweisung veranlasst wird, sondern der Tag der Gutschrift bei der Finanzbehörde.

Die Zahlungsschonfrist gilt nicht für die in § 224 Abs. 2 Nr. 1 AO genannten Zahlungsarten.

---

## 11. Wiedereinsetzung in den vorigen Stand

Wurde eine gesetzliche Frist versäumt, kann unter den Voraussetzungen des § 110 AO eine Wiedereinsetzung in den vorigen Stand gewährt werden.

Die Wiedereinsetzung bewirkt, dass die betroffene Person so behandelt wird, als hätte sie die Frist nicht versäumt.

### Voraussetzungen

Die Wiedereinsetzung setzt voraus, dass:

1. eine gesetzliche Frist versäumt wurde,
2. die betroffene Person ohne eigenes Verschulden an der Einhaltung gehindert war,
3. innerhalb eines Monats nach Wegfall des Hindernisses Wiedereinsetzung beantragt wird,
4. die Gründe glaubhaft gemacht werden und
5. die versäumte Handlung innerhalb der Antragsfrist nachgeholt wird.

Das Verschulden eines gesetzlichen Vertreters oder Bevollmächtigten wird der vertretenen Person zugerechnet.

### Beispiele für mögliche Wiedereinsetzungsgründe

- plötzliche schwere Erkrankung
- unvorhersehbare stationäre Behandlung
- nachweisbarer technischer Ausfall ohne Ausweichmöglichkeit
- Naturereignisse oder höhere Gewalt
- fehlender oder erheblich verspäteter Zugang eines Verwaltungsakts

Eine bloße Arbeitsüberlastung, Unkenntnis der Rechtslage oder ein einfaches Vergessen reichen grundsätzlich nicht aus.

### Jahresfrist

Nach Ablauf eines Jahres seit dem Ende der versäumten Frist ist eine Wiedereinsetzung grundsätzlich ausgeschlossen.

Eine Ausnahme besteht, wenn die rechtzeitige Antragstellung aufgrund höherer Gewalt unmöglich war.

---

## 12. Kompaktes Prüfungsschema

Bei einer Klausur oder in der Praxis kann die Frist wie folgt geprüft werden:

### Schritt 1: Fristart bestimmen

- gesetzliche oder behördliche Frist?
- Tages-, Wochen-, Monats- oder Jahresfrist?
- Ereignisfrist oder Beginnfrist?
- verlängerbar oder nicht verlängerbar?

### Schritt 2: Auslösendes Ereignis bestimmen

Zum Beispiel:

- Bekanntgabe des Steuerbescheids
- Eingang einer Aufforderung
- Eintritt der Fälligkeit

### Schritt 3: Bekanntgabe berechnen

Bei Postübermittlung im Inland und elektronischer Übermittlung grundsätzlich vier Tage nach Absendung.

### Schritt 4: Fristbeginn bestimmen

Bei Ereignisfristen wird der Ereignistag nicht mitgerechnet.

### Schritt 5: Fristdauer hinzufügen

Zum Beispiel ein Monat bei der Einspruchsfrist.

### Schritt 6: Fristende bestimmen

Bei Monatsfristen ist grundsätzlich die Zahl des Ereignistages maßgebend.

### Schritt 7: Wochenende und Feiertage prüfen

Fällt das Fristende auf Samstag, Sonntag oder Feiertag, endet die Frist grundsätzlich am nächsten Werktag.

### Schritt 8: Fristversäumnis prüfen

Bei einer versäumten gesetzlichen Frist ist eine Wiedereinsetzung nach § 110 AO zu prüfen.

---

## Merksätze

- **Ereignistag nicht mitzählen.**
- **Fristbeginn + Fristdauer = Fristende.**
- **Monatsfristen enden grundsätzlich an dem Tag mit derselben Datumszahl.**
- **Fehlt dieser Tag, endet die Frist am letzten Tag des Monats.**
- **Samstag, Sonntag oder Feiertag am Fristende: nächster Werktag.**
- **Seit 2025 gilt grundsätzlich die Vier-Tages-Bekanntgabefiktion.**
- **Die Einspruchsfrist beträgt einen Monat und ist nicht verlängerbar.**
- **Die Zahlungsschonfrist beträgt drei Tage.**
- **Bei unverschuldeter Versäumung einer gesetzlichen Frist: Wiedereinsetzung prüfen.**
`
},
  {
    id: "ust-karussell-gutglaube",
    title: "Umsatzsteuerkarussell & Vertrauensschutz beim Vorsteuerabzug",
    short:
      "Vorsteuerabzug bleibt für gutgläubige Unternehmer erhalten — entfällt bei Wissen/Wissen-müssen um Einbeziehung in MwSt-Betrug.",
    category: "Umsatzsteuer",
    source: "Weimann, Umsatzsteuer in der Praxis, 15. Aufl. — kanzleiintern aufbereitet.",
    keywords: /karussell|missing trader|gutglaubensschutz|gutgläubig|vertrauensschutz.*vorsteuer|mwst[-\s]?betrug|wissen müssen.*umsatz/i,
    references: [
      "§ 15 UStG",
      "EuGH 12.01.2006, C-354/03 u. a. (Optigen)",
      "EuGH 06.07.2006, C-439/04 u. C-440/04 (Kittel/Recolta)",
      "BFH 19.04.2007, V R 48/04, BStBl. II 2009, 315",
    ],
    body: `1) Grundsatz
- Jeder Umsatz einer Lieferkette ist eine eigenständige wirtschaftliche Tätigkeit (Optigen).
- Der Vorsteuerabzug eines redlichen Unternehmers bleibt erhalten, auch wenn ein vor- oder nachgelagerter Umsatz mit MwSt-Betrug behaftet ist, sofern der Unternehmer dies weder kannte noch kennen konnte.

2) Versagung bei Wissen / Wissen-müssen (Kittel)
- Der Vorsteuerabzug ist zu versagen, wenn objektive Umstände belegen, dass der Steuerpflichtige wusste oder hätte wissen müssen, dass er sich mit dem Erwerb an einem in eine MwSt-Hinterziehung einbezogenen Umsatz beteiligte.

3) Anforderungen an den "guten Glauben" (BFH V R 48/04)
- Unternehmer muss alle Maßnahmen treffen, die vernünftigerweise verlangt werden können, um sicherzustellen, dass seine Umsätze nicht in einen Betrug einbezogen sind.
- Feststellungslast für die Voraussetzungen des Vorsteuerabzugs trägt der den Abzug Begehrende — einschließlich des Nichtwissens vom Tatplan.

4) Praxis-Dokumentation
- Identitätsprüfung des Geschäftspartners (HR-Auszug, USt-IdNr.-Bestätigung qualifiziert nach § 18e UStG, Gewerbeanmeldung).
- Plausibilitätsprüfung bei ungewöhnlichen Preisen, neuen Lieferanten, Bar-/Drittlandzahlungen, häufig wechselnden Vorlieferanten.
- Belegnachweise (z. B. Gelangensbestätigung bei ig. Lieferungen, Ausfuhrnachweis).`,
  },
];

// Hilfsmittel für die Wissensbasis-Suche (analyze.ts)
export function findKnowledgeEntry(text: string): KBEntry | null {
  for (const e of KNOWLEDGE_BASE) if (kbKeywordsToRegExp(e.keywords).test(text)) return e;
  return null;
}
