import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onToggle }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      onToggle(); // Close menu after navigation
    }
  };

  const menuItems = [
    { label: 'Inicio', id: 'hero' },
    { label: 'Ventajas', id: 'advantages' },
    { label: 'Servicios', id: 'services' },
    { label: 'Proyectos Destacados', id: 'clients' },
    { label: 'Contacto', id: 'contact' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-[100] p-3 bg-gradient-card border border-neon-cyan/30 rounded-xl backdrop-blur-sm hover:border-neon-cyan transition-all duration-300 hover:shadow-glow-cyan"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <Menu 
            className={`absolute inset-0 text-neon-cyan transition-all duration-300 ${
              isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
            }`}
            size={24}
          />
          <X 
            className={`absolute inset-0 text-neon-cyan transition-all duration-300 ${
              isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
            }`}
            size={24}
          />
        </div>
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[90] backdrop-blur-sm bg-space-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onToggle}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-[95] bg-gradient-card border-l border-neon-cyan/30 backdrop-blur-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          {/* Navigation Menu */}
          <nav className="flex-1">
            <ul className="space-y-6">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left py-4 px-6 text-lg font-medium text-foreground hover:text-neon-cyan transition-colors duration-300 hover:bg-neon-cyan/10 rounded-xl border border-transparent hover:border-neon-cyan/20"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="pb-8">
            <div className="text-center text-sm text-muted-foreground">
              <span className="text-transparent bg-clip-text bg-gradient-cosmic">t2xLabs</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
