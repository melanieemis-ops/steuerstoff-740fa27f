import { useCallback, useMemo, useState } from "react";

import type { LearningQuestion } from "@/data/types";
import {
  recordLearningAnswer,
  type LearningProgressState,
} from "@/lib/learningProgress";

interface UseLearningSessionOptions {
  questions: LearningQuestion[];
  sessionSize?: number;
  random?: boolean;
  onProgressChange?: (
    progress: LearningProgressState,
  ) => void;
}

function shuffleQuestions(
  questions: LearningQuestion[],
): LearningQuestion[] {
  const shuffled = [...questions];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createSessionQuestions({
  questions,
  sessionSize,
  random,
}: {
  questions: LearningQuestion[];
  sessionSize: number;
  random: boolean;
}): LearningQuestion[] {
  const preparedQuestions = random
    ? shuffleQuestions(questions)
    : [...questions];

  return preparedQuestions.slice(
    0,
    Math.min(sessionSize, preparedQuestions.length),
  );
}

export function useLearningSession({
  questions,
  sessionSize = 10,
  random = true,
  onProgressChange,
}: UseLearningSessionOptions) {
  const [sessionQuestions, setSessionQuestions] =
    useState<LearningQuestion[]>(() =>
      createSessionQuestions({
        questions,
        sessionSize,
        random,
      }),
    );

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] =
    useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion =
    sessionQuestions[currentIndex];

  const totalQuestions = sessionQuestions.length;

  const answeredQuestions =
    correctAnswers + wrongAnswers;

  const progressPercent =
    totalQuestions === 0
      ? 0
      : Math.round(
          (answeredQuestions / totalQuestions) * 100,
        );

  const resultPercent =
    totalQuestions === 0
      ? 0
      : Math.round(
          (correctAnswers / totalQuestions) * 100,
        );

  const isAnswerCorrect =
    currentQuestion !== undefined &&
    selectedAnswer ===
      currentQuestion.correctAnswer;

  const canCheck =
    selectedAnswer !== null && !checked;

  const canContinue = checked;

  const checkAnswer = useCallback(() => {
    if (
      !currentQuestion ||
      selectedAnswer === null ||
      checked
    ) {
      return;
    }

    const correct =
      selectedAnswer ===
      currentQuestion.correctAnswer;

    const nextProgress = recordLearningAnswer(
      currentQuestion.id,
      correct,
    );

    onProgressChange?.(nextProgress);

    if (correct) {
      setCorrectAnswers((value) => value + 1);
    } else {
      setWrongAnswers((value) => value + 1);
    }

    setChecked(true);
  }, [
    checked,
    currentQuestion,
    onProgressChange,
    selectedAnswer,
  ]);

  const nextQuestion = useCallback(() => {
    if (!checked) {
      return;
    }

    const isLastQuestion =
      currentIndex >= sessionQuestions.length - 1;

    if (isLastQuestion) {
      setFinished(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedAnswer(null);
    setChecked(false);
    setShowHint(false);
  }, [
    checked,
    currentIndex,
    sessionQuestions.length,
  ]);

  const restartSession = useCallback(() => {
    setSessionQuestions(
      createSessionQuestions({
        questions,
        sessionSize,
        random,
      }),
    );

    setCurrentIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setShowHint(false);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setFinished(false);
  }, [questions, random, sessionSize]);

  const status = useMemo(() => {
    if (totalQuestions === 0) {
      return "empty";
    }

    if (finished) {
      return "finished";
    }

    if (checked) {
      return "answered";
    }

    return "question";
  }, [checked, finished, totalQuestions]);

  return {
    sessionQuestions,
    currentQuestion,
    currentIndex,
    totalQuestions,

    selectedAnswer,
    checked,
    showHint,
    finished,
    status,

    correctAnswers,
    wrongAnswers,
    answeredQuestions,
    progressPercent,
    resultPercent,

    isAnswerCorrect,
    canCheck,
    canContinue,

    selectAnswer: setSelectedAnswer,
    showCurrentHint: () => setShowHint(true),
    checkAnswer,
    nextQuestion,
    restartSession,
  };
}