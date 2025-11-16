import { z } from 'zod';

/**
 * Schema de validación para el formulario de contacto
 * Compartido entre cliente y servidor para garantizar validación consistente
 */
export const contactFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
      'El nombre solo puede contener letras, espacios, guiones y apóstrofes'
    )
    .transform(val => val.trim()),

  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email es demasiado largo')
    .toLowerCase()
    .transform(val => val.trim()),

  empresa: z
    .string()
    .min(2, 'El nombre de empresa debe tener al menos 2 caracteres')
    .max(200, 'El nombre de empresa no puede superar 200 caracteres')
    .transform(val => val.trim()),

  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    errorMap: () => ({ message: 'Selecciona un tamaño de empresa válido' }),
  }),

  budget: z.enum(
    ['≤1.000€', '1.000-3.000€', '3.000-6.000€', '6.000-10.000€', '10.000€+'],
    {
      errorMap: () => ({ message: 'Selecciona un presupuesto válido' }),
    }
  ),

  interest: z.enum(
    [
      'Automatización',
      'Agentes IA',
      'Chatbot',
      'Fusión de Sistemas',
      'Transformación Completa',
    ],
    {
      errorMap: () => ({ message: 'Selecciona un interés válido' }),
    }
  ),

  mensaje: z
    .string()
    .max(2000, 'El mensaje no puede superar 2000 caracteres')
    .optional()
    .transform(val => (val ? val.trim() : '')),

  // Campo honeypot - debe estar vacío (los bots lo llenarán)
  website: z.string().max(0, 'Campo honeypot debe estar vacío').optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Validación de rate limiting
 * Estructura para almacenar información de rate limiting
 */
export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Configuración de rate limiting
 */
export const RATE_LIMIT_CONFIG = {
  maxRequests: 5, // Máximo 5 requests
  windowMs: 60 * 60 * 1000, // Por hora (3600000ms)
} as const;

/**
 * Cooldown en cliente (menos restrictivo que rate limit del servidor)
 */
export const CLIENT_COOLDOWN_MS = 60000; // 1 minuto
