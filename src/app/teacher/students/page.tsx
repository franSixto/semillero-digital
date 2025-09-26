'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherData } from '@/lib/classroom';
import { TeacherData } from '@/types/app';
import { EmailModal } from '@/components/teacher/email-modal';
import Image from 'next/image';
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

export default function TeacherStudentsPage() {
  const { accessToken } = useAuth();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commissionFilter, setCommissionFilter] = useState<string>('all');
  
  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

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

  // Get unique commissions for filter
  const commissions = useMemo(() => {
    if (!teacherData) return [];
    const uniqueCommissions = [...new Set(teacherData.assignedStudents.map(s => s.commissionName))];
    return uniqueCommissions.sort();
  }, [teacherData]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!teacherData) return [];
    
    return teacherData.assignedStudents.filter(student => {
      const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.commissionName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesCommission = commissionFilter === 'all' || student.commissionName === commissionFilter;
      
      return matchesSearch && matchesStatus && matchesCommission;
    });
  }, [teacherData, searchTerm, statusFilter, commissionFilter]);

  // Group students by status
  const studentsByStatus = useMemo(() => {
    const groups = {
      at_risk: filteredStudents.filter(s => s.status === 'at_risk'),
      behind: filteredStudents.filter(s => s.status === 'behind'),
      active: filteredStudents.filter(s => s.status === 'active'),
      excellent: filteredStudents.filter(s => s.status === 'excellent'),
    };
    return groups;
  }, [filteredStudents]);

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

  const handleEmailStudents = (students: Student[]) => {
    setSelectedStudents(students);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (emailData: EmailData) => {
    // Simulate email sending
    console.log('Sending email:', emailData);
    
    // In a real implementation, this would call an API endpoint
    // that sends emails using a service like SendGrid, AWS SES, etc.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Email enviado exitosamente a ${emailData.recipients.length} estudiante(s)`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando estudiantes...</p>
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

  if (!teacherData) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground">No se pudieron cargar los datos de estudiantes</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Estudiantes</h1>
          <p className="text-muted-foreground">
            Administra y comunícate con tus estudiantes asignados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherData.assignedStudents.length}</div>
              <p className="text-xs text-muted-foreground">Asignados a ti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                studentsByStatus.at_risk.length > 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {studentsByStatus.at_risk.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {studentsByStatus.at_risk.length > 0 ? 'Requieren atención' : 'Todo bajo control'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                studentsByStatus.behind.length > 0 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {studentsByStatus.behind.length}
              </div>
              <p className="text-xs text-muted-foreground">Con tareas pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Excelentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{studentsByStatus.excellent.length}</div>
              <p className="text-xs text-muted-foreground">Rendimiento destacado</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>
              Encuentra estudiantes específicos o filtra por estado y comisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar estudiante</label>
                <Input
                  placeholder="Nombre o comisión..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    <SelectItem value="at_risk">En Riesgo</SelectItem>
                    <SelectItem value="behind">Atrasados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="excellent">Excelentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comisión</label>
                <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las comisiones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las comisiones</SelectItem>
                    {commissions.map((commission) => (
                      <SelectItem key={commission} value={commission}>
                        {commission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students at Risk - Priority Section */}
        {studentsByStatus.at_risk.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <span>🚨</span>
                    Estudiantes en Riesgo ({studentsByStatus.at_risk.length})
                  </CardTitle>
                  <CardDescription>
                    Estos estudiantes requieren atención inmediata
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => handleEmailStudents(studentsByStatus.at_risk)}
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
                {studentsByStatus.at_risk.map((student) => (
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
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEmailStudents([student])}
                            >
                              <span className="mr-1">✉️</span>
                              Contactar
                            </Button>
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

        {/* All Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>👥</span>
                  Todos los Estudiantes ({filteredStudents.length})
                </CardTitle>
                <CardDescription>
                  {searchTerm || statusFilter !== 'all' || commissionFilter !== 'all' 
                    ? `Mostrando ${filteredStudents.length} de ${teacherData.assignedStudents.length} estudiantes`
                    : 'Vista general de todos tus estudiantes asignados'
                  }
                </CardDescription>
              </div>
              {filteredStudents.length > 0 && (
                <Button 
                  onClick={() => handleEmailStudents(filteredStudents)}
                  variant="outline"
                  size="sm"
                >
                  <span className="mr-2">✉️</span>
                  Contactar Filtrados
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No se encontraron estudiantes</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => {
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
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEmailStudents([student])}
                              >
                                <span className="mr-1">✉️</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
    </AppLayout>
  );
}
