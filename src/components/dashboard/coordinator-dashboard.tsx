'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getCoordinatorData, getCoordinatorDashboardStats } from '@/lib/classroom';
import { CoordinatorData, CoordinatorDashboardStats, Commission } from '@/types/app';

export function CoordinatorDashboard() {
  const { accessToken } = useAuth();
  const [coordinatorData, setCoordinatorData] = useState<CoordinatorData | null>(null);
  const [stats, setStats] = useState<CoordinatorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoordinatorData = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const [dataResult, statsResult] = await Promise.all([
        getCoordinatorData(accessToken),
        getCoordinatorDashboardStats(accessToken)
      ]);

      if (dataResult.success && dataResult.data) {
        setCoordinatorData(dataResult.data);
      } else {
        setError(dataResult.error || 'Error al cargar datos del coordinador');
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
      loadCoordinatorData();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando datos del coordinador...</p>
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
          <Button onClick={loadCoordinatorData}>Reintentar</Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !coordinatorData) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
          <p className="text-muted-foreground">No se pudieron cargar los datos del coordinador</p>
        </CardContent>
      </Card>
    );
  }


  const getCommissionStatusText = (commission: Commission) => {
    const riskPercentage = (commission.metrics.studentsAtRisk / commission.metrics.totalStudents) * 100;
    if (riskPercentage > 30) return { text: 'Crítico', variant: 'destructive' as const };
    if (riskPercentage > 15) return { text: 'Atención', variant: 'outline' as const };
    return { text: 'Estable', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard del Coordinador</h1>
        <p className="text-muted-foreground">
          Supervisa todas las comisiones, profesores y métricas generales del semillero
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCommissions} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              En todas las comisiones
            </p>
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
              {((stats.studentsAtRisk / stats.totalStudents) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.overallProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio de todas las comisiones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {coordinatorData.alerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span>🚨</span>
              Alertas Críticas ({coordinatorData.alerts.length})
            </CardTitle>
            <CardDescription>
              Situaciones que requieren intervención inmediata del coordinador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coordinatorData.alerts.map((alert) => (
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
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.actionRequired && (
                        <Button size="sm" variant="outline">
                          Tomar Acción
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commissions Needing Attention */}
      {stats.commissionsNeedingAttention.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span>⚠️</span>
              Comisiones que Requieren Atención ({stats.commissionsNeedingAttention.length})
            </CardTitle>
            <CardDescription>
              Comisiones con indicadores de rendimiento por debajo del promedio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {stats.commissionsNeedingAttention.map((commission) => {
                const statusInfo = getCommissionStatusText(commission);
                return (
                  <Card key={commission.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{commission.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Prof. {commission.teacherName}
                          </p>
                        </div>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.text}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Estudiantes</div>
                          <div className="font-medium text-foreground">{commission.metrics.totalStudents}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">En Riesgo</div>
                          <div className={`font-medium ${
                            commission.metrics.studentsAtRisk > 0 ? 'text-destructive' : 'text-green-600'
                          }`}>
                            {commission.metrics.studentsAtRisk}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Progreso</div>
                          <div className="font-medium text-foreground">{commission.metrics.averageProgress}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Promedio</div>
                          <div className="font-medium text-foreground">{commission.metrics.averageGrade}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Commissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏛️</span>
            Todas las Comisiones ({coordinatorData.allCommissions.length})
          </CardTitle>
          <CardDescription>
            Vista general del estado de todas las comisiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coordinatorData.allCommissions.map((commission) => {
              const statusInfo = getCommissionStatusText(commission);
              const riskPercentage = (commission.metrics.studentsAtRisk / commission.metrics.totalStudents) * 100;
              const riskLevel = riskPercentage > 30 ? 'high' : riskPercentage > 15 ? 'medium' : 'low';
              
              return (
                <Card 
                  key={commission.id} 
                  className={`hover:shadow-md transition-shadow border-border ${
                    riskLevel === 'high' ? 'bg-destructive/5 border-destructive/50' :
                    riskLevel === 'medium' ? 'bg-orange-500/5 border-orange-500/50' :
                    'bg-green-500/5 border-green-500/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{commission.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          Prof. {commission.teacherName}
                        </p>
                      </div>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.text}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estudiantes:</span>
                        <span className="font-medium text-foreground">{commission.metrics.totalStudents}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">En Riesgo:</span>
                        <span className={`font-medium ${
                          commission.metrics.studentsAtRisk > 0 ? 'text-destructive' : 'text-green-600'
                        }`}>
                          {commission.metrics.studentsAtRisk}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso:</span>
                        <span className="font-medium text-foreground">{commission.metrics.averageProgress}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Promedio:</span>
                        <span className="font-medium text-foreground">{commission.metrics.averageGrade}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Completación</span>
                          <span>{Math.round(commission.metrics.completionRate * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${commission.metrics.completionRate * 100}%` }}
                          ></div>
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

      {/* Teacher Assignments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>👨‍🏫</span>
            Asignaciones de Profesores ({coordinatorData.teacherAssignments.length})
          </CardTitle>
          <CardDescription>
            Distribución de estudiantes por profesor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {coordinatorData.teacherAssignments.map((assignment) => (
              <Card key={assignment.teacherId} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{assignment.teacherName}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.teacherEmail}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {assignment.totalStudents} estudiantes
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-medium text-lg">{assignment.totalStudents}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Activos</div>
                      <div className="font-medium text-lg text-green-600">
                        {assignment.activeStudents}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">En Riesgo</div>
                      <div className={`font-medium text-lg ${
                        assignment.studentsAtRisk > 0 ? 'text-destructive' : 'text-green-600'
                      }`}>
                        {assignment.studentsAtRisk}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Coordinación</CardTitle>
          <CardDescription>
            Herramientas para gestionar el semillero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <span className="mr-2">📊</span>
              Reporte General
            </Button>
            <Button variant="outline" className="justify-start">
              <span className="mr-2">👥</span>
              Reasignar Estudiantes
            </Button>
            <Button variant="outline" className="justify-start">
              <span className="mr-2">📧</span>
              Notificar Profesores
            </Button>
            <Button variant="outline" className="justify-start">
              <span className="mr-2">⚙️</span>
              Configurar Alertas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
