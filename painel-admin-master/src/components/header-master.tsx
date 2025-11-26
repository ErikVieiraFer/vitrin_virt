'use client';

import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/hooks/use-admin-auth';
import { Badge } from './ui/badge';
import { getInitials } from '@/lib/utils';

const getBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    tenants: 'Clientes',
    analytics: 'Analytics',
    bookings: 'Agendamentos',
    activity: 'Atividades',
    settings: 'Configurações',
    new: 'Novo',
  };

  return paths.map((path) => breadcrumbMap[path] || path);
};

export function HeaderMaster() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const breadcrumbs = getBreadcrumbs(pathname || '');

  return (
    <header className="h-16 border-b bg-white sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-purple-600">
            ADMIN
          </Badge>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.displayName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.displayName ? getInitials(user.displayName) : 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
