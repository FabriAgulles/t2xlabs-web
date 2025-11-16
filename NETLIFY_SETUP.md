# 🚀 CONFIGURACIÓN DE NETLIFY - INSTRUCCIONES

**Estado:** ✅ Variables locales configuradas
**Siguiente:** Configurar en Netlify Dashboard

---

## 📋 VARIABLES A CONFIGURAR EN NETLIFY

Debes añadir estas **2 variables** en tu Netlify Dashboard:

### 1. Ir a Netlify Dashboard

**URL:** https://app.netlify.com/

**Navegación:**
```
Tu sitio → Site settings → Environment variables → Add a variable
```

### 2. Añadir Variables

#### Variable 1: AIRTABLE_BASE_ID

```
Key:   AIRTABLE_BASE_ID
Value: <TU_BASE_ID_AQUI>  # Copia el valor de tu archivo .env local
Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
```

#### Variable 2: AIRTABLE_TOKEN

```
Key:   AIRTABLE_TOKEN
Value: <TU_TOKEN_AQUI>  # Copia el valor de tu archivo .env local
Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
```

**💡 TIP:** Los valores exactos están en tu archivo `.env` local (no commiteado).
Cópialos desde ahí a Netlify Dashboard.

### ⚠️ IMPORTANTE

- **NO usar el prefijo `VITE_`** (eso las expondría públicamente)
- Usar exactamente estos nombres: `AIRTABLE_BASE_ID` y `AIRTABLE_TOKEN`
- Marcar todos los scopes (Production, Deploy previews, Branch deploys)

---

## 🧪 TESTING LOCAL (Antes de Deploy)

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `@netlify/functions@^2.8.2` - Types para Netlify Functions
- `netlify-cli@^17.40.0` - CLI de Netlify

### 2. Ejecutar Servidor de Desarrollo

```bash
npm run dev
```

Esto iniciará:
- **Vite dev server** en http://localhost:8080
- **Netlify Functions** emuladas localmente
- **Proxy automático** a `/.netlify/functions/*`

### 3. Probar el Formulario

1. Abrir http://localhost:8080 en el navegador
2. Scroll hasta el formulario de contacto
3. Llenar todos los campos
4. Hacer submit
5. Verificar:
   - ✅ Toast de éxito aparece
   - ✅ Lead aparece en Airtable
   - ✅ No hay errores en la consola del navegador

### 4. Probar Rate Limiting (Opcional)

```bash
# Terminal nueva (mientras npm run dev está corriendo)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:8080/.netlify/functions/submit-lead \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"Test$i\",\"email\":\"test$i@test.com\",\"empresa\":\"Test\",\"companySize\":\"1-10\",\"budget\":\"≤1.000€\",\"interest\":\"Automatización\"}"
  echo -e "\n"
done
```

**Resultado esperado:**
- Requests 1-5: `{"success":true,"message":"Solicitud recibida correctamente"}`
- Request 6: `{"error":"Demasiadas solicitudes. Intenta más tarde.","retryAfter":3600}`

---

## 🚀 DEPLOYMENT A PRODUCCIÓN

### Opción A: Auto-Deploy (Recomendado)

Netlify detectará los cambios automáticamente cuando hagas merge:

```bash
# 1. Asegúrate de tener todos los cambios commiteados
git status

# 2. Cambiar a main
git checkout main

# 3. Merge de la rama de seguridad
git merge claude/security-audit-report-01Y2pzgcdZzBGBQdFN9ybUKn

# 4. Push a main
git push origin main
```

**Netlify automáticamente:**
- Detectará el push
- Ejecutará `npm run build`
- Desplegará la nueva versión
- Las Netlify Functions estarán disponibles en `/.netlify/functions/submit-lead`

### Opción B: Deploy Manual

```bash
# Requiere Netlify CLI autenticado
npm run deploy
```

---

## ✅ VERIFICACIÓN POST-DEPLOY

### 1. Verificar que la Function está activa

```bash
curl https://t2xlabs.com/.netlify/functions/submit-lead \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":"invalid"}'
```

**Debe responder:**
```json
{"error":"Datos inválidos","details":"..."}
```

**Status code:** 400 (Bad Request)

Si responde así = ✅ **FUNCIONA CORRECTAMENTE**

### 2. Probar el Formulario en Producción

1. Ir a https://t2xlabs.com/#contact-form
2. Llenar formulario con datos reales
3. Submit
4. Verificar:
   - ✅ Toast de éxito
   - ✅ Lead en Airtable
   - ✅ No errores en consola

### 3. Verificar Headers de Seguridad

```bash
curl -I https://t2xlabs.com | grep -E "Content-Security-Policy|Strict-Transport|X-Frame"
```

**Debe mostrar:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; ...
```

### 4. Verificar que NO hay Credenciales Expuestas

```bash
# Descargar el bundle JS y buscar el token
curl https://t2xlabs.com/assets/*.js 2>/dev/null | grep -o "pat[a-zA-Z0-9]*" | head -5
```

**Resultado esperado:** NO debe aparecer tu token

### 5. Monitorear Logs de Netlify

**Ir a:** Netlify Dashboard → Functions → submit-lead

**Verificar:**
- ✅ Function se ejecuta sin errores
- ✅ Logs muestran "Lead submitted successfully"
- ✅ No aparecen errores de credenciales

---

## 🐛 TROUBLESHOOTING

### Error: "Missing Airtable credentials in environment variables"

**Causa:** Variables no configuradas en Netlify Dashboard

**Solución:**
1. Ir a Netlify Dashboard → Site settings → Environment variables
2. Verificar que existan `AIRTABLE_BASE_ID` y `AIRTABLE_TOKEN`
3. Verificar que NO tengan el prefijo `VITE_`
4. Re-desplegar el sitio

### Error: "Forbidden - Invalid origin" (403)

**Causa:** Request desde origen no permitido

**Solución:**
1. Verificar que estás usando el dominio correcto
2. Si es desarrollo local, verificar que usas `http://localhost:8080`
3. Si necesitas otro dominio, editar `allowedOrigins` en `netlify/functions/submit-lead.ts` (línea 112)

### Error: Function timeout

**Causa:** Posible error en la function o problema con Airtable API

**Solución:**
1. Ver logs en Netlify Dashboard → Functions → submit-lead
2. Verificar que las credenciales de Airtable son correctas
3. Verificar que la tabla "Leads" existe en Airtable

### Formulario envía pero no llega a Airtable

**Causa:** Honeypot detectó como bot O rate limit alcanzado

**Solución:**
1. Verificar en consola del navegador si hay errores
2. Esperar 1 hora y volver a intentar (rate limit)
3. Verificar que no hay extensiones de navegador llenando campos ocultos

---

## 📊 MONITORING

### Logs de Netlify Functions

**Ir a:** Netlify Dashboard → Functions → submit-lead → Logs

**Buscar:**
- `Lead submitted successfully` = ✅ Funcionando
- `Rate limit exceeded` = Spam detectado/bloqueado
- `Honeypot triggered` = Bot detectado
- `Validation error` = Datos inválidos enviados

### Métricas a Monitorear

- **Invocations:** Cuántas veces se llama la function
- **Errors:** Debe ser 0% en condiciones normales
- **Duration:** Debe ser <2 segundos
- **Bandwidth:** Uso de datos

---

## 🔐 SEGURIDAD POST-DEPLOY

### Revocar Token Antiguo (OBLIGATORIO)

Si aún no lo hiciste:

1. Ir a https://airtable.com/account
2. Personal access tokens
3. Buscar el token antiguo (el que estaba con VITE_)
4. Hacer clic en "Revoke"
5. Confirmar

**Esto invalida el token comprometido para siempre.**

### Verificar que el Token Antiguo NO funciona

```bash
# Intentar usar el token antiguo (debe fallar)
curl https://api.airtable.com/v0/appc5UH3PH6nQ2ODY/Leads \
  -H "Authorization: Bearer EL_TOKEN_VIEJO_AQUI"

# Debe responder 401 Unauthorized
```

---

## ✅ CHECKLIST COMPLETO

### Antes de Deploy:

- [x] Variables configuradas en `.env` local
- [ ] `npm install` ejecutado
- [ ] Testing local con `npm run dev` exitoso
- [ ] Formulario funciona en local
- [ ] Variables configuradas en Netlify Dashboard
- [ ] Token antiguo revocado en Airtable

### Después de Deploy:

- [ ] Function responde en producción
- [ ] Formulario envía datos a Airtable
- [ ] Headers de seguridad presentes
- [ ] No hay credenciales en bundle JS
- [ ] Logs de Netlify sin errores
- [ ] Rate limiting probado (opcional)

---

## 🎯 PRÓXIMOS PASOS

Una vez verificado que todo funciona:

1. **Monitorear** logs de Netlify por 24-48 horas
2. **Revisar** Airtable para detectar spam (si hay)
3. **Considerar** implementar Cloudflare Turnstile si hay spam
4. **Implementar Fase 2** del SECURITY_AUDIT.md (opcional)

---

**Configuración creada:** 16 Nov 2025
**Credenciales:** ✅ Nuevas (rotadas)
**Estado:** Listo para deploy
