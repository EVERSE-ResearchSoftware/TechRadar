
# EVERSE TechRadar

This is preliminary work done as part of [EVERSE project](https://everse.software/) Technology Watch. 

It contains a [catalog of of _tools and services for research software quality_](#research-quality-tools-and-services-catalog) designed to assess, measure, and improve the quality of software developed for research purposes and the [TechRadar](#technology-radar-dashboard), a visual dashboard to display the catalog.


## Research Quality Tools and Services Catalog

The present catalog includes tools and services that incorporate features that address the unique requirements of research software, including (but not limited to):

- Analysis of source code to identify potential issues, vulnerabilities, and adherence to coding standards specific to research contexts.

- Evaluation of software against research-specific quality attributes such as reproducibility and FAIRness (Findability, Accessibility, Interoperability, and Reusability).

- Support for community standards and best practices relevant to specific research disciplines.

- Metrics and measurements tailored to assess both technical aspects and research-oriented factors.

- Capabilities to analyze and improve software quality throughout the research software lifecycle, from development to long-term sustainability.


These tools aim to enhance the overall quality, reliability, and reusability of research software, ultimately contributing to the reproducibility and impact of scientific research.


### Content contributions

We welcome content contributions to the catalog (see our [contribution guidelines](CONTRIBUTING.md) in the form of JSON files describing tools and services for research software quality.

### Publication process

After review, the entry is added to our catalog as JSON file.

A new version of the TechRadar will be published regularly.

## Technology Radar dashboard

The catalog of tools and services is presented in a visual dashboard at https://github.com/EVERSE-ResearchSoftware/TechRadar.


### Technical contribution

Our TechRadar is based on the [AOE technology radar](https://github.com/AOEpeople/aoe_technology_radar/). 
If you want to improve it or report a bug, you may consider contributing to the original one. If your contribution is specific to our version, you may either:

- [report an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose)

- [open a pull request]


Please see our [contribution guidelines](CONTRIBUTING.md) and consider joining the team if you want to add new tools and services in the TechRadar.

### Development

#### Build the TechRadar
```
npm i
npm run serve
```

Then open here: http://localhost:3000/techradar

#### Build with static files
```
npm i
npm run build
```

> [!WARNING]
> The work is initial representation and is likely to be changed.
> The current version of Technology Watch is a work in progress. 
> Any content should not be considered final at this stage.


## Funding

[EVERSE project](https://everse.software/) is funded by the European Commission HORIZON-INFRA-2023-EOSC-01-02 call. 
