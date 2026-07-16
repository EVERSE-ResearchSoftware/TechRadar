import test from 'node:test';
import assert from 'node:assert/strict';
import prettier from 'prettier';
import { buildSuggestedToolJson, stringifySuggestedToolJson } from './suggestToolJson.js';

const sampleForm = {
    name: 'Test Tool',
    description: 'Tool description',
    url: 'https://example.org/tool',
    license: 'https://spdx.org/licenses/MIT',
    applicationCategory: ['rs:AnalysisCode'],
    hasQualityDimension: ['maintainability'],
    measuresQualityIndicator: ['ind:ci_testing'],
    improvesQualityIndicator: ['ind:linting'],
    isAccessibleForFree: true,
    howToUse: ['command-line'],
    appliesToProgrammingLanguage: 'Python, R',
    usedBy: ['ENVRI'],
    author: 'Example Author',
    maintainer: 'Example Maintainer',
};

test('stringifySuggestedToolJson ends with a trailing newline', async () => {
    const json = await stringifySuggestedToolJson(sampleForm);
    assert.equal(json.endsWith('\n'), true);
});

test('stringifySuggestedToolJson output is Prettier-compliant JSON', async () => {
    const json = await stringifySuggestedToolJson(sampleForm);
    const pretty = await prettier.format(json, { parser: 'json' });
    assert.equal(json, pretty);
});

test('stringifySuggestedToolJson preserves buildSuggestedToolJson content', async () => {
    const json = await stringifySuggestedToolJson(sampleForm);
    const parsed = JSON.parse(json);
    assert.deepEqual(parsed, buildSuggestedToolJson(sampleForm));
});
