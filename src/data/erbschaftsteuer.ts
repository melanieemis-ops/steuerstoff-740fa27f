import type { LearningQuestion } from "./types";

export const erbschaftsteuerQuestions: LearningQuestion[] = [ {
  id: "erbst-001",

  category: "Erbschaftsteuer",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Welches Gesetz regelt die Erbschaft- und Schenkungsteuer?",

  options: [
    "Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)",
    "Bewertungsgesetz (BewG)",
    "Abgabenordnung (AO)",
    "Einkommensteuergesetz (EStG)",
  ],

  correctAnswer: 0,

  explanation:
    "Die Erbschaftsteuer und die Schenkungsteuer werden im Erbschaftsteuer- und Schenkungsteuergesetz geregelt.",

  reference: "§ 1 ErbStG",

  hint:
    "Der Name des Gesetzes verrät bereits den Inhalt.",

  tags: [
    "ErbStG",
    "Grundlagen",
    "Gesetz"
  ],
},
{
  id: "erbst-002",

  category: "Erbschaftsteuer",

  topic: "Grundlagen",

  type: "true-false",

  difficulty: "leicht",

  question:
    "Die Schenkungsteuer und die Erbschaftsteuer werden im selben Gesetz geregelt.",

  options: [
    "Richtig",
    "Falsch"
  ],

  correctAnswer: 0,

  explanation:
    "Beide Steuerarten werden gemeinsam im Erbschaftsteuer- und Schenkungsteuergesetz geregelt.",

  reference: "§ 1 ErbStG",

  tags: [
    "Grundlagen",
    "ErbStG"
  ],
},
{
  id: "erbst-003",

  category: "Erbschaftsteuer",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Was ist ein Erwerb von Todes wegen?",

  options: [
    "Der Vermögensübergang aufgrund des Todes einer Person",
    "Der Verkauf eines Hauses",
    "Eine Schenkung unter Lebenden",
    "Eine Auszahlung eines Gehalts",
  ],

  correctAnswer: 0,

  explanation:
    "Ein Erwerb von Todes wegen liegt vor, wenn Vermögen aufgrund des Todes einer Person auf einen Erwerber übergeht.",

  reference: "§ 3 ErbStG",

  hint:
    "Entscheidend ist der Tod des Erblassers.",

  tags: [
    "Erwerb von Todes wegen",
    "Erbschaft"
  ],
},
{
  id: "erbst-004",

  category: "Erbschaftsteuer",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Welche Aussage beschreibt eine Schenkung unter Lebenden am besten?",

  options: [
    "Eine unentgeltliche Vermögensübertragung zwischen lebenden Personen",
    "Ein Kaufvertrag",
    "Ein Erbfall",
    "Ein Arbeitsvertrag",
  ],

  correctAnswer: 0,

  explanation:
    "Eine Schenkung unter Lebenden ist eine unentgeltliche Vermögensübertragung zwischen lebenden Personen.",

  reference: "§ 7 ErbStG",

  hint:
    "Niemand muss dafür sterben.",

  tags: [
    "Schenkung",
    "Unentgeltlich"
  ],
},
{
  id: "erbst-005",

  category: "Erbschaftsteuer",

  topic: "Grundlagen",

  type: "true-false",

  difficulty: "leicht",

  question:
    "Eine Erbschaft setzt grundsätzlich den Tod des Erblassers voraus.",

  options: [
    "Richtig",
    "Falsch"
  ],

  correctAnswer: 0,

  explanation:
    "Erst mit dem Tod des Erblassers kann ein Erwerb von Todes wegen entstehen.",

  reference: "§ 3 ErbStG",

  tags: [
    "Erbfall",
    "Grundlagen"
  ],
},









];