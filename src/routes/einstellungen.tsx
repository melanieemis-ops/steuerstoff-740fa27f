import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Moon, Monitor, RotateCcw, Sun, Volume2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSpeechSettings, saveSpeechSettings, type SpeechSettings } from "@/lib/speech-storage";
import { applyTheme, getThemeMode, saveThemeMode, type ThemeMode } from "@/lib/theme";

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
  const [saved, setSaved] = useState(false);
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>(() => loadSpeechSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSpeechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

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

    const currentTheme = getThemeMode();
    setTheme(currentTheme);
    applyTheme(currentTheme);
  }, []);

  // Verfügbare (deutsche) Stimmen laden
  useEffect(() => {
    if (!isSpeechSupported) return;

    function loadVoices() {
      const all = window.speechSynthesis.getVoices();
      const german = all.filter((v) => v.lang.startsWith("de-DE") || v.lang.startsWith("de"));
      german.sort((a, b) => {
        const aDE = a.lang === "de-DE" ? 0 : 1;
        const bDE = b.lang === "de-DE" ? 0 : 1;
        return aDE - bDE;
      });
      setAvailableVoices(german);
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isSpeechSupported]);

  function selectTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    saveThemeMode(nextTheme);
  }

  function updateSpeechSetting(partial: Partial<SpeechSettings>) {
    setSpeechSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSpeechSettings(next);
      return next;
    });
  }

  function save(event: FormEvent) {
    event.preventDefault();

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    saveThemeMode(theme);
    saveSpeechSettings(speechSettings);

    setSaved(true);

    window.setTimeout(() => setSaved(false), 1500);
  }

  function restartOnboarding() {
    window.localStorage.removeItem(ONBOARDING_KEY);

    void navigate({
      to: "/",
    });
  }

  function resetData() {
    if (!window.confirm("Alle Fälle und Einstellungen lokal löschen?")) {
      return;
    }

    window.localStorage.removeItem("steuerstoff.cases.v1");
    window.localStorage.removeItem(SETTINGS_KEY);

    setSettings(DEFAULTS);

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

          <form onSubmit={save} className="mt-8 space-y-6">
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
                <Button type="submit">{saved ? "Gespeichert" : "Speichern"}</Button>

                <Button type="button" variant="ghost" onClick={resetData}>
                  Lokale Daten zurücksetzen
                </Button>
              </div>
            </section>

            {/* Vorlesefunktion */}
            <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div className="flex items-start gap-3">
                <Volume2
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Vorlesefunktion</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    steuerstoff nutzt die native Browser-Sprachausgabe (Web Speech API) deines
                    Geräts – ohne externe Dienste oder API-Schlüssel.
                  </p>
                </div>
              </div>

              {!isSpeechSupported ? (
                <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  Die Vorlesefunktion wird von diesem Browser leider nicht unterstützt.
                </p>
              ) : (
                <>
                  {/* Lesegeschwindigkeit */}
                  <div>
                    <p className="text-sm font-medium text-foreground">Lesegeschwindigkeit</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          {
                            rate: 0.8,
                            label: "Langsam",
                          },
                          {
                            rate: 1.0,
                            label: "Normal",
                          },
                          {
                            rate: 1.15,
                            label: "Zügig",
                          },
                          {
                            rate: 1.3,
                            label: "Schnell",
                          },
                        ] as const
                      ).map(({ rate, label }) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() =>
                            updateSpeechSetting({
                              rate,
                            })
                          }
                          className={[
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            speechSettings.rate === rate
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-card text-muted-foreground hover:text-foreground",
                          ].join(" ")}
                          aria-pressed={speechSettings.rate === rate}
                        >
                          {rate}× {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stimmenauswahl (nur wenn deutsche Stimmen verfügbar) */}
                  {availableVoices.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground">Stimme</p>
                      <div className="mt-2 flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateSpeechSetting({
                              voiceURI: undefined,
                            })
                          }
                          className={[
                            "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                            !speechSettings.voiceURI
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-card text-muted-foreground hover:text-foreground",
                          ].join(" ")}
                        >
                          Automatisch (empfohlen)
                        </button>
                        {availableVoices.map((voice) => (
                          <button
                            key={voice.voiceURI}
                            type="button"
                            onClick={() =>
                              updateSpeechSetting({
                                voiceURI: voice.voiceURI,
                              })
                            }
                            className={[
                              "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                              speechSettings.voiceURI === voice.voiceURI
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-card text-muted-foreground hover:text-foreground",
                            ].join(" ")}
                          >
                            {voice.name} <span className="opacity-60">({voice.lang})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
