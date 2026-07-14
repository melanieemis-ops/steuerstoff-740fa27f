import { useEffect, useState } from "react";
import { registerSteuerstoffSW } from "@/lib/pwa/registerSW";

/**
 * Zeigt:
 *  - Offline-Hinweis, wenn keine Verbindung besteht
 *  - Update-Hinweis, wenn eine neue SW-Version wartet
 * Registriert außerdem einmalig den Service Worker (nur in Prod, außerhalb Preview/iframe).
 */
export function PwaStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [updateActivate, setUpdateActivate] = useState<null | (() => void)>(null);

  useEffect(() => {
    void registerSteuerstoffSW();
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ activate: () => void }>).detail;
      if (detail?.activate) setUpdateActivate(() => detail.activate);
    };
    window.addEventListener("steuerstoff:sw-update", onUpdate as EventListener);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("steuerstoff:sw-update", onUpdate as EventListener);
    };
  }, []);

  return (
    <>
      {!online && (
        <div
          role="status"
          className="fixed left-1/2 top-3 z-[9998] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground shadow-card-soft"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
        >
          Keine Internetverbindung — bitte Verbindung herstellen und erneut versuchen.
        </div>
      )}
      {updateActivate && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[9998] flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-xs shadow-card-soft"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <span className="font-medium text-foreground">Neue Version verfügbar</span>
          <button
            onClick={() => updateActivate()}
            className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Jetzt aktualisieren
          </button>
        </div>
      )}
    </>
  );
}
