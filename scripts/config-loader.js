/**
 * config-loader.js
 * Loads config.yaml and all tool JSON files.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadConfig(rootDir = ROOT) {
  const raw = fs.readFileSync(path.join(rootDir, "config.yaml"), "utf8");
  return yaml.load(raw);
}

export function loadToolFiles(rootDir = ROOT) {
  const toolsDir = path.join(rootDir, "data/tools");
  return fs
    .readdirSync(toolsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      filename: f,
      path: path.join(toolsDir, f),
      data: JSON.parse(fs.readFileSync(path.join(toolsDir, f), "utf8")),
    }));
}
