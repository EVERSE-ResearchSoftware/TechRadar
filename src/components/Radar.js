/**
 * Radar.js
 * Renders the mini radar in the sidebar
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
  if (document.getElementById("radar-modal")?.classList.contains("open")) {
    renderBig();
  }
}

function renderMini() {
  const svg = document.getElementById("mini-radar");
  if (!svg) return;

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

  svg.innerHTML = "";
  svg.setAttribute("viewBox", "0 0 530 530");
  const segsG = createG(svg, "big-segs");
  const dotsG = createG(svg, "big-dots");
  const ringsG = createG(svg, "big-rings");

  const CX = 265,
    CY = 265,
    R = 185;
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

export function wireRadarExpand() {
  const btn = document.getElementById("expand-radar-btn");
  btn?.addEventListener("click", () => {
    openModal("radar-modal");
    renderBig();
  });
}
