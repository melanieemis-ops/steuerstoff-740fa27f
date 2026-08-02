import { useEffect, useState } from "react";

export type UILanguage = "de" | "en";

export function normalizeLanguage(value: unknown): UILanguage {
  if (typeof value !== "string") return "de";
  return value.toLowerCase().startsWith("en") ? "en" : "de";
}

export function getDocumentLanguage(): UILanguage {
  if (typeof document === "undefined") return "de";
  return normalizeLanguage(
    document.documentElement.getAttribute("lang") ??
      document.documentElement.dataset.language,
  );
}

export function getSpeechLocale(language: UILanguage): string {
  return language === "en" ? "en-US" : "de-DE";
}

export function useUiLanguage(): UILanguage {
  const [language, setLanguage] = useState<UILanguage>(() => getDocumentLanguage());

  useEffect(() => {
    if (typeof document === "undefined") return;

    const update = () => setLanguage(getDocumentLanguage());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "data-language"],
    });

    return () => observer.disconnect();
  }, []);

  return language;
}
