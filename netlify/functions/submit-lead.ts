import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { z } from "zod";

/**
 * NETLIFY FUNCTION: submit-lead
 *
 * Función serverless segura para procesar envíos del formulario de contacto.
 * Implementa rate limiting, validación, y protección de credenciales.
 *
 * SEGURIDAD:
 * - Credenciales de Airtable SOLO accesibles en servidor
 * - Rate limiting por IP (5 requests/hora)
 * - Validación Zod server-side
 * - Honeypot anti-bot
 * - Verificación de origen
 * - Sin exposición de información sensible
 */

// ============================================================================
// VALIDACIÓN ZOD
// ============================================================================

const contactFormSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
      "El nombre solo puede contener letras"
    )
    .transform((val) => val.trim()),

  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email demasiado largo")
    .toLowerCase()
    .transform((val) => val.trim()),

  empresa: z
    .string()
    .min(2, "Nombre de empresa muy corto")
    .max(200, "Nombre de empresa muy largo")
    .transform((val) => val.trim()),

  companySize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),

  budget: z.enum([
    "≤1.000€",
    "1.000-3.000€",
    "3.000-6.000€",
    "6.000-10.000€",
    "10.000€+",
  ]),

  interest: z.enum([
    "Automatización",
    "Agentes IA",
    "Chatbot",
    "Fusión de Sistemas",
    "Transformación Completa",
  ]),

  mensaje: z
    .string()
    .max(2000, "Mensaje demasiado largo")
    .optional()
    .transform((val) => (val ? val.trim() : "")),

  // Honeypot: debe estar vacío
  website: z.string().max(0).optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Cache en memoria (se resetea con cada deploy/cold start)
// Para producción avanzada: usar Netlify Blobs, Redis, o KV store
const rateLimitCache = new Map<string, RateLimitRecord>();

const RATE_LIMIT_CONFIG = {
  maxRequests: 5, // Máximo 5 requests
  windowMs: 60 * 60 * 1000, // Por hora
};

/**
 * Hash simple de IP para privacidad
 */
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Verificar rate limit por IP
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = hashIP(ip);
  const record = rateLimitCache.get(key);

  // Limpiar registros expirados periódicamente
  if (rateLimitCache.size > 1000) {
    for (const [k, v] of rateLimitCache.entries()) {
      if (now > v.resetTime) {
        rateLimitCache.delete(k);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // Nuevo período o expirado
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// ============================================================================
// VERIFICACIÓN DE ORIGEN
// ============================================================================

/**
 * Verificar que el request proviene de un origen permitido
 */
function checkOrigin(event: HandlerEvent): boolean {
  const origin = event.headers.origin || event.headers.referer || "";
  const allowedOrigins = [
    "https://t2xlabs.com",
    "https://www.t2xlabs.com",
    "http://localhost:8080", // Desarrollo local
    "http://localhost:5173", // Vite dev server
  ];

  return allowedOrigins.some((allowed) => origin.startsWith(allowed));
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Verificar origen (protección CSRF básica)
  if (!checkOrigin(event)) {
    console.warn("Request from invalid origin:", event.headers.origin);
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden - Invalid origin" }),
    };
  }

  // Obtener IP del cliente
  const clientIP =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    "unknown";

  // Rate limiting
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for IP: ${hashIP(clientIP)}`);
    return {
      statusCode: 429,
      headers: {
        "Retry-After": rateLimitResult.retryAfter?.toString() || "3600",
      },
      body: JSON.stringify({
        error: "Demasiadas solicitudes. Intenta más tarde.",
        retryAfter: rateLimitResult.retryAfter,
      }),
    };
  }

  try {
    // Parsear body
    const body = JSON.parse(event.body || "{}");

    // Validar con Zod
    const validatedData: ContactFormData = contactFormSchema.parse(body);

    // Verificar honeypot (si website tiene valor, es un bot)
    if (validatedData.website) {
      console.warn("Honeypot triggered - potential bot detected");
      // No revelar que fue detectado como bot
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    // Obtener credenciales de Airtable (SOLO disponibles en servidor)
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      console.error("Missing Airtable credentials in environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Error de configuración del servidor",
        }),
      };
    }

    // Preparar datos para Airtable
    const airtablePayload = {
      records: [
        {
          fields: {
            Nombre: validatedData.nombre,
            Email: validatedData.email,
            Empresa: validatedData.empresa,
            TamañoEmpresa: validatedData.companySize,
            Presupuesto: validatedData.budget,
            InterésPrincipal: validatedData.interest,
            Mensaje: validatedData.mensaje || "",
            Estado: "Nuevo",
            // fecha.creacion se auto-genera en Airtable
          },
        },
      ],
    };

    // Enviar a Airtable
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airtablePayload),
      }
    );

    const airtableResult = await airtableResponse.json();

    if (!airtableResponse.ok) {
      console.error("Airtable error:", {
        status: airtableResponse.status,
        error: airtableResult.error,
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Error al procesar la solicitud",
        }),
      };
    }

    // Log de auditoría (sin datos sensibles)
    console.log("Lead submitted successfully", {
      ip: hashIP(clientIP),
      empresa: validatedData.empresa,
      timestamp: new Date().toISOString(),
    });

    // Respuesta exitosa (sin exponer IDs o detalles internos)
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Solicitud recibida correctamente",
      }),
    };
  } catch (error) {
    // Manejo de errores de validación (Zod)
    if (error instanceof z.ZodError) {
      console.warn("Validation error:", error.errors);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Datos inválidos",
          details: error.errors[0].message,
        }),
      };
    }

    // Error de parsing JSON
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Formato de datos inválido",
        }),
      };
    }

    // Error genérico (sin exponer detalles)
    console.error("Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno del servidor",
      }),
    };
  }
};
