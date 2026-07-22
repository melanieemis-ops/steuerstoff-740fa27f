import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Moon, Monitor, RotateCcw, Sun, Volume2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSpeechSettings } from "@/lib/speech-storage";
import { applyTheme, getThemeMode, saveThemeMode, type ThemeMode } from "@/lib/theme";
import {
  getTtsAccessCode,
  removeTtsAccessCode,
  saveTtsAccessCode,
} from "@/lib/ttsAccessCodeStorage";

export const Route = createFileRoute("/einstellungen")({
  component: Einstellungen,
  head: () => ({
    meta: [
      {
        title: "Einstellungen · steuerstoff",
      },
    ],
  }),
});

const SETTINGS_KEY = "steuerstoff.settings.v1";
const ONBOARDING_KEY = "steuerstoff.onboarding.v1";

interface Settings {
  kanzlei: string;
  bearbeiter: string;
  kontenrahmen: "SKR03" | "SKR04" | "SKR42";
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
    description: "Immer die helle Ansicht verwenden.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dunkel",
    description: "Immer die dunkle Ansicht verwenden.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Die Einstellung deines Geräts übernehmen.",
    icon: Monitor,
  },
];

function Einstellungen() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [generalSaved, setGeneralSaved] = useState(false);
  const [ttsAccessCode, setTtsAccessCode] = useState("");
  const [showTtsAccessCode, setShowTtsAccessCode] = useState(false);
  const [hasStoredTtsAccessCode, setHasStoredTtsAccessCode] = useState(false);
  const [isSavingTtsAccessCode, setIsSavingTtsAccessCode] = useState(false);
  const [ttsFeedback, setTtsFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);

      if (raw) {
        setSettings({
          ...DEFAULTS,
          ...JSON.parse(raw),
        });
      }
    } catch {
      // Ungültige lokale Daten ignorieren.
    }

    let active = true;
    void getTtsAccessCode().then((code) => {
      if (active) setHasStoredTtsAccessCode(Boolean(code));
    });

    const currentTheme = getThemeMode();
    setTheme(currentTheme);
    applyTheme(currentTheme);

    return () => {
      active = false;
    };
  }, []);

  function selectTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    saveThemeMode(nextTheme);
  }
  function saveGeneralSettings(event: FormEvent) {
    event.preventDefault();

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    saveThemeMode(theme);

    setGeneralSaved(true);

    window.setTimeout(() => setGeneralSaved(false), 1500);
  }

  async function saveAccessCode(event: FormEvent) {
    event.preventDefault();

    const code = ttsAccessCode.trim();
    if (!code) {
      setTtsFeedback({
        type: "error",
        message: "Bitte trage einen Freischaltcode ein.",
      });
      return;
    }

    setIsSavingTtsAccessCode(true);
    setTtsFeedback(null);

    try {
      await saveTtsAccessCode(code);
      setTtsAccessCode("");
      setShowTtsAccessCode(false);
      setHasStoredTtsAccessCode(true);
      setTtsFeedback({
        type: "success",
        message: "Freischaltcode erfolgreich gespeichert.",
      });
    } catch {
      setTtsFeedback({
        type: "error",
        message: "Der Freischaltcode konnte nicht gespeichert werden. Bitte versuche es erneut.",
      });
    } finally {
      setIsSavingTtsAccessCode(false);
    }
  }

  async function removeAccessCode() {
    await removeTtsAccessCode();
    setTtsAccessCode("");
    setShowTtsAccessCode(false);
    setHasStoredTtsAccessCode(false);
    setTtsFeedback({
      type: "success",
      message: "Freischaltcode entfernt.",
    });
  }

  function restartOnboarding() {
    window.localStorage.removeItem(ONBOARDING_KEY);

    void navigate({
      to: "/",
    });
  }

  async function resetData() {
    if (!window.confirm("Alle Fälle und Einstellungen lokal löschen?")) {
      return;
    }

    window.localStorage.removeItem("steuerstoff.cases.v1");
    window.localStorage.removeItem(SETTINGS_KEY);
    clearSpeechSettings();
    await removeTtsAccessCode();

    setSettings(DEFAULTS);
    setTtsAccessCode("");
    setShowTtsAccessCode(false);
    setHasStoredTtsAccessCode(false);
    setTtsFeedback(null);

    window.dispatchEvent(new Event("steuerstoff:cases"));
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
            Erscheinungsbild, Kanzleidaten und Standardwerte für steuerstoff.
          </p>

          <form onSubmit={saveGeneralSettings} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">Erscheinungsbild</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Wähle zwischen heller, dunkler oder automatischer Darstellung.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectTheme(option.value)}
                      className={[
                        "rounded-2xl border p-4 text-left transition-all",
                        selected
                          ? "border-foreground bg-foreground text-background shadow-sm"
                          : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-foreground/30",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />

                      <p className="mt-3 text-sm font-semibold">{option.label}</p>

                      <p
                        className={[
                          "mt-1 text-xs leading-relaxed",
                          selected ? "text-background/70" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Einführung</h2>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Zeigt dir noch einmal die wichtigsten Bereiche von steuerstoff.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={restartOnboarding}
                  className="w-full shrink-0 sm:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Einführung erneut starten
                </Button>
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div>
                <label className="text-sm font-medium text-foreground">Kanzleiname</label>

                <Input
                  value={settings.kanzlei}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      kanzlei: event.target.value,
                    })
                  }
                  placeholder="Musterkanzlei Steuerberatung GmbH"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Bearbeiter/in</label>

                <Input
                  value={settings.bearbeiter}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      bearbeiter: event.target.value,
                    })
                  }
                  placeholder="Vor- und Nachname"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Standard-Kontenrahmen</label>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(["SKR03", "SKR04", "SKR42"] as const).map((kontenrahmen) => (
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
                        settings.kontenrahmen === kontenrahmen
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
                <Button type="submit">{generalSaved ? "Gespeichert" : "Speichern"}</Button>

                <Button type="button" variant="ghost" onClick={resetData}>
                  Lokale Daten zurücksetzen
                </Button>
              </div>
            </section>
          </form>

          <form onSubmit={saveAccessCode} className="mt-6">
            <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div className="flex items-start gap-3">
                <Volume2
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Vorlesefunktion</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Mit deinem persönlichen Steuerstoff-Freischaltcode kannst du die professionelle
                    KI-Stimme für Fachbeiträge und Klausurfälle verwenden.
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-border bg-background/40 p-4">
                <div>
                  <label htmlFor="tts-access-code" className="text-sm font-medium text-foreground">
                    Freischaltcode für die Vorlesefunktion
                  </label>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Den Freischaltcode kannst du über Instagram bei @steuerstoff anfragen.
                  </p>

                  <div className="relative mt-3">
                    <Input
                      id="tts-access-code"
                      type={showTtsAccessCode ? "text" : "password"}
                      value={ttsAccessCode}
                      onChange={(event) => {
                        setTtsAccessCode(event.target.value);
                        setTtsFeedback(null);
                      }}
                      placeholder={
                        hasStoredTtsAccessCode ? "Gespeicherter Code ••••••••" : "Freischaltcode"
                      }
                      autoComplete="new-password"
                      spellCheck={false}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTtsAccessCode((current) => !current)}
                      aria-label={
                        showTtsAccessCode ? "Freischaltcode verbergen" : "Freischaltcode anzeigen"
                      }
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showTtsAccessCode ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {hasStoredTtsAccessCode && !ttsFeedback && (
                  <p className="text-sm text-muted-foreground">
                    Ein Freischaltcode ist auf diesem Gerät gespeichert. Er wird aus
                    Sicherheitsgründen nicht vollständig angezeigt.
                  </p>
                )}

                {ttsFeedback && (
                  <p
                    role={ttsFeedback.type === "error" ? "alert" : "status"}
                    className={
                      ttsFeedback.type === "error"
                        ? "text-sm text-destructive"
                        : "text-sm text-emerald-700"
                    }
                  >
                    {ttsFeedback.message}
                  </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSavingTtsAccessCode}
                    className="w-full sm:w-auto"
                  >
                    {isSavingTtsAccessCode ? "Wird gespeichert …" : "Speichern"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!hasStoredTtsAccessCode || isSavingTtsAccessCode}
                    onClick={() => void removeAccessCode()}
                    className="w-full sm:w-auto"
                  >
                    Freischaltcode entfernen
                  </Button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
