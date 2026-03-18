/**
 * main.js — TechRadar Application

 */

import "@/styles/main.css";
import { loadCatalog, applyFilters, sortTools, emptyFilters, hasActiveFilters } from "@/utils/catalog.js";
import { openModal, closeModal, qs }                                             from "@/utils/dom.js";
import { mountRadar, updateRadar, renderBig, wireRadarExpand }                   from "@/components/Radar.js";
import { renderGrid }                                                             from "@/components/ToolGrid.js";
import { renderFilters, syncFilterChips }                                         from "@/components/FilterPanel.js";
import { mountSuggestModal }                                                      from "@/components/SuggestModal.js";

const state = {
  config: null,
  tools:  [],
  filters: emptyFilters(),
  sort: "name",
};

// Theme
// Reads theme tokens from config.yaml (via catalog.json) and applies them
// as CSS custom properties on :root. Edit config.yaml to change the theme.
function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  const map = {
    colorBg:       "--bg",
    colorSurface:  "--surface",
    colorSurface2: "--surface2",
    colorBorder:   "--border",
    colorText:     "--text",
    colorMuted:    "--muted",
    colorDim:      "--dim",
    colorGreen:    "--green",
    colorBlue:     "--blue",
    colorYellow:   "--yellow",
    colorOrange:   "--orange",
    fontDisplay:   "--font-d",
    fontBody:      "--font-b",
    fontMono:      "--font-m",
    fontSize:      "--font-sz",
    radiusCard:    "--r-lg",
    radiusChip:    "--r",
  };
  Object.entries(map).forEach(([key, cssVar]) => {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  });
  if (theme.fontSize) root.style.fontSize = theme.fontSize;
}

function patchNavLogo(platform) {
  const el = document.getElementById("nav-logo");
  if (!el) return;
  if (platform.logoPath) {
    el.innerHTML = `<img src="${platform.logoPath}" alt="${platform.name}" class="nav-logo-img">`;
  } else {
    el.innerHTML = `<span class="logo-dot" aria-hidden="true"></span>`;  }
}

// Updates hero title and tagline from config.platform after catalog loads.
function updateHero(platform) {
  const title = document.querySelector(".hero-title");
  const tagline = document.querySelector(".hero-tagline");
  if (title)   title.textContent   = platform.name    || "TechRadar";
  if (tagline) tagline.textContent = platform.tagline || "";
}

// Footer
function footer() {
  return `
    <footer class="site-footer" id="footer" aria-label="Site footer">
      <div class="footer-inner">

        <div class="footer-section">
          <h3 class="footer-heading">Contribution Guidelines</h3>
          <a class="footer-link" href="#" id="footer-contributing-link"
             target="_blank" rel="noopener noreferrer">
            Contributing Guide →
          </a>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">Legal</h3>
          <a class="footer-link" href="#" id="footer-privacy-link"
             target="_blank" rel="noopener noreferrer">
            Privacy Policy →
          </a>
        </div>

      </div>
      <div class="footer-bottom">
        <p id="footer-bottom-text">
          TechRadar is being developed as part of the
          <a href="https://everse.software" target="_blank" rel="noopener noreferrer">EVERSE project</a>.
          EVERSE is funded by the European Commission
          <a href="https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/horizon-infra-2023-eosc-01-02"
             target="_blank" rel="noopener noreferrer">HORIZON-INFRA-2023-EOSC-01-02</a>.
        </p>
      </div>
    </footer>`;
}

// Patches footer links and curator list from config after catalog loads.
function updateFooter(config) {
  const platform = config.platform || {};

  // Contributing link
  const contribLink = document.getElementById("footer-contributing-link");
  if (contribLink && platform.contributingUrl) {
    contribLink.href = platform.contributingUrl;
  }

  // Privacy link
  const privacyLink = document.getElementById("footer-privacy-link");
  if (privacyLink && platform.privacyUrl) {
    privacyLink.href = platform.privacyUrl;
  }
  }

  // Bottom text
  const bottomText = document.getElementById("footer-bottom-text");
  if (bottomText && platform.name) {
    bottomText.innerHTML = `
      ${platform.name} is being developed as part of the
      <a href="https://everse.software" target="_blank" rel="noopener noreferrer">EVERSE project</a>.
      EVERSE is funded by the European Commission
      <a href="https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/horizon-infra-2023-eosc-01-02"
         target="_blank" rel="noopener noreferrer">HORIZON-INFRA-2023-EOSC-01-02</a>.`;
  }

async function boot() {
  renderShell();

  try {
    const catalog = await loadCatalog();
    state.config = catalog.config;
    state.tools  = catalog.tools;
    applyTheme(state.config.theme);
    patchNavLogo(state.config.platform);
    updateHero(state.config.platform);
    updateFooter(state.config);
  } catch (err) {
    qs("#catalog").innerHTML = `
      <div class="empty" style="color:var(--err)">
        <span class="empty-icon">⚠️</span>
        <h3>Could not load catalog</h3>
        <p>${err.message}</p>
        <p style="margin-top:8px;font-size:12px;color:var(--muted)">
          Run <code>npm run dev</code> or <code>npm run build</code> first.
        </p>
      </div>`;
    return;
  }

  populateDimensionsModal();

  mountRadar(state.config, state.tools, state.filters, onDimClick);
  wireRadarExpand();
  mountSuggestModal(state.config);

  renderFilters("filter-panel", state.config, state.tools, state.filters, onFilterChange);
  refresh();

  window.__tr = { clearFilters, openModal, closeModal };
}

function renderShell() {
  document.getElementById("app").innerHTML = `
    ${nav()}
    <div class="layout">
      ${heroSection()}
      <aside class="sidebar" aria-label="Filters and radar">
        ${radarWidget()}
        <div id="filter-panel" role="search" aria-label="Tool filters"></div>
        <button class="clear-btn" onclick="window.__tr.clearFilters()" aria-label="Clear all active filters">
          ✕ Clear all filters
        </button>
      </aside>
      <main id="catalog" class="catalog" aria-label="Tool catalog" aria-live="polite"></main>
    </div>
    ${allModals()}
    ${footer()}
  `;

  // Search input
  qs("#search-input")?.addEventListener("input", (e) => {
    state.filters.query = e.target.value;
    refresh();
  });

}

function refresh() {
  const filtered = sortTools(applyFilters(state.tools, state.filters), state.sort);
  renderGrid(filtered, state.config);
  updateResultCount(filtered.length);
  updateRadar(state.filters);
  qs(".clear-btn").style.visibility = hasActiveFilters(state.filters) ? "visible" : "hidden";
}

function updateResultCount(n) {
  const el = qs("#result-count");
  if (el) {
    el.textContent = `${n} tool${n !== 1 ? "s" : ""}`;
    el.setAttribute("aria-label", `${n} tools found`);
  }
}

function onFilterChange(key, value, active) {
  if (active) state.filters[key].add(value);
  else        state.filters[key].delete(value);
  refresh();
}

function onDimClick(dim) {
  const active = !state.filters.dim.has(dim);
  if (active) state.filters.dim.add(dim);
  else        state.filters.dim.delete(dim);
  syncFilterChips(state.filters);
  refresh();
}

function clearFilters() {
  state.filters = emptyFilters();
  const input = qs("#search-input");
  if (input) input.value = "";

  state.sort = "name";
  syncFilterChips(state.filters);
  refresh();
}

function populateDimensionsModal() {
  const list = qs("#dimensions-list");
  if (!list || !state.config) return;
  list.innerHTML = state.config.dimensions.map((d) => `
    <div class="dim-entry" style="border-color:${d.color}">
      <span class="dim-entry-name" style="color:${d.color}">${d.label}</span>
      <span class="dim-entry-desc">${d.description}</span>
    </div>`).join("");
}

function nav() {
  return `
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav-logo" id="nav-logo" aria-label="TechRadar home">
        <span class="logo-dot" aria-hidden="true"></span>
        TechRadar
      </div>
      <ul class="nav-links" role="list">
        <li><button class="nav-link nav-link--active" aria-current="page">Catalog</button></li>
        <li><button class="nav-link" onclick="window.__tr.openModal('dimensions-modal')">Dimensions</button></li>
        <li><button class="nav-link" onclick="window.__tr.openModal('about-modal')">About</button></li>
        <li><button class="nav-link" onclick="window.__tr.openModal('how-modal')">How to Use</button></li>
      </ul>
      <div class="nav-actions">
        <a class="nav-gh" href="https://github.com/your-org/techradar"
           target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>
        <button class="btn-suggest" onclick="window.__tr.openModal('suggest-modal')"
                aria-label="Suggest a new tool for the catalog">
          <span aria-hidden="true">+</span> Suggest a Tool
        </button>
      </div>
    </nav>`;
}

function heroSection() {
  const name    = state.config?.platform?.name    || "TechRadar";
  const tagline = state.config?.platform?.tagline || "Find the right tools to improve your research software quality";
  return `
    <div class="hero" role="search" aria-label="Search tools">
      <h1 class="hero-title">${name}</h1>
      <p class="hero-tagline">${tagline}</p>
      <div class="hero-search-wrap">
        <svg class="search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor"
             stroke-width="1.6" aria-hidden="true" focusable="false">
          <circle cx="6.5" cy="6.5" r="5"/><path d="M10.5 10.5l3 3"/>
        </svg>
        <input id="search-input" type="search" class="search-input"
               placeholder="Search by name, description, or use case…"
               aria-label="Search tools" autocomplete="off" spellcheck="false"/>
      </div>
      <span id="result-count" class="result-count" aria-live="polite" aria-atomic="true"></span>
    </div>`;
}

function radarWidget() {
  return `
    <div class="radar-widget" aria-label="Tech Radar visualization">
      <div class="radar-widget-header">
        <span class="section-label">Tech Radar</span>
        <button id="expand-radar-btn" class="expand-btn"
                aria-label="Expand radar to full view"
                onclick="window.__tr.openModal('radar-modal');import('@/components/Radar.js').then(m=>m.renderBig())">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <path d="M1 4V1h3M7 1h3v3M10 7v3H7M4 10H1V7"/>
          </svg>
          Expand
        </button>
      </div>
      <svg id="mini-radar" class="mini-radar" viewBox="0 0 200 200"
           xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Mini radar visualization — click segments to filter by quality dimension">
        <g class="radar-rings"></g>
        <g class="radar-segs"></g>
        <g class="radar-dots"></g>
        <circle cx="100" cy="100" r="5" fill="#4af0a0" opacity="0.9" aria-hidden="true"/>
      </svg>
    </div>`;
}

function allModals() {
  return `
    ${toolModal()}
    ${suggestModal()}
    ${radarModal()}
    ${dimensionsModal()}
    ${aboutModal()}
    ${howToUseModal()}
  `;
}

function toolModal() {
  return `
    <div id="tool-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-name">
      <div class="modal">
        <button class="modal-x" onclick="window.__tr.closeModal('tool-modal')" aria-label="Close">✕</button>
        <h2 id="modal-name" class="modal-title"></h2>
        <p id="modal-meta" class="modal-meta"></p>

        <section class="modal-section">
          <h3 class="modal-section-title">Description</h3>
          <p id="modal-desc" class="modal-desc"></p>
        </section>

        <section id="modal-indicators-section" class="modal-section">
          <h3 class="modal-section-title">Quality Indicators — How It Measures</h3>
          <div id="modal-indicators"></div>
        </section>

        <section id="modal-usecases-section" class="modal-section">
          <h3 class="modal-section-title">Use Cases</h3>
          <ul id="modal-usecases" class="usecase-list"></ul>
        </section>

        <section class="modal-section">
          <h3 class="modal-section-title">Metadata</h3>
          <div class="modal-meta-row">
            <span>Licence:</span>
            <code id="modal-license" class="license-badge"></code>
            <span>Languages:</span>
            <div id="modal-langs" class="tags" aria-label="Supported languages"></div>
          </div>
        </section>

        <div class="modal-actions">
          <a id="modal-visit" class="btn-primary" target="_blank" rel="noopener noreferrer"
             aria-label="Visit tool website (opens in new tab)">Visit Tool →</a>
          <button class="btn-secondary" onclick="window.__tr.closeModal('tool-modal')">Close</button>
        </div>
      </div>
    </div>`;
}

function suggestModal() {
  return `
    <div id="suggest-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="suggest-title">
      <div class="modal modal--wide">
        <button class="modal-x" onclick="window.__tr.closeModal('suggest-modal')" aria-label="Close">✕</button>
        <h2 id="suggest-title" class="modal-title" style="color:var(--green)">Suggest a New Tool</h2>
        <p class="modal-meta">Fill the form → download JSON → open a GitHub Pull Request.</p>
        <form id="suggest-form" onsubmit="return false" novalidate>
          <div class="form-row">
            <label class="form-label" for="sug-name">Tool Name <span aria-hidden="true">*</span></label>
            <input id="sug-name" class="form-input" type="text" required aria-required="true"
                   placeholder="e.g. SonarQube"/>
          </div>
          <div class="form-row">
            <label class="form-label" for="sug-desc">Description <span aria-hidden="true">*</span></label>
            <textarea id="sug-desc" class="form-textarea" required aria-required="true"
                      placeholder="What does this tool do and why is it useful for research software?"></textarea>
          </div>
          <div class="form-row">
            <label class="form-label" for="sug-website">Website URL <span aria-hidden="true">*</span></label>
            <input id="sug-website" class="form-input" type="url" required aria-required="true"
                   placeholder="https://…"/>
          </div>
          <div class="form-cols">
            <div class="form-row">
              <label class="form-label" for="sug-tier">Radar Tier <span aria-hidden="true">*</span></label>
              <select id="sug-tier" class="form-select" required aria-required="true"></select>
            </div>
            <div class="form-row">
              <label class="form-label" for="sug-swtype">Software Type <span aria-hidden="true">*</span></label>
              <select id="sug-swtype" class="form-select" required aria-required="true">
                <option value="">Select type…</option>
                <option>Analysis Code</option>
                <option>Prototype Tool</option>
                <option>Research Software Infrastructure</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">Quality Dimensions <span aria-hidden="true">*</span></label>
            <div id="sug-dims" class="dim-checks" role="group" aria-label="Select quality dimensions"></div>
          </div>
          <div class="form-cols">
            <div class="form-row">
              <label class="form-label" for="sug-langs">Languages (comma-separated)</label>
              <input id="sug-langs" class="form-input" type="text" placeholder="e.g. Python, Java"/>
            </div>
            <div class="form-row">
              <label class="form-label" for="sug-license">Licence (SPDX) <span aria-hidden="true">*</span></label>
              <input id="sug-license" class="form-input" type="text" placeholder="e.g. MIT, Apache-2.0"/>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label" for="json-preview">JSON Preview</label>
            <pre id="json-preview" class="json-box" aria-live="polite"></pre>
          </div>
        </form>
        <div class="modal-actions">
          <button id="sug-download" class="btn-primary" aria-label="Download generated JSON file">
            Download JSON → Open PR
          </button>
          <button class="btn-secondary" onclick="window.__tr.closeModal('suggest-modal')">Cancel</button>
        </div>
      </div>
    </div>`;
}

function radarModal() {
  return `
    <div id="radar-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="radar-modal-title">
      <div class="modal modal--radar">
        <button class="modal-x" onclick="window.__tr.closeModal('radar-modal')" aria-label="Close radar">✕</button>
        <h2 id="radar-modal-title" class="modal-title">Tech Radar — Quality Dimensions</h2>
        <p class="modal-meta">Click a segment to filter. Click a dot to view that tool.</p>
        <svg id="big-radar" class="big-radar" viewBox="0 0 530 530"
             xmlns="http://www.w3.org/2000/svg" role="img"
             aria-label="Full radar visualization with quality dimension segments">
          <g class="big-rings"></g>
          <g class="big-segs"></g>
          <g class="big-dots"></g>
          <circle cx="200" cy="200" r="6" fill="#4af0a0" opacity="0.9" aria-hidden="true"/>
        </svg>
        <button class="btn-secondary" onclick="window.__tr.closeModal('radar-modal')">Close</button>
      </div>
    </div>`;
}

function dimensionsModal() {
  return `
    <div id="dimensions-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="dims-title">
      <div class="modal">
        <button class="modal-x" onclick="window.__tr.closeModal('dimensions-modal')" aria-label="Close">✕</button>
        <h2 id="dims-title" class="modal-title" style="color:var(--green)">Quality Dimensions</h2>
        <p class="modal-meta">The configurable quality dimensions used to classify tools in EVERSE TechRadar.</p>
        <div id="dimensions-list" role="list" aria-label="Quality dimensions"></div>
        <button class="btn-secondary" onclick="window.__tr.closeModal('dimensions-modal')">Close</button>
      </div>
    </div>`;
}

function aboutModal() {
  return `
    <div id="about-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div class="modal">
        <button class="modal-x" onclick="window.__tr.closeModal('about-modal')" aria-label="Close">✕</button>
        <h2 id="about-title" class="modal-title" style="color:var(--blue)">About TechRadar</h2>
        <section class="modal-section">
          <p class="modal-desc">
            The EVERSE Technology Radar is developed as part of the EVERSE project to 
            collect and classify tools and services that can measure or improve Research Software Quality.
          </p>
        </section>
        <section class="modal-section">
          <div class="about-phase" style="border-color:var(--green)">
            <strong>What is the EVERSE Technology Radar ?</strong>
            It contains a catalogue of tools and services for research software quality designed to assess, measure, and improve the quality of software developed for research purposes
            the TechRadar, a visual dashboard to display the catalogue
            The EVERSE Technology Radar offers a comprehensive overview of various research software quality tools and services. 
            These tools and services are systematically categorised and presented in alignment with the established quality dimensions as segments. It is important to note that the radar does not encompass all existing tools and services; rather, it concentrates on tools that satisfy a set of criteria.
          </div>
          <div class="about-phase" style="border-color:var(--blue)">
            <strong>How it is created ?</strong>
            The tools and services appearing in the TechRadar can be proposed by anyone, 
            but are reviewed by the TechRadar curation team before addition.

            continue...
          </div>
        </section>
        <button class="btn-secondary" onclick="window.__tr.closeModal('about-modal')">Close</button>
      </div>
    </div>`;
}

function howToUseModal() {
  const steps = [
    { n: 1, title: "Identify your quality goal", body: "Use the Quality Dimension filter. Focus on what matters most right now: Reproducibility? FAIRness? Security?" },
    { n: 2, title: "Narrow by context", body: "Apply Tier and your programming language to surface the most relevant tools." },
    { n: 3, title: "Read the indicator", body: "Every tool card explains <em>exactly how</em> it measures quality — not just what it does, but what it checks and how." },
    { n: 4, title: "Click for full details", body: "Open any tool card for all quality indicators, real use cases, licence, and a direct link to the tool website." },
    { n: 5, title: "Can't find what you need?", body: "Click <strong>+ Suggest a Tool</strong> in the navigation bar. Fill the form, download the JSON, and open a GitHub PR." },
  ];

  return `
    <div id="how-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="how-title">
      <div class="modal">
        <button class="modal-x" onclick="window.__tr.closeModal('how-modal')" aria-label="Close">✕</button>
        <h2 id="how-title" class="modal-title" style="color:var(--yellow)">How to Use TechRadar</h2>
        <p class="modal-meta">Find the right research software quality tool in under 3 minutes.</p>
        <ol class="how-steps" aria-label="Steps to find a tool">
          ${steps.map(({ n, title, body }) => `
            <li class="how-step">
              <span class="step-n" aria-hidden="true">${n}</span>
              <div>
                <strong class="step-title">${title}</strong>
                <p class="step-body">${body}</p>
              </div>
            </li>`).join("")}
        </ol>
        <button class="btn-primary" onclick="window.__tr.closeModal('how-modal')">Start Exploring →</button>
      </div>
    </div>`;
}

boot();
