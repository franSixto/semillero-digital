# Variables de Entorno Requeridas

## 📋 Variables de Entorno Necesarias

Para que la aplicación funcione correctamente tanto en desarrollo como en producción, necesitas configurar las siguientes variables de entorno:

### 🔑 Variables Públicas (NEXT_PUBLIC_*)
Estas variables son accesibles desde el cliente:

```bash
# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Desarrollo
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com  # Producción

# Google OAuth Client ID (público)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com

# URL de redirección OAuth
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/oauth/callback  # Desarrollo
NEXT_PUBLIC_REDIRECT_URI=https://tu-dominio.com/oauth/callback  # Producción
```

### 🔒 Variables Privadas (Solo servidor)
Estas variables son solo accesibles desde el servidor:

```bash
# Google OAuth Client Secret (PRIVADO - NO EXPONER)
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

## 🛠️ Configuración por Entorno

### Desarrollo Local
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/oauth/callback
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### Producción
En tu plataforma de deployment (Vercel, Netlify, etc.), configura:

```bash
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_REDIRECT_URI=https://tu-dominio.com/oauth/callback
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

## 🔧 Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Classroom API
4. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente OAuth 2.0"
5. Configura las URLs de redirección autorizadas:
   - Desarrollo: `http://localhost:3000/oauth/callback`
   - Producción: `https://tu-dominio.com/oauth/callback`

## ⚠️ Notas Importantes

- **NUNCA** subas el archivo `.env.local` al repositorio
- El `GOOGLE_CLIENT_SECRET` debe mantenerse privado
- Las variables `NEXT_PUBLIC_*` serán visibles en el cliente
- Asegúrate de que las URLs de redirección coincidan exactamente en Google Cloud Console

## 🚀 Verificación

Para verificar que las variables están configuradas correctamente:

1. Reinicia el servidor de desarrollo después de agregar variables
2. Verifica en la consola del navegador que no hay errores de OAuth
3. Prueba el flujo de autenticación completo

## 📁 Estructura de Archivos de Entorno

```
proyecto/
├── .env.local          # Variables locales (NO subir al repo)
├── .env.example        # Ejemplo de variables (opcional)
├── ENV_SETUP.md        # Esta documentación
└── .gitignore          # Debe incluir .env*
```

## 🔗 URLs Utilizadas en el Código

El código ahora usa automáticamente estas variables:

- `process.env.NEXT_PUBLIC_BASE_URL` - URL base de la aplicación
- `process.env.NEXT_PUBLIC_REDIRECT_URI` - URL de redirección OAuth
- `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Client ID de Google
- `process.env.GOOGLE_CLIENT_SECRET` - Client Secret de Google (servidor)

Si no se proporcionan, el código usará valores por defecto para desarrollo local.
