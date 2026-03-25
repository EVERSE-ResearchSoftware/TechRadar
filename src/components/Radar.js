/**
 * Radar.js
 * Renders the mini radar in the sidebar and wires the expand-to-modal action.
 */

import { drawRings, drawSegments } from "../utils/radar-svg.js";
import { openModal } from "../utils/dom.js";

let _config = null;
let _tools = null;
let _filters = null;
let _onDimClick = null;

export function mountRadar(config, tools, filters, onDimClick) {
  _config = config;
  _tools = tools;
  _filters = filters;
  _onDimClick = onDimClick;
  renderMini();
}

export function updateRadar(filters) {
  _filters = filters;
  renderMini();
  // Redraw big radar if modal is open
  if (document.getElementById("radar-modal")?.classList.contains("open")) {
    renderBig();
  }
}

function renderMini() {
  const svg = document.getElementById("mini-radar");
  if (!svg) return;

  // Clear and re-append in correct paint order:
  // segs (wedge fills) → dots → rings (circles + labels on top)
  svg.innerHTML = "";
  const segsG = createG(svg, "radar-segs");
  const dotsG = createG(svg, "radar-dots");
  const ringsG = createG(svg, "radar-rings");

  const CX = 100,
    CY = 100,
    R = 90;
  drawSegments(segsG, dotsG, {
    dims: _config.dimensions,
    tools: _tools,
    tiers: _config.tiers,
    activeFilters: _filters,
    cx: CX,
    cy: CY,
    r: R,
    showLabels: false,
    onDimClick: _onDimClick,
    onDotClick: (tool) => {
      import("./ToolModal.js").then(({ showTool }) => showTool(tool, _config));
    },
  });
  drawRings(ringsG, CX, CY, _config.tiers, R);
}

export function renderBig() {
  const svg = document.getElementById("big-radar");
  if (!svg) return;

  // Clear and re-append in correct paint order:
  // segs (wedge fills) → dots → rings (circles + labels on top)
  svg.innerHTML = "";
  // ViewBox 1000x1000, centre 500,500, R=340
  // Labels at R*1.18 ≈ 401 → 500-401=99px base clearance each side
  // plus text opens outward from anchor point

  svg.setAttribute("viewBox", "0 0 1200 1200");
  const segsG = createG(svg, "big-segs");
  const dotsG = createG(svg, "big-dots");
  const ringsG = createG(svg, "big-rings");

  const CX = 600,
    CY = 600,
    R = 420;
  drawSegments(segsG, dotsG, {
    dims: _config.dimensions,
    tools: _tools,
    tiers: _config.tiers,
    activeFilters: _filters,
    cx: CX,
    cy: CY,
    r: R,
    showLabels: true,
    onDimClick: _onDimClick,
    onDotClick: (tool) => {
      import("./ToolModal.js").then(({ showTool }) => showTool(tool, _config));
    },
  });
  drawRings(ringsG, CX, CY, _config.tiers, R);
}

function createG(svg, cls) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", cls);
  svg.appendChild(g);
  return g;
}

/** Wire expand-radar button (called from main.js after DOM is ready) */
export function wireRadarExpand() {
  const btn = document.getElementById("expand-radar-btn");
  btn?.addEventListener("click", () => {
    openModal("radar-modal");
    renderBig();
  });
}
