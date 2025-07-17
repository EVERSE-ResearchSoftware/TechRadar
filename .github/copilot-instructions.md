# Copilot Instructions: PR Review in This Repository

When reviewing a **Pull Request (PR)** in this repository, first **determine the type of change** being proposed. 

There are two distinct review strategies:

---

## 🟩 **1. If the PR Adds or Modifies a Tool/Service JSON in the `data/` Directory**

You are tasked with reviewing the **new tool or service proposed in the current Pull Request**. The tool is described in a JSON file that adheres to our catalog's schema for **research software quality tools and services**.

Your goal is to:
1. **Verify the tool's eligibility for inclusion** using the criteria below.
2. **Suggest improvements** to the metadata, especially the description, tags, and newly required fields like `quality_dimensions`.
3. **Explain your suggestions and insights** so that:
   - The **PR author understands how to improve the submission**.
   - The **human reviewer can quickly assess** whether to accept or request changes.

You may use the **#web search** feature to gather additional information on the tool.

> ✅ Example of the expected JSON schema:  
> ```json
> {
>   "@context": "https://w3id.org/everse/rs#",
>   "@id": "https://example.org/howfairis",
>   "@type": "SoftwareApplication",
>   "name": "howfairis",
>   "description": "Command line tool to analyze a GitHub or GitLab repository's compliance with the fair-software.eu recommendations",
>   "url": "https://github.com/fair-software/howfairis",
>   "identifier": "https://example.org/howfairis",
>   "isAccessibleForFree": true,
>   "hasQualityDimension": { "@id": "dim:fairness", "@type": "@id" },
>   "howToUse": [ "CI/CD", "command-line" ],
>   "license": { "@id":"https://spdx.org/licenses/Apache-2.0", "@type": "@id" },
>   "applicationCategory": { "@id":"rs:PrototypeTool", "@type": "@id" }
> }
> ```

### ✅ Step 1: Check Inclusion Criteria

Confirm that the proposed tool meets all the following:

1. The tool/service has been designed with the intent of measuring/improving software quality, and it does measure or improve software quality.

2. The tool/service is frequently used on research software and is being actively maintained.

3. The tool/service enables the software it is used on to follow relevant research community standards and best practices.

4. The tool/service has capabilities to analyse and improve software quality throughout the research software lifecycle, from development to long-term sustainability.

If any criterion is not met, suggest that the PR is rejected and explain why.


### ✅ Step 2: Review and Suggest Metadata Improvements

#### Metadata to Review and Improve:
- **`name`**: Ensure the tool name is accurate and properly formatted.
- **`description`**: Improve it to:
  - Clearly state how the tool contributes to (research) software quality.
  - Indicate which quality aspects it targets.
- **`url`**: Validate the links.
- **`hasQualityDimension`**: check if the tool's capabilities match the quality dimensions it claims to address. If not, propose a list based on the tool’s capabilities from the following list:

| Quality Dimension      | Description | Sub-characteristics | Source |
|------------------------|-------------|---------------------|--------|
| **Compatibility** | Degree to which a product, system or component can exchange information with others and perform its required functions while sharing a common environment. | - Co-existence: Performs functions efficiently in shared environments without negative impacts.  - Interoperability: Can exchange and use information with other products. | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **FAIRness** | Degree to which research software adheres to FAIR principles: Findable, Accessible, Interoperable, Reusable. | None | [FAIR Principles for Research Software](https://www.nature.com/articles/s41597-022-01710-x) |
| **Flexibility** | Degree to which a product adapts to changing requirements, contexts, or environments. | - Adaptability  - Scalability  - Installability  - Replaceability | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Functional Suitability** | Degree to which a product provides functions that meet stated and implied needs under specified conditions. | - Functional completeness  - Functional correctness  - Functional appropriateness | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Interaction Capability** | Degree to which a product can be interacted with by users via the user interface to complete tasks in various contexts. | - Appropriateness recognizability  - Learnability  - Operability  - User error protection  - User engagement  - Inclusivity  - User assistance  - Self-descriptiveness | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Maintainability** | Degree of effectiveness and efficiency with which a product can be modified to improve it, correct it, or adapt to changes. | - Modularity  - Reusability  - Analysability  - Modifiability  - Testability | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Performance Efficiency** | Degree to which a product performs its functions within specified time and resource constraints. | - Time behaviour  - Resource utilization  - Capacity | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Reliability** | Degree to which a system performs specified functions under specified conditions for a defined period. | - Faultlessness  - Availability  - Fault tolerance  - Recoverability | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Safety** | Degree to which a product avoids states that endanger human life, health, property, or the environment. | - Operational constraint  - Risk identification  - Fail safe  - Hazard warning  - Safe integration | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Security** | Degree to which a product defends against attacks and protects data access according to authorization levels. | - Confidentiality  - Integrity  - Non-repudiation  - Accountability  - Authenticity  - Resistance | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) |
| **Sustainability** | Capacity of the software to endure, remain functional on new platforms, and meet new needs. | None | [Defining Software Sustainability](https://danielskatzblog.wordpress.com/2016/09/13/defining-software-sustainability/) |


> ✅ **Example improvement:**
> - Original description: "Tool for testing."
> - Suggested: "ToolX provides unit testing and static analysis features that improve maintainability and reliability of research software projects."


### ✅ Step 3: Provide Insights for Human Reviewer and PR Author

Generate an **insight summary** that explains:
- Whether the tool should be accepted or not.
- If accepted, what metadata or descriptions should be improved and why.
- Which **quality dimensions** the tool improves and why.
- Any missing or unclear information the PR author should clarify.

> ✅ **Example Insight:**
> > **Recommendation:** Accept with improvements.  
> > **Reason:** The tool is widely used in research for static analysis but lacks mention of sustainability practices.  
> > **Suggested Metadata Fixes:**  
> > - Add "Maintainability", "Reliability" to `quality_dimensions`.  
> > - Improve the description to clarify its application in scientific codebases.
> > - Include repository URL.  
> > **Additional Info:** See [ToolX documentation](https://example.org/toolx) for features on test coverage.


### ✅ Optional: Update Suggestion

If possible, output the **suggested JSON modifications as a diff or full improved JSON example**, so the human reviewer or PR author can easily apply the corrections.

### ✅ Output Format 

For each PR, produce:

1. ✅ **Eligibility Decision:** Accept / Reject + reason.
2. ✅ **Suggested Metadata Updates:** List of fields to improve with suggestions.
3. ✅ **Quality Dimensions Identified:** List with justifications.
4. ✅ **Insights for Reviewer and PR Author:** Actionable recommendations, questions, or missing elements.

> **Reminder:** Always back your suggestions with references, documentation links, or relevant standards when available.

--- 

## 🟨 **2. If the PR is Code, Documentation, or Infrastructure Changes**

If the PR:
- Fixes code,
- Improves documentation,
- Modifies CI/CD pipelines,
- Changes infrastructure,

### ✅ Then:
1. **Do not apply the tool/service review criteria.**
2. Instead, review as appropriate:
   - For **code**: Check correctness, readability, adherence to code standards, and impacts on maintainability and performance.
   - For **documentation**: Ensure clarity, correctness, and completeness.
   - For **infrastructure/CI**: Ensure changes improve automation, reliability, or deployment without introducing regressions.
3. **Provide insights on potential improvements**, alternative approaches, or optimizations.


---

## ✅ Final Note

Always provide:
- **Structured, actionable feedback**.
- **Justifications for each recommendation**, especially for rejections or major metadata changes.
- **Links to documentation, standards, or authoritative sources** when suggesting improvements.
