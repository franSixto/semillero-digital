'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherDashboardStats } from '@/lib/classroom';
import { TeacherDashboardStats, StudentAlert } from '@/types/app';
import { EmailModal } from '@/components/teacher/email-modal';
import { AppLayout } from '@/components/layout/app-layout';

interface EmailData {
  recipients: string[];
  subject: string;
  message: string;
}

interface Student {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  commissionName: string;
  status: string;
}

export default function TeacherAlertsPage() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Student[] | null>(null);

  const loadStats = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTeacherDashboardStats(accessToken);
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        setError(result.error || 'Error al cargar alertas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadStats();
    }
  }, [accessToken]);

  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { 
          variant: 'destructive' as const, 
          icon: '🚨', 
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-200'
        };
      case 'high':
        return { 
          variant: 'destructive' as const, 
          icon: '⚠️', 
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-200'
        };
      case 'medium':
        return { 
          variant: 'outline' as const, 
          icon: '⚡', 
          color: 'text-orange-600',
          bg: 'bg-orange-50 border-orange-200'
        };
      case 'low':
        return { 
          variant: 'secondary' as const, 
          icon: 'ℹ️', 
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200'
        };
      default:
        return { 
          variant: 'secondary' as const, 
          icon: '📋', 
          color: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const handleContactStudent = (alert: StudentAlert) => {
    // Create a student object for the email modal
    const student: Student = {
      studentId: alert.studentId,
      studentName: alert.studentName,
      studentEmail: `${alert.studentName.toLowerCase().replace(/\s+/g, '.')}@estudiante.edu`,
      commissionName: alert.courseName || 'Curso no especificado',
      status: alert.type === 'at_risk' ? 'at_risk' : 'active'
    };

    setSelectedAlert([student]);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (emailData: EmailData) => {
    // Simulate email sending
    console.log('Sending email:', emailData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Email enviado exitosamente a ${emailData.recipients.length} estudiante(s)`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando alertas...</p>
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
            <h3 className="text-lg font-semibold mb-2">Error al cargar alertas</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadStats}>Reintentar</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!stats || stats.recentAlerts.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Centro de Alertas</h1>
            <p className="text-muted-foreground">
              Monitorea y gestiona las alertas de tus estudiantes
            </p>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">¡Todo bajo control!</h3>
              <p className="text-muted-foreground">
                No hay alertas activas en este momento. Tus estudiantes están progresando bien.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Group alerts by severity
  const alertsBySeverity = {
    critical: stats.recentAlerts.filter(a => a.severity === 'critical'),
    high: stats.recentAlerts.filter(a => a.severity === 'high'),
    medium: stats.recentAlerts.filter(a => a.severity === 'medium'),
    low: stats.recentAlerts.filter(a => a.severity === 'low'),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Centro de Alertas</h1>
          <p className="text-muted-foreground">
            Monitorea y gestiona las alertas de tus estudiantes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                alertsBySeverity.critical.length > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {alertsBySeverity.critical.length}
              </div>
              <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Altas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                alertsBySeverity.high.length > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {alertsBySeverity.high.length}
              </div>
              <p className="text-xs text-muted-foreground">Prioridad alta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Medias/Bajas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {alertsBySeverity.medium.length + alertsBySeverity.low.length}
              </div>
              <p className="text-xs text-muted-foreground">Para seguimiento</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {alertsBySeverity.critical.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <span>🚨</span>
                Alertas Críticas ({alertsBySeverity.critical.length})
              </CardTitle>
              <CardDescription className="text-red-600">
                Estas alertas requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsBySeverity.critical.map((alert) => {
                  const severityInfo = getSeverityInfo(alert.severity);
                  return (
                    <div key={alert.id} className="p-4 bg-white rounded-lg border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{severityInfo.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{alert.studentName}</h4>
                            <p className="text-sm mt-1 text-foreground">{alert.message}</p>
                            {alert.courseName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Curso: {alert.courseName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={severityInfo.variant} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactStudent(alert)}
                          >
                            <span className="mr-1">✉️</span>
                            Contactar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* High Priority Alerts */}
        {alertsBySeverity.high.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <span>⚠️</span>
                Alertas de Alta Prioridad ({alertsBySeverity.high.length})
              </CardTitle>
              <CardDescription className="text-red-600">
                Requieren atención pronta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsBySeverity.high.map((alert) => {
                  const severityInfo = getSeverityInfo(alert.severity);
                  return (
                    <div key={alert.id} className="p-4 bg-white rounded-lg border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{severityInfo.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{alert.studentName}</h4>
                            <p className="text-sm mt-1 text-foreground">{alert.message}</p>
                            {alert.courseName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Curso: {alert.courseName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={severityInfo.variant} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactStudent(alert)}
                          >
                            <span className="mr-1">✉️</span>
                            Contactar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medium and Low Priority Alerts */}
        {(alertsBySeverity.medium.length > 0 || alertsBySeverity.low.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                Otras Alertas ({alertsBySeverity.medium.length + alertsBySeverity.low.length})
              </CardTitle>
              <CardDescription>
                Alertas de seguimiento y monitoreo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...alertsBySeverity.medium, ...alertsBySeverity.low].map((alert) => {
                  const severityInfo = getSeverityInfo(alert.severity);
                  return (
                    <div key={alert.id} className={`p-4 rounded-lg border ${severityInfo.bg}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{severityInfo.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{alert.studentName}</h4>
                            <p className="text-sm mt-1 text-foreground">{alert.message}</p>
                            {alert.courseName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Curso: {alert.courseName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={severityInfo.variant} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleContactStudent(alert)}
                          >
                            <span className="mr-1">✉️</span>
                            Contactar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas para gestionar alertas masivamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <span className="mr-2">✉️</span>
                Contactar Todos los Críticos
              </Button>
              <Button variant="outline" className="justify-start">
                <span className="mr-2">📊</span>
                Generar Reporte de Alertas
              </Button>
              <Button variant="outline" className="justify-start">
                <span className="mr-2">🔄</span>
                Actualizar Alertas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Modal */}
        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          students={selectedAlert || []}
          onSendEmail={handleSendEmail}
        />
      </div>
    </AppLayout>
  );
}
