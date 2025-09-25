'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardStats } from '@/lib/classroom';
import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Course, Assignment } from '@/types/classroom';

interface CourseStats {
  courseId: string;
  courseName: string;
  studentsCount: number;
  assignmentsCount: number;
  teachersCount: number;
  recentAssignments: Assignment[];
}

interface RecentActivity {
  type: string;
  title: string;
  courseName: string;
  courseId: string;
  creationTime: string;
}

interface DashboardData {
  totalCourses: number;
  totalStudents: number;
  totalAssignments: number;
  totalTeachers: number;
  courses: Course[];
  courseStats: CourseStats[];
  recentActivity: RecentActivity[];
}

export default function DashboardPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async (token: string) => {
    if (!token.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getDashboardStats(token);
      
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

  // Loading state (including auth loading)
  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>{authLoading ? 'Verificando autenticación...' : 'Cargando datos del dashboard...'}</p>
            </div>
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

  // Main dashboard with real data
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Panel de control del Semillero Digital - Datos de Google Classroom
          </p>
        </div>

      {/* Stats Cards with Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Cursos de Google Classroom
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Total en todos los cursos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Tareas creadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesores</CardTitle>
            <span className="text-2xl">👨‍🏫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Total de profesores
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity with Real Data */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas tareas creadas en tus cursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.courseName} • {new Date(activity.creationTime).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Cursos</CardTitle>
            <CardDescription>
              Resumen de tus cursos activos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {course.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.section || 'Sin sección'}
                  </p>
                </div>
              </div>
            ))}
            {dashboardData.courses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay cursos disponibles
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
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
