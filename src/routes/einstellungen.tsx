


import { createFileRoute } from "@tanstack/react-router";
import {
  Moon,
  Monitor,
  Sun,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  applyTheme,
  getThemeMode,
  saveThemeMode,
  type ThemeMode,
} from "@/lib/theme";

export const Route = createFileRoute(
  "/einstellungen",
)({
  component: Einstellungen,
  head: () => ({
    meta: [
      {
        title: "Einstellungen · steuerstoff",
      },
    ],
  }),
});

const SETTINGS_KEY =
  "steuerstoff.settings.v1";

interface Settings {
  kanzlei: string;
  bearbeiter: string;
  kontenrahmen:
    | "SKR03"
    | "SKR04"
    | "SKR42";
}

const DEFAULTS: Settings = {
  kanzlei: "",
  bearbeiter: "",
  kontenrahmen: "SKR03",
};

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    value: "light",
    label: "Hell",
    description:
      "Immer die helle Ansicht verwenden.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dunkel",
    description:
      "Immer die dunkle Ansicht verwenden.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description:
      "Die Einstellung deines Geräts übernehmen.",
    icon: Monitor,
  },
];

function Einstellungen() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULTS);
  const [theme, setTheme] =
    useState<ThemeMode>("system");
  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          SETTINGS_KEY,
        );

      if (raw) {
        setSettings({
          ...DEFAULTS,
          ...JSON.parse(raw),
        });
      }
    } catch {
      // Ungültige lokale Daten ignorieren.
    }

    const currentTheme = getThemeMode();
    setTheme(currentTheme);
    applyTheme(currentTheme);
  }, []);

  function selectTheme(
    nextTheme: ThemeMode,
  ) {
    setTheme(nextTheme);
    saveThemeMode(nextTheme);
  }

  function save(event: FormEvent) {
    event.preventDefault();

    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings),
    );

    saveThemeMode(theme);

    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      1500,
    );
  }

  function resetData() {
    if (
      !window.confirm(
        "Alle Fälle und Einstellungen lokal löschen?",
      )
    ) {
      return;
    }

    window.localStorage.removeItem(
      "steuerstoff.cases.v1",
    );
    window.localStorage.removeItem(
      SETTINGS_KEY,
    );

    setSettings(DEFAULTS);

    window.dispatchEvent(
      new Event("steuerstoff:cases"),
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Einstellungen
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Erscheinungsbild, Kanzleidaten und
            Standardwerte für steuerstoff.
          </p>

          <form
            onSubmit={save}
            className="mt-8 space-y-6"
          >
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Erscheinungsbild
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Wähle zwischen heller,
                  dunkler oder automatischer
                  Darstellung.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map(
                  (option) => {
                    const Icon =
                      option.icon;
                    const selected =
                      theme === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          selectTheme(
                            option.value,
                          )
                        }
                        className={[
                          "rounded-2xl border p-4 text-left transition-all",
                          selected
                            ? "border-foreground bg-foreground text-background shadow-sm"
                            : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-foreground/30",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />

                        <p className="mt-3 text-sm font-semibold">
                          {option.label}
                        </p>

                        <p
                          className={[
                            "mt-1 text-xs leading-relaxed",
                            selected
                              ? "text-background/70"
                              : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {
                            option.description
                          }
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Kanzleiname
                </label>

                <Input
                  value={
                    settings.kanzlei
                  }
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      kanzlei:
                        event.target.value,
                    })
                  }
                  placeholder="Musterkanzlei Steuerberatung GmbH"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Bearbeiter/in
                </label>

                <Input
                  value={
                    settings.bearbeiter
                  }
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      bearbeiter:
                        event.target.value,
                    })
                  }
                  placeholder="Vor- und Nachname"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Standard-Kontenrahmen
                </label>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(
                    [
                      "SKR03",
                      "SKR04",
                      "SKR42",
                    ] as const
                  ).map((kontenrahmen) => (
                    <button
                      key={kontenrahmen}
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          kontenrahmen,
                        })
                      }
                      className={[
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        settings.kontenrahmen ===
                        kontenrahmen
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {kontenrahmen}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit">
                  {saved
                    ? "Gespeichert"
                    : "Speichern"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetData}
                >
                  Lokale Daten zurücksetzen
                </Button>
              </div>
            </section>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}