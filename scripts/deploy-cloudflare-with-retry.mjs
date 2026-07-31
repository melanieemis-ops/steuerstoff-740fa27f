import { spawn } from "node:child_process";

const configPath = process.argv[2] ?? ".output/server/wrangler.json";
const maxAttempts = Number(process.env.CLOUDFLARE_DEPLOY_ATTEMPTS ?? 3);
const retryDelayMs = Number(process.env.CLOUDFLARE_DEPLOY_RETRY_DELAY_MS ?? 15000);

function runWranglerDeploy() {
  return new Promise((resolve) => {
    const child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["wrangler", "deploy", "--config", configPath],
      {
        stdio: ["inherit", "pipe", "pipe"],
        env: process.env,
      },
    );

    let output = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on("close", (code) => resolve({ code: code ?? 1, output }));
  });
}

function isRetryableCloudflareFailure(output) {
  return [
    "Received a malformed response",
    "<!DOCTYPE html>",
    "internal error occurred",
    "service unavailable",
    "Bad Gateway",
    "Gateway Timeout",
    "code: 10000",
  ].some((needle) => output.toLowerCase().includes(needle.toLowerCase()));
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  console.log(`Cloudflare-Deploy: Versuch ${attempt}/${maxAttempts}`);
  const result = await runWranglerDeploy();

  if (result.code === 0) {
    console.log("Cloudflare-Deploy erfolgreich.");
    process.exit(0);
  }

  const retryable = isRetryableCloudflareFailure(result.output);
  if (!retryable || attempt === maxAttempts) {
    console.error(
      retryable
        ? `Cloudflare-Deploy nach ${maxAttempts} Versuchen fehlgeschlagen.`
        : "Cloudflare-Deploy mit einem nicht automatisch wiederholbaren Fehler fehlgeschlagen.",
    );
    process.exit(result.code);
  }

  console.warn(
    `Temporäre oder fehlerhafte Cloudflare-API-Antwort erkannt. Neuer Versuch in ${Math.round(
      retryDelayMs / 1000,
    )} Sekunden …`,
  );
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
}
