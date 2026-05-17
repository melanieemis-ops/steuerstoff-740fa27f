// Lightweight heuristic "AI" answer engine for the steuerstoff Chat MVP.
// Replace generateAnswer() with a real API call later.

import { lookupLexicon } from "./taxLexicon";

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

  // --- 1) Lexikon / Begriffsfrage (vor allen Spezialmodulen) ---
  const lex = lookupLexicon(rawQuestion);
  if (lex) return lex;


  // --- Allgemeine Steuerlehre: "Was sind Steuern?" / Steuerarten ---
  if (
    /^(was\s+(ist|sind))\s+(eine\s+)?steuer/i.test(rawQuestion.trim()) ||
    has(q, "steuerarten", "steuersystem", "abgabenarten") ||
    (has(q, "unterschied") && has(q, "gebühr", "gebuehr", "beitrag")) ||
    has(q, "direkte steuer", "indirekte steuer")
  ) {
    return {
      kind: "info",
      summary:
        "Steuern sind Geldleistungen, die ein öffentlich-rechtliches Gemeinwesen ohne Anspruch auf konkrete Gegenleistung von allen erhebt, bei denen der gesetzliche Tatbestand zutrifft (§ 3 Abs. 1 AO).",
      sections: [
        {
          title: "Abgrenzung",
          body:
            "Gebühr = Entgelt für konkrete Amtshandlung. Beitrag = Entgelt für die Möglichkeit der Inanspruchnahme einer Leistung. Sonderabgabe = Finanzierung gruppennütziger Zwecke. Nur die Steuer ist gegenleistungslos.",
        },
        {
          title: "Nach Bemessungsgrundlage",
          body:
            "Ertragsteuern (ESt, KSt, GewSt), Verkehrsteuern (USt, GrESt), Substanzsteuern (GrSt, ErbSt), Verbrauchsteuern (Energie, Tabak).",
        },
        {
          title: "Nach Steuergläubiger",
          body:
            "Bundessteuern, Landessteuern (z. B. ErbSt, GrESt), Gemeindesteuern (GrSt, GewSt) und Gemeinschaftsteuern (USt, ESt, KSt — Aufkommen wird aufgeteilt).",
        },
        {
          title: "Direkt vs. indirekt",
          body:
            "Direkt: Steuerschuldner = Steuerträger (ESt, KSt). Indirekt: Last wird überwälzt (USt, Verbrauchsteuern).",
        },
      ],
      clarify:
        "Möchtest du zu einer bestimmten Steuerart vertiefen (z. B. ESt, KSt, USt, GewSt, ErbSt)?",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: "Steuern — Grundlagen",
    };
  }

  // --- Erbschaft-/Schenkungsteuer ---
  if (has(q, "erbschaftsteuer", "erbschaft-steuer", "schenkungsteuer", "erbstg", "nachlass", "erbanfall") || /\berbst\b/i.test(q)) {
    return {
      kind: "info",
      summary:
        "Die Erbschaft- und Schenkungsteuer erfasst den unentgeltlichen Vermögensübergang von Todes wegen (§ 3 ErbStG) bzw. unter Lebenden (§ 7 ErbStG). Bewertungsstichtag ist der Tag der Steuerentstehung (§§ 9, 11 ErbStG).",
      sections: [
        {
          title: "Steuerklassen (§ 15 ErbStG)",
          body:
            "I: Ehegatten, Kinder, Enkel, bei Erbfall auch Eltern. II: Geschwister, Nichten/Neffen, Schwiegerkinder. III: alle übrigen Erwerber.",
        },
        {
          title: "Persönliche Freibeträge (§ 16 ErbStG)",
          body:
            "Ehegatte 500.000 €, Kinder 400.000 €, Enkel 200.000 € (400.000 € bei verstorbenem Elternteil), Eltern bei Erbfall 100.000 €, StKl II/III 20.000 €.",
        },
        {
          title: "Bewertung",
          body:
            "Anteile nicht notierter Kapitalgesellschaften: gemeiner Wert mit Substanzwert als Mindestwert (§ 11 BewG). Grundbesitz: Vergleichs-, Ertrags- oder Sachwertverfahren (§§ 182 ff. BewG). Gesonderte Feststellung nach § 151 BewG.",
        },
        {
          title: "Begünstigungen",
          body:
            "§§ 13a/13b ErbStG: Betriebsvermögen / Kapitalanteile > 25 %. § 13d ErbStG: 10 %-Abschlag für zu Wohnzwecken vermietete Grundstücke. § 13 Abs. 1 Nr. 4b/c: Familienheim.",
        },
      ],
      followUps: [
        "Welche Steuerklasse liegt vor?",
        "Welche Vermögensarten gehören zum Nachlass (Grundbesitz, GmbH-Anteile, Bankguthaben)?",
        "Gibt es Vorerwerbe innerhalb von 10 Jahren (§ 14 ErbStG)?",
      ],
      nextStep: "Schema: Vermögensanfall ./. Nachlassverbindlichkeiten = Bereicherung ./. Freibetrag = stpfl. Erwerb × Tarif § 19 ErbStG.",
      links: [{ label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" }],
      knowledge: "Erbschaftsteuer",
    };
  }

  // --- Kfz-Wertabgabe / 1-%-Methode ---
  if (
    has(
      q,
      "kfz-wertabgabe",
      "kfz wertabgabe",
      "1%-methode",
      "1 % methode",
      "1%methode",
      "1-%-methode",
      "1 prozent methode",
      "ein prozent methode",
      "private kfz-nutzung",
      "private kfz nutzung",
      "bruttolistenpreis",
      "kostendeckelung",
      "8921",
      "8924",
      "fahrten wohnung betrieb",
      "fahrten wohnung-betrieb",
      "firmenwagen",
    )
  ) {
    return {
      kind: "info",
      summary:
        "Dafür kann ich den Kfz-Wertabgaben-Rechner öffnen. Er rechnet 1-%-Methode, Fahrten Wohnung/Betrieb (0,03 %), USt-Aufteilung auf # 8921 0 / # 8924 0 und die Kostendeckelung nach Arbeitspapier.",
      nextStep:
        "Bruttolistenpreis, Nutzungsmonate, Entfernung und Arbeitstage erfassen — anschließend Kostendeckelung prüfen.",
      links: [
        { label: "Kfz-Wertabgabe berechnen", to: "/kfz-wertabgabe" },
        { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      ],
      knowledge: "Kfz-Wertabgabe",
    };
  }

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

  // --- NPO-Kontext-Trigger (für Mittelverwendung / § 62 / Rücklagen) ---
  const npoContext = has(
    q,
    "verein",
    "ggmbh",
    "gug",
    "stiftung",
    "gemeinnützig",
    "gemeinnuetzig",
    "npo",
    "mittelverwendung",
    "§ 55",
    "§ 62",
    "§55",
    "§62",
    "rücklagenspiegel",
    "verwendungsüberhang",
    "verwendungsueberhang",
    "zuflussjahr",
    "zwei-jahres-frist",
    "zeitnah",
    "wiederbeschaffung",
    "betriebsmittelrücklage",
    "betriebsmittelruecklage",
    "freie rücklage",
    "freie ruecklage",
  );

  // --- Rückstellung vs. Rücklage (allgemeine Abgrenzungsfrage) ---
  if (has(q, "rückstellung", "rueckstellung") && has(q, "rücklage", "ruecklage", "unterschied")) {
    return {
      kind: "info",
      summary:
        "Rücklage und Rückstellung sind nicht dasselbe — der Unterschied liegt in Bilanzposition und Anlass.",
      sections: [
        {
          title: "Rücklage",
          body:
            "Teil des Eigenkapitals. Zurückbehaltene Mittel zur Stärkung der Organisation oder für künftige Zwecke. Beispiele: Gewinnrücklage, Kapitalrücklage, gemeinnützigkeitsrechtliche Rücklagen nach § 62 AO.",
        },
        {
          title: "Rückstellung",
          body:
            "Fremdkapital. Sie bildet ungewisse Verbindlichkeiten oder drohende Belastungen ab (Höhe oder Fälligkeit unsicher). Beispiele: Steuerrückstellung, Gewährleistungsrückstellung, Pensionsrückstellung.",
        },
      ],
      clarify:
        "Soll ich die Abgrenzung im NPO-Kontext (§ 62 AO) oder bei einer Kapitalgesellschaft vertiefen?",
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
      ],
      knowledge: "Bilanzielle Abgrenzung",
    };
  }

  // --- Allgemeine Rücklagen-Wissensfrage (NICHT NPO-Kontext) ---
  if (has(q, "rücklage", "ruecklage", "gewinnrücklage", "kapitalrücklage") && !npoContext) {
    return {
      kind: "info",
      summary:
        "Eine Rücklage ist zurückbehaltenes Eigenkapital bzw. ein zweckgebundener oder freier Betrag, der nicht unmittelbar ausgeschüttet oder verwendet wird. Im steuerlichen Kontext muss man unterscheiden, welche Art von Rücklage gemeint ist.",
      sections: [
        {
          title: "1. Allgemeine Rücklage",
          body:
            "Eigenkapitalposition, z. B. Gewinnrücklage oder Kapitalrücklage. Dient der Stärkung des Eigenkapitals.",
        },
        {
          title: "2. Steuerliche Spezialrücklage",
          body:
            "Steuerliche Sonderregelung möglich, z. B. Rücklagen im Zusammenhang mit Reinvestitionen — abhängig vom konkreten Steuertatbestand.",
        },
        {
          title: "3. Gemeinnützigkeitsrechtliche Rücklage nach § 62 AO",
          body:
            "Relevant für Vereine, gGmbHs, Stiftungen und NPOs — z. B. freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage. Muss dokumentiert und häufig im Rücklagenspiegel dargestellt werden.",
        },
        {
          title: "4. Rückstellung ist nicht Rücklage",
          body:
            "Rückstellung betrifft ungewisse Verbindlichkeiten oder drohende Belastungen (Fremdkapital). Rücklage ist grundsätzlich Eigenkapital bzw. Mittelbindung.",
        },
      ],
      clarify:
        "Meinst du eine allgemeine steuerliche Rücklage oder eine Rücklage bei einer gemeinnützigen Organisation?",
      links: [
        { label: "NPO-Rücklage prüfen", to: "/npo-pruefassistent" },
        { label: "Mittelverwendungsrechner öffnen", to: "/mittelverwendungsrechner" },
        { label: "Wissensdatenbank öffnen", to: "/wissensdatenbank" },
      ],
      knowledge: "Rücklage — Grundlagen",
    };
  }

  // --- Mittelverwendung / NPO-Rücklagen (nur bei NPO-Kontext) ---
  if (
    npoContext &&
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
      "§ 55",
      "§ 62",
    )
  ) {
    return {
      kind: "mvr",
      summary:
        "Mittel gemeinnütziger Körperschaften müssen grundsätzlich zeitnah verwendet werden: Zufluss im Jahr X bis Ende des zweiten Folgejahres (X+2) für satzungsmäßige Zwecke.",
      reasoning:
        "Ausnahmen bilden zulässige Rücklagen nach § 62 AO (freie Rücklage, zweckgebundene Rücklage, Betriebsmittelrücklage, Wiederbeschaffungsrücklage). Diese sind im Rücklagenspiegel zu dokumentieren.",
      risks: [
        "Ein positiver Verwendungsüberhang kann auf eine nicht zeitnahe Mittelverwendung hinweisen und sollte geprüft werden.",
        "Ein Verstoß führt nicht automatisch sofort zum Verlust der Gemeinnützigkeit — das Finanzamt kann nach § 63 Abs. 4 AO eine Verwendungsauflage erteilen.",
      ],
      followUps: [
        "Wann ist der Mittelzufluss erfolgt?",
        "Sind bereits Rücklagen gebildet und dokumentiert?",
      ],
      nextStep: "Im Mittelverwendungsrechner Zufluss, Verwendung und Rücklagen erfassen.",
      links: [{ label: "Im Mittelverwendungsrechner berechnen", to: "/mittelverwendungsrechner" }],
      knowledge: "NPO / Mittelverwendung",
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
