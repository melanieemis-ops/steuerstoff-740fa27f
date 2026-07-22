import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "node:async_hooks": join(process.cwd(), "src/lib/async-local-storage.browser.ts"),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: "ios-copy-index-entry",
      closeBundle() {
        const outDir = join(process.cwd(), "dist-ios");
        const source = join(outDir, "index.ios.html");
        const target = join(outDir, "index.html");
        if (existsSync(source)) {
          copyFileSync(source, target);
        }
      },
    },
  ],
  build: {
    outDir: "dist-ios",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.ios.html",
    },
  },
});
