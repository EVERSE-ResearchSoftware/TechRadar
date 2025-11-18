# Contribution guidelines

Welcome! This guide explains how to contribute to the EVERSE Technology Radar.

## TL;DR

- Want to add or update a tool? Jump to the [Quick Start](#quick-start-add-or-update-a-tool)
   - Check the [Inclusion criteria](#inclusion-criteria) before you submit
- Unsure? [Open an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose) or start a [discussion](https://github.com/EVERSE-ResearchSoftware/TechRadar/discussions)

## Types of contributions

- **Content contributions:** Add a new tool/service or improve an existing entry. See the [Quick Start](#quick-start-add-or-update-a-tool).
- **Technical contributions:** Improve the radar UI, scripts, or CI. Our stack is based on the [AOE Technology Radar](https://github.com/AOEpeople/aoe_technology_radar/).
- **General contributions:** Report issues, suggest improvements, or share feedback via [issues](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose) or [discussions](https://github.com/EVERSE-ResearchSoftware/TechRadar/discussions).
- **Join the curation team:** See [Joining the curation team](#joining-the-curation-team).

## Quick Start: Add or update a tool

The TechRadar catalogue lives under `data/software-tools/` as one JSON file per tool using the RS metadata schema.

<details>
   <summary><strong>New tool — step-by-step</strong></summary>

1) **Fork** this repository and **create a branch** for your change.
2) **Create a JSON file** in `data/software-tools/` (use an existing file as a template) and follow the [RS metadata schema](https://github.com/EVERSE-ResearchSoftware/schemas/tree/main/software).
3) **Fill metadata carefully:** name, description (what it improves and for whom), URLs (homepage, repo, docs), quality dimensions, license, and how to use.
4) (Optional) **Preview locally** to sanity-check: run a build and open the generated site.
5) **Commit & push**, then **open a Pull Request** explaining the rationale and context.
6) **Request review** from @EVERSE-ResearchSoftware/techradar-curators and address feedback.

</details>

<details>
   <summary><strong>Update existing tool — step-by-step</strong></summary>

1) **Find the JSON** in `data/software-tools/` and make a new branch.
2) **Edit fields** you want to improve (e.g., description, links, quality dimensions, tags).
3) (Optional) **Preview locally** to verify formatting and links.
4) **Commit & push**, then **open a Pull Request** with a concise changelog of what changed and why.
5) **Respond to review** and iterate until approved.

</details>

## Inclusion criteria

All tools/services added to the TechRadar must satisfy these criteria:

1. Designed to measure and/or improve software quality (and demonstrably does so)
2. Frequently used on research software and actively maintained
3. Enables adherence to relevant research community standards and best practices
4. Has capabilities to analyse and improve software quality across the [research software lifecycle](https://everse.software/RSQKit/life_cycle#the-research-software-lifecycle) (from development to long-term sustainability)

## Authoring guide: JSON and metadata quality

Aim for clarity, completeness, and evidence. Prefer concise, user-focused descriptions.

- **name:** Use the official tool/service name; ensure the file name is unique and stable.
- **description:** State what the tool improves (e.g., maintainability, security), for whom, and how. Extra information is welcome but keep it focused.
- **url:** Link to the official homepage or repository.
- **hasQualityDimension:** Quality dimension related to the tool, must exist in [EVERSE Quality Dimensions](https://everse.software/indicators/website/dimensions.html).
- **hasQualityIndicator:** Quality indicator related to the tool, must exist in [EVERSE Quality Indicators](https://everse.software/indicators/website/indicators.html).
- **license:** Provide URL to the license file.
- **howToUse:** List the means to use the tool using the following terminology: `online-service`, `command-line`, `CI/CD`.
- **applicationCategory:** Specify the relevant research software tiers on which the tool operates: `rs:AnalysisCode`, `rs:PrototypeTool`, or `rs:ResearchInfrastructureSoftware`. For example, `AnalysisCode` means the tool is suitable to improve or assess the quality of software in that tier.

<details>
   <summary><strong>Good example (illustrative)</strong></summary>

```json
{
   "@context": "https://w3id.org/everse/rs#",
   "@id": "https://example.org/howfairis",
   "@type": "SoftwareApplication",
   "name": "howfairis",
   "description": "Command-line tool that checks research software repositories against FAIR recommendations to improve reusability and openness.",
   "url": "https://github.com/fair-software/howfairis",
   "identifier": "https://example.org/howfairis",
   "isAccessibleForFree": true,
   "hasQualityDimension": { "@id": "dim:FAIRness", "@type": "@id" },
   "hasQualityIndicator": { "@id": "ind:software_has_license", "@type": "@id" },
   "howToUse": ["CI/CD", "command-line"],
   "license": "https://spdx.org/licenses/Apache-2.0",
   "applicationCategory": { "@id": "rs:PrototypeTool", "@type": "@id" }
}
```

</details>

Please follow below naming conventions for ``tool.json``:
- **Lowercase letters**: Use only lowercase letters in file names.
- **Hyphens for separation**: Use hyphens (`-`) to separate words (avoid spaces or underscores).
- **Descriptive names**: File names should be short yet descriptive, reflecting the tool or content clearly.
- **Optional Category Prefix**: If the file belongs to a specific category (e.g., AI, cloud), consider adding a category prefix for clarity.

- Examples: `jupyter-notebook.json` , `docker-devops.json`

## Review process

1. Curators validate inclusion criteria and metadata quality and correctness
2. Reviewers may request clarifications or changes
3. Once approved, the change is merged and appears in the next published release
4. For time-sensitive updates, ping @EVERSE-ResearchSoftware/techradar-curators in the PR

<details>
   <summary><strong>Review tips for curators</strong></summary>

To help you decide on the Software Tier, please refer to https://zenodo.org/records/7248877 and use the low, medium and high levels. E.g. Version control concerns all tiers, while Risk analysis would be important to Research Infrastructure Software only.

</details>

## Local validation (optional)

Please refer to our README for instructions on how to build and preview the TechRadar site locally. This helps you verify that your changes render correctly and that all links are valid before submitting a Pull Request.

## Templates and checklists

<details>
   <summary><strong>PR checklist</strong></summary>

- [ ] JSON follows the RS metadata schema
- [ ] Description explains the quality improvement and target users
- [ ] URLs (homepage/repo/docs) included and valid
- [ ] Quality dimensions are justified
- [ ] License and accessibility set
- [ ] Links and anchors verified locally (optional)

</details>

<details>
   <summary><strong>PR template for new tool/service</strong></summary>

**Tool/Service Name**
Full name of the tool or service

**Description**
A brief description of the tool/service and its utility.

**Justification**
- Why should this tool/service be included in the TechRadar?
- Which quality dimensions does it address?
- Which research software tier(s) is it relevant for?
- Which research software domain(s) is it primarily used in?

</details>


## General contribution

You can contribute to the TechRadar by reporting issues, suggesting improvements, or providing feedback. To do so, please follow these steps:

1. **Open an issue**: Go to the [issues page](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose) and select the appropriate issue template.
2. **Provide details**: Fill in the issue template with as much detail as possible. Include information about the issue, suggestion, or feedback, and any relevant context or examples.
3. **Submit the issue**: Once you have filled in the details, submit the issue. The TechRadar team will review it and respond as soon as possible.
4. **Follow up**: If necessary, you may be asked for additional information or clarification. Please respond promptly to help us address your contribution effectively.

## Technical contribution

Our TechRadar is based on a fork of the [AOE technology radar](https://github.com/EVERSE-ResearchSoftware/aoe_technology_radar).

For technical contributions, changes might need to be made to the underlying codebase in this repository. 
In doubt, open an issue in the [TechRadar issue tracker](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose) and we will transfer it to the AOE repository if appropriate.

## FAQ

<details>
   <summary><strong>My tool spans multiple quality dimensions. How should I choose?</strong></summary>
You can list multiple quality dimensions in the `hasQualityDimension` field. Ensure each dimension is justified based on the tool's capabilities.
</details>

<details>
   <summary><strong>Can I add a tool that is not actively maintained?</strong></summary>
Generally no. Exceptions require strong evidence of ongoing community use and clear value for research software quality.
</details>

<details>
   <summary><strong>How do I reference publications?</strong></summary>
Add links in the JSON description to docs and publications.
</details>


## Joining the curation team

If you are interested in actively participating in the curation of the TechRadar, you may join the team. To do so, contact us by [opening an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new?template=BLANK_ISSUE) and express your interest in joining the curation team. Provide a brief introduction about yourself, your background, and your interest in research software quality. You should have a background in software engineering or development applied to research. After consideration, you will be added to the [team of curators](https://github.com/orgs/EVERSE-ResearchSoftware/teams/techradar-curators).

## Contributor metadata requirements

All contributors to this repository must be properly acknowledged in our metadata files. This ensures proper attribution and compliance with academic standards.

<details>
   <summary><strong>Managing contributor identities</strong></summary>

If you use multiple email addresses or names when contributing:

1. **Add entries to `.mailmap`**: This file unifies different emails/names for the same person
2. **Format**: `Canonical Name <canonical@email.com> <alternative@email.com>`
3. **Example**:

```
John Doe <john.doe@university.edu> John <john.personal@gmail.com>
```

</details>

<details>
   <summary><strong>CITATION.cff</strong></summary>

Please add your name, email and ORCID (optional) to the `CITATION.cff` file in the following format:

```
name: Your Name
email: your.email@example.com
orcid: https://orcid.org/0000-0001-2345-6789
```

</details>

<details>
   <summary><strong>Automated checks</strong></summary>

A GitHub Action automatically checks that all contributors in pull request commits are listed in the metadata files. If you see a warning:

- **New contributor**: Add your information to `CITATION.cff`
- **Existing contributor with new email**: Update `.mailmap` to map your new email to your canonical identity

For questions about contributor metadata, please [open an issue](https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new/choose).

</details>

