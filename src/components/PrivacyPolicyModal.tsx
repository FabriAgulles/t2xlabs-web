import React, { useEffect } from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {

  useEffect(() => {
    // Manejar tecla ESC para cerrar
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Prevenir scroll del body cuando el modal está abierto
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="privacy-policy-title"
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Modal Container */}
      <div
        className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-700 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 id="privacy-policy-title" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Política de Privacidad de Cookies
          </h2>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Cerrar política de privacidad"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-6 text-gray-300">

          {/* Última actualización */}
          <p className="text-sm text-gray-400 mb-6 italic">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Sección 1: ¿Qué son las cookies? */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">1.</span>
              ¿Qué son las cookies?
            </h3>
            <p className="leading-relaxed mb-3">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
              Permiten que el sitio web reconozca tu dispositivo y recuerde información sobre tu visita, como tus preferencias
              y configuración.
            </p>
            <p className="leading-relaxed">
              Las cookies pueden ser de sesión (se eliminan cuando cierras el navegador) o persistentes (permanecen en tu
              dispositivo durante un período determinado).
            </p>
          </section>

          {/* Sección 2: ¿Qué cookies utilizamos? */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">2.</span>
              ¿Qué cookies utilizamos?
            </h3>

            {/* Cookies técnicas */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-3 border border-gray-700">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Cookies técnicas (necesarias)
              </h4>
              <p className="text-sm leading-relaxed mb-2">
                Son esenciales para el funcionamiento del sitio web. Sin estas cookies, el sitio no puede funcionar correctamente.
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-gray-400">
                <li>Gestión de sesiones de usuario</li>
                <li>Seguridad y prevención de fraude</li>
                <li>Preferencias de consentimiento de cookies</li>
              </ul>
            </div>

            {/* Cookies analíticas */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-3 border border-gray-700">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Cookies analíticas
              </h4>
              <p className="text-sm leading-relaxed mb-2">
                Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, proporcionando información sobre
                las áreas visitadas, el tiempo de permanencia y los problemas encontrados.
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-gray-400">
                <li>Google Analytics: Análisis de tráfico y comportamiento</li>
                <li>Métricas de rendimiento del sitio</li>
                <li>Identificación de páginas más visitadas</li>
              </ul>
            </div>

            {/* Cookies de funcionalidad */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Cookies de funcionalidad
              </h4>
              <p className="text-sm leading-relaxed mb-2">
                Permiten recordar tus preferencias y personalizar tu experiencia en el sitio.
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-gray-400">
                <li>Preferencias de idioma</li>
                <li>Configuración de interfaz</li>
                <li>Personalización de contenido</li>
              </ul>
            </div>
          </section>

          {/* Sección 3: Finalidad */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">3.</span>
              Finalidad del uso de cookies
            </h3>
            <ul className="space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Mejorar la experiencia de navegación y personalización del sitio</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Analizar el tráfico y comportamiento de los usuarios para mejorar nuestros servicios</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Garantizar la seguridad y el correcto funcionamiento del sitio web</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Recordar tus preferencias de consentimiento de cookies</span>
              </li>
            </ul>
          </section>

          {/* Sección 4: Cómo gestionar cookies */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">4.</span>
              ¿Cómo gestionar y eliminar cookies?
            </h3>
            <p className="leading-relaxed mb-4">
              Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies que ya están en tu
              dispositivo y puedes configurar la mayoría de los navegadores para evitar que se instalen.
            </p>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="font-semibold text-white mb-3">Gestión por navegador:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <strong className="text-white">Chrome:</strong>
                  <span className="text-gray-400">Configuración → Privacidad y seguridad → Cookies</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <strong className="text-white">Firefox:</strong>
                  <span className="text-gray-400">Opciones → Privacidad y seguridad</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <strong className="text-white">Safari:</strong>
                  <span className="text-gray-400">Preferencias → Privacidad</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <strong className="text-white">Edge:</strong>
                  <span className="text-gray-400">Configuración → Cookies y permisos del sitio</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-yellow-400 mt-4 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Ten en cuenta que si deshabilitas las cookies, algunas funcionalidades del sitio web pueden no funcionar correctamente.</span>
            </p>
          </section>

          {/* Sección 5: Derechos del usuario */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">5.</span>
              Tus derechos (GDPR/LOPD)
            </h3>
            <p className="leading-relaxed mb-4">
              De acuerdo con el Reglamento General de Protección de Datos (GDPR) y la Ley Orgánica de Protección de Datos (LOPD),
              tienes los siguientes derechos:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <strong className="text-white block mb-1">Derecho de acceso</strong>
                <p className="text-sm text-gray-400">Conocer qué datos personales almacenamos</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <strong className="text-white block mb-1">Derecho de rectificación</strong>
                <p className="text-sm text-gray-400">Corregir datos inexactos o incompletos</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <strong className="text-white block mb-1">Derecho de supresión</strong>
                <p className="text-sm text-gray-400">Solicitar la eliminación de tus datos</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <strong className="text-white block mb-1">Derecho de oposición</strong>
                <p className="text-sm text-gray-400">Oponerte al tratamiento de tus datos</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <strong className="text-white block mb-1">Derecho de portabilidad</strong>
                <p className="text-sm text-gray-400">Recibir tus datos en formato estructurado</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <strong className="text-white block mb-1">Derecho de limitación</strong>
                <p className="text-sm text-gray-400">Limitar el procesamiento de tus datos</p>
              </div>
            </div>
          </section>

          {/* Sección 6: Datos de contacto */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">6.</span>
              Datos de contacto
            </h3>
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-5 border border-blue-700/50">
              <p className="leading-relaxed mb-4">
                Si tienes alguna pregunta sobre nuestra política de cookies o deseas ejercer tus derechos, puedes contactarnos:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="text-white font-semibold">Email:</span>
                  <a href="mailto:privacy@tuempresa.com" className="text-blue-400 hover:text-blue-300 underline">
                    privacy@tuempresa.com
                  </a>
                  <span className="text-gray-500 text-xs">(EDITAR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white font-semibold">Dirección:</span>
                  <span className="text-gray-300">Calle Ejemplo 123, 28001 Madrid, España</span>
                  <span className="text-gray-500 text-xs">(EDITAR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white font-semibold">Responsable:</span>
                  <span className="text-gray-300">Tu Empresa S.L.</span>
                  <span className="text-gray-500 text-xs">(EDITAR)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer del modal */}
          <div className="border-t border-gray-700 pt-4 mt-6">
            <p className="text-xs text-gray-500 text-center">
              Esta política de cookies es efectiva a partir de la fecha indicada arriba y puede ser actualizada periódicamente.
              Te recomendamos revisar esta página regularmente para estar informado sobre cualquier cambio.
            </p>
          </div>
        </div>

        {/* Footer con botón de cerrar */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicyModal;
