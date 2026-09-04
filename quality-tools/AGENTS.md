# AGENTS.md — Catalog Curator

Scope: the tool catalogue in this directory. Repository-wide rules are in `../AGENTS.md`;
frontend rules are in `../web/AGENTS.md`. Contributor-facing process is in
`../CONTRIBUTING.md`.

Focus: data integrity, provenance, schema compliance. Bias: structure and verifiability.

---

## What lives here

One JSON-LD file per tool, ~70 of them. This directory _is_ the product — the radar, the
tool pages, and `https://everse.software/TechRadar/api/tools.json` are all rendered from
it, and `main` deploys on every push. A wrong indicator is live within minutes and gets
cited by people choosing tools for real projects.

Schema: `../tests/tools_validation_schema.json`, enforced by `pytest ../tests/`.

---

## Anatomy of an entry

```text
{
  "@context": "https://w3id.org/everse/rs#",
  "@id": "https://w3id.org/everse/tools/black", // slug MUST match the filename
  "@type": "schema:SoftwareApplication",
  "name": "Black",
  "description": "…", // what it does, and why a researcher cares
  "url": "https://github.com/psf/black",
  "isAccessibleForFree": true,
  "license": "https://spdx.org/licenses/MIT", // SPDX URL, no .html suffix
  "applicationCategory": [{ "@id": "rs:PrototypeTool", "@type": "@id" }],
  "hasQualityDimension": { "@id": "dim:maintainability", "@type": "@id" },
  "measuresQualityIndicator": [
    { "@id": "https://w3id.org/everse/i/indicators/…", "@type": "@id" }
  ],
  "howToUse": ["CI/CD", "command-line"]
}
```

**Required**: `@context`, `@id`, `name`, `description`, `license`, `url`,
`applicationCategory`, `hasQualityDimension`.

**Closed vocabularies** — anything else fails validation:

| Field                               | Allowed values                                                             |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `applicationCategory`               | `rs:AnalysisCode`, `rs:PrototypeTool`, `rs:ResearchInfrastructureSoftware` |
| `howToUse`                          | `CI/CD`, `command-line`, `online-service`, `library`                       |
| `usedBy`                            | `ENVRI`, `ESCAPE`, `LS-RI`, `PaNOSC`, `SSHOC`, `EOSC-Life`                 |
| `hasQualityDimension`               | `dim:*`, fetched live from the EVERSE dimensions API                       |
| `measures/improvesQualityIndicator` | indicator URIs, fetched live from the EVERSE indicators API                |

The schema sets `"additionalProperties": false`. A field the schema doesn't list will fail
CI — that is the schema telling you to have a conversation, not a bug to route around.

### Naming, and why it matters

- Filename is lowercase letters and hyphens only. No underscores, no spaces:
  `my-tool-name.json`.
- `@id` is `https://w3id.org/everse/tools/{slug}` where `{slug}` is exactly the filename
  stem. The frontend keys tool URLs off the filename (`_filename` in
  `web/src/data/loader.js`), so **renaming a file breaks every existing link to that tool
  page.** Renames are a deliberate act, announced in the PR.
- Before creating a slug, check the
  [RSQKit tool list](https://github.com/EVERSE-ResearchSoftware/RSQKit/blob/main/_data/tool_and_resource_list.yml).
  If the tool is there, reuse its `id` so the two catalogues line up.

### Fields that bite

- **`license`**: a bare SPDX URL. The loader silently rewrites
  `https://spdx.org/licenses/MIT.html` → `https://spdx.org/licenses/MIT`; don't rely on
  that, write it correctly.
- **`url`**: prefer the canonical project home or repository. Every URL in this directory
  is link-checked by lychee in CI, on PRs and nightly. A dead link is a build failure.
- **`description`**: one or two sentences, plain, aimed at a researcher who has not heard
  of the tool. What it does and what it gets you. Not marketing copy lifted from the
  project's landing page.

---

## Indicator selection

This is the judgement call the whole role turns on, and the failure mode is always the
same: adding indicators because they _could_ apply.

- **Correctness over exhaustiveness.** More indicators is not a better entry. Include only
  what the tool's core functionality clearly and strongly supports.
- **Drop the borderline ones.** If justifying an indicator takes a paragraph of
  qualification, it does not belong.
- **`measures` vs `improves`.** `measuresQualityIndicator` = the tool reports or checks
  this. `improvesQualityIndicator` = using the tool makes it better. A formatter _improves_
  linting cleanliness; a linter _measures_ it. Don't list both reflexively.
- **A dimension needs backing.** `hasQualityDimension` reflects what the tool actually
  works on, not the neighbourhood it's in.

Every indicator you add or remove is defended in the PR description with a link to the
documentation page that supports it. "It seemed to fit" is not a source.

---

## Provenance

- Every change traces to a verifiable URL: official repository, official documentation.
- Prefer the project's own docs over blog posts, aggregator pages, or an LLM's recollection.
- Cite sources in the PR description, not in the JSON.
- The current indicator vocabulary is at
  `https://everse.software/indicators/api/indicators.json`. Fetch it; never invent an
  indicator URI, and never hard-code one into the schema to make a test pass.

---

## Delivery workflow

**One PR per tool.** No batching — a reviewer must be able to accept or reject each tool's
metadata on its own evidence.

Run everything from the **repository root** — `review_tracker.py` resolves its paths
against the working directory, so it only works from there.

```bash
git checkout main && git pull origin main
git checkout -b catalog/update-<tool-name>

# edit quality-tools/<tool-name>.json

python -m pytest tests/test_tools.py          # schema validation
cd web && npm run format-json:fix && cd ..    # prettier; CI checks this

git commit -m "catalog: update <tool-name> metadata and indicators"
git push origin catalog/update-<tool-name>
gh pr create
```

Then update `scripts/review_status.json`.

`python scripts/review_tracker.py` names the next unreviewed tools. Work through them one
at a time. Note that the tracker file is gitignored, so its state is local to your machine
and a few of its entries predate the current slug convention.

### PR description template

The reviewer's job is to check your reasoning, not to redo your research. Give them the
sources.

```markdown
## Description

Semantic audit for **<tool-name>**.

## Changes

- [ ] Updated description / license.
- [ ] Added indicators: `<list-ids>`.
- [ ] Removed obsolete indicators: `<list-ids>`.

## Justification & sources

- **Official source**: <url-to-documentation>
- **Rationale**: <Why each indicator maps to a real feature of the tool. Argue from
  correctness and usefulness, not from how many you managed to attach.>
```

If validation fails offline: `tests/helpers.py` fetches the indicator list at validation
time and raises `RuntimeError` when the API is unreachable. Dimensions fall back to a
hard-coded list; indicators do not. Check your connection before you suspect your edit.

---

## Ongoing maintenance

- Broken links surface nightly through the lychee workflow — fix them at the source
  (the tool moved, the tool died), don't just swap in an archive link without saying so.
- Tools change. A description written three years ago may now be wrong about what the tool
  measures.
- A tool that is abandoned or has been absorbed into another project is worth flagging in
  an issue. Removal is a curation-team decision, not a solo one.
- New candidates are welcome — check the inclusion criteria in `../CONTRIBUTING.md` first.

## The check that matters

Would the tool's own maintainers read this entry and agree it describes their tool?
If not, it isn't ready.
