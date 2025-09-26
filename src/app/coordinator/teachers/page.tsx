'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/contexts/role-context';
import { getTeachersManagement, assignStudentToTeacher, removeStudentFromTeacher, getAssignmentRecommendations, autoAssignStudents } from '@/lib/classroom';
import { Users, UserPlus, UserMinus, Search, Filter, BookOpen, Lightbulb, AlertTriangle } from 'lucide-react';

interface TeacherManagement {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherAvatar?: string;
  assignedStudents: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    commissionName: string;
    assignedDate: Date;
    status: 'active' | 'inactive' | 'at_risk';
  }>;
  totalStudents: number;
  activeCommissions: string[];
  lastActivity: Date;
}

interface UnassignedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  commissionName: string;
  enrollmentDate: Date;
}

interface TeachersManagementData {
  teachers: TeacherManagement[];
  unassignedStudents: UnassignedStudent[];
  totalTeachers: number;
  totalStudents: number;
  totalUnassigned: number;
}

interface AssignmentRecommendation {
  studentId: string;
  studentName: string;
  studentEmail: string;
  commissionName: string;
  recommendedTeachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    reason: string;
    currentLoad: number;
    sharedCourses: string[];
  }>;
}

export default function CoordinatorTeachersPage() {
  const { accessToken } = useAuth();
  const { currentRole } = useRole();
  const [data, setData] = useState<TeachersManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTeachers, setSelectedTeachers] = useState<Record<string, string>>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<AssignmentRecommendation[]>([]);

  // Redirect if not coordinator
  useEffect(() => {
    if (currentRole !== 'coordinator') {
      window.location.href = '/dashboard';
      return;
    }
  }, [currentRole]);

  useEffect(() => {
    if (accessToken && currentRole === 'coordinator') {
      loadTeachersData();
    }
  }, [accessToken, currentRole]);

  const loadTeachersData = async () => {
    try {
      setLoading(true);
      const result = await getTeachersManagement(accessToken!);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Error loading teachers data');
      }
    } catch (err) {
      setError('Error loading teachers data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId: string, teacherId: string) => {
    try {
      const result = await assignStudentToTeacher(studentId, teacherId, accessToken!);
      if (result.success) {
        await loadTeachersData(); // Reload data to show new assignment
        setSelectedTeachers(prev => {
          const newState = { ...prev };
          delete newState[studentId];
          return newState;
        });
      } else {
        setError(result.error || 'Error assigning student');
      }
    } catch (err) {
      setError('Error assigning student');
      console.error('Error:', err);
    }
  };

  const handleRemoveStudent = async (studentId: string, teacherId: string) => {
    try {
      const result = await removeStudentFromTeacher(studentId, teacherId, accessToken!);
      if (result.success) {
        await loadTeachersData(); // Reload data to show removal
      } else {
        setError(result.error || 'Error removing student');
      }
    } catch (err) {
      setError('Error removing student');
      console.error('Error:', err);
    }
  };

  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      const result = await autoAssignStudents(accessToken!);
      if (result.success && result.assignments) {
        console.log('Auto-assignment completed:', result.assignments);
        await loadTeachersData(); // Reload data to show new assignments
      } else {
        setError(result.error || 'Error in auto-assignment');
      }
    } catch (err) {
      setError('Error in auto-assignment');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const result = await getAssignmentRecommendations(accessToken!);
      if (result.success && result.data) {
        setRecommendations(result.data);
        setShowRecommendations(true);
      } else {
        setError(result.error || 'Error loading recommendations');
      }
    } catch (err) {
      setError('Error loading recommendations');
      console.error('Error:', err);
    }
  };

  // Filter teachers based on search and status
  const filteredTeachers = data?.teachers?.filter(teacher => {
    const matchesSearch = teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.teacherEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && teacher.totalStudents > 0) ||
                         (filterStatus === 'inactive' && teacher.totalStudents === 0);
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Filter unassigned students based on search
  const filteredUnassignedStudents = data?.unassignedStudents?.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.commissionName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando profesores...</p>
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
          <Card className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadTeachersData} className="w-full">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">No se encontraron datos</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Profesores</h1>
            <p className="text-muted-foreground">
              Administra profesores y asigna estudiantes para seguimiento personalizado
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">En el semillero</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{data.totalStudents - data.totalUnassigned}</div>
              <p className="text-xs text-muted-foreground">Con seguimiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                data.totalUnassigned > 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {data.totalUnassigned}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.totalUnassigned > 0 ? 'Requieren asignación' : 'Todo asignado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data.totalStudents}</div>
              <p className="text-xs text-muted-foreground">En el semillero</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar profesores o estudiantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los profesores</SelectItem>
                  <SelectItem value="active">Con estudiantes</SelectItem>
                  <SelectItem value="inactive">Sin estudiantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Students Section */}
        {data.totalUnassigned > 0 && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-5 w-5" />
                    Estudiantes Sin Asignar ({data.totalUnassigned})
                  </CardTitle>
                  <CardDescription>
                    Estos estudiantes necesitan ser asignados a un profesor para seguimiento personalizado
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    onClick={loadRecommendations}
                    disabled={loading || filteredUnassignedStudents.length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Ver Recomendaciones
                  </Button>
                  <Button 
                    onClick={handleAutoAssign}
                    disabled={loading || filteredUnassignedStudents.length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Auto-Asignar Todos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUnassignedStudents.map((student) => (
                  <Card key={student.studentId} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-foreground">{student.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                          <Badge variant="outline" className="mt-1">
                            {student.commissionName}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Select 
                            value={selectedTeachers[student.studentId] || ''} 
                            onValueChange={(value) => setSelectedTeachers(prev => ({
                              ...prev,
                              [student.studentId]: value
                            }))}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Seleccionar profesor" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.teachers.map((teacher) => (
                                <SelectItem key={teacher.teacherId} value={teacher.teacherId}>
                                  {teacher.teacherName} ({teacher.totalStudents} estudiantes)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm"
                            onClick={() => {
                              const teacherId = selectedTeachers[student.studentId];
                              if (teacherId) {
                                handleAssignStudent(student.studentId, teacherId);
                              }
                            }}
                            disabled={!selectedTeachers[student.studentId]}
                          >
                            Asignar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Section */}
        {showRecommendations && recommendations.length > 0 && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Lightbulb className="h-5 w-5" />
                  Recomendaciones Inteligentes
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowRecommendations(false)}>
                  Cerrar
                </Button>
              </div>
              <CardDescription>
                Asignaciones sugeridas basadas en especialización y carga de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.studentId} className="p-4 bg-card rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{rec.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{rec.commissionName}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Profesores recomendados:</p>
                      {rec.recommendedTeachers.slice(0, 3).map((teacher, index) => (
                        <div key={teacher.teacherId} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium text-sm">{teacher.teacherName}</p>
                            <p className="text-xs text-muted-foreground">{teacher.reason}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={index === 0 ? "default" : "outline"}
                            onClick={() => handleAssignStudent(rec.studentId, teacher.teacherId)}
                          >
                            Asignar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profesores ({filteredTeachers.length})
            </CardTitle>
            <CardDescription>
              Lista de profesores con sus estudiantes asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.teacherId} className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {teacher.teacherAvatar ? (
                          <img 
                            src={teacher.teacherAvatar} 
                            alt={teacher.teacherName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">{teacher.teacherName}</h3>
                          <p className="text-sm text-muted-foreground">{teacher.teacherEmail}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {teacher.activeCommissions.map((commission, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {commission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{teacher.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">estudiantes</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {teacher.assignedStudents.length > 0 && (
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Estudiantes Asignados
                        </h4>
                        <div className="grid gap-3 md:grid-cols-1">
                          {teacher.assignedStudents.map((student) => (
                            <div 
                              key={student.studentId}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{student.studentName}</p>
                                <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {student.commissionName}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      student.status === 'active' ? 'default' :
                                      student.status === 'at_risk' ? 'destructive' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {student.status === 'active' ? 'Activo' :
                                     student.status === 'at_risk' ? 'En Riesgo' : 'Inactivo'}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveStudent(student.studentId, teacher.teacherId)}
                                className="ml-2"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
