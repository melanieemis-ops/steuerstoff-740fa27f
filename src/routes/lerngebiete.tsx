import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  FileText,
  HeartHandshake,
  Landmark,
  Lock,
  ReceiptText,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { learningQuestions } from "@/data";
import type { LearningCategory } from "@/data/types";

export const Route = createFileRoute("/lerngebiete")({
  component: LerngebietePage,
  head: () => ({
    meta: [
      {
        title: "Lernbereiche · steuerstoff",
      },
      {
        name: "description",
        content:
          "Wähle deinen Lernbereich in der steuerstoff Akademie.",
      },
    ],
  }),
});

type Subject = {
  category: LearningCategory;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  iconClass: string;
};

const SUBJECTS: Subject[] = [
  {
    category: "Umsatzsteuer",
    title: "Umsatzsteuer",
    shortTitle: "USt",
    description:
      "Steuerbarkeit, Leistungsort, Steuersätze, Rechnungen, Vorsteuer und Reverse Charge.",
    icon: ReceiptText,
    accentClass: "bg-emerald-100 text-emerald-800",
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    category: "Abgabenordnung",
    title: "Abgabenordnung",
    shortTitle: "AO",
    description:
      "Verwaltungsakte, Fristen, Einspruch, Verjährung und Korrekturvorschriften.",
    icon: Scale,
    accentClass: "bg-violet-100 text-violet-800",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    category: "Einkommensteuer",
    title: "Einkommensteuer",
    shortTitle: "ESt",
    description:
      "Steuerpflicht, Einkunftsarten, Gewinnermittlung, Werbungskosten und Betriebsausgaben.",
    icon: Calculator,
    accentClass: "bg-blue-100 text-blue-800",
    iconClass: "bg-blue-100 text-blue-700",
  },
  {
    category: "Gewerbesteuer",
    title: "Gewerbesteuer",
    shortTitle: "GewSt",
    description:
      "Gewerbeertrag, Hinzurechnungen, Kürzungen, Freibetrag und Messbetrag.",
    icon: Building2,
    accentClass: "bg-amber-100 text-amber-800",
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    category: "Erbschaftsteuer",
    title: "Erbschaft- und Schenkungsteuer",
    shortTitle: "ErbSt",
    description:
      "Steuerklassen, Freibeträge, Bewertung, Erwerbe und Verschonungsregeln.",
    icon: Landmark,
    accentClass: "bg-rose-100 text-rose-800",
    iconClass: "bg-rose-100 text-rose-700",
  },
  {
    category: "NPO und Gemeinnützigkeit",
    title: "NPO und Gemeinnützigkeit",
    shortTitle: "NPO",
    description:
      "Sphären, Mittelverwendung, Rücklagen, Zweckbetriebe und Spendenrecht.",
    icon: HeartHandshake,
    accentClass: "bg-teal-100 text-teal-800",
    iconClass: "bg-teal-100 text-teal-700",
  },
];

function LerngebietePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <Link
              to="/lernen/akademie"
              search={{ category: "Umsatzsteuer" }}
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Akademie
            </Link>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  steuerstoff Akademie
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Wähle deinen Lernbereich
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Wähle ein Fachgebiet und starte eine zufällige Lernrunde.
                  Bereiche ohne Fragen bleiben sichtbar und werden automatisch
                  freigeschaltet, sobald Inhalte vorhanden sind.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Aktuell verfügbar
                  </p>

                  <p className="text-sm font-semibold text-foreground">
                    {learningQuestions.length} Fragen
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SUBJECTS.map((subject) => {
              const questionCount = learningQuestions.filter(
                (question) =>
                  question.category === subject.category,
              ).length;

              return (
                <SubjectCard
                  key={subject.category}
                  subject={subject}
                  questionCount={questionCount}
                />
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SubjectCard({
  subject,
  questionCount,
}: {
  subject: Subject;
  questionCount: number;
}) {
  const Icon = subject.icon;
  const available = questionCount > 0;

  if (available) {
    return (
      <Link
        to="/lernen"
        search={{ category: subject.category }}
        className="group flex min-h-72 flex-col rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${subject.iconClass}`}
          >
            <Icon className="h-6 w-6" />
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${subject.accentClass}`}
          >
            Verfügbar
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {subject.shortTitle}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {subject.title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {subject.description}
          </p>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {questionCount}
              </p>

              <p className="text-xs text-muted-foreground">
                Fragen verfügbar
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              Starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="flex min-h-72 flex-col rounded-[1.75rem] border border-border/60 bg-card/60 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${subject.iconClass}`}
        >
          <Icon className="h-6 w-6" />
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Lock className="h-3 w-3" />
          Bald
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {subject.shortTitle}
        </p>

        <h2 className="mt-1 text-xl font-semibold text-foreground">
          {subject.title}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {subject.description}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              0
            </p>

            <p className="text-xs text-muted-foreground">
              Fragen verfügbar
            </p>
          </div>

          <FileText className="h-5 w-5 text-muted-foreground/60" />
        </div>
      </div>
    </article>
  );
}