import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema, CLIENT_COOLDOWN_MS } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { z } from 'zod';

interface FormData {
  nombre: string;
  email: string;
  empresa: string;
  companySize: string;
  budget: string;
  interest: string;
  mensaje: string;
  website: string; // Honeypot field - debe estar vacío
}

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    empresa: '',
    companySize: '',
    budget: '',
    interest: '',
    mensaje: '',
    website: '' // Honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  const companySizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
  const budgets = ['≤1.000€', '1.000-3.000€', '3.000-6.000€', '6.000-10.000€', '10.000€+'];
  const interests = ['Automatización', 'Agentes IA', 'Chatbot', 'Fusión de Sistemas', 'Transformación Completa'];

  // Restaurar lastSubmitTime desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem('lastContactFormSubmit');
    if (stored) {
      setLastSubmitTime(parseInt(stored, 10));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleButtonSelection = (category: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ============================================================================
    // COOLDOWN EN CLIENTE (Prevenir spam accidental)
    // ============================================================================
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;

    if (timeSinceLastSubmit < CLIENT_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((CLIENT_COOLDOWN_MS - timeSinceLastSubmit) / 1000);
      toast({
        title: "Por favor espera",
        description: `Puedes enviar otro formulario en ${remainingSeconds} segundos.`,
        variant: "destructive"
      });
      return;
    }

    // ============================================================================
    // VALIDACIÓN CON ZOD (Cliente)
    // ============================================================================
    try {
      const validatedData = contactFormSchema.parse(formData);
      logger.log('✅ Validación Zod exitosa en cliente');

      // Verificar honeypot en cliente (detección temprana de bots)
      if (validatedData.website) {
        logger.warn('⚠️ Honeypot detectado - posible bot');
        // No mostrar error al bot, simplemente simular éxito
        toast({
          title: "¡Transformación iniciada! 🚀",
          description: "Nos contactaremos contigo en las próximas 24 horas.",
          variant: "default"
        });
        return;
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Error de validación",
          description: firstError.message,
          variant: "destructive"
        });
        logger.error('❌ Error de validación Zod:', error.errors);
        return;
      }
    }

    // ============================================================================
    // ENVÍO A NETLIFY FUNCTION (Protección de credenciales)
    // ============================================================================
    setIsSubmitting(true);
    setShowPortal(true);

    try {
      logger.log('🚀 Enviando formulario a Netlify Function...');

      const response = await fetch('/.netlify/functions/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      // Manejo de rate limiting (429)
      if (response.status === 429) {
        const retryAfter = result.retryAfter || 3600;
        const hours = Math.ceil(retryAfter / 3600);
        toast({
          title: "Límite de solicitudes alcanzado",
          description: `Has enviado demasiados formularios. Intenta nuevamente en ${hours} hora${hours > 1 ? 's' : ''}.`,
          variant: "destructive"
        });
        return;
      }

      // Manejo de errores de validación (400)
      if (response.status === 400) {
        toast({
          title: "Datos inválidos",
          description: result.details || "Por favor verifica los datos del formulario.",
          variant: "destructive"
        });
        return;
      }

      // Error de servidor (500)
      if (response.status === 500) {
        toast({
          title: "Error del servidor",
          description: "Hubo un problema al procesar tu solicitud. Intenta más tarde.",
          variant: "destructive"
        });
        logger.error('❌ Error 500 del servidor');
        return;
      }

      // Éxito
      if (response.ok && result.success) {
        logger.log('✅ Formulario enviado exitosamente');

        // Actualizar timestamp de último envío
        const submitTime = Date.now();
        setLastSubmitTime(submitTime);
        localStorage.setItem('lastContactFormSubmit', submitTime.toString());

        toast({
          title: "¡Transformación iniciada! 🚀",
          description: "Nos contactaremos contigo en las próximas 24 horas.",
          variant: "default"
        });

        // Reset form (excepto honeypot)
        setFormData({
          nombre: '',
          email: '',
          empresa: '',
          companySize: '',
          budget: '',
          interest: '',
          mensaje: '',
          website: '' // Mantener honeypot vacío
        });
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }

    } catch (error) {
      logger.error('❌ Error en envío de formulario:', error);

      let errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";

      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
        } else if (error.message === 'Respuesta inesperada del servidor') {
          errorMessage = "Error inesperado del servidor. Intenta más tarde.";
        }
      }

      toast({
        title: "Error de transmisión",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowPortal(false), 1000);
    }
  };

  return (
    <section id="contact-form" className="py-20 bg-gradient-to-b from-transparent to-deep-space/50 relative overflow-hidden">
      {/* Portal Effect Background */}
      {showPortal && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-neon-cyan/10 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-neon-cyan rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-matrix-green rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-cosmic">
              ACCEDE A TU TRANSFORMACIÓN EMPRESARIAL
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Déjanos tus datos y te mostraremos cómo escalar tu negocio.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gradient-card border border-card-border rounded-2xl p-8 relative group">
            {/* Form Glow Effect */}
            <div className="absolute inset-0 bg-gradient-cosmic opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500"></div>

            {/* Honeypot Field - Invisible to humans, visible to bots */}
            <div className="absolute" style={{ left: '-9999px' }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-neon-cyan mb-6 flex items-center">
                  <Sparkles className="mr-2" />
                  Datos de Contacto
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Nombre *
                  </label>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Tu nombre completo"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="tu@empresa.com"
                    required
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Empresa *
                  </label>
                  <Input
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nombre de tu empresa"
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Mensaje (opcional)
                  </label>
                  <Textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    className="form-input min-h-[100px] resize-none"
                    placeholder="Cuéntanos sobre tu proyecto o idea para ayudarte con asesoramiento personalizado...."
                    maxLength={2000}
                  />
                </div>
              </div>

              {/* Mission Parameters */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-neon-cyan mb-6 flex items-center">
                  <Zap className="mr-2" />
                  Detalles del Proyecto
                </h3>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-3">
                    Tamaño de Empresa *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {companySizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleButtonSelection('companySize', size)}
                        className={`form-button p-2 text-sm rounded-lg transition-all duration-300 ${
                          formData.companySize === size ? 'selected' : ''
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-3">
                    Presupuesto *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {budgets.map((budget) => (
                      <button
                        key={budget}
                        type="button"
                        onClick={() => handleButtonSelection('budget', budget)}
                        className={`form-button p-2 text-sm rounded-lg transition-all duration-300 ${
                          formData.budget === budget ? 'selected' : ''
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-3">
                    Interés Principal *
                  </label>
                  <div className="space-y-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleButtonSelection('interest', interest)}
                        className={`form-button w-full p-3 text-sm rounded-lg transition-all duration-300 text-left ${
                          formData.interest === interest ? 'selected' : ''
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 px-4 sm:px-0 text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group bg-gradient-cosmic border-2 border-neon-cyan text-foreground w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl hover:shadow-glow-cyan transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-foreground border-t-transparent rounded-full"></div>
                    ESTABLECIENDO CONEXIÓN...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    INICIAR TRANSFORMACIÓN
                    <Zap className="ml-2 h-5 w-5 group-hover:animate-bounce" />
                  </>
                )}

                {/* Portal Opening Effect */}
                {showPortal && (
                  <div className="absolute inset-0 bg-gradient-cosmic animate-pulse"></div>
                )}
              </Button>

              <p className="text-sm text-foreground/60 mt-4">
                Te contactaremos en las próximas 24 horas para discutir tu proyecto.
              </p>
            </div>
          </form>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-deep-space/50 border border-matrix-green/30 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
            <span className="text-sm text-matrix-green font-mono">
              CONEXIÓN SEGURA ESTABLECIDA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
