'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exchangeCodeForToken } from '@/lib/classroom';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
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

    if (code) {
      handleTokenExchange(code);
    } else {
      setError('No se recibió código de autorización');
      setLoading(false);
    }
  }, [searchParams]);

  const handleTokenExchange = async (code: string) => {
    try {
      const tokenResponse = await exchangeCodeForToken(code);
      setToken(tokenResponse.access_token);
      
      // Save token to localStorage
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al intercambiar código por token');
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copiado al portapapeles');
  };

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
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">¡Autorización Exitosa!</CardTitle>
          <CardDescription>
            Tu cuenta ha sido conectada correctamente con Google Classroom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Access Token:</label>
            <div className="mt-2 p-3 bg-muted rounded-md text-sm font-mono break-all">
              {token.substring(0, 50)}...
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={goToDashboard} className="flex-1">
              Ir al Dashboard
            </Button>
            <Button onClick={copyToken} variant="outline">
              Copiar Token
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
