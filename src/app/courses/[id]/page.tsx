import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CoursePageProps {
  params: {
    id: string;
  };
}

// Mock course data
const getCourseData = (id: string) => {
  const courses = {
    '1': {
      id: '1',
      name: 'Programación Web Avanzada',
      description: 'Desarrollo de aplicaciones web modernas con React y Next.js',
      subject: 'Programación',
      students: 28,
      assignments: 12,
      color: 'bg-blue-500',
      teacher: 'Prof. María García',
      schedule: 'Lunes y Miércoles 14:00-16:00',
      room: 'Aula 301'
    },
    '2': {
      id: '2',
      name: 'Bases de Datos',
      description: 'Diseño y gestión de bases de datos relacionales y NoSQL',
      subject: 'Bases de Datos',
      students: 32,
      assignments: 8,
      color: 'bg-green-500',
      teacher: 'Prof. Carlos López',
      schedule: 'Martes y Jueves 10:00-12:00',
      room: 'Laboratorio 2'
    }
  };

  return courses[id as keyof typeof courses] || null;
};

const recentAssignments = [
  {
    id: '1',
    title: 'Proyecto Final - E-commerce',
    dueDate: '2024-01-15',
    submitted: 18,
    total: 28,
    status: 'active'
  },
  {
    id: '2',
    title: 'Práctica - Hooks en React',
    dueDate: '2024-01-10',
    submitted: 25,
    total: 28,
    status: 'grading'
  },
  {
    id: '3',
    title: 'Quiz - JavaScript ES6+',
    dueDate: '2024-01-05',
    submitted: 28,
    total: 28,
    status: 'completed'
  }
];

const recentStudents = [
  { id: '1', name: 'Ana Rodríguez', email: 'ana@example.com', lastActive: '2024-01-08' },
  { id: '2', name: 'Luis Martínez', email: 'luis@example.com', lastActive: '2024-01-08' },
  { id: '3', name: 'Carmen Silva', email: 'carmen@example.com', lastActive: '2024-01-07' },
  { id: '4', name: 'Diego Herrera', email: 'diego@example.com', lastActive: '2024-01-07' }
];

export default function CoursePage({ params }: CoursePageProps) {
  const course = getCourseData(params.id);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">Curso no encontrado</h3>
            <p className="text-muted-foreground mb-4">
              El curso que buscas no existe o no tienes permisos para verlo
            </p>
            <Button asChild>
              <Link href="/courses">Volver a Cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-6 h-6 rounded-full ${course.color}`}></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>👨‍🏫 {course.teacher}</span>
          <span>📅 {course.schedule}</span>
          <span>🏫 {course.room}</span>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.students}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.assignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Participación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tareas Recientes</CardTitle>
              <CardDescription>Últimas actividades del curso</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/courses/${course.id}/assignments`}>Ver Todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence: {new Date(assignment.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {assignment.submitted}/{assignment.total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.status === 'active' && 'Activa'}
                      {assignment.status === 'grading' && 'Calificando'}
                      {assignment.status === 'completed' && 'Completada'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Estudiantes</CardTitle>
              <CardDescription>Actividad reciente de estudiantes</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/courses/${course.id}/students`}>Ver Todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Última actividad: {new Date(student.lastActive).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona tu curso de manera eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="justify-start" variant="outline">
              <span className="mr-2">➕</span>
              Nueva Tarea
            </Button>
            <Button className="justify-start" variant="outline">
              <span className="mr-2">📊</span>
              Ver Calificaciones
            </Button>
            <Button className="justify-start" variant="outline">
              <span className="mr-2">👥</span>
              Gestionar Estudiantes
            </Button>
            <Button className="justify-start" variant="outline">
              <span className="mr-2">⚙️</span>
              Configurar Curso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
