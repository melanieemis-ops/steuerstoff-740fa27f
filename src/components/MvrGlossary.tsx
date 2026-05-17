import { Link } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface GlossaryEntry {
  title: string;
  body: string;
  ref?: string;
}

export const MVR_GLOSSARY: Record<string, GlossaryEntry> = {
  "freie Rücklage": {
    title: "Freie Rücklage (§ 62 Abs. 1 Nr. 3 AO)",
    body:
      "Bis zu 1/3 des Überschusses der Vermögensverwaltung + 10 % der sonstigen zeitnah zu verwendenden Mittel. Keine Doppelberücksichtigung. Nicht ausgeschöpfte Beträge sind in den zwei Folgejahren nachholbar.",
    ref: "§ 62 Abs. 1 Nr. 3 AO",
  },
  "Betriebsmittelrücklage": {
    title: "Betriebsmittelrücklage",
    body:
      "Liquiditätssicherung für periodisch wiederkehrende Ausgaben (Personal, Miete, Energie). Bemessung am Bedarf eines angemessenen Zeitraums (i. d. R. 3–12 Monate). Vorstandsbeschluss empfohlen.",
    ref: "§ 62 Abs. 1 Nr. 1 AO",
  },
  "Verwendungsüberhang": {
    title: "Verwendungsüberhang",
    body:
      "Rechnerischer Saldo: zeitnah zu verwendende Mittel − zweckentsprechende Verwendung − zulässige Rücklagen − Vermögenszuführungen − offener Mittelvortrag. Positiver Wert = Prüfbedarf, kein automatischer Verlust der Gemeinnützigkeit (§ 63 Abs. 4 AO).",
    ref: "§ 55, § 63 Abs. 4 AO",
  },
  "Mittelvortrag": {
    title: "Mittelvortrag",
    body:
      "Noch nicht verwendete Mittel aus früheren Jahren. Verwendungspflicht spätestens in den zwei auf den Zufluss folgenden Kalender- oder Wirtschaftsjahren. Beispiel: Zufluss 2024 → Verwendung bis Ende 2026.",
    ref: "§ 55 Abs. 1 Nr. 5 AO",
  },
};

export function Term({ name, children }: { name: keyof typeof MVR_GLOSSARY | string; children?: React.ReactNode }) {
  const entry = MVR_GLOSSARY[name as string];
  const label = children ?? name;
  if (!entry) return <>{label}</>;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-center gap-1 border-b border-dashed border-foreground/40 align-baseline hover:border-foreground"
        >
          <span>{label}</span>
          <HelpCircle className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-xs">
        <div className="mb-1 text-sm font-semibold text-foreground">{entry.title}</div>
        <p className="leading-relaxed text-foreground/80">{entry.body}</p>
        {entry.ref && (
          <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            Rechtsgrundlage: {entry.ref}
          </div>
        )}
        <Link
          to="/wissensdatenbank"
          className="mt-3 inline-block text-xs font-medium text-foreground underline underline-offset-2"
        >
          In der Wissensdatenbank öffnen →
        </Link>
      </PopoverContent>
    </Popover>
  );
}
