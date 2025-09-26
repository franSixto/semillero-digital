'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserCourses, getStudentProgress, getUserProfile } from '@/lib/classroom';
import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Course } from '@/types/classroom';

interface CourseWithProgress {
  course: Course;
  progress: {
    totalAssignments: number;
    submittedCount: number;
    gradedCount: number;
    lateCount: number;
    averageGrade: number;
    completionPercentage: number;
  } | null;
}

export default function CoursesPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load courses data
  const loadCoursesData = async (token: string) => {
    if (!token.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user profile first
      const userResult = await getUserProfile(token);
      if (!userResult.success || !userResult.data) {
        setError('Failed to get user profile');
        return;
      }

      const user = userResult.data;

      // Get courses
      const coursesData = await getUserCourses(token);
      
      const coursesWithProgress: CourseWithProgress[] = [];

      // Get progress for each course
      for (const course of coursesData) {
        try {
          const progressResult = await getStudentProgress(course.id, user.id, token);
          
          let progress = null;
          if (progressResult.success && progressResult.data) {
            const progressData = progressResult.data;
            progress = {
              totalAssignments: progressData.totalAssignments,
              submittedCount: progressData.submittedCount,
              gradedCount: progressData.gradedCount,
              lateCount: progressData.lateCount,
              averageGrade: progressData.averageGrade,
              completionPercentage: progressData.completionPercentage
            };
          }

          coursesWithProgress.push({
            course,
            progress
          });
        } catch (courseError) {
          console.warn(`Error getting progress for course ${course.id}:`, courseError);
          coursesWithProgress.push({
            course,
            progress: null
          });
        }
      }

      setCourses(coursesWithProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't try to load data while auth is still loading
    if (authLoading) {
      return;
    }
    
    if (accessToken) {
      loadCoursesData(accessToken);
    } else {
      setLoading(false);
    }
  }, [accessToken, authLoading]);

  // Loading state (including auth loading)
  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando tus cursos...</p>
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
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Error al cargar cursos</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => accessToken && loadCoursesData(accessToken)}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Calculate totals
  const totalCourses = courses.length;
  const totalAssignments = courses.reduce((sum, { progress }) => 
    sum + (progress?.totalAssignments || 0), 0
  );
  const totalCompleted = courses.reduce((sum, { progress }) => 
    sum + (progress?.submittedCount || 0), 0
  );
  const totalPending = courses.reduce((sum, { progress }) => 
    sum + (progress ? (progress.totalAssignments - progress.submittedCount) : 0), 0
  );
  const totalOverdue = courses.reduce((sum, { progress }) => 
    sum + (progress?.lateCount || 0), 0
  );

  // Get course color based on progress
  const getCourseColor = (progress: CourseWithProgress['progress']) => {
    if (!progress) return 'bg-gray-500';
    
    if (progress.lateCount > 0) return 'bg-red-500';
    const pendingCount = progress.totalAssignments - progress.submittedCount;
    if (pendingCount > 0) return 'bg-orange-500';
    if (progress.completionPercentage >= 80) return 'bg-green-500';
    if (progress.completionPercentage >= 50) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Explora tus cursos y revisa tu progreso académico
          </p>
        </div>

        {/* Course Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tareas Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">En todos los cursos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
              <p className="text-xs text-muted-foreground">Tareas entregadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totalOverdue > 0 ? 'text-red-600' : totalPending > 0 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {totalPending + totalOverdue}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalOverdue > 0 ? `${totalOverdue} atrasadas` : 'Por entregar'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(({ course, progress }) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getCourseColor(progress)}`}></div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{course.name}</CardTitle>
                    <CardDescription className="text-sm truncate">
                      {course.section || 'Sin sección'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {course.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                
                {progress ? (
                  <div className="space-y-3 mb-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{progress.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      {progress.lateCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {progress.lateCount} atrasadas
                        </Badge>
                      )}
                      {(progress.totalAssignments - progress.submittedCount) > 0 && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                          {progress.totalAssignments - progress.submittedCount} pendientes
                        </Badge>
                      )}
                      {progress.submittedCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {progress.submittedCount} completadas
                        </Badge>
                      )}
                    </div>

                    {/* Grade Average */}
                    {progress.averageGrade > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Promedio: </span>
                        <span className="font-medium">{progress.averageGrade}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-4">
                    Cargando progreso...
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(`/progress?course=${course.id}`, '_blank')}
                  >
                    Ver Mi Progreso
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(course.alternateLink, '_blank')}
                  >
                    Abrir en Classroom
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">No tienes cursos aún</h3>
              <p className="text-muted-foreground mb-4">
                Parece que no estás inscrito en ningún curso de Google Classroom
              </p>
              <Button onClick={() => accessToken && loadCoursesData(accessToken)}>
                <span className="mr-2">🔄</span>
                Actualizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        {courses.length > 0 && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => accessToken && loadCoursesData(accessToken)} 
              variant="outline"
              disabled={loading || !accessToken}
            >
              {loading ? 'Actualizando...' : 'Actualizar Cursos'}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
