
# EVERSE TechRadar

This is preliminary work done as part of [EVERSE project](https://everse.software/) Technology Watch.

It contains a [catalog of of _tools and services for research software quality_](#research-quality-tools-and-services-catalog) designed to assess, measure, and improve the quality of software developed for research purposes and the [TechRadar](#technology-radar-dashboard), a visual dashboard to display the catalog.

## Research Quality Tools and Services Catalog

The present catalog includes tools and services that incorporate features that address the unique requirements of research software, including but not limited to:

- Analysis of source code to identify potential issues, vulnerabilities, and adherence to coding standards specific to research contexts.

- Evaluation of software against research-specific quality attributes such as reproducibility and FAIRness (Findability, Accessibility, Interoperability, and Reusability).

- Support for community standards and best practices relevant to specific research disciplines.

- Metrics and measurements tailored to assess both technical aspects and research-oriented factors.

- Capabilities to analyze and improve research software quality throughout the research software lifecycle, from development to long-term sustainability.  

These tools aim to enhance the overall quality, reliability, and reusability of research software, ultimately contributing to the reproducibility and impact of scientific research.

### Content & publication process

We welcome content contributions to the catalog (see our [contribution guidelines](CONTRIBUTING.md) in the form of JSON files describing tools and services for research software quality.

After review from our curation team, the entry will be added to [our catalog](data/software-tools) as JSON file.

New versions of the TechRadar will be published regularly. You can find all the releases at the [releases](https://github.com/EVERSE-ResearchSoftware/TechRadar/releases) page.

## EVERSE TechRadar dashboard

The catalog of tools and services is presented in a visual dashboard at <https://github.com/EVERSE-ResearchSoftware/TechRadar>.

### Development
Make sure you install [Node.js](https://nodejs.org/en) on your system as it will be needed to build and serve TechRadar.
> [!WARNING]
> The work is initial representation and is likely to be changed.
> The current version of Technology Watch is a work in progress.
> Any content should not be considered final at this stage.

#### Configuring TechRadar segments

1. Open the config.json file.

2. Update the segments section based on the dimensions of tool.json (/data/software-tools)

3. Ensure that each segment listed in config.json has at least one corresponding tool in /data/software-tools

4. If a segment does not have any associated tools, remove that segment from the segments section to avoid displaying empty segments on the radar.

This configuration ensures that the TechRadar dashboard remains accurate and visually clear by avoiding the display of segments with no associated tools.

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

#### Run lint and formatting check on tools -> /data/software-tools/*.json

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

[EVERSE project](https://everse.software/) is funded by the European Commission HORIZON-INFRA-2023-EOSC-01-02 call.
