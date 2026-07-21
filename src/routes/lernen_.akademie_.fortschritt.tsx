import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  Flame,
  Target,
  TrendingUp,
  Brain,
  Calendar,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useProgress, loadProgress, resetProgress, getLast7DaysActivity } from '@/hooks/useProgress';
import { useMistakes } from '@/hooks/useMistakes';

export const Route = createFileRoute('/lernen_/akademie_/fortschritt')({
  component: FortschrittPage,
  head: () => ({
    meta: [
      { title: 'Fortschritt · steuerstoff' },
      {
        name: 'description',
        content: 'Dein persönlicher Lernfortschritt und Statistiken.',
      },
    ],
  }),
});

function FortschrittPage() {
  const { progress, getAccuracy, getCategoryProgress, getLast7Days } = useProgress();
  const { getActiveMistakes, getMasteredMistakes } = useMistakes();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hasActivity = progress.totalQuestionsAnswered > 0;
  const accuracy = getAccuracy();
  const categoryProgress = getCategoryProgress();
  const last7Days = getLast7Days();
  const activeMistakes = getActiveMistakes();
  const masteredMistakes = getMasteredMistakes();

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    window.location.reload();
  };

  if (!hasActivity) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 px-4 py-8 sm:px-6">
          <Link
            to="/lernen/akademie"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Akademie
          </Link>

          <div className="mx-auto max-w-2xl rounded-2xl border border-border/70 bg-card p-8 text-center sm:p-12">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">
              Dein Lernfortschritt beginnt hier
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Beantworte Lernfragen, wiederhole Lernkarten oder starte den Fehlertrainer. Deine
              Ergebnisse werden anschließend automatisch hier angezeigt.
            </p>

            <Link
              to="/lerngebiete"
              className="mt-8 inline-flex rounded-2xl bg-foreground px-6 py-3 font-semibold text-background transition hover:opacity-90"
            >
              Jetzt lernen
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/lernen/akademie"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Akademie
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Dein Fortschritt
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Hier siehst du, was du bereits geschafft hast und wo du weiterlernen kannst.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={CheckCircle2}
              label="Beantwortete Fragen"
              value={progress.totalQuestionsAnswered}
              suffix=""
            />
            <StatCard
              icon={Target}
              label="Trefferquote"
              value={accuracy}
              suffix="%"
            />
            <StatCard
              icon={CheckCircle2}
              label="Richtige Antworten"
              value={progress.correctAnswers}
              suffix=""
            />
            <StatCard
              icon={Brain}
              label="Lernkarten wiederholt"
              value={progress.totalLearningCardsReviewed}
              suffix=""
            />
            <StatCard
              icon={Flame}
              label="Aktuelle Lernserie"
              value={progress.currentStreak}
              suffix="Tage"
            />
            <StatCard
              icon={TrendingUp}
              label="Längste Serie"
              value={progress.longestStreak}
              suffix="Tage"
            />
          </div>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Aktivität der letzten 7 Tage</h2>
            <ActivityChart activityData={last7Days} />
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Fortschritt nach Themenbereich</h2>
            {categoryProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Aktivität in Themenbereichen.</p>
            ) : (
              <div className="space-y-3">
                {categoryProgress.map((cat) => (
                  <CategoryCard key={cat.categoryId} category={cat} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Fehlertrainer</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                icon={Brain}
                label="Aktive Fehlerfragen"
                value={activeMistakes.length}
                suffix=""
              />
              <StatCard
                icon={CheckCircle2}
                label="Gemeisterte Fehlerfragen"
                value={masteredMistakes.length}
                suffix=""
              />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Letzte Aktivitäten
            </h2>
            {progress.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Aktivitäten.</p>
            ) : (
              <div className="space-y-2">
                {progress.recentActivities.slice(0, 10).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-12 rounded-2xl border border-border/70 bg-card/50 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Lernfortschritt zurücksetzen</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Alle gespeicherten Lernstatistiken und Serien werden gelöscht. Favoriten bleiben
              erhalten.
            </p>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Fortschritt löschen
              </button>
            ) : (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-900">Fortschritt wirklich zurücksetzen?</p>
                <p className="mt-1 text-sm text-red-800">
                  Alle gespeicherten Lernstatistiken und Serien werden gelöscht. Favoriten bleiben
                  erhalten.
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Fortschritt löschen
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: any;
  label: string;
  value: number | string;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {value}
            {suffix && <span className="ml-1 text-lg text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}

function ActivityChart({ activityData }: { activityData: Record<string, number> }) {
  const max = Math.max(...Object.values(activityData), 1);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <div className="flex items-end justify-between gap-2 h-48">
        {Object.entries(activityData).map(([date, count]) => {
          const height = max > 0 ? (count / max) * 100 : 0;
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center">
                <div
                  className="w-3/4 rounded-t-lg bg-emerald-500 transition-all"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                  title={`${count} Aktivitäten`}
                />
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">{dayName}</p>
              {count > 0 && <p className="text-[10px] text-muted-foreground">{count}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: any }) {
  const progressPercent = Math.min(100, category.accuracy || 0);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{category.categoryName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.answeredQuestions} Fragen · {category.correctAnswers} richtig
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground min-w-[50px]">
              {category.accuracy}%
            </span>
          </div>
        </div>

        {category.lastActivityAt && (
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">
              {new Date(category.lastActivityAt).toLocaleDateString('de-DE', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'question_correct':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'question_wrong':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'training_session':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'mistake_mastered':
        return <Flame className="h-4 w-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLabel = () => {
    switch (activity.type) {
      case 'question_correct':
        return `✓ ${activity.title}`;
      case 'question_wrong':
        return `✗ ${activity.title}`;
      case 'training_session':
        return activity.title;
      case 'mistake_mastered':
        return `🎉 ${activity.title}`;
      default:
        return activity.title;
    }
  };

  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{getLabel()}</p>
        <p className="text-xs text-muted-foreground">{activity.category}</p>
      </div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</p>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes}m`;
  if (hours < 24) return `vor ${hours}h`;
  if (days < 7) return `vor ${days}d`;

  return new Date(timestamp).toLocaleDateString('de-DE', {
    month: 'short',
    day: 'numeric',
  });
}
