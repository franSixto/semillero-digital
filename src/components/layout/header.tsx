'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { MobileMenu } from './mobile-menu';
import { Logo } from './logo';
import { useAuth } from '@/contexts/auth-context';
import { useRole, getRoleNavigation } from '@/contexts/role-context';
import { RoleSwitch } from '@/components/ui/role-switch';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const navigationItems = getRoleNavigation(currentRole);
  
  return (
    <header className="sticky flex flex-row justify-center top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        {/* Logo */}
        <div className="mr-6">
          <Logo showText={true} />
        </div>

        {/* Desktop Navigation - Role-based */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium flex items-center gap-1"
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* Right Side - Desktop */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-3">
            {/* Role Switch */}
            <RoleSwitch />
            
            <div className="w-px h-6 bg-border"></div>
            
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
                  <span className="text-sm font-medium hidden lg:inline">
                    {user.name}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
