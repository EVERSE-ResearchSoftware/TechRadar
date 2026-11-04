import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getAllTools } from '../data/loader';

const toArray = value => (value == null ? [] : Array.isArray(value) ? value : [value]);

const getReferenceId = value =>
    typeof value === 'string' ? value : value?.['@id'] ?? '';

const getLabel = (value, dimensions = false) => {
    const id = getReferenceId(value);
    if (!id) return '';
    const label = dimensions
        ? id.replace(/^(dim|rs):/, '').split('/').pop()
        : id.split('/').pop();
    return label.replace(/[_-]+/g, ' ');
};

const getDimensionTags = tool =>
    Array.from(new Set(
        toArray(tool.hasQualityDimension)
            .map(value => getLabel(value, true))
            .filter(Boolean)
    ));

const formatRelativeTime = value => {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return null;

    const elapsed = timestamp - Date.now();
    const absoluteElapsed = Math.abs(elapsed);
    if (absoluteElapsed < 60_000) return 'just now';

    const units = [
        ['year', 365 * 24 * 60 * 60 * 1000],
        ['month', 30 * 24 * 60 * 60 * 1000],
        ['week', 7 * 24 * 60 * 60 * 1000],
        ['day', 24 * 60 * 60 * 1000],
        ['hour', 60 * 60 * 1000],
        ['minute', 60 * 1000],
    ];
    const [unit, duration] = units.find(([, duration]) => absoluteElapsed >= duration);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        .format(Math.round(elapsed / duration), unit);
};

const getGitHubRepository = tool => {
    const repositoryUrl = tool.codeRepository ?? tool.url;
    if (typeof repositoryUrl !== 'string') return null;

    try {
        const url = new URL(repositoryUrl);
        if (url.hostname.toLowerCase() !== 'github.com') return null;
        const [owner, repository] = url.pathname.split('/').filter(Boolean);
        if (!owner || !repository) return null;
        return {
            url: `https://github.com/${owner}/${repository.replace(/\.git$/, '')}`,
            apiUrl: `https://api.github.com/repos/${owner}/${repository.replace(/\.git$/, '')}`,
        };
    } catch {
        return null;
    }
};

const ValueList = ({ values }) => {
    const items = toArray(values)
        .map(value => typeof value === 'string' ? value : value?.name ?? getLabel(value))
        .filter(Boolean);

    if (items.length === 0) {
        return <span className="text-slate-400">Not specified</span>;
    }

    return (
        <ul className="space-y-1">
            {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
    );
};

const sharedTags = tools => {
    if (tools.length === 0) return [];
    const tagsForEachTool = tools.map(tool => new Set(getDimensionTags(tool)));
    return Array.from(tagsForEachTool[0])
        .filter(tag => tagsForEachTool.slice(1).every(tags => tags.has(tag)));
};

const MissingValue = () => (
    <span className="text-slate-400">Not specified in catalog</span>
);

const Website = ({ url, label = 'Visit website' }) => {
    if (!url) return <MissingValue />;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 underline break-all"
        >
            {label} <ExternalLink size={14} />
        </a>
    );
};

const CompareTools = () => {
    const [searchParams] = useSearchParams();
    const toolsParam = searchParams.get('tools') || '';
    const tools = useMemo(() => {
        const toolsById = new Map(getAllTools().map(tool => [tool._filename, tool]));
        const requestedIds = Array.from(new Set(toolsParam.split(',').filter(Boolean)));
        return requestedIds.map(id => toolsById.get(id)).filter(Boolean);
    }, [toolsParam]);
    const backParams = new URLSearchParams();
    const selectedIds = tools.map(tool => tool._filename);
    if (selectedIds.length > 0) backParams.set('tools', selectedIds.join(','));
    const backToCatalog = { pathname: '/', search: backParams.toString() ? `?${backParams}` : '' };
    const repositories = useMemo(
        () => tools.map(tool => ({ toolId: tool._filename, ...getGitHubRepository(tool) }))
            .filter(repository => repository.url),
        [tools]
    );
    const [githubMetadata, setGithubMetadata] = useState({});

    useEffect(() => {
        let isCurrent = true;

        Promise.all(repositories.map(async repository => {
            try {
                const response = await fetch(repository.apiUrl, {
                    headers: { Accept: 'application/vnd.github+json' },
                });
                if (!response.ok) {
                    throw new Error(`GitHub returned HTTP ${response.status}`);
                }
                const data = await response.json();
                return [repository.toolId, {
                    status: 'loaded',
                    stars: data.stargazers_count,
                    updatedAt: data.pushed_at,
                }];
            } catch (error) {
                return [repository.toolId, {
                    status: 'error',
                    message: error instanceof Error ? error.message : 'GitHub metadata could not be loaded',
                }];
            }
        })).then(results => {
            if (isCurrent) setGithubMetadata(Object.fromEntries(results));
        });

        return () => {
            isCurrent = false;
        };
    }, [repositories]);

    if (tools.length < 2) {
        return (
            <section className="max-w-3xl mx-auto">
                <Link to={backToCatalog} className="inline-flex items-center text-slate-500 hover:text-sky-600 mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Catalog
                </Link>
                <div className="glass-panel p-8 text-center">
                    <h1 className="text-2xl font-bold mb-3">Compare tools</h1>
                    <p className="text-slate-600 mb-5">
                        Select at least two tools in the catalog to compare their capabilities.
                    </p>
                    <Link to={backToCatalog} className="text-sky-700 hover:text-sky-900 underline">
                        Choose tools
                    </Link>
                </div>
            </section>
        );
    }

    const commonTags = sharedTags(tools);
    const getGitHubValue = (tool, field) => {
        const repository = getGitHubRepository(tool);
        const metadata = githubMetadata[tool._filename];
        if (!repository) return <MissingValue />;
        if (!metadata || metadata.status === 'loading') {
            return <span className="text-slate-400">Loading…</span>;
        }
        if (metadata.status === 'error') {
            return <span className="text-amber-700">{metadata.message}</span>;
        }
        return field === 'stars'
            ? metadata.stars?.toLocaleString() ?? <MissingValue />
            : formatRelativeTime(metadata.updatedAt) ?? <MissingValue />;
    };
    const rows = [
        {
            label: 'Overview',
            render: tool => tool.description || <MissingValue />,
        },
        {
            label: 'Primary purpose',
            render: tool => tool.primaryPurpose || <MissingValue />,
        },
        {
            label: 'Key features',
            render: tool => tool.featureList?.length
                ? <ValueList values={tool.featureList} />
                : <MissingValue />,
        },
        {
            label: 'Target users',
            render: tool => tool.targetUsers?.length
                ? <ValueList values={tool.targetUsers} />
                : <MissingValue />,
        },
        {
            label: 'Programming languages',
            render: tool => tool.appliesToProgrammingLanguage
                ? <ValueList values={tool.appliesToProgrammingLanguage} />
                : <MissingValue />,
        },
        {
            label: 'License',
            render: tool => tool.license.length > 0
                ? <ValueList values={tool.license.map(license => license.split('/').pop())} />
                : <MissingValue />,
        },
        {
            label: 'Tags',
            render: tool => {
                const tags = getDimensionTags(tool);
                return tags.length > 0
                    ? (
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs text-sky-800">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )
                    : <MissingValue />;
            },
        },
        {
            label: 'Website',
            render: tool => <Website url={tool.url} />,
        },
        {
            label: 'Documentation',
            render: tool => tool.documentationUrl
                ? <span className="inline-flex flex-wrap items-center gap-2"><span aria-label="Documentation available">✓ Yes</span><Website url={tool.documentationUrl} label="Read documentation" /></span>
                : <span aria-label="Documentation not specified">Not specified in catalog</span>,
        },
        {
            label: 'GitHub stars',
            render: tool => getGitHubValue(tool, 'stars'),
        },
        {
            label: 'Last updated',
            render: tool => getGitHubValue(tool, 'updatedAt'),
        },
        {
            label: 'Free access',
            render: tool => tool.isAccessibleForFree === true
                ? 'Yes'
                : tool.isAccessibleForFree === false ? 'No' : <MissingValue />,
        },
    ];

    return (
        <section className="max-w-7xl mx-auto">
            <Link to={backToCatalog} className="inline-flex items-center text-slate-500 hover:text-sky-600 mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Catalog
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Compare tools</h1>
                    <p className="text-slate-600 mt-2">Compare tool overviews, metadata.</p>
                </div>
                <Link
                    to={backToCatalog}
                    className="inline-flex items-center justify-center px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-medium rounded-lg transition-colors"
                >
                    Change selection
                </Link>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-0 table-fixed border-collapse text-sm text-left">
                        <caption className="sr-only">Capability comparison for selected tools</caption>
                        <colgroup>
                            <col style={{ width: '22%' }} />
                            {tools.map(tool => (
                                <col key={tool._filename} style={{ width: `${78 / tools.length}%` }} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="sticky left-0 z-10 bg-slate-100 p-3 sm:p-4 align-top">
                                    Capability
                                </th>
                            {tools.map(tool => (
                                <th key={tool._filename} scope="col" className="p-3 sm:p-4 bg-slate-50 align-top break-words">
                                    <Link
                                        to={`/tool/${tool._filename}`}
                                        className="font-semibold text-sky-700 hover:text-sky-900 underline break-words"
                                    >
                                        {tool.name}
                                    </Link>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.label} className="border-t border-slate-200 align-top">
                                    <th scope="row" className="sticky left-0 z-10 bg-white p-3 sm:p-4 font-semibold text-slate-700 break-words">
                                        {row.label}
                                    </th>
                                    {tools.map(tool => (
                                        <td key={tool._filename} className="p-3 sm:p-4 text-slate-600 break-words">
                                            {row.render(tool)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default CompareTools;
