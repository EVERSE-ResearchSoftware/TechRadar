import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'quality-tools');
const targetDir = path.join(repoRoot, 'web', 'public', 'api');
const targetFile = path.join(targetDir, 'tools.json');

const readToolFiles = async () => {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    const jsonFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b));

    const tools = await Promise.all(
        jsonFiles.map(async (filename) => {
            const filePath = path.join(sourceDir, filename);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(fileContent);

            return {
                ...parsed,
                _filename: filename.replace(/\.json$/i, ''),
            };
        }),
    );

    return { tools, files: jsonFiles };
};

const writeApiFile = async () => {
    const { tools, files } = await readToolFiles();

    const payload = {
        generatedAt: new Date().toISOString(),
        source: 'quality-tools',
        count: tools.length,
        files,
        tools,
    };

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');

    console.log(`Generated ${targetFile} with ${tools.length} tools.`);
};

writeApiFile().catch((error) => {
    console.error('Failed to generate aggregated tools API JSON.');
    console.error(error);
    process.exitCode = 1;
});