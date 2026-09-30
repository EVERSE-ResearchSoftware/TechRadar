// License groups for the catalogue's license filter.
//
// Categories are copied verbatim from ScanCode LicenseDB
// (https://scancode-licensedb.aboutcode.org/index.json, retrieved 2026-09-30), keyed by
// SPDX identifier. Only licenses used in ../quality-tools are listed. A license missing
// here is shown under "Other" rather than guessed at: add it with its ScanCode category.
const SCANCODE_CATEGORY_BY_SPDX = {
    '0BSD': 'Permissive',
    'AGPL-3.0-only': 'Copyleft',
    'AGPL-3.0-or-later': 'Copyleft',
    'Apache-2.0': 'Permissive',
    'BSD-2-Clause': 'Permissive',
    'BSD-3-Clause': 'Permissive',
    'BUSL-1.1': 'Source-available',
    'CC-BY-4.0': 'Permissive',
    'CC0-1.0': 'Public Domain',
    'Elastic-2.0': 'Source-available',
    'EPL-2.0': 'Copyleft Limited',
    'GPL-2.0-only': 'Copyleft',
    'GPL-3.0-only': 'Copyleft',
    'GPL-3.0-or-later': 'Copyleft',
    'LGPL-2.1': 'Copyleft Limited', // deprecated SPDX id, listed by ScanCode under lgpl-2.1
    'LGPL-2.1-only': 'Copyleft Limited',
    'LGPL-2.1-or-later': 'Copyleft Limited',
    'LGPL-3.0-only': 'Copyleft Limited',
    'MIT': 'Permissive',
    'MPL-2.0': 'Copyleft Limited',
};

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

/** Returns the license group id for a license URL. Unknown licenses return 'other'. */
export const getLicenseGroup = (license) => {
    if (!license) return 'other';
    if (PROPRIETARY_TERMS_URLS.includes(license)) return 'proprietary';
    if (!license.startsWith(SPDX_URL_PREFIX)) return 'other';
    const category = SCANCODE_CATEGORY_BY_SPDX[license.slice(SPDX_URL_PREFIX.length)];
    return LICENSE_GROUPS.find(g => g.scancode.includes(category))?.id ?? 'other';
};

/** Short display name for a license URL: the SPDX id, or the last URL segment. */
export const getLicenseName = (license) => license.split('/').pop();
