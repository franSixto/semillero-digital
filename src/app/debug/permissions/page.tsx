'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { diagnoseUserPermissions } from '@/lib/classroom';
import { AlertTriangle, CheckCircle, XCircle, User, Shield, Eye } from 'lucide-react';

interface OAuth2UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface PermissionsDiagnostic {
  userProfile: OAuth2UserProfile;
  userRole: 'student' | 'teacher' | 'admin' | 'unknown';
  coursesAsStudent: number;
  coursesAsTeacher: number;
  canViewAllStudents: boolean;
  permissionsIssues: string[];
}

export default function PermissionsDebugPage() {
  const { accessToken } = useAuth();
  const [diagnostic, setDiagnostic] = useState<PermissionsDiagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const runDiagnostic = async () => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await diagnoseUserPermissions(accessToken);
      
      if (result.success && result.data) {
        setDiagnostic(result.data);
      } else {
        setError(result.error || 'Failed to run diagnostic');
      }
    } catch (err) {
      setError('Error running diagnostic');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      runDiagnostic();
    }
  }, [accessToken]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'bg-green-500';
      case 'student': return 'bg-blue-500';
      case 'admin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      case 'admin': return '👨‍💼';
      default: return '❓';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diagnóstico de Permisos</h1>
            <p className="text-muted-foreground">
              Verifica qué permisos tienes en Google Classroom y por qué no puedes ver todos los estudiantes
            </p>
          </div>
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analizando permisos...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {diagnostic && (
          <div className="space-y-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {diagnostic.userProfile.picture && (
                    <Image
                      src={diagnostic.userProfile.picture} 
                      alt="Avatar" 
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{diagnostic.userProfile.name || 'Sin nombre'}</h3>
                    <p className="text-muted-foreground">{diagnostic.userProfile.email}</p>
                    <p className="text-sm text-muted-foreground">ID: {diagnostic.userProfile.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Análisis de Rol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${getRoleColor(diagnostic.userRole)} flex items-center justify-center text-white text-xl`}>
                    {getRoleIcon(diagnostic.userRole)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{diagnostic.userRole}</h3>
                    <p className="text-muted-foreground">
                      {diagnostic.userRole === 'student' && 'Solo puedes ver tus propios datos'}
                      {diagnostic.userRole === 'teacher' && 'Puedes ver estudiantes en tus cursos'}
                      {diagnostic.userRole === 'admin' && 'Tienes acceso completo'}
                      {diagnostic.userRole === 'unknown' && 'Rol no determinado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{diagnostic.coursesAsStudent}</div>
                    <div className="text-sm text-muted-foreground">Cursos como Estudiante</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{diagnostic.coursesAsTeacher}</div>
                    <div className="text-sm text-muted-foreground">Cursos como Profesor</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Estado de Permisos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {diagnostic.canViewAllStudents ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {diagnostic.canViewAllStudents ? 'Puede ver todos los estudiantes' : 'NO puede ver todos los estudiantes'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostic.canViewAllStudents 
                        ? 'Tienes permisos para ver la lista completa de estudiantes'
                        : 'Solo puedes ver tu propio perfil o estudiantes en cursos donde eres profesor'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            {diagnostic.permissionsIssues.length > 0 && (
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-5 w-5" />
                    Problemas de Permisos Detectados
                  </CardTitle>
                  <CardDescription>
                    Estos son los problemas específicos encontrados al intentar acceder a los datos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {diagnostic.permissionsIssues.map((issue, index) => (
                      <div key={index} className="p-3 bg-card rounded-lg border border-orange-500/20">
                        <p className="text-sm">{issue}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Explanation */}
            <Card>
              <CardHeader>
                <CardTitle>¿Por qué no puedo ver todos los estudiantes?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold">Restricciones de Google Classroom API:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Como Estudiante:</strong> Solo puedes ver tu propio perfil, tus cursos y tus entregas.
                      No puedes ver otros estudiantes ni sus datos.
                    </li>
                    <li>
                      <strong>Como Profesor:</strong> Puedes ver todos los estudiantes en los cursos donde enseñas,
                      sus entregas y calificaciones.
                    </li>
                    <li>
                      <strong>Como Administrador:</strong> Tienes acceso completo a todos los datos del dominio.
                    </li>
                  </ul>

                  <h4 className="font-semibold mt-4">Soluciones posibles:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Autenticarse como Profesor:</strong> Usa una cuenta que sea profesor en los cursos
                      para poder ver todos los estudiantes.
                    </li>
                    <li>
                      <strong>Usar cuenta de Administrador:</strong> Una cuenta con permisos de administrador
                      del dominio puede ver todos los datos.
                    </li>
                    <li>
                      <strong>Simular datos:</strong> Para desarrollo, podemos usar datos simulados
                      cuando no tengas permisos reales.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
