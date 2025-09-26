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
import { getTeachersManagement, assignStudentToTeacher } from '@/lib/classroom';
import { Users, Search, Filter, UserPlus, BookOpen, TrendingUp } from 'lucide-react';

interface StudentWithDetails {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  commissionName: string;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'at_risk';
  assignedTeacher?: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  };
  progress?: {
    completionPercentage: number;
    averageGrade: number;
    lateCount: number;
  };
}

interface StudentsData {
  students: StudentWithDetails[];
  totalStudents: number;
  assignedStudents: number;
  unassignedStudents: number;
  studentsAtRisk: number;
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    totalStudents: number;
  }>;
}

export default function CoordinatorStudentsPage() {
  const { accessToken } = useAuth();
  const { currentRole } = useRole();
  const [data, setData] = useState<StudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignment, setFilterAssignment] = useState<string>('all');

  // Redirect if not coordinator
  useEffect(() => {
    if (currentRole !== 'coordinator') {
      window.location.href = '/dashboard';
      return;
    }
  }, [currentRole]);

  useEffect(() => {
    if (accessToken && currentRole === 'coordinator') {
      loadStudentsData();
    }
  }, [accessToken, currentRole]);

  const loadStudentsData = async () => {
    try {
      setLoading(true);
      const result = await getTeachersManagement(accessToken!);
      
      if (result.success && result.data) {
        const { teachers, unassignedStudents } = result.data;
        
        // Combine assigned and unassigned students
        const assignedStudents = teachers.flatMap(teacher => 
          teacher.assignedStudents.map(student => ({
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            commissionName: student.commissionName,
            enrollmentDate: student.assignedDate,
            status: student.status,
            assignedTeacher: {
              teacherId: teacher.teacherId,
              teacherName: teacher.teacherName,
              teacherEmail: teacher.teacherEmail
            }
          }))
        );

        const unassignedStudentsFormatted = unassignedStudents.map(student => ({
          studentId: student.studentId,
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          commissionName: student.commissionName,
          enrollmentDate: student.enrollmentDate,
          status: 'active' as const
        }));

        const allStudents = [...assignedStudents, ...unassignedStudentsFormatted];
        const studentsAtRisk = allStudents.filter(s => s.status === 'at_risk').length;

        const studentsData: StudentsData = {
          students: allStudents,
          totalStudents: allStudents.length,
          assignedStudents: assignedStudents.length,
          unassignedStudents: unassignedStudentsFormatted.length,
          studentsAtRisk,
          teachers: teachers.map(t => ({
            teacherId: t.teacherId,
            teacherName: t.teacherName,
            teacherEmail: t.teacherEmail,
            totalStudents: t.totalStudents
          }))
        };

        setData(studentsData);
      } else {
        setError(result.error || 'Error loading students data');
      }
    } catch (err) {
      setError('Error loading students data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId: string, teacherId: string) => {
    try {
      const result = await assignStudentToTeacher(studentId, teacherId, accessToken!);
      if (result.success) {
        await loadStudentsData(); // Reload data
      } else {
        setError(result.error || 'Error assigning student');
      }
    } catch (err) {
      setError('Error assigning student');
      console.error('Error:', err);
    }
  };

  // Filter students based on search and filters
  const filteredStudents = data?.students?.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.commissionName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && student.status === 'active') ||
                         (filterStatus === 'at_risk' && student.status === 'at_risk') ||
                         (filterStatus === 'inactive' && student.status === 'inactive');
    
    const matchesAssignment = filterAssignment === 'all' ||
                             (filterAssignment === 'assigned' && student.assignedTeacher) ||
                             (filterAssignment === 'unassigned' && !student.assignedTeacher);
    
    return matchesSearch && matchesStatus && matchesAssignment;
  }) || [];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando estudiantes...</p>
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
              <Button onClick={loadStudentsData} className="w-full">
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
            <h1 className="text-3xl font-bold text-foreground">Gestión de Estudiantes</h1>
            <p className="text-muted-foreground">
              Administra todos los estudiantes del semillero y sus asignaciones
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data.totalStudents}</div>
              <p className="text-xs text-muted-foreground">En el semillero</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{data.assignedStudents}</div>
              <p className="text-xs text-muted-foreground">Con profesor asignado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                data.unassignedStudents > 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {data.unassignedStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.unassignedStudents > 0 ? 'Requieren asignación' : 'Todo asignado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                data.studentsAtRisk > 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {data.studentsAtRisk}
              </div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
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
                    placeholder="Buscar estudiantes..."
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
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="at_risk">En Riesgo</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAssignment} onValueChange={setFilterAssignment}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Asignación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las asignaciones</SelectItem>
                  <SelectItem value="assigned">Asignados</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estudiantes ({filteredStudents.length})
            </CardTitle>
            <CardDescription>
              Lista completa de estudiantes del semillero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <Card key={student.studentId} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{student.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                        </div>
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
                      
                      <div>
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {student.commissionName}
                        </Badge>
                      </div>

                      {student.assignedTeacher ? (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">Asignado a:</p>
                          <p className="text-sm font-medium text-foreground">
                            {student.assignedTeacher.teacherName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.assignedTeacher.teacherEmail}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Sin profesor asignado</p>
                          <div className="flex gap-2">
                            <Select>
                              <SelectTrigger className="flex-1 h-8 text-xs">
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
                              className="h-8 px-2"
                              onClick={() => {
                                // This would need to be implemented with state management
                                // for now, we'll just show the UI structure
                              }}
                            >
                              <UserPlus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {student.progress && (
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>Progreso: {student.progress.completionPercentage}%</span>
                            {student.progress.averageGrade > 0 && (
                              <span>• Promedio: {student.progress.averageGrade}</span>
                            )}
                            {student.progress.lateCount > 0 && (
                              <span className="text-destructive">• {student.progress.lateCount} tardías</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
