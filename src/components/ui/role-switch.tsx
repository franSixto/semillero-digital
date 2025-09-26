'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRole, getRoleDisplayName, getRoleIcon, getRoleDescription } from '@/contexts/role-context';
import { UserRole } from '@/types/app';

interface RoleSwitchProps {
  className?: string;
}

export function RoleSwitch({ className }: RoleSwitchProps) {
  const { currentRole, setRole, isRoleSwitchEnabled, availableRoles } = useRole();

  if (!isRoleSwitchEnabled) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30 ${className}`}>
        <span className="text-lg">{getRoleIcon(currentRole)}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getRoleDisplayName(currentRole)}</span>
          <span className="text-xs text-muted-foreground hidden lg:block">
            {getRoleDescription(currentRole)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{getRoleIcon(currentRole)}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground mb-1">Rol actual:</span>
        <Select value={currentRole} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  <span>{getRoleIcon(role)}</span>
                  <span>{getRoleDisplayName(role)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Compact version for mobile
export function RoleSwitchCompact({ className }: RoleSwitchProps) {
  const { currentRole, setRole, isRoleSwitchEnabled, availableRoles } = useRole();

  if (!isRoleSwitchEnabled) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-lg">{getRoleIcon(currentRole)}</span>
        <span className="text-sm font-medium">{getRoleDisplayName(currentRole)}</span>
      </div>
    );
  }

  return (
    <Select value={currentRole} onValueChange={(value: UserRole) => setRole(value)}>
      <SelectTrigger className={`w-auto h-8 text-sm border-0 bg-transparent hover:bg-muted/50 ${className}`}>
        <div className="flex items-center gap-1">
          <span className="text-lg">{getRoleIcon(currentRole)}</span>
          <span className="text-sm font-medium">{getRoleDisplayName(currentRole)}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex items-center gap-2">
              <span>{getRoleIcon(role)}</span>
              <span>{getRoleDisplayName(role)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
