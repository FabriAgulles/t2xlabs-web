# IMPLEMENTACIÓN FASE 1: SEGURIDAD CRÍTICA
## Protección de Credenciales + Rate Limiting

**Fecha:** 16 de Noviembre de 2025
**Estado:** ✅ IMPLEMENTADO - REQUIERE CONFIGURACIÓN EN NETLIFY

---

## 📋 RESUMEN DE CAMBIOS

Se han implementado **todas las correcciones críticas de seguridad** (Fase 1 del SECURITY_AUDIT.md):

### ✅ Completado

1. **Netlify Functions** - Credenciales protegidas en servidor
2. **Rate Limiting** - Protección contra spam (5 req/hora por IP)
3. **Honeypot Field** - Detección de bots
4. **Cooldown en Cliente** - Prevención de spam accidental (1 min)
5. **Validación Zod** - Doble validación (cliente + servidor)
6. **Logger Seguro** - Sin logs sensibles en producción
7. **Headers de Seguridad** - CSP, HSTS, X-Frame-Options, etc.
8. **Documentación** - `.env.example` y configuración completa

---

## 🗂️ ARCHIVOS CREADOS/MODIFICADOS

### Archivos Nuevos ✨

```
netlify/
└── functions/
    └── submit-lead.ts        # Función serverless segura

src/lib/
├── validation.ts             # Schemas Zod compartidos
└── logger.ts                 # Logger seguro (dev only)

.env.example                  # Plantilla de variables de entorno
netlify.toml                  # Configuración de Netlify + headers
IMPLEMENTATION_PHASE1.md      # Este documento
```

### Archivos Modificados 🔧

```
src/components/ContactForm.tsx   # Actualizado para usar Netlify Function
package.json                     # Añadidas dependencias y scripts de Netlify
```

---

## 🔧 CONFIGURACIÓN REQUERIDA

### CRÍTICO: ANTES DE DESPLEGAR A PRODUCCIÓN

#### 1. Instalar Nuevas Dependencias

```bash
npm install
```

Esto instalará:
- `@netlify/functions@^2.8.2` - Types para Netlify Functions
- `netlify-cli@^17.40.0` - CLI de Netlify para desarrollo local

#### 2. Configurar Variables de Entorno en Netlify

**IR A:** Netlify Dashboard → Tu sitio → Site settings → Environment variables

**AÑADIR:**

| Variable | Valor | Scopes |
|----------|-------|--------|
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` | All deploys |
| `AIRTABLE_TOKEN` | `patXXXXXXXXXXXXXX` | All deploys |

**⚠️ IMPORTANTE:**
- **NO usar el prefijo `VITE_`** (eso las expondría públicamente)
- Usar **NUEVAS credenciales** (las actuales ya están comprometidas)

#### 3. Rotar Credenciales de Airtable (OBLIGATORIO)

Las credenciales actuales están expuestas públicamente. DEBES generar nuevas:

**Pasos:**
1. Ir a https://airtable.com/account
2. Ir a "Personal access tokens"
3. Crear nuevo token con permisos:
   - `data.records:read` (para la tabla Leads)
   - `data.records:write` (para la tabla Leads)
4. Copiar el token (empieza con `pat...`)
5. Configurar en Netlify (paso 2)
6. **REVOCAR** el token antiguo

#### 4. Configuración Local para Desarrollo

```bash
# 1. Copiar plantilla de variables
cp .env.example .env

# 2. Editar .env y completar con credenciales NUEVAS
# (Las mismas que configuraste en Netlify)

# 3. Ejecutar en modo desarrollo con Netlify
npm run dev

# Esto iniciará:
# - Vite dev server en http://localhost:8080
# - Netlify Functions localmente
# - Proxy automático a /.netlify/functions/*
```

---

## 🚀 TESTING PRE-DEPLOY

Antes de desplegar a producción, **DEBES probar localmente**:

### 1. Testing Local

```bash
# Terminal 1: Iniciar servidor de desarrollo
npm run dev

# Terminal 2: Test manual
curl -X POST http://localhost:8080/.netlify/functions/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Usuario",
    "email": "test@test.com",
    "empresa": "Test Company",
    "companySize": "1-10",
    "budget": "≤1.000€",
    "interest": "Automatización",
    "mensaje": "Testing"
  }'

# Debe responder:
# {"success":true,"message":"Solicitud recibida correctamente"}
```

### 2. Testing de Rate Limiting

```bash
# Enviar 6 requests seguidos (debe bloquear el 6to)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:8080/.netlify/functions/submit-lead \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"Test$i\",\"email\":\"test$i@test.com\",\"empresa\":\"Test\",\"companySize\":\"1-10\",\"budget\":\"≤1.000€\",\"interest\":\"Automatización\"}"
  echo -e "\n"
done

# Después del 5to, debe responder con 429:
# {"error":"Demasiadas solicitudes. Intenta más tarde.","retryAfter":3600}
```

### 3. Testing de Honeypot

```bash
# Enviar con honeypot lleno (debe aceptar pero no guardar)
curl -X POST http://localhost:8080/.netlify/functions/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Bot",
    "email": "bot@bot.com",
    "empresa": "Bot Company",
    "companySize": "1-10",
    "budget": "≤1.000€",
    "interest": "Automatización",
    "website": "https://spam.com"
  }'

# Debe responder 200 (para engañar al bot)
# Pero NO debe crear el lead en Airtable
```

### 4. Testing de Validación

```bash
# Email inválido
curl -X POST http://localhost:8080/.netlify/functions/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "invalid-email",
    "empresa": "Test",
    "companySize": "1-10",
    "budget": "≤1.000€",
    "interest": "Automatización"
  }'

# Debe responder 400:
# {"error":"Datos inválidos","details":"Email inválido"}
```

---

## 📊 ARQUITECTURA IMPLEMENTADA

### ANTES (INSEGURO) ❌
```
Cliente Browser
  │
  │ VITE_AIRTABLE_TOKEN (EXPUESTO)
  ▼
API Airtable (Directo, sin protección)
```

### DESPUÉS (SEGURO) ✅
```
Cliente Browser
  │
  │ Sin credenciales
  │ Validación Zod
  │ Cooldown (1 min)
  │ Honeypot
  ▼
Netlify Function (/.netlify/functions/submit-lead)
  │
  │ Rate Limiting (5/hora por IP)
  │ Validación Zod (server-side)
  │ Verificación de origen
  │ AIRTABLE_TOKEN (PRIVADO en process.env)
  ▼
API Airtable (Seguro)
```

---

## 🔒 MEJORAS DE SEGURIDAD IMPLEMENTADAS

### 1. Protección de Credenciales ✅

**Antes:**
```typescript
// ❌ EXPUESTO en el bundle del cliente
const TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
```

**Después:**
```typescript
// ✅ SOLO en servidor (Netlify Function)
const TOKEN = process.env.AIRTABLE_TOKEN;
```

### 2. Rate Limiting Multi-Capa ✅

- **Servidor:** 5 requests/hora por IP (hash)
- **Cliente:** 1 request/minuto (localStorage)
- **Honeypot:** Detección silenciosa de bots
- **Origen:** Verificación de dominio permitido

### 3. Validación Robusta ✅

**Doble validación con Zod:**
- Cliente: UX inmediata
- Servidor: Seguridad real (nunca confiar en cliente)

**Validaciones:**
- Nombre: 2-100 chars, solo letras
- Email: RFC compliant, max 255 chars
- Empresa: 2-200 chars
- Mensaje: max 2000 chars
- Campos enum validados estrictamente

### 4. Logs Seguros ✅

```typescript
// logger.ts - Solo logs en desarrollo
import.meta.env.DEV ? console.log(...) : noop
```

**Producción:**
- Zero `console.log` en bundle
- No exposición de datos sensibles
- Logs de auditoría solo en servidor

### 5. Headers de Seguridad HTTP ✅

**Configurados en `netlify.toml`:**
- ✅ HSTS (force HTTPS)
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options (anti-clickjacking)
- ✅ X-Content-Type-Options (anti-MIME-sniffing)
- ✅ Referrer-Policy
- ✅ Permissions-Policy

---

## 📝 SCRIPTS DE NPM

```bash
# Desarrollo con Netlify (RECOMENDADO)
npm run dev

# Desarrollo solo con Vite (sin functions)
npm run dev:vite

# Build para producción
npm run build

# Preview del build
npm run preview

# Deploy a producción (requiere Netlify CLI auth)
npm run deploy

# Servir solo las functions
npm run functions:serve
```

---

## ⚠️ ACCIONES POST-DEPLOY

### Inmediatamente Después del Deploy:

1. **Verificar que las functions funcionan:**
   ```bash
   curl https://t2xlabs.com/.netlify/functions/submit-lead \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}'

   # Si responde 400 (validación) = FUNCIONA ✅
   # Si responde 500 o timeout = PROBLEMA ❌
   ```

2. **Probar el formulario real en producción:**
   - Ir a https://t2xlabs.com/#contact-form
   - Llenar formulario con datos reales
   - Verificar que llega a Airtable
   - Verificar toast de éxito

3. **Verificar headers de seguridad:**
   ```bash
   curl -I https://t2xlabs.com | grep -E "Content-Security-Policy|Strict-Transport|X-Frame"

   # Deben aparecer los headers configurados
   ```

4. **Monitorear logs de Netlify:**
   - Dashboard → Functions → submit-lead
   - Verificar que no hay errores
   - Verificar que rate limiting funciona

### En las Próximas 24 Horas:

1. **Monitorear spam:**
   - Revisar Airtable para leads sospechosos
   - Si hay spam, considerar añadir Cloudflare Turnstile (CAPTCHA)

2. **Verificar rate limiting:**
   - Logs de Netlify deben mostrar algunos 429 si hay intentos de spam
   - Si no hay 429, el rate limiting funciona pero no ha sido probado

3. **Verificar bundle:**
   ```bash
   # Descargar el JS compilado y buscar credenciales
   curl https://t2xlabs.com/assets/index-*.js | grep -i "airtable"
   # NO debe aparecer ningún token o base ID
   ```

---

## 🐛 TROUBLESHOOTING

### Error: "Missing Airtable credentials"

**Causa:** Variables de entorno no configuradas en Netlify
**Solución:**
1. Ir a Netlify Dashboard → Environment variables
2. Añadir `AIRTABLE_BASE_ID` y `AIRTABLE_TOKEN`
3. Re-deploy el sitio

### Error: "Method Not Allowed" (405)

**Causa:** Request no es POST
**Solución:** Verificar que el cliente usa POST

### Error: "Forbidden - Invalid origin" (403)

**Causa:** Request desde origen no permitido
**Solución:**
1. Si es desarrollo local, añadir tu URL a `allowedOrigins` en submit-lead.ts
2. Si es producción, verificar que el dominio está en la lista

### Error: "Too many requests" (429) prematuramente

**Causa:** Cache de rate limiting muy agresivo
**Solución:**
1. Para desarrollo: Aumentar `RATE_LIMIT_CONFIG.maxRequests` en submit-lead.ts
2. Para producción: Es el comportamiento esperado (5/hora)

### Function no se ejecuta (timeout)

**Causa:** Posible error en el código de la function
**Solución:**
1. Ver logs en Netlify Dashboard → Functions
2. Verificar que `@netlify/functions` está instalado
3. Verificar sintaxis TypeScript

---

## 🔜 PRÓXIMOS PASOS (FASE 2 Y 3)

### Fase 2: Alta Prioridad (Opcional pero Recomendado)

1. **Implementar console.log dropping automático en build:**
   - Configurar Vite para eliminar logs en producción
   - Tiempo: 30 min

2. **CAPTCHA (Cloudflare Turnstile):**
   - Si se detecta spam después del deploy
   - Gratis, invisible, efectivo
   - Tiempo: 2-3 horas

### Fase 3: Mejoras (Cuando Haya Tiempo)

1. **CSP Estricto:**
   - Eliminar `'unsafe-inline'`
   - Usar nonces dinámicos
   - Tiempo: 4-8 horas

2. **Monitoring:**
   - Integrar Sentry para error tracking
   - Dashboard de rate limiting
   - Tiempo: 2-4 horas

---

## ✅ CHECKLIST DE DEPLOYMENT

Antes de hacer merge a main:

- [ ] `npm install` completado sin errores
- [ ] Testing local completado (formulario funciona)
- [ ] Rate limiting probado localmente
- [ ] Honeypot probado localmente
- [ ] Validación probada (emails inválidos rechazados)
- [ ] Variables configuradas en Netlify Dashboard
- [ ] Credenciales de Airtable NUEVAS generadas
- [ ] Credenciales antiguas REVOCADAS
- [ ] `.env` añadido a `.gitignore` (ya está)
- [ ] Testing en staging/preview deploy
- [ ] Verificación de que NO hay credenciales en bundle

Después del deploy a producción:

- [ ] Function responde correctamente en producción
- [ ] Formulario real envía datos a Airtable
- [ ] Headers de seguridad presentes (curl -I)
- [ ] No hay console.log en bundle de producción
- [ ] Monitoring configurado (Netlify Functions logs)

---

## 📞 SOPORTE

**Si hay problemas durante la implementación:**

1. Revisar logs de Netlify Functions
2. Verificar que variables de entorno están configuradas
3. Probar localmente primero (`npm run dev`)
4. Consultar SECURITY_AUDIT.md para contexto completo

**Para preguntas sobre la implementación:**
- Revisar este documento
- Revisar código con comentarios en `submit-lead.ts`
- Revisar `.env.example` para configuración

---

**Implementado por:** Senior Security Engineer
**Fecha:** 16 de Noviembre de 2025
**Status:** ✅ LISTO PARA DEPLOY (Requiere configuración de variables en Netlify)
