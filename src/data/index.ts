import type {
  LearningCategory,
  LearningQuestion,
} from "./types";

import { umsatzsteuerQuestions } from "./umsatzsteuer";
import { umsatzsteuerErweiterungQuestions } from "./umsatzsteuerErweiterung";
import { abgabenordnungQuestions } from "./abgabenordnung";
import { einkommensteuerQuestions } from "./einkommensteuer";
import { einkommensteuerErweiterungQuestions } from "./einkommensteuerErweiterung";
import { lohnsteuerQuestions } from "./lohnsteuer";
import { gewerbesteuerQuestions } from "./gewerbesteuer";
import { erbschaftsteuerQuestions } from "./erbschaftsteuer";
import { npoQuestions } from "./npo";

export const learningQuestions: LearningQuestion[] = [
  ...umsatzsteuerQuestions,
  ...umsatzsteuerErweiterungQuestions,
  ...abgabenordnungQuestions,
  ...einkommensteuerQuestions,
  ...einkommensteuerErweiterungQuestions,
  ...lohnsteuerQuestions,
  ...gewerbesteuerQuestions,
  ...erbschaftsteuerQuestions,
  ...npoQuestions,
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

export function getLearningQuestionsByCategory(
  category: LearningCategory,
): LearningQuestion[] {
  return learningQuestions.filter(
    (question) => question.category === category,
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

export function getLearningCategories(): LearningCategory[] {
  return Array.from(
    new Set(
      learningQuestions.map(
        (question) => question.category,
      ),
    ),
  );
}