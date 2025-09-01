import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-muted/70 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg backdrop-blur-sm flex items-center justify-center group"
      aria-label="Volver arriba"
    >
      <ArrowUp size={20} className="group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
};

export default BackToTop;
