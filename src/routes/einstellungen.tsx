import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Moon, Monitor, RotateCcw, Sun, Volume2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearSpeechSettings,
  loadSpeechSettings,
  saveSpeechSettings,
  type OpenAiVoice,
  type TtsProvider,
} from "@/lib/speech-storage";
import { applyTheme, getThemeMode, saveThemeMode, type ThemeMode } from "@/lib/theme";
import {
  getTtsAccessCode,
  removeTtsAccessCode,
  saveTtsAccessCode,
} from "@/lib/ttsAccessCodeStorage";

export const Route = createFileRoute("/einstellungen")({
  component: Einstellungen,
  head: () => ({ meta: [{ title: "Einstellungen · steuerstoff" }] }),
});

const SETTINGS_KEY = "steuerstoff.settings.v1";
const ONBOARDING_KEY = "steuerstoff.onboarding.v1";

interface Settings {
  kanzlei: string;
  bearbeiter: string;
  kontenrahmen: "SKR03" | "SKR04" | "SKR42";
}
const DEFAULTS: Settings = { kanzlei: "", bearbeiter: "", kontenrahmen: "SKR03" };

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Hell", description: "Immer die helle Ansicht verwenden.", icon: Sun },
  { value: "dark", label: "Dunkel", description: "Immer die dunkle Ansicht verwenden.", icon: Moon },
  { value: "system", label: "System", description: "Die Einstellung deines Geräts übernehmen.", icon: Monitor },
];
const PROVIDERS: { value: TtsProvider; label: string; description: string }[] = [
  { value: "openai", label: "OpenAI-Stimme", description: "Hochwertige KI-Stimme ohne persönlichen Freischaltcode." },
  { value: "elevenlabs", label: "ElevenLabs", description: "Professionelle Stimme mit Steuerstoff-Freischaltcode." },
];
const OPENAI_VOICES: { value: OpenAiVoice; label: string }[] = [
  { value: "coral", label: "Coral" },
  { value: "marin", label: "Marin" },
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
];

function Einstellungen() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [generalSaved, setGeneralSaved] = useState(false);
  const [provider, setProvider] = useState<TtsProvider>("openai");
  const [openAiVoice, setOpenAiVoice] = useState<OpenAiVoice>("coral");
  const [browserFallback, setBrowserFallback] = useState(true);
  const [ttsAccessCode, setTtsAccessCode] = useState("");
  const [showTtsAccessCode, setShowTtsAccessCode] = useState(false);
  const [hasStoredTtsAccessCode, setHasStoredTtsAccessCode] = useState(false);
  const [isSavingTtsAccessCode, setIsSavingTtsAccessCode] = useState(false);
  const [ttsFeedback, setTtsFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    const speech = loadSpeechSettings();
    setProvider(speech.provider ?? "openai");
    setOpenAiVoice(speech.openAiVoice ?? "coral");
    setBrowserFallback(speech.allowBrowserFallback !== false);

    let active = true;
    void getTtsAccessCode().then((code) => active && setHasStoredTtsAccessCode(Boolean(code)));
    const currentTheme = getThemeMode();
    setTheme(currentTheme);
    applyTheme(currentTheme);
    return () => { active = false; };
  }, []);

  function saveGeneralSettings(event: FormEvent) {
    event.preventDefault();
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    saveThemeMode(theme);
    setGeneralSaved(true);
    window.setTimeout(() => setGeneralSaved(false), 1500);
  }

  function saveSpeechChoice(nextProvider = provider, nextVoice = openAiVoice, nextFallback = browserFallback) {
    saveSpeechSettings({
      ...loadSpeechSettings(),
      provider: nextProvider,
      openAiVoice: nextVoice,
      allowBrowserFallback: nextFallback,
    });
  }

  async function saveAccessCode(event: FormEvent) {
    event.preventDefault();
    const code = ttsAccessCode.trim();
    if (!code) {
      setTtsFeedback({ type: "error", message: "Bitte trage einen Freischaltcode ein." });
      return;
    }
    setIsSavingTtsAccessCode(true);
    setTtsFeedback(null);
    try {
      await saveTtsAccessCode(code);
      setTtsAccessCode("");
      setShowTtsAccessCode(false);
      setHasStoredTtsAccessCode(true);
      setTtsFeedback({ type: "success", message: "Freischaltcode erfolgreich gespeichert." });
    } catch {
      setTtsFeedback({ type: "error", message: "Der Freischaltcode konnte nicht gespeichert werden." });
    } finally {
      setIsSavingTtsAccessCode(false);
    }
  }

  async function removeAccessCode() {
    await removeTtsAccessCode();
    setHasStoredTtsAccessCode(false);
    setTtsFeedback({ type: "success", message: "Freischaltcode entfernt." });
  }

  async function resetData() {
    if (!window.confirm("Alle Fälle und Einstellungen lokal löschen?")) return;
    window.localStorage.removeItem("steuerstoff.cases.v1");
    window.localStorage.removeItem(SETTINGS_KEY);
    clearSpeechSettings();
    await removeTtsAccessCode();
    setSettings(DEFAULTS);
    setProvider("openai");
    setOpenAiVoice("coral");
    setBrowserFallback(true);
    setHasStoredTtsAccessCode(false);
    setTtsFeedback(null);
    window.dispatchEvent(new Event("steuerstoff:cases"));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Einstellungen</h1>
          <p className="mt-2 text-sm text-muted-foreground">Erscheinungsbild, Kanzleidaten und Vorlesefunktion für steuerstoff.</p>

          <form onSubmit={saveGeneralSettings} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <h2 className="text-base font-semibold text-foreground">Erscheinungsbild</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.value;
                  return (
                    <button key={option.value} type="button" onClick={() => { setTheme(option.value); saveThemeMode(option.value); }} className={`rounded-2xl border p-4 text-left transition-all ${selected ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground"}`}>
                      <Icon className="h-5 w-5" />
                      <p className="mt-3 text-sm font-semibold">{option.label}</p>
                      <p className={`mt-1 text-xs ${selected ? "text-background/70" : "text-muted-foreground"}`}>{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-base font-semibold">Einführung</h2><p className="mt-1 text-sm text-muted-foreground">Zeigt dir noch einmal die wichtigsten Bereiche.</p></div>
                <Button type="button" variant="outline" onClick={() => { window.localStorage.removeItem(ONBOARDING_KEY); void navigate({ to: "/" }); }}><RotateCcw className="mr-2 h-4 w-4" />Einführung erneut starten</Button>
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
              <div><label className="text-sm font-medium">Kanzleiname</label><Input value={settings.kanzlei} onChange={(e) => setSettings({ ...settings, kanzlei: e.target.value })} className="mt-1.5" /></div>
              <div><label className="text-sm font-medium">Bearbeiter/in</label><Input value={settings.bearbeiter} onChange={(e) => setSettings({ ...settings, bearbeiter: e.target.value })} className="mt-1.5" /></div>
              <div><label className="text-sm font-medium">Standard-Kontenrahmen</label><div className="mt-1.5 flex gap-2">{(["SKR03", "SKR04", "SKR42"] as const).map((k) => <button key={k} type="button" onClick={() => setSettings({ ...settings, kontenrahmen: k })} className={`rounded-full border px-3 py-1 text-xs ${settings.kontenrahmen === k ? "bg-foreground text-background" : "text-muted-foreground"}`}>{k}</button>)}</div></div>
              <div className="flex justify-between"><Button type="submit">{generalSaved ? "Gespeichert" : "Speichern"}</Button><Button type="button" variant="ghost" onClick={() => void resetData()}>Lokale Daten zurücksetzen</Button></div>
            </section>
          </form>

          <section className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
            <div className="flex items-start gap-3"><Volume2 className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><h2 className="text-base font-semibold">Vorlesefunktion</h2><p className="mt-1 text-sm text-muted-foreground">Wähle die Stimme, die überall bei Anhören und Vorlesen verwendet wird.</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROVIDERS.map((option) => <button key={option.value} type="button" onClick={() => { setProvider(option.value); saveSpeechChoice(option.value); }} className={`rounded-2xl border p-4 text-left ${provider === option.value ? "border-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20" : "border-border"}`}><p className="font-semibold">{option.label}</p><p className="mt-1 text-sm text-muted-foreground">{option.description}</p></button>)}
            </div>
            {provider === "openai" && <div><label className="text-sm font-medium">OpenAI-Stimme</label><div className="mt-2 flex flex-wrap gap-2">{OPENAI_VOICES.map((voice) => <button key={voice.value} type="button" onClick={() => { setOpenAiVoice(voice.value); saveSpeechChoice(provider, voice.value); }} className={`rounded-full border px-3 py-1.5 text-sm ${openAiVoice === voice.value ? "bg-foreground text-background" : "text-muted-foreground"}`}>{voice.label}</button>)}</div></div>}
            <label className="flex items-start gap-3 rounded-xl border border-border p-4"><input type="checkbox" checked={browserFallback} onChange={(e) => { setBrowserFallback(e.target.checked); saveSpeechChoice(provider, openAiVoice, e.target.checked); }} className="mt-1" /><span><span className="block text-sm font-semibold">Browserstimme als kostenlose Rückfallebene</span><span className="mt-1 block text-sm text-muted-foreground">Wird verwendet, wenn die gewählte KI-Stimme nicht verfügbar ist.</span></span></label>

            <form onSubmit={saveAccessCode} className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
              <div><label htmlFor="tts-access-code" className="text-sm font-medium">ElevenLabs-Freischaltcode</label><p className="mt-1 text-sm text-muted-foreground">Nur nötig, wenn ElevenLabs ausgewählt wird.</p><div className="relative mt-3"><Input id="tts-access-code" type={showTtsAccessCode ? "text" : "password"} value={ttsAccessCode} onChange={(e) => { setTtsAccessCode(e.target.value); setTtsFeedback(null); }} placeholder={hasStoredTtsAccessCode ? "Gespeicherter Code ••••••••" : "Freischaltcode"} className="pr-12" /><button type="button" onClick={() => setShowTtsAccessCode((v) => !v)} className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground">{showTtsAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              {ttsFeedback && <p className={ttsFeedback.type === "error" ? "text-sm text-destructive" : "text-sm text-emerald-700"}>{ttsFeedback.message}</p>}
              <div className="flex flex-col gap-2 sm:flex-row"><Button type="submit" disabled={isSavingTtsAccessCode}>{isSavingTtsAccessCode ? "Wird gespeichert …" : "Speichern"}</Button><Button type="button" variant="outline" disabled={!hasStoredTtsAccessCode} onClick={() => void removeAccessCode()}>Freischaltcode entfernen</Button></div>
            </form>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
