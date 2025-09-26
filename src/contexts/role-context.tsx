'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserRole } from '@/types/app';

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  isRoleSwitchEnabled: boolean;
  availableRoles: UserRole[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: React.ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  
  // For development, we enable role switching for the single user
  const isRoleSwitchEnabled = true;
  const availableRoles: UserRole[] = useMemo(() => ['student', 'teacher', 'coordinator'], []);

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('semillero_current_role') as UserRole;
    if (savedRole && availableRoles.includes(savedRole)) {
      setCurrentRole(savedRole);
    }
  }, [availableRoles]);

  // Save role to localStorage when it changes
  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('semillero_current_role', role);
  };

  return (
    <RoleContext.Provider 
      value={{ 
        currentRole, 
        setRole, 
        isRoleSwitchEnabled, 
        availableRoles 
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Helper functions for role-based logic
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'student':
      return 'Estudiante';
    case 'teacher':
      return 'Profesor';
    case 'coordinator':
      return 'Coordinador';
    default:
      return 'Usuario';
  }
}

export function getRoleIcon(role: UserRole): string {
  switch (role) {
    case 'student':
      return '🎓';
    case 'teacher':
      return '👨‍🏫';
    case 'coordinator':
      return '👨‍💼';
    default:
      return '👤';
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'student':
      return 'Ver mi progreso académico y tareas';
    case 'teacher':
      return 'Gestionar estudiantes asignados y su progreso';
    case 'coordinator':
      return 'Supervisar comisiones y métricas generales';
    default:
      return 'Acceso al sistema';
  }
}

// Role-based navigation items
export function getRoleNavigation(role: UserRole) {
  const baseItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' }
  ];

  switch (role) {
    case 'student':
      return [
        ...baseItems,
        { label: 'Mis Cursos', href: '/courses', icon: '📚' },
        { label: 'Mi Progreso', href: '/progress', icon: '📈' }
      ];
    
    case 'teacher':
      return [
        ...baseItems,
        { label: 'Mis Estudiantes', href: '/teacher/students', icon: '👥' },
        { label: 'Comisiones', href: '/teacher/commissions', icon: '📚' },
        { label: 'Alertas', href: '/teacher/alerts', icon: '⚠️' },
        { label: 'Reportes', href: '/teacher/reports', icon: '📊' }
      ];
    
    case 'coordinator':
      return [
        ...baseItems,
        { label: 'Profesores', href: '/coordinator/teachers', icon: '👨‍🏫' },
        { label: 'Estudiantes', href: '/coordinator/students', icon: '👥' }
      ];
    
    default:
      return baseItems;
  }
}
