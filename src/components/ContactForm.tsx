import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  nombre: string;
  email: string;
  empresa: string;
  companySize: string;
  budget: string;
  interest: string;
  mensaje: string;
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
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  const companySizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
  const budgets = ['≤1.000€', '1.000-3.000€', '3.000-6.000€', '6.000-10.000€', '10.000€+'];
  const interests = ['Automatización', 'Agentes IA', 'Chatbot', 'Fusión de Sistemas', 'Transformación Completa'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleButtonSelection = (category: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nombre || !formData.email || !formData.empresa || !formData.companySize || !formData.budget || !formData.interest) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios incluyendo tamaño de empresa, presupuesto e interés principal.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setShowPortal(true);

    try {
      // ✅ CREDENCIALES SEGURAS DESDE VARIABLES DE ENTORNO
      const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
      const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
      
      // Validación de que las variables existen
      if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
        console.error('❌ Variables de entorno faltantes:', {
          BASE_ID: !!AIRTABLE_BASE_ID,
          TOKEN: !!AIRTABLE_TOKEN
        });
        throw new Error('Faltan configuraciones de Airtable. Verifica tu archivo .env y reinicia el servidor.');
      }
      
      console.log('🚀 Enviando a Airtable...', formData);
      
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              Nombre: formData.nombre,
              Email: formData.email,
              Empresa: formData.empresa,
              TamañoEmpresa: formData.companySize || '',
              Presupuesto: formData.budget || '',
              InterésPrincipal: formData.interest || '',
              Mensaje: formData.mensaje || '',
              Estado: 'Nuevo'
            }
          }]
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Lead guardado en Airtable:', result);
        
        toast({
          title: "¡Transformación iniciada! 🚀",
          description: "Nos contactaremos contigo en las próximas 24 horas.",
          variant: "default"
        });
        
        // Reset form
        setFormData({
          nombre: '',
          email: '',
          empresa: '',
          companySize: '',
          budget: '',
          interest: '',
          mensaje: ''
        });
      } else {
        console.error('❌ Error Airtable:', result);
        throw new Error(`Error Airtable: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      toast({
        title: "Error de transmisión",
        description: "Hubo un problema al enviar tu mensaje. Revisa la consola para más detalles.",
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
            Déjanos tus datos y te mostraremos cómo escalar tu negocio
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gradient-card border border-card-border rounded-2xl p-8 relative group">
            {/* Form Glow Effect */}
            <div className="absolute inset-0 bg-gradient-cosmic opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500"></div>
            
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
                    placeholder="Cuéntanos sobre tu proyecto..."
                  />
                </div>
              </div>

              {/* Mission Parameters */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-neon-cyan mb-6 flex items-center">
                  <Zap className="mr-2" />
                  Parámetros de Misión
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
                Te contactaremos en las próximas 24 horas para discutir tu proyecto
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
