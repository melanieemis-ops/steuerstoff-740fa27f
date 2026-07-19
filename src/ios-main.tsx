import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTreeApp } from "./routeTree.app";
import "./styles.css";

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

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root-Element #root wurde nicht gefunden.");
  }

  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree: routeTreeApp,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );

  window.setTimeout(() => {
    if (fallbackElement) fallbackElement.hidden = true;
  }, 0);
} catch (error) {
  const message = error instanceof Error
    ? error.message
    : "Unbekannter Fehler beim Starten der App.";
  showStartupError(message);
}
