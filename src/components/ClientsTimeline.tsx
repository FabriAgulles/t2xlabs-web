import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, TrendingUp, Users, Mail, Database, Sparkles } from 'lucide-react';

interface ProjectData {
  icon: React.ReactNode;
  title: string;
  description: string;
  impact: string;
  metric: string;
  color: string;
}

const projects: ProjectData[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Atención al Cliente",
    description: "Agente de IA entrenado con documentación y FAQs de la empresa para atender consultas y gestiones por chat a los usuarios 24/7",
    impact: "Reducción del 85% en tiempo de respuesta",
    metric: "85%",
    color: "neon-cyan"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Asistente Personal IA",
    description: "Un asistente que gestiona agenda, emails y consultas a documentos propios automáticamente",
    impact: "Ahorro de 10 horas semanales por ejecutivo",
    metric: "10h",
    color: "matrix-green"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Leads Generator",
    description: "Formularios web que califican leads y los envían directo a tu CRM",
    impact: "Incremento del 40% en leads organizados y listos para ventas.",
    metric: "40%",
    color: "plasma-purple"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "IA Email Marketing",
    description: "Correos transaccionales con textos que se adaptan al perfil del usuario",
    impact: "70% en tasa de clics",
    metric: "70%",
    color: "energy-yellow"
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Agente IA - Todo en uno",
    description: "Plataforma que integra todas tus herramientas (Gmail, Calendar, Drive, Trello, bases de datos) con un chatbot que gestiona información y tareas automáticamente",
    impact: "Productividad aumentada en 200%",
    metric: "200%",
    color: "neon-cyan"
  }
];

const ClientsTimeline = () => {
  const [activeProject, setActiveProject] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState<boolean[]>(new Array(projects.length).fill(false));
  const [progressWidth, setProgressWidth] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate progress based on scroll position
        if (elementTop < windowHeight && elementTop + elementHeight > 0) {
          const visiblePortion = Math.min(windowHeight - elementTop, elementHeight) / elementHeight;
          setProgressWidth(Math.max(0, Math.min(100, visiblePortion * 100)));
        }
      }
    };

    // Set up intersection observers for each project
    const observers = projectRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleProjects(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
            setActiveProject(index);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(ref);
      return observer;
    });

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <section id="clients-timeline" className="py-20 bg-gradient-to-b from-deep-space/30 to-transparent relative overflow-hidden" ref={timelineRef}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-cosmic">
              CASOS DE ÉXITO
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-4xl mx-auto">
            Empresas que ya implementaron nuestras soluciones, procesan más leads, cierran más ventas y superan a sus competidores cada mes.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-deep-space/50">
            <div 
              className="w-full bg-gradient-to-b from-neon-cyan via-matrix-green to-plasma-purple transition-all duration-300 ease-out"
              style={{ height: `${progressWidth}%` }}
            ></div>
          </div>

          {/* Projects */}
          <div className="space-y-12">
            {projects.map((project, index) => (
              <div
                key={index}
                ref={el => projectRefs.current[index] = el}
                className={`relative flex items-start space-x-8 transition-all duration-700 ${
                  visibleProjects[index] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                {/* Timeline Node */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-card border-2 border-${project.color} flex items-center justify-center transition-all duration-300 ${
                    activeProject === index ? 'scale-110 shadow-glow-cyan' : 'scale-100'
                  }`}>
                    <div className={`text-${project.color}`}>
                      {project.icon}
                    </div>
                  </div>
                  
                  {/* Particle Explosion Effect */}
                  {activeProject === index && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className={`w-2 h-2 bg-${project.color} rounded-full animate-ping`}></div>
                        <div className={`absolute top-0 left-0 w-2 h-2 bg-${project.color} rounded-full`}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Content */}
                <div className="flex-1 bg-gradient-card border border-card-border rounded-xl p-6 group hover:shadow-glow-cyan transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-neon-cyan transition-colors">
                      {project.title}
                    </h3>
                    
                    {/* Impact Metric */}
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <CheckCircle className={`w-5 h-5 text-${project.color}`} />
                      <span className={`text-lg font-bold text-${project.color}`}>
                        {project.metric}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="bg-deep-space/50 rounded-lg p-3 border border-matrix-green/20">
                    <p className="text-sm text-matrix-green font-semibold">
                      📈 {project.impact}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center bg-gradient-card border border-card-border rounded-xl p-6">
            <div className="text-3xl font-bold text-neon-cyan mb-2">15</div>
            <div className="text-foreground/70">Días de garantía</div>
          </div>
          <div className="text-center bg-gradient-card border border-card-border rounded-xl p-6">
            <div className="text-3xl font-bold text-matrix-green mb-2">100%</div>
            <div className="text-foreground/70">Clientes Satisfechos</div>
          </div>
          <div className="text-center bg-gradient-card border border-card-border rounded-xl p-6">
            <div className="text-3xl font-bold text-plasma-purple mb-2">&lt;4</div>
            <div className="text-foreground/70">Semanas Implementación</div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-foreground/70 mb-6">
            ¿Quieres ser el próximo caso de éxito?
          </p>
          <button 
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-gradient-cosmic border border-neon-cyan rounded-lg text-foreground font-semibold hover:shadow-glow-cyan transition-all duration-300 hover:scale-105"
          >
            CREAR MI PROYECTO
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClientsTimeline;
