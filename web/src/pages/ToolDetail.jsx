import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getToolById, getAllTools } from '../data/loader';
import { ArrowLeft, ExternalLink, Tag, CheckCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ---------------------------------------------------------------------------
// Related tools scoring
// ---------------------------------------------------------------------------
// Scores each candidate tool against the current tool on three axes:
//   - Shared quality dimensions  (weight 3 each)
//   - Shared application category (weight 2)
//   - Shared quality indicators   (weight 1 each)
// Returns the top 3 highest-scoring tools (minimum score > 0).

const toArray = (val) => (val ? (Array.isArray(val) ? val : [val]) : []);

const getId = (obj) => (typeof obj === 'string' ? obj : obj?.['@id'] ?? '');

const scoreRelated = (current, candidate) => {
    let score = 0;

    const currentDims = toArray(current.hasQualityDimension).map(getId);
    const candidateDims = toArray(candidate.hasQualityDimension).map(getId);
    currentDims.forEach(d => { if (candidateDims.includes(d)) score += 2; });

    const currentCats = toArray(current.applicationCategory).map(getId);
    const candidateCats = toArray(candidate.applicationCategory).map(getId);
    currentCats.forEach(c => { if (candidateCats.includes(c)) score += 1; });

    const currentInds = toArray(current.improvesQualityIndicator ?? current.hasQualityIndicator).map(getId);
    const candidateInds = toArray(candidate.improvesQualityIndicator ?? candidate.hasQualityIndicator).map(getId);
    currentInds.forEach(i => { if (candidateInds.includes(i)) score += 3; });

    return score;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ToolDetail = () => {
    const { id } = useParams();
    const tool = getToolById(id);
    const allTools = getAllTools();

    if (!tool) {
        return <div className="text-center py-12">Tool not found</div>;
    }

    // Score and sort all other tools, keep top 3
    const relatedTools = allTools
        .filter(t => t._filename !== tool._filename)
        .map(t => ({ tool: t, score: scoreRelated(tool, t) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ tool: t }) => t);

    const dimensions = toArray(tool.hasQualityDimension);

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-sky-600 mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Catalog
            </Link>

            <div className="glass-panel p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{tool.name}</h1>
                        <div className="flex flex-wrap gap-2">
                            {dimensions.map((dim, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                                >
                                    <Tag size={12} className="mr-1" />
                                    {getId(dim).replace('dim:', '')}
                                </span>
                            ))}
                        </div>
                    </div>

                    {tool.url && (
                        <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-lg transition-colors font-medium"
                        >
                            Visit Website <ExternalLink size={16} className="ml-2" />
                        </a>
                    )}
                </div>

                {/* Description rendered as Markdown */}
                <div className="prose prose-slate prose-sm max-w-none mb-8
                    prose-headings:text-slate-800
                    prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-slate-700
                    prose-ul:text-slate-600 prose-li:marker:text-sky-400">
                    <ReactMarkdown>{tool.description}</ReactMarkdown>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Details</h3>
                        <ul className="space-y-3">
                            {tool.license && (
                                <li className="flex items-start text-slate-600">
                                    <Info size={18} className="mr-2 text-sky-600 mt-0.5" />
                                    <span>
                                        <span className="text-slate-500 block text-xs">License</span>
                                        {tool.license.split('/').pop()}
                                    </span>
                                </li>
                            )}
                            {tool.howToUse && (
                                <li className="flex items-start text-slate-600">
                                    <CheckCircle size={18} className="mr-2 text-sky-600 mt-0.5" />
                                    <span>
                                        <span className="text-slate-500 block text-xs">Usage</span>
                                        {Array.isArray(tool.howToUse) ? tool.howToUse.join(', ') : tool.howToUse}
                                    </span>
                                </li>
                            )}
                            {tool.applicationCategory && (
                                <li className="flex items-start text-slate-600">
                                    <Tag size={18} className="mr-2 text-sky-600 mt-0.5" />
                                    <span>
                                        <span className="text-slate-500 block text-xs">Software Tier</span>
                                        {toArray(tool.applicationCategory)
                                            .map(c => getId(c).replace('rs:', ''))
                                            .join(', ')}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {relatedTools.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Related Tools</h2>
                        <div className="relative group">
                            <button
                                type="button"
                                aria-label="How related tools are selected"
                                aria-describedby="related-tools-criteria"
                                className="inline-flex items-center justify-center text-slate-400 hover:text-sky-600 focus-visible:outline-none focus-visibl:reing-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-full"
                            >
                                <Info size={18} />
                            </button>
                            <div
                                id="related-tools-criteria"
                                role="tooltip"
                                className="pointer-events-none absolute z-10 top-7 -left-4 w-80 max-w-[85vw] rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-4 shadow-xl text-xs text-slate-700 opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                            >
                                {/* <p className="font-semibold text-slate-800 mb-1">How related tools are selected</p> */}
                                <p className="text-slate-600">Related tools are seletected based on shared metadata:</p>
                                <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-600">
                                    <li>Quality dimensions</li>
                                    <li>Software tiers</li>
                                    <li>Quality indicators</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedTools.map(t => (
                            <Link
                                key={t._filename}
                                to={`/tool/${t._filename}`}
                                className="glass-panel p-4 hover:bg-slate-50 transition-all hover:-translate-y-1"
                            >
                                <h3 className="font-semibold text-sky-600 mb-2">{t.name}</h3>
                                {/* Strip markdown for the preview snippet */}
                                <p className="text-slate-500 text-sm line-clamp-2">
                                    {t.description?.replace(/\*\*|__|\*|_|`/g, '')}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {toArray(t.hasQualityDimension).slice(0, 2).map((dim, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                                        >
                                            {getId(dim).replace('dim:', '')}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolDetail;
