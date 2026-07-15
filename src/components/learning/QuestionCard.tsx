import type { LearningQuestion } from "@/data/types";

interface QuestionCardProps {
  question: LearningQuestion;
}

export function QuestionCard({
  question,
}: QuestionCardProps) {
  return (
    <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Frage
      </p>

      <h2 className="mt-4 text-2xl font-semibold leading-relaxed text-foreground">
        {question.question}
      </h2>

    </div>
  );
}