import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { learningQuestions } from "@/data";
import { buildAchievements, getCurrentLearningStreak, type AchievementIcon } from "@/lib/achievements";
import { getLearningStatistics, loadLearningProgress } from "@/lib/learningProgress";

export const Route = createFileRoute("/erfolge")({
  component: AchievementsPage,
  head: () => ({
    meta: [
      { title: "Erfolge · steuerstoff" },
      {
        name: "description",
        content: "Deine Abzeichen, Lernziele und Lernserie in der steuerstoff Akademie.",
      },
    ],
  }),
});

const ICONS: Record<AchievementIcon, typeof Trophy> = {
  sparkles: Sparkles,
  check: CheckCircle2,
  target: Target,
  flame: Flame,
  trophy: Trophy,
  brain: Brain,
  star: Star,
  crown: Crown,
};

function AchievementsPage() {
  const progress = loadLearningProgress();
  const statistics = getLearningStatistics(
    learningQuestions.map((question) => question.id),
    progress,
  );
  const achievements = buildAchievements(statistics, progress, learningQuestions.length);
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  const streak = getCurrentLearningStreak(progress);
  const completion = achievements.length > 0 ? Math.round((unlocked / achievements.length) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <Link
              to="/lernen/akademie"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Zur Akademie
            </Link>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Trophy className="h-7 w-7" />
                </span>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Deine Erfolge
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Jeder Lernschritt zählt.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Abzeichen werden automatisch aus deinem Lernfortschritt freigeschaltet und bleiben auf diesem Gerät gespeichert.
                </p>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Übersicht
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Metric value={`${unlocked}/${achievements.length}`} label="Abzeichen" />
                  <Metric value={`${completion} %`} label="Freigeschaltet" />
                  <Metric value={statistics.totalAnswered} label="Antworten" />
                  <Metric value={`${streak} Tage`} label="Lernserie" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Abzeichen
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Deine nächsten Lernziele
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => {
              const Icon = ICONS[achievement.icon];
              const progressPercent = Math.min(
                100,
                Math.round((Math.min(achievement.current, achievement.target) / Math.max(1, achievement.target)) * 100),
              );

              return (
                <article
                  key={achievement.id}
                  className={[
                    "relative overflow-hidden rounded-[1.75rem] border p-5 shadow-sm sm:p-6",
                    achievement.unlocked
                      ? "border-violet-200 bg-gradient-to-br from-violet-50 to-card"
                      : "border-border/70 bg-card",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={[
                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                        achievement.unlocked
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-6 w-6" />
                    </span>

                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        achievement.unlocked
                          ? "bg-violet-100 text-violet-700"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {achievement.unlocked ? (
                        <>
                          <Sparkles className="h-3 w-3" /> Freigeschaltet
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Offen
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-foreground">{achievement.title}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
                    {achievement.description}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                      <span>Fortschritt</span>
                      <span className="tabular-nums">
                        {Math.min(achievement.current, achievement.target)}{achievement.unit ?? ""} / {achievement.target}{achievement.unit ?? ""}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={[
                          "h-full rounded-full transition-[width] duration-500",
                          achievement.unlocked ? "bg-violet-600" : "bg-foreground",
                        ].join(" ")}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
