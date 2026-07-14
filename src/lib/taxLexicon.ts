// Steuerlexikon — kompakte Begriffsantworten.
// Wird vor der allgemeinen Chat-Heuristik geprüft.

import type { ChatAnswer } from "./chatHeuristics";

type LexEntry = { aliases: string[]; answer: ChatAnswer };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[\s\-_.,;:!?'"„""»«()/\\]/g, "");

const PREFIXES = [
  "",
  "die",
  "der",
  "das",
  "ein",
  "eine",
  "einen",
  "wassind",
  "wassinddie",
  "wassinddas",
  "wassindder",
  "wassindeigentlich",
  "wassindeigentlichdie",
  "wasist",
  "wasistdie",
  "wasistder",
  "wasistdas",
  "wasisteine",
  "wasistein",
  "wasisteinen",
  "wasbedeutet",
  "wasbedeutetdie",
  "wasbedeutetder",
  "wasbedeutetdas",
  "wasbedeuteteine",
  "wasbedeutetein",
  "washeisst",
  "washeißt",
  "wofuersteht",
  "wofürsteht",
  "definitionvon",
  "definition",
  "erklaere",
  "erklär",
  "erklaer",
  "erkläre",
  "erklärmir",
  "erklaermir",
  "bittedefiniere",
  "definiere",
  "wasregelt",
  "wasregeltdie",
  "wasregeltder",
  "wasregeltdas",
];
const SUFFIXES = [
  "",
  "erklaeren",
  "erklären",
  "erklaerung",
  "erklärung",
  "definition",
  "bedeutung",
  "kurz",
  "kurzerklaeren",
  "kurzerklären",
];

function match(nq: string, aliases: string[]): boolean {
  for (const a of aliases) {
    const na = norm(a);
    if (!na) continue;
    for (const p of PREFIXES)
      for (const s of SUFFIXES) {
        if (nq === p + na + s) return true;
        if (nq === p + na + "s" + s) return true; // simple Plural
      }
  }
  return false;
}

const KB_LINK = { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" };

const LEXICON: LexEntry[] = [
  // --- Gesetze / Abkürzungen ---
  {
    aliases: ["AO", "Abgabenordnung"],
    answer: {
      kind: "info",
      summary:
        "AO – Abgabenordnung: zentrales Verfahrensgesetz des deutschen Steuerrechts. Sie regelt die grundlegenden Regeln des Besteuerungsverfahrens.",
      sections: [
        {
          title: "Was regelt die AO?",
          body:
            "Steuererklärungspflichten, Steuerbescheide, Festsetzungsfristen, Änderungsnormen (z. B. § 173, § 173a, § 175 AO), Außenprüfung, Einspruchsverfahren, Mitwirkungs- und Auskunftspflichten, Haftung sowie Gemeinnützigkeit (§§ 51 ff. AO).",
        },
        {
          title: "Warum kanzleirelevant?",
          body:
            "Relevant immer dann, wenn geprüft wird, ob ein Bescheid geändert werden kann, welche Fristen laufen, welche Pflichten Mandanten haben oder ob eine gemeinnützige Körperschaft die Voraussetzungen der §§ 51 ff. AO erfüllt.",
        },
        {
          title: "Typische AO-Themen",
          body:
            "Festsetzungsfrist, Änderung nach § 173a AO, Gemeinnützigkeit §§ 51 ff. AO, Mittelverwendung § 55 AO, Rücklagen § 62 AO, tatsächliche Geschäftsführung § 63 AO.",
        },
      ],
      nextStep:
        "steuerstoff ist eine Arbeitshilfe und ersetzt keine verbindliche steuerliche Beratung.",
      links: [KB_LINK],
      knowledge: "AO / Verfahrensrecht",
    },
  },
  {
    aliases: ["EStG", "Einkommensteuergesetz"],
    answer: {
      kind: "info",
      summary:
        "EStG – Einkommensteuergesetz: regelt die Besteuerung des Einkommens natürlicher Personen (sieben Einkunftsarten, § 2 EStG), Gewinnermittlung, Sonderausgaben, außergewöhnliche Belastungen und Tarif.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["UStG", "Umsatzsteuergesetz"],
    answer: {
      kind: "info",
      summary:
        "UStG – Umsatzsteuergesetz: regelt die Besteuerung von Lieferungen und sonstigen Leistungen (§ 1 UStG), Steuersätze (§ 12), Vorsteuerabzug (§ 15), Steuerschuld (§ 13, § 13b) und Meldepflichten (UStVA, ZM).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["KStG", "Körperschaftsteuergesetz"],
    answer: {
      kind: "info",
      summary:
        "KStG – Körperschaftsteuergesetz: regelt die Besteuerung des Einkommens juristischer Personen (insbes. GmbH, AG, Genossenschaften, Vereine). Tarif 15 % zzgl. SolZ; bei gemeinnützigen Körperschaften gelten §§ 5 Abs. 1 Nr. 9 KStG i. V. m. §§ 51 ff. AO.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["GewStG", "Gewerbesteuergesetz"],
    answer: {
      kind: "info",
      summary:
        "GewStG – Gewerbesteuergesetz: regelt die Besteuerung des Gewerbeertrags (Gewinn aus Gewerbebetrieb +/- Hinzurechnungen/Kürzungen, §§ 8, 9 GewStG). Steuermesszahl 3,5 % × Hebesatz der Gemeinde.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["ErbStG", "Erbschaftsteuergesetz", "Erbschaft- und Schenkungsteuergesetz"],
    answer: {
      kind: "info",
      summary:
        "ErbStG – Erbschaft- und Schenkungsteuergesetz: regelt Erbanfälle (§ 3) und Schenkungen unter Lebenden (§ 7), Bewertungsstichtag (§ 11), Freibeträge (§ 16), Steuerklassen (§ 15) und Verschonungen für Betriebsvermögen (§§ 13a/b).",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["BewG", "Bewertungsgesetz"],
    answer: {
      kind: "info",
      summary:
        "BewG – Bewertungsgesetz: einheitliche Bewertungsregeln für steuerliche Zwecke (gemeiner Wert § 9, Grundbesitzbewertung §§ 176 ff., Ertragswert-/Sachwertverfahren, Anteilsbewertung § 11 BewG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["UmwStG", "Umwandlungsteuergesetz"],
    answer: {
      kind: "info",
      summary:
        "UmwStG – Umwandlungsteuergesetz: steuerliche Behandlung von Umwandlungen, Einbringungen und Anteilstausch (z. B. § 20 Einbringung in KapG, § 21 Anteilstausch, § 24 Einbringung in PersG). Bewertungswahlrechte (Buchwert/Zwischenwert/gemeiner Wert).",
      links: [KB_LINK],
      knowledge: "Anteilstausch nach § 21 UmwStG",
    },
  },
  {
    aliases: ["HGB", "Handelsgesetzbuch"],
    answer: {
      kind: "info",
      summary:
        "HGB – Handelsgesetzbuch: Sonderrecht für Kaufleute. Drittes Buch (§§ 238 ff.) enthält die Vorschriften zur Handelsbilanz (GoB, Ansatz, Bewertung, Ausweis), die über § 5 EStG auch steuerlich gelten (Maßgeblichkeit).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["BGB", "Bürgerliches Gesetzbuch"],
    answer: {
      kind: "info",
      summary:
        "BGB – Bürgerliches Gesetzbuch: allgemeines Zivilrecht (Schuldrecht, Sachenrecht, Familienrecht, Erbrecht). Steuerlich relevant z. B. für Erbfolge (§§ 1922 ff.), Schenkung (§§ 516 ff.) und Vertragsauslegung.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["FGO", "Finanzgerichtsordnung"],
    answer: {
      kind: "info",
      summary:
        "FGO – Finanzgerichtsordnung: Verfahrensordnung der Finanzgerichtsbarkeit (Klage gegen Steuerbescheide nach erfolglosem Einspruch, Revision zum BFH).",
      links: [KB_LINK],
    },
  },
  // --- Buchhaltung / Sonstiges ---
  {
    aliases: ["EWB", "Einzelwertberichtigung"],
    answer: {
      kind: "info",
      summary:
        "Einzelwertberichtigung (EWB): Abwertung einzelner zweifelhafter Forderungen auf den voraussichtlich realisierbaren Wert; USt-Korrektur erst bei Uneinbringlichkeit (§ 17 UStG).",
      links: [KB_LINK],
      knowledge: "Kundenforderungen — Bewertung, EWB, PWB, USt-Korrektur",
    },
  },
  {
    aliases: ["PWB", "Pauschalwertberichtigung"],
    answer: {
      kind: "info",
      summary:
        "Pauschalwertberichtigung (PWB): pauschaler Abschlag (erfahrungsgemäß ca. 1 %) auf den nicht einzelwertberichtigten Forderungsbestand für allgemeines Ausfallrisiko. Steuerlich nur in angemessener Höhe anerkannt.",
      links: [KB_LINK],
      knowledge: "Kundenforderungen — Bewertung, EWB, PWB, USt-Korrektur",
    },
  },
  {
    aliases: ["Delkredere", "Delkredererisiko"],
    answer: {
      kind: "info",
      summary:
        "Delkredere: Ausfallrisiko bei Forderungen. Wird über Einzel- (EWB) oder Pauschalwertberichtigung (PWB) abgebildet.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Leistungsort", "Ort der Leistung", "Ort der sonstigen Leistung"],
    answer: {
      kind: "info",
      summary:
        "Leistungsort entscheidet, in welchem Staat eine Leistung umsatzsteuerbar ist. Grundregel B2B: Sitz des Empfängers (§ 3a Abs. 2 UStG). Grundregel B2C: Sitz des Leistenden (§ 3a Abs. 1 UStG). Zahlreiche Sonderregeln (§ 3a Abs. 3 ff., § 3b, § 3e UStG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Vermögensbindung"],
    answer: {
      kind: "info",
      summary:
        "Vermögensbindung (§ 55 Abs. 1 Nr. 4 AO): das Vermögen einer gemeinnützigen Körperschaft darf bei Auflösung oder Wegfall des steuerbegünstigten Zwecks nur für steuerbegünstigte Zwecke verwendet werden. Satzungsmäßige Festlegung zwingend (§ 61 AO).",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }, KB_LINK],
    },
  },
  {
    aliases: ["tatsächliche Geschäftsführung"],
    answer: {
      kind: "info",
      summary:
        "Tatsächliche Geschäftsführung (§ 63 AO): die tatsächliche Tätigkeit der gemeinnützigen Körperschaft muss den satzungsmäßigen Anforderungen entsprechen. Nachweis durch ordnungsgemäße Aufzeichnungen und Tätigkeitsbericht.",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }, KB_LINK],
    },
  },
  {
    aliases: ["GoBD", "GOBD", "die GoBD"],
    answer: {
      kind: "info",
      summary:
        "Die GoBD sind die Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff.",
      sections: [
        {
          title: "Inhalt",
          body:
            "Sie beschreiben Anforderungen an elektronische Buchführung, digitale Belege, Aufzeichnungen, Archivierung und Datenzugriff, damit diese aus Sicht der Finanzverwaltung ordnungsgemäß und prüfbar sind.",
        },
        {
          title: "Kernanforderungen",
          body:
            "Nachvollziehbarkeit und Nachprüfbarkeit, Vollständigkeit, Richtigkeit, zeitgerechte Erfassung, Ordnung, Unveränderbarkeit, Belegfunktion, Verfahrensdokumentation, Aufbewahrung elektronischer Unterlagen, Datenzugriff bei Prüfung (Z1/Z2/Z3).",
        },
        {
          title: "Kanzlei-Relevanz",
          body:
            "Besonders wichtig bei digitaler Buchführung, DATEV Unternehmen online, Kassenführung, Belegablage, Rechnungsarchivierung und Verfahrensdokumentation.",
        },
        {
          title: "Typische Prüfpunkte",
          body:
            "Gibt es eine Verfahrensdokumentation? Werden digitale Belege unveränderbar archiviert? Gibt es ein Kassen- oder Vorsystem? Werden Belege zeitnah erfasst? Ist der Datenzugriff für eine Prüfung möglich?",
        },
      ],
      nextStep: "GoBD-Checkliste oder Verfahrensdokumentation prüfen.",
      links: [KB_LINK],
      knowledge: "GoBD – digitale Buchführung und Aufbewahrung",
    },
  },
  {
    aliases: ["GoB"],
    answer: {
      kind: "info",
      summary:
        "GoB = Grundsätze ordnungsmäßiger Buchführung. Ungeschriebene und kodifizierte Regeln für eine ordnungsgemäße Handels- und Steuerbilanz (§ 238 ff. HGB, § 5 EStG).",
      sections: [
        {
          title: "Kernprinzipien",
          body:
            "Klarheit, Übersichtlichkeit, Vollständigkeit, Richtigkeit, Einzelbewertung, Stetigkeit, Vorsicht, Periodenabgrenzung, Belegprinzip ('keine Buchung ohne Beleg').",
        },
      ],
      links: [KB_LINK],
      knowledge: "Grundsätze ordnungsmäßiger Buchführung",
    },
  },
  {
    aliases: ["Verfahrensdokumentation"],
    answer: {
      kind: "info",
      summary:
        "Schriftliche Beschreibung aller IT-gestützten Prozesse rund um steuerrelevante Daten — Pflicht aus den GoBD.",
      sections: [
        {
          title: "Inhalt",
          body:
            "Allgemeine Beschreibung, Anwender-/Technik-Dokumentation, Betriebsdokumentation, Beschreibung des internen Kontrollsystems. Sie muss jederzeit prüfbar sein.",
        },
        {
          title: "Typische Bestandteile",
          body:
            "Belegerfassung, Belegablage, Archivierung, Datenzugriff, Berechtigungen, Änderungshistorie, Schnittstellen (z. B. Kasse, Rechnungseingang, DATEV).",
        },
      ],
      links: [KB_LINK],
      knowledge: "GoBD – digitale Buchführung und Aufbewahrung",
    },
  },
  {
    aliases: ["Belegprinzip"],
    answer: {
      kind: "info",
      summary:
        "'Keine Buchung ohne Beleg.' Jede Buchung muss durch einen Originalbeleg oder einen revisionssicher digitalisierten Beleg nachgewiesen sein.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Unveränderbarkeit"],
    answer: {
      kind: "info",
      summary:
        "GoBD-Anforderung: Einmal erfasste Buchungen und archivierte Belege dürfen nicht mehr unbemerkt geändert werden. Änderungen sind protokolliert und nachvollziehbar.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Datenzugriff", "Z1", "Z2", "Z3"],
    answer: {
      kind: "info",
      summary:
        "Datenzugriff der Finanzverwaltung (§ 147 Abs. 6 AO): Z1 = unmittelbarer Zugriff, Z2 = mittelbarer Zugriff (Auswertung durch Unternehmen), Z3 = Datenträgerüberlassung.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["DATEV"],
    answer: {
      kind: "info",
      summary:
        "DATEV eG: Genossenschaft der Steuerberater. Anbieter für Buchhaltungs-, Lohn- und Kanzleisoftware (DATEV Unternehmen online, Rechnungswesen, Eigenorganisation, eSteuern).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["OPOS", "Offene-Posten-Buchhaltung", "offene posten"],
    answer: {
      kind: "info",
      summary:
        "OPOS = Offene-Posten-Buchhaltung. Übersicht aller noch nicht ausgeglichenen Debitoren- und Kreditorenposten — Grundlage für Mahnwesen, Zahlungsläufe und Saldenabstimmung.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["SuSa", "Summen- und Saldenliste", "Summen und Saldenliste"],
    answer: {
      kind: "info",
      summary:
        "Summen- und Saldenliste: zeigt je Konto Eröffnungssaldo, Periodensumme Soll/Haben und Endsaldo. Wichtigste Auswertung für Plausibilität und Abschlussvorbereitung.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Kontenrahmen"],
    answer: {
      kind: "info",
      summary:
        "Systematische Gliederung aller Sachkonten. In Deutschland verbreitet: SKR03 (Prozessgliederungsprinzip), SKR04 (Abschlussgliederungsprinzip), SKR42 (NPO/Vereine, gGmbH, Stiftungen).",
      links: [{ label: "SKR-Konverter öffnen", to: "/skr-konverter" }, KB_LINK],
    },
  },
  {
    aliases: ["SKR03"],
    answer: {
      kind: "info",
      summary:
        "SKR03 — DATEV-Standardkontenrahmen nach Prozessgliederung (Beschaffung, Produktion, Verkauf). Klassen 0–9, weit verbreitet in Handel und Handwerk.",
      links: [{ label: "SKR-Konverter öffnen", to: "/skr-konverter" }, KB_LINK],
    },
  },
  {
    aliases: ["SKR04"],
    answer: {
      kind: "info",
      summary:
        "SKR04 — DATEV-Standardkontenrahmen nach Abschlussgliederung (folgt der HGB-Bilanz- und GuV-Struktur). Häufig bei Kapitalgesellschaften.",
      links: [{ label: "SKR-Konverter öffnen", to: "/skr-konverter" }, KB_LINK],
    },
  },
  {
    aliases: ["SKR42"],
    answer: {
      kind: "info",
      summary:
        "SKR42 — DATEV-Kontenrahmen für gemeinnützige Körperschaften (Vereine, gGmbH, Stiftungen). Bildet die vier Sphären (ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) ab.",
      links: [{ label: "SKR-Konverter öffnen", to: "/skr-konverter" }, KB_LINK],
      knowledge: "SKR42 — Sphären gemeinnütziger Körperschaften",
    },
  },
  {
    aliases: ["BU-Schlüssel", "BU Schlüssel", "Buchungsschlüssel"],
    answer: {
      kind: "info",
      summary:
        "BU-Schlüssel (Berichtigungs-/Umsatzsteuerschlüssel) in DATEV: kurze Codes, die bei einer Buchung automatisch USt-Sätze, Vorsteuer oder § 13b-Logik auslösen (z. B. 9 = 19 % USt, 8 = 7 % USt, 94 = § 13b).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Steuerschlüssel"],
    answer: {
      kind: "info",
      summary:
        "Schlüsselcode, der einer Buchung den passenden Umsatzsteuer-/Vorsteuersatz bzw. eine besondere USt-Behandlung (§ 13b, ig. Erwerb, steuerfrei) zuweist. In DATEV identisch mit dem BU-Schlüssel.",
      links: [KB_LINK],
    },
  },

  // --- Umsatzsteuer / Ertrag ---
  {
    aliases: ["USt", "Umsatzsteuer", "Mehrwertsteuer", "MwSt"],
    answer: {
      kind: "info",
      summary:
        "Umsatzsteuer (umgangssprachlich Mehrwertsteuer): Verkehrsteuer auf Lieferungen und sonstige Leistungen eines Unternehmers im Inland (§ 1 UStG). Regelsatz 19 %, ermäßigt 7 %.",
      sections: [
        {
          title: "Mechanik",
          body:
            "Unternehmer schuldet die USt, Vorsteuer aus Eingangsrechnungen ist abziehbar (§ 15 UStG). Differenz wird per UStVA gemeldet.",
        },
      ],
      links: [KB_LINK],
      knowledge: "Umsatzsteuer",
    },
  },
  {
    aliases: ["Vorsteuer"],
    answer: {
      kind: "info",
      summary:
        "Vorsteuer: in Eingangsrechnungen ausgewiesene Umsatzsteuer, die der Unternehmer von seiner eigenen USt-Schuld abziehen darf (§ 15 UStG) — Voraussetzung: ordnungsgemäße Rechnung und Bezug zum Unternehmen.",
      links: [KB_LINK],
      knowledge: "Umsatzsteuer",
    },
  },
  {
    aliases: ["UStVA", "Umsatzsteuervoranmeldung"],
    answer: {
      kind: "info",
      summary:
        "Umsatzsteuer-Voranmeldung: regelmäßige (monatlich/vierteljährlich) elektronische Meldung der USt-Zahllast an das Finanzamt (§ 18 UStG). Abgabe bis zum 10. des Folgemonats, ggf. mit Dauerfristverlängerung.",
      links: [KB_LINK],
      knowledge: "Umsatzsteuer",
    },
  },
  {
    aliases: ["ZM", "Zusammenfassende Meldung"],
    answer: {
      kind: "info",
      summary:
        "Zusammenfassende Meldung (§ 18a UStG): Meldung steuerfreier innergemeinschaftlicher Lieferungen und bestimmter Leistungen an USt-IdNr.-Empfänger im EU-Ausland — quartals- oder monatsweise.",
      links: [KB_LINK],
      knowledge: "Umsatzsteuer",
    },
  },
  {
    aliases: ["Reverse Charge", "Reverse-Charge", "§ 13b", "13b UStG"],
    answer: {
      kind: "info",
      summary:
        "Reverse Charge (§ 13b UStG): Steuerschuld geht auf den Leistungsempfänger über. Der Leistende stellt netto mit Hinweis 'Steuerschuldnerschaft des Leistungsempfängers' aus.",
      sections: [
        {
          title: "Typische Fälle",
          body:
            "Bauleistungen B2B, sonstige Leistungen aus dem EU-Ausland an deutsche Unternehmer, bestimmte Lieferungen (z. B. Schrott, Mobilfunk, Gold).",
        },
      ],
      links: [KB_LINK],
      knowledge: "Umsatzsteuer / 13b",
    },
  },
  {
    aliases: [
      "innergemeinschaftlicher Erwerb",
      "ig Erwerb",
      "ig. Erwerb",
      "iG-Erwerb",
    ],
    answer: {
      kind: "info",
      summary:
        "Innergemeinschaftlicher Erwerb (§ 1a UStG): Erwerb von Gegenständen aus dem EU-Ausland durch einen Unternehmer mit USt-IdNr. — USt im Inland, gleichzeitig Vorsteuerabzug möglich.",
      links: [KB_LINK],
      knowledge: "Umsatzsteuer",
    },
  },
  {
    aliases: ["OSS", "One-Stop-Shop"],
    answer: {
      kind: "info",
      summary:
        "One-Stop-Shop (§ 18j UStG): zentrales EU-Meldeverfahren für B2C-Fernverkäufe und bestimmte sonstige Leistungen — Abgabe einer Sammelmeldung beim BZSt statt Registrierung in jedem EU-Staat.",
      links: [KB_LINK],
      knowledge: "Umsatzsteuer",
    },
  },
  {
    aliases: ["EÜR", "Einnahmen-Überschuss-Rechnung", "Einnahmen Überschuss Rechnung"],
    answer: {
      kind: "info",
      summary:
        "Einnahmen-Überschuss-Rechnung (§ 4 Abs. 3 EStG): vereinfachte Gewinnermittlung für Nicht-Bilanzierer (Freiberufler, kleine Gewerbetreibende). Zufluss-/Abflussprinzip (§ 11 EStG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Bilanz"],
    answer: {
      kind: "info",
      summary:
        "Bilanz: Stichtagsbezogene Gegenüberstellung von Vermögen (Aktiva) und Kapital (Passiva) eines Unternehmens. Pflicht u. a. für Kaufleute (§ 242 HGB) und bilanzierende Steuerpflichtige (§ 5 EStG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Rückstellung"],
    answer: {
      kind: "info",
      summary:
        "Rückstellung (§ 249 HGB): Fremdkapital für ungewisse Verbindlichkeiten oder drohende Verluste — Höhe oder Fälligkeit sind ungewiss.",
      sections: [
        {
          title: "Beispiele",
          body:
            "Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung, Prozesskostenrückstellung, Rückstellung für ausstehende Rechnungen.",
        },
        {
          title: "Abgrenzung zur Rücklage",
          body:
            "Rücklage = Eigenkapital (zurückbehaltener Gewinn / Mittelbindung). Rückstellung = Fremdkapital (ungewisse Schuld).",
        },
      ],
      links: [KB_LINK],
      knowledge: "Rücklage — Grundlagen und Abgrenzungen",
    },
  },
  {
    aliases: ["Rücklage"],
    answer: {
      kind: "info",
      summary:
        "Rücklage: zurückbehaltenes Eigenkapital bzw. zweckgebundener oder freier Betrag. Je nach Kontext bilanzielle Rücklage (Gewinn-/Kapitalrücklage), steuerliche Spezialrücklage (z. B. § 6b EStG) oder gemeinnützigkeitsrechtliche Rücklage nach § 62 AO.",
      sections: [
        {
          title: "Wichtig",
          body:
            "Rücklage ≠ Rückstellung. Eine Rückstellung ist Fremdkapital für ungewisse Verbindlichkeiten.",
        },
      ],
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
        KB_LINK,
      ],
      knowledge: "Rücklage — Grundlagen und Abgrenzungen",
    },
  },
  {
    aliases: ["ARAP", "aktive Rechnungsabgrenzung", "aktiver Rechnungsabgrenzungsposten"],
    answer: {
      kind: "info",
      summary:
        "Aktiver Rechnungsabgrenzungsposten (§ 250 Abs. 1 HGB): Ausgabe vor dem Stichtag, die Aufwand für eine bestimmte Zeit nach dem Stichtag darstellt (z. B. vorausgezahlte Miete, Versicherung).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["PRAP", "passive Rechnungsabgrenzung", "passiver Rechnungsabgrenzungsposten"],
    answer: {
      kind: "info",
      summary:
        "Passiver Rechnungsabgrenzungsposten (§ 250 Abs. 2 HGB): Einnahme vor dem Stichtag, die Ertrag für eine bestimmte Zeit nach dem Stichtag darstellt (z. B. im Voraus erhaltene Miete).",
      links: [KB_LINK],
    },
  },

  // --- NPO ---
  {
    aliases: ["ideeller Bereich"],
    answer: {
      kind: "info",
      summary:
        "Ideeller Bereich: unmittelbare Verfolgung des Satzungszwecks ohne Gegenleistung (Spenden, echte Mitgliedsbeiträge, Zuschüsse). KSt- und GewSt-frei, kein Leistungsaustausch → grundsätzlich keine USt.",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }, KB_LINK],
      knowledge: "Die vier Sphären gemeinnütziger Körperschaften",
    },
  },
  {
    aliases: ["Zweckbetrieb"],
    answer: {
      kind: "info",
      summary:
        "Zweckbetrieb (§§ 65–68 AO): wirtschaftliche Tätigkeit, die eng und notwendig mit dem Satzungszweck verbunden ist. KSt-/GewSt-frei, USt regelmäßig 7 % (§ 12 Abs. 2 Nr. 8a UStG).",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }, KB_LINK],
      knowledge: "Die vier Sphären gemeinnütziger Körperschaften",
    },
  },
  {
    aliases: ["Vermögensverwaltung"],
    answer: {
      kind: "info",
      summary:
        "Vermögensverwaltung: passive Nutzung vorhandenen Vermögens (Zinsen, Mieten, Wertpapiererträge). KSt-/GewSt-frei; USt im Einzelfall (z. B. Vermietung mit Option § 9 UStG).",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }, KB_LINK],
      knowledge: "Die vier Sphären gemeinnütziger Körperschaften",
    },
  },
  {
    aliases: [
      "wirtschaftlicher Geschäftsbetrieb",
      "WGB",
      "wGB",
    ],
    answer: {
      kind: "info",
      summary:
        "Wirtschaftlicher Geschäftsbetrieb (§ 14 AO): marktbezogene Tätigkeit ohne unmittelbaren Zweckbezug (Verkauf, Sponsoring, Werbung, Gaststätte). USt 19 %, KSt/GewSt grundsätzlich pflichtig — Freigrenze 45.000 € Einnahmen (§ 64 Abs. 3 AO).",
      links: [{ label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" }, KB_LINK],
      knowledge: "Die vier Sphären gemeinnütziger Körperschaften",
    },
  },
  {
    aliases: ["Mittelverwendung", "zeitnahe Mittelverwendung"],
    answer: {
      kind: "info",
      summary:
        "Zeitnahe Mittelverwendung (§ 55 Abs. 1 Nr. 5 AO): Mittel einer gemeinnützigen Körperschaft müssen spätestens in den zwei auf den Zufluss folgenden Kalender-/Wirtschaftsjahren für satzungsmäßige Zwecke verwendet werden.",
      links: [
        { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
        KB_LINK,
      ],
      knowledge: "NPO / Mittelverwendung",
    },
  },
  {
    aliases: ["freie Rücklage"],
    answer: {
      kind: "info",
      summary:
        "Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO): bis zu 1/3 des Überschusses der Vermögensverwaltung + 10 % der sonstigen zeitnah zu verwendenden Mittel. Nicht ausgeschöpfte Beträge sind in den zwei Folgejahren nachholbar.",
      links: [
        { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
        KB_LINK,
      ],
      knowledge: "NPO / Mittelverwendung",
    },
  },
  {
    aliases: ["Rücklagenspiegel"],
    answer: {
      kind: "info",
      summary:
        "Rücklagenspiegel: tabellarische Übersicht aller Rücklagen einer gemeinnützigen Körperschaft (Art, Anfangsbestand, Zuführung, Auflösung, Endbestand). Dokumentations- und Prüfungsgrundlage für die Mittelverwendung.",
      links: [
        { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
        KB_LINK,
      ],
      knowledge: "NPO / Mittelverwendung",
    },
  },
  {
    aliases: ["Verwendungsüberhang"],
    answer: {
      kind: "info",
      summary:
        "Verwendungsüberhang: rechnerischer Saldo aus zeitnah zu verwendenden Mitteln ./. Verwendung ./. zulässigen Rücklagen ./. Vermögenszuführungen ./. Mittelvortrag. Ein positiver Wert ist Prüfanlass, führt aber nicht automatisch zum Verlust der Gemeinnützigkeit (§ 63 Abs. 4 AO).",
      links: [
        { label: "NPO-Prüfassistent öffnen", to: "/npo-pruefassistent" },
        KB_LINK,
      ],
      knowledge: "NPO / Mittelverwendung",
    },
  },

  // --- Erbschaftsteuer / Bewertung ---
  {
    aliases: ["Erbanfall"],
    answer: {
      kind: "info",
      summary:
        "Erbanfall: Übergang des Vermögens des Erblassers auf den Erben kraft Gesamtrechtsnachfolge mit dem Tod (§ 1922 BGB; § 3 Abs. 1 Nr. 1 ErbStG). ErbSt entsteht mit dem Tod (§ 9 Abs. 1 Nr. 1 ErbStG); Bewertungsstichtag ist der Todestag (§ 11 ErbStG).",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["Vorerbe", "Nacherbe", "Vorerbschaft", "Nacherbschaft"],
    answer: {
      kind: "info",
      summary:
        "Steuerlich gilt nur der Vorerbe als Erbe (§ 6 Abs. 1 ErbStG); der Nacherbe erwirbt steuerlich vom Vorerben (§ 6 Abs. 2 S. 1 ErbStG). Betagte Vermächtnisse werden wie Nacherbschaft behandelt (§ 6 Abs. 4 ErbStG).",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["Nachlassverbindlichkeit", "Nachlassverbindlichkeiten"],
    answer: {
      kind: "info",
      summary:
        "Abzugsfähig sind nur Schulden, die vom Erblasser herrühren und ihn wirtschaftlich belastet haben (§ 10 Abs. 5 Nr. 1 ErbStG). Erbfallkostenpauschale 10.300 € ohne Nachweis (§ 10 Abs. 5 Nr. 3 S. 2 ErbStG).",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["Familienheim", "Familienheim-Begünstigung"],
    answer: {
      kind: "info",
      summary:
        "Steuerbefreiung für das Familienheim (§ 13 Abs. 1 Nr. 4a–c ErbStG) — setzt Eigentum/Miteigentum (auch Gesamthand in GbR) und tatsächliche Selbstnutzung voraus; Behaltefrist 10 Jahre.",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["gemischte Schenkung"],
    answer: {
      kind: "info",
      summary:
        "Gemischte Schenkung: Wert der Zuwendung übersteigt die Gegenleistung deutlich (Faustregel > ca. 20–25 %). Steuerlich liegt insoweit eine freigebige Zuwendung (§ 7 Abs. 1 Nr. 1 ErbStG) vor.",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["gemeiner Wert"],
    answer: {
      kind: "info",
      summary:
        "Gemeiner Wert (§ 9 BewG): Preis, der im gewöhnlichen Geschäftsverkehr bei einer Veräußerung zu erzielen wäre. Für nicht notierte Anteile: § 11 Abs. 2 BewG mit Substanzwert als Mindestwert.",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["Substanzwert"],
    answer: {
      kind: "info",
      summary:
        "Substanzwert: Summe der Einzelwerte der WG abzgl. Schulden; bei nicht notierten Anteilen der Mindestwert (§ 11 Abs. 2 S. 3 BewG).",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },
  {
    aliases: ["Bodenrichtwert"],
    answer: {
      kind: "info",
      summary:
        "Vom Gutachterausschuss ermittelter durchschnittlicher Lagewert je m² Grundstücksfläche; Grundlage für die Bodenwertermittlung im Ertrags- und Sachwertverfahren (§ 184 Abs. 2 BewG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Ertragswertverfahren"],
    answer: {
      kind: "info",
      summary:
        "Bewertungsverfahren für Miet- und gemischt genutzte Grundstücke (§§ 182 Abs. 3, 184–188 BewG): Bodenwert + Gebäudeertragswert (Reinertrag ./. Bodenwertverzinsung × Vervielfältiger).",
      links: [KB_LINK],
      knowledge: "Erbschaftsteuer & Bewertung — Merksätze",
    },
  },

  // --- EStG / Bilanzierung ---
  {
    aliases: ["Betriebsaufgabe"],
    answer: {
      kind: "info",
      summary:
        "Betriebsaufgabe (§ 16 Abs. 3 EStG; bei Freiberuflern § 18 Abs. 3 EStG): Veräußerung/Entnahme aller wesentlichen Betriebsgrundlagen. Aufgabegewinn ist außerordentlich (§ 34 Abs. 2 Nr. 1 EStG) und nach Fünftelregelung (§ 34 Abs. 1 EStG) begünstigt.",
      links: [KB_LINK],
      knowledge: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    },
  },
  {
    aliases: ["Aufgabeerklärung"],
    answer: {
      kind: "info",
      summary:
        "Aufgabeerklärung (§ 16 Abs. 3b EStG): wirkt nur bei rechtzeitigem Eingang beim Finanzamt; Rückwirkung max. 3 Monate.",
      links: [KB_LINK],
      knowledge: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    },
  },
  {
    aliases: ["Übergangsgewinn"],
    answer: {
      kind: "info",
      summary:
        "Beim Wechsel von EÜR (§ 4 Abs. 3 EStG) zur Bilanzierung: Forderungen erhöhen, Verbindlichkeiten mindern den Übergangsgewinn. Ziel ist die vollständige Erfassung der bislang noch nicht berücksichtigten Geschäftsvorfälle.",
      links: [KB_LINK],
      knowledge: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    },
  },
  {
    aliases: ["Fünftelregelung", "Fünftelregel"],
    answer: {
      kind: "info",
      summary:
        "Fünftelregelung (§ 34 Abs. 1 EStG): Tarifglättung für außerordentliche Einkünfte (z. B. Aufgabegewinn, Veräußerungsgewinn, Entschädigungen).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Teilwert"],
    answer: {
      kind: "info",
      summary:
        "Teilwert (§ 6 Abs. 1 Nr. 1 S. 3 EStG): Betrag, den ein Erwerber des ganzen Betriebs für das einzelne WG ansetzen würde. Bei Einlage > 3 Jahre nach Anschaffung zwingend (§ 6 Abs. 1 Nr. 5 S. 1 EStG); neue AfA-Bemessungsgrundlage.",
      links: [KB_LINK],
      knowledge: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    },
  },
  {
    aliases: ["Einlage"],
    answer: {
      kind: "info",
      summary:
        "Einlage (§ 4 Abs. 1 S. 8 EStG): Zuführung von Wirtschaftsgütern aus dem Privat- in das Betriebsvermögen. Bewertung mit Teilwert, max. Anschaffungs-/Herstellungskosten bei Anschaffung innerhalb der letzten 3 Jahre (§ 6 Abs. 1 Nr. 5 EStG).",
      links: [KB_LINK],
      knowledge: "Betriebsaufgabe, EÜR-Übergang & Aufgabegewinn",
    },
  },
  {
    aliases: ["Teileinkünfteverfahren", "TEV"],
    answer: {
      kind: "info",
      summary:
        "Teileinkünfteverfahren (§ 3 Nr. 40 EStG): 40 % der Einnahmen aus Beteiligungen an Kapitalgesellschaften im Betriebsvermögen bleiben steuerfrei; korrespondierend 40 % der zugehörigen Aufwendungen nicht abziehbar (§ 3c Abs. 2 EStG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["IAB", "Investitionsabzugsbetrag"],
    answer: {
      kind: "info",
      summary:
        "Investitionsabzugsbetrag (§ 7g EStG): bis zu 50 % der voraussichtlichen Anschaffungs-/Herstellungskosten beweglicher abnutzbarer WG des AV außerbilanziell vorab abziehbar; Hinzurechnung/Übertragung max. 50 % der tatsächlichen AK (netto).",
      links: [KB_LINK],
      knowledge: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    },
  },
  {
    aliases: ["Sammelposten", "Pool-Abschreibung", "Poolabschreibung"],
    answer: {
      kind: "info",
      summary:
        "Sammelposten (§ 6 Abs. 2a EStG): GWG zwischen 250 € und 1.000 € werden gepoolt und über 5 Jahre linear (1/5 p. a.) abgeschrieben. Kein Einzelabgang bei Verkauf/Schaden.",
      links: [KB_LINK],
      knowledge: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    },
  },
  {
    aliases: ["FIFO"],
    answer: {
      kind: "info",
      summary:
        "First-in-first-out: Verbrauchsfolgeverfahren. Steuerlich nicht zulässig — nur LIFO ist steuerlich anerkannt (§ 6 Abs. 1 Nr. 2a EStG).",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["LIFO"],
    answer: {
      kind: "info",
      summary:
        "Last-in-first-out (§ 6 Abs. 1 Nr. 2a EStG): die zuletzt angeschafften/hergestellten WG gelten als zuerst verbraucht. Steuerlich zulässig bei gleichartigen WG des Vorratsvermögens.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Herstellungskosten"],
    answer: {
      kind: "info",
      summary:
        "Herstellungskosten (§ 255 Abs. 2, 2a HGB): Materialeinzel-/-gemeinkosten und Fertigungseinzel-/-gemeinkosten sind Pflichtbestandteil; Vertriebskosten nie. Forschung nicht aktivierbar, Entwicklung aktivierbar.",
      links: [KB_LINK],
      knowledge: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    },
  },
  {
    aliases: ["latente Steuern", "latente Steuer"],
    answer: {
      kind: "info",
      summary:
        "Latente Steuern (§ 274 HGB): temporäre Differenzen zwischen Handels- und Steuerbilanz × Steuersatz. Passive latente Steuern → Ansatzpflicht; aktive latente Steuern → Ansatzwahlrecht.",
      links: [KB_LINK],
      knowledge: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    },
  },
  {
    aliases: ["Drohverlustrückstellung", "Drohverlust"],
    answer: {
      kind: "info",
      summary:
        "Rückstellung für drohende Verluste aus schwebenden Geschäften: handelsrechtlich Pflicht (§ 249 Abs. 1 S. 1 HGB), steuerlich unzulässig (§ 5 Abs. 4a EStG) → temporäre Differenz / latente Steuern.",
      links: [KB_LINK],
      knowledge: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    },
  },
  {
    aliases: ["Kryptowährung", "Kryptowährungen", "Bitcoin", "Krypto"],
    answer: {
      kind: "info",
      summary:
        "Kryptowerte sind Wirtschaftsgüter (§§ 246 HGB, 5/6 EStG; BMF 10.05.2022). Zahlung in Krypto und Krypto-zu-Krypto-Tausch sind Veräußerungen; Erlös = Marktwert der Gegenleistung (§ 6 Abs. 6 EStG).",
      links: [KB_LINK],
      knowledge: "Bilanzierung — immaterielle WG, Vorräte, Rückstellungen, latente Steuern",
    },
  },

  // --- UmwStG ---
  {
    aliases: ["Anteilstausch"],
    answer: {
      kind: "info",
      summary:
        "Anteilstausch (§ 21 UmwStG): Einbringung von Anteilen an einer Kapitalgesellschaft gegen Gewährung neuer Anteile. Grundsatz gemeiner Wert; Buchwertansatz auf Antrag möglich, wenn die Voraussetzungen erfüllt sind. Keine Rückwirkung (§§ 2, 20 Abs. 5/6 UmwStG gelten nicht).",
      links: [KB_LINK],
      knowledge: "Anteilstausch nach § 21 UmwStG",
    },
  },

  // --- USt / Reihengeschäft ---
  {
    aliases: ["Reihengeschäft"],
    answer: {
      kind: "info",
      summary:
        "Reihengeschäft (§ 3 Abs. 6, 7 UStG; UStAE 3.14): mehrere Umsatzgeschäfte, eine Warenbewegung. Nur eine Lieferung ist die bewegte; alle anderen sind ruhende Lieferungen. Zuordnung nach Transportveranlasser.",
      links: [KB_LINK],
      knowledge: "Reihengeschäft (§ 3 Abs. 6, 7 UStG)",
    },
  },
  {
    aliases: ["bewegte Lieferung"],
    answer: {
      kind: "info",
      summary:
        "Bewegte Lieferung (§ 3 Abs. 6 UStG): die Lieferung, der die Warenbewegung im Reihengeschäft zugeordnet wird. Ort = Beginn der Beförderung/Versendung; kann als ig. Lieferung (§ 6a UStG) steuerfrei sein.",
      links: [KB_LINK],
      knowledge: "Reihengeschäft (§ 3 Abs. 6, 7 UStG)",
    },
  },
  {
    aliases: ["ruhende Lieferung"],
    answer: {
      kind: "info",
      summary:
        "Ruhende Lieferung (§ 3 Abs. 7 UStG): jede Lieferung im Reihengeschäft, die nicht die bewegte ist. Ort = Ort der Verschaffung der Verfügungsmacht; regelmäßig im Belegenheitsstaat steuerbar.",
      links: [KB_LINK],
      knowledge: "Reihengeschäft (§ 3 Abs. 6, 7 UStG)",
    },
  },
  {
    aliases: ["innergemeinschaftliche Lieferung", "ig Lieferung", "ig. Lieferung"],
    answer: {
      kind: "info",
      summary:
        "Innergemeinschaftliche Lieferung (§ 6a UStG): steuerfrei, wenn USt-IdNr. des Abnehmers, körperliche Warenbewegung in einen anderen EU-Mitgliedstaat, belegmäßige Nachweise (Gelangensbestätigung) und Zusammenfassende Meldung (§ 18a UStG) vorliegen.",
      links: [KB_LINK],
    },
  },
  {
    aliases: ["Dreiecksgeschäft"],
    answer: {
      kind: "info",
      summary:
        "Innergemeinschaftliches Dreiecksgeschäft (§ 25b UStG): Vereinfachung für Reihengeschäfte mit drei in unterschiedlichen EU-Staaten registrierten Unternehmern — Steuerschuld geht auf den letzten Abnehmer über; mittlerer Unternehmer muss sich nicht im Bestimmungsland registrieren.",
      links: [KB_LINK],
    },
  },

  // --- Mitunternehmerschaft ---
  {
    aliases: ["Mitunternehmerschaft", "Mitunternehmer"],
    answer: {
      kind: "info",
      summary:
        "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG): mehrere Personen tragen gemeinsam Mitunternehmerinitiative (Geschäftsführung/Kontrollrechte, §§ 118, 166 HGB) und Mitunternehmerrisiko (Gewinn, Verlust, stille Reserven). Gesonderte und einheitliche Feststellung (§ 180 AO).",
      links: [KB_LINK],
      knowledge: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    },
  },
  {
    aliases: ["Sonderbilanz"],
    answer: {
      kind: "info",
      summary:
        "Sonderbilanz: bildet das Sonderbetriebsvermögen eines Mitunternehmers ab (z. B. an die Gesellschaft überlassenes Grundstück, Gesellschafterdarlehen). Sonderbetriebseinnahmen/-ausgaben erhöhen/mindern den Gewinnanteil dieses Gesellschafters (§ 15 Abs. 1 Nr. 2 EStG).",
      links: [KB_LINK],
      knowledge: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    },
  },
  {
    aliases: ["Ergänzungsbilanz"],
    answer: {
      kind: "info",
      summary:
        "Ergänzungsbilanz: gesellschafterindividuelle Korrektur der Wertansätze der Gesamthandsbilanz (z. B. Mehrzahlung beim Eintritt) → spezielle Mehr-/Minder-AfA wirkt nur bei diesem Mitunternehmer.",
      links: [KB_LINK],
      knowledge: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    },
  },
  {
    aliases: ["Gesamthandsbilanz"],
    answer: {
      kind: "info",
      summary:
        "Gesamthandsbilanz: Bilanz der Personengesellschaft selbst (z. B. OHG, KG). Bildet zusammen mit Sonder- und Ergänzungsbilanzen das steuerliche Gesamtergebnis der Mitunternehmerschaft.",
      links: [KB_LINK],
      knowledge: "Mitunternehmerschaft (§ 15 Abs. 1 Nr. 2 EStG)",
    },
  },
];

export function lookupLexicon(rawQuestion: string): ChatAnswer | null {
  const n = norm(rawQuestion);
  if (!n) return null;
  for (const e of LEXICON) if (match(n, e.aliases)) return e.answer;
  return null;
}
