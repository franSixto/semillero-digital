'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Course } from '@/types/classroom';
import { StudentProgress } from '@/types/app';

interface CourseAccordionProps {
  course: Course;
  progress: StudentProgress | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function CourseAccordion({ course, progress, loading, error, onRetry }: CourseAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };


  const getPendingAssignments = () => {
    if (!progress) return [];
    return progress.submissions.filter(sub => 
      sub.state === 'NEW' || sub.state === 'CREATED'
    );
  };

  const getOverdueAssignments = () => {
    if (!progress) return [];
    return progress.submissions.filter(sub => sub.late && sub.state !== 'TURNED_IN');
  };

  return (
    <AccordionItem value={course.id}>
      <Card className="overflow-hidden">
        <AccordionTrigger
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
          className="hover:bg-muted/50 px-6 py-4"
        >
          <div className="flex items-center justify-between w-full">
            {/* Left Section - Course Info */}
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-semibold text-lg text-foreground truncate">{course.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {course.section || 'Sin sección'}
              </p>
            </div>

            {/* Right Section - Status and Progress */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : error ? (
                <div className="text-sm text-destructive font-medium">Error</div>
              ) : progress ? (
                <>
                  {/* Status Indicators */}
                  <div className="flex items-center gap-2">
                    {getOverdueAssignments().length > 0 ? (
                      <div className="flex items-center gap-1 text-destructive">
                        <span className="text-xs">⚠️</span>
                        <span className="text-sm font-medium">
                          {getOverdueAssignments().length} atrasada{getOverdueAssignments().length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : getPendingAssignments().length > 0 ? (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <span className="text-xs">📋</span>
                        <span className="text-sm font-medium">
                          {getPendingAssignments().length} pendiente{getPendingAssignments().length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <span className="text-xs">✅</span>
                        <span className="text-sm font-medium">Al día</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Percentage */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      {progress.completionPercentage}%
                    </div>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(progress.completionPercentage)}`}
                        style={{ width: `${progress.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Average Grade */}
                  {progress.averageGrade > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Promedio</div>
                      <div className="text-sm font-bold text-foreground">
                        {progress.averageGrade}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Sin datos</div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent isOpen={isOpen}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando progreso...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
          ) : progress ? (
            <div className="space-y-6 pt-2">
              {/* Detailed Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {progress.totalAssignments}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tareas</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {progress.submittedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Entregadas</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {progress.gradedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Calificadas</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${
                    progress.lateCount > 0 ? 'text-destructive' : 'text-foreground'
                  }`}>
                    {progress.lateCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Tardías</div>
                </div>
              </div>

              {/* Pending Assignments Section */}
              {getPendingAssignments().length > 0 && (
                <div className="bg-muted/30 rounded-lg p-6 border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 dark:text-orange-400">📋</span>
                      <h4 className="font-semibold text-foreground">
                        Tareas Pendientes ({getPendingAssignments().length})
                      </h4>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(course.alternateLink, '_blank')}
                    >
                      Ver en Classroom
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {getPendingAssignments().map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="font-medium text-sm text-foreground truncate">
                            {submission.assignmentTitle}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Creada: {new Date(submission.creationTime).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="flex-shrink-0"
                          onClick={() => window.open(submission.alternateLink, '_blank')}
                        >
                          Entregar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue Assignments Section */}
              {getOverdueAssignments().length > 0 && (
                <div className="bg-muted/30 rounded-lg p-6 border-l-4 border-l-destructive">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-destructive">⚠️</span>
                      <h4 className="font-semibold text-foreground">
                        Tareas Atrasadas ({getOverdueAssignments().length})
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {getOverdueAssignments().map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="font-medium text-sm text-foreground truncate">
                            {submission.assignmentTitle}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Creada: {new Date(submission.creationTime).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-shrink-0"
                          onClick={() => window.open(submission.alternateLink, '_blank')}
                        >
                          Entregar Ahora
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Submissions */}
              {progress.submissions.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-muted-foreground">📝</span>
                    <h4 className="font-semibold text-foreground">
                      Entregas Recientes
                    </h4>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {progress.submissions
                      .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
                      .slice(0, 8)
                      .map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="font-medium text-sm text-foreground truncate">
                            {submission.assignmentTitle}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span>{new Date(submission.updateTime).toLocaleDateString('es-ES')}</span>
                            {submission.late && (
                              <Badge variant="destructive" className="text-xs">
                                Tardía
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge variant={
                            submission.state === 'TURNED_IN' ? 'default' :
                            submission.state === 'RETURNED' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {submission.state === 'TURNED_IN' ? 'Entregada' : 
                             submission.state === 'RETURNED' ? 'Devuelta' : 
                             'Pendiente'}
                          </Badge>
                          {submission.assignedGrade !== undefined && submission.assignedGrade !== null && (
                            <div className="text-center min-w-[50px] bg-muted rounded px-2 py-1">
                              <div className="text-xs text-muted-foreground">Nota</div>
                              <div className="font-bold text-sm text-foreground">
                                {submission.assignedGrade}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay datos de progreso disponibles</p>
            </div>
          )}
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
