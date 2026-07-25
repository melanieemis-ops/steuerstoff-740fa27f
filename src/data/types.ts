export type LearningQuestionType =
  | "single-choice"
  | "true-false";

export type LearningDifficulty =
  | "leicht"
  | "mittel"
  | "schwer";

export type LearningCategory =
  | "Umsatzsteuer"
  | "Abgabenordnung"
  | "Einkommensteuer"
  | "Lohnsteuer"
  | "Gewerbesteuer"
  | "Erbschaftsteuer"
  | "NPO und Gemeinnützigkeit";

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
