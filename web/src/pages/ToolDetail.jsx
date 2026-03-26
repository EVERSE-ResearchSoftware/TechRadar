import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getToolById, getAllTools } from '../data/loader';
import { ArrowLeft, ExternalLink, Tag, CheckCircle, Info } from 'lucide-react';

const ToolDetail = () => {
    const { id } = useParams();
    const tool = getToolById(id);
    const allTools = getAllTools();

    if (!tool) {
        return <div className="text-center py-12">Tool not found</div>;
    }

    // Find related tools (share at least one dimension)
    const relatedTools = allTools.filter(t => {
        if (t._filename === tool._filename) return false;

        const tDims = t.hasQualityDimension
            ? (Array.isArray(t.hasQualityDimension) ? t.hasQualityDimension : [t.hasQualityDimension])
            : [];

        const currentDims = tool.hasQualityDimension
            ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
            : [];

        return tDims.some(td => currentDims.some(cd => cd['@id'] === td['@id']));
    }).slice(0, 3);

    const dimensions = tool.hasQualityDimension
        ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
        : [];

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
                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Tag size={12} className="mr-1" />
                                    {dim['@id'].replace('dim:', '')}
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

                <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-slate-600 text-lg leading-relaxed">{tool.description}</p>
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
                        </ul>
                    </div>
                </div>
            </div>

            {relatedTools.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Related Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedTools.map(t => (
                            <Link
                                key={t._filename}
                                to={`/tool/${t._filename}`}
                                className="glass-panel p-4 hover:bg-slate-50 transition-all hover:-translate-y-1"
                            >
                                <h3 className="font-semibold text-sky-600 mb-2">{t.name}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2">{t.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolDetail;
