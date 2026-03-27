import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Github, Menu, X } from 'lucide-react';
import SuggestToolForm from './SuggestToolForm';

const Layout = () => {
    const [showSuggestForm, setShowSuggestForm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="glass-panel sticky top-4 z-50 mt-4 mb-0 px-4 md:px-6 py-4 flex items-center justify-between w-[calc(100%-2rem)] max-w-[1168px] mx-auto">
                <Link to="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity group min-w-0 flex-shrink">
                    <img src="https://everse.software/images/logos/EOSCEverse_PosColour_full.svg" alt="EVERSE Logo" className="h-8 md:h-10 flex-shrink-0" />
                    <span className="text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="text-indigo-600">Tech</span>
                        <span className="text-sky-600">Radar</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                        About
                    </a>
                    <button
                        onClick={() => { setShowSuggestForm(true); closeMenu(); }}
                        className="text-slate-600 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer font-inherit text-inherit"
                    >
                        Suggest a new tool
                    </button>
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

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 mx-0 p-4 md:hidden animate-in slide-in-from-top-4 duration-200">
                        <div className="glass-panel p-6 flex flex-col gap-4 shadow-xl border border-slate-200/60 bg-white/95 backdrop-blur-md">
                            <a href="#" onClick={closeMenu} className="text-lg font-medium text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100 last:border-0">
                                About
                            </a>
                            <button
                                onClick={() => { setShowSuggestForm(true); closeMenu(); }}
                                className="text-left text-lg font-medium text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100 last:border-0 bg-transparent border-none cursor-pointer font-inherit"
                            >
                                Suggest a new tool
                            </button>
                            <a
                                href="https://github.com/EVERSE-ResearchSoftware/TechRadar"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeMenu}
                                className="flex items-center gap-2 text-lg font-medium text-slate-700 hover:text-indigo-600 py-2"
                            >
                                <Github size={20} />
                                GitHub Repository
                            </a>
                        </div>
                    </div>
                )}
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
                            className="h-10 opacity-90 object-contain"
                        />
                    </div>
                </div>
            </footer>

            <SuggestToolForm isOpen={showSuggestForm} onClose={() => setShowSuggestForm(false)} />
        </div>
    );
};

export default Layout;
