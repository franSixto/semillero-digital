'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exchangeCodeForToken } from '@/lib/classroom';
import { useAuth } from '@/contexts/auth-context';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Error de autorización: ${errorParam}`);
      setLoading(false);
      return;
    }

    if (!code) {
      setError('No se recibió código de autorización');
      setLoading(false);
      return;
    }

    const handleTokenExchange = async () => {
      try {
        const tokenResponse = await exchangeCodeForToken(code);
        
        // Try multiple endpoints to get user info
        let userData = null;
        
        // Try userinfo v2 first
        try {
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenResponse.access_token}`,
            },
          });
          
          if (userResponse.ok) {
            userData = await userResponse.json();
          }
        } catch {
          console.log('v2/userinfo failed, trying alternative...');
        }
        
        // If that fails, try userinfo v1
        if (!userData) {
          try {
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
              headers: {
                'Authorization': `Bearer ${tokenResponse.access_token}`,
              },
            });
            
            if (userResponse.ok) {
              userData = await userResponse.json();
            }
          } catch {
            console.log('v1/userinfo also failed');
          }
        }
        
        // If we still don't have user data, create minimal user info
        if (!userData) {
          userData = {
            id: 'unknown',
            email: 'usuario@semillerodigital.com',
            name: 'Usuario Semillero',
            picture: null
          };
        }
        
        // Login user with auth context
        login(tokenResponse.access_token, {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al intercambiar código por token');
        setLoading(false);
      }
    };

    handleTokenExchange();
  }, [searchParams, login, router]);



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Procesando autorización...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error de Autorización</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <CardTitle className="text-green-600">¡Autorización Exitosa!</CardTitle>
          <CardDescription>
            Tu cuenta ha sido conectada correctamente con Google Classroom.
            Serás redirigido al dashboard en unos segundos...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Configurando tu sesión...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
