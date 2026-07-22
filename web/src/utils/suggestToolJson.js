import prettier from 'prettier';

export function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function buildSuggestedToolJson(form) {
    const slug = slugify(form.name);
    const obj = {
        '@context': 'https://w3id.org/everse/rs#',
        '@id': `https://w3id.org/everse/tools/${slug}`,
        '@type': 'SoftwareApplication',
    };

    if (form.applicationCategory.length === 1) {
        obj.applicationCategory = { '@id': form.applicationCategory[0], '@type': '@id' };
    } else if (form.applicationCategory.length > 1) {
        obj.applicationCategory = form.applicationCategory.map(id => ({ '@id': id, '@type': '@id' }));
    }

    const langs = form.appliesToProgrammingLanguage
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);
    if (langs.length > 0) {
        obj.appliesToProgrammingLanguage = langs;
    }

    if (form.author.trim()) {
        obj.author = form.author.trim();
    }

    obj.description = form.description;

    if (form.hasQualityDimension.length === 1) {
        obj.hasQualityDimension = { '@id': `dim:${form.hasQualityDimension[0]}`, '@type': '@id' };
    } else if (form.hasQualityDimension.length > 1) {
        obj.hasQualityDimension = form.hasQualityDimension.map(d => ({ '@id': `dim:${d}`, '@type': '@id' }));
    }

    if (form.measuresQualityIndicator.length === 1) {
        obj.measuresQualityIndicator = { '@id': form.measuresQualityIndicator[0], '@type': '@id' };
    } else if (form.measuresQualityIndicator.length > 1) {
        obj.measuresQualityIndicator = form.measuresQualityIndicator.map(i => ({ '@id': i, '@type': '@id' }));
    }

    if (form.improvesQualityIndicator.length === 1) {
        obj.improvesQualityIndicator = { '@id': form.improvesQualityIndicator[0], '@type': '@id' };
    } else if (form.improvesQualityIndicator.length > 1) {
        obj.improvesQualityIndicator = form.improvesQualityIndicator.map(i => ({ '@id': i, '@type': '@id' }));
    }

    if (form.howToUse.length > 0) {
        obj.howToUse = form.howToUse;
    }

    obj.isAccessibleForFree = form.isAccessibleForFree;
    obj.license = form.license;

    if (form.maintainer.trim()) {
        obj.maintainer = form.maintainer.trim();
    }

    obj.name = form.name;
    obj.url = form.url;

    if (form.usedBy.length > 0) {
        obj.usedBy = form.usedBy;
    }

    return obj;
}

export async function stringifySuggestedToolJson(form) {
    const json = JSON.stringify(buildSuggestedToolJson(form), null, 2);
    try {
        return await prettier.format(json, { parser: 'json' });
    } catch {
        return `${json}\n`;
    }
}
