[![everse-logo]][everse-url]

[![DOI][doi-badge]][doi-url] 

<!-- Badges links -->
[everse-logo]: https://everse.software/images/logos/EOSCEverse_PosColour.svg "EVERSE project"
[everse-url]: https://everse.software/

# EVERSE TechRadar

The EVERSE TechRadar contains a [catalogue of _tools and services for research software quality_](#research-quality-tools-and-services-catalog) designed to assess, measure, and improve the quality of software developed for research purposes and the [TechRadar](#technology-radar-dashboard), a visual dashboard to display the catalog.

## Research Quality Tools and Services Catalog

The present catalogue includes tools and services that incorporate features that address the unique requirements of research software, including but not limited to:

- Analysis of source code to identify potential issues, vulnerabilities, and adherence to coding standards specific to research contexts.

- Evaluation of software against research-specific quality attributes such as reproducibility and FAIRness (Findability, Accessibility, Interoperability, and Reusability).

- Support for community standards and best practices relevant to specific research disciplines.

- Metrics and measurements tailored to assess both technical aspects and research-oriented factors.

- Capabilities to analyze and improve research software quality throughout the research software lifecycle, from development to long-term sustainability.  

These tools aim to enhance the overall quality, reliability, and reusability of research software, ultimately contributing to the reproducibility and impact of scientific research.

### Content & publication process

We welcome content contributions to the catalogue (see our [contribution guidelines](CONTRIBUTING.md) in the form of JSON files describing tools and services for research software quality.

After review from our curation team, the entry will be added to [our catalog](data/tools) as JSON file.

New versions of the TechRadar will be published regularly. You can find all the releases at the [releases](https://github.com/EVERSE-ResearchSoftware/TechRadar/releases) page.


## EVERSE TechRadar dashboard

The catalogue of tools and services is presented in a visual dashboard at <https://github.com/EVERSE-ResearchSoftware/TechRadar>.


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

### Development
Make sure you install [Node.js](https://nodejs.org/en) on your system as it will be needed to build and serve TechRadar.

> [!WARNING]
> The work is initial representation and is likely to be changed.
> Any content should not be considered final at this stage.

#### Build the TechRadar

```bash
npm install
npm run serve
```

Then open here: <http://localhost:3000/techradar>

#### Build with static files

```bash
npm install
npm run build
```

#### Run lint and formatting check on tools -> /data/tools/*.json

```bash
npm install
npm run lint-prettier:check
```

#### Run lint and formatting fix

```bash
npm install
npm run lint-prettier:fix
```

## Funding

[EVERSE project](https://everse.software/) is funded by the [European Commission HORIZON-INFRA-2023-EOSC-01-02](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/horizon-infra-2023-eosc-01-02).


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide on adding tools, the JSON format, and the PR process.

