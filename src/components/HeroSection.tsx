import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

const HeroSection = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);
  
  const mainText = "LA REVOLUCIÓN YA COMENZÓ.\nDECIDE DE QUÉ LADO ESTAR.";
  
  useEffect(() => {
    if (currentIndex < mainText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + mainText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      
      return () => clearTimeout(timeout);
    } else {
      // Show subtitle after typewriter effect
      setTimeout(() => setShowSubtitle(true), 500);
    }
  }, [currentIndex, mainText]);

  const scrollToContact = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToClients = () => {
    document.getElementById('clients-timeline')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden particles energy-waves">
      {/* Geometric 3D Center Element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 border border-neon-cyan/30 transform rotate-45 animate-rotate-slow">
          <div className="w-full h-full border border-plasma-purple/30 transform -rotate-45 animate-float">
            <div className="w-full h-full bg-gradient-cosmic opacity-10 animate-glow-pulse"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Main Title with Typewriter Effect */}
        <div className="mb-8"
          style={{ marginTop: "20px", paddingTop: "30px" }}>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold leading-tight">
            <span className="bg-clip-text bg-gradient-cosmic font-display">
              {displayedText.split('\n').map((line, index) => (
                <div key={index} className={index === 1 ? 'mt-4' : ''}>
                  {line}
                  {index === displayedText.split('\n').length - 1 && currentIndex < mainText.length && (
                    <span className="inline-block w-1 h-16 bg-matrix-green ml-2 animate-pulse"></span>
                  )}
                </div>
              ))}
            </span>
          </h1>
        </div>

        {/* Subtitle with Delay Animation */}
        <div className={`transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto mb-12 leading-relaxed">
            En <span className="font-semibold" style={{color: '#1C90ED'}}>t2xlabs</span> transformamos empresas mediante automatizaciones e inteligencia artificial. 
            No somos el futuro. <span className="text-matrix-green font-semibold">Somos el presente</span> que tus competidores aún no entienden.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={scrollToContact}
              className="group bg-gradient-cosmic border border-neon-cyan text-foreground px-4 py-4 text-lg font-semibold rounded-lg hover:shadow-glow-cyan transition-all duration-300 hover:scale-105"
            >
              <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              INICIAR TRANSFORMACIÓN
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              onClick={scrollToClients}
              variant="outline"
              className="border-2 border-matrix-green/50 text-matrix-green bg-transparent px-4 py-4 text-lg font-semibold rounded-lg hover:bg-matrix-green/10 hover:shadow-glow-matrix transition-all duration-300"
            >
              VER CASOS DE ÉXITO
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neon-cyan mb-2">80%</div>
              <div className="text-foreground/70">Reducción en tareas manuales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-matrix-green mb-2">300%</div>
              <div className="text-foreground/70">ROI típico primer año</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-plasma-purple mb-2">24/7</div>
              <div className="text-foreground/70">Atención automatizada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-cyan rounded-full opacity-60 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-matrix-green rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-plasma-purple rounded-full opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};

export default HeroSection;
