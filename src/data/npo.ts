import type { LearningQuestion } from "./types";

export const npoQuestions: LearningQuestion[] = [   
{
  id: "npo-001",

  category: "NPO und Gemeinnützigkeit",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Welches Gesetz enthält die steuerlichen Voraussetzungen der Gemeinnützigkeit?",

  options: [
    "Die Abgabenordnung (AO)",
    "Das Einkommensteuergesetz (EStG)",
    "Das Umsatzsteuergesetz (UStG)",
    "Das Gewerbesteuergesetz (GewStG)",
  ],

  correctAnswer: 0,

  explanation:
    "Die Voraussetzungen für die steuerliche Gemeinnützigkeit sind in den §§ 51 bis 68 AO geregelt.",

  reference: "§§ 51–68 AO",

  hint:
    "Die Gemeinnützigkeit ist Teil der Abgabenordnung.",

  tags: [
    "Gemeinnützigkeit",
    "AO",
    "Grundlagen",
  ],
},
{
  id: "npo-002",

  category: "NPO und Gemeinnützigkeit",

  topic: "Grundlagen",

  type: "true-false",

  difficulty: "leicht",

  question:
    "Die Voraussetzungen der Gemeinnützigkeit sind in der Abgabenordnung geregelt.",

  options: [
    "Richtig",
    "Falsch",
  ],

  correctAnswer: 0,

  explanation:
    "Die steuerlichen Voraussetzungen für gemeinnützige Körperschaften ergeben sich aus den §§ 51 bis 68 AO.",

  reference: "§§ 51–68 AO",

  tags: [
    "AO",
    "Gemeinnützigkeit",
  ],
},
{
  id: "npo-003",

  category: "NPO und Gemeinnützigkeit",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "leicht",

  question:
    "Welches Ziel verfolgt eine gemeinnützige Körperschaft?",

  options: [
    "Die Förderung der Allgemeinheit auf materiellem, geistigem oder sittlichem Gebiet",
    "Die Gewinnerzielung für ihre Mitglieder",
    "Die Ausschüttung von Gewinnen",
    "Den Handel mit Wertpapieren",
  ],

  correctAnswer: 0,

  explanation:
    "Gemeinnützig ist eine Körperschaft, wenn ihre Tätigkeit darauf gerichtet ist, die Allgemeinheit selbstlos zu fördern.",

  reference: "§ 52 AO",

  hint:
    "Im Mittelpunkt steht die Allgemeinheit.",

  tags: [
    "Gemeinnützigkeit",
    "Allgemeinheit",
  ],
},
{
  id: "npo-004",

  category: "NPO und Gemeinnützigkeit",

  topic: "Grundlagen",

  type: "single-choice",

  difficulty: "mittel",

  question:
    "Welche Aussage beschreibt den Grundsatz der Selbstlosigkeit am besten?",

  options: [
    "Die Körperschaft verfolgt nicht in erster Linie eigenwirtschaftliche Zwecke.",
    "Die Körperschaft erzielt niemals Einnahmen.",
    "Die Körperschaft darf keine Arbeitnehmer beschäftigen.",
    "Die Körperschaft darf keine Rücklagen bilden.",
  ],

  correctAnswer: 0,

  explanation:
    "Eine Körperschaft handelt selbstlos, wenn sie nicht in erster Linie eigenwirtschaftliche Zwecke verfolgt.",

  reference: "§ 55 AO",

  hint:
    "Einnahmen sind erlaubt – entscheidend ist der Zweck.",

  tags: [
    "Selbstlosigkeit",
    "§55 AO",
  ],
},
{
  id: "npo-005",

  category: "NPO und Gemeinnützigkeit",

  topic: "Grundlagen",

  type: "true-false",

  difficulty: "mittel",

  question:
    "Eine gemeinnützige Körperschaft darf grundsätzlich Gewinne an ihre Mitglieder ausschütten.",

  options: [
    "Richtig",
    "Falsch",
  ],

  correctAnswer: 1,

  explanation:
    "Mittel einer gemeinnützigen Körperschaft dürfen grundsätzlich nicht an Mitglieder ausgeschüttet werden.",

  reference: "§ 55 AO",

  tags: [
    "Selbstlosigkeit",
    "Mitglieder",
    "Gemeinnützigkeit",
  ],
},
];