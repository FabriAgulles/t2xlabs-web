import React, { useState } from 'react';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 bg-space-transparent/80">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center">
            {/* Logo */}
            <div className="relative group">
              <img 
                src="https://imgur.com/8RDlmvu.png" 
                alt="t2xLabs Logo" 
                className="h-16 w-auto group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback text logo */}
              <div className="hidden">
                <div className="text-2xl font-bold">
                  <span className="text-transparent bg-clip-text bg-gradient-cosmic">t2xLabs</span>
                </div>
              </div>
              
              {/* Logo glow effect */}
              <div className="absolute inset-0 blur-xl bg-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
    </>
  );
};

export default Header;