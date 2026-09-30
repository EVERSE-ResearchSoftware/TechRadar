import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { getLicenseGroup, getLicenseName } from './licenses.js';

test('getLicenseGroup maps SPDX URLs through ScanCode categories', () => {
    assert.equal(getLicenseGroup('https://spdx.org/licenses/MIT'), 'permissive');
    assert.equal(getLicenseGroup('https://spdx.org/licenses/CC0-1.0'), 'permissive');
    assert.equal(getLicenseGroup('https://spdx.org/licenses/LGPL-3.0-only'), 'weak-copyleft');
    assert.equal(getLicenseGroup('https://spdx.org/licenses/GPL-3.0-only'), 'copyleft');
    assert.equal(getLicenseGroup('https://spdx.org/licenses/BUSL-1.1'), 'source-available');
    assert.equal(getLicenseGroup('https://www.oracle.com/downloads/licenses/javadoc-updater-license.html'), 'proprietary');
});

test('getLicenseGroup puts unknown or missing licenses in "other"', () => {
    assert.equal(getLicenseGroup('https://spdx.org/licenses/Not-A-License'), 'other');
    assert.equal(getLicenseGroup('https://example.org/license'), 'other');
    assert.equal(getLicenseGroup(undefined), 'other');
});

test('getLicenseName returns the SPDX id', () => {
    assert.equal(getLicenseName('https://spdx.org/licenses/Apache-2.0'), 'Apache-2.0');
});

test('every catalogue license has a group', () => {
    const dir = new URL('../../../quality-tools/', import.meta.url);
    const unclassified = readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => JSON.parse(readFileSync(new URL(f, dir), 'utf8')).license?.trim()
            .replace(/^(https:\/\/spdx\.org\/licenses\/[^/]+)\.html$/i, '$1'))
        .filter(l => l && getLicenseGroup(l) === 'other');
    assert.deepEqual(unclassified, []);
});
