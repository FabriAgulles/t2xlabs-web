import React, { Suspense, lazy, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';

// Lazy load components below the fold for better initial load performance
const CompetitiveAdvantages = lazy(() => import('@/components/CompetitiveAdvantages'));
const ServicesIA = lazy(() => import('@/components/ServicesIA'));
const ClientsTimeline = lazy(() => import('@/components/ClientsTimeline'));
const ContactForm = lazy(() => import('@/components/ContactForm'));
const FooterSection = lazy(() => import('@/components/FooterSection'));
const CustomCursor = lazy(() => import('@/components/CustomCursor'));
const BackToTop = lazy(() => import('@/components/BackToTop'));
const CookieConsent = lazy(() => import('@/components/CookieConsent'));

// Minimal loading component for better UX
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-x-hidden custom-cursor">
      {/* Skip to content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-neon-cyan focus:text-space-black focus:rounded-lg focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>

      {/* Custom Cursor - Lazy loaded */}
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>

      {/* Header - Critical, loaded immediately */}
      <Header />

      {/* Main Content */}
      <main id="main-content" className="relative z-10">
        {/* Hero Section - Critical, loaded immediately */}
        <div id="hero">
          <HeroSection />
        </div>

        {/* Below-the-fold sections - Lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <div id="advantages">
            <CompetitiveAdvantages />
          </div>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <div id="services">
            <ServicesIA />
          </div>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <div id="clients">
            <ClientsTimeline />
          </div>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <div id="contact">
            <ContactForm />
          </div>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FooterSection />
        </Suspense>
      </main>

      {/* Utility components - Lazy loaded */}
      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>

      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
