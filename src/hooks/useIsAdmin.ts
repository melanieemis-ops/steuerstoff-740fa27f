import { useEffect, useState } from "react";
import "@/lib/knowledgeBaseExtensions/aufbewahrungspflichten-ao";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aufmerksamkeiten";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-auslandsaufenthalt";
import "@/lib/knowledgeBaseExtensions/sozialversicherung-betriebspruefung";
import "@/lib/knowledgeBaseExtensions/sozialversicherungspflicht-lehrkraefte-uebergangsregelung-2027";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-entfernungspauschale-2026";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-kinderbetreuungskosten-getrennte-eltern-haushaltszugehoerigkeit";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-vorsorgepauschale-ab-2026";
import "@/lib/knowledgeBaseExtensions/umsatzsteuer-vorsteuerabzug-verspaetete-rechnung-eug-2026";
import "@/lib/knowledgeBaseExtensions/kfz-dienstwagen-1-prozent";
import "@/lib/knowledgeBaseExtensions/eigenverbrauch-unentgeltliche-wertabgaben-lieferungen";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohnsteuerbescheinigung-erstellung-korrektur-inhalt";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-faelligkeit-lohnsteuer-sozialversicherungsbeitraege";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-gesetzliche-erbfolge";
import "@/lib/knowledgeBaseExtensions/einkommensteuer-gewerblicher-grundstueckshandel";
import "@/lib/knowledgeBaseExtensions/jahresabschluss-hgb-ueberblick";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-lohn-und-gehaltsabrechnung";
import "@/lib/knowledgeBaseExtensions/lohnsteuer-aussenpruefung";
import "@/lib/knowledgeBaseExtensions/erbschaftsteuer-festsetzungsverjaehrung";

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

function setReactInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function chipLabel(button: HTMLButtonElement): string {
  const firstSpan = button.querySelector("span");
  return firstSpan?.textContent?.trim() ?? button.textContent?.replace(/\d+\s*$/, "").trim() ?? "";
}

function categoryCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const article of document.querySelectorAll("article")) {
    const label = article.querySelector(":scope > span")?.textContent?.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}

function installKnowledgeCategoryEnhancements(): (() => void) | undefined {
  if (typeof document === "undefined" || window.location.pathname !== "/wissensdatenbank") {
    return undefined;
  }

  const input = document.querySelector<HTMLInputElement>('input[aria-label="Wissensdatenbank durchsuchen"]');
  const filterRow = input?.parentElement?.nextElementSibling;
  if (!input || !(filterRow instanceof HTMLElement)) return undefined;

  filterRow.setAttribute("data-no-swipe", "true");
  filterRow.setAttribute("data-horizontal-scroll", "true");
  filterRow.setAttribute("role", "list");
  filterRow.setAttribute("aria-label", "Kategorien der Wissensdatenbank");
  filterRow.style.touchAction = "pan-x";
  filterRow.style.overscrollBehaviorX = "contain";
  filterRow.style.scrollBehavior = "smooth";
  filterRow.style.scrollSnapType = "x proximity";
  filterRow.style.setProperty("-webkit-overflow-scrolling", "touch");
  filterRow.style.scrollbarWidth = "none";

  const cleanupCallbacks: Array<() => void> = [];
  const knownLabels = new Set(
    Array.from(filterRow.querySelectorAll<HTMLButtonElement>("button")).map(chipLabel).filter(Boolean),
  );

  const updateDynamicActiveStates = () => {
    const current = input.value.trim().toLocaleLowerCase("de-DE");
    for (const button of filterRow.querySelectorAll<HTMLButtonElement>("button[data-dynamic-kb-category]")) {
      const active = button.dataset.dynamicKbCategory?.toLocaleLowerCase("de-DE") === current;
      button.className = active
        ? "shrink-0 inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs text-background ring-1 ring-foreground transition-colors"
        : "shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground";
    }
  };

  const addMissingCategories = () => {
    const counts = categoryCounts();
    const allButton = Array.from(filterRow.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => chipLabel(button) === "Alle",
    );

    for (const [label, count] of [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, "de"))) {
      if (knownLabels.has(label)) continue;
      knownLabels.add(label);

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.dynamicKbCategory = label;
      button.setAttribute("role", "listitem");
      button.style.scrollSnapAlign = "start";
      button.className =
        "shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = label;
      const countSpan = document.createElement("span");
      countSpan.className = "text-[10px] text-muted-foreground/70";
      countSpan.textContent = String(count);
      button.append(labelSpan, countSpan);

      const onClick = () => {
        allButton?.click();
        const alreadyActive = input.value.trim().toLocaleLowerCase("de-DE") === label.toLocaleLowerCase("de-DE");
        setReactInputValue(input, alreadyActive ? "" : label);
        button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        updateDynamicActiveStates();
      };
      button.addEventListener("click", onClick);
      cleanupCallbacks.push(() => button.removeEventListener("click", onClick));
      filterRow.appendChild(button);
    }

    for (const button of filterRow.querySelectorAll<HTMLButtonElement>("button")) {
      button.style.scrollSnapAlign = "start";
    }
    updateDynamicActiveStates();
  };

  const onInput = () => updateDynamicActiveStates();
  const onRowClick = (event: Event) => {
    const button = (event.target as Element | null)?.closest("button");
    if (button instanceof HTMLElement) {
      window.requestAnimationFrame(() =>
        button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }),
      );
    }
  };

  input.addEventListener("input", onInput);
  filterRow.addEventListener("click", onRowClick);
  addMissingCategories();

  const observer = new MutationObserver(() => addMissingCategories());
  const articleGrid = document.getElementById("kb-list-anchor")?.nextElementSibling;
  if (articleGrid) observer.observe(articleGrid, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    input.removeEventListener("input", onInput);
    filterRow.removeEventListener("click", onRowClick);
    cleanupCallbacks.forEach((cleanup) => cleanup());
    filterRow.querySelectorAll("button[data-dynamic-kb-category]").forEach((button) => button.remove());
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

    let removeEnhancements: (() => void) | undefined;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (!removeEnhancements) removeEnhancements = installKnowledgeCategoryEnhancements();
      if (removeEnhancements || attempts >= 30) window.clearInterval(timer);
    }, 100);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
      removeEnhancements?.();
    };
  }, []);

  return isAdmin;
}
