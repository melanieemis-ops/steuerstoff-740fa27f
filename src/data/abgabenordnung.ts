import type { LearningQuestion } from "./types";

export const abgabenordnungQuestions: LearningQuestion[] = [
{
  id: "ao-001",
  category: "Abgabenordnung",
  topic: "Grundlagen",
  difficulty: "leicht",
  type: "single-choice",

  question: "Was regelt die Abgabenordnung (AO)?",

  options: [
    "Das allgemeine Steuerverfahrensrecht",
    "Nur die Einkommensteuer",
    "Nur die Umsatzsteuer",
    "Die Sozialversicherung"
  ],

  correctAnswer: 0,

  explanation:
    "Die Abgabenordnung enthält die allgemeinen Vorschriften des Steuerrechts und gilt grundsätzlich für alle Steuerarten, soweit keine spezielleren Regelungen bestehen.",

  reference: "§§ 1 ff. AO",

  hint:
    "Die AO ist das 'Grundgesetz' des Steuerverfahrens.",

  tags: [
    "AO",
    "Grundlagen",
    "Steuerrecht"
  ]
},
{
  id: "ao-002",
  category: "Abgabenordnung",
  topic: "Grundlagen",
  difficulty: "leicht",
  type: "single-choice",

  question:
    "Welches Gesetz regelt hauptsächlich die Einkommensteuer?",

  options: [
    "EStG",
    "AO",
    "UStG",
    "BewG"
  ],

  correctAnswer: 0,

  explanation:
    "Die AO regelt das Verfahren. Die Einkommensteuer selbst wird im Einkommensteuergesetz geregelt.",

  reference: "§ 1 EStG",

  hint:
    "Die AO regelt das 'Wie', das EStG das 'Was'.",

  tags: [
    "AO",
    "EStG"
  ]
},
{
  id: "ao-003",
  category: "Abgabenordnung",
  topic: "Grundlagen",
  difficulty: "leicht",
  type: "single-choice",

  question:
    "Wer ist Steuerpflichtiger?",

  options: [
    "Wer nach den Steuergesetzen eine Steuer schuldet oder steuerliche Pflichten hat",
    "Nur Arbeitnehmer",
    "Nur Unternehmer",
    "Nur Kapitalgesellschaften"
  ],

  correctAnswer: 0,

  explanation:
    "Steuerpflichtiger ist jede Person, die nach den Steuergesetzen steuerliche Rechte oder Pflichten besitzt.",

  reference: "§ 33 AO",

  hint:
    "Nicht nur Unternehmen können steuerpflichtig sein.",

  tags: [
    "Steuerpflichtiger",
    "AO"
  ]
},
{
  id: "ao-004",
  category: "Abgabenordnung",
  topic: "Grundlagen",
  difficulty: "leicht",
  type: "single-choice",

  question:
    "Was versteht man unter einem Steuerschuldverhältnis?",

  options: [
    "Alle steuerlichen Rechte und Pflichten zwischen Steuerpflichtigem und Finanzamt",
    "Nur die Einkommensteuer",
    "Nur offene Steuerschulden",
    "Den Steuerbescheid"
  ],

  correctAnswer: 0,

  explanation:
    "Zum Steuerschuldverhältnis gehören sämtliche Ansprüche und Verpflichtungen aus dem Steuerrecht.",

  reference: "§ 37 AO",

  hint:
    "Es geht nicht nur um Schulden.",

  tags: [
    "Steuerschuldverhältnis"
  ]
},
{
  id: "ao-005",
  category: "Abgabenordnung",
  topic: "Grundlagen",
  difficulty: "leicht",
  type: "single-choice",

  question:
    "Welche Behörde setzt Steuern grundsätzlich fest?",

  options: [
    "Das Finanzamt",
    "Die Gemeinde",
    "Das Amtsgericht",
    "Die Industrie- und Handelskammer"
  ],

  correctAnswer: 0,

  explanation:
    "Für die meisten Steuerarten ist das Finanzamt zuständig.",

  reference: "§ 16 AO",

  hint:
    "Dort wird auch die Steuererklärung eingereicht.",

  tags: [
    "Finanzamt"
  ]
},


];