// src/data/achievements.ts

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  target: number;
}

export const achievements: Achievement[] = [
  {
    id: "first-question",
    title: "Erste Schritte",
    description: "Beantworte deine erste Lernfrage.",
    xp: 25,
    icon: "🎓",
    target: 1,
  },
  {
    id: "ten-questions",
    title: "Warmgelaufen",
    description: "Beantworte 10 Fragen.",
    xp: 50,
    icon: "🔥",
    target: 10,
  },
  {
    id: "fifty-questions",
    title: "Steuerfan",
    description: "Beantworte 50 Fragen.",
    xp: 150,
    icon: "📚",
    target: 50,
  },
  {
    id: "hundred-questions",
    title: "Lernmaschine",
    description: "Beantworte 100 Fragen.",
    xp: 300,
    icon: "🚀",
    target: 100,
  },
  {
    id: "ust-master",
    title: "Vorsteuer-Profi",
    description: "100 Umsatzsteuerfragen richtig beantworten.",
    xp: 250,
    icon: "🟢",
    target: 100,
  },
  {
    id: "ao-master",
    title: "AO-Experte",
    description: "100 AO-Fragen richtig beantworten.",
    xp: 250,
    icon: "🟣",
    target: 100,
  },
  {
    id: "est-master",
    title: "ESt-Profi",
    description: "100 Einkommensteuerfragen richtig beantworten.",
    xp: 250,
    icon: "🔵",
    target: 100,
  },
  {
    id: "gewst-master",
    title: "GewSt-Profi",
    description: "100 Gewerbesteuerfragen richtig beantworten.",
    xp: 250,
    icon: "🟠",
    target: 100,
  },
  {
    id: "npo-master",
    title: "NPO-Spezialist",
    description: "100 Fragen zur Gemeinnützigkeit richtig beantworten.",
    xp: 250,
    icon: "💚",
    target: 100,
  },
  {
    id: "week-streak",
    title: "7 Tage Serie",
    description: "Lerne sieben Tage hintereinander.",
    xp: 150,
    icon: "📅",
    target: 7,
  },
  {
    id: "month-streak",
    title: "30 Tage Serie",
    description: "Lerne 30 Tage hintereinander.",
    xp: 500,
    icon: "🏆",
    target: 30,
  },
  {
    id: "perfect-round",
    title: "Perfekte Runde",
    description: "20 Fragen hintereinander richtig beantworten.",
    xp: 200,
    icon: "⭐",
    target: 20,
  },
];