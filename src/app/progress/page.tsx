'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/app-layout';
import { Accordion } from '@/components/ui/accordion';
import { CourseAccordion } from '@/components/progress/course-accordion';
import { useAuth } from '@/contexts/auth-context';
import { getUserCourses, getStudentProgress } from '@/lib/classroom';
import { Course } from '@/types/classroom';
import { StudentProgress } from '@/types/app';

interface CourseWithProgress {
  course: Course;
  progress: StudentProgress | null;
  loading: boolean;
  error: string | null;
}

export default function ProgressPage() {
  const { accessToken, user } = useAuth();
  const searchParams = useSearchParams();
  const courseFilter = searchParams.get('course');
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgressData = useCallback(async () => {
    if (!accessToken || !user) return;

    setLoading(true);
    setError(null);

    try {
      const userCourses = await getUserCourses(accessToken);
      
      // Filter courses if courseFilter is provided
      const filteredCourses = courseFilter 
        ? userCourses.filter(course => course.id === courseFilter)
        : userCourses;
      
      // Initialize courses with loading state
      const coursesWithProgress: CourseWithProgress[] = filteredCourses.map(course => ({
        course,
        progress: null,
        loading: true,
        error: null
      }));
      
      setCourses(coursesWithProgress);

      // Load progress for each course
      for (let i = 0; i < coursesWithProgress.length; i++) {
        const courseItem = coursesWithProgress[i];
        
        try {
          const progressResult = await getStudentProgress(
            courseItem.course.id, 
            user.id, 
            accessToken
          );

          setCourses(prev => prev.map((item, index) => 
            index === i 
              ? {
                  ...item,
                  progress: progressResult.success ? (progressResult.data || null) : null,
                  loading: false,
                  error: progressResult.success ? null : progressResult.error || 'Error loading progress'
                }
              : item
          ));
        } catch (err) {
          setCourses(prev => prev.map((item, index) => 
            index === i 
              ? {
                  ...item,
                  loading: false,
                  error: err instanceof Error ? err.message : 'Unknown error'
                }
              : item
          ));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading courses');
    } finally {
      setLoading(false);
    }
  }, [accessToken, user, courseFilter]);

  useEffect(() => {
    if (accessToken && user) {
      loadProgressData();
    }
  }, [accessToken, user, loadProgressData]);


  if (loading && courses.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando tu progreso académico...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

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
              <Button onClick={loadProgressData} className="w-full">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {courseFilter && courses.length > 0 
              ? `Progreso en ${courses[0].course.name}`
              : 'Mi Progreso Académico'
            }
          </h1>
          <p className="text-muted-foreground">
            {courseFilter && courses.length > 0
              ? `Seguimiento detallado de tu rendimiento en este curso`
              : 'Seguimiento de tu rendimiento en todos los cursos'
            }
          </p>
          {courseFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.href = '/progress'}
            >
              ← Ver todos los cursos
            </Button>
          )}
        </div>

        <Accordion className="space-y-4">
          {courses.map((courseItem, index) => (
            <CourseAccordion
              key={courseItem.course.id}
              course={courseItem.course}
              progress={courseItem.progress}
              loading={courseItem.loading}
              error={courseItem.error}
              onRetry={() => {
                // Reload this specific course
                setCourses(prev => prev.map((item, i) => 
                  i === index ? { ...item, loading: true, error: null } : item
                ));
                // Trigger reload for this specific course
                if (accessToken && user) {
                  getStudentProgress(courseItem.course.id, user.id, accessToken)
                    .then(progressResult => {
                      setCourses(prev => prev.map((item, i) => 
                        i === index 
                          ? {
                              ...item,
                              progress: progressResult.success ? (progressResult.data || null) : null,
                              loading: false,
                              error: progressResult.success ? null : progressResult.error || 'Error loading progress'
                            }
                          : item
                      ));
                    })
                    .catch(err => {
                      setCourses(prev => prev.map((item, i) => 
                        i === index 
                          ? {
                              ...item,
                              loading: false,
                              error: err instanceof Error ? err.message : 'Unknown error'
                            }
                          : item
                      ));
                    });
                }
              }}
            />
          ))}
        </Accordion>

        {courses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes cursos disponibles</p>
            <Button onClick={loadProgressData}>
              Actualizar
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
