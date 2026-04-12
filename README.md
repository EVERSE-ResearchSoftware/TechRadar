[![DOI][doi-badge]][doi-url]

<!-- Badges links -->
[everse-logo]: https://everse.software/images/logos/EOSCEverse_PosColour.svg "EVERSE project"
[everse-url]: https://everse.software/
[doi-badge]: https://zenodo.org/badge/DOI/10.5281/zenodo.17036276.svg
[doi-url]: https://doi.org/10.5281/zenodo.17036276

# EVERSE TechRadar

The EVERSE TechRadar contains a [catalogue of _tools and services for research software quality_](#research-quality-tools-and-services-catalog) designed to assess, measure, and improve the quality of software developed for research purposes and a visual dashboard to display the catalogue.

## Research Quality Tools and Services Catalogue

The present catalogue includes tools and services that incorporate features that address the unique requirements of research software, including but not limited to:

- Analysis of source code to identify potential issues, vulnerabilities, and adherence to coding standards specific to research contexts.

- Evaluation of software against research-specific quality attributes such as reproducibility and FAIRness (Findability, Accessibility, Interoperability, and Reusability).

- Support for community standards and best practices relevant to specific research disciplines.

- Metrics and measurements tailored to assess both technical aspects and research-oriented factors.

- Capabilities to analyse and improve research software quality throughout the research software lifecycle, from development to long-term sustainability.  

These tools aim to enhance the overall quality, reliability, and reusability of research software, ultimately contributing to the reproducibility and impact of scientific research.

### Content & publication process

We welcome content contributions to the catalogue (see our [contribution guidelines](CONTRIBUTING.md) in the form of JSON files describing tools and services for research software quality.

After review from our curation team, the entry will be added to [our catalogue](quality-tools) as JSON file.

New versions of the TechRadar will be published regularly. You can find all the releases at the [releases](https://github.com/EVERSE-ResearchSoftware/TechRadar/releases) page.

## EVERSE TechRadar dashboard

The catalogue of tools and services is presented in a visual dashboard at [https://everse.software/TechRadar/](https://everse.software/TechRadar/).

### Development

All developer setup, run, lint, build, formatting, and validation instructions are documented in [web/README.md](web/README.md).

For contribution and review workflow, see [CONTRIBUTING.md](CONTRIBUTING.md).

[EVERSE project](https://everse.software/) is funded by the [European Commission HORIZON-INFRA-2023-EOSC-01-02](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/horizon-infra-2023-eosc-01-02).

## License

This project is dual-licensed:
- The software and code (found in `web/`, `tests/`, etc.) are licensed under the [MIT License](LICENSES/MIT.txt).
- The catalog data and content (found in `quality-tools/` and documentation) are licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC-BY-NC-SA-4.0) License](LICENSES/CC-BY-NC-SA-4.0.txt).

This project complies with the [REUSE specification](https://reuse.software/). For more detailed information, please see the [REUSE.toml](REUSE.toml) file.

