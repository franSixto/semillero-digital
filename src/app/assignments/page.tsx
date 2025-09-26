'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStudentAllAssignments } from '@/lib/classroom';
import { useAuth } from '@/contexts/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Assignment, Course, StudentSubmission } from '@/types/classroom';

interface AssignmentWithProgress {
  assignment: Assignment;
  course: Course;
  submission?: StudentSubmission;
  progress: {
    isSubmitted: boolean;
    isLate: boolean;
    isGraded: boolean;
    grade?: number;
    maxPoints?: number;
    status: 'pending' | 'submitted' | 'graded' | 'returned' | 'late';
  };
}

export default function AssignmentsPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithProgress[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Load assignments data
  const loadAssignmentsData = async (token: string) => {
    if (!token.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getStudentAllAssignments(token);
      
      if (result.success && result.data) {
        setAssignments(result.data);
        setFilteredAssignments(result.data);
      } else {
        setError(result.error || 'Error al cargar tareas');
      }
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
      loadAssignmentsData(accessToken);
    } else {
      setLoading(false);
    }
  }, [accessToken, authLoading]);

  // Filter assignments based on search and filters
  useEffect(() => {
    let filtered = assignments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.progress.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(item => item.course.id === courseFilter);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, statusFilter, courseFilter]);

  // Loading state (including auth loading)
  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando tus tareas...</p>
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
              <h3 className="text-lg font-semibold mb-2">Error al cargar tareas</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => accessToken && loadAssignmentsData(accessToken)}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Get unique courses for filter
  const uniqueCourses = Array.from(
    new Map(assignments.map(item => [item.course.id, item.course])).values()
  );

  // Calculate stats
  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter(item => 
    item.progress.status === 'pending' || item.progress.status === 'late'
  ).length;
  const submittedAssignments = assignments.filter(item => 
    item.progress.status === 'submitted' || item.progress.status === 'graded' || item.progress.status === 'returned'
  ).length;
  const gradedAssignments = assignments.filter(item => 
    item.progress.isGraded
  ).length;

  // Get status badge variant and color
  const getStatusBadge = (status: string, isLate: boolean) => {
    switch (status) {
      case 'pending':
        return isLate 
          ? { variant: 'destructive' as const, text: 'Atrasada', icon: '⚠️' }
          : { variant: 'secondary' as const, text: 'Pendiente', icon: '📝' };
      case 'late':
        return { variant: 'destructive' as const, text: 'Atrasada', icon: '⚠️' };
      case 'submitted':
        return { variant: 'default' as const, text: 'Entregada', icon: '✅' };
      case 'graded':
        return { variant: 'default' as const, text: 'Calificada', icon: '🎯' };
      case 'returned':
        return { variant: 'outline' as const, text: 'Devuelta', icon: '🔄' };
      default:
        return { variant: 'secondary' as const, text: 'Desconocido', icon: '❓' };
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus tareas y entregas académicas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">En todos los cursos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                pendingAssignments > 0 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {pendingAssignments}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingAssignments > 0 ? 'Requieren atención' : 'Todo al día'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedAssignments}</div>
              <p className="text-xs text-muted-foreground">Tareas completadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Calificadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{gradedAssignments}</div>
              <p className="text-xs text-muted-foreground">Con calificación</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <Input
                  placeholder="Buscar por título o curso..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="late">Atrasadas</SelectItem>
                    <SelectItem value="submitted">Entregadas</SelectItem>
                    <SelectItem value="graded">Calificadas</SelectItem>
                    <SelectItem value="returned">Devueltas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Curso</label>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los cursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los cursos</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((item) => {
            const statusBadge = getStatusBadge(item.progress.status, item.progress.isLate);
            
            return (
              <Card key={`${item.course.id}-${item.assignment.id}`} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{item.assignment.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="truncate">{item.course.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.course.section || 'Sin sección'}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusBadge.variant} className="text-xs">
                        {statusBadge.icon} {statusBadge.text}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.assignment.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.assignment.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📅 {new Date(item.assignment.creationTime).toLocaleDateString('es-ES')}</span>
                      {item.assignment.maxPoints && (
                        <span>🎯 {item.assignment.maxPoints} puntos</span>
                      )}
                      {item.progress.isGraded && item.progress.grade !== undefined && (
                        <span className="text-green-600 font-medium">
                          ✅ {item.progress.grade}/{item.assignment.maxPoints || 100}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(item.assignment.alternateLink, '_blank')}
                      >
                        Ver Tarea
                      </Button>
                      {(item.progress.status === 'pending' || item.progress.status === 'late') && (
                        <Button 
                          size="sm"
                          variant={item.progress.isLate ? 'destructive' : 'default'}
                          onClick={() => window.open(item.assignment.alternateLink, '_blank')}
                        >
                          {item.progress.isLate ? 'Entregar Ahora' : 'Entregar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 && assignments.length > 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No se encontraron tareas</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCourseFilter('all');
                }}
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No assignments at all */}
        {assignments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No tienes tareas aún</h3>
              <p className="text-muted-foreground mb-4">
                Las tareas de tus cursos aparecerán aquí cuando estén disponibles
              </p>
              <Button onClick={() => accessToken && loadAssignmentsData(accessToken)}>
                <span className="mr-2">🔄</span>
                Actualizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        {assignments.length > 0 && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => accessToken && loadAssignmentsData(accessToken)} 
              variant="outline"
              disabled={loading || !accessToken}
            >
              {loading ? 'Actualizando...' : 'Actualizar Tareas'}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
