import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Github } from 'lucide-react';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="glass-panel sticky top-4 z-50 mx-4 mt-4 mb-0 px-6 py-4 flex items-center justify-between max-w-7xl xl:mx-auto w-full">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                    <img src="https://everse.software/images/logos/EOSCEverse_PosColour_full.svg" alt="EVERSE Logo" className="h-10" />
                    <span className="text-2xl font-bold tracking-tight">
                        <span className="text-indigo-600">Tech</span>
                        <span className="text-sky-600">Radar</span>
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                        About
                    </a>
                    <a href="https://github.com/EVERSE-ResearchSoftware/TechRadar/issues/new" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Suggest a new tool
                    </a>
                    <a
                        href="https://github.com/EVERSE-ResearchSoftware/TechRadar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-black/5 transition-colors"
                        title="GitHub"
                    >
                        <Github size={20} />
                    </a>
                </nav>
            </header>

            <main className="flex-1 container mx-auto px-4 pb-12">
                <Outlet />
            </main>

            <footer className="mt-auto py-12 px-6 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm w-full">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4 max-w-xl text-center md:text-left">
                        <p className="text-slate-600 leading-relaxed text-sm">
                            EVERSE TechRadar is being developed as part of the EVERSE project. EVERSE is funded by the European Commission HORIZON-INFRA-2023-EOSC-01-02.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-medium">
                            <a
                                href="https://github.com/EVERSE-ResearchSoftware/TechRadar/blob/main/CONTRIBUTING.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-700 hover:text-sky-900 transition-colors"
                            >
                                Contributing Guidelines
                            </a>
                            <span className="text-slate-300 hidden md:inline">|</span>
                            <a
                                href="https://everse.software/privacy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-700 hover:text-sky-900 transition-colors"
                            >
                                Privacy Policy
                            </a>
                        </div>
                        <p className="text-slate-400 text-xs mt-2">© {new Date().getFullYear()} EVERSE. All rights reserved.</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                        <img
                            src="https://everse.software/RSQKit/assets/img/EN_FundedbytheEU_RGB_Monochrome.png"
                            alt="Funded by the European Union"
                            className="h-16 opacity-90 object-contain"
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
