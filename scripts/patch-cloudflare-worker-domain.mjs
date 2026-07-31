import fs from "node:fs";

const generatedConfigs = [
  ".output/server/wrangler.json",
  "dist/server/wrangler.json",
].filter((path) => fs.existsSync(path));

if (generatedConfigs.length === 0) {
  throw new Error(
    "Keine generierte Wrangler-Konfiguration gefunden. Bitte zuerst `bun run build` ausführen.",
  );
}

for (const path of generatedConfigs) {
  const config = JSON.parse(fs.readFileSync(path, "utf8"));

  config.workers_dev = true;
  config.routes = [
    {
      pattern: "api.steuerstoff.com",
      custom_domain: true,
    },
  ];

  const bindings = new Set([
    ...Object.keys(config.vars ?? {}),
    ...(config.secrets_store_secrets ?? []).map((secret) => secret.binding),
    ...(config.assets?.binding ? [config.assets.binding] : []),
  ]);
  const requiredBindings = [
    "GEMINIAI_API_KEY",
    "GEMINI_TTS",
    "GEMINI_CHAT_MODEL",
    "ASSETS",
  ];
  const missingBindings = requiredBindings.filter((binding) => !bindings.has(binding));

  if (missingBindings.length > 0) {
    throw new Error(
      `${path}: Erforderliche Bindings fehlen: ${missingBindings.join(", ")}`,
    );
  }

  fs.writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`${path}: Worker domain patched to api.steuerstoff.com and workers.dev enabled`);
}
