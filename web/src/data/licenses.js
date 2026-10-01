// License groups for the catalogue's license filter.
//
// Each license's category comes from ScanCode LicenseDB, fetched at runtime (see
// useLicenseCategories). This file only decides how ScanCode categories are grouped
// for display.
export const SCANCODE_INDEX_URL = 'https://scancode-licensedb.aboutcode.org/index.json';

// Some tools point to vendor terms of service instead of an SPDX license. ScanCode has
// no entry for these URLs; they are grouped as proprietary because each one is the
// vendor's own product terms, not an open license.
const PROPRIETARY_TERMS_URLS = [
    'https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features',
    'https://github.com/customer-terms/github-copilot-product-specific-terms',
    'https://www.oracle.com/downloads/licenses/javadoc-updater-license.html',
];

// Display groups, in the order they appear in the filter. Each lists the ScanCode
// categories it covers.
export const LICENSE_GROUPS = [
    { id: 'permissive', label: 'Permissive', scancode: ['Permissive', 'Public Domain'] },
    { id: 'weak-copyleft', label: 'Weak copyleft', scancode: ['Copyleft Limited'] },
    { id: 'copyleft', label: 'Strong copyleft', scancode: ['Copyleft'] },
    { id: 'source-available', label: 'Source-available', scancode: ['Source-available'] },
    { id: 'proprietary', label: 'Proprietary', scancode: ['Proprietary Free', 'Commercial'] },
    { id: 'other', label: 'Other', scancode: [] },
];

const SPDX_URL_PREFIX = 'https://spdx.org/licenses/';

/**
 * Builds a { spdxId: scancodeCategory } map from the ScanCode index. Deprecated SPDX ids
 * (e.g. LGPL-2.1) are listed by ScanCode under other_spdx_license_keys and map too.
 */
export const buildCategoryBySpdx = (scancodeIndex) => {
    const map = {};
    scancodeIndex.forEach(entry => {
        [entry.spdx_license_key, ...(entry.other_spdx_license_keys ?? [])]
            .filter(Boolean)
            .forEach(key => { map[key] = entry.category; });
    });
    return map;
};

/**
 * Fetches the ScanCode index and returns the { spdxId: category } map. Rejects after
 * 10 s, including a stalled response body, so callers fall back instead of waiting.
 */
export const fetchCategoryBySpdx = async () => {
    const res = await fetch(SCANCODE_INDEX_URL, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`ScanCode LicenseDB returned HTTP ${res.status}`);
    return buildCategoryBySpdx(await res.json());
};

/**
 * Returns the license group id for a license URL, given the map from
 * buildCategoryBySpdx. Licenses ScanCode does not know return 'other'.
 */
export const getLicenseGroup = (license, categoryBySpdx) => {
    if (!license) return 'other';
    if (PROPRIETARY_TERMS_URLS.includes(license)) return 'proprietary';
    if (!license.startsWith(SPDX_URL_PREFIX)) return 'other';
    const category = categoryBySpdx[license.slice(SPDX_URL_PREFIX.length)];
    return LICENSE_GROUPS.find(g => g.scancode.includes(category))?.id ?? 'other';
};

/** Groups license URLs in LICENSE_GROUPS order, dropping groups with no license. */
export const groupLicenses = (licenses, categoryBySpdx) =>
    LICENSE_GROUPS
        .map(group => ({
            id: group.id,
            label: group.label,
            licenses: licenses.filter(l => getLicenseGroup(l, categoryBySpdx) === group.id),
        }))
        .filter(group => group.licenses.length > 0);

/** Short display name for a license URL: the SPDX id, or the last URL segment. */
export const getLicenseName = (license) => license.split('/').pop();
