#!/usr/bin/env node
/**
 * snapshot.js
 * Generates a versioned catalog snapshot in public/snapshots/YYYY-MM-DD/.
 * Snapshots include: tools.json (full catalog) and stats.json (aggregated metrics).
 * Run before every release: npm run generate:snapshot
 *
 * Usage:
 *   node scripts/snapshot.js              # uses today's date
 *   node scripts/snapshot.js 2025-09-01  # specify date
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig, loadToolFiles } from "./config-loader.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function fmt(date) {
  return date.toISOString().split("T")[0];
}

function main() {
  const dateArg = process.argv[2];
  const date = dateArg ? new Date(dateArg) : new Date();
  const dateStr = fmt(date);

  const outDir = path.join(ROOT, "public/snapshots", dateStr);
  fs.mkdirSync(outDir, { recursive: true });

  const config = loadConfig(ROOT);
  const toolFiles = loadToolFiles(ROOT);
  const tools = toolFiles
    .map((t) => t.data)
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(
    `\n  Generating snapshot for ${dateStr} (${tools.length} tools)...\n`,
  );

  // ── tools.json ─────────────────────────────────────────────────────────────
  const catalogSnapshot = {
    generatedAt: date.toISOString(),
    releaseDate: dateStr,
    schemaVersion: "1.0",
    toolCount: tools.length,
    tools,
  };
  const toolsPath = path.join(outDir, "tools.json");
  fs.writeFileSync(toolsPath, JSON.stringify(catalogSnapshot, null, 2));
  console.log(`  ✓  Wrote ${path.relative(ROOT, toolsPath)}`);

  // ── stats.json ─────────────────────────────────────────────────────────────
  const byTier = {};
  const bySoftwareType = {};
  const byDimension = {};
  const byLicense = {};

  tools.forEach((t) => {
    byTier[t.tier] = (byTier[t.tier] || 0) + 1;
    bySoftwareType[t.softwareType] = (bySoftwareType[t.softwareType] || 0) + 1;
    byLicense[t.license] = (byLicense[t.license] || 0) + 1;
    (t.dimensions || []).forEach((d) => {
      byDimension[d] = (byDimension[d] || 0) + 1;
    });
  });

  const stats = {
    generatedAt: date.toISOString(),
    releaseDate: dateStr,
    byTier,
    bySoftwareType,
    byDimension,
    byLicense,
  };
  const statsPath = path.join(outDir, "stats.json");
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`  ✓  Wrote ${path.relative(ROOT, statsPath)}`);

  // ── also write latest/tools.json (always current) ────────────────────────
  const latestDir = path.join(ROOT, "public/snapshots/latest");
  fs.mkdirSync(latestDir, { recursive: true });
  fs.copyFileSync(toolsPath, path.join(latestDir, "tools.json"));
  fs.copyFileSync(statsPath, path.join(latestDir, "stats.json"));
  console.log(`  ✓  Updated public/snapshots/latest/`);

  // ── console summary ────────────────────────────────────────────────────────
  console.log("\n  By tier:");
  config.tiers.forEach((t) => {
    const n = byTier[t.label] || 0;
    console.log(`    ${t.label.padEnd(8)} ${n}`);
  });
  console.log("\n  By dimension (top 5):");
  Object.entries(byDimension)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([d, n]) => console.log(`    ${d.padEnd(20)} ${n}`));

  console.log(`\n  ✓  Snapshot complete → public/snapshots/${dateStr}/\n`);
}

main();
