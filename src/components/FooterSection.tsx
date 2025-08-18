import React from 'react';
import { MapPin, Linkedin, Mail, Heart } from 'lucide-react';

const FooterSection = () => {
  return (
    <footer className="py-16 bg-gradient-to-t from-space-black to-deep-space border-t border-neon-cyan/20">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Logo and Description */}
          <div className="space-y-6">
            {/* Floating Logo */}
            <div className="relative group">
              <img 
                src="https://imgur.com/8RDlmvu.png" 
                alt="t2xLabs Logo" 
                className="h-16 w-auto animate-float group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback text logo */}
              <div className="hidden">
                <div className="text-3xl font-bold">
                  <span className="text-transparent bg-clip-text bg-gradient-cosmic">t2xLabs</span>
                </div>
              </div>
              
              {/* Levitation effect glow */}
              <div className="absolute inset-0 blur-xl bg-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <p className="text-foreground/70 leading-relaxed">
              Transformamos empresas mediante automatizaciones e inteligencia artificial. 
              <span className="text-neon-cyan"> El futuro es ahora.</span>
            </p>

            {/* Glitch Effect on Mission Statement */}
            <div className="text-sm text-matrix-green font-mono">
              <span className="glitch" data-text="MISSION: ACCELERATE HUMAN POTENTIAL">
                MISSION: ACCELERATE HUMAN POTENTIAL
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Coordenadas de Base
            </h3>
            
            <div className="space-y-4">
              {/* Barcelona Coordinates */}
              <div className="flex items-center space-x-3 group">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                <span className="text-foreground/80 font-mono">
                  41.3851° N, 2.1734° E
                </span>
                <span className="text-foreground/60 text-sm">Barcelona, España</span>
              </div>

              {/* LinkedIn with transmission effect */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <Linkedin className="h-5 w-5 text-plasma-purple group-hover:animate-pulse" />
                <a 
                  href="https://www.linkedin.com/in/fabricio-agulles-projectmanager" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-plasma-purple transition-colors duration-300"
                >
                  Fabricio Agulles - Project Manager
                </a>
              </div>

              {/* Email with digitization effect */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <Mail className="h-5 w-5 text-matrix-green group-hover:animate-pulse" />
                <a 
                  href="mailto:t2xlabs@gmail.com"
                  className="text-foreground/80 hover:text-matrix-green transition-colors duration-300 font-mono"
                >
                  t2xlabs@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Future Timeline */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-neon-cyan mb-4">
              Estado de la Revolución
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-deep-space/50 rounded-lg border border-matrix-green/30">
                <span className="text-sm text-foreground/80">IA Implementation</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-deep-space/50 rounded-lg border border-neon-cyan/30">
                <span className="text-sm text-foreground/80">Automation Level</span>
                <span className="text-neon-cyan font-bold">98.7%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-deep-space/50 rounded-lg border border-plasma-purple/30">
                <span className="text-sm text-foreground/80">Future Status</span>
                <span className="text-plasma-purple font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider with Energy Effect */}
        <div className="relative my-12">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-neon-cyan rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-3 h-3 bg-neon-cyan rounded-full"></div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright with Future Date */}
          <div className="text-foreground/60 text-sm font-mono">
            © 2025 t2xLabs. Todos los derechos reservados. | Future-Powered Technology
          </div>

          {/* Made with Love */}
          <div className="flex items-center space-x-2 text-foreground/60 text-sm">
            <span>Hecho con</span>
            <Heart className="h-4 w-4 text-energy-yellow animate-pulse" />
            <span>y tecnología del 2025</span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
            <span className="text-xs text-matrix-green font-mono">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute bottom-10 left-10 w-1 h-1 bg-neon-cyan rounded-full opacity-60 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-matrix-green rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-plasma-purple rounded-full opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </footer>
  );
};

export default FooterSection;