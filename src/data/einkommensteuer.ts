import type { LearningQuestion } from "./types";



export const einkommensteuerQuestions: LearningQuestion[] = [
  {
    id: "est-001",
    category: "Einkommensteuer",
    topic: "Steuerpflicht",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Wer ist grundsätzlich unbeschränkt einkommensteuerpflichtig?",
    options: [
      "Eine natürliche Person mit Wohnsitz oder gewöhnlichem Aufenthalt im Inland",
      "Jede Kapitalgesellschaft mit Sitz im Inland",
      "Nur Arbeitnehmer mit deutschem Arbeitgeber",
      "Jede Person mit einem deutschen Bankkonto",
    ],
    correctAnswer: 0,
    explanation:
      "Unbeschränkt einkommensteuerpflichtig sind grundsätzlich natürliche Personen, die im Inland einen Wohnsitz oder ihren gewöhnlichen Aufenthalt haben.",
    reference: "§ 1 Abs. 1 EStG",
    hint:
      "Entscheidend sind natürliche Person und Inlandsbezug.",
    tags: ["Steuerpflicht", "Wohnsitz", "Gewöhnlicher Aufenthalt"],
  },
  {
    id: "est-002",
    category: "Einkommensteuer",
    topic: "Steuerpflicht",
    type: "true-false",
    difficulty: "leicht",
    question:
      "Die Einkommensteuer betrifft grundsätzlich das Einkommen natürlicher Personen.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Die Einkommensteuer knüpft grundsätzlich an das Einkommen natürlicher Personen an. Juristische Personen unterliegen regelmäßig der Körperschaftsteuer.",
    reference: "§ 1 EStG",
    tags: ["Steuerpflicht", "Natürliche Person", "Grundlagen"],
  },
  {
    id: "est-003",
    category: "Einkommensteuer",
    topic: "Steuerpflicht",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Einkünfte werden bei unbeschränkter Einkommensteuerpflicht grundsätzlich erfasst?",
    options: [
      "Grundsätzlich die in- und ausländischen Einkünfte",
      "Nur Einkünfte aus Deutschland",
      "Nur Arbeitslohn",
      "Nur Einkünfte, die auf ein deutsches Konto fließen",
    ],
    correctAnswer: 0,
    explanation:
      "Die unbeschränkte Steuerpflicht erstreckt sich grundsätzlich auf das Welteinkommen. Doppelbesteuerungsabkommen und besondere Vorschriften können die Besteuerung beeinflussen.",
    reference: "§ 1 Abs. 1 EStG",
    hint:
      "Unbeschränkte Steuerpflicht bedeutet grundsätzlich Welteinkommensprinzip.",
    tags: ["Welteinkommen", "Unbeschränkte Steuerpflicht", "Ausland"],
  },
  {
    id: "est-004",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Wie viele Einkunftsarten nennt § 2 Abs. 1 EStG?",
    options: ["Fünf", "Sechs", "Sieben", "Acht"],
    correctAnswer: 2,
    explanation:
      "Das Einkommensteuergesetz unterscheidet sieben Einkunftsarten.",
    reference: "§ 2 Abs. 1 EStG",
    tags: ["Einkunftsarten", "Grundlagen", "Sieben Einkunftsarten"],
  },
  {
    id: "est-005",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Einkunftsart gehört zu den Gewinneinkünften?",
    options: [
      "Einkünfte aus Gewerbebetrieb",
      "Einkünfte aus nichtselbständiger Arbeit",
      "Einkünfte aus Kapitalvermögen",
      "Einkünfte aus Vermietung und Verpachtung",
    ],
    correctAnswer: 0,
    explanation:
      "Zu den Gewinneinkünften gehören Land- und Forstwirtschaft, Gewerbebetrieb und selbständige Arbeit.",
    reference: "§ 2 Abs. 2 Satz 1 Nr. 1 EStG",
    hint:
      "Bei Gewinneinkünften wird der Gewinn ermittelt.",
    tags: ["Gewinneinkünfte", "Gewerbebetrieb", "Einkunftsarten"],
  },
  {
    id: "est-006",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Einkunftsart gehört zu den Überschusseinkünften?",
    options: [
      "Einkünfte aus selbständiger Arbeit",
      "Einkünfte aus Gewerbebetrieb",
      "Einkünfte aus Vermietung und Verpachtung",
      "Einkünfte aus Land- und Forstwirtschaft",
    ],
    correctAnswer: 2,
    explanation:
      "Einkünfte aus Vermietung und Verpachtung gehören zu den Überschusseinkünften.",
    reference: "§ 2 Abs. 2 Satz 1 Nr. 2 EStG",
    tags: ["Überschusseinkünfte", "Vermietung", "Einkunftsarten"],
  },
  {
    id: "est-007",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Einkünfte aus Kapitalvermögen gehören grundsätzlich zu den Gewinneinkünften.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Einkünfte aus Kapitalvermögen gehören grundsätzlich zu den Überschusseinkünften.",
    reference: "§ 2 Abs. 2 Satz 1 Nr. 2 EStG",
    tags: ["Kapitalvermögen", "Überschusseinkünfte", "Abgrenzung"],
  },
  {
    id: "est-008",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Einkunftsart ist in § 18 EStG geregelt?",
    options: [
      "Einkünfte aus selbständiger Arbeit",
      "Einkünfte aus Gewerbebetrieb",
      "Einkünfte aus Kapitalvermögen",
      "Einkünfte aus Vermietung und Verpachtung",
    ],
    correctAnswer: 0,
    explanation:
      "§ 18 EStG regelt die Einkünfte aus selbständiger Arbeit.",
    reference: "§ 18 EStG",
    tags: ["Selbständige Arbeit", "Paragraph", "Einkunftsarten"],
  },
  {
    id: "est-009",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Einkunftsart ist in § 19 EStG geregelt?",
    options: [
      "Einkünfte aus Gewerbebetrieb",
      "Einkünfte aus nichtselbständiger Arbeit",
      "Einkünfte aus Kapitalvermögen",
      "Sonstige Einkünfte",
    ],
    correctAnswer: 1,
    explanation:
      "§ 19 EStG regelt insbesondere Arbeitslohn aus einem Dienstverhältnis.",
    reference: "§ 19 EStG",
    tags: ["Nichtselbständige Arbeit", "Arbeitslohn", "Paragraph"],
  },
  {
    id: "est-010",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Einkunftsart ist in § 21 EStG geregelt?",
    options: [
      "Einkünfte aus Kapitalvermögen",
      "Einkünfte aus Vermietung und Verpachtung",
      "Einkünfte aus Gewerbebetrieb",
      "Einkünfte aus selbständiger Arbeit",
    ],
    correctAnswer: 1,
    explanation:
      "§ 21 EStG regelt insbesondere Einkünfte aus Vermietung und Verpachtung.",
    reference: "§ 21 EStG",
    tags: ["Vermietung", "Verpachtung", "Paragraph"],
  },
  {
    id: "est-011",
    category: "Einkommensteuer",
    topic: "Einkunftsarten",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Aussage zum Lottogewinn ist grundsätzlich richtig?",
    options: [
      "Er gehört automatisch zu den sonstigen Einkünften",
      "Er gehört grundsätzlich zu keiner der sieben Einkunftsarten",
      "Er ist stets Arbeitslohn",
      "Er gehört immer zu den Einkünften aus Kapitalvermögen",
    ],
    correctAnswer: 1,
    explanation:
      "Ein reiner Lottogewinn ist grundsätzlich keiner der sieben Einkunftsarten zuzuordnen und daher regelmäßig nicht einkommensteuerbar.",
    reference: "§ 2 Abs. 1 EStG",
    hint:
      "Die sieben Einkunftsarten sind abschließend.",
    tags: ["Lottogewinn", "Nicht steuerbar", "Einkunftsarten"],
  },
  {
    id: "est-012",
    category: "Einkommensteuer",
    topic: "Gewinnermittlung",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Wie werden Einkünfte bei den Gewinneinkunftsarten grundsätzlich bezeichnet?",
    options: [
      "Als Gewinn",
      "Als Einnahmen",
      "Als Arbeitslohn",
      "Als Überschuss der privaten Einnahmen",
    ],
    correctAnswer: 0,
    explanation:
      "Bei Land- und Forstwirtschaft, Gewerbebetrieb und selbständiger Arbeit sind die Einkünfte der Gewinn.",
    reference: "§ 2 Abs. 2 Satz 1 Nr. 1 EStG",
    tags: ["Gewinn", "Gewinneinkünfte", "Einkünfteermittlung"],
  },
  {
    id: "est-013",
    category: "Einkommensteuer",
    topic: "Gewinnermittlung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Aussage beschreibt den Betriebsvermögensvergleich vereinfacht?",
    options: [
      "Vergleich des Betriebsvermögens am Schluss zweier Wirtschaftsjahre unter Berücksichtigung von Entnahmen und Einlagen",
      "Vergleich von Einnahmen und Werbungskosten",
      "Vergleich von Bruttolohn und Lohnsteuer",
      "Vergleich von Privatvermögen und Schulden",
    ],
    correctAnswer: 0,
    explanation:
      "Beim Betriebsvermögensvergleich wird die Veränderung des Betriebsvermögens ermittelt und um Entnahmen und Einlagen korrigiert.",
    reference: "§ 4 Abs. 1 EStG",
    tags: ["Betriebsvermögensvergleich", "Gewinnermittlung", "Entnahmen"],
  },
  {
    id: "est-014",
    category: "Einkommensteuer",
    topic: "Gewinnermittlung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wie wird der Gewinn bei der Einnahmenüberschussrechnung grundsätzlich ermittelt?",
    options: [
      "Betriebseinnahmen minus Betriebsausgaben",
      "Einnahmen minus Werbungskosten",
      "Umsatz minus Umsatzsteuer",
      "Privatvermögen minus Schulden",
    ],
    correctAnswer: 0,
    explanation:
      "Bei der Einnahmenüberschussrechnung wird grundsätzlich der Überschuss der Betriebseinnahmen über die Betriebsausgaben ermittelt.",
    reference: "§ 4 Abs. 3 EStG",
    tags: ["EÜR", "Betriebseinnahmen", "Betriebsausgaben"],
  },
  {
    id: "est-015",
    category: "Einkommensteuer",
    topic: "Betriebsausgaben",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Was sind Betriebsausgaben?",
    options: [
      "Aufwendungen, die durch den Betrieb veranlasst sind",
      "Alle privaten Ausgaben des Unternehmers",
      "Nur Ausgaben für Waren",
      "Nur Zahlungen an das Finanzamt",
    ],
    correctAnswer: 0,
    explanation:
      "Betriebsausgaben sind Aufwendungen, die durch den Betrieb veranlasst sind.",
    reference: "§ 4 Abs. 4 EStG",
    tags: ["Betriebsausgaben", "Betriebliche Veranlassung", "Definition"],
  },
  {
    id: "est-016",
    category: "Einkommensteuer",
    topic: "Betriebsausgaben",
    type: "true-false",
    difficulty: "leicht",
    question:
      "Eine ausschließlich betrieblich veranlasste Büromiete kann grundsätzlich Betriebsausgabe sein.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Ist die Büromiete betrieblich veranlasst, kommt grundsätzlich ein Betriebsausgabenabzug in Betracht.",
    reference: "§ 4 Abs. 4 EStG",
    tags: ["Büromiete", "Betriebsausgaben", "Betriebliche Veranlassung"],
  },
  {
    id: "est-017",
    category: "Einkommensteuer",
    topic: "Betriebsausgaben",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Private Lebenshaltungskosten werden allein dadurch zu Betriebsausgaben, dass sie vom Geschäftskonto bezahlt werden.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Entscheidend ist die betriebliche Veranlassung. Die Zahlung vom Geschäftskonto ändert den privaten Charakter einer Ausgabe nicht.",
    reference: "§ 4 Abs. 4 und § 12 Nr. 1 EStG",
    hint:
      "Der Zahlungsweg entscheidet nicht über die steuerliche Einordnung.",
    tags: ["Privatkosten", "Geschäftskonto", "Abzugsverbot"],
  },
  {
    id: "est-018",
    category: "Einkommensteuer",
    topic: "Werbungskosten",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Was sind Werbungskosten?",
    options: [
      "Aufwendungen zur Erwerbung, Sicherung und Erhaltung der Einnahmen",
      "Alle privaten Ausgaben eines Arbeitnehmers",
      "Nur Aufwendungen für Werbung",
      "Nur Kosten eines Gewerbebetriebs",
    ],
    correctAnswer: 0,
    explanation:
      "Werbungskosten sind Aufwendungen zur Erwerbung, Sicherung und Erhaltung der Einnahmen.",
    reference: "§ 9 Abs. 1 Satz 1 EStG",
    tags: ["Werbungskosten", "Definition", "Überschusseinkünfte"],
  },
  {
    id: "est-019",
    category: "Einkommensteuer",
    topic: "Werbungskosten",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Bei welchen Einkunftsarten werden grundsätzlich Werbungskosten abgezogen?",
    options: [
      "Bei den Überschusseinkünften",
      "Nur bei Gewerbebetrieb",
      "Nur bei selbständiger Arbeit",
      "Bei keiner Einkunftsart",
    ],
    correctAnswer: 0,
    explanation:
      "Werbungskosten werden grundsätzlich bei den Überschusseinkunftsarten berücksichtigt.",
    reference: "§ 2 Abs. 2 Satz 1 Nr. 2 und § 9 EStG",
    tags: ["Werbungskosten", "Überschusseinkünfte", "Abzug"],
  },
  {
    id: "est-020",
    category: "Einkommensteuer",
    topic: "Werbungskosten",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Schuldzinsen können Werbungskosten sein, wenn die Schuld wirtschaftlich mit einer Einkunftsart zusammenhängt.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Schuldzinsen können grundsätzlich Werbungskosten sein, wenn ein wirtschaftlicher Zusammenhang mit steuerpflichtigen Einnahmen besteht.",
    reference: "§ 9 Abs. 1 Satz 3 Nr. 1 EStG",
    tags: ["Schuldzinsen", "Werbungskosten", "Veranlassungszusammenhang"],
  },
  {
    id: "est-021",
    category: "Einkommensteuer",
    topic: "Nichtselbständige Arbeit",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welcher Betrag gehört grundsätzlich zu den Einkünften aus nichtselbständiger Arbeit?",
    options: [
      "Arbeitslohn aus einem Dienstverhältnis",
      "Mieteinnahmen aus einer Wohnung",
      "Gewinn aus einem Einzelunternehmen",
      "Zinsen aus einem Sparguthaben",
    ],
    correctAnswer: 0,
    explanation:
      "Arbeitslohn aus einem gegenwärtigen oder früheren Dienstverhältnis gehört grundsätzlich zu den Einkünften aus nichtselbständiger Arbeit.",
    reference: "§ 19 Abs. 1 EStG",
    tags: ["Arbeitslohn", "Nichtselbständige Arbeit", "Dienstverhältnis"],
  },
  {
    id: "est-022",
    category: "Einkommensteuer",
    topic: "Selbständige Arbeit",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Tätigkeit kann grundsätzlich zu Einkünften aus selbständiger Arbeit führen?",
    options: [
      "Die selbständige Tätigkeit eines Rechtsanwalts",
      "Der Betrieb eines Einzelhandelsgeschäfts",
      "Die Vermietung einer privaten Wohnung",
      "Die Tätigkeit eines angestellten Buchhalters",
    ],
    correctAnswer: 0,
    explanation:
      "Die selbständige Tätigkeit eines Rechtsanwalts gehört grundsätzlich zu den freiberuflichen Tätigkeiten des § 18 EStG.",
    reference: "§ 18 Abs. 1 Nr. 1 EStG",
    tags: ["Freiberufler", "Rechtsanwalt", "Selbständige Arbeit"],
  },
  {
    id: "est-023",
    category: "Einkommensteuer",
    topic: "Gewerbebetrieb",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Welche Tätigkeit führt grundsätzlich zu Einkünften aus Gewerbebetrieb?",
    options: [
      "Der selbständige Betrieb eines Einzelhandelsgeschäfts",
      "Die Tätigkeit eines angestellten Verkäufers",
      "Die private Vermietung einer Wohnung",
      "Der Bezug von Sparzinsen",
    ],
    correctAnswer: 0,
    explanation:
      "Ein selbständig betriebener Einzelhandel erfüllt grundsätzlich die Merkmale eines Gewerbebetriebs.",
    reference: "§ 15 Abs. 1 und 2 EStG",
    tags: ["Gewerbebetrieb", "Einzelhandel", "Selbständigkeit"],
  },
  {
    id: "est-024",
    category: "Einkommensteuer",
    topic: "Gewerbebetrieb",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Eine gewerbliche Tätigkeit setzt grundsätzlich eine Gewinnerzielungsabsicht voraus.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 0,
    explanation:
      "Zu den gesetzlichen Merkmalen eines Gewerbebetriebs gehört grundsätzlich die Absicht, Gewinn zu erzielen.",
    reference: "§ 15 Abs. 2 EStG",
    tags: ["Gewinnerzielungsabsicht", "Gewerbebetrieb", "Merkmale"],
  },
  {
    id: "est-025",
    category: "Einkommensteuer",
    topic: "Kapitalvermögen",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Einnahme gehört grundsätzlich zu den Einkünften aus Kapitalvermögen?",
    options: [
      "Zinsen aus einer Kapitalforderung",
      "Arbeitslohn",
      "Mieteinnahmen",
      "Gewinn aus einem Gewerbebetrieb",
    ],
    correctAnswer: 0,
    explanation:
      "Zinsen aus Kapitalforderungen gehören grundsätzlich zu den Einkünften aus Kapitalvermögen.",
    reference: "§ 20 Abs. 1 EStG",
    tags: ["Kapitalvermögen", "Zinsen", "Einkunftsarten"],
  },
  {
    id: "est-026",
    category: "Einkommensteuer",
    topic: "Vermietung und Verpachtung",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Einnahme gehört grundsätzlich zu den Einkünften aus Vermietung und Verpachtung?",
    options: [
      "Miete für eine überlassene Wohnung",
      "Arbeitslohn",
      "Dividenden",
      "Gewinn aus freiberuflicher Tätigkeit",
    ],
    correctAnswer: 0,
    explanation:
      "Entgelte aus der Vermietung unbeweglichen Vermögens gehören grundsätzlich zu den Einkünften aus Vermietung und Verpachtung.",
    reference: "§ 21 Abs. 1 EStG",
    tags: ["Vermietung", "Mieteinnahmen", "Überschusseinkünfte"],
  },
  {
    id: "est-027",
    category: "Einkommensteuer",
    topic: "Private Lebensführung",
    type: "single-choice",
    difficulty: "leicht",
    question:
      "Welche Aufwendungen sind grundsätzlich nicht als Betriebsausgaben oder Werbungskosten abziehbar?",
    options: [
      "Aufwendungen für die private Lebensführung",
      "Betrieblich veranlasste Büromiete",
      "Beruflich veranlasste Fachliteratur",
      "Schuldzinsen für ein vermietetes Objekt",
    ],
    correctAnswer: 0,
    explanation:
      "Aufwendungen für die Lebensführung dürfen grundsätzlich nicht abgezogen werden, auch wenn sie die wirtschaftliche oder gesellschaftliche Stellung fördern.",
    reference: "§ 12 Nr. 1 EStG",
    tags: ["Private Lebensführung", "Abzugsverbot", "Privatausgaben"],
  },
  {
    id: "est-028",
    category: "Einkommensteuer",
    topic: "Private Lebensführung",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Kosten für normale bürgerliche Kleidung sind grundsätzlich allein deshalb abziehbar, weil die Kleidung auch bei der Arbeit getragen wird.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Normale bürgerliche Kleidung gehört grundsätzlich zur privaten Lebensführung. Etwas anderes kann insbesondere bei typischer Berufskleidung gelten.",
    reference: "§ 12 Nr. 1 EStG",
    tags: ["Kleidung", "Privatbereich", "Abzugsverbot"],
  },
  {
    id: "est-029",
    category: "Einkommensteuer",
    topic: "Einkünfteermittlung",
    type: "single-choice",
    difficulty: "mittel",
    question:
      "Wie werden die Einkünfte aus Vermietung und Verpachtung grundsätzlich ermittelt?",
    options: [
      "Einnahmen abzüglich Werbungskosten",
      "Betriebseinnahmen abzüglich Betriebsausgaben",
      "Umsatz abzüglich Umsatzsteuer",
      "Mieteinnahmen ohne Abzug von Aufwendungen",
    ],
    correctAnswer: 0,
    explanation:
      "Bei den Überschusseinkünften werden die Einnahmen um die Werbungskosten vermindert.",
    reference: "§ 2 Abs. 2 Satz 1 Nr. 2 EStG",
    tags: ["Einkünfteermittlung", "Vermietung", "Werbungskosten"],
  },
  {
    id: "est-030",
    category: "Einkommensteuer",
    topic: "Einkünfteermittlung",
    type: "true-false",
    difficulty: "mittel",
    question:
      "Betriebsausgaben und Werbungskosten sind steuerlich dieselbe Bezeichnung für jede Art von Aufwendung.",
    options: ["Richtig", "Falsch"],
    correctAnswer: 1,
    explanation:
      "Betriebsausgaben gehören zu den Gewinneinkünften. Werbungskosten werden bei den Überschusseinkünften berücksichtigt.",
    reference: "§ 2 Abs. 2, § 4 Abs. 4 und § 9 EStG",
    hint:
      "Die Bezeichnung richtet sich nach der jeweiligen Einkunftsart.",
    tags: ["Betriebsausgaben", "Werbungskosten", "Abgrenzung"],
  },
];
