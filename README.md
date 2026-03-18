# TechRadar

> A catalog of tools and services for research software quality.  
> Find the right tool for reproducibility, FAIRness, security, testing, and more.


## What is TechRadar?

TechRadar is a static web application — no server, no database, no login.  
It is a searchable, filterable catalog of tools that help research software teams improve quality.

Three design principles drive every decision:

1. **Discovery-first** — the catalog and search are the primary UI, not the radar visualisation.
2. **Clarity-first** — every tool explains *how* it measures quality, not just *what* it does.
3. **Config-driven** — tiers, dimensions, and vocabularies live in one JSON file; no code changes needed to customise them.

---

## Quick Start

```bash
# Requires Node.js v20+
git clone https://github.com/EVERSE-ResearchSoftware/TechRadar.git
cd TechRadar
npm install
npm run build
npm run dev          # → http://localhost:3000/techradar
```

Other commands:

```bash
```

---
## Project Structure

```
TechRadar/
│
├── config.yaml                  Platform configuration (tiers, dimensions, UI settings)
├── index.html                   HTML entry point — just loads main.js
├── vite.config.js               Build config + bundleCatalog plugin
├── package.json                 Dependencies and npm scripts
├── babel.config.json            Jest/Babel config for tests
│
├── data/
│   └── tools/                   ← THE CATALOG — one .json file per tool
│       ├── sonarqube.json
│       ├── fuji.json
│       └── ...
│
├── src/
│   ├── main.js                  App entry point — owns state, builds shell HTML, boots
│   │
│   ├── components/
│   │   ├── Radar.js             SVG radar (mini sidebar + full modal)
│   │   ├── ToolGrid.js          Card grid 
│   │   ├── ToolModal.js         Tool detail modal 
│   │   ├── FilterPanel.js       Sidebar filter 
│   │   ├── SuggestModal.js      "Suggest a Tool" form + JSON preview
│   │
│   ├── utils/
│   │   ├── catalog.js           Data loading, filtering, sorting  functions
│   │   ├── radar-svg.js         SVG drawing functions
│   │   └── dom.js               
│   │
│   └── styles/
│       └── main.css             CSS custom properties for theming
│
├── scripts/
│   ├── config-loader.js         loads config.yaml and tool JSON files
│   └── schema/
│       └── tool.schema.json     JSON Schema for tool files used for validation
│
├── tests/
│  
│
└── .github/
    ├── workflows/
    │   ├── ci.yml               validate → test → build → deploy on push to main
    │   └── validate-pr.yml      validates tool files in PRs + posts a comment
    └── ISSUE_TEMPLATE/
        ├── suggest-tool.md      GitHub issue template for tool suggestions
        └── bug-report.md
```

---

## The Tool JSON Format

Each file in `data/tools/` describes exactly one tool. The filename should be lowercase matching the tool name, e.g. `sonarqube.json`, `reuse-tool.json`.

### Required fields

```json
"@type": "SoftwareApplication",
  "applicationCategory": {
    "@id": "rs:ResearchInfrastructureSoftware",
    "@type": "@id"
  },
  "description": "Continuous code quality platform that automatically detects bugs, vulnerabilities, and code smells across multiple programming languages, providing comprehensive static analysis to improve software maintainability, security, and reliability.",
  "hasQualityDimension": [
    {
      "@id": "dim:maintainability",
      "@type": "@id"
    },
    {
      "@id": "dim:security",
      "@type": "@id"
    },
    {
      "@id": "dim:reliability",
      "@type": "@id"
    }
  ],
  "howToUse": ["CI/CD", "online-service"],
  "isAccessibleForFree": true,
  "license": "https://spdx.org/licenses/GPL-3.0-only",
  "name": "SonarQube",
```

### recommended fields

```json
{
  "indicators": {
    "Maintainability": "measures Maintainability by ...",
    "Security": "measures Security by ...."
  },
  "useCases": [
    "Block low-quality merges by configuring quality gates in CI/CD",
    "Track code health trends before research software publication"
  ]
}
```


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide on adding tools, the JSON format, and the PR process.

## Licence

Code: MIT · Content: CC-BY-4.0
