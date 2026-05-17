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
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
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
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
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
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
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
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
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
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
        KB_LINK,
      ],
      knowledge: "NPO / Mittelverwendung",
    },
  },
];

export function lookupLexicon(rawQuestion: string): ChatAnswer | null {
  const n = norm(rawQuestion);
  if (!n) return null;
  for (const e of LEXICON) if (match(n, e.aliases)) return e.answer;
  return null;
}
