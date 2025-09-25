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
