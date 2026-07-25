import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";

import { LearningSession } from "@/components/learning/LearningSession";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { learningQuestions } from "@/data";
import type { LearningCategory } from "@/data/types";

const LEARNING_CATEGORIES: LearningCategory[] = [
  "Umsatzsteuer",
  "Abgabenordnung",
  "Einkommensteuer",
  "Lohnsteuer",
  "Gewerbesteuer",
  "Erbschaftsteuer",
  "NPO und Gemeinnützigkeit",
];

type LearningSearch = {
  category: LearningCategory;
};

export const Route = createFileRoute("/lernen")({
  validateSearch: (
    search: Record<string, unknown>,
  ): LearningSearch => {
    const requestedCategory = search.category;

    return {
      category:
        typeof requestedCategory === "string" &&
        LEARNING_CATEGORIES.includes(
          requestedCategory as LearningCategory,
        )
          ? (requestedCategory as LearningCategory)
          : "Umsatzsteuer",
    };
  },
  component: LearningPage,
  head: () => ({
    meta: [
      {
        title: "Lernen · steuerstoff",
      },
      {
        name: "description",
        content:
          "Interaktiver Lernmodus der steuerstoff Akademie.",
      },
    ],
  }),
});

function LearningPage() {
  const { category } = Route.useSearch();

  const categoryQuestions = learningQuestions.filter(
    (question) => question.category === category,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
            <Link
              to="/lerngebiete"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Lernbereiche
            </Link>

            <div className="mt-5 flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                <BookOpen className="h-5 w-5" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  steuerstoff Akademie
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {category} lernen
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Beantworte zehn zufällige Fragen und erhalte nach
                  jeder Antwort sofort eine Erklärung und die passende
                  Fundstelle.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <LearningSession
            key={category}
            questions={categoryQuestions}
            sessionSize={10}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
