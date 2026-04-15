import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SuggestToolForm from './SuggestToolForm';

const GitHubIcon = ({ size = 20, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
    >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.9.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.19.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.4.98 0 1.97.13 2.89.4 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.8.56 4.55-1.52 7.84-5.82 7.84-10.9C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
);

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
                    <Link to="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                        About
                    </Link>
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
                        <GitHubIcon size={20} />
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
                                <GitHubIcon size={20} />
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
