import React from 'react';
import { TrendingUp, Ruler, ExternalLink } from 'lucide-react';
import { useIndicators, resolveIndicators } from '../hooks/useIndicators';

/**
 * Renders "Improves Quality Indicators" and "Measures Quality Indicators"
 * chips on a tool detail page.
 *
 * Props:
 *   improvesRefs  — tool.improvesQualityIndicator  (array | object | undefined)
 *   measuresRefs  — tool.measuresQualityIndicator  (array | object | undefined)
 */
const ToolIndicators = ({ improvesRefs, measuresRefs }) => {
  const { indicators, loading } = useIndicators();

  const improves = resolveIndicators(improvesRefs, indicators);
  const measures = resolveIndicators(measuresRefs, indicators);

  if (!improvesRefs && !measuresRefs) return null;

  return (
    <div className="border-t border-slate-200 pt-6 mt-6 space-y-5">

      {/* Loading skeleton */}
      {loading && (
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-7 w-32 rounded-full bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Improves Quality Indicators */}
      {!loading && improves.length > 0 && (
        <IndicatorGroup
          icon={<TrendingUp size={14} />}
          label="Improves Quality Indicators"
          items={improves}
          chipClass="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300"
        />
      )}

      {/* Measures Quality Indicators */}
      {!loading && measures.length > 0 && (
        <IndicatorGroup
          icon={<Ruler size={14} />}
          label="Measures Quality Indicators"
          items={measures}
          chipClass="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
        />
      )}

    </div>
  );
};

const IndicatorGroup = ({ icon, label, items, chipClass }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      {icon}
      {label}
    </p>
    <div className="flex flex-wrap gap-2">
      {items.map(ind => (
        <a
          key={ind.id}
          href={ind.url}
          target="_blank"
          rel="noopener noreferrer"
          title={ind.description ?? ind.name}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
            border transition-colors duration-150 cursor-pointer
            ${chipClass}
          `}
        >
          {ind.name}
          <ExternalLink size={10} className="opacity-50 flex-shrink-0" />
        </a>
      ))}
    </div>
  </div>
);

export default ToolIndicators;
