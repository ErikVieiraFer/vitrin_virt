'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Scissors,
  Clock,
  Calendar,
  Palette,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  tenantName: string;
}

const menuItems = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Serviços',
    icon: Scissors,
    href: '/dashboard/services',
  },
  {
    label: 'Horários',
    icon: Clock,
    href: '/dashboard/availability',
  },
  {
    label: 'Agendamentos',
    icon: Calendar,
    href: '/dashboard/bookings',
  },
  {
    label: 'Personalização',
    icon: Palette,
    href: '/dashboard/theme',
  },
  {
    label: 'Perfil',
    icon: User,
    href: '/dashboard/profile',
  },
];

export function Sidebar({ tenantName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold truncate">{tenantName}</h1>
        <p className="text-sm text-muted-foreground">Painel Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
