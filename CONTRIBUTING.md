# Contribution guidelines

## How to contribute 

We welcome contributions to the EVERSE TechRadar in several forms:
- **Content contributions**: You can contribute by adding new tools and services to the catalog or updating existing entries. Please refer to the [Research Quality Tools and Services Catalog](#research-quality-tools-and-services-catalog) section for more details.
- **Technical contributions**: If you want to improve the TechRadar dashboard or report a bug, you can contribute to the underlying [AOE technology radar](https://github.com/AOEpeople/aoe_technology_radar/).
- **General contributions**: You can also contribute by [reporting issues](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose), suggesting improvements, or providing feedback on the TechRadar dashboard.
- **Joining the curation team**:  If you are interested in actively participating in the curation of the TechRadar, you may join the team. Please contact us via the [GitHub issues](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose).


If you have doubts about a potential contribution, you may consider opening [an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues) or [discussion](https://github.com/EVERSE-ResearchSoftware/TechRadar/discussions) to discuss the matter before starting to implement anything.


## Research Quality Tools and Services Catalog

You may propose to modify the content of TechRadar content by opening a pull request to add new tools and services or update existing entries.
All tools and services must meet the [specific set of criteria](#criteria-for-a-tool-or-service-to-be-added-in-the-techradar) below to be included in the TechRadar. The criteria are designed to ensure that the tools and services are relevant, useful, and actively maintained for improving software quality in research.

### Criteria for a tool or service to be added in the TechRadar

1. The tool/service has been designed with the intent of measuring/improving software quality, and it does measure or improve software quality.

2. The tool/service is frequently used on research software and is being actively maintained.

3. The tool/service enables the software it is used on to follow relevant research community standards and best practices.

4. The tool/service has capabilities to analyse and improve software quality throughout the [research software lifecycle](https://everse.software/RSQKit/life_cycle#the-research-software-lifecycle), from development to long-term sustainability.

### How to add or update a tool or service in the TechRadar

1. **Fork the repository**: Create a fork of the TechRadar repository on GitHub.
2.  **Create a new branch**: Create a new branch for your changes.
3. **Add or update JSON files**: Add new JSON files for new tools and services or update existing ones in the `data/software-tools` directory. Each JSON file should follow the structure defined in the [RS metadata schema](https://github.com/EVERSE-ResearchSoftware/schemas/tree/main/software). Please be as accurate and exhaustive as possible when filling in the metadata fields.
4. **Commit your changes**: Commit your changes with a clear and descriptive commit message.
5. **Push your changes**: Push your changes to your forked repository.
6. **Create a pull request**: Open a pull request against the main branch of the TechRadar repository. Provide a clear explanation of the reasons to add or update the tool or service, and any relevant context or information that may help the curation team review your contribution. Make sure all the GitHub Workflows are passing. If there are errors, fix them before requesting a review.
7. **Review and feedback**: Once your pull request is ready to be reviewed, ping the curation team @EVERSE-ResearchSoftware/techradar-curators to review it. The curation team will review your pull request. They may provide feedback or request changes before merging it into the main branch.
8. **Merge and publish**: Once your pull request is approved, it will be merged by the curation team into the main branch, and the changes will be reflected in the TechRadar dashboard at the next release.

## Technical contribution

Our TechRadar is based on the [AOE technology radar](https://github.com/AOEpeople/aoe_technology_radar/).
If you want to improve it or report a bug, you may consider contributing to the original one. If your contribution is specific to our version, you may either:

- [report an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose)

- [open a pull request](https://github.com/EVERSE-ResearchSoftware/TechRadar/compare)

## General contribution

You can contribute to the TechRadar by reporting issues, suggesting improvements, or providing feedback. To do so, please follow these steps:
1. **Open an issue**: Go to the [issues page](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose) and select the appropriate issue template.
2.  **Provide details**: Fill in the issue template with as much detail as possible. Include information about the issue, suggestion, or feedback, and any relevant context or examples.
3. **Submit the issue**: Once you have filled in the details, submit the issue. The TechRadar team will review it and respond as soon as possible.
4.  **Follow up**: If necessary, you may be asked for additional information or clarification. Please respond promptly to help us address your contribution effectively.


## Joining the curation team
If you are interested in actively participating in the curation of the TechRadar, you may join the team. To do so, contact us by [opening an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new?template=BLANK_ISSUE) and express your interest in joining the curation team. Provide a brief introduction about yourself, your background, and your interest in research software quality. You should have a background in software engineering or development applied to research. After consideration, you will be added to the [team of curators](https://github.com/orgs/EVERSE-ResearchSoftware/teams/techradar-curators)

## Contributor metadata requirements

All contributors to this repository must be properly acknowledged in our metadata files. This ensures proper attribution and compliance with academic standards.

### Managing contributor identities

If you use multiple email addresses or names when contributing:

1. **Add entries to `.mailmap`**: This file unifies different emails/names for the same person
2. **Format**: `Canonical Name <canonical@email.com> <alternative@email.com>`
3. **Example**:
   ```
   John Doe <john.doe@university.edu> John <john.personal@gmail.com>
   ```

### CITATION.cff

Please add your name, email and ORCID (optional) to the `CITATION.cff` file in the following format:

```
name: Your Name
email: your.email@example.com
orcid: https://orcid.org/0000-0001-2345-6789
```

### Automated checks

A GitHub Action automatically checks that all contributors in pull request commits are listed in the metadata files. If you see a warning:

- **New contributor**: Add your information to `CITATION.cff`
- **Existing contributor with new email**: Update `.mailmap` to map your new email to your canonical identity

For questions about contributor metadata, please [open an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose).
