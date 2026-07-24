import { useEffect, useState } from "react";
import "@/lib/knowledgeBaseExtensions/aufbewahrungspflichten-ao";

const KEY = "steuerstoff:admin";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(KEY) === "true") return true;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("admin");
    if (q === "1" || q === "true") {
      localStorage.setItem(KEY, "true");
      return true;
    }
    if (q === "0" || q === "false") {
      localStorage.removeItem(KEY);
      return false;
    }
  } catch {
    /* noop */
  }
  return false;
}

/**
 * Client-seitiger Admin-Flag. Aktivierung via `?admin=1` in der URL oder
 * `localStorage.setItem("steuerstoff:admin","true")`. Deaktivierung via
 * `?admin=0`. Normale Nutzer sehen davon nichts.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    setIsAdmin(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setIsAdmin(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return isAdmin;
}
