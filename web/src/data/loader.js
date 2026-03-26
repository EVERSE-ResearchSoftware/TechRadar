
// Load all JSON files from the software-tools directory
const toolsModules = import.meta.glob('@software-tools/*.json', { eager: true });

export const getAllTools = () => {
    return Object.entries(toolsModules).map(([path, module]) => {
        const data = module.default || module;
        // Extract filename as ID if needed, or use @id
        const filename = path.split('/').pop().replace('.json', '');
        return {
            ...data,
            _filename: filename, // Internal ID based on filename
        };
    });
};

export const getToolById = (id) => {
    const tools = getAllTools();
    return tools.find(tool => tool._filename === id);
};

export const getQualityDimensions = () => {
    const tools = getAllTools();
    const dimensions = new Set();

    tools.forEach(tool => {
        if (tool.hasQualityDimension) {
            const dims = Array.isArray(tool.hasQualityDimension)
                ? tool.hasQualityDimension
                : [tool.hasQualityDimension];

            dims.forEach(d => {
                if (d['@id']) {
                    // Extract dimension name from @id (e.g., "dim:compatibility" -> "compatibility")
                    const name = d['@id'].replace('dim:', '');
                    dimensions.add(name);
                }
            });
        }
    });

    return Array.from(dimensions).sort();
};

export const getProgrammingLanguages = () => {
    const tools = getAllTools();
    const languages = new Set();
    tools.forEach(tool => {
        if (tool.appliesToProgrammingLanguage) {
            const langs = Array.isArray(tool.appliesToProgrammingLanguage)
                ? tool.appliesToProgrammingLanguage
                : [tool.appliesToProgrammingLanguage];
            langs.forEach(l => languages.add(l));
        }
    });
    return Array.from(languages).sort();
};

export const getFilterOptions = () => {
    const tools = getAllTools();
    const options = {
        categories: new Set(),
        usage: new Set(),
        licenses: new Set()
    };

    tools.forEach(tool => {
        // Categories
        if (tool.applicationCategory) {
            const cats = Array.isArray(tool.applicationCategory)
                ? tool.applicationCategory
                : [tool.applicationCategory];
            cats.forEach(c => {
                if (c['@id']) options.categories.add(c['@id'].replace('rs:', ''));
            });
        }

        // Usage
        if (tool.howToUse) {
            const uses = Array.isArray(tool.howToUse) ? tool.howToUse : [tool.howToUse];
            uses.forEach(u => options.usage.add(u));
        }

        // License
        if (tool.license) {
            options.licenses.add(tool.license);
        }
    });

    return {
        categories: Array.from(options.categories).sort(),
        usage: Array.from(options.usage).sort(),
        licenses: Array.from(options.licenses).sort(),
        languages: getProgrammingLanguages(),
        free: [true, false]
    };
};
