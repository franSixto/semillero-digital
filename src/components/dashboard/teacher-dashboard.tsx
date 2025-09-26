'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherData, getTeacherDashboardStats } from '@/lib/classroom';
import { TeacherData, TeacherDashboardStats, StudentAssignment } from '@/types/app';
import { EmailModal } from '@/components/teacher/email-modal';
import Image from 'next/image';
import Link from 'next/link';

interface EmailData {
  recipients: string[];
  subject: string;
  message: string;
}

export function TeacherDashboard() {
  const { accessToken } = useAuth();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentAssignment[]>([]);

  const loadTeacherData = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const [dataResult, statsResult] = await Promise.all([
        getTeacherData(accessToken),
        getTeacherDashboardStats(accessToken)
      ]);

      if (dataResult.success && dataResult.data) {
        setTeacherData(dataResult.data);
      } else {
        setError(dataResult.error || 'Error al cargar datos del profesor');
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando datos del profesor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadTeacherData}>Reintentar</Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !teacherData) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
          <p className="text-muted-foreground">No se pudieron cargar los datos del profesor</p>
        </CardContent>
      </Card>
    );
  }

  // Separate students by status for better organization
  const studentsAtRisk = teacherData.assignedStudents.filter(s => s.status === 'at_risk');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return { variant: 'default' as const, text: 'Excelente', color: 'text-green-600' };
      case 'active':
        return { variant: 'secondary' as const, text: 'Activo', color: 'text-blue-600' };
      case 'at_risk':
        return { variant: 'destructive' as const, text: 'En Riesgo', color: 'text-red-600' };
      case 'behind':
        return { variant: 'outline' as const, text: 'Atrasado', color: 'text-orange-600' };
      default:
        return { variant: 'secondary' as const, text: 'Desconocido', color: 'text-gray-600' };
    }
  };

  const handleEmailStudents = (students: StudentAssignment[]) => {
    setSelectedStudents(students);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (emailData: EmailData) => {
    // Simulate email sending
    console.log('Sending email:', emailData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Email enviado exitosamente a ${emailData.recipients.length} estudiante(s)`);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard del Profesor</h1>
        <p className="text-muted-foreground">
          Gestiona tus estudiantes asignados y supervisa su progreso académico
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Asignados a ti</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes en Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.studentsAtRisk > 0 ? 'text-destructive' : 'text-green-600'
            }`}>
              {stats.studentsAtRisk}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.studentsAtRisk > 0 ? 'Requieren atención' : 'Todo bajo control'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.averageClassProgress}%</div>
            <p className="text-xs text-muted-foreground">De la clase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revisiones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.pendingReviews > 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {stats.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground">Tareas por revisar</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {stats.recentAlerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span>⚠️</span>
              Alertas Recientes
            </CardTitle>
            <CardDescription>
              Estudiantes que requieren atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{alert.studentName}</h4>
                      <p className="text-sm mt-1 text-foreground">{alert.message}</p>
                      {alert.courseName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Curso: {alert.courseName}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant={alert.severity === 'high' || alert.severity === 'critical' ? 'destructive' : 'secondary'} 
                      className="text-xs"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students at Risk - Priority Section */}
      {studentsAtRisk.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <span>🚨</span>
                  Estudiantes en Riesgo ({studentsAtRisk.length})
                </CardTitle>
                <CardDescription>
                  Estos estudiantes requieren atención inmediata
                </CardDescription>
              </div>
              <Button 
                onClick={() => handleEmailStudents(studentsAtRisk)}
                variant="destructive"
                size="sm"
              >
                <span className="mr-2">✉️</span>
                Contactar Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {studentsAtRisk.map((student) => (
                <Card key={student.studentId} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {student.studentAvatar ? (
                        <Image
                          src={student.studentAvatar}
                          alt={student.studentName}
                          className="w-10 h-10 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium text-foreground">
                            {student.studentName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-foreground">{student.studentName}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.commissionName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs text-foreground font-medium">
                            {student.progress.completionPercentage}% completado
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.alerts.length} alertas
                          </div>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        En Riesgo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Students Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>👥</span>
            Todos los Estudiantes ({teacherData.assignedStudents.length})
          </CardTitle>
          <CardDescription>
            Vista general de todos tus estudiantes asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teacherData.assignedStudents.map((student) => {
              const statusBadge = getStatusBadge(student.status);
              return (
                <Card key={student.studentId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {student.studentAvatar ? (
                        <Image
                          src={student.studentAvatar}
                          alt={student.studentName}
                          className="w-12 h-12 rounded-full object-cover"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.studentName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{student.studentName}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.commissionName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`text-sm font-medium ${statusBadge.color}`}>
                            {student.progress.completionPercentage}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Promedio: {student.progress.averageGrade}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant={statusBadge.variant} className="text-xs">
                            {statusBadge.text}
                          </Badge>
                          {student.alerts.length > 0 && (
                            <span className="text-xs text-orange-600">
                              {student.alerts.length} alertas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Herramientas para gestionar tus estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/teacher/students">
              <Button variant="outline" className="justify-start w-full">
                <span className="mr-2">👥</span>
                Gestionar Estudiantes
              </Button>
            </Link>
            <Link href="/teacher/reports">
              <Button variant="outline" className="justify-start w-full">
                <span className="mr-2">📊</span>
                Generar Reportes
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => handleEmailStudents(studentsAtRisk)}
              disabled={studentsAtRisk.length === 0}
            >
              <span className="mr-2">✉️</span>
              Contactar Estudiantes en Riesgo
            </Button>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            <Link href="/teacher/commissions">
              <Button variant="outline" className="justify-start w-full">
                <span className="mr-2">📚</span>
                Ver Comisiones
              </Button>
            </Link>
            <Link href="/teacher/alerts">
              <Button variant="outline" className="justify-start w-full">
                <span className="mr-2">⚠️</span>
                Centro de Alertas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Email Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        students={selectedStudents}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
}
