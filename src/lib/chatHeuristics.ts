// Lightweight heuristic "AI" answer engine for the steuerstoff Chat MVP.
// Replace generateAnswer() with a real API call later.

export type ChatLink = { label: string; to: string };

export interface ChatAnswer {
  summary: string;
  reasoning?: string;
  /** Strukturierte Abgrenzungen (optional, statt langer Fließtext-Begründung). */
  sections?: { title: string; body: string }[];
  risks?: string[];
  followUps?: string[];
  nextStep?: string;
  links?: ChatLink[];
  knowledge?: string;
  /** Optionale Folgefrage am Ende ("Meinst du …?"). */
  clarify?: string;
  /** Kompakter Antworttyp — UI kann Prüfkarte schlanker rendern. */
  kind?: "info" | "case" | "npo" | "mvr";
}

const has = (q: string, ...terms: string[]) =>
  terms.some((t) => q.includes(t));

const REVIEW =
  "steuerstoff ist eine Arbeitshilfe und ersetzt keine verbindliche steuerliche Beratung. Bitte fachlich prüfen lassen.";

export function generateAnswer(rawQuestion: string): ChatAnswer {
  const q = rawQuestion.toLowerCase().trim();

  // --- SKR ---
  if (has(q, "skr03", "skr 03", "skr42", "skr 42", "skr", "konto ", "kontierung", "buchungstext")) {
    const skrMatch = q.match(/skr\s*0?3?\s*(\d{3,5})/);
    const konto = skrMatch?.[1];
    return {
      summary: konto
        ? `SKR03 ${konto} lässt sich häufig auf ein passendes SKR42-Konto übertragen. Bitte Sphäre, NPO-Zuordnung und individuellen Kontenrahmen prüfen.`
        : "Für SKR03 ↔ SKR42 Zuordnungen empfiehlt sich der SKR-Konverter mit Mapping-Vorschlag und Buchungstextanalyse.",
      reasoning:
        "Die Konvertierung hängt vom Buchungsinhalt, der Sphärenzuordnung (ideell, Zweckbetrieb, wirtschaftlich) und vom Mandanten-Kontenrahmen ab.",
      followUps: ["Welche Sphäre ist betroffen?", "Liegt ein abweichender Mandanten-Kontenplan vor?"],
      nextStep: "Im SKR-Konverter Konto und Buchungstext prüfen.",
      links: [{ label: "Im SKR-Konverter öffnen", to: "/skr-konverter" }],
      knowledge: "SKR-Konverter",
    };
  }

  // --- Mittelverwendung / Rücklagen ---
  if (
    has(
      q,
      "mittelverwendung",
      "rücklage",
      "ruecklage",
      "freie rücklage",
      "betriebsmittelrücklage",
      "rücklagenspiegel",
      "verwendungsüberhang",
      "zuflussjahr",
      "zwei-jahres-frist",
      "zeitnah",
    )
  ) {
    return {
      summary:
        "Mittel müssen grundsätzlich zeitnah verwendet werden: Zufluss im Jahr X muss bis Ende des zweiten auf den Zufluss folgenden Kalenderjahres (X+2) für satzungsmäßige Zwecke eingesetzt sein.",
      reasoning:
        "Ausnahmen bilden zulässige Rücklagen (freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage). Diese sind im Rücklagenspiegel zu dokumentieren.",
      risks: [
        "Verwendungsüberhang führt zu Verstoß gegen § 55 AO.",
        "Fehlende Dokumentation der Rücklage gefährdet die Gemeinnützigkeit.",
      ],
      followUps: [
        "Wann ist der Mittelzufluss erfolgt?",
        "Sind bereits Rücklagen gebildet?",
      ],
      nextStep: "Im Mittelverwendungsrechner Zufluss, Verwendung und Rücklagen erfassen.",
      links: [{ label: "Im Mittelverwendungsrechner berechnen", to: "/mittelverwendungsrechner" }],
      knowledge: "Mittelverwendung",
    };
  }

  // --- NPO-Sphäre / Spende / Sponsoring ---
  if (
    has(
      q,
      "verein",
      "ggmbh",
      "stiftung",
      "spende",
      "mitgliedsbeitrag",
      "mitgliedsbeiträge",
      "zuschuss",
      "sphäre",
      "sphaere",
      "zweckbetrieb",
      "vermögensverwaltung",
      "vermoegensverwaltung",
      "wirtschaftlicher geschäftsbetrieb",
      "gemeinnützig",
      "sponsoring",
      "logo",
    )
  ) {
    if (has(q, "mitgliedsbeitr")) {
      return {
        summary:
          "Echte Mitgliedsbeiträge eines Vereins gehören regelmäßig zum ideellen Bereich.",
        reasoning:
          "Werden mit dem Beitrag konkrete Gegenleistungen abgegolten (Kurse, Eintritt, Nutzung, Sonderleistungen), kann anteilig Zweckbetrieb oder wirtschaftlicher Geschäftsbetrieb vorliegen.",
        followUps: [
          "Bekommen Mitglieder konkrete Leistungen für den Beitrag?",
          "Gibt es unterschiedliche Beitragsklassen mit Zusatzleistungen?",
        ],
        nextStep: "Im NPO-Prüfassistenten Sphärenzuordnung dokumentieren.",
        links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
        knowledge: "NPO / Sphären",
      };
    }
    if (has(q, "logo", "sponsoring", "werbung", "gegenleistung")) {
      return {
        summary:
          "Logo-Nennung mit aktiver Werbewirkung spricht eher für Sponsoring bzw. Leistungsaustausch — eine Spendenbescheinigung wäre kritisch.",
        reasoning:
          "Reine Duldung der Namensnennung kann ideell bleiben; aktive Werbung führt regelmäßig zum wirtschaftlichen Geschäftsbetrieb oder Zweckbetrieb (Sponsoringerlass).",
        risks: [
          "Unzulässige Spendenbescheinigung → Haftung nach § 10b EStG.",
          "Umsatzsteuerpflicht der Sponsoringleistung.",
        ],
        followUps: [
          "Liegt ein Sponsoringvertrag vor?",
          "Wie aktiv ist die Werbewirkung (verlinktes Logo, Werbeflächen, Social Posts)?",
        ],
        nextStep: "Im NPO-Prüfassistenten Sphäre und USt prüfen.",
        links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
        knowledge: "NPO / Sponsoring",
      };
    }
    return {
      summary:
        "Für NPO-Sachverhalte ist die Sphärenzuordnung (ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) zentral.",
      reasoning:
        "Die Zuordnung steuert Ertragsteuer, Umsatzsteuer, Mittelverwendung und Spendenfähigkeit.",
      followUps: [
        "Welche Rechtsform liegt vor?",
        "Gibt es eine Gegenleistung?",
        "Wer ist Empfänger / Geldgeber?",
      ],
      nextStep: "Im NPO-Prüfassistenten strukturieren.",
      links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
      knowledge: "NPO",
    };
  }

  // --- USt Strom ---
  if (has(q, "strom") && has(q, "umsatzsteuer", "ust", "mwst")) {
    return {
      summary:
        "Auf Stromlieferungen fällt in Deutschland regelmäßig der allgemeine Umsatzsteuersatz von 19 % an.",
      reasoning: "Stromlieferung ist keine begünstigte Leistung nach § 12 Abs. 2 UStG.",
      followUps: ["Liegt eine Rechnung mit ausgewiesener USt vor?", "Ist der Leistungsempfänger vorsteuerabzugsberechtigt?"],
      nextStep: "Rechnung und Leistungszeitraum prüfen.",
      knowledge: "Umsatzsteuer",
    };
  }

  // --- Reverse Charge ---
  if (has(q, "reverse charge", "§ 13b", "13b ustg")) {
    return {
      summary:
        "Reverse Charge verlagert die Steuerschuld auf den Leistungsempfänger (§ 13b UStG). Der Leistende stellt netto ohne USt mit Hinweis aus.",
      reasoning:
        "Typische Fälle: Bauleistungen B2B, sonstige Leistungen aus dem EU-Ausland an deutsche Unternehmer, bestimmte Lieferungen (z. B. Schrott).",
      followUps: ["Wer ist Leistender, wer Leistungsempfänger?", "Liegt eine gültige USt-IdNr. vor?"],
      nextStep: "Rechnungshinweis 'Steuerschuldnerschaft des Leistungsempfängers' prüfen.",
      knowledge: "Umsatzsteuer / 13b",
    };
  }

  // --- Bewirtung ---
  if (has(q, "bewirtung")) {
    return {
      summary:
        "Ohne vollständige Teilnehmerangaben und Anlass ist der Betriebsausgabenabzug der Bewirtung gefährdet.",
      reasoning:
        "§ 4 Abs. 5 Nr. 2 EStG verlangt Ort, Tag, Teilnehmer, Anlass und Höhe. Vorsteuerabzug kann auch ohne 70-%-Kürzung möglich sein, wenn formelle Voraussetzungen erfüllt sind.",
      risks: ["Komplette Nichtabzugsfähigkeit bei Formmängeln."],
      followUps: ["Können Teilnehmer und Anlass nachgereicht werden?"],
      nextStep: "Eigenbeleg mit Teilnehmern, Anlass, Datum ergänzen.",
      knowledge: "Betriebsausgaben",
    };
  }

  // --- Rechnung Ausland ohne USt ---
  if (has(q, "irland", "ausland", "eu-ausland", "rechnung ohne ust", "ohne umsatzsteuer")) {
    return {
      summary:
        "Eingangsrechnung aus dem EU-Ausland ohne USt deutet auf Reverse Charge (§ 13b UStG) hin.",
      reasoning:
        "Voraussetzung: gültige USt-IdNr., B2B-Leistung, korrekter Rechnungshinweis. Steuerschuld geht auf den Leistungsempfänger über.",
      followUps: ["USt-IdNr. des Leistenden und des Empfängers vorhanden?", "Hinweis 'Reverse Charge' auf der Rechnung?"],
      nextStep: "USt-Voranmeldung: Steuer berechnen und gleichzeitig Vorsteuer ziehen.",
      knowledge: "Umsatzsteuer / 13b",
    };
  }

  // --- USt allgemein ---
  if (has(q, "umsatzsteuer", "ust ", " ust", "mwst", "vorsteuer", "13b")) {
    return {
      summary:
        "Für die umsatzsteuerliche Beurteilung sind Leistungsart, Ort, Empfänger und Steuersatz maßgeblich.",
      followUps: ["Welche Leistung? Wer ist Empfänger?", "Lieferung oder sonstige Leistung?"],
      nextStep: "Sachverhalt strukturiert in einer Anfrage erfassen.",
      links: [{ label: "Neue Anfrage öffnen", to: "/neue-anfrage" }],
      knowledge: "Umsatzsteuer",
    };
  }

  // --- Sommerfest / gemischter Sachverhalt ---
  if (has(q, "sommerfest", "fest mit eintritt", "getränkeverkauf", "getraenkeverkauf")) {
    return {
      summary:
        "Ein Sommerfest mit Eintritt und Getränkeverkauf führt regelmäßig zum wirtschaftlichen Geschäftsbetrieb bzw. ggf. Zweckbetrieb (z. B. gesellige Veranstaltung).",
      risks: [
        "Überschreiten der 45.000-€-Grenze (§ 64 Abs. 3 AO).",
        "Umsatzsteuerpflicht für Eintritt und Getränkeverkauf.",
      ],
      followUps: ["Höhe der Einnahmen?", "Welcher Verein / welche Sphärenstruktur?"],
      nextStep: "Im NPO-Prüfassistenten Sphäre, Freigrenze und USt prüfen.",
      links: [{ label: "Im NPO-Prüfassistenten prüfen", to: "/npo-pruefassistent" }],
      knowledge: "NPO / wirtschaftlicher Geschäftsbetrieb",
    };
  }

  // --- Fallback ---
  return {
    summary:
      "Die Frage konnte heuristisch nicht eindeutig zugeordnet werden. Eine kurze Präzisierung (Rechtsform, Steuerart, Sachverhalt) hilft.",
    followUps: [
      "Um welche Steuerart geht es (USt, ErtragSt, Gemeinnützigkeit)?",
      "Wer ist beteiligt (Mandant, Empfänger, Geldgeber)?",
      "Welche Beträge und Zeiträume liegen vor?",
    ],
    nextStep: "Strukturierte Anfrage in 'Neue Anfrage' erfassen.",
    links: [{ label: "Neue Anfrage öffnen", to: "/neue-anfrage" }],
  };
}

export const REVIEW_HINT = REVIEW;
