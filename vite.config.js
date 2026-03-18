import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/**
 * bundleCatalog — Vite plugin
 * Reads config.yaml + data/tools/*.json at build time and writes
 * public/catalog.json so the frontend never needs a backend.
 */
function bundleCatalog() {
  return {
    name: "bundle-catalog",
    buildStart() {
      const config = yaml.load(fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8"));
      const toolsDir = path.join(ROOT, "data/tools");

      const tools = fs
        .readdirSync(toolsDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => JSON.parse(fs.readFileSync(path.join(toolsDir, f), "utf8")))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      const out = { config, tools, generatedAt: new Date().toISOString() };
      const outPath = path.join(ROOT, "public/catalog.json");

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log(`[bundle-catalog] ${tools.length} tools -> public/catalog.json`);
    },
  };
}

export default defineConfig({
  base: "/techradar/",
  plugins: [bundleCatalog()],
  resolve: {
    alias: { "@": path.resolve(ROOT, "src") },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: { main: path.resolve(ROOT, "index.html") },
      output: {
        manualChunks: { vendor: ["fuse.js"] },
      },
    },
  },
  server: { port: 3000, open: "/techradar/" },
  preview: { port: 4000 },
});
