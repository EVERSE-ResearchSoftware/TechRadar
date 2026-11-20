import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getAllTools, getQualityDimensions, getFilterOptions, getQualityIndicatorIds } from '../data/loader';
import { getDimensionColor } from '../data/colors';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Menu, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import Radar from '../components/Radar';
import { useIndicatorOptions } from '../hooks/useIndicators';

const Home = () => {
    const tools = getAllTools();
    const dimensions = getQualityDimensions();
    const filterOptions = useMemo(() => getFilterOptions(), []);
    const catalogIndicatorIds = useMemo(() => getQualityIndicatorIds(), []);
    const { options: allIndicatorOptions } = useIndicatorOptions();
    const filterOptionsWithIndicators = useMemo(() => ({
        ...filterOptions,
        measuresIndicators: catalogIndicatorIds.measures.map(
            id => allIndicatorOptions.find(o => o.id === id) ?? { id, label: id.split('/').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
        ),
        improvesIndicators: catalogIndicatorIds.improves.map(
            id => allIndicatorOptions.find(o => o.id === id) ?? { id, label: id.split('/').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
        ),
    }), [filterOptions, catalogIndicatorIds, allIndicatorOptions]);

    // Support deep-linking to a specific dimension, e.g. /#/?dimension=community
    // The `dimension` query param is the single source of truth for the selected
    // dimension, so links (from RSQKit or elsewhere) work without any extra state.
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedDim = searchParams.get('dimension') || '';
    const availableToolIds = new Set(tools.map(tool => tool._filename));
    const selectedToolIds = Array.from(new Set(
        (searchParams.get('tools') || '').split(',').filter(Boolean)
    )).filter(id => availableToolIds.has(id));
    const selectedToolIdSet = new Set(selectedToolIds);

    const [search, setSearch] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const selectDimension = useCallback((dim) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (dim) {
                next.set('dimension', dim);
            } else {
                next.delete('dimension');
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const toggleCompareTool = (toolId) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const selected = new Set(
                (next.get('tools') || '').split(',').filter(id => availableToolIds.has(id))
            );
            if (selected.has(toolId)) {
                selected.delete(toolId);
            } else {
                selected.add(toolId);
            }

            if (selected.size > 0) {
                next.set('tools', Array.from(selected).join(','));
            } else {
                next.delete('tools');
            }
            return next;
        }, { replace: true });
    };

    const openComparison = () => {
        const params = new URLSearchParams({ tools: selectedToolIds.join(',') });
        navigate({ pathname: '/compare', search: `?${params.toString()}` });
    };

    // Land directly on the filtered catalog when arriving via a dimension deep link.
    useEffect(() => {
        if (selectedDim) {
            document.getElementById('browse-tools')?.scrollIntoView({ behavior: 'smooth' });
        }
        // Only run on initial mount - subsequent dimension changes are user-driven
        // (dropdown / radar click) and already handle their own scrolling.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [filters, setFilters] = useState({
        categories: [],
        usage: [],
        licenses: '',
        languages: [],
        free: '',
        measuresIndicators: [],
        improvesIndicators: [],
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            categories: [],
            usage: [],
            licenses: '',
            languages: [],
            free: '',
            measuresIndicators: [],
            improvesIndicators: [],
        });
        selectDimension('');
        setSearch('');
    };

    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            // Search
            const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                (tool.description && tool.description.toLowerCase().includes(search.toLowerCase()));
            if (!matchesSearch) return false;

            // Dimension
            const toolDims = tool.hasQualityDimension
                ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                : [];
            // Normalize so external deep links (e.g. ?dimension=Open-Source-Software) still
            // match dimension slugs stored as "dim:open_source_software".
            const normalizeDim = (val) => val.toLowerCase().replace(/[\s-]+/g, '_');
            const normalizedSelectedDim = normalizeDim(selectedDim);
            const matchesDim = selectedDim === '' || toolDims.some(d => d['@id'] && normalizeDim(d['@id']).includes(normalizedSelectedDim));
            if (!matchesDim) return false;

            // Categories
            if (filters.categories.length > 0) {
                const toolCats = tool.applicationCategory
                    ? (Array.isArray(tool.applicationCategory) ? tool.applicationCategory : [tool.applicationCategory])
                    : [];
                const hasCategory = toolCats.some(c => c['@id'] && filters.categories.includes(c['@id'].replace('rs:', '')));
                if (!hasCategory) return false;
            }

            // Usage
            if (filters.usage.length > 0) {
                const toolUsage = tool.howToUse ? (Array.isArray(tool.howToUse) ? tool.howToUse : [tool.howToUse]) : [];
                const hasUsage = toolUsage.some(u => filters.usage.includes(u));
                if (!hasUsage) return false;
            }

            // Languages
            if (filters.languages.length > 0) {
                const toolLangs = tool.appliesToProgrammingLanguage
                    ? (Array.isArray(tool.appliesToProgrammingLanguage) ? tool.appliesToProgrammingLanguage : [tool.appliesToProgrammingLanguage])
                    : [];
                const hasLang = toolLangs.some(l => filters.languages.includes(l));
                if (!hasLang) return false;
            }

            // License
            if (filters.licenses) {
                if (!tool.license.includes(filters.licenses)) return false;
            }

            // Pricing (free vs paid — no filtering until the user picks one)
            if (filters.free === 'free') {
                if (tool.isAccessibleForFree !== true) return false;
            } else if (filters.free === 'paid') {
                if (tool.isAccessibleForFree !== false) return false;
            }

            // Measures indicators
            if (filters.measuresIndicators.length > 0) {
                const toolMeasures = tool.measuresQualityIndicator
                    ? (Array.isArray(tool.measuresQualityIndicator) ? tool.measuresQualityIndicator : [tool.measuresQualityIndicator])
                    : [];
                if (!toolMeasures.some(i => filters.measuresIndicators.includes(i['@id']))) return false;
            }

            // Improves indicators
            if (filters.improvesIndicators.length > 0) {
                const toolImproves = tool.improvesQualityIndicator
                    ? (Array.isArray(tool.improvesQualityIndicator) ? tool.improvesQualityIndicator : [tool.improvesQualityIndicator])
                    : [];
                if (!toolImproves.some(i => filters.improvesIndicators.includes(i['@id']))) return false;
            }

            return true;
        });
    }, [tools, search, selectedDim, filters]);

    return (
        <div>
            {/* Hero Section with Split Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-center mb-12 min-h-[60vh] lg:-mt-10">
                {/* Left: Title & Intro (1/3 width) */}
                <div className="w-full lg:w-4/12 flex-shrink-0 text-center lg:text-left space-y-6">
                    <h1 className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 leading-tight">
                        Research Software <br />
                        <span className="text-slate-800">Quality Tools</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        A curated catalog of tools and services to measure and improve research software quality.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                        <button
                            onClick={() => document.getElementById('browse-tools').scrollIntoView({ behavior: 'smooth' })}
                            className="px-12 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-sky-200"
                        >
                            Browse Catalog
                        </button>
                    </div>
                </div>

                {/* Right: Radar Visualization (2/3 width) */}
                <div className="flex-1 w-full lg:w-8/12 flex justify-center lg:justify-end overflow-visible">
                    <div className="lg:-mr-0">
                        <Radar
                            tools={tools}
                            dimensions={dimensions}
                            size={800}
                            onDimClick={(dim) => {
                                selectDimension(dim);
                                document.getElementById('browse-tools')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Anchored Section for Search & Filters */}
            <div id="browse-tools" className="scroll-mt-24"></div>

            <div className="glass-panel p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <button
                    className="md:hidden p-2 text-slate-500 hover:text-slate-900"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                    <Menu size={24} />
                </button>

                <div className="relative min-w-[200px] w-full md:w-auto hidden md:block">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer transition-all"
                        value={selectedDim}
                        onChange={(e) => selectDimension(e.target.value)}
                    >
                        <option value="">All Dimensions</option>
                        {dimensions.map(dim => (
                            <option key={dim} value={dim}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Mobile Sidebar Overlay */}
                <div className={`md:hidden fixed inset-0 z-[60] bg-white/95 transition-opacity ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="p-4 h-full overflow-y-auto">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setShowMobileFilters(false)} className="text-slate-900">
                                <X size={24} />
                            </button>
                        </div>
                        <FilterSidebar
                            options={filterOptionsWithIndicators}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={clearFilters}
                        />
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block sticky top-24">
                    <FilterSidebar
                        options={filterOptionsWithIndicators}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={clearFilters}
                    />
                </div>

                <div className="flex-1 w-full">
                    <div className="glass-panel p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-slate-600" aria-live="polite">
                            {selectedToolIds.length === 0
                                ? 'Want to compare tools? Select at least two tools to compare their capabilities.'
                                : `${selectedToolIds.length} ${selectedToolIds.length === 1 ? 'tool' : 'tools'} selected`}
                        </p>
                        <div className="flex items-center gap-3">
                            {selectedToolIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSearchParams(prev => {
                                        const next = new URLSearchParams(prev);
                                        next.delete('tools');
                                        return next;
                                    }, { replace: true })}
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 underline"
                                >
                                    Clear selection
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={openComparison}
                                disabled={selectedToolIds.length < 2}
                                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                            >
                                Compare tools
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTools.map(tool => (
                            <article
                                key={tool._filename}
                                className="glass-panel p-6 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                            >
                                <div className="flex justify-between items-start gap-3 mb-4">
                                    <Link to={`/tool/${tool._filename}`} className="group min-w-0">
                                        <h3 className="text-xl font-semibold text-sky-600 group-hover:text-sky-700">{tool.name}</h3>
                                    </Link>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedToolIdSet.has(tool._filename)}
                                                onChange={() => toggleCompareTool(tool._filename)}
                                                aria-label={`Select ${tool.name} to compare`}
                                                className="h-4 w-4 rounded border-slate-300 accent-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                                            />
                                            Compare
                                        </label>
                                        {tool.isAccessibleForFree === true && (
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                                                Free
                                            </span>
                                        )}
                                        {tool.isAccessibleForFree === false && (
                                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                Not free
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={`/tool/${tool._filename}`}
                                    className="flex flex-col flex-1"
                                >
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                        {tool.description?.replace(/\*\*|__|\*|_|`/g, '')}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {tool.hasQualityDimension && (
                                            (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                                                .slice(0, 3)
                                                .map((dim, i) => {
                                                    const dimName = dim['@id'].replace('dim:', '');
                                                    const color = getDimensionColor(dimName, dimensions);
                                                    return (
                                                        <span
                                                            key={i}
                                                            className="text-xs px-2 py-1 rounded-md border"
                                                            style={{
                                                                backgroundColor: `${color}10`,
                                                                borderColor: `${color}40`,
                                                                color: color
                                                            }}
                                                        >
                                                            {dimName}
                                                        </span>
                                                    );
                                                })
                                        )}
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>

                    {filteredTools.length === 0 && (
                        <div className="text-center py-12 text-slate-500 glass-panel">
                            <p className="text-lg mb-2">No tools found matching your criteria.</p>
                            <button
                                onClick={clearFilters}
                                className="text-sky-600 hover:text-sky-700 underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
