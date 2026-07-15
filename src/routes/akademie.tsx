import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Trophy,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

const cards = [
  {
    title: "Lernbereiche",
    subtitle: "Umsatzsteuer, AO, ESt, GewSt...",
    icon: BookOpen,
    href: "/lernen",
  },
  {
    title: "Prüfung",
    subtitle: "Zufällige Prüfung",
    icon: ClipboardCheck,
    href: "/pruefung",
  },
  {
    title: "Fehlertrainer",
    subtitle: "Nur falsch beantwortete Fragen",
    icon: Brain,
    href: "/fehlertrainer",
  },
  {
    title: "Fortschritt",
    subtitle: "Dein Lernstand",
    icon: BarChart3,
    href: "/fortschritt",
  },
  {
    title: "Erfolge",
    subtitle: "Abzeichen & Lernserie",
    icon: Trophy,
    href: "/erfolge",
  },
];

export default function AkademiePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">

      <div className="mb-10 text-center">

        <GraduationCap className="mx-auto mb-5 h-14 w-14 text-slate-800"/>

        <h1 className="text-4xl font-bold">
          steuerstoff Akademie
        </h1>

        <p className="mt-3 text-slate-500">
          Lerne deutsches Steuerrecht interaktiv mit KI.
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {cards.map((card)=>{

          const Icon=card.icon;

          return(

            <Link
              key={card.title}
              to={card.href}
              className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1"
            >

              <Icon className="mb-4 h-8 w-8"/>

              <h2 className="text-xl font-semibold">
                {card.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {card.subtitle}
              </p>

            </Link>

          )

        })}

      </div>

    </div>
  );
}