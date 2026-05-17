import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/einstellungen")({
  component: Einstellungen,
  head: () => ({ meta: [{ title: "Einstellungen · steuerstoff" }] }),
});

const SETTINGS_KEY = "steuerstoff.settings.v1";

interface Settings {
  kanzlei: string;
  bearbeiter: string;
  kontenrahmen: "SKR03" | "SKR04" | "SKR42";
}

const DEFAULTS: Settings = { kanzlei: "", bearbeiter: "", kontenrahmen: "SKR03" };

function Einstellungen() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function resetData() {
    if (!confirm("Alle Fälle und Einstellungen lokal löschen?")) return;
    window.localStorage.removeItem("steuerstoff.cases.v1");
    window.localStorage.removeItem(SETTINGS_KEY);
    setS(DEFAULTS);
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
            Kanzleidaten und Standardwerte für Antwortmodi und Buchungsvorschläge.
          </p>

          <form onSubmit={save} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
            <div>
              <label className="text-sm font-medium text-foreground">Kanzleiname</label>
              <Input
                value={s.kanzlei}
                onChange={(e) => setS({ ...s, kanzlei: e.target.value })}
                placeholder="Musterkanzlei Steuerberatung GmbH"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Bearbeiter/in</label>
              <Input
                value={s.bearbeiter}
                onChange={(e) => setS({ ...s, bearbeiter: e.target.value })}
                placeholder="Vor- und Nachname"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Standard-Kontenrahmen</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(["SKR03", "SKR04", "SKR42"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setS({ ...s, kontenrahmen: k })}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors " +
                      (s.kontenrahmen === k
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground")
                    }
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button type="submit">{saved ? "Gespeichert" : "Speichern"}</Button>
              <Button type="button" variant="ghost" onClick={resetData}>
                Lokale Daten zurücksetzen
              </Button>
            </div>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
