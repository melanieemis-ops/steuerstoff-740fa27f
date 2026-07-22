import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTreeIos } from "./routeTree.ios";
import "./styles.css";

(
  window as Window & { __IOS_MAIN_STARTED?: boolean; __IOS_MAIN_RENDERED?: boolean }
).__IOS_MAIN_STARTED = true;

const fallbackElement = document.getElementById("ios-boot-fallback");

function showStartupError(message: string) {
  if (!fallbackElement) return;
  fallbackElement.hidden = false;
  fallbackElement.innerHTML = `
    <div class="ios-boot-card">
      <h1>steuerstoff konnte nicht gestartet werden.</h1>
      <p>${message}</p>
    </div>
  `;
}

function hideFallbackWhenRendered(rootElement: HTMLElement) {
  if (!fallbackElement) return;

  let attempts = 0;
  const maxAttempts = 120;

  const check = () => {
    attempts += 1;
    if (rootElement.childNodes.length > 0) {
      (window as Window & { __IOS_MAIN_RENDERED?: boolean }).__IOS_MAIN_RENDERED = true;
      fallbackElement.hidden = true;
      return;
    }

    if (attempts < maxAttempts) {
      window.requestAnimationFrame(check);
      return;
    }

    showStartupError("Die Oberfläche konnte nicht gerendert werden.");
  };

  window.requestAnimationFrame(check);
}

window.addEventListener("error", (event) => {
  const message =
    event.error instanceof Error ? event.error.message : "Unbekannter Laufzeitfehler.";
  showStartupError(message);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message =
    reason instanceof Error ? reason.message : String(reason ?? "Unbekannter Promise-Fehler.");
  showStartupError(message);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root-Element #root wurde nicht gefunden.");
  }

  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree: routeTreeIos,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
  hideFallbackWhenRendered(rootElement);
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Unbekannter Fehler beim Starten der App.";
  showStartupError(message);
}
