import React, { useState, useMemo } from 'react';
import { getAllTools, getQualityDimensions, getFilterOptions } from '../data/loader';
import { getDimensionColor } from '../data/colors';
import { Link } from 'react-router-dom';
import { Search, Filter, Menu, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import Radar from '../components/Radar';

const Home = () => {
    const tools = getAllTools();
    const dimensions = getQualityDimensions();
    const filterOptions = useMemo(() => getFilterOptions(), []);

    const [search, setSearch] = useState('');
    const [selectedDim, setSelectedDim] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState({
        categories: [],
        usage: [],
        licenses: '',
        languages: [],
        free: false
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
            free: false
        });
        setSelectedDim('');
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
            const matchesDim = selectedDim === '' || toolDims.some(d => d['@id'] && d['@id'].includes(selectedDim));
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
                if (tool.license !== filters.licenses) return false;
            }

            // Free
            if (filters.free) {
                if (tool.isAccessibleForFree !== true) return false;
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
                    <div className="lg:-mr-24">
                        <Radar
                            tools={tools}
                            dimensions={dimensions}
                            size={800}
                            onDimClick={(dim) => {
                                setSelectedDim(dim);
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
                        onChange={(e) => setSelectedDim(e.target.value)}
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
                            options={filterOptions}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={clearFilters}
                        />
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block sticky top-24">
                    <FilterSidebar
                        options={filterOptions}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={clearFilters}
                    />
                </div>

                <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTools.map(tool => (
                            <Link
                                key={tool._filename}
                                to={`/tool/${tool._filename}`}
                                className="glass-panel p-6 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-sky-600 group-hover:text-sky-700">{tool.name}</h3>
                                    {tool.isAccessibleForFree && (
                                        <span className="flex-shrink-0 ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                                            Free
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                    {tool.description}
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
                                                            backgroundColor: `${color}10`, // 10% opacity
                                                            borderColor: `${color}40`,     // 40% opacity
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
