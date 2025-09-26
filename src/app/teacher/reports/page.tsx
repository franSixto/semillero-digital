'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherData, getTeacherDashboardStats } from '@/lib/classroom';
import { TeacherData, TeacherDashboardStats } from '@/types/app';
import { AppLayout } from '@/components/layout/app-layout';

export default function TeacherReportsPage() {
  const { accessToken } = useAuth();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
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
      loadData();
    }
  }, [accessToken]);

  // Calculate report data
  const reportData = teacherData ? {
    totalStudents: teacherData.assignedStudents.length,
    studentsAtRisk: teacherData.assignedStudents.filter(s => s.status === 'at_risk').length,
    studentsActive: teacherData.assignedStudents.filter(s => s.status === 'active').length,
    studentsExcellent: teacherData.assignedStudents.filter(s => s.status === 'excellent').length,
    studentsBehind: teacherData.assignedStudents.filter(s => s.status === 'behind').length,
    averageProgress: Math.round(
      teacherData.assignedStudents.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / 
      teacherData.assignedStudents.length
    ),
    averageGrade: Math.round(
      teacherData.assignedStudents.reduce((sum, s) => sum + s.progress.averageGrade, 0) / 
      teacherData.assignedStudents.length
    ),
    commissions: [...new Set(teacherData.assignedStudents.map(s => s.commissionName))],
  } : null;

  const generateReport = (type: string) => {
    if (!teacherData || !reportData) return;

    const reportContent = `
REPORTE ${type.toUpperCase()} - SEMILLERO DIGITAL
Fecha: ${new Date().toLocaleDateString('es-ES')}
Profesor: [Nombre del Profesor]

=== RESUMEN GENERAL ===
Total de Estudiantes: ${reportData.totalStudents}
Progreso Promedio: ${reportData.averageProgress}%
Calificación Promedio: ${reportData.averageGrade}

=== DISTRIBUCIÓN POR ESTADO ===
• Excelentes: ${reportData.studentsExcellent} (${Math.round((reportData.studentsExcellent / reportData.totalStudents) * 100)}%)
• Activos: ${reportData.studentsActive} (${Math.round((reportData.studentsActive / reportData.totalStudents) * 100)}%)
• Atrasados: ${reportData.studentsBehind} (${Math.round((reportData.studentsBehind / reportData.totalStudents) * 100)}%)
• En Riesgo: ${reportData.studentsAtRisk} (${Math.round((reportData.studentsAtRisk / reportData.totalStudents) * 100)}%)

=== COMISIONES ===
${reportData.commissions.map(commission => {
  const studentsInCommission = teacherData.assignedStudents.filter(s => s.commissionName === commission);
  const avgProgress = Math.round(studentsInCommission.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / studentsInCommission.length);
  return `• ${commission}: ${studentsInCommission.length} estudiantes (${avgProgress}% promedio)`;
}).join('\n')}

=== ESTUDIANTES EN RIESGO ===
${teacherData.assignedStudents
  .filter(s => s.status === 'at_risk')
  .map(s => `• ${s.studentName} (${s.commissionName}) - ${s.progress.completionPercentage}% completado`)
  .join('\n') || 'Ningún estudiante en riesgo'}

=== RECOMENDACIONES ===
${reportData.studentsAtRisk > 0 ? 
  `• Contactar inmediatamente a los ${reportData.studentsAtRisk} estudiantes en riesgo
• Programar sesiones de apoyo adicional
• Revisar metodología de enseñanza para mejorar retención` :
  `• Mantener el buen trabajo con los estudiantes
• Continuar monitoreando el progreso regularmente`
}

Generado automáticamente por el Sistema de Gestión del Semillero Digital
    `.trim();

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Generando reportes...</p>
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
            <Button onClick={loadData}>Reintentar</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!teacherData || !reportData) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground">No se pudieron cargar los datos para generar reportes</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Centro de Reportes</h1>
          <p className="text-muted-foreground">
            Genera reportes detallados sobre el progreso de tus estudiantes
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Asignados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reportData.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">General</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reportData.averageGrade}</div>
              <p className="text-xs text-muted-foreground">Sobre 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.commissions.length}</div>
              <p className="text-xs text-muted-foreground">Activas</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Estudiantes por Estado</CardTitle>
            <CardDescription>
              Vista general del rendimiento de tus estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{reportData.studentsExcellent}</div>
                <div className="text-sm text-green-700">Excelentes</div>
                <div className="text-xs text-green-600">
                  {Math.round((reportData.studentsExcellent / reportData.totalStudents) * 100)}%
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{reportData.studentsActive}</div>
                <div className="text-sm text-blue-700">Activos</div>
                <div className="text-xs text-blue-600">
                  {Math.round((reportData.studentsActive / reportData.totalStudents) * 100)}%
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{reportData.studentsBehind}</div>
                <div className="text-sm text-orange-700">Atrasados</div>
                <div className="text-xs text-orange-600">
                  {Math.round((reportData.studentsBehind / reportData.totalStudents) * 100)}%
                </div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{reportData.studentsAtRisk}</div>
                <div className="text-sm text-red-700">En Riesgo</div>
                <div className="text-xs text-red-600">
                  {Math.round((reportData.studentsAtRisk / reportData.totalStudents) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Comisión</CardTitle>
            <CardDescription>
              Análisis detallado de cada comisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.commissions.map((commission) => {
                const studentsInCommission = teacherData.assignedStudents.filter(s => s.commissionName === commission);
                const avgProgress = Math.round(
                  studentsInCommission.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / 
                  studentsInCommission.length
                );
                const avgGrade = Math.round(
                  studentsInCommission.reduce((sum, s) => sum + s.progress.averageGrade, 0) / 
                  studentsInCommission.length
                );
                const atRiskCount = studentsInCommission.filter(s => s.status === 'at_risk').length;

                return (
                  <div key={commission} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{commission}</h4>
                      <Badge variant={atRiskCount > 0 ? 'destructive' : 'secondary'}>
                        {studentsInCommission.length} estudiantes
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <div className="text-xl font-bold text-primary">{avgProgress}%</div>
                        <div className="text-xs text-muted-foreground">Progreso Promedio</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <div className="text-xl font-bold text-primary">{avgGrade}</div>
                        <div className="text-xs text-muted-foreground">Calificación Promedio</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <div className={`text-xl font-bold ${atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {atRiskCount}
                        </div>
                        <div className="text-xs text-muted-foreground">En Riesgo</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso General</span>
                        <span>{avgProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${avgProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Generar Reportes</CardTitle>
            <CardDescription>
              Descarga reportes detallados en diferentes formatos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <h4 className="font-medium mb-2">Reporte General</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Resumen completo de todos los estudiantes y su progreso
                  </p>
                  <Button 
                    onClick={() => generateReport('general')}
                    className="w-full"
                  >
                    Descargar
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚨</div>
                  <h4 className="font-medium mb-2">Reporte de Riesgo</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estudiantes que requieren atención inmediata
                  </p>
                  <Button 
                    onClick={() => generateReport('riesgo')}
                    variant="destructive"
                    className="w-full"
                  >
                    Descargar
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <h4 className="font-medium mb-2">Reporte por Comisión</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Análisis detallado por cada comisión
                  </p>
                  <Button 
                    onClick={() => generateReport('comision')}
                    variant="outline"
                    className="w-full"
                  >
                    Descargar
                  </Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas adicionales para análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <span className="mr-2">📈</span>
                Análisis de Tendencias
              </Button>
              <Button variant="outline" className="justify-start">
                <span className="mr-2">📧</span>
                Enviar Reporte por Email
              </Button>
              <Button variant="outline" className="justify-start">
                <span className="mr-2">🔄</span>
                Programar Reportes Automáticos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
