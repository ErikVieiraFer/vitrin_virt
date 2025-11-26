'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';

interface HeaderProps {
  breadcrumbs?: string[];
}

export function Header({ breadcrumbs = [] }: HeaderProps) {
  const { user, tenant } = useAuth();

  const getInitials = (email: string): string => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{tenant?.name || 'Carregando...'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Avatar>
          <AvatarFallback>{user?.email ? getInitials(user.email) : 'AD'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
