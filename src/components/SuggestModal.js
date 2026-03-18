/**
 * SuggestModal.js
 * Handles the "Suggest a Tool" form: live JSON preview + download.
 */

export function mountSuggestModal(config) {
  const form = document.getElementById("suggest-form");
  if (!form) return;

  const tierSelect = document.getElementById("sug-tier");
  const dimCheckboxes = document.getElementById("sug-dims");

  if (tierSelect) {
    tierSelect.innerHTML = `<option value="">Select tier…</option>` +
      config.tiers.map((t) => `<option value="${t.label}">${t.label} — ${t.description.slice(0, 50)}…</option>`).join("");
  }

  if (dimCheckboxes) {
    dimCheckboxes.innerHTML = config.dimensions.map((d) => `
      <label class="dim-check">
        <input type="checkbox" name="dim" value="${d.label}">
        <span style="color:${d.color}">${d.label}</span>
      </label>`).join("");
  }

  form.addEventListener("input", () => updatePreview());
  form.addEventListener("change", () => updatePreview());

  document.getElementById("sug-download")?.addEventListener("click", () => downloadJson());
}

function gatherFormData() {
  const f = (id) => document.getElementById(id)?.value || "";
  const dims = [...document.querySelectorAll("#sug-dims input:checked")].map((cb) => cb.value);
  const langs = f("sug-langs").split(",").map((s) => s.trim()).filter(Boolean);

  return {
    name:         f("sug-name"),
    description:  f("sug-desc"),
    website:      f("sug-website"),
    tier:         f("sug-tier"),
    softwareType: f("sug-swtype"),
    license:      f("sug-license"),
    dims,
    langs,
  };
}

function toJsonObj(d) {
  return {
    name:         d.name,
    description:  d.description,
    website:      d.website,
    tier:         d.tier,
    softwareType: d.softwareType,
    dimensions:   d.dims,
    indicators:   Object.fromEntries(d.dims.map((dim) => [dim, `measures ${dim} by ...`])),
    useCases:     [],
    license:      d.license,
    languages:    d.langs,
    tags:         [],
    icon:         "🔧",
    addedDate:    new Date().toISOString().split("T")[0],
  };
}

function updatePreview() {
  const preview = document.getElementById("json-preview");
  if (!preview) return;

  const obj = toJsonObj(gatherFormData());
  const raw = JSON.stringify(obj, null, 2);

  preview.innerHTML = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span class="yk">${match}</span>`;
          return `<span class="yv">${match}</span>`;
        }
        return `<span class="yl">${match}</span>`;
      }
    );
}

function downloadJson() {
  const d = gatherFormData();
  if (!d.name || !d.description || !d.website || !d.tier || !d.softwareType || !d.license || !d.dims.length) {
    alert("Please fill in all required fields: name, description, website, tier, software type, dimensions, and license.");
    return;
  }

  const obj = toJsonObj(d);
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
}
