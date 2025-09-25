import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data for demonstration
const courses = [
  {
    id: '1',
    name: 'Programación Web Avanzada',
    description: 'Desarrollo de aplicaciones web modernas con React y Next.js',
    subject: 'Programación',
    students: 28,
    assignments: 12,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Bases de Datos',
    description: 'Diseño y gestión de bases de datos relacionales y NoSQL',
    subject: 'Bases de Datos',
    students: 32,
    assignments: 8,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Algoritmos y Estructuras de Datos',
    description: 'Fundamentos de algoritmos y estructuras de datos eficientes',
    subject: 'Algoritmos',
    students: 25,
    assignments: 15,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    name: 'Desarrollo Mobile',
    description: 'Creación de aplicaciones móviles nativas y multiplataforma',
    subject: 'Mobile',
    students: 22,
    assignments: 10,
    color: 'bg-orange-500'
  },
  {
    id: '5',
    name: 'Inteligencia Artificial',
    description: 'Introducción a machine learning y redes neuronales',
    subject: 'IA',
    students: 18,
    assignments: 6,
    color: 'bg-red-500'
  },
  {
    id: '6',
    name: 'Ciberseguridad',
    description: 'Principios de seguridad informática y ethical hacking',
    subject: 'Seguridad',
    students: 20,
    assignments: 9,
    color: 'bg-gray-500'
  }
];

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus cursos del Semillero Digital
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span>
          Nuevo Curso
        </Button>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.students, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.assignments, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${course.color}`}></div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {course.subject}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {course.description}
              </p>
              
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>👥 {course.students} estudiantes</span>
                <span>📝 {course.assignments} tareas</span>
              </div>

              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/courses/${course.id}`}>
                    Ver Curso
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/courses/${course.id}/assignments`}>
                    Tareas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no courses) */}
      {courses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No tienes cursos aún</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primer curso para el Semillero Digital
            </p>
            <Button>
              <span className="mr-2">➕</span>
              Crear Primer Curso
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
