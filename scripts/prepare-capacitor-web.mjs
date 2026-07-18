import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const outputPublicDir = join(projectRoot, ".output", "public");
const outputAssetsDir = join(outputPublicDir, "assets");
const outputServerDir = join(projectRoot, ".output", "server");
const distDir = join(projectRoot, "dist");
const distAssetsDir = join(distDir, "assets");

function fail(message) {
  console.error(`[prepare-capacitor-web] ${message}`);
  process.exit(1);
}

if (!existsSync(outputAssetsDir)) {
  fail("Build output fehlt. Bitte zuerst `npm run build` ausfuehren.");
}

const manifestFile = readdirSync(outputServerDir).find(
  (name) => name.startsWith("_tanstack-start-manifest_") && name.endsWith(".mjs"),
);

if (!manifestFile) {
  fail("TanStack-Manifest nicht gefunden in .output/server.");
}

const manifestContent = readFileSync(join(outputServerDir, manifestFile), "utf8");
const rootScriptMatch = manifestContent.match(/__root__:[\\s\\S]*?src:\s*"([^"]+)"/);

if (!rootScriptMatch) {
  fail("Konnte App-Entry-Script nicht aus dem TanStack-Manifest lesen.");
}

const rootScriptSrc = rootScriptMatch[1].replace(/^\//, "");
const styleFile = readdirSync(outputAssetsDir).find((name) => name.startsWith("styles-") && name.endsWith(".css"));

if (!styleFile) {
  fail("Kein styles-*.css im Build-Output gefunden.");
}

const rootScriptFileName = rootScriptSrc.replace(/^assets\//, "");
const rootScriptFullPath = join(outputAssetsDir, rootScriptFileName);
if (!existsSync(rootScriptFullPath)) {
  fail(`Entry-Script nicht gefunden: ${rootScriptSrc}`);
}

mkdirSync(distDir, { recursive: true });
rmSync(distAssetsDir, { recursive: true, force: true });
cpSync(outputAssetsDir, distAssetsDir, { recursive: true });

for (const fileName of ["manifest.webmanifest", "favicon.ico", "cover.png"]) {
  const sourceFile = join(outputPublicDir, fileName);
  if (existsSync(sourceFile)) {
    copyFileSync(sourceFile, join(distDir, fileName));
  }
}

const outputIconsDir = join(outputPublicDir, "icons");
if (existsSync(outputIconsDir) && statSync(outputIconsDir).isDirectory()) {
  cpSync(outputIconsDir, join(distDir, "icons"), { recursive: true });
}

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>steuerstoff</title>
    <link rel="stylesheet" href="./assets/${styleFile}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./${rootScriptSrc}"></script>
  </body>
</html>
`;

writeFileSync(join(distDir, "index.html"), html, "utf8");

console.log("[prepare-capacitor-web] dist/index.html und dist/assets wurden aktualisiert.");
