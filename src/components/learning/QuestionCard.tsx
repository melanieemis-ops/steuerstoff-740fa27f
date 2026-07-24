import type { LearningQuestion } from "@/data/types";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SimpleReadAloudButton } from "@/components/tts/SimpleReadAloudButton";

interface QuestionCardProps {
  question: LearningQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isQuestionFavorite = isFavorite(question.id);

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: question.id,
      title: question.question,
      category: question.category,
      source: "/lerngebiete",
      description: question.topic,
      savedAt: Date.now(),
    });
  };

  return (
    <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Frage
          </p>

          <h2 className="mt-4 text-2xl font-semibold leading-relaxed text-foreground">
            {question.question}
          </h2>

          <SimpleReadAloudButton
            text={question.question}
            label="Frage anhören"
            className="mt-5"
          />
        </div>

        <div className="shrink-0">
          <FavoriteButton
            isFavorite={isQuestionFavorite}
            onClick={handleToggleFavorite}
          />
        </div>
      </div>
    </div>
  );
}
