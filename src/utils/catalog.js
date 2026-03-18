/**
 * catalog.js
 * Loads the bundled catalog.json (generated at build time by vite.config.js)
 * and exposes pure-function utilities for filtering and sorting.
 */

let _catalog = null;

/**
 * Fetch and cache the full catalog (config + tools).
 * @returns {Promise<{config: Object, tools: Array}>}
 */
export async function loadCatalog() {
  if (_catalog) return _catalog;

  const res = await fetch(`${import.meta.env.BASE_URL}catalog.json`);
  if (!res.ok) throw new Error(`Failed to load catalog.json: ${res.status}`);
  const raw = await res.json();
  _catalog = { ...raw, tools: raw.tools.map(normaliseTool) };
  return _catalog;
}

// ── applicationCategory @id → softwareType label ─────────────────────────────
const CATEGORY_LABEL = {
  AnalysisCode: "Analysis Code",
  PrototypeTool: "Prototype Tool",
  ResearchInfrastructureSoftware: "Research Software Infrastructure",
};

// Radar ring tier driven by applicationCategory
const CATEGORY_TIER = {
  AnalysisCode: "Analysis Code",
  PrototypeTool: "Prototype Tool",
  ResearchInfrastructureSoftware: "Research Software Infrastructure",
};

// Priority rule for multi-category tools (matches team specification):
//   AnalysisCode > PrototypeTool > ResearchInfrastructureSoftware
const CATEGORY_PRIORITY = [
  "AnalysisCode",
  "PrototypeTool",
  "ResearchInfrastructureSoftware",
];

function resolveRawCategory(raw) {
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const keys = items
    .map((item) => {
      const id = item?.["@id"] || item || "";
      return id.split(":").pop().split("/").pop();
    })
    .filter(Boolean);

  if (keys.length === 0) return "";
  if (keys.length === 1) return keys[0];
  for (const p of CATEGORY_PRIORITY) {
    if (keys.includes(p)) return p;
  }
  return keys[0];
}

// softwareType label — e.g. "Analysis Code"
function resolveCategory(raw) {
  const key = resolveRawCategory(raw);
  return CATEGORY_LABEL[key] || key;
}

function resolveTier(raw) {
  const key = resolveRawCategory(raw);
  return CATEGORY_TIER[key] || "Analysis Code";
}

// hasQualityDimension URIs
function resolveDimensions(raw) {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .map((item) => {
      const id = item?.["@id"] || item || "";
      // "dim:maintainability" → "Maintainability"
      const key = id.split(":").pop().split("/").pop();
      return key.charAt(0).toUpperCase() + key.slice(1);
    })
    .filter(Boolean);
}

// license URI "https://spdx.org/licenses/GPL-3.0-only" → "GPL-3.0-only"
function resolveLicense(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw.split("/").pop() || raw;
  return raw?.["@id"]?.split("/").pop() || String(raw);
}

// languages appliesToProgrammingLanguage
function resolveLanguages(tool) {
  if (tool.languages?.length) return tool.languages;
  if (tool.appliesToProgrammingLanguage?.length)
    return tool.appliesToProgrammingLanguage;
  return [];
}

// ── improvesQualityIndicator URIs → short id array ───────────────────────────
// "https://w3id.org/.../no_critical_vulnerability" → "no_critical_vulnerability"
function resolveIndicatorIds(raw) {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .map((item) => {
      const id = item?.["@id"] || item || "";
      return id.split("/").pop();
    })
    .filter(Boolean);
}

function normaliseTool(tool) {
  return {
    ...tool,
    website: tool.website || tool.url,
    // tier: radar ring driven by applicationCategory
    tier: tool.tier || resolveTier(tool.applicationCategory),
    // softwareType: display label — "Analysis Code" etc.
    softwareType:
      tool.softwareType || resolveCategory(tool.applicationCategory),
    dimensions: tool.dimensions?.length
      ? tool.dimensions
      : resolveDimensions(tool.hasQualityDimension),
    languages: resolveLanguages(tool),
    license: resolveLicense(tool.license),
    qualityIndicatorIds: resolveIndicatorIds(tool.improvesQualityIndicator),
  };
}

/**
 * Filter tools
 * ANDed across categories, ORed within a category.
 */
export function applyFilters(tools, filters = {}) {
  return tools.filter((tool) => {
    if (filters.tier?.size && !filters.tier.has(tool.tier)) return false;
    if (filters.dim?.size && !tool.dimensions?.some((d) => filters.dim.has(d)))
      return false;
    if (filters.lang?.size && !tool.languages?.some((l) => filters.lang.has(l)))
      return false;
    if (filters.license?.size && !filters.license.has(tool.license))
      return false;
    if (
      filters.howToUse?.size &&
      !tool.howToUse?.some((h) => filters.howToUse.has(h))
    )
      return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const corpus = [
        tool.name,
        tool.description,
        ...(tool.dimensions || []),
        ...(tool.useCases || []),
        ...(tool.tags || []),
        ...(tool.howToUse || []),
        ...(tool.qualityIndicatorIds || []),
      ]
        .join(" ")
        .toLowerCase();
      if (!corpus.includes(q)) return false;
    }
    return true;
  });
}

const TIER_ORDER = { Adopt: 0, Trial: 1, Assess: 2, Hold: 3 };

export function sortTools(tools, key = "name") {
  return [...tools].sort((a, b) => {
    if (key === "tier")
      return (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);
    if (key === "newest")
      return new Date(b.addedDate || 0) - new Date(a.addedDate || 0);
    return (a.name || "").localeCompare(b.name || "");
  });
}

export function extractVocab(tools) {
  return {
    languages: [...new Set(tools.flatMap((t) => t.languages || []))].sort(),
    licenses: [...new Set(tools.map((t) => t.license).filter(Boolean))].sort(),
  };
}

export function hasActiveFilters(filters) {
  return (
    (filters.tier?.size ?? 0) > 0 ||
    (filters.dim?.size ?? 0) > 0 ||
    (filters.lang?.size ?? 0) > 0 ||
    (filters.license?.size ?? 0) > 0 ||
    (filters.howToUse?.size ?? 0) > 0 ||
    (filters.query?.length ?? 0) > 0
  );
}

export function emptyFilters() {
  return {
    tier: new Set(),
    dim: new Set(),
    lang: new Set(),
    license: new Set(),
    howToUse: new Set(),
    query: "",
  };
}
