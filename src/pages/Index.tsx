import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CompetitiveAdvantages from '@/components/CompetitiveAdvantages';
import ServicesIA from '@/components/ServicesIA';
import ClientsTimeline from '@/components/ClientsTimeline';
import ContactForm from '@/components/ContactForm';
import FooterSection from '@/components/FooterSection';
import CustomCursor from '@/components/CustomCursor';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-x-hidden custom-cursor">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      
      {/* Custom Cursor */}
      <CustomCursor />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative z-10">
        <div id="hero">
          <HeroSection />
        </div>
        <div id="advantages">
          <CompetitiveAdvantages />
        </div>
        <div id="services">
          <ServicesIA />
        </div>
        <div id="clients">
          <ClientsTimeline />
        </div>
        <div id="contact">
          <ContactForm />
        </div>
        <FooterSection />
      </main>
    </div>
  );
};

export default Index;