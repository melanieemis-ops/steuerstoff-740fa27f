import { useCallback, useState } from "react";

export interface Mistake {
  id: string;
  questionText: string;
  category: string;
  topic: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  reference: string;
  hint?: string;
  tags: string[];
  wrongCount: number;
  correctStreak: number;
  firstWrongAt: number;
  lastWrongAt: number;
  lastReviewedAt: number | null;
  status: "active" | "mastered";
}

const STORAGE_KEY = "steuerstoff_mistakes_v1";

function loadMistakes(): Mistake[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Mistake[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((m) => m && typeof m.id === "string");
  } catch {
    return [];
  }
}

function saveMistakes(mistakes: Mistake[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

export function useMistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>(() => loadMistakes());

  const addMistake = useCallback(
    (mistake: Omit<Mistake, "wrongCount" | "correctStreak" | "firstWrongAt" | "lastWrongAt" | "lastReviewedAt" | "status">) => {
      setMistakes((prev) => {
        const exists = prev.find((m) => m.id === mistake.id);
        if (exists) {
          // Update existing mistake
          const updated = prev.map((m) =>
            m.id === mistake.id
              ? {
                  ...m,
                  wrongCount: m.wrongCount + 1,
                  correctStreak: 0,
                  lastWrongAt: Date.now(),
                  status: "active" as const,
                }
              : m,
          );
          saveMistakes(updated);
          return updated;
        }

        // Add new mistake
        const newMistake: Mistake = {
          ...mistake,
          wrongCount: 1,
          correctStreak: 0,
          firstWrongAt: Date.now(),
          lastWrongAt: Date.now(),
          lastReviewedAt: null,
          status: "active",
        };
        const updated = [newMistake, ...prev];
        saveMistakes(updated);
        return updated;
      });
    },
    [],
  );

  const updateMistake = useCallback((id: string, updates: Partial<Mistake>) => {
    setMistakes((prev) => {
      const updated = prev.map((m) =>
        m.id === id
          ? { ...m, ...updates }
          : m,
      );
      saveMistakes(updated);
      return updated;
    });
  }, []);

  const removeMistake = useCallback((id: string) => {
    setMistakes((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveMistakes(updated);
      return updated;
    });
  }, []);

  const recordCorrectAnswer = useCallback((id: string) => {
    setMistakes((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== id) return m;

        const newStreak = m.correctStreak + 1;
        const isMastered = newStreak >= 2;

        return {
          ...m,
          correctStreak: newStreak,
          lastReviewedAt: Date.now(),
          status: isMastered ? ("mastered" as const) : ("active" as const),
        };
      });
      saveMistakes(updated);
      return updated;
    });
  }, []);

  const recordWrongAnswer = useCallback((id: string) => {
    setMistakes((prev) => {
      const updated = prev.map((m) =>
        m.id === id
          ? {
              ...m,
              wrongCount: m.wrongCount + 1,
              correctStreak: 0,
              lastWrongAt: Date.now(),
              status: "active" as const,
            }
          : m,
      );
      saveMistakes(updated);
      return updated;
    });
  }, []);

  const clearMistakes = useCallback(() => {
    setMistakes([]);
    saveMistakes([]);
  }, []);

  const clearActiveMistakes = useCallback(() => {
    setMistakes((prev) => {
      const updated = prev.filter((m) => m.status === "mastered");
      saveMistakes(updated);
      return updated;
    });
  }, []);

  const isMistake = useCallback((id: string) => mistakes.some((m) => m.id === id), [mistakes]);

  const getActiveMistakes = useCallback(
    () => mistakes.filter((m) => m.status === "active"),
    [mistakes],
  );

  const getMasteredMistakes = useCallback(
    () => mistakes.filter((m) => m.status === "mastered"),
    [mistakes],
  );

  const getMistakeById = useCallback((id: string) => mistakes.find((m) => m.id === id), [mistakes]);

  const addMistakesFromExam = useCallback(
    (questions: any[]) => {
      setMistakes((prev) => {
        let updated = [...prev];

        for (const question of questions) {
          const exists = updated.find((m) => m.id === question.id);

          if (exists) {
            // Update existing mistake
            updated = updated.map((m) =>
              m.id === question.id
                ? {
                    ...m,
                    wrongCount: m.wrongCount + 1,
                    correctStreak: 0,
                    lastWrongAt: Date.now(),
                    status: "active" as const,
                  }
                : m,
            );
          } else {
            // Add new mistake
            const newMistake: Mistake = {
              id: question.id,
              questionText: question.question,
              category: question.category,
              topic: question.topic,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              reference: question.reference,
              hint: question.hint,
              tags: question.tags || [],
              wrongCount: 1,
              correctStreak: 0,
              firstWrongAt: Date.now(),
              lastWrongAt: Date.now(),
              lastReviewedAt: null,
              status: "active",
            };
            updated = [newMistake, ...updated];
          }
        }

        saveMistakes(updated);
        return updated;
      });
    },
    [],
  );

  return {
    mistakes,
    addMistake,
    updateMistake,
    removeMistake,
    recordCorrectAnswer,
    recordWrongAnswer,
    clearMistakes,
    clearActiveMistakes,
    isMistake,
    getActiveMistakes,
    getMasteredMistakes,
    getMistakeById,
    addMistakesFromExam,
  };
}
