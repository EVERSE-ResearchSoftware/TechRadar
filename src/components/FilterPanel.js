/**
 * FilterPanel.js 

/**
 * @param {string}   containerId  — DOM id of the filter panel container
 * @param {Object}   config
 * @param {Array}    tools        — full tool list (to extract languages/licenses)
 * @param {Object}   filters      — current active filters
 * @param {Function} onChange     — (key, value, active) => void
 */
export function renderFilters(containerId, config, tools, filters, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const langs    = [...new Set(tools.flatMap((t) => t.languages || []))].sort();
  const licenses = [...new Set(tools.map((t) => t.license).filter(Boolean))].sort();
  const howToUse = [...new Set(tools.flatMap((t) => t.howToUse || []))].sort();

  container.innerHTML = [
    chipGroup("Application Category", "tier", config.tiers.map((t) => ({
      val: t.label, cls: `tier-chip--${t.id}`, title: t.description,
    })), filters),
    chipGroup("Quality Dimension", "dim", config.dimensions.map((d) => ({
      val: d.label, style: `border-color:${d.color}`, activeStyle: `color:${d.color};border-color:${d.color};background:${d.color}18`,
    })), filters, "dim-chips"),
    howToUse.length ? chipGroup("How to Use", "howToUse", howToUse.map((h) => ({ val: h })), filters) : "",
    chipGroup("Language", "lang", langs.map((l) => ({ val: l })), filters),
    chipGroup("License", "license", licenses.map((l) => ({ val: l })), filters),
  ].join("");

  container.querySelectorAll(".chip[data-key]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.key;
      const val = chip.dataset.val;
      const now = !chip.classList.contains("chip--active");
      chip.classList.toggle("chip--active", now);
      if (chip.dataset.activeStyle) {
        chip.style.cssText = now ? chip.dataset.activeStyle : (chip.dataset.baseStyle || "");
      }
      onChange(key, val, now);
    });
  });
}

export function syncFilterChips(filters) {
  document.querySelectorAll(".chip[data-key]").forEach((chip) => {
    const key = chip.dataset.key;
    const val = chip.dataset.val;
    const active = filters[key]?.has(val) ?? false;
    chip.classList.toggle("chip--active", active);
    if (!active && chip.dataset.activeStyle) chip.style.cssText = chip.dataset.baseStyle || "";
    if (active && chip.dataset.activeStyle) chip.style.cssText = chip.dataset.activeStyle;
  });
}

function chipGroup(title, key, items, filters, id = "") {
  const chips = items.map(({ val, cls = "", title: tip = "", style = "", activeStyle = "" }) => {
    const active = filters[key]?.has(val);
    const appliedStyle = active && activeStyle ? activeStyle : style;
    return `<button
      class="chip ${cls} ${active ? "chip--active" : ""}"
      data-key="${key}"
      data-val="${val}"
      data-active-style="${activeStyle}"
      data-base-style="${style}"
      style="${appliedStyle}"
      title="${tip}"
      aria-pressed="${active}"
      aria-label="Filter by ${key}: ${val}"
    >${val}</button>`;
  }).join("");

  return `
    <section class="filter-group" aria-label="${title} filters">
      <h3 class="filter-title">${title}</h3>
      <div class="chip-row" ${id ? `id="${id}"` : ""}>${chips}</div>
    </section>`;
}
