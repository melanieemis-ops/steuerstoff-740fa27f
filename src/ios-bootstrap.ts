function showStartupError(message: string) {
  const fallback = document.getElementById("ios-boot-fallback");
  if (!fallback) return;
  fallback.hidden = false;
  fallback.innerHTML = `
    <div class="ios-boot-card">
      <h1>steuerstoff konnte nicht gestartet werden.</h1>
      <p>${message}</p>
    </div>
  `;
}

void import("./ios-main").catch((error) => {
  const message = error instanceof Error
    ? error.message
    : String(error ?? "Unbekannter Import-Fehler.");
  showStartupError(`JS-Import fehlgeschlagen: ${message}`);
});
