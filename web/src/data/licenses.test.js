import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { buildCategoryBySpdx, fetchCategoryBySpdx, getLicenseGroup, getLicenseName, groupLicenses } from './licenses.js';

// Excerpt of the ScanCode LicenseDB index, same shape as index.json
const scancodeIndex = [
    { spdx_license_key: 'MIT', other_spdx_license_keys: [], category: 'Permissive' },
    { spdx_license_key: 'CC0-1.0', other_spdx_license_keys: [], category: 'Public Domain' },
    { spdx_license_key: 'LGPL-2.1-only', other_spdx_license_keys: ['LGPL-2.1', 'LicenseRef-LGPL-2.1'], category: 'Copyleft Limited' },
    { spdx_license_key: 'GPL-3.0-only', other_spdx_license_keys: [], category: 'Copyleft' },
    { spdx_license_key: 'BUSL-1.1', other_spdx_license_keys: [], category: 'Source-available' },
    { spdx_license_key: null, other_spdx_license_keys: [], category: 'Permissive' },
];
const categoryBySpdx = buildCategoryBySpdx(scancodeIndex);
const spdx = id => `https://spdx.org/licenses/${id}`;

test('buildCategoryBySpdx maps current and deprecated SPDX ids', () => {
    assert.equal(categoryBySpdx['LGPL-2.1-only'], 'Copyleft Limited');
    assert.equal(categoryBySpdx['LGPL-2.1'], 'Copyleft Limited');
    assert.equal(categoryBySpdx.null, undefined);
});

test('getLicenseGroup maps SPDX URLs through ScanCode categories', () => {
    assert.equal(getLicenseGroup(spdx('MIT'), categoryBySpdx), 'permissive');
    assert.equal(getLicenseGroup(spdx('CC0-1.0'), categoryBySpdx), 'permissive');
    assert.equal(getLicenseGroup(spdx('LGPL-2.1'), categoryBySpdx), 'weak-copyleft');
    assert.equal(getLicenseGroup(spdx('GPL-3.0-only'), categoryBySpdx), 'copyleft');
    assert.equal(getLicenseGroup(spdx('BUSL-1.1'), categoryBySpdx), 'source-available');
    assert.equal(getLicenseGroup('https://www.oracle.com/downloads/licenses/javadoc-updater-license.html', categoryBySpdx), 'proprietary');
});

test('getLicenseGroup puts unknown or missing licenses in "other"', () => {
    assert.equal(getLicenseGroup(spdx('Not-A-License'), categoryBySpdx), 'other');
    assert.equal(getLicenseGroup('https://example.org/license', categoryBySpdx), 'other');
    assert.equal(getLicenseGroup(undefined, categoryBySpdx), 'other');
});

test('groupLicenses keeps display order and drops empty groups', () => {
    const groups = groupLicenses([spdx('GPL-3.0-only'), spdx('MIT'), spdx('CC0-1.0')], categoryBySpdx);
    assert.deepEqual(groups.map(g => g.id), ['permissive', 'copyleft']);
    assert.deepEqual(groups[0].licenses, [spdx('MIT'), spdx('CC0-1.0')]);
});

test('getLicenseName returns the SPDX id', () => {
    assert.equal(getLicenseName(spdx('Apache-2.0')), 'Apache-2.0');
});

// Needs network access to scancode-licensedb.aboutcode.org
test('every catalogue license is classified by ScanCode LicenseDB', async () => {
    const liveCategoryBySpdx = await fetchCategoryBySpdx();
    const dir = new URL('../../../quality-tools/', import.meta.url);
    const unclassified = readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => [f, JSON.parse(readFileSync(new URL(f, dir), 'utf8')).license?.trim()
            // same rewrite as normalizeLicense in loader.js
            .replace(/^(https:\/\/spdx\.org\/licenses\/[^/]+)\.html$/i, '$1')])
        .filter(([, license]) => license && getLicenseGroup(license, liveCategoryBySpdx) === 'other');
    assert.deepEqual(unclassified, []);
});
