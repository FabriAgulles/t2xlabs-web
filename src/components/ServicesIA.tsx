import React, { useState, useRef, useEffect } from 'react';
import { Workflow, Bot, Mail, Network } from 'lucide-react';

interface ServiceData {
  icon: React.ReactNode;
  title: string;
  description: string;
  visual: string;
  features: string[];
  color: string;
}

const services: ServiceData[] = [
  {
    icon: <Workflow className="w-8 h-8" />,
    title: "AUTOMATIZACIÓN DE PROCESOS CON N8N + APIS",
    description: "Conecta todas tus herramientas en flujos inteligentes",
    visual: "Diagrama de workflow con datos fluyendo",
    features: [
      "Flujos de trabajo automatizados",
      "Integración entre aplicaciones",
      "Reducción de errores manuales",
      "Escalabilidad automática"
    ],
    color: "neon-cyan"
  },
  {
    icon: <Bot className="w-8 h-8" />,
    title: "AGENTES Y CHATBOTS CON IA",
    description: "Asistentes que entienden tu negocio y atienden 24/7",
    visual: "Interface de chat con respuestas contextuales",
    features: [
      "Atención al cliente 24/7",
      "Respuestas contextuales",
      "Aprendizaje continuo",
      "Integración con CRM"
    ],
    color: "matrix-green"
  },
  {
    icon: <Mail className="w-8 h-8" />,
    title: "EMAIL Y COMUNICACIÓN AUTOMATIZADA",
    description: "Mensajes personalizados con IA que se envían en el momento perfecto",
    visual: "Templates de email adaptándose al usuario",
    features: [
      "Personalización inteligente",
      "Timing optimizado",
      "Segmentación automática",
      "Métricas avanzadas"
    ],
    color: "plasma-purple"
  },
  {
    icon: <Network className="w-8 h-8" />,
    title: "INTEGRACIÓN ENTRE TUS SISTEMAS",
    description: "Todas tus apps trabajando como una sola plataforma",
    visual: "Red de aplicaciones sincronizándose en tiempo real",
    features: [
      "Sincronización en tiempo real",
      "API unificada",
      "Dashboard centralizado",
      "Monitoreo continuo"
    ],
    color: "energy-yellow"
  }
];

const ServicesIA = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const getCardTransform = (index: number) => {
    if (hoveredCard === index) {
      const offsetX = Math.max(-5, Math.min(5, (mousePosition.x - 300) / 60));
      const offsetY = Math.max(-5, Math.min(5, (mousePosition.y - 200) / 60));
      return `perspective(1000px) rotateX(${-offsetY}deg) rotateY(${offsetX}deg) translateZ(8px)`;
    }
    return 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-deep-space/30 relative overflow-hidden">
      <div className="container mx-auto px-6" ref={containerRef}>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-cosmic">
              SERVICIOS IA
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Tecnología que reduce costos y multiplica tus ventas
          </p>
        </div>

        {/* Services Grid with Perspective Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="card-3d bg-gradient-card border border-card-border rounded-xl p-8 relative group cursor-pointer"
              style={{ 
                transform: getCardTransform(index),
                transition: 'transform 0.3s ease-out'
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {/* Workflow Diagram Animation for Card 1 */}
                {index === 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
                      <div className="w-8 h-0.5 bg-neon-cyan/50"></div>
                      <div className="w-3 h-3 bg-matrix-green rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                )}

                {/* Chat Interface Animation for Card 2 */}
                {index === 1 && (
                  <div className="absolute bottom-4 right-4 space-y-2">
                    <div className="bg-matrix-green/20 rounded-lg p-2 max-w-20">
                      <div className="h-2 bg-matrix-green/60 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-neon-cyan/20 rounded-lg p-2 max-w-16 ml-auto">
                      <div className="h-2 bg-neon-cyan/60 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                )}

                {/* Email Templates Animation for Card 3 */}
                {index === 2 && (
                  <div className="absolute top-4 right-4">
                    <div className="space-y-1">
                      <div className="w-12 h-1 bg-plasma-purple/60 rounded animate-pulse"></div>
                      <div className="w-8 h-1 bg-plasma-purple/40 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-10 h-1 bg-plasma-purple/50 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}

                {/* Network Sync Animation for Card 4 */}
                {index === 3 && (
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <div className="w-4 h-4 bg-energy-yellow rounded-full animate-ping"></div>
                      <div className="absolute top-0 left-0 w-4 h-4 bg-energy-yellow rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-${service.color}/10 border border-${service.color}/30 mb-6 group-hover:animate-glow-pulse`}>
                <div className={`text-${service.color}`}>
                  {service.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-neon-cyan transition-colors">
                {service.title}
              </h3>
              
              <p className="text-foreground/80 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Visual Description */}
              <div className="bg-deep-space/50 rounded-lg p-3 mb-6 border border-neon-cyan/20">
                <p className="text-sm text-neon-cyan font-mono">
                  {service.visual}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-foreground/70">
                    <div className={`w-2 h-2 bg-${service.color} rounded-full mr-3 animate-pulse`} 
                         style={{ animationDelay: `${featureIndex * 0.2}s` }}></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-${service.color}/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-foreground/70 mb-6">
            ¿Cuál de estos servicios transformaría tu negocio?
          </p>
          <button 
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-gradient-cosmic border border-neon-cyan rounded-lg text-foreground font-semibold hover:shadow-glow-cyan transition-all duration-300 hover:scale-105"
          >
            SOLICITAR CONSULTA GRATUITA
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesIA;
