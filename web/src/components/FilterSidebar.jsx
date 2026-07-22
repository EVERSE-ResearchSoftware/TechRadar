import React from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

const FilterSection = ({ title, options, selected, onChange, renderOption, infoHref, infoTooltip }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <div className="mb-6 border-b border-slate-200 pb-6 last:border-0">
            <button
                className="flex items-center justify-between w-full text-left mb-3 group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{title}</h3>
                    {infoHref && (
                        <InfoTooltip tooltip={infoTooltip} href={infoHref} />
                    )}
                </span>
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>

            {isOpen && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {options.map(option => (
                        <label key={option} className="flex items-start gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="mt-1 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 focus:ring-offset-white"
                                checked={selected.includes(option)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onChange([...selected, option]);
                                    } else {
                                        onChange(selected.filter(item => item !== option));
                                    }
                                }}
                            />
                            <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors break-all">
                                {renderOption ? renderOption(option) : option}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterSidebar = ({ options, filters, onFilterChange, onClear }) => {
    return (
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="glass-panel p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900">Filters</h2>
                    {(filters.categories.length > 0 || filters.usage.length > 0 || filters.languages.length > 0 || filters.licenses !== '' || filters.free || filters.measuresIndicators?.length > 0 || filters.improvesIndicators?.length > 0) && (
                        <button
                            onClick={onClear}
                            className="text-xs text-sky-600 hover:text-sky-700 flex items-center"
                        >
                            <X size={12} className="mr-1" /> Clear all
                        </button>
                    )}
                </div>

                <div className="mb-6 border-b border-slate-200 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">Your software's targets</h3>
                        <a
                            href="https://everse.software/RSQKit/three_tier_view"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-600 hover:text-sky-700 underline"
                        >
                            What is this?
                        </a>
                    </div>
                    <div className="relative px-2 py-2">
                        <div className="relative flex flex-col gap-4 w-full">
                            {['ResearchInfrastructureSoftware', 'PrototypeTool', 'AnalysisCode'].map((cat, index, arr) => {
                                const mapping = {
                                    'AnalysisCode': 'individuals',
                                    'PrototypeTool': 'research teams',
                                    'ResearchInfrastructureSoftware': 'communities'
                                };
                                const isActive = filters.categories.includes(cat);
                                const isLast = index === arr.length - 1;
                                return (
                                    <div key={cat} className="relative flex items-center group cursor-pointer"
                                        onClick={() => {
                                            const newCats = isActive ? [] : [cat];
                                            onFilterChange('categories', newCats);
                                        }}
                                    >
                                        {/* Vertical line segment (not on last item) */}
                                        {!isLast && (
                                            <div className="absolute left-[7px] top-[14px] h-[calc(100%+2px)] w-0.5 bg-slate-200"></div>
                                        )}

                                        {/* Dot/Stop */}
                                        <div
                                            className={`
                                                w-4 h-4 rounded-full border-2 transition-all duration-200 flex-shrink-0 bg-white relative z-10
                                                ${isActive
                                                    ? 'border-sky-600 ring-4 ring-sky-100'
                                                    : 'border-slate-300 group-hover:border-sky-400'
                                                }
                                            `}
                                        >
                                            {isActive && <div className="w-full h-full bg-sky-600 rounded-full scale-75" />}
                                        </div>

                                        {/* Label */}
                                        <span
                                            className={`ml-3 text-sm transition-colors capitalize ${isActive ? 'font-medium text-sky-700' : 'text-slate-500 group-hover:text-slate-700'}`}
                                        >
                                            {mapping[cat] || cat}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <FilterSection
                    title="Your Software's Programming Language"
                    options={options.languages || []}
                    selected={filters.languages || []}
                    onChange={(newVal) => onFilterChange('languages', newVal)}
                />

                <div className="mb-6 last:border-0">
                    <h3 className="font-semibold text-slate-700 mb-3">License of the Tool</h3>
                    <select
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={filters.licenses}
                        onChange={(e) => onFilterChange('licenses', e.target.value)}
                    >
                        <option value="">All Licenses</option>
                        {options.licenses.map(license => (
                            <option key={license} value={license}>
                                {license.split('/').pop()}
                            </option>
                        ))}
                    </select>
                </div>

                <FilterSection
                    title="How to Use the Tool"
                    options={options.usage}
                    selected={filters.usage}
                    onChange={(newVal) => onFilterChange('usage', newVal)}
                />


                <div className="mb-6 border-b border-slate-200 pb-6">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 focus:ring-offset-white"
                            checked={filters.free}
                            onChange={(e) => onFilterChange('free', e.target.checked)}
                        />
                        <span className="ml-2 text-slate-700 group-hover:text-slate-900 font-semibold text-sm">Free to use</span>
                    </label>
                </div>

                {(options.measuresIndicators || []).length > 0 && (
                    <FilterSection
                        title="Measures Quality Indicator"
                        options={(options.measuresIndicators || []).map(o => o.id)}
                        selected={filters.measuresIndicators || []}
                        onChange={(newVal) => onFilterChange('measuresIndicators', newVal)}
                        renderOption={id => (options.measuresIndicators || []).find(o => o.id === id)?.label ?? id.split('/').pop()}
                        infoHref="https://everse.software/indicators/website/indicators.html"
                        infoTooltip="A research software quality indicator represents a specific software aspect that can be measured (e.g., FAIRness, test coverage, documentation coverage, etc.). Select the indicators that this tool actively measures. Click to see definitions of all indicators."
                    />
                )}

                {(options.improvesIndicators || []).length > 0 && (
                    <FilterSection
                        title="Improves Quality Indicator"
                        options={(options.improvesIndicators || []).map(o => o.id)}
                        selected={filters.improvesIndicators || []}
                        onChange={(newVal) => onFilterChange('improvesIndicators', newVal)}
                        renderOption={id => (options.improvesIndicators || []).find(o => o.id === id)?.label ?? id.split('/').pop()}
                        infoHref="https://everse.software/indicators/website/indicators.html"
                        infoTooltip="A research software quality indicator represents a specific software aspect that can be measured (e.g., FAIRness, test coverage, documentation coverage, etc.). Select the indicators that this tool actively helps improve. Click to see definitions of all indicators."
                    />
                )}

            </div>
        </div>
    );
};

export default FilterSidebar;
