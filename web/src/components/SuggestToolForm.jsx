import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Copy, ExternalLink, ChevronDown } from 'lucide-react';
import { useIndicatorOptions } from '../hooks/useIndicators';

const APPLICATION_CATEGORIES = [
    { id: 'rs:AnalysisCode', label: 'Analysis Code' },
    { id: 'rs:PrototypeTool', label: 'Prototype Tool' },
    { id: 'rs:ResearchInfrastructureSoftware', label: 'Research Infrastructure Software' },
];

const QUALITY_DIMENSIONS = [
    'compatibility', 'fairness', 'flexibility', 'functional_suitability',
    'interaction_capability', 'maintainability', 'performance_efficiency',
    'reliability', 'safety', 'security', 'sustainability', 'open_source_software'
];

const HOW_TO_USE_OPTIONS = ['CI/CD', 'command-line', 'online-service', 'library'];

const USED_BY_OPTIONS = ['ENVRI', 'ESCAPE', 'LS-RI', 'PaNOSC', 'SSHOC', 'EOSC-Life'];
const INITIAL_FORM = {
    name: '',
    description: '',
    url: '',
    license: '',
    applicationCategory: [],
    hasQualityDimension: [],
    measuresQualityIndicator: [],
    improvesQualityIndicator: [],
    isAccessibleForFree: false,
    howToUse: [],
    appliesToProgrammingLanguage: '',
    usedBy: [],
    author: '',
    maintainer: '',
};

function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function formatDimensionLabel(dim) {
    return dim
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function buildJson(form) {
    const slug = slugify(form.name);
    const obj = {
        '@context': 'https://w3id.org/everse/rs#',
        '@id': `https://w3id.org/everse/tools/${slug}`,
        '@type': 'SoftwareApplication',
    };

    // applicationCategory
    if (form.applicationCategory.length === 1) {
        obj.applicationCategory = { '@id': form.applicationCategory[0], '@type': '@id' };
    } else if (form.applicationCategory.length > 1) {
        obj.applicationCategory = form.applicationCategory.map(id => ({ '@id': id, '@type': '@id' }));
    }

    // Programming languages
    const langs = form.appliesToProgrammingLanguage
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);
    if (langs.length > 0) {
        obj.appliesToProgrammingLanguage = langs;
    }

    // author
    if (form.author.trim()) {
        obj.author = form.author.trim();
    }

    obj.description = form.description;

    // hasQualityDimension
    if (form.hasQualityDimension.length === 1) {
        obj.hasQualityDimension = { '@id': `dim:${form.hasQualityDimension[0]}`, '@type': '@id' };
    } else if (form.hasQualityDimension.length > 1) {
        obj.hasQualityDimension = form.hasQualityDimension.map(d => ({ '@id': `dim:${d}`, '@type': '@id' }));
    }

    // measuresQualityIndicator
    if (form.measuresQualityIndicator.length === 1) {
        obj.measuresQualityIndicator = { '@id': form.measuresQualityIndicator[0], '@type': '@id' };
    } else if (form.measuresQualityIndicator.length > 1) {
        obj.measuresQualityIndicator = form.measuresQualityIndicator.map(i => ({ '@id': i, '@type': '@id' }));
    }

    // improvesQualityIndicator
    if (form.improvesQualityIndicator.length === 1) {
        obj.improvesQualityIndicator = { '@id': form.improvesQualityIndicator[0], '@type': '@id' };
    } else if (form.improvesQualityIndicator.length > 1) {
        obj.improvesQualityIndicator = form.improvesQualityIndicator.map(i => ({ '@id': i, '@type': '@id' }));
    }

    // howToUse
    if (form.howToUse.length > 0) {
        obj.howToUse = form.howToUse;
    }

    obj.isAccessibleForFree = form.isAccessibleForFree;
    obj.license = form.license;

    // maintainer
    if (form.maintainer.trim()) {
        obj.maintainer = form.maintainer.trim();
    }

    obj.name = form.name;
    obj.url = form.url;

    // usedBy
    if (form.usedBy.length > 0) {
        obj.usedBy = form.usedBy;
    }

    return obj;
}

const MultiSelectDropdown = ({ options, value, onChange, placeholder, loading, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const filtered = options.filter(o =>
        !search || o.label.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id) => {
        onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(v => !v)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            >
                <span className={value.length === 0 ? 'text-slate-400' : 'text-slate-700'}>
                    {loading ? 'Loading indicators…' : value.length === 0 ? placeholder : `${value.length} indicator${value.length > 1 ? 's' : ''} selected`}
                </span>
                <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {value.map(id => {
                        const opt = options.find(o => o.id === id);
                        return (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs">
                                {opt?.label ?? id}
                                <button type="button" onClick={() => toggle(id)} aria-label={`Remove ${opt?.label ?? id}`}>
                                    <X size={10} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            type="text"
                            autoFocus
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                            placeholder="Search indicators…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-slate-400">No results</p>
                        ) : (
                            filtered.map(opt => (
                                <label
                                    key={opt.id}
                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 text-sm ${value.includes(opt.id) ? 'bg-sky-50/60' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={value.includes(opt.id)}
                                        onChange={() => toggle(opt.id)}
                                    />
                                    <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${value.includes(opt.id) ? 'border-sky-500 bg-sky-500' : 'border-slate-300'}`}>
                                        {value.includes(opt.id) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="text-slate-700">{opt.label}</span>
                                </label>
                            ))
                        )}
                    </div>
                    {error && <p className="px-4 py-2 text-xs text-amber-700 border-t border-slate-100">{error}</p>}
                </div>
            )}

            {error && !isOpen && options.length === 0 && (
                <p className="text-amber-700 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

const SuggestToolForm = ({ isOpen, onClose }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [successMsg] = useState('');
    const [copied, setCopied] = useState(false);
    const { options: indicatorOptions, loading: indicatorsLoading } = useIndicatorOptions();
    const backdropRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const toggleArrayField = (field, value) => {
        setForm(prev => {
            const arr = prev[field];
            return {
                ...prev,
                [field]: arr.includes(value)
                    ? arr.filter(v => v !== value)
                    : [...arr, value],
            };
        });
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.description.trim()) errs.description = 'Description is required';
        if (!form.url.trim()) errs.url = 'URL is required';
        else if (!/^https?:\/\/.+/.test(form.url.trim())) errs.url = 'Must be a valid URL (https://...)';
        if (!form.license.trim()) errs.license = 'License is required';
        if (form.applicationCategory.length === 0) errs.applicationCategory = 'Select at least one category';
        if (form.hasQualityDimension.length === 0) errs.hasQualityDimension = 'Select at least one dimension';
        return errs;
    };

    const handleCopyToClipboard = () => {
        const json = JSON.stringify(buildJson(form), null, 2);
        navigator.clipboard.writeText(json).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleOpenPR = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            const firstKey = Object.keys(errs)[0];
            document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        const slug = slugify(form.name);
        const url = `https://github.com/EVERSE-ResearchSoftware/TechRadar/new/main/quality-tools?filename=${slug}.json`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    const jsonPreview = JSON.stringify(buildJson(form), null, 2);

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Suggest a new tool"
        >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Suggest a New Tool</h2>
                        <p className="text-sky-100 text-sm mt-0.5">Fill in the details to generate a tool JSON file</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Success message */}
                {successMsg && (
                    <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-800 text-sm">
                        <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Form body */}
                <div className="px-6 py-6 space-y-6">
                    {/* ── Required fields ── */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                            Required Information
                        </legend>

                        {/* Name */}
                        <div className="mb-5" id="field-name">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Tool Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-sky-500'}`}
                                placeholder="e.g. SonarQube"
                                value={form.name}
                                onChange={e => updateField('name', e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div className="mb-5" id="field-description">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className={`w-full border rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 transition-all resize-y min-h-[80px] ${errors.description ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-sky-500'}`}
                                placeholder="A brief description of what this tool does..."
                                rows={3}
                                value={form.description}
                                onChange={e => updateField('description', e.target.value)}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.description}</p>}
                        </div>

                        {/* URL */}
                        <div className="mb-5" id="field-url">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                className={`w-full border rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 transition-all ${errors.url ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-sky-500'}`}
                                placeholder="https://example.com"
                                value={form.url}
                                onChange={e => updateField('url', e.target.value)}
                            />
                            {errors.url && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.url}</p>}
                        </div>

                        {/* License */}
                        <div className="mb-5" id="field-license">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                License <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 transition-all ${errors.license ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-sky-500'}`}
                                placeholder="https://spdx.org/licenses/MIT"
                                value={form.license}
                                onChange={e => updateField('license', e.target.value)}
                            />
                            <p className="text-slate-400 text-xs mt-1">If applicable, use an SPDX license URL, e.g. https://spdx.org/licenses/Apache-2.0</p>
                            {errors.license && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.license}</p>}
                        </div>

                        {/* Application Category */}
                        <div className="mb-5" id="field-applicationCategory">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Application Category: on which type of software this tool can be applied <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {APPLICATION_CATEGORIES.map(cat => (
                                    <label
                                        key={cat.id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm ${form.applicationCategory.includes(cat.id)
                                            ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.applicationCategory.includes(cat.id)}
                                            onChange={() => toggleArrayField('applicationCategory', cat.id)}
                                        />
                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form.applicationCategory.includes(cat.id) ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                                            }`}>
                                            {form.applicationCategory.includes(cat.id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        {cat.label}
                                    </label>
                                ))}
                            </div>
                            {errors.applicationCategory && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.applicationCategory}</p>}
                        </div>

                        {/* Quality Dimensions */}
                        <div id="field-hasQualityDimension">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Quality Dimensions <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {QUALITY_DIMENSIONS.map(dim => (
                                    <label
                                        key={dim}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-sm ${form.hasQualityDimension.includes(dim)
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-500'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.hasQualityDimension.includes(dim)}
                                            onChange={() => toggleArrayField('hasQualityDimension', dim)}
                                        />
                                        {formatDimensionLabel(dim)}
                                    </label>
                                ))}
                            </div>
                            {errors.hasQualityDimension && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.hasQualityDimension}</p>}
                        </div>
                    </fieldset>

                    <hr className="border-slate-200" />

                    {/* ── Optional fields ── */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                            Optional Information
                        </legend>

                        {/* Free */}
                        <div className="mb-5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <span
                                    className={`relative w-10 h-6 rounded-full transition-colors ${form.isAccessibleForFree ? 'bg-sky-500' : 'bg-slate-300'}`}
                                    onClick={(e) => { e.preventDefault(); updateField('isAccessibleForFree', !form.isAccessibleForFree); }}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isAccessibleForFree ? 'left-5' : 'left-1'}`} />
                                </span>
                                <span className="text-sm font-medium text-slate-700">Free to access</span>
                            </label>
                        </div>

                        {/* How to Use */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-2">How to Use</label>
                            <div className="flex flex-wrap gap-3">
                                {HOW_TO_USE_OPTIONS.map(opt => (
                                    <label
                                        key={opt}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm ${form.howToUse.includes(opt)
                                            ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.howToUse.includes(opt)}
                                            onChange={() => toggleArrayField('howToUse', opt)}
                                        />
                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form.howToUse.includes(opt) ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                                            }`}>
                                            {form.howToUse.includes(opt) && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Programming Languages */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Programming Languages</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                placeholder="Python, Java, C++ (comma-separated)"
                                value={form.appliesToProgrammingLanguage}
                                onChange={e => updateField('appliesToProgrammingLanguage', e.target.value)}
                            />
                        </div>

                        {/* Used By */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Used by Science Clusters</label>
                            <div className="flex flex-wrap gap-2">
                                {USED_BY_OPTIONS.map(cluster => (
                                    <label
                                        key={cluster}
                                        className={`px-3 py-1.5 rounded-full border cursor-pointer transition-all text-sm ${form.usedBy.includes(cluster)
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-500'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.usedBy.includes(cluster)}
                                            onChange={() => toggleArrayField('usedBy', cluster)}
                                        />
                                        {cluster}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Measures Quality Indicators */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Measures Quality Indicator</label>
                            <MultiSelectDropdown
                                options={indicatorOptions}
                                value={form.measuresQualityIndicator}
                                onChange={v => updateField('measuresQualityIndicator', v)}
                                placeholder="Select indicators…"
                                loading={indicatorsLoading}
                            />
                        </div>

                        {/* Improves Quality Indicators */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Improves Quality Indicator</label>
                            <MultiSelectDropdown
                                options={indicatorOptions}
                                value={form.improvesQualityIndicator}
                                onChange={v => updateField('improvesQualityIndicator', v)}
                                placeholder="Select indicators…"
                                loading={indicatorsLoading}
                            />
                        </div>

                        {/* Author */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Author</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                placeholder="Author name or organization"
                                value={form.author}
                                onChange={e => updateField('author', e.target.value)}
                            />
                        </div>

                        {/* Maintainer */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Maintainer</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                placeholder="Maintainer name or organization"
                                value={form.maintainer}
                                onChange={e => updateField('maintainer', e.target.value)}
                            />
                        </div>
                    </fieldset>

                    <hr className="border-slate-200" />

                    {/* JSON Preview */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                                Generated JSON Preview
                            </label>
                        </div>
                        <div className="relative group">
                            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto max-h-72 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
                                {jsonPreview}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors order-last sm:order-first"
                    >
                        Cancel
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:flex-1">
                        <button
                            type="button"
                            onClick={handleCopyToClipboard}
                            className={`flex-1 px-5 py-3 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${copied
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : '1. Copy to clipboard'}
                        </button>
                        <button
                            type="button"
                            onClick={handleOpenPR}
                            className="flex-1 px-5 py-3 text-sm font-medium bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-sky-200/50 transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={18} />
                            2. Open a Pull Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuggestToolForm;
