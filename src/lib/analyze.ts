export type Risk = "gruen" | "gelb" | "rot";

export type AnswerMode =
  | "kurz"
  | "pruefnotiz"
  | "mandant"
  | "rueckfrage"
  | "buchung";

export const ANSWER_MODES: { id: AnswerMode; label: string }[] = [
  { id: "kurz", label: "Kurze Antwort" },
  { id: "pruefnotiz", label: "Kanzleiinterne Prüfnotiz" },
  { id: "mandant", label: "Mandantenfreundliche Antwort" },
  { id: "rueckfrage", label: "Rückfragebrief" },
  { id: "buchung", label: "Buchungsvorschlag (DATEV)" },
];

export interface AnalysisInput {
  title: string;
  topic: string; // USt, NPO, SKR42 etc
  description: string;
}

export interface Analysis {
  risk: Risk;
  riskReason: string;
  summary: string;
  missing: string[];
  questions: string[];
  recommendation: string;
  answers: Record<AnswerMode, string>;
}

interface Rule {
  keywords: RegExp;
  topic?: string;
  risk: Risk;
  riskReason: string;
  summary: string;
  missing: string[];
  questions: string[];
  recommendation: string;
  datev: { konto: string; bezeichnung: string; skr: "SKR03" | "SKR04" | "SKR42" }[];
  tags: string[];
}

const RULES: Rule[] = [
  {
    keywords: /bewirtung|geschäftsessen|restaurant|teilnehmer/i,
    topic: "USt",
    risk: "gelb",
    riskReason:
      "Vorsteuerabzug und Betriebsausgabenabzug nur bei vollständiger Bewirtungsdokumentation (§ 4 Abs. 5 Nr. 2 EStG, § 15 UStG).",
    summary:
      "Bewirtungsaufwand mit potenziell unvollständiger Belegdokumentation. Zu prüfen sind Angemessenheit, Anlass, Teilnehmerangaben sowie Vorsteuerabzug.",
    missing: [
      "Namen und Funktion aller Teilnehmer (inkl. eigene Mitarbeitende)",
      "Konkreter geschäftlicher Anlass (nicht nur „Geschäftsessen“)",
      "Maschinell erstellte Rechnung mit Steuernummer / USt-ID des Restaurants",
      "Datum, Ort sowie Unterschrift des Bewirtenden",
    ],
    questions: [
      "Können Sie uns die vollständige Teilnehmerliste mit Funktion (Mitarbeitende vs. Geschäftspartner) übermitteln?",
      "Welcher konkrete geschäftliche Anlass lag dem Essen zugrunde?",
      "Liegt eine maschinell erstellte Restaurantrechnung mit ausgewiesener Umsatzsteuer vor?",
    ],
    recommendation:
      "70 % der Nettokosten als Betriebsausgabe (§ 4 Abs. 5 Nr. 2 EStG), 100 % Vorsteuerabzug bei ordnungsgemäßer Rechnung. Eigenbeleg nur ergänzend zulässig — Teilnehmerangaben zwingend nachfordern.",
    datev: [
      { konto: "4650", bezeichnung: "Bewirtungskosten (abzugsfähig 70 %)", skr: "SKR03" },
      { konto: "4654", bezeichnung: "Nicht abzugsfähige Bewirtungskosten (30 %)", skr: "SKR03" },
      { konto: "1576", bezeichnung: "Abziehbare Vorsteuer 19 %", skr: "SKR03" },
    ],
    tags: ["USt", "EStG", "Bewirtung"],
  },
  {
    keywords: /reverse[\s-]?charge|§\s*13b|ausland|eu-leistung/i,
    topic: "USt",
    risk: "gelb",
    riskReason:
      "Reverse-Charge-Verfahren nach § 13b UStG erfordert korrekten Hinweis auf der Rechnung und Anmeldung der Steuerschuldnerschaft.",
    summary:
      "Leistung eines im Ausland ansässigen Unternehmers — Übergang der Steuerschuldnerschaft auf den Leistungsempfänger nach § 13b UStG zu prüfen.",
    missing: [
      "Sitz/USt-ID des leistenden Unternehmers",
      "Leistungsort nach § 3a UStG (B2B Empfängerortprinzip?)",
      "Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ auf Rechnung",
    ],
    questions: [
      "Hat der Leistungserbringer eine gültige ausländische USt-ID?",
      "Liegt die Rechnung ohne Umsatzsteuerausweis mit § 13b-Hinweis vor?",
    ],
    recommendation:
      "Bei B2B-Leistung aus EU/Drittland: USt nach § 13b UStG selbst berechnen, anmelden und gleichzeitig Vorsteuer ziehen. ZM-Meldung bei EU-Leistungen prüfen.",
    datev: [
      { konto: "3123", bezeichnung: "Sonstige Leistungen § 13b UStG 19 %", skr: "SKR03" },
      { konto: "1577", bezeichnung: "Abziehbare Vorsteuer § 13b UStG", skr: "SKR03" },
    ],
    tags: ["USt", "§ 13b", "Reverse-Charge"],
  },
  {
    keywords: /arap|aktive rechnungsabgrenzung|hosting|miete vorauszahlung|versicherung/i,
    topic: "Abgrenzung",
    risk: "gruen",
    riskReason:
      "Periodengerechte Abgrenzung nach § 250 HGB / § 5 Abs. 5 EStG — Standardvorgang ohne besonderes Risiko, sofern Zeitraum eindeutig.",
    summary:
      "Vorauszahlung für Zeitraum nach Bilanzstichtag — Bildung einer aktiven Rechnungsabgrenzung erforderlich.",
    missing: [
      "Exakter Leistungszeitraum (Beginn / Ende)",
      "Rechnungsbetrag netto und Steuerbetrag",
    ],
    questions: [
      "Welcher Leistungszeitraum ist auf der Rechnung ausgewiesen?",
      "Liegt der Betrag über der GWG-/Wesentlichkeitsgrenze der Kanzleirichtlinie?",
    ],
    recommendation:
      "Aufwand zeitanteilig auf die Perioden verteilen. Über ARAP (Konto 980 SKR03 / 1900 SKR04) abgrenzen, monatliche Auflösung über wiederkehrende Buchung einrichten.",
    datev: [
      { konto: "0980", bezeichnung: "Aktive Rechnungsabgrenzung", skr: "SKR03" },
      { konto: "4380", bezeichnung: "Fremdleistungen / EDV-Kosten", skr: "SKR03" },
    ],
    tags: ["Abgrenzung", "ARAP"],
  },
  {
    keywords: /verein|gemeinnützig|npo|mittelverwendung|zweckbetrieb|§\s*62|rücklage/i,
    topic: "NPO",
    risk: "gelb",
    riskReason:
      "Mittelverwendung und Rücklagenbildung sind formell streng geregelt (§§ 55, 62 AO). Verstöße gefährden die Gemeinnützigkeit.",
    summary:
      "Sachverhalt im Bereich gemeinnütziger Körperschaften — Sphärenzuordnung (ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) und Mittelverwendung zu prüfen.",
    missing: [
      "Zuordnung zu einer der vier Sphären",
      "Aktuelle Mittelverwendungsrechnung",
      "Rücklagenkatalog nach § 62 AO (freie Rücklage, zweckgebundene Rücklage)",
    ],
    questions: [
      "Welche Sphäre wird mit dem Sachverhalt berührt?",
      "Wurden die Mittel innerhalb der Zwei-Jahres-Frist nach § 55 Abs. 1 Nr. 5 AO verwendet?",
      "Soll eine Rücklage nach § 62 Abs. 1 Nr. 1–4 AO gebildet werden?",
    ],
    recommendation:
      "Sphärenzuordnung dokumentieren, Mittelverwendungsrechnung aktualisieren. Bei Rücklagenbildung schriftlichen Beschluss des zuständigen Organs einholen und im Anhang erläutern.",
    datev: [
      { konto: "8400", bezeichnung: "Erlöse Zweckbetrieb (SKR42)", skr: "SKR42" },
      { konto: "8500", bezeichnung: "Erlöse wirtschaftlicher Geschäftsbetrieb (SKR42)", skr: "SKR42" },
    ],
    tags: ["NPO", "AO", "SKR42"],
  },
  {
    keywords: /spende|spendenbescheinigung|zuwendungsbestätigung/i,
    topic: "NPO",
    risk: "gelb",
    riskReason:
      "Zuwendungsbestätigungen sind formgebunden (amtliches Muster). Fehler führen zum Ausschluss des Sonderausgabenabzugs beim Zuwendenden.",
    summary:
      "Ausstellung bzw. Prüfung einer Zuwendungsbestätigung nach § 50 EStDV. Form, Inhalt und Zuordnung sind sicherzustellen.",
    missing: [
      "Amtliches Muster (Geld- oder Sachzuwendung)",
      "Bestätigung der Mittelverwendung für satzungsmäßige Zwecke",
      "Bei Sachspenden: Nachweis des Wertansatzes",
    ],
    questions: [
      "Liegt das aktuelle amtliche Muster der Finanzverwaltung vor?",
      "Handelt es sich um eine Geld- oder Sachzuwendung?",
    ],
    recommendation:
      "Vereinfachten Zuwendungsnachweis bis 300 € prüfen (§ 50 Abs. 4 EStDV). Bei höheren Beträgen amtliches Muster verwenden und Spendenliste fortlaufend führen.",
    datev: [
      { konto: "2300", bezeichnung: "Spenden (Aufwand)", skr: "SKR03" },
    ],
    tags: ["NPO", "Spenden", "EStDV"],
  },
  {
    keywords: /opos|offene posten|mahnung|forderung/i,
    topic: "Buchhaltung",
    risk: "gruen",
    riskReason: "Operativer OPOS-Vorgang — Risiko nur bei Wertberichtigungs- oder Ausbuchungsbedarf.",
    summary: "Offene-Posten-Verwaltung — Abstimmung Debitoren/Kreditoren und ggf. Wertberichtigung.",
    missing: ["Mahnstufe", "Letzter Zahlungseingang", "Ausfallrisiko (Insolvenz, Bonität)"],
    questions: [
      "Welche Mahnstufe wurde zuletzt versendet?",
      "Liegen Hinweise auf Zahlungsunfähigkeit vor (Insolvenzantrag, SCHUFA, Auskunftei)?",
    ],
    recommendation:
      "Bei begründetem Ausfallrisiko Einzelwertberichtigung bilden. Endgültige Uneinbringlichkeit nach § 17 UStG mit Berichtigung der Umsatzsteuer.",
    datev: [
      { konto: "2400", bezeichnung: "Forderungsverluste", skr: "SKR03" },
      { konto: "1246", bezeichnung: "EWB auf Forderungen", skr: "SKR03" },
    ],
    tags: ["Buchhaltung", "OPOS"],
  },
];

const DEFAULT_RULE: Omit<Rule, "keywords" | "topic"> = {
  risk: "gelb",
  riskReason:
    "Sachverhalt erfordert weitere Angaben — eine abschließende Beurteilung ist ohne Rückfragen nicht möglich.",
  summary:
    "Allgemeiner steuerlicher Sachverhalt — strukturierte Aufarbeitung empfohlen. Auf Vollständigkeit der Unterlagen und korrekte Sphären-/Kontenzuordnung achten.",
  missing: [
    "Vollständige Sachverhaltsbeschreibung",
    "Belege / Verträge im Original oder als PDF",
    "Beteiligte Parteien und Leistungszeitraum",
  ],
  questions: [
    "Können Sie den Sachverhalt mit Zeitraum und beteiligten Parteien näher beschreiben?",
    "Liegen alle zugehörigen Belege und Verträge vor?",
  ],
  recommendation:
    "Sachverhalt vollständig dokumentieren, Belege anfordern und anschließend rechtliche Würdigung vornehmen. Ggf. fachliche Zweitprüfung einplanen.",
  datev: [
    { konto: "1200", bezeichnung: "Bank", skr: "SKR03" },
    { konto: "1800", bezeichnung: "Privatentnahmen / Verrechnungskonto", skr: "SKR03" },
  ],
  tags: ["Allgemein"],
};

function pickRule(input: AnalysisInput): Rule {
  const text = `${input.title}\n${input.description}\n${input.topic}`;
  for (const r of RULES) if (r.keywords.test(text)) return r;
  return { keywords: /.*/, topic: input.topic, ...DEFAULT_RULE };
}

function buildAnswers(input: AnalysisInput, r: Rule): Record<AnswerMode, string> {
  const datevLines = r.datev
    .map((d) => `  ${d.skr} ${d.konto} — ${d.bezeichnung}`)
    .join("\n");
  const missingList = r.missing.map((m) => `- ${m}`).join("\n");
  const qList = r.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  return {
    kurz: `${r.summary}\n\nRisiko: ${riskLabel(r.risk)}. ${r.recommendation}`,
    pruefnotiz: `PRÜFNOTIZ — ${input.title}\n\nSachverhalt:\n${input.description.trim() || "(keine Beschreibung)"}\n\nRechtliche Würdigung:\n${r.summary}\n\nRisikoeinstufung: ${riskLabel(r.risk)}\nBegründung: ${r.riskReason}\n\nFehlende Angaben:\n${missingList}\n\nEmpfehlung:\n${r.recommendation}\n\nBearbeiter: ____________  Datum: ____________`,
    mandant: `Sehr geehrte Damen und Herren,\n\nvielen Dank für die Übermittlung des Sachverhalts „${input.title}“.\n\nNach einer ersten Sichtung können wir den Vorgang wie folgt einordnen: ${r.summary}\n\nDamit wir die Bearbeitung abschließen können, benötigen wir noch folgende Informationen:\n${missingList}\n\nSobald uns die Angaben vorliegen, setzen wir die Bearbeitung umgehend fort. Für Rückfragen stehen wir Ihnen jederzeit gern zur Verfügung.\n\nMit freundlichen Grüßen\nIhre Kanzlei`,
    rueckfrage: `Sehr geehrte/r Mandant/in,\n\nzur abschließenden Bearbeitung von „${input.title}“ bitten wir Sie um Beantwortung der folgenden Punkte:\n\n${qList}\n\nBitte senden Sie uns die Angaben zusammen mit den zugehörigen Belegen per E-Mail oder über das Mandantenportal zu.\n\nVielen Dank und freundliche Grüße\nIhre Kanzlei`,
    buchung: `BUCHUNGSVORSCHLAG (DATEV-Logik)\n\nSachverhalt: ${input.title}\nKontenrahmen: ${r.datev[0]?.skr ?? "SKR03"}\n\nVorgeschlagene Konten:\n${datevLines}\n\nHinweise:\n- Belegnummer fortlaufend vergeben\n- Buchungstext: kurz, eindeutig, mit Bezug zum Beleg\n- Steuerschlüssel nach Vorgang prüfen (z. B. 9 = 19 % VSt)\n\n${r.recommendation}`,
  };
}

export function riskLabel(r: Risk): string {
  return r === "gruen" ? "Grün (gering)" : r === "gelb" ? "Gelb (mittel)" : "Rot (hoch)";
}

export function analyze(input: AnalysisInput): Analysis {
  const r = pickRule(input);
  return {
    risk: r.risk,
    riskReason: r.riskReason,
    summary: r.summary,
    missing: r.missing,
    questions: r.questions,
    recommendation: r.recommendation,
    answers: buildAnswers(input, r),
  };
}
