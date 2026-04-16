import React from 'react';
import { Info } from 'lucide-react';

/**
 * InfoTooltip — shows a styled tooltip on hover and links to a definition page.
 *
 * Props:
 *   tooltip  {string}  Text shown inside the tooltip bubble.
 *   href     {string}  URL opened when the icon is clicked.
 */
const InfoTooltip = ({ tooltip, href }) => {
    const [visible, setVisible] = React.useState(false);

    return (
        <span
            className="filter-info-tooltip-wrapper"
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        >
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Learn more about this indicator"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
                className="text-slate-400 hover:text-sky-600 transition-colors flex-shrink-0"
                style={{ lineHeight: 0 }}
            >
                <Info size={14} />
            </a>

            {visible && (
                <span className="filter-info-tooltip" role="tooltip">
                    <span className="filter-info-tooltip-text">{tooltip}</span>
                    <span className="filter-info-tooltip-link">Click to see all indicators ↗</span>
                    <span className="filter-info-tooltip-arrow" />
                </span>
            )}
        </span>
    );
};

export default InfoTooltip;
