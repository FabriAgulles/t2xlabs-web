import React, { useState, useEffect } from 'react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

type CookiePreference = 'all' | 'necessary' | 'rejected' | null;

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya ha dado su consentimiento
    const cookiePreference = localStorage.getItem('cookieConsent');

    if (!cookiePreference) {
      // Mostrar el banner después de 3 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (preference: CookiePreference) => {
    // Guardar la preferencia en localStorage
    if (preference) {
      localStorage.setItem('cookieConsent', preference);
      localStorage.setItem('cookieConsentDate', new Date().toISOString());

      // Aquí puedes añadir lógica adicional según la preferencia
      switch (preference) {
        case 'all':
          // Activar todas las cookies (analytics, marketing, etc.)
          console.log('Usuario aceptó todas las cookies');
          break;
        case 'necessary':
          // Solo cookies necesarias
          console.log('Usuario aceptó solo cookies necesarias');
          break;
        case 'rejected':
          // Rechazar cookies opcionales
          console.log('Usuario rechazó cookies opcionales');
          break;
      }
    }

    // Animación de salida
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"></div>

      {/* Container del banner */}
      <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Texto informativo */}
            <div className="flex-1 pr-0 sm:pr-8">
              <div className="flex items-start gap-3">
                {/* Icono de cookie */}
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                    Utilizamos cookies
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    Usamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido.
                    Puedes elegir qué cookies aceptar. Consulta nuestra{' '}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                    >
                      Política de Privacidad
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Botón: Rechazar */}
              <button
                onClick={() => handleConsent('rejected')}
                className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Rechazar cookies opcionales"
              >
                Rechazar
              </button>

              {/* Botón: Solo necesarias */}
              <button
                onClick={() => handleConsent('necessary')}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Aceptar solo cookies necesarias"
              >
                Solo necesarias
              </button>

              {/* Botón: Aceptar todas */}
              <button
                onClick={() => handleConsent('all')}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Aceptar todas las cookies"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Política de Privacidad */}
      <PrivacyPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default CookieConsent;
