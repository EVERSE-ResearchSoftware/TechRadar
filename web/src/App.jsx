import React, { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolDetail from './pages/ToolDetail';
import CompareTools from './pages/CompareTools';
import About from './pages/About';

function MatomoTracker() {
  const { pathname, search, hash } = useLocation();
  const previousPage = useRef(`${pathname}${search}${hash}`);

  useEffect(() => {
    const currentPage = `${pathname}${search}${hash}`;
    if (currentPage === previousPage.current) return;

    previousPage.current = currentPage;
    window._paq = window._paq || [];
    window._paq.push(['setCustomUrl', window.location.href]);
    window._paq.push(['trackPageView']);
  }, [pathname, search, hash]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HashRouter>
      <MatomoTracker />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tool/:id" element={<ToolDetail />} />
          <Route path="compare" element={<CompareTools />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
