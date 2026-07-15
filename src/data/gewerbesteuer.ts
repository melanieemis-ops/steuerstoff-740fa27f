import type { LearningQuestion } from "./types";

export const gewerbesteuerQuestions: LearningQuestion[] = [ 
{
  id: "gewst-001",

  category: "Gewerbesteuer",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Welches Gesetz regelt die Gewerbesteuer?",

  options: [
    "Gewerbesteuergesetz (GewStG)",
    "Einkommensteuergesetz (EStG)",
    "Abgabenordnung (AO)",
    "Umsatzsteuergesetz (UStG)",
  ],

  correctAnswer: 0,

  explanation:
    "Die Gewerbesteuer wird im Gewerbesteuergesetz geregelt.",

  reference: "§ 1 GewStG",

  hint:
    "Der Name des Gesetzes verrät bereits die Steuerart.",

  tags: [
    "GewStG",
    "Grundlagen",
    "Gesetz"
  ],
},
{
  id: "gewst-002",

  category: "Gewerbesteuer",

  topic: "Grundlagen",

  type: "true-false",

  difficulty: "leicht",

  question:
    "Die Gewerbesteuer ist eine Gemeindesteuer.",

  options: [
    "Richtig",
    "Falsch"
  ],

  correctAnswer: 0,

  explanation:
    "Die Gewerbesteuer steht den Gemeinden zu. Jede Gemeinde legt ihren eigenen Hebesatz fest.",

  reference: "§ 1 GewStG",

  tags: [
    "Gemeinde",
    "Hebesatz",
    "Grundlagen"
  ],
},
{
  id: "gewst-003",

  category: "Gewerbesteuer",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Welche Steuerart ist die Gewerbesteuer?",

  options: [
    "Eine Realsteuer (Objektsteuer)",
    "Eine Verbrauchsteuer",
    "Eine Verkehrsteuer",
    "Eine Besitzsteuer auf Privatvermögen",
  ],

  correctAnswer: 0,

  explanation:
    "Die Gewerbesteuer ist eine Realsteuer. Besteuert wird der Gewerbebetrieb als Steuerobjekt.",

  reference: "§ 3 Abs. 2 AO",

  hint:
    "Nicht die Person, sondern der Gewerbebetrieb steht im Mittelpunkt.",

  tags: [
    "Realsteuer",
    "Objektsteuer",
    "AO"
  ],
},





];