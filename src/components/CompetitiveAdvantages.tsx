import React, { useState, useEffect, useRef } from 'react';
import { Clock, TrendingUp, Users, Crown } from 'lucide-react';

interface AdvantageData {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
  detail: string;
  color: string;
}

const advantages: AdvantageData[] = [
  {
    icon: <Clock className="w-8 h-8" />,
    title: "AHORRO DE TIEMPO",
    description: "Reduce tareas repetitivas y libera a tu equipo para lo que realmente importa",
    metric: "150-300%",
    detail: "Incremento en productividad del equipo",
    color: "neon-cyan"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "ESCALABILIDAD INTELIGENTE", 
    description: "Expande tu capacidad operativa sin aumentar tu tripulación",
    metric: "3-5x",
    detail: "Más resultados con el mismo personal",
    color: "matrix-green"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "MEJOR EXPERIENCIA DE USUARIO",
    description: "Respuestas automáticas 24/7 para tus clientes",
    metric: "24/7",
    detail: "Tiempo de respuesta: segundos vs horas/días", 
    color: "plasma-purple"
  },
  {
    icon: <Crown className="w-8 h-8" />,
    title: "VENTAJA COMPETITIVA REAL",
    description: "Implementación en semanas, no meses",
    metric: "Semanas",
    detail: "Tecnología que tu competencia no tiene",
    color: "energy-yellow"
  }
];

const CounterAnimation = ({ target, suffix = "", isVisible }: { target: string, suffix?: string, isVisible: boolean }) => {
  const [count, setCount] = useState(0);
  const [displayValue, setDisplayValue] = useState(target);

  useEffect(() => {
    if (!isVisible) return;

    // Check if target contains numbers to animate
    const numericMatch = target.match(/(\d+)/);
    if (numericMatch) {
      const numericTarget = parseInt(numericMatch[0]);
      const prefix = target.substring(0, numericMatch.index);
      const suffixPart = target.substring((numericMatch.index || 0) + numericMatch[0].length);
      
      let current = 0;
      const increment = numericTarget / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
          setDisplayValue(target);
          clearInterval(timer);
        } else {
          setDisplayValue(`${prefix}${Math.floor(current)}${suffixPart}`);
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, [target, isVisible]);

  return <span className="animate-counter-up">{displayValue}</span>;
};

const CompetitiveAdvantages = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(advantages.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-matrix relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-cosmic">
              DESPEGA CON NOSOTROS 🚀
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Mientras tu competencia planifica el viaje, tu ya estarás en órbita.
          </p>
        </div>

        {/* Hexagonal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              ref={el => cardRefs.current[index] = el}
              className={`hexagon-card bg-gradient-card border border-card-border rounded-xl p-8 relative group ${
                visibleCards[index] ? 'animate-scale-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Particle Trail Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-4 right-4 w-2 h-2 bg-neon-cyan rounded-full animate-ping"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-matrix-green rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-${advantage.color}/10 border border-${advantage.color}/30 mb-6 group-hover:animate-glow-pulse`}>
                <div className={`text-${advantage.color}`}>
                  {advantage.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-neon-cyan transition-colors">
                {advantage.title}
              </h3>
              
              <p className="text-foreground/80 mb-6 leading-relaxed">
                {advantage.description}
              </p>

              {/* Metric Display */}
              <div className="bg-deep-space/50 rounded-lg p-4 border border-neon-cyan/20">
                <div className={`text-3xl font-bold text-${advantage.color} mb-2`}>
                  <CounterAnimation 
                    target={advantage.metric} 
                    isVisible={visibleCards[index]} 
                  />
                </div>
                <div className="text-sm text-foreground/70">
                  {advantage.detail}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-cosmic opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-foreground/70 mb-6">
            ¿Listo para iniciar el despegue?
          </p>
          <button 
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-gradient-cosmic border border-neon-cyan rounded-lg text-foreground font-semibold hover:shadow-glow-cyan transition-all duration-300 hover:scale-105"
          >
            INICIAR LANZAMIENTO
          </button>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveAdvantages;
