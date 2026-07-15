export type LearningQuestionType =
  | "single-choice"
  | "true-false";

export type LearningDifficulty =
  | "leicht"
  | "mittel"
  | "schwer";

export type LearningCategory = "Umsatzsteuer";

export interface LearningQuestion {
  id: string;
  category: LearningCategory;
  topic: string;
  type: LearningQuestionType;
  difficulty: LearningDifficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  reference: string;
  hint?: string;
  tags: string[];
}

export const learningQuestions: LearningQuestion[] = [
  {
    id: "ust-001",
    category: "Umsatzsteuer",
    topic: "Steuerbare Umsätze",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Kombination beschreibt grundsätzlich einen steuerbaren Umsatz nach § 1 Abs. 1 Nr. 1 UStG?",
    options: [
      "Lieferung oder sonstige Leistung eines Unternehmers im Inland gegen Entgelt im Rahmen seines Unternehmens",
      "Jede Zahlung, die eine Privatperson erhält",
      "Jede Lieferung innerhalb der Europäischen Union",
      "Nur Lieferungen, bei denen tatsächlich Gewinn erzielt wird",
    ],
    correctAnswer: 0,
    explanation:
      "Grundsätzlich müssen eine Lieferung oder sonstige Leistung, ein Unternehmer, das Inland, ein Entgelt und die Ausführung im Rahmen des Unternehmens vorliegen.",
    reference: "§ 1 Abs. 1 Nr. 1 UStG",
    hint:
      "Denke an die fünf Grundvoraussetzungen eines steuerbaren Leistungsaustauschs.",
    tags: ["Steuerbarkeit", "Leistungsaustausch", "Grundlagen"],
  },
  {
    id: "ust-002",
    category: "Umsatzsteuer",
    topic: "Unternehmer",
    type: "true-false",
    difficulty: "leicht",
    question:
      "Eine Gewinnerzielungsabsicht ist zwingende Voraussetzung dafür, Unternehmer im Sinne des Umsatzsteuerrechts zu sein.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Für die Unternehmereigenschaft ist eine nachhaltige selbstständige Tätigkeit zur Erzielung von Einnahmen erforderlich. Eine Gewinnerzielungsabsicht ist dagegen nicht zwingend.",
    reference: "§ 2 Abs. 1 UStG",
    hint:
      "Unterscheide Einnahmenerzielungsabsicht und Gewinnerzielungsabsicht.",
    tags: ["Unternehmer", "Einnahmen", "Gewinn"],
  },
  {
    id: "ust-003",
    category: "Umsatzsteuer",
    topic: "Lieferung",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Was kennzeichnet eine Lieferung im Sinne des Umsatzsteuerrechts?",
    options: [
      "Die Verschaffung der Verfügungsmacht über einen Gegenstand",
      "Jede Zahlung an einen Unternehmer",
      "Ausschließlich die Übergabe eines Grundstücks",
      "Nur die körperliche Übergabe gegen Bargeld",
    ],
    correctAnswer: 0,
    explanation:
      "Eine Lieferung liegt vor, wenn der Abnehmer befähigt wird, im eigenen Namen über einen Gegenstand zu verfügen.",
    reference: "§ 3 Abs. 1 UStG",
    hint:
      "Entscheidend ist nicht nur der Besitz, sondern die Verfügungsmacht.",
    tags: ["Lieferung", "Verfügungsmacht", "Leistung"],
  },
  {
    id: "ust-004",
    category: "Umsatzsteuer",
    topic: "Sonstige Leistung",
    type: "true-false",
    difficulty: "leicht",
    question:
      "Eine sonstige Leistung kann auch in einem Unterlassen oder im Dulden einer Handlung bestehen.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Sonstige Leistungen sind Leistungen, die keine Lieferungen sind. Sie können ausdrücklich auch in einem Unterlassen oder Dulden bestehen.",
    reference: "§ 3 Abs. 9 UStG",
    hint:
      "Eine Leistung muss nicht immer in einer aktiven Handlung bestehen.",
    tags: ["Sonstige Leistung", "Dulden", "Unterlassen"],
  },
  {
    id: "ust-005",
    category: "Umsatzsteuer",
    topic: "Steuersatz",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Wie hoch ist grundsätzlich der Regelsteuersatz der deutschen Umsatzsteuer?",
    options: ["7 %", "16 %", "19 %", "20 %"],
    correctAnswer: 2,
    explanation:
      "Der allgemeine Steuersatz beträgt grundsätzlich 19 Prozent der Bemessungsgrundlage.",
    reference: "§ 12 Abs. 1 UStG",
    tags: ["Steuersatz", "Regelsteuersatz", "Berechnung"],
  },
  {
    id: "ust-006",
    category: "Umsatzsteuer",
    topic: "Ermäßigter Steuersatz",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Jede Lieferung eines Lebensmittels unterliegt automatisch dem ermäßigten Steuersatz von 7 Prozent.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Der ermäßigte Steuersatz gilt nur für die gesetzlich begünstigten Umsätze. Die Einordnung richtet sich insbesondere nach § 12 Abs. 2 UStG und der Anlage 2 zum UStG.",
    reference: "§ 12 Abs. 2 UStG und Anlage 2",
    hint:
      "Nicht die umgangssprachliche Bezeichnung, sondern die gesetzliche Einordnung entscheidet.",
    tags: ["Steuersatz", "Lebensmittel", "Anlage 2"],
  },
  {
    id: "ust-007",
    category: "Umsatzsteuer",
    topic: "Berechnung",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Ein Unternehmer erbringt eine steuerpflichtige Leistung für 1.000 Euro netto. Wie hoch ist die Umsatzsteuer bei 19 Prozent?",
    options: ["70 Euro", "160 Euro", "190 Euro", "1.190 Euro"],
    correctAnswer: 2,
    explanation:
      "Die Umsatzsteuer berechnet sich aus 1.000 Euro × 19 Prozent = 190 Euro. Der Bruttobetrag beträgt damit 1.190 Euro.",
    reference: "§ 12 Abs. 1 UStG",
    hint: "Nettobetrag × Steuersatz.",
    tags: ["Berechnung", "Netto", "Umsatzsteuer"],
  },
  {
    id: "ust-008",
    category: "Umsatzsteuer",
    topic: "Berechnung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Ein Bruttobetrag von 1.190 Euro enthält 19 Prozent Umsatzsteuer. Wie hoch ist der enthaltene Steuerbetrag?",
    options: ["119 Euro", "190 Euro", "226,10 Euro", "1.000 Euro"],
    correctAnswer: 1,
    explanation:
      "Bei einem Bruttobetrag wird die enthaltene Umsatzsteuer mit 19/119 berechnet: 1.190 Euro × 19/119 = 190 Euro.",
    reference: "§§ 10 und 12 Abs. 1 UStG",
    hint:
      "Bei einem Bruttobetrag nicht einfach 19 Prozent des Bruttobetrags berechnen.",
    tags: ["Berechnung", "Brutto", "Herausrechnen"],
  },
  {
    id: "ust-009",
    category: "Umsatzsteuer",
    topic: "Vorsteuerabzug",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Vorschrift regelt grundsätzlich den Vorsteuerabzug?",
    options: [
      "§ 4 UStG",
      "§ 10 UStG",
      "§ 15 UStG",
      "§ 19 UStG",
    ],
    correctAnswer: 2,
    explanation:
      "Der Vorsteuerabzug ist grundsätzlich in § 15 UStG geregelt.",
    reference: "§ 15 UStG",
    tags: ["Vorsteuer", "Rechtsgrundlage", "Paragraph"],
  },
  {
    id: "ust-010",
    category: "Umsatzsteuer",
    topic: "Vorsteuerabzug",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Voraussetzung ist für den Vorsteuerabzug aus einer Eingangsleistung grundsätzlich erforderlich?",
    options: [
      "Die Leistung wurde für das Unternehmen bezogen und es liegt grundsätzlich eine ordnungsgemäße Rechnung vor",
      "Der Unternehmer hat die Rechnung bar bezahlt",
      "Die Rechnung beträgt mehr als 1.000 Euro",
      "Der leistende Unternehmer und der Leistungsempfänger gehören zum selben Konzern",
    ],
    correctAnswer: 0,
    explanation:
      "Der Leistungsempfänger muss Unternehmer sein und die Leistung grundsätzlich für sein Unternehmen beziehen. Für den Vorsteuerabzug nach § 15 Abs. 1 Satz 1 Nr. 1 UStG wird regelmäßig eine ordnungsgemäße Rechnung benötigt.",
    reference: "§ 15 Abs. 1 Satz 1 Nr. 1 UStG",
    hint:
      "Prüfe Leistungsempfänger, Unternehmensbezug und Rechnung.",
    tags: ["Vorsteuer", "Rechnung", "Unternehmensbezug"],
  },
  {
    id: "ust-011",
    category: "Umsatzsteuer",
    topic: "Vorsteuerabzug",
    type: "true-false",
    difficulty: "leicht",
    question:
      "Ein Unternehmer kann die Vorsteuer aus einem Gegenstand abziehen, den er ausschließlich für seinen privaten Haushalt kauft.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Ein ausschließlich privat bezogener Gegenstand wird nicht für das Unternehmen bezogen. Daher besteht grundsätzlich kein Vorsteuerabzug.",
    reference: "§ 15 Abs. 1 UStG",
    tags: ["Vorsteuer", "Privatbereich", "Unternehmen"],
  },
  {
    id: "ust-012",
    category: "Umsatzsteuer",
    topic: "Rechnungen",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Angabe gehört grundsätzlich nicht zu den gesetzlichen Pflichtangaben einer normalen Rechnung nach § 14 Abs. 4 UStG?",
    options: [
      "Vollständiger Name und Anschrift des leistenden Unternehmers",
      "Ausstellungsdatum",
      "Fortlaufende Rechnungsnummer",
      "Bankverbindung des leistenden Unternehmers",
    ],
    correctAnswer: 3,
    explanation:
      "Eine Bankverbindung kann praktisch wichtig sein, gehört aber grundsätzlich nicht zu den Pflichtangaben nach § 14 Abs. 4 UStG.",
    reference: "§ 14 Abs. 4 UStG",
    hint:
      "Unterscheide gesetzliche Pflichtangaben von praktischen Zahlungsinformationen.",
    tags: ["Rechnung", "Pflichtangaben", "Bankverbindung"],
  },
  {
    id: "ust-013",
    category: "Umsatzsteuer",
    topic: "Rechnungen",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Das Ausstellungsdatum einer Rechnung und der Zeitpunkt der ausgeführten Leistung müssen immer identisch sein.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Das Ausstellungsdatum bezeichnet den Tag der Rechnungserstellung. Der Leistungszeitpunkt kann davon abweichen und ist grundsätzlich gesondert anzugeben.",
    reference: "§ 14 Abs. 4 UStG",
    tags: ["Rechnung", "Leistungsdatum", "Ausstellungsdatum"],
  },
  {
    id: "ust-014",
    category: "Umsatzsteuer",
    topic: "Zahllast",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Ein Unternehmer hat 570 Euro Umsatzsteuer und 190 Euro abziehbare Vorsteuer. Wie hoch ist seine Umsatzsteuerzahllast?",
    options: ["190 Euro", "380 Euro", "570 Euro", "760 Euro"],
    correctAnswer: 1,
    explanation:
      "Die Zahllast ergibt sich aus Umsatzsteuer minus abziehbarer Vorsteuer: 570 Euro − 190 Euro = 380 Euro.",
    reference: "§ 16 Abs. 2 UStG",
    hint: "Ausgangsumsatzsteuer minus abziehbare Vorsteuer.",
    tags: ["Zahllast", "Vorsteuer", "Berechnung"],
  },
  {
    id: "ust-015",
    category: "Umsatzsteuer",
    topic: "Steuerbefreiung",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Ein steuerfreier Umsatz ist dasselbe wie ein nicht steuerbarer Umsatz.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Ein nicht steuerbarer Umsatz erfüllt bereits die Voraussetzungen der Steuerbarkeit nicht. Ein steuerfreier Umsatz ist dagegen grundsätzlich steuerbar, wird aber durch eine Befreiungsvorschrift von der Umsatzsteuer befreit.",
    reference: "§§ 1 und 4 UStG",
    hint:
      "Zuerst Steuerbarkeit prüfen, anschließend eine mögliche Steuerbefreiung.",
    tags: ["Steuerbarkeit", "Steuerbefreiung", "Prüfungsschema"],
  },
  {
    id: "ust-016",
    category: "Umsatzsteuer",
    topic: "Istversteuerung",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Woran knüpft die Entstehung der Umsatzsteuer bei der genehmigten Istversteuerung grundsätzlich an?",
    options: [
      "An die Vereinnahmung des Entgelts",
      "An das Datum des Angebots",
      "An die Bestellung des Kunden",
      "An den Jahresabschluss des Unternehmers",
    ],
    correctAnswer: 0,
    explanation:
      "Bei der Besteuerung nach vereinnahmten Entgelten entsteht die Steuer grundsätzlich mit Ablauf des Voranmeldungszeitraums, in dem das Entgelt vereinnahmt wurde.",
    reference: "§ 13 Abs. 1 Nr. 1 Buchst. b und § 20 UStG",
    hint:
      "Istversteuerung bedeutet Besteuerung nach dem tatsächlichen Zahlungseingang.",
    tags: ["Istversteuerung", "Vereinnahmung", "Steuerentstehung"],
  },
  {
    id: "ust-017",
    category: "Umsatzsteuer",
    topic: "Geschäftsveräußerung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wie wird die Übertragung eines ganzen Unternehmens auf einen anderen Unternehmer für dessen Unternehmen grundsätzlich behandelt?",
    options: [
      "Als nicht steuerbare Geschäftsveräußerung im Ganzen",
      "Immer als steuerpflichtige Lieferung mit 19 Prozent",
      "Immer als steuerfreie innergemeinschaftliche Lieferung",
      "Als private Entnahme des bisherigen Inhabers",
    ],
    correctAnswer: 0,
    explanation:
      "Eine Geschäftsveräußerung an einen anderen Unternehmer für dessen Unternehmen unterliegt grundsätzlich nicht der Umsatzsteuer.",
    reference: "§ 1 Abs. 1a UStG",
    hint:
      "Der Erwerber muss die wirtschaftliche Tätigkeit grundsätzlich fortführen können.",
    tags: ["Geschäftsveräußerung", "Nichtsteuerbarkeit", "Unternehmen"],
  },
  {
    id: "ust-018",
    category: "Umsatzsteuer",
    topic: "Unentgeltliche Wertabgabe",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Die Entnahme eines betrieblichen Gegenstands für private Zwecke kann einer Lieferung gegen Entgelt gleichgestellt werden.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Eine Entnahme kann als unentgeltliche Wertabgabe einer Lieferung gegen Entgelt gleichgestellt werden, wenn der Gegenstand oder seine Bestandteile zum vollen oder teilweisen Vorsteuerabzug berechtigt haben.",
    reference: "§ 3 Abs. 1b UStG",
    hint:
      "Achte besonders darauf, ob beim Erwerb Vorsteuer abgezogen werden konnte.",
    tags: ["Wertabgabe", "Entnahme", "Privatnutzung"],
  },
  {
    id: "ust-019",
    category: "Umsatzsteuer",
    topic: "Unentgeltliche Wertabgabe",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Handlung kann als unentgeltliche sonstige Leistung steuerbar sein?",
    options: [
      "Die private Nutzung eines dem Unternehmen zugeordneten Gegenstands unter den gesetzlichen Voraussetzungen",
      "Die Einzahlung von Eigenkapital auf das Geschäftskonto",
      "Die bloße Erstellung eines Angebots",
      "Die Aufnahme eines Bankdarlehens",
    ],
    correctAnswer: 0,
    explanation:
      "Die Verwendung eines dem Unternehmen zugeordneten Gegenstands für außerhalb des Unternehmens liegende Zwecke kann einer sonstigen Leistung gegen Entgelt gleichgestellt werden.",
    reference: "§ 3 Abs. 9a UStG",
    tags: ["Wertabgabe", "Sonstige Leistung", "Privatnutzung"],
  },
  {
    id: "ust-020",
    category: "Umsatzsteuer",
    topic: "Ort der Lieferung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wo liegt der Ort einer Lieferung grundsätzlich, wenn der Gegenstand durch den Lieferer oder Abnehmer befördert oder versendet wird?",
    options: [
      "Dort, wo die Beförderung oder Versendung beginnt",
      "Immer am Wohnsitz des Abnehmers",
      "Immer dort, wo die Rechnung erstellt wird",
      "Dort, wo der Kaufpreis bezahlt wird",
    ],
    correctAnswer: 0,
    explanation:
      "Bei einer bewegten Lieferung liegt der Lieferort grundsätzlich dort, wo die Beförderung oder Versendung an den Abnehmer beginnt.",
    reference: "§ 3 Abs. 6 UStG",
    hint:
      "Bei der bewegten Lieferung ist der Beginn der Warenbewegung entscheidend.",
    tags: ["Lieferort", "Beförderung", "Versendung"],
  },
  {
    id: "ust-021",
    category: "Umsatzsteuer",
    topic: "Ort der Lieferung",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Bei einer Lieferung ohne Beförderung oder Versendung liegt der Lieferort grundsätzlich dort, wo sich der Gegenstand bei Verschaffung der Verfügungsmacht befindet.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Bei einer ruhenden Lieferung wird die Lieferung grundsätzlich dort ausgeführt, wo sich der Gegenstand im Zeitpunkt der Verschaffung der Verfügungsmacht befindet.",
    reference: "§ 3 Abs. 7 UStG",
    tags: ["Lieferort", "Ruhende Lieferung", "Verfügungsmacht"],
  },
  {
    id: "ust-022",
    category: "Umsatzsteuer",
    topic: "Ort der sonstigen Leistung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wo wird eine sonstige Leistung an einen Unternehmer für dessen Unternehmen nach der allgemeinen B2B-Regel grundsätzlich ausgeführt?",
    options: [
      "Am Sitz des Leistungsempfängers",
      "Immer am Sitz des leistenden Unternehmers",
      "Am Ort der Zahlung",
      "Am Ort der Rechnungsausstellung",
    ],
    correctAnswer: 0,
    explanation:
      "Nach der allgemeinen B2B-Regel liegt der Leistungsort grundsätzlich dort, von wo aus der Leistungsempfänger sein Unternehmen betreibt.",
    reference: "§ 3a Abs. 2 UStG",
    hint:
      "B2B: Grundsätzlich Empfängerort.",
    tags: ["Leistungsort", "B2B", "Empfängerort"],
  },
  {
    id: "ust-023",
    category: "Umsatzsteuer",
    topic: "Ort der sonstigen Leistung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wo wird eine sonstige Leistung an eine Privatperson nach der allgemeinen B2C-Regel grundsätzlich ausgeführt?",
    options: [
      "Am Sitz des leistenden Unternehmers",
      "Immer am Wohnort des Kunden",
      "Am Ort der Bank des Kunden",
      "Am Ort der Vertragsunterzeichnung",
    ],
    correctAnswer: 0,
    explanation:
      "Soweit keine besondere Ortsregel eingreift, wird eine sonstige Leistung an einen Nichtunternehmer grundsätzlich am Sitz des leistenden Unternehmers ausgeführt.",
    reference: "§ 3a Abs. 1 UStG",
    hint:
      "B2C: Grundsätzlich Unternehmerort.",
    tags: ["Leistungsort", "B2C", "Unternehmerort"],
  },
  {
    id: "ust-024",
    category: "Umsatzsteuer",
    topic: "Innergemeinschaftlicher Erwerb",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Der innergemeinschaftliche Erwerb im Inland gegen Entgelt ist ein eigener steuerbarer Umsatz.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Neben Lieferungen, sonstigen Leistungen und Einfuhren gehört auch der innergemeinschaftliche Erwerb im Inland gegen Entgelt zu den steuerbaren Umsätzen.",
    reference: "§ 1 Abs. 1 Nr. 5 UStG",
    tags: ["Erwerb", "EU", "Steuerbarkeit"],
  },
  {
    id: "ust-025",
    category: "Umsatzsteuer",
    topic: "Innergemeinschaftliche Lieferung",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Welche Kombination gehört grundsätzlich zu den Voraussetzungen einer innergemeinschaftlichen Lieferung?",
    options: [
      "Der Gegenstand gelangt in einen anderen EU-Mitgliedstaat und der Erwerb unterliegt dort grundsätzlich der Erwerbsbesteuerung",
      "Der Gegenstand bleibt stets im Inland und wird bar bezahlt",
      "Der Abnehmer ist zwingend eine Privatperson",
      "Der Lieferer darf kein Unternehmer sein",
    ],
    correctAnswer: 0,
    explanation:
      "Eine innergemeinschaftliche Lieferung setzt insbesondere eine Warenbewegung in das übrige Gemeinschaftsgebiet und die Erwerbsbesteuerung beim Abnehmer voraus; zusätzlich sind die weiteren gesetzlichen Voraussetzungen zu prüfen.",
    reference: "§ 4 Nr. 1 Buchst. b i. V. m. § 6a UStG",
    hint:
      "Denke an Warenbewegung, Abnehmerstatus und Erwerbsbesteuerung.",
    tags: ["Innergemeinschaftliche Lieferung", "EU", "Steuerfreiheit"],
  },
  {
    id: "ust-026",
    category: "Umsatzsteuer",
    topic: "Ausfuhrlieferung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wohin muss der Gegenstand bei einer Ausfuhrlieferung grundsätzlich gelangen?",
    options: [
      "In das Drittlandsgebiet",
      "Nur in ein anderes deutsches Bundesland",
      "Zwingend in einen anderen EU-Mitgliedstaat",
      "Ausschließlich in ein deutsches Freilager",
    ],
    correctAnswer: 0,
    explanation:
      "Eine Ausfuhrlieferung betrifft grundsätzlich eine Warenbewegung aus dem Inland in das Drittlandsgebiet. Die weiteren Voraussetzungen und Nachweise müssen ebenfalls erfüllt sein.",
    reference: "§ 4 Nr. 1 Buchst. a i. V. m. § 6 UStG",
    tags: ["Ausfuhr", "Drittland", "Steuerfreiheit"],
  },
  {
    id: "ust-027",
    category: "Umsatzsteuer",
    topic: "Reverse Charge",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Ein in Frankreich ansässiger Unternehmer erbringt eine allgemeine B2B-Beratungsleistung an einen deutschen Unternehmer. Wer schuldet die deutsche Umsatzsteuer grundsätzlich?",
    options: [
      "Der deutsche Leistungsempfänger",
      "Immer der französische Unternehmer",
      "Die französische Finanzverwaltung",
      "Niemand, weil Dienstleistungen innerhalb der EU stets steuerfrei sind",
    ],
    correctAnswer: 0,
    explanation:
      "Liegt der Leistungsort nach § 3a Abs. 2 UStG im Inland und wird die Leistung von einem im übrigen Gemeinschaftsgebiet ansässigen Unternehmer erbracht, schuldet grundsätzlich der Leistungsempfänger die Steuer.",
    reference: "§ 13b Abs. 1 UStG",
    hint:
      "Prüfe zuerst den Leistungsort und danach die Steuerschuldnerschaft.",
    tags: ["Reverse Charge", "B2B", "Ausland"],
  },
  {
    id: "ust-028",
    category: "Umsatzsteuer",
    topic: "Reverse Charge",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Bei einem Umsatz mit Steuerschuldnerschaft des Leistungsempfängers soll die Rechnung grundsätzlich den Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ enthalten.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Bei Umsätzen, für die der Leistungsempfänger die Steuer schuldet, ist in der Rechnung grundsätzlich auf die Steuerschuldnerschaft des Leistungsempfängers hinzuweisen.",
    reference: "§ 14a Abs. 5 UStG",
    tags: ["Reverse Charge", "Rechnung", "Hinweis"],
  },
  {
    id: "ust-029",
    category: "Umsatzsteuer",
    topic: "Unrichtiger Steuerausweis",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Ein Unternehmer weist in einer Rechnung einen höheren Steuerbetrag aus, als er gesetzlich schuldet. Welche Folge tritt grundsätzlich ein?",
    options: [
      "Er schuldet grundsätzlich auch den Mehrbetrag, solange keine wirksame Berichtigung erfolgt",
      "Der Mehrbetrag ist stets ohne Bedeutung",
      "Der Kunde schuldet automatisch den Mehrbetrag",
      "Die Rechnung gilt automatisch als storniert",
    ],
    correctAnswer: 0,
    explanation:
      "Wer einen höheren Steuerbetrag gesondert ausweist, als er für den Umsatz schuldet, schuldet grundsätzlich auch den Mehrbetrag. Eine Berichtigung ist unter den gesetzlichen Voraussetzungen möglich.",
    reference: "§ 14c Abs. 1 UStG",
    tags: ["Steuerausweis", "Rechnungsberichtigung", "Steuerschuld"],
  },
  {
    id: "ust-030",
    category: "Umsatzsteuer",
    topic: "Unberechtigter Steuerausweis",
    type: "true-false",
    difficulty: "schwer",
    question:
      "Wer Umsatzsteuer in einer Rechnung gesondert ausweist, obwohl er dazu nicht berechtigt ist, kann diesen Betrag trotzdem schulden.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Ein unberechtigter Steuerausweis kann eine Steuerschuld nach § 14c Abs. 2 UStG auslösen. Die Gefährdung des Steueraufkommens und die gesetzlichen Berichtigungsvoraussetzungen sind zu beachten.",
    reference: "§ 14c Abs. 2 UStG",
    tags: ["Steuerausweis", "Unberechtigt", "Rechnung"],
  },
  {
    id: "ust-031",
    category: "Umsatzsteuer",
    topic: "Vorsteuerausschluss",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Vorsteuerbeträge für Eingangsleistungen, die der Unternehmer zur Ausführung steuerfreier Umsätze verwendet, sind grundsätzlich vom Vorsteuerabzug ausgeschlossen.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Für Leistungen, die der Unternehmer zur Ausführung steuerfreier Umsätze verwendet, ist der Vorsteuerabzug grundsätzlich ausgeschlossen. Gesetzliche Ausnahmen sind gesondert zu prüfen.",
    reference: "§ 15 Abs. 2 und 3 UStG",
    tags: ["Vorsteuer", "Steuerfreie Umsätze", "Ausschluss"],
  },
  {
    id: "ust-032",
    category: "Umsatzsteuer",
    topic: "Vorsteueraufteilung",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Eine Eingangsleistung wird teils für Umsätze mit und teils für Umsätze ohne Vorsteuerabzug verwendet. Was ist grundsätzlich zu tun?",
    options: [
      "Die Vorsteuer ist nach einer sachgerechten wirtschaftlichen Zuordnung aufzuteilen",
      "Die gesamte Vorsteuer ist immer abziehbar",
      "Die gesamte Vorsteuer ist immer ausgeschlossen",
      "Der Unternehmer darf frei zwischen null und hundert Prozent wählen",
    ],
    correctAnswer: 0,
    explanation:
      "Ist eine Eingangsleistung nur teilweise zum Vorsteuerabzug berechtigt, muss der nicht abziehbare Teil sachgerecht geschätzt beziehungsweise wirtschaftlich zugeordnet werden.",
    reference: "§ 15 Abs. 4 UStG",
    hint:
      "Die Aufteilung soll die tatsächliche wirtschaftliche Verwendung abbilden.",
    tags: ["Vorsteuer", "Aufteilung", "Gemischte Verwendung"],
  },
  {
    id: "ust-033",
    category: "Umsatzsteuer",
    topic: "Unternehmenszuordnung",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Ein Gegenstand wird nur zu 8 Prozent für das Unternehmen genutzt. Wie wird er für Zwecke des Vorsteuerabzugs grundsätzlich behandelt?",
    options: [
      "Er gilt grundsätzlich nicht als für das Unternehmen bezogen",
      "Er muss vollständig dem Unternehmen zugeordnet werden",
      "Die Vorsteuer ist stets zu 50 Prozent abziehbar",
      "Die Nutzungshöhe ist umsatzsteuerlich ohne Bedeutung",
    ],
    correctAnswer: 0,
    explanation:
      "Wird ein Gegenstand zu weniger als 10 Prozent für das Unternehmen genutzt, gilt seine Lieferung, Einfuhr oder sein innergemeinschaftlicher Erwerb grundsätzlich nicht als für das Unternehmen ausgeführt.",
    reference: "§ 15 Abs. 1 Satz 2 UStG",
    tags: ["Vorsteuer", "Zehn-Prozent-Grenze", "Zuordnung"],
  },
  {
    id: "ust-034",
    category: "Umsatzsteuer",
    topic: "Vorsteuerabzug",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Die Steuer auf einen innergemeinschaftlichen Erwerb kann grundsätzlich als Vorsteuer abziehbar sein, wenn der Gegenstand für das Unternehmen erworben wurde.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Die Steuer für den innergemeinschaftlichen Erwerb von Gegenständen für das Unternehmen gehört grundsätzlich zu den abziehbaren Vorsteuerbeträgen.",
    reference: "§ 15 Abs. 1 Satz 1 Nr. 3 UStG",
    tags: ["Vorsteuer", "Innergemeinschaftlicher Erwerb", "EU"],
  },
  {
    id: "ust-035",
    category: "Umsatzsteuer",
    topic: "Vorsteuerabzug",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Eine nach § 13b UStG vom Leistungsempfänger geschuldete Steuer kann bei Verwendung der Leistung für das Unternehmen grundsätzlich zugleich als Vorsteuer abziehbar sein.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Die vom Leistungsempfänger nach § 13b UStG geschuldete Steuer kann grundsätzlich als Vorsteuer abgezogen werden, soweit die Leistung für das Unternehmen bezogen wurde und keine Ausschlussgründe eingreifen.",
    reference: "§ 15 Abs. 1 Satz 1 Nr. 4 UStG",
    tags: ["Vorsteuer", "Reverse Charge", "Steuerschuld"],
  },
  {
    id: "ust-036",
    category: "Umsatzsteuer",
    topic: "Vorsteuerberichtigung",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Über welchen Zeitraum wird eine Änderung der Verhältnisse bei einem gewöhnlichen beweglichen Wirtschaftsgut nach § 15a UStG grundsätzlich überwacht?",
    options: [
      "Fünf Jahre",
      "Ein Jahr",
      "Drei Jahre",
      "Zwanzig Jahre",
    ],
    correctAnswer: 0,
    explanation:
      "Bei einem Wirtschaftsgut, das nicht unter die verlängerte Frist für Grundstücke fällt, beträgt der Berichtigungszeitraum grundsätzlich fünf Jahre ab der erstmaligen Verwendung.",
    reference: "§ 15a Abs. 1 UStG",
    hint:
      "Für Grundstücke gilt dagegen ein längerer Zeitraum.",
    tags: ["Vorsteuerberichtigung", "Berichtigungszeitraum", "Wirtschaftsgut"],
  },
  {
    id: "ust-037",
    category: "Umsatzsteuer",
    topic: "Vorsteuerberichtigung",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Welcher Berichtigungszeitraum gilt nach § 15a UStG grundsätzlich für Grundstücke einschließlich ihrer wesentlichen Bestandteile?",
    options: [
      "Zehn Jahre",
      "Fünf Jahre",
      "Zwei Jahre",
      "Unbegrenzt",
    ],
    correctAnswer: 0,
    explanation:
      "Für Grundstücke einschließlich ihrer wesentlichen Bestandteile gilt grundsätzlich ein Berichtigungszeitraum von zehn Jahren.",
    reference: "§ 15a Abs. 1 UStG",
    tags: ["Vorsteuerberichtigung", "Grundstück", "Zehn Jahre"],
  },
  {
    id: "ust-038",
    category: "Umsatzsteuer",
    topic: "Änderung der Bemessungsgrundlage",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Wird das vereinbarte Entgelt für einen steuerpflichtigen Umsatz nachträglich gemindert, können Umsatzsteuer und korrespondierender Vorsteuerabzug zu berichtigen sein.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Ändert sich die Bemessungsgrundlage, müssen der leistende Unternehmer und gegebenenfalls der Leistungsempfänger ihre Steuer beziehungsweise ihren Vorsteuerabzug berichtigen.",
    reference: "§ 17 Abs. 1 UStG",
    tags: ["Bemessungsgrundlage", "Berichtigung", "Entgeltminderung"],
  },
  {
    id: "ust-039",
    category: "Umsatzsteuer",
    topic: "Sollversteuerung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wann entsteht die Umsatzsteuer bei der Besteuerung nach vereinbarten Entgelten grundsätzlich?",
    options: [
      "Mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt wurde",
      "Erst bei vollständiger Bezahlung",
      "Bei Erstellung des Angebots",
      "Erst mit Abgabe der Jahressteuererklärung",
    ],
    correctAnswer: 0,
    explanation:
      "Bei der Sollversteuerung entsteht die Steuer grundsätzlich mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt worden ist.",
    reference: "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    hint:
      "Bei der Sollversteuerung ist grundsätzlich die Leistungsausführung entscheidend.",
    tags: ["Sollversteuerung", "Steuerentstehung", "Leistungszeitpunkt"],
  },
  {
    id: "ust-040",
    category: "Umsatzsteuer",
    topic: "Anzahlungen",
    type: "single-choice",
    difficulty: "schwer",
    question:
      "Ein Unternehmer erhält vor Ausführung der Leistung eine Anzahlung. Wann entsteht die Steuer auf den vereinnahmten Teilbetrag grundsätzlich?",
    options: [
      "Mit Ablauf des Voranmeldungszeitraums der Vereinnahmung",
      "Erst nach vollständiger Leistungsausführung",
      "Erst bei Ausstellung der Schlussrechnung",
      "Nie, weil Anzahlungen nicht steuerbar sind",
    ],
    correctAnswer: 0,
    explanation:
      "Wird das Entgelt oder ein Teil davon vor Ausführung der Leistung vereinnahmt, entsteht die Steuer insoweit grundsätzlich mit Ablauf des Voranmeldungszeitraums der Vereinnahmung.",
    reference: "§ 13 Abs. 1 Nr. 1 Buchst. a UStG",
    hint:
      "Bei Anzahlungen wird ausnahmsweise bereits auf den Zahlungseingang abgestellt.",
    tags: ["Anzahlung", "Steuerentstehung", "Vereinnahmung"],
  },
];

export function getLearningQuestionById(
  id: string,
): LearningQuestion | undefined {
  return learningQuestions.find(
    (question) => question.id === id,
  );
}

export function getLearningQuestionsByTopic(
  topic: string,
): LearningQuestion[] {
  return learningQuestions.filter(
    (question) => question.topic === topic,
  );
}

export function getLearningTopics(): string[] {
  return Array.from(
    new Set(
      learningQuestions.map(
        (question) => question.topic,
      ),
    ),
  );
}
