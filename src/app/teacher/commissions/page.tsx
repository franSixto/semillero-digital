'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherData } from '@/lib/classroom';
import { TeacherData, StudentAssignment } from '@/types/app';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/app-layout';

interface CommissionData {
  name: string;
  students: StudentAssignment[];
  totalStudents: number;
  studentsAtRisk: number;
  averageProgress: number;
  averageGrade: number;
}

export default function TeacherCommissionsPage() {
  const { accessToken } = useAuth();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeacherData = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTeacherData(accessToken);
      if (result.success && result.data) {
        setTeacherData(result.data);
      } else {
        setError(result.error || 'Error al cargar datos del profesor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadTeacherData();
    }
  }, [accessToken]);

  // Group students by commission
  const commissionData = teacherData?.assignedStudents.reduce((acc, student) => {
    const commission = student.commissionName;
    if (!acc[commission]) {
      acc[commission] = {
        name: commission,
        students: [],
        totalStudents: 0,
        studentsAtRisk: 0,
        averageProgress: 0,
        averageGrade: 0
      };
    }
    
    acc[commission].students.push(student);
    acc[commission].totalStudents++;
    
    if (student.status === 'at_risk') {
      acc[commission].studentsAtRisk++;
    }
    
    return acc;
  }, {} as Record<string, CommissionData>) || {};

  // Calculate averages for each commission
  Object.values(commissionData).forEach((commission: CommissionData) => {
    const totalProgress = commission.students.reduce((sum: number, s: StudentAssignment) => sum + s.progress.completionPercentage, 0);
    const totalGrades = commission.students.reduce((sum: number, s: StudentAssignment) => sum + s.progress.averageGrade, 0);
    
    commission.averageProgress = Math.round(totalProgress / commission.students.length);
    commission.averageGrade = Math.round(totalGrades / commission.students.length);
  });

  const getCommissionStatus = (commission: CommissionData) => {
    const riskPercentage = (commission.studentsAtRisk / commission.totalStudents) * 100;
    
    if (riskPercentage > 30) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    if (riskPercentage > 15) return { status: 'warning', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    if (commission.averageProgress > 85) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return { variant: 'default' as const, text: 'Excelente' };
      case 'active':
        return { variant: 'secondary' as const, text: 'Activo' };
      case 'at_risk':
        return { variant: 'destructive' as const, text: 'En Riesgo' };
      case 'behind':
        return { variant: 'outline' as const, text: 'Atrasado' };
      default:
        return { variant: 'secondary' as const, text: 'Desconocido' };
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando comisiones...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadTeacherData}>Reintentar</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!teacherData || Object.keys(commissionData).length === 0) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No hay comisiones disponibles</h3>
            <p className="text-muted-foreground">No se encontraron comisiones asignadas</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const commissions = Object.values(commissionData);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mis Comisiones</h1>
          <p className="text-muted-foreground">
            Vista general de todas las comisiones donde enseñas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{commissions.length}</div>
              <p className="text-xs text-muted-foreground">Activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherData.assignedStudents.length}</div>
              <p className="text-xs text-muted-foreground">En todas las comisiones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes en Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                teacherData.assignedStudents.filter(s => s.status === 'at_risk').length > 0 
                  ? 'text-destructive' : 'text-green-600'
              }`}>
                {teacherData.assignedStudents.filter(s => s.status === 'at_risk').length}
              </div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round(
                  teacherData.assignedStudents.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / 
                  teacherData.assignedStudents.length
                )}%
              </div>
              <p className="text-xs text-muted-foreground">General</p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {commissions.map((commission: CommissionData) => {
            const statusInfo = getCommissionStatus(commission);
            
            return (
              <Card key={commission.name} className={`${statusInfo.bg} border-2`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{commission.name}</CardTitle>
                      <CardDescription>
                        {commission.totalStudents} estudiantes • {commission.studentsAtRisk} en riesgo
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        statusInfo.status === 'critical' ? 'destructive' :
                        statusInfo.status === 'warning' ? 'outline' :
                        statusInfo.status === 'excellent' ? 'default' : 'secondary'
                      }
                    >
                      {statusInfo.status === 'critical' ? 'Crítico' :
                       statusInfo.status === 'warning' ? 'Atención' :
                       statusInfo.status === 'excellent' ? 'Excelente' : 'Bien'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Commission Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{commission.averageProgress}%</div>
                      <div className="text-xs text-muted-foreground">Progreso Promedio</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{commission.averageGrade}</div>
                      <div className="text-xs text-muted-foreground">Calificación Promedio</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso General</span>
                      <span>{commission.averageProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${commission.averageProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Students Preview */}
                  <div>
                    <h4 className="font-medium mb-3">Estudiantes ({commission.students.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {commission.students.map((student: StudentAssignment) => {
                        const statusBadge = getStatusBadge(student.status);
                        return (
                          <div key={student.studentId} className="flex items-center gap-3 p-2 bg-white/50 rounded-md">
                            {student.studentAvatar ? (
                              <Image
                                src={student.studentAvatar}
                                alt={student.studentName}
                                className="w-8 h-8 rounded-full object-cover"
                                width={32}
                                height={32}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {student.studentName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{student.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.progress.completionPercentage}% • Promedio: {student.progress.averageGrade}
                              </p>
                            </div>
                            <Badge variant={statusBadge.variant} className="text-xs">
                              {statusBadge.text}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <span className="mr-2">📊</span>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <span className="mr-2">📝</span>
                      Abrir en Classroom
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas para gestionar todas tus comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <span className="mr-2">👥</span>
                Ver Todos los Estudiantes
              </Button>
              <Button variant="outline" className="justify-start">
                <span className="mr-2">📊</span>
                Generar Reporte General
              </Button>
              <Button variant="outline" className="justify-start">
                <span className="mr-2">✉️</span>
                Contactar Estudiantes en Riesgo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
