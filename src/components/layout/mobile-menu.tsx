'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="p-2"
        aria-label="Abrir menú"
      >
        <div className="flex flex-col space-y-1">
          <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`} />
          <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`} />
          <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`} />
        </div>
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-14 left-0 right-0 bg-background border-b border-border z-50 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={closeMenu}
                >
                  <span className="text-lg">📊</span>
                  <span className="font-medium">Dashboard</span>
                </Link>
                
                <Link
                  href="/courses"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={closeMenu}
                >
                  <span className="text-lg">📚</span>
                  <span className="font-medium">Cursos</span>
                </Link>
                
                <Link
                  href="/assignments"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={closeMenu}
                >
                  <span className="text-lg">📝</span>
                  <span className="font-medium">Tareas</span>
                </Link>
                
                <Link
                  href="/progress"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={closeMenu}
                >
                  <span className="text-lg">📈</span>
                  <span className="font-medium">Mi Progreso</span>
                </Link>
                
                <Link
                  href="/grades"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={closeMenu}
                >
                  <span className="text-lg">🎯</span>
                  <span className="font-medium">Calificaciones</span>
                </Link>

                {/* User Section */}
                {user && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
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
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="w-full"
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
