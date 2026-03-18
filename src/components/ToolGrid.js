/**
 * ToolGrid.js
 * Renders the tool card grid into #catalog.
 */

import { showTool } from "./ToolModal.js";

/**
 * @param {Array}  tools   — filtered & sorted
 * @param {Object} config  — platform config
 */
export function renderGrid(tools, config) {
  const catalog = document.getElementById("catalog");
  if (!catalog) return;

  if (!tools.length) {
    catalog.innerHTML = `
      <div class="empty">
        <span class="empty-icon">🔭</span>
        <h3>No tools match your filters</h3>
        <p>Try broadening your search or <button class="link-btn" onclick="window.__tr.clearFilters()">clear all filters</button>.</p>
      </div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid";
  grid.innerHTML = tools.map((tool, i) => cardHTML(tool, config, i)).join("");
  catalog.innerHTML = "";
  catalog.appendChild(grid);

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const name = card.dataset.name;
      const tool = tools.find((t) => t.name === name);
      if (tool) showTool(tool, config);
    });
  });
}

function cardHTML(tool, config, idx) {
  const tierCls = tool.tier?.toLowerCase() || "";
  const firstDim = tool.dimensions?.[0];
  const dimDef = config.dimensions?.find((d) => d.label === firstDim);
  const dimColor = dimDef?.color || "#7b82a0";
  const indicator = tool.indicators?.[firstDim] || "";
  const langs = (tool.languages || []).slice(0, 3)
    .map((l) => `<span class="tag">${l}</span>`).join("");

  return `
    <article class="card" data-name="${tool.name}" data-tier="${tool.tier}"
             style="animation-delay:${idx * 25}ms" role="button" tabindex="0"
             aria-label="View details for ${tool.name}">
      <header class="card-head">
        <div class="card-titles">
          <span class="card-name">${tool.name}</span>
          <span class="card-type">${tool.softwareType || ""}</span>
        </div>
      </header>
      <p class="card-desc">${tool.description}</p>
      ${indicator ? `
        <aside class="card-indicator" style="border-color:${dimColor}">
          <strong style="color:${dimColor}">${firstDim}</strong> — This tool ${indicator}
        </aside>` : ""}
      <footer class="card-foot">
        <div class="tags" aria-label="Languages: ${(tool.languages || []).join(', ')}">${langs}</div>
        ${tool.website ? `<a class="card-link" href="${tool.website}" target="_blank" rel="noopener noreferrer"
             aria-label="Open ${tool.name} documentation (new tab)">Docs ↗</a>` : ""}
      </footer>
    </article>`;
}
