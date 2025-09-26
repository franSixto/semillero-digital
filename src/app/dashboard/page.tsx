'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStudentDashboardSummary } from '@/lib/classroom';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { AppLayout } from '@/components/layout/app-layout';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import { CoordinatorDashboard } from '@/components/dashboard/coordinator-dashboard';
import { Course } from '@/types/classroom';

interface StudentDashboardData {
  totalCourses: number;
  totalPendingAssignments: number;
  totalOverdueAssignments: number;
  averageGrade: number;
  courses: Course[];
  upcomingDeadlines: Array<{
    assignmentTitle: string;
    courseName: string;
    courseId: string;
    dueDate: string;
    isOverdue: boolean;
    alternateLink: string;
  }>;
}

export default function DashboardPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { currentRole } = useRole();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async (token: string) => {
    if (!token.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getStudentDashboardSummary(token);
      
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Error al cargar datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    // Don't try to load data while auth is still loading
    if (authLoading) {
      return;
    }
    
    if (accessToken) {
      loadDashboardData(accessToken);
    } else {
      setLoading(false);
    }
  }, [accessToken, authLoading]);

  // Show role-specific dashboards
  if (currentRole === 'teacher') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <TeacherDashboard />
        </div>
      </AppLayout>
    );
  }

  if (currentRole === 'coordinator') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <CoordinatorDashboard />
        </div>
      </AppLayout>
    );
  }

  // Student dashboard (default)
  // Loading state (including auth loading)
  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando tu dashboard de estudiante...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => accessToken && loadDashboardData(accessToken)} className="w-full">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // If no data yet, show loading or empty state
  if (!dashboardData) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Cargando datos de Google Classroom...
            </p>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Obteniendo datos de tus cursos...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Main dashboard with student-focused data
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido de vuelta!</h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu progreso académico
          </p>
        </div>

        {/* Upcoming Deadlines */}
        {dashboardData.upcomingDeadlines.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⏰</span>
                Próximas Entregas
              </CardTitle>
              <CardDescription>
                Tareas que requieren tu atención pronto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        deadline.isOverdue ? 'bg-destructive' : 'bg-orange-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">{deadline.assignmentTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {deadline.courseName} • {new Date(deadline.dueDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant={deadline.isOverdue ? "destructive" : "default"}
                      onClick={() => window.open(deadline.alternateLink, '_blank')}
                    >
                      {deadline.isOverdue ? 'Entregar Ahora' : 'Entregar'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student-focused Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Cursos</CardTitle>
              <span className="text-2xl">📚</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                Cursos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
              <span className="text-2xl">📝</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.totalPendingAssignments}
              </div>
              <p className="text-xs text-muted-foreground">
                Por entregar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Atrasadas</CardTitle>
              <span className="text-2xl">⚠️</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                dashboardData.totalOverdueAssignments > 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {dashboardData.totalOverdueAssignments}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.totalOverdueAssignments > 0 ? 'Requieren atención' : 'Todo al día'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.averageGrade > 0 ? dashboardData.averageGrade : '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.averageGrade > 0 ? 'Calificación promedio' : 'Sin calificaciones'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🚀</span>
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.location.href = '/progress'}
              >
                <span className="mr-2">📊</span>
                Ver Mi Progreso Detallado
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.location.href = '/courses'}
              >
                <span className="mr-2">📚</span>
                Explorar Mis Cursos
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.location.href = '/assignments'}
              >
                <span className="mr-2">📝</span>
                Ver Todas las Tareas
              </Button>
            </CardContent>
          </Card>

          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📚</span>
                Mis Cursos
              </CardTitle>
              <CardDescription>
                Vista rápida de tus cursos activos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.courses.slice(0, 4).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {course.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.section || 'Sin sección'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => window.open(course.alternateLink, '_blank')}
                  >
                    Abrir
                  </Button>
                </div>
              ))}
              {dashboardData.courses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay cursos disponibles
                </p>
              )}
              {dashboardData.courses.length > 4 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/courses'}
                >
                  Ver todos los cursos ({dashboardData.courses.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        

        {/* Refresh Button */}
        <div className="text-center">
          <Button 
            onClick={() => accessToken && loadDashboardData(accessToken)} 
            variant="outline"
            disabled={loading || !accessToken}
          >
            {loading ? 'Actualizando...' : 'Actualizar Datos'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
