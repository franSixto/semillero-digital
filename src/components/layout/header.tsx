'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="sticky flex flex-row justify-center items-center top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Classroom Semillero</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/courses"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Cursos
            </Link>
            <Link
              href="/assignments"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tareas
            </Link>
            <Link
              href="/progress"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Mi Progreso
            </Link>
            <Link
              href="/grades"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Calificaciones
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component would go here */}
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <>
                <div className="flex items-center gap-2">
                  {user.picture ? (
                    <Image 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
