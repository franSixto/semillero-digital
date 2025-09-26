# Classroom Semillero Digital

Plataforma educativa integrada con Google Classroom para potenciar el aprendizaje en el Semillero Digital. Sistema completo de gestión académica con roles diferenciados para estudiantes, profesores y coordinadores.

## 🚀 Características Principales

### **Sistema de Roles Multi-Usuario**
- **Estudiante**: Dashboard personalizado, seguimiento de progreso, gestión de tareas
- **Profesor**: Gestión de estudiantes asignados, comunicación por email, reportes detallados
- **Coordinador**: Supervisión general, asignación automática de estudiantes, métricas globales

### **Integración Completa con Google Classroom**
- **Sincronización en Tiempo Real**: Datos auténticos de cursos, tareas y estudiantes
- **Autenticación OAuth 2.0**: Login seguro con cuentas de Google
- **API Completa**: Acceso a todas las funcionalidades de Google Classroom

### **Gestión Inteligente**
- **Auto-asignación de Estudiantes**: Algoritmo inteligente basado en especialización y carga de trabajo
- **Sistema de Alertas**: Identificación proactiva de estudiantes en riesgo
- **Comunicación Directa**: Sistema de emails integrado para profesores
- **Reportes Avanzados**: Generación automática de reportes por rol

### **Experiencia de Usuario**
- **Dashboards Especializados**: Información relevante para cada tipo de usuario
- **Navegación Contextual**: Menús dinámicos según el rol activo
- **Diseño Responsivo**: Interfaz optimizada para móvil y desktop
- **Modo Oscuro**: Soporte completo para tema claro/oscuro

## Tecnologías

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **UI Components**: Componentes personalizados con Radix UI patterns
- **Autenticación**: Google OAuth 2.0
- **API**: Google Classroom API

## 🛠️ Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta de Google con acceso a Google Cloud Console

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/classroom-semillero-digital.git
cd classroom-semillero-digital
```

### **2. Instalar Dependencias**
```bash
npm install
# o
yarn install
```

### **3. Configurar Variables de Entorno**
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:5001  # Puerto por defecto del proyecto

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# URL de redirección OAuth
NEXT_PUBLIC_REDIRECT_URI=http://localhost:5001/oauth/callback
```

### **4. Levantar el Proyecto**
```bash
# Desarrollo con Turbopack (recomendado)
npm run dev

# Desarrollo estándar
npm run dev -- --no-turbo

# El servidor estará disponible en http://localhost:5001
```

### **5. Compilar para Producción**
```bash
# Compilar el proyecto
npm run build

# Iniciar en modo producción
npm start
```

### **6. Configuración de Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Classroom API**
4. Ve a **Credenciales** > **Crear credenciales** > **ID de cliente OAuth 2.0**
5. Configura las URLs de redirección autorizadas:
   - Desarrollo: `http://localhost:5001/oauth/callback`
   - Producción: `https://tu-dominio.com/oauth/callback`

**⚠️ Importante**: Nunca subas el archivo `.env.local` al repositorio. El `GOOGLE_CLIENT_SECRET` debe mantenerse privado.

### **7. Verificar la Instalación**
Una vez levantado el proyecto, deberías poder:
- Acceder a `http://localhost:5001`
- Hacer login con tu cuenta de Google
- Ver el dashboard según tu rol (estudiante/profesor/coordinador)
- Navegar entre las diferentes secciones

## 📁 Estructura del Proyecto

```
src/
├── app/                           # App Router de Next.js 15
│   ├── dashboard/                # Dashboard principal con switch de roles
│   ├── courses/                  # Gestión de cursos
│   │   └── [id]/                # Páginas dinámicas de cursos
│   ├── assignments/              # Sistema de tareas para estudiantes
│   ├── progress/                 # Seguimiento de progreso estudiantil
│   ├── auth/                     # Autenticación y callbacks
│   ├── coordinator/              # Páginas específicas del coordinador
│   │   ├── students/            # Gestión de estudiantes
│   │   └── teachers/            # Gestión de profesores
│   ├── teacher/                  # Páginas específicas del profesor
│   │   ├── students/            # Estudiantes asignados
│   │   ├── commissions/         # Comisiones del profesor
│   │   ├── alerts/              # Centro de alertas
│   │   └── reports/             # Generación de reportes
│   └── debug/                    # Herramientas de debugging
│       └── permissions/         # Diagnóstico de permisos
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes base (Button, Card, etc.)
│   ├── layout/                  # Componentes de layout (Header, etc.)
│   ├── dashboard/               # Dashboards especializados por rol
│   ├── auth/                    # Componentes de autenticación
│   └── teacher/                 # Componentes específicos del profesor
├── contexts/                    # Contextos de React
│   ├── auth-context.tsx        # Contexto de autenticación
│   └── role-context.tsx        # Contexto de roles multi-usuario
├── lib/                        # Utilidades y configuraciones
│   ├── classroom.ts            # Cliente completo de Google Classroom API
│   ├── auth.ts                 # Gestión de autenticación OAuth
│   └── utils.ts                # Funciones utilitarias
└── types/                      # Definiciones de tipos TypeScript
    ├── classroom.ts            # Tipos de Google Classroom API
    ├── app.ts                  # Tipos específicos de la aplicación
    └── index.ts                # Exportaciones centralizadas
```

## 🎯 Funcionalidades por Rol

### **👨‍🎓 Estudiante**
- **Dashboard Personalizado**: Métricas de progreso, tareas pendientes y próximas entregas
- **Gestión de Tareas**: Vista completa de todas las asignaciones con estados
- **Seguimiento de Progreso**: Análisis detallado del rendimiento académico
- **Navegación a Google Classroom**: Enlaces directos para entregar tareas

### **👨‍🏫 Profesor**
- **Gestión de Estudiantes**: Lista completa de estudiantes asignados con filtros avanzados
- **Sistema de Comunicación**: Envío de emails individuales y masivos a estudiantes en riesgo
- **Centro de Alertas**: Priorización de alertas por severidad (crítica, alta, media, baja)
- **Reportes Detallados**: Generación automática de reportes por estudiante y comisión
- **Vista de Comisiones**: Análisis del estado de cada comisión con métricas en tiempo real

### **👨‍💼 Coordinador**
- **Dashboard General**: Métricas globales del semillero completo
- **Auto-asignación Inteligente**: Algoritmo que asigna estudiantes a profesores basado en:
  - Especialización del profesor en la materia
  - Carga de trabajo actual
  - Cursos compartidos
- **Gestión de Profesores**: Vista completa de todos los profesores y su carga de trabajo
- **Supervisión de Estudiantes**: Identificación de estudiantes sin asignar y en riesgo
- **Alertas Críticas**: Sistema de alertas que requieren intervención del coordinador

## 🔧 Arquitectura Técnica

### **Sistema de Tipos TypeScript**
El proyecto utiliza un sistema de tipos robusto y completamente tipado:

```typescript
// Tipos principales de la aplicación
export type UserRole = 'student' | 'teacher' | 'coordinator';

export interface TeacherData {
  assignedStudents: StudentAssignment[];
  courses: AppCourse[];
  commissions: Commission[];
  studentProgress: TeacherStudentProgress[];
}

export interface CoordinatorData {
  allCommissions: Commission[];
  teacherAssignments: TeacherAssignment[];
  overallMetrics: CoordinatorMetrics;
  alerts: StudentAlert[];
}
```

### **Contextos de React**
- **AuthContext**: Gestión de autenticación OAuth con Google
- **RoleContext**: Sistema de roles con persistencia en localStorage

### **Integración con Google Classroom API**
```typescript
// Funciones principales implementadas
- getUserCourses(accessToken): Obtiene cursos del usuario
- getStudentProgress(courseId, userId, accessToken): Calcula progreso
- getTeacherDashboardStats(accessToken): Estadísticas para profesores
- getCoordinatorDashboardStats(accessToken): Métricas para coordinadores
- autoAssignStudents(accessToken): Asignación automática inteligente
```

## 🚨 Solución de Problemas

### **Error 500 Internal Server Error**
Si encuentras este error al levantar el proyecto:
1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Compila el proyecto: `npm run build`
3. Verifica que el puerto 5001 esté libre: `lsof -ti:5001`
4. Si hay un proceso usando el puerto: `kill -9 <PID>`

### **Errores de TypeScript**
El proyecto utiliza tipado estricto. Los errores comunes incluyen:
- `Unexpected any. Specify a different type`: Usar interfaces específicas
- Propiedades faltantes en interfaces: Verificar que los objetos cumplan con las interfaces

### **Problemas de Autenticación**
- Verificar que las credenciales de Google Cloud estén correctas
- Confirmar que las URLs de redirección coincidan exactamente
- Revisar que la Google Classroom API esté habilitada

## 🤝 Contribución

### **Estándares de Código**
- **TypeScript**: Tipado estricto, sin uso de `any`
- **ESLint**: Configuración estricta para mantener calidad del código
- **Componentes**: Uso de Radix UI patterns para consistencia
- **Estilos**: Tailwind CSS con tokens semánticos

### **Estructura de Commits**
```bash
feat: nueva funcionalidad
fix: corrección de errores
docs: actualización de documentación
style: cambios de estilo sin afectar funcionalidad
refactor: refactorización de código
test: adición o corrección de tests
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Crear un issue en GitHub
2. Proporcionar información detallada del problema
3. Incluir pasos para reproducir el error
4. Especificar el entorno (OS, Node.js version, etc.)

---

**Desarrollado con ❤️ para el Semillero Digital**
