import { useState, useEffect, useCallback } from "react";
import { LearningQuestion, LearningCategory } from "@/data/types";

export interface ExamSessionConfig {
  categories: LearningCategory[];
  questionCount: number;
  timeLimit: number | null; // in minutes, null for no limit
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface ExamQuestion {
  question: LearningQuestion;
  selectedAnswerIndex: number | null;
  isMarked: boolean;
}

export interface ExamSession {
  id: string;
  config: ExamSessionConfig;
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  startTime: number;
  endTime: number | null;
  isSubmitted: boolean;
  isAbandoned: boolean;
}

const STORAGE_KEY = "steuerstoff_exam_session_v1";

export function useExamSession() {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const saveSession = useCallback((sess: ExamSession) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    } catch (error) {
      console.error("Failed to save exam session:", error);
    }
  }, []);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate session structure
        if (parsed.id && parsed.config && parsed.questions && parsed.startTime) {
          setSession(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load exam session:", error);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!session || !session.config.timeLimit || session.isSubmitted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - session.startTime) / 1000);
      const totalSeconds = session.config.timeLimit! * 60;
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);

      setTimeRemaining(remaining);

      if (remaining === 0 && !session.isSubmitted) {
        // Auto-submit
        handleSubmitExam();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, handleSubmitExam]);

  const createSession = useCallback(
    (config: ExamSessionConfig, questions: LearningQuestion[]) => {
      // Shuffle questions if needed
      let shuffledQuestions = [...questions];
      if (config.shuffleQuestions) {
        shuffledQuestions = shuffledQuestions.sort(() => Math.random() - 0.5);
      }

      // Create exam questions with shuffled options if needed
      const examQuestions: ExamQuestion[] = shuffledQuestions.map((q) => {
        let questionCopy = { ...q };

        if (config.shuffleOptions && q.type === "single-choice") {
          // Shuffle options while keeping track of correct answer
          const options = [...q.options];
          const correctAnswerText = q.options[q.correctAnswer];
          const shuffledOptions = options.sort(() => Math.random() - 0.5);
          const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

          questionCopy = {
            ...q,
            options: shuffledOptions,
            correctAnswer: newCorrectIndex,
          };
        }

        return {
          question: questionCopy,
          selectedAnswerIndex: null,
          isMarked: false,
        };
      });

      const newSession: ExamSession = {
        id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        config,
        questions: examQuestions,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        endTime: null,
        isSubmitted: false,
        isAbandoned: false,
      };

      setSession(newSession);
      saveSession(newSession);
      setTimeRemaining(config.timeLimit ? config.timeLimit * 60 : null);

      return newSession;
    },
    [saveSession],
  );

  const selectAnswer = useCallback(
    (questionIndex: number, answerIndex: number) => {
      if (!session || session.isSubmitted) return;

      const updated = {
        ...session,
        questions: session.questions.map((q, idx) =>
          idx === questionIndex ? { ...q, selectedAnswerIndex: answerIndex } : q,
        ),
      };

      setSession(updated);
      saveSession(updated);
    },
    [saveSession, session],
  );

  const toggleMarkQuestion = useCallback(
    (questionIndex: number) => {
      if (!session || session.isSubmitted) return;

      const updated = {
        ...session,
        questions: session.questions.map((q, idx) =>
          idx === questionIndex ? { ...q, isMarked: !q.isMarked } : q,
        ),
      };

      setSession(updated);
      saveSession(updated);
    },
    [saveSession, session],
  );

  const goToQuestion = useCallback(
    (questionIndex: number) => {
      if (!session || questionIndex < 0 || questionIndex >= session.questions.length) return;

      const updated = { ...session, currentQuestionIndex: questionIndex };
      setSession(updated);
      saveSession(updated);
    },
    [saveSession, session],
  );

  const nextQuestion = useCallback(() => {
    if (!session || session.currentQuestionIndex >= session.questions.length - 1) return;

    const updated = { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 };
    setSession(updated);
    saveSession(updated);
  }, [saveSession, session]);

  const previousQuestion = useCallback(() => {
    if (!session || session.currentQuestionIndex <= 0) return;

    const updated = { ...session, currentQuestionIndex: session.currentQuestionIndex - 1 };
    setSession(updated);
    saveSession(updated);
  }, [saveSession, session]);

  const handleSubmitExam = useCallback(() => {
    if (!session || session.isSubmitted) return;

    const updated = {
      ...session,
      isSubmitted: true,
      endTime: Date.now(),
    };

    setSession(updated);
    saveSession(updated);
  }, [saveSession, session]);

  const abandonSession = useCallback(() => {
    if (!session) return;

    setSession(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const getQuestionStats = useCallback(() => {
    if (!session) return null;

    let answered = 0;
    let marked = 0;

    for (const q of session.questions) {
      if (q.selectedAnswerIndex !== null) answered++;
      if (q.isMarked) marked++;
    }

    return {
      total: session.questions.length,
      answered,
      unanswered: session.questions.length - answered,
      marked,
    };
  }, [session]);

  const calculateResults = useCallback(() => {
    if (!session) return null;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const categoryResults: Record<string, { correct: number; total: number }> = {};

    for (const examQ of session.questions) {
      const category = examQ.question.category;
      if (!categoryResults[category]) {
        categoryResults[category] = { correct: 0, total: 0 };
      }
      categoryResults[category].total++;

      if (examQ.selectedAnswerIndex === null) {
        unansweredCount++;
      } else if (examQ.selectedAnswerIndex === examQ.question.correctAnswer) {
        correctCount++;
        categoryResults[category].correct++;
      } else {
        wrongCount++;
      }
    }

    const duration = Math.floor((session.endTime || Date.now() - session.startTime) / 1000 / 60);
    const accuracy = Math.round((correctCount / session.questions.length) * 100);

    return {
      correctCount,
      wrongCount,
      unansweredCount,
      totalQuestions: session.questions.length,
      accuracy,
      duration,
      categoryResults,
      passStatus:
        accuracy >= 80
          ? "excellent"
          : accuracy >= 60
            ? "good"
            : accuracy >= 40
              ? "fair"
              : "needs-work",
    };
  }, [session]);

  return {
    session,
    timeRemaining,
    createSession,
    selectAnswer,
    toggleMarkQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    handleSubmitExam,
    abandonSession,
    getQuestionStats,
    calculateResults,
  };
}
