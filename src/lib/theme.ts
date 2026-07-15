export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "steuerstoff.theme";

export function getThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (
    stored === "light" ||
    stored === "dark" ||
    stored === "system"
  ) {
    return stored;
  }

  return "system";
}

export function getResolvedTheme(
  mode: ThemeMode = getThemeMode(),
): "light" | "dark" {
  if (mode === "light" || mode === "dark") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

export function applyTheme(
  mode: ThemeMode = getThemeMode(),
): void {
  if (typeof document === "undefined") {
    return;
  }

  const resolved = getResolvedTheme(mode);
  const root = document.documentElement;

  root.classList.toggle(
    "dark",
    resolved === "dark",
  );

  root.dataset.theme = mode;
  root.style.colorScheme = resolved;

  const themeColor = document.querySelector(
    'meta[name="theme-color"]',
  );

  if (themeColor) {
    themeColor.setAttribute(
      "content",
      resolved === "dark"
        ? "#0f1115"
        : "#0f172a",
    );
  }
}

export function saveThemeMode(
  mode: ThemeMode,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    mode,
  );

  applyTheme(mode);

  window.dispatchEvent(
    new CustomEvent("steuerstoff:theme", {
      detail: mode,
    }),
  );
}

export function watchSystemTheme(
  callback: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const media = window.matchMedia(
    "(prefers-color-scheme: dark)",
  );

  const listener = () => callback();

  media.addEventListener("change", listener);

  return () =>
    media.removeEventListener(
      "change",
      listener,
    );
}