import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Classroom Semillero
          <span className="block text-primary">Digital</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma educativa integrada con Google Classroom para potenciar 
          el aprendizaje en el Semillero Digital
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/courses">Ver Cursos</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Características Principales
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Herramientas diseñadas para facilitar la gestión educativa y 
            mejorar la experiencia de aprendizaje
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🎓</div>
              <CardTitle>Gestión de Cursos</CardTitle>
              <CardDescription>
                Administra todos tus cursos de manera centralizada con 
                integración completa a Google Classroom
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">📝</div>
              <CardTitle>Tareas y Evaluaciones</CardTitle>
              <CardDescription>
                Crea, asigna y califica tareas de forma eficiente con 
                herramientas avanzadas de seguimiento
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">👥</div>
              <CardTitle>Gestión de Estudiantes</CardTitle>
              <CardDescription>
                Monitorea el progreso de tus estudiantes y facilita 
                la comunicación en tiempo real
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">📊</div>
              <CardTitle>Análisis y Reportes</CardTitle>
              <CardDescription>
                Obtén insights detallados sobre el rendimiento académico 
                y la participación estudiantil
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🔗</div>
              <CardTitle>Integración Google</CardTitle>
              <CardDescription>
                Sincronización automática con Google Classroom, Drive 
                y otras herramientas de Google Workspace
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">📱</div>
              <CardTitle>Acceso Multiplataforma</CardTitle>
              <CardDescription>
                Accede desde cualquier dispositivo con una interfaz 
                responsiva y moderna
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Semillero Digital en Números
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-4 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Estudiantes Activos</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">25+</div>
            <div className="text-muted-foreground">Cursos Disponibles</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">15+</div>
            <div className="text-muted-foreground">Profesores</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">Satisfacción</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          ¿Listo para comenzar?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Únete al Semillero Digital y transforma tu experiencia educativa 
          con nuestras herramientas innovadoras
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Registrarse</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
