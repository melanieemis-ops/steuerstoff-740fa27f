import { useEffect, useState } from "react";
import "@/lib/knowledgeBaseExtensions/aufbewahrungspflichten-ao";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aufmerksamkeiten";

const KEY = "steuerstoff:admin";
const LOHNSTEUER_CHIP_ID = "steuerstoff-lohnsteuer-filter";

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

function installLohnsteuerKnowledgeFilter(): (() => void) | undefined {
  if (typeof document === "undefined" || window.location.pathname !== "/wissensdatenbank") {
    return undefined;
  }

  const input = document.querySelector<HTMLInputElement>(
    'input[placeholder="Suche nach Stichwort, Paragraf, Konto …"]',
  );
  const filterRow = input?.parentElement?.nextElementSibling;
  if (!input || !(filterRow instanceof HTMLElement)) return undefined;

  const existing = document.getElementById(LOHNSTEUER_CHIP_ID);
  if (existing) return undefined;

  const button = document.createElement("button");
  button.id = LOHNSTEUER_CHIP_ID;
  button.type = "button";
  button.className =
    "shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground";
  button.innerHTML = '<span>Lohnsteuer</span><span class="text-[10px] text-muted-foreground/70">1</span>';

  const setReactInputValue = (value: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    descriptor?.set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const updateActiveState = () => {
    const active = input.value.trim().toLocaleLowerCase("de-DE") === "lohnsteuer";
    button.className = active
      ? "shrink-0 inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs text-background ring-1 ring-foreground transition-colors"
      : "shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground";
  };

  const onClick = () => {
    setReactInputValue(input.value.trim().toLocaleLowerCase("de-DE") === "lohnsteuer" ? "" : "Lohnsteuer");
    input.focus();
    updateActiveState();
  };

  button.addEventListener("click", onClick);
  input.addEventListener("input", updateActiveState);

  const aoButton = Array.from(filterRow.querySelectorAll("button")).find((candidate) =>
    candidate.textContent?.includes("AO / Verfahrensrecht"),
  );
  filterRow.insertBefore(button, aoButton ?? null);
  updateActiveState();

  return () => {
    button.removeEventListener("click", onClick);
    input.removeEventListener("input", updateActiveState);
    button.remove();
  };
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

    let removeKnowledgeFilter: (() => void) | undefined;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (!removeKnowledgeFilter) removeKnowledgeFilter = installLohnsteuerKnowledgeFilter();
      if (removeKnowledgeFilter || attempts >= 20) window.clearInterval(timer);
    }, 100);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
      removeKnowledgeFilter?.();
    };
  }, []);

  return isAdmin;
}
