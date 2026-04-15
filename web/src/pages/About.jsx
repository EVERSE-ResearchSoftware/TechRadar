import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail } from 'lucide-react';

const teamMembers = [
    {
        name: 'Thomas Vuillaume',
        org: 'LAPP, CNRS',
        email: 'thomas.vuillaume@lapp.in2p3.fr',
        orcid: 'https://orcid.org/0000-0002-5686-2078',
        image: '/images/team_images/thomas_vuillaume.jpg',
    },
    {
        name: 'Shraddha Bajare',
        org: 'Square Kilometre Array Observatory',
        email: 'shraddha.bajare@skao.int',
        image: '/images/team_images/roundedshraddha.jpg',
    },
    {
        name: 'Nikos Pechlivanis',
        org: 'Centre for Research and Technology Hellas',
        email: 'nikosp41@certh.gr',
        orcid: 'https://orcid.org/0000-0003-2502-612X',
        image: '/images/team_images/roundednikos.jpg',
    },
    {
        name: 'Faruk Diblen',
        org: 'Netherlands eScience Center',
        orcid: 'https://orcid.org/0000-0002-0989-929X',
        image: '/images/team_images/faruk_diblen.jpg',
    },
    {
        name: 'Azza Gamgami',
        org: 'LAPP, CNRS',
        email: 'azza.gamgami@lapp.in2p3.fr',
        orcid: 'https://orcid.org/0009-0003-7084-3900',
        image: '/images/team_images/roundedazza.jpg',
    },
    {
        name: 'Elena Breitmoser',
        org: 'University of Edinburgh',
        email: 'e.breitmoser@epcc.ed.ac.uk',
        orcid: 'https://orcid.org/0000-0003-1295-9326',
        image: '/images/team_images/roundedelena.jpg',
    },
    {
        name: 'Srobona Ghosh',
        org: 'Helmholtz-Zentrum Dresden-Rossendorf',
        email: 'srobona.ghosh@hzdr.de',
        orcid: 'https://orcid.org/0009-0008-9084-064X',
        image: '/images/team_images/roundedsrobona1.png',
    },
    {
        name: 'Daniel Garijo',
        org: 'Universidad Politecnica de Madrid',
        email: 'daniel.garijo@upm.es',
        orcid: 'https://orcid.org/0000-0003-0454-7145',
        image: '/images/team_images/roundeddaniel.png',
    },
];

const segments = [
    { name: 'Compatibility', desc: 'Tools that assess how well a product can exchange information and operate within shared environments.' },
    { name: 'FAIRness', desc: 'Tools that evaluate alignment with FAIR principles: Findable, Accessible, Interoperable, and Reusable.' },
    { name: 'Flexibility', desc: 'Tools that assess how well a product adapts to changing requirements or system environments.' },
    { name: 'Functional Suitability', desc: 'Tools that assess how well a product supports users in achieving their specified goals.' },
    { name: 'Interaction Capability', desc: 'Tools that assess how effectively users can interact with a product to achieve their goals.' },
    { name: 'Maintainability', desc: 'Tools that evaluate how efficiently a product can be modified, corrected, or adapted.' },
    { name: 'Performance Efficiency', desc: 'Tools that measure time, throughput, and resource utilisation under defined conditions.' },
    { name: 'Reliability', desc: 'Tools that assess how consistently a system performs its specified functions over time.' },
    { name: 'Safety', desc: 'Tools that evaluate how well a product avoids situations that could endanger life, health, or the environment.' },
    { name: 'Security', desc: 'Tools that measure how well a product defends against attacks and manages data access appropriately.' },
    { name: 'Sustainability', desc: 'Tools that assess software longevity and its ability to meet evolving needs over time.' },
];

const rings = [
    { name: 'Analysis Code', desc: 'Scripts and notebooks used for exploratory or one-off analyses.' },
    { name: 'Prototype Tools', desc: 'More structured software shared within a research group or community.' },
    { name: 'Research Infrastructure Software', desc: 'Mature, widely-used software underpinning research infrastructure.' },
];

const About = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 py-8">

            {/* Hero */}
            <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 leading-tight">
                    About the TechRadar
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                    The EVERSE Technology Radar is developed as part of the{' '}
                    <a href="https://everse.software/" target="_blank" rel="noreferrer"
                        className="text-sky-600 hover:text-sky-700 underline underline-offset-2">
                        EVERSE
                    </a>{' '}
                    project to collect and classify tools and services that can measure or improve Research Software Quality.
                    {/* In its latest version (TechRadar v2), it has evolved into an interactive web platform providing a dynamic way to explore, filter, and inspect tools — beyond a static visual dashboard. */}
                </p>
            </div>

            {/* What is it */}
            <div className="glass-panel p-8 space-y-4">
                <h2 className="text-2xl font-semibold text-slate-800">What is the EVERSE Technology Radar?</h2>
                <p className="text-slate-600 leading-relaxed">
                    The TechRadar combines a curated catalogue of tools and services with an interactive visual radar
                    interface to support research software quality. It allows users to:
                </p>
                <ul className="space-y-2 text-slate-600">
                    {[
                        'Explore tools and services mapped to specific quality dimensions',
                        'Filter and navigate by software tier or category',
                        'Inspect detailed information about each tool or service',
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
                <p className="text-slate-500 text-sm pt-2">
                    The radar does not aim to cover all existing tools — it highlights tools that have been community-vetted
                    and curated based on established criteria.
                </p>
            </div>

            {/* Segments */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800">Segments</h2>
                    <p className="text-slate-500 mt-1">
                        Radar segments map the{' '}
                        <a href="https://everse.software/indicators/website/dimensions.html"
                            target="_blank" rel="noreferrer"
                            className="text-sky-600 hover:text-sky-700 underline underline-offset-2">
                            EVERSE Quality Dimensions
                        </a>.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {segments.map((seg) => (
                        <div key={seg.name} className="glass-panel p-5 space-y-1">
                            <h3 className="font-semibold text-sky-700">{seg.name}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{seg.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rings */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800">Rings</h2>
                    <p className="text-slate-500 mt-1">
                        Rings reflect the{' '}
                        <a href="https://everse.software/RSQKit/three_tier_view"
                            target="_blank" rel="noreferrer"
                            className="text-sky-600 hover:text-sky-700 underline underline-offset-2">
                            three-tier model of research software
                        </a>.
                        Not all research software needs to meet the same quality requirements.
                        If a tool applies to multiple tiers, it is placed in the <strong>lowest applicable tier</strong>.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {rings.map((ring, i) => (
                        <div key={ring.name} className="glass-panel p-5 flex gap-4 items-start">
                            <span className="text-2xl font-bold text-sky-200 select-none">{i + 1}</span>
                            <div>
                                <h3 className="font-semibold text-slate-800">{ring.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{ring.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contributing */}
            <div className="glass-panel p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-800">Contributing</h2>
                    <p className="text-slate-600 leading-relaxed max-w-xl">
                        The TechRadar is a community-driven initiative. Anyone can suggest a new tool or service —
                        all submissions are reviewed by the curation team before addition.
                    </p>
                </div>
                <a
                    href="https://github.com/EVERSE-ResearchSoftware/TechRadar/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-sky-200"
                >
                    Contributing Guidelines
                    <ExternalLink size={16} />
                </a>
            </div>

            {/* Curation Team */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-800">Curation Team</h2>
                <p className="text-slate-500">
                    The curation team reviews and maintains the quality tools and services catalogued in the TechRadar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member) => (
                        <div key={member.name} className="glass-panel p-6 flex flex-col items-center text-center gap-3">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-sky-100"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div>
                                <p className="font-semibold text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{member.org}</p>
                            </div>
                            <div className="flex gap-3 mt-auto pt-1">
                                {member.email && (
                                    <a href={`mailto:${member.email}`}
                                        className="text-slate-400 hover:text-sky-600 transition-colors"
                                        title={member.email}>
                                        <Mail size={16} />
                                    </a>
                                )}
                                {member.orcid && (
                                    <a href={member.orcid} target="_blank" rel="noreferrer"
                                        className="text-slate-400 hover:text-sky-600 transition-colors text-xs font-semibold"
                                        title="ORCID">
                                        iD
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default About;
