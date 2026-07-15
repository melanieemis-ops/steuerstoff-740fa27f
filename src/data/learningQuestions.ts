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
    hint:
      "Nettobetrag × Steuersatz.",
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
    hint:
      "Ausgangsumsatzsteuer minus abziehbare Vorsteuer.",
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