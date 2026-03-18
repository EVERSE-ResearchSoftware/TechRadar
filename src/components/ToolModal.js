/**
 * ToolModal.js
 */

import { openModal } from "../utils/dom.js";

/**
 * Populates #tool-modal with the given tool's data, then opens it.
 * @param {Object} tool
 * @param {Object} config
 */
export function showTool(tool, config) {
  const dims = config.dimensions || [];

  set("modal-name",    tool.name);
  set("modal-meta",    `${tool.softwareType || ""} · ${tool.tier}`);
  set("modal-desc",    tool.description);
  set("modal-license", tool.license || "Unknown");

  // Languages
  const langsEl = document.getElementById("modal-langs");
  if (langsEl) {
    langsEl.innerHTML = (tool.languages || [])
      .map((l) => `<span class="tag">${l}</span>`).join("");
  }

  // Indicators
  const indsEl = document.getElementById("modal-indicators");
  const indsSection = document.getElementById("modal-indicators-section");
  if (indsEl && indsSection) {
    const entries = Object.entries(tool.indicators || {});
    if (entries.length) {
      indsEl.innerHTML = entries.map(([dim, text]) => {
        const def = dims.find((d) => d.label === dim);
        const col = def?.color || "#7b82a0";
        return `
          <div class="indicator-row" style="border-color:${col}">
            <span class="ind-dim" style="color:${col}">${dim}</span>
            <span class="ind-text">This tool ${text}</span>
          </div>`;
      }).join("");
      indsSection.hidden = false;
    } else {
      indsSection.hidden = true;
    }
  }

  // Use cases
  const ucEl = document.getElementById("modal-usecases");
  const ucSection = document.getElementById("modal-usecases-section");
  if (ucEl && ucSection) {
    if (tool.useCases?.length) {
      ucEl.innerHTML = tool.useCases
        .map((uc) => `<li class="usecase">${uc}</li>`).join("");
      ucSection.hidden = false;
    } else {
      ucSection.hidden = true;
    }
  }

  // Visit button
  const visitBtn = document.getElementById("modal-visit");
  if (visitBtn) {
    if (tool.website) {
      visitBtn.href = tool.website;
      visitBtn.hidden = false;
    } else {
      visitBtn.hidden = true;
    }
  }

  openModal("tool-modal");
}

function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
