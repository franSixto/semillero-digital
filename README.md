# Classroom Semillero Digital

Plataforma educativa integrada con Google Classroom para potenciar el aprendizaje en el Semillero Digital.

## Características

- **Integración con Google Classroom**: Sincronización automática con cursos, tareas y estudiantes
- **Gestión de Cursos**: Administración centralizada de todos los cursos
- **Sistema de Tareas**: Creación, asignación y calificación de tareas
- **Dashboard Interactivo**: Visualización de estadísticas y actividad reciente
- **Modo Oscuro**: Soporte completo para tema claro/oscuro
- **Diseño Responsivo**: Interfaz optimizada para todos los dispositivos
- **Tipografía Moderna**: Fuente Raleway para una mejor experiencia visual

## Tecnologías

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **UI Components**: Componentes personalizados con Radix UI patterns
- **Autenticación**: Google OAuth 2.0
- **API**: Google Classroom API

## Configuración de Variables de Entorno

Para configurar la aplicación, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Para desarrollo
# NEXT_PUBLIC_BASE_URL=https://tu-dominio.com  # Para producción

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# URL de redirección OAuth
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/oauth/callback  # Para desarrollo
# NEXT_PUBLIC_REDIRECT_URI=https://tu-dominio.com/oauth/callback  # Para producción
```

### Configuración de Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Classroom API**
4. Ve a **Credenciales** > **Crear credenciales** > **ID de cliente OAuth 2.0**
5. Configura las URLs de redirección autorizadas:
   - Desarrollo: `http://localhost:3000/oauth/callback`
   - Producción: `https://tu-dominio.com/oauth/callback`

**⚠️ Importante**: Nunca subas el archivo `.env.local` al repositorio. El `GOOGLE_CLIENT_SECRET` debe mantenerse privado.

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js 15
│   ├── dashboard/         # Dashboard principal
│   ├── courses/           # Gestión de cursos
│   │   └── [id]/         # Páginas dinámicas de cursos
│   ├── assignments/       # Sistema de tareas
│   ├── grades/           # Calificaciones
│   └── auth/             # Autenticación
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Card, etc.)
│   ├── layout/           # Componentes de layout (Header, etc.)
│   └── classroom/        # Componentes específicos de Classroom
├── lib/                  # Utilidades y configuraciones
│   ├── classroom-api.ts  # Cliente API de Google Classroom
│   ├── auth.ts          # Gestión de autenticación
│   └── utils.ts         # Funciones utilitarias
└── types/               # Definiciones de tipos TypeScript
    ├── classroom.ts     # Tipos de Google Classroom API
    ├── app.ts          # Tipos específicos de la aplicación
    └── index.ts        # Exportaciones centralizadas
