import React, { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Uncomment to re-enable dot navigation
import { getDimensionColor } from '../data/colors';

// Seeded pseudo-random number generator for deterministic but natural-looking placement
const seededRandom = (seed) => {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
};

const Radar = ({ tools, dimensions, size = 500, onDimClick }) => {
    // const navigate = useNavigate(); // Uncomment to re-enable dot navigation
    const [hoveredDim, setHoveredDim] = useState(null);

    const dimDescriptions = {
        'compatibility': 'Degree to which a product, system or component can exchange information with other products, systems or components, and/or perform its required functions while sharing the same common environment and resources.',
        'flexibility': 'Degree to which a product can be adapted to changes in its requirements, contexts of use or system environment.',
        'reliability': 'Degree to which a system, product or component performs specified functions under specified conditions for a specified period of time.',
        'sustainability': 'The capacity of the software to endure. In other words, sustainability means that the software will continue to be available in the future, on new platforms, meeting new needs.',
        'performance_efficiency': 'This characteristic represents the degree to which a product performs its functions within specified time and throughput parameters and is efficient in the use of resources (such as CPU, memory, storage, network devices, energy, materials...) under specified conditions.',
        'maintainability': 'This characteristic represents the degree of effectiveness and efficiency with which a product or system can be modified to improve it, correct it or adapt it to changes in environment, and in requirements.',
        'security': 'Degree to which a product or system defends against attack patterns by malicious actors and protects information and data so that persons or other products or systems have the degree of data access appropriate to their types and levels of authorization.',
        'reusability': 'Degree to which an asset can be used in more than one system, or in building other assets.',
        'fairness': 'FAIRness refers to the degree to which research software adheres to the FAIR principles: Findable, Accessible, Interoperable, and Reusable. These principles, adapted for research software, aim to enhance the discoverability, accessibility, interoperability, and reusability of software, thereby maximizing its value and impact in scientific research.',
        'functional_suitability': 'This characteristic represents the degree to which a product or system provides functions that meet stated and implied needs when used under specified conditions.',
        'interaction_capability': 'Degree to which a product or system can be interacted with by specified users to exchange information via the user interface to complete specific tasks in a variety of contexts of use.',
        'open_source_software': 'Open source software is software with source code that anyone can inspect, modify, and enhance.',
        'safety': 'This characteristic represents the degree to which a product under defined conditions avoids a state in which human life, health, property, or the environment is endangered.'
    };

    const center = size / 2;
    const radius = size / 2 - 100; // Padding for labels

    // Tier Configuration
    // Labels: individuals, research teams, communities (hidden but kept for layout logic)
    const tiers = [
        { id: 'rs:AnalysisCode', label: 'individuals', radiusRatio: 0.33 },
        { id: 'rs:PrototypeTool', label: 'research teams', radiusRatio: 0.66 },
        { id: 'rs:ResearchInfrastructureSoftware', label: 'communities', radiusRatio: 1.0 }
    ];

    // Helper to get coordinates
    const getCoordinates = (angle, dist) => {
        const rad = (angle - 90) * (Math.PI / 180);
        return {
            x: center + dist * Math.cos(rad),
            y: center + dist * Math.sin(rad)
        };
    };

    // Helper to create a sector path (wedge)
    const createSectorPath = (startAngle, endAngle, innerR, outerR) => {
        const start = getCoordinates(startAngle, outerR);
        const end = getCoordinates(endAngle, outerR);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            `M ${start.x} ${start.y}`,
            `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
            `L ${center} ${center}`,
            `Z`
        ].join(" ");
    };

    // Calculate details first to allow usage in render
    const sectorData = useMemo(() => {
        const sectorAngle = 360 / dimensions.length;
        return dimensions.map((dim, i) => {
            const startAngle = i * sectorAngle;
            const color = getDimensionColor(dim, dimensions);
            return {
                dim: dim.replace(/_/g, ' '),
                rawDim: dim,
                startAngle,
                endAngle: (i + 1) * sectorAngle,
                color,
                labelAngle: startAngle + (sectorAngle / 2)
            };
        });
    }, [dimensions]);

    // Calculate points using a seeded RNG to look natural but remain stable across renders
    const points = useMemo(() => {
        const pts = [];
        const sectorAngle = 360 / dimensions.length;

        // Group by [tierIndex][dimIndex]
        const grouped = Array(tiers.length).fill(0).map(() => Array(dimensions.length).fill(0).map(() => []));

        tools.forEach(tool => {
            // Determine Tier(s)
            let toolTiers = tool.applicationCategory
                ? (Array.isArray(tool.applicationCategory) ? tool.applicationCategory : [tool.applicationCategory])
                : [];

            let itemTiers = [];
            if (toolTiers.some(t => t['@id'] === 'rs:PrototypeTool')) itemTiers.push(1);
            if (toolTiers.some(t => t['@id'] === 'rs:ResearchInfrastructureSoftware')) itemTiers.push(2);
            if (toolTiers.some(t => t['@id'] === 'rs:AnalysisCode')) itemTiers.push(0);

            if (itemTiers.length === 0) return;

            // Determine Dimension(s)
            const toolDims = tool.hasQualityDimension
                ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                : [];

            itemTiers.forEach(tierIndex => {
                toolDims.forEach(dimObj => {
                    if (!dimObj['@id']) return;
                    const dimName = dimObj['@id'].replace('dim:', '');
                    const dimIndex = dimensions.indexOf(dimName);

                    if (dimIndex !== -1) {
                        grouped[tierIndex][dimIndex].push(tool);
                    }
                });
            });
        });

        // Place points with seeded randomness to avoid overlap
        grouped.forEach((tierGroups, tierIndex) => {
            const tier = tiers[tierIndex];
            const prevRadiusRatio = tierIndex === 0 ? 0.15 : tiers[tierIndex - 1].radiusRatio;
            const minR = prevRadiusRatio * radius;
            const maxR = tier.radiusRatio * radius;
            const rPadding = (maxR - minR) * 0.1;
            const availableR = (maxR - minR) - 2 * rPadding;

            tierGroups.forEach((dimTools, dimIndex) => {
                if (dimTools.length === 0) return;

                const startAngle = dimIndex * sectorAngle;
                const anglePadding = sectorAngle * 0.12;
                const availableAngle = sectorAngle - 2 * anglePadding;

                // Sort tools alphabetically for a deterministic seed basis
                dimTools.sort((a, b) => a.name.localeCompare(b.name));

                dimTools.forEach((tool, i) => {
                    const n = dimTools.length;
                    // Use tool name + position as seed for reproducible pseudo-randomness
                    const seed = tool.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), tierIndex * 1000 + dimIndex * 100 + i);
                    const rng = seededRandom(seed);

                    // Base angle spread evenly, then add a seeded ±25% jitter
                    const baseAngle = n > 1 ? (i / (n - 1)) * availableAngle : availableAngle / 2;
                    const jitterAngle = (rng() - 0.5) * (availableAngle / Math.max(n, 3));
                    const pointAngle = startAngle + anglePadding + baseAngle + jitterAngle;

                    // Stagger radius across 3 bands, then add small jitter within the band
                    const band = i % 3;
                    const bandSize = availableR / 3;
                    const rBase = minR + rPadding + band * bandSize + bandSize / 2;
                    const rJitter = (rng() - 0.5) * bandSize * 0.6;
                    const pointDist = rBase + rJitter;

                    pts.push({
                        x: center + pointDist * Math.cos((pointAngle - 90) * (Math.PI / 180)),
                        y: center + pointDist * Math.sin((pointAngle - 90) * (Math.PI / 180)),
                        tool: tool,
                        tierIndex: tierIndex,
                        color: getDimensionColor(dimensions[dimIndex], dimensions)
                    });
                });
            });
        });
        return pts;
    }, [tools, dimensions, radius, center, sectorData]);

    const handleSectorClick = (sector) => {
        if (onDimClick) {
            onDimClick(sector.rawDim);
        }
    };

    return (
        <div className="relative flex justify-center items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto drop-shadow-xl font-sans">

                {/* 1. Sector Backgrounds - clickable to filter by dimension */}
                {sectorData.map((sector, i) => (
                    <path
                        key={`sector-${i}`}
                        d={createSectorPath(sector.startAngle, sector.endAngle, 0, radius)}
                        fill={sector.color}
                        fillOpacity="0.12"
                        stroke="none"
                        className="transition-opacity duration-300 hover:fill-opacity-30 cursor-pointer"
                        onClick={() => handleSectorClick(sector)}
                        onMouseEnter={() => setHoveredDim({ name: sector.dim, originalData: sector.rawDim, x: center, y: center })}
                        onMouseLeave={() => setHoveredDim(null)}
                    />
                ))}

                {/* 2. Tier Divider Rings (Grid) */}
                {tiers.map((tier) => (
                    <circle
                        key={tier.id}
                        cx={center}
                        cy={center}
                        r={tier.radiusRatio * radius}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.4"
                        style={{ pointerEvents: 'none' }}
                    />
                ))}

                {/* 3. Dimension Divider Lines */}
                {sectorData.map((sector, i) => {
                    const coord = getCoordinates(sector.startAngle, radius);
                    return (
                        <line
                            key={`div-${i}`}
                            x1={center}
                            y1={center}
                            x2={coord.x}
                            y2={coord.y}
                            stroke="white"
                            strokeWidth="2"
                            strokeOpacity="0.8"
                            style={{ pointerEvents: 'none' }}
                        />
                    );
                })}

                {/* 4. Labels - Multi-line support, clickable */}
                {sectorData.map((sector, i) => {
                    const labelRadius = radius + 22;
                    const coord = getCoordinates(sector.labelAngle, labelRadius);
                    const words = sector.dim.split(' ');

                    let anchor = "middle";
                    const deg = sector.labelAngle % 360;
                    if (deg > 15 && deg < 165) anchor = "start";
                    else if (deg > 195 && deg < 345) anchor = "end";

                    return (
                        <g key={`label-${i}`}
                            onClick={() => handleSectorClick(sector)}
                            onMouseEnter={() => setHoveredDim({ name: sector.dim, originalData: sector.rawDim, x: coord.x, y: coord.y })}
                            onMouseLeave={() => setHoveredDim(null)}
                            style={{ cursor: 'pointer' }}
                            className="transition-opacity hover:opacity-80"
                        >
                            <text
                                x={coord.x}
                                y={coord.y}
                                textAnchor={anchor}
                                dominantBaseline="middle"
                                className="text-[13px] font-bold uppercase tracking-tight"
                                fill={sector.color}
                                style={{
                                    textShadow: '0 1px 2px rgba(255,255,255,1)',
                                    pointerEvents: 'none'
                                }}
                            >
                                {words.map((word, idx) => (
                                    <tspan
                                        key={idx}
                                        x={coord.x}
                                        dy={idx === 0 ? (words.length > 1 ? "-0.4em" : "0") : "1.1em"}
                                    >
                                        {word}
                                    </tspan>
                                ))}
                            </text>
                        </g>
                    );
                })}

                {/* 5. Points - dots are non-clickable, showing density only */}
                {/* To re-enable per-tool navigation: add onClick={() => navigate(`/tool/${pt.tool._filename}`)} and className="cursor-pointer" to the <g> */}
                {points.map((pt, i) => (
                    <g key={i} style={{ pointerEvents: 'none' }}>
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={2.5}
                            fill={pt.color}
                            stroke="white"
                            strokeWidth="1"
                            className="drop-shadow-sm"
                        />
                    </g>
                ))}

                {/* 6. Tier Labels - HIDDEN per user request */}
                {/* To re-enable tier labels, uncomment the block below:
                {tiers.map((tier, i) => (
                    <g key={`tier-label-${i}`} className="pointer-events-none">
                        <text
                            x={center}
                            y={center - (tier.radiusRatio * radius) + 12}
                            textAnchor="middle"
                            className="text-[10px] font-extrabold fill-slate-800 uppercase tracking-widest"
                            style={{ textShadow: '0 2px 4px rgba(255,255,255,0.9)' }}
                        >
                            {tier.label}
                        </text>
                    </g>
                ))}
                */}

            </svg>

            {/* Dimension Tooltip */}
            {hoveredDim && (
                <div
                    className="absolute z-30 pointer-events-none"
                    style={{
                        left: hoveredDim.x,
                        top: hoveredDim.y,
                        transform: 'translate(-50%, -120%)'
                    }}
                >
                    <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-md max-w-[340px] text-center w-max">
                        <p className="font-bold text-base mb-2 uppercase tracking-wide">{hoveredDim.name}</p>
                        <p className="text-slate-200 text-[13px] leading-relaxed break-words normal-case">
                            {dimDescriptions[hoveredDim.originalData] || 'Quality dimension metric.'}
                        </p>
                        <p className="text-sky-400 text-[11px] font-medium mt-3 border-t border-slate-700/50 pt-2">Click to filter catalog</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Radar;
