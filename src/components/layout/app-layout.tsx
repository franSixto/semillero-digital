'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Header } from '@/components/layout/header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
