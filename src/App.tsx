import React, { useState, useEffect } from 'react';
import { PortfolioData } from './types/portfolio';
import { getPublishedData, getDraftData, saveDraftData } from './services/portfolioStorage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { VideoSection } from './components/VideoSection';
import { AppsSection } from './components/AppsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/Admin/AdminModal';

export default function App() {
  const [data, setData] = useState<PortfolioData>(() => getPublishedData());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('mohit_portfolio_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync theme to root class
  useEffect(() => {
    try {
      localStorage.setItem('mohit_portfolio_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Apply themeConfig CSS variables (accent color, font family)
  useEffect(() => {
    if (data.themeConfig) {
      document.documentElement.style.setProperty('--accent-mint', data.themeConfig.accentColor || '#2dd4bf');
    }
  }, [data.themeConfig]);

  // Check URL hash / path for /admin or #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || path.endsWith('/admin')) {
        setIsAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  // Listen to published updates
  useEffect(() => {
    const handleUpdate = () => {
      setData(getPublishedData());
    };
    window.addEventListener('mohit_portfolio_published_updated', handleUpdate);
    return () => window.removeEventListener('mohit_portfolio_published_updated', handleUpdate);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    window.location.hash = 'admin';
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const getFontFamilyClass = () => {
    switch (data.themeConfig?.fontFamily) {
      case 'outfit':
        return 'font-["Outfit",sans-serif]';
      case 'inter':
        return 'font-["Inter",sans-serif]';
      case 'urbanist':
        return 'font-["Urbanist",sans-serif]';
      case 'manrope':
        return 'font-["Manrope",sans-serif]';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-["Plus_Jakarta_Sans",sans-serif]';
    }
  };

  const sections = data.sectionsConfig || {
    hero: { visible: true, order: 1 },
    work: { visible: true, order: 2 },
    videos: { visible: true, order: 3 },
    apps: { visible: true, order: 4 },
    about: { visible: true, order: 5 },
    contact: { visible: true, order: 6 },
    footer: { visible: true, order: 7 }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-teal-500/30 selection:text-teal-300 ${getFontFamilyClass()}`}>
      {/* Sticky Header with exactly ONE single admin button situated in Footer */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAdmin={handleOpenAdmin}
      />

      <main>
        {/* Hero Section */}
        {sections.hero.visible !== false && (
          <Hero
            profile={data.profile}
            animationConfig={data.animationConfig}
            onExploreClick={() => scrollToSection('work')}
            onConnectClick={() => scrollToSection('contact')}
          />
        )}

        {/* Projects Showcase */}
        {sections.work.visible !== false && (
          <ProjectsSection
            projects={data.projects}
            headingOverride={sections.work.headingOverride}
            onOpenAdmin={handleOpenAdmin}
          />
        )}

        {/* Video Editing & Motion Showcase */}
        {sections.videos.visible !== false && (
          <VideoSection
            videos={data.videos}
            headingOverride={sections.videos.headingOverride}
            onOpenAdmin={handleOpenAdmin}
          />
        )}

        {/* Android Apps & APK Releases */}
        {sections.apps.visible !== false && (
          <AppsSection
            apps={data.apps}
            headingOverride={sections.apps.headingOverride}
            onOpenAdmin={handleOpenAdmin}
          />
        )}

        {/* About & Competencies */}
        {sections.about.visible !== false && (
          <AboutSection
            profile={data.profile}
            headingOverride={sections.about.headingOverride}
            onOpenAdmin={handleOpenAdmin}
          />
        )}

        {/* Contact / Let's Connect */}
        {sections.contact.visible !== false && (
          <ContactSection
            profile={data.profile}
            headingOverride={sections.contact.headingOverride}
            onOpenAdmin={handleOpenAdmin}
          />
        )}
      </main>

      {/* Footer with the single discreet Admin entry point */}
      {sections.footer.visible !== false && (
        <Footer onOpenAdmin={handleOpenAdmin} />
      )}

      {/* Admin Management Modal & Visual Website Editor */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        portfolioData={data}
        onUpdatePortfolio={(updated) => setData(updated)}
      />
    </div>
  );
}
