import React, { Suspense, lazy, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { ArrowLeft, Shield, Cookie, Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FooterSection = lazy(() => import('@/components/FooterSection'));

const Privacidad = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-x-hidden">
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center text-neon-cyan hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>

          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-cosmic">
                Privacidad y Cookies
              </span>
            </h1>
            <p className="text-foreground/60 text-sm font-mono">
              Última actualización: Marzo 2026
            </p>
          </div>

          {/* Accordion Sections */}
          <Accordion type="multiple" className="space-y-4">
            {/* Privacy Policy Section */}
            <AccordionItem
              value="privacidad"
              className="border border-neon-cyan/30 rounded-lg bg-deep-space/30 px-6"
            >
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30">
                    <Shield className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <span className="text-2xl font-bold text-white">Política de Privacidad</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-8 text-foreground/80">
                  {/* Who we are */}
                  <div className="bg-deep-space/50 rounded-lg p-6 border border-neon-cyan/20">
                    <h3 className="text-lg font-semibold text-neon-cyan mb-3">Quién somos</h3>
                    <p className="leading-relaxed">
                      <strong className="text-white">T2X Labs</strong> es responsable del tratamiento de tus datos personales
                      recogidos a través de este sitio web.
                    </p>
                    <p className="mt-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-matrix-green" />
                      <a href="mailto:t2xlabs@gmail.com" className="text-matrix-green hover:underline">
                        t2xlabs@gmail.com
                      </a>
                    </p>
                  </div>

                  {/* What data we collect */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Qué datos recogemos</h3>
                    <p className="mb-3">Cuando usas nuestro formulario de contacto, recogemos:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/70">
                      <li>Nombre</li>
                      <li>Email</li>
                      <li>Mensaje</li>
                    </ul>
                  </div>

                  {/* Purpose */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Para qué los usamos</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/70">
                      <li>Responder a tu consulta</li>
                      <li>Enviarte información que hayas solicitado</li>
                      <li>Mejorar nuestros servicios</li>
                    </ul>
                  </div>

                  {/* Third parties */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Quién más accede a tus datos</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/70">
                      <li><strong>Google Analytics</strong> - para estadísticas anónimas del sitio</li>
                      <li><strong>Airtable</strong> - donde almacenamos los mensajes del formulario</li>
                    </ul>
                    <p className="mt-3 text-sm text-foreground/60">
                      No vendemos ni compartimos tus datos con terceros para fines comerciales.
                    </p>
                  </div>

                  {/* Retention */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Cuánto tiempo guardamos tu información</h3>
                    <p>
                      Conservamos tus datos de contacto durante <strong className="text-neon-cyan">12 meses</strong> desde
                      tu última interacción con nosotros.
                    </p>
                  </div>

                  {/* Rights */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tus derechos</h3>
                    <p className="mb-3">Tienes derecho a:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/70">
                      <li><strong>Acceso</strong> - saber qué datos tenemos sobre ti</li>
                      <li><strong>Rectificación</strong> - corregir datos incorrectos</li>
                      <li><strong>Eliminación</strong> - solicitar que borremos tus datos</li>
                      <li><strong>Portabilidad</strong> - recibir tus datos en formato digital</li>
                      <li><strong>Oposición</strong> - oponerte al tratamiento</li>
                    </ul>
                  </div>

                  {/* How to exercise */}
                  <div className="bg-deep-space/50 rounded-lg p-6 border border-matrix-green/20">
                    <h3 className="text-lg font-semibold text-matrix-green mb-3">Cómo ejercer tus derechos</h3>
                    <p>
                      Envía un email a{' '}
                      <a href="mailto:t2xlabs@gmail.com" className="text-matrix-green hover:underline font-semibold">
                        t2xlabs@gmail.com
                      </a>{' '}
                      indicando qué derecho quieres ejercer.
                    </p>
                  </div>

                  {/* Complaints */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Reclamaciones</h3>
                    <p>
                      Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación
                      ante la{' '}
                      <a
                        href="https://www.aepd.es"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:underline"
                      >
                        Agencia Española de Protección de Datos (AEPD)
                      </a>.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Cookie Policy Section */}
            <AccordionItem
              value="cookies"
              className="border border-plasma-purple/30 rounded-lg bg-deep-space/30 px-6"
            >
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-plasma-purple/10 rounded-lg border border-plasma-purple/30">
                    <Cookie className="w-6 h-6 text-plasma-purple" />
                  </div>
                  <span className="text-2xl font-bold text-white">Política de Cookies</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-8 text-foreground/80">
                  {/* What are cookies */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Qué son las cookies</h3>
                    <p>
                      Las cookies son pequeños archivos que el navegador guarda en tu dispositivo.
                      Las usamos para que el sitio funcione correctamente y para entender cómo lo usas.
                    </p>
                  </div>

                  {/* Cookie table */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Cookies que usamos</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neon-cyan/30">
                            <th className="text-left py-3 px-4 text-neon-cyan font-semibold">Nombre</th>
                            <th className="text-left py-3 px-4 text-neon-cyan font-semibold">Proveedor</th>
                            <th className="text-left py-3 px-4 text-neon-cyan font-semibold">Duración</th>
                            <th className="text-left py-3 px-4 text-neon-cyan font-semibold">Finalidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/10">
                          <tr className="hover:bg-deep-space/30">
                            <td className="py-3 px-4 font-mono text-xs">_ga</td>
                            <td className="py-3 px-4">Google Analytics</td>
                            <td className="py-3 px-4">2 años</td>
                            <td className="py-3 px-4 text-foreground/60">Distinguir usuarios</td>
                          </tr>
                          <tr className="hover:bg-deep-space/30">
                            <td className="py-3 px-4 font-mono text-xs">_gid</td>
                            <td className="py-3 px-4">Google Analytics</td>
                            <td className="py-3 px-4">24 horas</td>
                            <td className="py-3 px-4 text-foreground/60">Distinguir usuarios</td>
                          </tr>
                          <tr className="hover:bg-deep-space/30">
                            <td className="py-3 px-4 font-mono text-xs">cookieConsent</td>
                            <td className="py-3 px-4">T2X Labs</td>
                            <td className="py-3 px-4">1 año</td>
                            <td className="py-3 px-4 text-foreground/60">Recordar tu preferencia</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* How to manage */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Cómo gestionar las cookies</h3>
                    <p className="mb-3">
                      Puedes aceptar o rechazar cookies en nuestro banner de cookies cuando visitas el sitio.
                    </p>
                    <p className="mb-3">
                      También puedes configurar tu navegador para bloquear cookies:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/70">
                      <li>
                        <strong>Chrome:</strong> Configuración &gt; Privacidad &gt; Cookies
                      </li>
                      <li>
                        <strong>Firefox:</strong> Preferencias &gt; Privacidad &gt; Cookies
                      </li>
                      <li>
                        <strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Cookies
                      </li>
                    </ul>
                  </div>

                  {/* Note */}
                  <div className="bg-deep-space/50 rounded-lg p-6 border border-plasma-purple/20">
                    <p className="text-sm text-foreground/60">
                      <strong className="text-plasma-purple">Nota:</strong> Si desactivas las cookies,
                      algunas funciones del sitio pueden no funcionar correctamente.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Contact */}
          <div className="mt-16 text-center">
            <p className="text-foreground/60">
              ¿Dudas sobre privacidad?{' '}
              <a href="mailto:t2xlabs@gmail.com" className="text-neon-cyan hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <FooterSection />
      </Suspense>
    </div>
  );
};

export default Privacidad;
