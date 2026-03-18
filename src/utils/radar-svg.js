/**
 * radar-svg.js
 * functions for drawing the interactive SVG TechRadar.
 */

const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function dimHue(i, n) {
  return Math.round((i / n) * 360);
}

function wedgeFill(hue, inactive) {
  return inactive ? `hsl(${hue}, 15%, 92%)` : `hsl(${hue}, 55%, 88%)`;
}

function dotFill(hue, inactive) {
  return inactive ? `hsl(${hue}, 15%, 75%)` : `hsl(${hue}, 65%, 45%)`;
}

/** Segment label colour */
function labelFill(hue, inactive) {
  return inactive ? `hsl(${hue}, 10%, 70%)` : `hsl(${hue}, 55%, 32%)`;
}

export function drawRings(group, cx, cy, tiers, maxR) {
  const rings = tiers.map((_, i, arr) => maxR * ((i + 1) / arr.length));

  rings.forEach((r, i) => {
    group.appendChild(
      svgEl("circle", {
        cx,
        cy,
        r,
        fill: "none",
        stroke: "#c8c0d8",
        "stroke-width": i === rings.length - 1 ? 1.5 : 0.8,
        "stroke-dasharray": i < rings.length - 1 ? "3,4" : "none",
      }),
    );
  });

  // Ring labels — centred vertically in each ring band at the top.
  tiers.forEach((tier, i) => {
    const innerR = i === 0 ? 0 : maxR * (i / tiers.length);
    const labelR = innerR + maxR * (1 / tiers.length) * 0.5;
    const t = svgEl("text", {
      x: cx,
      y: cy - labelR,
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      "font-size": "8",
      fill: "#4a3a6a",
      "font-family": "DM Mono, monospace",
      "font-weight": "700",
      "letter-spacing": "0.08em",
      style: "pointer-events:none",
    });
    t.textContent = tier.label.toUpperCase();
    group.appendChild(t);
  });
}

export function drawSegments(segGroup, dotGroup, opts) {
  const {
    dims,
    tools,
    tiers,
    activeFilters,
    cx,
    cy,
    r,
    showLabels,
    onDimClick,
    onDotClick,
  } = opts;
  segGroup.innerHTML = "";
  dotGroup.innerHTML = "";

  const n = dims.length;
  const step = (2 * Math.PI) / n;
  const hasActiveDim = activeFilters?.dim?.size > 0;
  const tierRings = computeTierRings(tiers, r);

  dims.forEach((dim, i) => {
    const hue = dimHue(i, n);
    const a0 = i * step - Math.PI / 2;
    const a1 = a0 + step;
    const mid = (a0 + a1) / 2;
    const isActive = activeFilters?.dim?.has(dim.label);
    const isInactive = hasActiveDim && !isActive;

    //  Wedge
    const x0 = cx + r * Math.cos(a0),
      y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1),
      y1 = cy + r * Math.sin(a1);
    const g = svgEl("g", {
      class:
        "seg" +
        (isActive ? " seg--active" : "") +
        (isInactive ? " seg--inactive" : ""),
    });

    const wedge = svgEl("path", {
      d: `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1} Z`,
      fill: wedgeFill(hue, isInactive),
      stroke: "#ffffff",
      "stroke-width": "1",
      class: "seg-fill",
      "data-dim": dim.label,
      style: "cursor:pointer;transition:filter .2s",
    });

    wedge.addEventListener("mouseenter", () => {
      wedge.style.filter = "brightness(0.93)";
    });
    wedge.addEventListener("mouseleave", () => {
      wedge.style.filter = "";
    });
    wedge.addEventListener("click", () => onDimClick?.(dim.label));
    g.appendChild(wedge);

    // Label (big radar only)
    if (showLabels) {
      const labelR = r * 1.15;
      const lx = cx + labelR * Math.cos(mid);
      const ly = cy + labelR * Math.sin(mid);
      const anchor =
        Math.cos(mid) > 0.1 ? "start" : Math.cos(mid) < -0.1 ? "end" : "middle";

      const t = svgEl("text", {
        x: lx,
        y: ly,
        "text-anchor": anchor,
        "dominant-baseline": "middle",
        "font-size": "9",
        fill: labelFill(hue, isInactive),
        "font-family": "DM Mono, monospace",
        "font-weight": "600",
        "letter-spacing": "0.06em",
        style: "pointer-events:none",
      });
      t.textContent = dim.label.toUpperCase();
      g.appendChild(t);
    }

    segGroup.appendChild(g);
  });

  // Tool Dots
  tools.forEach((tool) => {
    (tool.dimensions || []).forEach((dimLabel) => {
      const dimIdx = dims.findIndex((d) => d.label === dimLabel);
      if (dimIdx < 0) return;

      const hue = dimHue(dimIdx, n);
      const a0 = dimIdx * step - Math.PI / 2;
      const dimMid = a0 + step / 2;
      const spread =
        seededRand(tool.name + dimLabel + "s") * step * 0.65 - step * 0.325;
      const ring = tierRings[tool.tier];
      if (!ring) return;
      const rDist =
        ring.inner +
        seededRand(tool.name + dimLabel + "r") * (ring.outer - ring.inner);

      const dx = cx + rDist * Math.cos(dimMid + spread);
      const dy = cy + rDist * Math.sin(dimMid + spread);
      const isInactive =
        activeFilters?.dim?.size && !activeFilters.dim.has(dimLabel);

      const dot = svgEl("circle", {
        cx: dx,
        cy: dy,
        r: showLabels ? 5 : 3,
        fill: dotFill(hue, isInactive),
        opacity: isInactive ? "0.35" : "1",
        stroke: "#ffffff",
        "stroke-width": "1.5",
        style: "cursor:pointer",
        "data-tool": tool.name,
      });

      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        onDotClick?.(tool);
      });

      dotGroup.appendChild(dot);
    });
  });
}

/** Compute inner/outer radii for each tier ring */
function computeTierRings(tiers, maxR) {
  const result = {};
  tiers.forEach((t, i) => {
    const inner = i === 0 ? 0 : maxR * (i / tiers.length);
    const outer = maxR * ((i + 1) / tiers.length);
    result[t.label] = { inner: inner + 2, outer: outer - 2 };
  });
  return result;
}

function seededRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 1000) / 1000;
}
