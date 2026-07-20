import {
  copyFileSync,
  cpSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();

const outputPublicDir = join(
  projectRoot,
  ".output",
  "public",
);

const shellFile = join(
  outputPublicDir,
  "_shell.html",
);

const distDir = join(
  projectRoot,
  "dist",
);

if (!existsSync(shellFile)) {
  console.error(
    "[prepare-capacitor-web] _shell.html fehlt. " +
      "Bitte prüfen, ob der TanStack-SPA-Modus aktiviert ist.",
  );

  process.exit(1);
}

rmSync(distDir, {
  recursive: true,
  force: true,
});

cpSync(outputPublicDir, distDir, {
  recursive: true,
});

copyFileSync(
  join(distDir, "_shell.html"),
  join(distDir, "index.html"),
);

console.log(
  "[prepare-capacitor-web] Capacitor-App wurde erfolgreich vorbereitet.",
);
